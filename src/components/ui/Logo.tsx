import type { CSSProperties } from 'react';

/** The Adpulse logo. Its colour follows the CSS `color` of the parent (navy on light, white on dark). */
export function Logo({ className = 'brand', style, label }: { className?: string; style?: CSSProperties; label?: string }) {
  return (
    <svg className={className} style={style} viewBox="0 0 690 186" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <use href="/brand/logo.svg#adp-logo" width="690" height="186" />
    </svg>
  );
}
