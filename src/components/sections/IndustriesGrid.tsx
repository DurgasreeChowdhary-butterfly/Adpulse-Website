import Link from 'next/link';
import type { Industry, Service } from '@/types/content';
import { Icon } from '@/components/ui/Icon';

export function IndustriesGrid({ items, services, ledByPrefix }: { items: Industry[]; services: Service[]; ledByPrefix: string }) {
  return (
    <div className="ind-grid">
      {items.map((n) => {
        const svc = services.find((s) => s.slug === n.ledBy);
        return (
          <article className="ind" key={n.title}>
            <Icon name={n.icon} className="ic" />
            <h3 className="h3">{n.title}</h3>
            <p>{n.description}</p>
            {svc && (
              <Link className="ch" href={`/services/${svc.slug}`}>
                {ledByPrefix} {svc.title} →
              </Link>
            )}
            <Icon name={n.icon} className="wm" />
          </article>
        );
      })}
    </div>
  );
}
