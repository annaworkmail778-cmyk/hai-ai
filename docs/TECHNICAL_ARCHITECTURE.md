# RISEUP Business OS: Technical Architecture

## 1. Audit of the existing repository (2026-11-27)
| Area | Finding | Reuse for Business OS? |
|---|---|---|
| App | `hai-ai`: the marketing site riseup-group.com. **Next.js 16.2.9** (App Router), **React 19.2.4**, TypeScript 5, **Tailwind CSS v4**, ESLint 9. Heavy visual stack: GSAP, Lenis, three.js / @react-three/fiber | Same core stack; not the visual libraries |
| Next.js specifics | v16 conventions: `src/proxy.ts` (formerly middleware) does locale redirects for `/hy`, `/ru`, `/en`. Optional Cache Components (`"use cache"`). Docs in `node_modules/next/dist/docs/` must be read before coding (per `AGENTS.md`) | Follow the same docs |
| i18n | Own lightweight system: `src/i18n/{config,dictionaries,format,types}.ts`, JSON dictionaries in `src/locales/{hy,ru,en}.json`, locale cookie | **Copy the pattern** (no i18n library needed) |
| Design system | Tokens in `src/styles/site.css` (`@theme`): ink/paper palette, signal orange `#ff5b14`, Geist + Noto Sans Armenian fonts. UI primitives `Button`, `Eyebrow`, `PageHeader`, `Arrow` | Reuse **brand tokens and fonts** for the RISEUP admin shell; the customer sites need their own identities |
| Interactive demos | `src/components/demos/*`: scripted two-screen demos (phone + app window) for salon, shop, real estate, marketing, web. `DemoDefinition` (steps, focus side, per-locale captions), `kit.tsx` primitives (`Appear`, `Enter`, device frames) | **Reuse the storytelling pattern and the device frames** for the guided demo and presenter split-view |
| Backend | No database, no auth, no user accounts. Only `POST /api/contact` with zod-style validation (`lib/contact/schema.ts`), same-origin check, size limits, rate limiting, and delivery to webhook / **Telegram** / **Resend email** (`lib/contact/deliver.ts`). It never pretends a send when no channel is configured | **Reuse the delivery module design** (honest delivery result) for notifications in Level 2 |
| Pricing/config | `src/config/pricing.ts` (approved AMD prices), `brand.ts`, `contest.ts` | Reference only |
| Deployment | Netlify (`netlify.toml`, `@netlify/plugin-nextjs`, Node 20). Security headers in `next.config.ts` | Same host possible, as a **separate Netlify site** |
| Separate package precedent | `reels/` (Remotion) has its own `package.json`, excluded from the root `tsconfig.json` and ESLint | **Same pattern for a `business-os/` package** |
| Limitations | Marketing bundle is heavy (3D/GSAP). Locale proxy redirects all non-locale paths. Static content model. No tests in the repo | Reasons not to embed the OS in the site |
| Automation | n8n MCP server configured in this environment, but it failed to connect during the audit. RISEUP has n8n + ManyChat experience (AI admin) | n8n for Level 2 workflows |

### Decision: separate application, same stack
Don't extend riseup-group.com. Create a **separate Next.js application**:
- **Level 1 (demo):** a standalone package `business-os/` inside this repository, like `reels/`.
  - It has its own `package.json`, tsconfig and Netlify site.
  - It's excluded from the root `tsconfig`/ESLint.
  - It's deployed to a subdomain such as `demo.riseup-group.com` (DNS change needs approval) with `noindex`.
- **Level 2+:** move it to its own repository (`riseup-business-os`) when real client data appears. That gives separate access control, CI, secrets and release cycle, and keeps client data concerns away from the marketing site.

Why not inside the website:
- Different security model (auth, PII).
- Different bundle and UX (app vs. cinematic site).
- The locale proxy and SEO setup don't fit an admin app.
- A bug in a client's system must never take down the sales site.

