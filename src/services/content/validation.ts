import { z } from 'zod';
import type { CollectionKey, ContentMap } from '@/types/content';

/**
 * Runtime validation for every collection, mirroring src/types/content.ts.
 * Objects keep unknown keys (passthrough) so a newly added field is never silently dropped;
 * when you add a field, add it to the type, here, and to the data.
 */

const obj = <T extends z.ZodRawShape>(shape: T) => z.looseObject(shape);
const text = z.string();
const isImagePath = (v: string) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v);
const image = z.string().refine(isImagePath, 'Must be a /path or https:// URL');
const optionalImage = image.nullable();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const cta = obj({ label: text, href: text.optional(), action: z.enum(['audit', '']).optional() });
const link = obj({ label: text, href: text });
const seo = { metaTitle: text, metaDescription: text };
const titled = obj({ title: text, description: text });

/** Items in one list must not share a slug (each slug is a page URL). */
const uniqueSlugs = <T extends { slug: string }>(items: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (seen.has(it.slug)) ctx.addIssue({ code: 'custom', path: [i, 'slug'], message: `Duplicate slug "${it.slug}"` });
    seen.add(it.slug);
  });
};

export const itemSchemas = {
  services: obj({
    slug,
    title: text.min(1, 'Required'),
    icon: text,
    summary: text,
    lead: text,
    audience: text,
    image,
    imageAlt: text,
    includes: z.array(titled),
    stat: obj({ label: text, value: text }).optional(),
    related: z.array(text).optional(),
    ...seo,
  }),
  'case-studies': obj({
    slug,
    title: text.min(1, 'Required'),
    client: text,
    industry: text,
    category: text,
    services: z.array(text),
    // Optional: content saved before the detail page existed has no such fields (see defaults.ts).
    summary: text.optional(),
    overview: text.optional(),
    challenge: text,
    solution: text,
    execution: z.array(text).optional(),
    result: obj({ value: text, label: text }),
    metrics: z.array(obj({ value: text, label: text })),
    visual: z.enum(['bars', 'line', 'map', 'phone']),
    image: optionalImage,
    imageAlt: text,
    gallery: z.array(obj({ image: optionalImage, alt: text })),
    featured: z.boolean(),
    showOnHome: z.boolean(),
    isSample: z.boolean().optional(),
    ...seo,
  }),
  industries: obj({ icon: text, title: text.min(1, 'Required'), description: text, ledBy: text.nullable() }),
  clients: obj({ name: text.min(1, 'Required'), logo: optionalImage, website: text, style: z.enum(['wordmark', 'wordmark-alt', 'placeholder', 'logo']) }),
  testimonials: obj({
    quote: text,
    name: text,
    role: text,
    company: text,
    rating: z.number().min(0).max(5),
    visible: z.boolean(),
    isSample: z.boolean().optional(),
  }),
  insights: obj({
    slug,
    title: text.min(1, 'Required'),
    status: z.enum(['draft', 'published']),
    author: text,
    date,
    category: text,
    readTime: text,
    excerpt: text,
    cover: optionalImage,
    coverAlt: text,
    body: z.array(text),
    isSample: z.boolean().optional(),
    ...seo,
  }),
  media: obj({ url: image, alt: text }),
};

