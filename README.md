# Adpulse Digital: website

Marketing website for **Adpulse Digital**, an AI-powered digital growth agency in Madhapur, Hyderabad.

Built with **Next.js 14 (App Router) + TypeScript**. Every piece of content lives in a structured data layer, and an admin panel is already wired to it.

---

## Quick start

Requirements: **Node.js 20.9+** (Node 22 LTS recommended; required by Next.js 16) and npm.

Deploying to Hostinger: see **[HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)**.

```bash
npm install
echo "ADMIN_PASSWORD=choose-a-long-password" > .env.local   # needed to sign in to the admin
npm run dev
```

- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin → sign in with `ADMIN_PASSWORD` (required in development too)

Other commands:

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build (after `npm run build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

---

## Environment variables

None are required for local development. To configure one, copy `.env.example` to `.env.local`.

| Variable | Default | Purpose |
|---|---|---|
| `CONTENT_SOURCE` | `json` | `json` = `src/data/*.json` (local development) · `db` = PostgreSQL (production) · `api` = an external backend |
| `DATABASE_URL` | (none) | PostgreSQL connection string. Required for `CONTENT_SOURCE=db` and the `npm run db:*` commands |
| `DATABASE_POOL_MAX` | `5` | Max database connections per server instance |
| `MEDIA_STORAGE` | `local` | `local` = this computer's disk (development only; uploads refused in production) · `s3` = S3-compatible storage (Cloudflare R2, AWS S3, …) · `cloud` = Vercel Blob |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_FORCE_PATH_STYLE` | (none) | S3-compatible storage settings for `MEDIA_STORAGE=s3` (see `.env.example`) |
| `BLOB_READ_WRITE_TOKEN` | (none) | Vercel Blob token (added by Vercel when a Blob store is connected). Required for `MEDIA_STORAGE=cloud` |
| `CONTENT_API_URL` | (none) | External backend base URL (`CONTENT_SOURCE=api` only) |
| `CONTENT_API_TOKEN` | (none) | Optional bearer token sent to the external backend |
| `ADMIN_PASSWORD` | (none) | Admin sign-in password. **Required in development and production; without it nobody can sign in.** Changing it signs everyone out |
| `ADMIN_SESSION_SECRET` | (derived from the password) | Optional separate key for signing session cookies |
| `ALLOW_CONTENT_WRITES` | `false` | Allow saving JSON files outside development (single server only; not needed with `db`) |
| `RESEND_API_KEY` | (none) | Resend key for new-enquiry emails. Without it enquiries are still saved (marked "Email not set up") |
| `ENQUIRY_NOTIFICATION_EMAIL` | (none) | Who receives new audit requests (comma-separated for several) |
| `ENQUIRY_FROM_EMAIL` | (none) | Sender on your Resend-verified domain, e.g. `AdPulse Website <notifications@adpulsedigital.in>` |
| `ENQUIRY_HASH_SALT` | (random per server) | Secret for hashing visitor IPs for rate limiting. Set it in production so limits hold across servers |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL used for metadata / Open Graph |

---

## Pages

| Route | Page |
|---|---|
| `/` | Homepage: hero, about, differentiators, why choose us, clients, services, case studies, CTA |
| `/about` | About page |
| `/services` | Services overview |
| `/services/[slug]` | One page per service (8), generated from `services.json` |
| `/case-studies` | Case studies with filters |
| `/industries` | Industries we serve (linked from the footer only) |
| `/insights`, `/insights/[slug]` | Blog list and article pages |
| `/admin/login` | Admin sign-in |
| `/admin`, `/admin/[section]` | Admin panel (signed in only) |
| `/api/admin/login`, `/api/admin/logout` | Start / end an admin session |
| `/api/content/[collection]` | Public read-only content API |
| `/api/admin/content/[collection]` | Admin read/save of a whole collection (protected) |
| `/api/admin/content/[collection]/items[/id]`, `/order` | Admin item create/update/delete/reorder (protected; see "Content API") |
| `/api/admin/media` | Media library: list, upload, replace, alt text, delete (protected) |
| `/api/admin/revalidate` | Rebuild all pages, e.g. after a revision restore (protected) |
| `/uploads/[...file]` | Serves images uploaded after a build (local media storage only) |
| `/api/audit`, `/api/newsletter` | Form endpoints (public; same-site only) |
| `/admin/enquiries`, `/api/admin/enquiries[/id|/export]` | Enquiries list, status updates, CSV (admin only) |

---

## Project structure

```
src/
  app/
    (site)/            Public pages. layout.tsx = header, footer, audit modal, motion
    admin/             Admin panel pages
    api/               Route handlers (content, admin, forms)
    layout.tsx         Root HTML, fonts, global CSS, SEO metadata
  components/
    layout/            Header, Footer, AuditModal, NewsletterForm, MotionProvider
    sections/          Page sections (Hero, AboutSection, ServicesSection, CaseStudiesSection...)
    ui/                Small building blocks (Icon, Logo, CtaButton, Pulse, SectionHead, TypingText)
    admin/             Admin UI (ContentEditor, FieldEditor, MediaManager, MediaPicker, AdminNav)
  data/                ★ All website content, as JSON (one file per collection; the database seed)
  services/content/    Data layer: the ONLY place that reads/writes content
    sources.ts         json | db | api sources (CONTENT_SOURCE)
    validation.ts      zod schema for every collection (checked on every save)
    collections.ts     Which collections are lists / have slugs; slug tidying
    admin.ts           Save, item create/update/delete/reorder, errors
    db/                PostgreSQL: schema.ts (tables), client.ts (pool), repo.ts (read/write/revisions)
  services/media/      Media storage (local disk | Vercel Blob) + usage tracking
  admin/sections.ts    Admin menu: which section edits which collection
  types/content.ts     TypeScript types for every collection = the backend contract
  hooks/               Client hooks (useScrolled)
  utils/               Helpers: richText (heading markup), format, caseScenes
  utils/motion/        Reveals, kinetic headings, pulse, photo drift, hero depth
  styles/              globals.css (design system), pages.css, admin.css
  services/auth/       Admin sessions (password check, signed cookie)
  proxy.ts             Protects /admin and /api/admin (session cookie + same-origin check)
public/
  images/              Approved photos
  uploads/             Images uploaded from the admin (development)
  brand/               Logo SVGs (logo.svg is the sprite used by <Logo />)
  icons.svg            Icon sprite used by <Icon name="..." />
drizzle/               SQL migrations (generated from db/schema.ts; commit these)
scripts/db/            npm run db:migrate | db:seed | db:verify | db:export | db:restore
```

### How content flows

```
PostgreSQL (production)  ─┐
src/data/*.json (dev)    ─┼─►  services/content (getHome, getServices, ...)  ─►  pages & components
External API (optional)  ─┘          ▲
                                     │  validate → save → revalidate pages
Admin panel  ─►  /api/admin/content/...  (login + same-origin check in proxy.ts)

Admin panel  ─►  /api/admin/media  ─►  Vercel Blob (production) | public/uploads (dev)
```

Components never import JSON directly. They receive content as props from pages, and pages get it from `@/services/content`. Which store is used is a single setting (`CONTENT_SOURCE`); pages and components are the same for all of them.

### Heading markup (editable from the admin)

Headings support small inline markup, so editors never need HTML:

| Markup | Result |
|---|---|
| `*growth*` | Orange word |
| `**50+ brands**` | Bold |
| `_done guessing._` | Orange emphasis (drawn on in the About heading) |
| `==stay==` | Highlighted word with underline (Why choose us) |
| `\|` | Line break on desktop |

---

## Admin panel

`/admin` has 12 sections: Dashboard, Homepage, About, Services, Case Studies, Insights/Blog, Industries, Client Logos, Testimonials, Media Library, Website Settings, and Navigation & Footer.

### Signing in

- Every `/admin` page and `/api/admin` endpoint requires a session, in development and production alike. Signed-out visitors are sent to `/admin/login` (and back to the page they wanted after signing in); APIs answer `401`.
- The password is checked on the server against `ADMIN_PASSWORD` and never reaches the browser. If `ADMIN_PASSWORD` is not set, nobody can sign in and the login page says why.
- A correct password sets an **HTTP-only, SameSite=Strict** cookie (Secure in production) holding a signed token (HMAC-SHA256) that expires after **8 hours**. Page JavaScript cannot read it.
- **Log out** (bottom of the sidebar) deletes the cookie. Sessions survive server restarts until they expire; changing `ADMIN_PASSWORD` (or `ADMIN_SESSION_SECRET`) signs everyone out immediately.
- 5 wrong passwords from one address lock sign-in for 15 minutes (per server instance).
- Code: `src/services/auth/session.ts`, `src/proxy.ts`, `src/app/admin/login`, `src/app/api/admin/login|logout`. The signed-in panel lives in `src/app/admin/(panel)/` (the folder name does not appear in URLs).

- The editor builds its form from the data itself. Add a field to a JSON file (or your API) and it appears in the admin automatically.
- Every list supports add, edit, delete and reorder (↑ ↓ ✕). **List order is display order** (services, case studies, logos, industries...).
- Fields that point at other content are dropdowns: related services, "Led by" service, case-study category and services, icons, client logo style, article status.
- New services, case studies and articles get their URL slug from the title when the slug is left empty (`-2`, `-3`... if taken). A slug you type yourself is never renamed: a duplicate is rejected.
- Every save is validated (`src/services/content/validation.ts`). Invalid content is refused with a message naming the field, e.g. `items › 3 › date: Use YYYY-MM-DD`, and nothing is changed.
- Saving rebuilds every page (`revalidatePath`), so the website shows the change on the next page load.
- In **development**, Save writes straight to `src/data/*.json`, so you can commit the changes with Git. In **production** (`CONTENT_SOURCE=db`) it writes to the database.
- Visibility switches: articles `status` (draft/published), case studies `showOnHome` + `featured` (listed first), testimonials `enabled` (whole section) + `visible` (per quote).
- Empty **SEO title / SEO description** fields fall back to the page title and description.

### Media Library

- Upload, view, set alt text, **Replace** (the new image takes the old one's place in every section, and the old file is removed) and **Delete** (only when no content uses the image; the library shows where each image is used).
- Picking an image in any editor also fills that field's empty alt text from the library.
- Files go through `src/services/media/storage.ts`:
  - `MEDIA_STORAGE=local` (default): files on this server's disk in `public/images` (shipped with the code) and `public/uploads` (added in the admin). Uploads added after a production build are served by `src/app/uploads/[...file]/route.ts`. Suitable for development and a single server (VPS) only.
  - `MEDIA_STORAGE=cloud`: **Vercel Blob**. Uploads get permanent `https://….blob.vercel-storage.com` URLs. Images shipped with the code (`/images/…`) are still listed and can be replaced, but not deleted. To use S3/Cloudinary instead, reimplement `cloudStorage` (three methods).
- Alt text is content (the `media` collection), so it follows `CONTENT_SOURCE` like everything else.

---

## Production: database + cloud media

> Hosting on **Hostinger**: follow [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) (S3-compatible media storage, Node.js app settings). The database parts below apply to any host.

**Stack:** PostgreSQL (recommended host: [Neon](https://neon.tech), available in the Vercel Marketplace) · Drizzle ORM + `pg` · Vercel Blob for images. Any PostgreSQL works; only `DATABASE_URL` changes.

**How content is stored** (`src/services/content/db/schema.ts`):

| Table | Holds |
|---|---|
| `content_documents` | One row per collection: everything except its `items` list (page text, settings, headings) |
| `content_items` | One row per list item (service, case study, article, logo...): `position` = display order, `slug` (unique per collection), `status` |
| `content_revisions` | The previous version of a collection, saved before every write (last 50 per collection) |

Data columns are `json` (not `jsonb`) so field order is kept exactly; the site and the admin get back the same objects as from the JSON files. Every save is one transaction with a per-collection lock, so two editors can't overwrite each other halfway.

### 1. Create the database and storage (one-time, needs your accounts)

1. Vercel → your project → **Storage** → create a **Neon Postgres** database and a **Blob** store, and connect both to the project. Vercel adds `DATABASE_URL` (use the pooled one) and `BLOB_READ_WRITE_TOKEN`.
2. In Vercel → Settings → Environment Variables add: `CONTENT_SOURCE=db`, `MEDIA_STORAGE=cloud`, `ADMIN_PASSWORD=<long random password>`, `NEXT_PUBLIC_SITE_URL=https://www.adpulsedigital.in`.

### 2. Migrate and seed (from your computer)

Put the same `DATABASE_URL` in `.env.local` (never commit it), then:

```bash
npm run db:migrate      # creates the tables (SQL in /drizzle)
npm run db:seed         # copies src/data/*.json into the database, then verifies it
npm run db:verify       # (any time) checks the database still equals src/data
```

The seed validates every file first, writes everything in **one transaction** (all or nothing), refuses to run if the database already has content (`-- --force` overwrites, keeping the old versions as revisions), verifies the copy byte-for-byte, and **never changes or deletes the JSON files**.

Then deploy. The build reads content from the database.

### 3. Rollback

| Situation | What to do |
|---|---|
| Something is wrong with the database setup | Set `CONTENT_SOURCE=json` and redeploy. The site reads `src/data` again (the seed never touched it). |
| Move content edited in production back to files | `npm run db:export -- src/data`, review with Git, set `CONTENT_SOURCE=json`. |
| Undo a bad edit to one section | `npm run db:restore -- services` lists revisions; `npm run db:restore -- services 42` restores one. Then refresh pages: save once in the admin, or `POST /api/admin/revalidate`. |
| Backup | `npm run db:export` writes all content to `content-export/<date-time>/` (plus your host's own backups; Neon keeps point-in-time history). |
| Remove the database entirely | `DROP TABLE content_items, content_documents, content_revisions, drizzle.__drizzle_migrations;` |

### 4. Changing the schema later

Edit `src/services/content/db/schema.ts`, run `npm run db:generate` (creates a new SQL file in `/drizzle`), commit it, then `npm run db:migrate`. Adding a content **field** does not need a migration (fields live inside the JSON columns); add it to the type, `validation.ts` and the content.

### Content API (admin, protected)

All endpoints need the admin login; writes must come from the same site. `{id}` is the slug for services, case studies and insights, otherwise the 1-based position.

| Method | Path | Body | Does |
|---|---|---|---|
| GET | `/api/admin/content/{collection}` | | Whole collection |
| PUT | `/api/admin/content/{collection}` | whole collection | Replace (what the admin editor's Save does) |
| GET | `/api/admin/content/{collection}/items` | | `[{ id, position, item }]` |
| POST | `/api/admin/content/{collection}/items` | `{ item, position? }` | Create (slug generated from the title if empty) |
| GET / PATCH / DELETE | `/api/admin/content/{collection}/items/{id}` | PATCH: fields to change | Read / merge-update / delete one item |
| PUT | `/api/admin/content/{collection}/order` | `{ order: [ids] }` | Reorder (must list every id once) |

Errors: `400` bad request · `401` not logged in · `403` cross-site or saving disabled · `404` unknown collection/item · `422` validation failed (with `issues: [{ path, message }]`) · `500` server error (nothing saved). The public `/api/content/{collection}` stays read-only and never returns draft articles or hidden testimonials.

### Still to do before launch

1. **Admin password:** set a long random `ADMIN_PASSWORD` in the hosting environment. (Single shared password today; for several named editors, move to an auth provider such as NextAuth or Clerk.)
2. **Enquiry emails:** set up Resend (see "Forms and enquiries") and the four `ENQUIRY_*` / `RESEND_API_KEY` variables, then send one test audit request.
3. **Privacy:** publish a Privacy Policy and fill Website Settings → Privacy (consent line + link).

---

## Forms and enquiries

Two public forms: the **free growth audit** pop-up (every "Get a free audit" button) and the **newsletter** in the footer. Code: `src/services/enquiries/`.

**What happens on submit** (`submit.ts`):

1. Same-site check (Origin/Referer must be this website), JSON only, max 8 KB.
2. Strict validation: only the expected fields are accepted (anything extra is rejected), with length limits. Phone: 10–15 actual digits (spaces, dashes, dots, brackets and a leading `+` allowed). The chosen service must be one of the listed options.
3. Spam checks: an invisible honeypot field (filled = bot: answered with a fake "success", nothing kept) and a minimum time on the form (2 s audit, 1.5 s newsletter).
4. Rate limit: 5 submissions per form per hour per visitor, counted in the database. Only an HMAC-SHA256 hash of the IP (with `ENQUIRY_HASH_SALT`) is stored, never the IP; attempts older than a day are deleted.
5. **Save** to PostgreSQL. Only now does the visitor see success. If saving fails they get "please try again", and their typed details stay in the form.
6. **Email** AdPulse via Resend (audit only). Reply-to is the lead. If the email fails, the enquiry stays saved with notification status *Email failed* / *Email not set up* in the admin. A lead is never lost to an email problem.

Newsletter: one active subscription per email (case-insensitive); signing up again just says thanks. "Closed" = unsubscribed; the person can subscribe again later.

Nothing personal is ever written to server logs (only ids and error codes).

**Admin → Enquiries:** audit requests and newsletter sign-ups in two tabs, search (name, email, phone, website, service, page), filters by status and date, status dropdown (New / Contacted / Closed), notification status, CSV export of the current filter (spreadsheet formulas neutralised). Not available through any public API.

**Storage:** PostgreSQL whenever `DATABASE_URL` is set (tables `enquiries`, `enquiry_attempts`, migration `drizzle/0001_enquiries.sql`). In development without `DATABASE_URL`, enquiries go to `.data/enquiries.dev.json` (git-ignored, labelled development-only; the admin shows a notice). In production without a database the forms refuse with "please try again" rather than losing data.

**Resend setup (one-time):**

1. Create an account at resend.com → **Domains → Add domain** → `adpulsedigital.in` (or a subdomain such as `mail.adpulsedigital.in`).
2. Add the DNS records Resend shows (SPF/MX + DKIM, and the suggested DMARC record) at your domain's DNS provider; wait until the domain shows **Verified**.
3. **API Keys → Create** with *Sending access* (optionally restricted to that domain). Put it in Vercel → Environment Variables as `RESEND_API_KEY` (and in `.env.local` to test locally). Never commit it.
4. Set `ENQUIRY_FROM_EMAIL` to an address on the verified domain and `ENQUIRY_NOTIFICATION_EMAIL` to the inbox(es) that should receive leads.
5. Submit one test audit request and check it arrives and shows *Emailed* in Admin → Enquiries.

---

## Content still to replace

- Case studies: all six are **samples** (`isSample: true`). Replace them with real results.
- Insights: three **sample** articles.
- Client logos: two real wordmarks plus three placeholders.
- Figures to confirm: 50+ brands, 4.9 rating, 98% retention, and the hero numbers (₹38.4L, 3.2x, 4.8%).
- Hero copy: alternative options are in `docs/hero-copy-options.md`.

---

## Design notes

- `src/styles/globals.css` is the approved prototype's design system, ported 1:1: tokens on `:root`, then sections in page order. Change tokens rather than individual values.
- Motion respects `prefers-reduced-motion`. Kinetic headings are split on the client only after hydration, so the HTML is always complete without JavaScript.
- Fonts load from Google Fonts (Plus Jakarta Sans). To self-host, switch to `next/font/google` in `src/app/layout.tsx`.
