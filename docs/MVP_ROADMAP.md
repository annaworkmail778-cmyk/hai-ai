# RISEUP Business OS: MVP Roadmap and Estimates

**Estimates assume one developer using AI coding tools (Claude Code).**
- They include testing, debugging, content, deployment and dry runs. Ranges reflect uncertainty.
- **Productive build hours per day:** ~6 (the rest is reviews, calls, context switching).

## ⚠ Capacity conflict (needs a decision before starting)
The approved $5,000 sales plan (`docs/RISEUP_SALES_SYSTEM/REVISED_5000_REVENUE_SCENARIOS.md` §5) already uses **137 of the 140 delivery hours** for 23 Nov – 22 Dec on paid client work. A Hotel/Restaurant demo is **80–225 extra hours**. Options:

| Option | Effect |
|---|---|
| **A. Build Milestone A (~100 h) now and accept a lower 30-day cash target** | The demo is ready ~16–18 working days after start at 6 h/day (~13 at full focus); the $5k plan loses ~3–5 small deals |
| B. Build after paid deliveries (from ~22 Dec) | No cash impact; Tsaghkadzor peak season is busy (owners have less time), but the pain is visible |
| C. Build in a protected 2–3 h daily block + weekends | Ready in ~4 weeks; burnout risk |
| D. Meanwhile, sell with what exists (zero build) | Existing site demos (salon/shop/real-estate scripted demos on riseup-group.com), the L2 Lead-to-Booking video, the HosDog case **with permission**. Offer the **paid pilot** (`COMMERCIAL_OFFERS.md`) and build the pilot for a paying client instead of a demo |

**Recommendation: A + D.**
- Start Tsaghkadzor discovery visits now using D, offering a paid pilot.
- Build Milestone A (hotel) immediately, since Tsaghkadzor is hotel-first and the season is starting.
- Restaurant Milestone B follows.
- Lower the 30-day cash target accordingly, or treat the first paid pilot as the replacement deal.

## Level 1: Sales demo MVP
| | |
|---|---|
| Purpose | Convince an owner in 3–5 minutes; collect paid pilots |
| Features | Customer sites, admin dashboards, scripted assistant, simulated automation timeline, analytics on demo data, guided presenter mode, reset, hy/ru/en (`PRODUCT_FEATURES.md` "M" items + selected "S") |
| Complexity | Medium (UI-heavy, no backend) |
| Skills | React/Next.js, Tailwind, data visualisation, UX writing in 3 languages, demo storytelling |
| External dependencies | None required. Photos (licensed stock or AI-generated, labelled illustrative). Subdomain DNS. Optional: Supabase for cross-device |
| Main risks | Scope creep ("one more feature"). Weak photography makes it look like a template. Armenian/Russian copy quality. A demo breaking in a meeting (mitigation: reset + e2e tests + offline) |
| Postponed | Real auth, database, real messaging, LLM, iCal, printers, payments |

| Milestone | Scope | Hours | Calendar (6 h/day) |
|---|---|---|---|
| **A. Hotel first-meeting demo** | Shared core (setup, design primitives, admin shell, demo store/reset, scripted assistant, automation timeline, presenter split view + guided overlay). Hotel site (home, room detail, request form, assistant). Inbox + drawer, calendar, analytics, seed data. Tests, deploy, 2 dry runs | **95–110 h** | **16–18 working days** |
| **B. Restaurant first-meeting demo** | Site + QR menu + cart + order status, orders list, KDS, menu sold-out toggle, analytics, assistant intents, seed, guided script, tests, deploy | **45–55 h** | **8–9 days** |
| **C. Complete Level 1** | Hotel housekeeping + maintenance, guests, ROI calculator. Restaurant tables/reservations, food cost, customers/loyalty. Automations screens, photo/content upgrade, translation review, full device QA | **60–75 h** | **10–13 days** |
| **Optional X. Cross-device** | Owner scans the QR with their own phone → laptop KDS updates (Supabase Realtime or a serverless store; online needed) | **10–14 h** | 2 days |
| **Total Level 1** | | **200–240 h** | **~6–8 weeks** at 6 h/day |

