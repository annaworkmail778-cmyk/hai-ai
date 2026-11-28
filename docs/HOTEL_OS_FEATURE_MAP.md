# RISEUP Hotel OS: Feature Map and Audit

Status: 2026-11-28. Every row was verified in code and, where marked, by automated tests (`npm test`, 17 unit tests) and browser E2E runs (30 checks across two scripts).

**Status legend**

| Code | Meaning |
|---|---|
| **A** | Implemented and verified in the demo |
| **B** | Partially implemented or simulated |
| **C** | Missing / to be developed |
| **R** | Requires an external integration or approval |

**Priority legend**

| Code | Meaning |
|---|---|
| P1 | Next pilot |
| P2 | Within 3 months |
| P3 | Later |

## Guest website and booking engine

| Feature | St. | Current implementation | Limitations | Improvement | Business value | Pri. | Dependencies / risks |
|---|---|---|---|---|---|---|---|
| Multilingual website (hy/ru/en) | A | `/hotel/{lang}`: rooms, offers, spa, dining, membership, FAQ, location; motion respects reduced-motion | Content is hard-coded for one fictional hotel | CMS-editable content per tenant | Direct bookings | P1 | Tenant content model |
| Booking journey | A | Dates → room (live availability, multi-room) → extras → voucher → details → review with breakdown, VAT line and policy | No deposit / online payment | Payment step (deposit/pre-auth) | Conversion without OTA commission | P1 | PSP choice (R) |
| Confirmation workflow | A | Request → staff approval → confirmed; guest sees status in account | — | Optional instant-confirm rules per rate | Avoid false confirmations | P2 | — |
| Taxes and fees | B | VAT-included line from `TAXES` config (demo assumption 20%) | No tourist tax or per-person fees | Configurable tax engine | Legal transparency | P2 | Local tax rules (verify) |
| Conversion analytics | B | Inquiry → booking conversion in analytics | No web funnel tracking | Privacy-safe funnel events | Marketing ROI | P3 | Consent |

## PMS and front desk

| Feature | St. | Current implementation | Limitations | Improvement | Value | Pri. | Dependencies / risks |
|---|---|---|---|---|---|---|---|
| Calendar, room grid, room status | A | `/admin/calendar`, `/admin/rooms`; double booking blocked | — | Drag-to-move on the grid | Fewer errors | P2 | — |
| Check-in / check-out | A | Drawer actions. Checkout → dirty room + cleaning task + loyalty points | No ID scan / registration card | Digital registration card | Speed, compliance | P2 | Local registration law (verify) |
| Room move | A | `reservation.move` validates availability; the old room gets a cleaning task. Tested | — | Move reasons analytics | Service recovery | — | — |
| No-show | A | Only on/after the arrival date; frees the room. Tested | No no-show fee posting | Policy-based fee to folio | Revenue protection | P2 | Payments (R) |
| Folio | A/B | Charges, deposits, payments, refunds, completed room-service orders, balance. Tested. Payments are recorded manually | No real money movement; no invoices | Invoices / fiscal documents | Finance control | P1 | PSP + fiscal (R) |
| Group bookings | B | Multi-room booking with a `groupId` | No group master folio | Group master + rooming list | Groups / MICE | P3 | — |
| Early check-in / late checkout | B | Late checkout is an extra | No rule engine | Paid early check-in rules | Upsell | P3 | — |
| Guest profiles, preferences, history | A | CRM, tags, preferences, stays, loyalty | No merge / dedupe UI | Duplicate-profile merge | Data quality | P2 | — |

## Housekeeping and maintenance

| Feature | St. | Notes |
|---|---|---|
| Cleaning board, statuses (clean / dirty / cleaning / inspected / out-of-order via maintenance) | A | `/admin/housekeeping`, staff app |
| Auto-tasks: checkout, arrival prep, room-ready notification | A | Idempotent automations |
| Maintenance tickets, priority, assignment, escalation | A | Urgent → general-manager task (automation) |
| Lost & found | A | `/admin/housekeeping`: record → stored / returned / disposed |
| Completion evidence (photo) | C | P2. Needs file storage |

## Guest services and CRM / loyalty

| Feature | St. | Notes |
|---|---|---|
| Room / table / point QR, verified stay, 12 request types routed by department, live status | A (demo) / R (prod token) | The demo verifies by last name. Production needs a signed, rotating stay token |
| Digital service catalogue and guide | B | Services grid + FAQ. A full digital hotel guide is P2 |
| Guest feedback | B | Post-stay score in the reservation; public reviews in the Reviews Center |
| Loyalty: tiers, points (completed transactions only), rewards, vouchers, campaigns, configurable rules | A | Tested. Point expiration rules: C (P2) |
| Consent (marketing / analytics) | A | Per account. Consent audit log: C |

## Unified communications (one inbox)

| Feature | St. | Notes |
|---|---|---|
| One inbox; channel indicator; statuses new / open / pending / resolved; priority; unread / SLA badge | A | `/admin/inbox` |
| Assignment, department transfer, escalation, internal notes, tags, search / filter, saved replies, audit, first-response time | A | Tested (escalation idempotency) |
| AI language and intent detection, risk gate, draft from approved facts, approve-to-send | A (deterministic) | High-risk topics are never auto-sent. Tested |
| Create task / reservation inquiry from a conversation | A | |
| Real channels (WhatsApp, Instagram, Messenger, email, Booking.com messages) | R | See the integration matrix. In the demo, inbound messages are simulated and outbound replies are stored only |
| Attachments | C | P2. Needs storage + channel support |

## Reviews and reputation

| Feature | St. | Notes |
|---|---|---|
| Unified feed, platform / status filters, rating and sentiment, categories, department mapping, complaint detection, monthly report | A | `/admin/reviews`, demo data |
| AI reply draft in the review's language; guards against compensation promises and personal data; manager-only approval | A | Tested |
| Publishing | R | Google / Booking.com reply via API only with approved access. Tripadvisor is manual. The demo marks replies "published (simulated)" or "manual required" |

## Channel manager / OTA

| Feature | St. | Notes |
|---|---|---|
| Standard adapter contract (`ChannelAdapter`), demo adapter, import / modify / cancel, duplicate detection, conflict detection and manual resolution, failed-sync retry, audit log, room-type mapping view, commission estimate | A (demo) | `/admin/channels`. Tested |
| Real Booking.com / Expedia / Airbnb connection | R | Partner programs / channel manager required |
| ARI push (rates / availability) | C/R | Contract includes `dryRun`; not implemented |

## Staff app, analytics, AI assistant, automations, platform

| Feature | St. | Notes |
|---|---|---|
| Staff app: role home, tasks, handover, messages, urgent, training, SOPs, SOP assistant, manager review | A | `/staff`. UI is Armenian only |
| Staff UI in Russian / English | C | P1 |
| Server-side RBAC | C | Demo RBAC is UI-level only (stated in the UI) |
| Analytics: occupancy, ADR, RevPAR, ALOS, conversion, channel revenue, cancellation, direct share, extras, guests, restaurant, staff, loyalty, reviews | A | Formulas shown; consistency tests |
| AI business assistant: 10 question types, traceable figures, permission check, approval-gated task creation | A (deterministic) | `/admin/copilot`. Tested |
| Automation engine: 13 rules, enable/disable, idempotency keys, execution log | A | Configurable conditions/delays: B (fixed rules). Failure retries: C |
| Property configuration (hotel / restaurant / both) | A | Branding/theme per tenant: C (P2) |
| Presenter mode: 14 scenarios | A | |
