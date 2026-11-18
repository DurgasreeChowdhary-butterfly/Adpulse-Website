import type { HomeContent, SiteSettings } from '@/types/content';
import { CtaButton } from '@/components/ui/CtaButton';
import { Pulse } from '@/components/ui/Pulse';
import { rich } from '@/utils/richText';

/** Closing call to action, used at the bottom of every page. */
export function CtaSection({ cta, contact, labels }: { cta: HomeContent['cta']; contact: SiteSettings['contact']; labels: SiteSettings['contactLabels'] }) {
  return (
    <section className="sec cta dark" style={{ position: 'relative' }} id="contact" aria-labelledby="ctaH">
      <div className="wrap">
        <div className="inner rv">
          <span className="eyebrow">{cta.eyebrow}</span>
          <h2 className="h1 kt kt-mask" data-acc="chars" id="ctaH">
            {rich(cta.title)}
          </h2>
          <div className="cta-row">
            <p className="body">{cta.description}</p>
            <div className="btns">
              <CtaButton cta={cta.button} />
            </div>
          </div>
          <Pulse className="cta-pulse" />
          <div className="contact">
            <span>
              {labels.email} <b>{contact.email}</b>
            </span>
            <span>
              {labels.web} <b>{contact.website}</b>
            </span>
            <span>
              {labels.office} <b>{contact.shortAddress}</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
