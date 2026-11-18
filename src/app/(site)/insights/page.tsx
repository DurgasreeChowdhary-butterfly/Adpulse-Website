import type { Metadata } from 'next';
import { getHome, getInsightsContent, getNavigation, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { InsightCard } from '@/components/sections/InsightCard';
import { CtaSection } from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getInsightsContent();
  return pageSeo(data.page, 'Insights', data.page.description);
}

export default async function InsightsPage() {
  const [data, home, settings, nav] = await Promise.all([getInsightsContent(), getHome(), getSettings(), getNavigation()]);
  const posts = data.items;
  const bc = nav.breadcrumbs;
  return (
    <>
      <PageHero crumbs={[{ label: bc.home, href: '/' }, { label: bc.insights }]} eyebrow={data.page.eyebrow} title={data.page.title} description={data.page.description} />
      <section className="sec mist">
        <div className="wrap">
          <div className="posts">
            {posts.map((p) => (
              <InsightCard key={p.slug} post={p} readLabel={data.page.readLabel} />
            ))}
          </div>
          {posts.some((p) => p.isSample) && <p className="sample-note">{data.page.sampleNote}</p>}
        </div>
      </section>
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
