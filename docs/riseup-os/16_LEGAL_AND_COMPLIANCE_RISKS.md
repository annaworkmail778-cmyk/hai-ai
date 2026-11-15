# 16 — Legal and Compliance Risks

> This is not legal advice. It is a list of risks to raise with a licensed Armenian lawyer (and EU/US counsel before any outreach there). Sources are listed in doc 22.

## Armenia

| Area | What we found | Risk to RiseUp | Mitigation |
|---|---|---|---|
| **Personal data** | Law on Protection of Personal Data (2015) [S16]. Processing needs a lawful basis, usually consent unless a legal exception applies. Data-subject rights apply. There is a supervisory authority under the Ministry of Justice [S16b] | Prospect contact data (names, phones, emails of employees) is personal data. B2B context does not automatically exempt it | Collect only business-role data from public business sources. Record the source. Honour objections immediately. Keep minimal data. Privacy notice on site forms. **Lawyer to confirm the lawful basis for B2B prospecting** |
| **Direct marketing / advertising** | The advertising law and recent consumer/advertising harmonisation with EU norms [S19a, S19b]. Unsolicited advertising by electronic means is restricted (the exact article was not verified) | Mass DMs or emails could breach it, and could also break platform rules | 1:1, relevant, human-sent messages. Clear identity. Opt-out. Stop after "no". Phone calls to the company's public sales line. **Lawyer to confirm the rules for B2B email and DMs** |
| **E-signature** | Law on Electronic Document and Electronic Digital Signature [S19]. Legal equivalence is tied to a **digital signature** with certificates (ID card / mobile ID) | DocuSeal/Documenso-style signatures may not carry the same weight | Wet signature or Armenian digital signature for MSA/SOW until the lawyer confirms otherwise |
| **Contracts / IP** | Not researched in depth | Unclear ownership of configurations and prompts | MSA IP clause (doc 15) |
| **Tax / invoicing** | Not researched. Depends on RiseUp's legal form (ԱՁ vs LLC) and regime (turnover tax vs VAT) | B2B clients may need VAT invoices. Turnover thresholds | **Accountant consultation before the first invoice** |
| **Brokerage / referral fees** | Civil Code agency/commission rules were not researched | Hidden commissions can be deceptive or a conflict of interest. Payments to employees of a client could be bribery | Written agreements, disclosure to both parties, fees paid company-to-company only, never to individuals at the client or to public officials |
| **Public procurement** | armeps.am [S13] | Bid rules, conflicts | Only bid with complete documents; never contact evaluators |
| **Contests (SMB)** | Rules already published on the site | Platform rules on giveaways | Already handled in the contest plan |

## Platforms
- **Meta (Instagram/Facebook/WhatsApp):** no automation of personal accounts. Business messaging must follow Meta's policies, including the 24-hour window and templates. No mass DMs.
- **LinkedIn:** no scraping or automation tools that break LinkedIn's user agreement.
- **Google Maps/Places:** store only what the terms allow (place IDs). Do not build a bulk copy of listings.
- **Inverter platforms:** use APIs only with the client's credentials and within the vendor's terms.

## EU (later)
- GDPR: legitimate interest assessment (LIA) documented. Disclose the data source. Opt-out in every email. Data-subject requests within one month [S32–S34].
- ePrivacy: national rules differ, and some countries require prior consent even for B2B. Sole traders are often treated as consumers.
- Non-EU sender (Armenia) targeting EU people: GDPR Art. 3(2) may apply, and an EU representative may be required.

## US (later)
- CAN-SPAM: accurate header and subject, physical address, a working opt-out honoured within 10 business days [S32].
- State privacy laws: not researched.

## AI-specific
- AI replies to client leads must not make promises the developer did not authorize (prices, availability, legal terms). Put a "consultant will confirm" fallback in the prompts.
- Disclose AI use to end users where required or prudent ("automated assistant"). Lawyer to confirm.
- Voice: use only voices licensed for commercial use. No cloning of real people without written consent.

## Lawyer review checklist (Phase 2, before first contract)
1. MSA, SOW, DPA, NDA, Referral and Brokerage templates.
2. Lawful basis for B2B prospecting and outreach in Armenia.
3. Whether simple e-signatures are acceptable for B2B service contracts.
4. AI disclosure duties.
5. Legal form and invoicing. Can an ԱՁ contract with developers, and what are the VAT implications?
6. Privacy notice text for site forms.
