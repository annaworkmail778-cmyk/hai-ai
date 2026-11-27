# RISEUP Restaurant OS: Feature Catalogue

**Status:** Phase 1 blueprint, for approval. **Date:** 2026-11-27.

## Legend
**Priority tier**
- **D** Essential for the first professional demo
- **P** Important for the first paid pilot
- **C** Future commercial release
- **E** Advanced enterprise capability
- **X** Should not be built yet

**Demo category** (see `RESTAURANT_OS_DEMO_SCOPE.md`)
- **A** genuinely works in the demo
- **B** simulated, clearly labelled
- **C** production integration required (shown as "Not connected" or absent)

**Roles:** OW owner · GM general manager · RM restaurant/branch manager · FM finance · HW head waiter · W waiter · HO host · CA cashier · KM kitchen manager/chef · KS kitchen staff · BA bartender · SM stock/purchasing · DE delivery · CU customer

---

## 0. Module map and grouping (navigation is role-specific)
| Group | Modules | Primary roles |
|---|---|---|
| **Guest** | Website, Menu, Ordering, QR table, Reservations, Account & loyalty, Assistant | CU |
| **Service** (live) | Overview, Orders, Kitchen (KDS), Floor & tables, Reservations & waitlist, Requests | RM, HW, W, HO, KM, KS, BA, CA |
| **Menu & margin** | Menu, Recipes & food cost, Inventory, Purchasing & suppliers | RM, KM, SM, FM |
| **Guests & growth** | Customers (CRM), Loyalty, Marketing & offers, Reviews/feedback | OW, GM, RM |
| **Team** | Employees & roles, Shifts & tasks, Onboarding & training, Messages, SOPs | GM, RM, all staff |
| **Insight** | Analytics (sales, profitability, operations, team, customers), Insights | OW, GM, FM |
| **System** | Automations, Integrations, Settings (locations, areas, stations, tax, hours, theme), Audit log | OW, GM |

**Modules added beyond the brief, with the reason:**
- **Requests** (waiter call, bill, assistance), because it is the second most frequent QR action and needs an owner and a status.
- **Reviews/feedback**, because post-visit feedback is the input for the complaint and satisfaction metrics.
- **Integrations**, because coexistence with POS/fiscal/payment is a core promise and must be visible and honest.
- **Audit log**, because voids, discounts and price changes need accountability before any pilot with real money.
- **Settings → Stations & printers**, because station routing is configuration, not code.

---

## 1. Guest website (premium, configurable)
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| W1 | Editorial homepage: hero film/photo, concept story, signature dishes, atmosphere gallery | CU | Brand-grade first impression; reason to book direct | Theme system, photos | D | A |
| W2 | Theme presets (fine dining, luxury, hotel, family, casual, café) with layout variants | OW | One product fits different brands | Design tokens | D (2 presets) / C (all 6) | A |
| W3 | Menu page (public), hours, location & directions link, contact | CU | Basic discoverability | Menu, settings | D | A |
| W4 | Events & seasonal offers pages | CU | Event revenue, seasonality | Offers | P | A (seeded content) |
| W5 | Private dining & group booking request form | CU, RM | High-value bookings | Reservations | D | A |
| W6 | Reviews block (curated, from feedback with consent) | CU | Social proof | Feedback | P | A (seeded) |
| W7 | hy / ru / en, language auto-detect and switch | CU | Tourists (Tsaghkadzor) | i18n | D | A |
| W8 | SEO, structured data (Restaurant, Menu), Open Graph | OW | Discovery | Production domain | C | — |
| W9 | Custom domain per restaurant | OW | Brand ownership | Hosting | P | C |
| W10 | CMS editing of website content by the restaurant | RM | Independence | Auth, storage | C | — |

