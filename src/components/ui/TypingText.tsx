'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Types a phrase, holds it, deletes it, then types the next one.
 * Runs only while visible and while the tab is active. Shows the first phrase statically
 * when the user prefers reduced motion. Screen readers get the full list via the parent's aria-label.
 */
export function TypingText({ phrases }: { phrases: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(phrases[0] ?? '');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || phrases.length < 2) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let wi = 0;
    let ci = phrases[0].length;
    let del = false;
    let timer: number | null = null;
    let visible = false;

    const step = () => {
      const w = phrases[wi];
      if (!del) {
        if (ci < w.length) {
          setText(w.slice(0, ++ci));
          setTyping(true);
          timer = window.setTimeout(step, 62 + Math.random() * 48);
        } else {
          setTyping(false);
          del = true;
          timer = window.setTimeout(step, 1900);
        }
      } else if (ci > 0) {
        setText(w.slice(0, --ci));
        setTyping(true);
        timer = window.setTimeout(step, 30);
      } else {
        del = false;
        wi = (wi + 1) % phrases.length;
        setTyping(false);
        timer = window.setTimeout(step, 320);
      }
    };
    const go = () => {
      if (timer === null && visible && !document.hidden) timer = window.setTimeout(step, 1400);
    };
    const stop = () => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      setTyping(false);
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) go();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : go());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [phrases]);

  return (
    <span ref={ref} className={`typer${typing ? ' typing' : ''}`} aria-hidden="true">
      <span className="typed">{text}</span>
      <span className="caret" />
    </span>
  );
}
