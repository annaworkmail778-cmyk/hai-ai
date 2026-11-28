# RISEUP Restaurant OS: AI Architecture

## 1. What is implemented today (deterministic, no LLM)

No language model is called by the demo: there is no API key, and adding the SDK dependency was not approved. Every "AI" feature is a **deterministic, rule-based engine over Restaurant OS data**, designed so that an LLM can later replace only the language layer.

| Feature | Code | How it works |
|---|---|---|
| Language detection | `nlp.ts → detectLang` | Script detection: Armenian / Cyrillic / Latin |
| Intent detection (12 intents) | `nlp.ts → intentOf` | Multilingual keyword patterns: hours, menu, allergy, reservation, reservation change, order status, complaint, manager, delivery, price/discount, thanks, other |
| Risk classification | `INTENT_RISK` | low (hours, menu, thanks…), approval (reservation, order status…), escalate (allergy, complaint, manager, price/discount) |
| Inbox reply drafts | `draftReply` | Templates per intent and language, filled with facts from the state (opening hours, free slots, menu items); returns `{text, intent, risk, facts[]}` |
| Review analysis | `analyzeReview` | Topic sentiment −1/0/+1 for food, service, price, ambience, wait |
| Review reply drafts | `draftReviewReply` | Language-matched, rating-aware template; never promises compensation |
| Business assistant | `assistant.ts → ask / answer` | 15 question types matched in hy/ru/en; each answer computed by the **same analytics functions as the dashboards**, with `sources[]` and optional proposed `actions[]` (permission + events) |
| SOP assistant | `sopSearch` | Ranked search over procedures by tags, title and steps |

## 2. Answer contract (kept for the LLM version)

Every assistant answer has a **kind**:

| Kind | Meaning | UI |
|---|---|---|
| Analysis | Read-only facts with numbers | "Analysis" badge, sources line |
| Recommendation | Explains why, with numbers | "Recommendation" badge |
| Proposed action | Events to dispatch, a required permission | Button → confirmation dialog listing the exact events; executed as the user |
| Restricted | User's role lacks the permission | Disabled button "not allowed" with the permission name |

Rules: no number without a source; no action without confirmation; no action beyond the user's permissions; external messages are never sent by the assistant.

## 3. Guardrails for guest-facing text

* Drafts only. A person approves every outgoing message, except **auto-replies the manager enabled for low-risk intents** (domain refuses anything else: `inbox.autoreply` keeps only hours / menu / thanks, and the reducer auto-replies only when the draft's risk is low).
* Allergy, complaint, discount and "manager" intents are escalated: priority high, notice to managers, only a manager can approve the draft.
* Drafts list the **facts used**, so staff can check them before sending.
* Never: promise compensation, confirm a booking without a free table, state allergen absence as a guarantee.

## 4. Target design: Claude adapter

When the client approves an API key and the dependency, the language layer is swapped; the tools and guardrails stay.

```
user question / incoming message
        │
        ▼
 LLM (Claude, model id `claude-opus-5-5`, adaptive thinking)
        │  tool use (read-only):
        │   get_sales(period) · get_dish_economics(period) · get_stock_status() · get_waste(period)
        │   get_late_tickets() · get_reservations(day) · find_free_slots(day, party)
        │   get_unanswered_conversations() · get_reviews(filter) · get_tasks(filter) · search_sops(text)
        ▼
 structured answer {kind, text, sources[], proposed_actions[]}
        │
        ▼
 server validation: every number must come from a tool result in this turn; actions are mapped to
 allow-listed Restaurant OS events and checked against the user's permissions
        │
        ▼
 UI: same cards and confirmation dialog as today
```

Implementation notes for that phase:

* Tools are thin wrappers over existing pure functions (`analytics.ts`, `ops.ts`, `assistant.ts`), so the LLM can only see data the user is allowed to see.
* The LLM never writes events. It proposes; the server builds the event list; the user confirms.
* Server-side refusal/availability fallback configured so a turn degrades to the deterministic engine rather than failing; if the model is unavailable, the current rule-based answers remain.
* Prompt includes tenant brand, language, current time zone and the answer contract; no guest PII beyond what the tool returns for the question.
* Logging: question, tools called, answer kind, confirmed actions; no raw guest messages in analytics logs.
* Evaluation set before launch: the 15 question types × 3 languages, adversarial guest messages (discount pressure, allergy, prompt-injection inside a guest message), and review replies; a release blocks if any answer contains a number without a source.

## 5. Guest assistant and employee assistant

| Assistant | Today | Target |
|---|---|---|
| Guest (website chat) | Routes to inbox; low-risk auto-replies only if enabled | LLM drafts within the same risk rules; booking requests created as *requests* |
| Employee (SOP) | Search over SOPs by role | LLM answers grounded only in the restaurant's SOPs with citations; "ask your manager" when nothing matches |

## 6. What AI will not do

Change prices, send purchase orders, mark payments, approve refunds, publish reviews or send guest messages on its own.
