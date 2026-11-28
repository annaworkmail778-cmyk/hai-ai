# Hotel OS: User Journeys (as implemented in the demo)

Each journey lists the screens and the engine events involved. All of them can be run in presenter mode (`/present`).

| # | Journey | Screens | Events (engine) | Automations / guardrails |
|---|---|---|---|---|
| 1 | Guest books directly | `/hotel/{lang}/booking` → `/admin/reservations` → `/hotel/{lang}/account` | `account.register`, `booking.create`, `reservation.approve` | Inquiry alert, prep task, confirmation draft; never "confirmed" before approval |
| 2 | OTA reservation arrives | `/admin/channels` → reservation drawer | `ota.import` (duplicate / modify), `ota.cancel`, `ota.resolve` | Idempotent import; conflict, never a double booking; `ota_booking_alert` once per external ID |
| 3 | Reception checks the guest in | Reservation drawer (folio, move) | `reservation.checkin`, `folio.add`, `reservation.move` | Move only to free rooms; old room gets a cleaning task |
| 4 | Guest writes on WhatsApp / Instagram (simulated) | `/admin/inbox` | `inbox.inbound` | Language / intent detection; high risk → `inbox_escalation` |
| 5 | AI drafts, employee approves | `/admin/inbox` | `inbox.reply` (ai = true) | Draft only from `kb`; payment / refund / cancel / medical / legal / availability never auto-sent |
| 6 | Room QR request → housekeeping | `/q/room/{n}` → `/hotel/{lang}/stay` → `/staff` | `service.create`, `service.assign`, `service.status` | Stay verification before any guest data |
| 7 | Housekeeping completes | `/staff` | `hk.status` / `service.status` | `room_ready_notify` → reception |
| 8 | Guest review → manager reply | `/admin/reviews` | `review.add`, `review.draft`, `review.approve` | ≤3★ → GM task; manager-only approval; publish only where an API exists |
| 9 | Checkout → housekeeping | Overview / drawer | `reservation.checkout` | Cleaning task, loyalty points, review request (simulated) |
| 10 | AI daily summary | `/admin/copilot` | none (read-only); `staffTask.create` after approval | Traceable figures; permission check |
| 11 | Restaurant order → KDS | `/hotel/{lang}/dining` → `/kds` | `order.create`, `order.status` | Valid transitions only |
| 12 | New employee onboarding | `/admin/team` → `/staff/learn` | `employee.create`, `training.*` | `onboarding_start`; quiz ≥ 70% |
| 13 | Internal communication | `/staff/messages` | `msg.send`, `channel.open` | Urgent and handover flags |

## Failure paths covered

- A duplicate OTA delivery is ignored.
- An OTA modification with no free room goes to the conflict queue.
- A cancellation for an in-house guest is flagged as a conflict.
- A wrong last name at the QR stay check is rejected.
- An approval attempt by a non-manager is ignored.
- A no-show before the arrival date is ignored.
- A room move into an occupied room is ignored.
- An unsupported AI question is refused.
- A housekeeper asking for financial data is refused.
