# RISEUP Lean Demo: Implementation Plan and Capacity Schedules

**Scope:** `LEAN_DEMO_SCOPE.md`.
- Estimates are productive hours for one developer (Person A) using Claude Code.
- "B" tasks are Person B's content and QA work, counted separately.

## 1. Task list
### Stage 1: shared core + hotel (deployable on its own)
| ID | Task | Hours | Acceptance |
|---|---|---|---|
| L1 | Scaffold `business-os/` (Next.js 16, React 19, TS, Tailwind v4), excluded from the root tsconfig/ESLint like `reels/`. Three theme token sets, Geist + Noto Sans Armenian. Netlify site (base dir `business-os`) → temporary URL | 2.0 | Both packages build; the marketing site is untouched; temporary URL is live |
| L2 | Mini UI kit + admin shell (sidebar, demo badge, Reset, language) | 2.0 | Works at 1366 px and on a phone |
| L3 | i18n: customer pages hy/ru/en, admin hy | 1.0 | No hard-coded strings |
| L4 | Seed architecture + typed seed loader + reset | 2.0 | Reset < 2 s; corrupt data falls back to the seed |
| L5 | **Live session store:** route handler + Netlify Blobs (verify in the first hour; fallback Supabase free tier), per-presenter session codes, polling ~1.5 s, payload/rate caps, local-mode fallback | 3.0 | Phone → laptop update ≤ 2 s on 4G; works with no network in local mode |
| L6 | Simulated notification feed | 0.5 | Every item shows "SIMULATED: not sent" |
| L7 | Assistant engine interface + scripted engine + chat widget | 1.5 | Unknown → handoff; unit test: no price outside the rate table |
| L8 | Presenter launcher (vertical, session code, on-screen QR, 6-step checklist, Reset) | 0.75 | A new presenter can run it without help |
| H1 | Hotel seed: 3 room types, 12 rooms, rates, 30 days of reservations, guests (fictional) | 0.75 | Plausible KPIs |
| H2 | Hotel site: one-page home + room detail + inquiry form + honest success page; hotel theme | 3.0 | Looks premium at 375 px; "not yet confirmed" wording |
| H3 | Hotel assistant intents (hy/ru/en) | 0.75 | The 23:30 scenario works in hy and ru |
| H4 | Admin dashboard (4 KPIs + chart) + inquiry inbox + approve/decline | 2.0 | Approve → Confirmed + feed items |
| H5 | Room calendar (12 × 10 days) + guest details panel | 1.5 | Inquiry hatched, confirmed solid |
| H6 | Housekeeping list + auto task on approval | 0.75 | Approval creates "Prepare room N" |
| Q-H | Device test (iPhone, Android, laptop, printed QR) + fixes + 2 dry runs | 2.5 | Scenario works 10/10 |
| | **Stage 1 total** | **≈ 24 h** | **Hotel demo ready for visits** |

### Stage 2: restaurant (after ≥ 3 restaurant discovery interviews)
| ID | Task | Hours | Acceptance |
|---|---|---|---|
| R1 | Restaurant seed: 5 categories, ~20 dishes, 10 tables, 30 days of orders | 0.75 | |
| R2 | Restaurant home + table reservation inquiry; restaurant theme | 1.0 | "Request sent, not yet confirmed" |
| R3 | QR menu (`?t=`), categories, dish cards, cart, submit, live status page | 3.0 | Cart survives a refresh; status updates from the laptop |
| R4 | Order dashboard + accept/reject + status | 1.25 | New order highlighted ≤ 2 s |
| R5 | Kitchen display (columns, timers, one-tap status, full-screen) | 1.5 | Readable at 2 m |
| R6 | Menu management (sold-out, price) | 0.5 | The QR menu updates |
| R7 | Basic sales metrics | 0.75 | Demo data label |
| Q-R | Device test + fixes + 2 dry runs | 2.5 | Scenario works 10/10 |
| | **Stage 2 total** | **≈ 11 h** | |
| | **Combined** | **≈ 35 h** (range 30–40) | |

### Person B work (not development hours)
| Task | Hours |
|---|---|
| Choose and licence stock photos | 1.5 |
| Write and check the hy/ru customer copy from drafts | 2 |
| Print QR cards (small batch) | 0.5 |
| Questionnaires and offers ready to print (`CUSTOMER_DISCOVERY.md`, offers) | 1 |
| Dry runs as the "customer" | 1 |
| **Total B** | **≈ 6 h** |

## 2. Deployment steps (needs your account access)
1. **Netlify:** you (or I, if given a Netlify access token through the secure credential form) create a new site from this repository.
   - Branch: `claude/premium-tech-portfolio-site-xk28q4` until merged.
   - **Base directory `business-os`**.
   - The URL `riseup-demo-xxxx.netlify.app` is temporary.
2. Set `noindex` (meta + header) on the demo. Store names are prefixed per deploy context, so previews don't touch the live demo data.
3. **Optional redirect** (recommended): add `/go/*` in the main site's Netlify config → the demo URL. That needs a deploy of riseup-group.com (**your approval**).
4. Print QR cards only after step 1 (or 3) works on two phones.

I won't deploy or change DNS or the main site without your explicit go-ahead.

