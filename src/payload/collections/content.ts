import type { CollectionConfig } from "payload";
import { contentAccess } from "../access";
import { iconField, linkField, slugField, visibleField } from "../fields";
import { revalidateCollection } from "../hooks/revalidate";

/*
 * Website content collections. All share: public read of visible items only,
 * admin-only writes, drag-and-drop ordering (`orderable`), and cache
 * revalidation on change. The slug doubles as the cache tag.
 */

const base = (slug: string): Pick<CollectionConfig, "slug" | "access" | "orderable" | "hooks"> => ({
  slug,
  access: contentAccess,
  orderable: true,
  hooks: revalidateCollection(slug),
});

export const Banners: CollectionConfig = {
  ...base("banners"),
  labels: { singular: "Banner", plural: "Banners" },
  admin: {
    group: "Homepage",
    useAsTitle: "headline",
    defaultColumns: ["headline", "label", "visible"],
    description: "Header sliding banners. Drag rows to change the slide order.",
  },
  fields: [
    { name: "label", label: "Chip text", type: "text", required: true, admin: { description: 'Small label above the headline, e.g. "Performance Marketing".' } },
    { name: "headline", type: "text", required: true },
    {
      name: "highlight",
      label: "Highlighted words",
      type: "text",
      admin: { description: "Part of the headline shown in orange. Must match the headline text exactly." },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: { headline?: string } }) =>
        !value || siblingData.headline?.includes(value) || "These words must appear in the headline.",
    },
    { name: "text", label: "Supporting text", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "buttonLabel", label: "Button label", type: "text", required: true },
        linkField("buttonLink", "Button link", true),
      ],
    },
    { name: "image", label: "Artwork / background image", type: "upload", relationTo: "media" },
    { name: "badge", label: "Floating badge text", type: "text", admin: { description: 'Optional, e.g. "+3.2x ROI".' } },
    { ...visibleField, label: "Active" },
  ],
};

export const Brands: CollectionConfig = {
  ...base("brands"),
  labels: { singular: "Brand", plural: "Brands" },
  admin: { group: "Homepage", useAsTitle: "name", defaultColumns: ["name", "logo", "visible"], description: "Client logos in the \"Trusted by\" bar." },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    linkField("link", "Link"),
    visibleField,
  ],
};

export const Services: CollectionConfig = {
  ...base("services"),
  labels: { singular: "Service", plural: "Services" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "icon", "visible"] },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    { name: "shortDescription", label: "Short description", type: "textarea", required: true },
    iconField(),
    { name: "content", label: "Full page content", type: "richText", admin: { description: "Shown on the service detail page." } },
    { name: "featured", label: "Show on homepage", type: "checkbox", defaultValue: false, index: true, admin: { position: "sidebar" } },
    visibleField,
  ],
};

export const Industries: CollectionConfig = {
  ...base("industries"),
  labels: { singular: "Industry", plural: "Industries" },
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["name", "icon", "visible"] },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    iconField(),
    { name: "shortDescription", label: "Short description", type: "textarea" },
    visibleField,
  ],
};

export const CaseStudies: CollectionConfig = {
  ...base("case-studies"),
  labels: { singular: "Case study", plural: "Case studies" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "industry", "featured", "visible"] },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "Client or project name, used on the detail page." } },
    slugField("title"),
    { name: "industry", type: "relationship", relationTo: "industries", required: true },
    { name: "coverImage", label: "Cover image", type: "upload", relationTo: "media", required: true },
    { name: "headline", label: "Result headline", type: "text", required: true, admin: { description: 'e.g. "+32% Patient Enquiries in 90 Days".' } },
    {
      name: "metrics",
      type: "array",
      minRows: 3,
      maxRows: 3,
      required: true,
      admin: { description: "Exactly three results.", initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true, admin: { description: 'e.g. "+32%"' } },
            { name: "label", type: "text", required: true, admin: { description: 'e.g. "Enquiries"' } },
          ],
        },
      ],
    },
    { name: "summary", label: "Short summary", type: "textarea" },
    { name: "content", label: "Full case study", type: "richText" },
    { name: "featured", label: "Featured on homepage", type: "checkbox", defaultValue: true, index: true, admin: { position: "sidebar" } },
    visibleField,
  ],
};

export const Testimonials: CollectionConfig = {
  ...base("testimonials"),
  labels: { singular: "Testimonial", plural: "Testimonials" },
  admin: { group: "Homepage", useAsTitle: "name", defaultColumns: ["name", "company", "rating", "visible"] },
  fields: [
    { name: "quote", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "name", label: "Person name", type: "text", required: true },
        { name: "role", type: "text" },
        { name: "company", type: "text" },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "rating", type: "number", min: 1, max: 5, defaultValue: 5 },
    visibleField,
  ],
};

export const Stats: CollectionConfig = {
  ...base("stats"),
  labels: { singular: "Stat", plural: "Stats" },
  admin: { group: "Homepage", useAsTitle: "label", defaultColumns: ["value", "label", "icon", "visible"], description: "The numbers under the About section." },
  fields: [
    { type: "row", fields: [{ name: "value", type: "text", required: true }, { name: "label", type: "text", required: true }] },
    iconField(),
    visibleField,
  ],
};

export const WhyItems: CollectionConfig = {
  ...base("why-items"),
  labels: { singular: "Why AdPulse item", plural: "Why AdPulse items" },
  admin: { group: "Homepage", useAsTitle: "title", defaultColumns: ["title", "icon", "visible"] },
  fields: [{ name: "title", type: "text", required: true }, iconField(), visibleField],
};
