@AGENTS.md

# AdPulse Digital website

Marketing website for AdPulse Digital (Adpulse Digital Pvt Ltd), an AI-powered digital marketing agency.
Domain: adpulsedigital.in.

## Non-negotiable rules

1. **Pixel-exact to the approved design.** `design/homepage-design.png` (homepage) and `design/banners.png` (3 hero
   slides) are the spec. Match layout, spacing, colours, fonts, radii, shadows, icon style and proportions. No creative
   changes. If something is ambiguous, ask; don't invent.
2. **Use the supplied logo only.** Files are in `public/brand/` and were exported unchanged from
   `design/Adpulse Logo Final.pdf`. Never redraw, recreate, recolour or retype it. The derived files are
   `adpulse-logo-reversed.svg` (navy `#01286D` swapped for white, for dark backgrounds as in the mockup footer) and
   the favicon/app icons (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`, `public/brand/adpulse-icon.png`), which
   are crops of the logo's play-button "P". The "A-arrow" mark visible in `banners.png` is NOT the logo; ignore it.
3. **Never hard-code content in components.** All copy, images, links, contact details, navigation and footer come
   from Payload CMS through `src/lib/content.ts`. Components only call its `get*()` functions and receive its view
   types. They never import Payload, `@/payload-types` or JSON directly. The only literal text allowed in
   components is accessibility text with no visible equivalent (e.g. `aria-label="Next slide"`).
4. **New content = new collection or global.** If a page needs content that doesn't exist yet, add a collection
   (lists of items) or a global (one-off page text) in `src/payload/`, following the existing patterns. Then add a
   typed getter in `src/lib/content.ts`, add seed data, and update ADMIN_GUIDE.md.
5. **Design text is not copy.** The mockup is AI-rendered and contains garbled words. Use the corrected copy in
   `src/seed/data.ts`. Brands, case studies and testimonials there are dummy placeholders.
6. **Responsive, fast, accessible, SEO-ready.** Desktop (1280 reference), tablet and mobile. Use semantic HTML,
   alt text, visible focus states, AA contrast, `next/image`, `next/font`, and per-page `metadata`.

## Tech stack

- Next.js 16 (App Router, `src/` dir, Turbopack, `cacheComponents` on). **Read `node_modules/next/dist/docs/` before
  using an API you're unsure of. This version differs from older training data.**
- Payload CMS 3 (admin at `/admin`, REST at `/api`, GraphQL disabled) inside the same Next app. Docs for the
  installed version: https://payloadcms.com/docs. Check them rather than relying on memory.
- Database: one env var, `DATABASE_URL`. `file:./adpulse.db` uses SQLite (dev); `postgres://…` uses PostgreSQL.
  Both adapters are installed (`src/payload.config.ts`).
- React 19, TypeScript (strict)
- Tailwind CSS v4. Tokens live in `src/app/(frontend)/globals.css` under `@theme`; there is no `tailwind.config.*`.
- Font: Plus Jakarta Sans via `next/font/google` (CSS var `--font-jakarta`)
- ESLint (`eslint-config-next`), npm. Node `^22.23.4 || >=24.22.1` (a Payload requirement).

Commands: `npm run dev` (http://localhost:3000, admin at /admin), `npm run build`, `npm run lint`,
`npm run seed` (**replaces all content** with the mockup dummy data; restart a running server afterwards, as the seed runs outside Next.js and cannot revalidate its cache), `npm run generate:types` (after any
collection/global change), `npm run generate:importmap` (after adding admin custom components).

## CMS rules

- **Collections** (`src/payload/collections/content.ts`): banners, brands, case-studies, services, industries,
  testimonials, stats, why-items. Each has `visible` ("Visible on website") and `orderable: true` (drag-and-drop
  order, stored in `_order`). Plus `media` (uploads with responsive WebP sizes; SVG allowed) and `users` (all users
  are admins).
- **Globals** (`src/payload/globals.ts`): `site-settings`, `header`, `home-page`.
- **Access** (`src/payload/access.ts`): the public reads only `visible: true` documents and all globals; only
  logged-in users write. `content.ts` reads with `overrideAccess: false`, so hidden items can never leak.
- **Caching and revalidation:** `content.ts` readers use `'use cache'` + `cacheTag(<slug>, "cms")`. Every
  collection and global has afterChange/afterDelete hooks (`src/payload/hooks/revalidate.ts`) that call
  `revalidateTag(<slug>, { expire: 0 })`. Media changes expire `cms` (everything). New collections must use the
  same `base()` helper or hooks so edits show without a redeploy.
- Array items inside globals (nav items, footer links) have a `visible` ("Show") checkbox; `content.ts` filters them.
- Icons are stored as names (`src/lib/icons.ts`) and mapped to icon components on the frontend.
- **Schema changes:** in dev, SQLite schema is auto-pushed. For production Postgres, create migrations with
  `npm run payload migrate:create` (with `DATABASE_URL` pointing at Postgres) and run `npm run payload migrate`
  on deploy. Uploads go to `./media` on local disk. Serverless hosting needs a Payload storage adapter (S3/Blob).

## Folder structure

```
design/                    Reference only: mockups, logo PDF, brand PDFs. Never imported; excluded from TS/ESLint.
public/brand/              Logo files (svg master, reversed svg, png fallback, square icon)
src/app/(frontend)/        Website routes + root layout + globals.css (design tokens)
  page.tsx                 Home (currently setup screen; sections come next)
  services/ industries/ case-studies/ about/ insights/ contact/
                           Placeholder pages. Detail pages go in [slug]/page.tsx inside each.
src/app/(payload)/         Payload admin + REST API (generated files: do not edit)
src/app/favicon.ico, icon.png, apple-icon.png   Default icons (CMS favicon overrides via metadata)
src/payload.config.ts      Payload config (db switch, collections, globals)
src/payload/               collections/, globals.ts, access.ts, fields.ts, hooks/, components/ (admin UI bits)
src/payload-types.ts       Generated types (`npm run generate:types`)
src/seed/                  `npm run seed` script + dummy data + placeholder image generator
src/lib/content.ts         THE content access layer (typed getters)
src/lib/icons.ts           Allowed icon names
src/components/layout/     Header, Footer, page shells
src/components/sections/   Homepage/page sections
src/components/ui/         Primitives (Container, Logo, Button, Pill, Card, Icon…)
DESIGN_TOKENS.md           Every measured value, with mockup px → build px
ADMIN_GUIDE.md             Plain-language guide for editors
```

Adding a page: create `src/app/(frontend)/<route>/page.tsx` that exports `metadata`/`generateMetadata` and renders
sections fed by `content.ts`. Add the nav entry in the admin (**Settings → Header**) and in `src/seed/index.ts`.

## Pixel-exact checklist (run for every section)

- [ ] Compare side-by-side with the mockup at 1280 px wide (mockup px × 1.25 = build px; see DESIGN_TOKENS.md)
- [ ] Colours only from tokens (`bg-navy-900`, `text-orange-500`, `text-ink`…). No ad-hoc hex values in components.
- [ ] Font sizes/weights from the `text-*` tokens; Plus Jakarta Sans only
- [ ] Radii: `rounded-btn` 8, `rounded-card` 12, `rounded-band` 20, `rounded-pill`
- [ ] Shadows: `shadow-card`, `shadow-btn` only
- [ ] Container `container-site` (1200 px + gutters); section gap `py-section`/`gap-section`
- [ ] Icons: orange rounded line icons, consistent stroke and size per section
- [ ] Spacing, alignment and element proportions match (measure, don't eyeball)
- [ ] All text and images come from `content.ts` (CMS); nothing hard-coded; no garbled mockup text
- [ ] Hidden items (Visible off / Show off) do not render
- [ ] Tablet (768) and mobile (390) layouts checked; no horizontal scroll
- [ ] Keyboard focus visible, images have alt text, headings in order, contrast AA
- [ ] `npm run lint` and `npm run build` pass with zero warnings
