# Demo Priority List (14-day sprint)

**Rule:** every demo is labelled "Demo · illustrative data". All names (Anna, Demo Residence, Demo-07…) and numbers are invented. Demos show **how the system works**; they are not client results.

## Ready now

| # | Demo | Use for | Files | Length / formats |
|---|---|---|---|---|
| 1 | **Developer Sales OS** (new) | Developers, real estate agencies, construction sales | `reels/out/sales-demos/riseup-developer-sales-os-demo-{en,hy}-{16x9,9x16}.mp4` · source `reels/src/sales/DeveloperDemo.tsx` | 30 s, silent with on-screen text, quiet music · en + hy · 16:9 (meetings, email) + 9:16 (WhatsApp, Instagram) |
| 2 | **Solar Monitoring & Alerts** (new) | Shtigen, solar installers and O&M companies | `reels/out/sales-demos/riseup-solar-alerts-demo-{en,hy}-{16x9,9x16}.mp4` · source `reels/src/sales/SolarDemo.tsx` | 30 s, same formats |
| 3 | **Lead-to-Booking** (existing) | Salons, clinics, HosDog AI order assistant, real estate inquiries | `reels/out/lead-booking/riseup-lead-booking-demo-{en,hy}-{16x9,9x16}.mp4` (+ `.srt`) | en 63.5 s / hy 79.5 s, with voice-over |
| 4 | Website interactive demos (existing) | Website + booking, shop, real estate | riseup-group.com (`src/components/demos/*`) on a phone | Live |
| 5 | Real delivered work | Everyone. This is the strongest proof | hosdog.am, the real-estate WhatsApp-group site, the Shtigen workflow | **Only with the client's permission**; blur personal data |

**Re-render command:** `cd reels && node render-sales.mjs [dev|solar] [en|hy]`. Use `--stills` for quick PNG checks. Outputs go to `reels/out/` (not committed).

## Which demo for which lead (use in this order)
| Lead | First send | In the meeting |
|---|---|---|
| Babasyan | Preview link of his own site | — |
| HosDog / Bistro | Lead-to-Booking hy 9:16 | hosdog.am + AI assistant explanation |
| Real estate client | Developer Sales OS hy 9:16 | Developer 16:9 + Lead-to-Booking + real-estate web demo |
| Shtigen | Solar demo hy 9:16 | Solar 16:9 + their own workflow |
| Contest "ԴԵՄՈ" leads | Lead-to-Booking hy 9:16 | Live walkthrough on the phone |
| Developers (B2B) | Developer en/hy 9:16 | Developer 16:9 + flow one-pager (doc 04 §1) |
| Solar companies (B2B) | Solar 9:16 | Solar 16:9 |

## Optional, only if a deal needs it (≤ half a day each)
1. **Russian versions** of the Developer and Solar demos (add `ru` copy in the two source files).
2. **Personalized 9:16 cut** for one A-tier developer: their **public** project name as text only, no logo. Do this only after a positive first conversation.
3. **Live n8n test workflow** (sample CSV of fictional sites → Telegram), run by the founder in their own n8n, for a live solar demo in the meeting.

## Do not build in this sprint
A live dashboard app, a sandbox CRM, new 3D web demos, or Command Center screens.
