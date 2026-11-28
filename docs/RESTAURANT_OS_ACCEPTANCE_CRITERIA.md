# RISEUP Restaurant OS: Demo Acceptance Criteria

**Status:** Phase 1, for approval. **Date:** 2026-11-27.
The demo is complete only when **every** criterion for the chosen scope (Core = A, B, C, F; Full = + D, E) passes. "Passes" means verified by a person on the listed devices, or by an automated test where named.

---

## Revision 2 — acceptance criteria for the deep refinement phase (2026-11-28)

Each line: criterion → how verified → result in this build.

### Waiter
1. Order lines carry seat and course; later courses are held until fired → unit + E2E W1/K1/W2 → **pass**.
2. A held course cancelled before firing returns stock without waste → unit → **pass**.
3. Waiter sees "ready" and can mark served from the queue → E2E W3 → **pass**.
4. Move items, transfer, merge, assign keep totals and sessions consistent → unit → **pass**.
5. Bill parts always sum to the session total (single, seat, equal) → unit → **pass**.
6. Card payment is "paid" only after an adapter result; decline keeps the part open; provider reference unique → unit + E2E P1/S1 → **pass**.
7. Cash/POS recording only by cashier/manager/owner → unit → **pass**.
8. Table closes only when settled and kitchen idle → unit + E2E P2 → **pass**.
9. Unsent orders show "not yet confirmed" → implemented from the pending queue; **not automated** (manual offline check pending).
10. No horizontal scroll at 390 px on waiter screens → screenshot QA → **pass**.

### Kitchen
11. Held tickets never appear as cooking tickets → unit + E2E K1 → **pass**.
12. Reopen only by chef/manager/owner with reason → unit → **pass**.
13. Guest allergy shown on every ticket of the table → implemented; visual check → **pass**.

### Host & reservations
14. No overlapping assignment of a table (turn time + buffer) → unit → **pass**.
15. Suggestion uses a combinable pair when no single table fits → unit → **pass**.
16. No-show only after +15 min → unit → **pass**.
17. Website booking is a request until confirmed; guest sees the status → E2E R1/R2 → **pass**.

### Inbox & reviews
18. Auto-reply only for enabled low-risk intents; allergy/complaint/discount/manager escalate → unit + E2E I1 → **pass**.
19. Every non-webchat outgoing message is labelled simulated → unit (states) + UI → **pass**.
20. Approved webchat reply reaches the guest → E2E I2 → **pass**.
21. ≤3★ review creates exactly one task; Google publish simulated, others manual → unit + presenter M replay check → **pass**.

### Stock, purchasing, CRM, team
22. Low stock creates one draft PO per supplier, never sent automatically → unit + presenter O replay check → **pass**.
23. PO above the limit needs manager/owner approval → unit → **pass**.
24. Stocktake adjusts the ledger to counted values → unit → **pass**.
25. Loyalty points once per completed order → unit → **pass**.
26. Disabled automation does not run and is logged as skipped → unit → **pass**.

### AI
27. Assistant answers include sources; actions need permission and confirmation → unit (grounding) + UI → **pass**.

### Platform
28. Hotel OS behaviour unchanged → behavioural snapshot (20 routes + sync flow): only relative-time strings and a timestamped key differ; all tests pass → **pass**.
29. Core demo scenarios A/B/C/F still pass → E2E → **pass**.
30. "10 consecutive cross-device runs" (Revision 1 §1) → **not yet repeated 10×** for the new scenarios; each automated suite ran green at least once after the final build.

---

## Revision 1 — Phase 1 acceptance criteria (kept for reference)

## 1. Definition of done (summary)
1. All end-to-end scenarios pass **10 consecutive runs** cross-device with Reset between runs.
2. All domain tests pass, including the hotel suite (no regression).
3. No screen violates the honesty rules (§6).
4. Two timed dry runs of the Standard script finish in ≤ 15 minutes; the Short script in ≤ 5.
5. Lighthouse and performance budgets (§5) met.

## 2. End-to-end scenarios
Devices for every scenario: **iPhone Safari (guest)**, **Android Chrome (guest or waiter)**, **laptop Chrome (manager/presenter)**; KDS on a tablet or second window.

### A — QR table order
- [ ] Scanning table 7's printed QR opens the menu showing "Table 7 · Main hall" in ≤ 3 s on 4G, in the phone's language (hy/ru/en).
- [ ] Modifier rules enforced (required group, min/max); price updates live; sold-out items cannot be added.
- [ ] Submitted order appears in the waiter view and manager inbox within **≤ 3 s** (live mode).
- [ ] Guest status reads "Sent · waiting for the restaurant" until **Accept**; it never shows "Accepted" earlier.
- [ ] After Accept, tickets appear only at the configured stations (e.g., Grill + Bar), with modifiers, notes and allergens highlighted.
- [ ] Start on any ticket → guest sees "Preparing" ≤ 3 s; Ready on all tickets → "Ready"; Served → "Served".
- [ ] A second round from the same table attaches to the same table session.
- [ ] Call waiter / Request bill appears on the assigned waiter's phone with table and age; acknowledgement visible.
- [ ] Order counted in today's sales, channel "QR", and in the overview, with identical totals.

### B — Online takeaway
- [ ] Pickup slots respect lead time and kitchen load; minimum order and fees from settings are applied and shown.
- [ ] Order lifecycle submitted → accepted → preparing → ready → picked up → completed works; the pickup code is shown.
- [ ] Member earns points exactly once on completion; reopening/replaying does not add points.
- [ ] Customer profile shows the order, updated visit count and AOV.
- [ ] "Ready" external message exists only as a labelled simulated outbox item.

