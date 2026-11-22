# RISEUP Sales Dashboard Specification (CRM tab "Dashboard")

The dashboard is a tab inside `RISEUP_SALES_CRM.xlsx`. There's no separate file, because a separate dashboard file couldn't read live CRM data without links.
- All values are formulas.
- **Collected revenue** = sum of Payments → "Amount USD" where "Verified in bank?" = Yes. Everything else is labelled "Not cash".

## Revenue block
| # | Metric | Formula logic |
|---|---|---|
| 1 | Revenue target | Lists!Y2 (5,000) |
| 2 | Actual collected (verified) | SUMIFS(Payments USD, Verified = Yes) |
| — | % of target | collected ÷ target |
| 3 | Remaining | MAX(0, target − collected) |
| 4 | Signed but unpaid | SUMIFS(Deals Remaining USD, Signed = Yes) |
| 5 | Issued invoices | SUM(Invoices Amount USD) |
| 6 | Pending payments | SUM of outstanding invoice USD > 0 |
| — | Overdue invoices | COUNTIF(Invoice status = Overdue) |
| — | Received, not verified | SUMIFS(Payments USD, Verified = No) |
| 10 | Open pipeline value | SUMIFS(Lead value, Open = Yes) |
| — | Weighted pipeline | SUMIFS(Lead weighted value, Open = Yes) |
| — | **Forecast** | collected + 80% × signed-unpaid + weighted pipeline |
| — | Net after fees | SUMIFS(Payments Net USD, Verified = Yes) |

## Funnel block
Each count is based on the stage-date columns in Leads, so it counts leads that ever reached the stage, not only leads in it now.

| Metric | Formula logic |
|---|---|
| Leads in CRM | Count of leads |
| New leads this week | Count by Date added |
| Contacted | COUNT(First contact date) |
| Replied | COUNT(Replied date) |
| Response rate | replied ÷ contacted |
| Interested | COUNT(Interested date) |
| Demos / meetings | COUNT(Demo/Meeting date) |
| Proposals sent | COUNT(Proposal date) |
| Deals WON (payment verified) | COUNTIF(Deals Collected > 0) |
| Accepted deals still awaiting first payment | COUNTIFS(Signed = Yes, Collected = 0) |
| Expected payments next 7 days | SUMIFS(Deals Expected next payment USD, Expected payment date within 7 days). Not cash |
| Payments (verified count) | COUNTIF(Payments Verified = Yes) |
| Average payment | collected ÷ payments |
| Conversion rates | contacted → interested → proposal → won |
| Overdue follow-ups, due today, no next action | From Leads "Follow-up status" |
| Contacted with no reply after 4+ days | From Leads "Days since contact" |

## Breakdowns (verified cash and payment count)
- **By sales channel** (+ bar chart), **by service**, **by market**, **by country**.
- Channel, service and market come from the Deal; country comes from the Lead.

## Period views
| Row | Today | This week (Mon–Sun) | 30-day sprint |
|---|---|---|---|
| Collected (verified) | ✓ | ✓ | ✓ |
| Activities per type (first contact, follow-up, call, meeting, demo, proposal, payment request) | ✓ | ✓ | ✓ |
| New leads | ✓ | ✓ | ✓ |

**Monthly view:** the sprint column covers Lists!Y3:Y4. Change those dates for other months.

## Team block (this week, Person A vs Person B)
- Activities by type.
- Open leads assigned.
- Overdue follow-ups.
- Collected on the deals each person owns.

## Daily Plan tab
- **Targets:** 30 rows (23 Nov – 22 Dec) with targets per day.
- **Actuals:** counted automatically from Activities and Payments.
- **Cash:** cumulative cash and the gap vs target. Red = behind.

## Compatibility
| Feature | Google Sheets | Excel 2019 / 365 | LibreOffice |
|---|---|---|---|
| SUMIFS, COUNTIFS, MAXIFS, MINIFS, INDEX/MATCH | ✓ | ✓ | ✓ (verified with LibreOffice 24.2) |
| Live FILTER list in the Follow-ups tab | ✓ | 365 only | Shows #N/A (use the Leads filter instead) |
