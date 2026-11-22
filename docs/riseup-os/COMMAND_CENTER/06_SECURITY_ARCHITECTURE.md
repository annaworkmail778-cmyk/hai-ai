# 06 — Security Architecture

Threat model in one line: a private system holding finance data, prospect personal data, integration credentials and AI agents that can be manipulated by untrusted web content. The main risks are account takeover, broken authorization, secret leakage, agent misuse (prompt injection → harmful action), and data loss.

Alignment targets:
- **OWASP ASVS 5.0** (released 30 May 2025): aim for **Level 2** for authentication, session, authorization, logging and data protection.
- **OWASP Authorization Cheat Sheet** and **OWASP Logging Cheat Sheet**.
- **OWASP Top 10 for LLM Applications (2026)**, where Excessive Agency is now LLM03.
- **OWASP Top 10 for Agentic Applications** (ASI01–ASI10).

## 1. Authentication (ASVS: Authentication, Session Management)

- Supabase Auth with email + password. **Public sign-up disabled**; users are created by owner invite only.
- **TOTP MFA mandatory** for every human user. All admin pages and actions require `aal2`. Users without an enrolled factor are forced into enrolment.
- **Step-up:** high and critical approvals, finance edits, exports and settings changes require a re-verification within the last 10 minutes (stored `last_mfa_at`; re-prompt for a TOTP).
- Passwords: minimum 12 characters, plus breached-password check if available (NEEDS VALIDATION in Supabase settings). Login rate limits are Supabase's built-in ones, plus a lockout notice to the owner via Telegram after 5 failures.
- **Sessions:**
  - httpOnly, `Secure`, `SameSite=Lax` cookies via `@supabase/ssr`
  - short access tokens (Supabase default ~1 h) with refresh
  - absolute session lifetime of 7 days; idle timeout of 12 h
  - **"Sign out all sessions"** for any user in Settings, plus automatic revocation when a user is disabled
- `/admin` is **never** protected by obscurity: `noindex`, `robots` disallow, and auth on every route.

## 2. Authorization (ASVS: Authorization; OWASP Authorization Cheat Sheet)

- **Deny by default.** Every Server Action, route handler and server component data call goes through the DAL's `authorize(user, permission, resource)`. UI hiding is cosmetic only.
- Roles: `owner` (all permissions) and `team_member`:
  - granted: `crm.*`, `research.*`, `drafts.*`, `tasks.*`, `projects.read`, `approvals.decide.low`
  - not granted: finance, settings, agent management, high-risk approvals, exports
- **Object-level checks:** for client-scoped knowledge and projects, the DAL checks scope as well as role.
- **IDs:** UUIDs are used, but no endpoint relies on unguessable IDs alone.
- Server Actions are treated as public POST endpoints (Next.js guidance). Each one validates input with zod and authorizes again.

## 3. Approvals enforced by the backend (not by the UI or prompts)

```
agent ──tool call──▶ Tool Gateway ──(gated action)──▶ INSERT approvals(status=pending, payload, payload_hash, idempotency_key)
human ──Approve (aal2 + step-up for high)──▶ DAL.decide() ──▶ status=approved, decided_by, decision_aal
executor(approval_id) ──▶ re-read row FOR UPDATE ──▶ checks:
     status=approved · not expired · decided_by has approvals.decide.<risk> · hash(payload)=payload_hash
     · not executed (idempotency) · action_type has an executor implementation
  ──▶ perform action ──▶ status=executed|failed, execution_result, audit_logs (same txn where possible)
```

- **There is no other code path to external side effects.** External-sending modules live only under `src/admin/executor/actions/*`, and a lint rule (`no-restricted-imports`) forbids importing them anywhere else.
- **MVP:** most executors are "manual handoff". After approval, the UI shows the exact content to send, and the human sends it and marks it sent. This is still recorded as `executed`, with `executed_by`.
- **DB enforcement:**
  - The `app_agent_worker` role may only INSERT into `approvals` with `status='pending'`. It has no UPDATE.
  - A trigger rejects any status change not made by `app_server` with a session setting `app.actor_type='user'` and a valid decider.
- **Expiry:** pending approvals expire after 72 h (messages) or 7 days (others).
- **Agents cannot change their own permissions:** they have no tool for it and no DB grant on `agents` or `agent_tools`, and only the owner can manage them.

## 4. Database privilege model

| Role | Used by | Grants |
|---|---|---|
| `app_server` | Human-request DAL | SELECT/INSERT/UPDATE on business tables per DAL needs. INSERT-only on `audit_logs`. No DDL |
| `app_agent_worker` | Agent worker | SELECT on the allowed business tables (excluding finance unless the agent has a finance scope). INSERT on `lead_candidates`, `sources`, `messages` (draft), `proposals` (draft), `tasks` (recommendation), `approvals` (pending), `agent_steps`. UPDATE on its own `agent_runs` lease and status columns. INSERT on `audit_logs` |
| `app_migrator` | CI/manual migrations only | DDL. Not available at runtime |
| `service_role` (Supabase) | **Not used by the app.** Stored nowhere in Vercel | — |

## 5. Secrets

- Stored in Vercel environment variables (production and preview are separate; **previews get staging values only**). Never in the repo, the DB, logs or the browser.
- Only the DAL, executor and agent runtime modules read `process.env` (Next.js guidance). They are marked `import "server-only"`.
- Keys:
  - `ANTHROPIC_API_KEY` (with a **spend limit set in the Anthropic Console**)
  - `DATABASE_URL_SERVER`, `DATABASE_URL_AGENT` (the two roles)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (auth only)
  - `TELEGRAM_*`
  - `CRON_SECRET`
