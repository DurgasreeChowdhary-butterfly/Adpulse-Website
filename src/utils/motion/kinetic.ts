/**
 * Kinetic typography for headings with class `kt` plus one style:
 *   kt-mask   words rise from behind a mask (hero, final CTA)
 *   kt-rise   words fade up from a soft blur (About, section headings)
 *   kt-lines  each line rises as a group (case studies, industries)
 *   kt-chars  letter by letter (service page titles)
 *   kt-hl     whole heading fades in, then the ==highlighted== word takes the accent
 * Options via data attributes:
 *   data-acc="after" | "wipe" | "chars"   how the accent/emphasis animates
 *   data-base="160"                        start delay in ms
 * Headings are only split on the client, after hydration, and only when motion is allowed.
 */

type KtState = { words: HTMLElement[]; accs: HTMLElement[]; mode: 'chars' | 'words'; acc: string };
type KtEl = HTMLElement & { _kt?: KtState };

function prep(el: KtEl) {
  if (el.dataset.kt) return;
  el.dataset.kt = '1';
  el.setAttribute('aria-label', (el.textContent || '').replace(/\s+/g, ' ').trim());
  const mode = el.classList.contains('kt-chars') ? 'chars' : 'words';
  const acc = el.dataset.acc || '';
  const words: HTMLElement[] = [];
  const accs: HTMLElement[] = [];

  const walk = (node: Node, inAcc: boolean) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent || '').split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.append(' ');
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          if (mode === 'chars' || (inAcc && acc === 'chars')) {
            wi.classList.add('wc');
            w.classList.add('cw');
            Array.from(p).forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              wi.append(c);
            });
          } else wi.textContent = p;
          if (inAcc) w.classList.add('acc');
          w.append(wi);
          frag.append(w);
          (inAcc ? accs : words).push(wi);
        });
        (n as ChildNode).replaceWith(frag);
      } else if (n.nodeType === 1 && !(n as Element).classList.contains('br')) {
        const isAcc = (n as Element).matches('.accent,em');
        if (isAcc && acc === 'wipe') {
          (n as Element).classList.add('wipe');
          accs.push(n as HTMLElement);
          return;
        }
        walk(n, inAcc || isAcc);
      }
    });
  };
  walk(el, false);
  el._kt = { words, accs, mode, acc };
}

function play(el: KtEl) {
  const raf2 = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
  if (el.classList.contains('kt-hl')) return raf2(() => el.classList.add('in'));
  const k = el._kt;
  if (!k) return;
  const base = Number(el.dataset.base || 0);
  const chars = (wi: HTMLElement) => wi.querySelectorAll<HTMLElement>('.c');
  let t = base;

  if (el.classList.contains('kt-lines')) {
    let top: number | null = null;
    let line = -1;
    [...k.words, ...k.accs].forEach((wi) => {
      const parent = wi.parentElement as HTMLElement;
      const y = Math.round(parent.offsetTop);
      if (y !== top) {
        top = y;
        line++;
      }
      wi.style.setProperty('--d', String(base + line * 150 + ((parent.offsetLeft / 12) | 0)));
    });
  } else if (k.mode === 'chars') {
    k.words.forEach((wi) =>
      chars(wi).forEach((c) => {
        c.style.setProperty('--d', String(t));
        t += 24;
      }),
    );
  } else {
    const step = el.classList.contains('kt-rise') ? 42 : 58;
    k.words.forEach((wi) => {
      wi.style.setProperty('--d', String(t));
      t += step;
    });
    k.accs.forEach((a) => {
      if (a.classList.contains('wipe')) {
        a.style.setProperty('--d', String(t + 120));
        return;
      }
      if (k.acc === 'chars') {
        t += 60;
        chars(a).forEach((c) => {
          c.style.setProperty('--d', String(t));
          t += 38;
        });
        return;
      }
      a.style.setProperty('--d', String(t + 90));
      t += step;
    });
  }
  raf2(() => el.classList.add('in'));
}

/** Prepares and plays every kinetic heading in `root`. Returns a cleanup function. */
export function initKinetic(root: ParentNode = document): () => void {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return () => {};
  document.documentElement.classList.add('kt-on');

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          play(e.target as KtEl);
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.35, rootMargin: '0px 0px -8% 0px' },
  );

  root.querySelectorAll<KtEl>('.kt:not([data-kt])').forEach((el) => {
    if (el.classList.contains('kt-hl')) el.dataset.kt = '1';
    else prep(el);
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.9 && r.bottom > 0) play(el);
    else io.observe(el);
  });
  return () => io.disconnect();
}
