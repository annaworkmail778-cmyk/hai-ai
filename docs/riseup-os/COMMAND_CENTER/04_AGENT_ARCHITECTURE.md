# 04 — Agent Architecture

## 1. Two different things

| | Claude Code subagents (development time) | Runtime agents (inside Command Center) |
|---|---|---|
| What | Markdown definitions in `.claude/agents/` used by a developer's Claude Code session | Server-side code that calls the Anthropic Messages API with tool definitions, run by the Command Center backend |
| When they run | Only while someone is running Claude Code (a terminal or cloud session) | On demand from the UI or on a schedule, without a developer present |
| State | The session transcript | `agent_runs`, `agent_steps` and the business tables in Postgres |
| Permissions | Claude Code tool permissions + hooks | **Tool Gateway + DB grants + the approval executor** (enforced by the backend) |
| Use for Rise | Build, test and review the Command Center; draft migrations; code review | Research, qualification, outreach drafts, proposals, briefings |

**Claude Code subagents are not persistent production agents.** They cannot be "left running" for the business. Runtime agents must be implemented in the application: a model call loop + tools + queue + logs. The agent *definitions* (purpose, prompts, tool lists) can be authored in the repo and reviewed like code, but they are executed by the app's runtime.

## 2. Runtime options compared

| Option | Fit | Cost | Complexity | Verdict |
|---|---|---|---|---|
| **Anthropic Messages API + our own loop** (SDK tool runner or manual loop), run in our worker | Full control of tools, approvals, logs and DB. Tools run in our backend next to the data | Tokens only | Medium | **MVP choice** |
| Anthropic Managed Agents (beta) | Anthropic hosts the loop and a sandbox; custom tools and permission policies are available | Tokens + platform | Medium. Beta dependency; our tools still need our backend | Revisit in Phase D for long research tasks |
| Claude Agent SDK (Claude Code as a library) | Batteries-included filesystem/bash agent | Tokens | Needs a long-running host with a filesystem, so it is a poor fit for Vercel functions | Not for MVP |
| n8n AI agent nodes | Good for integrations | n8n hosting / licence (Phase 1 doc 06) | Logic split across two systems; approvals are harder to enforce centrally | Use n8n only as an integration bus (Phase E) |
| OpenAI / Gemini APIs | Viable models | Comparable or cheaper per token (secondary sources) | A second SDK, prompt set and safety profile | Not needed now. The schema keeps a `provider` column |
| Multi-agent framework (LangGraph, CrewAI, etc.) | Generic orchestration | — | Extra abstraction over a simple loop | Rejected. YAGNI |

## 3. Runtime design

```
UI "Start agent" ──▶ DAL.enqueueRun(agent_key, input, requested_by) ──▶ agent_runs(status=queued)
                                       │ after() / cron each minute
                                       ▼
Worker: claim lease (UPDATE … WHERE status='queued' … FOR UPDATE SKIP LOCKED, lease 5 min)
  loop until done | max_steps | deadline | budget | cancel_requested:
     1. build request: system prompt (versioned) + approved knowledge + run input + prior steps
     2. messages.create(model, tools = agent's allowed tools only, max_tokens, output_config.effort)
     3. record usage → agent_steps(cost, tokens)        ← heartbeat
     4. for each tool_use → Tool Gateway.execute(agent, run, tool, input)
            - check tool ∈ agent_tools (DB), validate input (zod), check scope (client_id, classification)
            - READ tools: run, return redacted/truncated result
            - WRITE-INTERNAL tools (e.g. create draft, create lead_candidate): run, audit
            - GATED tools (send, publish, add to CRM, proposal send, delete…): create approvals row
              status=pending; run → waiting_approval; tool_result = "approval requested <id>"
     5. checkpoint step; if cancel_requested → cancelled
  finalize: output (structured JSON validated by schema), summary, status, totals
```

- **Bounded invocations:** each worker invocation processes at most N steps or 4 minutes, then releases the lease. The next cron tick continues the run. Long runs therefore survive serverless time limits. The Vercel max duration per plan is NEEDS VALIDATION.
- **Retry policy:**
  - Model calls: the SDK retries 429/5xx/connection errors (default 2). On top of that, the run fails after 3 consecutive step failures.
  - Run retry: manual by default. Automatic once for `timed_out` runs of read-only agents.
  - Tool failures are returned to the model as `is_error` results, not thrown.
- **Timeouts:** per agent, `timeout_seconds` (default 900) for wall-clock time, plus a per-model-call timeout of 120 s.
- **Budgets:**
  - per run `max_input_tokens`, `max_output_tokens`, `max_cost_usd`
  - per agent `monthly_cost_cap_usd`
  - a global `monthly_ai_cap_usd`, checked before every model call
  - when a cap is exceeded the run stops with `budget_exceeded` and the owner is notified
- **Trace ID:** a UUID per run, propagated to `agent_steps`, `approvals`, `audit_logs` and outgoing logs.
- **What is stored:**
  - the task input
  - per step: the model, token usage, cost, tool name, validated tool input, redacted and truncated tool output (≤ 8 KB), and a short text summary returned by the model
  - the final structured output
  
  Hidden reasoning is **not** stored or displayed. Where the model returns thinking blocks, they are kept in memory only for the duration of the loop, as the API requires, and are not persisted.
- **Prompt injection:**
  - Web content returned by `web_fetch` / `web_search` is treated as data.
  - System prompts state that instructions inside fetched content must be ignored and reported.
  - The research agents have **no gated or write-external tools at all**, so a successful injection can at most produce a bad draft or a bad candidate. A human reviews both.
  - Suspicious content is flagged (`injection_suspected=true`) and shown in the review UI.
