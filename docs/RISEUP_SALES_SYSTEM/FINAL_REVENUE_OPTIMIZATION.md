# RISEUP Final Revenue Optimization (commercial audit, 2026-11-22)

**Scope:** `docs/RISEUP_SALES_SYSTEM/` and `docs/RISEUP_BUSINESS_LAUNCH/`, plus the sources they cite: `plan-60-days.md`, `docs/riseup-os/REVENUE_SPRINT/01_EXISTING_OPPORTUNITIES.md`, `docs/marketing/contest-plan.md`, `src/config/contest.ts`.
- The CRM was **not rebuilt**. Only the Calculator assumptions were updated.
- Approved prices are unchanged.

Related: `REVISED_5000_REVENUE_SCENARIOS.md` (numbers) · `FIRST_7_DAYS_SALES_PRIORITY.md` (actions).

## 1. Key findings
1. **The ~$4,800 base was too optimistic.**
   - Corrected for the evidence in our own files, the base is **≈ $3,100**: zero paid clients so far, 300–400 failed cold calls, a new Upwork account.
   - The real gap is **≈ $1,900, not $200**.
2. **The warmest channel was missing:**
   - Contest participants: the contest ends 25 Nov, and the −20% offer expires 30 Nov.
   - The founder's personal network.
3. **Warm-lead value is unknown.** Nobody has confirmed what HosDog, the real estate client, Babasyan or Shtigen agreed or paid. That's the first call on Day 1.
4. **Payment rails aren't ready:**
   - The invoice still has `{{LEGAL_ENTITY_NAME}}` and `{{BANK_DETAILS}}` placeholders.
   - SWIFT receiving details aren't filled in.
   - Payoneer is unconfirmed.

   Every international "yes" is blocked until these are done. The Ameriabank business account exists (`plan-60-days.md` §0); its details only need to be added.
5. **The $5,000 path needs ~19 small deals, which is at the limit of what two people can deliver (~150 h).**
   - It only works if the AI Admin is sold as a template (≤ 6 h delivery).
   - After Day 14, larger deposits (WL-3, WL-R) must replace small deals.
6. **The scripts asked for too much too early:** a link, a price and a 15-minute call, all in the first message. They're rewritten in `SALES_SCRIPTS_HY_RU_EN.md` (§3 below).
7. **Demo-building would eat sales time:**
   - L3 and L4 aren't needed in week 1. L2 and L5 are ready.
   - Personalised 60-second screen recordings over the prospect's own site replace custom demos.

## 2. Lead quality: verification and qualification
All 76 leads stay **Unverified** until a person completes the steps below. Never mark a lead Verified from desk notes, and never guess an email pattern.

### 2.1 Verification (Person B, ≤ 6 minutes per lead)
| Step | Check | Where | Record |
|---|---|---|---|
| 1 | Website loads, and is the company's own (not a directory) | Open the URL | Website column |
| 2 | Active social media: a post in the last 30 days | Instagram / Facebook / LinkedIn company page | Instagram/LinkedIn columns + "last post DD.MM" in Notes |
| 3 | Contact channel published by the company itself | Contact page, footer, official social profile | Email / Phone. A generic info@ is acceptable |
| 4 | Decision maker named on an official source | About/team page, LinkedIn (current role) | Contact person + Position + source URL in Notes |
| 5 | Duplicate check | Ctrl+F company name / domain in Leads | Merge; mark the duplicate **Invalid** with "duplicate of L###" |

**Verification status:**
- **Verified:** steps 1 and 3 pass, from official sources.
- **Invalid:** dead site, closed business, or bounced email.
- **Unverified:** everything else.

### 2.2 Desk fit score (Person B, during verification). Record it in Notes as `FIT x/14`.
| Criterion (0 / 1 / 2) | 0 | 1 | 2 |
|---|---|---|---|
| Active website | Down/outdated | Works, old | Updated ≤ 6 months |
| Active social | None ≥ 90 days | 30–90 days | ≤ 30 days |
| Sells services we deliver (sites, landing pages, CRM, automation, AI bots) | No | Adjacent (SMM/branding only) | Yes, explicitly |
| Evidence of ongoing client projects | None | Older cases | Client work posted ≤ 3 months, or hiring |
| Identifiable decision maker | No | Name only | Name + role + channel |
| Clear operational problem | None visible | Plausible | Visible: hiring developers, slow replies, "integration" requests, "we're growing" posts |
| Able to pay approved prices | Freelancer/tiny | 3–9 staff | ≥ 10 staff or listed client logos/price list |

