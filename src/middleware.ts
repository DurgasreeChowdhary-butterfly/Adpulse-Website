import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, adminConfigured, verifySessionToken } from '@/services/auth/session';

/**
 * Protects every /admin page and /api/admin endpoint with the admin session cookie
 * (same rules in development and production).
 * - Not signed in: pages redirect to /admin/login, APIs answer 401.
 * - ADMIN_PASSWORD not set: nobody can sign in (the login page explains why).
 * - Admin writes must come from this site (blocks cross-site form posts).
 */
const PUBLIC_PATHS = ['/admin/login', '/api/admin/login', '/api/admin/logout'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith('/api/admin');

  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== req.headers.get('host')) {
      return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 });
    }
  }

  const signedIn = adminConfigured() && (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value));

  if (PUBLIC_PATHS.includes(pathname)) {
    // Already signed in: skip the login page.
    if (pathname === '/admin/login' && signedIn) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (signedIn) return NextResponse.next();

  if (isApi) {
    return NextResponse.json(
      { error: adminConfigured() ? 'Your session has expired or you are not signed in. Sign in again at /admin/login.' : 'Admin access is disabled (ADMIN_PASSWORD is not set).' },
      { status: 401 },
    );
  }
  const login = new URL('/admin/login', req.url);
  if (pathname !== '/admin') login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'] };
