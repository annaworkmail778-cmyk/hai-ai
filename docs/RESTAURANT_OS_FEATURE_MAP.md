# RISEUP Restaurant OS: Feature Map and Audit

Status of every module after the deep refinement phase, on branch `claude/clever-carson-vfvd6s`. Nothing here is deployed.

## Status legend

| Code | Meaning |
|---|---|
| **A** | Works end-to-end in the demo with Restaurant OS's own data. Covered by unit tests and/or browser E2E. |
| **B** | Works in the demo, but the external party is a **labelled simulation** (payment terminal, WhatsApp, Instagram, Messenger, email, SMS, Google reply API). The internal workflow is real; the external call is not made. |
| **C** | Designed and documented, **not implemented**. |
| **R** | Needs research, a partner contract, provider approval or legal advice before it can be built. |

"Demo" means the fictional restaurant **Summit Table** with generated data. No real customer, payment or account data is used anywhere.

## 1. Guest-facing

| Feature | Status | Where | Notes |
|---|---|---|---|
| Premium restaurant website, hy / ru / en, two brand themes | A | `/restaurant/[lang]` | Fine dining / family themes, scroll reveal, reduced-motion aware |
| Digital menu: photos, ingredients, allergens, modifiers, sold-out | A | `/restaurant/[lang]/menu` | Unverified allergens shown as "ask the waiter" |
| QR table ordering (dine-in) | A | `/q/[session]/[token]` | QR identifies the table, not the guest; order is "sent", never "accepted" until staff accept |
| Call waiter / request bill from the table | A | QR menu | Appears in the waiter attention queue |
| Takeaway ordering with pickup slots, minimum order, packaging | A | `/restaurant/[lang]/checkout` | |
| Order status page (only on the ordering device) | A | `/restaurant/[lang]/order/[id]` | Device key, not a login |
| **Table booking request with live availability** | A | `/restaurant/[lang]/reserve` | Same availability rules as the host (turn time + 15 min buffer, combinable tables). Booking is a *request* until the host confirms |
| My bookings on this device, guest cancel | A | reserve page | |
| **Website chat → staff inbox** | A | widget on home & reserve | Own channel, so replies are actually delivered in-product |
| Guest account with login / saved cards | C | | Device-scoped history only; real accounts need auth + GDPR-style consent work |
| Online prepayment / deposits | R | | Needs a bank vPOS / Idram / Telcell contract and PCI scoping |
| Delivery ordering | C / R | | Own delivery: C. Aggregators (Yandex Eats etc.): partner API only, R |
| Room service (with Hotel OS) | C | | Contract in TECHNICAL_ARCHITECTURE, Revision 2 "Hotel OS bridge"; not built |

## 2. Waiter application (`/r/floor`)

| Feature | Status | Notes |
|---|---|---|
| Sign-in as staff (demo actor picker) | A (demo) | Demo picker is explicitly "not secure"; production auth is C (see SECURITY_REQUIREMENTS) |
| My section / all tables, floor map by area, live table states (10 states) | A | available, reserved, seated, ordering, waiting food, eating, bill, payment pending, cleaning, unavailable |
| Attention queue: QR orders to accept, food ready to serve, guest calls | A | One-tap actions |
| Shift summary (my open tables, attention, my sales) | A | |
| Open table with guest count; reservation info on the table | A | |
| Order by **seat** and **course** (now / starters / mains / desserts) | A | Drinks default to "now" |
| Modifiers with min/max rules, notes, quantity | A | Same validation as guest menu |
| Allergies & service notes on the table, shown to kitchen | A | |
| Send to kitchen; later courses **held** | A | |
| **Fire course** | A | Held tickets released to stations |
| Item-level kitchen status per line | A | |
| Ready notification → served | A | |
| Add items to an open table | A | New tickets, same session |
| Move selected items to another table | A | Splits order, moves stock-neutral |
| Transfer table / merge tables / hand over to another waiter | A | Permission `tables.transfer` |
| Void item with reason (permission), remake | A | Late voids are recorded as waste and alert the manager |
| Bill: single, by seat, equal split (2–6) | A | Parts always sum to the session total |
| Card payment through payment adapter | **B** | `demo-terminal` simulated adapter; "paid" only after adapter result; decline keeps bill open; unique provider reference |
| Cash / external POS recording | A | Only cashier / manager / owner; labelled "recorded", not "paid" |
| Close table only when bill settled and kitchen finished | A | |
| Offline: unsent orders flagged "not yet confirmed" | A | From the pending queue; never shows "sent to kitchen" before the server accepts |
| hy / ru / en per device | A | |
| One-handed mobile layout (48 px targets, bottom action bar) | A | Verified at 390×844 |
| Combine-to-single-bill across merged tables | A | Merged tables share one session |
| Split by arbitrary items (drag items into bills) | C | Domain supports `groups`; UI not built |
| Tips, service charge rules | C | |
| Native app / push notifications | C | PWA-style web app today |

