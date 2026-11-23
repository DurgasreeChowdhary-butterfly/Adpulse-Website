'use client';

import { Icon } from '@/components/ui/Icon';

/** Small footer button that scrolls back to the top (instantly when reduced motion is preferred). */
export function BackToTop({ label }: { label: string }) {
  const toTop = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // Move keyboard focus to the top as well, without a second scroll jump.
    document.querySelector<HTMLElement>('#hdr a')?.focus({ preventScroll: true });
  };
  return (
    <button type="button" className="to-top" aria-label={label} title={label} onClick={toTop}>
      <Icon name="i-up" />
    </button>
  );
}
