import type { CollectionKey } from '@/types/content';

/**
 * How each collection is shaped. Pure data, safe to import from scripts.
 * - List collections have an `items` array (stored one row per item in the database).
 * - Slugged collections give each item its own page, so slugs must be unique.
 */
export const LIST_COLLECTIONS: CollectionKey[] = ['services', 'case-studies', 'industries', 'clients', 'testimonials', 'insights', 'media'];
export const SLUGGED_COLLECTIONS: CollectionKey[] = ['services', 'case-studies', 'insights'];

export const isListCollection = (key: CollectionKey) => LIST_COLLECTIONS.includes(key);
export const isSluggedCollection = (key: CollectionKey) => SLUGGED_COLLECTIONS.includes(key);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[*_=|]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * Tidies slugs into URL form and fills EMPTY slugs from the title (made unique with -2, -3...).
 * A slug someone typed is never renamed: if it clashes with another, validation rejects the save.
 */
export function normalize<T>(key: CollectionKey, data: T): T {
  if (!isSluggedCollection(key)) return data;
  const d = data as unknown as { items?: { slug?: string; title?: string }[] };
  if (!Array.isArray(d.items)) return data;
  const typed = d.items.map((item) => (item.slug ? slugify(item.slug) : ''));
  const seen = new Set(typed.filter(Boolean));
  const items = d.items.map((item, i) => {
    if (typed[i]) return { ...item, slug: typed[i] };
    const base = slugify(item.title || '') || `item-${i + 1}`;
    let slug = base;
    for (let n = 2; seen.has(slug); n++) slug = `${base}-${n}`;
    seen.add(slug);
    return { ...item, slug };
  });
  return { ...d, items } as unknown as T;
}
