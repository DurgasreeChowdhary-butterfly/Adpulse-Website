import type { Metadata } from 'next';
import { getAbout, getClients, getHome, getNavigation, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { AboutSection } from '@/components/sections/AboutSection';
import { Differentiators } from '@/components/sections/Differentiators';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Clients } from '@/components/sections/Clients';
import { CtaSection } from '@/components/sections/CtaSection';
import { plain } from '@/utils/richText';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return pageSeo(about.page, 'About', plain(about.page.description));
}

export default async function AboutPage() {
  const [about, home, clients, settings, nav] = await Promise.all([getAbout(), getHome(), getClients(), getSettings(), getNavigation()]);
  const bc = nav.breadcrumbs;
  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.about }]}
        eyebrow={about.page.eyebrow}
        title={about.page.title}
        description={about.page.description}
        primaryCta={home.cta.button}
      />
      <AboutSection about={about} />
      <Differentiators data={home.differentiators} />
      <WhyChooseUs data={home.why} />
      <Clients data={clients} />
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
