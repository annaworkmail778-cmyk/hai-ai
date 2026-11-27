# RISEUP Restaurant OS: Data Model

**Status:** Phase 1 blueprint, for approval. **Date:** 2026-11-27.
The same model serves the demo (TypeScript types in `business-os/src/lib/restaurant/types.ts`, to be created) and production (PostgreSQL tables). Production-only columns are marked *(prod)*.

## 1. Conventions
- Every business entity has `id`, `orgId`, and where location-scoped `locationId`. *(prod)* RLS on `org_id`; DAL checks location membership.
- Money: integer **AMD (dram)**, no floats. Quantities: decimal stored as integer **milli-units** (g, ml, pcs×1000) to avoid rounding drift.
- Translatable text: `I18n = { hy, ru, en }` (existing type). Missing translation falls back to `hy`.
- Time: epoch ms UTC; location timezone `Asia/Yerevan` for business days. A **business day** ends at the configured cut-off (default 05:00), so a 01:30 bar order belongs to the previous day.
- Status changes are **events** (append-only) in the demo and *(prod)* in `*_events` tables; the current status is a projection.
- Snapshots: an order item stores the **price, tax mode, name and recipe version at the time** — later menu edits never rewrite history.

## 2. Entity overview
```
Organization ─┬─ Brand ─┬─ MenuItem ─┬─ ModifierGroup ─ Modifier
              │         │            └─ Recipe (versions) ─ RecipeLine ─ Ingredient | SubRecipe
              │         └─ LoyaltyProgram ─ Tier, Reward
              ├─ Location ─┬─ DiningArea ─ Table ─ QrToken
              │            ├─ Station, Printer
              │            ├─ MenuItemLocation (price/availability override)
              │            ├─ TableSession ─ Order ─ OrderItem ─ OrderItemModifier
              │            │                      └─ KitchenTicket ─ TicketItem
              │            ├─ Reservation, WaitlistEntry
              │            ├─ StockMovement, StockCount, Batch(expiry)
              │            ├─ PurchaseOrder ─ PoLine, GoodsReceipt
              │            └─ Shift, Task, ServiceRequest
              ├─ Ingredient, Supplier ─ SupplierProduct ─ PriceHistory
              ├─ Customer ─ Address, Consent, LedgerEntry, Voucher, Feedback
              ├─ Person(Employee) ─ Membership(location, role)
              ├─ Role ─ Permission
              ├─ Offer, Segment, Campaign, OutboxMessage
              ├─ TrainingModule ─ Enrollment ; Sop ; Channel ─ Message
              └─ AuditEntry, Integration
```

## 3. Organisation and places
| Entity | Key fields | Notes |
|---|---|---|
| `Organization` | `id, legalName, taxId? (prod), plan, settings` | Tenant root |
| `Brand` | `id, orgId, name, themePreset, theme (tokens), domains[], defaultLang, langs[]` | Owns master menu, loyalty |
| `Location` | `id, brandId, name, address, geo, timezone, currency='AMD', vat: { pricesIncludeVat: bool, rate: 0.20, registered: bool }, serviceChargePct, businessDayCutoff, hours[], orderRules` | `orderRules`: min order, fees, delivery zones, pickup slot size, lead times, auto-accept per channel |
| `DiningArea` | `id, locationId, name(I18n), kind (hall/terrace/lounge/private/bar), seasonal, menuIds[]` | Area-specific menus |
| `Table` | `id, areaId, label, seats, minSeats, shape, x, y, w, h, rotation, combinableWith[]` | Floor plan |
| `QrToken` | `token (128-bit random), tableId \| roomRef, active, createdAt, revokedAt` | Never encodes ids or guest data |
| `Station` | `id, locationId, name, kind (hot/cold/grill/pizza/pastry/bar/custom), thresholds { amberMin, redMin }, printerId?` | Routing target |

**VAT note:** Armenia's standard VAT rate is 20%; whether a restaurant is a VAT payer or under another tax regime differs per business, so `vat.registered` and `pricesIncludeVat` are settings. Margin is computed on **net revenue** (ex-VAT) when registered, otherwise on the gross price. Confirm per client with their accountant; RISEUP gives no tax advice.

