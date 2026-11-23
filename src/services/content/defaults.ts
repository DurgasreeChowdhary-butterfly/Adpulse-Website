import type { CollectionKey, ContentMap } from '@/types/content';

/**
 * Default values for fields added after content was first saved (e.g. to the production database).
 * `withDefaults` adds a field ONLY when it is missing; saved values are never changed.
 * This keeps pages working and makes the new fields appear in the admin form
 * (which is built from the shape of the data) without a database migration.
 * The next admin save stores the filled-in fields.
 *
 * When you add a field that existing content will not have, add its default here as well
 * as in src/data, src/types/content.ts and validation.ts.
 */

type Json = Record<string, unknown>;

/** Collection-level defaults (merged into the document). */
const COLLECTION_DEFAULTS: Partial<Record<CollectionKey, Json>> = {
  settings: {
    brand: { logo: null, logoOnDark: null },
  },
  navigation: {
    footer: { backToTopLabel: 'Back to top' },
  },
  'case-studies': {
    section: { cardLinkLabel: 'View case study', sampleLabel: 'Sample project' },
    detailPage: {
      backLabel: 'All case studies',
      overviewTitle: 'Client overview',
      clientLabel: 'Client',
      industryLabel: 'Industry',
      servicesLabel: 'Services',
      executionTitle: 'Execution',
      resultsEyebrow: 'Results',
      resultsTitle: 'What changed',
      galleryTitle: 'Project gallery',
      moreTitle: 'More case studies',
    },
  },
};

/** Defaults for every item of a list collection. */
const ITEM_DEFAULTS: Partial<Record<CollectionKey, Json>> = {
  'case-studies': { overview: '', execution: [] },
};

const isObj = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);

/** Adds missing keys from `defaults` (recursively for nested objects). Existing values win. */
function fill(target: Json, defaults: Json): Json {
  let out = target;
  for (const [k, d] of Object.entries(defaults)) {
    const cur = target[k];
    const next = cur === undefined ? structuredClone(d) : isObj(cur) && isObj(d) ? fill(cur, d) : cur;
    if (next !== cur) out = out === target ? { ...target, [k]: next } : Object.assign(out, { [k]: next });
  }
  return out;
}

export function withDefaults<K extends CollectionKey>(key: K, data: ContentMap[K]): ContentMap[K] {
  const docDefaults = COLLECTION_DEFAULTS[key];
  const itemDefaults = ITEM_DEFAULTS[key];
  if (!isObj(data) || (!docDefaults && !itemDefaults)) return data;
  let out: Json = docDefaults ? fill(data, docDefaults) : data;
  if (itemDefaults && Array.isArray(out.items)) {
    const items = (out.items as unknown[]).map((it) => (isObj(it) ? fill(it, itemDefaults) : it));
    if (items.some((it, i) => it !== (out.items as unknown[])[i])) out = { ...out, items };
  }
  return out as unknown as ContentMap[K];
}
