# RISEUP Business OS: Commercial Offers (pricing hypotheses)

⚠ **All prices below are hypotheses.** They aren't market-validated and must be tested in the first 10–15 owner conversations.
- They're new products, so they don't change the approved RISEUP prices (`src/config/pricing.ts`, `docs/RISEUP_BUSINESS_LAUNCH/FINAL_PRICING_AND_PAYMENT_TERMS.md`). They're positioned consistently with the approved "Business" tiers (ordering 250–450k ֏, real estate 300–450k ֏).
- **Payment terms (approved):** ≤ 100,000 ֏ paid 100% upfront; projects 50/50; larger builds 40/30/30; monthly fees prepaid.
- **Third-party costs at cost:** WhatsApp/Meta fees, domains, LLM usage above fair use, printers/tablets, ad budgets.
- **Discount:** the contest −20% applies only to eligible participants for orders accepted by 30 Nov 2026.

## 1. Hotels, resorts, guesthouses
| | **Hotel Starter: "Direct Requests"** | **Hotel Growth: "Bookings & Operations"** | **Hotel Advanced: "Full Guest Journey"** |
|---|---|---|---|
| For | Guesthouses, cottages, small hotels | Hotels 15–80 rooms | Resorts / hotels with OTA + direct mix and a larger team |
| Modules | Website hy/ru/en (rooms, prices, photos, map, messengers) · reservation request form → Telegram · website FAQ assistant (scripted, your data) · Google Business Profile links/review link | Starter + reservations inbox & calendar · guest records · staff approval → confirmation · pre-arrival, check-in and feedback messages (Telegram/email via n8n) · housekeeping board · monthly analytics (occupancy, ADR, RevPAR, sources) | Growth + iCal sync with Booking.com/Airbnb · assistant on Instagram/Telegram (WhatsApp optional, fees at cost) · maintenance requests · CRM & return-guest offers · staff roles · quarterly review |
| Problem solved | Guests can't find or reach you directly; night inquiries lost | Requests scattered across phones; slow confirmations; cleaning coordination by calls | Double-booking risk; repeat guests not nurtured; owner lacks control |
| Expected operational benefits (validate) | Every inquiry captured with contact details; instant answers to routine questions | One place for all requests; standard messages sent without typing; rooms ready faster | Fewer manual availability updates; more repeat stays; owner dashboard |
| One-time fee (hypothesis) | **250,000 ֏** (guesthouse lite version: 150,000 ֏) | **550,000 ֏** | **900,000–1,300,000 ֏** (by size) |
| Monthly (hypothesis) | **25,000 ֏** (lite: 15,000) | **50,000 ֏** | **80,000–120,000 ֏** |
| Delivery | 10–14 days | 3–5 weeks | 6–8 weeks |
| Add-ons | AI video, season content pack, Google/Instagram marketing, extra language, ski-season landing page | LLM assistant (usage at cost), iCal (if not in Advanced), WhatsApp templates | Custom reports, integrations on request (hourly) |

## 2. Restaurants, cafés, bistros
| | **Restaurant Starter: "QR Menu & Orders"** | **Restaurant Growth: "Kitchen & Control"** | **Restaurant Advanced: "Grow Repeat Guests"** |
|---|---|---|---|
| For | Cafés, bistros, small restaurants | Restaurants with a kitchen team and peaks | Busy restaurants, multi-location, delivery |
| Modules | QR menu hy/ru/en with photos · sold-out toggle · orders/pickup to Telegram · printable QR cards (printing at cost) · one-page site | Starter + orders dashboard · kitchen display (your tablet/TV) · table reservations · menu manager · AI menu assistant (website) · sales analytics | Growth + customer CRM & loyalty · food cost per dish (recipes entered with you) · delivery zones & order status · campaigns · kitchen printer (hardware at cost) · multi-branch |
| Problem solved | Outdated printed menus; slow ordering at peaks; phone orders mistakes | Lost/misread tickets; no visibility of what sells; reservation chaos | No relationship with regulars; unknown dish profitability |
| Expected benefits (validate) | Fewer waiter trips; menu always correct | Orders straight to kitchen with notes and timers; daily numbers without spreadsheets | More repeat visits; menu decisions based on margin |
| One-time fee (hypothesis) | **150,000 ֏** | **400,000 ֏** | **700,000–1,000,000 ֏** |
| Monthly (hypothesis) | **20,000 ֏** | **40,000 ֏** | **60,000–90,000 ֏** |
| Delivery | 7–10 days | 3–4 weeks | 5–7 weeks |
| Add-ons | Food video/reels, marketing plans, AI video | Kitchen printer, LLM assistant | Custom integrations (POS export), hourly |

