# RISEUP Restaurant OS: User Journeys, Workflows and Automation Map

**Status:** Phase 1 blueprint, for approval. **Date:** 2026-11-27.
**Demo restaurant (fictional):** **Summit Table**, Tsaghkadzor. Mountain fine-casual restaurant, 140 seats in five areas: Main hall (16 tables), Fireplace lounge (6), Terrace (8, seasonal), Private room (1 × 14 seats), Bar (8 seats). Stations: Hot, Grill (khorovats), Cold, Pastry, Bar. All people, phone numbers (`+374 00 …`) and e-mails (`@example.com`) are fictional. Name to be checked against real businesses before printing materials.

Notation: **[A]** works in the demo · **[B]** simulated and labelled · **[C]** needs a production integration.

---

## 1. Users and what each one needs
| User | Device | "My job in one sentence" | Sees | Never sees |
|---|---|---|---|---|
| Owner | Laptop / phone | Know if the business is healthy and what to change | Everything incl. finance, margin, CRM export | — |
| General / restaurant manager | Laptop / tablet | Run today's service and the week | Overview, orders, floor, menu, inventory, team, analytics (finance per setting) | CRM export, integration secrets |
| Finance manager | Laptop | Reconcile and report | Sales, costs, margin, exports, purchasing | Guest notes, kitchen screens |
| Host | Tablet at the door | Seat the right party at the right table | Reservations, waitlist, floor, guest notes/VIP | Sales, costs |
| Head waiter | Phone / tablet | Keep the floor moving | Floor, all tables, orders, requests, sections | Costs, finance |
| Waiter | Phone | Serve my tables | My tables, orders, requests, menu, guest notes for my tables | Other sections' details, costs, finance |
| Cashier | Counter screen | Settle bills on the existing register | Orders to settle, takeaway pickup | Costs, CRM |
| Kitchen manager / chef | KDS + tablet | Cook correctly and on time; control cost | All stations, expo, prep analytics, recipes, stock, waste | Finance, CRM |
| Kitchen employee | KDS | Cook my station's tickets | My station's tickets, recipes card | Prices, sales, customers |
| Bartender | KDS (bar) | Make the bar tickets | Bar tickets, bar stock | Kitchen, finance |
| Stock / purchasing manager | Tablet / laptop | Never run out, never over-buy | Ingredients, stock, suppliers, POs, receiving | Customers, sales detail |
| Delivery employee | Phone | Deliver my orders | Assigned deliveries (address, phone masked after delivery) | Everything else |
| Customer | Phone | Eat well, easily | Website, menu, cart, my orders, my reservations, my account | Anything internal |

---

## 2. Customer journeys

### 2.1 Discover and book (website)
1. Opens `summit-table.example/hy` from Instagram bio or Google. **[A]** (demo URL)
2. Hero film-still with slow reveal, story ("Fire, lavash and the mountain"), signature dishes, atmosphere gallery, events. **[A]**
3. Taps **Book a table** → date, time, party size, area preference (Fireplace lounge), occasion (Anniversary), requests ("window, one guest gluten-free"). **[A]**
4. Sees **"Request sent · not confirmed yet. We'll confirm shortly."** Never "Confirmed". **[A]**
5. Host confirms → status page shows **Confirmed**, with a "add to calendar" file. **[A]** Message to the guest: **[B]** (outbox, "Simulation · not sent").
6. Day before: reminder **[B]**. Guest can modify/cancel until the configured cut-off (default 3 h) **[A]**.

### 2.2 Order at the table (QR) — Demo Scenario A
1. Scans the QR on table 7 → `/q/a/t7-k3f9` → menu opens with **"Table 7 · Main hall"**. **[A]** No app, no login.
2. Browses categories, searches "khorovats", opens a dish: photo, description, ingredients, allergens if entered, sizes. **[A]**
3. Customises: *Pork & chicken khorovats, large, + grilled vegetables, no onion*. Adds note. **[A]**
4. Cart (on the device only) → review → **Send to the restaurant**. **[A]**
5. Status: **Sent · waiting for the restaurant** → **Accepted** (waiter/manager accepted) → **Preparing** (first station started) → **Ready** (all stations ready) → **Served**. **[A]**
6. Wants more wine → **Order more** adds a new round to the same table session. **[A]**
7. Taps **Call waiter** or **Request the bill** → waiter's phone shows the request with table and time. **[A]** The bill is paid on the restaurant's existing POS/terminal **[outside the system]**.
8. After the visit: feedback prompt (if the guest left a contact and consented) **[B]**; on-page feedback **[A]**.

