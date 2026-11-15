# 07 — UI / UX Specification

## 1. Design principles

1. **Numbers before decoration.** Every chart answers a question the founder asks weekly. If a chart answers nothing, drop it.
2. **Truth labels:** "Cash received" (solid accent), "Expected" (outlined), "Contract value" (neutral). They never share a colour.
3. **Every control works or is labelled.** A button without a backend is rendered disabled with a "Coming in Phase X" tooltip. There are no dead buttons.
4. **Empty states teach:** for example, "No prospects yet. Start a search in Find Clients, or import a CSV."
5. **Same brand as the public site, calmer.** Use the same palette and type, with no 3D or scroll effects, and dense tables.

## 2. Visual system (reused from `src/styles/site.css`)

| Token | Value | Admin use |
|---|---|---|
| `ink` / `graphite` / `carbon` / `steel` | #080808 / #111 / #181818 / #262626 | Dark theme (default): app background, sidebar, cards, borders |
| `paper` / `bone` / `stone` | #f3f2ee / #e7e5df / #d4d2cb | Light theme surfaces |
| `mute` / `mute-ink` | #b4b3ae / #55544f | Secondary text (contrast already ≥ 7:1) |
| **`signal`** | **#ff5b14** | Primary actions, **cash received**, focus ring. Used sparingly |
| Status colours (new, admin-only) | success `#3fb950`, warning `#d29922`, danger `#f85149`, info `#58a6ff` (proposal; check contrast in Phase A) | Run status, approvals risk, overdue |
| Type | Geist (UI), Noto Sans Armenian fallback, **Geist Mono for numbers and IDs** (tabular figures) | |
| Radius / spacing | 8 px cards, 6 px inputs; 4-pt spacing scale | |
| Motion | 150 ms fades only; respects `prefers-reduced-motion` | |

Light and dark themes are both supported; dark is the default, matching the public site's dark sections.

## 3. Layout

```
┌───────────┬──────────────────────────────────────────────────────────────┐
│ RISE  ▾   │  ⌘K Search…                     ● 1 agent running  🔔 3  (A) │
│───────────│──────────────────────────────────────────────────────────────│
│ Overview  │                                                              │
│ Today     │   main content                               ┌─────────────┐ │
│ Find      │                                              │ context     │ │
│ Clients   │                                              │ side panel  │ │
│ CRM ▸     │                                              │ (record     │ │
│ Outreach  │                                              │  details,   │ │
│ Approvals │                                              │  run log)   │ │
│ Agents    │                                              └─────────────┘ │
│ Finance   │                                                              │
│ Projects  │                                                              │
│ Knowledge │                                                              │
│ Settings  │                                                              │
└───────────┴──────────────────────────────────────────────────────────────┘
```

- **Sidebar:** collapsible to icons. The Approvals item shows a pending count.
- **Header:**
  - global search across companies, contacts, leads, projects and docs (server-side FTS)
  - the agent status indicator, a real count of `running` runs, which links to Agents
  - a notification bell
  - the user menu: theme, MFA, sign out, sign out everywhere
- **Command palette (⌘K / Ctrl-K):** navigate, "New company", "Start research…", "Record payment", "Log call".
- **Mobile (< 768 px):** bottom tab bar (Today, CRM, Approvals, Finance, More). Side panels become full-screen sheets. Tables become card lists.

## 4. Screens

### Overview (`/admin`)

```
[ 40-DAY CASH ]  $2,150 received  ▕████████░░░░░░░░░▏ 36% of $6,000   Day 17/40
                 Expected by day 40: $2,900 (weighted)  · Overdue: $450   · Remaining: $3,850
[KPIs] Prospects 214 · New 7d 38 · Qualified 41 · Meetings 6 · Proposals 4 · Negotiation 2 · Signed 1
       Outstanding invoices $1,500 · Active projects 1 · Tasks due 9 · Agents running 1 · Failures 24h 0 · Approvals 5
[Cash by week: bars received vs expected]   [Funnel: Discovered→Won with conversion %]
[Revenue by product (cash)]                 [Lead sources]                 [Agent activity 7d]
```
The numbers above are **illustrative only**.

- Date-range picker and "compare to previous period" on the KPIs and charts.
- Every KPI tile is a link to the filtered list.

### Today (`/admin/today`)
- **Top 3 revenue actions**, each with its reason and a one-click action: log call, open draft.
- My tasks / overdue / meetings today and tomorrow / follow-ups due / agent recommendations (Accept, Dismiss).
- **End-of-day review:** auto-filled counts plus free text, "blockers" and "tomorrow's top 3". It is saved as an `activities` note.

