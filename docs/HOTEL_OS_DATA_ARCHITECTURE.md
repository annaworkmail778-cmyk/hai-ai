# Hotel OS: Data Architecture

Types are in `business-os/src/lib/types.ts`. Everything below exists in the demo state unless it is marked *(prod)*.

| Domain | Entities | Key rules |
|---|---|---|
| Tenant | `Property { id, type: hotel \| restaurant \| hotel_restaurant, brand, modules[] }` | *(prod)* `property_id` on every row + RLS |
| Inventory | `RoomType`, `Room`, `hk: Record<roomId, clean \| dirty \| cleaning \| inspected>` | Out-of-order comes from open maintenance tickets |
| Reservations | `Reservation { status, source, roomId?, total, extras[], discount, voucherId, payment, folio[], external? }` | Internal `status` (inquiry / confirmed / checked_in / checked_out / declined / cancelled / no_show) is separate from `external.syncState` (synced / pending / failed / conflict) |
| Channel sync | `external { channel, externalId, version, syncState, lastSyncAt, commissionPct }`, `SyncLogEntry` | Idempotent per (channel, externalId); version increments on modification |
| Folio | `FolioLine { kind: charge \| payment \| deposit \| refund, amount, method, by }` | Balance = room + extras − discount + completed room-service orders + charges − (payments + deposits − refunds) |
| Guests / CRM | `Guest`, `Account { consent }` | Minimal data; consent flags per account |
| Loyalty | `LoyaltyConfig`, `LedgerEntry`, `Reward`, `Voucher`, `Campaign` | Points only on completed eligible transactions |
| Inbox | `InboxThread { channel, contact, status, priority, assigneeId, dept, tags, messages[], audit[], firstResponseAt }`, `InboxMsg { dir: in \| out \| note \| system }` | Notes are never sent; outbound messages in the demo are stored only |
| Reviews | `Review { platform, rating(1–5), lang, status: new \| draft \| approved \| published_demo \| manual_required, reply{approvedBy} }` | Booking.com scores are shown on a /10 scale |
| Services | `ServiceRequest` routed by `SERVICE_META` | — |
| Ops | `HkTask`, `MaintRequest`, `StaffTask`, `LostItem` | — |
| Staff | `Staff { dept, position, supervisorId }`, `PERMISSIONS` | *(prod)* server-enforced |
| Learning | `TrainingModule`, `Enrollment`, `Sop` | Quiz ≥ 70% |
| Automation | `workflows: Record<WorkflowId, boolean>`, `AutoRun { key, rule }` | Each idempotency key runs once |
| Restaurant (optional) | `Menu`, `Order`, `Table` | Gated by `property.modules` |

## Production additions *(prod)*

- **`events` / `audit_log`:** who, what, when, before/after, request ID.
- **`integration_accounts`:** provider, property, scopes, token reference. Secrets themselves live in a secret manager.
- **`webhook_receipts`:** provider, signature-valid flag, idempotency key, processed_at.
- **`message_deliveries`:** outbox with status and provider message ID.
- **`stay_tokens`:** hashed, rotating, expire at checkout.
- **`data_retention_policies`:** per data class.
- **`exports`:** for GDPR-style access and deletion requests.

## Data minimisation

- **Inbox:** store messages only for linked channels.
- **Raw payloads:** time-limited retention.
- **AI:** receives the minimum context; no card data ever.
- **Review replies:** never include surnames, booking codes, phone numbers or e-mails. `replyIssues()` checks for these.
