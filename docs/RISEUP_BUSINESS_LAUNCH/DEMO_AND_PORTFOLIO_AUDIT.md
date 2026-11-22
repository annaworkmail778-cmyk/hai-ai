# Demo and Portfolio Audit

**Rule:** demos show how a system works, using illustrative data and clearly labelled as such. **No fictional client is presented as a real customer. No unverified results.**

## All assets
| Asset | Current state | Target customer | Commercial value | Required action | Class |
|---|---|---|---|---|---|
| riseup-group.com (hy/ru/en, 3D, interactive demos, form → Telegram) | Live; source in this repo | All (build-quality proof) | High | Record a 60 s tour (L1) | **Needs recording** |
| Lead-to-Booking video (en/hy, 16:9 + 9:16, with voice) | Rendered (`reels/out/lead-booking/`) | Clinics, beauty, agencies selling AI assistants | High | Upload as an unlisted link | **Ready to present** |
| Developer Sales OS video (30 s, en/hy) | Rendered (`reels/out/sales-demos/`) | Real estate, CRM agencies | High | Upload | **Ready to present** |
| Solar Alerts video (30 s) | Rendered | Niche (solar, monitoring) | Low–medium | Upload; use only for automation examples | Ready (niche) |
| Interactive site demos (salon, shop, real estate, marketing, web) | On the site, labelled "Example" | Direct SMB | Medium | Use inside the L1 tour | Ready (inside L1) |
| Reels 01–05, contest video | Rendered | AI-video add-on | Medium | Upload 2 best as an "AI video" sample | Ready |
| HosDog ordering + dashboard + printer (real client) | Live client system | Restaurants, e-commerce | **Very high** (real) | **Ask written permission**, record 45 s on a phone (blur customer data) | Needs permission + recording |
| Real estate WhatsApp-group site (real client) | Client system | Real estate | High (real) | Ask permission; screen recording | Needs permission + recording |
| Shtigen hourly automation (real client) | Client system | Automation agencies | Medium | Permission; blurred screenshots | Needs permission |
| AI admin n8n + ManyChat (own build) | Working (founder-reported) | Agencies, clinics/beauty | High | Record the workflow canvas (L3) | **Needs recording** |
| White-label client dashboard | Does not exist | Web/CRM agencies, Upwork | High | Build ≤ 6 h with demo data (L4) | Needs major work (build) |
| Command Center docs, research reports | Internal | — | None for sales | — | **Not suitable for sales** |
| hai-ai.systems, the HAI-AI Partnership PDF | Outdated / missing | — | None | Do not use | Not suitable |

## The minimum demo set (5 items) and coverage
| Demo | CRM agencies | Marketing agencies | Web agencies | Automation agencies | Real estate | Restaurants | Clinics/beauty | E-commerce | Bloggers |
|---|---|---|---|---|---|---|---|---|---|
| **L1** Site tour | | ✔ | ✔ | | | | ✔ | ✔ | ✔ |
| **L2** Lead-to-Booking (AI assistant) | ✔ | ✔ | | ✔ | | | ✔ | | |
| **L3** n8n workflow walkthrough | ✔ | | | ✔ | | | | ✔ | |
| **L4** White-label dashboard | ✔ | | ✔ | ✔ | | | | ✔ | |
| **L5** Developer Sales OS | ✔ | | | | ✔ | | | | |
| *(+ HosDog case if permitted)* | | | | | | ✔ | | ✔ | |

## Specification per demo
| Demo | What it shows | Problem solved | Required material | Length | Call to action | Used in |
|---|---|---|---|---|---|---|
| L1 | Our 3-language site: mobile view, demos, form → Telegram alert | "Can they build premium, fast sites?" | Screen recording + voice | 60 s | "Send one brief; we'll scope a $300 test" | Web/marketing agency messages; direct website offers |
| L2 | Instagram inquiry → AI reply → slot → request → team alert → inquiry list (**demo data**) | Missed inquiries, slow replies | Existing video + 10 s intro | 60–80 s | "Want this for your clients / your business?" | AI-assistant offers (agencies, clinics, beauty) |
| L3 | Form/webhook → n8n → CRM/Sheets → Telegram/Slack, with error handling | "Do they really build automations?" | Recording of the n8n canvas + a test run | 60 s | "Paid test: one workflow, $300" | Automation/CRM agencies; Upwork |
| L4 | Login → KPI cards → filtered table → detail view (**demo data**) | Client portals / dashboards | Next.js build ≤ 6 h + recording | 60 s | "Dashboard projects from $1,800" | Web/CRM agencies; Upwork |
| L5 | Scattered inquiries → AI reply → lead card → manager alert → pipeline (**demo data**) | Lead chaos at developers/agencies | Existing video | 30 s | "30-day pilot" | Real estate, CRM partners |
