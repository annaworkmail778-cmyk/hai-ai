# INVOICE / PAYMENT REQUEST (Template)
> Fill every `{{…}}` with **real** data. Do not issue an invoice until the legal entity, tax ID and bank details are confirmed. The accountant confirms the tax lines and the required invoice format in Armenia (including any e-invoicing obligation). `[ACCOUNTANT REVIEW]`

```
INVOICE No. {{RU-2026-0001}}                      Date: {{DD.MM.YYYY}}
                                                  Due date: {{DD.MM.YYYY}}
FROM (Provider)
{{LEGAL_ENTITY_NAME}} — operating as RISEUP
{{LEGAL_FORM}} · Reg. No. {{REG_NO}} · Tax ID (ՀՎՀՀ) {{TAX_ID}}
{{ADDRESS}} · riseup.group.2026@gmail.com · +374 77 200 433 · https://riseup-group.com

BILL TO (Client)
{{CLIENT_LEGAL_NAME}} · {{CLIENT_ADDRESS}} · Tax/VAT ID {{CLIENT_TAX_ID}}
Contact: {{NAME, EMAIL}}

REFERENCE: Agreement/SOW No. {{SOW_NO}} · Project: {{PROJECT}}

| # | Description                                   | Qty | Unit price | Amount |
|---|-----------------------------------------------|-----|------------|--------|
| 1 | {{e.g. Paid test task — landing page (WL-0)}}  | 1   | {{300.00}} | {{300.00}} |
| 2 | {{e.g. Website WL-2 — deposit 50%}}            | 1   | {{600.00}} | {{600.00}} |
                                                   Subtotal: {{ }}
                                                   Tax: {{per accountant / "not applicable — reason"}}
                                                   TOTAL DUE: {{amount}} {{AMD/USD/EUR}}

PAYMENT
Bank transfer to: {{ACCOUNT_HOLDER}} · Bank: {{BANK_NAME}} · Account/IBAN: {{ACCOUNT}}
SWIFT/BIC: {{SWIFT}} · Currency: {{CURRENCY}} · Intermediary bank (USD/EUR): {{IF_REQUIRED}}
Payment reference: "Invoice {{No.}}"
{{Optional: Payoneer payment request link}}

TERMS
Work starts on receipt of payment. Bank fees on the sender's side are paid by the client (OUR).
Late payment may pause work after 7 days. Prices exclude third-party costs unless listed.
```

**Payment-request message (EN):**
> Hi {{Name}}, attached is invoice {{No.}} for {{item}} ({{amount}}). Work starts as soon as the payment arrives. Please use the reference "Invoice {{No.}}". Thank you!

**Armenian version:** use `docs/riseup-os/REVENUE_SPRINT/CONTRACT_AND_DEPOSIT_TEMPLATES.md` §2–4.
