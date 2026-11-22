"""Builds the RISEUP sales CRM workbook, the daily tracker and the CSV templates.

Run:  python3 docs/RISEUP_SALES_SYSTEM/tools/build_crm.py
Inputs: docs/HAI_AI_30_DAY/LEADS_DATABASE.csv (76 sourced leads, contacts unverified)
Outputs (in docs/RISEUP_SALES_SYSTEM/):
  RISEUP_SALES_CRM.xlsx, RISEUP_DAILY_TRACKER.xlsx,
  RISEUP_LEADS_TEMPLATE.csv, RISEUP_SALES_ACTIVITIES.csv, RISEUP_DEALS_AND_PAYMENTS.csv
Formulas use functions supported by Google Sheets, Excel 2019+ and LibreOffice (SUMIFS, COUNTIFS,
MAXIFS, MINIFS, INDEX/MATCH, IFERROR). No sample payments or fake activities are included.
"""
import csv
import datetime as dt
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "RISEUP_SALES_SYSTEM"
SRC = ROOT / "docs" / "HAI_AI_30_DAY" / "LEADS_DATABASE.csv"
START = dt.date(2026, 11, 23)
MAX_ROWS = 500  # formula/validation range per table

ORANGE, INK, PAPER = "FF5B14", "0B0B0C", "F3F2EE"
H_FILL = PatternFill("solid", fgColor=INK)
H_FONT = Font(bold=True, color="FFFFFF")
IN_FILL = PatternFill("solid", fgColor="FFF4E5")  # input cells
CALC_FILL = PatternFill("solid", fgColor="EEF3FF")  # formula cells
RED = PatternFill("solid", fgColor="F8D7DA")
AMBER = PatternFill("solid", fgColor="FFF3CD")
GREEN = PatternFill("solid", fgColor="D4EDDA")
GREY = PatternFill("solid", fgColor="E2E3E5")
thin = Side(style="thin", color="DDDDDD")

STAGES = ["New Lead", "Researching", "Ready to Contact", "First Contact Sent", "Contacted", "Replied", "Interested",
          "Demo Requested", "Meeting Scheduled", "Demo Delivered", "Proposal Sent", "Negotiation",
          "Won — Awaiting Payment", "Paid — Won", "Lost", "Follow-up Later"]
STAGE_PROB = [0.01, 0.01, 0.02, 0.03, 0.04, 0.08, 0.15, 0.2, 0.25, 0.3, 0.4, 0.55, 0.85, 1.0, 0.0, 0.02]
MARKETS = ["Armenia", "Russian-speaking", "Europe/US", "Other"]
COUNTRIES = ["Armenia", "Georgia", "Kazakhstan", "Russia", "Germany", "Netherlands", "United Kingdom", "United States",
             "Australia", "Other", "Unknown – verify"]


def norm_country(raw):
    r = raw.lower()
    for keys, c in ((('armenia', 'yerevan'), 'Armenia'), (('kazakh', 'almaty'), 'Kazakhstan'), (('georgia', 'tbilisi'), 'Georgia'),
                    (('uk', 'london', 'manchester', 'loughborough'), 'United Kingdom'), (('germany', 'cologne', 'dach'), 'Germany'),
                    (('netherlands',), 'Netherlands'), (('australia', 'sydney'), 'Australia')):
        if any(k in r for k in keys):
            return c
    return 'Unknown – verify'

SEGMENTS = ["Agency – Marketing/SMM", "Agency – Web/Design/Branding", "Agency – SEO", "CRM / Bitrix24 / Kommo partner",
            "Automation / AI / GHL agency", "Software studio (overflow)", "Direct – Beauty / Clinic",
            "Direct – Restaurant / Shop", "Direct – Real estate", "Direct – Other", "Upwork / Contra client", "Creator"]
CHANNELS = ["Agency partnership", "Direct business", "Upwork/Contra", "Creator"]
ACT_CHANNELS = ["Call", "Email", "Instagram", "LinkedIn", "WhatsApp", "Telegram", "Meeting", "Upwork/Contra", "In person", "Other"]
ACT_TYPES = ["First contact", "Follow-up", "Call", "Meeting", "Demo", "Proposal", "Negotiation", "Payment request", "Reply received", "Note"]
RESULTS = ["No answer", "Replied", "Interested", "Not interested", "Meeting booked", "Demo delivered", "Proposal sent",
           "Won", "Lost", "Wrong contact", "Other"]
SERVICES = [  # code, label, default price USD (approved list, EU/US recommended; AMD direct converted)
    ("WL-0", "WL-0 Paid test", 300), ("WL-1", "WL-1 Landing page", 600), ("WL-2", "WL-2 Website", 1200),
    ("WL-3", "WL-3 Automation / AI assistant", 1200), ("WL-4", "WL-4 Dashboard / Web app", 2200),
    ("WL-R30", "WL-R Capacity 30h/month", 1200), ("WL-R60", "WL-R Capacity 60h/month", 2200),
    ("DC-1", "DC-1 AI Administrator + Booking", 232), ("DC-2", "DC-2 Online Ordering System", 387),
    ("DC-3", "DC-3 Real Estate Lead System", 966), ("WEB", "Website (direct)", 387), ("VID", "AI video", 155),
    ("MKT", "Marketing add-on (monthly)", 52), ("CUST", "Custom / Upwork project", 500), ("CP-1", "Creator validation sprint", 300)]
PERSONS = ["A", "B"]
GRADES = ["A", "B", "C"]
VERIF = ["Unverified", "Verified", "Invalid"]
STRUCTS = [("100% upfront", 1.0), ("50/50", 0.5), ("40/30/30", 0.4), ("Monthly retainer", 1.0), ("Hourly block", 1.0)]
PROJECT_STATUS = ["Not started", "In progress", "Delivered", "Accepted", "On hold", "Cancelled"]
FX = [("USD", 1), ("AMD", 388), ("EUR", 0.93)]  # units per 1 USD — UPDATE with the bank rate
METHODS = ["Bank transfer AMD", "Bank SWIFT USD/EUR", "Payoneer", "Upwork payout", "Cash with receipt", "Other"]
YESNO = ["Yes", "No"]
SCORE_KEYS = [("Pay", 15), ("Urgency", 15), ("Need", 15), ("DM access", 15), ("Deal size", 10),
              ("Close ≤30d", 15), ("Repeat", 5), ("Pay speed", 10)]


def header(ws, cols, row=1, widths=None):
    for i, c in enumerate(cols, 1):
        cell = ws.cell(row=row, column=i, value=c)
        cell.fill, cell.font = H_FILL, H_FONT
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(c, max(12, min(28, len(c) + 4)))
    ws.freeze_panes = ws.cell(row=row + 1, column=3)
    ws.row_dimensions[row].height = 34


def rng(sheet, col, n):
    return f"'{sheet}'!${col}$2:${col}${n + 1}"


def add_list(ws, sqref, source, prompt=None):
    dv = DataValidation(type="list", formula1=source, allow_blank=True)
    if prompt:
        dv.promptTitle, dv.prompt = "Choose", prompt
    ws.add_data_validation(dv)
    dv.add(sqref)


def col_of(cols, name):
    return get_column_letter(cols.index(name) + 1)


