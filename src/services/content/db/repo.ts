import { and, asc, desc, eq, lt, sql } from 'drizzle-orm';
import type { CollectionKey, ContentMap } from '@/types/content';
import { isListCollection } from '../collections';
import { getDb } from './client';
import { contentDocuments, contentItems, contentRevisions } from './schema';

/**
 * Database storage for collections.
 * A list collection is stored as one document (everything but `items`) plus one row per item;
 * reading puts them back together, so the website receives exactly the same objects as from JSON.
 */

type Tx = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
type Executor = ReturnType<typeof getDb> | Tx;

/** Revisions kept per collection */
const KEEP_REVISIONS = 50;

export class CollectionNotFoundError extends Error {
  constructor(key: string) {
    super(`Collection "${key}" is not in the database. Run "npm run db:seed".`);
  }
}

async function readWith<K extends CollectionKey>(db: Executor, key: K): Promise<ContentMap[K]> {
  const [doc] = await db.select().from(contentDocuments).where(eq(contentDocuments.collection, key));
  if (!doc) throw new CollectionNotFoundError(key);
  if (!isListCollection(key)) return doc.data as ContentMap[K];
  const rows = await db.select({ data: contentItems.data }).from(contentItems).where(eq(contentItems.collection, key)).orderBy(asc(contentItems.position));
  return { ...(doc.data as object), items: rows.map((r) => r.data) } as ContentMap[K];
}

async function writeWith<K extends CollectionKey>(tx: Tx, key: K, data: ContentMap[K], keepRevision: boolean) {
  // Keep the version being replaced, so any save can be undone.
  if (keepRevision) {
    const previous = await readWith(tx, key).catch((e) => (e instanceof CollectionNotFoundError ? null : Promise.reject(e)));
    if (previous) {
      await tx.insert(contentRevisions).values({ collection: key, data: previous });
      const [cut] = await tx
        .select({ id: contentRevisions.id })
        .from(contentRevisions)
        .where(eq(contentRevisions.collection, key))
        .orderBy(desc(contentRevisions.id))
        .offset(KEEP_REVISIONS)
        .limit(1);
      if (cut) await tx.delete(contentRevisions).where(and(eq(contentRevisions.collection, key), lt(contentRevisions.id, cut.id + 1)));
    }
  }

  const { items, ...doc } = data as { items?: unknown[] } & Record<string, unknown>;
  const document = isListCollection(key) ? doc : data;
  await tx
    .insert(contentDocuments)
    .values({ collection: key, data: document, updatedAt: new Date() })
    .onConflictDoUpdate({ target: contentDocuments.collection, set: { data: document, updatedAt: new Date() } });

  if (isListCollection(key)) {
    await tx.delete(contentItems).where(eq(contentItems.collection, key));
    const rows = (items ?? []).map((item, position) => {
      const it = item as { slug?: unknown; status?: unknown };
      return {
        collection: key,
        position,
        slug: typeof it.slug === 'string' ? it.slug : null,
        status: typeof it.status === 'string' ? it.status : null,
        data: item,
      };
    });
    if (rows.length) await tx.insert(contentItems).values(rows);
  }
}

/** Serialises writes to one collection across all server instances. */
const lockCollection = (tx: Tx, key: CollectionKey) => tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'content:' + key}))`);

export function dbRead<K extends CollectionKey>(key: K): Promise<ContentMap[K]> {
  return readWith(getDb(), key);
}

export function dbWrite<K extends CollectionKey>(key: K, data: ContentMap[K], opts: { keepRevision?: boolean } = {}) {
  return getDb().transaction(async (tx) => {
    await lockCollection(tx, key);
    await writeWith(tx, key, data, opts.keepRevision ?? true);
  });
}

/** Writes several collections in ONE transaction: either all are saved or none (used by the seed). */
export function dbWriteAll(entries: { key: CollectionKey; data: unknown }[], opts: { keepRevision?: boolean } = {}) {
  return getDb().transaction(async (tx) => {
    for (const { key, data } of entries) {
      await lockCollection(tx, key);
      await writeWith(tx, key, data as ContentMap[CollectionKey], opts.keepRevision ?? true);
    }
  });
}

/** Read, change and save one collection in a single locked transaction (no lost updates). */
export function dbMutate<K extends CollectionKey>(key: K, change: (current: ContentMap[K]) => ContentMap[K] | Promise<ContentMap[K]>) {
  return getDb().transaction(async (tx) => {
    await lockCollection(tx, key);
    const next = await change(await readWith(tx, key));
    await writeWith(tx, key, next, true);
    return next;
  });
}

export async function dbHasContent(): Promise<boolean> {
  const [row] = await getDb().select({ n: sql<number>`count(*)::int` }).from(contentDocuments);
  return row.n > 0;
}

export async function listRevisions(key: CollectionKey) {
  return getDb()
    .select({ id: contentRevisions.id, createdAt: contentRevisions.createdAt })
    .from(contentRevisions)
    .where(eq(contentRevisions.collection, key))
    .orderBy(desc(contentRevisions.id));
}

export async function getRevision(key: CollectionKey, id: number) {
  const [row] = await getDb().select().from(contentRevisions).where(and(eq(contentRevisions.collection, key), eq(contentRevisions.id, id)));
  return row?.data as ContentMap[CollectionKey] | undefined;
}
