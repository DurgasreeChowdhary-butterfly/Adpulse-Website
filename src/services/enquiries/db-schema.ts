import { sql } from 'drizzle-orm';
import { index, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/** Leads from the website forms (free growth audit + newsletter). Never exposed through public APIs. */
export const enquiries = pgTable(
  'enquiries',
  {
    id: serial('id').primaryKey(),
    /** 'audit' | 'newsletter' */
    type: text('type').notNull(),
    name: text('name'),
    phone: text('phone'),
    /** Stored trimmed + lowercase */
    email: text('email').notNull(),
    website: text('website'),
    service: text('service'),
    /** Page the form was sent from, e.g. /services/seo-geo */
    sourcePage: text('source_page'),
    /** 'new' | 'contacted' | 'closed' (closed newsletter row = unsubscribed) */
    status: text('status').notNull().default('new'),
    /** 'pending' | 'sent' | 'failed' | 'not_configured' | 'not_required' */
    notificationStatus: text('notification_status').notNull().default('pending'),
    /** Short technical reason when the email failed (never personal data) */
    notificationError: text('notification_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('enquiries_type_created_idx').on(t.type, t.createdAt),
    // One active newsletter subscription per email address.
    uniqueIndex('enquiries_newsletter_active_email_key').on(t.email).where(sql`${t.type} = 'newsletter' and ${t.status} <> 'closed'`),
  ],
);

/** Form attempts for rate limiting. Holds only a salted hash of the IP; rows older than a day are deleted. */
export const enquiryAttempts = pgTable(
  'enquiry_attempts',
  {
    id: serial('id').primaryKey(),
    form: text('form').notNull(),
    ipHash: text('ip_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('enquiry_attempts_ip_created_idx').on(t.ipHash, t.createdAt), index('enquiry_attempts_created_idx').on(t.createdAt)],
);
