# RISEUP Business OS: Product Vision (Hotel OS · Restaurant OS)

Status: **Phase 1 blueprint. Not yet approved for implementation** (2026-11-27).

Related: `PRODUCT_FEATURES.md` · `TECHNICAL_ARCHITECTURE.md` · `DEMO_UX_FLOWS.md` · `MVP_ROADMAP.md` · `COMMERCIAL_OFFERS.md` · `SALES_DEMO_SCRIPT.md` · `IMPLEMENTATION_BACKLOG.md`

## 1. Vision in one sentence
> **RISEUP Business OS helps hotels and restaurants in Armenia answer every guest instantly, take direct bookings and orders, and run daily operations from one simple screen, starting in Tsaghkadzor.**

Two vertical products share one technical foundation:

| Product | For | Core promise |
|---|---|---|
| **RISEUP Hotel OS** | Hotels, resorts, guesthouses, cottages | "Every inquiry answered, even at 23:30. More direct bookings, fewer missed guests, a clear view of every room." |
| **RISEUP Restaurant OS** | Restaurants, cafés, bistros | "Guests order from their phone, the kitchen sees it instantly, and you see what sells." |

**Not a generic dashboard.** Each product has its own customer-facing site, workflows, vocabulary and visual identity. They share only invisible parts:
- Accounts, permissions and tenancy
- The assistant engine
- The notification/automation layer
- Analytics components
- The design-system primitives

## 2. Why Tsaghkadzor first
- **A dense hospitality cluster.** Older municipal figures (2016) cited about 43 hotels plus about 10 guesthouses. Booking.com currently lists about 84 properties of all types. Both counts need local verification.
- **Seasonal pressure.** Winter (the ski season) is the main season, and it is starting now. Inquiry spikes, staff shortages and weekend peaks make missed inquiries costly.
- **Owners can be visited in person.** The sales motion is an in-person, 3–5 minute demo.
- **Restaurants and cafés serve the same visitors.** One trip can cover both verticals.
- **RISEUP has relevant proof:**
  - The HosDog/Bistro ordering system with dashboard and printer. It may be shown only with the owner's permission.
  - The AI administrator built on n8n + ManyChat.
  - The Lead-to-Booking demo.

## 3. Target customers
| Segment | Typical size | Pain we see first (to validate) | Entry offer |
|---|---|---|---|
| Hotels / resorts (20–150 rooms) | Reception team, manager, owner | Inquiries across phone, Instagram, WhatsApp and Booking.com. OTA commissions. No single view of requests. Housekeeping coordination by phone | Hotel Growth |
| Guesthouses / cottages (2–15 units) | Owner-run, often family | Owner answers everything personally, late at night. Double-booking risk across Airbnb/Booking. No website or an outdated one | Hotel Starter |
| Restaurants | 30–150 seats | Peak-hour chaos, waiters writing orders, mistakes between hall and kitchen, no data on what sells | Restaurant Growth |
| Cafés / bistros | 10–40 seats | Slow service at peaks, menu changes, takeaway/pickup by phone | Restaurant Starter |

## 4. Problems we solve (business language)
| Outcome the owner wants | Hotel OS mechanism | Restaurant OS mechanism |
|---|---|---|
| More direct reservations/orders | Own multilingual website + inquiry form + assistant (less dependence on OTAs) | QR menu + online ordering + pickup/delivery |
| More customers from Google/social | Google Business Profile links, Instagram/WhatsApp entry points, fast pages | Same, plus food content linked to ordering |
| Faster replies | 24/7 assistant answers from approved data, then hands off to staff | Assistant answers menu questions and takes reservations |
| Fewer missed leads | Every inquiry lands in one inbox with a status and an owner | Every order is visible from "new" to "completed" |
| Less admin work | Templates for confirmation, pre-arrival and feedback; auto-generated housekeeping tasks | No re-typing orders; KDS replaces shouting and paper tickets |
| Staff coordination | Housekeeping/maintenance board | Kitchen display, table status |
| Control over revenue | Occupancy, ADR, RevPAR, source mix, cancellations | Daily sales, best sellers, average order value, estimated food cost |
| Repeat customers | Guest history, post-stay feedback, return offers | Customer list, repeat identification, simple loyalty |
| Better marketing content | Optional: room and season reels | Optional: food reels linked to the QR menu/ordering |

## 5. Value propositions by segment
- **Hotel (20+ rooms):**
  - "See every booking request from every channel in one place, answer in minutes, and know tonight's occupancy and revenue without asking anyone."
- **Guesthouse / cottage:**
  - "A beautiful site in three languages and an assistant that answers guests while you sleep.
  - You confirm with one tap, and the guest gets the details automatically."
- **Restaurant:**
  - "Orders go from the guest's phone or the waiter's tablet straight to the kitchen screen, with no lost tickets.
  - You see what sells and what it costs you."
- **Café / bistro:**
  - "A QR menu that's always up to date in three languages, with pickup orders that don't need a phone call."

## 6. Principles (non-negotiable)
1. **Sell outcomes, demonstrate workflows, never promise ROI.**
   - Every financial figure is either clearly labelled demo data or calculated from the owner's own inputs.
2. **An inquiry is not a booking. A submitted order is not an accepted order.**
   - Only a staff action confirms.
   - The assistant can never confirm availability, prices it doesn't have, or a booking.
