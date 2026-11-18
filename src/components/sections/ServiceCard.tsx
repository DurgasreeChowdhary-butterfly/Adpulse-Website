import Link from 'next/link';
import type { Service } from '@/types/content';
import { Icon } from '@/components/ui/Icon';

/** White service card: title, photo, short description, "Learn more". */
export function ServiceCard({ service, linkLabel }: { service: Service; linkLabel: string }) {
  return (
    <Link className="scard" href={`/services/${service.slug}`}>
      <h3>{service.title}</h3>
      <span className="art photo">
        <img src={service.image} alt={service.imageAlt} decoding="async" loading="lazy" />
      </span>
      <p>{service.summary}</p>
      <span className="go">
        {linkLabel} <Icon name="i-arrow" />
      </span>
    </Link>
  );
}
