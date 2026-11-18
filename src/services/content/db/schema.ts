import { index, integer, json, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Content tables. JSON columns use `json` (not `jsonb`) on purpose: it keeps field order exactly,
 * which the admin form relies on to show fields in a stable order.
 */

/** One row per collection: everything except its `items` list (page text, settings, headings...). */
export const contentDocuments = pgTable('content_documents', {
  collection: text('collection').primaryKey(),
  data: json('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** One row per list item (service, case study, article, logo...). `position` is the display order. */
export const contentItems = pgTable(
  'content_items',
  {
    collection: text('collection').notNull(),
    position: integer('position').notNull(),
    /** Page URL slug, for collections whose items have their own page */
    slug: text('slug'),
    /** Publishing status, for articles */
    status: text('status'),
    data: json('data').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.collection, t.position] }),
    uniqueIndex('content_items_collection_slug_key').on(t.collection, t.slug),
    index('content_items_collection_status_idx').on(t.collection, t.status),
  ],
);

/** The previous version of a collection, saved before every write (content-level undo). */
export const contentRevisions = pgTable(
  'content_revisions',
  {
    id: serial('id').primaryKey(),
    collection: text('collection').notNull(),
    data: json('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('content_revisions_collection_idx').on(t.collection, t.id)],
);
