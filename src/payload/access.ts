import type { Access, Where } from "payload";

/*
 * Every user in the `users` collection is an admin. The public (no user)
 * may only read documents marked "Visible on website".
 */

export const isAdmin: Access = ({ req: { user } }) => Boolean(user);

const visibleOnly: Where = { visible: { equals: true } };

export const adminOrVisible: Access = ({ req: { user } }) => (user ? true : visibleOnly);

export const anyone: Access = () => true;

/** Standard access for content collections. */
export const contentAccess = {
  read: adminOrVisible,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};