## 3. Kitchen display (`/r/kds`)

| Feature | Status | Notes |
|---|---|---|
| Station routing (hot, grill, cold, pastry, bar), all, expo | A | |
| Timers with per-station amber / red thresholds, rush, remake flags | A | |
| Course label on tickets, held-course panel and per-station held counts | A | |
| **Item check-off** while cooking | A | |
| Dish allergens + **guest allergy from the table** | A | |
| Start / ready / bump, recall | A | |
| **Reopen bumped ticket** with reason | A | Only chef / manager / owner (`kds.reopen`) |
| Recently cancelled items panel | A | |
| All-day counts | A | |
| Sold-out toggle propagating to QR / site / waiter | A | |
| hy / ru / en | A | |
| Kitchen analytics (ticket times by station, late tickets) | A | In owner analytics |
| Printer fallback (Star CloudPRNT / Epson) | R | |
| Bump bar hardware | R | |

## 4. Host & reservations (`/r/host`)

| Feature | Status | Notes |
|---|---|---|
| Tonight / tomorrow list, covers | A | |
| Requests from website / phone / chat with **suggested table** | A | Smallest fitting table, else a combinable pair |
| Manual table choice, modify, cancel with reason | A | |
| **Double-booking prevention** | A | Domain rejects overlapping assignments (turn time + buffer) — unit-tested |
| Table combinations | A | `combinableWith` per table |
| Waitlist with quoted wait, notify (simulated), seat | A | |
| Walk-in with suggested table | A | |
| No-show only after +15 min | A | |
| Reminder | B | SMS simulated, logged once per booking |
| Deposits / card guarantees | R | |
| TheFork / OpenTable / Google Reserve sync | R | Partner-only APIs |

## 5. Unified communications inbox (`/r/admin/inbox`)

| Feature | Status | Notes |
|---|---|---|
| One list for webchat, WhatsApp, Instagram, Messenger, email | A (UI) | |
| Website chat end-to-end | A | Own channel |
| WhatsApp / Instagram / Messenger / email | **B** | Simulated incoming ("Simulate incoming" button) and simulated sending, labelled on every message |
| Language detection (hy / ru / en), intent detection (12 intents) | A | Deterministic, rule-based |
| AI draft with the facts it used and a risk level | A | low / approval / escalate |
| Human approval before sending; escalations only by manager | A | |
| Auto-reply **only** for manager-enabled low-risk intents (hours, menu, thanks) | A | Domain refuses any other intent |
| Assign, status, internal notes, tags, saved replies, priority | A | |
| First-response time | A | |
| Channel status panel with real onboarding requirements | A | |
| Real channel connection | R | Meta Business verification, App Review, webhooks, 24-hour window rules |

## 6. Reviews (`/r/admin/reviews`)