def build_lists(wb):
    ws = wb.create_sheet("Lists")
    data = {
        "A": ("Stage", STAGES), "B": ("Stage probability", STAGE_PROB), "C": ("Market", MARKETS),
        "D": ("Segment", SEGMENTS), "E": ("Sales channel", CHANNELS), "F": ("Activity channel", ACT_CHANNELS),
        "G": ("Activity type", ACT_TYPES), "H": ("Result", RESULTS), "I": ("Service", [s[1] for s in SERVICES]),
        "J": ("Default price USD", [s[2] for s in SERVICES]), "K": ("Person", PERSONS), "L": ("Grade", GRADES),
        "M": ("Verification", VERIF), "N": ("Payment structure", [s[0] for s in STRUCTS]),
        "O": ("First payment %", [s[1] for s in STRUCTS]), "P": ("Project status", PROJECT_STATUS),
        "Q": ("Currency", [f[0] for f in FX]), "R": ("Units per 1 USD", [f[1] for f in FX]),
        "S": ("Payment method", METHODS), "T": ("Yes/No", YESNO), "U": ("Follow-up cadence (days)", [2, 4, 7, 14]),
        "V": ("Score 0–5", [0, 1, 2, 3, 4, 5]), "W": ("Country", COUNTRIES),
    }
    for col, (title, values) in data.items():
        ws[f"{col}1"] = title
        ws[f"{col}1"].fill, ws[f"{col}1"].font = H_FILL, H_FONT
        ws.column_dimensions[col].width = 26
        for i, v in enumerate(values, 2):
            ws[f"{col}{i}"] = v
    ws["X1"], ws["X2"] = "Settings", "Revenue target USD"
    ws["Y2"] = 5000
    ws["X3"], ws["Y3"] = "Sprint start", START
    ws["X4"], ws["Y4"] = "Sprint end", START + dt.timedelta(days=29)
    ws["X5"], ws["Y5"] = "Note", "Update FX (column R) with the bank rate; AMD/EUR per 1 USD."
    ws["Y3"].number_format = ws["Y4"].number_format = "yyyy-mm-dd"
    ws.column_dimensions["X"].width = 22
    ws.column_dimensions["Y"].width = 50
    for c in ("Y2", "Y3", "Y4", "R2", "R3", "R4"):
        ws[c].fill = IN_FILL
    return {k: f"Lists!${k}$2:${k}${len(v[1]) + 1}" for k, v in data.items()}


LEAD_COLS = ["Lead ID", "Company", "Date added", "Website", "Instagram", "LinkedIn", "Country", "City", "Market",
             "Segment", "Business category", "Sales channel", "Language", "Contact person", "Position", "Email",
             "Phone / WhatsApp", "Source", "Verification status", "Assigned to", "Potential service",
             "Est. deal value USD", "Stage", "Next action", "Next follow-up date", "Last contact date",
             "Follow-ups sent", "Suggested follow-up", "Follow-up status", "Days since contact"] + \
            [f"Score: {k} (0-5)" for k, _ in SCORE_KEYS] + \
            ["Lead score", "Grade", "Score reason", "Stage probability", "Weighted value USD", "Open?",
             "First contact date", "Replied date", "Interested date", "Demo/Meeting date", "Proposal date",
             "Won date", "Paid date", "Lost date", "Notes"]


def map_segment(seg, market):
    s = seg.lower()
    if "direct" in s:
        return "Direct – Other"
    if any(k in s for k in ("bitrix", "kommo", "crm")):
        return "CRM / Bitrix24 / Kommo partner"
    if any(k in s for k in ("n8n", "automation", "ghl", "gohighlevel", "ai ")):
        return "Automation / AI / GHL agency"
    if any(k in s for k in ("marketing", "smm", "media", "advertis", "social")):
        return "Agency – Marketing/SMM"
    if "seo" in s:
        return "Agency – SEO"
    if any(k in s for k in ("design", "brand", "creative", "ux")):
        return "Agency – Web/Design/Branding"
    if any(k in s for k in ("software", "golang", "laravel", "custom")):
        return "Software studio (overflow)"
    return "Agency – Web/Design/Branding"


def build_leads(wb, L):
    ws = wb.create_sheet("Leads", 1)
    cols = LEAD_COLS
    header(ws, cols, widths={"Company": 30, "Source": 40, "Next action": 30, "Notes": 40, "Score reason": 34,
                             "Business category": 30})
    c = {n: col_of(cols, n) for n in cols}
    rows = list(csv.DictReader(open(SRC, encoding="utf-8")))
    direct_map = {"HosDog / Bistro": "Direct – Restaurant / Shop",
                  "Real estate client (WhatsApp-group site)": "Direct – Real estate"}
    for r_i, r in enumerate(rows, 2):
        direct = "Direct" in r["segment"]
        seg = direct_map.get(r["company"], map_segment(r["segment"], r["market"])) if direct else map_segment(r["segment"], r["market"])
        vals = {
            "Lead ID": r["lead_id"], "Company": r["company"], "Date added": dt.date(2026, 11, 22),
            "Country": norm_country(r["country"]), "City": r["city"], "Market": r["market"], "Segment": seg,
            "Business category": r["segment"], "Sales channel": "Direct business" if direct else "Agency partnership",
            "Language": r["language"], "Source": r["source"], "Verification status": "Unverified",
            "Assigned to": "A" if direct else "B", "Stage": "Ready to Contact" if direct else "New Lead",
            "Next action": "Call (warm lead): confirm status, offer, permission" if direct else "Verify contact + decision maker",
            "Next follow-up date": START if direct or r["priority"] == "1" else None,
            "Notes": f"Recommended offer: {r['recommended_offer']}. {r['potential_need']}. Prior priority {r['priority']} (2026-11-22 research). Location as listed: {r['country']}. Contacts NOT verified.",
        }
        for name, v in vals.items():
            ws[f"{c[name]}{r_i}"] = v
    n = MAX_ROWS
    for i in range(2, n + 2):
        A = f"{c['Lead ID']}{i}"
        st, nf, last = f"{c['Stage']}{i}", f"{c['Next follow-up date']}{i}", f"{c['Last contact date']}{i}"
        ws[f"{c['Last contact date']}{i}"] = f'=IF({A}="","",IF(_xlfn.MAXIFS(Activities!$B:$B,Activities!$C:$C,{A})=0,"",_xlfn.MAXIFS(Activities!$B:$B,Activities!$C:$C,{A})))'
        ws[f"{c['Follow-ups sent']}{i}"] = f'=IF({A}="","",COUNTIFS(Activities!$C:$C,{A},Activities!$G:$G,"Follow-up"))'
        fs = f"{c['Follow-ups sent']}{i}"
        ws[f"{c['Suggested follow-up']}{i}"] = f'=IF(OR({A}="",{last}="",{fs}="",{fs}>=4),"",{last}+INDEX(Lists!$U$2:$U$5,{fs}+1))'
        ws[f"{c['Follow-up status']}{i}"] = (f'=IF({A}="","",IF(OR({st}="Paid — Won",{st}="Lost"),"Closed",'
                                              f'IF({nf}="",IF(OR({st}="New Lead",{st}="Researching"),"Not started","No next action"),'
                                              f'IF({nf}<TODAY(),"Overdue",IF({nf}=TODAY(),"Today","Upcoming")))))')
        ws[f"{c['Days since contact']}{i}"] = f'=IF(OR({A}="",{last}=""),"",TODAY()-{last})'
        sc = [f"{c[f'Score: {k} (0-5)']}{i}" for k, _ in SCORE_KEYS]
        weighted = "+".join(f"{s}*{w}" for s, (_, w) in zip(sc, SCORE_KEYS))
        ws[f"{c['Lead score']}{i}"] = f'=IF(COUNT({sc[0]}:{sc[-1]})<8,"",ROUND(({weighted})/5,0))'
        ls = f"{c['Lead score']}{i}"
        ws[f"{c['Grade']}{i}"] = f'=IF({ls}="","",IF({ls}>=70,"A",IF({ls}>=50,"B","C")))'
        ws[f"{c['Stage probability']}{i}"] = f'=IF({st}="","",IFERROR(INDEX(Lists!$B$2:$B$17,MATCH({st},Lists!$A$2:$A$17,0)),""))'
        ws[f"{c['Open?']}{i}"] = f'=IF({A}="","",IF(OR({st}="Paid — Won",{st}="Lost"),"No","Yes"))'
        ev, sp = f"{c['Est. deal value USD']}{i}", f"{c['Stage probability']}{i}"
        ws[f"{c['Weighted value USD']}{i}"] = f'=IF(OR({ev}="",{sp}=""),"",{ev}*{sp})'
        for name in ("Date added", "Next follow-up date", "Last contact date", "Suggested follow-up", "First contact date",
                     "Replied date", "Interested date", "Demo/Meeting date", "Proposal date", "Won date", "Paid date", "Lost date"):
            ws[f"{c[name]}{i}"].number_format = "yyyy-mm-dd"
        for name in ("Last contact date", "Follow-ups sent", "Suggested follow-up", "Follow-up status", "Days since contact",
                     "Lead score", "Grade", "Stage probability", "Weighted value USD", "Open?"):
            ws[f"{c[name]}{i}"].fill = CALC_FILL
    last_row = n + 1
    vlist = {"Country": L["W"], "Market": L["C"], "Segment": L["D"], "Sales channel": L["E"], "Verification status": L["M"],
             "Assigned to": L["K"], "Potential service": L["I"], "Stage": L["A"]}
    for name, src in vlist.items():
        add_list(ws, f"{c[name]}2:{c[name]}{last_row}", "=" + src)
    for k, _ in SCORE_KEYS:
        add_list(ws, f"{c[f'Score: {k} (0-5)']}2:{c[f'Score: {k} (0-5)']}{last_row}", "=" + L["V"])
    fu = f"{c['Follow-up status']}2:{c['Follow-up status']}{last_row}"
    ws.conditional_formatting.add(fu, CellIsRule(operator="equal", formula=['"Overdue"'], fill=RED))
    ws.conditional_formatting.add(fu, CellIsRule(operator="equal", formula=['"Today"'], fill=AMBER))
    ws.conditional_formatting.add(fu, CellIsRule(operator="equal", formula=['"No next action"'], fill=GREY))
    gr = f"{c['Grade']}2:{c['Grade']}{last_row}"
    ws.conditional_formatting.add(gr, CellIsRule(operator="equal", formula=['"A"'], fill=GREEN))
    ws.conditional_formatting.add(gr, CellIsRule(operator="equal", formula=['"B"'], fill=AMBER))
    stg = f"{c['Stage']}2:{c['Stage']}{last_row}"
    ws.conditional_formatting.add(stg, CellIsRule(operator="equal", formula=['"Paid — Won"'], fill=GREEN))
    ws.conditional_formatting.add(stg, CellIsRule(operator="equal", formula=['"Lost"'], fill=GREY))
    ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{last_row}"
    return c


