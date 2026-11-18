/**
 * Content types for the whole site.
 * These mirror src/data/*.json and are the contract a future backend API must return.
 */

/** A call to action: either opens the audit modal or links somewhere. */
export interface CtaLink {
  label: string;
  href?: string;
  action?: 'audit';
}

export interface LinkItem {
  label: string;
  href: string;
}

/** Optional per-page SEO. Empty values fall back to the page title / description. */
export interface SeoFields {
  metaTitle: string;
  metaDescription: string;
}

/* ---------- settings.json ---------- */
export interface SiteSettings {
  siteName: string;
  shortName: string;
  tagline: string;
  seo: { title: string; description: string; url: string; ogImage: string };
  contact: {
    email: string;
    website: string;
    address: string;
    shortAddress: string;
    phones: { label: string; number: string }[];
    otherEmails: { label: string; address: string }[];
  };
  contactLabels: { email: string; phone: string; web: string; office: string };
  socials: { label: string; icon: string; url: string }[];
  audit: {
    eyebrow: string;
    title: string;
    description: string;
    submitLabel: string;
    successTitle: string;
    successText: string;
    otherOption: string;
    fields: {
      name: string;
      phone: string;
      email: string;
      website: string;
      websitePlaceholder: string;
      service: string;
      closeLabel: string;
    };
  };
  newsletter: { label: string; placeholder: string; successText: string };
  /** Consent line under the audit + newsletter forms. Empty consentText = hidden. */
  privacy: { consentText: string; policyUrl: string };
  notFound: { eyebrow: string; title: string; text: string; primaryLabel: string; secondaryLabel: string; secondaryHref: string };
}

/* ---------- navigation.json ---------- */
export interface NavItem extends LinkItem {
  /** "services" renders the services dropdown under this item */
  dropdown?: 'services';
}
export interface Navigation {
  header: {
    items: NavItem[];
    /** First link in the mobile menu */
    homeLabel: string;
    cta: CtaLink;
    mobileCta: CtaLink;
    dropdown: { allLabel: string; allHref: string; hint: string; ctaLabel: string };
  };
  footer: {
    about: string;
    servicesTitle: string;
    companyTitle: string;
    contactTitle: string;
    companyLinks: LinkItem[];
    /** "{year}" is replaced with the current year */
    copyright: string;
  };
  breadcrumbs: { home: string; about: string; services: string; caseStudies: string; industries: string; insights: string };
}

/* ---------- home.json ---------- */
export interface HomeContent {
  hero: {
    eyebrow: string;
    /** Inline markup: *accent*  |  = line break */
    heading: string;
    description: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    trust: { value: string; label: string }[];
    visual: {
      image: string;
      imageAlt: string;
      liveLabel: string;
      revenueLabel: string;
      revenueValue: string;
      revenueChange: string;
      roas: { label: string; value: string; note: string };
      ctr: { label: string; value: string; adBrand: string; adTag: string; adText: string; adCta: string };
    };
  };
  differentiators: {
    eyebrow: string;
    title: string;
    description: string;
    feature: { tag: string; title: string; text: string; actions: { icon: string; text: string; time: string }[] };
    points: { icon: string; title: string; text: string }[];
  };
  why: {
    eyebrow: string;
    /** ==word== highlights a word */
    title: string;
    description: string;
    cta: CtaLink;
    proof: { value: string; suffix: string; label: string };
    principles: { title: string; description: string }[];
  };
  cta: { eyebrow: string; title: string; description: string; button: CtaLink };
}

/* ---------- about.json ---------- */
export interface AboutContent {
  eyebrow: string;
  location: string;
  /** _phrase_ = orange emphasis drawn on from the left,  | = line break */
  title: string;
  image: string;
  imageAlt: string;
  imageBadge: { label: string; value: string; note: string };
  description: string;
  beliefs: { title: string; text: string }[];
  stats: { value: number; suffix: string; label: string; decimals?: number }[];
  page: { eyebrow: string; title: string; description: string } & SeoFields;
}