### 2.3 Online takeaway — Demo Scenario B
1. Website → **Order** → chooses **Takeaway**, pickup **19:30** (slots from configured lead time + current kitchen load). **[A]**
2. Minimum order and service fee shown from settings. **[A]**
3. Enters name + phone (or is signed in). Submits. **"Sent · waiting for the restaurant to accept"**. **[A]**
4. Manager accepts → kitchen tickets → **Ready for pickup** (with pickup code). **[A]** SMS/WhatsApp "ready": **[B]**.
5. Cashier marks **Picked up** → **Completed**. Points credited if a member. **[A]**
6. Payment: on pickup at the existing register **[outside]**; online payment **[C]**.

### 2.4 Delivery (where offered)
Address + district from the configured delivery-zone list → fee and minimum per zone → same lifecycle with **Out for delivery → Delivered** set by the delivery employee. **[A]** No courier GPS **[X]**.

### 2.5 Account and loyalty
Register (name, e-mail/phone, birthday optional, **separate marketing consent**) **[A, demo auth]** → welcome points → account: orders, re-order, favourites, addresses, reservations, tier progress, vouchers, offers. Redeem a voucher in the cart (reserved at submission, used at acceptance, released on reject/cancel). **[A]**

### 2.6 Ask the assistant
"Do you have something vegetarian without nuts?" → assistant filters dishes **by entered tags and allergens only** and adds: "Allergen information is provided by the restaurant. If you have a severe allergy, please tell your waiter." For "is it 100% nut-free?" → "I can't confirm that. I've asked a staff member to help you." → hand-off to the waiter/manager. **[A, scripted]**

### 2.7 Hotel guest room service (future, with Hotel OS)
Room QR → hotel site **Dining** → verify stay (last name + booking code) → order → kitchen ticket "Room 204" → delivered → **posted to room bill** **[B in demo phase R9; C in production]**.

---

## 3. Waiter workflows (`/r/floor`, phone)
| Moment | Steps | Result |
|---|---|---|
| Start of shift | Opens app → sees section (tables 1–8), handover notes, today's VIP/allergy notes | Knows the floor |
| Seat a walk-in | Taps table → **Open** → party size | Table "Seated" |
| Take an order | Table → **Add items** (same menu, faster layout: search, frequent items, modifiers, seat numbers optional, course) → **Send** | Tickets at stations; auto-accepted (staff source) |
| QR order arrives | Push-style banner + table badge → review → **Accept** (or call guest if unclear) | Guest sees Accepted |
| Guest requests | "T7 · Bill requested · 1 min" → **On my way** → **Done** | Request closed, response time recorded |
| Food ready | "T7 · Mains ready at Grill" → pick up → **Served** | Order status served |
| Void / remake | Item → **Void** with reason (permission check; after cooking becomes waste) | Audit + stock |
| Close | Bill summary for the POS → **Settled on POS** → table **Cleaning** → **Available** | Turn time recorded |

## 4. Kitchen workflows (`/r/kds`)
| Moment | Steps | Result |
|---|---|---|
| New ticket | Appears at the station with a soft pulse; allergens in a red band; notes highlighted | — |
| Start | Tap ticket → **Start** | Order becomes "Preparing" for the guest |
| Ready | Tap → **Ready** | Expo / waiter notified; when all stations are ready the order is "Ready" |
| Bump | Expo bumps after pick-up | Ticket leaves the screen; recall possible for 5 min |
| All-day view | Toggle shows totals per item across open tickets | Batch cooking |
| Running out | **Sold out** on an item (permission: chef/KM) | Disappears from QR/website/waiter immediately |
| Late | Timer turns amber/red at configured thresholds | Manager overview shows "late tickets" |
| End of service | Waste entries (reason, qty) | Stock + waste cost |

## 5. Host workflows (`/r/host`, tablet)
Today's book (timeline by area) → new requests to confirm/decline/propose another time → seat arriving party (suggested table by size/area/turn rules) → waitlist with quoted wait → no-show after the grace period (default 20 min) → guest history and notes visible before seating.

