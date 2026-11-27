# RISEUP Restaurant OS: Demo Implementation Plan

**Status:** Core Demo (R0–R6) **approved 2026-11-27**; R0 complete (see `RESTAURANT_OS_R0_REPORT.md`). Full-demo phases R7–R9 are **not approved** and stay on the roadmap. **Demo brand:** Summit Table (fictional, configurable).

## 1. Estimating assumptions
- One senior full-stack engineer working with AI assistance, in the existing `business-os/` stack (Next.js 16.2.9, React 19, Tailwind 4, TypeScript, `node --test`).
- **No new runtime dependencies.** (`qrcode` and `@netlify/blobs` already exist.) Playwright is pre-installed in this environment and used for smoke tests from outside the project; it is not added to `package.json`.
- Admin and kitchen UI in Armenian, with all strings kept in one dictionary per surface so more languages can be added; customer pages hy/ru/en. Native-speaker review by the founders is **not** included in the hours.
- Photography: the existing 17 licensed food photos and the licensed hotel/restaurant photos in `public/img/`. No custom shoot.
- Fictional data only; no integrations; no public deployment.
- Included in every phase: domain unit tests, a manual QA pass, and one round of design revisions (that round is the difference between the low and high end).
- **Excluded from all numbers:** sales materials, printing of QR tents, meetings, native-speaker review, Netlify deployment and production verification, real integrations, anything in R7–R9.
- Capacity warning carried over from `MVP_ROADMAP.md`: most delivery hours before 22 Dec are committed to paid client work.

## 2. Phases (approved Core scope, reconciled)
| Phase | Included | Excluded (moved) | Min h | Max h | Exit check |
|---|---|---|---|---|---|
| **R0 Shared foundation** ✅ done | Kernel replay, namespaced session store + shared route factory, generic client store, shared device frame / connection pill, per-vertical provider switch, kernel tests, before/after regression | Rewriting the hotel admin shell and hotel presenter into shared components (kept as-is to protect hotel behaviour) | 7 | 10 | Hotel tests 9/9; 20-page snapshot identical; presenter flow identical |
| **R1 Restaurant domain + seed** | Types, reducer (orders, station tickets, table sessions, requests, menu & availability, recipes, stock ledger, waste, suppliers, POs, receipts), costing/VAT rules, analytics + savings formulas, deterministic Summit Table seed with history, clock presets, permissions, domain tests | Loyalty, customer accounts, reservations book, workforce/onboarding (→ R7/R8) | 16 | 22 | ≥ 40 domain tests; replay benchmark |
| **R2 Guest experience** | Theme tokens + configurable brand, website home, menu, dish sheet with modifiers, cart, takeaway checkout rules, order status page, QR entry + printable tents, hy/ru/en | Customer accounts, loyalty, AI customer assistant, reservation page (→ R7) | 20 | 28 | A/B guest side on phone |
| **R3 Service operations** | Orders inbox/detail, live overview, waiter app, SVG floor plans + table states, requests, KDS per station + expo, sold-out, settle-on-POS | Reservation book/host stand (→ R7) | 22 | 30 | A and B end to end across devices |
| **R4 Menu & margin** | Ingredients, stock, recipe view with line costs, price change → recalculation with before/after, waste log, alerts, suppliers, PO + receiving, menu price/availability | Recipe editor for new recipes (view + quantities edit only) | 16 | 22 | Scenario C end to end |
| **R5 Owner analytics + Business Performance & Savings Calculator** | Sales, channels, AOV, best sellers, margin per dish, menu engineering, food cost, ingredient price changes, waste cost, shortages, cancellations/remakes, prep times, insights with evidence, **Savings Calculator** (actual / calculated / hypothetical clearly separated) | Team and customer analytics (→ R7/R8) | 16 | 22 | Scenario F; cross-screen totals consistent |
| **R6 Presenter + QA** | `/present/restaurant` with guided A, B, C, F, per-scenario restart, reset, simulation labels, integrations page, multi-session E2E (customer / waiter / kitchen / owner), performance check | Public deployment | 10 | 14 | Acceptance criteria for Core |
| **Core total (R0–R6)** | | | **107** | **148** | |
| R7 Retention + reservations *(not approved)* | Accounts, loyalty, CRM screens, segments, offers, campaign simulation, reservations book/host/waitlist, customer assistant | | 18 | 26 | Scenario D |
| R8 Team *(not approved)* | Positions, onboarding, tasks, messaging, `/r/me` | | 8 | 12 | Scenario E |
| **Full total (R0–R8)** | | | **133** | **186** | |
| R9 Hotel bridge *(not approved, optional)* | Room-service ordering from Hotel OS, simulated folio posting | | 8 | 12 | → **141–198 h** with R9 |

**Arithmetic check:** Core min 7+16+20+22+16+16+10 = 107; Core max 10+22+28+30+22+22+14 = 148. Full = Core + R7 + R8 = 107+18+8 = 133 to 148+26+12 = 186.