export const schemas: { [K in CollectionKey]: z.ZodTypeAny } = {
  settings: obj({
    siteName: text.min(1, 'Required'),
    shortName: text,
    tagline: text,
    seo: obj({ title: text, description: text, url: text, ogImage: image }),
    contact: obj({
      email: text,
      website: text,
      address: text,
      shortAddress: text,
      phones: z.array(obj({ label: text, number: text })),
      otherEmails: z.array(obj({ label: text, address: text })),
    }),
    contactLabels: obj({ email: text, phone: text, web: text, office: text }),
    socials: z.array(obj({ label: text, icon: text, url: text })),
    audit: obj({
      eyebrow: text,
      title: text,
      description: text,
      submitLabel: text,
      successTitle: text,
      successText: text,
      otherOption: text,
      fields: obj({ name: text, phone: text, email: text, website: text, websitePlaceholder: text, service: text, closeLabel: text }),
    }),
    newsletter: obj({ label: text, placeholder: text, successText: text }),
    privacy: obj({ consentText: text, policyUrl: text }),
    notFound: obj({ eyebrow: text, title: text, text: text, primaryLabel: text, secondaryLabel: text, secondaryHref: text }),
    brand: obj({ logo: optionalImage, logoOnDark: optionalImage }).optional(),
  }),
  navigation: obj({
    header: obj({
      items: z.array(obj({ label: text, href: text, dropdown: z.enum(['services']).optional() })),
      homeLabel: text,
      cta,
      mobileCta: cta,
      dropdown: obj({ allLabel: text, allHref: text, hint: text, ctaLabel: text }),
    }),
    footer: obj({
      about: text,
      servicesTitle: text,
      companyTitle: text,
      contactTitle: text,
      companyLinks: z.array(link),
      copyright: text,
      backToTopLabel: text.optional(),
    }),
    breadcrumbs: obj({ home: text, about: text, services: text, caseStudies: text, industries: text, insights: text }),
  }),
  home: obj({
    hero: obj({
      eyebrow: text,
      heading: text,
      description: text,
      primaryCta: cta,
      secondaryCta: cta,
      trust: z.array(obj({ value: text, label: text })),
      visual: obj({
        image,
        imageAlt: text,
        liveLabel: text,
        revenueLabel: text,
        revenueValue: text,
        revenueChange: text,
        roas: obj({ label: text, value: text, note: text }),
        ctr: obj({ label: text, value: text, adBrand: text, adTag: text, adText: text, adCta: text }),
      }),
    }),
    differentiators: obj({
      eyebrow: text,
      title: text,
      description: text,
      feature: obj({ tag: text, title: text, text: text, actions: z.array(obj({ icon: text, text: text, time: text })) }),
      points: z.array(obj({ icon: text, title: text, text: text })),
    }),
    why: obj({
      eyebrow: text,
      title: text,
      description: text,
      cta,
      proof: obj({ value: text, suffix: text, label: text }),
      principles: z.array(titled),
    }),
    cta: obj({ eyebrow: text, title: text, description: text, button: cta }),
  }),
  about: obj({
    eyebrow: text,
    location: text,
    title: text,
    image,
    imageAlt: text,
    imageBadge: obj({ label: text, value: text, note: text }),
    description: text,
    beliefs: z.array(obj({ title: text, text: text })),
    stats: z.array(obj({ value: z.number(), suffix: text, label: text, decimals: z.number().optional() })),
    page: obj({ eyebrow: text, title: text, description: text, ...seo }),
  }),
  services: obj({
    section: obj({ eyebrow: text, count: text, headingLead: text, typedPhrases: z.array(text), description: text, cardLinkLabel: text }),
    overviewPage: obj({ eyebrow: text, title: text, description: text, ...seo }),
    detailPage: obj({
      primaryCta: cta,
      secondaryCta: cta,
      includedEyebrow: text,
      includedTitle: text,
      includedSuffix: text,
      processEyebrow: text,
      processTitle: text,
      processDescription: text,
      process: z.array(titled),
      relatedEyebrow: text,
      relatedTitle: text,
      relatedLinkLabel: text,
    }),
    items: z.array(itemSchemas.services).superRefine(uniqueSlugs),
  }),
  'case-studies': obj({
    section: obj({ eyebrow: text, title: text, description: text, sampleNote: text, challengeLabel: text, solutionLabel: text, cardLinkLabel: text.optional(), sampleLabel: text.optional(), viewAllLabel: text.optional() }),
    page: obj({ eyebrow: text, title: text, description: text, ...seo }),
    detailPage: obj({
      backLabel: text,
      overviewTitle: text,
      clientLabel: text,
      industryLabel: text,
      servicesLabel: text,
      executionTitle: text,
      resultsEyebrow: text,
      resultsTitle: text,
      galleryTitle: text,
      moreTitle: text,
    }).optional(),
    categories: z.array(obj({ key: text.min(1), label: text })),
    items: z.array(itemSchemas['case-studies']).superRefine(uniqueSlugs),
  }).superRefine((d, ctx) => {
    // Every case study must sit under an existing filter tab.
    const keys = new Set(d.categories.map((c) => c.key));
    d.items.forEach((it, i) => {
      if (!keys.has(it.category)) ctx.addIssue({ code: 'custom', path: ['items', i, 'category'], message: `Unknown category "${it.category}"` });
    });
  }),
  industries: obj({
    page: obj({ eyebrow: text, title: text, description: text, primaryCta: cta, secondaryCta: cta, ledByPrefix: text, ...seo }),
    items: z.array(itemSchemas.industries),
  }),
  clients: obj({
    section: obj({ eyebrow: text, line: text, rating: obj({ value: text, label: text }), placeholderNote: text }),
    items: z.array(itemSchemas.clients),
  }),
  testimonials: obj({ enabled: z.boolean(), section: obj({ eyebrow: text, title: text }), items: z.array(itemSchemas.testimonials) }),
  insights: obj({
    page: obj({ eyebrow: text, title: text, description: text, readLabel: text, sampleNote: text, backLabel: text, ...seo }),
    items: z.array(itemSchemas.insights).superRefine(uniqueSlugs),
  }),
  media: obj({ items: z.array(itemSchemas.media) }),
};

export class ContentValidationError extends Error {
  constructor(public issues: { path: string; message: string }[]) {
    super(`Validation failed: ${issues[0] ? `${issues[0].path || '(root)'}: ${issues[0].message}` : 'invalid content'}${issues.length > 1 ? ` (+${issues.length - 1} more)` : ''}`);
  }
}

/** Human-readable path, e.g. "items › 3 › date" (list positions are 1-based). */
const readablePath = (path: PropertyKey[]) => path.map((p) => (typeof p === 'number' ? String(p + 1) : String(p))).join(' › ');

/** Throws ContentValidationError when `data` is not a valid collection. */
export function validateCollection<K extends CollectionKey>(key: K, data: unknown): ContentMap[K] {
  const res = schemas[key].safeParse(data);
  if (!res.success) throw new ContentValidationError(res.error.issues.map((i) => ({ path: readablePath(i.path), message: i.message })));
  // Return the original object (not the parsed copy) so key order is preserved exactly.
  return data as ContentMap[K];
}
