# Hotel OS: AI Architecture

There are three assistants. None of them calls an LLM in the demo: they are deterministic, testable functions. This shows the guardrails and the UX honestly. In production, an LLM can be placed in front of the **same tools and the same gates**.

| Assistant | Who | File | Data | Can do | Never does |
|---|---|---|---|---|---|
| Guest assistant (website) | Guests (hy/ru/en) | `lib/assistant.ts` | Hotel knowledge base, availability, rates | Answer approved questions, show rooms and prices, create an inquiry, hand over | Confirm a booking, invent answers |
| Inbox AI | Reception staff | `lib/ai/inbox-ai.ts` | Last inbound message + `kb` | Detect language and intent; classify risk; draft a reply with sources; suggest a department | Send anything without an employee; auto-answer high-risk topics |
| Review AI | GM / guest relations | `lib/ai/review-ai.ts` | Review text and rating | Categorise, score sentiment, draft a reply in the review's language, flag compensation or personal data | Publish; promise compensation; reveal a surname or booking code |
| SOP assistant | Employees | `lib/sop-assistant.ts` | Approved SOPs only | Answer with a cited SOP; route unknowns to the supervisor | Improvise procedures |
| Business assistant (copilot) | Managers | `lib/ai/copilot.ts` | Hotel state through 10 typed tools | Answer with figures (value + formula + source); daily summary; suggest tasks | Change data without approval; show finance to non-managers; guess causes |

## Risk policy (inbox)

- **High risk, so a human must approve:** payment, refund, cancellation, availability (it must be checked), complaint, maintenance, medical, legal, and unknown intent.
- **Auto-answer:** allowed only when every detected intent is low-risk and fully answered from `kb`. Examples: breakfast time, parking, pets, Wi-Fi, check-in time, transfer price, spa hours.
- **Demo setting:** even low-risk replies require a click. The "auto-send" configuration is designed but switched off.
- **Tests:** `tests/ops.test.ts` asserts the gate for seven high-risk phrasings.

## Action classes (copilot)

| Class | Examples | Control |
|---|---|---|
| Read-only analysis | Occupancy, not-ready rooms, overdue requests, workload, channel mix, cancellation trend, unanswered threads, complaints, extras revenue | Always allowed, within the user's permissions |
| Suggested actions | Create a task for a manager | Created only after "Approve" |
| Approval-required | Send a guest message, publish a review reply, move a room | Done in the respective screens by a person |
| Prohibited without explicit authorisation | Payments, refunds, rate/inventory changes, cancellations, bulk messaging | Not exposed as AI tools |

## Production design

- **LLM function calling:** limited to the typed tools above. The tool layer checks permissions server-side and returns figures with formulas. The LLM only phrases the answer.
- **Grounding:** drafts must cite the `kb` keys or SOP IDs they used. A post-check rejects numbers that do not appear in tool output.
- **Evaluation:** a test set per language covering risky intents, prompt-injection inside guest messages ("ignore previous instructions…"), and personal data in replies.
- **Privacy:** no card data; minimum context; per-tenant data isolation; provider data-retention settings reviewed.
- **Human handoff:** always available, and logged in the audit trail.
