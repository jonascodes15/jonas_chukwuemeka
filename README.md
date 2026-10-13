# Jonas Chukwuemeka: portfolio

Personal site for Jonas Chukwuemeka (Jay), founder of Weblanda, full-stack developer and biologist growing into data engineering. It's written for three audiences: clients, recruiters and academic admissions.

Live at **https://jonas-chukwuemeka.vercel.app** (deployed on Vercel). The planned domain is `jonaschukwuemeka.com`.

## What's in it

- **Homepage:** hero, tech strip, work (Weblanda, its stores, Formtified), data lab, experience timeline, about, newsletter and contact.
- **Case studies** at `/work/[slug]`, one per project, with a screenshot gallery and lightbox.
- **Contact:** a form that saves enquiries and emails them, a Cal.com booking pop-up, WhatsApp, and an "Ask Jay" FAQ chat (pre-written answers, no AI).
- **Newsletter** with double opt-in and one-click unsubscribe.
- **Dashboard** at `/admin`: first-party analytics, enquiries, subscribers, newsletter sending, chat logs, bookings, CV upload and settings.
- **SEO:** metadata, generated share images, `sitemap.xml`, `robots.txt`, JSON-LD (`Person`, `WebSite`, one `CreativeWork` per case study) and a web app manifest.

## Stack

| Area               | Tools                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript (strict)         |
| Styling and motion | Tailwind CSS v4, Motion, CSS scroll reveals and view transitions                            |
| Content            | Typed data files in `src/content` (no CMS)                                                  |
| Data and email     | Neon Postgres with Drizzle ORM, Resend                                                      |
| Booking            | Cal.com embed and webhook                                                                   |
| Hosting            | Vercel, with Vercel Analytics and Speed Insights alongside the site's own first-party stats |

## Run it locally

You need **Node.js 20.9 or newer** (22 recommended), npm and Git.

```bash
git clone https://github.com/jonascodes15/jonas_chukwuemeka_portfolio.git
cd jonas_chukwuemeka_portfolio
npm install
cp .env.example .env.local   # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Pages render with no variables set; features that need a service (forms, dashboard, emails) explain what's missing until you add it.

## Scripts

| Command                                     | What it does                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                               | Dev server with hot reload                                 |
| `npm run build`                             | Production build (what Vercel runs)                        |
| `npm start`                                 | Serve the production build locally (run `build` first)     |
| `npm run lint` / `npm run typecheck`        | ESLint / route types plus TypeScript                       |
| `npm run format`                            | Format every file with Prettier                            |
| `npm run db:generate`                       | Write a migration after changing `src/server/db/schema.ts` |
| `npm run db:migrate`                        | Apply migrations to the database in `DATABASE_URL`         |
| `npm run db:studio`                         | Browse the database in Drizzle Studio                      |
| `npm run hash-password`                     | Make the bcrypt hash for the dashboard password            |
| `npm run image -- <source> <folder> <name>` | Make AVIF and WebP versions of a screenshot (see below)    |
| `npm run icons`                             | Rebuild the favicon files from the JC mark                 |

Before pushing, run `npm run typecheck`, `npm run lint` and `npm run build`. If all three pass locally, the Vercel build should too.

## Setting up the services

Every variable is documented in [`.env.example`](.env.example). Locally they go in `.env.local`, which git never commits. On Vercel, add them under **Project > Settings > Environment Variables**, then redeploy so the build picks them up. Variables starting with `NEXT_PUBLIC_` are visible to visitors, so never put a secret in one.

To generate a random secret (for `SESSION_SECRET`, `IP_HASH_SALT` and `CAL_WEBHOOK_SECRET`, each different):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 1. Site address

`NEXT_PUBLIC_SITE_URL` is the address used in canonical links, the sitemap and share images, with no trailing slash. Set it to the live address (today `https://jonas-chukwuemeka.vercel.app`) and change it when the domain moves.

### 2. Database (Neon)

1. Create a project at https://neon.tech. Under **Connect**, turn on connection pooling and copy the connection string into `DATABASE_URL`.
2. Create the tables once: `npm run db:migrate`. Run it again whenever a new migration is added to `drizzle/`.

### 3. Email (Resend)

1. Create an API key at https://resend.com and put it in `RESEND_API_KEY`.
2. Verify a domain you own under **Domains** (a subdomain such as `mail.weblanda.com` is fine) by adding the DNS records Resend shows. A `vercel.app` address can't be verified.
3. Set `RESEND_FROM_EMAIL`, e.g. `Jonas Chukwuemeka <hello@mail.weblanda.com>`, and `CONTACT_TO_EMAIL` (where enquiries go).

### 4. Dashboard login

1. Set `ADMIN_EMAIL`.
2. Run `npm run hash-password` and follow the prompt. Put the hash in `ADMIN_PASSWORD_HASH`. In `.env.local` every `$` must be written as `\$` (the script prints that version); on Vercel paste the plain hash.
3. Set `SESSION_SECRET` and `IP_HASH_SALT` to two different random strings.
4. Sign in at `/admin/login`. **Settings** shows which services are connected.

### 5. Booking (Cal.com)

