# RISEUP Restaurant OS: First Professional Demo — Scope

**Status:** Phase 1 recommendation, for approval. **Date:** 2026-11-27.
**Restaurant:** Summit Table, Tsaghkadzor (fictional). **Deployment:** inside the existing `business-os/` Netlify site, behind new routes; hotel demo unchanged.

## 1. Goal and boundary
- **Goal:** convince the owner of an established restaurant, in **12–15 minutes** (or a 5-minute short version), that RISEUP can meaningfully improve operations, and get a paid pilot.
- **Shape:** six connected scenarios on **one shared dataset**. Every number on every screen derives from the same events, so an order placed in Scenario A appears in Scenario F's analytics.
- **Boundary:** the demo proves the *workflow and the economics*. It does not connect to any real POS, fiscal device, payment, delivery platform or messaging service.

## 2. Two scope options
| | **Core demo (recommended first)** | **Full demo** |
|---|---|---|
| Scenarios | A (QR table), B (takeaway), C (food cost), F (owner overview) | + D (retention), E (employee) |
| Why | A/B/C/F show the three strongest value claims: fewer errors & faster kitchen, direct orders, margin control | D/E reuse the hotel's loyalty and workforce code, so they are cheaper than they look, but less decisive in a first meeting |
| Effort (exact phase sums, see implementation plan §2) | 107–148 h | 133–186 h |

Recommendation: build **Core**, run it with 2–3 owners, then add D and E (the order of phases allows stopping after Core).

## 3. What is in the demo, by category

### Category A — genuinely works
| Area | Included |
|---|---|
| Website | Editorial home, story, gallery, signature dishes, events/seasonal, private dining request, hours, directions link, hy/ru/en, two theme presets (fine-dining mountain + family) |
| Menu | Categories, search, dish detail, ingredients, allergens incl. "not provided" state, variants, modifier groups with min/max, notes, availability, chef/featured placement |
| Ordering | Device cart; dine-in (QR), takeaway (pickup slots), delivery (zone list, fee, minimum); estimates from configured rules + kitchen load; strict status page; re-order (accounts) |
| QR | Opaque table tokens, table context, multiple rounds, call waiter / help / bill, device-only status, first order requires staff acceptance, printable QR tents |
| Service | Unified inbox with source retained, accept/reject with reason, auto-accept for staff-entered orders, assignment, phone order entry, void with permission & reason, live overview |
| Kitchen | KDS per station (Hot, Grill, Cold, Pastry, Bar) + expo, timers with thresholds, start/ready/bump/recall, all-day counts, sold-out from KDS, rush flag |
| Floor | SVG plans for 5 areas, all table states, waiter sections, open/transfer/close, settle "on POS" |
| Reservations | Guest request, host book (timeline), confirm/decline/propose, table allocation suggestion, VIP/occasion/allergy notes, no-show, waitlist |
| Menu & margin | Ingredients, unit conversion, recipe lines with yield, sub-recipe, versioning, cost/GP/GM/food-cost % (VAT-aware), price change → recalculation across recipes with before/after |
| Inventory | Stock ledger, idempotent consumption at acceptance, reversal vs waste, waste log, min-level and expiry alerts |
| Purchasing | Suppliers, price history, rule-based replenishment suggestion (explained), PO, partial receipt → stock + price update |
| Customers | Demo accounts (seeded + register), CRM profiles with stats, segments with live audience, loyalty tiers/points/vouchers with duplicate prevention, offers with eligibility |
| Team | Employees, roles & permission-gated navigation, tasks with approval, handovers, onboarding with quiz and supervisor review, messaging (direct, department, task thread), employee mobile workspace |
| Analytics | Sales, channels, items, hours; profitability (gross only; net shown as "requires expense data"); menu engineering; operations (prep, late, cancellations, turns, no-shows); team; customers |
| Assistants | Customer assistant (scripted, data-only, allergy escalation); manager "ask" with 5 canned questions answered from data with citations; insight cards with supporting data |
| Automations | Map from `USER_JOURNEYS.md` §9 running in the reducer, with toggles and run counts |
| Presenter | `/present/restaurant`: scenario steps, phone + laptop frames or the owner's own phone via QR, Reset (PIN), clock presets ("Friday 20:15"), local mode |

### Category B — simulated, always labelled
| Item | Label shown |
|---|---|
| Guest/staff messages (SMS, WhatsApp, Viber, Telegram, e-mail, push) | Outbox: «Սիմուլյացիա · չի ուղարկվել» / "Simulation · not sent" or «Պլանավորված» |
| Campaign "sample results" | "Simulated projection · assumption: 8–12% redemption" — never mixed with real session data |
| Employee invitation | "Invitation prepared (simulation)" |
| Supplier PO sending | "Prepared, not sent" |
| POS, fiscal, payment, delivery, accounting, printer integrations | Integrations page: **Not connected**; optional "Simulated POS sync" toggle that only writes a labelled log line |
| Hotel room-service bridge (optional phase R9) | "Hotel OS link · demo" badge, folio posting "simulated" |
| Staff sign-in | Role picker labelled "Demo sign-in, not secure" |
| Customer sign-in | "Demo account" |

