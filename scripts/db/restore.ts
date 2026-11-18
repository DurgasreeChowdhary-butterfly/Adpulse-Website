/**
 * Undo content changes from the saved revisions (one is kept before every save, last 50 per section).
 *   npm run db:restore -- services          list the revisions of "services"
 *   npm run db:restore -- services 42       restore revision 42 (the current version becomes a revision too)
 * Afterwards refresh the website: save that section once in the admin, or
 *   POST /api/admin/revalidate (with the admin login), or redeploy.
 */
import { COLLECTION_KEYS, type CollectionKey } from '../../src/types/content';
import { closeDb } from '../../src/services/content/db/client';
import { dbWrite, getRevision, listRevisions } from '../../src/services/content/db/repo';
import { validateCollection } from '../../src/services/content/validation';
import { loadEnv } from './env';

loadEnv();
const [key, id] = process.argv.slice(2);

(async () => {
  if (!key || !(COLLECTION_KEYS as string[]).includes(key)) throw new Error(`Usage: npm run db:restore -- <${COLLECTION_KEYS.join('|')}> [revision id]`);
  const k = key as CollectionKey;
  if (!id) {
    const revs = await listRevisions(k);
    console.log(revs.length ? revs.map((r) => `  ${r.id}  ${r.createdAt.toISOString()}`).join('\n') : '  (no revisions yet)');
    return;
  }
  const data = await getRevision(k, Number(id));
  if (!data) throw new Error(`Revision ${id} of ${key} not found.`);
  await dbWrite(k, validateCollection(k, data));
  console.log(`Restored ${key} to revision ${id}.`);
})()
  .then(() => closeDb())
  .catch(async (e) => {
    console.error(e.message);
    await closeDb();
    process.exit(1);
  });
