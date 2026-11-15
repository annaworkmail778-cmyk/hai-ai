# 20 — Phase 2 Build Plan (exact checklist)

**Do not start until the founder approves Phase 1.** Each item lists its output and the person who checks it.

## Block 1 — Guardrails (day 1)
- [ ] 1. `.claude/rules/external-actions.md`, `sources.md`, `claims.md`, `personal-data.md`. *Check: founder reads them.*
- [ ] 2. `.claude/settings.json` hooks: PreToolUse block for send/deploy/publish patterns; PostToolUse audit log. *Check: a test command is blocked.*
- [ ] 3. Change `.gitignore` so `.claude/skills/riseup-*` and `.claude/agents/` are versioned. Higgsfield skills stay ignored.
- [ ] 4. `sales/facts/company-facts.md` (approved facts only). *Check: founder signs off.*
- [ ] 5. `.env.example` updated with names only (doc 17).

## Block 2 — Agents and skills (days 1–3)
- [ ] 6. `.claude/agents/company-researcher.md` (WebSearch, WebFetch, Read only).
- [ ] 7. `.claude/agents/lead-qualifier.md` (scoring per doc 08, shows evidence).
- [ ] 8. `.claude/agents/outreach-drafter.md` (Drafts tab only, hy/ru/en, opt-out line).
- [ ] 9. `.claude/agents/deal-desk.md` (call notes → summary + CRM diff + proposal outline).
- [ ] 10. Skills: `riseup-research-brief`, `riseup-crm-hygiene`, `riseup-daily-plan-and-eod`, `riseup-proposal-builder`, `riseup-demo-video`.
- [ ] 11. Dry run on 5 companies; Research & Ops verifies every fact. Fix the prompts.

## Block 3 — CRM (day 1, manual)
- [ ] 12. Google Spreadsheet with tabs from doc 10, data validation for the enums, and probability formulas.
- [ ] 13. Expected vs actual cash formulas (doc 08 §6).
- [ ] 14. Google Sheets MCP scoped to this spreadsheet only.

## Block 4 — Sales assets (days 2–7)
- [ ] 15. Developer one-pager hy/ru/en.
- [ ] 16. Discovery scripts + objection sheet.
- [ ] 17. Proposal template (doc 15) in Markdown → PDF.
- [ ] 18. Remotion: Developer Sales OS demo (doc 12 A), hy + en, 16:9 + 9:16, demo badge.
- [ ] 19. Deck (10–12 slides).

## Block 5 — Website (week 2)
- [ ] 20. `/[lang]/developers`, `/[lang]/solar`, `/[lang]/automation` pages + locale keys + sitemap.
- [ ] 21. Form fields: company, role, number of projects or sites. Privacy notice (lawyer text).
- [ ] 22. Form → Telegram (existing) + n8n → CRM row.
- [ ] 23. Move hosting to a commercial plan before taking B2B leads through the site (founder decision).

## Block 6 — Legal (weeks 1–2, external)
- [ ] 24. Lawyer reviews the MSA, SOW, DPA, NDA, Referral and Brokerage templates, plus the outreach rules.
- [ ] 25. Accountant confirms the legal form, invoicing and VAT.

## Block 7 — Automation (week 3+, only when proven)
- [ ] 26. n8n: daily plan → Telegram 08:30; EOD → Telegram 19:00.
- [ ] 27. n8n: dedupe check on new company rows.
- [ ] 28. Solar demo video B.
- [ ] 29. Demo sandbox (Next.js + Supabase, demo data only).

## Block 8 — Client delivery kit (when the first pilot signs)
- [ ] 30. Onboarding checklist (accounts owned by the client, access granted to RiseUp).
- [ ] 31. Standard n8n workflow package for Developer Sales OS. **Confirm the n8n licence for this model first.**
- [ ] 32. Qualification prompt set hy/ru/en with a "consultant will confirm" fallback.
- [ ] 33. Weekly client report template.

## Definition of done for Phase 2a (day 7)
Guardrails active, 4 agents + 5 skills working, CRM populated with 60+ sourced companies, Developer demo video and one-pager ready, at least 15 approved touches sent manually, at least 3 meetings booked.
