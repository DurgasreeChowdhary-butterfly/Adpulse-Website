import type { TestimonialsContent } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';

/** Hidden until testimonials.json "enabled" is true and real quotes are added. */
export function Testimonials({ data }: { data: TestimonialsContent }) {
  if (!data.enabled || !data.items.length) return null;
  return (
    <section className="sec mist" id="testimonials">
      <div className="wrap">
        <SectionHead eyebrow={data.section.eyebrow} title={data.section.title} />
        <div className="quotes">
          {data.items.map((t) => (
            <figure className="quote" key={t.name + t.quote.slice(0, 10)}>
              <div className="stars" aria-label={`Rated ${t.rating} out of 5`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Icon key={i} name="i-star" />
                ))}
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                <span>
                  {t.role}, {t.company}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