## 2. Architecture by level
### Level 1: sales demo (no backend required)
```
Browser (laptop / tablet / phone)
 ├─ Customer sites:   /hotel/[lang]/…  ·  /restaurant/[lang]/…   (distinct themes)
 ├─ Admin apps:       /hotel/admin/…   ·  /restaurant/admin/…    (shared shell, RISEUP brand)
 ├─ Presenter:        /present/hotel   ·  /present/restaurant    (split view: phone frame + admin)
 └─ Demo store (client-side)
      seed data (JSON, hy/ru/en) → in-memory store → localStorage persistence
      BroadcastChannel → syncs tabs on the same device (phone-frame tab ↔ kitchen tab)
      "Reset demo" → reload seed
      Assistant: ScriptedEngine (intents + quick replies) behind an AssistantEngine interface
      Automation: event bus → "Outbox" timeline (status SIMULATED, never sent)
```
- **Same-device only by default.** The guest flow runs in a phone frame on the same screen, or in a second tab.
- **Optional cross-device add-on** (owner scans the QR with their own phone): a tiny shared backend (Supabase Realtime or a single Netlify function + KV). ~10–14 h extra; needs internet at the meeting. **Decision required** (see MVP_ROADMAP).
- Works **offline** after the first load (static export or cache), which suits field visits.

### Level 2: pilot (one real business)
```
Next.js app (Server Components + Server Actions + Route Handlers)
  │   Data Access Layer: every query scoped by tenant + role check (Next.js DAL pattern)
  ├── Supabase: Postgres + Auth + Row Level Security + Storage (images) + Realtime (KDS, inbox)
  ├── Public endpoints per tenant: POST inquiry / order / table-reservation (validated, rate-limited, insert-only)
  ├── Outbox table → n8n (webhook or DB trigger) → Telegram Bot API (staff alerts), Resend email (guest messages)
  │                                              → later: WhatsApp Cloud API templates (EXT, paid)
  ├── Assistant: AssistantEngine = ScriptedEngine | LLMEngine (Claude API with tools reading tenant data)
  └── Optional: iCal import/export for Booking.com/Airbnb availability (hotel)
```

### Level 3: commercial multi-tenant SaaS
- Tenant onboarding wizard.
- Module flags per plan.
- Billing (local invoicing first; card billing once local acquiring exists).
- Monitoring and error tracking.
- Audit log.
- Backups and restore drills.
- Support tooling (impersonation with consent and a log).
- Status page.
- WhatsApp templates.
- Integrations marketplace (iCal, printers, POS export).

## 3. Recommended stack (with reasoning)
| Concern | Choice | Why / alternatives |
|---|---|---|
| Framework | **Next.js 16 + React 19 + TypeScript** | Same as the team's current site; App Router, Server Actions; one language end-to-end |
| Styling | **Tailwind CSS v4** + a small **shadcn/ui-style** component set (copied in, Radix primitives where needed: dialog, dropdown, tabs, popover) | Fast, consistent, owned code; no heavy UI kit |
| Charts | **Recharts** (or hand-rolled SVG for sparklines) | Mature, React-friendly; enough for KPIs, bars, lines, heatmap |
| State (Level 1) | Lightweight store (Zustand or `useSyncExternalStore`) + localStorage + BroadcastChannel | No backend needed for the demo |
| Validation | **zod** schemas shared by forms, API and seed data | Already the site's approach (hand-rolled); zod makes it explicit |
| Database (L2+) | **PostgreSQL on Supabase** (EU region, e.g. Frankfurt) | Postgres + Auth + RLS + Storage + Realtime in one managed service; free tier is enough for a demo, paid tier for pilots (backups) |
| ORM | **Drizzle** (SQL-first, typed, migration files) | Works with RLS (queries run as the user via Supabase or with a `set_config` tenant claim). Prisma is heavier at the edge and less natural with RLS |
| Auth | **Supabase Auth** (email magic link / password; phone OTP later) | Integrates with RLS through `auth.uid()` |
| Files | Supabase Storage (room/food photos), tenant-prefixed paths, signed URLs for private files | |
| Realtime | Supabase Realtime channels per tenant (KDS, inbox) | Avoids building websockets |
| Automation | **n8n** (RISEUP core skill), triggered by the outbox | Visible to clients as "your workflows"; easy changes |
| Notifications | Telegram Bot API (free; staff alerts), Resend (email), WhatsApp Cloud API later | WhatsApp: Meta switched to per-message pricing for templates in 2025 and rates vary by country. Some providers report further changes from Oct 2026; **verify the current rate card before quoting** |
| AI | Interface-first. Level 1 scripted. Level 2 LLM (Claude API) with **tool use only** for facts | See §6 |
| Hosting | Netlify (current provider) or Vercel; Supabase managed DB | Keep one provider for the team's simplicity |
| Testing | Vitest (logic: availability, pricing, status machine, analytics formulas) + Playwright (3 golden demo flows on mobile and desktop) | Demo must never break in a meeting |