ACT_COLS = ["Activity ID", "Date", "Lead ID", "Company", "Person", "Channel", "Type", "Summary", "Result",
            "Next action", "Next action date"]


def build_activities(wb, L):
    ws = wb.create_sheet("Activities", 2)
    header(ws, ACT_COLS, widths={"Summary": 44, "Next action": 34, "Company": 28})
    for i in range(2, MAX_ROWS + 2):
        ws[f"A{i}"] = f'=IF(C{i}="","","ACT-"&TEXT(ROW()-1,"0000"))'
        ws[f"D{i}"] = f'=IF(C{i}="","",IFERROR(INDEX(Leads!$B:$B,MATCH(C{i},Leads!$A:$A,0)),"⚠ unknown Lead ID"))'
        ws[f"B{i}"].number_format = ws[f"K{i}"].number_format = "yyyy-mm-dd"
        ws[f"A{i}"].fill = ws[f"D{i}"].fill = CALC_FILL
    r = MAX_ROWS + 1
    add_list(ws, f"E2:E{r}", "=" + L["K"])
    add_list(ws, f"F2:F{r}", "=" + L["F"])
    add_list(ws, f"G2:G{r}", "=" + L["G"])
    add_list(ws, f"I2:I{r}", "=" + L["H"])
    ws.auto_filter.ref = f"A1:K{r}"


DEAL_COLS = ["Deal ID", "Lead ID", "Company", "Sales channel", "Market", "Service", "Currency", "Proposed price",
             "Discount %", "Final contract value", "Payment structure", "First payment %", "Deposit required",
             "Signed / accepted?", "Invoiced (orig)", "Collected (orig, verified)", "Remaining balance (orig)",
             "Deposit received?", "FX units per USD", "Final value USD", "Collected USD", "Remaining USD",
             "Next due date", "Last payment date", "Payment status", "Project status", "Owner", "Notes"]


def build_deals(wb, L):
    ws = wb.create_sheet("Deals", 3)
    header(ws, DEAL_COLS, widths={"Company": 26, "Service": 30, "Notes": 34, "Payment status": 24})
    for i in range(2, MAX_ROWS + 2):
        f = {
            "A": f'=IF(B{i}="","","D-"&TEXT(ROW()-1,"000"))',
            "C": f'=IF(B{i}="","",IFERROR(INDEX(Leads!$B:$B,MATCH(B{i},Leads!$A:$A,0)),"⚠ unknown Lead ID"))',
            "D": f'=IF(B{i}="","",IFERROR(INDEX(Leads!$L:$L,MATCH(B{i},Leads!$A:$A,0)),""))',
            "E": f'=IF(B{i}="","",IFERROR(INDEX(Leads!$I:$I,MATCH(B{i},Leads!$A:$A,0)),""))',
            "J": f'=IF(H{i}="","",H{i}*(1-IF(I{i}="",0,I{i})))',
            "L": f'=IF(K{i}="","",IFERROR(INDEX(Lists!$O$2:$O$6,MATCH(K{i},Lists!$N$2:$N$6,0)),""))',
            "M": f'=IF(OR(J{i}="",L{i}=""),"",J{i}*L{i})',
            "O": f'=IF(A{i}="","",SUMIFS(Invoices!$F:$F,Invoices!$B:$B,A{i}))',
            "P": f'=IF(A{i}="","",SUMIFS(Payments!$F:$F,Payments!$C:$C,A{i},Payments!$L:$L,"Yes"))',
            "Q": f'=IF(J{i}="","",J{i}-P{i})',
            "R": f'=IF(OR(M{i}="",P{i}=""),"",IF(P{i}>=M{i},"Yes",IF(P{i}>0,"Partial","No")))',
            "S": f'=IF(G{i}="","",IFERROR(INDEX(Lists!$R$2:$R$4,MATCH(G{i},Lists!$Q$2:$Q$4,0)),""))',
            "T": f'=IF(OR(J{i}="",S{i}=""),"",J{i}/S{i})',
            "U": f'=IF(A{i}="","",SUMIFS(Payments!$I:$I,Payments!$C:$C,A{i},Payments!$L:$L,"Yes"))',
            "V": f'=IF(T{i}="","",T{i}-U{i})',
            "W": f'=IF(A{i}="","",IF(_xlfn.MINIFS(Invoices!$D:$D,Invoices!$B:$B,A{i},Invoices!$J:$J,">0")=0,"",_xlfn.MINIFS(Invoices!$D:$D,Invoices!$B:$B,A{i},Invoices!$J:$J,">0")))',
            "X": f'=IF(A{i}="","",IF(_xlfn.MAXIFS(Payments!$B:$B,Payments!$C:$C,A{i},Payments!$L:$L,"Yes")=0,"",_xlfn.MAXIFS(Payments!$B:$B,Payments!$C:$C,A{i},Payments!$L:$L,"Yes")))',
            "Y": (f'=IF(J{i}="","",IF(P{i}>=J{i},"Paid in full",IF(P{i}>0,IF(AND(W{i}<>"",W{i}<TODAY()),"Partially paid – overdue","Partially paid"),'
                  f'IF(O{i}=0,IF(N{i}="Yes","Signed – not invoiced","Proposal – not signed"),IF(AND(W{i}<>"",W{i}<TODAY()),"Invoice overdue","Invoiced – awaiting payment")))))'),
        }
        for col, formula in f.items():
            ws[f"{col}{i}"] = formula
            ws[f"{col}{i}"].fill = CALC_FILL
        for col in ("W", "X"):
            ws[f"{col}{i}"].number_format = "yyyy-mm-dd"
        ws[f"I{i}"].number_format = "0%"
        ws[f"L{i}"].number_format = "0%"
        for col in ("T", "U", "V"):
            ws[f"{col}{i}"].number_format = '"$"#,##0'
    r = MAX_ROWS + 1
    add_list(ws, f"F2:F{r}", "=" + L["I"])
    add_list(ws, f"G2:G{r}", "=" + L["Q"])
    add_list(ws, f"K2:K{r}", "=" + L["N"])
    add_list(ws, f"N2:N{r}", "=" + L["T"])
    add_list(ws, f"Z2:Z{r}", "=" + L["P"])
    add_list(ws, f"AA2:AA{r}", "=" + L["K"])
    ys = f"Y2:Y{r}"
    ws.conditional_formatting.add(ys, CellIsRule(operator="equal", formula=['"Paid in full"'], fill=GREEN))
    ws.conditional_formatting.add(ys, FormulaRule(formula=['ISNUMBER(SEARCH("overdue",Y2))'], fill=RED))
    ws.conditional_formatting.add(ys, FormulaRule(formula=['ISNUMBER(SEARCH("Partially",Y2))'], fill=AMBER))
    ws.auto_filter.ref = f"A1:AB{r}"


