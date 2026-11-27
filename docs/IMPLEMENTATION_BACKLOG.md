# RISEUP Business OS: Implementation Backlog (Level 1, then Level 2)

> **Phase 1.5 (2026-11-27):** the first demo is now the lean scope in `LEAN_DEMO_SCOPE.md` and `LEAN_DEMO_IMPLEMENTATION_PLAN.md` (≈ 24 h for the hotel stage, ≈ 35 h combined). The Level 1 estimates below are the later, full demo.

**Not approved for implementation yet.** Work starts after the blueprint and the §0 decisions are approved.
- Estimates are hours for one developer with Claude Code, including tests.
- Each task's dependencies are listed by ID.

## 0. Decisions needed before Task 1
| # | Decision | Recommendation |
|---|---|---|
| D1 | Capacity: build now vs. after paid deliveries (`MVP_ROADMAP.md` ⚠) | Build Milestone A now; sell pilots meanwhile; adjust the 30-day cash target |
| D2 | Location: `business-os/` package in this repo (Level 1) → own repo at Level 2 | Yes |
| D3 | Hosting: separate Netlify site + subdomain (e.g. `demo.riseup-group.com`, `noindex`) | Yes (DNS change by the owner) |
| D4 | First vertical | **Hotel** (Tsaghkadzor focus, season starting); restaurant second |
| D5 | Cross-device QR (needs a small backend + internet) | Not in Milestone A; decide after the first 5 meetings |
| D6 | Imagery: licensed stock vs. AI-generated (labelled illustrative) vs. our own shoot | Licensed stock + some AI images, labelled; own shoot later |
| D7 | Demo brand names ("Pine Ridge Hotel", "Ember & Lavash") | Approve after a local name check |
| D8 | Pricing hypotheses and the pilot credit rule (`COMMERCIAL_OFFERS.md`) | Approve to test in meetings |