1. Set `NEXT_PUBLIC_CAL_LINK` to the booking page, e.g. `https://cal.com/jonaschukwuemeka/introcall`. Every "Book a call" button then opens it in a pop-up.
2. To list bookings in the dashboard: in Cal.com go to **Settings > Developer > Webhooks**, add `https://<your-site>/api/cal/webhook`, choose Booking created, rescheduled and cancelled, and set a secret. Put the same secret in `CAL_WEBHOOK_SECRET`.

### 6. Search Console

The site is verified with the file `public/google4b64cbd418b46fe1.html`; keep it. Submit `sitemap.xml` in Search Console after each new page type ships.

## Deploying to Vercel

1. In Vercel, choose **Add New > Project** and import this repository. Keep the defaults: Vercel detects Next.js and runs `npm run build`.
2. Add the environment variables from the section above.
3. Under the project's **Analytics** and **Speed Insights** tabs, click **Enable**. Until you do, their scripts return 404 (harmless, but noisy in the browser console).
4. Deploy. Each push to `main` deploys to production; other branches get preview URLs.
5. To use a custom domain, add it under **Settings > Domains**, add the DNS records Vercel shows at your registrar, then update `NEXT_PUBLIC_SITE_URL` and redeploy.

### If a deployment fails

1. Open the failed deployment and read the **Build Logs**. The first red line is usually the cause.
2. Run `npm run build` locally on the same commit. If it fails locally too, fix that first.
3. If it builds locally but not on Vercel, the usual causes are file name case (Vercel runs on Linux, where `Hero.tsx` and `hero.tsx` differ), a file you didn't commit (`git status`), or a missing environment variable.
4. Use **Redeploy** from the deployment's menu to retry a build that failed for a temporary reason.

## Editing content

All copy lives in `src/content`, so most edits never touch a component.

| File              | Controls                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| `site.ts`         | Name, hero text, About paragraphs, contact details, CTA wording, budget ranges |
| `socials.ts`      | LinkedIn, GitHub, X and Facebook links (also used in the JSON-LD)              |
| `projects.ts`     | Weblanda and Formtified, their screenshots, and the stores built on Weblanda   |
| `dataProjects.ts` | Data projects, metrics and architecture diagrams                               |
| `caseStudies.ts`  | The copy on each `/work/[slug]` page                                           |
| `experience.ts`   | Work history, newest first                                                     |
| `education.ts`    | Degree, training and the publication                                           |
| `stack.ts`        | Tools in the scrolling strip                                                   |
| `faq.ts`          | Chat answers and the keywords that match typed questions                       |

Rules for site copy:

- Only real, checkable facts and numbers. If something isn't confirmed, leave a `// TODO:` comment instead of guessing.
- No em dashes, and no "Hire me" or "Book a session" wording.

The availability label in the hero and chat, and the downloadable CV, are changed from the dashboard rather than in code.

### Adding a project or case study

- **Data project:** append an object to `dataProjects` in `dataProjects.ts`. It needs a GitHub link and either screenshots or an `architecture` diagram (`nodes` on a grid with `col`, `row` and optional `colSpan`; `edges` between node ids, `control: true` for a dashed orchestration line).
- **Case study:** add an entry keyed by the project's slug in `caseStudies.ts`, then set `caseStudy: caseStudies["<slug>"]` on the project. The page, its share image, the homepage button and the sitemap entry appear automatically.

### Adding screenshots

Images are compressed once, ahead of time, and served as AVIF with a WebP fallback at several widths.

1. Save the full-size screenshot outside `public/`.
2. Run `npm run image -- "C:\path\to\screenshot.png" public/projects/<project-slug> <short-name>`. For phone screenshots add a maximum width: `... <short-name> 800`.
3. Paste the printed object into the project's `screenshots` array, then fill in `alt`, `caption` and `device` (`"desktop"` or `"phone"`).

The first screenshot is the cover image. Don't commit the full-size sources.

## Project structure

```
src/
  app/
    (site)/          Public pages: homepage, /work/[slug] case studies, newsletter pages
    admin/           Dashboard (protected by src/proxy.ts)
    api/             Analytics beacon, newsletter unsubscribe, Cal.com webhook
    cv/              Serves the uploaded CV, or the bundled one
    opengraph-image.tsx, sitemap.ts, robots.ts, manifest.ts
  components/
    layout/          Nav, footer, logo, in-page section links
    sections/        Homepage sections
    case-study/      Case study hero, sections, gallery and lightbox
    chat/            "Ask Jay" launcher and chat panel
    booking/         Opens Cal.com links in the pop-up
    motion/          Reveal, Enter, counters, page transitions
    seo/             JSON-LD
    admin/, ui/, icons/
  content/           All site copy and project data
  lib/               FAQ matching, Cal.com loader, share image helpers
  server/            Database, email, auth, rate limiting, server actions
assets/fonts/        Fonts for the generated share images (SIL Open Font License)
drizzle/             Database migrations
public/              Photos, logos, screenshots, bundled CV, Search Console file
scripts/             Image optimisation, password hashing, icon building
```

## Security and privacy

- Security headers in `next.config.ts`, including a Content-Security-Policy that only allows this site, Cal.com and Vercel's analytics script host. Adding another embed or script means adding its origin there.
- Forms are validated with Zod on the server, rate limited and protected by a honeypot field.
- The dashboard uses a bcrypt-checked password and a signed, httpOnly session cookie; `src/proxy.ts` guards every `/admin` route.
- The site's own analytics never store raw IP addresses, only salted hashes that rotate daily. Bots and the owner's own visits are filtered out.
