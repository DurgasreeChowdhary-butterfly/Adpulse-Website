/**
 * npm run db:verify — checks that the database holds exactly the content in src/data/*.json
 * (same values, same order, same field order). Exits with code 1 on any difference.
 */
import { COLLECTION_KEYS } from '../../src/types/content';
import { closeDb } from '../../src/services/content/db/client';
import { dbRead } from '../../src/services/content/db/repo';
import { readJsonCollection, loadEnv } from './env';

export async function verifyAll(): Promise<boolean> {
  let ok = true;
  for (const key of COLLECTION_KEYS) {
    const file = readJsonCollection(key);
    const db = await dbRead(key).catch((e: Error) => e);
    if (db instanceof Error) {
      console.log(`  ✗ ${key}: ${db.message}`);
      ok = false;
      continue;
    }
    const same = JSON.stringify(file) === JSON.stringify(db);
    const items = Array.isArray((db as { items?: unknown[] }).items) ? ` · ${(db as { items: unknown[] }).items.length} items` : '';
    console.log(`  ${same ? '✓' : '✗'} ${key}${items}${same ? '' : ' — differs from src/data'}`);
    ok &&= same;
  }
  return ok;
}

if (require.main === module) {
  loadEnv();
  verifyAll()
    .then(async (ok) => {
      console.log(ok ? '\nDatabase matches src/data exactly.' : '\nDifferences found (see ✗ above).');
      await closeDb();
      process.exit(ok ? 0 : 1);
    })
    .catch(async (e) => {
      console.error(e.message);
      await closeDb();
      process.exit(1);
    });
}
