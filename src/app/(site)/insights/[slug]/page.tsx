import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHome, getInsightBySlug, getInsights, getInsightsContent, getNavigation, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { CtaSection } from '@/components/sections/CtaSection';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/utils/format';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  return (await getInsights()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getInsightBySlug(params.slug);
  if (!p) return {};
  const seo = pageSeo(p, p.title, p.excerpt);
  return { ...seo, openGraph: { title: seo.title, description: seo.description, images: p.cover ? [p.cover] : [] } };
}

export default async function InsightPage({ params }: Params) {
  const [post, page, home, settings, nav] = await Promise.all([getInsightBySlug(params.slug), getInsightsContent(), getHome(), getSettings(), getNavigation()]);
  if (!post) notFound();
  const bc = nav.breadcrumbs;
  const meta = [post.category, formatDate(post.date), post.readTime, post.author].filter((x) => x && x.trim());
  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.insights, href: '/insights' }, { label: post.category }]}
        eyebrow={meta.join(' · ')}
        title={post.title}
        kinetic="kt-rise"
        description={post.excerpt}
      />
      <section className="sec">
        <div className="wrap">
          <article className="article">
            {post.cover && (
              <figure className="cover">
                <img src={post.cover} alt={post.coverAlt} />
              </figure>
            )}
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <Link className="back" href="/insights">
              <Icon name="i-arrow" /> {page.page.backLabel}
            </Link>
          </article>
        </div>
      </section>
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