INV_COLS = ["Invoice No", "Deal ID", "Issue date", "Due date", "Description", "Amount (orig)", "Currency",
            "Amount USD", "Paid (orig, verified)", "Outstanding (orig)", "Outstanding USD", "Status"]


def build_invoices(wb, L):
    ws = wb.create_sheet("Invoices", 4)
    header(ws, INV_COLS, widths={"Description": 36})
    for i in range(2, MAX_ROWS + 2):
        fx = f'IFERROR(INDEX(Lists!$R$2:$R$4,MATCH(G{i},Lists!$Q$2:$Q$4,0)),"")'
        ws[f"H{i}"] = f'=IF(OR(F{i}="",G{i}=""),"",F{i}/{fx})'
        ws[f"I{i}"] = f'=IF(A{i}="","",SUMIFS(Payments!$F:$F,Payments!$D:$D,A{i},Payments!$L:$L,"Yes"))'
        ws[f"J{i}"] = f'=IF(OR(A{i}="",F{i}=""),"",F{i}-I{i})'
        ws[f"K{i}"] = f'=IF(OR(J{i}="",G{i}=""),"",J{i}/{fx})'
        ws[f"L{i}"] = f'=IF(A{i}="","",IF(J{i}<=0,"Paid",IF(I{i}>0,"Partially paid",IF(AND(D{i}<>"",D{i}<TODAY()),"Overdue","Issued"))))'
        for col in ("H", "I", "J", "K", "L"):
            ws[f"{col}{i}"].fill = CALC_FILL
        for col in ("C", "D"):
            ws[f"{col}{i}"].number_format = "yyyy-mm-dd"
    r = MAX_ROWS + 1
    add_list(ws, f"G2:G{r}", "=" + L["Q"])
    ws.conditional_formatting.add(f"L2:L{r}", CellIsRule(operator="equal", formula=['"Paid"'], fill=GREEN))
    ws.conditional_formatting.add(f"L2:L{r}", CellIsRule(operator="equal", formula=['"Overdue"'], fill=RED))
    ws.auto_filter.ref = f"A1:L{r}"


PAY_COLS = ["Payment ID", "Date received", "Deal ID", "Invoice No", "Company", "Amount (orig)", "Currency",
            "FX units per USD", "Amount USD", "Method", "Reference", "Verified in bank?", "Sales channel", "Service",
            "Market", "Fees USD", "Net USD", "Notes", "Country"]


def build_payments(wb, L):
    ws = wb.create_sheet("Payments", 5)
    header(ws, PAY_COLS, widths={"Notes": 30, "Service": 28, "Company": 26})
    for i in range(2, MAX_ROWS + 2):
        f = {
            "A": f'=IF(C{i}="","","P-"&TEXT(ROW()-1,"000"))',
            "E": f'=IF(C{i}="","",IFERROR(INDEX(Deals!$C:$C,MATCH(C{i},Deals!$A:$A,0)),"⚠ unknown Deal ID"))',
            "H": f'=IF(G{i}="","",IFERROR(INDEX(Lists!$R$2:$R$4,MATCH(G{i},Lists!$Q$2:$Q$4,0)),""))',
            "I": f'=IF(OR(F{i}="",H{i}=""),"",F{i}/H{i})',
            "M": f'=IF(C{i}="","",IFERROR(INDEX(Deals!$D:$D,MATCH(C{i},Deals!$A:$A,0)),""))',
            "N": f'=IF(C{i}="","",IFERROR(INDEX(Deals!$F:$F,MATCH(C{i},Deals!$A:$A,0)),""))',
            "O": f'=IF(C{i}="","",IFERROR(INDEX(Deals!$E:$E,MATCH(C{i},Deals!$A:$A,0)),""))',
            "Q": f'=IF(I{i}="","",I{i}-IF(P{i}="",0,P{i}))',
            "S": f'=IF(C{i}="","",IFERROR(INDEX(Leads!$G:$G,MATCH(INDEX(Deals!$B:$B,MATCH(C{i},Deals!$A:$A,0)),Leads!$A:$A,0)),""))',
        }
        for col, formula in f.items():
            ws[f"{col}{i}"] = formula
            ws[f"{col}{i}"].fill = CALC_FILL
        ws[f"B{i}"].number_format = "yyyy-mm-dd"
        ws[f"I{i}"].number_format = ws[f"Q{i}"].number_format = '"$"#,##0.00'
    r = MAX_ROWS + 1
    add_list(ws, f"G2:G{r}", "=" + L["Q"])
    add_list(ws, f"J2:J{r}", "=" + L["S"])
    add_list(ws, f"L2:L{r}", "=" + L["T"], "Only 'Yes' counts as collected revenue")
    ws.conditional_formatting.add(f"L2:L{r}", CellIsRule(operator="equal", formula=['"No"'], fill=RED))
    ws.auto_filter.ref = f"A1:S{r}"


def build_pipeline(wb, lc):
    ws = wb.create_sheet("Pipeline")
    for j, h in enumerate(["Stage", "Leads", "Est. value USD", "Probability", "Weighted USD"], 1):
        ws.cell(row=1, column=j, value=h).fill = H_FILL
        ws.cell(row=1, column=j).font = H_FONT
        ws.column_dimensions[get_column_letter(j)].width = 26
    st, ev = lc["Stage"], lc["Est. deal value USD"]
    for i, s in enumerate(STAGES, 2):
        ws[f"A{i}"] = s
        ws[f"B{i}"] = f'=COUNTIF(Leads!${st}:${st},A{i})'
        ws[f"C{i}"] = f'=SUMIFS(Leads!${ev}:${ev},Leads!${st}:${st},A{i})'
        ws[f"D{i}"] = f"=Lists!B{i}"
        ws[f"E{i}"] = f"=C{i}*D{i}"
        ws[f"C{i}"].number_format = ws[f"E{i}"].number_format = '"$"#,##0'
        ws[f"D{i}"].number_format = "0%"
    t = len(STAGES) + 2
    ws[f"A{t}"], ws[f"B{t}"] = "TOTAL", f"=SUM(B2:B{t - 1})"
    ws[f"C{t}"], ws[f"E{t}"] = f"=SUM(C2:C{t - 1})", f"=SUM(E2:E{t - 1})"
    ws[f"A{t + 2}"] = "Pipeline value is NOT revenue. Collected revenue = Payments verified in bank only."
    ch = BarChart()
    ch.type, ch.title, ch.y_axis.title = "bar", "Leads by stage", "Leads"
    ch.add_data(Reference(ws, min_col=2, min_row=1, max_row=t - 1), titles_from_data=True)
    ch.set_categories(Reference(ws, min_col=1, min_row=2, max_row=t - 1))
    ch.height, ch.width = 10, 18
    ws.add_chart(ch, "G2")


