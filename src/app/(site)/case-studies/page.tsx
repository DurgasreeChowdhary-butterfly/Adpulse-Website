import type { Metadata } from 'next';
import { getCaseStudiesContent, getHome, getNavigation, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { CtaSection } from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCaseStudiesContent();
  return pageSeo(data.page, 'Case Studies', data.page.description);
}

export default async function CaseStudiesPage() {
  const [data, home, settings, nav] = await Promise.all([getCaseStudiesContent(), getHome(), getSettings(), getNavigation()]);
  const bc = nav.breadcrumbs;
  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.caseStudies }]}
        eyebrow={data.page.eyebrow}
        title={data.page.title}
        description={data.page.description}
        primaryCta={home.cta.button}
      />
      <CaseStudiesSection data={data} showHead={false} />
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
