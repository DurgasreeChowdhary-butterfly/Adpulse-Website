import { readLocalUpload } from '@/services/media/storage';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
};

/**
 * Local media storage only: serves images uploaded from the admin after the site was built
 * (a production server does not pick up new files in /public on its own).
 * Not used with cloud storage, where uploads get their own URLs.
 */
export async function GET(_req: Request, { params }: { params: { file: string[] } }) {
  const name = params.file.join('/');
  const data = await readLocalUpload(name);
  if (!data) return new Response('Not found', { status: 404 });
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      // SVGs are served as images only, never as active documents
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
