# RISEUP Restaurant OS: Demo Guide

How to run and present the demo. Fictional restaurant **Summit Table** (Tsaghkadzor), fictional data. Nothing is deployed from this branch; run locally.

## 1. Run

```bash
cd business-os && npm install && npm run build && npx next start -p 3000
```

Open `http://localhost:3000/r` (launcher) or `http://localhost:3000/present/restaurant` (presenter).

## 2. Screens

| Who | URL | Device |
|---|---|---|
| Guest website / booking / chat | `/restaurant/hy` · `/restaurant/en/reserve` | phone or laptop |
| Guest at table (QR) | `/q/<session>/<token>` (presenter shows the QR for table 7) | phone |
| Waiter | `/r/floor` | phone |
| Kitchen | `/r/kds` (station filter in header) | tablet / TV |
| Host | `/r/host` | tablet |
| Owner / manager | `/r/admin` (+ inbox, reviews, customers, assistant, team, floor plan, inventory, purchasing, analytics, savings, automations, integrations) | laptop |

Staff identity: avatar menu → pick a demo person (owner, manager, host, waiter, chef, cook, bartender, cashier, stock). This is a demo picker, not authentication. Staff language: HY / RU / EN switch on waiter, KDS and host screens.

## 3. Presenter scenarios (`/present/restaurant`)

Three live frames on one shared session: guest phone (or waiter phone), owner laptop, kitchen display. Every "Auto" button dispatches the same events a person would; nothing is faked.

| ID | Scenario | Covers |
|---|---|---|
| A | Guest orders from the table (QR) | QR ordering, accept, station routing, KDS updates, ready, serve, analytics |
| W | Waiter without paper | Paperless order with seats & courses, held course, kitchen, ready notify, serve, fire course 2, add items, bill by seat, **simulated** card terminal, cash, close, cleaning |
| B | Online takeaway | Website, pickup slots, accept, kitchen, ready, pickup code, simulated SMS |
| M | Messages & reviews | **Simulated** WhatsApp booking inquiry, AI draft with intent/risk/facts, human approval, Instagram hours question → low-risk auto-reply, Google 2★ review → task → AI reply → **simulated** publish |
| C | Food cost & stock | Inventory, ingredient, recipe cost, supplier price change, margin impact |
| O | Stock, reorder, AI summary | Automatic stock decrease, waste below minimum → automatic **draft** PO, AI business assistant, day close summary |
| F | Owner's morning | Overview, channels, menu engineering, cost problems, stock signals, opportunities |

### The 15 requested end-to-end scenarios

| # | Scenario | Where |
|---|---|---|
| 1 | QR table order | A1–A3 |
| 2 | Paperless waiter order | W1–W2 |
| 3 | Routing to stations | A5, W3 |
| 4 | KDS status updates | A5–A6, W3 |
| 5 | Ready notification & serve | A6–A7, W4 |
| 6 | Add items | W6 |
| 7 | Bill & simulated payment | W7–W8 |
| 8 | Close table | W9 |
| 9 | WhatsApp / Instagram simulated inquiry | M1, M4 |
| 10 | AI draft approval | M2–M3 |
| 11 | Google review via adapter (simulated) | M5 |
| 12 | Review reply | M6 |
| 13 | Inventory decrease | O1 |
| 14 | Reorder → purchase draft | O2–O3 |
| 15 | AI daily summary | O4–O5 |

### Reset
"Reset data" (top right) restores the seed for the selected presenter session (A or B); optional PIN. Each scenario also has its own restart button.

## 4. What to say about simulations

* "Simulation · not sent" badges mark every external message, SMS, supplier order and Google publish.
* The card terminal is a **simulated adapter**; the bill shows "Paid (confirmed)" only after the adapter answers.
* WhatsApp, Instagram, Messenger and email need the provider onboarding listed on the Integrations page.
* Tripadvisor and TheFork replies are posted manually (no public reply API).
* Fiscal receipts remain on the restaurant's existing cash register.

## 5. Verified flows (automated)

* Core E2E (`e2e.js`): scenarios A, B, C, F, permissions, sold-out propagation — all pass.
* Operations E2E (`e2e-ops.js`, 5 separate devices): waiter courses → KDS held → fire → serve → bill → declined & approved simulated payment → close; website booking → host confirm; website chat → inbox draft (allergy escalated) → approved reply delivered; payment results only from the simulated adapter — 11/11 pass.
* Presenter W/M/O auto-run with independent replay check: table closed via bill, auto-reply simulated, review published (simulated), automatic PO draft, day summary.
