# RISEUP Revised $5,000 Revenue Scenarios (audit of 2026-11-22)

**Definition:** "Collected" means money visible in the bank, Payoneer or Upwork available balance between 23 Nov and 22 Dec 2026, net of platform fees.
- Signed deals, invoices and unreleased Upwork milestones do not count.
- FX assumption: 388 ֏ = $1.

## 1. Audit of the previous base forecast (~$4,800)
The previous forecast came from `REVENUE_TARGET_CALCULATOR.md` and the CRM Calculator.

| Channel | Old base | What it assumed | Evidence in our files | Verdict |
|---|---|---|---|---|
| Warm leads (4) | $891 | 33% pay, $450 average | `plan-60-days.md` §0: **"no paying client yet"**. Whether HosDog, the real estate client, Babasyan or Shtigen ever paid is unknown (`01_EXISTING_OPPORTUNITIES.md`: every status "NEEDS CONFIRMATION") | **Too optimistic.** No payment history; one may have been a favour |
| Agency outreach (345) | $1,725 | 1.0% contact → paid, $500 cash | No agency has replied yet. New brand, no reviews, no case studies we may show. White-label buyers usually need 2–4 touches and one call before a test | **Unsupported.** Plausible only after we see real reply rates. Base cut to 0.75% / $500 |
| Direct cold (150) | $675 | 1.5%, $300 | **300–400 cold calls produced zero sales** (`plan-60-days.md` §0) | **Contradicted by history.** Base cut to 0.7% / $250, and only with a new approach (demo-first, observation-based) |
| Upwork (113) | $1,356 | 3%, $400 | No account, no reviews (`plan-60-days.md` §0). New profiles usually win small first jobs. Fixed-price funds are released after client approval plus a security hold, and the platform takes a fee (verify the current fee) | **Too optimistic.** Base cut to 2% / $250 net. Jobs won after ~Day 22 may not clear by Day 30 |
| Creators (20) | $150 | 2.5% | No creator conversations yet; validation sprint never sold | **Unsupported.** Base $0 |
| Contest participants + personal network | **$0 (missing)** | — | Live contest ends **25 Nov**. All participants were promised **−20% until 30 Nov** (`contest-plan.md`). The founder has a personal network (`01_EXISTING_OPPORTUNITIES.md`). The contest plan's own estimate is **50–150 participants**, not confirmed | **Missing channel.** It's the warmest local audience we have |

Other gaps in the old model:
- **It ignored delivery capacity.** It assumed about 12 paid deals with no hour check (see §5).
- **It ignored payment timing.** A 50/50 project signed after Day 20 brings only its deposit by Day 30.
- **It ignored payment friction for international clients.** The SWIFT receiving details aren't filled in yet. Payoneer is unconfirmed. Stripe/PayPal aren't available.
- **The real gap was larger than $200.** After correcting the assumptions above, the base is **≈ $3,100**. The real gap is **≈ $1,900**.

## 2. Revised scenarios (CRM Calculator, Block 1, updated)
| Channel | Contacts | Conservative | Base | Aggressive |
|---|---|---|---|---|
| Warm / existing clients | 4 | 15% × $300 = **$180** | 30% × $420 = **$504** | 60% × $600 = **$1,440** |
| Contest participants + personal network | 40 | 3% × $180 = **$216** | 6% × $190 = **$456** | 12% × $230 = **$1,104** |
| Agency outreach (messages + calls) | 345 | 0.3% × $300 = **$311** | 0.75% × $500 = **$1,294** | 1.2% × $700 = **$2,898** |
| Direct businesses (cold, Armenia) | 150 | 0.2% × $190 = **$57** | 0.7% × $250 = **$263** | 1.5% × $350 = **$788** |
| Upwork / Contra proposals | 113 | 1% × $200 = **$226** | 2% × $250 = **$565** | 4% × $400 = **$1,808** |
| Creators | 20 | **$0** | **$0** | 5% × $300 = **$300** |
| **Total** | 672 | **≈ $990** (~4 deals) | **≈ $3,080** (~9.5 deals) | **≈ $8,340** (~19 deals) |
| Gap to $5,000 | | −$4,010 | **−$1,920** | +$3,340 |

**Probability, on judgment:** RISEUP has no conversion history, so these are not statistics.

| Outcome | Probability |
|---|---|
| At least the conservative result | ~85% |
| Base or better | ~50% |
| **$5,000 on the current plan** | **~20–25%** (lower than the earlier 30–35%) |
| **$5,000 with the §3 levers executed** | **~35–40%** |

