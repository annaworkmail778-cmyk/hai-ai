# RISEUP Business OS: Lean Sales Demo Scope (Phase 1.5)

**Status:** proposal for approval (2026-11-27). No code until it's approved.
- **Supersedes** the Level 1 scope and estimates in `MVP_ROADMAP.md` and `IMPLEMENTATION_BACKLOG.md` for the first demo. The architecture direction in `TECHNICAL_ARCHITECTURE.md` stays.
- **Goal:** win the first paying hotel and restaurant customers in Tsaghkadzor. The demo exists to start paid pilots, not to be the product.

## 1. Approved direction (unchanged)
- Separate Hotel OS and Restaurant OS.
- A shared technical foundation in a standalone `business-os/` Next.js app.
- Hotel first, restaurant second.
- A presenter mode for in-person meetings.

## 2. Honest effort verdict
| Version | Hours | Verdict |
|---|---|---|
| **Hotel stage** (shared core + hotel, deployed, device-tested) | **≈ 24 h** | ✅ Within the 20–30 h target |
| **Restaurant stage** (on top of the hotel stage) | **≈ 11 h** | |
| **Combined demo, all requirements below** | **≈ 35 h (range 30–40)** | ⚠ **Exceeds 20–30 h by about 5–10 h** |

**Why the combined demo can't honestly fit in 20–30 h:** three requirements add real hours that can't be faked.
1. **The customer's own phone, with a printed QR.** Their phone and our laptop are different devices, so a small shared session store is needed (≈ 3 h, plus a local fallback).
2. **Two distinct premium visual identities plus customer pages in hy/ru/en** (≈ 3–4 h of design and copy beyond a generic template).
3. **Device testing:** iPhone, Android, laptop and a printed QR (≈ 2 h). A demo that fails in front of an owner costs more than the hours saved.

**What would bring it to about 28 h** (not recommended):
- Drop the English customer copy (−0.75 h).
- Merge the restaurant metrics into the orders page (−0.5 h).
- Drop the guest detail panel on the calendar (−0.5 h).
- Halve device QA (−1 h, risky).
- Or drop cross-device sync (−3 h). That breaks the "scan the printed QR with your phone" requirement.

**Recommendation:** approve ≈ 35 h in two stages.
- The **hotel demo ships at ≈ 24 h**, so visits can start.
- **Restaurant work starts only after ≥ 3 discovery interviews with restaurant owners confirm the pain.** That validates demand before the remaining hours are spent.

