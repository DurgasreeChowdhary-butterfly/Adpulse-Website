import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { and, count, desc, eq, gte, ilike, lt, lte, or, sql } from 'drizzle-orm';
import { getDb } from '@/services/content/db/client';
import { enquiries, enquiryAttempts } from './db-schema';
import type { Enquiry, EnquiryFilter, EnquiryStatus, NewEnquiry, NotificationStatus } from './types';

/**
 * Where enquiries are kept.
 * - PostgreSQL whenever DATABASE_URL is set (production, and local if you have a database).
 * - Development only, without DATABASE_URL: a git-ignored file, .data/enquiries.dev.json.
 * - Production without DATABASE_URL: no store, so submissions fail visibly instead of being lost.
 */
export interface EnquiryStore {
  readonly kind: 'database' | 'dev-file';
  /** Saves and returns the new enquiry. For newsletter: returns null if the email is already actively subscribed. */
  create(e: NewEnquiry): Promise<Enquiry | null>;
  setNotification(id: number, status: NotificationStatus, error?: string | null): Promise<void>;
  setStatus(id: number, status: EnquiryStatus): Promise<Enquiry | null>;
  list(filter: EnquiryFilter): Promise<Enquiry[]>;
  counts(): Promise<{ newAudits: number; audits: number; subscribers: number }>;
  /** Records an attempt and returns how many this client made in the window (including this one). */
  hitRateLimit(form: string, ipHash: string, windowMs: number): Promise<number>;
}

export class StoreUnavailableError extends Error {}

/** PostgreSQL error code (Drizzle wraps driver errors in `cause`). Never the message, which can contain submitted values. */
export function pgCode(e: unknown): string {
  const err = e as { code?: string; name?: string; cause?: { code?: string } } | null;
  return err?.code ?? err?.cause?.code ?? err?.name ?? 'unknown';
}

/* ---------------- PostgreSQL ---------------- */

