# RISEUP Brand Consolidation

**Decision (2026-11-22):** the commercial brand is **RISEUP**. The official website is **https://riseup-group.com**. "HAI-AI", "HAI AI", "HAI_AI Systems", "hai-ai.systems" and "Rise" are outdated.

## Commercial brand vs legal entity
| | Value | Status |
|---|---|---|
| Commercial brand | **RISEUP** | Decided |
| Website | https://riseup-group.com | Live (per founder) |
| Legal entity that signs contracts and receives payments | `{{LEGAL_ENTITY_NAME}}`: reported as an Armenian sole proprietor (ԱՁ); **name, registration number, tax ID (ՀՎՀՀ) and address not in the project** | **Required before the first contract or invoice** |
| Contract wording | "`{{LEGAL_ENTITY_NAME}}`, operating under the commercial brand RISEUP" | Use in every agreement |
| Email | riseup.group.2026@gmail.com (`src/config/brand.ts`) | Works; a domain email (e.g. hello@riseup-group.com) is recommended for agencies (P1) |
| Phone / WhatsApp | +374 77 200 433 (`src/config/brand.ts`) | Confirm it's current |

## Inspection results

| Location | Finding | Action taken |
|---|---|---|
| `docs/HAI_AI_30_DAY/*` (5 files with "HAI-AI") | Active sales documents | **Updated → RISEUP.** Roadmap marked "superseded by this folder" |
| `docs/riseup-os/REVENUE_SPRINT/*` (11 files with "Rise") | Active sales scripts, proposals, contracts | **Updated → RISEUP** |
| `docs/riseup-os/COMMAND_CENTER/*` (5 files with "Rise") | Internal planning | **Updated → RISEUP** |
| `docs/riseup-os/PRODUCT_VALIDATION/*`, `docs/riseup-os/01–22` | Dated research reports | **Kept as historical record** (not sent to customers) |
| `README.md` line ~234 ("HAI_AI Systems", previous site) | Historical note about the repository | Kept |
| `package.json` name `hai-ai`, `.claude/launch.json` `hai-ai-dev`, repository name `hai-ai` | Technical identifiers, invisible to customers | Kept (renaming has no sales value and risks breaking tooling) |
| Website text (`src/config/brand.ts` `COMPANY_NAME = "Riseup"`; locales say "Riseup") | Brand casing differs from "RISEUP" | **Not changed (needs your authorization to deploy).** One-line change in `brand.ts` updates titles, footer and metadata; locale texts need a search-and-replace. See the website audit, item C2 |
| Website legal line (`legalName: "Riseup"`) | Copyright and structured data show the brand as the legal name | Change to the real legal entity when known (website audit C3) |
| Client-historical documents (contracts/invoices already sent) | None found in the repository | Nothing to change. If any exist outside the repo, **keep them unchanged** |

## Brand consistency checklist (use before sending anything)
- [ ] Name written **RISEUP** (all caps) in proposals, decks and signatures. On the website, "Riseup" is acceptable until the site update is authorized.
- [ ] Website link is **https://riseup-group.com** (no other domain).
- [ ] No "HAI-AI", "HAI AI", "hai-ai.systems" or "Rise" anywhere in the document.
- [ ] The legal-entity block uses `{{LEGAL_ENTITY_NAME}}` until real details are inserted. Never invent them.
- [ ] Email and phone match `src/config/brand.ts`.
- [ ] Demos labelled "Demo / illustrative data" where applicable. No fictional client is presented as real.
- [ ] Prices match `FINAL_PRICING_AND_PAYMENT_TERMS.md`.
- [ ] File names start with `RISEUP_` for outgoing documents (e.g. `RISEUP_Capability_Statement.pdf`).
