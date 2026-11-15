# 07 — Demo Plan (hours, not days)

## Inventory of what already exists (checked in the repo)

| Asset | Where | What it shows | Ready to use? |
|---|---|---|---|
| **Lead-to-Booking demo video** (en 63.5 s, hy 79.5 s; 16:9 + 9:16) | `reels/src/lb/*`, render with `node --experimental-strip-types render-lb.mjs` (outputs to `reels/out/lead-booking/`, not committed) | Instagram inquiry → AI reply → slots → request → team confirms → inquiry list → Telegram alert → follow-up | **Yes.** Fits Packages 4, 2 and 1 (as the "front end" of the Developer flow) |
| Website interactive demos | `src/components/demos/{realestate,salon,shop,marketing,web}.tsx`, shown on the site's work/solution pages | Animated product mock-ups (unit availability, salon booking, shop orders, marketing, web) | **Yes**, via screen recording of riseup-group.com on a phone. They are marked as concepts on the site; keep that wording |
| Real delivered work | hosdog.am (live); the real-estate WhatsApp-group site; Shtigen automation | Real systems | **Yes, with the client's permission.** Strongest proof |
| Catalog ad reel, contest video | `reels/src/Reel05.tsx`, `reels/src/contest/` | Marketing | Marketing only |
| Developer Sales OS video | Storyboard only (`docs/riseup-os/12_DEMO_VIDEO_STORYBOARDS.md` A) | — | **No** |
| Solar demo | None | — | **No** |

## Priority actions

| # | Demo | Fastest path | Effort | Label |
|---|---|---|---|---|
| 1 | **Developer Sales OS** | **Today:** show the Lead-to-Booking video + the real-estate web demo + a 1-page flow diagram (doc 04 §1). **Optional (≈ 4–6 h):** a 45 s Remotion cut reusing the `lb/` UI kit. Real-estate wording ("3 rooms, budget, mortgage") and a manager Telegram alert, hy + ru | 0 h now; 4–6 h optional | "Demo · illustrative data" |
| 2 | **Real Estate WhatsApp Automation** | Screen-record the real WhatsApp-group site updating (**permission needed**) + a 2-minute screen recording of a Google Sheet CRM with sample rows and a Telegram alert from a test n8n workflow | 1–2 h | Sample rows labelled "Demo" |
| 3 | **Salon booking** | Use the Lead-to-Booking video as is (hy version for local salons). Also, if the AI admin runs on a test Instagram account, do a **live demo on the prospect's phone** (**NEEDS CONFIRMATION** that a test account is configured) | 0 h | — |
| 4 | **Solar monitoring** | Screenshots of the Shtigen Telegram messages (**permission + blur**) **or** a test n8n workflow reading a sample CSV of 10 fictional sites → Telegram alerts "Site Demo-07 offline 2 h". Record the phone screen. Optional: a 30 s Remotion clip | 2–3 h (n8n) / +3 h (video) | "Demo · illustrative data" |

**Do not build:** a live dashboard app, a sandbox CRM product, or new 3D/web demos. These take days and are not needed to close the first deals.

## Live demo rule
Every demo shown to a client:
- states what is real today and what is a mock-up;
- uses no real people's personal data;
- shows no logos without permission;
- makes no results claims.

## What Claude Code can do immediately on request (≤ 1 day each)
- Render the Lead-to-Booking videos (hy/en, both formats) for sending.
- Build the 45 s Developer cut and the 30 s Solar alert clip in Remotion with illustrative data.
- Prepare a sample CSV + n8n workflow spec for the solar and real-estate demos. The founder imports and runs it in their own n8n; I don't connect to live systems.
