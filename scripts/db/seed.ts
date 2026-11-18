/**
 * npm run db:seed — copies src/data/*.json into the database, then verifies the copy.
 *
 * Safe by default:
 * - Every file is validated first; nothing is written if any file is invalid.
 * - Refuses to run if the database already has content (use --force to overwrite;
 *   the overwritten versions are kept as revisions, see db:restore).
 * - All collections are written in one transaction: all or nothing.
 * - Never modifies or deletes the JSON files.
 */
import { COLLECTION_KEYS } from '../../src/types/content';
import { closeDb } from '../../src/services/content/db/client';
import { dbHasContent, dbWriteAll } from '../../src/services/content/db/repo';
import { ContentValidationError, validateCollection } from '../../src/services/content/validation';
import { loadEnv, readJsonCollection } from './env';
import { verifyAll } from './verify';

loadEnv();
const force = process.argv.includes('--force');

(async () => {
  console.log('Validating src/data …');
  const all = COLLECTION_KEYS.map((key) => {
    try {
      return { key, data: validateCollection(key, readJsonCollection(key)) };
    } catch (e) {
      const msg = e instanceof ContentValidationError ? e.issues.map((i) => `${i.path}: ${i.message}`).join('; ') : (e as Error).message;
      throw new Error(`${key}.json is not valid: ${msg}`);
    }
  });
  console.log(`  ✓ ${all.length} collections valid`);

  if ((await dbHasContent()) && !force) {
    throw new Error('The database already has content. Nothing was changed. Re-run with --force to overwrite it (previous versions are kept as revisions).');
  }

  console.log('Writing to the database …');
  // One transaction: if anything fails, the database is left exactly as it was.
  await dbWriteAll(all, { keepRevision: force });
  console.log('  ✓ written\n\nVerifying …');
  const ok = await verifyAll();
  if (!ok) throw new Error('Verification failed: the database does not match src/data. Keep CONTENT_SOURCE=json until this is resolved.');
  console.log('\nSeed complete. The database matches src/data exactly. You can now set CONTENT_SOURCE=db.');
})()
  .then(() => closeDb())
  .catch(async (e) => {
    console.error(`\n${e.message}`);
    await closeDb();
    process.exit(1);
  });
