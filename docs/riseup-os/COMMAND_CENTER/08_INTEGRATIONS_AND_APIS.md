# 08 — Integrations and APIs

Nothing below is assumed to be connected. Status reflects what the repository shows on 2026-11-15.

## 1. Inventory

| Integration | Current status (evidence) | Phase | Purpose in Command Center | Auth / secret | Scopes / permissions | Notes / risks |
|---|---|---|---|---|---|---|
| **Supabase** (Auth, Postgres, Storage) | Not set up (no dependency, no env vars) | A | Core DB and auth | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (auth only), two DB URLs per role | — | Free plan pauses after 7 days idle. Use Pro for production (doc 09) |
| **Anthropic API** | Not set up | C | Agent runtime, `web_search` / `web_fetch` server tools | `ANTHROPIC_API_KEY`, server only; Console spend limit | Workspace-scoped key for "command-center" | Web search $10 / 1,000 searches + tokens. Web fetch price NEEDS VALIDATION |
| **Telegram Bot API** | **Working** for contact-form leads (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) | A (notify) | Notifications: approvals waiting, agent failures, payments overdue | Existing token. Recommend a **separate bot** for admin alerts | Send-only to the owner's chat | No inbound commands in the MVP (avoids a second auth surface) |
| **Website contact form** | Working (`/api/contact`) | B | Inbound lead source → `leads` (stage Discovered, channel website) | Internal call from `deliver.ts` to the DAL, or via a signed webhook | — | Keep the Telegram delivery as is |
| **Generic webhook / n8n** | Env var supported (`CONTACT_WEBHOOK_URL`), value unknown. n8n MCP failed to connect in this session | E | Integration bus for ManyChat/Instagram events, client workflows | HMAC-signed webhooks both ways | Per-workflow | n8n licence when serving clients (Phase 1 doc 06) |
| **Resend email** | Env vars documented; **configured? NEEDS VALIDATION** | E | Transactional mail (invites are handled by Supabase) | `RESEND_API_KEY` | Verified domain | Not for prospecting bulk email |
| **Google Sheets** | Used manually by the business; Google Sheets MCP available to Claude Code sessions | B (import) / E (sync) | One-off CSV import of the Phase 1 sheet CRM. Optional two-way sync later | OAuth (Phase E) | `spreadsheets` on one file | Prefer CSV import over sync in the MVP |
| **Google Drive** | — | E | Store proposals and contracts | OAuth | `drive.file` (app-created files only) | Supabase Storage covers the MVP |
| **Gmail** | — | E | Send approved emails; detect replies | OAuth | `gmail.send`, `gmail.readonly` (metadata) | Google's restricted-scope verification may be required (NEEDS VALIDATION) |
| **Instagram / WhatsApp (Meta)** | ManyChat runs outside the repo | E | Read inbound DMs as leads; sending stays manual | Meta app review | — | Platform rules: no automated cold DMs |
| **Google Places API** | — | D (optional) | Discovery by category and area | API key with quotas | Places SKUs | Per-SKU free caps; billing account required. Store only place IDs and links |
| **Sentry** | — | A | Error monitoring | DSN (public) + auth token (CI) | — | PII scrubbing on |
| **Vercel Cron** | — | C | Agent worker tick (every minute, Pro) | `CRON_SECRET` | — | Hobby plans allow only hourly crons (official cron pricing page) |
| CRM platforms (HubSpot, Bitrix24, Zoho) | — | E | Client-project integrations, not internal | OAuth per client | — | Client-owned accounts |

## 2. Internal API surface (Phase A–C)

All routes are under `/api/admin/*` or are Server Actions. All are authenticated, authorized in the DAL and return `Cache-Control: no-store`.

| Endpoint / action | Method | Who | Purpose |
|---|---|---|---|
| Server Actions in `src/admin/actions/*` | POST (framework) | Users | CRUD, stage changes, approvals, payments |
| `/api/admin/agent-worker` | POST | Vercel Cron / `after()` with `CRON_SECRET` | Claim and advance queued runs |
| `/api/admin/cron/daily` | POST | Vercel Cron | Expire approvals, mark overdue invoices, daily backup trigger, reminders |
| `/api/admin/runs/[id]` | GET | Users with `agents.run` | Poll run status and steps |
| `/api/admin/approvals/count` | GET | Users | Badge polling |
| `/api/admin/export/[entity]` | GET | `export.data` (owner) + step-up | CSV export (audited) |
| `/api/admin/import/candidates` | POST | `crm.write` | CSV → `lead_candidates` |
| `/api/admin/health` | GET | Owner | DB, Anthropic key presence, cron last tick, backup last run |
| `/api/webhooks/n8n` (Phase E) | POST | HMAC signature | Inbound events |

## 3. Integration management UI rules

- Show **status, last successful sync, scopes, last error, configured-by**. Never secret values; at most a "set" indicator.
- Secrets are entered in Vercel or in the provider console, not in the Command Center, in the MVP. A later option is Supabase Vault for per-client OAuth tokens, encrypted at rest (NEEDS VALIDATION before adopting).
- Each integration has a **Test connection** button that calls a harmless endpoint (e.g. Telegram `getMe`) and logs the result.

## Sources (accessed 2026-11-15)
- Anthropic pricing: https://docs.claude.com/en/docs/about-claude/pricing
- Vercel cron usage and pricing: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Google Maps Platform pricing: https://developers.google.com/maps/billing-and-pricing/pricing-categories
- Repo evidence: `src/lib/contact/deliver.ts`, `.env.example`