3. **Simulated means labelled.**
   - The demo never pretends a WhatsApp, Telegram or email message was sent unless the integration is actually connected.
4. **Small first.** Build what helps an owner understand the value in 3–5 minutes, then what one pilot client needs. Build SaaS breadth only after paying pilots.
5. **Work alongside existing tools.**
   - We don't replace fiscal cash registers (e-HDM), POS terminals or OTA contracts in the first versions.
   - We connect to them, or sit next to them.
6. **Fictional demo businesses.** Demo brands are invented; we never imitate a real hotel or restaurant.

## 7. What success looks like
| Horizon | Measure |
|---|---|
| Level 1 demo (weeks) | In ≥ 70% of demo meetings the owner asks a "how much / when" question. ≥ 3 paid pilots from the first 20 demos (targets to validate, not forecasts) |
| Level 2 pilot (1–2 months) | One hotel and one restaurant use it daily for 30 days. Measured response times, captured inquiries/orders, staff feedback |
| Level 3 product (6+ months) | Repeatable onboarding in ≤ 5 days per client, monthly recurring revenue, retention after 3 months |

## 8. Business value by module
All time and money effects below are **hypotheses to validate in discovery and pilots**, never promises. They become claims only after the pilot measures a baseline and a change.

| Module | Problem | Done manually today (typical, validate) | How the system improves it | Revenue effect | Cost effect | Staff time (hypothesis) | Owner's metrics | Validate before claiming |
|---|---|---|---|---|---|---|---|---|
| Hotel website + request form | Guests can't book direct easily; reliance on OTAs | Phone/Instagram DMs, Booking.com | 24/7 direct request path in hy/ru/en | More direct bookings | Less OTA commission on shifted bookings | — | Direct share, requests/week | Share of guests who would book direct; commission rate |
| Hotel assistant | Night/weekend messages wait hours | Owner/reception answer personally, late | Instant answers from approved data; captures the request; hands off | Fewer lost inquiries | Fewer late-night hours | Routine questions: minutes per message × messages/day | First-response time, captured requests, handoff rate | How many inquiries arrive off-hours; how many are lost today |
| Reservations inbox + calendar | Requests scattered across personal phones; double-booking risk | Notebook / Excel / memory | One list with status and owner; overlap warning | Fewer lost/duplicate bookings | Fewer compensation costs | Searching/reconciling time | Open requests, conversion, response time | Current double-booking frequency |
| Automated guest messages | Same texts typed for every guest; forgotten feedback requests | Manual WhatsApp messages | Templates sent on events after staff approval | More reviews and return stays | — | ~2–5 min per message (validate) | Messages sent, review count, return guests | Channel deliverability; guest preferences |
| Housekeeping board | Calls between reception and cleaners; rooms ready late | Phone calls, paper lists | Tasks created at checkout; live room status | Earlier check-ins possible | Less overtime | Coordination calls per day | Time from checkout to clean | Current process and pain |
| Hotel analytics | Owner lacks a timely view | Monthly accountant reports | Daily occupancy, ADR, RevPAR, source mix | Better pricing/channel decisions | — | Report-making time | Occupancy, ADR, RevPAR, direct % | Data completeness (all bookings entered) |
| Restaurant QR menu + ordering | Slow ordering at peaks; outdated printed menus | Waiter takes orders; reprints | Guests browse and order; staff accepts | Faster table turns at peaks; possibly larger orders (photos) | Fewer reprints | Waiter trips per order | QR order share, ticket time | Guest acceptance of QR ordering in this venue |
| Orders + KDS | Lost/misread tickets, unclear order sequence | Paper tickets, shouting | Ordered queue with notes and timers | Fewer remakes, faster service | Less food waste from errors | Coordination time | Ticket time, late tickets, errors | Current error rate |
| Tables + reservations | Overbooked evenings, no-shows | Paper book / phone | Visible status; reminders | Fewer empty tables | — | Phone time | Covers, no-show rate | Reservation volume |
| Food cost | Unknown dish profitability | Rarely calculated | Recipe × ingredient cost → margin per dish | Push high-margin dishes | Spot loss-making items | Calculation time | Food cost %, margin per dish | Accurate recipes and purchase prices |
| CRM + loyalty | Regulars not recognised | Memory | Customer list, repeat flag, points | More repeat visits | — | — | Repeat share, visit frequency | Consent and willingness to share phone |
| Restaurant analytics | No daily numbers | Cash register Z-report only | Sales, AOV, best sellers, peak hours | Better menu/staffing decisions | Staff scheduling to peaks | Report time | Daily sales, AOV, peaks | Orders must flow through the system |

**Example workflows (not guaranteed outcomes):**
- **Hotel, 23:30:** a guest asks about a family room for 12–14 January.
  - Without automation, the reply comes the next morning, and the guest may already have booked elsewhere.
  - With the assistant, the guest sees room types and prices from the hotel's rates instantly and leaves a request.
  - At 09:00 reception approves; the confirmation is sent; the pre-arrival message is scheduled.
- **Restaurant, 13:10 (peak):** table 7 scans the QR and orders with the note "no onions".
  - The order appears on the kitchen screen within seconds, with the note and a timer.
  - The waiter brings the food when it's marked "Ready".
  - The manager sees the day's sales and the slowest tickets.

