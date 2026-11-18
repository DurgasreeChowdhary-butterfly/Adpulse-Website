import { NextResponse } from 'next/server';
import { adminConfigured, checkPassword, createSessionToken, safeNext, sessionCookie } from '@/services/auth/session';

export const dynamic = 'force-dynamic';

/** Failed attempts per client (per server instance): 5 tries, then a 15-minute pause. */
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; until: number }>();

const clientId = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

/** POST { password, next? } -> sets the HTTP-only session cookie. The password never leaves the server. */
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'Admin access is disabled because ADMIN_PASSWORD is not set on the server.' }, { status: 503 });
  }

  const id = clientId(req);
  const record = fails.get(id);
  if (record && record.until > Date.now()) {
    const minutes = Math.ceil((record.until - Date.now()) / 60000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }, { status: 429, headers: { 'Retry-After': String(minutes * 60) } });
  }

  const body = await req.json().catch(() => null);
  if (!(await checkPassword(body?.password))) {
    const count = (record && record.until <= Date.now() && record.count >= MAX_FAILS ? 0 : record?.count ?? 0) + 1;
    fails.set(id, { count, until: count >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  fails.delete(id);
  const res = NextResponse.json({ ok: true, redirect: safeNext(body?.next) });
  res.cookies.set(sessionCookie(await createSessionToken()));
  return res;
}