def kpi(ws, row, label, formula, fmt=None, note=None):
    ws[f"A{row}"] = label
    ws[f"B{row}"] = formula
    ws[f"A{row}"].font = Font(bold=True)
    ws[f"B{row}"].fill = CALC_FILL
    if fmt:
        ws[f"B{row}"].number_format = fmt
    if note:
        ws[f"C{row}"] = note
        ws[f"C{row}"].font = Font(italic=True, color="666666")


def build_dashboard(wb, lc):
    ws = wb.create_sheet("Dashboard", 0)
    ws.column_dimensions["A"].width = 44
    for col in "BCDEFG":
        ws.column_dimensions[col].width = 20
    ws["A1"] = "RISEUP — Sales Dashboard (all values are formulas)"
    ws["A1"].font = Font(bold=True, size=16, color=ORANGE)
    ws["A2"] = "Collected revenue = Payments with 'Verified in bank?' = Yes. Everything else is pipeline, not cash."
    money = '"$"#,##0'
    P_USD, P_VER, P_DATE = "Payments!$I:$I", "Payments!$L:$L", "Payments!$B:$B"
    COLLECTED = f'SUMIFS({P_USD},{P_VER},"Yes")'
    st, ev, fu = lc["Stage"], lc["Est. deal value USD"], lc["Follow-up status"]
    r = 4
    ws[f"A{r}"] = "REVENUE (USD)"
    ws[f"A{r}"].font = Font(bold=True, color=ORANGE)
    kpi(ws, 5, "1. Revenue target", "=Lists!$Y$2", money)
    kpi(ws, 6, "2. Actual collected revenue (verified)", f"={COLLECTED}", money)
    kpi(ws, 7, "   % of target achieved", "=IFERROR(B6/B5,0)", "0%")
    kpi(ws, 8, "3. Remaining to target", "=MAX(0,B5-B6)", money)
    kpi(ws, 9, "4. Signed but unpaid (remaining on signed deals)", '=SUMIFS(Deals!$V:$V,Deals!$N:$N,"Yes")', money, "Not cash")
    kpi(ws, 10, "5. Issued invoices (total USD)", "=SUM(Invoices!$H:$H)", money, "Not cash")
    kpi(ws, 11, "6. Pending payments (outstanding invoices USD)", '=SUMIFS(Invoices!$K:$K,Invoices!$K:$K,">0")', money, "Not cash")
    kpi(ws, 12, "   Overdue invoices (count)", '=COUNTIF(Invoices!$L:$L,"Overdue")')
    kpi(ws, 13, "   Received but NOT yet verified (USD)", f'=SUMIFS({P_USD},{P_VER},"No")', money, "Verify in bank, then set Yes")
    kpi(ws, 14, "10. Open pipeline value (est.)", f'=SUMIFS(Leads!${ev}:${ev},Leads!${lc["Open?"]}:${lc["Open?"]},"Yes")', money, "Not cash")
    kpi(ws, 15, "    Weighted pipeline (stage probability)", f'=SUMIFS(Leads!${lc["Weighted value USD"]}:${lc["Weighted value USD"]},Leads!${lc["Open?"]}:${lc["Open?"]},"Yes")', money, "Not cash")
    kpi(ws, 16, "    Forecast: collected + 80% of signed unpaid + weighted pipeline", "=B6+0.8*B9+B15", money, "Forecast, not cash")
    kpi(ws, 17, "    Net collected after fees", f'=SUMIFS(Payments!$Q:$Q,{P_VER},"Yes")', money)

    ws["A19"] = "FUNNEL"
    ws["A19"].font = Font(bold=True, color=ORANGE)
    L_ = lambda name: f"Leads!${lc[name]}:${lc[name]}"
    kpi(ws, 20, "Leads in CRM", f'=COUNTA({L_("Lead ID")})-1')
    kpi(ws, 21, "New leads this week", f'=COUNTIFS({L_("Date added")},">="&(TODAY()-WEEKDAY(TODAY(),2)+1))')
    kpi(ws, 22, "Contacted (first contact date set)", f'=COUNT({L_("First contact date")})')
    kpi(ws, 23, "Replied", f'=COUNT({L_("Replied date")})')
    kpi(ws, 24, "Response rate", "=IFERROR(B23/B22,0)", "0%")
    kpi(ws, 25, "Interested", f'=COUNT({L_("Interested date")})')
    kpi(ws, 26, "Demos / meetings booked", f'=COUNT({L_("Demo/Meeting date")})')
    kpi(ws, 27, "Proposals sent", f'=COUNT({L_("Proposal date")})')
    kpi(ws, 28, "Deals won (signed/accepted)", '=COUNTIF(Deals!$N:$N,"Yes")')
    kpi(ws, 29, "Payments received (verified count)", f'=COUNTIF({P_VER},"Yes")')
    kpi(ws, 30, "Average payment (USD)", "=IFERROR(B6/B29,0)", money)
    kpi(ws, 31, "Conversion: contacted → interested", "=IFERROR(B25/B22,0)", "0%")
    kpi(ws, 32, "Conversion: interested → proposal", "=IFERROR(B27/B25,0)", "0%")
    kpi(ws, 33, "Conversion: proposal → won", "=IFERROR(B28/B27,0)", "0%")
    kpi(ws, 34, "Overdue follow-ups", f'=COUNTIF({L_("Follow-up status")},"Overdue")')
    kpi(ws, 35, "Follow-ups due today", f'=COUNTIF({L_("Follow-up status")},"Today")')
    kpi(ws, 36, "Active leads with NO next action", f'=COUNTIF({L_("Follow-up status")},"No next action")')
    kpi(ws, 37, "Contacted, no reply for 4+ days", f'=COUNTIFS({L_("Stage")},"First Contact Sent",{L_("Days since contact")},">=4")+COUNTIFS({L_("Stage")},"Contacted",{L_("Days since contact")},">=4")')
    ws.conditional_formatting.add("B34", CellIsRule(operator="greaterThan", formula=["0"], fill=RED))
    ws.conditional_formatting.add("B36", CellIsRule(operator="greaterThan", formula=["0"], fill=AMBER))

    def breakdown(top, title, items, crit_col):
        ws[f"A{top}"] = title
        ws[f"A{top}"].font = Font(bold=True, color=ORANGE)
        ws[f"B{top}"], ws[f"C{top}"] = "Collected USD", "Payments"
        for k, item in enumerate(items, top + 1):
            ws[f"A{k}"] = item
            ws[f"B{k}"] = f'=SUMIFS({P_USD},{P_VER},"Yes",Payments!${crit_col}:${crit_col},A{k})'
            ws[f"C{k}"] = f'=COUNTIFS({P_VER},"Yes",Payments!${crit_col}:${crit_col},A{k})'
            ws[f"B{k}"].number_format = money
        return top + len(items) + 2

    nxt = breakdown(39, "7. REVENUE BY SALES CHANNEL", CHANNELS, "M")
    nxt = breakdown(nxt, "8. REVENUE BY SERVICE", [s[1] for s in SERVICES], "N")
    nxt = breakdown(nxt, "9. REVENUE BY MARKET", MARKETS, "O")
    nxt = breakdown(nxt, "9b. REVENUE BY COUNTRY", COUNTRIES, "S")

    ws[f"A{nxt}"] = "PERIOD VIEWS"
    ws[f"A{nxt}"].font = Font(bold=True, color=ORANGE)
    ws[f"B{nxt}"], ws[f"C{nxt}"], ws[f"D{nxt}"] = "Today", "This week (Mon–Sun)", "30-day sprint"
    starts = ["TODAY()", "(TODAY()-WEEKDAY(TODAY(),2)+1)", "Lists!$Y$3"]
    ends = ["TODAY()", "(TODAY()-WEEKDAY(TODAY(),2)+7)", "Lists!$Y$4"]
    rows = [("Collected USD (verified)", lambda s, e: f'SUMIFS({P_USD},{P_VER},"Yes",{P_DATE},">="&{s},{P_DATE},"<="&{e})', money)]
    for t in ("First contact", "Follow-up", "Call", "Meeting", "Demo", "Proposal", "Payment request"):
        rows.append((f"Activities: {t}", lambda s, e, t=t: f'COUNTIFS(Activities!$G:$G,"{t}",Activities!$B:$B,">="&{s},Activities!$B:$B,"<="&{e})', None))
    rows.append(("New leads added", lambda s, e: f'COUNTIFS({L_("Date added")},">="&{s},{L_("Date added")},"<="&{e})', None))
    for k, (label, fn, fmt) in enumerate(rows, nxt + 1):
        ws[f"A{k}"] = label
        for j, col in enumerate("BCD"):
            ws[f"{col}{k}"] = "=" + fn(starts[j], ends[j])
            if fmt:
                ws[f"{col}{k}"].number_format = fmt
    nxt = nxt + len(rows) + 2

    ws[f"A{nxt}"] = "TEAM (this week)"
    ws[f"A{nxt}"].font = Font(bold=True, color=ORANGE)
    ws[f"B{nxt}"], ws[f"C{nxt}"] = "Person A", "Person B"
    wk_s, wk_e = starts[1], ends[1]
    team_rows = [("All activities", None), ("First contact", "First contact"), ("Follow-up", "Follow-up"),
                 ("Call", "Call"), ("Meeting", "Meeting"), ("Demo", "Demo"), ("Proposal", "Proposal")]
    for k, (label, t) in enumerate(team_rows, nxt + 1):
        ws[f"A{k}"] = f"Activities: {label}"
        for col, p in (("B", "A"), ("C", "B")):
            extra = f',Activities!$G:$G,"{t}"' if t else ""
            ws[f"{col}{k}"] = f'=COUNTIFS(Activities!$E:$E,"{p}",Activities!$B:$B,">="&{wk_s},Activities!$B:$B,"<="&{wk_e}{extra})'
    k = nxt + len(team_rows) + 1
    ws[f"A{k}"] = "Open leads assigned"
    ws[f"B{k}"] = f'=COUNTIFS({L_("Assigned to")},"A",{L_("Open?")},"Yes")'
    ws[f"C{k}"] = f'=COUNTIFS({L_("Assigned to")},"B",{L_("Open?")},"Yes")'
    ws[f"A{k + 1}"] = "Overdue follow-ups"
    ws[f"B{k + 1}"] = f'=COUNTIFS({L_("Assigned to")},"A",{L_("Follow-up status")},"Overdue")'
    ws[f"C{k + 1}"] = f'=COUNTIFS({L_("Assigned to")},"B",{L_("Follow-up status")},"Overdue")'
    ws[f"A{k + 2}"] = "Collected on deals they own (USD)"
    ws[f"B{k + 2}"] = '=SUMIFS(Deals!$U:$U,Deals!$AA:$AA,"A")'
    ws[f"C{k + 2}"] = '=SUMIFS(Deals!$U:$U,Deals!$AA:$AA,"B")'
    ws[f"B{k + 2}"].number_format = ws[f"C{k + 2}"].number_format = money

    ch = BarChart()
    ch.title = "Collected by channel (USD)"
    ch.add_data(Reference(ws, min_col=2, min_row=39, max_row=39 + len(CHANNELS)), titles_from_data=True)
    ch.set_categories(Reference(ws, min_col=1, min_row=40, max_row=39 + len(CHANNELS)))
    ch.height, ch.width = 8, 14
    ws.add_chart(ch, "E4")
    ws["B6"].font = Font(bold=True, size=14, color="1E7E34")


