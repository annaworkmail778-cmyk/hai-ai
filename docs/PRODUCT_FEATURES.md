# RISEUP Business OS: Feature Inventory and Prioritisation

## Legend
**MoSCoW** applies to the **Level 1 sales demo** unless stated:

| Code | Meaning |
|---|---|
| M | Must |
| S | Should |
| C | Could |
| W | Won't now |

**Reality column:**

| Code | Meaning |
|---|---|
| SIM | Simulated in the demo |
| L2 | Real in the pilot |
| L3 | Commercial product only |
| EXT | Requires an external API, paid service, hardware or partner |

## 1. What we learned from established products (patterns, not copies)
| Category (examples) | Workflow pattern worth borrowing | What we deliberately skip |
|---|---|---|
| Hotel PMS (Cloudbeds, Mews, Little Hotelier, Amenitiz) | Tape-chart calendar (rooms × dates). Reservation lifecycle with clear statuses. Arrivals/departures for today. Housekeeping status per room. Source tracking | Full accounting, folios, night audit, rate-plan engines, city-tax modules |
| Booking engines | Search by dates → room types → price → request. Mobile-first | Live payment and instant booking (needs reliable inventory + payment rails) |
| Channel managers (SiteMinder etc.) | One inventory feeding many channels | **Real OTA connectivity:** certification, partnerships and liability. Level 2 can do **iCal import/export** only |
| Guest messaging platforms | Automated pre-arrival/check-in/feedback messages. Unified inbox | WhatsApp at scale (Meta Business verification, paid templates) |
| Restaurant POS (Toast, Square, Lightspeed) | Order lifecycle. Modifiers and notes. Table map. Daily close report | **Payments and fiscal receipts.** In Armenia these go through fiscal registers (e-HDM); we sit beside the POS |
| Kitchen Display Systems | Columns New → Preparing → Ready. Timers. Colour by age. Bump button | Printer/hardware routing (Level 2 option: kitchen printer, as done for HosDog) |
| Ordering platforms | QR menu → cart → order to kitchen. Pickup/delivery choice | Courier dispatch, aggregator integrations |
| CRM / loyalty (Odoo, Square Loyalty) | Customer profile with history. Segments. Points | Complex campaign builders, multi-level tiers |
| Revenue management | Occupancy, ADR, RevPAR, pace | Dynamic pricing algorithms |

