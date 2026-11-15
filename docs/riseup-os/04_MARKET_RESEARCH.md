# 04 — Market Research

Access date for every source: 2026-11-15. Full URLs are in doc 22. [S#] refers to the source number there.

## 1. Armenia — Real Estate & Construction (priority 1)

### Facts

- Construction volume grew **24.5% in H1 2026** [S20]. In the first seven months of 2026 it grew **about 25%, to 369.2 billion AMD** [S21].
- New-build housing demand has been high. Reported drivers include mortgage income-tax refunds, relocation and rising incomes [S22].
- The **mortgage income-tax refund for housing is being phased out**. It ended earlier in Yerevan and is narrowing further [S23, S24]. Developers face more price-sensitive buyers, so lead response and conversion matter more. The exact scope and dates need checking per region before we cite them in sales material.

### What this means (assumption)

- Developers have marketing budgets and many inbound inquiries from Instagram and Facebook ads, portals, phone calls and WhatsApp. As subsidies shrink, **conversion efficiency becomes the pain to sell into**.
- Likely buyers are the sales director, marketing manager or owner at mid-size developers with 1–5 active projects. Large developers probably already have Bitrix24 or a CRM plus an integrator, so sell them complementary messaging, AI qualification and dashboards.

### Unknown (research in Phase 2, manually)

- The number of active residential developers in Yerevan and the regions. Build a list from the register [S12], portals and project sites.
- Industry associations. A union of builders exists in many CIS countries, but the Armenian equivalent and its member list have not been verified.
- Which CRMs Armenian developers use today. Find out through discovery calls, not assumptions.

## 2. Armenia — Energy & Solar (priority 2)

### Facts

- Armenia added **about 615 MW of solar in 2025** [S25].
- There are **50,000+ autonomous energy producers**, mostly small solar [S26]. Some support programmes and loan subsidies have ended or changed [S26].
- Major inverter platforms expose official APIs or northbound interfaces. Examples are Huawei FusionSolar and Sungrow iSolarCloud, documented through integrator docs [S27–S29]. Access requires account or installer credentials and the vendor's terms.
- International solar monitoring and O&M software exists at a wide range of price points [S30, S31].

### What this means (assumption)

- Installers and O&M companies maintain hundreds of small sites across several inverter brands. A simple multi-brand alerting, ticketing and client-report layer, delivered over Telegram, is a plausible pilot.
- RiseUp's only solar reference is the Shtigen inverter-limits automation. Sell this as a pilot, not as a proven product.

### Unknown

- The number of installers and O&M firms, and their tools.
- API access terms for each inverter brand in Armenia. Whether installer accounts can use northbound APIs commercially must be checked per vendor. **SolarEdge has not been researched.**
- Whether utilities or the Public Services Regulatory Commission publish usable open data.

## 3. Armenia — Enterprise Automation (priority 3)

- Demand signal: procurement portals list automation tenders. One example is "Business Process Automation Systems for the YES Platform" on DevelopmentAid [S14]. Its status and eligibility must be checked before any action.
- Public tenders on armeps.am [S13] need registration and documents, and they run on slow cycles. They are a medium-term channel, not a 40-day one.

## 4. Brokerage (secondary)

- Opportunity (assumption): connect developers or businesses with vetted solar installers or other vendors for a disclosed referral fee. This is useful only once RiseUp knows vendors well. Doc 16 covers the legal limits.

## 5. EU and US (later)

- **EU:** cold B2B email is not banned outright under the GDPR. The usual basis is **legitimate interest** under Art. 6(1)(f) with a documented assessment. **National ePrivacy rules** decide whether unsolicited email is allowed, and they differ by country; Germany, for example, is stricter. Sole traders are often treated as individuals [S32–S34]. Requirements include relevance to the person's role, a clear opt-out and disclosure of the data source.
- **US:** CAN-SPAM is opt-out based, with accurate headers, an address and an unsubscribe link [S32].
- **Recommendation:** no EU/US outreach until there are 2–3 Armenian case studies and a lawyer-checked outreach policy. Use content and LinkedIn presence until then.

## 6. Prospecting data sources

| Source | Use | Limits / rules | Ref |
|---|---|---|---|
| e-register.moj.am | Company existence, legal name, registration data | Manual search. Respect the site's terms; no bulk scraping | S12 |
| Company websites, portals | Projects, sales contacts, channels | Manual review. Record the source URL | — |
| armeps.am | Public tenders | Registration required to bid | S13 |
| Google Maps / Places API | Business discovery by category and area | Per-SKU free caps (10k Essentials, 5k Pro, 1k Enterprise per month). Billing account needed | S35 |
| Apollo free | Contacts, mostly EU/US | About 10 exports/month on free. Thin coverage for Armenia (assumption) | S9 |
| Hunter free | Find and verify business emails | 25 searches + 50 verifications per month | S10 |
| LinkedIn free / Sales Navigator | Decision makers | Sales Navigator Core ≈ $119.99/mo, so skip it at first. No automation tools that break LinkedIn's terms | S11 |
