# Rise Command Center — Readiness Report

Prepared 2026-11-15. Status: **architecture proposed, awaiting owner approval. No implementation has started.** No code, database, deployment, DNS or environment variables were changed; only documentation was added.

## 1. What currently exists (evidence: doc 01)
- A public Next.js 16.2.9 / React 19.2 site with i18n under `/[lang]`, Tailwind v4 brand tokens, Geist + Noto Sans Armenian.
- One hardened API route (`/api/contact`) delivering leads to Telegram (working), plus an optional webhook and Resend.
- `/admin` does **not** exist. Today it redirects to `/hy/admin`, which renders the localized 404.
- No database, auth, roles, job runner, LLM SDK, tests or CI.
- Remotion video pipeline (offline). Third-party Higgsfield skills (gitignored). No project Claude Code agents.
- Phase 1 business docs in `docs/riseup-os/`: the scoring model, pipeline, workflow and financial model are reused as requirements.
- The live site could not be inspected from this environment (network policy). These items are **NEEDS VALIDATION**: live headers, the `/admin` response and the mobile view.

## 2. What is missing
Everything in the platform: auth with MFA, data model, DAL, admin UI, agent runtime, approvals executor, audit logging, backups, monitoring, CI/tests, and a commercial hosting plan (Vercel Pro).

## 3. Recommended architecture (Option C: hybrid)
- **Same repo and deploy**, with `/admin` as a **separate root layout** and isolated `src/admin/**` modules. This can be split into its own app later without a rewrite.
- **Supabase:** Auth with mandatory TOTP MFA and step-up, Postgres in a **non-exposed `app` schema** accessed only server-side through a Data Access Layer with role-based authorization, RLS as defence in depth, and private Storage.
- **Drizzle** for typed, reviewed SQL migrations.
- **Agent runtime in the app:** Anthropic Messages API + tool use, a Postgres-backed queue with leases, Vercel Cron + `after()` workers, a Tool Gateway, budgets and full run logs. **No Redis, no extra orchestrator.**
- **Approvals enforced by the backend executor and DB grants.** Agents can only request; humans decide; the executor re-verifies the approval and payload hash before any side effect. Sending is a manual handoff in the MVP.
- **MVP agents:** Market Research → Lead Qualification → Outreach. The other six are phased in once there is data and a measured need.

## 4. Why this is right for Rise
- **Fastest path:** it reuses the existing stack, brand and deploy, and adds only two services (Supabase and the Anthropic API).
- **Cheapest:** about $45–50/month fixed in production, plus capped AI usage. The $20 Vercel Pro is needed for the public site anyway.
- **Secure by construction:** no browser access to the database, MFA everywhere, backend-enforced approvals, and agents without external tools.
- **No rewrite later:** provider, model, agents, integrations and app split are all extension points, not refactors.

## 5. Estimated development time
| Scope | Build days (Claude Code implements, founder reviews) | Calendar |
|---|---|---|
| Phase A Foundation | 4–6 | ~1 week |
| Phase B Business Ops | 8–12 | ~2 weeks |
| Phase C AI Ops | 8–12 | ~2 weeks |
| **MVP (A+B+C)** | **20–30** | **~4–6 weeks** |
| Phase D Growth | 10–15 | +2–3 weeks |
| Phase E Integrations | 10–20 | +2–4 weeks |

## 6. Estimated monthly cost (doc 09)
| Stage | Fixed | AI (capped) | Total |
|---|---|---|---|
| MVP build | $20–45 | $10–30 | **$30–75** |
| First 3 months | $45–50 | $45–200 (cap recommended at $100) | **$90–250** |
| Growth | $120–220 | $200–800 | **$320–1,000** |

## 7. Main security risks (doc 06, doc 12)
Account takeover · broken authorization · secret leakage via previews or logs · prompt injection → action · fabricated data entering the CRM · cost overrun · missing backups on the Free plan · public site broken by routing changes.

