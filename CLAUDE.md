# Adpulse website: guide for Claude Code

Read README.md first. These are the rules for working in this repo.

## Golden rules

1. **Content never goes in components.** Every visible string, image, link, number and list lives in `src/data/*.json` and is typed in `src/types/content.ts`. Components receive content as props.
2. **Read content only through `@/services/content`.** Never import JSON files directly. Production reads PostgreSQL (`CONTENT_SOURCE=db`), development reads `src/data` (`json`); pages must work identically with both.
3. **When you add a field:** add it to the JSON, the type in `src/types/content.ts` **and** the schema in `src/services/content/validation.ts`, then use it. The admin form picks it up automatically. Fields need no database migration (they live in JSON columns).
4. **Writes go through `src/services/content/admin.ts`** (`saveCollection`, `mutateCollection`, item functions): they validate, save and revalidate pages. Never write to a source directly from a route.
5. **Don't redesign.** The look was approved after many review rounds. Keep `src/styles/globals.css` tokens and class names. New UI must reuse the existing tokens (`--navy`, `--orange`, `--ink-*`, `--s-*`, `--r`, `--ease`).
6. **No stock photos or AI-generated people.** If a section needs an image, ask the owner. Say where it goes, what it should show, the aspect ratio and the resolution.
7. **Motion:** reuse the system in `src/utils/motion/` (reveal groups, `.kt` kinetic headings, `.pulse`). Always respect `prefers-reduced-motion`.

## Where things are

- Pages: `src/app/(site)/**/page.tsx`
- Sections: `src/components/sections/*`
- Shared UI: `src/components/ui/*`
- Admin: `src/app/admin/*`, `src/components/admin/*`, menu in `src/admin/sections.ts`
- APIs: `src/app/api/*`
- Auth for admin: `src/services/auth/session.ts` (password check + signed HTTP-only cookie), enforced in `src/middleware.ts` and `src/app/admin/(panel)/layout.tsx`; login page `src/app/admin/login`. Never add an admin page outside `(panel)` or an admin API outside `/api/admin`.
- Database: `src/services/content/db/` (Drizzle schema, pool, repo), migrations in `drizzle/`, scripts in `scripts/db/`
- Media storage: `src/services/media/storage.ts` (local | Vercel Blob)
- Forms and enquiries: `src/services/enquiries/` (validation, spam checks, rate limit, store, Resend email). Never log personal data from forms; return success only after the save.

## Heading styles (class on the heading element)

`kt kt-mask` (hero, CTA) · `kt kt-rise` (section headings) · `kt kt-lines` (case studies, page heroes) · `kt kt-chars` (service titles) · `kt kt-hl` (why choose us). Inline markup is described in README.md.

## Checks before you finish a change

```bash
npm run typecheck && npm run lint && npm run build
```

Then compare the page at 1440px and 390px wide. There must be no horizontal scroll on phones.
If you touched the data layer, also run `npm run db:verify` against a test database (see README → Production).

## Next planned work

1. Named admin accounts (auth provider) if more than one editor needs access
2. Connect production accounts: Neon Postgres + Vercel Blob (see README → Production)
3. Optional: forward enquiries to a CRM; newsletter sending tool
4. Replace sample case studies, insights and client logos with real content
