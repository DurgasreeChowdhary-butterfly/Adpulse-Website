import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/*
 * Content reads in src/lib/content.ts are cached with `cacheTag(<slug>)`.
 * These hooks expire that tag whenever an editor saves, so the change shows
 * on the next page load without a rebuild or redeploy.
 */

function expire(tag: string, req: PayloadRequest) {
  if (req.context.disableRevalidate) return;
  try {
    // expire: 0 → the next visitor gets fresh content, never the stale copy.
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    // Outside a Next.js request (e.g. the seed script) there is no cache to expire.
    req.payload.logger.debug({ msg: `Skipped revalidating "${tag}"`, error });
  }
}

export const revalidateCollection = (tag: string) => ({
  afterChange: [(({ doc, req }) => (expire(tag, req), doc)) as CollectionAfterChangeHook],
  afterDelete: [(({ doc, req }) => (expire(tag, req), doc)) as CollectionAfterDeleteHook],
});

export const revalidateGlobal = (tag: string) => ({
  afterChange: [(({ doc, req }) => (expire(tag, req), doc)) as GlobalAfterChangeHook],
});
