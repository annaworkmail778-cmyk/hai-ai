# 13 — Website and Branding Plan

## Recommendation
**Extend the existing riseup-group.com site** with three B2B pages. Do not build a second site.

| | |
|---|---|
| Alternatives | A new site on riseup.systems; a separate B2B subdomain |
| Why | The site is already live, multilingual and wired to Telegram. A new domain splits authority and costs money. **The founder must decide the domain** (doc 21) |
| Cost | $0 (plus Vercel Pro when commercial, doc 06) |
| Effort | About 2–3 days in Phase 2 |
| Risk | Mixing SMB and B2B messaging. Fix it with a clear "For businesses / For developers & energy" split in the nav |

## New pages (Phase 2)

| Route | Content |
|---|---|
| `/[lang]/developers` | Developer Sales OS: problem, flow diagram, demo video (A), pilot scope, pricing "from", FAQ, form with fields company, role, number of active projects, channels |
| `/[lang]/solar` | Solar Operations OS: problem, flow, demo video (B), pilot scope, data-access note per inverter brand, form |
| `/[lang]/automation` | Enterprise Automation: example workflows (labelled examples), process, form |
| `/[lang]/partners` | (Later) Referral/partner programme, terms summary, application form |

All forms go to the existing Telegram notification. In Phase 2 they also go to the CRM (Sheets) through n8n.

## Copy rules
- No invented clients, logos, testimonials or metrics. Case studies appear only after written client permission.
- Demo screens carry the "Demo · illustrative data" badge.
- Privacy notice on every form (what is collected, why, retention, contact for deletion). The text must be reviewed by the lawyer.

## Branding
- Keep the current visual identity: logo, colours, 3D growth model.
- B2B tone: calmer, more data-oriented, fewer emojis. Navy and white sections with a single accent colour.
- Use the same palette for the deck and proposal templates (doc 14), so every asset looks consistent.

## SEO (light)
- Target queries in hy/ru/en, e.g. "CRM կառուցապատողների համար" ("CRM for developers"), "CRM для застройщика Ереван" ("CRM for a developer, Yerevan"), "solar monitoring Armenia". Unverified keyword volumes, so treat this as an assumption.
- Add to the sitemap. Write metadata per locale.
