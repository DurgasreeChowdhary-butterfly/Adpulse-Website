import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import {
  Banners,
  Brands,
  CaseStudies,
  Industries,
  Services,
  Stats,
  Testimonials,
  WhyItems,
} from "./payload/collections/content";
import { Header, HomePage, SiteSettings } from "./payload/globals";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/*
 * Database is chosen by DATABASE_URL alone:
 *   file:./adpulse.db          → SQLite (local development, no server needed)
 *   postgres://user:pw@host/db → PostgreSQL (production)
 */
const databaseUrl = process.env.DATABASE_URL || "file:./adpulse.db";
const isPostgres = /^postgres(ql)?:\/\//.test(databaseUrl);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " – AdPulse Admin" },
  },
  collections: [
    Banners,
    Brands,
    CaseStudies,
    Services,
    Industries,
    Testimonials,
    Stats,
    WhyItems,
    Media,
    Users,
  ],
  globals: [HomePage, Header, SiteSettings],
  editor: lexicalEditor(),
  db: isPostgres
    ? postgresAdapter({
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, "migrations/postgres"),
      })
    : sqliteAdapter({
        client: { url: databaseUrl },
        migrationDir: path.resolve(dirname, "migrations/sqlite"),
      }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  graphQL: { disable: true },
});
