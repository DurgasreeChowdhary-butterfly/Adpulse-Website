import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { CollectionKey, ContentMap } from '@/types/content';
import { dbMutate, dbRead, dbWrite } from './db/repo';

/**
 * A content source knows how to load and save one collection.
 * Swap the active source with CONTENT_SOURCE (json | db | api). The rest of the app never changes.
 */
export interface ContentSource {
  readonly name: 'json' | 'db' | 'api';
  read<K extends CollectionKey>(key: K): Promise<ContentMap[K]>;
  write<K extends CollectionKey>(key: K, data: ContentMap[K]): Promise<void>;
  /** Read, change and save in one step (atomic for the database). Returns the saved data. */
  mutate<K extends CollectionKey>(key: K, change: (current: ContentMap[K]) => ContentMap[K] | Promise<ContentMap[K]>): Promise<ContentMap[K]>;
}

/** read -> change -> write, for sources without transactions. */
function simpleMutate(source: Pick<ContentSource, 'read' | 'write'>): ContentSource['mutate'] {
  return async (key, change) => {
    const next = await change(await source.read(key));
    await source.write(key, next);
    return next;
  };
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

/** Reads and writes the JSON files in src/data. The default for local development. */
export const jsonSource: ContentSource = {
  name: 'json',
  async read(key) {
    const raw = await fs.readFile(path.join(DATA_DIR, `${key}.json`), 'utf8');
    return JSON.parse(raw);
  },
  async write(key, data) {
    const file = path.join(DATA_DIR, `${key}.json`);
    await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  },
  mutate: (key, change) => simpleMutate(jsonSource)(key, change),
};

/** PostgreSQL (see src/services/content/db). The production source: CONTENT_SOURCE=db + DATABASE_URL. */
export const dbSource: ContentSource = {
  name: 'db',
  read: (key) => dbRead(key),
  write: (key, data) => dbWrite(key, data),
  mutate: (key, change) => dbMutate(key, change),
};

/**
 * Reads from and writes to an external backend API (optional alternative to the built-in database).
 * Expected contract:  GET {CONTENT_API_URL}/{key}  ->  JSON matching ContentMap[key]
 *                     PUT {CONTENT_API_URL}/{key}  <-  same JSON
 */
export const apiSource: ContentSource = {
  name: 'api',
  async read(key) {
    const res = await fetch(`${process.env.CONTENT_API_URL}/${key}`, {
      headers: authHeaders(),
      next: { revalidate: 60, tags: [`content:${key}`] },
    });
    if (!res.ok) throw new Error(`Content API ${key}: ${res.status}`);
    return res.json();
  },
  async write(key, data) {
    const res = await fetch(`${process.env.CONTENT_API_URL}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Content API ${key}: ${res.status}`);
  },
  mutate: (key, change) => simpleMutate(apiSource)(key, change),
};

function authHeaders(): Record<string, string> {
  const token = process.env.CONTENT_API_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function activeSource(): ContentSource {
  if (process.env.CONTENT_SOURCE === 'db') return dbSource;
  if (process.env.CONTENT_SOURCE === 'api' && process.env.CONTENT_API_URL) return apiSource;
  return jsonSource;
}