### Category C — production integration required (not in the demo)
Secure multi-tenant auth and RLS; production database, backups, monitoring; live payments (vPOS, wallets); POS order/menu/sales sync; fiscal receipts (SRC HDM / e-HDM); accounting integrations; real messaging providers; delivery-platform integrations; kitchen printers; custom domains; LLM assistant.

## 4. Explicitly out of scope for the first demo
- Multi-location and brand management UI (data model ready; one location shown).
- Floor-plan editor, menu CMS for website content, nutrition data.
- Payments of any kind, tips, bill splitting with payment, deposits.
- Courier tracking, referral programme, group ordering, time clock, payroll.
- Admin UI in Russian/English (admin in Armenian, consistent with the hotel decision; customer pages hy/ru/en).
- Native apps.

## 5. Screens required
| # | Screen | Route | Scenarios |
|---|---|---|---|
| 1 | Website home (2 presets) | `/restaurant/[lang]` | B, presenter intro |
| 2 | Menu + dish sheet + cart | `/restaurant/[lang]/menu` | A, B |
| 3 | Checkout (type, slot, contact) | `/restaurant/[lang]/order` | B |
| 4 | Order status | `/restaurant/[lang]/order/[code]` | A, B |
| 5 | Reserve / private dining | `/restaurant/[lang]/reserve` | (D optional) |
| 6 | Account (orders, points, vouchers, reservations) | `/restaurant/[lang]/account` | B, D |
| 7 | QR entry | `/q/[session]/[token]` | A |
| 8 | Manager overview | `/r/admin` | A, F |
| 9 | Orders inbox + detail | `/r/admin/orders` | A, B |
| 10 | Floor (manager) / waiter app | `/r/admin/tables`, `/r/floor` | A |
| 11 | KDS (station, expo) | `/r/kds` | A, B |
| 12 | Reservations book / host | `/r/admin/reservations`, `/r/host` | — / D |
| 13 | Menu management | `/r/admin/menu` | A (sold-out), C |
| 14 | Inventory + ingredient detail | `/r/admin/inventory` | C, F |
| 15 | Recipe & costing | `/r/admin/recipes` | C, F |
| 16 | Purchasing & suppliers | `/r/admin/purchasing` | C |
| 17 | Customers (CRM) + segment builder | `/r/admin/customers` | D |
| 18 | Loyalty & offers + campaign simulation | `/r/admin/loyalty`, `/r/admin/marketing` | D |
| 19 | Team, tasks, onboarding review | `/r/admin/team` | E |
| 20 | Employee workspace | `/r/me` | E |
| 21 | Analytics (5 tabs) + insights + ask | `/r/admin/analytics` | F |
| 22 | Automations | `/r/admin/automations` | presenter |
| 23 | Integrations (honest states) | `/r/admin/integrations` | objection handling |
| 24 | Settings (VAT mode, thresholds, theme, order rules) | `/r/admin/settings` | C, presenter |
| 25 | Presenter | `/present/restaurant` | all |
| 26 | Launcher card | `/` | — |

## 6. Scenario dependencies (data and transitions)
| Scenario | Required data | Key transitions | Depends on |
|---|---|---|---|
| A QR table | Table T7 token, open table session rules, menu with stations, waiter section | `order.submit → accept → ticket.start → ticket.ready → serve`; status page; sales counter | Kernel, menu, KDS, floor, overview |
| B Takeaway | Order rules (slots, min, fee), demo account | `submit → accept → tickets → ready → picked_up → completed`; points; CRM history | A's machinery, accounts |
| C Food cost | Ingredient *Pork neck* used in 4 recipes, supplier price history | `ingredient.price` or `po.receive` with new price → recalculation → margin delta | Recipes, inventory, purchasing, analytics |
| D Retention | 900 customers, consent mix, segments | `offer.create → eligibility → audience → campaign.simulate`; voucher usable in the cart | CRM, loyalty, outbox |
| E Employee | Positions, onboarding module for waiter | `employee.create → training.* → task.create → msg.send → task.status` | Workforce (reused) |
| F Owner | History aggregates + today's events | read-only; insights reflect A–C if run before | Analytics |

## 7. Demo rules (non-negotiable)
1. "Demo data · fictional restaurant" badge on every staff screen; `noindex`.
2. A guest never sees "Accepted/Confirmed" before a staff event (or a visible auto-accept rule) produced it.
3. No screen implies a fiscal receipt, a payment or a sent message.
4. Allergen answers only from entered data; "not provided" is shown as such.
5. Gross profit is labelled gross; net profit requires expense data.
6. Projections are labelled as projections with their assumptions.
7. Fictional names, `+374 00 …` phones, `@example.com` e-mails; licensed photos only.
