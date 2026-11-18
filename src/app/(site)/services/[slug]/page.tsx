import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHome, getNavigation, getServiceBySlug, getServices, getServicesContent, getSettings, pageSeo, relatedServices } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { CtaSection } from '@/components/sections/CtaSection';
import { SectionHead } from '@/components/ui/SectionHead';
import { Icon } from '@/components/ui/Icon';
import { pad } from '@/utils/format';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = await getServiceBySlug(params.slug);
  if (!s) return {};
  const seo = pageSeo(s, s.title, s.lead);
  return { ...seo, openGraph: { title: seo.title, description: seo.description, images: s.image ? [s.image] : [] } };
}

export default async function ServicePage({ params }: Params) {
  const [service, content, home, settings, nav] = await Promise.all([getServiceBySlug(params.slug), getServicesContent(), getHome(), getSettings(), getNavigation()]);
  if (!service) notFound();

  const all = content.items;
  const index = all.findIndex((s) => s.slug === service.slug);
  const related = relatedServices(service, all);
  const bc = nav.breadcrumbs;
  const page = content.detailPage;

  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.services, href: '/services' }, { label: service.title }]}
        eyebrow={`${bc.services} · ${pad(index + 1)}`}
        title={service.title}
        kinetic="kt-chars"
        description={service.lead}
        primaryCta={page.primaryCta}
        secondaryCta={page.secondaryCta}
        aside={
          <figure className="ph-media">
            <img src={service.image} alt={service.imageAlt} decoding="async" />
            {service.stat?.value && (
              <figcaption className="glasscard">
                <small>{service.stat.label}</small>
                <b className="num">{service.stat.value}</b>
              </figcaption>
            )}
          </figure>
        }
      />

      <section className="sec">
        <div className="wrap">
          <SectionHead eyebrow={page.includedEyebrow} title={page.includedTitle} description={`${service.audience} ${page.includedSuffix}`} />
          <div className="incl">
            {service.includes.map((item) => (
              <article key={item.title}>
                <Icon name="i-checkc" />
                <h3 className="h3">{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec mist">
        <div className="wrap">
          <SectionHead eyebrow={page.processEyebrow} title={page.processTitle} description={page.processDescription} />
          <div className="steps">
            {page.process.map((step, k) => (
              <div className="step" key={step.title}>
                <span className="n">{pad(k + 1)}</span>
                <h3 className="h3">{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionHead
            eyebrow={page.relatedEyebrow}
            title={page.relatedTitle}
            description={
              <Link className="link" href="/services">
                {page.relatedLinkLabel} <Icon name="i-arrow" />
              </Link>
            }
          />
          <div className="svc-grid others">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} linkLabel={content.section.cardLinkLabel} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