## Level 2: Pilot MVP (one real business, one vertical)
| | |
|---|---|
| Purpose | A paying client uses it daily for 30+ days |
| Features | Separate repo. Supabase (Postgres, Auth, RLS, Storage, Realtime). Real inquiries/orders. Staff accounts and roles. Client content management (rooms/rates or menu/photos). Telegram staff alerts + email guest messages via n8n (outbox). Scripted assistant with client FAQ (LLM optional). Monitoring, backups. Training, 2-week hypercare |
| Complexity | Medium-high (security, data, integrations, real users) |
| Skills | Postgres/RLS, auth, n8n, Telegram Bot API, email deliverability, ops/backups |
| External dependencies | Supabase (paid tier for backups), domain, Telegram bot, Resend domain verification. Optional: Claude API, WhatsApp Cloud API (Meta business verification, template approval, per-message fees), Booking.com/Airbnb iCal URLs, kitchen printer |
| Main risks | Client data entry delays. Staff adoption. Double-booking if the OTAs aren't synced (mitigation: iCal + clear process). Message deliverability. Scope creep into POS/PMS replacement |
| Postponed | Billing, multi-tenant admin UI, payments, fiscal integration, channel manager, native apps |

| Work package | Hours |
|---|---|
| Repo split, Supabase project, schema + migrations, RLS policies, tenant isolation tests | 20–26 |
| Auth, memberships, roles, Data Access Layer | 12–16 |
| Convert the demo store to server data (one vertical): queries, server actions, realtime | 30–40 |
| Client settings/content management (rooms & rates **or** menu, photos upload) | 14–18 |
| Public endpoints (inquiry/order/reservation): validation, rate limit, bot check | 6–8 |
| Outbox + n8n workflows (4–5 flows: staff alert, confirmation, pre-arrival or order-ready, feedback) | 16–22 |
| Assistant with client FAQ (scripted) | 6–10 |
| Client onboarding: data, photos, translations | 10–14 |
| Deploy, custom domain, monitoring, backups + restore test | 8–12 |
| Testing (unit, e2e, UAT) and fixes | 18–24 |
| Training + hypercare (2 weeks) | 10–14 |
| **Total** | **150–205 h** → **5–7 weeks** part-time, **4–5 weeks** full-time |
| Add-ons | LLM assistant +16–24 h · iCal sync +10–14 h · kitchen printer +8–12 h · WhatsApp templates +12–20 h (plus Meta approval lead time) · second vertical pilot +60–90 h |

## Level 3: Commercial product (multi-tenant SaaS)
| | |
|---|---|
| Features | Tenant onboarding wizard, plan/module flags, admin console, billing (invoices first), audit log, observability, backups/restore drills, support tooling, WhatsApp templates, iCal, printers, exports, public status page, documentation/help centre, data export/deletion tooling |
| Complexity | High |
| Hours | **700–1,200 h** (≈ 4–7 months full-time for one developer; realistically 2 people) |
| Dependencies | Local payment acquiring (Stripe/PayPal not available for Armenian merchants per earlier research; verify), accountant (invoicing/VAT), lawyer (terms, DPA), Meta, OTA partners |
| Risks | Building SaaS before enough paying pilots; support load; competing with funded global products on breadth instead of local service |
| Gate to start | ≥ 5 paying clients on Level 2 deployments with similar needs |

## Development phases (Level 1 order)
1. **Decisions** (this blueprint approved; the questions in `IMPLEMENTATION_BACKLOG.md` §0 answered).
2. **Foundation:** package scaffold, tokens, components, admin shell, i18n, demo store + reset.
3. **Shared demo engine:** assistant engine + chat widget, automation timeline, presenter split view, guided overlay.
4. **Hotel:** seed data → site → inbox/calendar/drawer → analytics → guided script → (C) housekeeping, guests, ROI.
5. **Restaurant:** seed → site/QR menu/cart → orders → KDS → analytics → script → (C) tables, food cost, CRM.
6. **Content:** photos, copy in hy/ru/en reviewed by a native speaker each.
7. **Quality:** device matrix, Playwright golden flows, Lighthouse, offline check.
8. **Deploy:** separate Netlify site, subdomain, `noindex`, basic password optional.
9. **Sales materials:** QR cards, one-page leave-behind per vertical, pilot offer sheet (`COMMERCIAL_OFFERS.md`).
10. **Dry runs:** 3 timed rehearsals per vertical; fix friction.
