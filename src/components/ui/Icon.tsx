import type { CSSProperties } from 'react';

/** Renders an icon from the sprite in /public/icons.svg (ids like "i-arrow", "s-seo", "so-ig"). */
export function Icon({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
