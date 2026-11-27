# RISEUP Business OS: Demo UX Flows

## 0. Demo businesses (fictional)
Names are invented. Before printing materials, check that no real Tsaghkadzor business uses the name.

| | Hotel demo | Restaurant demo |
|---|---|---|
| Name (working) | **"Pine Ridge Hotel · Tsaghkadzor" (demo)** | **"Ember & Lavash · Bistro" (demo)** |
| Size | 24 rooms in 4 room types (Standard, Deluxe Mountain View, Family Suite, Cottage) | 14 tables, 32 menu items in 6 categories |
| Identity | Calm, warm, trustworthy: deep pine green, warm stone/cream, serif headings, large photography, generous whitespace | Appetising, fast, bold: charcoal + warm saffron/tomato accent, rounded sans, big food photos, sticky cart |
| Data | 90 days of reservations (mix of website/assistant/phone/Booking.com/Airbnb/walk-in), realistic winter weekend peaks | 60 days of orders with lunch/dinner peaks, weekend uplift, 400 customers, recipes for 32 dishes |
| Label | **"Demo data: fictional business"** badge on every admin screen | Same |

**Admin shell (shared):**
- RISEUP brand (ink/paper with the signal-orange accent, Geist + Noto Sans Armenian).
- Left nav, top bar with the business name, role switcher, language switcher, **Reset demo** and **Guided demo**.

## 1. Screen inventory (Level 1)
### Hotel: customer side (`/hotel/[lang]`)
| # | Screen | Key elements |
|---|---|---|
| H1 | Home | Hero photo, value line, date picker + guests, "Check availability", highlights (ski lift distance, breakfast, parking), reviews section **labelled demo**, map card, Instagram/WhatsApp buttons |
| H2 | Rooms | Room-type cards: photo, capacity, amenities, "from" price per night (from rate data) |
| H3 | Room detail | Gallery, amenities, policies, price for the selected dates, **"Send reservation request"** |
| H4 | Request form + success | Dates, guests, name, phone/email, preferred contact, requests. Success page says **"Request received, not yet confirmed. The hotel will reply within X minutes."** |
| H5 | Assistant widget | Chat bubble on every page; quick replies in hy/ru/en |
| H6 | Contact / location | Static map image + "Open in Google Maps", transport from Yerevan, phone, messengers |

### Hotel: admin side (`/hotel/admin`)
| # | Screen | Key elements |
|---|---|---|
| HA1 | Today | KPI cards (occupancy tonight, arrivals, departures, new inquiries, revenue this month), "Needs action" list |
| HA2 | Inquiries inbox | New requests with source icon, age timer ("waiting 12 min"), assistant transcript link, **Approve / Offer alternative / Decline** |
| HA3 | Calendar (tape chart) | Rooms × 14 days, colour by status (inquiry = hatched, confirmed = solid, checked-in, out of order), click → drawer |
| HA4 | Reservation drawer / new reservation | Guest, dates, room assignment, price (from rates), source, notes, status buttons, overlap warning |
| HA5 | Housekeeping board | Room grid by status (dirty / cleaning / clean / inspected), assignee, auto-created checkout tasks, maintenance tab |
| HA6 | Guests | List, stay history, repeat badge, notes |
| HA7 | Analytics | Occupancy, ADR, RevPAR, revenue (confirmed stays), source mix (direct vs OTA), inquiry → confirmed conversion, cancellations; 30/90-day toggle |
| HA8 | Automations | Workflow list with on/off toggles + an event timeline with **SIMULATED** badges + "How it connects": Telegram / email / WhatsApp / n8n diagram |
| HA9 | ROI calculator | Owner-entered inputs → potential impact range |

### Restaurant: customer side (`/restaurant/[lang]`)
| # | Screen | Key elements |
|---|---|---|
| R1 | Home | Hero food photo, hours (open/closed now), "Order online", "Book a table", location, messengers |
| R2 | Menu / QR menu (`/restaurant/[lang]/menu?table=7`) | Sticky category tabs, dish cards (photo, description, price, "sold out"), add to cart, dish detail sheet, assistant button |
| R3 | Cart + checkout | Items, notes, dine-in (table auto-filled from QR) / pickup time / delivery address (demo zone), name, phone; **"Order sent, waiting for the restaurant to accept"** |
| R4 | Order status | Live status (submitted → accepted → preparing → ready) |
| R5 | Table reservation | Date, time, guests, contact. **"Request sent, not yet confirmed"** |
| R6 | Assistant widget | Menu Q&A, recommendations from tags, reservation request, add to cart |

### Restaurant: admin side (`/restaurant/admin`)
| # | Screen | Key elements |
|---|---|---|
| RA1 | Today | Sales today, orders, average order value, open orders, reservations tonight, low-stock flags |
| RA2 | Orders | Live list (new ones pulse), accept/reject, filters (dine-in/pickup/delivery), detail drawer, history |
| RA3 | Kitchen display (`/restaurant/kds`, full-screen) | Columns New / Preparing / Ready, tickets with table, items, notes, **age timer** (green < 10 min, amber < 20, red ≥ 20), bump buttons, large touch targets |
| RA4 | Tables & reservations | Floor grid (free/occupied/reserved), tonight's reservations, confirm/seat/no-show |
| RA5 | Menu manager | Toggle "sold out", edit price, photo; changes appear instantly on the QR menu |
| RA6 | Food cost | Per dish: ingredient cost, food cost %, margin; sort by margin; 3–4 low-stock items |
| RA7 | Customers & loyalty | List, visits, AOV, segment (new/regular/lapsed), points |
| RA8 | Analytics | Daily/weekly/monthly sales, orders, AOV, best sellers, by category, estimated food cost and gross profit, peak-hour heatmap, repeat share |
| RA9 | Automations | Same component as HA8 |
| RA10 | ROI calculator | Same framework, restaurant inputs |

