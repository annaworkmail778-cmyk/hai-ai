# RISEUP Restaurant OS: Technical Architecture

**Status:** Phase 1 (architecture only), for approval. Nothing here is implemented unless marked **Implemented**.
**Date:** 2026-11-27
**Related:** `RESTAURANT_OS_DATA_MODEL.md` (entities), `RESTAURANT_OS_INTEGRATION_MATRIX.md` (external systems), `RESTAURANT_OS_DEMO_IMPLEMENTATION_PLAN.md` (build order).


---

## Revision 2 — implemented architecture (2026-11-28)

* **Next.js 16 App Router** app in `business-os/`; Restaurant OS routes: guest `/restaurant/[lang]/*`, QR `/q/[session]/[token]`, staff `/r/floor`, `/r/kds`, `/r/host`, admin `/r/admin/*`, presenter `/present/restaurant`, API `/api/rsession/[code]`.
* **Shared kernel with Hotel OS** (`src/lib/kernel/*`, `src/lib/server/*`): replay, namespaced session store, session route factory, client store with pending queue and local mode. This phase added only an additive `pendingIds` field to the client store (used for "not yet confirmed" order flags); Hotel OS behaviour verified unchanged.
* **Domain** (`src/lib/restaurant/`): `engine.ts` (orders, tickets, stock, sessions), `ops.ts` (courses, floor ops, bills, payments, reservations, waitlist, inbox, reviews, CRM, loyalty, team, stocktake, purchasing approvals, automations runner), `nlp.ts`, `assistant.ts`, `channels.ts` (honest integration states), `rules.ts`, `analytics.ts`, `permissions.ts`, seeds `seed.ts` + `seed-ops.ts`.
* **Events**: 79 allow-listed types; sensitive rules enforced in the reducer (DATA_ARCHITECTURE §1).
* **Adapters**: payment adapter interface with `demo-terminal` simulated implementation; message and review channels expose state `in_product | simulated | manual_only | partner_only`.
* **Staff i18n**: `staff-t.ts` (hy/ru/en per device) for waiter, KDS and host; admin Armenian-first via `staff-i18n.ts`.
* **AI**: deterministic engines; Claude adapter design in AI_ARCHITECTURE.
* **Security posture and production gaps**: SECURITY_REQUIREMENTS.

### Hotel OS bridge (optional, not built)
Contract: Hotel OS exposes `room.lookup(roomNumber, guestName) → {stayId, allowCharge}` and accepts `folio.post(stayId, amount, ref, lines)`; Restaurant OS adds bill part method `room_charge` that becomes "paid" only after `folio.post` succeeds, and a room-service channel on the QR/guest site. Shared guest profile only with guest consent.

---

## Revision 1 — Phase 1 architecture (kept for reference)


## 1. Audit of the existing repository (verified in code, 2026-11-27)

### 1.1 Where things are
| Item | Finding |
|---|---|
| Branches | `main` contains only the old marketing website. The Hotel OS (`business-os/`) and all product docs exist only on `claude/premium-tech-portfolio-site-xk28q4`. This branch (`claude/clever-carson-vfvd6s`) was fast-forwarded onto it so the new docs sit beside the code they describe. **No existing file was changed.** |
| Root app | `riseup-group.com` marketing site (Next.js 16.2.9, React 19.2.4, Tailwind 4). Contains the allow-listed `/go/h-{a,b}` → demo redirect in `next.config.ts` |
| `business-os/` | Standalone Next.js 16.2.9 app, port 3100, own `package.json`, own `netlify.toml` (Base directory = `business-os`, Node 22). Dependencies: `next`, `react`, `react-dom`, `qrcode`, `@netlify/blobs`. **No UI library, no animation library, no state library.** |
| Tests | `node --experimental-strip-types --test tests/*.test.ts`. **9/9 pass** (run during this audit, no install needed). Engine, analytics, assistant, ROI, booking/voucher lifecycle, QR service routing, onboarding |
| Size | ≈ 6,200 lines of TS/TSX across 47 source files |