## 4. Menu
| Entity | Key fields |
|---|---|
| `Menu` | `id, brandId, name, kind (main/breakfast/bar/seasonal/event), schedule (days, from, to), validFrom/To, areaIds[]` |
| `MenuCategory` | `id, menuId, name, sort` |
| `MenuItem` | `id, brandId, categoryId, name, desc, ingredientsText (I18n), photo, allergens[] (EU 14 codes), allergensVerified: bool, dietary[] (vegetarian/vegan/spicy/halal…), tags[] (signature/chef/new), stationId, prepMin, variants[], modifierGroupIds[], recipeId?, visible, sort` |
| `Variant` | `id, itemId, name (Small/Large, 0.5 l…), priceDelta, recipeId?` |
| `ModifierGroup` | `id, name, min, max, required` |
| `Modifier` | `id, groupId, name, price, stationOverrideId?, recipeDelta[] (ingredientId, qty ±)` |
| `MenuItemLocation` | `itemId, locationId, price, available, availableUntil?, reason?` | Location override |

**Allergen rule:** `allergens[]` empty with `allergensVerified = false` means **"not provided"**, never "allergen-free". The UI and the assistant must show the difference.

## 5. Tables, sessions, orders, kitchen
| Entity | Key fields | States |
|---|---|---|
| `TableSession` | `id, tableId, openedAt, openedBy, partySize, waiterId, reservationId?, status, closedAt, settledOnPos: bool` | `seated → ordering → waiting_food → eating → bill_requested → closed → cleaning` |
| `Order` | `id, code (E-4821), locationId, channel (waiter/qr/website/phone/room_service/delivery_platform), type (dine_in/takeaway/delivery/room_service), tableSessionId?, customerId?, contact {name, phone}, address?, zoneId?, pickupAt?, notes, subtotal, discounts[], fees[], total, voucherId?, status, statusHistory[], assigneeId?, deviceToken (hash), source meta (platform order id), createdAt` | See `TECHNICAL_ARCHITECTURE.md` §6.1 |
| `OrderItem` | `id, orderId, round, itemId, variantId?, nameSnapshot, qty, unitPrice (snapshot), modifiers[] (id, name, price snapshot), note, seat?, course?, stationId, recipeVersionId (set at accept), status (active/voided), voidReason?, voidedAfterFire: bool` | |
| `KitchenTicket` | `id, orderId, stationId, round, items[] (orderItemId, qty), status, priority (normal/rush), firedAt, startedAt, readyAt, bumpedAt` | `queued → in_progress → ready → bumped` |
| `ServiceRequest` | `id, tableSessionId \| roomRef, kind (waiter/bill/help/other), note, status, ackBy, ackAt, doneAt` | `new → acknowledged → done` |

**Derived order status:** `preparing` = any ticket `in_progress`; `ready` = all active tickets `ready|bumped`. Stored as events for history, but computed from tickets so it can never contradict the kitchen.

## 6. Recipes, inventory, purchasing
| Entity | Key fields |
|---|---|
| `Ingredient` | `id, orgId, name, category, usageUnit (g/ml/pcs), purchaseUnit (kg/l/case), unitsPerPurchase, currentCost (AMD per purchase unit), costSource (last receipt / manual), minLevel, parLevel, storage (fridge/freezer/dry/bar), shelfLifeDays?, allergens[]` |
| `SubRecipe` (prep item) | `id, name, yieldQty, yieldUnit, lines[]` — e.g. house matsun sauce, lavash dough; costed like a recipe, consumed like an ingredient |
| `Recipe` | `id, itemId \| variantId \| modifierId, currentVersionId` |
| `RecipeVersion` | `id, recipeId, version, effectiveFrom, lines[], portionYieldNote, createdBy` |
| `RecipeLine` | `ingredientId \| subRecipeId, qty (usage units, **as served**), yieldPct (usable share after trimming/cooking loss), optional: bool, optionalDefault: bool` |
| `StockMovement` | `id, locationId, ingredientId, qty (± usage units), kind (receive/consume/reverse/waste/count_adjust/transfer_in/out/manual), unitCost, ref {kind, id}, idempotencyKey (unique), reason?, at, by` |
| `Batch` | `id, ingredientId, receivedAt, expiresAt, qtyRemaining` (expiry alerts; FIFO is advisory) |
| `StockCount` | `id, locationId, at, lines[] (ingredientId, counted)` → `count_adjust` movements for variance |
| `Supplier` | `id, orgId, name, contact, leadTimeDays, deliveryDays[], minOrder` |
| `SupplierProduct` | `id, supplierId, ingredientId, packName, packQty, price, currency` |
| `PriceHistory` | `supplierProductId, price, at, source (receipt/manual)` |
| `PurchaseOrder` | `id, locationId, supplierId, status (draft → sent → partially_received → received / cancelled), lines[] (ingredientId, qty, expectedPrice), expectedAt` |
| `GoodsReceipt` | `id, poId?, lines[] (ingredientId, qty, actualPrice, batchExpiry?)` → `receive` movements + price history |

