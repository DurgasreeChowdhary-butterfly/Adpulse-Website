import type { CSSProperties } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
  /** Accessible name; without it the logo is decorative (e.g. inside a labelled link) */
  label?: string;
  /** Optional uploaded logos (Website Settings → Brand). Each empty one uses the built-in logo. */
  src?: string | null;
  srcOnDark?: string | null;
  /**
   * Background the logo sits on. "auto" (header) swaps between the dark and light versions
   * when the header turns solid; "dark" and "light" always show one version.
   */
  tone?: 'auto' | 'dark' | 'light';
}

/**
 * The Adpulse logo. The built-in version (public/brand/logo.svg) keeps its orange mark,
 * and its wordmark follows the CSS `color` of the parent (navy on light, white on dark).
 */
export function Logo({ className = 'brand', style, label, src, srcOnDark, tone = 'dark' }: Props) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  const builtIn = (cls: string) => (
    <svg className={cls} viewBox="0 0 718 173" {...(tone === 'auto' && (src || srcOnDark) ? { 'aria-hidden': true } : a11y)}>
      <use href="/brand/logo.svg#adp-logo" width="718" height="173" />
    </svg>
  );
  const image = (url: string, cls: string) => (
    <img className={cls} src={url} alt={tone === 'auto' ? '' : (label ?? '')} decoding="async" />
  );
  const version = (dark: boolean, cls: string) => {
    const url = dark ? srcOnDark : src;
    return url ? image(url, cls) : builtIn(cls);
  };

  if (tone !== 'auto') return <span className={`${className} brand-box`} style={style}>{version(tone === 'dark', 'brand-art')}</span>;
  // Header with only the built-in logo: one SVG whose wordmark colour transitions with the header.
  if (!src && !srcOnDark) return <span className={`${className} brand-box`} style={style}>{builtIn('brand-art')}</span>;
  return (
    <span className={`${className} brand-box brand-swap`} style={style} {...a11y}>
      {version(true, 'brand-art on-dark')}
      {version(false, 'brand-art on-light')}
    </span>
  );
}
