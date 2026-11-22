# RISEUP Sales System: Index

**Goal:** $5,000 **collected and verified** between Mon 23 Nov and Tue 22 Dec 2026.

**Start here (after the 2026-11-22 audit):** `FIRST_7_DAYS_SALES_PRIORITY.md` → `FINAL_REVENUE_OPTIMIZATION.md`. Then:
1. `CRM_SETUP_AND_USAGE.md`: import the CRM.
2. `DAILY_EXECUTION_PLAN.md`: today's targets.
3. `SALES_SCRIPTS_HY_RU_EN.md`: what to say.

## Spreadsheets and data
| File | Purpose |
|---|---|
| `RISEUP_SALES_CRM.xlsx` | **Main CRM**: Dashboard, Leads (76 imported, unverified), Activities, Deals, Invoices, Payments, Pipeline, Follow-ups, Daily Plan, Calculator, Lists |
| `RISEUP_DAILY_TRACKER.xlsx` | Standalone 30-day tracker with manual actuals (if the CRM isn't used) |
| `RISEUP_LEADS_TEMPLATE.csv` | Leads export / import (76 rows) |
| `RISEUP_SALES_ACTIVITIES.csv` | Activities template (header) |
| `RISEUP_DEALS_AND_PAYMENTS.csv` | Flat deals and payments template (header) |
| `tools/build_crm.py` | Regenerates the empty templates (never run it over live data) |

There's no separate `RISEUP_SALES_DASHBOARD.xlsx`. The dashboard is a tab in the CRM, so it always reads live data.

## Documents
| # | File | Use it for |
|---|---|---|
| 1 | SALES_CRM_GUIDE.md | What each tab does, data flow, payment and follow-up logic |
| 2 | LEADS_DATABASE_SCHEMA.md | Every Leads column and rules |
| 3 | SALES_PIPELINE.md | 16 stages, owners, dates, probabilities |
| 4 | SALES_DASHBOARD_SPEC.md | Every dashboard metric and formula logic |
| 5 | SALES_STRATEGY.md | Positioning, channel priority, rules, forecast |
| 6 | AGENCY_OUTREACH_PLAYBOOK.md | White-label: ICP → close |
| 7 | DIRECT_CLIENT_SALES_PLAYBOOK.md | AI Admin, Ordering, Real Estate |
| 8 | UPWORK_CONTRA_PLAYBOOK.md | Profile, job filters, proposals |
| 9 | BLOGGER_PARTNERSHIP_PLAYBOOK.md | Paid validation sprint |
| 10 | SALES_SCRIPTS_HY_RU_EN.md | 13 situations × 3 languages |
| 11 | OBJECTION_HANDLING.md | Objections + discount rules |
| 12 | LEAD_SCORING_MODEL.md | 0–100 score, A/B/C |
| 13 | REVENUE_TARGET_CALCULATOR.md | Deals needed, scenarios |
| 14 | DAILY_EXECUTION_PLAN.md | 30 days × targets, Day 5 checkpoint |
| 15 | WEEKLY_REVIEW_TEMPLATE.md | Sunday review |
| 16 | DAILY_SALES_REPORT_TEMPLATE.md | Evening report + review questions |
| 17 | CRM_SETUP_AND_USAGE.md | Google Sheets import, Person A/B routines |
| 18 | SALES_SYSTEM_INDEX.md | This file |
| 19 | **FINAL_REVENUE_OPTIMIZATION.md** | Audit findings, lead verification, conversion fixes, offer ranking, capacity model, top 10 opportunities, daily metrics |
| 20 | **REVISED_5000_REVENUE_SCENARIOS.md** | Revised forecast (≈ $3,080 base), the $5,000 path by channel |
| 21 | **FIRST_7_DAYS_SALES_PRIORITY.md** | Exact plan for 23–29 Nov |

## Related (unchanged sources)
| Source | Contents |
|---|---|
| `docs/RISEUP_BUSINESS_LAUNCH/` | Prices (`FINAL_PRICING_AND_PAYMENT_TERMS.md`), proposals, contracts, invoice, capability statement, demos, open questions |
| `docs/HAI_AI_30_DAY/LEADS_DATABASE.csv` | Original lead research (kept as history) |
| `docs/riseup-os/REVENUE_SPRINT/WARM_LEAD_ACTIONS.md` | Warm-lead call scripts |

## Must be verified before use
- Legal entity, tax ID, bank/SWIFT details (invoice). All 76 lead contacts.
- Warm-lead history and permissions.
- Payoneer and Upwork accounts.
- FX rate.