## 2. Digital menu
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| M1 | Categories, sticky category tabs, search | CU | Fast browsing on a phone | Menu data | D | A |
| M2 | Dish detail: photo, description, price, ingredients, allergens (**only if entered**), dietary tags | CU | Trust, fewer questions to waiters | Menu data | D | A |
| M3 | Sizes / variants with prices | CU | AOV, accuracy | Modifier model | D | A |
| M4 | Modifiers & extras (required/optional groups, min/max) | CU, W | AOV, accuracy | Modifier model, recipe deltas | D | A |
| M5 | Special instructions per item | CU, W | Fewer errors | — | D | A |
| M6 | Live availability (sold out reflected everywhere) | CU, KM, RM | No "sorry, we're out" after ordering | Sync | D | A |
| M7 | Featured / chef recommends / high-margin placement | RM | Mix toward margin | Recipes (margin) | D | A |
| M8 | Seasonal menus & time-based menus (breakfast, lunch, bar) | RM | Right menu at the right time | Schedules | P | A (two menus) |
| M9 | Area-specific menus (terrace, lounge, bar) | RM | Multiple dining areas | Areas | P | A (bar vs hall) |
| M10 | Manager menu editor: items, prices, images, descriptions, translations, allergens, modifiers | RM, KM | Independence | Auth (prod) | D (price/availability/new item) / P (full editor) | A |
| M11 | Menu sync from POS | RM | One source of truth | POS integration | E | C |
| M12 | Nutrition/calorie data | CU | Regulatory in some markets | Data | X | — |

## 3. Online ordering
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| O1 | Cart (device-only), quantities, edit, notes | CU | Convenience | — | D | A |
| O2 | Order types: dine-in (QR), takeaway, delivery (where offered) | CU | Direct channels | Settings | D | A |
| O3 | Configurable rules: minimum order, delivery zones (by district list), delivery fee, service fee, pickup slots, lead times | RM | Operational control | Settings | D (min order, fee, zones list, pickup slots) | A |
| O4 | Estimates derived from configured rules + current kitchen load (`base prep + queue factor`) | CU | Honest expectations | KDS load | D | A |
| O5 | Review & submit; strict status page (submitted → accepted → preparing → ready → served/picked up/delivered → completed; rejected/cancelled) | CU | Trust | State machine | D | A |
| O6 | Order updates on the status page (live) | CU | Fewer "where is my order" calls | Sync | D | A |
| O7 | Order updates by SMS/WhatsApp/Telegram/push | CU | Same, off-page | Messaging providers | P | B |
| O8 | Re-order from history | CU | Repeat orders | Accounts | P | A |
| O9 | Hotel room-service ordering | CU (hotel guest) | Room-service revenue | Hotel OS bridge | P | B (phase R9, optional) |
| O10 | Online payment | CU | Prepaid takeaway/delivery | Payment provider | C | C |
| O11 | Scheduled orders (order for 19:30) | CU | Peak smoothing | Slots | P | A (pickup time) |
| O12 | Group ordering (several phones, one table) | CU | Large tables | Table session | C | — |

## 4. QR table experience
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| Q1 | Unique opaque token per table → restaurant + area + table context | CU | No app, zero friction | QR tokens | D | A |
| Q2 | Order from the table; multiple rounds on one table session | CU | Faster ordering at peak | Table session | D | A |
| Q3 | Call waiter / ask for assistance / request the bill (configurable) | CU, W | Fewer missed signals | Requests | D | A |
| Q4 | Order status for this device only | CU | Trust, privacy | Device order token | D | A |
| Q5 | Table session open/close rules (first order needs staff acceptance; optional table code) | RM | Abuse prevention | Table session | D | A |
| Q6 | QR card/tent generator (print PDF per area) | RM | Rollout | QR | D | A |
| Q7 | Token rotation / revoke | RM | Security | — | P | A |
| Q8 | Pay at table via QR | CU | Faster turn | Payments | C | C |

