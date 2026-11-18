/** npm run db:migrate — creates/updates the database tables from the SQL files in /drizzle. */
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { closeDb, getDb } from '../../src/services/content/db/client';
import { loadEnv } from './env';

loadEnv();
(async () => {
  await migrate(getDb(), { migrationsFolder: 'drizzle' });
  console.log('Database schema is up to date.');
  await closeDb();
})().catch(async (e) => {
  console.error('Migration failed:', e.message);
  await closeDb();
  process.exit(1);
});
