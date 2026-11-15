# 15 — Proposal and Contract Specification

> ⚠️ **Every contract template must be reviewed by a licensed Armenian lawyer before first use.** This document specifies structure and business terms only. It is not legal advice, and no contract text is drafted in Phase 1.

## Proposal template (per deal)
1. Client context: from discovery notes, in their words.
2. Objectives and success metrics for the pilot.
3. Scope: in scope / out of scope.
4. Deliverables and timeline (weeks).
5. Client responsibilities: account access, content, approvals, a point of contact.
6. Price: setup, monthly, optional items. Currency AMD or USD (decision in doc 21).
7. Payment terms: **50% deposit on signature**, 50% at go-live (Developer/Automation). 60% / 40% for Solar.
8. Assumptions and risks: third-party API availability, platform policy changes.
9. Validity: 14 days.
10. Next steps.

## Contract architecture

```
MSA (master services agreement, once per client)
 ├── SOW / Order form (per project: scope, price, timeline)
 │     ├── Implementation terms (acceptance, change requests)
 │     └── Maintenance & Support terms (monthly fee, SLA, exclusions)
 ├── Data Processing Addendum (RiseUp as processor of client's lead data)
 └── NDA (can be signed before discovery)
Referral/Partner Agreement (with vendors/partners)
Brokerage/Intermediary Agreement (only where legitimate, see doc 16)
```

| Document | Key clauses to specify | Lawyer focus |
|---|---|---|
| MSA | Parties, services, fees, payment, IP (client owns its data and configs; RiseUp keeps reusable know-how and templates), confidentiality, warranties (no revenue guarantees), liability cap (e.g. fees paid in the last 3 months), termination, governing law (Armenia), disputes | Enforceability, liability cap, legal form of RiseUp |
| SOW | Deliverables, milestones, acceptance criteria, change-request process, client dependencies | Acceptance mechanics |
| Implementation | Acceptance within 5 business days; deemed acceptance | Consumer vs B2B rules |
| Maintenance | Monthly fee, response times (business hours), what's excluded (third-party outages, API policy changes), price changes with notice | SLA wording |
| DPA | Data categories, purposes, sub-processors (Meta, Google, n8n host, Telegram, ElevenLabs, Supabase), security, breach notice, deletion on termination | Armenian personal data law (doc 16); cross-border transfer |
| NDA | Mutual, 2–3 years | Standard |
| Referral/Partner | Disclosure of fees to the client, fee % and trigger (after client payment), no exclusivity by default, anti-bribery | Disclosure, tax |
| Brokerage/Intermediary | Only when RiseUp genuinely brings two parties together; full disclosure; no payments to public officials or employees of the client | Civil Code rules on agency/commission (not researched), anti-corruption |

## Signing
- Wet signature or Armenian qualified digital signature (ID card / mobile ID) for MSAs and SOWs, until the lawyer confirms whether a simple e-signature tool (DocuSeal/Documenso) is enough (doc 16).
- Invoices from RiseUp's legal entity with the correct tax treatment (decision in doc 21).
