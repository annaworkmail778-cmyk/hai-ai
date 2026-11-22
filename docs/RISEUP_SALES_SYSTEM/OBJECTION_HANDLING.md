# RISEUP Objection Handling

**Principle:**
- Keep asking until you understand the real objection.
- Answer it with **smaller scope, a paid test, or proof (a demo)**, never with a bigger discount.
- Log the objection in the Activities "Summary" so you can see patterns in the weekly review.
- The ready-to-send wording in HY/RU/EN for the most common objections is in `SALES_SCRIPTS_HY_RU_EN.md` §8–11.

| Objection | What it usually means | Response (short) | Next action in CRM |
|---|---|---|---|
| "Too expensive" | Scope is unclear, or this isn't the budget owner | "Which part matters most first?" → phase 1 smaller scope, or the paid test | Proposal v2 within 24 h |
| "We already have a developer" | No pain right now | Offer overflow or AI/automation capacity; ask "what does your dev not like doing?" | Follow-up Later +30 d, or test |
| "Not now" | Timing or priority | Ask for a month; send a demo to keep | Follow-up Later on the named date |
| "Send info" | Brush-off or real interest | Ask one qualifying question, then send the PDF + 1 demo | Follow-up +2 d |
| "Do you have case studies / reviews?" | Trust | Be honest: "We're a new brand. Here's a working demo, and we start with a small paid test so you take no risk." **Never invent cases.** | Offer WL-0 |
| "Can you do a free test?" | Risk | "We do a paid test at $250–300 / 100,000 ֏. It's small, fixed scope, 3–5 days." No unpaid work. | Send the test invoice |
| "Can you lower the price?" | Negotiating | Discounts only per the rules below | — |
| "We'll pay after delivery" | Trust or cash flow | "Deposit protects both sides: we reserve the time. For ≤ $300 / 100k ֏ we take 100% upfront; for projects, 50/50." | Hold the start date until the deposit |
| "Who is behind RISEUP?" | Legitimacy | Name the founders, phone, site; offer a video call | Book the call |
| "How do I know you'll keep it confidential?" | White-label risk | Offer the Mutual NDA (`docs/RISEUP_BUSINESS_LAUNCH/MUTUAL_NDA_TEMPLATE.md`) | Send the NDA |

## Discount rules (approved prices stay unchanged)
1. Contest participants get **−20% until 30 November 2026**, as promised on the site, applied per the **Contest discount policy** below. That's the only blanket discount.
2. Any other discount is **≤ 10%** and requires something in return: 100% prepayment, a 3-month retainer, a testimonial with permission, or a referral.
3. Never go below: **150,000 ֏ / $400** for a custom project, **$250 / 100,000 ֏** for a paid test, and **margin ≥ 50%** on white-label work (hours × $12 internal cost; see the pricing document).
4. When a client pushes on price, **remove scope** (pages, languages, integrations) instead.
5. Person A decides on any discount. Person B never quotes a discount.

## Contest discount policy (final interpretation, 2026-11-22)
**Public wording.**
- Site contest page, all three languages: *"Every participant gets 20% off any Riseup service until 30 November."* (`src/locales/*.json` → `contest.discount`).
- ManyChat auto-DM in `docs/marketing/contest-plan.md`: *"all participants have a 20% discount"*.
- The published rules add no other discount terms.

**Applied as follows:**

| Item | Rule |
|---|---|
| Who | Businesses with a **valid entry** between 13 and 25 Nov (per the rules; one business, one entry). Check the name against the comment list before quoting |
| Deadline | The order is **accepted in writing by 30 Nov 2026, 23:59 Yerevan time**. The invoice is then paid on normal terms (100% upfront ≤ 100,000 ֏; otherwise the deposit before the start) |
| One-time setup / service fees | **−20% on the whole fee of that order**, including later instalments (for example the 50% balance) |
| Monthly services | **−20% on the first monthly payment** when the monthly service is part of the same order. Monthly-only services (marketing plans) get −20% on month 1 |
| From month 2 | **List price** |
| Not discounted | Third-party costs passed through at cost (Meta/WhatsApp fees, licences, domains, ad budgets). Change requests and orders accepted after 30 Nov |
| Prizes | Not combined with a prize (for example the 2nd prize's 50% setup), unless the founder approves |

**Examples:**

| Package | Setup (−20%) | First month (−20%) | From month 2 |
|---|---|---|---|
| DC-1 Pro | 72,000 ֏ | 20,000 ֏ | 25,000 ֏ |
| DC-1 Start | 36,000 ֏ | 12,000 ֏ | 15,000 ֏ |
| Landing | 64,000 ֏ | 6,400 ֏ | 8,000 ֏ |
| Company site (50/50) | 120,000 ֏ | 9,600 ֏ | 12,000 ֏ |

**Ambiguities:** the public text is silent on these, so this interpretation narrows nothing it explicitly promises.
1. "Until 30 November" could mean the order date or the payment date. **Default:** the order date, with payment on normal terms.
2. Whether "any service" covers monthly fees after month 1. The wording doesn't say. Months after November fall outside "until 30 November", so they're at list price. **State this in writing in every contest proposal.** If a participant reads the promise more broadly, don't argue: escalate to the founder.
3. Stacking with prizes isn't addressed. **Default:** no stacking. The founder decides case by case.

**In the CRM:**
- Deals → Discount % = 20%, Notes = "Contest −20%".
- Add the first month as its own Deal row at −20%. Month 2 onward is a new row at list price.