## 6. Manager workflows (`/r/admin`)
| Workflow | Steps |
|---|---|
| Live service | Overview → late tickets → open table drawer → reassign waiter / call kitchen |
| Menu control | Menu → item → availability / price / new seasonal dish → visible everywhere instantly |
| Food cost — **Demo Scenario C** | Inventory → *Pork neck* (stock 18.4 kg, price 3,400 ֏/kg, supplier "Ararat Meat (fictional)") → **Used in** → *Pork & chicken khorovats* recipe (lines, yield 72%, cost 2,610 ֏, price 8,900 ֏ incl. VAT → 7,417 ֏ ex-VAT, GP 4,807 ֏, GM 64.8%) → update purchase price to 4,100 ֏ (new supplier invoice) → recalculation across 4 recipes with before/after → recipe cost rises to ≈ 3,108 ֏, GM falls to 58.1% → suggestion: "price +1,500 ֏ (to 10,400 ֏) restores ≈ 64%" or "review portion size". Figures are illustrative; exact seed values are set in implementation and tested |
| Purchasing | Alerts → suggested order (par − on hand − on order) → PO → receive (partial) → stock and price history updated |
| Reservations | Book → confirm requests → allocate tables → see no-show history |
| Team | Shifts for the week → tasks → onboarding approvals → messages |
| End of day | Daily summary: sales by channel, top dishes, cancellations/voids with reasons, waste, late tickets |

## 7. Owner workflows
### 7.1 Morning overview — **Demo Scenario F**
1. Overview: yesterday's sales, orders, AOV, covers vs last week same day. **[A]**
2. Channels: dine-in waiter / QR / website takeaway / delivery / room service (if hotel) with share and trend. **[A]**
3. Best sellers and **menu engineering matrix** (stars, plowhorses, puzzles, dogs). **[A]**
4. Food-cost problems: items whose margin dropped after ingredient price changes. **[A]**
5. Inventory alerts: 3 below minimum, 2 expiring. **[A]**
6. Team: overdue tasks, onboarding progress, shift coverage gaps. **[A]**
7. **Opportunities** (insight cards, each with "Why we think this" listing the data): "Terrace QR orders have the highest AOV — enable QR on Fireplace lounge"; "Dessert attach rate 11% — suggest pairing"; "Saturday 20:00–21:00 tickets late 38% — add one grill cook". **[A]** Projections labelled.
8. Asks the business assistant: "Which dishes made the most gross profit last week?" → answer with a table and a link to the report. **[A, canned questions]**

### 7.2 Customer retention — **Demo Scenario D**
1. CRM → segments: **Returning** (≥ 2 visits in 90 days), **Inactive members** (no visit 45+ days). **[A]**
2. Creates offer "Fireside return: 15% off mains, Mon–Thu, valid 30 days". **[A]**
3. Eligibility: inactive members, marketing consent = yes, not used in the last 90 days, one per customer. **[A]**
4. Sees audience: 63 customers (of 81 inactive; 18 excluded: no consent). **[A]**
5. Preview per channel; **Simulate campaign** → outbox entries labelled "Simulation · not sent". **[B]**
6. "Sample results" view: a clearly labelled **simulated** projection using the stated assumption (e.g., 8–12% redemption), never shown as real. **[B]** Real redemptions in the demo only come from vouchers actually used in the session **[A]**.

## 8. Employee workflow — **Demo Scenario E**
1. Manager → Team → **New employee** "Lilit (fictional), Waiter, Service, supervisor: head waiter". **[A]** Invitation message **[B]**.
2. Switch to Lilit on a phone (`/r/me`, demo role picker) → welcome page, responsibilities, "Waiter onboarding" (lessons, checklist, 4-question quiz ≥ 70%). **[A]**
3. Submits → supervisor reviews → approved. **[A]**
4. Manager assigns task "Polish wine glasses for the Private room, 17:30, high". **[A]**
5. Lilit asks in the task thread: "Which glasses, Areni or champagne?" Head waiter answers. **[A]**
6. Lilit marks **Done** → manager sees it on the team board and in team analytics. **[A]**

---

## 9. Automation map
Every automation runs inside the deterministic reducer, can be switched off, and shows run counts. "Message" actions write to the outbox as **simulated** until a provider is connected and verified.

