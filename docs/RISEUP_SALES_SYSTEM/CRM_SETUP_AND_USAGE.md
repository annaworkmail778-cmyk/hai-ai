# RISEUP CRM Setup and Usage

**Status:** no live Google Sheet has been created. Google Sheets API credentials are not configured in this environment. Follow the import steps below (about 10 minutes).

## 1. Import into Google Sheets (recommended for two people)
1. Open Google Drive (the RISEUP account) → **New → File upload** → choose `docs/RISEUP_SALES_SYSTEM/RISEUP_SALES_CRM.xlsx`.
2. Right-click the file → **Open with → Google Sheets**, then **File → Save as Google Sheets**.
   - Work in the new Google Sheets copy, not the .xlsx.
3. Check:
   - **Dashboard** shows "Leads in CRM = 76".
   - **Leads** has dropdowns on Stage, Assigned to, Verification status.
   - The **Follow-ups** live list fills in (Google Sheets supports FILTER).
4. **Share** → add Person B as **Editor**. Turn off "Editors can change permissions".
5. **Protect formulas** (optional but recommended):
   - Data → Protect sheets and ranges → protect the tabs **Dashboard, Pipeline, Follow-ups, Lists** (warning only).
   - In **Leads**, protect columns Z:AD and AM:AR.
6. Settings:
   - **File → Settings → Locale: Armenia or United States; Time zone: (GMT+04:00) Yerevan**.
   - TODAY()-based follow-up statuses depend on the time zone.
7. Mobile: install the Google Sheets app and pin the spreadsheet for quick logging after calls.

**Alternative:** File → Import → Upload → "Replace spreadsheet" inside an existing Sheet.

## 2. Excel / LibreOffice (offline backup)
- Open `RISEUP_SALES_CRM.xlsx` directly. Formulas recalculate on open.
- The Follow-ups live list needs Excel 365. In other versions, filter Leads → "Follow-up status".
- **Weekly backup:** in Google Sheets, File → Download → Microsoft Excel. Save it as `RISEUP_SALES_CRM_backup_YYYY-MM-DD.xlsx` in a private Drive folder. Don't commit files with client data to the public code repository.

## 3. CSV files (for import into other tools)
| File | Contains |
|---|---|
| `RISEUP_LEADS_TEMPLATE.csv` | The 76 leads + all input columns (no formulas) |
| `RISEUP_SALES_ACTIVITIES.csv` | Header only |
| `RISEUP_DEALS_AND_PAYMENTS.csv` | Header only: one flat row per deal for tools that can't link tabs |

To import into a Google Sheets tab: File → Import → Upload → "Insert new sheet". Paste the data into the CRM tab with **Paste values only**, so the formulas stay intact.

## 4. How to log the common situations
| Situation | What to do |
|---|---|
| Sent a first message | Activities: Date, Lead ID, Person, Channel, Type = First contact, Result, Next action/date. Leads: Stage = First Contact Sent, First contact date, Next follow-up date (+2 d) |
| Sent a follow-up | Activities: Type = Follow-up. Leads: Next follow-up date (see "Suggested follow-up") |
| Got a reply | Activities: Type = Reply received. Leads: Stage = Replied or Interested + the stage date + the Score inputs |
| Booked a call/demo | Leads: Stage = Meeting Scheduled, Demo/Meeting date, Next action = "Demo 26 Nov 11:00" |
| Sent a proposal | Deals: new row (Lead ID, Service, Currency, Price, Discount, Structure). Activities: Type = Proposal. Leads: Stage = Proposal Sent + Proposal date + Est. deal value USD |
| Client accepted | Deals: Signed = Yes. Invoices: new row (Invoice No, Deal ID, dates, amount, currency). Leads: Stage = Won — Awaiting Payment + Won date |
| Money arrived | Payments: new row (Date, Deal ID, Invoice No, Amount, Currency, Method, Reference). **Verified = Yes only after you see it in the bank.** Leads: Stage = Paid — Won + Paid date |
| Lost | Leads: Stage = Lost + Lost date + the reason in Notes |

## 5. Person A: daily use
1. **Morning:** Dashboard → "Signed but unpaid", "Pending payments", "Overdue invoices". Chase each one today.
2. Leads filter: Assigned = A, Follow-up status ∈ {Overdue, Today}.
3. After every call or demo: log it in Activities and update Stage + Next action. Score the lead (8 inputs + reason).
4. For each quote: create a Deal, then the Invoice the same day.
5. **Verify payments in the bank** and set Verified = Yes. Only A does this.
6. **Weekly:** update FX in Lists, review the Calculator with real rates, approve discounts.

## 6. Person B: daily use
1. **Morning:**
   - Follow-ups tab: the counts for B.
   - Leads filter: Assigned = B, Follow-up status ∈ {Overdue, Today, No next action}.
2. Add new leads with Source URL, Verification status and Assigned to. Lead IDs continue from the last number (L077…).
3. Log **every** message and follow-up in Activities. Update Stage, Next action and Next follow-up date.
4. Hand over to A: when a lead is Interested, set Assigned to = A and Next action = "A: call".
5. Track proposals: any Deal with "Proposal – not signed" older than 2 days → follow up.
6. **Evening:** fill `DAILY_SALES_REPORT_TEMPLATE.md` (most numbers come from the Dashboard "Today" column). Fill Daily Plan "Main obstacle" and "Tomorrow's top 3".

## 7. Rebuilding the workbook
`python3 docs/RISEUP_SALES_SYSTEM/tools/build_crm.py` regenerates **empty** template files from the lead CSV.
- **Warning:** never run it over a CRM that already contains real data. Live data belongs in Google Sheets.
