import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/ui/Logo';
import { adminConfigured, safeNext } from '@/services/auth/session';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ next?: string; signedOut?: string }> }) {
  const searchParams = await searchParamsPromise;
  return (
    <main className="adm-login">
      <div className="adm-login-box">
        <div className="adm-login-brand">
          <Logo label="Adpulse" />
          <span>Admin</span>
        </div>
        <div className="adm-login-card">
          <h1>Sign in</h1>
          <p>Enter the admin password to manage the website content.</p>
          <LoginForm configured={adminConfigured()} next={safeNext(searchParams.next)} signedOut={searchParams.signedOut === '1'} />
        </div>
        <a className="adm-login-back" href="/">
          ← Back to website
        </a>
      </div>
    </main>
  );
}
