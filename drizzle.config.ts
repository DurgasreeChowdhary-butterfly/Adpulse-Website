import { defineConfig } from 'drizzle-kit';

/** Used by `npm run db:generate` to turn schema changes into SQL migrations in /drizzle. */
export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/services/content/db/schema.ts', './src/services/enquiries/db-schema.ts'],
  out: './drizzle',
  // Schema tools use the direct connection when available (see scripts/db/env.ts).
  dbCredentials: { url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '' },
});
