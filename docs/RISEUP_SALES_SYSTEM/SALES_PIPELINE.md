# RISEUP Sales Pipeline: 16 Stages

**How it works:**
- Each lead has **exactly one stage** (Leads → column "Stage").
- When a lead reaches a key stage, type the date in its **stage-date column**. These dates power the funnel metrics.
- The **Pipeline** tab counts leads and value per stage, and shows a bar chart.

| # | Stage | Meaning (entry criteria) | Owner | Record date in | Probability* | Max days in stage |
|---|---|---|---|---|---|---|
| 1 | New Lead | Added from research, not verified | B | Date added | 1% | 3 |
| 2 | Researching | Verifying contact / decision maker | B | — | 1% | 2 |
| 3 | Ready to Contact | Verified, first line prepared | B | — | 2% | 1 |
| 4 | First Contact Sent | First message or call made | B | First contact date | 3% | 14 (follow-ups) |
| 5 | Contacted | Two-way contact made, e.g. a call answered | B | — | 4% | 7 |
| 6 | Replied | Any written reply | B | Replied date | 8% | 2 |
| 7 | Interested | Positive reply / wants to talk | B → A | Interested date | 15% | 3 |
| 8 | Demo Requested | Asked to see a demo | A | — | 20% | 3 |
| 9 | Meeting Scheduled | Call/demo booked | A | Demo/Meeting date | 25% | — |
| 10 | Demo Delivered | Demo or discovery done | A | — | 30% | 1 (proposal ≤ 24 h) |
| 11 | Proposal Sent | Written proposal + price sent | A | Proposal date | 40% | 7 |
| 12 | Negotiation | Discussing scope/price/terms | A | — | 55% | 5 |
| 13 | Accepted — Awaiting Payment | Proposal accepted, invoice sent. **Not won, not cash** | A | Accepted date | 85% | 3 |
| 14 | Paid — Won | Deposit/payment **verified** | A | Paid date | 100% | — |
| 15 | Lost | Said no / no reply after F4 + 30 d | owner | Lost date | 0% | — |
| 16 | Follow-up Later | Not now; date agreed | owner | Next follow-up date | 2% | — |

*Probabilities are planning assumptions (Lists!B2:B17). Edit them after 2 weeks of real data.

## Moving rules
- **Contacted vs First Contact Sent:** use Contacted when a live conversation happened but there's no written reply yet.
- **Accepted — Awaiting Payment** requires a Deal row with "Signed / accepted?" = Yes, an Invoice row, and the Expected next payment + date filled.
- **A deal is WON only when payment is verified.** Stage **Paid — Won** is set only after a Payments row with Verified in bank = Yes. The Dashboard counts "Deals WON" from verified payments only.
- If a deal is only partially paid, keep it in stage 13 until the deposit is verified, then move it to 14 and track the balance in Deals.
- **Lost:** write the reason in Notes (price / timing / no need / no reply / chose a competitor).
- Skipping stages is allowed, e.g. Replied → Meeting Scheduled. Fill the stage dates you passed.

## Visual pipeline
Pipeline tab columns:

| Column | Shows |
|---|---|
| Leads | Count per stage |
| Est. value USD | Sum of "Est. deal value USD" |
| Weighted USD | Value × probability |
| Chart | Leads by stage |

**Pipeline value is never revenue.**
