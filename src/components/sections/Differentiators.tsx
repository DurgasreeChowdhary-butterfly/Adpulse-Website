import type { HomeContent } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';
import { pad } from '@/utils/format';

export function Differentiators({ data }: { data: HomeContent['differentiators'] }) {
  return (
    <section className="sec diff-sec" aria-labelledby="dfH">
      <div className="wrap">
        <SectionHead id="dfH" eyebrow={data.eyebrow} title={data.title} description={data.description} />
        <div className="diff-grid">
          <article className="feature rv">
            <div>
              <span className="tag">{data.feature.tag}</span>
              <h3>{data.feature.title}</h3>
              <p>{data.feature.text}</p>
            </div>
            <div className="actions" aria-label="Example of recent AI actions">
              {data.feature.actions.map((a) => (
                <div key={a.text}>
                  <i>
                    <Icon name={a.icon} />
                  </i>
                  <span>{a.text}</span>
                  <time>{a.time}</time>
                </div>
              ))}
            </div>
          </article>
          <div className="points">
            {data.points.map((p, i) => (
              <article key={p.title} className="point rv" data-n={pad(i + 2)}>
                <span className="ic">
                  <Icon name={p.icon} />
                </span>
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
