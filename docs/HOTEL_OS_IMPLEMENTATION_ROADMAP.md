# Hotel OS: Implementation Roadmap

Status: 2026-11-28.

## Done (demo, verified)

- **Phase 1–2, audit and research:** `HOTEL_OS_FEATURE_MAP.md`, `HOTEL_OS_OPERATIONS_RESEARCH.md`, `HOTEL_OS_INTEGRATION_MATRIX.md`.
- **Phase 4, highest-value functions:** folio, room move, no-show, lost & found, VAT line, attention strip, navigation regroup.
- **Phase 5, communications and reviews:** unified inbox, AI drafts with a risk gate, Reviews Center with an approval workflow.
- **Phase 6, channel architecture:** `ChannelAdapter` contract, demo adapter, import / modify / cancel / duplicate / conflict / retry, sync log, mapping view.
- **Phase 7, AI:** business copilot (10 tools, traceable, permission-aware), inbox and review AI.
- **Automations:** 6 new rules + execution log with idempotency keys.
- **Presenter:** 14 scenarios.
- **Phase 8, quality:**
  - 17 unit tests and 30 E2E checks pass.
  - Lint: 0 errors (44 advisory warnings).
  - Production build passes.

## Next: product hardening (2–3 weeks, no external dependencies)

1. Staff and admin UI in Russian and English (i18n catalogue).
2. Configurable automations: conditions, delays, schedules, failure retries.
3. Point expiration rules; group master folio; drag-and-drop room moves on the calendar.
4. Completion photos for housekeeping and maintenance (object storage).
5. Tenant branding (logo, colours) and a CMS for website content.
6. Replace effect-based storage reads (`useSyncExternalStore`) to clear the lint warnings.
7. Commit the E2E suites into the repository and run them in CI.

## Pilot MVP (about 8–12 weeks, needs approvals)

| Step | Work | External dependency |
|---|---|---|
| 1 | Postgres + RLS, real auth, server RBAC, audit log | Hosting decision |
| 2 | Realtime + job queue + outbox | — |
| 3 | Website chat + e-mail live | Mailbox owner consent |
| 4 | WhatsApp Cloud API (or a BSP), templates | Meta business verification, template approval |
| 5 | Google reviews read/reply | Business Profile API access approval |
| 6 | Channel manager / PMS integration (choose with the hotel) | Partner agreement (Cloudbeds / Mews / SiteMinder) |
| 7 | Payments (deposits) | PSP contract |
| 8 | LLM behind the tool layer, with evaluation sets | Provider + data-processing terms |
| 9 | Signed QR stay tokens | — |
| 10 | Security review + restore test | — |

## Risks

- **Partner programmes:** Booking.com and Expedia may be closed or slow to onboard. The mitigation is the channel-manager route.
- **Meta App Review:** Instagram and Messenger need it, which delays those channels. Start with WhatsApp and e-mail.
- **Large hotels:** keep their existing PMS and integrate around it.
- **Local legal requirements:** registration, fiscal receipts and tax still need verification.
