# RISEUP Hospitality OS: Feature Map

Status: 2026-11-27. Scope: the demo in `business-os/`, with Pine Ridge Hotel & Spa as a fictional tenant. All guests, staff, orders and figures are generated demo data.

Every feature carries one of three labels:

- **A — Working demo.** Fully implemented on the demo state. It syncs between devices and is covered by the event engine.
- **B — Simulated.** The UI and state flow are real, but the outside effect is not: nothing is sent, charged or authenticated.
- **C — Production integration required.** Planned, with a design. Not connected to any external system.

No external integration exists in this demo. PMS, POS, payment providers, channel managers, WhatsApp/Telegram/e-mail delivery, SSO and LLM providers are **not connected**.

## A. Guest experience

| Feature | Status | Where | Notes |
|---|---|---|---|
| Premium website in hy/ru/en | A | `/hotel/{lang}` | Hero parallax, scroll reveals, image clip reveals and 3D tilt cards, with no animation library. Respects `prefers-reduced-motion`. Includes spa, dining, membership tiers and an FAQ accordion |
| Room pages and gallery | A | `/hotel/{lang}/rooms/*` | Existing feature, preserved |
| Booking journey | A | `/hotel/{lang}/booking` | Five-step journey covering all ten required stages: dates & guests → room with live availability and multi-room quantity → extras + voucher → guest details / sign-in → review with price breakdown and cancellation policy → submit |
| Price breakdown and discounts | A | `lib/rules.ts` (`bookingCalc`) | Covers nights × rooms, extras, member tier %, the best stay campaign and the voucher. Discounts are capped at 50% of the room total. Tested |
| Booking states | A | engine | States: inquiry ("pending") → confirmed → checked-in / checked-out, plus declined / cancelled. Payment is tracked separately as `unpaid` or `paid` |
| Online payment | C | — | Not implemented. Staff record a payment manually (cash / card terminal / bank transfer); this is B. No card is charged |
| Legacy `/book` URL | A | `/hotel/{lang}/book` | Redirects to `/booking` and keeps the query string |
| Guest account | B (auth) / A (features) | `/hotel/{lang}/account` | Sign-in is labelled "Demo sign-in: no real authentication" and works by e-mail or with demo members. The account features are working: overview, stays (with guest cancellation), orders and requests, rewards, ledger, profile, and privacy/consent |
| Loyalty tiers, points, rewards, vouchers | A | `lib/rules.ts`, engine | Points are earned only on checkout of a member stay and on completed member orders. Voucher lifecycle: active → reserved → used, or released when a booking/order is declined or cancelled. Tested |
| Personal offers (campaigns) | A | account overview, `/admin/loyalty` | Tier-targeted. Applied automatically at the best rate, and each use is counted |
| Restaurant ordering | A | `/hotel/{lang}/dining` | Menu with photos, allergens, modifiers and availability. Order types: room service (requires a verified stay), dine-in (table) and takeaway (pickup time). Member campaign and voucher apply |
| Order tracking | A | `/hotel/{lang}/order/{id}` | Statuses: submitted / accepted / preparing / ready / out_for_delivery (room service only) / completed, or rejected / cancelled with a reason |
| Room bill settlement | B | — | The UI says room-service orders go on the room bill. There is no PMS posting |
| QR entry points | A | `/q/room/{n}`, `/q/table/{T}`, `/q/point/{spa\|lobby\|pool}` | Picks the language from the browser, then redirects |
| Room QR privacy | A (demo) / C (prod) | `/hotel/{lang}/stay` | The QR holds only the room number. The guest must verify the stay with the reservation's last name before any guest data appears. A demo hint button is labelled as such. Production uses a signed, rotating stay token (see the data-architecture doc) |
| Guest service requests | A | stay page → `/admin/requests` → `/staff` | Twelve request types are routed by department with a priority. The guest sees live status |
| Guest assistant (hy/ru/en) | A (scripted) | site widget | Existing scripted assistant, preserved. It answers from configured hotel data and hands over to staff. It is not an LLM |

