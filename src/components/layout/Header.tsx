'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Navigation, Service } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { CtaButton } from '@/components/ui/CtaButton';
import { useScrolled } from '@/hooks/useScrolled';

interface Props {
  nav: Navigation['header'];
  services: Pick<Service, 'slug' | 'title' | 'summary' | 'icon'>[];
}

/** Fixed header: transparent over dark heroes, white once scrolled. Services dropdown + mobile drawer. */
export function Header({ nav, services }: Props) {
  const pathname = usePathname();
  const solid = useScrolled(40);
  const [ddOpen, setDdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const ddBtn = useRef<HTMLButtonElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setDdOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (drawerOpen) setDrawerOpen(false);
      else if (ddOpen) {
        setDdOpen(false);
        ddBtn.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#dd,#ddBtn')) setDdOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [ddOpen, drawerOpen]);

  const hoverOpen = useCallback(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDdOpen(true);
  }, []);
  const hoverClose = useCallback(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    closeTimer.current = window.setTimeout(() => setDdOpen(false), 160);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const currentService = pathname.startsWith('/services/') ? pathname.split('/')[2] : null;

  return (
    <>
      <header className={`hdr${solid ? ' solid' : ''}`} id="hdr">
        <div className="wrap nav">
          <Link href="/" aria-label="Adpulse home">
            <Logo />
          </Link>
          <ul className="menu" id="menu">
            {nav.items.map((item) =>
              item.dropdown === 'services' ? (
                <li key={item.label} onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
                  <button
                    ref={ddBtn}
                    className={`dd-trigger${isActive(item.href) ? ' on' : ''}`}
                    id="ddBtn"
                    aria-expanded={ddOpen}
                    aria-controls="dd"
                    onClick={() => setDdOpen((o) => !o)}
                  >
                    {item.label} <Icon name="i-chev" />
                  </button>
                </li>
              ) : (
                <li key={item.label}>
                  <Link href={item.href} className={isActive(item.href) ? 'on' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div
            className={`dd${ddOpen ? ' open' : ''}`}
            id="dd"
            aria-label="Services"
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverClose}
            onClick={(e) => (e.target as Element).closest('a,button') && setDdOpen(false)}
          >
            <div className="dd-grid">
              {services.map((s) => (
                <Link key={s.slug} className={`dd-item${currentService === s.slug ? ' cur' : ''}`} href={`/services/${s.slug}`}>
                  <span className="ic">
                    <Icon name={s.icon} />
                  </span>
                  <span>
                    <b>{s.title}</b>
                    <small>{s.summary}</small>
                  </span>
                </Link>
              ))}
            </div>
            <div className="dd-foot">
              <Link href={nav.dropdown.allHref}>
                {nav.dropdown.allLabel} <Icon name="i-arrow" />
              </Link>
              <span>
                {nav.dropdown.hint} <button data-audit>{nav.dropdown.ctaLabel}</button>
              </span>
            </div>
          </div>
          <CtaButton cta={nav.cta} arrow={false} />
          <button
            className="burger"
            id="burger"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="i-menu" />
          </button>
        </div>
      </header>

      <div className="drawer" id="drawer" hidden={!drawerOpen} onClick={(e) => (e.target as Element).closest('a,[data-audit]') && setDrawerOpen(false)}>
        <div className="drawer-top">
          <Logo style={{ color: '#fff' }} />
          <button className="burger" style={{ display: 'inline-flex' }} aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon name="i-x" />
          </button>
        </div>
        <nav>
          <Link href="/">{nav.homeLabel}</Link>
          {nav.items.map((item) =>
            item.dropdown === 'services' ? (
              <div key={item.label} style={{ display: 'contents' }}>
                <button className="sub-toggle" aria-expanded={subOpen} aria-controls="dSub" onClick={() => setSubOpen((o) => !o)}>
                  {item.label} <Icon name="i-chev" />
                </button>
                <div className={`sub${subOpen ? ' open' : ''}`} id="dSub">
                  <div>
                    {services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`}>
                        <Icon name={s.icon} />
                        {s.title}
                      </Link>
                    ))}
                    <Link className="all" href={nav.dropdown.allHref}>
                      {nav.dropdown.allLabel} →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <CtaButton cta={nav.mobileCta} style={{ alignSelf: 'flex-start' }} />
      </div>
    </>
  );
}
