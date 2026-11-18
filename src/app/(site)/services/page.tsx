import type { Metadata } from 'next';
import { getHome, getNavigation, getServicesContent, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CtaSection } from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicesContent();
  return pageSeo(data.overviewPage, 'Services', data.overviewPage.description);
}

export default async function ServicesPage() {
  const [data, home, settings, nav] = await Promise.all([getServicesContent(), getHome(), getSettings(), getNavigation()]);
  const bc = nav.breadcrumbs;
  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.services }]}
        eyebrow={data.overviewPage.eyebrow}
        title={data.overviewPage.title}
        description={data.overviewPage.description}
        primaryCta={home.cta.button}
      />
      <ServicesSection data={data} showHead={false} />
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