## 4. Data model concept (Level 2+, also mirrored by the Level 1 seed JSON)
**Conventions:**
- Every business table has `tenant_id uuid not null`, plus `created_at`, `updated_at`.
- Translatable text is `jsonb {hy, ru, en}`.
- Money is an integer in minor units + `currency` (AMD default).

**Shared:**
- `tenants` (id, type `hotel|restaurant`, name, slug, default_locale, timezone, currency, settings jsonb, enabled_modules text[])
- `profiles` (user_id → auth.users, name, phone)
- `memberships` (user_id, tenant_id, role `owner|manager|front_desk|housekeeping|waiter|kitchen`)
- `customers` (tenant_id, name, phone, email, locale, tags, consent_marketing bool, notes)
- `conversations`, `messages` (channel `web_assistant|telegram|instagram|whatsapp|email`, direction, author `guest|assistant|staff`)
- `outbox` (event, payload, channel, scheduled_at, status `pending|sent|failed|simulated`, provider_id, error)
- `audit_log` (L3), `files`

**Hotel:**
- `room_types` (name i18n, capacity, base_price, amenities, photos)
- `rooms` (number, room_type_id, floor, hk_status `dirty|cleaning|clean|inspected|out_of_order`)
- `rate_periods` (room_type_id, from, to, price): simple seasonal prices, not a rate engine
- `reservations`:
  - Fields: customer_id, room_type_id, room_id nullable, check_in, check_out, adults, children, source `website|assistant|phone|walk_in|booking_com|airbnb|instagram|other`, special_requests, quoted_total, `status`
  - Status machine: `inquiry → pending_guest | confirmed → checked_in → checked_out`; also `declined`, `cancelled`, `no_show`, `expired`
  - Guard: a room can't hold two overlapping `confirmed/checked_in` reservations (Postgres exclusion constraint on `daterange(check_in, check_out)` per `room_id`)
- `hk_tasks` (room_id, type `checkout_clean|stayover|inspection`, assignee, status, due)
- `maintenance_requests` (room_id, description, priority, status, assignee)
- `ical_feeds` (L2 option)

**Restaurant:**
- `menu_categories`, `menu_items` (name/desc i18n, price, photo, available bool, tags/allergens **only as entered**, recipe)
- `tables` (label, seats, zone, x, y)
- `table_reservations` (customer_id, table_id nullable, start_at, guests, status `requested|confirmed|seated|completed|cancelled|no_show`)
- `orders`:
  - Fields: channel `qr|website|staff|phone`, type `dine_in|pickup|delivery`, table_id, customer_id, notes, subtotal, `status`
  - Status machine: `submitted → accepted → preparing → ready → completed`; also `rejected`, `cancelled`
  - Each status change carries a timestamp
- `order_items` (menu_item_id, qty, unit_price **snapshot**, notes)
- `ingredients` (unit, cost_per_unit, stock_qty, low_threshold)
- `recipe_lines` (menu_item_id, ingredient_id, qty)
- `loyalty_ledger` (customer_id, points, reason, order_id)

**Analytics:**
- SQL views/materialised views per tenant: occupancy, ADR, RevPAR, source mix, conversion; daily sales, AOV, best sellers, food cost %, peak hours.
- Formulas are documented in the code and unit-tested.

## 5. Multi-tenancy (safe by default)
- **Model:** a shared database with a `tenant_id` column in every business table. That's simplest to operate and right for tens to hundreds of small tenants. A schema-per-tenant or database-per-tenant model is only for future enterprise clients.
- **Isolation:** **Row Level Security on every table.**
  - Each policy allows rows where `tenant_id` is in the user's `memberships`.
  - Role-specific policies cover writes. For example, kitchen may update an order's status but not its prices; housekeeping may update `hk_status` only.
- **Server code goes through a Data Access Layer.** It:
  - resolves the session
  - verifies membership and role for the requested tenant
  - returns DTOs, never raw rows

  RLS is the second wall, not the only one.
- **Public (guest) endpoints:**
  - The tenant is resolved from the URL slug or domain.
  - They can only **insert** inquiries, orders and reservations, through validated server routes. Rate-limiting and a bot check reuse the site's contact-endpoint patterns.
  - Public reads are limited to published content (menu, rooms, prices marked public).
- **Service-role key:** server-side only, used only in n8n/outbox workers and migrations. Never shipped to the browser.
- **Per-tenant settings and modules:** `tenants.enabled_modules` drives navigation and route guards. Hotel and restaurant modules never mix.
- **Tests:** automated "tenant A can't read tenant B" tests for every table run in CI.

