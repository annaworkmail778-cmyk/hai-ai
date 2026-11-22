# RISEUP Website Audit: riseup-group.com

**Method:** the live site is **blocked by this cloud environment's network policy**, so the audit inspects the **deployed source code** in this repository (Next.js app; all hy/ru/en copy in `src/locales/*.json`, prices in `src/config/pricing.ts`, brand in `src/config/brand.ts`). Mobile layout was reviewed and fixed earlier in this project. **Confirm the live site in a phone browser before outreach.**

**No changes were made or deployed.**

## What the site says today
| Area | Content (from source) |
|---|---|
| Positioning (hero) | "AI and automation for businesses in Armenia. More customers. More sales. Less routine." |
| Products (5) | 1) AI administrator + booking; 2) Order system for online shops; 3) Real-estate system; 4) Instagram & Google marketing; 5) Websites. Plus AI video ads |
| Prices (AMD, "launch price") | See the table below |
| Payment terms on site | 50% at start, 50% at launch; the monthly fee starts after launch and includes hosting, AI usage, support and small changes; contract and invoice |
| Examples | Interactive demos labelled "Example", with a clear notice that they are not client projects |
| About | "Small team in Yerevan… prices local businesses can afford" |
| Contact | Name + phone + business form → Telegram; email and phone shown |
| Languages | Armenian (default), Russian, English |

**Published prices** (`src/config/pricing.ts`):

| Plan | Setup | Monthly |
|---|---|---|
| AI admin Start | 45,000 | 15,000 |
| AI admin Pro | 90,000 | 25,000 |
| Orders | from 70,000 | 20,000 |
| Real estate | from 140,000 | 25,000 |
| Google & reviews | — | 20,000 |
| Google + Instagram | — | 45,000 |
| AI video | from 25,000 (3 for 60,000) | — |
| Landing | from 80,000 | 8,000 |
| Company website | from 150,000 | 12,000 |
| Online shop | from 150,000 | 12,000 |
| Premium 3D site | from 250,000 | 15,000 |

## Evaluation by audience
| Visitor | Clear what we sell? | Trust | Verdict |
|---|---|---|---|
| Armenian business owner | **Yes**: 5 concrete products, AMD prices, demos in Armenian | Medium: no real case studies yet; honest "Example" labels help | **Works for direct sales** |
| Russian-speaking owner | Yes (full RU version) | Medium | Works |
| EU/US agency looking for a white-label partner | **No.** The site is positioned only for small Armenian businesses; no partner/white-label offer, no USD pricing, a "launch prices for local businesses" message, a gmail address | Low for this audience | **Do not use the homepage as the main agency link.** Use the capability statement + portfolio page, with riseup-group.com as a "build quality" example |
| Creator | No creator offer | — | Use the creator proposal document instead |

## Prioritized issues

### Critical before outreach (P0): handled **without** editing the site
| # | Issue | Fix for tomorrow |
|---|---|---|
| C1 | No white-label/agency positioning | Send `COMPANY_CAPABILITY_STATEMENT` (PDF) + portfolio link instead of the homepage to agencies |
| C2 | Brand casing "Riseup" on the site vs "RISEUP" in documents | Acceptable for now (same brand). **With authorization:** one-line `COMPANY_NAME` change + locale search-and-replace (≈ 30 min + deploy) |
| C3 | Legal line shows the brand as the legal name (`legalName: "Riseup"`) | Not blocking outreach. Fix when legal details are known (P1, authorization needed) |

### Important (P1–P2, only with authorization, ≤ 2 hours total)
| # | Change | Why | Effort |
|---|---|---|---|
| I1 | Add a domain email (hello@riseup-group.com) and show it | Credibility with agencies | 30 min (DNS/email provider: owner action) |
| I2 | Add an end date to "launch price" (e.g. "until 31 January 2027") | Lets prices rise later without breaking promises | 10 min |
| I3 | Add one line under prices: "Hosting, AI usage up to fair-use limits and small changes included; WhatsApp/Meta message fees and third-party subscriptions billed at cost" | Avoids margin loss on AI/API usage | 15 min |
| I4 | Add an "Agencies / partners" section or page (EN/RU) with the white-label offer and a contact CTA | Supports channel A | 1–2 h |
| I5 | Publish real case studies (HosDog, the real estate site) **with written client permission** | Trust | 1 h each |

### Optional (P3)
More languages for the demos; a pricing calculator; blog/SEO.

### Do not change now
Design, 3D scenes, navigation, product structure, existing prices (see the pricing decision), and the honest "Example" labelling.

## Answers
| Question | Answer |
|---|---|
| Positioning clear? | Yes for Armenian SMBs; no for agencies |
| Communicates what we sell? | Direct products yes; white-label no |
| Products easy to understand? | Yes |
| Prices appropriate? | Appropriate as **entry packages** for local SMBs. Too low as a general price list. Needs scope limits and minimums (pricing file) |
| Demos convincing? | Visually strong; clearly labelled examples, not proof of results |
| Sufficient trust? | Medium: missing real cases, legal identity and a domain email |
| Case studies missing? | Yes (need client permission) |
| International capability shown? | Language versions yes; positioning no |
| Supports white-label? | No. Covered by documents for now |
| Easy to contact/buy? | Easy to contact (form → Telegram, phone). Buying requires a call, which is appropriate |