### 1.2 What is genuinely implemented (Hotel OS)
| Capability | Where | Verdict |
|---|---|---|
| Event-sourced state `state = replay(seed(baseDate), events)` | `src/lib/engine.ts` | **Works.** Deterministic, idempotent by event id (`replay` skips seen ids) |
| Session sync phone ↔ laptop | `src/lib/client/demo-store.tsx`, `src/app/api/session/[code]/route.ts`, `src/lib/server/session-store.ts` | **Works** with the in-memory store; Netlify Blobs backend written to the official API but, per README, not yet exercised on Netlify |
| Offline / local mode | `demo-store.tsx` (localStorage + BroadcastChannel) | **Works** (same device only) |
| Pending-event queue and reconnect | `demo-store.tsx` | **Works**: unsent events cached and re-sent in order |
| Presenter mode with phone + laptop iframes, QR, reset, night mode | `src/app/present/page.tsx` | **Works**, 3 hotel scenarios |
| QR entry `/s/{code}/{target}` | `src/app/s/[code]/[target]/page.tsx` | **Works** for `hotel`, `admin`, `present` |
| Guest site hy/ru/en | `src/app/hotel/[lang]/…` | **Works** |
| Admin (12 pages) | `src/app/admin/*` | **Works**, Armenian only |
| Scripted assistant with handoff | `src/lib/assistant.ts` | **Works**, answers only from data |
| Analytics with tested formulas | `src/lib/analytics.ts` | **Works** |
| Outbox labelled "Simulation · not sent" | engine + automations page | **Works**, nothing is ever sent |

### 1.3 What exists only as a domain model (no UI)
The latest commit (`5b425a4`, "Hospitality OS foundation") added to the **hotel** state: accounts, loyalty (tiers, ledger, rewards, vouchers, campaigns), a 16-item restaurant menu with allergens and options, 12 tables, restaurant orders with a strict status machine, QR service requests, staff positions with a permission map, training/onboarding with quizzes and supervisor review, SOPs, and internal messaging channels.

- These are **reducer + seed + tests only.** `grep` finds no page, component or route that renders orders, menu, tables, loyalty, training or messaging.
- `HOSPITALITY_OS_PRODUCT_VISION.md` lists routes (`/kds`, `/staff/*`, `/q/table/{n}`, `/hotel/{lang}/dining`) that **do not exist**.

### 1.4 Defects and drift found (not fixed: this phase changes no code)
| # | Finding | Impact on Restaurant OS |
|---|---|---|
| D1 | `order.create` (`engine.ts:459–471`) prices items from the menu (good) but **does not reject items marked `available: false`** | Restaurant engine must validate availability server-side and in the reducer |
| D2 | Notifications link to `/admin/restaurant`, `/admin/requests`, `/admin/team`, which have no page | Dead links once those notifications appear in the bell |
| D3 | `ORDER_FLOW` (`rules.ts:311`) allows `out_for_delivery` only for room service, no cancel after `preparing`, no per-item void, no per-station tickets | Insufficient for a real restaurant; Restaurant OS needs its own richer machine (§6) |
| D4 | README says sessions are capped at 400 events; the route uses `MAX_EVENTS = 1500` | Docs drift only |
| D5 | `HOSPITALITY_OS_PRODUCT_VISION.md` references `HOSPITALITY_OS_FEATURE_MAP.md`, which does not exist | Docs drift only |
| D6 | The actor (`by`) is set by the client (`demo-store.tsx:344`); no server identity | Acceptable for a demo; production must derive the actor from the session (§9) |
| D7 | Each poll re-lists **all** blob keys of the session (`session-store.ts:483`) and every append lists them again to count | Fine at < 1,500 events; a busy KDS demo produces more events than a hotel demo, see §5.4 |
| D8 | `replay` rebuilds the full seed (`createSeed`) on **every** state change | Restaurant seed must be designed for this (§5.3) |

### 1.5 Earlier, conflicting restaurant decisions in the docs
| Document | Position |
|---|---|
| `LEAN_DEMO_SCOPE.md` §5, `TECHNICAL_ARCHITECTURE.md` §9 | Hotel and restaurant are **separate verticals**: separate routes, seed, screens, themes. Fictional "Summit Table" |
| Commit `5b425a4` | Restaurant **inside** the hotel state (`Property.type = "hotel_restaurant"`) |

This blueprint resolves the conflict in §3.

---

## 2. Reuse map