| Feature | Status | Notes |
|---|---|---|
| Google / Tripadvisor / TheFork reviews in one list (seeded, fictional) | A | |
| Rating trend, topic analysis (food / service / price / ambience / wait) | A | Keyword-based |
| ≤ 3★ creates a manager task automatically (once) | A | |
| AI-drafted reply in the review's language, human approval | A | |
| Google publish | **B** | Simulated adapter; real API needs verified location + API access approval |
| Tripadvisor / TheFork publish | A (manual) | No public reply API: approved text is copied and posted manually; status "manual" |
| Real review import | R | Google API yes (approval); Tripadvisor/TheFork partner-only; no scraping |

## 7. CRM & loyalty (`/r/admin/customers`)

| Feature | Status | Notes |
|---|---|---|
| Profiles from orders, reservations, chats (60 fictional guests) | A | Phone-based match |
| Segments: VIP / gold, lapsed, new, consented, dietary | A | |
| Explicit marketing consent with source and time | A | |
| Points per completed order (idempotent), configurable earn rate, tiers | A | |
| Redemption, campaigns | C | No campaign sending in the demo |

## 8. Inventory, recipes, food cost, purchasing

| Feature | Status | Notes |
|---|---|---|
| Recipes with yield, cost, net price ex-VAT, gross margin | A | |
| Ingredient price changes → margin before/after + monthly impact | A | |
| Automatic stock deduction at acceptance, reversal / waste on cancel | A | Idempotent ledger |
| Waste log, unusual waste alert (≥ 10 000 ֏) | A | |
| **Stocktake** with variance value, ledger adjustment | A | |
| Allergen verification overview | A | |
| Low stock → **draft** purchase order (one open draft per supplier) | A | Never sent automatically |
| PO approval above 150 000 ֏ (manager / owner) | A | |
| Send / receive / partial receive | A / B | Sending to supplier is simulated |
| Supplier performance (on-time, completeness, volume) | A | |
| Recipe versioning history | C | Price history exists; recipe version table designed in DATA_ARCHITECTURE |
| Contribution margin vs gross vs net | A / C | Gross margin implemented; contribution margin & net need labour/overhead inputs (C) |

## 9. AI

| Feature | Status | Notes |
|---|---|---|
| Business assistant: 15 question types, numbers with sources | A | Deterministic engine over the same analytics as dashboards |
| Proposed actions with permission check and confirmation dialog | A | Never executes without "Confirm" |
| Staff SOP assistant (search by role) | A | 5 seeded SOPs |
| Inbox / review drafts | A | Rule-based |
| LLM adapter (Claude) | C | Designed in AI_ARCHITECTURE; not enabled (no key, no dependency approval) |

## 10. Automations (`/r/admin/automations`)

18 automations, each with trigger, action, owner, enable switch, execution count and a shared execution log (ok / skipped / failed). Idempotent by `automation:object` key; automations never dispatch new events, so loops are impossible. Status A; external sends inside them are B.

## 11. Team

| Feature | Status |
|---|---|
| Today's shifts and sections | A (seeded) |
| Tasks: manual, automation, assistant; priority; done by assignee/role | A |
| Internal channels (all, kitchen, floor, managers) | A |
| Shift handover with automatic summary | A |
| Day close summary | A |
| Scheduling, time clock, payroll | C / R |

## 12. Owner & management

Overview with sales, channels, margin, waste, stock, opportunities, plus reservations / inbox / reviews / tasks tiles (A). Analytics, savings calculator with actual / calculated / hypothetical labels (A). Floor plan editor with drag, seats, shape, block (A). Integrations page with honest states (A).

## 13. Platform

| Item | Status |
|---|---|
| Event-sourced state, shared kernel with Hotel OS | A |
| Multi-device live sync (server session store, polling) + local mode | A |
| Role permissions (9 roles, 31 permissions), enforced in UI and domain for sensitive events | A |
| Production authentication, tenant isolation, audit export | C (SECURITY_REQUIREMENTS) |
| Fiscal compliance (e-HDM) | **Not claimed.** R |
