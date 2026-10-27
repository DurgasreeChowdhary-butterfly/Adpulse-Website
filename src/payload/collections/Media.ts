import path from "path";
import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { revalidateCollection } from "../hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media file", plural: "Media library" },
  admin: { group: "Content", defaultColumns: ["filename", "alt", "updatedAt"] },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  // Media can appear anywhere, so any change refreshes all cached content.
  hooks: revalidateCollection("cms"),
  upload: {
    // Local disk for development. Production on serverless hosting needs a
    // storage adapter (e.g. S3/Vercel Blob) – see CLAUDE.md.
    staticDir: path.resolve(process.cwd(), "media"),
    // Images incl. SVG logos. SVGs are served as-is (not resized).
    mimeTypes: ["image/*"],
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400, withoutEnlargement: true, formatOptions: { format: "webp" } },
      { name: "card", width: 768, withoutEnlargement: true, formatOptions: { format: "webp" } },
      { name: "tablet", width: 1280, withoutEnlargement: true, formatOptions: { format: "webp" } },
      { name: "desktop", width: 1920, withoutEnlargement: true, formatOptions: { format: "webp" } },
      { name: "wide", width: 2560, withoutEnlargement: true, formatOptions: { format: "webp" } },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      label: "Alt text",
      type: "text",
      required: true,
      admin: { description: "Describe the image for screen readers and Google, e.g. \"MedCure Hospitals logo\"." },
    },
  ],
};
