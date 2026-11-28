# Hotel OS: Technical Architecture

## 1. Demo (implemented)

- **App:** Next.js 16 (App Router) + React 19 + Tailwind v4 in `business-os/`. Standalone package, separate from the marketing site.
- **State:** event sourcing, `state = replay(seed(baseDate), events)`.
  - `engine.ts` handles core hotel, guest, loyalty and restaurant events.
  - `engine-ops.ts` handles inbox, reviews, channel manager, folio, room move, no-show and lost & found, plus the idempotent automation helper `runAuto`.
  - Events are deduplicated by ID, so every device computes the same state.
- **Sync:**
  - `/api/session/{a|b}` with an event-type allow-list, size and count limits.
  - In-memory store under `next start`; Netlify Blobs on Netlify (implemented, not yet exercised there).
  - Local mode via BroadcastChannel.
- **Domain modules (pure, unit-tested):**
  - `rules.ts`: pricing, loyalty, VAT line.
  - `ai/inbox-ai.ts`, `ai/review-ai.ts`, `ai/copilot.ts`.
  - `channel-adapters.ts`: adapter contract, demo adapter, integration catalog.
  - `hospitality-analytics.ts`, `analytics.ts`.
- **Integration contracts (types only):** `ChannelAdapter`; `integrations/restaurant-contract.ts` (Hotel OS ⇄ Restaurant OS).

## 2. Production target

| Layer | Choice | Notes |
|---|---|---|
| Database | PostgreSQL (e.g. Supabase / managed Postgres) | Every table carries `property_id`. Row Level Security per tenant. Append-only `events` / `audit_log` table |
| API | Next.js route handlers or a separate service | Server-side authorization on every call. Zod-validated inputs |
| Auth | Staff: e-mail + password + 2FA, or SSO. Guests: magic link / OTP | Short-lived sessions, httpOnly cookies |
| Realtime | Postgres changes / WebSocket / SSE | Replaces polling |
| Jobs | Queue (e.g. pg-boss / cloud queue) | Channel polling, webhooks, retries with backoff, scheduled automations |
| Integrations | One adapter per provider behind `ChannelAdapter` / `MessagingAdapter` / `ReviewsAdapter` | Credentials in a secret manager. Webhook signatures verified. Idempotency keys stored |
| AI | LLM provider behind a tool layer | The LLM may only call typed, permission-checked tools (the same functions as the demo). Every number comes from a tool result |
| Files | Object storage | Attachments, completion photos, exports |
| Observability | Structured logs, error tracking, uptime, sync dashboards | Alerts on failed syncs and webhooks |

## 3. Integration layer design

- **Inbound:** a webhook receiver verifies the signature, stores the raw payload (encrypted, with a retention limit), enqueues a job, and returns 2xx quickly. Workers normalise the payload into domain events with an idempotency key (`provider:externalId:version`).
- **Outbound:** a send request becomes an outbox row with status `pending → sent | failed`. A worker calls the provider with an idempotency key. The UI shows the delivery state; failures retry with backoff, then go to manual review.
- **Reconciliation:** a nightly job compares internal reservations with the channel or PMS source and lists differences. Nothing is auto-overwritten without rules.
- **Safety:** all ARI pushes support `dryRun`. Production writes need a per-property "go-live" switch set by the owner.

## 4. Hotel OS ⇄ Restaurant OS

- **Purpose:** a property link, approved by the owner, connects one hotel to one restaurant tenant.
- **Hotel → Restaurant:** `RoomServiceOrderRequest`, containing only a stay reference, room and first name.
- **Restaurant → Hotel:** `RoomServiceOrderEvent` webhooks and `FolioPostingRequest`.
- **Every message** is signed and idempotent.
- **When the link is off,** Hotel OS uses its own room-service menu, or hides it.

## 5. Known demo limits

- The whole state is replayed per change (max 1,500 events per session).
- There is no server-side authorization.
- Polling instead of push.
- The admin and staff UI is Armenian only.
