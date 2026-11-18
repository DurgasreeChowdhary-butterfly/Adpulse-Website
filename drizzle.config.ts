import { defineConfig } from 'drizzle-kit';

/** Used by `npm run db:generate` to turn schema changes into SQL migrations in /drizzle. */
export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/services/content/db/schema.ts', './src/services/enquiries/db-schema.ts'],
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
