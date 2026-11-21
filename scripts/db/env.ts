import fs from 'fs';
import path from 'path';

/**
 * Loads .env.local / .env for command-line scripts (Next.js does this for the app itself).
 * Scripts (migrate, seed, verify, export, restore) prefer DIRECT_DATABASE_URL when it is set:
 * Neon recommends a direct (non-pooled) connection for schema changes, while the website itself
 * keeps using the pooled DATABASE_URL.
 */
export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (!m || line.trim().startsWith('#')) continue;
      const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
  if (process.env.DIRECT_DATABASE_URL) process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL (or DIRECT_DATABASE_URL) is not set. Add it to .env.local or the environment.');
    process.exit(1);
  }
}

export const DATA_DIR = path.join(process.cwd(), 'src', 'data');

export function readJsonCollection(key: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${key}.json`), 'utf8'));
}

/** Same formatting as the files in src/data, so exports can be copied straight back. */
export const toFileJson = (data: unknown) => JSON.stringify(data, null, 2) + '\n';
