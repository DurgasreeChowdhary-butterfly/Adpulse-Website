import type { Client, ClientsContent } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { rich } from '@/utils/richText';

function LogoTile({ client }: { client: Client }) {
  const inner = (
    <>
      {client.logo ? (
        <img src={client.logo} alt={client.name} style={{ maxWidth: '70%', maxHeight: 56, objectFit: 'contain' }} />
      ) : client.style === 'placeholder' ? (
        <span className="ph">
          <i />
          {client.name}
        </span>
      ) : (
        <span className={client.style === 'wordmark-alt' ? 'wm alt' : 'wm'}>{client.name}</span>
      )}
    </>
  );
  return client.website ? (
    <a className="lg" href={client.website} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
      {inner}
    </a>
  ) : (
    <div className="lg">{inner}</div>
  );
}

export function Clients({ data }: { data: ClientsContent }) {
  const hasPlaceholders = data.items.some((c) => c.style === 'placeholder');
  // The strip is duplicated so the marquee can loop seamlessly.
  const strip = [...data.items, ...data.items];
  return (
    <section className="sec clients" aria-labelledby="clH">
      <div className="wrap cl-quiet rv">
        <h2 className="eyebrow" id="clH" style={{ color: 'var(--ink-3)' }}>
          {data.section.eyebrow}
        </h2>
        <p>{rich(data.section.line)}</p>
        <div className="rating">
          <b className="num">{data.section.rating.value}</b>
          <div>
            <div className="stars" aria-label={`Rated ${data.section.rating.value} out of 5`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="i-star" />
              ))}
            </div>
            <small>{data.section.rating.label}</small>
          </div>
        </div>
      </div>
      <div className="mq logos" style={{ ['--dur' as string]: '50s' }}>
        <div className="mq-track">
          {strip.map((c, i) => (
            <LogoTile key={i} client={c} />
          ))}
        </div>
      </div>
      {hasPlaceholders && (
        <div className="wrap">
          <p className="clients-note">{data.section.placeholderNote}</p>
        </div>
      )}
    </section>
  );
}
