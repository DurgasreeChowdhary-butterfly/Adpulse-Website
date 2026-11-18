import type { AboutContent } from '@/types/content';
import { Pulse } from '@/components/ui/Pulse';
import { rich } from '@/utils/richText';

const ROMAN = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.'];

export function AboutSection({ about }: { about: AboutContent }) {
  return (
    <section className="sec mist about" id="about">
      <div className="wrap">
        <div className="ab-top">
          <span className="eyebrow">{about.eyebrow}</span>
          <small>{about.location}</small>
        </div>
        <h2 className="ab-statement kt kt-rise" data-acc="wipe">
          {rich(about.title)}
        </h2>
        <div className="ab-grid">
          <figure className="ab-photo img-rv" data-par="">
            <img src={about.image} alt={about.imageAlt} decoding="async" loading="lazy" />
            <figcaption className="glasscard">
              <small>{about.imageBadge.label}</small>
              <b className="num">{about.imageBadge.value}</b>
              <span>{about.imageBadge.note}</span>
            </figcaption>
          </figure>
          <div className="ab-copy rv">
            <p className="body">{about.description}</p>
            <ul className="ab-list">
              {about.beliefs.map((b, i) => (
                <li key={b.title}>
                  <i>{ROMAN[i] ?? `${i + 1}.`}</i>
                  <span>
                    <b>{b.title}</b> {b.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ledger-wrap rv">
          <Pulse className="ledger-pulse" />
          <div className="ledger">
            {about.stats.map((s) => (
              <div key={s.label}>
                <b className="num">
                  <span data-count={s.value} data-dec={s.decimals ?? 0}>
                    {s.value.toFixed(s.decimals ?? 0)}
                  </span>
                  {s.suffix && <i>{s.suffix}</i>}
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
