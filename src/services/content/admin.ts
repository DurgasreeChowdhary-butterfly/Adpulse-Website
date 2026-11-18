import 'server-only';
import { revalidatePath } from 'next/cache';
import { COLLECTION_KEYS, type CollectionKey, type ContentMap } from '@/types/content';
import { activeSource } from './sources';
import { isListCollection, isSluggedCollection, normalize } from './collections';
import { ContentValidationError, validateCollection } from './validation';

export { normalize } from './collections';
export { ContentValidationError } from './validation';

export function isCollectionKey(key: string): key is CollectionKey {
  return (COLLECTION_KEYS as string[]).includes(key);
}

/** Writes are allowed in development, with the database or a backend API, or when explicitly enabled. */
export function writesAllowed(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.ALLOW_CONTENT_WRITES === 'true' ||
    process.env.CONTENT_SOURCE === 'db' ||
    process.env.CONTENT_SOURCE === 'api'
  );
}

export class NotFoundError extends Error {}
export class BadRequestError extends Error {}
export class ForbiddenError extends Error {}

export async function readForAdmin<K extends CollectionKey>(key: K): Promise<ContentMap[K]> {
  return activeSource().read(key);
}

function assertWritable() {
  if (!writesAllowed()) throw new ForbiddenError('Saving is disabled here. Use CONTENT_SOURCE=db (production) or run locally with npm run dev.');
}

/** Normalises (slugs) and validates, so nothing invalid is ever stored. */
function prepare<K extends CollectionKey>(key: K, data: unknown): ContentMap[K] {
  return validateCollection(key, normalize(key, data));
}

/** Rebuild every page that may show this content. */
function refreshSite() {
  revalidatePath('/', 'layout');
}

/** Replaces a whole collection (what the admin editor's Save does). */
export async function saveCollection<K extends CollectionKey>(key: K, data: unknown): Promise<ContentMap[K]> {
  assertWritable();
  const clean = prepare(key, data);
  await activeSource().write(key, clean);
  refreshSite();
  return clean;
}

/** Read, change, validate and save one collection atomically. */
export async function mutateCollection<K extends CollectionKey>(key: K, change: (current: ContentMap[K]) => unknown): Promise<ContentMap[K]> {
  assertWritable();
  const saved = await activeSource().mutate(key, async (current) => prepare(key, await change(current)));
  refreshSite();
  return saved;
}

/* ---------------- Item-level operations (list collections only) ----------------
 * An item is addressed by its slug (services, case studies, insights) or,
 * in other lists, by its 1-based position.
 */
type Item = Record<string, unknown>;
type ListData = { items: Item[] } & Record<string, unknown>;

function assertList(key: CollectionKey) {
  if (!isListCollection(key)) throw new NotFoundError(`"${key}" has no items. Use PUT /api/admin/content/${key} instead.`);
}

/** The id used in item URLs. */
export function itemId(key: CollectionKey, item: Item, index: number): string {
  return isSluggedCollection(key) ? String(item.slug) : String(index + 1);
}

function indexOf(key: CollectionKey, items: Item[], id: string): number {
  const i = isSluggedCollection(key) ? items.findIndex((it) => it.slug === id) : /^\d+$/.test(id) ? Number(id) - 1 : -1;
  if (i < 0 || i >= items.length) throw new NotFoundError(`No item "${id}" in ${key}.`);
  return i;
}

export async function listItems(key: CollectionKey) {
  assertList(key);
  const data = (await readForAdmin(key)) as unknown as ListData;
  return data.items.map((item, i) => ({ id: itemId(key, item, i), position: i + 1, item }));
}

export async function getItem(key: CollectionKey, id: string) {
  const items = await listItems(key);
  const i = indexOf(key, items.map((x) => x.item), id);
  return items[i];
}

/** Adds an item at `position` (1-based; default: end). Returns the stored item with its id. */
export async function createItem(key: CollectionKey, item: unknown, position?: number) {
  assertList(key);
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw new BadRequestError('Expected an item object.');
  let at = 0;
  const saved = (await mutateCollection(key, (current) => {
    const items = [...(current as unknown as ListData).items];
    at = position === undefined ? items.length : Math.min(Math.max(1, Math.floor(position)), items.length + 1) - 1;
    items.splice(at, 0, item as Item);
    return { ...current, items };
  })) as unknown as ListData;
  return { id: itemId(key, saved.items[at], at), position: at + 1, item: saved.items[at] };
}

/** Merges `patch` into one item. */
export async function updateItem(key: CollectionKey, id: string, patch: unknown) {
  assertList(key);
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new BadRequestError('Expected an object with the fields to change.');
  let at = 0;
  const saved = (await mutateCollection(key, (current) => {
    const items = [...(current as unknown as ListData).items];
    at = indexOf(key, items, id);
    items[at] = { ...items[at], ...(patch as Item) };
    return { ...current, items };
  })) as unknown as ListData;
  return { id: itemId(key, saved.items[at], at), position: at + 1, item: saved.items[at] };
}

export async function deleteItem(key: CollectionKey, id: string) {
  assertList(key);
  await mutateCollection(key, (current) => {
    const items = [...(current as unknown as ListData).items];
    items.splice(indexOf(key, items, id), 1);
    return { ...current, items };
  });
}

/** Sets the display order. `order` must list every current item id exactly once. */
export async function reorderItems(key: CollectionKey, order: unknown) {
  assertList(key);
  if (!Array.isArray(order) || !order.every((x) => typeof x === 'string' || typeof x === 'number')) {
    throw new BadRequestError('Expected { "order": [ids...] }.');
  }
  const ids = order.map(String);
  const saved = (await mutateCollection(key, (current) => {
    const items = (current as unknown as ListData).items;
    if (ids.length !== items.length || new Set(ids).size !== ids.length) {
      throw new BadRequestError(`"order" must list all ${items.length} item ids exactly once.`);
    }
    return { ...current, items: ids.map((id) => items[indexOf(key, items, id)]) };
  })) as unknown as ListData;
  return saved.items.map((item, i) => ({ id: itemId(key, item, i), position: i + 1, item }));
}

/** Maps service errors to HTTP responses (used by the admin API routes). */
export function errorResponse(e: unknown): { status: number; body: Record<string, unknown> } {
  if (e instanceof ContentValidationError) return { status: 422, body: { error: e.message, issues: e.issues } };
  if (e instanceof NotFoundError) return { status: 404, body: { error: e.message } };
  if (e instanceof BadRequestError) return { status: 400, body: { error: e.message } };
  if (e instanceof ForbiddenError) return { status: 403, body: { error: e.message } };
  console.error('[admin content]', e);
  return { status: 500, body: { error: 'Something went wrong while saving. Nothing was changed.' } };
}
