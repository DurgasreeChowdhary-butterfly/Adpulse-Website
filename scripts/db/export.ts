/**
 * npm run db:export [-- <folder>] — writes the database content as JSON files, in the same format
 * as src/data. Use it for backups, or to roll back to file-based content:
 *   npm run db:export -- src/data      (then CONTENT_SOURCE=json)
 * Default folder: content-export/<date-time>
 */
import fs from 'fs';
import path from 'path';
import { COLLECTION_KEYS } from '../../src/types/content';
import { closeDb } from '../../src/services/content/db/client';
import { dbRead } from '../../src/services/content/db/repo';
import { loadEnv, toFileJson } from './env';

loadEnv();
const dir = path.resolve(process.argv[2] || path.join('content-export', new Date().toISOString().replace(/[:.]/g, '-')));

(async () => {
  // Read everything first, so a failure never leaves a half-written folder.
  const all = await Promise.all(COLLECTION_KEYS.map(async (key) => ({ key, data: await dbRead(key) })));
  fs.mkdirSync(dir, { recursive: true });
  for (const { key, data } of all) fs.writeFileSync(path.join(dir, `${key}.json`), toFileJson(data));
  console.log(`Exported ${all.length} collections to ${dir}`);
})()
  .then(() => closeDb())
  .catch(async (e) => {
    console.error('Export failed:', e.message);
    await closeDb();
    process.exit(1);
  });