const toEnquiry = (r: typeof enquiries.$inferSelect): Enquiry => ({
  ...r,
  type: r.type as Enquiry['type'],
  status: r.status as Enquiry['status'],
  notificationStatus: r.notificationStatus as NotificationStatus,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

const dbStore: EnquiryStore = {
  kind: 'database',
  async create(e) {
    const rows = await getDb()
      .insert(enquiries)
      .values({ ...e, notificationStatus: e.type === 'newsletter' ? 'not_required' : 'pending' })
      .onConflictDoNothing()
      .returning();
    return rows[0] ? toEnquiry(rows[0]) : null;
  },
  async setNotification(id, status, error = null) {
    await getDb().update(enquiries).set({ notificationStatus: status, notificationError: error, updatedAt: new Date() }).where(eq(enquiries.id, id));
  },
  async setStatus(id, status) {
    try {
      const rows = await getDb().update(enquiries).set({ status, updatedAt: new Date() }).where(eq(enquiries.id, id)).returning();
      return rows[0] ? toEnquiry(rows[0]) : null;
    } catch (e) {
      // Re-activating an unsubscribed email that has since subscribed again.
      if (pgCode(e) === '23505') throw new Error('This email already has an active subscription.');
      throw e;
    }
  },
  async list(f) {
    const where = [];
    if (f.type) where.push(eq(enquiries.type, f.type));
    if (f.status) where.push(eq(enquiries.status, f.status));
    if (f.from) where.push(gte(enquiries.createdAt, new Date(`${f.from}T00:00:00Z`)));
    if (f.to) where.push(lte(enquiries.createdAt, new Date(`${f.to}T23:59:59.999Z`)));
    if (f.q) {
      const like = `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      where.push(
        or(ilike(enquiries.name, like), ilike(enquiries.email, like), ilike(enquiries.phone, like), ilike(enquiries.website, like), ilike(enquiries.service, like), ilike(enquiries.sourcePage, like)),
      );
    }
    const rows = await getDb()
      .select()
      .from(enquiries)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(enquiries.createdAt), desc(enquiries.id))
      .limit(f.limit ?? 1000);
    return rows.map(toEnquiry);
  },
  async counts() {
    const rows = await getDb()
      .select({ type: enquiries.type, status: enquiries.status, n: count() })
      .from(enquiries)
      .groupBy(enquiries.type, enquiries.status);
    const sum = (pred: (r: (typeof rows)[number]) => boolean) => rows.filter(pred).reduce((a, r) => a + Number(r.n), 0);
    return {
      newAudits: sum((r) => r.type === 'audit' && r.status === 'new'),
      audits: sum((r) => r.type === 'audit'),
      subscribers: sum((r) => r.type === 'newsletter' && r.status !== 'closed'),
    };
  },
  async hitRateLimit(form, ipHash, windowMs) {
    const db = getDb();
    const since = new Date(Date.now() - windowMs);
    await db.insert(enquiryAttempts).values({ form, ipHash });
    // Keep the table small: attempts older than a day are no longer needed.
    await db.delete(enquiryAttempts).where(lt(enquiryAttempts.createdAt, sql`now() - interval '1 day'`));
    const [row] = await db
      .select({ n: count() })
      .from(enquiryAttempts)
      .where(and(eq(enquiryAttempts.form, form), eq(enquiryAttempts.ipHash, ipHash), gte(enquiryAttempts.createdAt, since)));
    return Number(row.n);
  },
};

/* ---------------- Development-only file fallback ---------------- */

export const DEV_FILE = path.join(process.cwd(), '.data', 'enquiries.dev.json');
type DevData = { note: string; enquiries: Enquiry[]; attempts: { form: string; ipHash: string; at: number }[] };
const NOTE = 'DEVELOPMENT ONLY. Local fallback used because DATABASE_URL is not set. Not used in production. Safe to delete.';
let queue: Promise<unknown> = Promise.resolve();

async function readDev(): Promise<DevData> {
  try {
    return JSON.parse(await fs.readFile(DEV_FILE, 'utf8'));
  } catch {
    return { note: NOTE, enquiries: [], attempts: [] };
  }
}
/** Serialises read-modify-write so parallel requests can't overwrite each other. */
function withDev<T>(fn: (d: DevData) => T): Promise<T> {
  const run = queue.then(async () => {
    const d = await readDev();
    const out = fn(d);
    await fs.mkdir(path.dirname(DEV_FILE), { recursive: true });
    await fs.writeFile(DEV_FILE, JSON.stringify({ ...d, note: NOTE }, null, 2));
    return out;
  });
  queue = run.catch(() => {});
  return run;
}

const matches = (e: Enquiry, f: EnquiryFilter) => {
  if (f.type && e.type !== f.type) return false;
  if (f.status && e.status !== f.status) return false;
  if (f.from && e.createdAt < `${f.from}T00:00:00`) return false;
  if (f.to && e.createdAt > `${f.to}T23:59:59.999Z`) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    return [e.name, e.email, e.phone, e.website, e.service, e.sourcePage].some((v) => v?.toLowerCase().includes(q));
  }
  return true;
};

const devStore: EnquiryStore = {
  kind: 'dev-file',
  create: (e) =>
    withDev((d) => {
      if (e.type === 'newsletter' && d.enquiries.some((x) => x.type === 'newsletter' && x.email === e.email && x.status !== 'closed')) return null;
      const now = new Date().toISOString();
      const row: Enquiry = {
        ...e,
        id: d.enquiries.reduce((m, x) => Math.max(m, x.id), 0) + 1,
        status: 'new',
        notificationStatus: e.type === 'newsletter' ? 'not_required' : 'pending',
        notificationError: null,
        createdAt: now,
        updatedAt: now,
      };
      d.enquiries.push(row);
      return row;
    }),
  setNotification: (id, status, error = null) =>
    withDev((d) => {
      const e = d.enquiries.find((x) => x.id === id);
      if (e) Object.assign(e, { notificationStatus: status, notificationError: error, updatedAt: new Date().toISOString() });
    }),
  setStatus: (id, status) =>
    withDev((d) => {
      const e = d.enquiries.find((x) => x.id === id);
      if (!e) return null;
      if (e.type === 'newsletter' && status !== 'closed' && d.enquiries.some((x) => x.id !== id && x.type === 'newsletter' && x.email === e.email && x.status !== 'closed')) {
        throw new Error('This email already has an active subscription.');
      }
      Object.assign(e, { status, updatedAt: new Date().toISOString() });
      return e;
    }),
  async list(f) {
    const d = await readDev();
    return d.enquiries
      .filter((e) => matches(e, f))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
      .slice(0, f.limit ?? 1000);
  },
  async counts() {
    const { enquiries: all } = await readDev();
    return {
      newAudits: all.filter((e) => e.type === 'audit' && e.status === 'new').length,
      audits: all.filter((e) => e.type === 'audit').length,
      subscribers: all.filter((e) => e.type === 'newsletter' && e.status !== 'closed').length,
    };
  },
  hitRateLimit: (form, ipHash, windowMs) =>
    withDev((d) => {
      const now = Date.now();
      d.attempts = d.attempts.filter((a) => a.at > now - 86_400_000);
      d.attempts.push({ form, ipHash, at: now });
      return d.attempts.filter((a) => a.form === form && a.ipHash === ipHash && a.at > now - windowMs).length;
    }),
};

export function enquiryStore(): EnquiryStore {
  if (process.env.DATABASE_URL) return dbStore;
  if (process.env.NODE_ENV !== 'production') return devStore;
  throw new StoreUnavailableError('DATABASE_URL is not set: enquiries cannot be saved.');
}
