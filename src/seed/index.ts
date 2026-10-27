/*
 * Fills the CMS with the dummy content from the approved mockup.
 * Run with `npm run seed`. WARNING: replaces all existing website content
 * (admin users are kept).
 */
import fs from "fs";
import path from "path";
import { getPayload, type CollectionSlug, type RequiredDataFromCollectionSlug } from "payload";
import { fileURLToPath } from "url";
import config from "../payload.config";
import * as data from "./data";
import { placeholderPng } from "./placeholders";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.resolve(dirname, "../../public/brand");

const payload = await getPayload({ config });
// Seeding runs outside Next.js, so there is no page cache to revalidate.
const context = { disableRevalidate: true };

const richText = (...paragraphs: string[]) => ({
  root: {
    type: "root", format: "" as const, indent: 0, version: 1, direction: "ltr" as const,
    children: paragraphs.map((text) => ({
      type: "paragraph", format: "" as const, indent: 0, version: 1, direction: "ltr" as const, textFormat: 0, textStyle: "",
      children: [{ type: "text", text, format: 0, detail: 0, mode: "normal", style: "", version: 1 }],
    })),
  },
});

async function upload(alt: string, name: string, buffer: Buffer, mimetype: string) {
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    file: { data: buffer, mimetype, name, size: buffer.length },
    context,
  });
  return doc.id;
}

const placeholder = async (alt: string, name: string, w: number, h: number, title = alt) =>
  upload(`Placeholder: ${alt}`, `${name}.png`, await placeholderPng(w, h, title), "image/png");

async function create<S extends CollectionSlug>(collection: S, docs: RequiredDataFromCollectionSlug<S>[]) {
  const created = [];
  // Sequential so the drag-and-drop order matches the array order.
  for (const doc of docs) created.push(await payload.create({ collection, data: doc, context }));
  payload.logger.info(`  ${collection}: ${created.length}`);
  return created;
}

payload.logger.info("Seeding AdPulse content…");

const contentCollections: CollectionSlug[] = [
  "banners", "brands", "case-studies", "services", "industries", "testimonials", "stats", "why-items", "media",
];
for (const collection of contentCollections) {
  await payload.delete({ collection, where: { id: { exists: true } }, context });
}

// Media: the supplied logo files, the favicon crop, and labelled placeholders.
const logo = await upload("AdPulse – AI-Powered Growth logo", "adpulse-logo.svg", fs.readFileSync(path.join(brandDir, "adpulse-logo.svg")), "image/svg+xml");
const logoReversed = await upload("AdPulse – AI-Powered Growth logo", "adpulse-logo-reversed.svg", fs.readFileSync(path.join(brandDir, "adpulse-logo-reversed.svg")), "image/svg+xml");
const favicon = await upload("AdPulse icon", "adpulse-icon.png", fs.readFileSync(path.join(brandDir, "adpulse-icon.png")), "image/png");
const ogImage = await placeholder("Social sharing image", "og-image", 1200, 630);
const aboutImage = await placeholder("AdPulse office", "about-office", 1200, 480);

await create("banners", await Promise.all(
  data.banners.map(async ({ art, ...banner }, i) => ({ ...banner, image: await placeholder(art, `banner-${i + 1}`, 1600, 1000) })),
));

await create("brands", await Promise.all(
  data.brands.map(async (name, i) => ({
    name,
    logo: await placeholder(`${name} logo`, `brand-${i + 1}`, 480, 160, name),
  })),
));

await create("services", data.services.map(({ body, ...s }) => ({ ...s, slug: "", content: richText(s.shortDescription, body) })));
const industries = await create("industries", data.industries.map((i) => ({ ...i, slug: "" })));
await create("stats", data.stats.map((s) => ({ ...s })));
await create("why-items", data.whyItems.map((w) => ({ ...w })));

await create("case-studies", await Promise.all(
  data.caseStudies.map(async ({ cover, industry, ...c }, i) => ({
    ...c,
    slug: "",
    industry: industries.find((x) => x.name === industry)!.id,
    coverImage: await placeholder(cover, `case-study-${i + 1}`, 800, 600),
    content: richText(c.summary, "Full case study content goes here."),
    featured: true,
  })),
));

