# Hotel OS: Demo Guide

## Run

```bash
cd business-os && npm install && npm run build && npm start
```

Open http://localhost:3100/present. A phone on the same Wi‑Fi can join at `http://<laptop-ip>:3100/s/a/hotel`.

**Before every meeting:** click **Reset** in presenter mode. It restores the seed data and clears the scenario state.

## Recommended 20-minute storyline

| Min | Scenario (presenter list) | What to say |
|---|---|---|
| 0–2 | Overview `/admin` | "One screen for the whole hotel." The attention strip links each problem to the place where it is solved |
| 2–5 | **New guest: account and direct booking** | No commission. The status stays honest: a request until reception approves it |
| 5–7 | **OTA booking (demo adapter)** | All channels in one calendar. Duplicates are ignored and conflicts never double-book. Real connection goes through a certified channel manager |
| 7–9 | **Reception: check-in, folio, room move** | Folio balance; payments recorded manually (no card charges in the demo) |
| 9–12 | **WhatsApp question → AI draft → approval** | One inbox; AI answers only from hotel facts; money, cancellation and medical topics always go to a person |
| 12–14 | **Room QR: fresh towels** + housekeeper phone | The QR exposes no guest data. The request reaches the right department |
| 14–16 | **Negative review → AI reply → manager approval** | Publishing only where an official API allows it; Tripadvisor is manual |
| 16–17 | **Checkout and automatic cleaning** | The automations log shows each rule ran exactly once |
| 17–19 | **AI business assistant: daily summary** | Every number has a formula; finance is visible to managers only |
| 19–20 | `/admin/integrations` | The honest integration matrix: what is possible, what needs approval |

## Honesty lines to say out loud

- "The channels are simulated in this demo. Connecting them requires your accounts and the providers' approval."
- "The AI does not send messages, publish replies or change prices without a person."
- "The figures are generated demo data; formulas are shown under each number."