### Find Clients (`/admin/find-clients`)
- **Search brief form:** industry, country, city, company type, size, value band, problem, opportunity, max companies (default 10). It shows a **cost estimate before starting**.
- **Run progress:** a live (polled) step list, e.g. "searched 6 queries · fetched 14 pages · 9 candidates".
- **Review table:** candidate, website, location, score (with breakdown on hover), est. value, suggested offer, confidence, sources count, duplicate warning.
- **Candidate detail panel:** each claim with its source link and access date, plus an "unsourced" badge where one is missing.
- **Actions:**
  - bulk **Approve to CRM** (creates and auto-approves `add_lead_to_crm` approvals for the selected rows)
  - Reject (requires a reason)
  - Mark duplicate
- CSV import (with preview and dedupe report) and export.

### CRM (`/admin/crm/companies`, `/contacts`, `/leads`, `/pipeline`)
- Tables with column filters, sort, server pagination, saved views (per user) and a column picker.
- **Pipeline:** a kanban across the 14 stages, plus a table toggle. Drag to change stage, which writes an `activities` row (`stage_change`). Moving to Won requires a contract or a note; Lost requires a reason.
- **Company page:**
  - header: name, segment, score, owner, status
  - tabs: Timeline · Contacts · Opportunities · Research and Sources · Messages · Proposals · Files
  - a "History" drawer with field-change audit entries

### Outreach (`/admin/outreach`)
- Draft list by status. The editor shows recipient, channel, language, subject and body side by side with the "facts used" and their sources.
- **Submit for approval** → appears in Approvals.
- Once approved: **Copy**, **Open channel**, **Mark as sent**, then **Log reply**.

### Approvals (`/admin/approvals`)
- **Each card:**
  - risk badge
  - action type
  - requester (agent or user, with a link to the run)
  - **exact target** (e.g. "anna@example.am · Email")
  - **full payload** (rendered text plus a "raw" toggle)
  - reason
  - expected result
  - expiry
  - Approve / Reject (reason required)
- High and critical items require a step-up TOTP modal.
- Filters: pending, mine, decided, executed, failed.

### Agents (`/admin/agents`, `/admin/agents/[key]`, `/admin/agents/runs/[id]`)
- **Registry table:** name, status, model, tools, monthly spend vs cap, last run, success rate (30 d).
- **Agent page:** purpose, tools (read-only for team members), limits, **Start run** (task form defined per agent), and the run history.
- **Run page:**
  - status timeline
  - steps (model calls, tool calls with inputs and output excerpts)
  - cost and tokens
  - output, rendered with sources
  - linked approvals
  - **Cancel** and **Retry** buttons
- There is no "thinking" panel; the page shows summaries only.

### Finance (`/admin/finance`)
- Tabs: Tracker · Contracts · Invoices · Payments · Costs · Profitability.
- **Record payment** form: amount, currency, date, method, bank reference, invoice match, FX rate (prefilled, editable).
- Each amount shows the original currency, with converted values in muted text.

### Projects (`/admin/projects`)
- A list, then the project page: milestones (with client approval toggle), task board, risks, deliverables and payment status.
- "New from template" with the 4 product templates.

### Knowledge (`/admin/knowledge`)
- A document list with kind, classification and client scope; a Markdown editor; file attachments.
- An **Approved claims** page (owner-editable). Agents cite it.

### Settings (`/admin/settings`)
- Users and roles (invite, disable, sign out everywhere)
- Agents (enable, model, caps)
- Integrations: a status card for each, showing configured / connected / last sync / error / scopes, and **never values**
- Targets (the 40-day window)
- FX rates, Security (MFA status), Backups (last run)

## 5. States (every data view)

| State | Pattern |
|---|---|
| Loading | Skeleton rows/tiles (no spinners longer than 300 ms without a skeleton) |
| Empty | Explanation + primary next action |
| Error | Inline message + "Retry" + trace ID for support |
| Success | Toast (3 s) + updated row highlight |
| Permission denied | "You don't have access to Finance — ask the owner" (no data leak) |
| Not available yet | Disabled control + phase tooltip |

## 6. Accessibility and quality

- Keyboard: every action reachable, visible focus ring (signal colour), and `Esc` closes panels.
- WCAG 2.2 AA contrast; charts carry text labels and a table fallback.
- All numbers use tabular figures. Currency is formatted per locale: `$2,150` and `385 000 ֏`, matching the existing `formatAmd`.

## 7. Design deliverable before build (Phase A, day 1)

A static clickable prototype of Overview, Find Clients review, Approvals and Run detail, built with **illustrative data clearly labelled**, in the staging environment only. The founder signs off before data wiring begins.
