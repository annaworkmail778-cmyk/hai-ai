# 09 — Cost and Infrastructure Analysis

Prices were checked on 2026-11-15. Third-party sources are marked *(secondary)*. Verify on vendor pages before purchasing; **no purchases are made in this phase**.

## 1. Fixed infrastructure

| Item | MVP (build, weeks 1–5) | First 3 months (in production) | Growth stage | Source |
|---|---|---|---|---|
| Vercel | **Pro $20 / user / month**. Needed anyway: Hobby is non-commercial and per-minute cron requires Pro | $20 (1 deploying seat) | $40 (2 seats) | Vercel Hobby docs; cron pricing page |
| Supabase | Free for staging (pauses after 7 days idle). **Pro $25/month** for production (no pausing, 8 GB DB, 100K MAU, daily backups; compute credit $10 included) | $25 (production) + $0 (staging on Free) | $25 + compute upgrade (NEEDS VALIDATION, ≈ $15–60) + optional PITR | Supabase docs *(pricing figures secondary)* |
| Sentry | Free tier | Free | Team plan (≈ $26, NEEDS VALIDATION) | — |
| Background jobs | $0 (Postgres queue + Vercel Cron) | $0 | Inngest (free 50K executions; paid ≈ $50–75) *(secondary)*, only if needed | *(secondary)* |
| Domain | Existing (riseup-group.com; renewal ≈ $23/yr founder-reported) | ≈ $2/mo equiv. | same | — |
| Off-site backup storage | ≈ $0 (small dumps) | ≈ $0–1 | ≈ $1–5 | — |
| **Fixed total** | **≈ $20–45 / month** | **≈ $45–50 / month** | **≈ $120–220 / month** | |

The $20 for Vercel Pro is **not caused by the Command Center**. The public site needs it for commercial use anyway.

## 2. Variable AI usage (Anthropic)

Model prices per million tokens (input / output), from Anthropic's current model table:
- `claude-opus-5-5` $4 / $20
- `claude-sonnet-5-5` $2 / $10
- `claude-haiku-5-5` $0.10 / $0.50 (≤100K-token prompts)

Web search costs $10 per 1,000 searches. Batch API is ~50% cheaper for non-urgent jobs. Cache reads cost ~0.1× of input.

**Per-task estimates (assumptions; measure in Phase C):**

| Task | Tokens (in / out) | Searches | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
|---|---|---|---|---|---|
| Research one company | 40K / 3K | 5 | **$0.27** | $0.16 | $0.06 |
| Qualify one candidate | 5K / 1K | 0 | $0.04 | $0.02 | <$0.01 |
| Outreach draft | 8K / 1.5K | 0 | $0.06 | $0.03 | <$0.01 |
| Daily executive brief | 30K / 2K | 0 | $0.16 | $0.08 | <$0.01 |
| Proposal draft | 25K / 6K | 0 | $0.22 | $0.11 | — (not recommended) |

**Monthly scenarios:**

| Volume | All Opus 5.5 (default) | Mixed (Sonnet research and drafts, Haiku scoring, Opus proposals) |
|---|---|---|
| Light: 10 companies/day researched (≈ 220/mo), 100 drafts, 20 briefs, 6 proposals | ≈ **$80** | ≈ $45 |
| Heavy: 25/day (≈ 550/mo), 300 drafts, 30 briefs, 15 proposals | ≈ **$200** | ≈ $105 |

**Recommendation:**
- Set an **Anthropic Console spend limit of $100/month** and an in-app global cap of $90 during the 40-day window.
- Start everything on Opus 5.5. Switching individual agents to cheaper models is the founder's choice, and the cost comparison in this doc informs it.

## 3. Totals

| Stage | Fixed | AI (variable) | Total / month |
|---|---|---|---|
| MVP build | $20–45 | $10–30 (testing) | **≈ $30–75** |
| First 3 months | $45–50 | $45–200 | **≈ $90–250** |
| Growth (multiple users, more automation) | $120–220 | $200–800 | **≈ $320–1,000** |

## 4. What we deliberately do not pay for

| Option | Monthly cost | Why not now |
|---|---|---|
| Redis (Upstash, etc.) | $0–10+ | The Postgres queue and rate limits are enough for 2 users |
| Inngest / Trigger.dev paid | $30–75 *(secondary)* | Revisit when runs exceed ~2,000/month or need fan-out |
| Clerk / Auth0 | per-MAU | Supabase Auth includes MFA |
| Multiple LLM providers | — | Extra integration and safety work, no current need |
| Vector DB (Pinecone, etc.) | $0–70 | Postgres FTS first, pgvector if needed |
| Sales Navigator, Apollo paid | $50–120 | Manual and legal sources first (Phase 1) |
| Separate admin hosting project | +config | The hybrid layout allows a later split |

## 5. Too expensive / unnecessary (critical notes)

- **Full nine-agent system on day one:** it multiplies token cost and review load without more revenue. Three agents first.
- **Realtime infrastructure:** polling every 3 s for 2 users costs nothing and avoids exposing tables.
- **Automated sending integrations in the MVP:** compliance risk (Phase 1 doc 16) plus OAuth verification work. Manual sending is fine at 5–15 messages a day.

## Sources (accessed 2026-11-15)
- Vercel Hobby (non-commercial): https://vercel.com/docs/plans/hobby ; cron: https://vercel.com/docs/cron-jobs/usage-and-pricing ; pricing overview *(secondary)*: https://schematichq.com/blog/vercel-pricing
- Supabase pricing *(secondary)*: https://www.activepieces.com/blog/supabase-pricing-free-tier-limits-pro-costs-egress ; https://makerkit.dev/blog/saas/supabase-pricing ; free-plan pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Anthropic pricing: https://docs.claude.com/en/docs/about-claude/pricing
- Inngest / Trigger.dev *(secondary)*: https://www.activepieces.com/blog/inngest-pricing-2026-plans-limits-and-overage-costs ; https://automationatlas.io/guides/trigger-dev-vs-inngest-2026-comparison/
- OpenAI / Gemini comparison *(secondary; not selected)*: https://solvimon.com/pricing-guides/openai-vs-gemini