## B. Operations

| Feature | Status | Where |
|---|---|---|
| Reservations, calendar, rooms, housekeeping, maintenance, guests CRM | A | `/admin/*` (existing, preserved) |
| Reservation drawer: extras, discounts, group bookings, payment state, manual payment recording | A (record) / C (gateway) | `/admin/reservations` |
| Guest requests board: assign / reassign, start, done, cancel, history, average completion time, printable QR codes | A | `/admin/requests` |
| Restaurant: orders board with valid transitions only, menu management (price edit, availability toggle, new dish), tables with live occupancy, sales with formulas | A | `/admin/restaurant` |
| Table reservations by time slot | C (next phase) | Occupancy currently comes from active orders. This is stated in the UI |
| Kitchen Display System: full-screen, touch, timers vs. prep time, late highlighting, notes, modifiers, allergens, reject with reason | A | `/kds` |
| POS / fiscal receipt | C | — |

## C. Staff workspace (mobile-first)

| Feature | Status | Where |
|---|---|---|
| Employee sign-in | B | `/staff`: pick an employee, labelled as demo |
| RBAC by position: 11 positions, 8 departments, permissions matrix | A (UI-enforced) / C (server-enforced) | `PERMISSIONS` in `lib/hospitality-data.ts`, `/admin/team` |
| "Today" view: my housekeeping tasks, service requests, maintenance, staff tasks, restaurant orders, arrivals/departures. Overdue and urgent first. Take / start / done | A | `/staff` |
| Handover notes, visible to the next shift | A | department channel → "Today" |
| Internal messaging: direct, department, notices (managers only), task threads opened from a request, urgent flag, unread counts | A (read markers per device) | `/staff/messages` |
| Onboarding path per role: welcome → lessons → checklists → quiz (≥70%) → submit → supervisor review → approved, or changes requested | A | `/staff/learn`, `/staff/team`, `/admin/team` |
| Managers create training modules, auto-assigned by department | A | `/admin/team` → Modules |
| Add employee: auto-enrolment, direct chat with the supervisor, welcome message | A | `/admin/team` |
| SOP library: 10 approved SOPs with search | A | `/staff/learn` |
| Employee assistant that answers only from SOPs, cites its source, and sends the question to the supervisor when nothing is found | A (keyword retrieval) / C (LLM) | `lib/sop-assistant.ts`. Tested |
| Push notifications to staff phones | C | — |
| Shift scheduling (rota editing) | C (next phase) | Shift times are shown per employee |

## D. Management intelligence

| Feature | Status | Where |
|---|---|---|
| Rooms and revenue KPIs: occupancy, ADR, RevPAR, sources, OTA commission | A | `/admin/analytics` (existing) |
| Guests: satisfaction, returning %, no-show %, member share, extras revenue | A | `/admin/analytics` → Guests |
| Restaurant: revenue, average check, prep time, loss rate, revenue by order type | A | `/admin/analytics` → Restaurant, `/admin/restaurant` |
| Staff: request response and completion time, overdue tasks, onboarding progress | A | `/admin/analytics` → Staff |
| Loyalty: members, tiers, outstanding points and liability, repeat rate for members vs. non-members, vouchers, campaigns, rules | A | `/admin/loyalty` |
| Formulas shown next to each metric, with a "demo data" label | A | All analytics pages |
| Consistency tests: tiers sum to members, outstanding = issued − redeemed, order types sum to revenue, average check × orders = revenue | A | `tests/engine.test.ts` |

## Platform

| Feature | Status |
|---|---|
| Property configuration: hotel only / restaurant only / hotel + restaurant. The admin navigation and guest site adapt | A (demo) |
| Multi-tenant data model (`property_id` + RLS) | C (designed in the data-architecture doc) |
| Real-time sync between devices: polling plus a local BroadcastChannel mode | A |
| Presenter mode: the 3 original scenarios plus 6 new journeys | A |
| Reset | A |
