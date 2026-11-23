'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CaseStudiesContent } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { caseScene } from '@/utils/caseScenes';

interface Props {
  categories: CaseStudiesContent['categories'];
  items: CaseStudiesContent['items'];
  labels: { challenge: string; solution: string; sampleNote: string; cardLink: string; sample: string };
}

/** Filter chips + horizontal, snap-scrolling case study cards with arrows and a progress bar. */
export function CaseStudiesTrack({ categories, items, labels }: Props) {
  const [filter, setFilter] = useState(categories[0]?.key ?? 'all');
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = useMemo(() => items.filter((c) => filter === 'all' || c.category === filter), [items, filter]);
  const showSampleNote = list.some((c) => c.isSample);

  const update = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const n = Math.max(1, t.children.length);
    setProgress(max > 0 ? Math.max(1 / n, t.scrollLeft / max) : 1);
  }, []);

  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    update();
    addEventListener('resize', update);
    return () => removeEventListener('resize', update);
  }, [list, update]);

  const step = () => {
    const c = track.current?.querySelector<HTMLElement>('.case');
    return c ? c.offsetWidth + 24 : 500;
  };

  return (
    <>
      <div className="wrap">
        <div className="cs-controls">
          <div className="chips" role="group" aria-label="Filter case studies">
            {categories.map((c) => (
              <button key={c.key} className="chip" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="arrows">
            <button className="circ" id="prev" aria-label="Previous case study" onClick={() => track.current?.scrollBy({ left: -step(), behavior: 'smooth' })}>
              <Icon name="i-left" />
            </button>
            <button className="circ" id="next" aria-label="Next case study" onClick={() => track.current?.scrollBy({ left: step(), behavior: 'smooth' })}>
              <Icon name="i-arrow" />
            </button>
          </div>
        </div>
      </div>
      <div className="track" id="track" ref={track} tabIndex={0} aria-label="Case studies" onScroll={update}>
        {list.map((c, i) => (
          <article className="case" key={c.slug}>
            <div className="cv">
              {c.image ? (
                <img src={c.image} alt={c.imageAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
              ) : (
                <div className="scene" dangerouslySetInnerHTML={{ __html: caseScene(c.visual, `${filter}${i}`) }} />
              )}
              <span className="ind-tag">{c.industry}</span>
              <div className="res">
                {c.isSample && <span className="sample-tag">{labels.sample}</span>}
                <b className="num">{c.result.value}</b>
                <span>{c.result.label}</span>
              </div>
            </div>
            <div className="cb">
              <h3 className="h3" style={{ fontSize: 'clamp(20px,1.7vw,26px)' }}>
                {c.title}
              </h3>
              <dl>
                <div>
                  <dt>{labels.challenge}</dt>
                  <dd>{c.challenge}</dd>
                </div>
                <div>
                  <dt>{labels.solution}</dt>
                  <dd>{c.solution}</dd>
                </div>
              </dl>
              <div className="mets">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <b className="num">{m.value}</b>
                    <small>{m.label}</small>
                  </div>
                ))}
              </div>
              <Link className="link cb-link" href={`/case-studies/${c.slug}`}>
                {labels.cardLink} <Icon name="i-arrow" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="wrap cs-foot">
        <div className="prog">
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        {showSampleNote && <small>{labels.sampleNote}</small>}
      </div>
    </>
  );
}
