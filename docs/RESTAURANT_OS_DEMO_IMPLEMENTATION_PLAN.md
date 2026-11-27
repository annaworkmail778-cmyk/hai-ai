# RISEUP Restaurant OS: Demo Implementation Plan

**Status:** Phase 1 plan, for approval. **No code is written until explicit approval.** **Date:** 2026-11-27.

## 1. Estimating assumptions
- One senior full-stack engineer working with AI assistance, in the existing `business-os/` stack (Next.js 16.2.9, React 19, Tailwind 4, TypeScript, `node --test`).
- **No new runtime dependencies.** (`qrcode` and `@netlify/blobs` already exist.) Playwright is available in this environment for smoke tests but is not added to `package.json` without approval.
- Admin UI in Armenian; customer pages hy/ru/en with native-speaker review by the founders (not included in hours).
- Photography: existing 17 licensed food photos plus ≈ 25 more licensed stock images (selection ≈ 3 h, included in R1). No custom shoot.
- Fictional data only; no integrations.
- Estimates include unit tests for domain logic and a manual QA pass per phase; they **exclude** sales materials, printing and meetings.
- Ranges reflect uncertainty in design polish and device QA; the upper bound includes one round of design revisions per surface.
- Capacity warning carried over from `MVP_ROADMAP.md`: most delivery hours before 22 Dec are committed to paid client work. The Core demo alone is roughly 3–4 working weeks of one person full time.

## 2. Phases
| Phase | Content | Hours | Output / exit check |
|---|---|---|---|
| **R0 Kernel extraction** | Generalise engine/replay, session store, session route (vertical + event allow-list), `DemoProvider`, presenter scenario runner, app shell (nav from permissions) into `lib/kernel` + `components/shared`. **Hotel behaviour unchanged.** Restaurant route with counter blob | 7–10 | 9/9 hotel tests pass; hotel presenter scenarios 1–3 manually verified on phone + laptop |
| **R1 Restaurant domain + seed** | Types, reducer (orders, tickets, table sessions, requests, menu, recipes, stock ledger, POs, reservations, customers/loyalty, workforce reuse), selectors, deterministic seed with aggregated history, clock presets, permissions | 18–24 | Domain test suite (≥ 40 tests): state machines, idempotent stock, costing, VAT, loyalty keys, permissions, analytics consistency; replay < 40 ms benchmark |
| **R2 Guest experience** | Theme system + 2 presets, website pages, menu + dish sheet + modifiers, cart, checkout rules, status page, QR entry and tents, accounts, scripted customer assistant | 24–32 | Scenario A/B guest side works on iPhone Safari + Android Chrome; Lighthouse mobile ≥ 85 |
| **R3 Service operations** | Orders inbox/detail, overview, waiter app, floor plans (SVG) and table states, requests, KDS stations + expo, menu availability/price, settle-on-POS | 22–30 | Scenarios A and B end to end cross-device |
| **R4 Menu & margin** | Ingredients, recipe editor/viewer, costing panels, price-change recalculation with before/after, inventory ledger, waste, alerts, suppliers, PO, receiving | 16–22 | Scenario C end to end; costing tests |
| **R5 Owner analytics** | Sales, profitability, menu engineering, operations, team, customers tabs; insight cards with evidence; manager "ask" (canned) | 12–16 | Scenario F; cross-screen totals consistent (tested) |
| **R6 Presenter + QA (Core)** | `/present/restaurant` scenarios A, B, C, F; launcher card; integrations page; settings; automation page; reset; local mode; full device QA; deploy to the existing Netlify site | 10–14 | Acceptance criteria §2, §3, §5–8 for Core |
| **Core subtotal (R0–R6)** | | **≈ 110–150 h** | **Core demo done** |
| **R7 Retention (D)** | CRM screens, segment builder, offers & eligibility, campaign simulation & labelled sample results, reservations book + host + waitlist | 14–20 | Scenario D |
| **R8 Team (E)** | Restaurant positions, team admin, onboarding content for waiter/kitchen/host/cashier/manager, tasks with approval, messaging, `/r/me` | 8–12 | Scenario E |
| **R9 Hotel bridge (optional)** | Hotel guest "Dining" tab → restaurant session; KDS shows room; simulated folio posting | 8–12 | Requires a small, approved change in the hotel guest site |
| **Full total (R0–R8)** | | **≈ 130–180 h** (R9 adds 8–12 h) | |

Ranges are the plain sum of the phase ranges. Reuse of the hotel's loyalty, workforce and messaging reducers is already reflected in the R7/R8 numbers. Hours are tracked per phase and the whole plan is re-estimated after R1, when the domain size is known.

## 3. Sequence and dependencies
```
R0 ─► R1 ─┬─► R2 ─┐
          ├─► R3 ─┼─► R6 (Core demo)  ─► pilot conversations ─► R7 ─► R8 ─► (R9)
          ├─► R4 ─┤
          └─► R5 ─┘
```
- R2–R5 can interleave after R1 but are best built in the order A → B → C → F so each scenario is demoable as soon as it exists.
- **Stop points:** after R3 (A+B usable for a first restaurant conversation, ≈ 71–96 h), after R6 (Core), after R8 (Full).

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
3. Restaurant name/brand for the demo ("Ember & Lavash" or another) and the two theme presets.
4. Later: extending the main site's `/go/` redirect for restaurant QR cards (changes the marketing site config).
5. Later: adding Playwright as a dev dependency (optional).
