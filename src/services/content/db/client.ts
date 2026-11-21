import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * One connection pool per server instance (reused across hot reloads in development).
 * On serverless hosts use the provider's *pooled* connection string (e.g. Neon's "-pooler" host).
 */
type Db = NodePgDatabase<typeof schema>;
const g = globalThis as unknown as { __adpulseDb?: { pool: Pool; db: Db } };

export function getDb(): Db {
  if (g.__adpulseDb) return g.__adpulseDb.db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Add it to the environment, or use CONTENT_SOURCE=json.');
  warnIfNeonDirect(url);
  const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX || 5), idleTimeoutMillis: 10_000 });
  const db = drizzle(pool, { schema });
  g.__adpulseDb = { pool, db };
  return db;
}

/** The website should use Neon's pooled host ("-pooler"); direct connections are for migrations. Logs the host only. */
function warnIfNeonDirect(url: string) {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('.neon.tech') && !host.includes('-pooler')) {
      console.warn(`[db] DATABASE_URL uses a direct Neon connection (${host}). Use the pooled connection string (host contains "-pooler") for the website.`);
    }
  } catch {
    // Not a URL: pg will report the problem when connecting.
  }
}

/** Closes the pool (used by command-line scripts so they can exit). */
export async function closeDb() {
  if (!g.__adpulseDb) return;
  await g.__adpulseDb.pool.end();
  delete g.__adpulseDb;
}
