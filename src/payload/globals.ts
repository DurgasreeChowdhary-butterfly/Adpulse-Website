import type { Field, GlobalConfig } from "payload";
import { anyone, isAdmin } from "./access";
import { linkField } from "./fields";
import { revalidateGlobal } from "./hooks/revalidate";

const globalAccess = { read: anyone, update: isAdmin };

const linkRow = (required = true): Field => ({
  type: "row",
  fields: [{ name: "label", type: "text", required }, linkField("link", "Link", required)],
});

const showField: Field = {
  name: "visible",
  label: "Show",
  type: "checkbox",
  defaultValue: true,
};

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  access: globalAccess,
  hooks: revalidateGlobal("site-settings"),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand",
          fields: [
            { name: "siteName", label: "Site name", type: "text", required: true },
            { name: "siteUrl", label: "Website address", type: "text", required: true, admin: { description: "e.g. https://www.adpulsedigital.in" } },
            {
              type: "row",
              fields: [
                { name: "logo", type: "upload", relationTo: "media", admin: { description: "For light backgrounds (header)." } },
                { name: "logoReversed", label: "Logo (reversed)", type: "upload", relationTo: "media", admin: { description: "For dark backgrounds (footer)." } },
                { name: "favicon", type: "upload", relationTo: "media", admin: { description: "Square PNG, at least 512×512." } },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "contact",
              type: "group",
              fields: [
                { type: "row", fields: [{ name: "phone", type: "text", required: true }, { name: "whatsapp", label: "WhatsApp number", type: "text", admin: { description: "Digits only with country code, e.g. 917997991225." } }] },
                { name: "email", type: "email", required: true },
                { name: "address", type: "textarea", required: true },
                { name: "hours", label: "Opening hours", type: "text" },
              ],
            },
            {
              name: "social",
              label: "Social links",
              type: "group",
              fields: [
                { type: "row", fields: [{ name: "linkedin", label: "LinkedIn", type: "text" }, { name: "instagram", label: "Instagram", type: "text" }] },
                { type: "row", fields: [{ name: "youtube", label: "YouTube", type: "text" }, { name: "x", label: "X (Twitter)", type: "text" }] },
              ],
            },
          ],
        },
        {
          label: "Google reviews",
          fields: [
            {
              name: "googleReviews",
              type: "group",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "rating", type: "number", min: 0, max: 5, admin: { step: 0.1 } },
                    { name: "count", label: "Number of reviews", type: "number", min: 0 },
                  ],
                },
                { name: "link", label: "Google reviews link", type: "text" },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                { name: "title", label: "Default page title", type: "text", required: true },
                { name: "description", label: "Default description", type: "textarea", required: true, maxLength: 300 },
                { name: "ogImage", label: "Social sharing image", type: "upload", relationTo: "media", admin: { description: "1200×630 image shown when a link is shared." } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const Header: GlobalConfig = {
  slug: "header",
  label: "Header",
  admin: { group: "Settings" },
  access: globalAccess,
  hooks: revalidateGlobal("header"),
  fields: [
    {
      name: "navItems",
      label: "Navigation",
      type: "array",
      admin: { initCollapsed: true, components: { RowLabel: "/payload/components/RowLabel#LabelRowLabel" } },
      fields: [
        linkRow(),
        showField,
        {
          name: "children",
          label: "Dropdown items",
          type: "array",
          admin: { initCollapsed: true, components: { RowLabel: "/payload/components/RowLabel#LabelRowLabel" } },
          fields: [linkRow(), showField],
        },
      ],
    },
    {
      name: "button",
      label: "Header button",
      type: "group",
      fields: [linkRow()],
    },
    { name: "showPhone", label: "Show phone number", type: "checkbox", defaultValue: true },
    { name: "showWhatsapp", label: "Show WhatsApp button", type: "checkbox", defaultValue: true },
  ],
};

/** Chip + heading pair used by most homepage sections. */
const sectionHeading = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  label,
  type: "group",
  fields: [
    { type: "row", fields: [{ name: "chip", label: "Chip text", type: "text" }, { name: "heading", type: "text", required: true }] },
    ...extra,
  ],
});

const viewAllLink: Field = {
  name: "viewAll",
  label: '"View all" link',
  type: "group",
  fields: [linkRow(false)],
};

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home page",
  admin: { group: "Homepage" },
  access: globalAccess,
  hooks: revalidateGlobal("home-page"),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Banners",
          fields: [
            {
              name: "bannerAutoplaySeconds",
              label: "Banner autoplay speed (seconds)",
              type: "number",
              min: 0,
              defaultValue: 6,
              admin: { description: "Seconds each banner stays on screen. 0 turns autoplay off." },
            },
            { name: "brandsHeading", label: '"Trusted by" bar heading', type: "text" },
          ],
        },
        {
          label: "About",
          fields: [
            sectionHeading("about", "About section", [
              { name: "text", label: "Paragraph", type: "textarea", required: true },
              { name: "image", type: "upload", relationTo: "media" },
            ]),
          ],
        },
        {
          label: "Sections",
          fields: [
            sectionHeading("services", "Services section", [viewAllLink]),
            {
              name: "why",
              label: "Why AdPulse bar",
              type: "group",
              fields: [{ type: "row", fields: [{ name: "heading", type: "text", required: true }, { name: "subheading", type: "text" }] }],
            },
            sectionHeading("caseStudies", "Case studies section", [viewAllLink]),
            sectionHeading("industries", "Industries section"),
            sectionHeading("testimonials", "Testimonials section"),
          ],
        },
        {
          label: "Final CTA",
          fields: [
            {
              name: "cta",
              label: "Call to action band",
              type: "group",
              fields: [
                { type: "row", fields: [{ name: "heading", type: "text", required: true }, { name: "highlight", label: "Highlighted words", type: "text", admin: { description: "Part of the heading shown in orange." } }] },
                { name: "text", type: "textarea" },
                { name: "button", type: "group", fields: [linkRow()] },
              ],
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            { name: "footerDescription", label: "Footer description", type: "textarea" },
            {
              name: "footerColumns",
              label: "Footer link columns",
              type: "array",
              admin: { initCollapsed: true, components: { RowLabel: "/payload/components/RowLabel#TitleRowLabel" } },
              fields: [
                { name: "title", type: "text", required: true },
                { name: "links", type: "array", fields: [linkRow(), showField] },
              ],
            },
            { name: "legalLinks", label: "Legal links", type: "array", fields: [linkRow(), showField] },
            { name: "copyright", type: "text", admin: { description: "Use {year} for the current year." } },
          ],
        },
      ],
    },
  ],
};