def build_followups(wb, lc):
    ws = wb.create_sheet("Follow-ups")
    ws["A1"] = "Follow-up control (counts update automatically)"
    ws["A1"].font = Font(bold=True, size=14, color=ORANGE)
    fu, ass = lc["Follow-up status"], lc["Assigned to"]
    rows = ["Overdue", "Today", "Upcoming", "No next action", "Not started", "Closed"]
    ws["A3"], ws["B3"], ws["C3"], ws["D3"] = "Status", "Total", "Person A", "Person B"
    for c in "ABCD":
        ws[f"{c}3"].fill, ws[f"{c}3"].font = H_FILL, H_FONT
    for i, s in enumerate(rows, 4):
        ws[f"A{i}"] = s
        ws[f"B{i}"] = f'=COUNTIF(Leads!${fu}:${fu},A{i})'
        ws[f"C{i}"] = f'=COUNTIFS(Leads!${fu}:${fu},A{i},Leads!${ass}:${ass},"A")'
        ws[f"D{i}"] = f'=COUNTIFS(Leads!${fu}:${fu},A{i},Leads!${ass}:${ass},"B")'
    ws["A11"] = "HOW TO SEE THE LIST: open the Leads tab → filter column 'Follow-up status' (Overdue / Today / No next action)."
    ws["A12"] = "Google Sheets / Excel 365 live list of today's + overdue follow-ups:"
    c = lc
    ws["A13"] = (f'=IFERROR(_xlfn._xlws.FILTER({{Leads!{c["Lead ID"]}2:{c["Lead ID"]}{MAX_ROWS + 1},Leads!{c["Company"]}2:{c["Company"]}{MAX_ROWS + 1},'
                 f'Leads!{c["Assigned to"]}2:{c["Assigned to"]}{MAX_ROWS + 1},Leads!{c["Next action"]}2:{c["Next action"]}{MAX_ROWS + 1},'
                 f'Leads!{c["Next follow-up date"]}2:{c["Next follow-up date"]}{MAX_ROWS + 1}}},'
                 f'(Leads!{fu}2:{fu}{MAX_ROWS + 1}="Overdue")+(Leads!{fu}2:{fu}{MAX_ROWS + 1}="Today")),"(list appears in Google Sheets / Excel 365)")')
    ws["A20"] = "Default cadence after first contact: +2, +4, +7, +14 days (edit in Lists!U2:U5). The 'Suggested follow-up' column in Leads proposes the next date."
    ws.column_dimensions["A"].width = 40
    for col in "BCDE":
        ws.column_dimensions[col].width = 18


def daily_targets():
    cum = [0, 0, 0, 150, 300, 450, 600, 800, 1100, 1400, 1600, 1900, 2100, 2400, 2600, 2800, 3100, 3300, 3500,
           3650, 3800, 4000, 4150, 4350, 4500, 4650, 4800, 4900, 5000, 5000]
    leads = [30, 20, 20, 15, 15, 15, 10, 15, 15, 15, 15, 15, 10, 20, 20, 15, 15, 15, 10, 15, 10, 10, 10, 10, 10, 5, 5, 5, 0, 0]
    msgs = [25, 20, 20, 20, 20, 20, 10, 20, 20, 25, 20, 20, 15, 15, 25, 20, 20, 20, 15, 20, 10, 15, 15, 15, 15, 10, 10, 10, 5, 0]
    fups = [0, 4, 20, 15, 20, 20, 15, 20, 25, 20, 20, 20, 15, 15, 20, 20, 20, 20, 20, 20, 20, 25, 20, 20, 15, 20, 15, 15, 15, 10]
    calls = [7, 2, 2, 3, 3, 2, 2, 3, 3, 2, 2, 3, 2, 2, 3, 1, 2, 3, 3, 1, 2, 3, 2, 2, 2, 2, 1, 1, 1, 0]
    demos = [0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0]
    props = [1, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0]
    uw = [3, 5, 5, 5, 5, 5, 3, 5, 5, 5, 4, 4, 6, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4, 3, 3, 3, 2, 2, 2, 0]
    return cum, leads, msgs, fups, calls, demos, props, uw