### 6.1 Costing formulas (unit-tested)
- **Usage-unit cost** `c_i = currentCost_i / unitsPerPurchase_i` (e.g. 3,400 ֏/kg → 3.4 ֏/g).
- **Line cost** `= qty_served / yieldPct × c_i` (yield expresses trim/cooking loss: 200 g served at 72% yield requires 278 g raw).
- **Recipe cost** `= Σ line costs (+ default optional lines)`; variant and modifier deltas add or subtract lines.
- **Net price** `= price / (1 + VAT)` if `pricesIncludeVat` and VAT-registered, else `price`.
- **Gross profit per item** `= net price − recipe cost`. **Gross margin %** `= GP / net price`. **Food cost %** `= recipe cost / net price`.
- **Theoretical food cost (period)** `= Σ consume − Σ reverse` at the unit cost snapshotted on each movement. **Actual** adds waste and count variance.
- **Net profit** is computed **only** if operating expenses (labour, rent, utilities, fees) are entered for the period; otherwise the UI shows "Net profit: requires expense data" — never an estimate.
- Price change → new `unitCost` from the effective date; open recipe views recalculate; **historical movements keep their snapshot**.

### 6.2 Inventory deduction rules (idempotent)
| Event | Movement | Key |
|---|---|---|
| `order.accept` | `consume` per order item × qty, per recipe line, using the snapshotted recipe version, modifier deltas applied | `consume:{orderItemId}:{lineIdx}` |
| Additional round accepted | Same, new order items | new keys |
| Cancel / void **before** ticket `in_progress` | `reverse` mirroring each consume | `reverse:{orderItemId}:{lineIdx}` (only if consume exists and no waste) |
| Cancel / void **after** start | `waste` (reason "order cancelled after preparation") — no reverse | `waste:{orderItemId}:{lineIdx}` |
| Refund after completion | **No stock movement** (the food was consumed); financial refund only *(prod, POS side)* | — |
| Recipe changed after acceptance | No retroactive change (version snapshot) | — |
| Manual waste | `waste` | `waste:manual:{eventId}` |
| Count | `count_adjust` = counted − theoretical | `count:{countId}:{ingredientId}` |
| Duplicate event delivery / status ping-pong | Unique key refuses second movement | — |

Alternative considered: deduct at `completed`. Rejected for the default because cooked-then-cancelled food would be invisible and stock would lag the kitchen during service. Configurable per location in production if a client's process requires it.

## 7. Reservations
| Entity | Key fields | States |
|---|---|---|
| `Reservation` | `id, code, locationId, customerId?, contact, partySize, startAt, durationMin (from rules by party size), areaPref?, tableIds[], occasion?, requests, vip, depositRequired (prod), source (website/phone/walk_in/assistant/platform), status, history[]` | `requested → confirmed / declined / proposed_change → (accepted) confirmed → seated → completed` · `cancelled` · `no_show` |
| `ReservationRules` | `slotMinutes, durationByParty, maxCoversPerSlot, bufferMin, cutoffModifyHours, noShowGraceMin` | |
| `WaitlistEntry` | `id, name, phone, partySize, quotedMin, addedAt, status (waiting/notified/seated/left)` | |

**Availability** is computed from tables, combinations, durations and existing reservations — shown to **staff** as a suggestion. Guests only ever see "request".