await create("testimonials", await Promise.all(
  data.testimonials.map(async (t, i) => ({ ...t, rating: 5, photo: await placeholder(`${t.name} photo`, `testimonial-${i + 1}`, 400, 400, "Photo") })),
));

// Globals
const nav = (label: string, link: string, children: { label: string; link: string }[] = [], visible = true) => ({
  label, link, visible, children: children.map((c) => ({ ...c, visible: true })),
});
const servicesLinks = data.services.map((s) => ({ label: s.title, link: `/services/${s.title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-")}` }));
const industryLinks = data.industries.map((i) => ({ label: i.name, link: `/industries/${i.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }));

await payload.updateGlobal({
  slug: "site-settings",
  context,
  data: {
    siteName: "AdPulse Digital",
    siteUrl: "https://www.adpulsedigital.in",
    logo, logoReversed, favicon,
    contact: data.contact,
    social: { linkedin: "", instagram: "", youtube: "", x: "" },
    googleReviews: { rating: 4.8, count: 120, link: "" },
    seo: {
      title: "AdPulse Digital | AI-Powered Growth Marketing Agency",
      description: "AdPulse Digital is a growth-focused digital and AI marketing agency in Hyderabad, helping businesses scale with performance marketing, social media and high-converting websites.",
      ogImage,
    },
  },
});

await payload.updateGlobal({
  slug: "header",
  context,
  data: {
    navItems: [
      nav("Home", "/"),
      nav("Services", "/services", servicesLinks),
      nav("Industries", "/industries", industryLinks),
      nav("Case Studies", "/case-studies"),
      nav("About", "/about", [{ label: "About Us", link: "/about" }, { label: "Our Approach", link: "/about#approach" }, { label: "Careers", link: "/careers" }]),
      nav("Insights", "/insights", [{ label: "Blog", link: "/insights" }]),
      nav("Tools", "/tools"),
    ],
    button: { label: "Get Free Growth Audit", link: "/contact" },
    showPhone: true,
    showWhatsapp: true,
  },
});

await payload.updateGlobal({
  slug: "home-page",
  context,
  data: {
    bannerAutoplaySeconds: 6,
    brandsHeading: "Trusted by Growing Brands",
    about: {
      chip: "About AdPulse",
      heading: "A Growth-Focused Digital & AI Marketing Agency",
      text: "We help businesses scale with performance marketing, social media, and high-converting websites, powered by data and AI.",
      image: aboutImage,
    },
    services: { chip: "Our Core Services", heading: "End-to-End Growth Solutions for Modern Businesses", viewAll: { label: "View All Services", link: "/services" } },
    why: { heading: "Why AdPulse?", subheading: "The AI Advantage for Faster, Smarter Growth" },
    caseStudies: { chip: "Case Studies", heading: "Real Results. Real Business Impact.", viewAll: { label: "View All Case Studies", link: "/case-studies" } },
    industries: { chip: "Industries We Serve", heading: "Growth Solutions for Diverse Industries" },
    testimonials: { chip: "What Our Clients Say", heading: "Trusted by Business Leaders" },
    cta: {
      heading: "Ready to Accelerate Your Growth?",
      highlight: "Growth?",
      text: "Get a free growth audit and a personalized action plan from our experts.",
      button: { label: "Book a Strategy Call", link: "/contact" },
    },
    footerDescription: "A growth-focused digital and AI marketing agency helping businesses scale with strategy, creativity and automation.",
    footerColumns: [
      { title: "Quick Links", links: data.quickLinks.map((l) => ({ ...l, visible: true })) },
      { title: "Services", links: servicesLinks.map((l) => ({ ...l, visible: true })) },
      { title: "Industries", links: industryLinks.map((l) => ({ ...l, visible: true })) },
    ],
    legalLinks: data.legalLinks.map((l) => ({ ...l, visible: true })),
    copyright: "© {year} AdPulse. All rights reserved.",
  },
});

payload.logger.info("Seed complete.");
process.exit(0);