def build_daily(wb, linked=True):
    ws = wb.create_sheet("Daily Plan") if linked else wb.active
    if not linked:
        ws.title = "Daily Tracker"
    cols = ["Day", "Date", "Week", "Target: new leads", "Actual: new leads", "Target: first messages", "Actual: first messages",
            "Target: follow-ups", "Actual: follow-ups", "Target: calls", "Actual: calls", "Target: demos", "Actual: demos",
            "Target: proposals", "Actual: proposals", "Target: Upwork proposals", "Actual: Upwork proposals",
            "Cash target (cumulative USD)", "Cash collected today (USD)", "Cash collected cumulative (USD)", "Gap vs target",
            "Main obstacle", "Tomorrow's top 3"]
    header(ws, cols, widths={"Main obstacle": 30, "Tomorrow's top 3": 40})
    cum, leads, msgs, fups, calls, demos, props, uw = daily_targets()
    weeks = ["W1 Launch & first payments"] * 7 + ["W2 Conversion & closing"] * 7 + ["W3 Scale best channel"] * 7 + \
            ["W4 Close & collect"] * 9
    for d in range(30):
        i = d + 2
        date = START + dt.timedelta(days=d)
        ws[f"A{i}"], ws[f"B{i}"], ws[f"C{i}"] = d + 1, date, weeks[d]
        ws[f"B{i}"].number_format = "yyyy-mm-dd"
        targets = {"D": leads[d], "F": msgs[d], "H": fups[d], "J": calls[d], "L": demos[d], "N": props[d], "P": uw[d], "R": cum[d]}
        for col, v in targets.items():
            ws[f"{col}{i}"] = v
        if linked:
            B = f"$B{i}"
            act = lambda t: f'=COUNTIFS(Activities!$G:$G,"{t}",Activities!$B:$B,{B})'
            ws[f"E{i}"] = f"=COUNTIF(Leads!$C:$C,{B})"
            ws[f"G{i}"] = act("First contact")
            ws[f"I{i}"] = act("Follow-up")
            ws[f"K{i}"] = act("Call")
            ws[f"M{i}"] = act("Demo")
            ws[f"O{i}"] = act("Proposal")
            ws[f"Q{i}"] = f'=COUNTIFS(Activities!$F:$F,"Upwork/Contra",Activities!$G:$G,"Proposal",Activities!$B:$B,{B})'
            ws[f"S{i}"] = f'=SUMIFS(Payments!$I:$I,Payments!$L:$L,"Yes",Payments!$B:$B,{B})'
            for col in "EGIKMOQS":
                ws[f"{col}{i}"].fill = CALC_FILL
        else:
            for col in "EGIKMOQS":
                ws[f"{col}{i}"].fill = IN_FILL
        ws[f"T{i}"] = f"=SUM($S$2:S{i})"
        ws[f"U{i}"] = f"=T{i}-R{i}"
        for col in "RSTU":
            ws[f"{col}{i}"].number_format = '"$"#,##0'
    t = 32
    ws[f"A{t}"] = "TOTAL"
    for col in "DEFGHIJKLMNOPQS":
        ws[f"{col}{t}"] = f"=SUM({col}2:{col}31)"
    ws[f"R{t}"] = "=R31"
    ws[f"T{t}"] = "=T31"
    ws.conditional_formatting.add("U2:U31", CellIsRule(operator="lessThan", formula=["0"], fill=RED))
    ws.conditional_formatting.add("U2:U31", CellIsRule(operator="greaterThanOrEqual", formula=["0"], fill=GREEN))
    if not linked:
        ws["A34"] = "Enter actual numbers in the orange columns each evening. Cash = only money verified in the bank."


def build_calculator(wb):
    ws = wb.create_sheet("Calculator")
    ws["A1"] = "Revenue target calculator: ASSUMPTIONS, not history (RISEUP has no past sales data yet). Edit orange cells."
    ws["A1"].font = Font(bold=True, size=13, color=ORANGE)
    money = '"$"#,##0'
    ws.column_dimensions["A"].width = 44
    for col in "BCDEFGHIJ":
        ws.column_dimensions[col].width = 14
    # Block 1: channel mix
    ws["A3"] = "BLOCK 1: channel mix, 30 days. Cash = money collected inside the 30 days (deposits/tests count; future balances do not)."
    ws["A3"].font = Font(bold=True)
    heads = ["Channel", "Contacts (30 d)", "Cons: contact→paid", "Cons: avg cash $", "Base: contact→paid", "Base: avg cash $",
             "Aggr: contact→paid", "Aggr: avg cash $"]
    for j, h in enumerate(heads, 1):
        c = ws.cell(row=4, column=j, value=h)
        c.fill, c.font = H_FILL, H_FONT
        c.alignment = Alignment(wrap_text=True)
    mix = [("Warm leads / old contacts", 6, .20, 350, .33, 450, .50, 600),
           ("Agency outreach (msgs + calls)", 345, .005, 400, .01, 500, .018, 700),
           ("Direct businesses (Armenia)", 150, .008, 250, .015, 300, .025, 350),
           ("Upwork / Contra proposals", 113, .015, 300, .03, 400, .05, 500),
           ("Creators (paid validation)", 20, 0, 300, .025, 300, .05, 400)]
    for i, row in enumerate(mix, 5):
        for j, v in enumerate(row, 1):
            c = ws.cell(row=i, column=j, value=v)
            if j > 1:
                c.fill = IN_FILL
            if j in (3, 5, 7):
                c.number_format = "0.0%"
            if j in (4, 6, 8):
                c.number_format = money
    ws["A11"] = "Result"
    ws["A11"].font = Font(bold=True)
    for j, h in enumerate(["", "", "Cons: deals", "Cons: cash", "Base: deals", "Base: cash", "Aggr: deals", "Aggr: cash"], 1):
        if h:
            c = ws.cell(row=11, column=j, value=h)
            c.fill, c.font = H_FILL, H_FONT
    for i in range(5, 10):
        r = i + 7
        ws[f"A{r}"] = f"=A{i}"
        for dcol, ccol, rate, avg in (("C", "D", "C", "D"), ("E", "F", "E", "F"), ("G", "H", "G", "H")):
            ws[f"{dcol}{r}"] = f"=$B{i}*{rate}{i}"
            ws[f"{ccol}{r}"] = f"={dcol}{r}*{avg}{i}"
            ws[f"{dcol}{r}"].number_format = "0.0"
            ws[f"{ccol}{r}"].number_format = money
            ws[f"{dcol}{r}"].fill = ws[f"{ccol}{r}"].fill = CALC_FILL
    ws["A17"] = "TOTAL"
    ws["A17"].font = Font(bold=True)
    for col in "CDEFGH":
        ws[f"{col}17"] = f"=SUM({col}12:{col}16)"
        ws[f"{col}17"].number_format = money if col in "DFH" else "0.0"
        ws[f"{col}17"].font = Font(bold=True)
    ws["A18"] = "Gap to target (Lists!Y2)"
    for col in "DFH":
        ws[f"{col}18"] = f"={col}17-Lists!$Y$2"
        ws[f"{col}18"].number_format = money
    ws.conditional_formatting.add("D18:H18", CellIsRule(operator="lessThan", formula=["0"], fill=RED))
    ws.conditional_formatting.add("D18:H18", CellIsRule(operator="greaterThanOrEqual", formula=["0"], fill=GREEN))
    # Block 2: funnel check
    ws["A21"] = "BLOCK 2: what a single funnel needs to reach the target"
    ws["A21"].font = Font(bold=True)
    for j, h in enumerate(["Input / output", "Conservative", "Base", "Aggressive"], 1):
        c = ws.cell(row=22, column=j, value=h)
        c.fill, c.font = H_FILL, H_FONT
    inputs = [("Target cash USD", "=Lists!$Y$2", "=Lists!$Y$2", "=Lists!$Y$2", money),
              ("Average cash per paid deal (USD)", 450, 600, 800, money),
              ("Reply rate (contacted → replied)", 0.06, 0.10, 0.14, "0%"), ("Positive share of replies", 0.4, 0.5, 0.6, "0%"),
              ("Positive → call/demo", 0.6, 0.7, 0.8, "0%"), ("Call/demo → proposal", 0.7, 0.8, 0.85, "0%"),
              ("Proposal → paid", 0.25, 0.35, 0.45, "0%")]
    for i, (lab, a, b, c, fmt) in enumerate(inputs, 23):
        ws[f"A{i}"] = lab
        for col, v in zip("BCD", (a, b, c)):
            ws[f"{col}{i}"] = v
            ws[f"{col}{i}"].fill = IN_FILL
            ws[f"{col}{i}"].number_format = fmt
    outs = [("Paid deals needed", "=ROUNDUP({c}23/{c}24,0)"), ("Proposals needed", "=ROUNDUP({c}30/{c}29,0)"),
            ("Calls/demos needed", "=ROUNDUP({c}31/{c}28,0)"), ("Positive replies needed", "=ROUNDUP({c}32/{c}27,0)"),
            ("Replies needed", "=ROUNDUP({c}33/{c}26,0)"), ("Leads to contact", "=ROUNDUP({c}34/{c}25,0)"),
            ("Contacts per working day (26 days)", "=ROUNDUP({c}35/26,0)")]
    for i, (lab, f) in enumerate(outs, 30):
        ws[f"A{i}"] = lab
        ws[f"A{i}"].font = Font(bold=True)
        for col in "BCD":
            ws[f"{col}{i}"] = f.format(c=col)
            ws[f"{col}{i}"].fill = CALC_FILL
    ws["A38"] = ("Reading: cold outreach alone needs ~960 contacts at Base, more than 2 people can do. "
                 "The target depends on warm leads, Upwork and agency deals with bigger deposits.")
    ws["A39"] = "Replace assumptions with real rates from the Dashboard after Day 7 (response rate, proposal → won)."


