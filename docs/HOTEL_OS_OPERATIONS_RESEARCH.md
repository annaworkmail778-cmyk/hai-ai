# Hotel OS: Hotel Operations Research

Status: 2026-11-28.

**Method**

- Industry practice for independent hotels, described from professional knowledge of front-office, housekeeping and revenue workflows.
- Vendor documentation listed in `HOTEL_OS_INTEGRATION_MATRIX.md`.

**Labels**

- **[F]** Verified fact from a cited official source.
- **[P]** Common industry practice. Widely documented, but not verified for a specific Armenian hotel.
- **[A]** Assumption to validate in customer discovery.

## 1. Roles and their daily loop

| Role | Main daily loop | Pain without a system | Hotel OS answer |
|---|---|---|---|
| General manager | Morning numbers, issues, staff, reviews | Information scattered across messengers, the PMS, extranets **[P]** | Overview "attention" strip, AI daily summary, analytics |
| Front-office manager | Arrivals/departures, room readiness, VIPs, complaints, shift handover | Unknown room status; handover on paper **[P]** | Room grid, readiness, handover notes, inbox |
| Receptionist | Check-in/out, payments, phone and messages, requests | Juggling WhatsApp, Instagram and the extranet on one phone **[P]** | Unified inbox + AI drafts, folio, QR requests |
| Reservations manager | Inquiries, modifications, groups, OTA reconciliation | Double bookings; manual copying from extranets **[P]** | Inquiry workflow, channel adapter, conflict queue |
| Revenue manager | Rates, restrictions, pickup, channel mix | Spreadsheets; no channel cost view **[P]** | Channel revenue and commission estimate (rate push: roadmap) |
| Housekeeping manager | Assign rooms, inspect, out-of-order, lost & found | Calls to reception; rooms not released on time **[P]** | Board, auto-tasks, inspection, room-ready notify, L&F |
| Housekeeper | Clean the assigned rooms, report issues | Paper lists | Staff app "Today", one-tap status, issue report |
| Maintenance | Tickets, priorities, out-of-order rooms | Lost verbal requests **[P]** | Tickets, escalation, history |
| Concierge / guest relations | Requests, recommendations, recovery | No history of the guest | CRM profile, inbox, service requests |
| Finance | Folio, payments, deposits, refunds, invoices | Reconciliation by hand | Folio (manual recording); PSP and invoices: roadmap |
| Marketing / sales | Direct bookings, campaigns, reviews, groups | No guest segments; reviews unanswered | Loyalty campaigns, consent, Reviews Center |
| Restaurant coordination | Room charges, room service | Charges posted late or lost **[P]** | Restaurant OS contract, folio posting |

## 2. Differences by property type

- **Boutique, ≤40 rooms:** one person covers several roles **[P]**. The highest value is the inbox and automations. A full PMS replacement may be unnecessary if one already exists **[A]**.
- **Independent 3–5★:** departments and shifts matter. The staff app and housekeeping board deliver daily value **[P]**.
- **Large, 100–200+ rooms:** they usually run an established PMS and channel manager **[P]**. Hotel OS should integrate with these (inbox, reviews, staff app, analytics) rather than replace the core PMS at first **[A]**.
- **Resort / spa:** packages, activities and long stays **[P]**. Extras and service requests matter most.
- **Multi-property groups:** shared guest profiles and loyalty, consolidated reporting and per-property isolation **[P]**.

## 3. Guest lifecycle

1. **Discovery:** website, OTA, Instagram.
2. **Inquiry:** chat, WhatsApp, e-mail.
3. **Booking:** direct or OTA.
4. **Pre-arrival:** confirmation, pre-arrival message, preparation task.
5. **Arrival:** check-in, room ready.
6. **In-stay:** QR requests, room service, issues, messages.
7. **Departure:** checkout, folio settled, cleaning task, points.
8. **Post-stay:** review request, review reply, loyalty offer.

Each step is mapped to an event in the engine (see `HOTEL_OS_USER_JOURNEYS.md`).

## 4. Process mapping (key processes)

| Process | Initiator → receiver | Owner | Required info | Status transitions | Failure handling | Automate | Human approval |
|---|---|---|---|---|---|---|---|
| Direct booking request | Guest → reception | Front office | Dates, room type, guests, contact | inquiry → confirmed / declined | No room → decline with reason; never shown as confirmed | Alert, prep task, confirmation draft | Approve / decline |
| OTA booking | Channel → Hotel OS | Reservations | External ID, version, room/rate mapping | new → synced; conflict; cancelled | Duplicate ignored; conflict queue; failed → retry | Import, room assignment, alert | Conflict resolution |
| Check-in | Guest → reception | Front office | Reservation, room ready, ID | confirmed → checked_in | Room not ready → move or wait | Room status update | Yes (identity) |
| In-stay request (QR) | Guest → department | Dept by type | Verified stay, type, note | new → assigned → in_progress → done | Overdue → escalation | Routing, priority | — |
| Complaint via message | Guest → reception | Front office / GM | Thread, stay | new → open → resolved | Escalate to GM | Priority, routing | Reply content |
| Maintenance issue | Staff/guest → technician | Maintenance | Room, priority, out-of-order flag | open → in_progress → resolved | Urgent → GM task | Escalation | — |
| Checkout | Reception | Front office | Folio balance | checked_in → checked_out | Unpaid balance → finance | Cleaning task, points, review request | Payment recording |
| Review reply | Platform → GM | GM / guest relations | Review, context | new → draft → approved → published / manual | Policy rejection → edit | Draft, task for ≤3★ | Always |
| Refund | Guest → finance | Finance / GM | Booking, policy, payment | requested → approved → refunded | — | Never automated | Always |

## 5. What was *not* verified

- Local Armenian legal requirements: guest registration, fiscal receipts, tourist tax. These are marked **[A]** and must be checked with a local accountant or lawyer before the pilot.
