# RISEUP Restaurant OS: Data Architecture

Complements RESTAURANT_OS_DATA_MODEL (Phase 1 blueprint). This document describes the data as it is implemented now and the production target.

## 1. Principle: event sourcing

```
state = replay(seed(baseDate, epochAt), events)
```

* `seed` builds a deterministic restaurant (menu, recipes, 28 days of history, today's live service, customers, reservations, inbox, reviews, tasks). History is memoised and frozen; the mutable part is cloned per replay. Replay of a demo session takes < 1 ms per event.
* Every user action is one **event** `{type, id, at, by, …payload}`. The server (`/api/rsession/[code]`) accepts only the 79 allow-listed event types, validates size, and appends. Clients poll and replay.
* Sensitive rules are enforced **in the reducer**, so a forged event cannot bypass them: payment results only from allowed adapters with unique references; cash recording only by cashier / manager / owner; ticket reopen only by chef / manager / owner; PO approval only by manager / owner; no-show only after +15 min; auto-reply only for allowed low-risk intents; reservations cannot overlap.
* Automations run inside the reducer through `runAuto(state, automationId, objectRef, …)`: idempotent by `automationId:objectRef`, logged as ok / skipped / failed, and they never emit new events (no loops).

## 2. Entities (implemented)

| Area | Entities |
|---|---|
| Venue | `brand`, `areas` (w/h, open/closed), `tables` (shape, seats, x/y, `combinableWith`, `blocked`, waiter, QR token), `stations` (thresholds), `staff`, `settings` |
| Menu | `categories`, `items` (names hy/ru/en, price, station, prep time, allergens + verified flag, dietary tags, modifier `groups` with min/max), `recipes` (ingredient, qty, yield) |
| Service | `sessions` (table, party, waiter, allergies, notes, mergedTables, bill, status), `orders` (channel waiter/qr/website, lines with seat, course, modifiers, status, history), `tickets` (station, course, lineIds, status incl. held, itemsDone, reopenedBy), `requests` (call waiter / bill / help), `cleaning` |
| Money | `Bill {mode, parts[{label, amount, status, method, paymentId}]}`, `payments {sessionId, partId, amount, method, adapter, status pending/approved/declined/recorded, providerRef}` |
| Stock | `ingredients` (unit, purchase unit, cost, min, par, storage, supplier), `moves` ledger with idempotent keys (`consume:line:i`, `reverse:`, `waste:`, `count:`), `prices` (price history), `counts` (stocktakes with expected/counted/unit cost) |
| Purchasing | `suppliers`, `pos` (draft → pending_approval → approved → sent → partial/received, auto flag, approvedBy, expectedAt, receivedAt, total) |
| Reservations | `reservations` (code, party, at, duration, tableIds[], status, source, allergies, occasion, history, reminded, deviceKey), `waitlist` |
| Guests | `customers` (phone-keyed, visits, spend, favourites, tags, dietary, consent {marketing, at, source}, points, tier), `loyalty` (enabled, earnPer1000, tiers, ledger with unique keys) |
| Communication | `inbox` conversations (channel, customer, lang, status, assignee, priority, tags, messages with dir/state/intent, draft {text, intent, risk, facts}, firstInAt, firstReplyAt), `inboxSettings.autoReplyIntents`, `outbox` (simulated external messages) |
| Reputation | `reviews` (platform, rating, text, lang, categories −1…+1, reply {text, status}, taskId) |
| Team | `shifts`, `tasks`, `teamMsgs`, `handovers`, `summaries`, `sops` |
| System | `automations` (on/off), `autolog`, `notices`, `activity` |

## 3. Derived data (never stored)

Order status from tickets; table state (10 states) from sessions, reservations, bills, cleaning and blocks; stock on hand from the ledger; food cost and margin from recipes × current ingredient cost; analytics (sales by channel/day, dish engineering, waste, price-change impact, savings calculator) from orders and moves; customer tier from points.

## 4. Money and units

* Amounts are integer AMD. Menu prices include VAT when the venue is VAT-registered; margin uses net price = price / (1 + VAT rate) per `settings.vat` (rules.ts).
* Bill parts are computed so their sum equals the session total exactly (rounding remainder on the last part).
* Stock quantities in base units (g, ml, pcs); costs per purchase unit converted with `unitsPerPurchase`.

## 5. Idempotency keys

| Key | Guarantees |
|---|---|
| `consume:{lineId}:{i}` | Stock deducted once per line ingredient |
| `reverse:` / `waste:` | Cancellation never double-counts |
| `earn:{orderId}` | Loyalty points once per order |
| `{automationId}:{ref}` | Each automation once per object |
| `providerRef` unique | A payment result cannot be replayed onto another payment |

## 6. Privacy

* Demo data is fictional; phones use the reserved `+374 00` range.
* Guests are identified on the site only by a random device key (order status, bookings, chat).
* CRM shows masked phones in lists; full phone only in the profile.
* Marketing consent stored with source and time; no campaign sending.

## 7. Production target

| Concern | Target |
|---|---|
| Store | PostgreSQL: append-only `events` table per tenant + projections (orders, tickets, stock_on_hand, reservations, conversations) updated transactionally; snapshots every N events |
| Tenancy | `tenant_id` on every row, row-level security, per-tenant encryption keys for PII |
| Real-time | Server-sent events / WebSocket fan-out instead of polling |
| Recipe versions | `recipe_versions(recipe_id, version, valid_from, lines…)`; orders reference the version used for costing |
| Audit | Events are the audit log; export per tenant; retention policy per data class |
| Analytics | Nightly materialised views; contribution margin once labour and overhead inputs exist |
| Hotel OS | Shared kernel already (replay, session store, client store); room charge via the contract in TECHNICAL_ARCHITECTURE (Revision 2, "Hotel OS bridge") |