## 3. In scope: hotel demo ("Pine Ridge Hotel · Tsaghkadzor", fictional)
| Side | Feature | Lean version |
|---|---|---|
| Customer | Premium hotel website | One-page home (hero, highlights, room types, location card, messenger buttons) + room detail page. Warm, calm hotel identity. hy/ru/en |
| Customer | Rooms and room details | 3 room types, 12 rooms. Photos, capacity, amenities, "from" price from the rate table |
| Customer | Reservation inquiry form | Dates, guests, name, phone, note. Success page: **"Request received, not yet confirmed"** |
| Customer | Scripted AI guest assistant | Chat widget with quick replies. Room types, price for dates (from the rate table), check-in/out, location/transport. Collects the inquiry; hands off anything else |
| Customer | Mobile-responsive | Designed at 375 px first |
| Admin | Dashboard with sample metrics | 4 KPI cards (tonight's occupancy, ADR, month revenue, direct share) + 1 bar chart. "Demo data" badge |
| Admin | Inquiry inbox | New inquiries with source (website/assistant), waiting time, assistant transcript. **Approve / Decline** |
| Admin | Room calendar | 12 rooms × 10 days. Inquiry (hatched) vs confirmed (solid). Click opens the reservation |
| Admin | Guest details | Panel: contact, dates, guests, requests, history (demo) |
| Admin | Basic housekeeping | Task list with statuses To do → In progress → Done. **Approving a reservation creates "Prepare room N before arrival"** |
| Shared | Simulated communications | Feed: "Confirmation to guest: SIMULATED, not sent", "Telegram alert to reception: SIMULATED" |

**Key scenario (must work end-to-end, across devices):**
1. The guest asks the assistant a question on **their phone**.
2. The assistant answers from the data.
3. The guest submits an inquiry.
4. It appears in the **laptop** inbox within ~2 s.
5. Staff reviews and approves it, and assigns a room.
6. The status becomes Confirmed on the calendar.
7. The housekeeping task appears, and the simulated confirmation shows in the feed.

## 4. In scope: restaurant demo ("Ember & Lavash · Bistro", fictional)
| Side | Feature | Lean version |
|---|---|---|
| Customer | Premium restaurant website | One-page home (hero, hours, featured dishes, location, "Order" / "Book a table"). Bold, appetising identity. hy/ru/en |
| Customer | Mobile QR menu | `…/menu?t=7`: sticky category tabs, dish cards with photo, description, price, sold-out state |
| Customer | Categories and photos | 5 categories, about 20 dishes |
| Customer | Shopping cart + order submission | Quantity, note per order, dine-in (table from the QR) or pickup. After sending: **"Sent, waiting for the restaurant to accept"**, then live status |
| Customer | Table reservation inquiry | Date, time, guests, name, phone. **"Request sent, not yet confirmed"** |
| Admin | Order dashboard | Live list, new orders highlighted, Accept / Reject, detail |
| Admin | Kitchen display | Columns New / Preparing / Ready; ticket with table, items, note, age timer (green/amber/red); one-tap status change; full-screen |
| Admin | Order status updates | Status changes reflect on the guest's phone |
| Admin | Menu management | Sold-out toggle and price edit; the QR menu updates |
| Admin | Basic sales metrics | Today's sales, orders, average order value, top 5 dishes (demo data) |

**Key scenario:**
1. The customer scans the **printed QR** with **their own phone**.
2. They pick dishes and submit the order.
3. The order appears in the laptop's order dashboard **and** on the kitchen screen within ~2 s.
4. Staff accepts it, then moves it to Preparing and Ready.
5. The guest's phone shows each status.

## 5. Shared foundation (reused by both, nothing vertical-specific inside)
- **Design system:** tokens (admin = RISEUP brand; hotel theme; restaurant theme), and a small UI kit (button, input, badge, card, KPI card, list row, drawer, tabs, toast).
- **Navigation:** admin shell (sidebar, top bar, "Demo data" badge, **Reset demo**, language), and a presenter launcher.
- **Demo data architecture:** typed seed JSON per vertical → a session store.
- **Session store:**
  - **Live session mode:** a tiny server store keyed by a session code. The phone and the laptop poll every ~1.5 s.
  - **Local mode:** offline. The customer view opens on the same laptop.
- **Notification simulation:** one event → feed component; every item is labelled SIMULATED.
- **Assistant interface:** `AssistantEngine` with a scripted implementation; actions limited to *answer*, *collect field*, *create inquiry*, *hand off*. Ready for an LLM later. The hotel uses it in the lean demo; restaurant intents are deferred.
- **Guided presenter mode (lean):**
  - A launcher: pick the vertical, see the session code and QR on screen, follow a 6-step checklist ("Next: open the inbox"), and Reset.
  - No animated overlay or auto-play in the lean version.

**Vertical separation:** hotel and restaurant have separate routes, seed data, screens and themes. The only shared screens are the shell, the feed and the launcher.

## 6. Physical sales setup
| Need | Solution |
|---|---|
| Our laptop | Launcher → admin view. Kitchen screen in a second window |
| Customer's phone | Scans the printed QR → customer site/menu tied to our presenter session |
| Printed QR on a business card | One card per presenter (A, B) with two QR codes: **Hotel** and **Restaurant (table 7)**. Each encodes a stable path with that presenter's session code |
| Temporary public URL | Netlify temporary URL (`*.netlify.app`) from a separate Netlify site (base directory `business-os`) |
| URL changes later | **Recommended:** the QR points to `riseup-group.com/go/…`, which the main site redirects to the current demo URL, so printed cards survive the move to a subdomain. This needs one small redirect in the main site's Netlify config (**needs your approval**). Without it, print only 10–20 cards until the subdomain exists |
| Reset between customers | **Reset demo** restores the seed for that presenter session in < 2 s. Random later scans only write into a capped demo session (size and rate limits) |
| No internet at the venue | Local mode: the customer view on the same laptop (split window). The phone scenario needs mobile data |

## 7. Honesty rules (visible in the UI)
- A "Demo data: fictional business" badge on every admin screen.
- An inquiry or reservation request is never shown as confirmed until staff approves. An order is "waiting to be accepted" until accepted.
- Messages always show "SIMULATED: not sent".
- The assistant shows a disclosure line and never states a price or availability that isn't in the data.
- Photos are licensed stock (or AI images labelled "illustrative"); no real businesses' photos or names.

## 8. Out of scope for the lean demo (deferred, not forgotten)
| Deferred | When |
|---|---|
| Restaurant assistant, tables floor plan, food cost, CRM/loyalty, ROI calculator, analytics beyond basic metrics | After validation (Level 1 complete) |
| Hotel analytics beyond 4 KPIs, guest CRM, maintenance, automation settings | After validation |
| Animated guided overlay, auto-play, Playwright suite (manual checklist + 1 smoke test instead) | Later |
| Admin in Russian/English (admin is Armenian in the lean demo; customer pages are hy/ru/en) | +1 h if owners need it (**decision**) |
| Real database, logins, Telegram/email sending, LLM, iCal, printers, payments | Level 2 pilot |

## 9. Quality bar (definition of done for the lean demo)
1. Both key scenarios work 10 times in a row, cross-device, on iPhone Safari + Android Chrome + laptop Chrome.
2. Customer pages hit Lighthouse mobile ≥ 85, and the first view is usable on 4G.
3. Reset works. Local mode works offline.
4. No English placeholder text on Armenian screens. Native-speaker check of the hy/ru customer copy by the founders.
5. Two timed dry runs per vertical in ≤ 3 minutes each.
