# RISEUP Lean Demo: Final Implementation Plan (v2, approved direction)

**Status:** final plan for your sign-off before any application code (2026-11-27).
- **Scope:** `LEAN_DEMO_SCOPE.md`. Nothing beyond it.
- Estimates are productive hours for Person A (development) with Claude Code. Person B's content and QA hours are listed separately.

## 0. Approved decisions (from your message)
| # | Decision | How this plan applies it |
|---|---|---|
| 1 | Hybrid Schedule B: start the hotel demo now (~24 h), **without dropping paid opportunities or confirmed commitments** | Commitment-first scheduling (§1): demo hours come only from capacity not needed for confirmed paid work and not taken from sales time |
| 2 | Restaurant stage (~11 h) only after ≥ 3 restaurant-owner interviews validate demand | Stage 2 has a hard gate (§6) |
| 3 | Separate Netlify deployment from `business-os/`; real phone + laptop with QR and sync; document the internet dependency | §7, §8 |
| 4 | Stable QR redirect under riseup-group.com: secure, tested, non-interfering | Task G1 (§5), tests in §9 |
| 5 | Customer pages hy/ru/en; admin Armenian only | L3 |
| 6 | Prices are hypotheses, not hard-coded | **The demo shows no RISEUP package prices at all.** Prices live only in the offer documents (which are already marked as hypotheses). Demo hotel room rates are fictional seed data, not RISEUP prices |
| 7 | Don't sacrifice confirmed revenue; show preserved, delayed and the cash forecast | §2–§4 |
| + | Sales-experience quality first | Quality gates (§9) are part of the definition of done, including a 3–5-minute comprehension test |

## 1. Commitment-first scheduling rules
1. **Priority order for Person A's delivery hours:**
   1. Confirmed paid work: deposit verified, or signed with a dated start.
   2. Contest orders before 30 Nov (time-bound).
   3. Demo development.
   4. Speculative prep work.
2. **Sales time is never used for development.** A's 09:30–12:30 call block, B's outreach blocks and all meetings stay as planned (sales ≥ 25%; plan 50%).
3. **Pipeline opportunities aren't dropped.** Agency, Upwork, contest, network, warm and direct outreach all continue at planned volume.
   - If a deal closes during the build, it takes priority. Its deposit is invoiced the same day.
   - Its start date is agreed with the client: normally within 1–3 working days.
4. **The demo pauses, never paid work.** Each morning A checks: are there confirmed paid hours due today? If yes, they come first and the demo gets the remainder.
5. **Person B's demo work (≈ 6 h)** comes from B's 2 h/day delivery-support block on days with no client content to prepare. Never from outreach time.

## 2. Confirmed commitments register (needs your input)
**I have no record of any signed contract, verified deposit or scheduled delivery.**
- The repository CRM (`RISEUP_SALES_CRM.xlsx`) contains no deals or payments.
- Your live Google Sheet isn't accessible from here.

Fill this in, or send me the list, and I'll fix the exact dates:

| Client / deal | Signed? | Deposit verified? | Delivery hours left (A / B) | Agreed start / due date | Cash still to collect (amount, date) |
|---|---|---|---|---|---|
| (e.g. HosDog add-on) | | | | | |
| … | | | | | |

Until then, the schedule is shown for three cases.

## 3. Schedule (start Mon 30 Nov; A's delivery capacity ≈ 4.5 h/day, 6 days/week)
| Case | Confirmed paid work for A (h/week) | A hours left for the demo per week | Hotel demo (≈ 26.5 h) live | Restaurant (≈ 11 h, if the gate is passed) |
|---|---|---|---|---|
| **1. Nothing confirmed yet** | 0–5 | ≈ 22–27 | **Fri 4 – Sat 5 Dec** | ≈ 9–11 Dec |
| **2. Some confirmed work** | ≈ 10 | ≈ 17 | **≈ Wed 9 – Thu 10 Dec** | ≈ 14–16 Dec |
| **3. Full planned load is confirmed** | ≈ 23+ | ≈ 0–4 | After 22 Dec (≈ 26–29 Dec) | Early January |