- The cron and worker endpoints require `Authorization: Bearer ${CRON_SECRET}`, using the Vercel cron pattern (NEEDS VALIDATION: header format).
- Rotation: quarterly, and immediately on suspicion. Runbook in doc 13.
- Secret scanning in CI (gitleaks), plus GitHub secret scanning on the repo.

## 6. Web security (ASVS: Web Frontend, API, Validation, File Handling)

- **Headers for `/admin`:**
  - strict CSP: `default-src 'self'`, nonce-based scripts, `frame-ancestors 'none'`, `connect-src 'self'` plus the Supabase origin
  - `X-Frame-Options: DENY`
  - `Cache-Control: no-store`
  - `X-Robots-Tag: noindex`
  - HSTS (verify Vercel defaults)
- **CSRF:** Server Actions compare Origin and Host (Next.js built-in, NEEDS VALIDATION for 16.x). Route handlers reuse the existing `sameOrigin()` check, and cookies are `SameSite=Lax`.
- **XSS:** React escaping. No `dangerouslySetInnerHTML` for user or agent content. Markdown is rendered with a sanitizing renderer and no raw HTML. **Agent output is treated as untrusted** when rendered.
- **Input validation:** zod on every action and handler, with size limits (body ≤ 1 MB except file upload).
- **Files:**
  - private buckets
  - allow-list: PDF, PNG, JPG, DOCX, CSV
  - max 10 MB
  - stored under random names
  - served with signed URLs (≤ 5 min) and `Content-Disposition: attachment`
  - CSV import parsed server-side, with a formula-injection guard on export (prefix `'` to cells starting with `= + - @`)
- **Rate limiting:** a Postgres-backed fixed-window limiter (`rate_limits` table) for login-adjacent endpoints, exports and agent starts (e.g. 30 agent runs/hour/user). The in-memory limiter stays only on the public contact form.

## 7. AI agent security (OWASP LLM / Agentic)

| Risk | Control |
|---|---|
| Prompt injection from web content (LLM01) | Research agents have no external-action tools. Fetched content is wrapped as data. Injection heuristics flag content. Human review before promotion to the CRM |
| Excessive agency (LLM03:2026; ASI02 tool misuse, ASI03 privilege abuse) | Per-agent tool allow-list in the DB. Gateway validation. Scoped DB role. Approval executor |
| Unbounded consumption | Per-run, per-agent and global cost caps checked before each call. Anthropic Console spend limit. `max_uses` on web search |
| Sensitive data disclosure | Knowledge scoped by classification and client. Redaction of emails and phones in `agent_steps` excerpts unless needed. No secrets ever placed in prompts |
| Fabrication | Output schemas require `sources[]`. The UI shows "unsourced" warnings. The approved-claims list is used for anything said about RISEUP |
| Supply chain (model/provider change) | Model pinned per agent version. Changes audited |

## 8. Audit logging (OWASP Logging Cheat Sheet)

- **Events logged:**
  - login success and failure, MFA enrol and verify
  - session revocation
  - permission denied
  - every create, update and delete on business tables (with a redacted diff)
  - every approval request and decision
  - every executor action
  - agent run start and end
  - exports
  - settings changes
- **Fields:** actor type and ID, action, resource, timestamp (UTC), result, approval ID, trace ID, hashed IP and user agent.
- **Never logged:** passwords, tokens, API keys, full message bodies to prospects (reference IDs instead), or the raw tool output beyond the redacted excerpt.
- Logs are append-only (DB grants) and exported weekly with the backup.

## 9. Monitoring and response

- Sentry for errors, with PII scrubbing on.
- A Telegram alert to the owner for:
  - agent failure streaks (3 in a row)
  - a cost cap at 80% or 100%
  - more than 5 failed logins per hour
  - executor failures
  - the backup job failing
- A one-page incident runbook: revoke sessions → rotate keys → disable agents (global kill switch `agents.enabled=false`) → review the audit log.

## 10. Pre-launch security checklist (Definition of Done for Phase A)

- [ ] Sign-up disabled. MFA enforced. Step-up works.
- [ ] Every DAL function has an authorization test (allowed and denied).
- [ ] `app` schema not exposed. RLS enabled. Advisor lints clean.
- [ ] CSP and headers verified on `/admin`. `/admin` is noindex.
- [ ] No secret in the client bundle (`grep` the build output for key prefixes).
- [ ] Previews use staging DB credentials.
- [ ] Audit log rows written for login and one CRUD action, with no secrets in them.
- [ ] Backup and restore drill done once.

## Sources (accessed 2026-11-15)
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/ ; https://github.com/OWASP/ASVS (5.0.0 released 30 May 2025)
- OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- OWASP Top 10 for LLM Applications 2026 (secondary summaries): https://cloudsecurityalliance.org/articles/the-owasp-top-10-for-llm-applications-2026-what-changed-and-why-it-matters ; https://aembit.io/blog/the-owasp-top-10-for-llm-applications-2026-what-changed-and-why-it-matters/
- OWASP Agentic Top 10 (secondary): https://www.techrepublic.com/article/news-owasp-ai-agent-risk-list/ ; official project: https://genai.owasp.org (verify)
- Supabase MFA and `aal`: https://supabase.com/docs/guides/auth/auth-mfa ; https://supabase.com/blog/mfa-auth-via-rls
- Next.js data security (bundled docs): `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
