import "server-only";

import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload, type Where } from "payload";
import type {
  Banner as BannerDoc,
  Brand as BrandDoc,
  CaseStudy as CaseStudyDoc,
  Config,
  Header as HeaderDoc,
  HomePage as HomePageDoc,
  Industry as IndustryDoc,
  Media,
  Service as ServiceDoc,
  SiteSetting as SiteSettingsDoc,
  Stat as StatDoc,
  Testimonial as TestimonialDoc,
  WhyItem as WhyItemDoc,
} from "@/payload-types";
import type { IconName } from "./icons";

/*
 * Content access layer: the ONLY way pages and components get content.
 * Reads go through Payload's local API with public access rules applied
 * (hidden items are never returned), are cached with `'use cache'`, and are
 * tagged so Payload hooks can expire them when an editor saves
 * (see src/payload/hooks/revalidate.ts).
 */

// ---------- View types (what components receive) ----------

export type Image = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  /** Responsive variants keyed by size name (not present for SVGs). */
  sizes: Partial<Record<"thumbnail" | "card" | "tablet" | "desktop" | "wide", { url: string; width: number; height: number }>>;
};
export type Link = { label: string; href: string };
export type NavItem = Link & { children: Link[] };
export type Section = { chip: string | null; heading: string };
export type SectionWithLink = Section & { viewAll: Link | null };
export type RichText = NonNullable<ServiceDoc["content"]>;

export type SiteSettings = {
  name: string;
  url: string;
  logo: Image | null;
  logoReversed: Image | null;
  favicon: Image | null;
  contact: { phone: string; whatsapp: string | null; email: string; address: string; hours: string | null };
  social: { linkedin: string | null; instagram: string | null; youtube: string | null; x: string | null };
  googleReviews: { rating: number | null; count: number | null; link: string | null };
  seo: { title: string; description: string; image: Image | null };
};
export type Header = { navigation: NavItem[]; button: Link; showPhone: boolean; showWhatsapp: boolean };
export type HomePage = {
  bannerAutoplaySeconds: number;
  brandsHeading: string | null;
  about: Section & { text: string; image: Image | null };
  services: SectionWithLink;
  why: { heading: string; subheading: string | null };
  caseStudies: SectionWithLink;
  industries: Section;
  testimonials: Section;
  cta: { heading: string; highlight: string | null; text: string | null; button: Link };
  footer: { description: string | null; columns: { title: string; links: Link[] }[]; legalLinks: Link[]; copyright: string };
};
export type Banner = { id: string; label: string; headline: string; highlight: string | null; text: string; button: Link; image: Image | null; badge: string | null };
export type Brand = { id: string; name: string; logo: Image | null; link: string | null };
export type Service = { id: string; title: string; slug: string; shortDescription: string; icon: IconName; content: RichText | null; featured: boolean };
export type Industry = { id: string; name: string; slug: string; icon: IconName; shortDescription: string | null };
export type CaseStudy = {
  id: string; title: string; slug: string; industry: { name: string; slug: string } | null; coverImage: Image | null;
  headline: string; metrics: { value: string; label: string }[]; summary: string | null; content: RichText | null; featured: boolean;
};
export type Testimonial = { id: string; quote: string; name: string; role: string | null; company: string | null; photo: Image | null; rating: number | null };
export type Stat = { id: string; value: string; label: string; icon: IconName };
export type WhyItem = { id: string; title: string; icon: IconName };

// ---------- Cached readers ----------

type CollectionSlug = keyof Config["collections"];
type GlobalSlug = keyof Config["globals"];

async function findAll<S extends CollectionSlug>(collection: S, where?: Where) {
  "use cache";
  cacheTag(collection, "cms");
  cacheLife("max");
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection,
    where: { and: [{ visible: { equals: true } }, ...(where ? [where] : [])] },
    sort: "_order",
    depth: 1,
    pagination: false,
    overrideAccess: false,
  });
  return docs as Config["collections"][S][];
}

async function findGlobal<S extends GlobalSlug>(slug: S) {
  "use cache";
  cacheTag(slug, "cms");
  cacheLife("max");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({ slug, depth: 1, overrideAccess: false })) as Config["globals"][S];
}

// ---------- Mappers ----------

const str = (v: string | null | undefined) => (v && v.trim() ? v : null);
const shown = <T extends { visible?: boolean | null }>(items: T[] | null | undefined) =>
  (items ?? []).filter((i) => i.visible !== false);
const link = (l: { label?: string | null; link?: string | null } | null | undefined): Link | null =>
  l?.label && l.link ? { label: l.label, href: l.link } : null;
const links = (items: { label?: string | null; link?: string | null; visible?: boolean | null }[] | null | undefined) =>
  shown(items).map(link).filter((l): l is Link => l !== null);

// Payload prefixes media URLs with serverURL; keep same-site files relative so
// next/image treats them as local (optimised, no remotePatterns needed).
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
const localUrl = (url: string) => (SITE_ORIGIN && url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) : url);

function image(value: number | Media | null | undefined): Image | null {
  if (!value || typeof value !== "object" || !value.url) return null;
  const sizes: Image["sizes"] = {};
  for (const [name, size] of Object.entries(value.sizes ?? {})) {
    if (size?.url && size.width && size.height) {
      sizes[name as keyof Image["sizes"]] = { url: localUrl(size.url), width: size.width, height: size.height };
    }
  }
  return { url: localUrl(value.url), alt: value.alt, width: value.width ?? null, height: value.height ?? null, mimeType: value.mimeType ?? null, sizes };
}

