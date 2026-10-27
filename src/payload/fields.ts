import type { CheckboxField, Field, TextField } from "payload";
import { ICON_NAMES } from "../lib/icons";

/** "Visible on website" toggle, shown in the sidebar of every content collection. */
export const visibleField: CheckboxField = {
  name: "visible",
  label: "Visible on website",
  type: "checkbox",
  defaultValue: true,
  index: true,
  admin: { position: "sidebar", description: "Untick to hide this item without deleting it." },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** URL slug, auto-filled from another field when left empty. */
export const slugField = (from: string): TextField => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "Used in the page address. Filled in automatically from the title if left empty.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.trim()) return slugify(value);
        const source = data?.[from];
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
});

/** Icon picker. The site renders these names with its own icon set. */
export const iconField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: "icon",
    type: "select",
    required: true,
    options: ICON_NAMES.map((value) => ({ label: value, value })),
    admin: { description: "Icon shown next to this item on the website." },
    ...overrides,
  }) as Field;

/** Internal path ("/contact") or full URL. */
export const linkField = (name: string, label: string, required = false): TextField => ({
  name,
  label,
  type: "text",
  required,
  admin: { description: 'A page on this site such as "/contact", or a full web address.' },
});
