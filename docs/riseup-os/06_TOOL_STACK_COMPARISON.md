# 06 — Tool Stack Comparison (free-first)

Access date 2026-11-15. Prices and limits change often, so recheck the vendor's own page before committing. "CC" means a credit card is required.

## Recommended stack (decisions)

| Need | Recommendation | Alternatives | Why | Cost now | Migration risk |
|---|---|---|---|---|---|
| Internal CRM (days 1–40) | **Google Sheets** with a strict schema (doc 10) | HubSpot Free, Zoho Free, Airtable Free | Already used. Free. Both people know it. Google Sheets MCP is available to Claude Code | $0 | Low. CSV export to anything |
| CRM after day 40 | Decide at day 30: **HubSpot Free** if the pipeline is under 1,000 contacts and 2 users are enough; or a **custom Supabase** layer if the product dashboard is needed anyway | Zoho (3 users free), Bitrix24 | Avoid custom work until proven | $0 | Medium |
| Automation | **Existing n8n** (already runs the AI admin) | Make, Zapier, Activepieces | Already known and running | $0 + current hosting | n8n licence: see below |
| Notifications | **Telegram bot** (existing) | Email, Slack | Free and already wired | $0 | Low |
| Website | **Existing Next.js site** | — | Already live | $0 | — |
| Hosting | Vercel Hobby today. **Move to Vercel Pro ($20/mo) or Cloudflare Pages at first revenue** | Netlify | Hobby is for non-commercial use (verify in Vercel's terms) | $0 → $20/mo | Low |
| Database (Phase 2+) | **Supabase Free** | Neon, Firebase | Postgres + auth + RLS | $0. Pauses after 7 days of inactivity [S37] | Low (it is Postgres) |
| AI agents | **Claude Code** (existing) with project agents and skills (doc 09) | Custom agent code | Already in use. Subagents, skills, hooks and MCP built in [S1, S2] | Existing subscription | Low |
| Video | **Remotion** (existing) | CapCut, After Effects | Free for companies of ≤3 people [S38]. Pipeline already built | $0 | If headcount > 3, a company licence is needed |
| Voice | **ElevenLabs** (existing) | Google TTS, Azure TTS | Voices already chosen | **Unknown plan.** The free tier lacks commercial rights [S39] | Medium |
| E-signature | **Not for binding contracts in Armenia yet**: use wet signature or Armenian digital ID signature. DocuSeal/Documenso for non-critical acknowledgements | DocuSign | See doc 16 | $0 | Low |
| Prospecting | Manual sources + Hunter Free + Google Places (capped) | Apollo Free, Sales Navigator | Legal and cheap | $0 (Places needs CC) | Low |

## Detailed tool notes

| Tool | Free tier | CC? | API | Commercial restrictions | Paid entry | Risk |
|---|---|---|---|---|---|---|
| Google Sheets | Free | No | Sheets API with per-minute quotas (exact quotas not researched) | None for our use | Workspace from ≈ $7/user (assumption) | Not a real database. Keep each sheet below ~50k rows |
| HubSpot CRM Free | 2 users, 1,000 contacts [S3] | No | Yes | Branding on some tools | Starter ≈ $20/seat [S3] | Contact caps |
| Zoho CRM Free | 3 users [S4] | No | Limited | — | Standard $14, Pro $23 [S4] | Low |
| Bitrix24 Free | User cap reported inconsistently, 5 GB. Pipelines and WhatsApp are paid [S5] | No | Yes | — | Standard ≈ $99/mo for 50 users [S5] | Pricing conflicts across sources |
| Airtable Free | 1,000 records per base, 100 automations [S6] | No | Yes | — | Team plan | Record cap |
| n8n | Self-host under the Sustainable Use Licence | No | Yes | **Using one n8n instance to run workflows for paying clients, i.e. hosting it as a service, may need a commercial licence. Building workflows on the client's own instance is generally allowed.** Verify with n8n [S7, S8] | Cloud from ≈ €20/mo (assumption) | **Licence must be confirmed before reselling** |
| Make / Zapier / Activepieces | Small free tiers [S15] | No | Yes | — | ≈ $9–30/mo | Per-operation costs grow quickly |
| Vercel Hobby | Free | No | — | **Non-commercial use only** (secondary sources; verify in vercel.com/legal/terms) | Pro $20/user/mo | Terms breach if left on Hobby |
| Cloudflare Pages/Workers | 100k Worker requests/day, 500 builds/month, 1 concurrent build (secondary) [S40] | No | — | Commercial use reportedly allowed on free (secondary; verify) | Workers Paid ≈ $5/mo | Next.js needs an adapter |
| Supabase Free | 2 projects. Pauses after 7 days of inactivity [S37] | No | Yes | — | Pro $25/mo | Pausing |
| Google Places API | Per-SKU monthly caps: 10k Essentials, 5k Pro, 1k Enterprise [S35] | **Yes** (billing account) | Yes | Google Maps terms restrict storing data. Keep place IDs and links, not bulk copies | Pay-as-you-go | Unexpected bills. Set quotas and budget alerts |
| Hunter | 25 searches + 50 verifications per month [S10] | No | Yes | — | ≈ $34–49/mo (assumption) | Low |
| Apollo | About 10 exports/month [S9] | No | Limited | — | ≈ $49–59/mo (assumption) | Data accuracy for Armenia |
| LinkedIn Sales Navigator | — | Yes | No public API | Automation tools are against LinkedIn's terms | Core ≈ $119.99/mo [S11] | Skip at first |
| Remotion | Free for ≤3-person companies [S38] | No | — | Company licence above 3 people | Company licence | Low |
| ElevenLabs | Free tier with no commercial licence [S39] | No | Yes | Need a paid tier for commercial use | Starter ≈ $5/mo (assumption, verify) | **Check the current plan** |
| DocuSeal / Documenso | Open-source self-host, plus cloud tiers [S41, S42] | No | Yes | — | Cloud per-user or per-document pricing | Legal weight in Armenia (doc 16) |
| Resend / email sending | **Not researched** | — | — | — | — | Unknown |
| Royalty-free music | **Not researched.** We currently synthesize our own music | — | — | — | — | Unknown |
| OpenAI / Gemini APIs | **Not researched** in this phase | — | — | — | — | — |

## Estimated monthly cost

| Item | Days 1–40 | After first revenue |
|---|---|---|
| Domain riseup-group.com (renewal ≈ $23/yr, founder-reported) | $0 now | ≈ $2/mo equivalent |
| Hosting | $0 (Hobby) | $20 (Vercel Pro) or ≈ $5 (Cloudflare) |
| ElevenLabs commercial | $5–22 (if not already paid) | same |
| Supabase | $0 | $0–25 |
| n8n | existing | + commercial licence if reselling hosted workflows (unknown price) |
| Prospecting tools | $0 | $0–49 |
| Ads (SMB contest, already planned) | 20–30k AMD ≈ $50–80 | founder decides |
| **Total tools** | **≈ $5–30** | **≈ $30–120** |
