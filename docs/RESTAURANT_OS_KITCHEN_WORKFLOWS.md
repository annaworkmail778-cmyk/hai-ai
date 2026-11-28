# RISEUP Restaurant OS: Kitchen Workflows

Kitchen Display System at `/r/kds` (code: `src/app/r/kds/page.tsx`; ticket logic in `src/lib/restaurant/engine.ts` → `fire`, `syncFromTickets`; reopen / item done in `ops.ts`).

## 1. Ticket lifecycle

```
order accepted ──► fire(): group active lines by station + course
                    ├─ first course / "now" lines ─► queued ─► in_progress ─► ready ─► bumped
                    └─ later courses ─► held ──(waiter "fire course")──► queued …
void before cooking ─► ticket voided, stock reversed
void after cooking  ─► ticket voided, waste recorded, manager alerted (once)
bumped ──(recall)──► ready        bumped/ready ──(reopen + reason, chef/manager/owner)──► in_progress
```

Order status is **derived** from its tickets (held tickets are ignored): any in progress → preparing; all ready/bumped → ready. The guest and waiter see exactly that derived status.

## 2. Stations

| Station | Typical items | Amber / red thresholds |
|---|---|---|
| Hot kitchen | mains, soups | per station config |
| Grill (մանղալ) | khorovats, ribs, vegetables | longer thresholds |
| Cold kitchen | salads, starters | short |
| Pastry | desserts | short |
| Bar | wine, coffee, cocktails | short |

Views: one station, **all**, and **expo** (per-order readiness across stations, "handed to table" for dine-in, "waiting for guest" for takeaway).

## 3. What a cook sees on a ticket

* Table label or TAKEAWAY, order code, station (in all/expo views), **course number**.
* Age in minutes, colour by station thresholds; RUSH and REMAKE flags; "new" pulse for 60 s.
* Dish allergens (black-red band) and the **guest allergy from the table** (red band) — so a nut allergy told to the waiter reaches every station.
* Lines with quantity, modifiers (blue), notes (red), seat number.
* **Item check-off** while in progress: tap a line to strike it through (shared across screens).
* One big action per state: Start → Ready → Bumped.

## 4. Panels

| Panel | Purpose |
|---|---|
| Held courses | Shows which tables have courses waiting (table · course · station · item count); per-station "+N" badges on the station tabs |
| Recently bumped | Recall (anyone) and **Reopen** (chef / manager / owner, reason required, recorded on the order history and activity log) |
| Recently cancelled | Struck-through voided items in the last 90 min so cooks stop preparing them |
| All-day counts | Totals of everything not yet ready, for batching |
| Availability | Sold-out toggle per dish → instantly disabled on QR menu, website and waiter app |

## 5. Language

hy / ru / en switch in the KDS header, stored per device; dish names follow the language.

## 6. Kitchen analytics (owner analytics)

Ticket time by station, late tickets (> red threshold), remakes and their cost, waste by ingredient. Reopens are visible in the order history with the person and reason.

## 7. Not built / requires hardware or partners

* Kitchen printer fallback (Star CloudPRNT, Epson Server Direct Print) — R.
* Bump bars, kitchen-side order splitting by cook — C.
* Prep forecasting from reservations — C.

## 8. Tests

Unit: held tickets ignored for status, fire course, held-cancel reverses stock without waste, item done, reopen authorisation (waiter refused, chef allowed). E2E: course 2 absent from KDS until fired, then appears on grill; full start / ready / bump cycle updates waiter and guest screens.
