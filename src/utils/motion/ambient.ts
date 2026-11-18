/**
 * Ambient motion: the pulse line drawing, the About photo drift, and the hero card depth.
 * Each returns a cleanup function.
 */

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Draws `.pulse` lines when they scroll into view. */
export function initPulses(root: ParentNode = document) {
  const pulses = root.querySelectorAll<SVGElement>('.pulse');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    pulses.forEach((p) => p.classList.add('go'));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('go');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.4 },
  );
  pulses.forEach((p) => io.observe(p));
  return () => io.disconnect();
}

/** Very slight vertical drift for large editorial photos marked [data-par]. */
export function initPhotoDrift(root: ParentNode = document) {
  if (reducedMotion()) return () => {};
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('[data-par] img'));
  if (!imgs.length) return () => {};
  let ticking = false;
  const drift = () => {
    ticking = false;
    imgs.forEach((img) => {
      const r = (img.parentElement as HTMLElement).getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.transform = `translateY(${(-p * 5).toFixed(2)}%)`;
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(drift);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  drift();
  return () => removeEventListener('scroll', onScroll);
}

/** Hero cards shift a few pixels with the pointer, at different depths. */
export function initHeroDepth(root: ParentNode = document) {
  const hc = root.querySelector<HTMLElement>('.hc');
  const hero = root.querySelector<HTMLElement>('.hero');
  if (!hc || !hero || reducedMotion() || !matchMedia('(pointer:fine)').matches) return () => {};
  let raf = 0;
  const move = (e: PointerEvent) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = hero.getBoundingClientRect();
      hc.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hc.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  };
  const leave = () => {
    hc.style.setProperty('--mx', '0');
    hc.style.setProperty('--my', '0');
  };
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', leave);
  return () => {
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', leave);
  };
}
