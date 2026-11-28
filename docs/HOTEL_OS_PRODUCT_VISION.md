# RISEUP Hotel OS: Product Vision

Status: 2026-11-28. Code: `business-os/`.

The demo uses one fictional hotel, Pine Ridge Hotel & Spa (Tsaghkadzor), with generated data. Companion documents: `HOTEL_OS_FEATURE_MAP.md` (status of every feature) and `HOTEL_OS_INTEGRATION_MATRIX.md` (what can really be connected).

## 1. What Hotel OS is

Hotel OS is one connected operating system for an independent hotel or a small hotel group. It covers:

- **Guests:** direct bookings, the guest account, in-stay services and loyalty.
- **Front office:** reservations, the room grid, folio, check-in/out, room moves and no-shows.
- **Communications:** one inbox for every guest channel, plus reviews and reputation.
- **Operations:** housekeeping, maintenance, guest requests and staff tasks.
- **Distribution:** OTA reservations through a channel-manager adapter.
- **Team:** a mobile staff app, roles, onboarding and SOPs.
- **Management:** analytics, automations and an AI business assistant that only uses traceable data.

It is **not** a landing page, a chatbot or a CRM bolted onto a spreadsheet. Its value comes from the connections between modules:

- A WhatsApp complaint about the air conditioning becomes a maintenance ticket.
- A checkout creates a cleaning task, and a cleaned room notifies reception.
- A negative review creates a manager task.
- An OTA booking lands in the same calendar and blocks the room.

## 2. Product independence

- **Hotel OS stands alone.** A hotel does not need Restaurant OS. Choosing "Hotel only" in `/admin/settings` hides the restaurant modules.
- **Restaurant OS stays separate.** An optional, typed integration contract (`business-os/src/lib/integrations/restaurant-contract.ts`) lets a room-QR food order be created in Restaurant OS. Hotel OS then keeps only the stay/room reference, the status and the folio posting.
- **Packaging:** a RISEUP customer can buy Hotel OS, Restaurant OS, or both linked as one hospitality ecosystem.
- **Repository note:** today the restaurant module of the demo lives in the same Next.js app (`/admin/restaurant`, `/kds`, `/hotel/{lang}/dining`). It is gated by the property configuration, so it is not a dependency.

## 3. Target customers

| Segment | What differs | What Hotel OS emphasises |
|---|---|---|
| Boutique / 10–40 rooms | One person does reception, reservations and messaging | Unified inbox, AI drafts, automations, simple calendar |
| Independent 3–5★, 40–120 rooms | Departments, shifts, OTA mix of 40–70% | Housekeeping board, staff app, channel manager, reviews |
| Large 100–200+ rooms | Revenue management, groups, many shifts | Room moves, group bookings, folio, workload analytics; PMS integration rather than replacement may be required |
| Hotel + restaurant/bar | F&B revenue, room charges | Restaurant OS link, folio posting |
| Resort / spa | Packages, activities, long stays | Extras and packages, spa requests, loyalty |
| Multi-property group | Shared guests and loyalty, per-property data | Tenant model with `property_id`, group reporting (roadmap) |

## 4. Principles

1. **Honest states.** Inquiry ≠ confirmed ≠ paid. OTA sync state is kept separate from the reservation state. A channel is never shown as "connected" unless it is authenticated and tested.
2. **Approved information only.** Both AI assistants answer from configured data. Risky topics always go to a person.
3. **Human approval for anything outward-facing or financial:** replies, review publishing, refunds and task creation suggested by AI.
4. **Idempotent automation.** A re-delivered event never produces a second notification, task or reservation.
5. **Premium for guests, fast for staff.** Operations screens prioritise clarity over decoration.
6. **Mobile first** for guests and staff.

## 5. What the demo proves today, and what it does not

- **Proves:** the end-to-end workflows and the data model, the AI guardrails and the UX. It runs live across a phone and a laptop.
- **Does not prove:** live channel integrations, real authentication, payments, or production security. These are designed, not built. See `HOTEL_OS_SECURITY_REQUIREMENTS.md` and `HOTEL_OS_IMPLEMENTATION_ROADMAP.md`.
