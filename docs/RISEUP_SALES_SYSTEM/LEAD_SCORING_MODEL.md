# RISEUP Lead Scoring Model (0–100)

**In the CRM:**
- Leads tab → 8 columns "Score: … (0-5)" (dropdown 0–5). **Lead score** and **Grade** are calculated automatically.
- The score appears only when all 8 are filled.
- **Score reason** is mandatory: one line, e.g. "Owner replied, project waiting, pays deposits, AMD 350k".

## Factors
| # | Factor | Weight | 0 | 3 | 5 |
|---|---|---|---|---|---|
| 1 | Ability to pay | 15 | Unknown / tiny business | Typical SME | Clear budget, sells ≥ $500 projects |
| 2 | Urgency | 15 | None | Within 2 months | Project waiting now |
| 3 | Need for our service | 15 | Has in-house devs, no gap | Some gap | Turning work away / losing inquiries |
| 4 | Decision-maker access | 15 | Generic inbox | Manager | Founder/owner in conversation |
| 5 | Deal size | 10 | < $200 | $300–900 | ≥ $1,200 or retainer |
| 6 | Close probability ≤ 30 days | 15 | No | Possible | Proposal asked for |
| 7 | Repeat potential | 5 | One-off | 2–3 projects/year | Monthly work / retainer |
| 8 | Payment speed | 10 | Pays after delivery only | 50/50 OK | Pays upfront / paid test now |

**Formula:** `score = ROUND( Σ(score_i × weight_i) / 5 , 0 )`. All 5s give 100.

## Grades
| Grade | Score | Action |
|---|---|---|
| **A** | ≥ 70 | Person A calls within 24 h; proposal the same day; follow-ups every 2 days |
| **B** | 50–69 | Standard sequence 2/4/7/14; demo when they reply |
| **C** | < 50 | One message + F4 only; Follow-up Later |

## Example
A Yerevan marketing agency where the owner replied, a site project is waiting and they accept a paid test:

| Pay | Urgency | Need | DM | Size | Close | Repeat | Pay speed | Score | Grade |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 5 | 4 | 5 | 3 | 4 | 4 | 4 | **84** | **A** |

Calculation: (4×15 + 5×15 + 4×15 + 5×15 + 3×10 + 4×15 + 4×5 + 4×10) / 5 = (60 + 75 + 60 + 75 + 30 + 60 + 20 + 40) / 5 = 420 / 5 = **84**.

## When to score
- **New Lead:** leave blank. Research data is too thin.
- **First score:** after the first reply or call.
- **Rescore:** at every stage change from Interested onwards.

The 76 imported leads are **not scored**. Their old "priority 1–3" is kept in Notes only.
