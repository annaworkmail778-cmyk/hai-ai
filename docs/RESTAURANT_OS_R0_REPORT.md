# RISEUP Restaurant OS: R0 Shared Foundation — Report

**Date:** 2026-11-27 · **Branch:** `claude/clever-carson-vfvd6s` · **Commit:** `R0: extract shared demo kernel …`
Not merged, not deployed; `main`, DNS and production configuration untouched.

## 1. What changed
| File | Change | Hotel impact |
|---|---|---|
| `src/lib/kernel/replay.ts` (new) | `replayEvents(seed, events, apply)`: exactly-once replay, shared by all verticals | — |
| `src/lib/engine.ts` | `replay()` now calls `replayEvents` (same algorithm: skip seen ids, apply in order, then the same reservation sort) | None (unit-tested equality) |
| `src/lib/kernel/demo-store.tsx` (new) | The hotel's client sync logic (live polling, pending queue, reconnect, local mode, reset, optimistic events) moved line-for-line into `createDemoStore({ apiBase, prefix, replay, defaultActor })` | — |
| `src/lib/client/demo-store.tsx` | Now a 20-line binding: `apiBase "/api/session"`, prefix `"bos"`, `defaultActor "s-gohar"` — identical to before | None: same keys `bos:session/mode/actor/cache/pending/local`, same BroadcastChannel `bos-{session}` |
| `src/lib/server/session-store.ts` | Optional `namespace` per vertical. Hotel = `""` → memory key unchanged, Netlify Blobs store name `hotel-demo-{context}` unchanged. Restaurant will use `restaurant-demo-{context}` | None |
| `src/lib/server/session-route.ts` (new) | Route factory `createSessionRoute({ namespace, types, maxEvents, maxBytes })` with the original validation, PIN reset and limits | — |
| `src/app/api/session/[code]/route.ts` | Uses the factory with the original event allow-list, 1,500 events, 8 KB | None |
| `src/components/shared/device-frame.tsx` (new) | The presenter's phone/laptop frame, moved unchanged | — |
| `src/app/present/page.tsx` | Imports `Device` from the shared file (code otherwise untouched) | None |
| `src/components/shared/conn-pill.tsx` (new) + `components/admin/shell.tsx` | Connection pill markup moved to a shared view; hotel `ConnPill` is a wrapper with the same output | None |
| `src/components/shared/vertical-provider.tsx` (new) + `src/app/layout.tsx` | Root layout chooses the provider by path: hotel paths get the hotel provider exactly as before; `/restaurant`, `/r`, `/q`, `/present/restaurant` (not yet built) will use their own | None on any existing route |
| `tests/kernel.test.ts` (new) | Exactly-once replay; hotel replay through the kernel deep-equals manual application | — |

**Deliberately not done in R0** (to protect hotel behaviour): the hotel admin shell and the hotel presenter's scenario runner were **not** rewritten into shared components. Restaurant OS gets its own shell/presenter built from the shared primitives instead. No hotel component was deleted. No dependency was added (`npm ci` installed only the existing lockfile).

## 2. Regression results
| Check | Before R0 | After R0 |
|---|---|---|
| Hotel unit tests (`npm test`) | 9 / 9 pass | 9 / 9 pass (+ 2 new kernel tests pass = 11 / 11) |
| `npm run typecheck` | clean | clean |
| `npm run build` | 25 routes generated | 25 routes generated, same route table |
| Rendered-text snapshot of 20 hotel routes (`/`, 6 guest pages in hy/ru/en, 12 admin pages, `/present`; clock times masked) | baseline (verified reproducible: 2 baseline runs, 0 differences) | **0 of 20 pages differ** |
| Page errors / console errors on those routes | 0 | 0 |
| Cross-device flow: event appended via the API → visible in `/admin/reservations` | visible | visible |
| QR entry `/s/a/hotel` → redirect + stored keys | `/hotel/en?s=a`; keys `bos:cache:a, bos:mode, bos:pending:a, bos:session` | identical |
| Presenter scenario 1 driven by clicking every step/action | events `clock.set, inquiry.create, reservation.approve`, 0 errors | identical, 0 errors |

One build attempt failed with a transient Google Fonts download error (`next/font/google`); two immediate rebuilds, one from a clean directory, succeeded. It was a network flake, not a code issue. Netlify Blobs could not be exercised here (as before R0); the blob code path changed only in how the store name is computed (`"" → "hotel"`), which yields the same name.

## 3. Conclusion
Hotel OS behaviour is unchanged as far as these checks can show. R1 can start.
