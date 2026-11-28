# RISEUP Restaurant OS: Core Demo (R0–R6) — Build & QA Report

**Date:** 2026-11-28 · **Branch:** `claude/clever-carson-vfvd6s` · not merged, not deployed, `main`/DNS/production untouched.
**Demo brand:** Summit Table (fictional, configurable in `business-os/src/lib/restaurant/data.ts`; not presented as a real Tsaghkadzor business).

## 1. What was built
| Phase | Delivered |
|---|---|
| R0 | Shared kernel (replay, namespaced session store/route, client sync store, device frame, connection pill, per-vertical provider). Report: `RESTAURANT_OS_R0_REPORT.md` |
| R1 | Restaurant domain: reducer, rules, deterministic seed (28 days history + live evening), analytics, savings calculator, permissions, 39 domain tests |
| R2 | Guest site `/restaurant/{hy,ru,en}`: editorial home, menu with modifiers/allergens, device cart, takeaway checkout with rule-based pickup estimate, live order status, QR entry `/q/{session}/{token}`, two theme presets |
| R3 | `/r/admin` overview, `/r/admin/orders` inbox, `/r/floor` waiter app (SVG floor plans, requests, add items, close on POS), `/r/kds` kitchen display (stations, expo, timers, all-day counts, sold-out, recall) |
| R4 | `/r/admin/menu`, `/r/admin/recipes` (line costing with yield, VAT-aware margin, 28-day and session comparison), `/r/admin/inventory` (stock ledger, price update with live margin impact, waste), `/r/admin/purchasing` (suggestions, PO, partial receipt) |
| R5 | `/r/admin/analytics` (sales & channels, dish profitability & menu engineering, operations, data-backed questions), `/r/admin/savings` **Business Performance & Savings Calculator** |
| R6 | `/present/restaurant` (scenarios A, B, C, F; phone + laptop + kitchen frames; per-scenario restart; reset with PIN; real-phone QR; local mode; theme/language), `/r` launcher, automations, integrations, settings |

## 2. Business Performance & Savings Calculator
Rows: food waste, remakes (errors), ingredient price increases, stock-outs, order-taking time. Each row shows:
- **Actual** sample metric (as recorded in the demo data) or **Calculated** metric (formula on actual data), with its source.
- **Hypothetical** assumption, editable by the owner (slider), stored in settings.
- The formula and the resulting **hypothetical** monthly value.
The total is labelled "hypothetical, not a guarantee". Net profit is shown only when the owner enters operating expenses; otherwise only gross profit.

## 3. Test results
| Check | Result |
|---|---|
| Unit tests (`npm test`) | **50 / 50 pass** (9 hotel, 2 kernel, 39 restaurant) |
| Typecheck, production build | Clean; 49 routes |
| End-to-end, 5 separate browser sessions (guest iPhone, guest Android, waiter phone, kitchen tablet, owner laptop) driven through the real UI | **27 / 27 checks pass, 0 page/console errors** — Scenario A (10 checks), B (6), C (3), F (5), permissions (2), sold-out propagation (1) |
| Dashboard vs independent Node replay of the server event log | Orders, average check and QR channel figures match exactly |
| Presenter auto-run | Scenario A produces submit → accept → 3 station tickets started/ready → serve; C produces the price change; per-scenario restart empties the session |
| Replay performance | < 1 ms per replay with the memoised seed (seed ≈ 50 ms once per reset) |
| **Hotel OS regression** | Original pre-R0 code and final build snapshotted at the same moment: **0 of 20 pages differ**, identical sync flow, identical presenter event stream, 0 errors |

Defects found and fixed during QA: khorovats size group made orders silently drop (caught by tests); presenter tracked a seeded table-7 order instead of the live one; wrong "order not found" text; search icon overlapping placeholder (CSS layer); family-theme hero contrast; step-list horizontal overflow.

## 4. How to run locally
```bash
cd business-os
npm ci
npm run build && npm start        # http://localhost:3100
```
Open `/r` (launcher) or `/present/restaurant`. The hotel demo is unchanged at `/` and `/present`.

## 5. Known limitations (honest)
- Demo sign-in is a role picker; permissions are enforced in the UI, not by a server (production: auth + RLS, see architecture doc §9).
- The live evening is seeded relative to the reset time. If the demo is reset late at night, part of "earlier tonight" falls on the previous calendar day in the "Today/Yesterday" views. Reset shortly before a meeting.
- Netlify Blobs path is unchanged from the hotel (same code), still not exercised on Netlify here; no deployment was made.
- Staff/kitchen UI is Armenian; shared labels are in `staff-i18n.ts` ready for ru/en. Page-specific staff copy is still inline Armenian.
- Reservations book, accounts, loyalty, CRM, onboarding/messaging, Hotel bridge: not built (R7–R9 not approved). Tonight's reservations appear only as table states.
- Photos: licensed Unsplash images from the existing demo; a pilot uses the client's own photos.
- Lighthouse was not run (not installed); performance checked via replay timing and manual device views.
