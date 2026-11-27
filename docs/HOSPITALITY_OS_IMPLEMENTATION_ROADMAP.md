# RISEUP Hospitality OS: Implementation Roadmap

Status: 2026-11-27. Companion to `HOSPITALITY_OS_PRODUCT_VISION.md`, `HOSPITALITY_OS_FEATURE_MAP.md` and `HOSPITALITY_OS_DATA_ARCHITECTURE.md`.

## Done in this cycle (demo, `business-os/`)

| Phase | Delivered | Verification |
|---|---|---|
| 1. Foundation | Domain model (accounts, loyalty, menu, orders, service requests, staff RBAC, training, SOPs, channels, property). Rules module. Event engine extensions with validations. Server event allow-list | Unit tests: loyalty, booking breakdown, voucher lifecycle, QR routing, onboarding |
| 2. Guest experience | Booking journey, guest account, loyalty/rewards, premium homepage sections with motion | E2E journeys 1 and 4 |
| 3. Restaurant and QR | Dining ordering, order tracking, QR entry points, stay verification, requests board, restaurant admin, KDS | E2E journeys 2 and 3 |
| 4. Staff workspace | `/staff` (today, messages, learning, team), SOP assistant, `/admin/team` (employees, RBAC matrix, onboarding review, modules) | E2E journeys 5 and 6. SOP assistant test |
| 5. Management intelligence | Analytics tabs (guests, restaurant, staff, loyalty) with formulas. `/admin/loyalty`. Property settings. Payment recording | Metric-consistency test |
| 6. Quality and presenter | Six presenter journeys added (the original three kept). Mobile overflow fix. Lint set up. Production build | `npm test` (11/11), `npm run lint` (0 errors), `npm run build`, Playwright run (13/13 checks) |

## Next: hardening the demo (1–2 weeks)

1. Replace effect-based storage reads with `useSyncExternalStore`, and move the optimistic event buffer out of render. This clears the remaining 43 React Compiler lint warnings.
2. Add table reservations by time slot, and a waiter "serve" view per table.
3. Add a shift rota editor with handover acknowledgement.
4. Make the guest-facing assistant aware of dining, loyalty and in-stay services. Today it covers rooms, prices and handoff.
5. Translate the admin and staff UI (currently Armenian) to ru/en through an i18n catalogue.
6. Commit the E2E suite to the repo and run it in CI.

## Pilot (MVP for one real property, about 6–10 weeks, after approval)

| Step | Work | Integration status today |
|---|---|---|
| 1 | Postgres schema with `property_id` on every table, plus Row Level Security | Designed, not built |
| 2 | Real authentication: guest e-mail magic link / OTP, staff SSO or password + 2FA, server-side RBAC | Not built |
| 3 | Signed, rotating QR stay tokens issued at check-in and revoked at check-out | Designed |
| 4 | Real-time push (WebSocket/SSE) in place of polling. Staff push notifications | Not built |
| 5 | Notification outbox to WhatsApp / Telegram / e-mail through an approved provider, with templates and consent checks | Simulated only |
| 6 | `PaymentProvider` interface (deposit / pre-authorisation, refunds) with a local acquirer, chosen together with the property | Not built, not chosen |
| 7 | PMS / channel-manager sync, or use of Hospitality OS as the PMS, depending on the property | Not built |
| 8 | POS / fiscal receipts for the restaurant | Not built |
| 9 | LLM-backed assistants limited to approved content, with citations, evaluation sets and human handoff | Not built (the demo uses deterministic retrieval) |
| 10 | Privacy: data-retention policy, export/delete requests, consent logs, audit trail | Partially modelled (consent flags) |

## Risks and decisions for the owner

- **Payment provider and PMS choice** decide most of the pilot timeline. No integration should be promised before a provider has been selected and tested.
- **Data migration:** existing guest lists need consent review before any import.
- **Staff adoption:** the mobile workspace should start with one department (housekeeping), then extend.
- **Metrics:** demo figures are generated. Pilot KPIs (response time, direct-booking share, repeat rate) need a baseline measured before go-live.
