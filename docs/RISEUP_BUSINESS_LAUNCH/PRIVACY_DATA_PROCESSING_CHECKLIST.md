# Privacy and Data Processing Checklist
> Not legal advice. Armenia: Law on Protection of Personal Data (2015), with an English translation at https://foi.am/wp-content/uploads/2023/09/Personaldataprotectionlaw_ENG.pdf. EU/UK clients: GDPR / UK GDPR. `[LEGAL REVIEW]` before the first project that handles personal data.

## Is a Data Processing Agreement needed?
**Yes, in most projects.** When RISEUP builds or runs systems that store or process the client's customers' messages, contacts, bookings or CRM records (AI assistants, CRM integrations, ordering), RISEUP acts as a **processor** (or sub-processor, for white-label) on the client's behalf.

- **EU/UK clients and agencies:** a written processor agreement is required under GDPR Art. 28 / UK GDPR.
- **Armenia:** confirm the obligations with a lawyer.

**Action:** add a short DPA annex to the MSA/SOW whenever personal data is involved.

## Per-project checklist
- [ ] Which personal data? (names, phones, messages, addresses, payment info: **avoid card data entirely**)
- [ ] Purpose limited to the service. No reuse for RISEUP's own marketing.
- [ ] Client account ownership: data lives in the **client's** accounts (CRM, Sheets, Meta, Supabase project) wherever possible.
- [ ] Sub-processors listed for the client: e.g. Meta/WhatsApp, ManyChat, Google, n8n hosting, Supabase, Vercel, the AI provider (e.g. Anthropic/OpenAI/Google), Telegram.
- [ ] AI providers: use API terms that do not train on submitted data (check each provider's current terms). Do not send unnecessary personal data in prompts.
- [ ] Data location noted (EU/US). Inform EU clients about transfers.
- [ ] Access: least privilege; personal accounts with 2FA; no shared passwords in chat; credentials in a password manager.
- [ ] Secrets in environment variables, never in code or documents.
- [ ] Logging: no full message bodies or secrets in logs unless needed; retention set.
- [ ] Retention: define how long chats and leads are kept; delete or anonymise on request.
- [ ] Data-subject requests: the client handles them; RISEUP assists within `{{X}}` days.
- [ ] Breach notification to the client without undue delay (GDPR: so the client can meet its 72-hour duty).
- [ ] End of project: return/export data, remove RISEUP access, rotate keys.
- [ ] Marketing messages (win-back, broadcasts): only to recipients with a lawful basis or consent; WhatsApp marketing templates require opt-in under Meta policy.
- [ ] Privacy notice on any form or bot we build (the client's text; we provide a draft for their lawyer).
