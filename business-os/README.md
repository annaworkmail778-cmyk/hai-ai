# RISEUP Hotel OS: interactive sales demo

A premium, fully interactive demonstration of **RISEUP Hotel OS** for in-person meetings with hotel owners.

- **The hotel:** Pine Ridge Hotel & Spa · Tsaghkadzor. It is fictional.
- **Data:** generated sample data only.
- **External messages:** simulated, never sent.

This is a standalone Next.js app, separate from the riseup-group.com website in the repository root.

| Path | What it is |
|---|---|
| `/` | Launcher (Armenian) |
| `/present` | **Presenter mode:** guided scenarios with the guest phone and the dashboard side by side, reset, night mode, QR, before/after |
| `/hotel/hy`, `/hotel/ru`, `/hotel/en` | Guest website: home, rooms, room details, offers, facilities, location, booking request, AI assistant |
| `/admin` | Management dashboard (Armenian): overview, reservations, calendar, rooms, guest CRM, housekeeping, maintenance, staff & tasks, AI assistant management, automations, analytics, value (ROI) calculator |
| `/s/{a\|b}/hotel` | QR entry: joins presenter session A or B and opens the guest site in the phone's language |
| `/hotel/{lang}/booking` | Booking journey: dates, room and quantity, extras, voucher, details, price breakdown, policy. Sends a request (pending), never a payment |
| `/hotel/{lang}/account` | Guest account (demo sign-in): stays, orders, requests, Pine Ridge Circle points, rewards, vouchers, profile and consent |
| `/hotel/{lang}/dining`, `/hotel/{lang}/order/{id}` | Restaurant ordering (room service / table / takeaway) and live order status |
| `/hotel/{lang}/stay` | In-stay services after QR scan and stay verification (towels, cleaning, maintenance, wake-up…) |
| `/q/room/{n}`, `/q/table/{T}`, `/q/point/{spa\|lobby\|pool}` | Printable QR entry points |
| `/kds` | Kitchen Display System (full screen, touch) |
| `/staff` | Staff workspace, mobile-first: today, messages, learning (onboarding, SOPs, SOP assistant), team (managers) |
| `/admin/requests`, `/admin/restaurant`, `/admin/loyalty`, `/admin/team`, `/admin/settings` | Guest requests, restaurant & menu, loyalty programme, team/RBAC/onboarding, property configuration |

## Run locally
```bash
cd business-os
npm install
npm run build && npm start      # http://localhost:3100
npm test                        # engine, loyalty, booking, QR routing, onboarding, SOP assistant, metric-consistency tests
npm run typecheck
npm run lint                    # uses ESLint from the repo root (run `npm install` there once)
```

On a laptop, `npm start` is enough for a full demo. A phone on the same Wi‑Fi can open `http://<laptop-ip>:3100/s/a/hotel`, and its actions sync to the laptop.

## How it works (simplest reliable architecture)
- **Event-sourced state.** Every action is an event, e.g. `inquiry.create`, `reservation.approve`, `reservation.checkout`, `chat.message`.
  - Every device computes `state = replay(seed(baseDate), events)`, so the phone, the dashboard and the presenter always show the same thing.
  - The seed is deterministic and generated relative to the session start date: 24 rooms, about 6 months of reservations, guests, tasks and maintenance.
- **Automations run inside the reducer** (`src/lib/engine.ts`):
  - inquiry → dashboard notification and a prepared staff alert
  - approval → calendar update and a prepared guest confirmation
  - approval → room-preparation task
  - pre-arrival message scheduled the day before arrival
  - checkout → cleaning task (urgent if another guest arrives that day)
  - review request scheduled for the next day
  - unanswered question → staff task

  Each one can be switched on or off in **Automations**.
- **External messages** (WhatsApp, Telegram, e-mail) go to an outbox labelled **«Սիմուլյացիա · չի ուղարկվել»** ("Simulation · not sent") or **«Պլանավորված»** ("Scheduled"). Nothing is sent, and no third-party service is connected.
- **AI assistant:** a scripted engine (`src/lib/assistant.ts`) that answers only from the knowledge base, the room types, the rate table and the live calendar.
  - It answers in Armenian, Russian and English.
  - Questions it cannot answer from that data are handed to staff.
  - It never confirms a booking. It only creates an *inquiry* that staff must approve.
  - The engine interface is the seam where an LLM with tool calls can be plugged in later.
- **Analytics** (`src/lib/analytics.ts`) uses the standard definitions:
  - Occupancy = sold room-nights ÷ available room-nights.
  - ADR = revenue ÷ sold room-nights.
  - RevPAR = revenue ÷ available room-nights.

  Unit tests check that the figures are internally consistent.
- **ROI calculator:** every assumption is editable, every result shows its formula, and values taken from demo data are labelled «Չափված» ("Measured").

### Sync, internet dependency and fallback
| Mode | When | Behaviour |
|---|---|---|
| **Live** (default) | Laptop and phone online | Events are stored on the server (`/api/session/{code}`). Devices poll about every 1.2 s while visible. Phone → laptop latency is about 1–2 s. |
| **Reconnecting** | Weak network | The status pill shows «Վերամիացում…» ("Reconnecting…"). Actions are kept locally (localStorage) and sent when the connection returns, so no demo state is lost. |
| **Local** (switch in presenter mode) | No internet at the venue | Everything runs on the laptop: the guest view sits in a phone frame and syncs with the dashboard via BroadcastChannel. The customer's own phone cannot take part. |