**Contest orders (deadline 30 Nov) come first in every case.** Each AI Admin setup is about 6 h of A's time.

**Day-by-day (case 1, the most likely in week 1):**

| Day | A: demo work (in the delivery block) | B: content/QA (in the delivery-support block) |
|---|---|---|
| Mon 30 Nov | G0 checks, L1, L2 | Photo shortlist (licensed stock) |
| Tue 1 Dec | L3, L4, L5 (sync verified first) | Hotel copy hy/ru drafts review |
| Wed 2 Dec | L6, L7, L8, H1 | Room descriptions, assistant answers hy/ru/en review |
| Thu 3 Dec | H2, H3, H4 | QR card layout |
| Fri 4 Dec | H5, H6, G1 (redirect PR), V1 polish | Dry run as the "guest" |
| Sat 5 Dec | Q-H device tests, fixes, dry runs ×2 → **go-live** | Print a small QR card batch after the live test passes |

## 4. Preserved, delayed, and the cash forecast
| Item | Status under the hybrid plan |
|---|---|
| All signed deals, verified deposits, scheduled deliveries | **Preserved.** First priority |
| Contest orders until 30 Nov | **Preserved.** Before the demo |
| Pipeline outreach (agency, Upwork, contest, network, warm, direct) | **Preserved.** Full planned volume |
| 4 agency pilots, 2 follow-ons, warm deals, network/contest DC-1, Upwork jobs (the $5,000 path) | **Preserved as opportunities.** If they close, they take delivery priority |
| Earlier Schedule B drops (2 cold DC-1, 2 Upwork jobs, the WL-1 start) | **Not dropped** (reversed per your instruction) |
| **What may be delayed** | **Only start dates of deals that close during the build week:** up to 1–3 working days, agreed with the client, deposit collected immediately. And the demo itself (case 2/3) |

**Cash forecast:**
- **Collected to date:** unknown. No payments are recorded in the repository CRM. Please send the verified total.
- **Realistic forecast to 22 Dec:** the revised base **≈ $3,080** (`REVISED_5000_REVENUE_SCENARIOS.md` §2). It's an assumption-based estimate, and the hybrid plan doesn't change it.
  - Pipeline deals keep full priority.
  - Deposits are collected before any start.
  - Only a 1–3-day start delay on newly closed deals is possible. That could move a few balance payments past 22 Dec only for projects finishing in the last week; the plan avoids it by putting the build in week 1.
- **$5,000 target path ($5,339):** unchanged as a target. It still needs above-base conversion (P($5k) ≈ 20–25% on the current plan).
- **Upside (hypothesis):** 1–2 Tsaghkadzor pilots at 100,000 ֏ ≈ +$258–516. A pilot also needs ≈ 12–16 h of delivery each, so at most 1–2 before 22 Dec.
- **Main financial risk of the demo:** low, because it runs in hours that would otherwise sit idle if deals haven't closed (case 1). In case 3 the demo waits. Revenue doesn't.

## 5. Final task sequence: Stage 1 (hotel), ≈ 26.5 h for A
**Why 26.5 h and not 24 h:** three items weren't in the earlier 24 h: the pre-flight check (G0, 0.5 h), the approved stable QR redirect (G1, 1 h), and a dedicated premium visual pass (V1, 1 h). The last two are directly required by your adjustment 4 and the sales-experience quality requirement.

