# Hotel OS: Security Requirements

Status: **requirements and design**. The demo is **not** production-secure, and this document says exactly where.

| Control | Requirement (production) | Demo today |
|---|---|---|
| Authentication | Staff: password + TOTP 2FA or SSO; lockout; password policy. Guests: magic link / OTP | Not implemented. Demo identity is picked per device (labelled in the UI) |
| Authorization | Server-side RBAC per position + per property on every API call and DB row (RLS) | UI-level only (navigation, buttons). Review approval and copilot finance checks exist in domain logic, but the client can forge `by` |
| Multi-tenant isolation | `property_id` on all rows; RLS; tenant-scoped storage and keys; tests for cross-tenant access | Single fictional tenant |
| Sessions | httpOnly, Secure, SameSite cookies; short TTL + rotation; revoke on role change | Not applicable |
| Secrets / API credentials | Secret manager; never in the client or in logs; per-tenant OAuth tokens encrypted; refresh before expiry; revoke on disconnect | No secrets exist in the demo |
| Webhooks | Verify provider signatures (e.g. Meta `X-Hub-Signature-256`, HMAC for Restaurant OS); replay protection; respond fast, process async | Not implemented (no live webhooks) |
| Idempotency | Idempotency keys for inbound events and outbound sends; unique constraints | Implemented in the domain logic (OTA imports, automations); events deduped by ID |
| Rate limiting | Per IP / user / tenant on auth, booking, QR, inbox send; provider-aware outbound throttling | Server event API has size/count limits only |
| Audit logs | Immutable log of logins, permission changes, money actions, message sends, review publishing, data exports | Per-entity history and audit (reservations, threads, folio `by`) |
| Data retention | Per class: messages, raw payloads, guest profiles, logs; automatic deletion | Not implemented |
| Backups / recovery | Daily encrypted backups, point-in-time recovery, tested restore (RPO/RTO defined) | N/A |
| Monitoring / error logging | Error tracking, uptime, sync-failure alerts, PII-scrubbed logs | N/A |
| Data export / deletion | Guest data export and deletion workflow; consent log | Consent flags only |
| Guest QR validation | QR contains an opaque room ID only. Stay access needs a signed, rotating token issued at check-in, expiring at checkout, bound to the reservation; rate-limited; no guest data before validation | QR holds the room number; verification by reservation last name (demo, labelled); demo hint button |
| Payments | Hosted PSP fields; never store PAN; refunds need two-person approval above a threshold | Manual recording only; no card handling |
| AI | Prompt-injection defence; tool-level permission checks; no PII to providers beyond need; output checks | Deterministic; risk gate; reply PII checks |

**Readiness statement:** Hotel OS must not be described as "enterprise-ready" until the production column is implemented and independently tested (penetration test plus RLS tests).
