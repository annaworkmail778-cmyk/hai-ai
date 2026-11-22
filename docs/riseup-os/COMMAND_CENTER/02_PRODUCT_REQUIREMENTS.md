# 02 — Product Requirements

**Product:** RISEUP Command Center, a private, authenticated business operating system at `https://riseup-group.com/admin`.
**Users:**
- **Owner** (the founder): everything, including final approvals.
- **Team member** (research and operations): CRM, research, drafts and tasks; no finance-sensitive actions or high-risk approvals by default.
- **Agent service identities:** scoped tools only.

**Primary goal:** help RISEUP collect real cash, starting with $6,000 in 40 days (a target, not a forecast), and measure it honestly.

**30-second rule:** opening `/admin` must answer three questions. How much cash has actually arrived versus the target? What is stuck or waiting on me? What are the top 3 revenue actions today?

## Priority legend
- **P0:** MVP (Phases A–C)
- **P1:** Phase D
- **P2:** Phase E or later

## A. Overview (P0)

| Requirement | Detail |
|---|---|
| KPI tiles | Active prospects · new this week · qualified · meetings scheduled · proposals sent · in negotiation · signed · **cash collected** · **expected cash** · outstanding invoices · active projects · pending tasks · agents running · agent failures (24 h) · pending approvals |
| 40-day tracker | Target $6,000 · **actual cash received** · remaining · expected (probability-weighted, due within the window) · overdue. The window start date is configurable |
| Revenue breakdowns | By product and by client. **Cash received only**, unless the chart is explicitly labelled "contract value" |
| Separation rule | Three numbers are never summed together: contract value (signed), invoiced, and cash received. Each has its own colour and label |
| Filters | Date range presets (7 d, 30 d, the 40-day window, quarter, custom), plus a comparison with the previous period |
| Data truth | Every number is computed from database rows. There are no demo numbers in production; empty states say "No data yet" |

## B. AI Agent Center (P0: registry, runs, logs, stop; P1: start from the UI with templates)

- **Registry:** name, description, purpose, status (enabled/disabled), model and provider, allowed tools, permission scope, limits (timeout, max steps, token budget, monthly cost cap), version.
- **Runs:**
  - status: queued / running / waiting_approval / succeeded / failed / cancelled / timed_out
  - the task input
  - steps (tool calls and summaries)
  - output, with errors
  - cost (from the API usage fields)
  - duration
  - trace ID
- **Controls:**
  - start, with a task form
  - cancel/stop (cooperative: checked between steps)
  - retry (creates a new run linked to the original)
  - pause = disable the agent for new runs
- **Status shown is backend state only.** "Running" means a worker holds the run's lease and its heartbeat is less than 60 s old.
- **No hidden reasoning is stored or shown.** The system stores summaries, tool calls, tool results (truncated and redacted), outputs and decisions.

## C. Find Clients: prospect discovery (P0 manual + agent-assisted; P1 saved searches and batch runs)

- **Search brief inputs:** industry, country, city, company type, size band, commercial value band, business problem, automation opportunity.
- **Pipeline:**
  1. discovery
  2. website research
  3. public business info
  4. public decision makers, where published
  5. problems
  6. opportunities
  7. score
  8. estimated deal value
  9. recommended offer
  10. outreach draft
- **Each discovered lead must contain:**
  - name, website, industry, location
  - **verified** public contacts
  - public decision makers
  - **source URLs**, research date, confidence
  - opportunity, suggested product, score with its breakdown
  - estimated deal size, next action, CRM status
- **Staging:** discoveries land in `lead_candidates` (status `pending_review`). A human must approve before a candidate becomes an active company or lead in the CRM. This is an approval of type `add_lead_to_crm`.
- **Import/export:** CSV import into staging (with dedupe preview) and CSV export of any table view.
- **Guardrails:**
  - no fabricated data; a missing field is shown as "Unknown"
  - every claim has a source
  - no scraping that violates a site's terms
  - no purchased lists

## D. CRM (P0)

- **Entities:** companies, contacts, leads, opportunities, activities (calls, meetings, emails, DMs, notes), proposals, contracts, payments, follow-ups (tasks of type follow-up).
- **Pipeline stages, exactly 14:**
  1. Discovered
  2. Researched
  3. Qualified
  4. Contact ready
  5. Contacted
  6. Responded
  7. Meeting scheduled
  8. Meeting completed
  9. Proposal prepared
  10. Proposal sent
  11. Negotiation
  12. Won
  13. Lost
  14. Follow-up later
- **Change history:** every important field change is recorded (who or which agent, before/after, time).
- **Dedupe:** companies on normalized domain, then tax ID, then name + city (fuzzy matches flagged). Contacts on email or E.164 phone.
- **Rules:**
  - "Won" requires a signed contract record **or** an owner confirmation with a note
  - "Lost" requires a reason

## E. Outreach Center (P0 drafts and approval; P2 sending integrations)