**Server storage:**

| Where | Storage |
|---|---|
| Netlify | **Netlify Blobs** (strong consistency, one blob per event) |
| `next start` | In memory |

The status pill tooltip shows which one is active.

**Sessions:**
- Presenters **A** and **B** each have their own session, so two people can demo at the same time.
- **Reset** starts a fresh session for that presenter only.
- Sessions are capped at 400 events and 8 KB per event, and only known event types are accepted.

## Deploy (Netlify, temporary public URL)
1. In Netlify, choose **Add new site → Import from Git** and pick this repository and branch.
2. Set **Base directory = `business-os`**. `business-os/netlify.toml` supplies the build command, Node 22 and the Next.js runtime.
3. Optional environment variables:

   | Variable | Purpose |
   |---|---|
   | `DEMO_PRESENTER_PIN` | Required for **Reset** if set (stops strangers from resetting a live demo) |
   | `DEMO_SESSION_CODES` | Default `a,b` |
   | `NEXT_PUBLIC_QR_BASE_URL` | e.g. `https://riseup-group.com`. When set, QR codes use the stable `…/go/h-a` links |

4. After the first deploy, open `/present` on a laptop and scan the QR with a phone. The pill must show «Համաժամեցված» ("Synced"). Its tooltip must show `netlify-blobs`.

### Stable QR links on riseup-group.com
The main site (`../next.config.ts`) has an allow-listed redirect: `/go/h-a` and `/go/h-b` → `${BUSINESS_OS_DEMO_URL}/s/{a|b}/hotel` (307).

To enable it:
1. Set `BUSINESS_OS_DEMO_URL=https://<demo>.netlify.app` on the main site's Netlify settings.
2. Redeploy the main site.

**Safety:**
- Only those paths exist.
- The destination is an https origin from the environment.
- Nothing changes when the variable is unset.
- The rest of the site is unaffected (verified: `/`, `/hy`, `/ru/pricing`, `/robots.txt`, `/sitemap.xml`, `/api/contact`).

Printed cards therefore keep working when the demo moves to a permanent subdomain.

## Honesty rules built into the UI
- A «Ցուցադրական տվյալներ» ("Demo data") badge appears on every admin screen. The hotel, guests, phones (`+374 00 …`, `+7 900 000 …`) and e-mails (`@example.com`) are fictional.
- An inquiry is shown as **«Հարցում, դեռ հաստատված չէ»** / «Запрос получен, ещё не подтверждён» / "not confirmed yet" until staff approve it. Double booking is blocked.
- Booking.com, Airbnb, WhatsApp, Telegram, e-mail, n8n and payments are shown as **not connected (simulation)**.
- ROI results are labelled as projections, not guarantees.

## Known limitations
- The Netlify Blobs backend is implemented to the official API, but in this environment only the in-memory backend was exercised end to end. Check the tooltip on the first deploy.
- There are no user accounts. The presenter PIN only protects Reset, and the dashboard is open to anyone with the URL (demo data only, `noindex`).
- Sync uses short polling, not websockets. That is fine for a demo; a pilot would use Supabase Realtime (see `../docs/TECHNICAL_ARCHITECTURE.md`).
- The admin and staff UI is in Armenian only. Guest pages are in hy/ru/en.
- Guest and staff "sign-in" is a per-device demo identity, not authentication. Permissions are enforced in the UI only.
- No payment, PMS, POS, channel-manager or messaging integration is connected. Payments are recorded manually by staff.
- The SOP assistant uses deterministic keyword retrieval, not an LLM. It answers only from the approved SOPs or routes the question to the supervisor.
- Lint: 0 errors, plus React Compiler advisory warnings (storage reads in effects, render-time clock in older screens) that are tracked in `../docs/HOSPITALITY_OS_IMPLEMENTATION_ROADMAP.md`.
- Full status of every feature (working / simulated / needs integration): `../docs/HOSPITALITY_OS_FEATURE_MAP.md`.

## Photo credits
Photos are from [Unsplash](https://unsplash.com) under the Unsplash License (free commercial use). They are stored in `public/img/`.

Unsplash photo IDs:

| Use | IDs |
|---|---|
| Hero and landscapes | 1453306458620-5bbef13a5bca, 1491002052546-bf38f186af56, 1486870591958-9b9d0d1dda99 |
| Rooms | 1618773928121-c32242e63f39, 1631049307264-da0ec9d70304, 1578683010236-d716f9a3f461, 1596394516093-501ba68a0ba6, 1590490360182-c33d57733427, 1611892440504-42a792e24d32, 1505693416388-ac5ce068fe85, 1560448204-e02f11c3d0e2, 1449158743715-0a90ebb6d2d8, 1582719478250-c89cae4dc85b |
| Bathroom | 1584622650111-993a426fbf0a |
| Spa | 1544161515-4ab6ce6db874, 1540555700478-4be289fbecef |
| Breakfast and restaurant | 1504754524776-8f4f37790ca0, 1414235077428-338989a2e8c0 |
| Ski and hiking | 1551524559-8af4e6624178, 1551632811-561732d1e306 |
