# RISEUP Hotel OS: One-page Offer + Paid Pilot Proposal

## Internal notes (do not show to customers)
- **Prices are hypotheses** (`COMMERCIAL_OFFERS.md`), pending your approval. Test them in the first 10 meetings and record reactions (`CUSTOMER_DISCOVERY.md` §4).
- The contest −20% applies only to eligible contest participants, for orders accepted by 30 Nov 2026 (`docs/RISEUP_SALES_SYSTEM/OBJECTION_HANDLING.md`).
- **What the pilot really delivers today:** we have no Level 2 backend yet. The pilot uses **real, working** parts:
  - a request page
  - an n8n workflow
  - a Telegram alert
  - a Google Sheet as the request list
  - a scripted FAQ assistant built from their data

  The dashboard shown in the demo is part of Growth (Level 2). Say this clearly.
- **Pilot delivery effort ≈ 12–16 h.** Plan at most 1–2 pilots before 22 Dec (capacity: `LEAN_DEMO_IMPLEMENTATION_PLAN.md` §3).
- Payment terms (approved):
  - ≤ 100,000 ֏: 100% upfront.
  - Projects: 50/50.
  - Monthly fees prepaid.
  - Third-party costs at cost.
  - Work starts after verified payment.

---

## Customer-facing one-page (Armenian)
### RISEUP Hotel OS: ավելի շատ ուղիղ ամրագրումներ, ոչ մի կորած հարցում
**Ում համար:** Ծաղկաձորի և շրջակայքի հյուրանոցներ, հյուրատներ և տնակներ։

**Ինչ խնդիր ենք լուծում:**
- Հյուրը գրում է գիշերը կամ հանգստյան օրը, պատասխանը ուշանում է, և նա ամրագրում է այլ տեղ։
- Հարցումները ցրված են զանգերի, Instagram-ի, WhatsApp-ի և Booking.com-ի միջև։
- Ընդունարանը զանգերով է տեղեկացնում հավաքարարներին։
- Զբաղվածության և եկամտի մասին տեղեկությունը ուշ է գալիս։

**Ինչ եք ստանում:**
| Փաթեթ | Ինչ է ներառում | Ներդրում | Ամսական |
|---|---|---|---|
| **Starter**՝ «Ուղիղ հարցումներ» | Կայք 3 լեզվով (սենյակներ, գներ, լուսանկարներ, քարտեզ, մեսենջերներ), ամրագրման հարցման ձև → ծանուցում Telegram-ով, 24/7 օգնական կայքում՝ Ձեր տվյալներով | 250 000 ֏-ից (հյուրատների համար՝ 150 000 ֏-ից) | 25 000 ֏-ից |
| **Growth**՝ «Ամրագրումներ և աշխատանք» | Starter + հարցումների և ամրագրումների վահանակ, սենյակների օրացույց, հյուրերի տվյալներ, հաստատումից հետո ավտոմատ հաղորդագրություններ, հավաքարարների առաջադրանքներ, ամսական վերլուծություն | 550 000 ֏-ից | 50 000 ֏-ից |
| **Advanced** | Growth + Booking.com/Airbnb օրացույցի համաժամեցում, օգնական Instagram/Telegram-ում, վերադարձող հյուրերի առաջարկներ | Անհատական | Անհատական |

**Մեր սկզբունքները:**
- Օգնականը պատասխանում է միայն Ձեր հաստատած տեղեկություններով։
- Ամրագրումը հաստատում եք միայն Դուք։
- Booking.com-ը և Ձեր դրամարկղը մնում են. մենք աշխատում ենք դրանց կողքին։

**Ժամկետներ:** Starter՝ 10–14 օր, Growth՝ 3–5 շաբաթ։
**Վճարում:** 100 000 ֏-ից մինչև՝ 100% նախապես. ավելի մեծ նախագծեր՝ 50/50։ Ամսավճարը՝ նախապես։ Երրորդ կողմի ծախսերը (դոմեն, WhatsApp-ի վճարներ)՝ ըստ փաստացի արժեքի։
**Կապ:** RISEUP · riseup-group.com · +374 77 200 433 · riseup.group.2026@gmail.com

### Краткая версия (Russian)
**RISEUP Hotel OS: больше прямых бронирований, ни одного потерянного запроса.**

| Пакет | Что входит | Внедрение | В месяц |
|---|---|---|---|
| Starter | Сайт на 3 языках, форма запроса брони → уведомление в Telegram, ассистент 24/7 по вашим данным | от 250 000 ֏ (гостевые дома: от 150 000 ֏) | от 25 000 ֏ |
| Growth | Starter + панель запросов и броней, календарь номеров, данные гостей, автосообщения после подтверждения, задачи для горничных, аналитика | от 550 000 ֏ | от 50 000 ֏ |
| Advanced | + синхронизация календаря с Booking/Airbnb, ассистент в Instagram/Telegram, предложения постоянным гостям | индивидуально | индивидуально |

**Наши принципы:**
- Ассистент отвечает только по вашим данным.
- Бронь подтверждаете только вы.
- Booking.com и ваша касса остаются.

---

## Paid pilot proposal: Hotel (30 days)
**Customer-facing (Armenian):**

> **30-օրյա պիլոտ Ձեր հյուրանոցի համար**
>
> **Ինչ ենք անում 7 աշխատանքային օրում.**
> 1. Ամրագրման հարցման էջ 3 լեզվով՝ Ձեր սենյակներով, գներով և լուսանկարներով։
> 2. Յուրաքանչյուր նոր հարցում ակնթարթորեն գալիս է Ձեր ընդունարանի Telegram խումբ և գրանցվում ընդհանուր աղյուսակում։
> 3. Օգնական էջում, որը պատասխանում է հաճախ տրվող հարցերին՝ միայն Ձեր հաստատած տեղեկություններով, և հավաքում է հարցումը։
>
> **Ինչ ենք չափում 30 օրում:** ստացված հարցումների թիվը, առաջին պատասխանի միջին ժամանակը, ոչ աշխատանքային ժամերին եկած հարցումները։ Ելակետը համաձայնեցնում ենք առաջին օրը։
>
> **Արժեքը.** 100 000 ֏, 100% նախապես։ Պիլոտի ընթացքում ամսավճար չկա։ Պիլոտից հետո որոշում եք՝ շարունակել Starter կամ Growth փաթեթով, թե դադարեցնել։ Ձեր տվյալները մնում են Ձեզ։
>
> **Ինչ է պետք Ձեզանից.** 1 ժամ մեկնարկին (սենյակներ, գներ, կանոններ, լուսանկարներ), Telegram խումբ, և 15 րոպե ամփոփիչ հանդիպման համար։
>
> Ամրագրումները հաստատում եք միայն Դուք։ Վահանակը, օրացույցը և ավտոմատ հաղորդագրությունները Growth փաթեթի մաս են։

**Terms checklist (internal):**
- [ ] Success criteria and the baseline are written into the pilot agreement (use `STATEMENT_OF_WORK_TEMPLATE.md` + an invoice).
- [ ] Scope is fixed: no calendar, no dashboard, no WhatsApp API, no OTA sync in the pilot.
- [ ] Data processing: guest names/phones are stored in the client's Google Sheet; the DPA clause is from `PRIVACY_DATA_PROCESSING_CHECKLIST.md`.
- [ ] **Credit rule (pending your approval):** 100,000 ֏ is credited against the Starter/Growth setup if the client signs within 14 days of the pilot's end.
- [ ] Day-30 review meeting is booked on Day 1.
