# RISEUP Sales CRM Guide

**File:** `RISEUP_SALES_CRM.xlsx`. One workbook, 12 tabs, built for two people.

| Tab | Purpose | Who edits |
|---|---|---|
| README | Short instructions | — |
| **Dashboard** | Target, collected, pipeline, funnel, breakdowns, periods, team | Read-only |
| **Leads** | One row per company: contact data, stage, next action, score, stage dates | B (data), A (score, value) |
| **Activities** | One row per touch: call, message, meeting, demo, proposal, payment request | Both: **log everything** |
| **Deals** | One row per quote: service, price, discount, payment structure, signed?, auto-calculated collected/remaining/status | A |
| **Invoices** | One row per invoice: deposit, balance, monthly; auto outstanding/overdue | A |
| **Payments** | One row per money receipt. **Only "Verified in bank? = Yes" counts** | A (B may enter, A verifies) |
| Pipeline | Count/value/weighted value per stage + chart | Read-only |
| Follow-ups | Counts of Overdue/Today/Upcoming/No next action per person; live list in Google Sheets | Read-only |
| Daily Plan | 30-day targets vs auto-calculated actuals and cumulative cash | Read-only, except "Main obstacle" / "Tomorrow's top 3" |
| Calculator | Revenue scenarios (assumptions) | A |
| Lists | Dropdown values, target, sprint dates, FX, follow-up cadence, stage probabilities | A only |

## Data flow
```
Leads ──(Lead ID)──► Activities   → last contact, follow-up count, follow-up status
  │
  └──(Lead ID)──► Deals ──(Deal ID)──► Invoices ──(Invoice No)──► Payments (verified) ──► Dashboard cash
```

## Payment logic
**Deal:**
- Final value = Proposed price × (1 − discount).
- Deposit required = Final value × first-payment % of the structure:

| Structure | First payment |
|---|---|
| 100% upfront | 100% |
| 50/50 | 50% |
| 40/30/30 | 40% |
| Monthly retainer | 100% of the month |
| Hourly block | 100% of the block |

- Collected = SUM of verified payments for this Deal ID. Remaining = Final value − Collected.

**Payment status (automatic):**
- Proposal – not signed
- Signed – not invoiced
- Invoiced – awaiting payment
- Invoice overdue
- Partially paid
- Partially paid – overdue
- Paid in full

**Currencies:**
- Amounts are entered in the original currency (AMD/USD/EUR) and converted with the Lists FX table (units per 1 USD).
- **Update the FX rate** to the bank's rate before month-end reporting. Default AMD 388 / EUR 0.93 are assumptions.
- **Unpaid money is never counted as collected.** Invoices and signed deals appear only as "Not cash".

## Follow-up logic
- **Default cadence:** +2, +4, +7, +14 days after the last contact. Edit it in Lists!U2:U5.
- **Suggested follow-up** proposes the date from the last activity and the number of follow-ups already sent. The owner then types the real **Next follow-up date**.
- **Follow-up status:**

| Status | Meaning |
|---|---|
| Overdue | Next date is in the past |
| Today | Next date is today |
| Upcoming | Next date is in the future |
| No next action | Active lead without a date. **Fix immediately** |
| Not started | New or researching lead |
| Closed | Paid or Lost |

## Daily discipline (5 minutes, morning and evening)
**Morning:**
1. Dashboard: check Overdue follow-ups (red) and No next action.
2. Leads filter: Follow-up status = Overdue, Today, assigned to you.

**Evening:**
1. Log all activities.
2. Update Stage, Next action and Next follow-up date for every touched lead.
3. Type the stage dates.

See `CRM_SETUP_AND_USAGE.md` for setup and Google Sheets import.
