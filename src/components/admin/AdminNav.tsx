'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_SECTIONS } from '@/admin/sections';
import { Icon } from '@/components/ui/Icon';

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="adm-nav">
      {ADMIN_SECTIONS.map((s) => {
        const href = s.slug ? `/admin/${s.slug}` : '/admin';
        const on = s.slug ? pathname.startsWith(href) : pathname === '/admin';
        return (
          <Link key={href} href={href} className={on ? 'on' : undefined}>
            <Icon name={s.icon} />
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
