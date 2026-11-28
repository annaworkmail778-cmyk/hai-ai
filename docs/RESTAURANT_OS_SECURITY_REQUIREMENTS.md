# RISEUP Restaurant OS: Security and Enterprise Readiness

Honest statement first: **the current build is a sales demo, not a production system.** It uses a demo actor picker instead of authentication, fictional data, and an in-memory or blob-backed demo session store. This document lists what is in place and what must exist before any real restaurant data is processed.

## 1. In place in the demo

| Control | Implementation |
|---|---|
| Event allow-list | Server accepts only 79 known event types; payload size and event count limits per session |
| Domain-level authorisation for sensitive actions | Enforced in the reducer (not only the UI): payment results only from allowed adapters with unique references; cash/POS recording only cashier/manager/owner; ticket reopen only chef/manager/owner; PO approval only manager/owner; auto-reply only for allowed low-risk intents |
| Role-based UI | 9 roles × 31 permissions; pages guarded (`Guard`), actions disabled with reason |
| Idempotency | Stock, loyalty, automations and payments use unique keys; replays cannot double-count |
| No real external effects | Messages, SMS, supplier orders, review publishing and card terminal are simulated and labelled |
| Privacy | Fictional guests, reserved phone range, device-scoped guest data, masked phones in lists, explicit consent records |
| Presenter reset | Optional PIN for data reset |
| No secrets in code | No API keys in the repository; none required by the demo |
| Hotel OS isolation | Separate session namespace (`restaurant-demo-*` vs `hotel-demo-*`) and event allow-lists |

## 2. Required before production

### Identity and access
* Personal accounts for managers/owners (email + password + TOTP or SSO); short PIN for shared floor/KDS devices bound to a registered device.
* Server-side session tokens; every event signed by the server with the authenticated user (the client must not supply `by`).
* Permission checks on the server for **every** event type (today the UI checks most and the reducer checks the sensitive ones).
* Device registration and remote revoke; automatic lock on shared devices.

### Tenant isolation
* `tenant_id` on every record, PostgreSQL row-level security, separate encryption keys per tenant for PII.
* No cross-tenant analytics without aggregation and consent.

### Data protection
* TLS everywhere; encryption at rest; PII fields (phone, email, notes, allergies) encrypted at application level.
* Retention: guest PII deleted or anonymised after a configurable period; consent withdrawal honoured in CRM and exports.
* Data processing agreement with each restaurant; record of processing; breach-notification procedure. Legal review for Armenia's personal data law and for EU guests (**verify with counsel**).

### Payments
* No card data ever touches Restaurant OS (terminal / hosted payment page only, PCI scope SAQ-A or equivalent).
* Payment state only from provider callbacks verified by signature; idempotent provider references (already modelled).

### Integrations
* OAuth tokens and webhook secrets in a secrets manager, never in the client; webhook signature verification; per-integration least-privilege scopes.
* Only official APIs; no scraping.

### Operations
* Audit log export (events are already the audit trail), admin action alerts (voids after cooking, reopen, cash recording, price changes).
* Backups with restore tests; disaster-recovery target agreed per plan.
* Rate limiting and abuse protection on public endpoints (QR ordering, booking, web chat).
* Dependency scanning; security review before each release; penetration test before the first paying client.

### AI
* LLM receives only tool results the user may see; prompt-injection tests with guest messages; no autonomous external actions (see AI_ARCHITECTURE).

## 3. Fiscal and legal

Restaurant OS does not issue fiscal receipts and does not claim fiscal compliance. Fiscal integration (e-HDM / SRC) requires a certified path and legal confirmation.

## 4. Known demo limitations (not acceptable in production)

* Anyone with the demo URL can pick any staff role.
* Session data is shared by everyone using the same session code.
* Polling-based sync; no server-side permission check on non-sensitive events.