**Market insight for small properties:** most systems for properties under ~30 rooms emphasise simplicity (Little Hotelier's stated focus). Our wedge is not "more features than Cloudbeds". It is:
- the local language and market
- in-person setup
- an assistant across Instagram/WhatsApp/Telegram
- automation built by n8n experts

## 2. Shared platform features
| Feature | Demo | Reality | Notes |
|---|---|---|---|
| Trilingual UI and content (hy/ru/en) | **M** | L2 | Customer side in all 3. Admin in hy + en at least |
| Demo data with a **"Demo data"** badge and one-click **Reset demo** | **M** | — | Presenter safety |
| Guided demo mode (step overlay) | **M** | — | 3–5 min scripts |
| Assistant engine (scripted, LLM-ready interface) | **M** | L2 (LLM optional) | See the architecture doc |
| Automation timeline: what would be sent, when and where, labelled "SIMULATED" | **M** | L2 (Telegram, email), L3 (WhatsApp) | Never claims a send |
| ROI calculator with the owner's own inputs | **S** | — | No default "promised" numbers |
| Roles (owner, manager, reception/waiter, housekeeping/kitchen) | S (role switcher in demo) | L2 (real auth + RLS) | |
| Multi-tenant settings (enabled modules per business) | C (config file) | L2/L3 | |
| Audit log | W | L3 | |
| Billing / subscriptions | W | L3 | |

## 3. Hotel OS
| Module / feature | Demo | Reality | Value shown |
|---|---|---|---|
| **5.1 Hotel website:** home, rooms list, room detail (photos, amenities, from-price), availability inquiry (dates, guests), reservation request form, contact, map, Instagram/WhatsApp buttons, hy/ru/en, mobile-first | **M** | L2 | Direct inquiries |
| Map embed (static image + "Open in Google Maps" link in the demo) | **M** | L2 (Maps embed) | No API key needed for a link |
| Instant availability **indication** from demo data | S | L2 (from the own calendar; still an "inquiry") | |
| Online payment / instant booking | **W** | L3 EXT (local acquiring) | |
| **5.2 Reservations:** inbox of inquiries, reservation list with filters, calendar (rooms × 14 days), detail drawer, statuses, source, special requests, manual creation, approve/decline/cancel | **M** | L2 | One place for all requests |
| Today board: arrivals, departures, in-house | **M** | L2 | |
| Overbooking guard (warn when a room/date is taken) | **M** | L2 | |
| iCal sync with Booking.com / Airbnb | W (show as "roadmap") | L2 EXT (iCal) | Reduces double-booking |
| Full channel manager | **W** | L3 EXT (partner) | |
| **5.3 AI guest assistant:** FAQ, room types, prices from configured data, check-in/out times, location/transport, collects inquiry (dates, guests, contact), hands off to staff | **M** (scripted) | L2 (LLM with tools, optional) | 23:30 scenario |
| Assistant on Instagram/WhatsApp/Telegram | W (shown in a phone frame as a concept) | L2 Telegram / Instagram via ManyChat; L3 WhatsApp EXT | |
| **5.4 Staff ops:** housekeeping board (room status dirty/cleaning/clean/inspected), auto task on checkout, maintenance requests, assignment, notes | **M** (board + auto task) / S (maintenance) | L2 | Coordination without calls |
| **5.5 Analytics:** occupancy, ADR, RevPAR, reservations, revenue (from confirmed stays), direct vs OTA share, inquiry → confirmed conversion, cancellations | **M** | L2 | Control |
| Pace / forecast vs last year | C | L3 | |
| **5.6 Automation:** new-inquiry alert to staff, confirmation after approval, pre-arrival, check-in instructions, post-stay feedback, return offer, abandoned-inquiry follow-up | **M** (timeline, SIMULATED) | L2 (Telegram + email via n8n), L3 (WhatsApp templates) | |
| Guest CRM (history, repeat guests, notes) | S | L2 | Repeat stays |
| Upsells (transfer, ski pass help, late checkout) | C | L2 | Extra revenue per stay |
| Reviews: request + link to Google | S (inside the feedback flow) | L2 | Reputation |

## 4. Restaurant OS
| Module / feature | Demo | Reality | Value shown |
|---|---|---|---|
| **6.1 Restaurant website:** home, menu by category, photos, prices, hours, location, table reservation, online order (pickup/delivery), contacts, hy/ru/en | **M** | L2 | Direct orders |
| **6.2 QR menu:** QR code (generated, printable), mobile menu, categories, photos, descriptions, prices, "sold out" status, cart, order submission with table number | **M** | L2 | Fewer waiter trips |
| Modifiers (size, extras) and dish notes | S (notes only) | L2 | |
| **6.3 Order management:** incoming orders, status, table/pickup/delivery, customer details, items, total, notes, history, accept/decline | **M** | L2 | Nothing lost |
| **6.4 KDS:** New / Preparing / Ready / Completed, order time, age timer, colour priority, bump, prep-duration stats | **M** | L2 (tablet/TV) | Calm kitchen |
| Kitchen printer | W | L2 EXT (hardware; HosDog experience) | |
| **6.5 Tables:** table list/simple floor grid, free/occupied/reserved, reservations (time, guests, contact, status) | **M** (list + grid) / S (drag layout) | L2 | |
| **6.6 Inventory (lite):** ingredients with cost, recipe per dish → **estimated food cost % and gross margin per dish**; low-stock flag on a few items | **S** (food cost per dish only) | L2 lite | Profitability insight |
| Stock movements, suppliers, purchase orders, automatic depletion | **W** | L3 | Too complex for the value |
| **6.7 CRM and loyalty:** customer list (from phone/name), order history, average order value, repeat flag, segments (new/regular/lapsed), simple points or "every 10th coffee" | S | L2 | Repeat visits |
| Campaigns (send offer to a segment) | C (SIMULATED) | L2 (Telegram/Instagram), L3 | |
| **6.8 AI restaurant assistant:** menu Q&A from menu data, ingredients/allergens **only if entered**, prices, reservations, order help (adds to cart; staff accepts), pickup/delivery info, forwards special requests | **M** (scripted) | L2 | |
| **6.9 Analytics:** daily/weekly/monthly sales, orders, average order value, best sellers, sales by category, estimated food cost and gross profit, peak hours heatmap, repeat customers share | **M** | L2 | Control |
| Online payment | **W** | L3 EXT (local acquiring) | |
| POS replacement / fiscal receipts | **W** | — (partner/integration only) | Legal and hardware scope |
| Delivery courier management | W | L3 | |

## 5. Hard "won't build" list (and why)
| Item | Reason |
|---|---|
| Channel manager with direct OTA connectivity | Partner certification and liability for overbookings. Weeks of integration. Use iCal or a partner |
| Payment processing | Stripe/PayPal aren't available for an Armenian merchant per earlier research. Local acquiring needs a contract. Not needed to show value |
| Fiscal POS / e-HDM | Regulated, hardware-bound. Integrate later or stay beside it |
| Full accounting, payroll, HR | Out of scope; existing local software |
| Dynamic pricing / revenue algorithms | No data, no credibility at this stage |
| Native mobile apps | Responsive web/PWA is enough |
| Full inventory with purchasing | Low demo value, high build and maintenance cost |
| "AI that books by itself" | Violates our confirmation principle; risky without real inventory |

## 6. Strongest visible value per minute of demo
1. Hotel: **23:30 guest message → instant answer → inquiry appears in the dashboard → staff approves → guest confirmation (simulated) → housekeeping task appears.**
2. Restaurant: **scan QR → order → kitchen screen in seconds → status "Ready" → sales update.**
3. Analytics screens with one sentence each: "Tonight you're 78% full; 41% of bookings were direct, so no commission on those."
4. The ROI calculator using the owner's own numbers.

## 7. Quick to build vs. dependency-heavy
| Quick (existing skills, no paid APIs) | Needs external services / hardware |
|---|---|
| Websites, QR menu, dashboards, KDS, calendars, analytics, scripted assistant, ROI calculator, Telegram bot notifications (free), email (Resend, already used by the site), n8n workflows (existing skill) | WhatsApp Business Platform (Meta verification, per-message pricing for templates), LLM API (usage cost), Google Maps embed/API, iCal sync with OTAs, kitchen printers, local payment acquiring, fiscal registers, Instagram DM automation (ManyChat subscription) |
