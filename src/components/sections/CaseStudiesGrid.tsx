'use client';

import { useState } from 'react';
import type { CaseStudiesContent } from '@/types/content';
import { CaseStudyCard } from './CaseStudyCard';

/** Case studies page: filter chips and a card grid in the same layout as the services. */
export function CaseStudiesGrid({ data }: { data: CaseStudiesContent }) {
  const [filter, setFilter] = useState(data.categories[0]?.key ?? 'all');
  const list = data.items.filter((c) => filter === 'all' || c.category === filter);
  const showSampleNote = list.some((c) => c.isSample);
  // Only tabs that have case studies; no tab row at all when there is nothing to filter.
  const used = data.categories.filter((c) => c.key !== 'all' && data.items.some((it) => it.category === c.key));
  const chips = data.categories.filter((c) => c.key === 'all' || used.includes(c));

  return (
    <section className="sec mist cs-list" id="work">
      <div className="wrap">
        {used.length > 1 && (
          <div className="chips on-light" role="group" aria-label="Filter case studies">
            {chips.map((c) => (
              <button key={c.key} className="chip" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div className="svc-grid cs-grid" aria-live="polite">
          {list.map((c) => (
            <CaseStudyCard key={c.slug} study={c} linkLabel={data.section.cardLinkLabel} sampleLabel={data.section.sampleLabel} />
          ))}
        </div>
        {showSampleNote && <p className="cs-note">{data.section.sampleNote}</p>}
      </div>
    </section>
  );
}
