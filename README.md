# YOUR COMPANY — studio website

**Technology built around business.**
A trilingual (Armenian · Russian · English) portfolio site for a studio that
builds AI systems, automation, custom software, business applications and
web experiences.

> The company name, contact details, logo and domain are placeholders.
> Replace them in one file: see **[BRAND_REPLACEMENT_GUIDE.md](BRAND_REPLACEMENT_GUIDE.md)**.

| Document | Purpose |
| --- | --- |
| [PROJECT_CONTENT_GUIDE.md](PROJECT_CONTENT_GUIDE.md) | Add, edit or remove portfolio projects |
| [BRAND_REPLACEMENT_GUIDE.md](BRAND_REPLACEMENT_GUIDE.md) | Name, logo, colour, fonts, contacts, domain |
| [docs/visual-assets-needed.md](docs/visual-assets-needed.md) | Photography / imagery to replace the coded visuals |
| [.env.example](.env.example) | Environment variables (site URL, contact form delivery) |

---

## What's inside

**Pages** (each in `/hy`, `/ru`, `/en`; Armenian is the default):

| Route | Content |
| --- | --- |
| `/[lang]` | 3D scroll intro → hero → statement → featured work (horizontal) → problems → capabilities → interactive business diagnostic → process → technology → why us → closing CTA |
| `/[lang]/work` | Work index with capability filters, gallery and index views |
| `/[lang]/work/[slug]` | Case study: hero, context, challenge, findings, solution, system diagram, experience, outcomes, technology, next project |
| `/[lang]/solutions` | Seven capability areas with problems, deliverables, example systems and related work |
| `/[lang]/about` | Manifesto, how we think, what we are / aren't, engagement model |
| `/[lang]/contact` | Project inquiry form with validation and real delivery channels |
| any unknown path | Localized 404 |

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText) · Lenis · Three.js r182 +
React Three Fiber 9. No CMS: content is typed TypeScript and JSON.

## Run locally

Requires **Node.js 20.9+**.

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it
npm run dev                  # http://localhost:3000 → redirects to /hy
```

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |

## Project structure

```
src/
  app/
    [lang]/                 localized site (layout, pages, 404, OG images, icons)
    api/contact/route.ts    contact form endpoint
    sitemap.ts, robots.ts
  proxy.ts                  locale redirects (/ → /hy, remembers the chosen language)
  config/
    brand.ts                ← company identity: name, tagline, logo, accent, contacts, URL
    navigation.ts           nav items and capability ids
    motion.ts               easing, durations, breakpoints, media queries
  locales/hy.json ru.json en.json   all interface copy
  i18n/                     locale config, dictionary loader, formatting
  content/
    projects/               one file per portfolio project (+ _template.ts)
    types.ts                project schema
  components/
    layout/                 nav, mobile menu, language switcher, footer
    motion/                 GSAP setup, Lenis, reveal primitives, cursor helpers
    three/                  3D intro (scene, model, choreography, fallback)
    sections/               homepage and page sections
    portfolio/              cards, work explorer, case-study parts, diagrams
    visuals/                coded project compositions (SVG)
    contact/                contact form
    ui/                     buttons, labels, headers
  lib/
    contact/                shared validation, delivery adapters, rate limit
    seo.ts, og.tsx          metadata helpers, OG image helpers
  styles/site.css           design tokens (Tailwind @theme), base styles
  assets/fonts/             TTF fonts for generated images (SIL OFL 1.1)