**Tiers:**

| Tier | FIT | Action |
|---|---|---|
| **T1** | ≥ 10 | Contact in the next 48 h with a personalised message + call (Armenia) |
| **T2** | 7–9 | Standard sequence |
| **T3** | ≤ 6 | Don't contact this month. Stage → Follow-up Later (+60 days) |

The 0–100 lead score (`LEAD_SCORING_MODEL.md`) starts only after a reply.

### 2.3 Qualification gate (before any demo or proposal: 3 questions, all must be "yes")
1. **Need now:** a real project or problem within 30 days.
2. **Authority:** the person decides, or will bring the decider to the call.
3. **Money and terms:** OK with the price range and a deposit before start.

Fail → send the PDF + one demo link, set Follow-up Later, **no custom demo**.

### 2.4 Desk pre-ranking of the 76 imported leads
This is an **order for verification**, based only on the existing research notes. It is not verification.

| Group | Leads | Why first |
|---|---|---|
| Verify first (20) | **CRM partners:** L001 B2B Development, L002 iNFOEXPERT, L003 Apollon Lab, L033 QazMarketing. **Buy or resell fulfilment:** L052 HL Growth Partner, L060 Spalato Consulting, L059 Flowmondo, L062 DataFix B.V. **Agencies selling sites with small teams:** L004 Andava, L005 Prodigi, L007 Sparsis, L006 Primal, L008 Nett Digital, L035 Astrix.kz, L036 PXSTUDIO, L037 CIRCLE, L042 Detect Studio, L043 Let's Create, L045 Slick, L041 Future Agency | They sell what we build. Partner or white-label signals. Research priority 1 |
| Then | Remaining priority-2 agencies (L009–L012, L014–L018, L038–L039, L044, L047–L048, L050, L053–L056, L061, L064–L065, L071–L073, L075–L076) | Fit plausible |
| **Don't contact this month** (11) | L013 Publicis Armenia, L023 Simply Technologies, L025 Umbrella IT, L046 Redberry, L063 cimt, L066 AOE, L067 relyon, L068 FastRocket, L069 Exxeta, L070 SVA. Plus L034 amoGURU (possible competitor; test only if they reply) | Enterprise, low fit, or competitor, per the research notes |
| Duplicate | **L051 = L003 Apollon Lab** | Mark L051 Invalid ("duplicate of L003") |

**Volume problem:**
- That leaves about 50 agency leads worth contacting. The plan needs about 345 agency contacts.
- Person B therefore adds about 10 **T1/T2** leads a day rather than 15 unqualified ones.
- **Sources:**
  - Clutch (AM/GE/KZ/UK small agencies)
  - Bitrix24/Kommo partner directories
  - The GoHighLevel and n8n expert directories
  - Instagram hashtag searches for Armenian agencies
- Quality beats count: 25 T1 contacts outperform 60 T3 contacts.

