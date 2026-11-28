# RISEUP Restaurant OS: Waiter Workflows

The waiter application is the core of the product: a paperless, one-handed mobile web app at `/r/floor`. This document maps each required step to the implementation and its status (A = works in demo, B = works with a labelled simulated external party, C = not built).

Code: `src/app/r/floor/page.tsx` (home), `src/components/restaurant/staff/waiter.tsx` (table screen), domain in `src/lib/restaurant/engine.ts` and `ops.ts`, labels in `src/lib/restaurant/staff-t.ts`.

## 1. The 21-step service workflow

| # | Step | How it works | Status |
|---|---|---|---|
| 1 | Sign in | Demo actor picker (labelled "not secure"). Production: PIN on shared devices + personal login, see SECURITY_REQUIREMENTS §2 | A (demo) / C |
| 2 | Choose section | "My tables" / "All" switch; tables of other waiters are dimmed | A |
| 3 | Floor plan | Live SVG map per area, 10 table states, flags for guest calls (orange pulse), food ready (green dot), allergies (⚠) | A |
| 4 | Open table / join session | Tap table → guest count chips → "Seat guests". A table with an open session shows it; QR orders join the same session | A |
| 5 | Guest count & seats | Party size at seating, editable in "More"; seat chips 1…N on the Add tab, plus "Shared" | A |
| 6 | Menu | Favourites (best sellers), categories, search in any language, sold-out items disabled | A |
| 7 | Modifiers | Bottom sheet with groups, min/max rules, price deltas; "Add" disabled until valid | A |
| 8 | Notes | Per line note in the sheet; service notes on the table | A |
| 9 | Allergies | Table allergy field ("More"), shown in red on the table header, Add tab and **every kitchen ticket** of the table | A |
| 10 | Courses | Now / 1 Starters / 2 Mains / 3 Desserts per line; drinks default to Now | A |
| 11 | Send to kitchen | Bottom bar shows count and total; one tap. Course > first is **held** | A |
| 12 | Status | Order tab: status per order and per line (New, Cooking, Ready, Held, Bumped) | A |
| 13 | Ready notification | Attention queue "Ready — serve · S-1234"; table flag | A |
| 14 | Serve | "Served" on the order or from the queue | A |
| 15 | Add items | Add tab again → new order on the same session, new tickets | A |
| 16 | Bill | Bill tab: total and per-seat subtotals | A |
| 17 | Split / combine | One bill, by seat, equal split 2–6; merged tables share one bill | A |
| 18 | Payment through configured adapter | "Card (terminal)" creates a pending payment; only the adapter's approve/decline changes it; demo adapter buttons are labelled "Simulated adapter" | B |
| 19 | Cash / POS | "Record cash" / "Record POS" by cashier, manager or owner; shown as "Recorded", never "Paid (confirmed)" | A |
| 20 | Close table | Enabled only when all parts are paid/recorded and the kitchen has nothing open for the table; table goes to Cleaning | A |
| 21 | Table reset | "Cleaned" → Available | A |

## 2. Additional operations

| Operation | Rule | Status |
|---|---|---|
| Fire course | Releases held tickets of course N to their stations | A |
| Move items to another table | Select lines → "Move items" → table picker. A new order is created on the target session; the source order is recalculated | A |
| Transfer table | To a free table; whole session moves | A (`tables.transfer`) |
| Merge tables | Second table joins the session; shown as "T4 + T5" | A (`tables.transfer`) |
| Hand over to another waiter | "More" → assign | A |
| Void item | Reason required; permission `orders.void`. Before cooking: stock reversed. After cooking: waste recorded, manager alerted | A |
| Remake | Kitchen / manager, recorded as remake cost | A |
| Shift summary | Home cards: my open tables, attention items, my sales | A |
| Shift handover | Team page: automatic summary of open tables, kitchen, messages, tasks, stock | A |

## 3. Offline and connection rules

* Every action is an event. When the connection drops, events wait in a local pending queue and are re-sent automatically.
* An order whose event is still pending shows **"Not yet confirmed — will be sent when online"** on its card; a global banner appears while reconnecting.
* The waiter never sees "sent to kitchen" or a kitchen status for an order the server has not accepted, because statuses come only from server-confirmed state.
* Payments cannot be requested offline in a way that looks approved: approval only arrives as a provider result event.

## 4. Mobile ergonomics

* 48 px minimum touch targets on primary actions; chips 40 px.
* Sticky table header with tabs; sticky bottom "Send to kitchen" bar with safe-area padding.
* Bottom-sheet modifiers reachable by thumb.
* No horizontal scroll at 390 px (verified).
* Language switch hy / ru / en stored per device.

## 5. Permissions used by the waiter app

| Action | Waiter | Cashier | Manager / owner | Host |
|---|---|---|---|---|
| Open table, order, fire, serve | ✓ | ✓ | ✓ | open table only |
| Void item | – (role map is configurable) | – | ✓ (also chef) | – |
| Transfer / merge | ✓ | – | ✓ | – |
| Prepare bill, card request | ✓ | ✓ | ✓ | – |
| Record cash / POS | – | ✓ | ✓ | – |

## 6. Verified by tests

* Unit (`tests/restaurant-ops.test.ts`): courses & held tickets, held-cancel reversal, transfer / assign, merge, move lines, bill sums for all modes, payment flow incl. decline and unique provider reference, close rules.
* Browser E2E (`e2e-ops.js`, separate devices): seats & courses → held on KDS → fire course → kitchen → ready → served → one bill → card declined → card approved → table closed → cleaning (all pass).
