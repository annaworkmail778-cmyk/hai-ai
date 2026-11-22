# RISEUP Revenue Target Calculator

The live version is the CRM **Calculator** tab (orange = inputs).
- **All rates are assumptions.** RISEUP has no historical sales data, so nothing here is history.
- After Day 7, replace them with the Dashboard's real response rate and proposal → won rate.

## 1. Minimum deals for $5,000
| Average cash per deal | Deals needed |
|---|---|
| $300 (paid tests) | 17 |
| $450 | 12 |
| $600 | 9 |
| $800 | 7 |
| $1,200 (a WL-2 paid in full) | 5 |

**Cash** means collected inside the 30 days. A 50/50 project paid only its deposit counts at 50%.

## 2. Channel-mix model (original version; superseded)

> **Revised on 2026-11-22.** The CRM Calculator now holds the revised assumptions: base ≈ $3,080, conservative ≈ $990, aggressive ≈ $8,340, plus a contest + network channel. See `REVISED_5000_REVENUE_SCENARIOS.md` for the audit and the $5,000 path. The table below is kept for history.

| Channel | Contacts (30 d) | Contact → paid (C / B / A) | Average cash (C / B / A) | Base deals | **Base cash** |
|---|---|---|---|---|---|
| Warm leads / old contacts | 6 | 20% / 33% / 50% | $350 / $450 / $600 | 2.0 | $891 |
| Agency outreach | 345 | 0.5% / 1.0% / 1.8% | $400 / $500 / $700 | 3.5 | $1,725 |
| Direct businesses | 150 | 0.8% / 1.5% / 2.5% | $250 / $300 / $350 | 2.3 | $675 |
| Upwork / Contra proposals | 113 | 1.5% / 3% / 5% | $300 / $400 / $500 | 3.4 | $1,356 |
| Creators | 20 | 0% / 2.5% / 5% | $300 / $300 / $400 | 0.5 | $150 |
| **Total** | 634 | | | **11.6** | **$4,797** |

| Scenario | Deals | Cash | Gap to $5,000 |
|---|---|---|---|
| Conservative | 5.8 | **$1,919** | −$3,081 |
| **Base** | 11.6 | **$4,797** | −$203 |
| Aggressive | 19.6 | **$10,685** | +$5,685 |

Contact volumes equal the totals in `DAILY_EXECUTION_PLAN.md`: 495 first messages (345 agency + 150 direct), 113 Upwork proposals, plus warm and creator contacts.

## 3. Single-funnel check (Calculator Block 2)
leads → replies → positive → calls/demos → proposals → paid

| Step | Conservative | Base | Aggressive |
|---|---|---|---|
| Assumed rates | reply 6%, positive 40%, demo 60%, proposal 70%, win 25% | 10%, 50%, 70%, 80%, 35% | 14%, 60%, 80%, 85%, 45% |
| Average cash per deal | $450 | $600 | $800 |
| Paid deals needed | 12 | 9 | 7 |
| Proposals | 48 | 26 | 16 |
| Calls/demos | 69 | 33 | 19 |
| Positive replies | 115 | 48 | 24 |
| Replies | 288 | 96 | 40 |
| **Leads to contact** | **4,800** | **960** | **286** |

**Conclusion:**
- Cold outreach alone can't reach $5,000 at base rates with two people (960 contacts against 495 planned).
- The target depends on three things:
  1. Warm leads and Upwork, which have higher intent.
  2. Larger agency deposits (WL-2/WL-3/WL-R).
  3. Collecting balances before Day 30.
- That is why the realistic probability is ~30–35%.

## 4. Levers, by impact
1. One WL-R retainer ($950–1,200 prepaid) ≈ 25% of the gap.
2. Collect 100% on small jobs (≤ $300) and 50% deposits on the same day as the "yes".
3. Lift proposal → paid by sending the invoice with the proposal.
4. Raise reply rate with phone calls in Armenia, where calls usually work better than DMs.
