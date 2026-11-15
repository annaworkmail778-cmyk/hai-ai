# 13 — Phase 2 Implementation Plan

**Do not start until the owner explicitly approves the readiness report.** Each step lists its output and how it is checked. Steps that create accounts, spend money or touch production need the owner to perform or approve them; Claude Code does not do them.

## 0. Owner prerequisites (owner performs)
- [ ] 0.1 Approve the architecture (Option C) and the decisions in the readiness report §10.
- [ ] 0.2 Upgrade Vercel to Pro. Confirm Vercel is the only deploy target (`netlify.toml` keep/remove decision).
- [ ] 0.3 Create two Supabase projects: `rise-staging` (Free) and `rise-prod` (Pro at go-live). Disable public sign-ups. Enable TOTP MFA.
- [ ] 0.4 Create an Anthropic API key for the Command Center workspace, with a **$100/month spend limit** (Phase C).
- [ ] 0.5 Enter secrets in Vercel env (production and preview separately). Never paste them into chat.
- [ ] 0.6 Decide the UI language (English first vs. Armenian), the model policy per agent, and the 40-day window start date.

## Phase A — Foundation
- [ ] A1 Branch `feat/command-center-foundation` from the current branch. Add tests and CI (`.github/workflows/ci.yml`: install, lint, typecheck, unit tests, gitleaks).
- [ ] A2 `src/proxy.ts`: exclude `admin` from the locale redirect. Add an optimistic admin cookie check. **Tests:** `/` → `/hy`, `/en/pricing` unchanged, `/admin` → `/admin/login` when no session.
- [ ] A3 `src/app/admin/layout.tsx` (own `<html>`, fonts from the shared config, `noindex`). `next.config.ts` headers for `/admin/:path*`. `robots.ts` disallows `/admin`.
- [ ] A4 Dependencies (after re-reading `node_modules/next/dist/docs` for v16 specifics): `@supabase/ssr`, `@supabase/supabase-js`, `drizzle-orm`, `postgres`, `drizzle-kit` (dev), `zod`, `server-only`, `@sentry/nextjs`, `vitest` (dev).
- [ ] A5 `src/admin/db/schema.ts` covering identity, roles, permissions, `audit_logs` and `notifications`. Generate SQL and **review it**. Apply to **staging only**. Create the DB roles `app_server` and `app_agent_worker` with grants (doc 06 §4). Remove `app` from the exposed schemas.
- [ ] A6 `src/admin/auth/*`: login, MFA enrol and verify, `requireUser({aal:'aal2'})`, step-up, sign-out-everywhere, invite flow (owner only).
- [ ] A7 `src/admin/dal/_authorize.ts` + `audit/log.ts` (redaction). Authorization unit tests (allowed and denied) for each role.
- [ ] A8 Shell UI: sidebar, header, theme, command palette skeleton, empty Overview. Clickable prototype with **labelled** illustrative data on staging. **Owner sign-off.**
- [ ] A9 Sentry with PII scrubbing. `/api/admin/health`.
- [ ] A10 Security checklist (doc 06 §10). Preview deploy smoke test of the public site and the contact form.

## Phase B — Business operations
- [ ] B1 Schema: CRM, finance, projects, tasks, `fx_rates`, `targets`, `sources`, `lead_candidates`, `discovery_searches`. Indexes per doc 05. Staging first.
- [ ] B2 DAL + Server Actions for companies, contacts, leads, opportunities, activities and meetings, with history and dedupe (normalized domain, tax ID, trigram name, email and phone).
- [ ] B3 Tables (TanStack Table): filters, sort, server pagination, saved views. Company page with tabs.
- [ ] B4 Pipeline kanban (14 stages) with stage rules (Won requires a contract or a note; Lost requires a reason).
- [ ] B5 Finance: contracts, milestones, invoices, payments (original currency + FX + equivalents), the 40-day tracker, overdue logic. **Unit tests on money math.**
- [ ] B6 Tasks + Today (deterministic top 3) + end-of-day review.
- [ ] B7 Projects + 4 templates.
- [ ] B8 Overview KPIs and charts from SQL. A verification SQL script per KPI.
- [ ] B9 CSV import into staging with a dedupe report. CSV export (owner, step-up, audited, formula-injection guard).
- [ ] B10 Contact form → lead insert (server-side, in addition to Telegram).
- [ ] B11 Production go-live of A+B: Supabase Pro, apply migrations to production after a backup, invite the team member, **import the Phase 1 sheet**, cut over.

## Phase C — AI operations
- [ ] C1 Schema: `agents`, `agent_tools`, `agent_runs`, `agent_steps`, `approvals`, `integrations`, `integration_events`, `rate_limits`. Approval triggers.
- [ ] C2 Agent registry files + sync on deploy (hash, version). Settings UI (owner).
- [ ] C3 Runtime: queue claim with leases, bounded loop, budgets, cancellation, `after()` kick + Vercel Cron worker (`CRON_SECRET`). Reread `shared` Anthropic SDK docs for the tool runner and server tools before coding.
- [ ] C4 Tool Gateway + tools: `kb.search`, `crm.find_company`, `candidates.create/update_score`, `research.read`, `drafts.create`, plus the server tools `web_search` / `web_fetch` with domain and `max_uses` config.
- [ ] C5 Agents: Market Research, Lead Qualification, Outreach (prompts, output schemas with `sources[]`, injection flags).
- [ ] C6 Find Clients UI: brief form with a cost estimate, run progress (polling), review table, approve to CRM.
- [ ] C7 Approvals Center + executor (manual-handoff executors for messages; `add_lead_to_crm` executor). Step-up for high risk. Expiry cron.
- [ ] C8 Agent Center UI: registry, run list, run detail, cancel, retry.
- [ ] C9 Telegram admin alerts (a separate bot): approvals waiting, failures, caps.
- [ ] C10 Tests:
  - gateway denies unlisted tools
  - executor rejects tampered payloads, expired items and wrong-role decisions
  - a lease-expiry recovery
  - the budget cap stops a run
- [ ] C11 Pilot run on staging, then production, with the owner watching. Review costs vs doc 09.

## Development-time Claude Code setup (alongside Phase A)
- `.claude/agents/security-reviewer.md`, `db-reviewer.md`, `ui-builder.md`.
- `.claude/rules/` (no external actions, no secrets, no fake production data).
- Hooks that block production deploys, pushes to the production DB and force-pushes.

## Rollback plan
- **Public site:** revert the proxy and config commits. The admin tree is isolated, so deleting `src/app/admin` and `src/admin` restores the current state.
- **DB:** forward-only migrations. Restore from the daily backup or the weekly dump if a migration corrupts data. Phase-gate production migrations behind a fresh backup.
