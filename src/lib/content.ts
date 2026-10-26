import site from "@/content/site.json";

/*
 * Content access layer. Components read content only through these
 * functions, never by importing JSON directly, so the source can be swapped
 * for the CMS/admin panel later without touching any component.
 */

export type NavItem = { label: string; href: string };

export type SiteSettings = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  logo: { default: string; reversed: string; alt: string };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
  };
  navigation: NavItem[];
};

export async function getSiteSettings(): Promise<SiteSettings> {
  return site;
}
