import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CtaLink } from '@/types/content';
import { CtaButton } from '@/components/ui/CtaButton';
import { rich } from '@/utils/richText';

interface Props {
  crumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  kinetic?: 'kt-lines' | 'kt-chars' | 'kt-mask' | 'kt-rise';
  description?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** Optional right-hand visual; without it the heading sits left and the description + actions right */
  aside?: ReactNode;
}

/** Dark header used by every inner page. */
export function PageHero({ crumbs, eyebrow, title, kinetic = 'kt-lines', description, primaryCta, secondaryCta, aside }: Props) {
  const head = (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.label} style={{ display: 'contents' }}>
            {i > 0 && <i>/</i>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className={`h1 kt ${kinetic}`}>{rich(title)}</h1>
    </>
  );
  const rest = (
    <>
      {description && <p className="body">{description}</p>}
      {(primaryCta || secondaryCta) && (
        <div className="ph-cta">
          {primaryCta && <CtaButton cta={primaryCta} />}
          {secondaryCta && <CtaButton cta={secondaryCta} variant="ghost" />}
        </div>
      )}
    </>
  );

  // With a visual: copy left, visual right. Without one: heading left, description + actions right.
  return (
    <section className={`page-hero dark${aside ? '' : ' solo'}`}>
      {aside ? (
        <div className="wrap ph-grid">
          <div>
            {head}
            {rest}
          </div>
          {aside}
        </div>
      ) : (
        <div className="wrap ph-grid solo">
          <div className="ph-main">{head}</div>
          <div className="ph-side">{rest}</div>
        </div>
      )}
    </section>
  );
}
