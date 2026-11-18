import { NextResponse } from 'next/server';
import { sessionCookie } from '@/services/auth/session';

export const dynamic = 'force-dynamic';

/** POST -> deletes the session cookie and returns to the login page (works as a plain form post). */
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/admin/login?signedOut=1', req.url), 303);
  res.cookies.set(sessionCookie('', 0));
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
