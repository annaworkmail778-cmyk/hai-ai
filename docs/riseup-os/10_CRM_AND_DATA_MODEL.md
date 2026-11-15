# 10 — CRM and Data Model

Days 1–40 implementation: **one Google Spreadsheet, one tab per entity.** The same schema maps 1:1 to Postgres (Supabase) tables later. IDs are short strings (`CO-0001`) so humans can type them.

## Entities

### Companies
| Field | Type | Notes |
|---|---|---|
| company_id | text PK | `CO-0001` |
| name, legal_name | text | |
| tax_id | text | ՀՎՀՀ if public. Used for dedupe |
| domain | text | Normalized: lowercase, no `www.`, no path |
| segment | enum | developer, solar_installer, solar_om, enterprise, smb, partner |
| city, region | text | |
| size_signal | text | e.g. "3 active projects", "≈200 sites" |
| channels_seen | multi | instagram, facebook, website_form, whatsapp, phone, telegram |
| score_fit, score_signal, score_reach, score_pay, score_total | int | Doc 08 |
| tier | enum | A, B, C |
| owner | enum | founder, ops |
| status | enum | active, nurture, do_not_contact, client, lost |
| source_url, accessed_at, discovered_by | text, date, text | **Required** |
| created_at, updated_at | datetime | |

### Contacts (business roles only)
| Field | Notes |
|---|---|
| contact_id, company_id | FK |
| full_name, role | As publicly listed |
| business_email, business_phone, linkedin_url | Only from a business source. `source_url` required |
| lawful_basis | `legitimate_interest_b2b`, `consent`, `existing_client`. See doc 16 |
| opt_out | bool + date. **If true, never contact again** |
| language_pref | hy, ru, en |

### Research
`research_id, company_id, claim, source_url, accessed_at, confidence (high/med/low), verified_by, injection_flag`

### Deals
`deal_id, company_id, offer (developer_os / solar_os / automation / brokerage / smb), stage (0–7, lost, nurture), contract_value_usd, setup_usd, monthly_usd, deposit_pct, payment_schedule (json/text), expected_close, probability (auto from stage, override with reason), next_step, next_step_date, lost_reason`

### Activities
`activity_id, deal_id/company_id, type (research, call, email, dm, meeting, proposal, followup), channel, by, at, summary, outcome`

### Drafts
`draft_id, contact_id, channel, language, subject, body, facts_used (research_ids), status (draft → approved → sent / discarded), approved_by, approved_at, sent_at`

### Invoices & Payments
`invoice_id, deal_id, amount, currency, issued_at, due_at, status` · `payment_id, invoice_id, amount, currency, amount_usd, received_at, bank_ref`. **Cash counts only when it shows in the bank.**

### AuditLog
`at, actor (human/agent name), action, entity, entity_id, details`

## Dedupe rules (in order)
1. Same normalized domain → same company.
2. Same tax ID → same company.
3. Same normalized name + city → probable duplicate, flagged for a human to merge.
4. Contacts: same business email, or same phone in E.164 format.

## Money definitions (used in doc 18)
- **Contract value:** the total signed amount, setup + committed months.
- **Invoiced:** the sum of invoices issued.
- **Deposit:** the upfront invoice paid before work starts.
- **Cash received:** money in the bank account. **This is the only number counted toward the $6,000 target.**

## Retention
- Prospects with no engagement for 12 months are deleted or anonymised. Opt-outs are kept as a minimal suppression record (email/phone hash + date) so they are never re-contacted.
- Retention periods should be confirmed with a lawyer (doc 16).
