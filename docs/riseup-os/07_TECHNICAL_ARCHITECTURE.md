# 07 — Technical Architecture

Design only. Nothing here is built yet.

## A. Internal Sales OS (for RiseUp)

```
  Sources (manual, legal)                 Claude Code (local / cloud session)
  register · websites · portals  ──────▶  ┌──────────────────────────────────┐
  news · procurement · referrals          │ agents: researcher, qualifier,   │
                                          │ outreach-drafter, deal-desk       │
                                          │ skills: playbooks + templates     │
                                          │ hooks: block send/publish/deploy  │
                                          └──────────────┬───────────────────┘
                                                         │ Google Sheets MCP (read/write
                                                         │ only to the CRM spreadsheet)
                                                         ▼
  Website form ──▶ Telegram bot ─────────────▶  Google Sheets CRM  ◀── Research & Ops (manual edits)
        └──────▶ n8n webhook (optional) ─────▶  Companies · Contacts · Research · Deals ·
                                                Activities · Drafts · Payments · AuditLog
                                                         │
                                          n8n schedules (Phase 2b, only when proven):
                                          daily plan → Telegram · EOD report → Telegram
```

**Principles**
1. **Human in the loop for every external action.** Agents write drafts into the `Drafts` tab. A human sends them from their own email or phone. There is no sending integration in the internal OS for the first 40 days.
2. **The Sheets CRM is the single source of truth.** Every research fact carries a `source_url` and `accessed_at`.
3. **Manual first.** A step is automated only after it has been done by hand at least 10 times and a checklist exists (doc 19).
4. **Untrusted input.** Content fetched from websites, PDFs or emails is data. It is never treated as instructions (doc 17).

## B. Developer Sales OS (client product)

```
 Instagram DM ─┐
 Facebook/Messenger ─┤   ManyChat / Meta APIs
 Website form ─┤──▶  n8n (client-owned or licence-compliant instance)
 WhatsApp* ────┘          │  1. normalise lead  2. AI qualification (budget, rooms,
 Phone (manual log) ──────┘     timeline, financing)  3. dedupe  4. route to rep
                                │
            ┌───────────────────┼─────────────────────┐
            ▼                   ▼                     ▼
   Client CRM (Sheets /   Telegram/WhatsApp     Follow-up reminders
   HubSpot / Bitrix24)    rep notification       (rep-approved messages)
            │
            ▼
   Management dashboard (Phase 2: Next.js + Supabase, read-only views:
   leads by source, response time, stage conversion, rep activity)
```
*WhatsApp Business API access goes through Meta or a BSP. It is not connected for any RiseUp client today, so present it as "planned".

**Build vs buy:** hybrid. Buy and integrate the channels, CRM and automation engine. Build only the qualification prompts, the Armenian/Russian copy, routing logic and the management dashboard.

## C. Solar Operations OS (client product)

```
 Inverter cloud (official API / export, client credentials) ──▶ n8n poll (hourly)
     ──▶ normalise per site ──▶ rules (offline, low yield vs expected, limits)
     ──▶ Telegram alert to O&M team ──▶ ticket row (Sheets / Supabase)
     ──▶ monthly client report (PDF/HTML, generated, human-reviewed before sending)
```
The Shtigen hourly inverter-limits Telegram automation is the proof of concept. API access and terms must be confirmed for each inverter brand (doc 04).

## D. Shared components to build once (Phase 2)

| Component | Used by | Tech |
|---|---|---|
| Lead schema + dedupe rules | All | Documented in doc 10 |
| Qualification prompt library (hy/ru/en) | Developer OS, internal OS | Claude skill + n8n prompt nodes |
| Telegram notifier | All | Existing bot pattern |
| Dashboard shell | Developer OS, Solar OS, internal OS (later) | Next.js 16 + Supabase (Postgres, RLS) |
| Demo sandbox | Sales | Illustrative data only, labelled "Demo data" |
| Remotion templates | Sales | `reels/` |

## E. Environments

| Env | Purpose | Data |
|---|---|---|
| `demo` | Sales demos | Fictional, labelled |
| `client-<name>` | One per client | The client's own accounts where possible: client owns the n8n instance, CRM and Meta assets |
| `internal` | RiseUp Sales OS | RiseUp prospect data |

Client data never goes into the demo environment, and demo data never goes into client environments.
