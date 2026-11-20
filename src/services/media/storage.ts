import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Where image FILES live. Alt text and other metadata live in the `media` content collection.
 *
 * - `local` (default): files on this server's disk under /public. Uploads work in development only:
 *   they are refused in production, where the app folder is replaced on every deploy.
 * - `s3`: any S3-compatible storage (Cloudflare R2, AWS S3, …) for production (MEDIA_STORAGE=s3, see s3Storage).
 * - `cloud`: Vercel Blob object storage (MEDIA_STORAGE=cloud + BLOB_READ_WRITE_TOKEN).
 *   For another provider, add a storage with the same three methods and select it in mediaStorage().
 */
export interface MediaFile {
  url: string;
  name: string;
  folder: string;
  size: number;
}

export interface MediaStorage {
  readonly mode: 'local' | 'cloud' | 's3';
  /** Short human description shown in the admin */
  readonly description: string;
  list(): Promise<MediaFile[]>;
  /** Stores a new file and returns its public URL */
  upload(file: File): Promise<string>;
  /** Deletes a file by its public URL */
  remove(url: string): Promise<void>;
}

export const ALLOWED_IMAGE = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const PUBLIC = path.join(process.cwd(), 'public');
/** images = shipped with the site code, uploads = added from the admin */
const FOLDERS = ['images', 'uploads'];

function localPath(url: string): string {
  const rel = url.replace(/^\/+/, '');
  const [folder] = rel.split('/');
  const full = path.join(PUBLIC, rel);
  // Only files directly inside the media folders can be touched.
  if (!FOLDERS.includes(folder) || path.dirname(full) !== path.join(PUBLIC, folder) || !ALLOWED_IMAGE.test(full)) {
    throw new Error('Not a media library file.');
  }
  return full;
}

export const localStorage: MediaStorage = {
  mode: 'local',
  description: 'Local disk (/public/images and /public/uploads). Fine for development and a single server; use cloud storage on serverless hosting.',
  async list() {
    const files: MediaFile[] = [];
    for (const folder of FOLDERS) {
      const dir = path.join(PUBLIC, folder);
      const names = await fs.readdir(dir).catch(() => [] as string[]);
      for (const name of names.filter((n) => ALLOWED_IMAGE.test(n))) {
        const stat = await fs.stat(path.join(dir, name));
        files.push({ url: `/${folder}/${name}`, name, folder, size: stat.size });
      }
    }
    return files;
  },
  async upload(file) {
    assertWritableDisk();
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-');
    const name = `${Date.now()}-${safe}`;
    await fs.mkdir(path.join(PUBLIC, 'uploads'), { recursive: true });
    await fs.writeFile(path.join(PUBLIC, 'uploads', name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  },
  async remove(url) {
    assertWritableDisk();
    await fs.unlink(localPath(url));
  },
};

/**
 * Production deployments (Hostinger, Vercel, …) replace the app folder on every deploy,
 * so files written there would be lost. Uploads must go to external storage in production.
 */
function assertWritableDisk() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    throw new Error('Uploads cannot be stored on this server: its files are replaced on every deploy. Set MEDIA_STORAGE=s3 (S3-compatible storage) or MEDIA_STORAGE=cloud (Vercel Blob).');
  }
}

/** Images shipped with the site code (/public/images). Read-only on serverless hosts. */
async function bundledImages(): Promise<MediaFile[]> {
  const dir = path.join(PUBLIC, 'images');
  const names = await fs.readdir(dir).catch(() => [] as string[]);
  return Promise.all(
    names.filter((n) => ALLOWED_IMAGE.test(n)).map(async (name) => ({ url: `/images/${name}`, name, folder: 'images', size: (await fs.stat(path.join(dir, name))).size })),
  );
}

const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
};

/**
 * Vercel Blob (production). Needs BLOB_READ_WRITE_TOKEN, which Vercel adds when a Blob store is
 * connected to the project. Uploads get permanent public https URLs that are stored in the content.
 * Images shipped with the code (/images/...) stay listed; they can be replaced but not deleted.
 */
