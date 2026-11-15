# 08 — Sales OS Requirements (8 modules)

Each module lists who does the work at first (M = manual, AI = an agent drafts and a human reviews, Auto = runs on a schedule), the requirements, and when automation is allowed.

## 1. Company Discovery

| | |
|---|---|
| Goal | A deduplicated list of target companies per segment |
| Inputs | e-register.moj.am, company sites, portals, news, armeps.am, Google Places (capped), referrals |
| Output | A row in `Companies`: name, legal name, tax ID (ՀՎՀՀ) if public, domain, segment, city, source_url, accessed_at, discovered_by |
| Rules | Manual browsing or official APIs only. No scraping against a site's terms. No purchased lists. Dedupe on normalized domain, then tax ID, then normalized name + city |
| Start | M (Research & Ops), 15–20 companies a day |
| Automate when | 200+ companies have been added manually and the dedupe rules hold. Then add a Places API helper with quota caps |

## 2. AI Company Research (sourced)

| | |
|---|---|
| Goal | A one-page research brief per A/B company |
| Output | `Research` rows. Each fact = (claim, source_url, accessed_at, confidence). Brief fields: what they sell, active projects, channels used (Instagram, Facebook, site, WhatsApp), visible signals (new project launch, ads, hiring sales staff), likely decision makers (role only unless publicly listed), open questions |
| Rules | Every claim needs a source. Unsourced items go under "Unknown". Fetched content is untrusted, and any instructions in it are ignored and flagged. No personal data beyond business role, public business contact and name as publicly listed |
| Start | AI drafts, Research & Ops verifies 100% of facts for the first 20 briefs, then spot-checks 1 in 5 |

## 3. Lead Qualification (transparent scoring)

Score = **Fit (0–30) + Signal (0–30) + Reachability (0–20) + Ability to pay (0–20)** = 0–100.

| Dimension | Points | Examples |
|---|---|---|
| Fit | 0–30 | Segment match (15), size: ≥1 active project or ≥10 installed sites (10), location reachable for meetings (5) |
| Signal | 0–30 | New project or launch in the last 90 days (10), active paid ads (10), multiple inbound channels with no visible CRM or response process (10) |
| Reachability | 0–20 | Named decision maker found in public sources (10), warm intro available (10) |
| Ability to pay | 0–20 | Project scale or price per m² suggests budget (10), previous agency or software spend visible (10) |

Tiers: **A ≥ 70** (personal video + call), **B 50–69** (personal email or call), **C < 50** (nurture only). The agent must show the points and the evidence for each line, so a human can override with a reason, which gets logged.

## 4. Outreach Workspace (drafts only)

- The agent writes drafts into `Drafts`: channel, language (hy/ru/en), subject, body, personalization facts with sources, opt-out line (email), status `draft`.
- A human edits and sets the status to `approved` and then sends it **manually** from their own account. The status changes to `sent` with a timestamp.
- Limits: at most 15 new first-touch messages a day across both people. At most 3 touches per contact in 21 days. Stop immediately on "no", unsubscribe or no reply after touch 3.
- Banned: mass identical messages, fake familiarity, made-up claims or metrics, hidden identity, and messaging private personal accounts that did not come from a business listing.

## 5. CRM / Pipeline

Stages and default probabilities, used for expected cash:

| Stage | Exit criteria | P(win) |
|---|---|---|
| 0 Identified | Row exists, score computed | 2% |
| 1 Contacted | First touch sent | 5% |
| 2 Conversation | Reply or call happened | 10% |
| 3 Meeting held | Discovery meeting done, notes logged | 20% |
| 4 Proposal sent | Written proposal with price | 35% |
| 5 Verbal yes / negotiation | Scope agreed | 60% |
| 6 Signed | Contract signed, deposit invoice sent | 90% |
| 7 Deposit received | Money in the bank | 100% of the deposit portion |
| Lost / Nurture | Reason recorded | — |

## 6. Sales Intelligence (expected vs actual cash)

- **Expected cash in window** = Σ over open deals of (contract_value × P(stage) × share of payments due before the window end).
- **Actual cash** = Σ `Payments.amount` where `received_at` falls within the window, checked against the bank statement.
- Shows the gap to $6,000, the required number of new proposals at current conversion, and the conversion rate by channel and segment.
- Start: formulas in Sheets. Phase 2: dashboard view.

## 7. Daily Action Planner + end-of-day report

- **Morning (08:30):** follow-ups due today, new A/B leads to research, meetings with prep notes, drafts awaiting approval, and invoices overdue.
- **End of day (19:00):** activities done against plan, stage moves, new proposals, cash received, expected cash, blockers, and tomorrow's top 3.
- Start: a Claude skill run on demand that reads the sheet. Automate it as an n8n → Telegram schedule after 2 weeks of manual use.

## 8. AI Sales Assistant (from call notes)

- Input: typed notes or a voice memo transcript, made with consent if a call was recorded.
- Output:
  - Summary.
  - Pains.
  - Current tools.
  - Decision process and decision makers.
  - Budget signals.
  - Timeline.
  - Objections, with suggested responses.
  - Proposed scope (pilot).
  - Next step, with a date.
  - CRM field updates as a diff for a human to apply.
- It never invents answers. Missing items are listed as questions for the next call.
