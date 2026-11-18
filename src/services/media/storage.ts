import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Where image FILES live. Alt text and other metadata live in the `media` content collection.
 *
 * - `local` (default): files on this server's disk under /public. Works in development and on a
 *   single server (VPS). Not suitable for serverless hosts, whose disk is read-only/temporary.
 * - `cloud`: Vercel Blob object storage for production (MEDIA_STORAGE=cloud + BLOB_READ_WRITE_TOKEN).
 *   To use S3, Cloudinary or similar instead, reimplement `cloudStorage` with the same three methods.
 */
export interface MediaFile {
  url: string;
  name: string;
  folder: string;
  size: number;
}

export interface MediaStorage {
  readonly mode: 'local' | 'cloud';
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

/** Serverless hosts have no lasting disk, so local storage would lose uploads. */
function assertWritableDisk() {
  if (process.env.VERCEL) throw new Error('This host has no permanent disk. Set MEDIA_STORAGE=cloud and connect a Vercel Blob store.');
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

export function mediaStorage(): MediaStorage {
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
