# Hotel OS: Acceptance Criteria

Status: **demo** criteria, checked on 2026-11-28. **Pilot** criteria are to be checked before go-live.

## Demo (verified)

| # | Criterion | How verified | Result |
|---|---|---|---|
| 1 | Existing flows still work (booking, QR, KDS, VIP, onboarding, messaging) | E2E `hos.cjs` (13 checks) | Pass |
| 2 | Reservation never shown as confirmed before approval | E2E J1; unit tests | Pass |
| 3 | OTA import is idempotent; modification, cancellation, conflict, resolve | Unit test "channel manager" | Pass |
| 4 | Inbox AI never auto-answers payment / refund / cancellation / medical / legal / availability / maintenance | Unit test (7 phrasings) | Pass |
| 5 | Escalation automation fires once per message, also on re-delivery | Unit test | Pass |
| 6 | Review reply in the review's language, without surname; compensation / PII flagged; only managers approve; Tripadvisor → manual | Unit test + E2E | Pass |
| 7 | Folio balance formula; room move only into a free room; no-show only from the arrival date | Unit test | Pass |
| 8 | Copilot figures equal the analytics module; finance refused to a housekeeper; unsupported question refused | Unit test + E2E | Pass |
| 9 | Presenter has 14 scenarios; the new 5 run end to end | E2E `hotelos.cjs` | Pass |
| 10 | No horizontal overflow on mobile for the new admin pages and the guest pages | E2E (390 px) | Pass |
| 11 | No console errors in the E2E runs | E2E | Pass |
| 12 | Build, typecheck, tests; lint without errors | CI-equivalent local run | Pass (44 lint warnings, documented) |
| 13 | No channel shown as "connected" | Code review: `/admin/integrations`, channels page, inbox banner | Pass |

## Pilot (to be done)

- Server-side RBAC tests: a forbidden role gets 403 on every mutating endpoint.
- Cross-tenant isolation tests (RLS).
- Webhook signature verification and replay tests per provider.
- Delivery-state tracking for every outbound message; no duplicate sends under retry.
- Backup restore drill meeting the agreed RPO/RTO.
- Accessibility: keyboard navigation and contrast (WCAG 2.1 AA) on staff and guest flows.
- Staff UI fully available in hy / ru / en.
