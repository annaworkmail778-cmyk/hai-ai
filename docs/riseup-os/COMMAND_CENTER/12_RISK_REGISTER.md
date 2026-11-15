# 12 — Risk Register

Likelihood (L) and impact (I) are rated 1–5. Score = L × I.

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | **Building the platform consumes the sales time needed for the $6k target** | 4 | 5 | 20 | Claude Code implements and the founder reviews (≤ 2–3 h/day). Phase 1 manual process continues. Phase D is gated on first revenue | Founder |
| R2 | Broken authorization exposes finance or prospect data | 2 | 5 | 10 | DAL-only access, authz tests per function, schema not exposed, RLS defence in depth, security checklist before launch | Founder / Claude Code |
| R3 | Account takeover of the owner | 2 | 5 | 10 | Mandatory TOTP, step-up, session revocation, login alerts | Founder |
| R4 | Prompt injection leads to a harmful action | 3 | 4 | 12 | Research agents have no external tools. Approvals are executed only by the backend executor. Human review | System |
| R5 | Fabricated company or contact data enters the CRM | 3 | 4 | 12 | Source-required schemas. Unsourced items marked. Human approval before CRM. Approved-claims list | Team member |
| R6 | AI cost overrun | 2 | 3 | 6 | Per-run, per-agent and global caps. Console spend limit. Cost estimate shown before starting | Founder |
| R7 | Public website broken by admin changes (routing, build) | 3 | 4 | 12 | Proxy tests. Preview deploy smoke test of the public pages. Isolated admin layout. No shared components | Claude Code |
| R8 | Vercel Hobby terms breach (commercial use) | 4 | 3 | 12 | Upgrade to Pro before go-live | Founder |
| R9 | Supabase Free pausing or no backups for real data | 3 | 4 | 12 | Production on Pro. Weekly off-site dump. Restore drill | Founder |
| R10 | Serverless time limits break long agent runs | 3 | 3 | 9 | Bounded steps per invocation, leases, cron continuation. Inngest as fallback | Claude Code |
| R11 | Secret leakage (client bundle, logs, previews) | 2 | 5 | 10 | `server-only` modules, gitleaks, a build-output grep, separate preview env, log redaction | Claude Code |
| R12 | Legal non-compliance in outreach or personal data (Armenia / EU) | 3 | 4 | 12 | Manual, 1:1 sending. Opt-out tracking. Retention policy. Lawyer review (Phase 1 doc 16) | Founder |
| R13 | Scope creep toward the "full vision" before value is proven | 4 | 3 | 12 | Phase gates with acceptance criteria. Option C hybrid. Monthly review | Founder |
| R14 | Single provider dependency (Anthropic outage or policy change) | 2 | 3 | 6 | The agent `provider` field. Manual workflow still works without agents | Founder |
| R15 | Data entered twice (Sheets and Command Center) during transition | 3 | 2 | 6 | Single cut-over date after the CSV import. Sheets becomes read-only | Team member |
| R16 | n8n licence when integrating client workflows | 2 | 3 | 6 | Decide before Phase E (Phase 1 doc 06) | Founder |
| R17 | Live-site facts unverified (this environment could not reach riseup-group.com) | 3 | 1 | 3 | Validate headers and `/admin` behaviour from a browser before Phase A | Founder |
| R18 | Deploy target ambiguity (`netlify.toml` + Vercel) | 2 | 2 | 4 | Confirm Vercel. Remove or keep `netlify.toml` by explicit decision | Founder |
| R19 | Mixing client confidential data across projects | 2 | 4 | 8 | Classification + client scope on knowledge. Agent runs carry a client scope | System |
| R20 | Over-trust in agent recommendations ("top 3") | 3 | 3 | 9 | Deterministic ranking first. Reasons shown. Agents only recommend | Founder |
