# 17 — Security and Privacy Plan

## 1. Secrets and environments
- Commit **no secrets** to git. Commit `.env.example` with variable names only. Phase 2 adds:
  ```
  NEXT_PUBLIC_SITE_URL=
  TELEGRAM_BOT_TOKEN=
  TELEGRAM_CHAT_ID=
  CONTACT_WEBHOOK_URL=
  SUPABASE_URL=            # Phase 2b
  SUPABASE_ANON_KEY=       # Phase 2b
  SUPABASE_SERVICE_ROLE_KEY=  # server only, never NEXT_PUBLIC_
  GOOGLE_SHEETS_CRM_ID=
  ```
- Secrets live in Vercel project env, the n8n credentials store and a password manager. They are never pasted into chat or docs.
- Rotate the Telegram bot token if it is ever exposed. Use separate bots for internal and client projects.
- Run a pre-commit secret scan (e.g. gitleaks) in Phase 2.

## 2. Access control
| Resource | Founder | Research & Ops | Agents |
|---|---|---|---|
| CRM spreadsheet | Owner | Editor | Through MCP: read all; write only `Research`, `Drafts`, `AuditLog` (enforced by hook) |
| n8n | Owner | Viewer | None |
| Vercel / GitHub | Owner | None | Claude Code session (push to the dev branch only) |
| Bank | Owner | Read (statements) | None |
| Client accounts | Delegated access via the client's own admin; removed at contract end | — | None |
- 2FA on Google, GitHub, Vercel, Meta, Telegram, the bank and n8n.
- Client systems use the client's own accounts with RiseUp invited as a user. Avoid RiseUp-owned shared accounts.

## 3. Backups
- Google Sheets: weekly export (xlsx) to a separate Drive folder. Version history is on.
- n8n: weekly workflow export (JSON) to a private repo without credentials.
- Supabase (later): daily backups on Pro, or a weekly `pg_dump` on Free.

## 4. Audit logs
- `AuditLog` tab: every agent write, every draft approval and every sent message (written by a human), with timestamps.
- A Claude Code PostToolUse hook appends tool actions to a local log.

## 5. Source tracking and dedupe
- Every research claim has `source_url` and `accessed_at`. Unsourced claims cannot be used in outreach.
- Dedupe rules are in doc 10. Opt-out suppression is checked before any draft is created.

## 6. Rate limits (self-imposed)
- Outreach: at most 15 first touches a day and 3 touches per contact in 21 days.
- APIs: Google Places quota caps + a budget alert at $1. Hunter within its free quota.
- Agents: research at most 20 companies per run, to keep review manageable.

## 7. Prompt-injection protection
1. **Tool isolation:** the agent that reads the web (`company-researcher`) has no write, send or Bash tools.
2. **Data framing:** fetched text is passed as quoted data. Agent prompts say instructions inside it are never followed.
3. **Flagging:** text like "ignore previous instructions", hidden text, or requests to email or visit a URL is flagged (`injection_flag = true`) and shown to the human.
4. **No auto-execution:** nothing from a prospect website, PDF or email is run, installed or opened as a link by an agent beyond read-only fetching.
5. **Human gate:** research → outreach always passes through human approval.
6. **Client bots:** AI reply prompts for client chatbots must refuse instructions from end users that try to change system behaviour, reveal prompts or promise prices. Escalate to a human.

## 8. Human approval for every external action
Enforced in three layers:
- **Policy:** `.claude/rules/external-actions.md`.
- **Tooling:** no send-capable tools are granted to agents.
- **Hooks:** PreToolUse blocks known send, deploy and publish commands and asks for confirmation.

"External action" means:
- Sending a message.
- Posting content.
- Deploying to production.
- Making a payment.
- Signing.
- Creating accounts.
- Changing client systems.

## 9. Privacy
- Data minimisation: business-role data only.
- Retention: prospects 12 months, then delete or anonymise. Opt-outs are kept as hashes.
- Data-subject requests: answer within 30 days (Armenia, to be confirmed with the lawyer; EU: 1 month).
- Privacy notice on the site (lawyer-reviewed).