/* ---------- services.json ---------- */
/** Services are shown in the order of the array. */
export interface Service extends SeoFields {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  lead: string;
  audience: string;
  image: string;
  imageAlt: string;
  includes: { title: string; description: string }[];
  /** Hero badge; hidden when value is empty */
  stat?: { label: string; value: string };
  /** Slugs of related services; empty = the next services in order */
  related?: string[];
}
export interface ServicesContent {
  section: {
    eyebrow: string;
    count: string;
    headingLead: string;
    typedPhrases: string[];
    description: string;
    cardLinkLabel: string;
  };
  overviewPage: { eyebrow: string; title: string; description: string } & SeoFields;
  detailPage: {
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    includedEyebrow: string;
    includedTitle: string;
    includedSuffix: string;
    processEyebrow: string;
    processTitle: string;
    processDescription: string;
    process: { title: string; description: string }[];
    relatedEyebrow: string;
    relatedTitle: string;
    relatedLinkLabel: string;
  };
  items: Service[];
}

/* ---------- case-studies.json ---------- */
export type CaseVisual = 'bars' | 'line' | 'map' | 'phone';
export interface CaseStudy extends SeoFields {
  slug: string;
  title: string;
  /** Client or project name (kept for reference; not shown on the current cards) */
  client: string;
  industry: string;
  /** Filter key from "categories" */
  category: string;
  /** Slugs of the services delivered */
  services: string[];
  challenge: string;
  solution: string;
  result: { value: string; label: string };
  metrics: { value: string; label: string }[];
  /** Built-in illustration used until a real project image is supplied */
  visual: CaseVisual;
  image: string | null;
  imageAlt: string;
  /** Extra project images, stored for a future case-study detail page */
  gallery: { image: string | null; alt: string }[];
  /** Featured studies are listed first */
  featured: boolean;
  /** Include in the homepage case-study slider */
  showOnHome: boolean;
  isSample?: boolean;
}
export interface CaseStudiesContent {
  section: {
    eyebrow: string;
    title: string;
    description: string;
    sampleNote: string;
    challengeLabel: string;
    solutionLabel: string;
  };
  page: { eyebrow: string; title: string; description: string } & SeoFields;
  categories: { key: string; label: string }[];
  items: CaseStudy[];
}

/* ---------- industries.json ---------- */
export interface Industry {
  icon: string;
  title: string;
  description: string;
  /** slug of the service that leads for this industry */
  ledBy: string | null;
}
export interface IndustriesContent {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    ledByPrefix: string;
  } & SeoFields;
  items: Industry[];
}

/* ---------- clients.json ---------- */
export interface Client {
  name: string;
  /** image path; when null the name is shown as a wordmark */
  logo: string | null;
  /** Optional link to the client's website */
  website: string;
  style: 'wordmark' | 'wordmark-alt' | 'placeholder' | 'logo';
}
export interface ClientsContent {
  section: { eyebrow: string; line: string; rating: { value: string; label: string }; placeholderNote: string };
  items: Client[];
}

/* ---------- testimonials.json ---------- */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  /** Hide a single quote without deleting it */
  visible: boolean;
  isSample?: boolean;
}
export interface TestimonialsContent {
  /** Shows the testimonials section on the homepage */
  enabled: boolean;
  section: { eyebrow: string; title: string };
  items: Testimonial[];
}

/* ---------- insights.json ---------- */
export interface Insight extends SeoFields {
  slug: string;
  title: string;
  /** Drafts are hidden from the website */
  status: 'draft' | 'published';
  author: string;
  date: string;
  category: string;
  readTime: string;
  excerpt: string;
  cover: string | null;
  coverAlt: string;
  body: string[];
  isSample?: boolean;
}
export interface InsightsContent {
  page: { eyebrow: string; title: string; description: string; readLabel: string; sampleNote: string; backLabel: string } & SeoFields;
  items: Insight[];
}

/* ---------- media.json ---------- */
/** Metadata for files in the media library (the files themselves live in media storage). */
export interface MediaContent {
  items: { url: string; alt: string }[];
}

/** Every editable collection, keyed by its storage name. */
export interface ContentMap {
  settings: SiteSettings;
  navigation: Navigation;
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
  'case-studies': CaseStudiesContent;
  industries: IndustriesContent;
  clients: ClientsContent;
  testimonials: TestimonialsContent;
  insights: InsightsContent;
  media: MediaContent;
}
export type CollectionKey = keyof ContentMap;
export const COLLECTION_KEYS: CollectionKey[] = [
  'settings',
  'navigation',
  'home',
  'about',
  'services',
  'case-studies',
  'industries',
  'clients',
  'testimonials',
  'insights',
  'media',
];
