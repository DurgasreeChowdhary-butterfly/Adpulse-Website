import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCaseStudies, getCaseStudiesContent, getHome, getNavigation, getServices, getSettings, pageSeo } from '@/services/content';
import { PageHero } from '@/components/sections/PageHero';
import { CaseStudyCard } from '@/components/sections/CaseStudyCard';
import { CtaSection } from '@/components/sections/CtaSection';
import { SectionHead } from '@/components/ui/SectionHead';
import { Icon } from '@/components/ui/Icon';
import { caseScene } from '@/utils/caseScenes';
import { pad } from '@/utils/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params: paramsPromise }: Params): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const study = (await getCaseStudies()).find((c) => c.slug === slug);
  if (!study) return {};
  const summary = study.overview || [study.result.value, study.result.label].filter(Boolean).join(' ') || study.challenge;
  const seo = pageSeo(study, study.title, summary);
  return { ...seo, openGraph: { title: seo.title, description: seo.description, images: study.image ? [study.image] : [] } };
}

/**
 * One case study. Every section is built from the case study's own fields and is hidden when
 * those fields are empty, so nothing is shown that the admin has not entered.
 */
export default async function CaseStudyPage({ params: paramsPromise }: Params) {
  const { slug } = await paramsPromise;
  const [content, services, home, settings, nav] = await Promise.all([getCaseStudiesContent(), getServices(), getHome(), getSettings(), getNavigation()]);
  const study = content.items.find((c) => c.slug === slug);
  if (!study) notFound();

  const page = content.detailPage;
  const labels = content.section;
  const bc = nav.breadcrumbs;
  const delivered = study.services.map((s) => services.find((x) => x.slug === s)).filter((s) => !!s);
  const execution = study.execution.filter((step) => step.trim());
  const gallery = study.gallery.filter((g) => g.image);
  const more = content.items.filter((c) => c.slug !== study.slug).slice(0, 3);
  const facts = [
    study.client && { label: page.clientLabel, value: study.client },
    study.industry && { label: page.industryLabel, value: study.industry },
  ].filter((f) => !!f);
  // Industry alone is already in the hero, so it does not open the overview section by itself.
  const hasOverview = !!study.overview || !!study.client || delivered.length > 0;
  const story = [
    study.challenge && { title: labels.challengeLabel, body: <p>{study.challenge}</p> },
    study.solution && { title: labels.solutionLabel, body: <p>{study.solution}</p> },
    execution.length > 0 && {
      title: page.executionTitle,
      body: (
        <ol className="cs-exec">
          {execution.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ),
    },
  ].filter((s) => !!s);
  const hasResults = !!(study.result.value || study.result.label) || study.metrics.length > 0;

  return (
    <>
      <PageHero
        crumbs={[{ label: bc.home, href: '/' }, { label: bc.caseStudies, href: '/case-studies' }, { label: study.title.replace(/[*_=|]/g, '') }]}
        eyebrow={study.industry || content.page.eyebrow}
        title={study.title}
        kinetic="kt-lines"
        primaryCta={home.cta.button}
        aside={
          <figure className="ph-media cs-media">
            {study.image ? (
              <img src={study.image} alt={study.imageAlt} decoding="async" />
            ) : (
              <span className="scene" dangerouslySetInnerHTML={{ __html: caseScene(study.visual, `h-${study.slug}`) }} />
            )}
            {study.result.value && (
              <figcaption className="glasscard">
                {study.isSample && <span className="sample-tag">{labels.sampleLabel}</span>}
                <small>{study.result.label}</small>
                <b className="num">{study.result.value}</b>
              </figcaption>
            )}
          </figure>
        }
      />

      {hasOverview && (
        <section className="sec">
          <div className="wrap cs-overview">
            <div className="head rv">
              <span className="eyebrow">{page.overviewTitle}</span>
              {study.overview && <p className="cs-lead">{study.overview}</p>}
            </div>
            {(facts.length > 0 || delivered.length > 0) && (
              <dl className="cs-facts rv">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
                {delivered.length > 0 && (
                  <div>
                    <dt>{page.servicesLabel}</dt>
                    <dd>
                      {delivered.map((s) => (
                        <Link key={s.slug} href={`/services/${s.slug}`} className="cs-tag">
                          {s.title}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </section>
      )}

      {story.length > 0 && (
        <section className={`sec${hasOverview ? ' mist' : ''}`}>
          <div className="wrap">
            <div className="steps cs-story" style={{ ['--n' as string]: story.length }}>
              {story.map((s, k) => (
                <article className="step" key={s.title}>
                  <span className="n">{pad(k + 1)}</span>
                  <h2 className="h3">{s.title}</h2>
                  {s.body}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasResults && (
        <section className="sec dark cs-results">
          <div className="wrap">
            <SectionHead eyebrow={page.resultsEyebrow} title={page.resultsTitle} kinetic="kt-rise" />
            <div className="cs-res-grid">
              {(study.result.value || study.result.label) && (
                <div className="cs-res-main">
                  {study.isSample && <span className="sample-tag">{labels.sampleLabel}</span>}
                  <b className="num">{study.result.value}</b>
                  <span>{study.result.label}</span>
                </div>
              )}
              {study.metrics.length > 0 && (
                <div className="cs-mets">
                  {study.metrics.map((m) => (
                    <div key={m.label}>
                      <b className="num">{m.value}</b>
                      <small>{m.label}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {study.isSample && <p className="cs-note">{labels.sampleNote}</p>}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <h2 className="eyebrow cs-sub">{page.galleryTitle}</h2>
            <div className="cs-gallery">
              {gallery.map((g, i) => (
                <figure key={i}>
                  <img src={g.image as string} alt={g.alt} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec mist">
        <div className="wrap">
          <SectionHead
            eyebrow={content.page.eyebrow}
            title={page.moreTitle}
            description={
              <Link className="link back" href="/case-studies">
                <Icon name="i-left" /> {page.backLabel}
              </Link>
            }
          />
          {more.length > 0 && (
            <div className="svc-grid cs-grid others">
              {more.map((c) => (
                <CaseStudyCard key={c.slug} study={c} linkLabel={labels.cardLinkLabel} sampleLabel={labels.sampleLabel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaSection cta={home.cta} contact={settings.contact} labels={settings.contactLabels} />
    </>
  );
}