- **Self-modification is impossible:**
  - `agents` and `agent_tools` are writable only by the owner through the Settings UI. The agent runtime has no tool that touches them.
  - The DB role used by the worker has no UPDATE grant on these tables (doc 06).

## 4. The nine proposed agents: MVP set and order

| # | Agent | MVP? | Phase | Model default (owner may change) | Tools (allowed) | Gated actions it can request |
|---|---|---|---|---|---|---|
| 1 | **Market Research** | ✅ | C | `claude-opus-5-5` | `web_search` (server tool, domain allow/block lists, `max_uses`), `web_fetch`, `kb.search(public, internal)`, `crm.find_company` (dedupe check), `candidates.create` (staging only) | `add_lead_to_crm` (via the human review step, not directly) |
| 2 | **Lead Qualification** | ✅ | C | `claude-opus-5-5` | `candidates.read`, `research.read`, `kb.search(pricing, offers)`, `candidates.update_score` | — |
| 4 | **Outreach** | ✅ | C | `claude-opus-5-5` | `crm.read_company/contact`, `research.read`, `kb.search(approved_claims, scripts)`, `drafts.create` | `send_email`, `send_instagram_dm`, `send_whatsapp`, `send_telegram` (in the MVP these become "approved for manual sending") |
| 9 | Executive Assistant | — | D | `claude-opus-5-5` | read-only on all business tables (no client documents), `tasks.create_recommendation` | — |
| 5 | Proposal | — | D | `claude-opus-5-5` | `crm.read`, `kb.search(pricing, templates)`, `proposals.create_draft` | `send_proposal` |
| 3 | Sales Strategist | — | D | `claude-opus-5-5` | `crm.read`, `activities.read`, `research.read`, `notes.create` | — |
| 8 | Finance Analyst | — | D | `claude-opus-5-5` | `finance.read` (owner-granted), `reports.create` | — |
| 6 | Project Manager | — | E | `claude-opus-5-5` | `projects.read`, `tasks.read`, `reports.create`, `tasks.create_recommendation` | — |
| 7 | Technical Architect | — | E | `claude-opus-5-5` | `kb.search(technical)`, `projects.read`, `docs.create_draft` | `deploy_code`, `modify_client_system` (never executed by the system in the MVP) |

**Why these three first:** they map to the revenue path (find → qualify → contact), and the first 40 days depend on pipeline volume.

**Why the rest are deferred:**
- Executive Assistant and Finance Analyst summarize data that must first exist. Until then, deterministic SQL widgets are more reliable.
- The Sales Strategist overlaps heavily with Outreach early on.
- Project Manager and Technical Architect matter only once projects are signed.

**Model choice:** every agent defaults to `claude-opus-5-5` ($4 / $20 per MTok). Cheaper options are **a founder decision**:
- `claude-sonnet-5-5` ($2 / $10)
- `claude-haiku-5-5` ($0.10 / $0.50, for <100K-token prompts)

Doc 09 compares the costs. The model is a per-agent setting, so no code change is needed.

## 5. Agent definition format (stored in the repo, synced to DB)

```ts
// src/admin/agents/registry/market-research.ts  (illustrative)
export default defineAgent({
  key: "market_research",
  version: 1,
  name: "Market Research",
  purpose: "Find and research companies that match a search brief; every claim must cite a source URL.",
  provider: "anthropic",
  model: "claude-opus-5-5",
  effort: "medium",
  tools: ["web_search", "web_fetch", "kb.search", "crm.find_company", "candidates.create"],
  knowledgeScopes: ["public", "internal"],
  limits: { timeoutSeconds: 900, maxSteps: 40, maxCostUsd: 1.5, webSearchMaxUses: 15 },
  approvalRules: { add_lead_to_crm: "human_review" },
  outputSchema: MarketResearchOutput, // zod: companies[] with sources[]
});
```

A deploy-time sync writes the definition to `agents` with a hash. The UI shows the version, and changing the tools or limits requires an owner action, which is audited. The DB is the runtime source of truth for enabling or disabling agents and setting caps.

## 6. Development-time Claude Code setup (supports building, not running)

- `.claude/agents/`:
  - `db-reviewer` (reviews migrations and RLS)
  - `security-reviewer` (checks the DAL and actions against doc 06)
  - `ui-builder` (implements screens against doc 07)
- `.claude/rules/`: external-actions, no-secrets, no-fake-data. Phase 1 doc 09 defined these.
- Hooks: block `vercel --prod`, `supabase db push` to the production project ref, `git push --force`, and `curl -X POST` to external hosts.

## Sources (accessed 2026-11-15)
- Claude Code subagents: https://code.claude.com/docs/en/sub-agents ; features overview: https://code.claude.com/docs/en/features-overview
- Anthropic pricing (web search $10 per 1,000 searches): https://docs.claude.com/en/docs/about-claude/pricing. Model prices are from Anthropic's current model table (Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50 per MTok); verify on the pricing page before budgeting. Web fetch pricing is **NEEDS VALIDATION**.
- OWASP Top 10 for LLM Applications 2026 (secondary summary): https://cloudsecurityalliance.org/articles/the-owasp-top-10-for-llm-applications-2026-what-changed-and-why-it-matters
- OWASP Top 10 for Agentic Applications (secondary): https://www.techrepublic.com/article/news-owasp-ai-agent-risk-list/
