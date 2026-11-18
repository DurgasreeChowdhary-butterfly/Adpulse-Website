import 'server-only';
import { cache } from 'react';
import type { CollectionKey, ContentMap, Service, CaseStudy, Insight } from '@/types/content';
import { activeSource } from './sources';

/**
 * The only way pages and components get content.
 * Today it reads src/data/*.json; set CONTENT_SOURCE=api to read from a backend instead.
 * `cache` dedupes reads within a single request.
 */
export const getCollection = cache(async <K extends CollectionKey>(key: K): Promise<ContentMap[K]> => {
  return activeSource().read(key);
});

export const getSettings = () => getCollection('settings');
export const getNavigation = () => getCollection('navigation');
export const getHome = () => getCollection('home');
export const getAbout = () => getCollection('about');
export const getIndustries = () => getCollection('industries');
export const getClients = () => getCollection('clients');
export async function getTestimonials() {
  const data = await getCollection('testimonials');
  return { ...data, items: data.items.filter((t) => t.visible !== false) };
}
export const getMedia = () => getCollection('media');

/** Page SEO: admin values when set, otherwise the given fallbacks. */
export function pageSeo(seo: { metaTitle?: string; metaDescription?: string }, title: string, description: string) {
  return { title: seo.metaTitle?.trim() || title, description: seo.metaDescription?.trim() || description };
}

/** Services in the order set in the admin (array order). */
export const getServicesContent = () => getCollection('services');
export async function getServices(): Promise<Service[]> {
  return (await getServicesContent()).items;
}
export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((s) => s.slug === slug);
}
/** Related services chosen in the admin, or the next services in order when none are chosen. */
export function relatedServices(service: Service, all: Service[], count = 4): Service[] {
  const chosen = (service.related ?? []).map((slug) => all.find((s) => s.slug === slug)).filter((s): s is Service => !!s && s.slug !== service.slug);
  if (chosen.length) return chosen;
  const index = all.findIndex((s) => s.slug === service.slug);
  return Array.from({ length: Math.min(count, all.length - 1) }, (_, k) => all[(index + k + 1) % all.length]);
}

/** Featured case studies first, otherwise in admin order. */
const featuredFirst = (items: CaseStudy[]) => [...items.filter((c) => c.featured), ...items.filter((c) => !c.featured)];

export async function getCaseStudiesContent() {
  const data = await getCollection('case-studies');
  return { ...data, items: featuredFirst(data.items) };
}
/** Case studies for the homepage slider ("Show on home"). */
export async function getHomeCaseStudiesContent() {
  const data = await getCaseStudiesContent();
  return { ...data, items: data.items.filter((c) => c.showOnHome) };
}
export async function getCaseStudies(): Promise<CaseStudy[]> {
  return (await getCaseStudiesContent()).items;
}

/** Published articles only, newest first. Drafts never reach the website. */
export async function getInsightsContent() {
  const data = await getCollection('insights');
  const items = data.items.filter((p) => p.status !== 'draft').sort((a, b) => b.date.localeCompare(a.date));
  return { ...data, items };
}
export async function getInsights(): Promise<Insight[]> {
  return (await getInsightsContent()).items;
}
export async function getInsightBySlug(slug: string): Promise<Insight | undefined> {
  return (await getInsights()).find((p) => p.slug === slug);
}

/** Everything the shared layout (header, footer, modal) needs, in one call. */
export async function getLayoutContent() {
  const [settings, navigation, services] = await Promise.all([getSettings(), getNavigation(), getServices()]);
  return { settings, navigation, services };
}