const section = (s: { chip?: string | null; heading: string }): Section => ({ chip: str(s.chip), heading: s.heading });

// Current time must be read inside a cache scope under cacheComponents.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return String(new Date().getFullYear());
}

// ---------- Public API ----------

export async function getSiteSettings(): Promise<SiteSettings> {
  const s: SiteSettingsDoc = await findGlobal("site-settings");
  return {
    name: s.siteName,
    url: s.siteUrl,
    logo: image(s.logo),
    logoReversed: image(s.logoReversed),
    favicon: image(s.favicon),
    contact: { phone: s.contact.phone, whatsapp: str(s.contact.whatsapp), email: s.contact.email, address: s.contact.address, hours: str(s.contact.hours) },
    social: { linkedin: str(s.social?.linkedin), instagram: str(s.social?.instagram), youtube: str(s.social?.youtube), x: str(s.social?.x) },
    googleReviews: { rating: s.googleReviews?.rating ?? null, count: s.googleReviews?.count ?? null, link: str(s.googleReviews?.link) },
    seo: { title: s.seo.title, description: s.seo.description, image: image(s.seo.ogImage) },
  };
}

export async function getHeader(): Promise<Header> {
  const h: HeaderDoc = await findGlobal("header");
  return {
    navigation: shown(h.navItems)
      .map((item) => ({ label: item.label, href: item.link, children: links(item.children) })),
    button: { label: h.button.label, href: h.button.link },
    showPhone: h.showPhone !== false,
    showWhatsapp: h.showWhatsapp !== false,
  };
}

export async function getHomePage(): Promise<HomePage> {
  const h: HomePageDoc = await findGlobal("home-page");
  return {
    bannerAutoplaySeconds: h.bannerAutoplaySeconds ?? 6,
    brandsHeading: str(h.brandsHeading),
    about: { ...section(h.about), text: h.about.text, image: image(h.about.image) },
    services: { ...section(h.services), viewAll: link(h.services.viewAll) },
    why: { heading: h.why.heading, subheading: str(h.why.subheading) },
    caseStudies: { ...section(h.caseStudies), viewAll: link(h.caseStudies.viewAll) },
    industries: section(h.industries),
    testimonials: section(h.testimonials),
    cta: { heading: h.cta.heading, highlight: str(h.cta.highlight), text: str(h.cta.text), button: { label: h.cta.button.label, href: h.cta.button.link } },
    footer: {
      description: str(h.footerDescription),
      columns: (h.footerColumns ?? []).map((c) => ({ title: c.title, links: links(c.links) })),
      legalLinks: links(h.legalLinks),
      copyright: (h.copyright ?? "").replace("{year}", await currentYear()),
    },
  };
}

export async function getBanners(): Promise<Banner[]> {
  const docs: BannerDoc[] = await findAll("banners");
  return docs.map((b) => ({
    id: String(b.id), label: b.label, headline: b.headline, highlight: str(b.highlight), text: b.text,
    button: { label: b.buttonLabel, href: b.buttonLink }, image: image(b.image), badge: str(b.badge),
  }));
}

export async function getBrands(): Promise<Brand[]> {
  const docs: BrandDoc[] = await findAll("brands");
  return docs.map((b) => ({ id: String(b.id), name: b.name, logo: image(b.logo), link: str(b.link) }));
}

export async function getServices({ featuredOnly = false } = {}): Promise<Service[]> {
  const docs: ServiceDoc[] = await findAll("services", featuredOnly ? { featured: { equals: true } } : undefined);
  return docs.map((s) => ({
    id: String(s.id), title: s.title, slug: s.slug, shortDescription: s.shortDescription, icon: s.icon as IconName,
    content: s.content ?? null, featured: Boolean(s.featured),
  }));
}

export async function getIndustries(): Promise<Industry[]> {
  const docs: IndustryDoc[] = await findAll("industries");
  return docs.map((i) => ({ id: String(i.id), name: i.name, slug: i.slug, icon: i.icon as IconName, shortDescription: str(i.shortDescription) }));
}

export async function getCaseStudies({ featuredOnly = false } = {}): Promise<CaseStudy[]> {
  const docs: CaseStudyDoc[] = await findAll("case-studies", featuredOnly ? { featured: { equals: true } } : undefined);
  return docs.map((c) => ({
    id: String(c.id), title: c.title, slug: c.slug,
    // A hidden industry is not readable publicly and arrives as a bare id.
    industry: typeof c.industry === "object" ? { name: c.industry.name, slug: c.industry.slug } : null,
    coverImage: image(c.coverImage), headline: c.headline,
    metrics: c.metrics.map((m) => ({ value: m.value, label: m.label })),
    summary: str(c.summary), content: c.content ?? null, featured: Boolean(c.featured),
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const docs: TestimonialDoc[] = await findAll("testimonials");
  return docs.map((t) => ({
    id: String(t.id), quote: t.quote, name: t.name, role: str(t.role), company: str(t.company), photo: image(t.photo), rating: t.rating ?? null,
  }));
}

export async function getStats(): Promise<Stat[]> {
  const docs: StatDoc[] = await findAll("stats");
  return docs.map((s) => ({ id: String(s.id), value: s.value, label: s.label, icon: s.icon as IconName }));
}

export async function getWhyItems(): Promise<WhyItem[]> {
  const docs: WhyItemDoc[] = await findAll("why-items");
  return docs.map((w) => ({ id: String(w.id), title: w.title, icon: w.icon as IconName }));
}