## 3. Conversion: what was weak and what changed
| Asset | Weakness | Change (now in `SALES_SCRIPTS_HY_RU_EN.md`) |
|---|---|---|
| §1 Agency first contact | 6 sentences, 3 asks (link, test price, 15-min call); a cold link hurts deliverability; the price invites "free test?" | **≤ 4 sentences, one observation, one low-friction question** ("Worth sending a 60-sec example?"). Link and price go in the 2nd message |
| §2 Direct first contact | Generic "AI administrator" pitch: the same thing the failed 300–400 cold calls offered | Lead with **their visible problem** (unanswered comment, no booking link) and the **outcome** (no lost inquiry). Offer a 2-minute video using *their* services |
| §3 Cold call | "Do you have a minute?" opener; pitches before diagnosing; aims for "send info" | Call only **after** a message (warm-ish). Open with the reason + observation. Ask 2 problem questions. The goal is a **booked 15-min demo slot**, not an explanation |
| §4 Follow-ups | F1 "quick nudge" adds nothing | **Every follow-up adds value:** a specific idea, a 60-sec personalised recording, or a deadline. The last one is a polite close |
| §6 Demo | Generic L2 for everyone | Demo **mapped to their client type**. Ask "who else decides?" before the demo |
| §7 Proposal | One option; invoice sent later | **Two options** (smaller/larger scope at list prices) + **invoice attached** + start slot "held 5 business days" (true: capacity is limited) |
| §12 Close | Fine (unchanged) | Use it as is: paste the payment details from the invoice, ask for the receipt, confirm the start date |
| Offer: paid test | "Paid test" sounds like a risk for them | Rename to **"Pilot task: one deliverable from your backlog, fixed price, 3–5 days, fixed until it meets the written spec"**. Same price |
| Demos | Plan built L3/L4 before any demand | **Freeze new demo builds in week 1.** Use L2/L5 + personalised screen recordings (≤ 10 min each) |

## 4. Best offers to push (scoring)
Each offer is scored 1–5 on each criterion. Weights:

| Criterion | Weight |
|---|---|
| Deal value | 25% |
| Sales cycle (5 = fastest) | 20% |
| Payment probability | 25% |
| Delivery time (5 = shortest) | 15% |
| Repeat revenue | 15% |

| Offer (approved price) | Value | Cycle | Pay prob. | Delivery | Repeat | **Score** |
|---|---|---|---|---|---|---|
| **WL-0 Pilot task** ($250–300 / 100,000 ֏, 100% upfront, 6–10 h) | 1 | 4 | 4 | 5 | 5 (gateway to WL-1–4, WL-R) | **3.55** |
| **Care plan / monthly fee** on existing clients (15–30k ֏/month) | 1 | 4 | 4 | 5 | 5 | **3.55** (warm only) |
| **DC-1 AI Admin Pro** (90,000 ֏, contest 72,000 + 25,000/month, 100% upfront, ~6 h from template) | 2 | 4 | 4 | 4 | 4 | **3.50** |
| DC-1 AI Admin Start (45,000 + 15,000/month) | 1 | 5 | 4 | 5 | 3 | 3.45 |
| WL-R 30 h retainer ($950–1,200 prepaid) | 4 | 1 | 4 | 2 | 5 | 3.25 |
| WL-3 Automation / AI ($950–1,200 / 400,000 ֏, 50/50) | 4 | 2 | 3 | 3 | 4 | 3.20 |
| **Upwork fixed-price n8n / automation** ($200–500, escrow) | 2 | 3 | 4 | 4 | 3 | **3.15** |
| DC-3 Real Estate Business (300–450k ֏; warm client only) | 3 | 3 | 3 | 2 | 4 | 3.00 |
| AI video (25,000 ֏) | 1 | 4 | 4 | 4 | 2 | 2.95 |
| WL-2 Website ($950–1,200 / 350,000 ֏) | 4 | 2 | 3 | 2 | 3 | 2.90 |
| DC-2 Ordering Business (250–450k ֏) | 3 | 2 | 3 | 2 | 4 | 2.80 |
| Creator validation sprint ($300) | 1 | 2 | 2 | 4 | 2 | 2.05 |

### The three offers to push in the next 7 days
1. **WL-0 Pilot task for agencies,** above all CRM partners (Bitrix24/Kommo) and automation agencies.
   - Price: 100,000 ֏ / $250 / $300, 100% upfront, fixed deliverable.
   - Every pilot ends with a proposal for the next project (WL-1/WL-3) or WL-R.
2. **DC-1 AI Administrator Pro** for contest participants (−20% until 30 Nov), the personal network, and nearby beauty businesses and clinics.
   - 72,000 ֏ contest price (90,000 ֏ list) + first month prepaid, 100% upfront.
   - Delivered from the existing n8n + ManyChat template in ≤ 6 h.
3. **Upwork fixed-price automation jobs** ($200–500, ≤ 3-day delivery), so the funds clear before Day 30.