## 5. Reservations & waitlist
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| R1 | Request: date, time, party size, area preference, occasion, special requests | CU | Captures bookings 24/7 | — | D | A |
| R2 | Status: requested → confirmed / declined / modified (guest accepts) → seated → completed / no-show / cancelled | HO, RM | Truthful states | — | D | A |
| R3 | Availability suggestion from **configured** table inventory, durations and turn rules (never shown to guests as guaranteed) | HO | Fewer double-bookings | Tables, rules | D (staff-side suggestion) | A |
| R4 | Reservation book: timeline by area/table, today list | HO, RM | Control | — | D | A |
| R5 | Table allocation (drag/select), combine tables for large parties | HO | Utilisation | Floor | D (select) / P (combine) | A |
| R6 | Waitlist for walk-ins with quoted wait | HO | Fewer walk-aways | Floor | P | A |
| R7 | Guest notes, VIP flag, occasions, allergies on file | HO, W | Premium service | CRM | D | A |
| R8 | No-show tracking, history per guest | HO, RM | Policy decisions | CRM | D | A |
| R9 | Guest modify/cancel within configured rules | CU | Fewer calls | Accounts | P | A |
| R10 | Reminders and confirmations by message | CU | Fewer no-shows | Messaging | P | B |
| R11 | Deposits / prepayment for large or peak bookings | RM | No-show protection | Payments | C | C |
| R12 | Public real-time availability widget | CU | Conversion | Reliable table inventory | C | — (not promised) |

