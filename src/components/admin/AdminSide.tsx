'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Admin sidebar shell. On desktop it is the fixed left column; below 860px it collapses
 * into a compact top bar with a Menu button that opens the navigation as a drawer.
 */
export function AdminSide({ brand, children }: { brand: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer after navigating
  useEffect(() => setOpen(false), [pathname]);

  return (
    <aside className="adm-side" data-open={open || undefined}>
      <div className="adm-bar">
        {brand}
        <button type="button" className="adm-toggle" aria-expanded={open} aria-controls="adm-drawer" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div className="adm-drawer" id="adm-drawer">
        {children}
      </div>
    </aside>
  );
}