def build_readme(wb):
    ws = wb.create_sheet("README", 0)
    lines = [
        "RISEUP SALES CRM — how to use (2 people, no technical knowledge needed)",
        "",
        "Orange cells = you type. Blue cells = formulas, do not type over them. Dropdowns appear when you click a cell.",
        "1. Leads: one row per company. Keep Stage, Next action and Next follow-up date filled for every active lead.",
        "2. Activities: log EVERY call / message / meeting (Date, Lead ID, Person, Channel, Type, Result, Next action). Last contact date and follow-up counts update in Leads automatically.",
        "3. Deals: create a deal when a lead asks for a price. Fill Lead ID, Service, Currency, Proposed price, Discount, Payment structure, Signed?",
        "4. Invoices: one row per invoice (deposit, balance, monthly). Deal ID links it to the deal.",
        "5. Payments: one row per money received. Set 'Verified in bank?' = Yes ONLY after you see the money in the bank/Payoneer/Upwork. Only verified payments count as revenue.",
        "6. Dashboard / Pipeline / Follow-ups / Daily Plan: read-only views; everything is calculated.",
        "7. Lists: dropdown values, revenue target (Y2), sprint dates and FX rates (units per 1 USD) — update FX with the bank rate.",
        "",
        "Person A: works Deals, Invoices, Payments, logs calls/meetings/demos/proposals, owns warm leads.",
        "Person B: adds/verifies Leads, logs all outreach & follow-ups, keeps Next action/Next follow-up filled, fills the evening report.",
        "",
        "Google Sheets: Drive → New → File upload → this .xlsx → Open with Google Sheets → File → Save as Google Sheets. Then share with Person B (Editor).",
        "Contacts imported from research are UNVERIFIED (Verification status). Never invent contact details.",
    ]
    for i, t in enumerate(lines, 1):
        ws[f"A{i}"] = t
    ws["A1"].font = Font(bold=True, size=14, color=ORANGE)
    ws.column_dimensions["A"].width = 150


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    wb = Workbook()
    wb.remove(wb.active)
    L = build_lists(wb)
    lc = build_leads(wb, L)
    build_activities(wb, L)
    build_deals(wb, L)
    build_invoices(wb, L)
    build_payments(wb, L)
    build_dashboard(wb, lc)
    build_pipeline(wb, lc)
    build_followups(wb, lc)
    build_daily(wb, linked=True)
    build_calculator(wb)
    build_readme(wb)
    order = ["README", "Dashboard", "Leads", "Activities", "Deals", "Invoices", "Payments", "Pipeline", "Follow-ups",
             "Daily Plan", "Calculator", "Lists"]
    wb._sheets = [wb[n] for n in order]
    for ws in wb.worksheets:
        ws.sheet_properties.tabColor = ORANGE if ws.title in ("Dashboard", "README") else "0B0B0C"
    wb.save(OUT / "RISEUP_SALES_CRM.xlsx")

    wb2 = Workbook()
    build_daily(wb2, linked=False)
    wb2.save(OUT / "RISEUP_DAILY_TRACKER.xlsx")

    # CSV templates
    rows = list(csv.DictReader(open(SRC, encoding="utf-8")))
    with open(OUT / "RISEUP_LEADS_TEMPLATE.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        csv_cols = [c for c in LEAD_COLS if c not in ("Last contact date", "Follow-ups sent", "Suggested follow-up", "Follow-up status",
                                                       "Days since contact", "Lead score", "Grade", "Stage probability",
                                                       "Weighted value USD", "Open?")]
        w.writerow(csv_cols)
        for r in rows:
            direct = "Direct" in r["segment"]
            rec = {c: "" for c in csv_cols}
            rec.update({"Lead ID": r["lead_id"], "Company": r["company"], "Date added": "2026-11-22", "Country": norm_country(r["country"]),
                        "City": r["city"], "Market": r["market"], "Business category": r["segment"],
                        "Segment": map_segment(r["segment"], r["market"]) if not direct else "Direct – Other",
                        "Sales channel": "Direct business" if direct else "Agency partnership", "Language": r["language"],
                        "Source": r["source"], "Verification status": "Unverified", "Assigned to": "A" if direct else "B",
                        "Stage": "Ready to Contact" if direct else "New Lead",
                        "Notes": f"Recommended offer: {r['recommended_offer']}. Contacts NOT verified."})
            w.writerow([rec[c] for c in csv_cols])
    with open(OUT / "RISEUP_SALES_ACTIVITIES.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(ACT_COLS)
    with open(OUT / "RISEUP_DEALS_AND_PAYMENTS.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(["Deal ID", "Lead ID", "Company", "Sales channel", "Market", "Service", "Currency",
                                "Proposed price", "Discount %", "Final contract value", "Payment structure",
                                "Deposit required", "Deposit received (verified)", "Remaining balance", "Invoice date",
                                "Payment due date", "Actual payment date", "Amount collected (verified)", "Payment status",
                                "Project status", "Owner", "Notes"])
    print("built", len(rows), "leads")


if __name__ == "__main__":
    main()