## 6. Orders inbox & operations overview
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| S1 | Unified inbox: sources (waiter, QR, website, takeaway, delivery, room service, phone-entered) retained on the order | RM, HW, CA | Nothing lost | — | D | A |
| S2 | Order detail: number, type, table/address, items, modifiers, notes, time, status timeline, responsible employee | RM, W | Accountability | — | D | A |
| S3 | Accept / reject with reason; auto-accept rules per channel (visible) | RM, HW | Speed with control | — | D | A |
| S4 | Assign waiter / runner / courier | RM | Clear ownership | Staff | D | A |
| S5 | Phone order entry by staff | W, CA | One flow for all orders | — | D | A |
| S6 | Void item / cancel order with reason (permissioned; after fire = waste) | RM, HW | Loss control | Inventory | D | A |
| S7 | Discounts with role limits and reason | RM, CA | Leakage control | Audit | P | A |
| S8 | Live overview: open orders, late tickets, tables by state, today's sales, alerts | RM, OW | Situational awareness | All | D | A |
| S9 | Bill summary / split view for the waiter (informational; payment happens on the restaurant's POS) | W | Faster close | — | P | A (summary) |

## 7. Kitchen Display System
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| K1 | Station routing from menu configuration (hot, cold, grill, pizza, pastry, bar, custom) | KM, KS, BA | Right ticket, right station | Menu stations | D | A |
| K2 | Ticket: table/type, items, quantities, modifiers, allergens (highlighted), notes, age timer, priority | KS | Accuracy and speed | — | D | A |
| K3 | One-tap start / ready / bump; recall last bumped | KS | Speed | — | D | A |
| K4 | Timer colours by configured thresholds per station | KM | Visible delays | Settings | D | A |
| K5 | Expo / all-stations view (order complete when all stations ready) | KM | Courses arrive together | — | D | A |
| K6 | Rush/priority flag, course firing ("fire mains") | KM, W | Fine-dining pacing | — | P (rush D) | A |
| K7 | Item summary ("all-day" counts: 7 × khorovats) | KM | Batch cooking | — | D | A |
| K8 | Mark sold out from KDS | KM | Instant availability | Menu | D | A |
| K9 | Prep-time analytics per station/item | KM, RM | Find bottlenecks | History | D | A |
| K10 | Kitchen printer output (Star CloudPRNT / Epson SDP) | KM | Kitchens that prefer paper | Printer | P | C |
| K11 | Offline queue on the KDS device | KS | Resilience | Production client | P | — |

## 8. Floor & table management
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| F1 | Floor plans per dining area (SVG), tables with seats and shape | HO, W, RM | Overview at a glance | Settings | D | A |
| F2 | Table states: available, reserved, seated/occupied, ordering, waiting for food, assistance, bill requested, cleaning | all floor | Service quality | Table session | D | A |
| F3 | Current orders, waiter, time seated per table | W, RM | Turn control | — | D | A |
| F4 | Open/close table sessions; transfer table; merge | W, HO | Real operations | — | D (open/close/transfer) / P (merge) | A |
| F5 | Waiter sections (assign tables to waiters) | HW | Workload balance | Staff | D | A |
| F6 | Floor plan editor | RM | Self-service setup | — | C | — (seeded plans) |

## 9. POS & cash-register coexistence
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| P1 | "Beside the POS" mode: orders shown to the cashier for entry/settlement on the existing register; order marked "settled on POS" manually | CA | Zero disruption | — | D | A |
| P2 | Integrations panel with honest states (Not connected / Simulated / Connected) | OW | Trust | — | D | B |
| P3 | Daily sales export (CSV/XLSX) for the accountant | FM | Reconciliation | — | P | A |
| P4 | POS order injection / menu & stop-list sync (iiko/Syrve, r_keeper, Poster — per provider approval) | RM | No double entry | Provider API | C | C |
| P5 | Fiscal receipt issuance via SRC HDM integration protocol | CA | Legal compliance in one flow | Certification, device, SRC rules | E | C (never claimed) |
| P6 | Payment status sync from bank POS / vPOS | CA | Reconciliation | Bank API | C | C |

## 10. Inventory, recipes & food cost
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| I1 | Ingredients: units, purchase unit ↔ usage unit conversion, storage location, current price | SM, KM | Foundation of costing | — | D | A |
| I2 | Stock ledger (movements: receive, consume, reverse, waste, count adjust, transfer) and on-hand | SM | Truth about stock | — | D | A |
| I3 | Minimum stock, alerts, expiry dates and expiry alerts | SM, KM | Fewer stock-outs, less waste | — | D | A |
| I4 | Recipes per menu item and per modifier (deltas), yield/loss %, optional components, versioning | KM | Accurate cost | Ingredients | D | A |
| I5 | Cost calculation: ingredient cost, recipe cost, price (ex-VAT if configured), gross profit, gross margin %, food cost % | KM, RM, FM | Pricing decisions | Recipes | D | A |
| I6 | Price change → recalculation across affected recipes with before/after | RM | Margin protection | — | D | A |
| I7 | Automatic consumption at order acceptance; idempotent; reversals and waste on cancel/void | SM | Theoretical stock | Orders | D | A |
| I8 | Waste log with reasons | KS, KM | Waste visibility | — | D | A |
| I9 | Stock counts and variance (theoretical vs counted) | SM | Theft/waste detection | — | P | A |
| I10 | Sub-recipes / prep items (sauces, dough) | KM | Real kitchens | Recipes | P | A (one sauce) |
| I11 | Multi-location transfers | SM | Groups | Multi-location | E | — |

## 11. Purchasing & suppliers
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| U1 | Supplier database & supplier products (pack size, price) | SM | Organisation | — | D | A |
| U2 | Supplier price history | SM, FM | Negotiation, alerts | — | D | A |
| U3 | Replenishment suggestions (min level, par level, average usage, lead time) — rule-based, explained | SM | Fewer stock-outs | Ledger | D | A |
| U4 | Purchase requests → purchase orders → outstanding | SM, RM | Control | — | D (PO) / P (approval flow) | A |
| U5 | Goods receipt (full/partial, price variance) → stock + price update | SM | Accurate stock and cost | — | D | A |
| U6 | Send PO to supplier (e-mail/WhatsApp) | SM | Less phone work | Messaging | P | B |
| U7 | Supplier invoice matching / e-invoicing | FM | Accounting | Accounting integration | E | C |

## 12. Customers, loyalty & marketing
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| L1 | Customer accounts: register, login (demo), profile, addresses, favourites, preferences, allergies on file | CU | Repeat orders | — | D | A |
| L2 | Account pages: orders, reservations, points, tier, vouchers, offers | CU | Retention | Loyalty | D | A |
| L3 | CRM profile: contact, visits, orders, AOV, favourites, locations, feedback, tier, consent, segments | RM, OW | Know the guest | — | D | A |
| L4 | Segments (rule builder: last visit, spend, frequency, tier, favourite category, birthday month) with live audience size | OW, RM | Targeting | CRM | D | A |
| L5 | Loyalty programme config: tiers, earn rate, eligible channels, reward catalogue, expiry | OW | Repeat visits | — | D | A |
| L6 | Rewards/vouchers with duplication prevention (one-time codes, reserve → use/release, per-customer limits) | CU, CA | Leakage control | — | D | A |
| L7 | Offers: welcome, birthday, returning, inactive, new menu, seasonal, event, referral (configurable eligibility) | OW | Revenue | Segments | D (offer + eligibility + audience) | A |
| L8 | Campaign preview & simulated send with clearly labelled sample results | OW | Show the loop | Outbox | D | B |
| L9 | Real delivery via e-mail/SMS/WhatsApp/Telegram/push with opt-out | OW | Real retention | Providers, consent | P | C |
| L10 | Feedback request after completed visit; rating + comment; low score → manager task | CU, RM | Satisfaction, recovery | — | D | A (in-app) / B (sent) |
| L11 | Abandoned cart reminder (only signed-in, consented) | CU | Recovered orders | Accounts, messaging | C | B |
| L12 | Referral rewards | CU | Acquisition | Fraud rules | C | — |
| L13 | Shared loyalty with Hotel OS | CU | Group value | Bridge | E | — |

## 13. Employees & internal operations
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| T1 | Employees: create, invite, department, position, supervisor, activate/deactivate | GM, RM | Control | — | D | A (invite B) |
| T2 | Roles & permissions (matrix, location-scoped) | OW, GM | Security, focus | — | D | A |
| T3 | Shift planning & schedules (week grid) | RM | Coverage | — | P | A (seeded week + assign) |
| T4 | Daily/department tasks, priorities, deadlines, status, manager approval | RM, all | Accountability | — | D | A |
| T5 | Shift handover notes | all | Continuity | Messages | D | A |
| T6 | Onboarding: welcome, responsibilities, role training, SOPs, checklists, quizzes, progress, supervisor review | new staff, RM | Faster ramp-up (seasonal staff) | — | D | A |
| T7 | Internal messaging: direct, department channels, announcements, task/order threads, report a problem | all | Fewer misunderstandings | — | D | A |
| T8 | Employee workspace (mobile): today, my tables/tasks, training, messages | all | Adoption | — | D | A |
| T9 | Time clock / attendance | RM | Payroll input | — | C | — |
| T10 | Payroll, tips distribution | FM | — | Legal, accounting | X | — |
| T11 | Social feed, likes, gamification | — | Not needed | — | X | — |

## 14. AI assistants
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| A1 | Customer assistant (scripted engine): menu Q&A, filter by configured ingredients/tags, services, hours, reservations, loyalty explanation, hand-off to staff | CU | 24/7 answers, conversion | Menu data | D | A (scripted) |
| A2 | Allergy policy: answers only from entered allergen data, always shows the disclaimer, and escalates uncertainty ("not entered" ≠ "free from") | CU | Safety | Menu data | D | A |
| A3 | Employee assistant: SOP search, menu facts, task instructions, inventory warnings | all staff | Fewer interruptions | SOPs | P | A (SOP search, scripted) |
| A4 | Manager questions in natural language over metrics (fixed question catalogue with data citations) | OW, RM | Faster insight | Analytics | D (5 canned questions) | A |
| A5 | LLM engine with tool calls, answer post-check against data | all | Flexible language | Claude API, tenant data | C | C |
| A6 | Insight cards ("Khorovats margin fell 6 pts after pork price rose") with the supporting data | OW | Actionable | Analytics | D | A |

## 15. Analytics
| ID | Feature | Roles | Business value | Dependencies | Tier | Demo |
|---|---|---|---|---|---|---|
| N1 | Sales: total, orders, AOV, by channel/category/item/hour/day, comparisons | OW, FM | Visibility | — | D | A |
| N2 | Profitability: theoretical food cost, gross profit, gross margin, per item, discounts, waste cost, ingredient price changes. **Net profit only when operating expenses are entered**, otherwise not shown | OW, FM | Decisions | Recipes | D | A |
| N3 | Menu engineering matrix (popularity × margin: stars, plowhorses, puzzles, dogs) | OW, RM | Menu decisions | N1+N2 | D | A |
| N4 | Operations: prep time, service time, late tickets, cancellations, table utilisation, turnover, reservation performance, no-shows, complaints, stock-outs | RM | Efficiency | — | D | A |
| N5 | Team: tasks done/overdue, workload, shift coverage, orders handled, training progress | RM | People management | — | D | A |
| N6 | Customers: new/returning, members, retention, average spend, segments, campaign performance (simulated labelled) | OW | Retention | CRM | D | A |
| N7 | Exports (CSV) | FM | Accounting | — | P | A |
| N8 | Group roll-ups | OW | Multi-location | — | E | — |

## 16. Automations
Full map with triggers, conditions, actions, owners, value and failure handling: `RESTAURANT_OS_USER_JOURNEYS.md` §8. In the catalogue:

| ID | Feature | Tier | Demo |
|---|---|---|---|
| Z1 | Automation engine inside the reducer, with on/off toggles and run counts | D | A |
| Z2 | Internal actions (routing, tasks, stock, loyalty, notifications) | D | A |
| Z3 | External actions (messages) via outbox, labelled | D | B |
| Z4 | User-defined automations (no-code builder) | E | — |

## 17. Settings & platform
| ID | Feature | Tier | Demo |
|---|---|---|---|
| G1 | Location settings: hours, timezone, currency AMD, VAT mode (prices incl. VAT, rate), service charge | D | A |
| G2 | Dining areas, tables, stations, thresholds | D | A (edit thresholds; seeded areas) |
| G3 | Brand theme preset switch | D | A |
| G4 | Audit log (voids, discounts, price changes, permission changes) | P | A |
| G5 | Multi-location & brand management UI | E | — |
| G6 | Real multi-tenant auth, RLS, backups | P | C |
| G7 | Billing of RISEUP subscription | C | — |

---

## 18. Prioritisation summary (module level)
Scores 1–5. **Demand** is a hypothesis until discovery interviews confirm it. **Integration dependency** is inverted: 5 = none needed.

| Module | Business value | Demand (hyp.) | Complexity (5 = easy) | Ops importance | Demo impact | Integration independence | Tier |
|---|---|---|---|---|---|---|---|
| QR ordering + status | 5 | 5 | 4 | 5 | 5 | 5 | **D** |
| Kitchen display + stations | 5 | 4 | 4 | 5 | 5 | 5 | **D** |
| Premium website + menu | 4 | 4 | 3 | 3 | 5 | 5 | **D** |
| Orders inbox / overview | 5 | 5 | 4 | 5 | 4 | 5 | **D** |
| Floor & tables | 4 | 4 | 3 | 5 | 5 | 5 | **D** |
| Recipes & food cost | 5 | 4 | 3 | 4 | 5 | 5 | **D** |
| Inventory + purchasing (core) | 4 | 3 | 3 | 4 | 4 | 5 | **D** (core) / P |
| Reservations book | 4 | 4 | 3 | 4 | 4 | 5 | **D** |
| CRM + loyalty + offers | 4 | 3 | 3 | 3 | 4 | 4 | **D** (core) / P |
| Owner analytics + insights | 5 | 4 | 3 | 3 | 5 | 5 | **D** |
| Employees, tasks, onboarding, messages | 3 | 3 | 4 (reuse) | 4 | 3 | 5 | **D** (reuse) |
| Customer AI assistant | 3 | 3 | 3 | 2 | 4 | 5 (scripted) | **D** (scripted) |
| Real messaging | 4 | 4 | 3 | 4 | 2 | 1 | P |
| POS integration | 4 | 4 | 1 | 4 | 2 | 1 | C |
| Online payments | 3 | 3 | 2 | 3 | 2 | 1 | C |
| Fiscal receipts | 3 | 3 | 1 | 4 | 1 | 1 | E |
| Delivery-platform sync | 3 | 3 | 1 | 3 | 1 | 1 | C |
| Multi-location UI | 3 | 2 | 2 | 2 | 2 | 5 | E |

### Do not build yet (X), and why
- Payroll and tip distribution: legal and accounting scope.
- Social/gamified staff feed: adds noise, not coordination.
- Native mobile apps: the web and PWA cover guests and staff.
- Own delivery-courier logistics (routing, GPS tracking): only after a pilot proves delivery volume.
- Nutrition/calorie engine: no local requirement identified.
- Public "real-time" table availability: only once table inventory and rules are proven at a pilot.