- **Drafts** in hy, ru and en: emails, DMs, call scripts, follow-up sequences, meeting briefs, proposal follow-ups.
- **Approval card:** exact recipient, channel, subject, full body, and the facts used (with sources).
- **MVP sending is manual.** After approval the UI offers copy-to-clipboard and opens the channel (mailto or the profile link). The human sends the message, then clicks **Mark as sent**, which records the time.
- **Replies:** logged manually in the MVP; automatic only once an integration supports it (Gmail, Phase E).

## F. Finance (P0: contracts, invoices, payments, 40-day tracker; P1: costs and profitability)

- **Money storage:** original amount + currency (AMD/USD/EUR) + the FX rate used + the USD and AMD equivalents at the transaction date. **Rates are entered manually or from the CBA rate (NEEDS VALIDATION as a source)** and recorded on each row.
- **Records:**
  - contracts: value, setup and monthly components
  - payment milestones: deposit, go-live, etc.
  - invoices
  - payments received, with the bank reference
  - outstanding amounts
  - MRR
  - monthly operating costs, including infrastructure and AI spend
  - project profitability = cash received − direct costs − time × hourly rate (the rate is an owner setting)
- **Finance-wide permissions:** viewing finance is owner-only by default; the team member gets read access only if the owner grants it.

## G. Projects (P0 basic; P1 templates)

- **Fields:**
  - client, product, scope, contract value, payment status
  - start date, deadline
  - milestones and tasks, assignee
  - technical status, risks, deliverables
  - client approvals, completion
- **Templates:** Developer Sales OS, Solar Operations OS, Enterprise Automation, Small Business Automation. Each is a milestone and task list based on Phase 1 doc 20.
- **Agent limits:** agents may draft plans and status reports. **They cannot deploy or modify client systems**; those actions are approval types `deploy_code` and `modify_client_system`, and in the MVP they are executed by a human outside the system.

## H. Tasks and Today (P0)

- **Today view:** top 3 revenue actions, my tasks, overdue items, meetings today and tomorrow, follow-ups due, agent recommendations (each with an Accept/Dismiss action), and an end-of-day review form.
- **Assignees:** founder, team member, or an agent (an agent task = a queued agent run).
- **"Top 3" rule:**
  - start from the deterministic ranking: overdue follow-ups on deals at stage ≥ 7 → proposals awaiting decision → hot A-tier leads not yet contacted → invoices due
  - the Executive Assistant agent (Phase D) may re-rank, but must show the reason for each item

## I. Approvals Center (P0)

- **Unified queue.** Each item shows:
  - the requesting agent or user
  - the action type and exact target
  - the full payload
  - the reason, risk level (low/medium/high/critical) and expected result
  - expiry
  - Approve / Reject (reject requires a reason)
- **Enforced by the backend** (doc 06): agents cannot execute gated actions; only the executor can, and only with a valid approval whose payload hash matches.
- **Action types:**
  - `add_lead_to_crm`, `send_email`, `send_instagram_dm`, `send_whatsapp`, `send_telegram`
  - `publish_content`, `create_proposal`, `send_proposal`, `change_contract`
  - `make_payment`, `modify_client_system`, `deploy_code`, `delete_data`, `export_data`
- **Who approves:**
  - High and critical items: **owner only**, with a fresh MFA step-up (re-authentication within 10 min)
  - Low-risk items (`add_lead_to_crm`): owner or team member

## J. Knowledge Base (P1; P0 = company facts + pricing only)

- **Documents:** company profile, brand, products, pricing, scripts, proposals, technical docs, requirements, project docs, research, SOPs.
- **Fields:** classification (`public`, `internal`, `confidential`, `client:<id>`) and owner.
- **Agent retrieval** is filtered by the agent's allowed classifications and the run's client scope, so one client's data never reaches another client's run.
- **"Approved claims" list:** the only facts outreach and proposal agents may state about RISEUP. This implements the Phase 1 rule: never invent achievements.
- **Retrieval method:** MVP uses tags + Postgres full-text search. Vector search (pgvector) is added only if FTS proves insufficient.

## K. Settings and Integrations (P0: users, roles, agent limits, integration status; P2: OAuth connections)

- **Per integration:** status (not configured / connected / error), last successful sync, scopes, last error, configured-by.
- **Secret handling:** values never reach the browser. The UI shows only "set / not set" and the last 4 characters at most.

## Non-functional requirements

| | |
|---|---|
| Performance | Overview TTFB < 500 ms with server rendering (p75); tables paginate server-side at 50 rows |
| Availability | Best effort on Vercel + Supabase; daily backups (doc 05) |
| Responsiveness | Desktop first; every page usable at 375 px width |
| Accessibility | WCAG 2.2 AA contrast, using tokens already chosen for contrast (`mute` 9:1 on black, `mute-ink` 7:1 on paper); keyboard navigable; command palette |
| Language | UI labels in **English first**, with i18n-ready keys. Armenian UI is a decision (doc 13). Content fields accept hy/ru/en |
| Honesty | No simulated activity in production. Demo data is allowed only in a separate `demo` environment, labelled |