**Attach to every warm-client conversation:**
- A care plan or monthly support fee (15–30k ֏/month).
- For the real estate client only: DC-3 Business.

## 5. Delivery capacity: workload model for two people
**Assumption:** 6 working days a week, about 9 h a day each. That's realistic for 30 days, not sustainable beyond.
- `plan-60-days.md` mentions planned medical downtime and a relocation. Keep a 15% buffer and confirm the dates.

| | Person A (Technical Lead and Sales) | Person B (Business Development and Operations) |
|---|---|---|
| Sales | 3.5 h/day: calls, discovery, demos, proposals, closing | 5.5 h/day: verification, outreach, follow-ups, scheduling, Upwork shortlist, CRM |
| Delivery | **4.5 h/day** (≈ 115 h / 26 days) | **2 h/day** (≈ 50 h): content setup, FAQ/price lists for AI Admin, QA, client communication |
| Admin | 1 h: invoices, payment verification | 1.5 h: daily report, research |
| **Delivery capacity (−15% buffer)** | ≈ 100 h | ≈ 40 h |

**Total ≈ 140 h of delivery in 30 days.** The $5,000 path needs about 152 h, so the rules below are mandatory.

**Capacity rules:**
1. **WIP limit:** at most **3 active deliveries** at once. Further deposits get a start date, not a parallel start.
2. **Template first:**
   - DC-1 = template + the client's Sheet (≤ 6 h).
   - WL-0 = one deliverable (≤ 10 h).
   - Anything above the scope limits of `FINAL_PRICING_AND_PAYMENT_TERMS.md` becomes a change request at 12,000 ֏ / $45 per hour.
3. **No work before a verified deposit.** No free samples. No unpaid "quick mockups".
4. **Demo budget:** a demo is prepared in ≤ 15 min (L2/L5 or a 60-sec screen recording). Custom demo builds only as paid discovery (60,000 ֏).
5. **Call budget:** discovery ≤ 20 min. A demo only after the §2.3 qualification gate passes.
6. **Hours per dollar:** minimum effective rate of **$25/h** (≈ 10,000 ֏/h). Decline anything below it unless it's a pilot to a channel partner.
7. **Protect sales blocks:** A's 09:30–12:30 call block is never used for delivery. On delivery-heavy days A still makes the calls booked by B and moves research to B.
8. **Switch rule:** if committed delivery exceeds 25 h/week for A, B pauses new cold direct outreach (lowest value per hour) and keeps the agency and Upwork follow-ups.
9. **From Day 15, bigger tickets:** prefer one WL-3 deposit or a WL-R retainer over three DC-1 sales.

## 6. The 10 highest-priority sales opportunities
Values and probabilities are estimates. Statuses are unconfirmed.

| # | Opportunity | Offer | Cash possible by Day 30 | Probability (judgment) | Owner | First action |
|---|---|---|---|---|---|---|
| 1 | **Contest participants** (estimate 50–150 per the contest plan; count unconfirmed) | DC-1 Pro at −20% (72,000 ֏ + first month), website packages −20% | $750–1,250 (5 deals × ~$250) | Medium | B → A | 26 Nov: personal message to every non-winner; the offer ends 30 Nov |
| 2 | **Real estate client** (site already delivered) | DC-3 Business, deposit 150,000–225,000 ֏ + monthly | $387–580 | 25% | A | Day 1 call: inquiry volume, where leads get lost; book a demo |
| 3 | **HosDog / Bistro** (ordering system delivered) | AI order assistant (90,000 ֏) + care plan; ask for 2 referrals and permission to show the work | ~$284 + referrals | 35% | A | Day 1 call; check our records first |
| 4 | **Alexander Babasyan** (portfolio in progress) | Agreed balance (if any) + hosting/support | Unknown | Unknown | A | Day 1: confirm the agreed price and the unpaid amount; set the delivery date |
| 5 | **Founder's personal network** (20 names) | DC-1 / websites / referrals | $250–500 | Medium | A | Day 1: write the 20 names; 5 personal messages a day |
| 6 | **Apollon Lab, iNFOEXPERT, B2B Development** (Bitrix24 partners, Armenia) | WL-0 pilot 100,000 ֏ → WL-3 400,000 ֏ | $258–775 | 15% each | A calls, B messages | Day 1–2 calls after verifying the numbers |
| 7 | **Shtigen** (automation delivered) | Extension (WL-3 type), deposit ≈ 100,000 ֏ | ~$258 | 20% | A | Day 1–2: is it running, what's still manual |
| 8 | **QazMarketing** (Kommo partner, KZ) | WL-0 $250 → WL-3 $950 | $250–725 | 10% | B | Day 2 message (RU) + Telegram |
| 9 | **HL Growth Partner** (sells GoHighLevel, offers white-label) | WL-0 $300 → WL-R $1,200 | $300–1,200 | 10% | B → A | Day 1–2 message (EN), offer capacity |
| 10 | **DataFix B.V.** (n8n partner, no AI-agent focus) | WL-3 AI agents: pilot $300 → project $1,200 | $300–900 | 10% | B → A | Day 1–2 message: "AI agents you don't build in-house" |