## 1. Level 1 backlog (priority order)
| ID | Task | Est. | Depends on | Acceptance criteria |
|---|---|---|---|---|
| T1 | Scaffold `business-os/` (Next.js 16, React 19, TS, Tailwind v4, ESLint); exclude it from the root tsconfig/ESLint like `reels/`; read the relevant guides in `node_modules/next/dist/docs/` | 4 | D2 | `npm run build` and `typecheck` pass in both packages; the marketing site build is unchanged |
| T2 | Design tokens: RISEUP admin theme + hotel theme + restaurant theme (CSS variables); fonts incl. Noto Sans Armenian | 4 | T1 | Theme switch per route; Armenian glyphs render; contrast AA |
| T3 | UI primitives: button, input, select, date range, badge, card, KPI card, table, drawer, dialog, tabs, toast, empty state | 8 | T2 | Storybook-like `/ui` page shows every state; keyboard accessible |
| T4 | i18n (hy/ru/en) copied from the site's pattern; locale switcher | 3 | T1 | All UI strings from dictionaries; no hard-coded text |
| T5 | Demo store: zod schemas, seed loader, in-memory + localStorage, BroadcastChannel sync, **Reset demo**, "Demo data" badge | 7 | T1 | Reset < 1 s; two tabs stay in sync; corrupt storage falls back to the seed |
| T6 | Admin shell: sidebar, top bar, role switcher, language, reset, guided-demo button; responsive | 5 | T3, T4 | Works at 1024 and 1366 px; collapses on mobile |
| T7 | Assistant engine interface + ScriptedEngine + chat widget (quick replies, typing indicator, handoff card, disclosure line) | 7 | T5 | Never outputs a price not in the data (unit test); unknown intent → handoff; actions limited to the allowed list |
| T8 | Automation timeline component + event bus (events → timeline items with SIMULATED badge and channel icons) + "how it connects" diagram | 4 | T5 | No UI text says "sent"; the badge is visible on every item |
| T9 | Presenter split view (phone frame + admin) + guided overlay (steps drive state, keyboard shortcuts, auto-play) | 8 | T5, T6 | An 8-step script runs start to finish 10 times without errors |
| T10 | **Hotel seed data** (24 rooms, 4 types, seasonal rates, 90 days of reservations with sources/statuses, guests) in hy/ru/en | 6 | T5 | Analytics formulas give plausible values; all names fictional |
| T11 | Hotel site: home, rooms, room detail, request form + honest success, contact/map link, assistant widget; hotel theme | 12 | T2, T7, T10 | Lighthouse ≥ 90 mobile; the success page says "not yet confirmed" |
| T12 | Hotel assistant intents (rooms, prices for dates from rate data, times, location/transport, collect inquiry, handoff) ×3 languages | 4 | T7, T10 | The 23:30 scenario runs in ru and hy; price equals the rate-table output |
| T13 | Hotel inbox + reservation drawer + approve/decline/offer alternative + manual create + overlap guard | 9 | T6, T10 | Approve changes the status to confirmed, emits an event, appears in the timeline; overlapping confirmed reservations are blocked |
| T14 | Hotel calendar (tape chart, 14 days, statuses, click to open) + Today board | 9 | T13 | Inquiry hatched vs confirmed solid; renders 24 rooms × 14 days smoothly on a tablet |
| T15 | Hotel analytics (occupancy, ADR, RevPAR, revenue, source mix, conversion, cancellations; 30/90 days) | 7 | T10, T3 | Formulas unit-tested; "Demo data" label visible |
| T16 | Hotel guided script (8 steps) + 2 timed dry runs | 3 | T9, T11–T15 | Runs in ≤ 5 min; reset in between |
| T17 | Playwright golden flow (hotel) on mobile + desktop; deploy to Netlify (separate site, noindex) | 5 | T16, D3 | CI green; URL works offline after the first load |
| — | **Milestone A complete** | **≈ 105 h** | | Ready for meetings |
| T18 | **Restaurant seed** (32 dishes, 6 categories, recipes/ingredient costs, 14 tables, 60 days of orders, 400 customers) | 5 | T5 | Peak hours and best sellers look plausible |
| T19 | Restaurant site + QR menu (`?table=`), dish sheet, cart, checkout (dine-in/pickup/delivery demo zone), order status page; restaurant theme | 12 | T2, T18 | Cart survives refresh; status page updates via sync |
| T20 | Orders list + accept/reject + detail + history | 5 | T19 | New order highlighted within 1 s (same device / tab) |
| T21 | Kitchen display (columns, timers, colour thresholds, bump, full-screen) | 7 | T20 | Readable at 2 m; actions ≤ 1 tap; timer thresholds configurable |
| T22 | Menu manager (sold-out toggle, price edit) reflected in the QR menu | 2 | T19 | The change shows on the menu instantly |
| T23 | Restaurant assistant intents (menu Q&A from data, recommendations by tags, reservation request, add to cart, handoff) | 4 | T7, T18 | Never mentions a dish/ingredient not in the data (test) |
| T24 | Restaurant analytics (sales by period, orders, AOV, best sellers, categories, est. food cost & gross profit, peak-hour heatmap, repeat share) | 7 | T18 | Formulas tested |
| T25 | Restaurant guided script + golden e2e + deploy | 5 | T19–T24 | ≤ 5 min; CI green |
| — | **Milestone B complete** | **≈ 47 h** | | |
| T26 | Hotel housekeeping board + auto checkout tasks + maintenance requests | 6 | T13 | Checkout creates a task; status visible on the calendar |
| T27 | Hotel guests list/history + repeat badge | 3 | T10 | |
| T28 | Tables & table reservations (grid + list + statuses) | 6 | T18 | |
| T29 | Food cost screen (per-dish cost, %, margin, low-stock flags) | 5 | T18 | Numbers equal recipe × ingredient cost |
| T30 | Customers & loyalty (segments, points) | 4 | T18 | |
| T31 | Automations screens (workflow list, toggles, timeline) for both verticals | 4 | T8 | |
| T32 | ROI calculator (shared framework, hotel + restaurant inputs, ranges, visible formulas, disclaimer) | 5 | T3 | Shows no output until the owner enters inputs; payback hidden when the benefit ≤ the fee |
| T33 | Photo/content upgrade + native-speaker review of hy and ru copy | 10 | T11, T19 | No machine-translation errors flagged by the reviewers |
| T34 | Device QA matrix (iPhone Safari, Android Chrome, iPad, Windows laptop, TV for KDS) + fixes | 10 | all | Checklist signed off |
| T35 | Sales materials: QR card, one-page leave-behind per vertical, pilot offer sheet (print-ready) | 4 | T17, T25 | |
| — | **Milestone C complete** | **≈ 57 h + buffer** | | |
| TX | (Optional) Cross-device realtime for QR → KDS | 10–14 | D5 | Owner's phone order appears on the laptop in < 2 s; graceful offline fallback |

## 2. Level 2 backlog (after a signed pilot), summary
| ID | Task | Est. | Acceptance criteria |
|---|---|---|---|
| P1 | New repo, Supabase project (EU), Drizzle schema + migrations for one vertical | 10 | Migrations reproducible from scratch |
| P2 | RLS policies + tenant isolation test suite | 12 | Cross-tenant reads/writes fail for every table |
| P3 | Auth + memberships + roles + Data Access Layer | 14 | Role matrix tested |
| P4 | Replace the demo store with server data, server actions, realtime | 30–40 | Feature parity with the Level 1 vertical |
| P5 | Client settings/content (rooms & rates or menu, photo upload) | 14–18 | The client edits without our help |
| P6 | Public endpoints (inquiry/order/reservation) with validation, rate limit, bot check | 6–8 | Abuse tests pass |
| P7 | Outbox + n8n flows + Telegram bot + Resend email | 16–22 | Failed sends are visible and retried; nothing is marked sent without a provider id |
| P8 | Monitoring, backups, restore test, runbook | 8–12 | A restore has been performed once |
| P9 | Onboarding, training, hypercare | 20–28 | Pilot success criteria measured |

## 3. Definition of done (every task)
- Typecheck, lint and tests pass.
- Works in hy/ru/en.
- Mobile checked.
- No invented data shown as real.
- Simulated actions are labelled.
- No secrets in code.
