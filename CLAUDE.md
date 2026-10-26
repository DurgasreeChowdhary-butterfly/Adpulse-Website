@AGENTS.md

# AdPulse Digital website

Marketing website for AdPulse Digital (Adpulse Digital Pvt Ltd), an AI-powered digital marketing agency.

## Non-negotiable rules

1. **Pixel-exact to the approved design.** `design/homepage-design.png` (homepage) and `design/banners.png` (3 hero
   slides) are the spec. Match layout, spacing, colours, fonts, radii, shadows, icon style and proportions. No creative
   changes. If something is ambiguous, ask; don't invent.
2. **Use the supplied logo only.** Files are in `public/brand/` and were exported unchanged from
   `design/Adpulse Logo Final.pdf`. Never redraw, recreate, recolour or retype it. The only derived file is
   `adpulse-logo-reversed.svg`, which swaps navy `#01286D` for white for dark backgrounds, as in the mockup footer.
   The "A-arrow" mark visible in `banners.png` is NOT the logo; ignore it.
3. **Everything is content-driven.** Banners, brands, case studies, testimonials, services, industries, stats, contact
   details, navigation and footer must come from the content layer (`src/lib/content.ts`), never hard-coded in
   components. Content currently lives in `src/content/*.json`. A CMS/admin panel replaces this later (Prompt 2), so
   components must only call the `get*()` functions in `src/lib/content.ts`.
4. **Design text is not copy.** The mockup is AI-rendered and contains garbled words. Never copy garbled text. Use
   the corrected copy (see "Text corrections" in the setup report or content files). Brands and case studies in the
   mockup are dummy placeholders.
5. **Responsive, fast, accessible, SEO-ready.** Desktop (1280 reference), tablet and mobile. Use semantic HTML,
   alt text, visible focus states, AA contrast, `next/image`, `next/font`, and per-page `metadata`.
6. Do not install a CMS until asked.

## Tech stack

- Next.js 16 (App Router, `src/` dir, Turbopack, `cacheComponents` on). **Read `node_modules/next/dist/docs/` before
  using an API you're unsure of. This version differs from older training data.**
- React 19, TypeScript (strict)
- Tailwind CSS v4. Tokens live in `src/app/globals.css` under `@theme`; there is no `tailwind.config.*`.
- Font: Plus Jakarta Sans via `next/font/google` (CSS var `--font-jakarta`)
- ESLint (`eslint-config-next`), npm

Commands: `npm run dev` (http://localhost:3000), `npm run build`, `npm run lint`.

## Folder structure

```
design/                  Reference only: mockups, logo PDF, brand PDFs. Never imported; excluded from TS/ESLint.
public/brand/            Logo files (svg master, reversed svg, png fallback)
src/app/                 Routes. Each page reads content via src/lib/content.ts
  page.tsx               Home (currently setup screen; sections come next)
  services/ industries/ case-studies/ about/ insights/ contact/
                         Placeholder pages. Detail pages go in [slug]/page.tsx inside each.
src/components/layout/   Header, Footer, page shells
src/components/sections/ Homepage/page sections (Hero, TrustedBy, About, Services, WhyUs, CaseStudies,
                         Industries, Testimonials, CtaBand)
src/components/ui/       Primitives (Container, Logo, Button, Pill, Card, Icon…)
src/lib/                 Content access layer, helpers
src/content/             JSON content (temporary source until the CMS lands)
DESIGN_TOKENS.md         Every measured value, with mockup px → build px
```

Adding a page: create `src/app/<route>/page.tsx` that exports `metadata` and renders sections. Add its content type +
getter to `src/lib/content.ts` and the nav entry to `src/content/site.json`.

## Pixel-exact checklist (run for every section)

- [ ] Compare side-by-side with the mockup at 1280 px wide (mockup px × 1.25 = build px; see DESIGN_TOKENS.md)
- [ ] Colours only from tokens (`bg-navy-900`, `text-orange-500`, `text-ink`…). No ad-hoc hex values in components.
- [ ] Font sizes/weights from the `text-*` tokens; Plus Jakarta Sans only
- [ ] Radii: `rounded-btn` 8, `rounded-card` 12, `rounded-band` 20, `rounded-pill`
- [ ] Shadows: `shadow-card`, `shadow-btn` only
- [ ] Container `container-site` (1200 px + gutters); section gap `py-section`/`gap-section`
- [ ] Icons: orange rounded line icons, consistent stroke and size per section
- [ ] Spacing, alignment and element proportions match (measure, don't eyeball)
- [ ] All text and images come from the content layer; no garbled mockup text
- [ ] Tablet (768) and mobile (390) layouts checked; no horizontal scroll
- [ ] Keyboard focus visible, images have alt text, headings in order, contrast AA
- [ ] `npm run lint` and `npm run build` pass with zero warnings
