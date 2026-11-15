# 10 — MVP Roadmap

## The constraint to be honest about

The 40-day cash target depends on **sales calls and meetings**, not on software. Every day the founder spends building is a day not selling. So:

- **Claude Code does most implementation.** The founder reviews and approves; budget about 2–3 founder hours a day for the build.
- The **Phase 1 manual process** (Google Sheets + calls) keeps running from day 1. The Command Center replaces it only when Phase B is live, through a CSV import.
- **Build order follows revenue usefulness:**
  1. cash tracking + CRM + tasks first, which helps immediately
  2. agents second
  3. integrations last

Estimates are **working days of build effort**, with Claude Code doing the coding and the founder reviewing. They assume no major blockers. Calendar time is about 1.5× because of the parallel sales work.

## Phase A — Foundation (≈ 4–6 days)

| | |
|---|---|
| Deliverables | Admin root layout and shell (sidebar, header, theme). `proxy.ts` matcher change. Supabase projects (staging + production). Auth: invite-only, TOTP MFA, step-up. Roles and permissions. DAL skeleton with `requireUser`/`authorize`. Drizzle schema for identity + `audit_logs` + `notifications`. Audit logging. Security headers and noindex for `/admin`. Sentry. CI (lint, typecheck, unit tests, gitleaks). Clickable prototype of 4 screens (illustrative data, staging only) |
| Dependencies | Owner approvals in doc 13 / readiness report. Vercel Pro. Supabase accounts (the owner creates them; the agent never creates accounts) |
| Complexity | Medium |
| Risks | Breaking the public site's routing (mitigation: proxy tests and a preview deploy check of `/hy`, `/en`, `/ru` and `/admin`). Auth misconfiguration |
| Acceptance | An unauthenticated request to `/admin/*` redirects to the login page. A user without MFA cannot reach any page. Team-member access is denied to finance (tested). The audit row is written on login. The public site behaves exactly as before (smoke test of all locale pages and the contact form). The security checklist (doc 06 §10) passes |

## Phase B — Business Operations (≈ 8–12 days)

| | |
|---|---|
| Deliverables | Companies, contacts, leads, opportunities, activities, meetings. Pipeline (14 stages) as kanban + table. Dedupe. Change history. CSV import/export. **Finance:** contracts, milestones, invoices, payments with currency and FX, and the 40-day tracker. Tasks + Today view (deterministic top 3). Projects (basic) with templates. Overview KPIs from real data. The website contact form also creates a lead |
| Dependencies | Phase A |
| Complexity | Medium |
| Risks | Scope creep in the CRM UI (mitigation: tables first, kanban second). FX handling errors (mitigation: store the original amount and the rate on each row, with unit tests) |
| Acceptance | Importing the Phase 1 Sheets CSV produces the correct dedupe report. Recording a payment updates "cash received", while signing a contract does **not**. Every KPI matches a SQL check query. Mobile at 375 px is usable for Today, the pipeline and recording a payment |

## Phase C — AI Operations (≈ 8–12 days)

| | |
|---|---|
| Deliverables | Agent registry (synced from the repo), Postgres queue + worker + cron, Tool Gateway, budgets and caps, run logs and steps. **Market Research**, **Lead Qualification** and **Outreach** agents. Find Clients brief → review → approve-to-CRM. **Approvals Center** with the backend executor (manual-handoff executors for sending). Telegram notifications |
| Dependencies | Phase B tables. Anthropic API key with a spend limit (the owner sets it up) |
| Complexity | High (correctness of approvals and leases) |
| Risks | Hallucinated companies or contacts (mitigation: source-required schema plus human review). Runaway cost (caps). Injection (no external tools for research agents) |
| Acceptance | A test run on "residential developers, Yerevan, 10 companies" produces candidates in which **every** claim has a source URL, and duplicates are detected against the CRM. A rejected approval cannot be executed. An approval with an edited payload fails the hash check. A cancel stops a run within one step. The cost shown equals the API usage × price table. A forced model error yields `failed` with the error visible. An agent cannot call a tool not in its allow-list (test) |

**MVP = A + B + C ≈ 20–30 build days ≈ 4–6 calendar weeks.**

## Phase D — Growth (≈ 10–15 days)
- **Deliverables:** saved discovery searches and batch runs (Batch API for cost), Proposal agent + proposal templates and approval, Sales Strategist meeting briefs, Executive Assistant daily brief (a Telegram summary at 08:30), Finance Analyst, sales analytics (conversion by stage, source, segment), and knowledge base with classification and scoped retrieval.
- **Dependencies:** MVP running for 2+ weeks with real data.
- **Complexity:** medium-high.
- **Risks:** low-value automation. Gate each agent on measured use.
- **Acceptance:** the daily brief cites real records only. Proposal pricing matches the approved pricing doc.

## Phase E — Advanced integrations (≈ 10–20 days)
- **Deliverables:** Gmail (send approved emails, detect replies), Google Drive, two-way Sheets sync if still needed, n8n webhooks (ManyChat/Instagram inbound leads), Project Manager and Technical Architect agents, advanced reporting.
- **Dependencies:** OAuth app verification (Google), the n8n licence decision, and a legal review of outreach (Phase 1 doc 16).
- **Complexity:** high.
- **Risks:** OAuth scopes, platform policies, compliance.
- **Acceptance:** an email sent via Gmail exists only for executed approvals (the audit trail matches one-to-one). Replies are linked to the right contact.

## Timeline sketch (from approval day)

```
Week 1  ██ Phase A (foundation + prototype sign-off)          | sales: Phase 1 manual process
Week 2  ███ Phase B (CRM, finance tracker, tasks)              | sales: meetings
Week 3  ███ Phase B → CSV import, switch from Sheets           |
Week 4  ███ Phase C (runtime, approvals, research agent)       |
Week 5  ██ Phase C (qualification, outreach, hardening)        |
Week 6+ Phase D only after first revenue and 2 weeks of usage  |
```
