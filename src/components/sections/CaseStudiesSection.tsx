import type { CaseStudiesContent } from '@/types/content';
import { SectionHead } from '@/components/ui/SectionHead';
import { CaseStudiesTrack } from './CaseStudiesTrack';

/** `showHead={false}` hides the section heading where the page hero already says the same thing. */
export function CaseStudiesSection({ data, id = 'work', showHead = true }: { data: CaseStudiesContent; id?: string; showHead?: boolean }) {
  const s = data.section;
  return (
    <section className="sec dark cases" id={id}>
      {showHead && (
        <div className="wrap">
          <SectionHead eyebrow={s.eyebrow} title={s.title} kinetic="kt-lines" description={s.description} />
        </div>
      )}
      <CaseStudiesTrack
        categories={data.categories}
        items={data.items}
        labels={{ challenge: s.challengeLabel, solution: s.solutionLabel, sampleNote: s.sampleNote }}
      />
    </section>
  );
}
