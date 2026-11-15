# 01 — Repository Audit

Audited 2026-11-15. Branch `claude/premium-tech-portfolio-site-xk28q4` (head `834356d`), working tree clean. The audit was read-only; no files were changed. Secret values were not read or printed; only variable names were taken from `.env.example`.

## 1. Summary

| Area | Finding | Evidence |
|---|---|---|
| Framework | **Next.js 16.2.9** (App Router, Turbopack, `proxy.ts` instead of `middleware.ts`), **React 19.2.4**, TypeScript 5 | `package.json` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), design tokens in CSS | `src/styles/site.css`, `postcss.config.mjs` |
| Motion / 3D | GSAP + `@gsap/react`, Lenis, three + `@react-three/fiber` | `package.json`, `src/components/three/*` |
| Frontend architecture | Every public page lives under `src/app/[lang]/` (`hy`, `ru`, `en`). `[lang]/layout.tsx` is the **root layout**; there is no `src/app/layout.tsx`. Dictionaries are in `src/locales/*.json` | `src/app/[lang]/layout.tsx:42-44` |
| Backend | **One API route**: `POST /api/contact`. It does a same-origin check, content-type and size limits, a honeypot, rate limiting and validation, then delivers to webhook, Telegram and/or Resend | `src/app/api/contact/route.ts`, `src/lib/contact/*` |
| Database | **None** | No DB client or ORM in dependencies |
| Authentication / authorization | **None** | No auth library, no session code |
| Admin routes | **None.** See §3 for how `/admin` currently resolves | `src/app/` tree |
| Dashboard components | **None for real data.** `src/components/demos/*` and `src/components/visuals/scenes/*` are animated marketing mock-ups (salon, shop, real estate, marketing). They are visually useful as references but are not data-bound | `src/components/demos/registry.ts` |
| Integrations | Contact form → Telegram bot (confirmed working by the founder), optional generic webhook (`CONTACT_WEBHOOK_URL`, intended for n8n), optional Resend email | `src/lib/contact/deliver.ts`, `.env.example` |
| AI functionality in the repo | **None at runtime.** The AI admin product (n8n + ManyChat) runs outside this repo. `reels/` is a Remotion video pipeline (offline rendering), not a runtime feature | `reels/` |
| Claude Code agents / skills | No project agents (`.claude/agents/` absent). `.claude/skills/` and `.agents/skills/` contain **third-party Higgsfield skills** and are gitignored. `.claude/launch.json` holds a dev-server config | `.gitignore`, `ls .claude` |
| Documentation | `README.md`, `AGENTS.md`/`CLAUDE.md` (Next.js version warning), brand and content guides, `docs/plan-60-days.md`, `docs/marketing/*`, **Phase 1 docs in `docs/riseup-os/`** (22 docs + README) | `docs/` |
| Tests / CI | **No tests, no CI** (`.github/` absent). Scripts: `dev`, `build`, `start`, `lint`, `typecheck` | `package.json` |
| Deployment | The founder reports **Vercel**, with the production branch set to this branch and the domain riseup-group.com on GoDaddy. The repo **also** contains a `netlify.toml` (legacy; `@netlify/plugin-nextjs` is not a dependency), and the README documents both | `netlify.toml`, `README.md:217-227` |
| Env / secrets | `.env*` is gitignored except `.env.example`. Variable names: `NEXT_PUBLIC_SITE_URL`, `CONTACT_WEBHOOK_URL`, `CONTACT_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`. `process.env` is read only in server code (`deliver.ts`, `route.ts`) and `brand.ts` (the public URL only) | `.env.example` |
| Security headers | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, `poweredByHeader: false`. **No CSP and no HSTS** configured in the app; Vercel may add HSTS on its domains (NEEDS VALIDATION) | `next.config.ts` |
| Rate limiting | In-memory sliding window, per instance. The code itself says it is **not reliable on serverless** | `src/lib/contact/rate-limit.ts` |
| robots | `disallow: ["/api/"]`. `/admin` would need its own `noindex` and an addition to the disallow list | `src/app/robots.ts` |

## 2. Brand assets reusable by the Command Center

- **Colours** (`site.css`):
  - ink `#080808`, graphite `#111111`, carbon `#181818`, steel `#262626`, ash `#3a3a3a`
  - paper `#f3f2ee`, bone `#e7e5df`, stone `#d4d2cb`
  - mute `#b4b3ae` / mute-ink `#55544f`
  - **signal (accent) `#ff5b14`**
  - semi-transparent rule lines
- **Fonts:** Geist (Latin/Cyrillic), Noto Sans Armenian (per-glyph fallback), Geist Mono for technical labels. All are local TTFs in `src/assets/fonts/` (used for OG images) or loaded via `next/font/google`.
- **Logo and wordmark:** `src/config/logo.ts`, `src/components/layout/Wordmark.tsx`.
- **Brand config:** `src/config/brand.ts` (contact info, social links, time zone).

## 3. How `/admin` resolves today (source analysis)

1. `src/proxy.ts` matches every path except `_next`, `api`, `icon`, `apple-icon` and files with an extension. `/admin` has no locale prefix, so the proxy **redirects (307) to `/hy/admin`**, or to the locale saved in the `NEXT_LOCALE` cookie.
2. `/hy/admin` matches `src/app/[lang]/[...rest]/page.tsx`, which calls `notFound()`. The result is the **localized 404 page**.

**Conclusion:** no admin route exists in the source code. A public 404 at `/admin` is consistent with this. Adding `/admin` requires two changes:
- (a) exclude `admin` (and `api/admin`) from the proxy matcher;
- (b) add a second root layout for the admin tree.

Next.js supports multiple root layouts. Navigating between them causes a full page load, which is acceptable here (Next.js docs: `01-app/03-api-reference/03-file-conventions/route-groups.md`).

## 4. Live website inspection

`https://riseup-group.com` could **not be fetched from this cloud environment**. The environment's network policy denied the host (proxy `CONNECT 403`). As a result, the following are **NEEDS VALIDATION**:
- live HTTP headers (HSTS, `server: Vercel`)
- the live response for `/admin`
- the mobile rendering

The source code above is the deployed branch, so routing behaviour can be inferred from it with high confidence. To allow a live check, add `riseup-group.com` under *Allowed domains* in the cloud environment's network settings.

## 5. What is reusable for the Command Center

| Reuse | How |
|---|---|
| Next.js 16 app, TypeScript, Tailwind v4, the fonts and the colour tokens | Same repo, a separate admin root layout |
| Contact-form delivery (`deliver.ts`) | The website form becomes a lead source: Phase B adds a server-side insert into `leads` |
| Telegram bot pattern | Notifications for approvals and agent failures (Phase C/E) |
| API hardening patterns in `route.ts` (origin check, size limits, validation) | Template for admin route handlers |
| Demo UI kit (`components/demos/kit.tsx`) | Visual reference only; it is not data-bound |
| Phase 1 docs (`docs/riseup-os/*`): scoring model, pipeline, data model, workflow | Input requirements (doc 02) |

## 6. Gaps

- No database, auth, roles, audit log, job runner or LLM SDK.
- No tests or CI. These are required before handling financial data.
- No CSP. The rate limiter is not distributed.
- Hosting plan: Vercel Hobby is for non-commercial use only. **Vercel Pro is required** once the business runs on it (doc 09).
- Ambiguous deploy configuration (`netlify.toml` present alongside Vercel).
