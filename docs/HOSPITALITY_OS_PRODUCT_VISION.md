# RISEUP Hospitality OS: Product Vision

Status: evolving demo. It grows out of `business-os/`, the Hotel OS sales demo. Last update: 2026-11-27.

## 1. Audit of the existing implementation (verified in code before this cycle)
| # | Finding | Detail |
|---|---|---|
| 1 | **Works (demo)** | Event-sourced engine (`replay(seed, events)`), so every device sees the same state. Phone ↔ laptop sync via `/api/session/{a\|b}`: in-memory store tested end to end; Netlify Blobs implemented but not yet exercised on Netlify. Local mode without internet. Reset. Guest site in hy/ru/en. Single-room booking request with rate-table pricing and a double-booking guard. Scripted assistant with handoff. Admin: approve/decline/check-in/check-out/cancel, tape calendar, live room status, guest CRM notes, housekeeping board, maintenance, staff tasks, assistant management with staff replies, editable knowledge base, workflow toggles, hotel analytics (tested formulas), ROI calculator. Presenter mode with 3 scenarios |
| 2 | **Visual / simulated only** | Outbox messages (WhatsApp/Telegram/e-mail never sent), the integrations panel, messenger buttons, the map card, and the "log in as staff" switch (no real auth) |
| 3 | **Partial** | Offers only prefill a note (no price rule). No payment state. One room per booking. No guest cancellation. Staff "roles" are labels without permissions |
| 4 | **Missing for the vision** | Guest accounts, loyalty, restaurant ordering, KDS, QR room services, staff workspace, onboarding/training, SOP library, internal messaging, restaurant/staff/loyalty analytics, property configuration |
| 5 | **Architectural limits** | Single property hard-coded in `hotel-data.ts`. Whole state replayed on each change (fine for a demo, capped at 1,500 events per session). Admin strings are inline Armenian. Polling, not push. No server-side authorization (demo) |
| 6 | **Must not break** | Presenter scenarios 1–3, `/s/{code}/hotel` QR entry, reset, sync and local mode, all `/admin/*` routes, analytics consistency tests |

## 2. Vision
**RISEUP Hospitality OS** is one platform with four connected environments for hotels, resorts, spas and high-end restaurants. It runs in one of three property configurations:

| Configuration | Modules |
|---|---|
| Hotel only | Rooms, reservations, housekeeping, maintenance, guest services, loyalty |
| Restaurant only | Menu, ordering, KDS, tables, loyalty |
| Hotel + restaurant + services | All of the above, connected through shared guest identity, loyalty and analytics |

The four environments:

| Environment | Who | Route (demo) | Promise |
|---|---|---|---|
| **A. Guest experience** | Guests | `/hotel/{lang}`, `/hotel/{lang}/account`, `/hotel/{lang}/dining`, `/q/room/{n}`, `/q/table/{n}` | A beautiful, fast way to book, order, request and be recognised |
| **B. Operations** | Reception, restaurant, housekeeping, maintenance | `/admin/*`, `/kds` | Every request in one place, with status and an owner |
| **C. Staff workspace** | Every employee, mobile-first | `/staff/*` | "What do I do now, how do I do it, who do I tell" |
| **D. Management intelligence** | Owners, general managers | `/admin/analytics`, `/admin/loyalty`, `/admin/team` | One consistent picture of revenue, service and people |

## 3. Principles
1. **Honest states.** "Request ≠ confirmed ≠ paid." An order is not accepted until the kitchen accepts it. Points are earned only on completed eligible transactions.
2. **Three labels for every feature:**
   - **A** Working demo
   - **B** Simulated
   - **C** Production integration required

   See `HOSPITALITY_OS_FEATURE_MAP.md`.
3. **Approved information only.** The guest and staff assistants answer from configured data or hand over to a human.
4. **Tenant isolation by design.** Every entity belongs to a property (`tenantId`). The demo has one fictional tenant, "Pine Ridge Hotel & Spa".
5. **Premium for guests, simple for staff.** The guest site is immersive. Operations are fast, readable and boring in the best sense.
6. **Mobile first** for guests and staff.

## 4. Who benefits and how (no guaranteed results)
| Person | Daily value |
|---|---|
| Guest | Books direct in minutes, orders to the room, requests towels with a QR scan, sees status, earns rewards |
| Employee | Sees only their tasks, gets training and SOPs on the phone, messages the right department |
| Manager | Sees reservations, orders, requests, staff workload and loyalty in one place, with consistent metrics |
| Owner | Visibility into direct bookings, repeat guests and service quality, measured during a pilot |