## 6. Assistant design (honest by construction)
```
interface AssistantEngine {
  reply(input: { tenantId; locale; history; message | quickReplyId }): Promise<{
    messages: AssistantMessage[];         // text + optional cards (room card, dish card)
    actions: AssistantAction[];           // only: collect_field, create_inquiry, add_to_cart, handoff
  }>;
}
```
- **ScriptedEngine (Level 1):**
  - An intent table per vertical and locale (keywords + quick-reply buttons).
  - Answers are **templated from tenant data** (prices, times, menu); there's no free text with numbers.
  - Unknown → polite handoff.
- **LLMEngine (Level 2, optional):**
  - Claude API with **tools** (`get_room_types`, `get_prices(dates)`, `get_policies`, `get_menu`, `create_inquiry`, `handoff`).
  - The system prompt forbids stating availability, prices or confirmations not returned by tools.
  - A **post-check** verifies every price and dish name in the reply against tool results; a mismatch means the reply is replaced by a handoff.
  - Costs are per token, with a monthly cap per tenant.
- **Allowed outputs:** the assistant may only create an **inquiry**, a **cart** or a **reservation request**. Confirmation always comes from staff, then automation.
- **Data:** transcripts are stored per tenant, with a retention setting and a disclosure line ("You're chatting with an automated assistant").

## 7. Automation architecture
1. An app event (e.g. `reservation.confirmed`) writes an **outbox row**.
2. n8n polls, or receives a DB webhook.
3. It sends through the channel.
4. It writes back `sent|failed`.

In Level 1 the same events show in a timeline marked **SIMULATED: not sent**.

| Hotel workflow | Trigger | Channel (L2) |
|---|---|---|
| New inquiry → staff | `reservation.inquiry_created` | Telegram group |
| Confirmation | Staff approves → `reservation.confirmed` | Email (+ WhatsApp later) |
| Pre-arrival | check_in − 2 days | Email / WhatsApp template |
| Check-in instructions | check_in day 10:00 | Same |
| Feedback request | check_out + 1 day | Same (Google review link) |
| Return offer | check_out + 60 days, marketing consent only | Same |
| Abandoned inquiry | inquiry unanswered by guest 24 h after the quote | Staff reminder first, guest follow-up second |

| Restaurant workflow | Trigger | Channel (L2) |
|---|---|---|
| New order alert | `order.submitted` | KDS (realtime) + Telegram for pickup/delivery |
| Order ready (pickup) | `order.ready` | SMS/Telegram/WhatsApp (EXT) or on-screen only |
| Reservation request / reminder | `table_reservation.requested` / start − 3 h | Telegram to staff / message to guest |
| Low stock | ingredient below threshold | Telegram to manager |
| Lapsed customer offer | no order for 30 days, consent | Campaign (L3) |

## 8. Security, privacy, backup
- **Secrets:** env vars only (as `.env.example` already does); no secrets in the repo; separate keys per environment.
- **Personal data:**
  - Collect the minimum (name, phone/email, dates).
  - Marketing consent is a separate checkbox.
  - Retention policy per tenant.
  - Export/delete on request.
  - Armenian personal-data law and EU guests (GDPR) apply. Reuse `docs/RISEUP_BUSINESS_LAUNCH/PRIVACY_DATA_PROCESSING_CHECKLIST.md`, and add a DPA with each pilot client.
- **Web security:**
  - Keep the site's headers (nosniff, frame options).
  - Add a CSP.
  - Same-origin checks and rate limits on public posts.
  - zod validation on every input.
  - Server Actions checked through the DAL.
- **Demo safety:** demo deployments contain **fictional data only**; `noindex`; no real phone numbers in seed data.
- **Backups (L2):**
  - Managed daily backups (confirm the Supabase plan's backup/PITR terms before the pilot).
  - Plus a nightly logical dump (`pg_dump`) to separate storage, 30-day retention.
  - **A quarterly restore test.**
- **Monitoring (L2/L3):** error tracking (e.g. Sentry free tier), uptime checks on public endpoints, a failed-outbox alert to Telegram.

## 9. Reuse map
| Shared (one implementation) | Separate per vertical |
|---|---|
| Admin shell (sidebar, top bar, role switcher, tenant switcher), design tokens, tables, forms, drawers, badges, KPI cards, charts, date utilities, i18n, assistant engine + chat widget, automation timeline, demo store/reset, guided-demo overlay, ROI calculator framework, auth/tenancy (L2) | Customer site themes and layouts, data models (reservations vs orders), calendar vs KDS, housekeeping vs tables, analytics definitions, assistant intents, seed data, demo scripts |