**Change against the Phase 1 estimate (110–150 / 130–180):** R1 and R2 shrank (loyalty, accounts, reservations and the assistant moved to R7, which grew from 14–20 to 18–26); R5 grew by 4–6 h for the Savings Calculator. The earlier totals were rounded; these are exact sums.

## 3. Sequence and dependencies
```
R0 ─► R1 ─┬─► R2 ─┐
          ├─► R3 ─┼─► R6 (Core demo)  ─► pilot conversations ─► R7 ─► R8 ─► (R9)
          ├─► R4 ─┤
          └─► R5 ─┘
```
- R2–R5 can interleave after R1 but are best built in the order A → B → C → F so each scenario is demoable as soon as it exists.
- **Stop points:** after R3 (A+B usable for a first restaurant conversation, 65–90 h), after R6 (Core).

## 4. Technical task list (by phase)
**R0**
1. `lib/kernel/engine.ts`: `createEngine({ seed, apply })` returning `replay`; hotel engine re-exported unchanged.
2. `lib/kernel/session-route.ts`: factory used by `/api/session/[code]` (hotel, same behaviour) and `/api/rsession/[code]` (restaurant).
3. Store keys namespaced by vertical; counter blob + last-key index for the restaurant route.
4. `DemoProvider` parameterised (`vertical`, `apiBase`, `lsPrefix`); hotel keeps `bos:` keys so existing devices keep their state.
5. Presenter `ScenarioRunner` extracted; hotel scenarios moved without text changes.
6. `AppShell` with nav config and `can()`.

**R1**
7. `lib/restaurant/types.ts`, `data.ts` (static config), `seed.ts` (memoised by epoch), `engine.ts` (reducer), `rules.ts` (costing, VAT, estimates, eligibility), `selectors.ts`, `permissions.ts`, `analytics.ts`.
8. Tests: `tests/restaurant/*.test.ts`.

**R2–R8**: one folder per surface (`app/restaurant/[lang]`, `app/q`, `app/r/admin`, `app/r/floor`, `app/r/kds`, `app/r/host`, `app/r/me`, `app/present/restaurant`), components under `components/restaurant/*`, theme tokens in a restaurant CSS layer (no changes to Pine Ridge tokens).

## 5. Test strategy
| Level | What | How |
|---|---|---|
| Domain unit | Order/ticket/table/reservation machines; invalid transitions ignored; sold-out rejected; client prices ignored; stock idempotency under duplicate and out-of-order events; reverse vs waste; recipe cost with yield, modifiers, sub-recipes; VAT on/off; GP/GM; loyalty earn/claw once; voucher lifecycle; segment audience counts; permission matrix | `node --test` |
| Consistency | Same totals in overview, analytics, CRM and order list for any random event sequence (property-style test with seeded random sequences) | `node --test` |
| Performance | Replay of seed + 450 events < 40 ms (Node baseline × factor for mid-range phone, verified once on a real device) | Script |
| Sync | Append/poll/reset/epoch; session cap; offline queue resend | Route tests + manual |
| E2E smoke | Scenarios A–F in two browser contexts (phone viewport + desktop), reset between runs | Playwright from the pre-installed binary, or the manual checklist in `ACCEPTANCE_CRITERIA.md` |
| Regression | Hotel suite + hotel presenter manual run after R0 and before every deploy | Existing tests + checklist |
| Accessibility | Keyboard, focus, contrast (KDS ≥ 7:1), reduced motion, screen-reader labels on status | Manual + Lighthouse |
| Devices | iPhone Safari, Android Chrome, iPad/Android tablet (KDS, host), laptop Chrome/Safari, TV browser if available | Manual |

## 6. Risks to the plan
| Risk | Effect | Response |
|---|---|---|
| R0 extraction touches hotel code | Could break the live hotel demo | Separate commit, full hotel regression, deploy only after manual presenter run; rollback = revert one commit |
| Premium design iterations | Hours overrun in R2 | Fix the visual direction with 2–3 reference screens for approval at the start of R2 |
| Photo coverage | Weak visuals | Shortlist images early; label illustrative images |
| Discovery shows different priorities | Wasted hours | Stop points after R3 and R6; re-prioritise from interviews |
| Netlify Blobs behaviour in production | Cross-device sync fails at a meeting | Validate on the hotel deployment before R3; local mode fallback |

## 7. Approvals needed before or during implementation
1. This blueprint (scope Core vs Full, decision C in `TECHNICAL_ARCHITECTURE.md` §3).
2. Permission to make the **R0 refactor** touching hotel files (behaviour-preserving).
3. Restaurant name/brand for the demo ("Summit Table" or another) and the two theme presets.
4. Later: extending the main site's `/go/` redirect for restaurant QR cards (changes the marketing site config).
5. Later: adding Playwright as a dev dependency (optional).