## 3. Capacity schedules
**Facts:**
- Delivery capacity 23 Nov – 22 Dec = **140 h**. The $5,000 path plans **137 h** of it (`docs/RISEUP_SALES_SYSTEM/REVISED_5000_REVENUE_SCENARIOS.md` §5, CRM Calculator Block 3).
- Those hours are **planned for deals not all signed yet**. Hours not used by signed, paid work are genuinely free, but we don't plan on them.
- **Sales time (234 h) is never used for development.**

### Schedule A: preserve all commitments
**Rule:** demo development only uses delivery hours that aren't needed for **signed, paid** work that week, plus the 3 spare hours. Paid work always comes first.

| Week | Delivery capacity | Committed (plan) | Available for the demo (plan) | Demo progress (if the plan holds) |
|---|---|---|---|---|
| 30 Nov – 6 Dec | ~33 h | ~32 h | ~1 h + spare | L1 |
| 7 – 13 Dec | ~33 h | ~32 h | ~1 h | L2 |
| 14 – 20 Dec | ~33 h | ~33 h | ~0–1 h | — |
| 21 Dec onward | after the sprint | — | ~6 h/day | Stage 1 done ≈ **26–29 Dec**; Stage 2 ≈ **5–8 Jan** |

- **If fewer deals are signed than planned** (likely in week 1), the unused hours flow to the demo. Stage 1 could then finish around **8–12 Dec**.
- Meanwhile, Tsaghkadzor visits run **without the new demo**, using discovery questionnaires, existing site demos (salon/shop/real estate), the L2 video, and the paid pilot offer.

### Schedule B: reallocate selected hours now
Take **≈ 24 h** for Stage 1 now, and ≈ 11 h for Stage 2 after validation, from these planned items:

| Planned item (capacity plan) | Hours in month | Cash by D30 | What happens |
|---|---|---|---|
| 2 × direct cold DC-1 (P3) | 12 | $592 | **Dropped.** Cold direct outreach is replaced by Tsaghkadzor in-person visits (same channel, better targeted). The hours go to the demo |
| 2 × Upwork jobs 3–4 (P3) | 14 | $500 | **Dropped.** Stop new Upwork proposals after the first 2 jobs |
| WL-1 AM follow-on | 5 | $232 (deposit) | **Start moved to after 22 Dec.** The deposit is still collected, so no cash change |
| Spare | 3 | — | Used |
| **Freed** | **34 h** | **−$1,092** | Covers Stage 1 (24 h) + almost all of Stage 2 (11 h); the last ~1 h comes from daily slack |

**Timeline:**

| Date (if approved by 28 Nov) | What's ready |
|---|---|
| 30 Nov – 4 Dec | Stage 1 built |
| **≈ 4–5 Dec** | Hotel demo live |
| 5 Dec onward | Hotel visits |
| ≈ 9–11 Dec | Stage 2 (once validated), restaurant demo live |

Both demos are in the field **before the New Year peak**, when owners are preparing for the season.

### Comparison
| | Schedule A (preserve) | Schedule B (reallocate) |
|---|---|---|
| Hotel demo ready | 26–29 Dec (8–12 Dec if deals lag) | **4–5 Dec** |
| Restaurant demo ready | 5–8 Jan | **9–11 Dec** (after validation) |
| 30-day cash path ($5,339 plan) | Unchanged | **≈ $4,250** (−$1,092) before pilots |
| Offsetting cash | Pilots possible but harder to sell without the demo | 1–2 Tsaghkadzor pilots × 100,000 ֏ ≈ +$258–516 (hypothesis) → ≈ $4,500–4,760 |
| Tsaghkadzor timing | Demo arrives during the New Year peak (owners busiest, least time) | Demo arrives **before** the peak |
| Learning | Discovery interviews only in December | Discovery + demo reactions + pilot conversion in December |
| Risks | Product validation slips ~1 month; competitors' visits first | The $5,000 target becomes very unlikely; Tsaghkadzor pilots must close to compensate |
| Delivery risk | Low | Pilot delivery needs extra hours (≈ 10–14 h per pilot) → max 1–2 pilots before 22 Dec |

### Recommendation
**Schedule B, gated:**
1. **Now (no build):** start Tsaghkadzor discovery visits this week with the questionnaires and the existing demos. Book follow-up meetings.
2. **Build Stage 1 (hotel, ≈ 24 h)** from the freed P3 hours. Ship ≈ 4–5 Dec.
3. **Build Stage 2 (restaurant, ≈ 11 h)** only after ≥ 3 restaurant interviews confirm the order/kitchen pain. Otherwise keep those hours for paid work.
4. Accept that **$5,000 by 22 Dec becomes unlikely** (≈ $4.2–4.8k); the trade is earlier validation in the vertical you chose.
   - If preserving the $5,000 target matters more, choose Schedule A. The cost is the December window in Tsaghkadzor.

## 4. Risks and mitigations
| Risk | Mitigation |
|---|---|
| The live session store isn't reliable on Netlify | Verify in the first hour of L5; fallback is the Supabase free tier (+1 h); local mode always works |
| Weak photos make it look like a template | Curate 12–15 high-quality licensed photos; consistent colour grading |
| Armenian/Russian copy sounds machine-made | Founders review before the first visit (B task) |
| Scope creep during the build | Anything not in `LEAN_DEMO_SCOPE.md` goes to a "later" list |
| An owner asks "can it do X?" | Answer honestly: "Not in this demo. Tell me why you need it" → record it in the feedback log (`CUSTOMER_DISCOVERY.md`) |
| Printed QR breaks when the URL changes | `/go/` redirect on the main site, or a small print batch |
