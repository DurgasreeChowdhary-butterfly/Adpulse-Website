import { NextResponse } from 'next/server';
import { writesAllowed } from '@/services/content/admin';
import { ALLOWED_IMAGE, MAX_IMAGE_BYTES, mediaStorage } from '@/services/media/storage';
import { forgetAlt, listMedia, moveAlt, replaceReferences, setAlt, usageOf } from '@/services/media';

export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Lists the media library: files, alt text and where each file is used. Protected by proxy.ts. */
export async function GET() {
  const storage = mediaStorage();
  try {
    return NextResponse.json({ mode: storage.mode, storage: storage.description, files: await listMedia() });
  } catch (e) {
    return NextResponse.json({ mode: storage.mode, storage: storage.description, files: [], error: (e as Error).message });
  }
}

/**
 * Uploads an image (multipart field "file", optional "alt").
 * With "replace" set to an existing URL, the new file takes its place everywhere it is used
 * and the old file is removed.
 */
export async function POST(req: Request) {
  if (!writesAllowed()) return fail('Uploads are disabled in this environment.', 403);
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return fail('No file', 400);
  if (!ALLOWED_IMAGE.test(file.name)) return fail('Images only (jpg, png, webp, gif, svg, avif).', 415);
  if (file.size > MAX_IMAGE_BYTES) return fail('Max 5 MB.', 413);

  try {
    const storage = mediaStorage();
    const url = await storage.upload(file);
    const replace = form.get('replace');
    if (typeof replace === 'string' && replace) {
      const changed = await replaceReferences(replace, url);
      await moveAlt(replace, url);
      await storage.remove(replace).catch(() => {});
      return NextResponse.json({ ok: true, url, replaced: replace, updatedCollections: changed });
    }
    const alt = form.get('alt');
    if (typeof alt === 'string' && alt.trim()) await setAlt(url, alt);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return fail((e as Error).message, 500);
  }
}

/** Updates alt text: { url, alt } */
export async function PATCH(req: Request) {
  if (!writesAllowed()) return fail('Saving is disabled in this environment.', 403);
  const { url, alt } = await req.json().catch(() => ({}));
  if (typeof url !== 'string' || typeof alt !== 'string') return fail('Expected { url, alt }', 422);
  await setAlt(url, alt);
  return NextResponse.json({ ok: true });
}

/** Deletes a file, but only when no content uses it: DELETE ?url=/uploads/x.jpg */
export async function DELETE(req: Request) {
  if (!writesAllowed()) return fail('Deleting is disabled in this environment.', 403);
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return fail('Missing url', 400);
  const usedIn = await usageOf(url);
  if (usedIn.length) return NextResponse.json({ error: 'This image is still in use.', usedIn }, { status: 409 });
  try {
    await mediaStorage().remove(url);
    await forgetAlt(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail((e as Error).message, 400);
  }
}
