import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Admin user", plural: "Admin users" },
  auth: true,
  admin: { useAsTitle: "email", group: "Settings", defaultColumns: ["name", "email"] },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [{ name: "name", type: "text" }],
};