| Layer | Reuse as-is | Generalise into shared kernel | Keep hotel-specific | New, restaurant-specific |
|---|---|---|---|---|
| Event sourcing | `replay` idea, id de-duplication | `createEngine<State, Event>(seed, apply)` | Hotel reducer cases | Restaurant reducer, order/ticket machines, stock ledger |
| Sync | Client queue, polling, reconnect, local mode, epoch reset | Parameterise store/route by **vertical** (`hotel`, `restaurant`) and event allow-list | `/api/session/[code]` keeps working unchanged | `/api/rsession/[code]` (thin wrapper) |
| Presenter | `Device` frame, QR, reset, PIN, mode switch | Scenario-runner component taking `Scenario[]` | Hotel scenarios 1–3 | Scenarios A–F |
| Design system | Tokens (`ink`, `paper`, `signal`, status colours), `Button`, `Badge`, `Card`, `Kpi`, `Modal`, `Segmented`, `Toggle`, `Input`, icons, charts | Move admin tokens + UI kit to `components/ui` (already there) | Pine Ridge tokens (`pine`, `cream`, `brass`) | Restaurant theme presets (§8), KDS high-contrast theme |
| Admin shell | `ConnPill`, `Bell`, actor switch, layout | `AppShell` taking `nav[]`, brand, counts | Hotel nav | Role-based nav from permissions |
| Rules | `itemPrice`, loyalty math (`loyaltyOf`, `earnFor`, tier ranking), voucher lifecycle (`reserved → used / released`) | Lift into `lib/shared/loyalty.ts`, `lib/shared/menu.ts` | Booking calc, room pricing | Recipe costing, stock, table sessions, bill split |
| Staff | Positions, permission map pattern, training/enrollment, SOPs, channels/messages | Lift into `lib/shared/workforce.ts` with vertical-specific position lists | Hotel positions | Restaurant positions and permissions (§9) |
| Assistant | Engine interface + "answer only from data, else hand off" | `AssistantEngine` contract | Hotel intents | Menu/allergen/reservation intents with strict allergen policy |
| Analytics | Tested-formula approach, `charts.tsx` | — | Occupancy/ADR/RevPAR | Sales, AOV, channel mix, food cost, gross margin, prep times |

**Rule:** extraction into the kernel happens behind the existing hotel tests. If any of the 9 hotel tests or the 3 presenter scenarios break, the extraction is wrong.

---

## 3. Key decision: one platform, separate vertical apps

### Options compared
| Option | Description | Pros | Cons |
|---|---|---|---|
| A. Extend the hotel state (what `5b425a4` started) | One `HotelState` containing restaurant data | Fastest for room service | A restaurant-only customer would demo inside a hotel; every restaurant event replays the whole hotel; hotel and restaurant releases become coupled; contradicts the approved "separate verticals" direction |
| B. Separate app / repo | New Next.js app | Clean isolation | Duplicates sync, presenter, UI kit, deploy; integration later is harder |
| **C. Shared kernel + separate vertical domains in `business-os/` (recommended)** | One deployment; `lib/kernel` (events, replay, sync), `lib/shared` (UI, loyalty, workforce), `lib/hotel`, `lib/restaurant`; separate sessions per vertical | Reuses everything that works; restaurant is demoable alone; hotel untouched; integration is an explicit, small bridge | Requires a careful, test-guarded extraction (≈ 7–10 h) |

**Decision: C.**
- Restaurant OS is its own vertical with its own state (`RestaurantState`), seed (fictional **Summit Table**, Tsaghkadzor), routes, themes and session.
- The restaurant slice already inside `HotelState` stays for now (it is not rendered anywhere). When the hotel room-service bridge is built (§10), the hotel slice is replaced by calls into the restaurant domain. Until then nothing in the hotel changes.
- Shared application shell: **yes for staff apps** (same shell component, different nav and brand line: "RISEUP Restaurant OS"). **No for customer sites**: each vertical and each restaurant style has its own layout and theme.

---

## 4. Frontend architecture

