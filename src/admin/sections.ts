import type { CollectionKey } from '@/types/content';

/**
 * Admin navigation. Each section edits one content collection (src/data/<collection>.json),
 * except Dashboard and Media which have their own screens.
 */
export interface AdminSection {
  slug: string;
  label: string;
  icon: string;
  description: string;
  collection?: CollectionKey;
  /** Public page to preview after saving */
  preview?: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { slug: '', label: 'Dashboard', icon: 'i-layers', description: 'Overview of all website content.' },
  { slug: 'enquiries', label: 'Enquiries', icon: 'c-mail', description: 'Free growth audit requests and newsletter sign-ups: search, update status, export CSV.' },
  { slug: 'homepage', label: 'Homepage', icon: 'n-home', collection: 'home', preview: '/', description: 'Hero, callouts and stats, differentiators, why choose us and the closing call to action.' },
  { slug: 'about', label: 'About', icon: 'c-pin', collection: 'about', preview: '/about', description: 'About statement, photo, beliefs, statistics and About page SEO.' },
  { slug: 'services', label: 'Services', icon: 's-perf', collection: 'services', preview: '/services', description: 'Add, edit, delete and reorder services: hero, what\'s included, process, related services, images, icons and SEO.' },
  { slug: 'case-studies', label: 'Case Studies', icon: 'i-target', collection: 'case-studies', preview: '/case-studies', description: 'Add, edit, delete and reorder case studies: results, metrics, images, featured, homepage visibility and SEO.' },
  { slug: 'insights', label: 'Insights / Blog', icon: 's-creative', collection: 'insights', preview: '/insights', description: 'Write and publish articles: draft or published, author, date, cover image and SEO.' },
  { slug: 'industries', label: 'Industries', icon: 'n-factory', collection: 'industries', preview: '/industries', description: 'Add, edit, delete and reorder industries and the Industries page.' },
  { slug: 'clients', label: 'Client Logos', icon: 'i-star', collection: 'clients', preview: '/', description: 'Logo strip: add, replace, reorder and link client logos.' },
  { slug: 'testimonials', label: 'Testimonials', icon: 's-social', collection: 'testimonials', preview: '/', description: 'Client quotes: add, reorder, hide individual quotes, and show or hide the section.' },
  { slug: 'media', label: 'Media Library', icon: 'i-eye', description: 'Upload, replace, describe (alt text) and delete images.' },
  { slug: 'settings', label: 'Website Settings', icon: 's-strategy', collection: 'settings', preview: '/', description: 'Company name, phones, emails, address, socials, audit form, 404 page and SEO defaults.' },
  { slug: 'navigation', label: 'Navigation & Footer', icon: 'i-menu', collection: 'navigation', preview: '/', description: 'Header menu, mobile menu, breadcrumbs and footer links.' },
];

export const sectionBySlug = (slug: string) => ADMIN_SECTIONS.find((s) => s.slug === slug);
