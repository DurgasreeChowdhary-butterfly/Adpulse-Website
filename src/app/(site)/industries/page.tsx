import type { Metadata } from 'next';
import { getHome, getIndustries, getNavigation, getServices, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { IndustriesGrid } from '@/components/sections/IndustriesGrid';
import { CtaSection } from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndustries();
  return pageSeo(data.page, 'Industries', data.page.description);
}

export default async function IndustriesPage() {
  const [data, services, home, settings, nav] = await Promise.all([getIndustries(), getServices(), getHome(), getSettings(), getNavigation()]);
  const bc = nav.breadcrumbs;
  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.industries }]}
        eyebrow={data.page.eyebrow}
        title={data.page.title}
        description={data.page.description}
        primaryCta={data.page.primaryCta}
        secondaryCta={data.page.secondaryCta}
      />
      <section className="sec">
        <div className="wrap">
          <IndustriesGrid items={data.items} services={services} ledByPrefix={data.page.ledByPrefix} />
        </div>
      </section>
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