### C — Food cost
- [ ] Ingredient detail shows stock, unit cost, supplier, price history and "used in" recipes.
- [ ] Recipe shows line costs (with yield), total cost, net price (VAT mode), GP, GM %, food cost %.
- [ ] Changing the purchase price recalculates **all** affected recipes, showing before/after, within one interaction.
- [ ] Historical analytics for past days do not change after the price change (snapshot rule).
- [ ] Toggling VAT mode changes net price and margins consistently everywhere.

### D — Retention (Full)
- [ ] Segment rules show a live audience count; customers without marketing consent are excluded and counted separately.
- [ ] Offer eligibility (one per customer, validity, days) is enforced in the cart.
- [ ] Simulated campaign creates outbox items labelled simulated; "sample results" are labelled projections with the assumption.
- [ ] A voucher redeemed in the session counts as a real (session) redemption, separate from projections.

### E — Employee (Full)
- [ ] New employee gets role onboarding automatically; quiz below 70% does not complete the step.
- [ ] Supervisor approval required to finish onboarding.
- [ ] Task assignment, task thread message, completion and manager view work across two devices.
- [ ] Navigation shows only permitted modules for the waiter role (no food cost, no finance).

### F — Owner overview
- [ ] Sales, orders, AOV, channels, best sellers, menu-engineering matrix, food-cost alerts, stock alerts, team status and insights render from the same data.
- [ ] Every insight card shows its supporting data; "Net profit" shows "requires expense data" unless expenses are entered.
- [ ] Orders created in A/B are reflected after they happen.

## 3. Data consistency (automated where marked ✱)
- [ ] ✱ Any random sequence of valid and invalid events yields the same state on two replays (determinism).
- [ ] ✱ Duplicate events (same id) apply once.
- [ ] ✱ Invalid status transitions are ignored and do not change state.
- [ ] ✱ Stock is deducted exactly once per accepted order item; cancel before start reverses; cancel after start writes waste; no double movement under status ping-pong.
- [ ] ✱ Prices from the client are ignored; totals equal menu prices + modifiers − valid discounts.
- [ ] ✱ Loyalty earn/claw and vouchers obey unique keys and lifecycle.
- [ ] ✱ Totals match across overview, orders list, analytics, CRM (property-style test).
- [ ] ✱ Recipe cost, GP, GM, food cost % match hand-calculated fixtures (incl. yield, modifiers, sub-recipe, VAT on/off).
- [ ] Reset returns every device to the seed within 3 s; no stale data after reset on any device.
- [ ] Offline (live mode, network off) actions are queued and sent in order when back online; nothing lost.

## 4. Mobile and device requirements
- [ ] Guest pages usable from 360 px width; no horizontal scroll; tap targets ≥ 44 px.
- [ ] Sticky category tabs and cart button work with iOS safe areas and the on-screen keyboard.
- [ ] Waiter app usable one-handed on a 6" phone; floor plan pan/zoom works.
- [ ] KDS readable at 2 m: item text ≥ 20 px, contrast ≥ 7:1, touch targets ≥ 56 px, no hover-only actions.
- [ ] Host view works on a 10" tablet in landscape.
- [ ] Manager pages work on laptop and tablet; key overview cards readable on phone.

## 5. Performance
- [ ] ✱ Replay (seed + 450 events) < 40 ms in Node; verified once to stay smooth on a mid-range Android phone.
- [ ] Lighthouse mobile ≥ 85 (performance) and ≥ 95 (accessibility) on website home and menu.
- [ ] LCP ≤ 2.5 s on simulated 4G for website home; hero image ≤ 180 KB on mobile.
- [ ] Phone → laptop latency ≤ 3 s at the 95th percentile over 20 actions on venue-like Wi-Fi/4G.
- [ ] No layout shift when live updates arrive (CLS ≤ 0.1).

## 6. Honesty and safety checks (each screen reviewed)
- [ ] "Demo data · fictional restaurant" badge on every staff screen; `noindex` on all pages.
- [ ] No "accepted/confirmed" without a staff event or a visible auto-accept rule.
- [ ] No wording implying a fiscal receipt, payment or real message delivery.
- [ ] Every integration shows Not connected / Simulated, never Connected.
- [ ] Allergens: "not provided" is distinct from "none"; the assistant never states absence of an allergen that isn't verified; severe-allergy questions hand off.
- [ ] Gross vs net profit labelled correctly; projections labelled with assumptions.
- [ ] Fictional names, phones (`+374 00 …`), e-mails (`@example.com`); licensed photos only, credits in README.

## 7. Quality checks
- [ ] TypeScript strict, `npm run typecheck` clean; build succeeds.
- [ ] Hotel demo regression: 9/9 hotel tests + manual run of hotel presenter scenarios 1–3.
- [ ] Keyboard navigation and visible focus everywhere; `prefers-reduced-motion` disables reveal/parallax.
- [ ] No English placeholders on Armenian screens; hy/ru customer copy reviewed by a native speaker.
- [ ] No console errors in the scenarios.
- [ ] Permission checks: a waiter cannot reach `/r/admin/recipes` or finance analytics by URL.
- [ ] Session limits: oversize events and unknown event types are rejected by the route.

## 8. Presenter readiness
- [ ] `/present/restaurant` steps for each scenario with "say" text; auto-actions for each step.
- [ ] QR on screen and on printed tents resolve to the presenter's session.
- [ ] Clock preset "Friday 20:15" produces a busy floor and KDS.
- [ ] Local mode works with no internet (guest in a phone frame).
- [ ] Reset requires the PIN when `DEMO_PRESENTER_PIN` is set.
