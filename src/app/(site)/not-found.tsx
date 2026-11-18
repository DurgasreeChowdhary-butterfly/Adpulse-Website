import Link from 'next/link';
import { getSettings } from '@/services/content';

export default async function NotFound() {
  const { notFound: nf } = await getSettings();
  return (
    <section className="sec">
      <div className="wrap nf">
        <span className="eyebrow">{nf.eyebrow}</span>
        <h1 className="h1">{nf.title}</h1>
        <p className="body">{nf.text}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" href="/">
            {nf.primaryLabel}
          </Link>
          <Link className="btn btn-ghost" href={nf.secondaryHref}>
            {nf.secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