## 8. Customers, loyalty, marketing
| Entity | Key fields |
|---|---|
| `Customer` | `id, orgId, name, phones[], emails[], lang, birthday?, addresses[], allergiesOnFile (free text + codes, staff-visible), preferences, tags (VIP…), notes[], firstSeenAt, stats (visits, orders, spend, aov, lastVisitAt, favouriteItems[], noShows) (projection)` |
| `Account` | `customerId, login (prod: auth uid), createdAt` |
| `Consent` | `customerId, purpose (marketing_email/sms/whatsapp/telegram/push, analytics), granted, at, source, text version` — append-only |
| `LoyaltyProgram` | `brandId, name, earnRule (points per 1,000 ֏ net), eligibleChannels[], expiryMonths?, tiers[], welcomeBonus` |
| `LedgerEntry` | `id, customerId, points ±, reason, ref, idempotencyKey (earn:{orderId}, claw:{orderId}, bday:{year})` |
| `Reward` / `Voucher` | Existing model: voucher `active → reserved → used / released`, plus `code (one-time), expiresAt, perCustomerLimit` |
| `Segment` | `id, name, rules (JSON: lastVisitDays, visits, spend, tier, favouriteCategory, birthdayMonth, consent)` → audience = projection |
| `Offer` | `id, name, benefit (pct/amount/item), scope (items/categories/channel/days/hours), eligibility (segmentId, limits), validFrom/To, active` |
| `Campaign` | `id, offerId?, segmentId, channel, template (I18n), status (draft/simulated/scheduled/sent (prod)), audienceSnapshot count, results {simulated: bool, …}` |
| `OutboxMessage` | `id, channel, to (masked), template, text, state (simulated/scheduled/queued/sent/failed), providerRef?, ref` |
| `Feedback` | `id, customerId?, orderId \| reservationId, score 1–5, text, consentToPublish, at` |

Duplicate prevention: one customer per normalised phone/e-mail per organization (merge flow, not silent duplicates); vouchers are single-use codes; earn keys are unique.

## 9. Workforce (shared with Hotel OS)
| Entity | Key fields |
|---|---|
| `Person` (employee) | `id, orgId, name, phone, email, active, startedAt` |
| `Membership` | `personId, locationId, roleId, department, position, supervisorId` |
| `Role` | `id, orgId, name, permissions[]` (defaults in `TECHNICAL_ARCHITECTURE.md` §9.2), `discountLimitPct` |
| `Shift` | `id, locationId, personId, start, end, area/station, status` |
| `Task` | `id, title, detail, assigneeId, department, priority, due, status (todo/in_progress/done/approved), requiresApproval, origin (manual/automation), ref?` |
| `TrainingModule`, `Enrollment`, `Sop`, `Channel`, `Message` | Existing hotel types, generalised (`dept`/`position` lists per vertical) |
| `AuditEntry` | `id, at, by, action (void/discount/price_change/permission_change/export), target, before, after, reason` |

## 10. Integrations and analytics
| Entity | Key fields |
|---|---|
| `Integration` | `id, locationId, provider, kind (pos/fiscal/payment/delivery/messaging/printer/accounting/hotel), status (not_connected/simulated/connected/error), config (non-secret), secretRef (prod, vault)` |
| `ExternalRef` | `entity, id, provider, externalId` (menu item ↔ POS product, order ↔ platform order) |
| `DailyFact` (analytics) | `locationId, businessDay, hour, channel, categoryId, itemId, orders, qty, gross, net, discounts, theoreticalCost, wasteCost, prepP50/P90, lateTickets, covers, tableTurns` — the demo seed's history and *(prod)* a materialised view |

## 11. Demo seed (fictional, deterministic)
| Data | Volume |
|---|---|
| Menu | 8 categories, ~42 items (khorovats, lavash bakes, mountain herbs salads, trout, dolma, gata, wines, cocktails), variants and modifiers on ~15 items, allergens entered on all except 2 (to demonstrate "not provided") |
| Ingredients | ~70, with suppliers (6 fictional), 30 days of price history, 3 below minimum, 2 expiring |
| Recipes | All food items + 2 sub-recipes (matsun sauce, lavash dough); 5 cocktails |
| History | 60 days: days −60…−15 as `DailyFact`; days −14…0 as raw orders (~2,500), tickets, movements, reservations (~420), feedback (~180) |
| Customers | ~900 profiles, ~260 members, 3 demo accounts (hy/ru/en), consent mix (~70% marketing yes) |
| Staff | 22 fictional employees across all roles; one mid-onboarding; one pending approval |
| Today | Clock preset "Friday 20:15": 34 tables seated, 11 open tickets, 2 late, 3 assistance requests, 6 reservations still to arrive, waitlist 2 |
