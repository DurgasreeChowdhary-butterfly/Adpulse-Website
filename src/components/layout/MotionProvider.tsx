'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { initReveals } from '@/utils/motion/reveal';
import { initKinetic } from '@/utils/motion/kinetic';
import { initPulses, initPhotoDrift, initHeroDepth } from '@/utils/motion/ambient';

/**
 * Runs the site's motion system after each page renders.
 * Server-rendered markup is complete without it; this only adds reveal and movement.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const main = document.querySelector('main');
    if (!main) return;
    // Wait one frame so layout (and any hash scroll) has settled before measuring positions.
    let cleanups: (() => void)[] = [];
    const id = requestAnimationFrame(() => {
      cleanups = [initKinetic(main), initReveals(main), initPulses(main), initPhotoDrift(main), initHeroDepth(main)];
    });
    return () => {
      cancelAnimationFrame(id);
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
