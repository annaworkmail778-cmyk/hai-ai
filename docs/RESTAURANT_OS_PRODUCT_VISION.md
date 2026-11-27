# RISEUP Restaurant OS: Product Vision

**Status:** Phase 1 blueprint, for approval. **Date:** 2026-11-27.
**Scope:** medium, large, premium and hotel restaurants; first market Tsaghkadzor, Armenia; architected for restaurant groups.

---

## 1. What we are building (one paragraph)
RISEUP Restaurant OS is the operating layer **between the guest and the kitchen, and between the kitchen and the owner's numbers**. Guests get a premium branded website, a QR table menu, online ordering, reservations and a membership account, all without an app. Staff get one order inbox, a kitchen display routed by station, a live floor plan, inventory, recipes and tasks. Owners get one consistent picture of sales, gross margin, food cost, customers and team performance. It **works beside the restaurant's existing cash register, payment terminal and accounting** and connects to them where an official integration exists.

## 2. Positioning
| We are | We are not (now) |
|---|---|
| The ordering, kitchen, floor, food-cost and guest-retention layer | A fiscal cash register or a replacement for e-HDM receipts |
| Beside the existing POS, payment terminal and accounting | A payment processor |
| A branded direct channel the restaurant owns | A delivery marketplace competing for the restaurant's customers |
| One product family with Hotel OS | A generic dashboard for every industry |

**Positioning line (hy):** «Պատվերից մինչև շահույթ՝ մեկ համակարգում։ Ձեր դրամարկղը մնում է ինչպես կա։»
**(en):** "From the guest's order to the owner's margin, in one system. Your cash register stays as it is."

### Why more valuable than a website or an ordering app
1. **It closes the loop.** Order → station ticket → table/guest status → stock consumption → recipe cost → margin → customer history → retention offer. Simple ordering apps stop at step 1.
2. **Food cost is visible per dish**, using the restaurant's own recipes and supplier prices, so menu pricing becomes a decision, not a guess.
3. **It keeps the customer.** Every QR and online order can become a known, consented customer with history and loyalty, owned by the restaurant rather than a marketplace.
4. **Role-specific tools**, not one dashboard: a waiter's phone, a kitchen screen, a host tablet, an owner overview.
5. **Honest by construction**: requests are not confirmations, simulated messages are labelled, the AI never invents allergens or prices.

## 3. Target customer profiles (Tsaghkadzor first)
No market statistics are claimed. Profiles are hypotheses to validate in discovery (`CUSTOMER_DISCOVERY.md` §2).

| Profile | Typical processes | Likely problems | Relevant functionality | Revenue levers | Cost levers | What the manager wants to see in a demo |
|---|---|---|---|---|---|---|
| **Independent restaurant** (40–80 seats) | Waiter writes orders on paper or enters them in the cash register; owner on site | Peak-hour errors, owner is the system, no customer data | QR menu + ordering, KDS, simple analytics, menu availability | Faster table turns at peak, upsell prompts, repeat-guest offers | Fewer remakes, less paper, less owner time | "A guest orders from table 7 and it appears in the kitchen, correctly, in seconds" |
| **Premium restaurant** | Reservations by phone/Instagram, sommelier/upsell, VIP guests | Lost reservation messages, no guest memory, brand experience ends at the door | Premium website, reservations book with guest notes/occasions, CRM, private dining requests | Higher-value bookings, events, VIP retention | Less host time on the phone | "Our website looks like us; the host sees it's Mrs. X's anniversary and her allergy" |
| **Large family restaurant** (150+ seats, multiple halls) | Big parties, weekend peaks, many waiters | Kitchen chaos, slow service in the far hall, forgotten tables | Floor plan by area, station routing, waiter assignment, assistance requests, prep-time analytics | Table turnover, fewer walk-outs | Fewer errors and remakes, staff productivity | "I can see every hall at once and which table has waited too long" |
| **Restaurant inside a hotel** | Breakfast, room service, restaurant for external guests | Room-service orders by phone, charges to room on paper | QR room service (with Hotel OS), station routing, charge-to-room posting | Room-service revenue, external diners | Fewer phone orders, fewer billing disputes | "A guest in room 204 orders from the TV QR, kitchen sees 'Room 204', it lands on the folio" |
| **Multiple dining areas** (hall, terrace, lounge, banquet) | Different menus/hours per area | Bar and kitchen coordination, terrace forgotten | Areas, per-area menus/availability, bar station | Terrace/lounge sales captured | Coordination | "Bar drinks and kitchen food for one table arrive together" |
| **Delivery / takeaway** | Phone orders, delivery platforms | Phone lines busy, wrong addresses, commission | Direct online ordering, pickup times, delivery zones, order-ready notification | Direct orders without marketplace commission | Fewer phone calls | "A customer orders pickup on our site and sees 'ready'" |
| **High seasonal demand** (ski season, holidays) | Temporary staff, peak weekends | Training new staff fast, stock-outs | Onboarding with SOPs/quizzes, stock alerts, purchasing, peak analytics | Capacity at peak | Faster onboarding, less waste | "A new waiter is productive on day one; I'm warned before salmon runs out" |

