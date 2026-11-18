/**
 * Scroll reveals.
 * Anything already on screen stays visible; only elements below the fold are "armed"
 * (class `pre`) and revealed once when they enter the viewport.
 * Containers listed in GROUPS reveal their children in sequence (class `kids` + `k`).
 */

const GROUPS: [container: string, children: string][] = [
  ['.ab-top', ':scope>*'],
  ['.head-row', '.eyebrow,.body'],
  ['.svc-head', '.svc-count,.eyebrow,.h2,.body'],
  ['.why .head', '.eyebrow,.body,.btn,.why-proof'],
  ['.ab-copy', '.body,.ab-list li'],
  ['.ledger', '.ledger>div'],
  ['.points', '.point'],
  ['#reasons', '.reason'],
  ['#svcGrid', '.scard'],
  ['.cl-quiet', ':scope>*'],
  ['#track', '.case'],
  ['.cta .inner', '.eyebrow,.cta-row .body,.cta-row .btns,.cta-pulse,.contact'],
  ['.incl', ':scope>article'],
  ['.steps', '.step'],
  ['.ind-grid', '.ind'],
  ['.svc-grid.others', '.scard'],
  ['.posts', '.post'],
];

export function countUp(el: HTMLElement) {
  const end = parseFloat(el.dataset.count || '0');
  const dec = Number(el.dataset.dec || 0);
  const t0 = performance.now();
  const tick = (t: number) => {
    const p = Math.min(1, (t - t0) / 1400);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = (end * e).toFixed(dec);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function reveal(el: HTMLElement) {
  el.classList.add('revealing');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      el.classList.remove('pre');
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    }),
  );
  const n = el.querySelectorAll('.k').length;
  window.setTimeout(() => el.classList.remove('revealing'), 1300 + n * 90);
}

/** Arms every reveal inside `root`. Returns a cleanup function. */
export function initReveals(root: ParentNode = document): () => void {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return () => {};

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          reveal(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
  );
  const below = (el: Element) => el.getBoundingClientRect().top > innerHeight * 0.92;
  const arm = (el: HTMLElement) => {
    el.dataset.armed = '1';
    el.classList.add('pre');
    io.observe(el);
  };

  GROUPS.forEach(([sel, kids]) =>
    root.querySelectorAll<HTMLElement>(sel).forEach((c) => {
      if (c.dataset.armed || !below(c)) return;
      c.querySelectorAll<HTMLElement>(kids).forEach((k, i) => {
        k.classList.add('k');
        k.classList.remove('rv');
        k.style.setProperty('--i', String(i));
      });
      if (c.matches('.ledger')) c.closest('.ledger-wrap')?.classList.remove('rv');
      c.classList.add('kids');
      c.classList.remove('rv');
      arm(c);
    }),
  );
  root.querySelectorAll<HTMLElement>('.img-rv').forEach((el) => {
    if (!el.dataset.armed && below(el)) arm(el);
  });
  root.querySelectorAll<HTMLElement>('.rv').forEach((el) => {
    if (!el.dataset.armed && below(el) && !el.closest('.kids')) arm(el);
  });

  return () => io.disconnect();
}
