import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { CtaLink } from '@/types/content';
import { Icon } from './Icon';

interface Props {
  cta: CtaLink;
  variant?: 'primary' | 'ghost' | 'light';
  arrow?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One button for every call to action.
 * action "audit" opens the free-audit modal (handled globally by AuditModal); otherwise it is a link.
 */
export function CtaButton({ cta, variant = 'primary', arrow = variant === 'primary', className = '', style }: Props) {
  const cls = `btn btn-${variant} ${className}`.trim();
  const content = (
    <>
      {cta.label}
      {arrow && <Icon name="i-arrow" />}
    </>
  );
  if (cta.action === 'audit' || !cta.href) {
    return (
      <button type="button" className={cls} style={style} data-audit>
        {content}
      </button>
    );
  }
  return (
    <Link className={cls} style={style} href={cta.href}>
      {content}
    </Link>
  );
}
