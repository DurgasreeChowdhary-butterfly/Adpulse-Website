import 'server-only';
import { COLLECTION_KEYS, type CollectionKey, type MediaContent } from '@/types/content';
import { readForAdmin, saveCollection } from '@/services/content/admin';
import { mediaStorage, type MediaFile } from './storage';

/** Collections that can reference images (everything except the media metadata itself). */
const CONTENT_KEYS = COLLECTION_KEYS.filter((k) => k !== 'media') as Exclude<CollectionKey, 'media'>[];

export interface MediaUsage {
  collection: CollectionKey;
  /** e.g. "items › 2 › image" */
  field: string;
}

export interface MediaEntry extends MediaFile {
  alt: string;
  usedIn: MediaUsage[];
}

/** Walks a value and calls `hit` for every string equal to `url`. */
function walk(value: unknown, url: string, trail: string[], hit: (trail: string[]) => void) {
  if (typeof value === 'string') {
    if (value === url) hit(trail);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, url, [...trail, String(i + 1)], hit));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, url, [...trail, k], hit);
  }
}

/** Returns a copy of `value` with every string equal to `from` replaced by `to`. */
function swap(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value === from ? to : value;
  if (Array.isArray(value)) return value.map((v) => swap(v, from, to));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swap(v, from, to)]));
  return value;
}

async function allContent() {
  return Promise.all(CONTENT_KEYS.map(async (key) => ({ key, data: await readForAdmin(key) })));
}

/** Every file in storage with its alt text and the places it is used. */
export async function listMedia(): Promise<MediaEntry[]> {
  const [files, content, meta] = await Promise.all([mediaStorage().list(), allContent(), readForAdmin('media')]);
  return files.map((f) => {
    const usedIn: MediaUsage[] = [];
    for (const { key, data } of content) walk(data, f.url, [], (trail) => usedIn.push({ collection: key, field: trail.join(' › ') }));
    return { ...f, alt: meta.items.find((m) => m.url === f.url)?.alt ?? '', usedIn };
  });
}

export async function usageOf(url: string): Promise<MediaUsage[]> {
  const usedIn: MediaUsage[] = [];
  for (const { key, data } of await allContent()) walk(data, url, [], (trail) => usedIn.push({ collection: key, field: trail.join(' › ') }));
  return usedIn;
}

/** Points every reference to `from` at `to`. Returns how many collections changed. */
export async function replaceReferences(from: string, to: string): Promise<number> {
  let changed = 0;
  for (const { key, data } of await allContent()) {
    const next = swap(data, from, to);
    if (JSON.stringify(next) !== JSON.stringify(data)) {
      await saveCollection(key, next as never);
      changed++;
    }
  }
  return changed;
}

export async function setAlt(url: string, alt: string) {
  const meta: MediaContent = await readForAdmin('media');
  const items = meta.items.filter((m) => m.url !== url);
  if (alt.trim()) items.push({ url, alt: alt.trim() });
  await saveCollection('media', { items });
}

export async function moveAlt(from: string, to: string) {
  const meta: MediaContent = await readForAdmin('media');
  const alt = meta.items.find((m) => m.url === from)?.alt ?? '';
  await saveCollection('media', { items: [...meta.items.filter((m) => m.url !== from && m.url !== to), ...(alt ? [{ url: to, alt }] : [])] });
}

export async function forgetAlt(url: string) {
  const meta: MediaContent = await readForAdmin('media');
  await saveCollection('media', { items: meta.items.filter((m) => m.url !== url) });
}
