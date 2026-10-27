# AdPulse Digital – Website

Next.js 16 + Payload CMS 3 + TypeScript + Tailwind CSS v4. Requires Node `^22.23.4 || >=24.22.1`.

## First-time setup

```bash
npm install                 # uses .npmrc (legacy-peer-deps) – see CLAUDE.md
cp .env.example .env        # then set PAYLOAD_SECRET to a long random string
npm run seed                # creates the local SQLite database with the dummy content
npm run dev                 # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

On the first visit to `/admin` you'll be asked to create the first admin account.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run seed` | **Replaces all website content** with the mockup dummy data (admin users are kept). Restart the server afterwards. |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing collections/globals |
| `npm run generate:importmap` | Regenerate the admin import map after adding admin components |

## Docs

- Project rules, CMS rules and structure: [CLAUDE.md](CLAUDE.md)
- Guide for content editors: [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- Design tokens and measurements: [DESIGN_TOKENS.md](DESIGN_TOKENS.md)
- Approved design files: [design/](design/) (reference only, not part of the build)