### 4.1 Route map (demo)
| Surface | Route | Device | Users |
|---|---|---|---|
| Launcher | `/` (add a Restaurant card) | Laptop | Presenter |
| Restaurant website | `/restaurant/[lang]` (hy/ru/en) — home, `/menu`, `/order`, `/order/[code]`, `/reserve`, `/events`, `/private-dining`, `/account` | Phone first | Customers |
| QR table entry | `/q/[session]/[tableToken]` → sets session + table context → `/restaurant/[lang]/menu?ctx=table` | Phone | Dine-in guests |
| Manager / owner | `/r/admin` (overview), `/r/admin/orders`, `/tables`, `/reservations`, `/menu`, `/inventory`, `/recipes`, `/purchasing`, `/customers`, `/loyalty`, `/marketing`, `/team`, `/analytics`, `/automations`, `/integrations`, `/settings` | Laptop / tablet | Owner, managers |
| Waiter app | `/r/floor` (floor plan, my tables, table detail, add items, requests) | Phone | Waiter, head waiter |
| Host stand | `/r/host` (today's book, waitlist, seat party) | Tablet | Host |
| Kitchen display | `/r/kds?station=hot` (all / per station / expo) | Tablet / TV | Chefs, kitchen staff, bartender |
| Employee workspace | `/r/me` (today, my tasks, onboarding, SOPs, messages) | Phone | Every employee |
| Presenter | `/present/restaurant` | Laptop | RISEUP |

### 4.2 Rendering and state
- Same model as the hotel: the demo state depends on the session's events, so pages are **client components inside a `DemoProvider`** (already the pattern; avoids hydration mismatch). Static marketing parts of the restaurant website (hero, story, gallery) are server-rendered and do not depend on demo state, which keeps the first paint fast on 4G.
- `RestaurantDemoProvider` = the generalised `DemoProvider` with `vertical: "restaurant"`; it exposes `state`, `dispatch`, `conn`, `actor`, `role`, `can(permission)`.
- **Selectors, not ad-hoc filters in pages**: `lib/restaurant/selectors.ts` (`openOrders`, `ticketsForStation`, `tableStatus`, `stockOnHand`, `recipeCost`, `dailySales`). Pages stay thin; selectors are unit-tested.
- Next.js 16 note (per `AGENTS.md`): read `node_modules/next/dist/docs/` before implementation; the hotel app already uses async `params` (`use(params)`) and `proxy.ts` conventions of this version.

### 4.3 Customer cart
- Cart lives **on the device only** (localStorage, keyed by session + table context). It is not an event, so it never appears in staff views. This enforces "cart ≠ submitted order".
- Submitting dispatches one `order.submit` event with item ids, options and notes. **Prices are never sent from the client**; the reducer prices from the menu (as the hotel engine already does).

---

## 5. Data flow, events and synchronisation

### 5.1 Flow (Scenario A)
```
Guest phone (QR, table T7)                 Server session store                Laptop / tablet / TV
cart (local) ──order.submit──► append event ─────────────────► poll (~1.2 s) ─► replay
                                                                      ├─► Waiter app: T7 "New order" (needs accept or auto-accept rule)
                                                                      ├─► KDS hot / cold / bar: tickets per station
                                                                      └─► Owner overview: live counters
Kitchen taps "Start" / "Ready" ──ticket.status──► append ─► poll ─► guest status page updates
```

### 5.2 Event catalogue (restaurant, demo)
Namespaced, validated by an allow-list like the hotel route:
`order.submit`, `order.accept`, `order.reject`, `order.cancel`, `order.itemVoid`, `order.addItems`, `ticket.start`, `ticket.ready`, `ticket.bump`, `order.serve`, `order.handoff` (pickup), `order.dispatch`, `order.complete`, `table.open`, `table.assignWaiter`, `table.request` (waiter/bill/help), `table.requestDone`, `table.close`, `table.clean`, `reservation.request`, `reservation.confirm`, `reservation.decline`, `reservation.modify`, `reservation.cancel`, `reservation.seat`, `reservation.noShow`, `waitlist.add`, `waitlist.seat`, `menu.availability`, `menu.price`, `menu.item.upsert`, `ingredient.price`, `stock.receive`, `stock.waste`, `stock.count`, `po.create`, `po.receive`, `recipe.update`, `customer.register`, `customer.update`, `loyalty.redeem`, `offer.create`, `offer.toggle`, `campaign.simulate`, `employee.create`, `employee.toggle`, `shift.assign`, `task.create`, `task.status`, `training.step`, `training.submit`, `training.review`, `msg.send`, `automation.toggle`, `settings.update`, `clock.set`.

Every event: `{ id, at, by, type, …payload }`. The reducer is **pure and deterministic**: all automations (station routing, stock deduction, loyalty earning, notifications, simulated outbox) run inside it, exactly like the hotel engine.

### 5.3 Seed and replay performance (fixes D8 for this vertical)
- A realistic restaurant history (60 days × 120–260 orders/day) is ≈ 10–14k orders. Re-creating that on every event is too slow on a phone.
- **Decision:** the seed is split:
  - **History** (day −60 … −15): stored as **pre-aggregated daily facts** (sales by hour/channel/category/item, prep-time distributions, waste, stock snapshots). Generated once per epoch, memoised (`seedCache[epoch]`), never mutated.
  - **Recent detail** (day −14 … today): raw orders, tickets, movements (≈ 2–3k orders) so drill-downs and CRM histories work.
  - Replay = `structuredClone(memoisedRecent)` + apply events. Target **< 40 ms** on a mid-range Android phone (acceptance criterion).
- Analytics read history aggregates + recent detail through one selector layer, so totals agree across screens (tested).

### 5.4 Sync capacity
- Hotel route caps sessions at 1,500 events. A restaurant demo (KDS bumps, waiter actions) uses ≈ 40–80 events per scenario run, so a full A–F run is ≈ 300–450 events. Cap stays at **1,500** with Reset between customers.
- Mitigation for D7 on the restaurant route: keep a per-session **counter blob** and an **index of the last key**, so append does not list every key. (Small, local to the new route; the hotel route is untouched.)
- KDS and waiter views poll at 1.2 s while visible (existing behaviour). Production replaces polling with database change streams (§7).

### 5.5 Clock
The demo has a `clock` (`live`, plus presenter presets such as "Friday 20:15 peak") so the floor and KDS look busy during a 10:00 meeting. All displayed times derive from the clock; analytics are computed for the seed's "today".

---

## 6. Order, ticket and table state machines

### 6.1 Order (customer-visible)
```
submitted ──accept──► accepted ──(all tickets started)──► preparing ──(all tickets ready)──► ready
    │                    │                                    │                              │
    ├─reject─► rejected  ├─cancel─► cancelled                 ├─cancel(manager)─► cancelled   ├─ dine_in:  served ─► completed (table closed / bill settled)
    └─cancel(guest, only while submitted)                    (items already cooked → waste)  ├─ takeaway: picked_up ─► completed
                                                                                             └─ delivery: out_for_delivery ─► delivered ─► completed
```
- **"Accepted" is only ever set by a staff event** (or by an explicit, visible auto-accept rule a manager enabled for a channel, e.g. waiter-entered orders). The guest UI shows "Sent · waiting for the restaurant" until then.
- `preparing` / `ready` are **derived** from kitchen tickets, not set manually, so the guest status can never be ahead of the kitchen.
- Additional rounds at the same table (`order.addItems` or a second QR order) create new tickets on the same **table session**.

### 6.2 Kitchen ticket (per station)
`queued → in_progress → ready → bumped` (bumped = picked up by expo/waiter). Station routing: each menu item has a `stationId` (hot, cold, grill, pizza, pastry, bar…); modifiers can override (e.g. "add fries" → fryer). One order → one ticket per station.

### 6.3 Table session
`available → reserved (optional) → seated → ordering → waiting_food → eating → bill_requested → paid_elsewhere/closed → cleaning → available`, plus an overlay flag `assistance_requested`. Floor colours map 1:1 to these states (§8.4).

### 6.4 Idempotency and invariants (reducer-enforced, unit-tested)
| Invariant | Mechanism |
|---|---|
| An event applies once | Event id de-duplication (existing) |
| Inventory is never deducted twice for the same item | Stock movements carry a **deterministic key**: `consume:{orderItemId}:{recipeVersion}`. The ledger refuses a second movement with the same key |
| Cancel before cooking reverses consumption; void after cooking records waste | `reverse:{orderItemId}` only if a `consume:` exists and no `reverse:`/`waste:` exists; after `in_progress`, cancellation writes `waste:{orderItemId}` instead |
| Loyalty points once per completed order | Ledger entry key `earn:{orderId}`; refunds write `claw:{orderId}` |
| A voucher is used once | Existing lifecycle `active → reserved → used / released` |
| Prices come from the menu, never the client | Reducer prices; client sends ids only |
| Sold-out items cannot be ordered | Reducer rejects; UI disables (fixes D1 for this vertical) |
| Status moves only along allowed edges | Transition tables, like `ORDER_FLOW` |

**When is stock deducted?** At `order.accept` (the kitchen commits to cooking), using the **recipe version current at acceptance**, snapshotted onto the order item. Rationale: deducting at submission would count orders the restaurant rejects; deducting at completion would let a busy evening drift far from reality and miss items cooked but cancelled. Alternatives and edge cases are in `RESTAURANT_OS_DATA_MODEL.md` §6.

---

## 7. Production backend (Category C, not built in the demo)

| Concern | Decision | Reason |
|---|---|---|
| Database | PostgreSQL (Supabase, EU region) | Already the recommended stack in `TECHNICAL_ARCHITECTURE.md`; RLS + Realtime + Auth + Storage in one service |
| Tenancy | Shared schema; every business row carries `org_id` and, where location-scoped, `location_id`; **RLS on every table** + a server Data Access Layer that checks membership and permission | Simplest to operate for tens–hundreds of tenants; two independent walls |
| Writes | Server Actions / Route Handlers only; public endpoints are **insert-only** (order, reservation, assistance request), rate-limited, validated | Guests never get table-level write access |
| Order integrity | Order items store **price snapshot**, **recipe version**, **tax snapshot**; status changes in an append-only `order_events` table; `stock_movements` with a unique `idempotency_key` | Audit, reconciliation, idempotent retries |
| Realtime | DB change streams to KDS/floor/guest status | Replaces polling |
| Outbox | `outbox` table → worker (n8n or a queue) → providers; states `queued / sent / failed / simulated` | A message is "sent" only after the provider acknowledged it |
| Offline kitchen | KDS keeps a local queue (IndexedDB) and replays on reconnect; server de-duplicates by event id | Kitchens lose Wi-Fi |
| Files | Object storage, per-tenant prefixes, signed URLs | Menu photos |
| Observability | Error tracking, uptime on public endpoints, failed-outbox alert | Pilot readiness |
| Backups | Managed daily + nightly logical dump, quarterly restore test | Per existing security plan |

### 7.1 Multi-location hierarchy
```
Organization (legal business, billing, owner)
 └─ Brand (identity, master menu, loyalty programme)          e.g. "Summit Table"
     └─ Location (address, hours, timezone, VAT setup, POS link, inventory, staff roster)
         └─ Dining area (Main hall, Fireplace lounge, Terrace, Private room, Bar)
             └─ Table (label, seats, shape, position, QR token)
```
| Data | Scope | Notes |
|---|---|---|
| Customers, consent, loyalty ledger | **Organization** (shared across brands only if the owner enables it and the privacy notice says so) | One person, one profile |
| Master menu, recipes, brand assets | **Brand** | Locations inherit |
| Prices, availability, opening hours, stations, printers | **Location** (overrides brand) | `menu_item_location` override row |
| Ingredients catalogue, suppliers | **Organization** (shared catalogue) | Supplier prices may be per location |
| Stock, movements, counts, purchase orders | **Location** | Never mixed |
| Staff | Organization identity, **location membership** with role | One person can work in two branches |
| Analytics | Location; roll-ups per brand and organization | Same formulas |

**Demo:** one organization, one brand, one location, five dining areas. The data model already carries `orgId/brandId/locationId` so the readiness is real, but **no multi-location UI is built** (stated in the demo scope).

---

## 8. UI architecture and design system

### 8.1 Three visual registers
| Register | Used by | Principle |
|---|---|---|
| **Editorial** | Restaurant website, menu, account | Premium, photographic, serif display type, generous space, scroll-revealed imagery |
| **Operational** | Manager, owner, waiter, host, employee | Existing RISEUP admin tokens (`ink/paper/signal`), dense but calm, Armenian first |
| **Kitchen** | KDS | Dark, high contrast, 20 px+ body, colour = time, no decoration, 56 px touch targets, no animation except "new" pulse |

### 8.2 Restaurant theme presets (configurable per restaurant)
A theme = tokens (colours, type scale, radius, image treatment) + **layout variants** (hero, menu layout, card style). Presets: `fine_dining`, `luxury`, `hotel_restaurant`, `family`, `casual`, `cafe_bistro`. The demo ships **one complete preset** (Summit Table, `fine_dining`/mountain) and **one alternate preset** (`family`) switchable from the presenter, to prove configurability without building six designs.

### 8.3 Motion and performance (no new dependencies)
- CSS only: scroll-driven animations (`animation-timeline: view()`) as progressive enhancement, `IntersectionObserver` fallback, View Transitions where supported for menu → dish detail.
- `prefers-reduced-motion` disables all of it (the global rule already exists in `globals.css`).
- Images via `next/image` with explicit sizes, AVIF/WebP, blur placeholders; hero ≤ 180 KB on mobile.
- **Do not add** `framer-motion` (used by the marketing site) to `business-os`; it is not needed for this motion vocabulary.

### 8.4 Floor plan
SVG floor plan from table coordinates (`x, y, w, h, shape, rotation`) per dining area. One colour per table state, plus icons for "assistance" and "bill". Tap → table drawer. Works on phone (pinch/scroll) and tablet.

---

## 9. Identity, roles and permissions

### 9.1 Demo (Category A/B)
- Staff "sign-in" is a **device-level role picker** (as in the hotel; labelled demo). But **navigation and actions are permission-checked** through `can(permission)`, so a waiter really cannot open food cost, and the presenter can show it.
- Customer accounts are local demo accounts (seeded + registration). Labelled "Demo account, not secure".

### 9.2 Permission model
Permissions are strings (`resource.action`), roles are bundles, memberships are `(person, location, role)`.

| Permission | Owner | GM | Rest. mgr | Finance | Head waiter | Waiter | Host | Cashier | Kitchen mgr / Chef | Kitchen staff | Bartender | Stock / Purchasing | Delivery |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `orders.view` (all) | ● | ● | ● | ◐ | ● | own tables | — | ● | ● | — | bar | — | own |
| `orders.accept / reject` | ● | ● | ● | — | ● | ● | — | ● | ● | — | bar | — | — |
| `orders.void_after_fire` | ● | ● | ● | — | ● | — | — | — | ● | — | — | — | — |
| `discount.apply` (limit) | ● | ● | ≤ 20% | — | ≤ 10% | — | — | ≤ 5% | — | — | — | — | — |
| `kds.bump` | — | — | ◐ | — | — | — | — | — | ● | ● | ● | — | — |
| `tables.manage` | ● | ● | ● | — | ● | own | ● | — | — | — | — | — | — |
| `reservations.manage` | ● | ● | ● | — | ● | view | ● | — | — | — | — | — | — |
| `menu.availability` | ● | ● | ● | — | ● | — | — | — | ● | — | bar | — | — |
| `menu.edit / price` | ● | ● | ● | — | — | — | — | — | ◐ (draft) | — | — | — | — |
| `inventory.view` | ● | ● | ● | ● | — | — | — | — | ● | ◐ | bar | ● | — |
| `inventory.adjust / waste` | ● | ● | ● | — | — | — | — | — | ● | waste | bar | ● | — |
| `purchasing.manage` | ● | ● | ◐ | ● | — | — | — | — | ◐ | — | — | ● | — |
| `costs.view` (recipe cost, margin) | ● | ● | ● | ● | — | — | — | — | ● | — | — | ◐ | — |
| `finance.view` (sales, profit) | ● | ● | ◐ | ● | — | — | — | — | — | — | — | — | — |
| `crm.view` | ● | ● | ● | — | ◐ | name+notes | ◐ | — | — | — | — | — | — |
| `crm.export` | ● | — | — | — | — | — | — | — | — | — | — | — | — |
| `marketing.campaigns` | ● | ● | ◐ | — | — | — | — | — | — | — | — | — | — |
| `staff.manage` | ● | ● | ● | — | ◐ | — | — | — | ◐ (kitchen) | — | — | — | — |
| `settings.integrations` | ● | ● | — | — | — | — | — | — | — | — | — | — | — |

● full · ◐ partial/limited · — none. Exact defaults are editable per organisation (production).

### 9.3 Production auth (Category C)
- Staff: invited accounts (e-mail or phone OTP), optional 4–6 digit **PIN switch on shared tablets** (KDS, host stand) scoped to a device that a manager registered.
- Customers: e-mail magic link or phone OTP; marketing consent recorded separately with timestamp and source.
- Actor is always derived server-side from the session (fixes D6).

---

## 10. QR architecture and security

| Requirement | Design |
|---|---|
| Identify restaurant + table, nothing else | QR encodes `https://{brand-domain}/q/{opaqueToken}`. Token = 128-bit random id mapped server-side to `(locationId, tableId)`. No table number, no guest data, no session ids in the URL |
| Stop remote abuse (ordering from home) | Token gives a **table context** only. Ordering requires an **open table session** (opened by the host/waiter or by the first QR order which then needs staff acceptance). Optional: short code printed on the table tent, rotated daily |
| Rotate / revoke | Tokens are rows; reprinting a tent revokes the old token |
| No guest data exposure | The status page shows only this device's orders (device-scoped order token returned at submission). Other guests at other tables see nothing |
| Rate limiting | Per token and IP; max open unaccepted orders per table session |
| Multiple areas / locations | Token row carries location and area; menus resolve per location |
| Hotel room QR (future) | Same mechanism with `(propertyId, roomId)`; ordering to a room additionally requires stay verification (last name + booking code, as designed in `HOSPITALITY_OS_DATA_ARCHITECTURE.md`) |
| Demo | `/q/{session}/{tableToken}` with tokens from the seed (e.g. `t7-k3f9`). Printed cards point to the stable `riseup-group.com/go/r-a` once the main-site redirect is extended (**requires approval**: it changes the marketing site config) |

---

## 11. Hotel OS integration strategy

Independent products, one explicit contract.

| Integration | Direction | Contract | Demo |
|---|---|---|---|
| Room-service ordering | Hotel guest → Restaurant | `RoomServiceOrder { propertyId, roomId, stayRef, guestDisplayName, items[], deliverTo }`; restaurant validates via `HotelBridge.verifyStay(roomId, stayRef)` | Category B in phase R9 (optional): hotel guest site "Dining" tab dispatches into the restaurant session; KDS shows "Room 204" |
| Charge to room | Restaurant → Hotel | `FolioPosting { stayRef, orderId, amount, tax, items }`, idempotent by `orderId` | Shown as "Posted to room bill (simulated)" |
| Shared guest identity | Both | Organization-level `Person` with linked hotel guest and restaurant customer profiles; consent per purpose | Not in demo |
| Shared loyalty | Both | One ledger per organization; earning rules per vertical | Not in demo (each vertical has its own programme in the demo) |
| Staff & training | Both | Shared workforce module; positions differ per vertical | Shared code, separate data |
| Analytics | Both | Group roll-up for owners of a hotel + restaurant | Not in demo |

Rule: neither vertical reads the other's tables directly; all calls go through the bridge interface, so a restaurant without a hotel never sees hotel concepts.

---

## 12. Testing architecture
| Layer | Tool | Scope |
|---|---|---|
| Domain | `node --test` (existing runner, no new dependency) | State machines, routing, idempotent stock, recipe costing, margins, loyalty, permissions, analytics consistency |
| Sync | Existing approach + new route tests | Append/poll/reset/epoch on the restaurant route |
| UI smoke | Playwright (pre-installed in this environment; **not** added to `package.json` without approval) or a manual checklist | Scenarios A–F end to end, phone + laptop contexts |
| Performance | Scripted replay benchmark | `< 40 ms` replay, Lighthouse mobile ≥ 85 on customer pages |

## 13. Main technical risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Kernel extraction breaks the hotel demo | Medium | Extract behind the 9 tests + manual presenter run; extraction is the first, isolated phase |
| Replay too slow with realistic history | Medium | Aggregated history + memoised seed (§5.3); benchmark gate |
| Polling feels laggy on KDS | Low–medium | 1.2 s is acceptable for a demo; optimistic local apply already exists |
| Netlify Blobs untested in production | Medium | Test the existing hotel deployment first; the restaurant route uses the same store |
| Venue Wi-Fi absent | Medium | Local mode (same laptop) + phone hotspot |
| Scope creep (POS, payments, delivery) | High | Category C items are explicitly out of the demo; integration panel shows "Not connected" |
| Photo quality / licensing | Medium | Licensed stock (Unsplash) now; pilot uses the client's photos |
| Fiscal/legal over-claiming | Medium | No receipt, payment or fiscal wording in the UI; legal review before pilot |
