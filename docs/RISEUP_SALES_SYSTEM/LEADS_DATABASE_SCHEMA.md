# RISEUP Leads Database Schema (CRM tab "Leads")

Cell colours:
- **Orange or white** cells: you type.
- **Blue** cells: formulas. Don't type over them.
- Dropdown sources are in the **Lists** tab.

| Column | Field | Type / allowed values | Who fills |
|---|---|---|---|
| A | Lead ID | `L###` (unique, never reused) | B |
| B | Company | Text | B |
| C | Date added | Date | B |
| D–F | Website · Instagram · LinkedIn | URL | B |
| G | Country | Dropdown: Armenia, Georgia, Kazakhstan, Russia, Germany, Netherlands, United Kingdom, United States, Australia, Other, Unknown – verify | B |
| H | City | Text | B |
| I | Market | Dropdown: Armenia, Russian-speaking, Europe/US, Other | B |
| J | Segment | Dropdown: 12 segments (agency types, direct types, Upwork, Creator) | B |
| K | Business category | Free text (original research category) | B |
| L | Sales channel | Dropdown: Agency partnership, Direct business, Upwork/Contra, Creator | B |
| M | Language | hy / ru / en | B |
| N–O | Contact person · Position | Text: **only from a public source** | B |
| P–Q | Email · Phone/WhatsApp | Text: **only from a public source** | B |
| R | Source | URL where the lead or contact was found | B |
| S | Verification status | Dropdown: Unverified, Verified, Invalid | B |
| T | Assigned to | Dropdown: A, B | B |
| U | Potential service | Dropdown: 15 services (WL-0…CP-1) | A/B |
| V | Est. deal value USD | Number (convert AMD at the Lists FX rate) | A |
| W | **Stage** | Dropdown: 16 stages (`SALES_PIPELINE.md`) | owner |
| X | **Next action** | Text, e.g. "Call owner re test" | owner |
| Y | **Next follow-up date** | Date | owner |
| Z | Last contact date | **Formula:** latest Activities date for this lead | auto |
| AA | Follow-ups sent | **Formula:** count of Activities with Type = Follow-up | auto |
| AB | Suggested follow-up | **Formula:** last contact + 2/4/7/14 days (Lists!U2:U5) | auto |
| AC | Follow-up status | **Formula:** Overdue / Today / Upcoming / No next action / Not started / Closed | auto |
| AD | Days since contact | **Formula** | auto |
| AE–AL | Score inputs (8 × 0–5) | Dropdown 0–5 | A |
| AM | Lead score | **Formula** 0–100 | auto |
| AN | Grade | **Formula** A/B/C | auto |
| AO | Score reason | Text (mandatory once scored) | A |
| AP | Stage probability | **Formula** from Lists | auto |
| AQ | Weighted value USD | **Formula** = value × probability | auto |
| AR | Open? | **Formula** (No when Paid — Won or Lost) | auto |
| AS–AZ | Stage dates: First contact, Replied, Interested, Demo/Meeting, Proposal, Accepted, Paid, Lost | Date: type the date **when the lead reaches that stage** | owner |
| BA | Notes | Text | all |

## Rules
- **One row per company.** Search column B before adding one (Ctrl+F).
- **No invented data.** If a contact isn't public, leave it empty and set Verification = Unverified.
- Mark **Invalid** for bounced emails or wrong numbers. Never delete rows.
- **Imported data:** 76 leads from `docs/HAI_AI_30_DAY/LEADS_DATABASE.csv` (research of 2026-11-22).
  - All are Unverified.
  - The original location text and recommended offer are in Notes.
  - Direct warm leads start at "Ready to Contact" (owner A). Agencies start at "New Lead" (owner B).
- Formula rows are prepared for up to **500 leads**. To add more, copy the last row down.
