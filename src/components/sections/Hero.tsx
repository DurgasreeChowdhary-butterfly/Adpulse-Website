import { Fragment } from 'react';
import type { HomeContent } from '@/types/content';
import { CtaButton } from '@/components/ui/CtaButton';
import { Icon } from '@/components/ui/Icon';
import { Pulse } from '@/components/ui/Pulse';
import { rich } from '@/utils/richText';

const BAR_HEIGHTS = [30, 38, 36, 52, 64, 76, 100];

export function Hero({ hero }: { hero: HomeContent['hero'] }) {
  const v = hero.visual;
  return (
    <section className="hero dark" id="home">
      <Pulse className="hero-pulse" />
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow rv">
            <Icon name="i-pulse" />
            {hero.eyebrow}
          </span>
          <h1 className="h1 kt kt-mask" data-base="160" data-acc="after">
            {rich(hero.heading)}
          </h1>
          <p className="body rv">{hero.description}</p>
          <div className="hero-cta rv">
            <CtaButton cta={hero.primaryCta} />
            <CtaButton cta={hero.secondaryCta} variant="ghost" />
          </div>
          <div className="trust rv">
            {hero.trust.map((t, i) => (
              <Fragment key={t.label}>
                {i > 0 && <i />}
                <div>
                  <b className="num">{t.value}</b>
                  <span>{t.label}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="hc rv" aria-hidden="true">
          <figure className="hc-main">
            <img src={v.image} alt={v.imageAlt} decoding="async" fetchPriority="high" />
            <figcaption className="hc-cap">
              <span className="live">{v.liveLabel}</span>
              <div>
                <small>{v.revenueLabel}</small>
                <b className="num">{v.revenueValue}</b>
                <em>{v.revenueChange}</em>
              </div>
            </figcaption>
          </figure>
          <div className="hc-metric">
            <small>{v.roas.label}</small>
            <b className="num">{v.roas.value}</b>
            <span className="was">{v.roas.note}</span>
            <div className="bars">
              {BAR_HEIGHTS.map((h, i) => (
                <i key={i} style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.06}s` }} />
              ))}
            </div>
          </div>
          <div className="hc-creative">
            <div className="lbl">
              <span>{v.ctr.label}</span>
              <b className="num">{v.ctr.value}</b>
            </div>
            <div className="ad">
              <div className="who">
                <i>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 6v12l10-6z" fill="#FC580C" />
                  </svg>
                </i>
                {v.ctr.adBrand} <span>· {v.ctr.adTag}</span>
              </div>
              <div className="art" />
              <div className="act">
                <span>{v.ctr.adText}</span>
                <span>{v.ctr.adCta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
