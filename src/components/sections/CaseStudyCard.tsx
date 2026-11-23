import Link from 'next/link';
import type { CaseStudy } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { caseScene } from '@/utils/caseScenes';

/** Case study card in the style of the service cards: title, image, headline result, link to the detail page. */
export function CaseStudyCard({ study, linkLabel, sampleLabel }: { study: CaseStudy; linkLabel: string; sampleLabel: string }) {
  return (
    <Link className="scard ccard" href={`/case-studies/${study.slug}`}>
      <h3>{study.title}</h3>
      <span className="art photo">
        {study.image ? (
          <img src={study.image} alt={study.imageAlt} decoding="async" loading="lazy" />
        ) : (
          <span className="scene" dangerouslySetInnerHTML={{ __html: caseScene(study.visual, `c-${study.slug}`) }} />
        )}
        {study.industry && <span className="ind-tag">{study.industry}</span>}
      </span>
      {(study.result.value || study.result.label) && (
        <p className="cc-res">
          {study.isSample && <span className="sample-tag">{sampleLabel}</span>}
          {study.result.value && <b className="num">{study.result.value}</b>} {study.result.label}
        </p>
      )}
      <span className="go">
        {linkLabel} <Icon name="i-arrow" />
      </span>
    </Link>
  );
}
