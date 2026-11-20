# Deploying the AdPulse website to Hostinger

This guide takes the site from this repository to a Hostinger **managed Node.js web app**. You test it there first, then switch the domain over later. It runs as a standard Next.js server (`next build` and then `next start`).

> hPanel menu names change from time to time. If a label below doesn't match exactly, look for the closest equivalent. The values to enter do not change.

---

## 1. What you need

| Item | Notes |
|---|---|
| Hostinger plan with **Node.js web apps** | Business Web Hosting or a Cloud plan. VPS also works but needs manual setup (PM2 and Nginx), which this guide does not cover. |
| **PostgreSQL** database | Hostinger's managed Node.js hosting does not include PostgreSQL (its built-in databases are MySQL). Use an external provider such as [Neon](https://neon.tech) or Supabase. |
| **S3-compatible object storage** for uploaded images | Recommended: [Cloudflare R2](https://developers.cloudflare.com/r2/) (no download fees). AWS S3, Backblaze B2 and DigitalOcean Spaces also work. Uploads are **never** stored on the Hostinger server, because its app folder is replaced on every deploy. |
| GitHub repository | Hostinger deploys from the repo, either connected to GitHub or uploaded as a ZIP. |
| (Later) [Resend](https://resend.com) account | Optional. Without it, enquiries are still saved and visible in the admin, but no email is sent. |

Versions: **Next.js 16.4**, **React 19**, **Node.js 22.x** (Next.js 16 needs Node 20.9 or newer; Hostinger offers 18, 20, 22 and 24).

---

## 2. One-time setup of external services

### 2.1 PostgreSQL (Neon example)
1. Create a project. Choose a region close to India, e.g. *AWS ap-south-1 (Mumbai)* or Singapore.
2. Copy the **pooled** connection string (the host contains `-pooler`). Keep `?sslmode=require` at the end.
   This becomes `DATABASE_URL`.

### 2.2 Image storage (Cloudflare R2 example)
1. R2 → **Create bucket**, e.g. `adpulse-media`.
2. Bucket → Settings → **Public access**: connect a custom domain (recommended, e.g. `media.<your-domain>`) or enable the `r2.dev` URL. This public base URL becomes `S3_PUBLIC_URL`, with no trailing slash.
3. R2 → **Manage API tokens** → create a token with **Object Read & Write** limited to this bucket.
   Copy the *Access Key ID*, the *Secret Access Key* and the *S3 endpoint* (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`).

---

## 3. Prepare the database (from your computer, once)

The migration and seed commands run on **your computer**, not on Hostinger. Put the production `DATABASE_URL` in `.env.local`, which git ignores. Never commit it.

```bash
npm install
npm run db:migrate   # creates the tables (safe to run again; it only applies new migrations)
npm run db:seed      # copies src/data/*.json into the database, then verifies the copy
npm run db:verify    # optional: confirms the database equals src/data
```

The seed command:
- validates every file first and writes everything in one transaction (all or nothing);
- **refuses to run if the database already has content**, so it can't overwrite edits made in production;
- never changes the JSON files.

Then remove `DATABASE_URL` from `.env.local` again if you don't want your computer pointing at production.

---

## 4. Create the Node.js app in hPanel

hPanel → **Websites → Add website → Node.js Apps**. Then either **Import Git repository** (connect GitHub and pick this repo and branch) or **Upload** a ZIP of the project (without `node_modules`, `.next` and `.env.local`).

Use these build settings:

| Setting | Value |
|---|---|
| Framework preset | **Next.js** |
| Node.js version | **22.x** |
| Root directory | `/` (the repository root, where `package.json` is) |
| Package manager | **npm** (uses `package-lock.json`) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | `.next` |

Notes:
- `npm start` runs `next start`, which listens on the **`PORT`** that Hostinger provides. Do not set `PORT` yourself.
- The build needs the **devDependencies** (TypeScript, type definitions). If a build log says TypeScript is missing, make sure the install step is not running in production-only mode.
- Start with Hostinger's **temporary domain** (or a staging subdomain). Do **not** change the live domain or DNS yet.

---

## 5. Environment variables

hPanel → your Node.js app → **Environment variables**. Add them **before the first build**: the build reads `NEXT_PUBLIC_SITE_URL`, `CONTENT_SOURCE` and `DATABASE_URL` to generate the pages. After changing a variable, **redeploy** so the build picks it up.

### Required

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The address you are testing on, e.g. `https://<temporary-domain>`. Change it to `https://www.<your-domain>` at go-live. |
| `CONTENT_SOURCE` | `db` |
| `DATABASE_URL` | The pooled PostgreSQL connection string from step 2.1 |
| `ADMIN_PASSWORD` | A long random password (at least 20 characters) |
| `ADMIN_SESSION_SECRET` | A long random string (64 hex characters) |
| `ENQUIRY_HASH_SALT` | A long random string (64 hex characters) |
| `MEDIA_STORAGE` | `s3` |
| `S3_BUCKET` | e.g. `adpulse-media` |
| `S3_ACCESS_KEY_ID` | From step 2.2 |
| `S3_SECRET_ACCESS_KEY` | From step 2.2 |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (leave empty for AWS S3) |
| `S3_REGION` | `auto` for R2 (AWS: e.g. `ap-south-1`) |
| `S3_PUBLIC_URL` | Public bucket URL or custom domain, no trailing slash |

Generate random values with:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Optional

| Variable | When |
|---|---|
| `DATABASE_POOL_MAX` | Default 5 is fine for one server process. |
| `RESEND_API_KEY`, `ENQUIRY_NOTIFICATION_EMAIL`, `ENQUIRY_FROM_EMAIL` | Once Resend is set up and your sending domain is verified. Until all three are set, enquiries are saved with status "not configured" and no email is sent. |
| `S3_FORCE_PATH_STYLE` | `true` only if your storage provider needs it (e.g. MinIO). |

### Leave empty on Hostinger
`ALLOW_CONTENT_WRITES`, `BLOB_READ_WRITE_TOKEN`, `CONTENT_API_URL`, `CONTENT_API_TOKEN`, `PORT`, `NODE_ENV`.

`.env.example` lists and explains every variable.

---

## 6. Deploy and test (on the temporary domain)

1. Click **Deploy**. The build log should end with the route list and *"Generating static pages … (19/19)"*.
2. Work through this checklist **over HTTPS**. The admin cookie is `Secure`, so signing in over plain `http://` will not work.

| Check | Expected |
|---|---|
| Home, About, Services (each service), Case studies, Industries, Insights (each article) | All load with the same content and design as before |
| `/admin` | Redirects to `/admin/login`; the correct password signs in |
| Admin dashboard | Shows **"Content source: Database"** and **"Saving: enabled"** |
| Edit a small text in the admin, save, reload the public page | The change appears; change it back afterwards |
| Admin → Media → upload an image | The image URL starts with your `S3_PUBLIC_URL` and the image opens |
| Free audit form (header button) | Shows the success message; the request appears in **Admin → Enquiries** (notification "not configured" until Resend is set up) |
| Newsletter form (footer) | Success message; the subscriber appears in Admin → Enquiries |
| `https://<domain>/api/admin/content/services` in a private window | `401` (not signed in) |

3. **Check visitor IPs behind Hostinger's proxy.** Login lockout and form rate limits identify visitors by the first `X-Forwarded-For` address. Submit the audit form 6 times within an hour from one connection: the 6th must be refused with "Too many requests". If it is never refused, or other people are blocked after your tests, tell the developer so the IP detection can be adjusted for Hostinger's proxy.

---

## 7. Go-live (only after testing is approved)

1. Back up the old website (files and database) using its current host's tools.
2. Set `NEXT_PUBLIC_SITE_URL` to the final address (`https://www.<your-domain>`) and redeploy.
3. In hPanel, connect the real domain to the Node.js app and make sure the SSL certificate is active.
4. Point DNS to Hostinger as hPanel instructs. Changes can take up to 24 hours to reach everyone.
5. Repeat the checklist in step 6 on the real domain. Then send one real test audit request.

---

## 8. Everyday operations

| Task | How |
|---|---|
| Deploy a code change | Push to the connected branch (or upload a new ZIP) and redeploy in hPanel. Content edits live in the database and are not affected. |
| Database schema change | Run `npm run db:migrate` against production from your computer **before** deploying the code that needs it. |
| Content backup | `npm run db:export` (writes `content-export/<date-time>/`). Also use your PostgreSQL provider's backups (Neon keeps point-in-time history). |
| Undo a bad content edit | `npm run db:restore -- <collection>` lists saved versions; `npm run db:restore -- <collection> <id>` restores one. Then save once in the admin to refresh pages. |
| Emergency fallback | Set `CONTENT_SOURCE=json` and redeploy. The site shows the content from `src/data`, and admin saving switches off. |
| Change admin password | Change `ADMIN_PASSWORD` (and/or `ADMIN_SESSION_SECRET`) and redeploy. Everyone is signed out. |

---

## 9. Known limits

- **One shared admin password.** Named accounts need an auth provider, which is planned work.
- **Login lockout** (5 wrong tries leads to a 15-minute pause) is kept in the server's memory. It resets when the app restarts.
- **Image types:** uploads accept jpg, png, webp, gif, svg and avif up to 5 MB. Files are served from the storage domain, not the website domain.
- **Admin protection** lives in `src/proxy.ts`, the Next.js 16 replacement for `middleware.ts`. It runs on the Node.js runtime. A second session check in the admin panel layout means admin pages never render without a valid login.
