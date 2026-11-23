import type { CaseStudiesContent } from '@/types/content';
import { SectionHead } from '@/components/ui/SectionHead';
import { CtaButton } from '@/components/ui/CtaButton';
import { CaseStudyCard } from './CaseStudyCard';

/**
 * Homepage case studies: the same cards as the Case Studies page, for the studies marked
 * "Show on homepage" in the admin, with a link to the full list.
 */
export function CaseStudiesSection({ data, id = 'work' }: { data: CaseStudiesContent; id?: string }) {
  const s = data.section;
  return (
    <section className="sec cs-home" id={id}>
      <div className="wrap">
        <SectionHead eyebrow={s.eyebrow} title={s.title} kinetic="kt-lines" description={s.description} />
        <div className="svc-grid cs-grid">
          {data.items.map((c) => (
            <CaseStudyCard key={c.slug} study={c} linkLabel={s.cardLinkLabel} sampleLabel={s.sampleLabel} />
          ))}
        </div>
        {data.items.some((c) => c.isSample) && <p className="cs-note">{s.sampleNote}</p>}
        <div className="cs-home-foot">
          <CtaButton cta={{ label: s.viewAllLabel, href: '/case-studies' }} variant="ghost" arrow />
        </div>
      </div>
    </section>
  );
}
