import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminSide } from '@/components/admin/AdminSide';
import { Logo } from '@/components/ui/Logo';
import { SESSION_COOKIE, verifySessionToken } from '@/services/auth/session';
import { writesAllowed } from '@/services/content/admin';

export const dynamic = 'force-dynamic';

/** The signed-in admin panel: sidebar + content. */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Second check behind proxy.ts: the panel never renders without a valid session.
  if (!(await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value))) redirect('/admin/login');

  const source = { db: 'Database', api: 'Backend API' }[process.env.CONTENT_SOURCE ?? ''] ?? 'JSON files (src/data)';
  return (
    <div className="adm">
      <AdminSide
        brand={
          <div className="adm-brand">
            <Logo />
            <span>Admin</span>
          </div>
        }
      >
        <AdminNav />
        <div className="adm-foot">
          <span>Content source: {source}</span>
          <span>Saving: {writesAllowed() ? 'enabled' : 'disabled'}</span>
          <a href="/" target="_blank" rel="noreferrer">
            Open website ↗
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="adm-logout">
              Log out
            </button>
          </form>
        </div>
      </AdminSide>
      <div className="adm-main">{children}</div>
    </div>
  );
}