## 3. The $5,000 path: what must happen (target ≈ $5,260, a 5% buffer)
| Channel | Paid deals needed | Example deal mix (approved prices) | Cash by Day 30 | vs base |
|---|---|---|---|---|
| **Agency white-label** | **6** | 4 paid tests: 2 × 100,000 ֏ ($258), 1 × $250 (RU), 1 × $300 (EU). Then 2 follow-on deposits: WL-3 RU 50% of $950 = $475, and WL-1 AM 50% of 180,000 ֏ = $232 | **$1,773** | +$479 |
| **Contest + personal network** | **5** | DC-1 AI Admin Pro at contest price 72,000 ֏ + first month 25,000 ֏ = 97,000 ֏ ($250). 100% upfront, since it's ≤ 100,000 ֏ | **$1,225** | +$769 |
| **Upwork / Contra** | **4** | Fixed-price n8n/automation jobs, ~$250 net each, delivered in ≤ 3 days | **$1,000** | +$435 |
| **Warm / existing clients** | **2** | Real estate client: DC-3 Business deposit 50% of 300,000 ֏ = 150,000 ֏ ($387). HosDog: AI order assistant 90,000 ֏ + care plan 20,000 ֏ = $284 | **$671** | +$167 |
| **Direct cold (walk-in + call)** | **2** | DC-1 AI Admin Pro 90,000 ֏ + first month 25,000 ֏ = $296 | **$592** | +$329 |
| Creators | 0 | Inbound only | $0 | — |
| **Total** | **19** | | **$5,261** | **+$2,179** |

**Not counted (upside):** Babasyan's balance (unknown), a WL-R retainer ($950–1,200 prepaid), Shtigen's extension (≈ 100,000 ֏ deposit).
- One WL-R retainer would replace about 4 small deals. That is the single best way to cut both risk and delivery load.

## 4. What closes the gap (levers ranked by cash per hour)
| # | Lever | Expected effect | Cost in time |
|---|---|---|---|
| 1 | **Contest follow-up:** a personal message to *every* participant by 26 Nov. Call everyone who replies. The −20% expires **30 Nov** (a real deadline, already promised) | +3 deals ≈ +$750 | B 3 h, A 2 h |
| 2 | **Personal network:** the founder lists 20 business owners and sends 5 personal messages a day, Days 1–4 | +1–2 deals ≈ +$250–500 | A 1 h total |
| 3 | **Paid test → next project within 7 days:** every test ends with a written proposal for the follow-on project | +2 deposits ≈ +$700 | A 1 h per test |
| 4 | **Call after message (Armenia):** every T1 Armenian agency gets a call within 48 h of the first message | Reply rate ×1.5–2 (judgment) | A 30 min/day |
| 5 | **Invoice with the proposal:** remove one step between "yes" and payment | Proposal → paid +5–10 points (judgment) | 0 |
| 6 | **Upwork volume early:** 5 proposals/day on Days 2–14. Only jobs deliverable in ≤ 3 days, so cash clears before Day 30 | +2 jobs ≈ +$500 | A 1 h/day |
| 7 | **Retainer ask:** after the first delivered agency test, offer WL-R 30 h | +$950–1,200 (≈ 30% chance) | 30 min |
| 8 | **Monthly fee up front:** every DC-1 sale collects month 1 with the setup (already in the approved terms) | +$64 per deal | 0 |

## 5. Capacity check for the $5,000 path
| Work | Hours |
|---|---|
| 4 paid tests × 8 h | 32 |
| 2 follow-on projects, ~50% delivered in month 1 (2 × 25 h × 50%) | 25 |
| Warm: real estate ~50% of 30 h, HosDog 10 h | 25 |
| 7 × DC-1 AI Admin from the n8n + ManyChat template, **≤ 6 h each** | 42 |
| 4 Upwork jobs × 7 h | 28 |
| **Total** | **152 h** |

**Capacity is about 130–155 h** (see `FINAL_REVENUE_OPTIMIZATION.md` §5).
- The path is **at the capacity limit**, and only works if DC-1 is template-based and Upwork jobs stay small.
- Remaining balances carry about 40 h of delivery into Dec/Jan.
- **Implication:** after Day 14, prefer one larger deposit (WL-3, WL-R) over several new small deals.

## 6. Price decision
**No approved price is changed.** Reasons:
1. The gap comes from volume, conversion and missing channels, not price.
2. The −20% contest discount was promised publicly and stays valid until 30 Nov only.
3. Lowering prices would push the deal count above delivery capacity.

**One terms clarification, which needs founder approval:**
- Apply the contest −20% to the **setup fee only, not to monthly fees**.
- Commercial reason: monthly margin on the entry packages is already thin (`FINAL_PRICING_AND_PAYMENT_TERMS.md` §2).
- If the public promise ("any service") is read as including monthly fees, honour it for the participants.
