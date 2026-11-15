# 02 — Existing Project Audit

Audited 2026-11-15 on branch `claude/premium-tech-portfolio-site-xk28q4` (head 9f10795). The audit was read-only, and nothing was changed or deleted.

## Repository

| Area | What exists | Relevance to the Sales OS |
|---|---|---|
| Website | Next.js 16.2.9 (App Router, `proxy.ts`, Turbopack), React 19.2, Tailwind v4, three/R3F, GSAP. Locales en/hy/ru in `src/locales/*.json`. Deployed on Vercel at riseup-group.com | B2B landing pages can be added here (doc 13). No second site is needed |
| Lead capture | Contact form (`name`, `contact`, `company`) → Telegram bot (working). Optional `CONTACT_WEBHOOK_URL` for n8n | The first inbound capture point for the Sales OS |
| Pricing | `src/config/pricing.ts`, 11 SMB plans in AMD (e.g. AI admin 45k–90k setup, real-estate 140k setup) | SMB prices are too low for developer B2B deals. New B2B tiers are needed (doc 03) |
| Projects | `src/content/projects/*`, 5 entries, all `status: "concept"` | There are no real case studies yet. Keep the "concept" labels |
| Brand | `src/config/brand.ts`: riseup.group.2026@gmail.com, +374 77 200 433, Instagram/TikTok/YouTube @riseup.group.2026, site riseup-group.com | See the discrepancy below |
| Videos | `reels/` (Remotion 4.0.541). Reels 01–05, the Lead-to-Booking demo (en/hy, 16:9 + 9:16), and the contest video | This is reusable infrastructure for the Developer and Solar demos (doc 12) |
| Contest | `/contest` page, banner, rules; Nov 13–25, 2026 | It is an SMB lead source that runs during the 40-day window |
| Docs | `docs/plan-60-days.md`, `docs/visual-assets-needed.md`, `docs/marketing/*` | The SMB marketing plan. This folder complements it and does not replace it |
| Claude config | `CLAUDE.md` → `@AGENTS.md` (a Next.js-version warning). `.claude/launch.json`. `.claude/skills/` and `.agents/skills/` are gitignored (Higgsfield skills) | No project agents, rules or hooks are committed yet (doc 09) |

## Not found in the repo

- No solar documents, data or screenshots.
- No contracts, proposals, invoices or price sheets for B2B work.
- No CRM, database or lead list.
- No customer testimonials or metrics.

## Discrepancies to resolve (also in doc 21)

| Brief says | Repo/live says | Decision needed |
|---|---|---|
| Domain **RISEUP.systems** | **riseup-group.com** is live. riseup-llc.com was discussed earlier | Which domain is the B2B brand? Domains cost money and need approval |
| Instagram **hai_ai_systems** | **@riseup.group.2026** | Which handle to use. The old HAI_AI site was removed at the founder's request |
| "Company" | The contest rules template says "Riseup (ԱՁ)". The legal form has not been confirmed | ԱՁ (sole proprietor) or LLC? This affects contracts, VAT and invoices |

## Existing business assets (founder-reported, not in repo)

- An n8n instance and ManyChat account powering the AI admin.
- Google Calendar and Sheets integrations, and a Telegram bot.
- Ameriabank account.
- ElevenLabs voices in use (Aram for hy, Jessica for en). **The plan tier is unknown, which matters for commercial rights** (doc 06).
- About 5–6 Higgsfield credits left; trial ended. Google Flow is used for free AI clips.
- Social accounts on Instagram, Facebook, TikTok and YouTube.

## Conclusion

Keep the existing site, the video pipeline and the n8n/Telegram stack. The gaps are commercial rather than technical:
- B2B offers and prices.
- A target list.
- Proof assets: demos labelled as demos.
- Proposal and contract templates.
- A disciplined pipeline.
