# Sales Control Center (Google Sheets, no new software)

**Tabs:**
1. `Leads`: import `LEADS_DATABASE.csv`
2. `Daily`: import `DAILY_SALES_TRACKER.csv`
3. `Cash`: payments ledger
4. `Proposals`: open quotes

## Leads columns
`lead_id, company, market, country, city, segment, contact_person, contact_info, contact_verified, source, potential_need, recommended_offer, language, priority, first_contact_date, last_contact_date, next_follow_up, status, estimated_value_usd, probability, deposit_received_usd, total_cash_collected_usd, assigned_to, notes`

## Pipeline stages (the `status` dropdown)
| Stage | Definition | Default probability |
|---|---|---|
| New Lead | In the list, not yet researched | 0% |
| Researched | Contact verified, first line written | 1% |
| Contacted | First message sent | 2% |
| Replied | Any reply | 5% |
| Interested | Positive reply / asked for details | 15% |
| Meeting | Call held | 25% |
| Proposal | Written scope + price sent | 40% |
| Negotiation | Scope or price being adjusted | 60% |
| **Paid** | **Deposit or test payment received** (only this counts as cash) | 100% (of the paid part) |
| In Delivery | Work in progress | — |
| Completed | Delivered, final payment received | — |
| Retainer / Repeat | Prepaid retainer or 2nd project | — |
| Rejected | Said no (do not contact for 60 days) | 0% |
| Unqualified | Not a fit / no budget / unreachable | 0% |

## Cash tab (the only source for the KPI)
`date_received, client, lead_id, offer, type (test/deposit/balance/retainer/upwork), amount_original, currency, fx_rate, amount_usd, method (bank/SWIFT/Payoneer/Upwork), reference, fees_usd, net_usd, cumulative_usd`

## Formulas
| Measure | Formula |
|---|---|
| **Cash received** | `=SUM(Cash!amount_usd)` |
| Signed value | `=SUMIF(Proposals!status,"Signed",Proposals!value_usd)` |
| Outstanding | Signed value − cash received for those deals |
| Pipeline | `=SUMPRODUCT(Leads!estimated_value_usd, Leads!probability)` for open stages |
| MRR | Sum of active prepaid retainers + monthly fees |
| Remaining to target | `=5000 − cash received` |