export const cloudStorage: MediaStorage = {
  mode: 'cloud',
  description: 'Vercel Blob cloud storage. Images shipped with the site code (/images) are listed too and can be replaced, but not deleted.',
  async list() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store, or use MEDIA_STORAGE=local.');
    const { list } = await import('@vercel/blob');
    const files: MediaFile[] = await bundledImages();
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: 'uploads/', cursor });
      for (const b of page.blobs) files.push({ url: b.url, name: b.pathname.replace(/^uploads\//, ''), folder: 'cloud', size: b.size });
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return files;
  },
  async upload(file) {
    const { put } = await import('@vercel/blob');
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-');
    const blob = await put(`uploads/${safe}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type || undefined });
    return blob.url;
  },
  async remove(url) {
    if (url.startsWith('/images/')) throw new Error('This image is shipped with the site code. Replace it instead, or remove it from the repository.');
    if (!isBlobUrl(url)) throw new Error('Not a media library file.');
    const { del } = await import('@vercel/blob');
    await del(url);
  },
};

/* ---------------- S3-compatible object storage ----------------
 * Works with Cloudflare R2, AWS S3, Backblaze B2, DigitalOcean Spaces, MinIO, …
 * MEDIA_STORAGE=s3 + S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL
 * (+ S3_ENDPOINT for anything other than AWS, S3_REGION, optional S3_FORCE_PATH_STYLE=true).
 * Files are stored under uploads/ and served from S3_PUBLIC_URL (the bucket's public URL or a CDN domain).
 */
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
};

function s3Config() {
  const { S3_BUCKET: bucket, S3_ACCESS_KEY_ID: accessKeyId, S3_SECRET_ACCESS_KEY: secretAccessKey, S3_PUBLIC_URL: publicUrl } = process.env;
  if (!bucket || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw new Error('S3 storage is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_PUBLIC_URL.');
  }
  return {
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ''),
    client: {
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId, secretAccessKey },
    },
  };
}

type S3Module = typeof import('@aws-sdk/client-s3');
let s3Cache: { mod: S3Module; client: InstanceType<S3Module['S3Client']>; bucket: string; publicUrl: string } | null = null;

async function s3() {
  if (s3Cache) return s3Cache;
  const cfg = s3Config();
  const mod = await import('@aws-sdk/client-s3');
  s3Cache = { mod, client: new mod.S3Client(cfg.client), bucket: cfg.bucket, publicUrl: cfg.publicUrl };
  return s3Cache;
}

/** Object key for one of our uploaded files, or an error for any other URL. */
function s3KeyOf(url: string, publicUrl: string): string {
  if (!url.startsWith(`${publicUrl}/`)) throw new Error('Not a media library file.');
  const key = url.slice(publicUrl.length + 1);
  if (!/^uploads\/[a-z0-9.\-]+$/.test(key) || !ALLOWED_IMAGE.test(key)) throw new Error('Not a media library file.');
  return key;
}

export const s3Storage: MediaStorage = {
  mode: 's3',
  description: 'S3-compatible cloud storage. Images shipped with the site code (/images) are listed too and can be replaced, but not deleted.',
  async list() {
    const { mod, client, bucket, publicUrl } = await s3();
    const files: MediaFile[] = await bundledImages();
    let token: string | undefined;
    do {
      const page = await client.send(new mod.ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/', ContinuationToken: token }));
      for (const o of page.Contents ?? []) {
        if (!o.Key || !ALLOWED_IMAGE.test(o.Key)) continue;
        files.push({ url: `${publicUrl}/${o.Key}`, name: o.Key.replace(/^uploads\//, ''), folder: 'cloud', size: o.Size ?? 0 });
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return files;
  },
  async upload(file) {
    const { mod, client, bucket, publicUrl } = await s3();
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-');
    const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safe}`;
    const ext = safe.split('.').pop() ?? '';
    await client.send(
      new mod.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
        ContentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return `${publicUrl}/${key}`;
  },
  async remove(url) {
    if (url.startsWith('/images/')) throw new Error('This image is shipped with the site code. Replace it instead, or remove it from the repository.');
    const { mod, client, bucket, publicUrl } = await s3();
    await client.send(new mod.DeleteObjectCommand({ Bucket: bucket, Key: s3KeyOf(url, publicUrl) }));
  },
};

export function mediaStorage(): MediaStorage {
  if (process.env.MEDIA_STORAGE === 's3') return s3Storage;
  return process.env.MEDIA_STORAGE === 'cloud' ? cloudStorage : localStorage;
}

/** Reads a file uploaded at runtime (served by app/uploads/[...file]/route.ts). */
export async function readLocalUpload(name: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(localPath(`/uploads/${name}`));
  } catch {
    return null;
  }
}