| # | ID | Task | h | Depends on | Acceptance criteria |
|---|---|---|---|---|---|
| 1 | G0 | Pre-flight: confirm the Netlify account access method (token via the secure form, or you create the site), the riseup-group.com production branch and deploy flow, Blobs availability on your plan | 0.5 | — | Written answers; no code |
| 2 | L1 | Scaffold `business-os/` (Next.js 16.2, React 19, TS, Tailwind v4), own `package.json`/lockfile; exclude from the root `tsconfig.json` and `eslint.config.mjs` like `reels/`; three theme token sets; Geist + Noto Sans Armenian; `noindex` (meta + `X-Robots-Tag`); security headers like the main site | 2.0 | G0 | `npm run build` + typecheck pass in `business-os/`; **the root site's build, lint and typecheck are unchanged** |
| 3 | D1 | Netlify demo site: base directory `business-os`, Node 20+, Next runtime, deploy from this branch → temporary URL | 0.5 (within L1) | L1, G0 | Temporary `*.netlify.app` URL serves the scaffold over HTTPS |
| 4 | L2 | Mini UI kit + admin shell (Armenian), "Demo data: fictional business" badge, Reset, presenter PIN gate | 2.0 | L1 | Shell works at 1366 px and 390 px; admin routes need the PIN cookie |
| 5 | L3 | i18n: customer pages hy/ru/en (language switch persisted), admin hy | 1.0 | L1 | No hard-coded strings; Armenian glyphs render on iOS/Android |
| 6 | L4 | Typed seed model + loader + reset | 2.0 | L1 | Reset < 2 s; invalid stored data falls back to the seed |
| 7 | L5 | **Live session sync:** route handlers + Netlify Blobs (deploy-context-scoped store name); allowlisted session codes only (presenter A, B); zod-validated writes; caps (≤ 8 KB per write, ≤ 50 records per session, write-rate limit); polling ~1.5 s only while the tab is visible, stops after 20 min idle; auto-expiry 24 h; **local mode** fallback; verify Blobs in the first hour, else Supabase free tier (+1 h) | 3.0 | L4, D1 | Phone (4G) → laptop update ≤ 2 s in 10/10 tries; unknown session codes rejected; local mode works with the network off |
| 8 | L6 | Simulated notification feed | 0.5 | L4 | Every item reads "ՍԻՄՈՒԼՅԱՑԻԱ — չի ուղարկվել" ("Simulation: not sent") |
| 9 | L7 | Assistant engine interface + scripted engine + chat widget (quick replies, disclosure line, handoff) | 1.5 | L3, L4 | Unit test: never outputs a price or availability not derived from seed data; unknown → handoff |
| 10 | L8 | Presenter launcher (choose presenter A/B, live/local mode indicator, on-screen QR, 6-step checklist, Reset) | 0.75 | L2, L5 | A first-time presenter runs the scenario from the checklist alone |
| 11 | H1 | Hotel seed: 3 room types, 12 rooms, fictional rates, 30 days of reservations, guests | 0.75 | L4 | KPIs plausible; all names fictional |
| 12 | H2 | Hotel customer site: one-page home (hero, highlights, rooms, location card, messenger buttons as demo links), room detail, inquiry form, success page **"Հարցումը ստացվել է, դեռ հաստատված չէ"** ("Request received, not yet confirmed") | 3.0 | L3, H1 | Premium at 375 px; LCP < 2.5 s on 4G; no RISEUP package prices anywhere |
| 13 | H3 | Hotel assistant intents (rooms, price for dates from seed rates, check-in/out, location/transport, collect inquiry, handoff) in hy/ru/en | 0.75 | L7, H1 | The 23:30 scenario works in hy, ru and en |
| 14 | H4 | Admin dashboard (4 KPIs + chart, demo label) + inquiry inbox + approve/decline with room assignment | 2.0 | L2, L5, H1 | Phone inquiry appears ≤ 2 s; Approve → Confirmed + 2 feed items |
| 15 | H5 | Room calendar (12 × 10 days; inquiry hatched, confirmed solid) + guest details panel | 1.5 | H4 | Readable on a 13" laptop; click opens the guest panel |
| 16 | H6 | Housekeeping list; approval creates "Պատրաստել սենյակ N-ը ժամանումից առաջ" ("Prepare room N before arrival") | 0.75 | H4 | The task appears right after approval; status To do → In progress → Done |
| 17 | G1 | **Stable QR redirect on riseup-group.com** (small PR to the main site): allowlisted `redirects()` in `next.config.ts` (runs **before** `proxy.ts` per Next 16's execution order), e.g. `/go/h-a`, `/go/h-b` → `${BUSINESS_OS_DEMO_URL}/s/a/hotel` etc.; **307 temporary**; destination only from a server env var; **no redirects at all if the env var is unset** | 1.0 | D1 | Tests in §9 pass; no other route changes; root build/lint/typecheck unchanged |
| 18 | V1 | Premium visual pass: spacing, typography, photo grading, empty/loading states, motion restraint; screenshot review at 390 / 768 / 1366 px | 1.0 | H2–H6 | Reviewed against the quality gates (§9) |
| 19 | Q-H | Device tests (iPhone Safari, Android Chrome, laptop Chrome/Safari, printed QR), fixes, 2 timed dry runs, comprehension test | 2.5 | all above | §9 gates pass |
| | | **Stage 1 total (A)** | **≈ 26.5 h** | | **Go-live for hotel visits** |

**Person B, Stage 1 (≈ 4 h, not dev time):**
- Licensed photos: 1 h
- hy/ru copy review: 1.5 h
- QR card layout and small print run: 0.5 h
- Acting as the "guest" in dry runs: 1 h

## 6. Stage 2 (restaurant), gated
**Gate:** ≥ 3 restaurant/café owner interviews logged (`CUSTOMER_DISCOVERY.md` §6) with an order/kitchen pain at severity ≥ 4, **and** no confirmed paid work displaced (rule §1).

| # | ID | Task | h | Depends on | Acceptance criteria |
|---|---|---|---|---|---|
| 1 | R1 | Restaurant seed (5 categories, ~20 dishes with fictional prices, 10 tables, 30 days of orders) | 0.75 | Stage 1 | Plausible metrics |
| 2 | R2 | Restaurant home + table reservation inquiry ("Հարցումն ուղարկված է, դեռ հաստատված չէ", "Request sent, not yet confirmed"); restaurant theme | 1.0 | R1 | Premium at 375 px |
| 3 | R3 | QR menu (`/s/{code}/menu?t=7`), categories, dish cards, cart, submit, live status | 3.0 | R1, L5 | Cart survives a refresh; status follows the laptop changes ≤ 2 s |
| 4 | R4 | Order dashboard + accept/reject + statuses (Armenian) | 1.25 | R3 | New order highlighted ≤ 2 s |
| 5 | R5 | Kitchen display (columns, timers, one-tap status, full-screen) | 1.5 | R4 | Readable at 2 m; ≤ 1 tap per change |
| 6 | R6 | Menu management (sold-out, price) → QR menu | 0.5 | R3 | Change visible on the phone ≤ 2 s |
| 7 | R7 | Basic sales metrics | 0.75 | R1 | Demo label |
| 8 | G2 | Add restaurant entries to the redirect allowlist (`/go/r-a`, `/go/r-b`) | 0.25 | G1 | Same tests as G1 |
| 9 | Q-R | Device tests, fixes, 2 dry runs, comprehension test | 2.5 | all | §9 gates pass |
| | | **Stage 2 total** | **≈ 11.5 h** | | |

## 7. Internet dependency and fallback behaviour
| Mode | When | What works | What doesn't |
|---|---|---|---|
| **Live session** (default) | Laptop and customer phone both online (Wi-Fi or mobile data) | Full cross-device flow: QR scan → phone site/menu → inquiry/order → laptop inbox/KDS (≤ 2 s); status back to the phone | Nothing missing |
| **Degraded** | Slow or unstable network | Polling retries with backoff; "reconnecting…" indicator; writes are queued and sent when the network returns | Updates can lag; the presenter sees the indicator |
| **Local mode** (manual switch, or automatic when the server can't be reached at start) | No internet at the venue, or the customer's phone has no data | Same flow on the **laptop only**: customer view in a phone frame or second window, synced between tabs; reset works | The customer's own phone can't take part |
| **Offline first load** | The laptop was opened on the demo before the meeting | App shell and photos are cached by the browser; local mode starts without a network | First visit on a new device needs a network |

**Presenter rules:**
- Check the mode indicator before the meeting.
- If it shows Local, say so and use the laptop flow.
- Carry a phone with mobile data as a hotspot (≈ 2 MB per demo; verify on the first run).

**Data note:** the demo stores only what is typed in the session, deleted at reset or after 24 h. A banner asks people not to enter real personal data.

## 8. Deployment requirements
| Requirement | Detail | Who |
|---|---|---|
| Netlify demo site | New site from this repository; **base directory `business-os`**; build `npm run build`; Next.js runtime; branch `claude/premium-tech-portfolio-site-xk28q4` until merged | You create it, or provide a Netlify personal access token through the secure credential form (I never ask for it in chat) |
| Environment (demo site) | `DEMO_PRESENTER_PIN` (secret, set in the Netlify UI by you), `DEMO_SESSION_CODES=a,b`; store name derived from the deploy context | You set the PIN |
| Blobs | Enabled by default on Netlify; Free-plan credit limits apply (verify on your plan); polling designed to stay small | Verified in G0/L5 |
| Indexing | `noindex` meta + header; not linked from the main site | Built in |
| **Main site redirect** | `BUSINESS_OS_DEMO_URL` env var on the riseup-group.com Netlify site + the G1 PR merged to the main site's production branch | You approve and merge; I prepare the PR and the tests |
| Domain | None needed now (temporary URL behind the stable `/go/` paths). A permanent subdomain later | Later |
| Costs | Expected $0 at demo traffic on Netlify Free (verify credits) | — |
| Rollback | Demo: redeploy the previous deploy in Netlify. Redirect: unset the env var (redirects disappear) or revert the PR | Documented in the PR |

**I won't create sites, set env vars, deploy, merge or change DNS without your explicit go-ahead at that step.**

## 9. Quality gates (definition of done for go-live)
**Reliability:**
- [ ] Hotel key scenario on the **customer's phone + our laptop**: 10/10 runs (iPhone Safari, Android Chrome; laptop Chrome and Safari).
- [ ] Local mode works with the network off.
- [ ] Reset < 2 s.

**Redirect safety (G1):**
- [ ] `curl -I /go/h-a` → 307 to the demo URL.
- [ ] Unknown `/go/x` → normal 404 flow, **no open redirect** (query/path can't inject a destination).
- [ ] `/`, `/hy`, `/ru/pricing`, `/api/contact`, the sitemap and robots behave exactly as before.
- [ ] With the env var unset, `/go/*` doesn't redirect.

**Premium, mobile-first:**
- [ ] Designed at 375–390 px first.
- [ ] Lighthouse mobile ≥ 85 on customer pages.
- [ ] No layout shift on photo load.
- [ ] Consistent spacing and type scale.
- [ ] No placeholder text.
- [ ] Native hy/ru copy checked.

**Understandable in 3–5 minutes:**
- [ ] A non-technical person watches the 3-minute script once and can explain, in their own words, (1) what happens to a night inquiry, (2) who confirms the booking, (3) what the owner sees.
- [ ] Two timed dry runs ≤ 3:30.

**Honesty:**
- [ ] Demo-data badge on every admin screen.
- [ ] Every message labelled simulated.
- [ ] "Not yet confirmed" wording on inquiries.
- [ ] No RISEUP package prices in the demo.

## 10. Scope guard
Anything not in `LEAN_DEMO_SCOPE.md` goes to a "later" list in this file and is not built. This includes:
- a restaurant assistant
- analytics beyond the listed KPIs
- a Russian admin
- auto-play presenter
- LLM, real messaging, database, logins

### Later list
- (empty)