**What we don't sell:** POS / fiscal receipts (e-HDM), payment processing, OTA channel manager. We work alongside them.

## 3. Low-risk paid pilot
| Item | Hypothesis |
|---|---|
| Name | **30-day pilot** |
| Scope | Starter scope of the vertical, with the client's **real** rooms/menu, live for 30 days. For hotels: request form + inbox + Telegram alerts. For restaurants: QR menu + orders to Telegram or the orders board |
| Fee | **100,000 ֏, 100% upfront** (matches the approved minimum paid test). Monthly fee waived during the pilot |
| Credit | Pilot fee **credited** against the Growth setup if signed within 14 days of the pilot's end (**needs approval**: it mirrors the approved "paid discovery credited" rule) |
| Success criteria (agreed in writing on Day 0) | Hotel: number of requests captured, median first-response time, staff usage. Restaurant: share of orders via QR, average ticket time, order errors noted by staff |
| End of pilot | Review meeting with the numbers from the system. Continue (Starter/Growth) or stop; the client keeps the exported data |
| Our protection | Fixed scope, no custom features in the pilot, max 3 pilots running at once |

## 4. Optional marketing services (not part of the software)
| Offer | Content | Link to the OS | Price |
|---|---|---|---|
| AI video ad | 10–15 s video | Ends with "Book direct" / "Order via QR" + tracked link | **25,000 ֏** (3 for 60,000), approved |
| Google & reviews / Google + Instagram | Monthly | Review requests come from the OS feedback flow | **20,000 / 45,000 ֏ per month**, approved |
| **Season content pack** (hypothesis) | Half-day on-site phone shoot + edit: 4 reels (rooms/views/food), 20 edited photos, captions hy/ru/en | Photos reused on the website/QR menu; reels link to the booking page/menu with UTM tags so the dashboard shows the source | **120,000–180,000 ֏** |
| **Booking / order campaign** (hypothesis) | Instagram/Google campaign setup + monthly optimisation | Leads land in the inbox/orders with the source "campaign" | **40,000 ֏/month** + ad budget at cost |

**Rule:** content generates demand; the OS captures it. Never bundle content into the software price.

## 5. ROI calculator concept (owner's numbers, not our promises)
**Principles:**
- Every input is entered by the owner or chosen together.
- The output shows a **range** (low/high) with the formula visible.
- Label: *"Estimate based on your assumptions. Not a guarantee."*

**Hotel inputs:**

| Code | Input |
|---|---|
| I | Inquiries per week |
| s | Share arriving outside staffed hours |
| L | Share of those lost today (owner's estimate) |
| r | Share of lost inquiries we could recover (owner picks 10–50%) |
| c | Conversion of answered inquiries to stays |
| V | Average booking value (ADR × average nights) |
| d | Bookings/month that could move from OTA to direct |
| k | OTA commission rate |
| m | Messages/day answered manually today |
| t | Minutes each |
| w | Staff hourly cost |

**Hotel outputs:**
- Extra bookings/month ≈ `I × 4.3 × s × L × r × c`
- Extra revenue ≈ extra bookings × V
- Commission saved ≈ `d × V × k`
- Staff hours saved ≈ `m × t × 30 / 60 × (share automated)`, × w
- Payback months ≈ `setup ÷ (monthly benefit − monthly fee)`; shown only when the benefit exceeds the fee

**Restaurant inputs:**

| Code | Input |
|---|---|
| O | Orders/day |
| q | Share via QR/online |
| u | Waiter minutes saved per QR order |
| w | Hourly cost |
| e | Order errors/week |
| E | Average cost per error |
| R | Menu reprints/year × cost |
| — | Owner's assumption of AOV change (default 0) |

**Restaurant outputs:**
- Staff hours saved ≈ `O × q × u × 30 / 60`
- Error cost avoided ≈ `e × E × 4.3 × (share prevented)`
- Reprint savings
- Payback

**Validation before claiming results:** measure baselines during the pilot (response times, captured inquiries, ticket times, errors) and compare after 30 days. Show real deltas only.
