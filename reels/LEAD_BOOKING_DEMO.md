# RiseUp Lead-to-Booking System — product demo video

75-second animated product demo in English and Armenian, in 16:9 (1920×1080) and 9:16 (1080×1920), 30 fps.

## Files

| What | Where |
|---|---|
| Rendered videos | `out/lead-booking/riseup-lead-booking-demo-{en,hy}-{16x9,9x16}.mp4` |
| Subtitles (SRT) | `out/lead-booking/riseup-lead-booking-demo-{en,hy}.srt` (also burned into the videos) |
| All text, voice lines, timing | `src/lb/config.ts` |
| Scenes | `src/lb/LeadBooking.tsx` |
| Reusable UI (phone, chat, typing, slots, appointment card, status pill, notification, logo) | `src/lb/ui.tsx` |
| Compositions | `lb-en-16x9`, `lb-en-9x16`, `lb-hy-16x9`, `lb-hy-9x16` in `src/Root.tsx` |
| Background music | `public/music/lb-demo.mp3` (original, synthesized for this project, so no licensing questions) |
| Voice-over (optional) | `public/voice/lb-demo-en.mp3`, `public/voice/lb-demo-hy.mp3` — picked up automatically |

`out/` is not committed. Render it with the command below.

## Render

```bash
cd reels
npm install
node --experimental-strip-types render-lb.mjs          # all four videos + SRT
node --experimental-strip-types render-lb.mjs hy       # one language
node --experimental-strip-types render-lb.mjs --srt-only
npm run studio                                         # preview and edit in Remotion Studio
```

## Change things

- **Text, prices, names, CTA, URL:** `src/lb/config.ts` (`LB_COPY.en`, `LB_COPY.hy`).
- **Scene length:** `SCENES` in `src/lb/config.ts` (seconds). Subtitles follow automatically. Animation cues inside a scene are frame offsets at the top of each scene in `LeadBooking.tsx` (`CHAT_AT`, `BK`, `DB`, `FU`).
- **Voice-over:** drop an MP3 at `public/voice/lb-demo-{lang}.mp3` and render again. The music is lowered automatically while a voice track exists. If the recording is longer or shorter than a scene, adjust `SCENES`.
- **Brand:** colours in `src/lb/ui.tsx` (`C`), logo paths in `src/logo.ts` (shared with the website).

## Product accuracy

The demo shows only what the current RiseUp setup does:

| Shown | Current implementation |
|---|---|
| Instagram conversation, automatic replies, questions, details collected | n8n + ManyChat assistant |
| Available times offered in the chat | the assistant offers slots |
| "Appointment request received" → team clicks **Confirm** → "Appointment confirmed" | request is registered first; confirmation is shown only after the time is verified (calendar or team) |
| Inquiries list "Synced with Google Calendar and Google Sheets" | bookings go to Google Calendar, customer data to Google Sheets |
| Team notification in Telegram | Telegram notification to the team |
| Follow-up message | shown as **optional**, "sent only when your settings and messaging rules allow" |

Not shown on purpose: WhatsApp as a live channel (not connected yet) and automatic confirmation of every booking.

The "Inquiries" screen is a design of how the lead list looks to the business owner. Today that data lives in Google Sheets and Google Calendar. If you show this video to a client before a RiseUp panel exists, say so, or keep the "Synced with…" line visible as it is now.

## Voice-over scripts

The exact lines (also used for the subtitles) are in `src/lb/config.ts` → `voice`. Copy for TTS or a voice actor:

### English (≈75 s, calm, confident, medium pace)

| Time | Line |
|---|---|
| 0–8 | Every day, potential customers message your business. But when you're busy, not every message gets a reply — and every unanswered message can be a lost booking. |
| 8–14 | Meet RiseUp — your automated Lead-to-Booking System. |
| 14–25 | When a customer writes on Instagram, RiseUp replies in seconds. It understands what they need, asks the right questions and collects their details. |
| 25–37 | Then it offers available times. The customer picks one and the request is registered — and confirmed once the time is verified by your calendar or your team. |
| 37–49 | Every inquiry lands in one organized list: who wrote, which service they want, their contact details and the status of each request. |
| 49–59 | If someone stops halfway, RiseUp can send a polite follow-up when your settings allow it. And your team is notified the moment a new request arrives. |
| 59–68 | Respond faster. Organize every inquiry. Make booking easier. Keep your team informed. |
| 68–75 | RiseUp. Turn conversations into bookings. Request your personalized demo. |

### Armenian (Eastern Armenian, natural, professional)

| Time | Line |
|---|---|
| 0–8 | Ամեն օր պոտենցիալ հաճախորդները գրում են Ձեր բիզնեսին։ Բայց երբ զբաղված եք, ամեն հաղորդագրություն չէ, որ պատասխան է ստանում, և ամեն անպատասխան նամակ կարող է կորցրած ամրագրում լինել։ |
| 8–14 | Ծանոթացեք RiseUp-ին՝ Ձեր հաճախորդների կառավարման և ամրագրման ավտոմատ համակարգին։ |
| 14–25 | Երբ հաճախորդը գրում է Instagram-ում, RiseUp-ը պատասխանում է վայրկյանների ընթացքում, հասկանում է, թե ինչ է նրան պետք, տալիս է ճիշտ հարցերը և հավաքում նրա տվյալները։ |
| 25–37 | Հետո առաջարկում է ազատ ժամեր։ Հաճախորդն ընտրում է հարմար ժամը, և հարցումը գրանցվում է։ Այցը հաստատվում է, երբ ժամը ստուգվում է Ձեր օրացույցով կամ թիմի կողմից։ |
| 37–49 | Բոլոր հարցումները հավաքվում են մեկ կազմակերպված ցուցակում՝ ով է գրել, ինչ ծառայություն է ուզում, նրա կոնտակտները և ամեն հարցման կարգավիճակը։ |
| 49–59 | Եթե հաճախորդը կիսատ է թողնում, RiseUp-ը կարող է ուղարկել քաղաքավարի հիշեցում, եթե դա թույլատրված է Ձեր կարգավորումներում։ Իսկ Ձեր թիմը տեղեկանում է նոր հարցման մասին անմիջապես։ |
| 59–68 | Ավելի արագ պատասխանեք։ Կառավարեք բոլոր հարցումները։ Հեշտացրեք ամրագրումները։ Տեղեկացված պահեք Ձեր թիմին։ |
| 68–75 | RiseUp. Հաղորդագրությունները վերածեք ամրագրումների։ Պատվիրեք անհատական ցուցադրություն։ |

The Armenian lines are denser than the English ones. Read them at a natural pace; if the recording runs long, send it and the scene lengths will be adjusted to it.
