# 12 — Demo Video Storyboards

Storyboards only. **No final videos are produced in Phase 1.** All of them will be built in Remotion (`reels/`), reusing the Lead-to-Booking UI kit (`reels/src/lb/ui.tsx`).
- **Data:** every company name, number and person on screen is fictional, with a visible "Demo · illustrative data" badge.
- **Language and format:** each video in hy + en (ru optional), 16:9 + 9:16.
- **Voice:** ElevenLabs, only on a plan with commercial rights (doc 06).
- **Music:** synthesized originals, as today.

## A. Developer Sales OS — product demo (≈ 90 s)

Flow required by the brief: inquiry → capture → AI qualification → CRM → rep notification → follow-up → management dashboard.

| # | Time | Visual | Voice-over (en draft) |
|---|---|---|---|
| 1 | 0–7 | Phone with 4 notifications: Instagram, Facebook, site form, missed call. Counter "12 new inquiries today" | "Your new project launched. Inquiries arrive from five places at once." |
| 2 | 7–14 | Messages fade unanswered, timer ticking "2 h 15 min" | "Every hour without a reply, buyers move on to the next developer." |
| 3 | 14–20 | RiseUp logo, title "Developer Sales OS" | "Meet the Developer Sales OS." |
| 4 | 20–34 | Instagram chat. AI replies in seconds in Armenian, asks: rooms, budget range, timeline, financing (mortgage/cash) | "Every inquiry gets an answer in seconds — in Armenian, Russian or English — with the questions your sales team needs." |
| 5 | 34–44 | Lead card fills itself: name, project "Demo Residence", 3 rooms, budget, timeline, score "Hot" | "It qualifies the buyer and creates a complete lead card." |
| 6 | 44–52 | Lead drops into a CRM board column "New → Qualified". Label "Works with your CRM or Google Sheets" | "The lead goes straight into your CRM — no copy-paste." |
| 7 | 52–60 | Telegram notification to "Sales rep: Anna" with a "Call now" button | "The right sales manager is notified instantly." |
| 8 | 60–70 | Reminder "Follow up tomorrow 11:00". Rep-approved message template | "Follow-ups are scheduled, and messages go out only when your team approves." |
| 9 | 70–82 | Management dashboard: leads by source, median response time, conversion by stage, rep activity. Badge "Demo data" | "Management sees the whole pipeline — sources, response times, conversion — in one view." |
| 10 | 82–90 | CTA: "30-day pilot · Book a demo" + URL | "Start with a 30-day pilot. Book your demo." |

Do not show: guaranteed sales uplift, real developer logos, automatic sending without approval, or WhatsApp as live unless connected.

## B. Solar Operations OS — product demo (≈ 75 s)

| # | Time | Visual | VO (en draft) |
|---|---|---|---|
| 1 | 0–8 | Map of Armenia with 40 site pins, a few blinking red | "You maintain dozens of solar sites. Problems hide until a client calls." |
| 2 | 8–14 | Several inverter portal logos as generic icons (no brand logos without permission) | "Different inverter brands, different portals." |
| 3 | 14–20 | Title "Solar Operations OS" | "Meet the Solar Operations OS." |
| 4 | 20–34 | Hourly check animation, then an alert card: "Site Demo-17 · offline 2 h" / "Yield 38% below expected" | "Every hour it checks each site and flags what needs attention." |
| 5 | 34–44 | Telegram alert to the O&M team, with "Create ticket" | "Your team gets an alert in Telegram and opens a service ticket in one tap." |
| 6 | 44–56 | Ticket list: open, scheduled, resolved; technician assigned | "Every visit is tracked from alert to fix." |
| 7 | 56–66 | Monthly client report preview: production chart, uptime, interventions. "Demo data" | "Clients receive a clear monthly report — reviewed by you before it's sent." |
| 8 | 66–75 | CTA: "Pilot on up to 10 sites" | "Start with a pilot on up to ten sites." |

Note: the voice-over must say "where your inverter platform provides data access", because API availability varies by brand.

## C. Short videos (social / ads)

| Length | Purpose | Structure |
|---|---|---|
| 30 s | Hook ad | Pain (lost inquiry), product flash (AI reply → lead card → notification), CTA |
| 60 s | Explainer | Cut-down of A or B: scenes 1, 4, 5, 7, 9, 10 |
| 90 s | Full demo | A or B as above |

## D. Personalized videos (A-tier prospects only)

- A Remotion template with props `{companyName, projectName?, language, painPoint}`.
- Only **public** facts with sources from the research brief. No logos, photos or brand assets of the prospect without permission. Text name only.
- The founder records a 10-second personal intro (optional), then a 45-second demo cut with the company name on the lead card ("Inquiry for {projectName}").
- It is sent manually, as a link, after the founder approves it. At most 3–5 per week.
- Risk: using a prospect's name in a sales video is generally acceptable for a private 1:1 pitch, but confirm with the lawyer (doc 16).