## 8. Technical dependencies
Vercel Pro · Supabase (staging Free, production Pro) · Anthropic API key with a spend limit · Sentry (free) · new npm packages: `@supabase/ssr`, `@supabase/supabase-js`, `drizzle-orm`, `postgres`, `drizzle-kit`, `zod`, `server-only`, `@tanstack/react-table`, `cmdk`, `@sentry/nextjs`, `vitest` (plus a chart library or hand-rolled SVG). Validate current versions and Next 16 compatibility at install time.

## 9. Implementation priorities
1. Cash truth and the CRM: the finance tracker, pipeline and Today (helps the 40-day target immediately).
2. Security foundation (Phase A): this cannot be skipped.
3. Research and qualification agents feeding human-reviewed candidates.
4. Outreach drafts with approvals.
5. Everything else, only after first revenue and 2 weeks of real use.

## 10. Must be approved before development begins
1. **Option C (hybrid)**: an `/admin` route in the existing repo with isolated modules.
2. **Stack:** Supabase (Auth + Postgres + Storage), Drizzle, Anthropic-only agent runtime, Postgres queue (no Redis or Inngest yet).
3. **Purchases (the owner performs them):** Vercel Pro ($20/mo) now; Supabase Pro ($25/mo) at production go-live.
4. **AI budget:** Anthropic spend limit of $100/month and an in-app cap of $90 during the 40-day window. **Model policy:** all agents on `claude-opus-5-5` by default, or cheaper models for specific agents (owner's choice; see doc 09).
5. **MVP agent set:** Market Research, Lead Qualification, Outreach.
6. **Sending policy:** manual handoff after approval (no automated sending in the MVP).
7. **Roles:** owner = founder; team_member = second team member, with no finance access by default.
8. **UI language:** English first, Armenian later; or Armenian from day 1.
9. **Cut-over:** import the Phase 1 Google Sheet into the Command Center at the end of Phase B.
10. **Deploy target:** confirm Vercel only (decide what to do with `netlify.toml`).
11. **Retention periods** (doc 05 §4), to be confirmed with the Armenian lawyer and accountant.
12. **Live-site validation:** either allow `riseup-group.com` in this environment's network settings, or the owner checks `/admin` and the headers in a browser.

## 11. Final architectural decision

| | Option A: Lean MVP | Option B: Full Command Center | **Option C: Hybrid (recommended)** |
|---|---|---|---|
| Scope | CRM, cash tracker, tasks, 1–2 simple AI actions (single LLM calls, no runtime) | All 11 modules, 9 agents, integrations, realtime, advanced orchestration | A+B+C phases now (CRM, finance, tasks, projects, 3 agents, approvals, logs); D/E later on the same foundation |
| Development time | ~2.5–3.5 weeks | ~3–4 months | **~4–6 weeks to MVP**; full vision in ~3 months, incrementally |
| Initial cost | ≈ $20–45 | ≈ $100–250 (more services from day 1) | ≈ $30–75 |
| Monthly cost | ≈ $45 + small AI | ≈ $300–1,000 | ≈ $90–250, scaling with use |
| Technical complexity | Low | High | Medium |
| Business value (40 days) | Medium: tracking only | Low early, since it is unfinished during the window | **High**: tracking from week 2–3, AI pipeline from week 5 |
| Scalability | Weak: adding a runtime and approvals later means a rework | High | High: the extension points are designed in |
| Security implications | Smaller surface, but tends to skip approvals/audit design | Largest surface (many integrations and OAuth tokens) | Proportionate: full security foundation, small integration surface |

**Recommendation: Option C.** It matches the owner's stated preference. Option A would likely need its data layer and approvals rebuilt once agents arrive. Option B would not be usable within the 40-day window and would take time away from sales.

**Waiting for explicit approval before implementing.**

## Document index
01 Repository Audit · 02 Product Requirements · 03 System Architecture · 04 Agent Architecture · 05 Database Schema · 06 Security Architecture · 07 UI/UX Specification · 08 Integrations and APIs · 09 Cost and Infrastructure · 10 MVP Roadmap · 11 Workflow Diagrams · 12 Risk Register · 13 Phase 2 Implementation Plan