```

## Localization

- Routes are prefixed: `/hy/...`, `/ru/...`, `/en/...`. `src/proxy.ts`
  redirects un-prefixed URLs to the visitor's last language (cookie
  `NEXT_LOCALE`), or to Armenian.
- All copy is in `src/locales/*.json`. `en.json` defines the shape;
  TypeScript fails the build if `hy.json` or `ru.json` miss a key.
- Pages are statically generated per locale with `hreflang` alternates,
  canonical URLs and `x-default` → Armenian.
- Project content lives in each project file (`content.en/hy/ru`).
- The language switcher keeps the current page and remembers the choice.

To add a string, add it to all three JSON files and read it from the
dictionary (`getDictionary(locale)` in server components). To add a
language, extend `locales` in `src/i18n/config.ts`, add its JSON file and
register it in `src/i18n/dictionaries.ts`.

## 3D intro

`src/components/three/` — an abstract, architectural model of a business
system: four stacked levels (systems, software, automation, AI) joined by
columns and conduits, lit by a procedural studio environment. Nothing is
downloaded: geometry, materials and lighting are all generated in code.

One scroll position drives everything (`choreography.ts`): the model
assembles, separates into labelled layers, connects, and resolves into the
hero. The DOM text is a GSAP timeline on the same ScrollTrigger.

| Concern | Handling |
| --- | --- |
| Loading | `next/dynamic`, client-only, after hydration. The hero text is server-rendered and readable before WebGL starts. |
| Device tiers | `high` (shadows, full detail, DPR ≤ 1.75), `low` (≤ 4 cores or ≤ 4 GB memory: DPR ≤ 1.25, less detail), `mobile` (separate camera framing, shorter track, DPR ≤ 1.5) |
| Frame budget | Adaptive DPR steps down when frames run slow |
| Off-screen | Render loop stops (`frameloop="never"`) when the intro leaves the viewport |
| Reduced motion | No scroll choreography: one still frame rendered on demand, the hero shown immediately |
| No WebGL2 | Static isometric SVG drawing of the same model |
| Skip | "Skip intro" scrolls straight to the hero and moves focus to its heading |

## Motion system

GSAP + ScrollTrigger + SplitText, with Lenis smooth scrolling driven by
GSAP's ticker. Timing tokens are in `src/config/motion.ts`. The major
moments are: the 3D intro, the statement wipe, the horizontal featured
work, the process diagram build, the scrubbed "why us" type, the closing
CTA panel and the case-study cover expansion. Everything else uses quiet
line or fade reveals. All animations are created inside `gsap.matchMedia`
and reverted on unmount. With `prefers-reduced-motion`, Lenis is off,
pinned sequences become normal sections, and content appears without
movement.

## Contact form

`/api/contact` validates with the same rules as the form
(`src/lib/contact/schema.ts`) and delivers through any channels configured
in the environment (several can run together):

| Channel | Variables |
| --- | --- |
| Webhook (CRM, Make, n8n, Zapier, own API) | `CONTACT_WEBHOOK_URL`, optional `CONTACT_WEBHOOK_SECRET` (Bearer) |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Email via Resend | `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM` |

Behaviour:

- **No channel, development:** the submission is logged in the terminal
  and the form says clearly that nothing was sent.
- **No channel, production:** the API answers `503 not_configured` and the
  form asks the visitor to email directly. It never pretends to deliver.
- Same-origin check, 16 KB body limit, honeypot field, and a best-effort
  in-memory rate limit (5 per 10 min per IP). On serverless hosting, add a
  shared limiter (e.g. Upstash, WAF rule) if spam becomes a problem.
- Homepage diagnostic links pre-select the business area (`?area=sales`).

## SEO

Per-page localized titles and descriptions, canonical URLs, `hreflang`
alternates (+ `x-default`), Open Graph and Twitter cards with generated
images per locale and per case study, `sitemap.xml` with language
alternates, `robots.txt`, and JSON-LD (Organization, WebSite,
CreativeWork + BreadcrumbList for case studies, Service list, AboutPage,
ContactPage). Set `NEXT_PUBLIC_SITE_URL` in production.

## Accessibility

Skip link · visible focus states · semantic landmarks and headings ·
keyboard-operable menu (focus trap, Escape), accordion, tabs (arrow keys)
and filters · `aria-current` navigation · text alternatives for every
visual and diagram · form labels, inline errors and announced status ·
custom cursor only for fine pointers · full reduced-motion support ·
`lang` set per locale.

## Deploy

**Netlify** (configured in `netlify.toml` with `@netlify/plugin-nextjs`):
connect the repository, keep the build command `npm run build`, and add the
environment variables from `.env.example` under *Site configuration →
Environment variables*.

**Vercel:** import the repository; the framework is detected
automatically. Add the same environment variables.

After the first deploy: set the custom domain, update
`NEXT_PUBLIC_SITE_URL`, submit `https://<domain>/sitemap.xml` to Google
Search Console and Yandex Webmaster, and send a test inquiry through the
contact form.

## Legacy files from the previous site

The repository still contains the previous site (`HAI_AI Systems`). Its
files were left untouched while this site was built:

- `src/app/layout.tsx` (root layout), `src/app/page.tsx`, `src/app/globals.css`,
  `src/app/creation/`, `src/app/icon.png`, `src/app/favicon.ico`
- `src/components/*.tsx` (top-level files only), `src/lib/i18n/`, `src/lib/pricing.ts`
- `public/cinema/`, `public/cinema-hd/`, `public/reels/` (~58 MB), robot and
  mascot images, `public/creation.html` and similar
- `.old-site-backup/`

The new site works with them in place: `/` redirects to `/hy`, and the new
`[lang]` layout renders inside the old root layout. That has side effects
until the cleanup is done. The initial HTML has `lang="en"` (corrected in
the browser), the old fonts and `globals.css` still load, and
`/creation` is still served.

**Recommended cleanup** (one commit, then `npm run build`): delete the files
above, and turn `src/app/[lang]/layout.tsx` into the root layout by having
it render `<html lang={lang}>` and `<body>` (moving the font classes onto
`<html>`). Remove `/creation` from `LEGACY_PATHS` in `src/proxy.ts`.