### Presenter
| # | Screen | Purpose |
|---|---|---|
| P1 | `/` launcher | Two big cards: Hotel demo / Restaurant demo; language; Reset all |
| P2 | `/present/hotel`, `/present/restaurant` | **Split view:** phone frame (customer side, live) left, admin right. Guided step overlay at the bottom. Works on one laptop or tablet |
| P3 | QR card | Printable QR to the demo menu (cross-device only if the shared backend option is approved) |

## 2. Hotel demo journey (3–5 minutes)
| Step | Screen | What the owner sees | Line to say (example) |
|---|---|---|---|
| 1 | H1 in the phone frame | Beautiful mobile hotel site in Armenian; switch to Russian | "This is your hotel's own site, in three languages, built for phones." |
| 2 | H5 | It's **23:30**. A guest asks the assistant in Russian: "Is there a family room for 4, 12–14 January? Price?" The assistant shows Family Suite, the price from your rates, check-in time, and asks for name and phone. Then: "I've passed your request to the reception team; they'll confirm in the morning." | "It answers only from your prices and rules. It never confirms on its own." |
| 3 | HA2 | The request appears in the inbox with source "Assistant · 23:31", the full transcript and a waiting timer | "Every request from every channel lands here, so nothing gets lost in a phone." |
| 4 | HA3 → HA4 | Calendar shows the inquiry (hatched). Assign room 204, **Approve** | "One click. You decide." |
| 5 | HA8 | Timeline: "Confirmation email to guest: **SIMULATED**", "Pre-arrival message scheduled 10 Jan", "Telegram alert to reception" | "In your real system these are sent through Telegram, email or WhatsApp. Here we only show them." |
| 6 | HA5 | Checkout of room 108 today → cleaning task auto-created → housekeeper marks Clean → room ready | "Housekeeping sees what to clean without calls." |
| 7 | HA7 | Occupancy 78% tonight, ADR, RevPAR, 41% direct vs OTA, conversion of inquiries | "This is demo data. With your data you'd see this every morning." |
| 8 | HA9 (optional) | Owner enters their numbers | "Let's use your numbers instead of mine." |

## 3. Restaurant demo journey (3–5 minutes)
| Step | Screen | What the owner sees | Line |
|---|---|---|---|
| 1 | R1 | Restaurant site in Armenian, open now | "Your menu and ordering, on your own site." |
| 2 | P3/R2 | "Scan" the QR on table 7 (phone frame or the owner's phone) → menu by category in their language | "No app, no waiting for the menu." |
| 3 | R2 → R3 | Add khorovats + lavash + lemonade, note "no onions", send → **"waiting for the restaurant to accept"** | |
| 4 | RA2 | The order pops in, highlighted, with table 7 and the note; **Accept** | "Nothing written by hand, nothing forgotten." |
| 5 | RA3 | The ticket appears on the kitchen screen with a timer; tap → Preparing → Ready; the guest's phone shows "Ready" | "The kitchen sees orders in sequence, with times." |
| 6 | RA5 | Mark "Gata" sold out → it disappears from the QR menu instantly | "Change the menu in seconds." |
| 7 | RA8 / RA6 | Today's sales, best sellers, peak hours, food cost % per dish | "You see what sells, and what earns." |
| 8 | RA10 (optional) | Owner's numbers | |

## 4. Before / after scenes (used in the guided overlay)
| Scene | Before (what happens today; validate in discovery) | After |
|---|---|---|
| Hotel night inquiry | Message seen next morning; guest books elsewhere | Instant answer + captured request; reception confirms at 09:00 |
| Hotel checkout cleaning | Reception calls housekeeping; rooms ready late | Task created at checkout; status visible to reception |
| Restaurant peak hour | Waiter writes, walks to the kitchen, misreads notes | Order goes straight to the KDS with notes; waiter serves |
| Menu change | Printed menus are wrong; guests disappointed | Sold out in one tap |

## 5. Guided demo mode
- A bottom overlay shows step N/8 with a title, one sentence and Next/Back. Each step drives the app to the right screen and state.
- **Auto-play** (for a waiting tablet in a lobby) and **manual** (in meetings).
- Keyboard shortcuts for the presenter: → next, ← back, R reset, L language.
- **Reset** restores the seed in under 1 second. Every step is idempotent.

## 6. Mobile / device requirements
| Surface | Requirement |
|---|---|
| Customer screens | Designed at 375 px first; tested on iOS Safari and Android Chrome |
| Admin | Tablet 1024 px and laptop 1366 px; usable on a phone for the inbox and housekeeping |
| KDS | Landscape tablet or TV; touch targets ≥ 48 px; readable at 2 m |
| Performance | Lighthouse ≥ 90 on customer pages; demo usable on 4G |
