import type { ServicesContent } from '@/types/content';
import { TypingText } from '@/components/ui/TypingText';
import { ServiceCard } from './ServiceCard';

/** `showHead={false}` hides the section heading where the page hero already says the same thing. */
export function ServicesSection({ data, showHead = true }: { data: ServicesContent; showHead?: boolean }) {
  const s = data.section;
  const spoken = `${s.headingLead} ${s.typedPhrases.map((p) => p.replace(/\.$/, '')).join(', ')}.`;
  return (
    <section className="sec mist" id="services">
      <div className="wrap">
        {showHead && (
          <div className="svc-head rv">
            <span className="svc-count num" aria-hidden="true">
              {s.count}
            </span>
            <div className="head">
              <span className="eyebrow">{s.eyebrow}</span>
              <h2 className="h2 typer-h" aria-label={spoken}>
                <span aria-hidden="true">{s.headingLead}</span>
                <TypingText phrases={s.typedPhrases} />
              </h2>
            </div>
            <p className="body">{s.description}</p>
          </div>
        )}
        <div className="svc-grid" id="svcGrid">
          {data.items.map((svc) => (
            <ServiceCard key={svc.slug} service={svc} linkLabel={s.cardLinkLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
