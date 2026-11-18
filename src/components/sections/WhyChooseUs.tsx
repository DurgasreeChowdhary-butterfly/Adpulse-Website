import type { HomeContent } from '@/types/content';
import { CtaButton } from '@/components/ui/CtaButton';
import { pad } from '@/utils/format';
import { rich } from '@/utils/richText';

/** Keeps hyphenated words ("End-to-end") from breaking at the hyphen. */
function keepCompounds(title: string) {
  return title.split(/(\S*-\S*)/).map((part, i) => (part.includes('-') ? <span key={i} className="nobr">{part}</span> : part));
}

export function WhyChooseUs({ data }: { data: HomeContent['why'] }) {
  return (
    <section className="sec dark why" id="why">
      <div className="wrap why-grid">
        <div className="head rv">
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className="h2 kt kt-hl">{rich(data.title)}</h2>
          <p className="body">{data.description}</p>
          <CtaButton cta={data.cta} style={{ justifySelf: 'start', marginTop: 'var(--s-2)' }} />
          <div className="why-proof">
            <b className="num">
              {data.proof.value}
              <i>{data.proof.suffix}</i>
            </b>
            <span>{data.proof.label}</span>
          </div>
        </div>
        <div className="reasons" id="reasons">
          {data.principles.map((p, i) => (
            <article key={p.title} className="reason">
              <span className="n">{pad(i + 1)}</span>
              <h3>{keepCompounds(p.title)}</h3>
              <p>{p.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
