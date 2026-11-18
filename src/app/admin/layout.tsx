import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Shared by the login page and the signed-in panel ((panel)/layout.tsx). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