Next in line: L004 Andava (50–249 staff), L060 Spalato Consulting, L059 Flowmondo, L035 Astrix.kz.

## 7. Revenue required from each channel ($5,000 path)
| Channel | Cash needed | Paid deals | Share |
|---|---|---|---|
| Agency white-label | $1,773 | 6 | 34% |
| Contest + personal network | $1,225 | 5 | 23% |
| Upwork / Contra | $1,000 | 4 | 19% |
| Warm / existing clients | $671 | 2 | 13% |
| Direct cold (walk-in + call) | $592 | 2 | 11% |
| Creators | $0 | 0 | 0% |
| **Total** | **$5,261** | **19** | |

Details and deal mix: `REVISED_5000_REVENUE_SCENARIOS.md` §3.

## 8. Daily metrics to track (CRM Dashboard "Today" + daily report)
| # | Metric | Daily target | Where |
|---|---|---|---|
| 1 | **Cash verified today / cumulative vs plan** | Plan in the Daily Plan column R | Dashboard B6, Daily Plan T/U |
| 2 | **Payment requests sent** (invoices) | ≥ 1/day from Day 3 | Activities Type = Payment request |
| 3 | **Conversations started** (replies) | ≥ 3/day from Day 3 | Activities Type = Reply received |
| 4 | Discovery calls / demos held | 1–2 | Activities Call/Demo |
| 5 | Proposals sent **with invoice** | ≥ 1 (≥ 2 on Days 4–6) | Activities Proposal |
| 6 | Personalised first contacts (of which T1) | 20–25 (≥ 10 T1) | Activities First contact |
| 7 | Overdue follow-ups / active leads with no next action | **0 / 0** | Dashboard B34, B36 |
| 8 | Upwork proposals sent / Upwork replies | 3–5 / — | Activities Upwork/Contra |
| 9 | Leads verified (T1 found) | 15–20 (≥ 5 T1) | Leads Verification status |
| 10 | Delivery hours A / B (capacity) | A ≤ 4.5 h, B ≤ 2 h | Daily report |

**Weekly ratios:**
- Reply rate
- Reply → call
- Call → proposal
- Proposal → paid
- Average cash per deal

Put the real rates into the Calculator every Sunday.

## 9. Files changed by this audit
| File | Change |
|---|---|
| `SALES_SCRIPTS_HY_RU_EN.md` | §1–4, §6, §7 rewritten (v2) |
| `tools/build_crm.py` → `RISEUP_SALES_CRM.xlsx` | Calculator Block 1 updated to the revised assumptions, and a contest + network row added. Empty template regenerated (it held no live data) |
| `SALES_STRATEGY.md`, `REVENUE_TARGET_CALCULATOR.md` | Forecast lines point to the revised scenarios |
| `DAILY_EXECUTION_PLAN.md` | Days 1–7 now follow `FIRST_7_DAYS_SALES_PRIORITY.md` |
| `DAILY_SALES_REPORT_TEMPLATE.md` | Payment requests and delivery hours added |
| `SALES_SYSTEM_INDEX.md` | 3 new files listed |
