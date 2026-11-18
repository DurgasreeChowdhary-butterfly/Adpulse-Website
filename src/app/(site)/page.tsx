import {
  getAbout,
  getHomeCaseStudiesContent,
  getClients,
  getHome,
  getServicesContent,
  getSettings,
  getTestimonials,
} from '@/services/content';
import { Hero } from '@/components/sections/Hero';
import { AboutSection } from '@/components/sections/AboutSection';
import { Differentiators } from '@/components/sections/Differentiators';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Clients } from '@/components/sections/Clients';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { CtaSection } from '@/components/sections/CtaSection';

export default async function HomePage() {
  const [home, about, clients, services, cases, testimonials, settings] = await Promise.all([
    getHome(),
    getAbout(),
    getClients(),
    getServicesContent(),
    getHomeCaseStudiesContent(),
    getTestimonials(),
    getSettings(),
  ]);

  return (
    <>
      <Hero hero={home.hero} />
      <AboutSection about={about} />
      <Differentiators data={home.differentiators} />
      <WhyChooseUs data={home.why} />
      <Clients data={clients} />
      <ServicesSection data={services} />
      {cases.items.length > 0 && <CaseStudiesSection data={cases} />}
      <Testimonials data={testimonials} />
      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