## 4. Business objectives → mechanisms
| Objective | Mechanism in Restaurant OS | How it will be measured in a pilot |
|---|---|---|
| Capture more direct orders | Branded website ordering, QR menu, account re-order | Share of orders via direct channels |
| Improve table utilisation | Live floor, reservation book, waitlist, table-turn timer | Covers per table per service, turn time |
| Reduce missed inquiries | Reservation requests and assistance requests in one inbox | Unanswered requests, response time |
| Increase repeat customers | Accounts, CRM, loyalty, consented campaigns | Returning-customer share, member orders |
| Promote high-margin dishes | Margin per dish visible; "chef recommends" placement; upsell modifiers | Mix of high-margin items |
| Increase average order value | Modifiers/extras, pairing suggestions from configured rules | AOV by channel |
| Reduce order errors and manual taking | Guest/waiter order goes digitally to the right station | Remakes, staff-reported errors |
| Improve kitchen coordination | Station tickets, timers, expo/bump | Ticket times, late tickets |
| Reduce food waste, control stock | Recipe-based consumption, waste log, counts, alerts | Waste cost, variance |
| Reduce admin work | Purchasing, onboarding, tasks, handovers in one place | Manager hours (self-reported) |
| Management visibility | Owner overview, profitability, operations, team, customers | Usage by owner |

All outcome numbers in sales material are **projections with stated assumptions**, never guarantees (existing ROI-calculator rule).

## 5. Product principles
1. **Truthful states.** Cart ≠ submitted ≠ accepted. Reservation request ≠ confirmed. Simulated ≠ sent. Gross profit ≠ net profit.
2. **Coexistence first.** Never require replacing the POS or fiscal register to get value.
3. **Each role sees its job.** Permissions decide navigation and data, not just buttons.
4. **Data the restaurant owns.** Customer data is the restaurant's; exportable; consent-based.
5. **AI only on verified data.** Allergens and prices come from the restaurant's configuration or a human.
6. **Premium for guests, fast for staff, clear for owners.**
7. **Ready for groups, simple for one restaurant.** Multi-location in the data model; single-location UI until a customer needs more.

## 6. Product family fit
| Layer | Shared across RISEUP OS products | Restaurant-specific |
|---|---|---|
| Foundation | Event/sync kernel, auth & permissions concept, design system, notifications/outbox, analytics conventions, assistant contract, workforce (staff, training, SOPs, messaging) | — |
| Vertical | — | Menu, recipes, stations/KDS, tables/floor, table sessions, reservations, stock & purchasing, restaurant analytics |
| Bridges | Hotel ↔ Restaurant room service and folio posting; shared person/loyalty at organization level (future) | — |

## 7. Commercial packaging (aligned with existing offers, prices unchanged)
`RESTAURANT_SALES_OFFER.md` already defines **Starter / Growth / Advanced**. This blueprint maps modules to them; it does not change approved prices.

| Package | Modules |
|---|---|
| Starter "QR Menu & Orders" | Website/menu, QR ordering, order inbox, availability, reservations requests |
| Growth "Kitchen & Control" | + KDS stations, floor plan, waiter app, menu management, sales analytics, staff tasks/onboarding |
| Advanced "Margin & Repeat Guests" | + inventory, recipes & food cost, purchasing, CRM, loyalty, campaigns, owner profitability, integrations |
| Enterprise (future) | + multi-location, brand-level menus, group analytics, Hotel OS bridge, custom integrations |

## 8. What success looks like
- **Demo:** an established restaurant owner says "this is how my restaurant actually works" and agrees to a paid pilot.
- **Pilot (30 days):** staff use it daily on real orders; agreed metrics (`COMMERCIAL_OFFERS.md` success criteria) are measured against a Day-0 baseline.
- **Commercial:** at least one restaurant on Growth or Advanced, one hotel restaurant connected to Hotel OS.
