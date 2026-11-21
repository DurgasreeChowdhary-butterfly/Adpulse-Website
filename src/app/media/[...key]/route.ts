import { MEDIA_KEY, contentTypeFor, readS3Object } from '@/services/media/storage';

export const dynamic = 'force-dynamic';

/**
 * Serves uploaded images from the PRIVATE S3/R2 bucket on the website's own domain:
 * GET /media/uploads/<file>  ->  bucket object uploads/<file>
 * Used when MEDIA_STORAGE=s3 and S3_PUBLIC_URL is "/media" (the default).
 *
 * Security: only keys matching MEDIA_KEY (uploads/<safe-name>.<image-ext>) are reachable, the
 * content type comes from our own allow-list, and files are served as inert images
 * (nosniff + sandboxing CSP, so an SVG can never run scripts on this site).
 * Caching: uploaded file names are unique and never reused, so responses are cached for a year.
 */
const CACHE_FOREVER = 'public, max-age=31536000, immutable';
const SAFE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  'Content-Disposition': 'inline',
};

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60', 'Content-Type': 'text/plain; charset=utf-8' } });

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join('/');
  const type = contentTypeFor(key);
  if (process.env.MEDIA_STORAGE !== 's3' || !MEDIA_KEY.test(key) || !type) return notFound();

  try {
    const obj = await readS3Object(key, req.headers.get('if-none-match'));
    if (!obj) return notFound();
    if (obj.status === 304) {
      return new Response(null, { status: 304, headers: { 'Cache-Control': CACHE_FOREVER, ...(obj.etag ? { ETag: obj.etag } : {}) } });
    }
    const headers: Record<string, string> = { 'Content-Type': type, 'Cache-Control': CACHE_FOREVER, ...SAFE_HEADERS };
    if (obj.etag) headers.ETag = obj.etag;
    if (obj.lastModified) headers['Last-Modified'] = obj.lastModified.toUTCString();
    if (obj.size !== undefined) headers['Content-Length'] = String(obj.size);
    return new Response(obj.body, { status: 200, headers });
  } catch (e) {
    // Log the error type only (never keys, URLs or credentials); visitors get a generic, uncached answer.
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    console.error(`[media] could not read from storage: ${err.name ?? 'Error'}${err.$metadata?.httpStatusCode ? ` (HTTP ${err.$metadata.httpStatusCode})` : ''}`);
    return new Response('Image temporarily unavailable', { status: 502, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
