# RISEUP Restaurant OS: Implementation Roadmap

Estimates are engineering hours for one senior full-stack developer with AI assistance, ranges not commitments. Nothing below is approved until the owner approves it.

## 0. Where we are

| Phase | State |
|---|---|
| R0 shared kernel with Hotel OS | Done, Hotel OS regression clean |
| Core demo R1–R6 (QR, takeaway, KDS, food cost, owner overview, savings calculator) | Done |
| Deep refinement (this phase): waiter app, KDS v2, host & reservations, guest booking & chat, unified inbox, reviews, CRM & loyalty, AI assistant, automations registry, team, stocktake, PO approvals, presenter scenarios W/M/O, docs | Done in the demo branch; not deployed |

## 1. Next: Demo hardening (8–14 h)

* Split-by-items UI on the bill (domain already supports groups).
* Recipe version table and UI.
* Remaining staff screens fully translated to ru/en (admin is Armenian-first by approval).
* Accessibility pass (focus order in sheets, screen-reader labels on SVG floor plans).
* Visual polish of dark staff theme beyond navigation.

## 2. Pilot readiness (120–170 h)

| Work | Hours |
|---|---|
| Authentication (owner/manager accounts + device PINs), server-side permission check on every event | 20–30 |
| PostgreSQL event store + projections, tenant isolation (RLS), snapshots | 30–40 |
| Real-time push (SSE/WebSocket) replacing polling | 8–12 |
| Onboarding: menu import (CSV/Excel), tables, staff, recipes wizard | 20–28 |
| Exports: daily sales, stock, waste to CSV/Excel for accounting | 6–10 |
| Monitoring, backups, error reporting, rate limiting | 10–14 |
| Security review + fixes | 12–18 |
| Pilot support tooling (impersonation with audit, data reset per tenant) | 8–12 |
| Contingency | 6–8 |

## 3. Integrations (each gated by partner access; R items)

| Integration | Precondition | Hours once access exists |
|---|---|---|
| Card terminal via bank / POS SDK | Acquirer or POS vendor SDK + test terminal | 20–40 |
| WhatsApp Business Platform | Meta business verification, number, templates | 16–24 |
| Instagram + Messenger | App Review approval | 16–24 |
| Email inbox | Mailbox + OAuth or IMAP | 8–12 |
| Google Business Profile reviews (read + reply) | Verified location + API access approval | 12–18 |
| SMS reminders | Local gateway contract | 4–8 |
| Kitchen printer fallback | Printer model chosen | 10–16 |
| Online prepayment / deposits | Bank vPOS / Idram / Telcell merchant contract | 20–30 |
| POS side-by-side sync (iiko/Syrve, r_keeper, Poster) | Vendor API access | 30–60 each |
| Fiscal (e-HDM) | Certified path, legal confirmation | not estimated |
| TheFork / OpenTable | Partnership | 20–40 each |

## 4. LLM layer (24–36 h, after key & dependency approval)

Claude adapter with read-only tools, answer validation, fallbacks to the deterministic engine, evaluation set in 3 languages (see AI_ARCHITECTURE §4).

## 5. Hotel OS bridge (30–45 h, after approval)

Room service ordering from the hotel guest page, charge-to-room with folio posting, shared guest profile with consent, restaurant bookings for hotel guests (contract in TECHNICAL_ARCHITECTURE, Revision 2 "Hotel OS bridge").

## 6. Later

Staff scheduling and time clock; loyalty redemption and consented campaigns; delivery (own couriers); multi-location reporting; native wrappers for push notifications; prep forecasting from bookings.

## 7. Sequencing recommendation

1. Demo hardening → show to 2–3 restaurants.
2. Pilot readiness for **one** restaurant with side-by-side POS (no payment or fiscal integration; cash/POS recorded).
3. First integration chosen by pilot evidence (usually WhatsApp + card terminal).
4. LLM layer once real questions from the pilot are collected.