| # | Trigger | Conditions | Actions | Responsible | Business value | Failure handling |
|---|---|---|---|---|---|---|
| O-1 | `order.submit` | Any channel | Create order (status submitted); if channel auto-accept rule on → accept; else notify waiter (dine-in) / manager (online) | Service | No missed orders | If no staff online for the area for 3 min → escalate to manager; guest still sees "waiting" |
| O-2 | `order.accept` | Items available | Split into station tickets; deduct stock (idempotent); reserve→use voucher; update guest status | Kitchen | Right station, accurate stock | Item became unavailable → reject that item with reason; guest sees partial acceptance |
| O-3 | All tickets of an order ready | — | Order → Ready; notify waiter (dine-in) / customer (takeaway) **[B for external]** | Service | Hot food served hot | Ready not picked up in 5 min → reminder to head waiter |
| O-4 | `order.cancel` / `order.itemVoid` | Before ticket started | Reverse stock; release voucher; notify station | Service | Accurate stock | — |
| O-5 | `order.cancel` / `order.itemVoid` | After ticket started | Waste movement with reason; manager notified; audit entry | Kitchen | Waste visibility | Requires permission; otherwise rejected |
| O-6 | Ticket age > threshold | Station thresholds | Ticket amber/red; "late" counter; manager alert at red | Kitchen | Fewer late tickets | — |
| O-7 | `order.complete` | Member, eligible channel | Earn points (`earn:{orderId}` once); update CRM stats; schedule feedback request **[B]** | Growth | Retention | Refund later → claw-back entry |
| R-1 | `reservation.request` | — | Notify host; guest sees "request sent" | Host | No lost bookings | Unanswered 30 min in opening hours → manager |
| R-2 | `reservation.confirm` | — | Guest notified **[B]**; table pre-assigned if chosen | Host | Fewer no-shows | — |
| R-3 | Reservation start − 24 h / − 3 h | Confirmed, consent for service messages | Reminder **[B]** | Host | Fewer no-shows | Provider failure → host task "call guest" |
| R-4 | Start + grace (20 min) | Not seated | Mark no-show (host confirms); guest history updated | Host | Policy data | Host can undo within 1 h |
| T-1 | `table.request` (waiter/bill/help) | — | Notify the table's waiter; head waiter if unacknowledged 2 min | Service | Faster service | — |
| T-2 | `table.close` | — | Table → Cleaning; turn time recorded | Service | Utilisation data | — |
| I-1 | On-hand < minimum | — | Alert stock manager; add to suggested PO | Stock | Fewer stock-outs | — |
| I-2 | Expiry ≤ 2 days | Batch with expiry | Alert chef; suggest "use first" special | Kitchen | Less waste | — |
| I-3 | `po.receive` | — | Stock in; price history; if price change > 5% → recalc recipes + manager alert | Stock / RM | Margin protection | Partial receipt keeps PO open |
| I-4 | On-hand ≤ 0 for a recipe's required ingredient | Item uses it | Suggest sold-out (chef confirms) | Kitchen | No orders for impossible dishes | Auto sold-out is opt-in |
| C-1 | `customer.register` | — | CRM profile; welcome points; welcome offer if consent **[B]** | Growth | Acquisition | Duplicate phone/e-mail → merge prompt, not a second profile |
| C-2 | Member inactive 45 days | Consent, not targeted in 30 days | Add to "inactive" segment; eligible for retention offer | Growth | Win-back | — |
| C-3 | Birthday in 7 days | Birthday on file, consent | Birthday voucher (one per year) **[B for message]** | Growth | Visits | Year key prevents duplicates |
| C-4 | Feedback ≤ 3 | — | Manager task "call guest" | RM | Recovery | — |
| E-1 | `employee.create` | — | Enrol in role onboarding; DM from supervisor; tasks "first day checklist" | RM | Faster ramp-up | — |
| E-2 | Task overdue | — | Notify supervisor | RM | Accountability | — |
| E-3 | Shift start | Employee on shift | Workspace shows section, tasks, handover | All | Clarity | — |
| E-4 | Handover posted | — | Pinned in department channel for the next shift | All | Continuity | — |
| H-1 | Hotel room-service order (future) | Stay verified | Order with room context; on completion post to folio **[B/C]** | Service | Room-service revenue | Stay not verified → order rejected with reason |
