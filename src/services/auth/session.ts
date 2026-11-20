/**
 * Admin sessions. Runs in the proxy (src/proxy.ts) and in route handlers. Uses only Web Crypto, so it works on the Node.js and Edge runtimes.
 *
 * - The password lives only in the ADMIN_PASSWORD environment variable and is never sent to the browser.
 * - After a correct password, the browser gets an HTTP-only cookie holding a signed token
 *   (expiry + random id, HMAC-SHA256). JavaScript cannot read it; it cannot be forged without the key.
 * - The signing key comes from ADMIN_SESSION_SECRET, or is derived from ADMIN_PASSWORD, so changing
 *   either one logs everybody out.
 * - No ADMIN_PASSWORD = no admin access at all (fails closed).
 */

export const SESSION_COOKIE = 'adpulse_admin_session';
/** Session length: 8 hours, then sign in again. */
export const SESSION_MAX_AGE = 8 * 60 * 60;

const enc = new TextEncoder();

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(data: string, secret: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data)));
}

/** Constant-time comparison, so response timing reveals nothing about how close a guess was. */
function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

function signingSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SESSION_SECRET || `adpulse-admin-session:${password}`;
}

/** True when `input` is the admin password (compared in constant time). */
export async function checkPassword(input: unknown): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || typeof input !== 'string' || !input) return false;
  // Compare keyed hashes of equal length instead of the raw strings.
  const key = 'adpulse-password-check';
  return sameBytes(await sign(input, key), await sign(password, key));
}

/** A new signed session token. */
export async function createSessionToken(): Promise<string> {
  const secret = signingSecret();
  if (!secret) throw new Error('ADMIN_PASSWORD is not set.');
  const payload = b64url(
    enc.encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE, id: b64url(crypto.getRandomValues(new Uint8Array(16))) })),
  );
  return `${payload}.${b64url(await sign(payload, secret))}`;
}

/** True when the token is genuine and not expired. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = signingSecret();
  if (!secret || !token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  try {
    if (!sameBytes(await sign(payload, secret), fromB64url(signature))) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Cookie settings: HTTP-only, same-site only, HTTPS-only in production. */
export function sessionCookie(value: string, maxAge = SESSION_MAX_AGE) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

/**
 * True when `source` (an Origin or Referer value) is this site.
 * Compared with the Host header and, behind a reverse proxy (e.g. Hostinger), X-Forwarded-Host.
 * Browsers cannot set X-Forwarded-Host on cross-site requests, so this still blocks cross-site posts.
 */
export function fromThisSite(source: string | null | undefined, headers: Headers): boolean {
  if (!source) return false;
  let host: string;
  try {
    host = new URL(source).host.toLowerCase();
  } catch {
    return false;
  }
  const hosts = [headers.get('host'), ...(headers.get('x-forwarded-host')?.split(',') ?? [])].map((h) => h?.trim().toLowerCase()).filter(Boolean);
  return hosts.includes(host);
}

/** Only allow redirects back into the admin (never to another site). */
export function safeNext(next: string | null | undefined): string {
  return next && /^\/admin(\/[\w\-/]*)?$/.test(next) && !next.startsWith('/admin/login') ? next : '/admin';
}
