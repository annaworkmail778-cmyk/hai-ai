# RISEUP Hospitality OS: Data Architecture

## 1. Demo architecture (implemented)
- **Event sourcing.** `state = replay(seed(baseDate), orderedEvents)` in `business-os/src/lib/engine.ts`.
  - Every user action is a typed event (`DemoEvent` in `types.ts`).
  - Automations, loyalty earning and routing run inside the reducer, so they are deterministic on every device.
- **Seed.** `seed.ts` generates about 6 months of hotel history, guests, accounts, restaurant orders, staff, training and messages. All of it is fictional.
- **Transport.** `POST/GET /api/session/{code}`.

  | Where | Storage |
  |---|---|
  | Netlify | Netlify Blobs, one blob per event |
  | `next start` | Memory |
  | Offline | localStorage + BroadcastChannel (local mode) |

- **Device identity (demo).** Which guest account or employee "is signed in" is stored per device in localStorage. **This is not authentication** (category B).

## 2. Domain model
| Domain | Entities | Key states / rules |
|---|---|---|
| Property (tenant) | `Property { id, type: hotel \| restaurant \| hotel_restaurant, brand, modules[], currency, timezone }` | All entities carry `tenantId` in production |
| Reservations | `Reservation { roomTypeId, roomId?, checkIn, checkOut, adults, children, rooms(qty), extras[], voucherId?, discount, total, status, payment }` | `inquiry → confirmed → checked_in → checked_out`, or `declined` / `cancelled` / `no_show`. Payment: `unpaid → paid` (staff-recorded, no card charge) |
| Guests & accounts | `Guest` (CRM), `Account { guestId, email, consent{marketing, analytics}, favourites[] }` | An account is linked to one guest profile |
| Loyalty | `LoyaltyConfig { tiers[], earnPer1000, eligible[] }`, `LedgerEntry { guestId, points, reason, ref }`, `Reward`, `Voucher { status: active → reserved → used \| released }`, `Campaign` | Points are earned only on `checked_out` stays and `completed` orders. A voucher is reserved at submission, used on approval or acceptance, and released on decline or cancel |
| Restaurant | `MenuCategory`, `MenuItem { price, allergens[], options[], available }`, `Table`, `Order { type: room_service \| dine_in \| takeaway, target, items[], status }` | `submitted → accepted → preparing → ready → (out_for_delivery) → completed`, or `rejected` / `cancelled` |
| Guest services | `ServiceRequest { roomId \| point, type, department, priority, status, assigneeId, notes }` | `new → assigned → in_progress → done`, or `cancelled` |
| Operations | `HkTask`, `MaintRequest`, `StaffTask` | As before; managers can reassign |
| Staff | `Employee { department, position, supervisorId, active, permissions }`, `Position → Permission[]` | Role-based navigation in `/staff` |
| Training | `TrainingModule { positions[], steps: lesson \| checklist \| quiz }`, `Enrollment { employeeId, progress, status: in_progress → submitted → approved }` | Supervisor approval completes onboarding |
| Knowledge | `Sop { department, title, body, tags }` | Employee assistant answers only from SOPs |
| Communication | `Channel { kind: direct \| department \| notice \| task }`, `Message { channelId, authorId, text, urgent, ref? }` | Read state is per device (demo) |

## 3. Production architecture (planned, category C)
- **Database.** PostgreSQL (e.g. Supabase, EU region).
  - Every table has `tenant_id`, with **Row Level Security** on every table.
  - A Data Access Layer checks the session, membership and permission before any query.
- **Auth.**
  - Guests: e-mail magic link or phone OTP. A booking-code login allows access to a single reservation.
  - Staff: invited accounts with SSO-ready identity.
  - RBAC: `owner, general_manager, reception_manager, receptionist, housekeeping_manager, housekeeper, restaurant_manager, waiter, chef, technician, spa_therapist`.
- **QR security.** A room QR identifies the *room*, never the guest.
  - Verification: last name + reservation code, or a one-time PIN shown on the TV / key-card sleeve.
  - That creates a stay-scoped session token that expires at check-out.
  - The demo implements the last-name step against fictional data.
- **Realtime.** DB change streams (Supabase Realtime or similar) replace polling.
- **Payments.** `PaymentProvider` interface (`createIntent`, `capture`, `refund`, webhook).
  - Local acquiring in Armenia must be verified with the provider. Stripe/PayPal aren't offered to Armenian merchants per earlier research; re-verify.
  - Until then, staff record payments manually (bank transfer or desk).
- **Notifications.** An outbox table, then n8n workers, then providers (WhatsApp Business Platform templates, Telegram Bot API, e-mail). Only after verified setup.
- **Channel manager.** Interface reserved for iCal/OTA connectors. No connection exists.
- **Privacy.**
  - Collect the minimum data.
  - Store consent records (marketing, analytics).
  - Retention policy per tenant, export/delete on request, audit log of staff access to guest records.
  - Armenian personal-data law, plus GDPR for EU guests.
- **Files.** Object storage with per-tenant prefixes and signed URLs.
