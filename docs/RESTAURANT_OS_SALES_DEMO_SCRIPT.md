# RISEUP Restaurant OS: Sales Demo Script

**Status:** Phase 1 draft, for approval. Spoken lines are given in Armenian (primary) with an English gloss; a Russian version is written once the screens exist. **Date:** 2026-11-27.

## 0. Before the meeting (10 minutes)
- [ ] Ask in advance (or at the start): how many seats/halls, which cash register/POS, takeaway/delivery share, who runs the kitchen, biggest problem at peak. Use `CUSTOMER_DISCOVERY.md` §2.
- [ ] Laptop: `/present/restaurant` → **Reset** → clock preset **"Friday 20:15"**. Connection pill shows «Համաժամեցված» (synced).
- [ ] Second screen or tablet: `/r/kds?station=grill` if available.
- [ ] Printed table tent with the QR for table 7 (session A or B).
- [ ] Phone hotspot ready; if no internet → **Local mode** (guest phone shown in a frame on the laptop).
- [ ] Pick the path: **Short (5 min)** = A + F. **Standard (12–15 min)** = A → B → C → F. **Deep (25 min)** = + D + E. Choose by the owner's stated problem; never show everything to everyone.

## 1. Opening (45 s) — frame the problem, not the product
> «Ուրբաթ երեկո է, ժամը 20:15։ Սրահը լիքն է, խոհանոցը ծանրաբեռնված։ Եկեք տեսնենք, թե ինչպես է պատվերը հասնում հյուրից խոհանոց, և ինչպես եք Դուք տեսնում, թե ինչքան եք վաստակում յուրաքանչյուր ուտեստից։ Ձեր դրամարկղը մնում է նույնը։»
> *"It's Friday, 20:15. The hall is full, the kitchen is busy. Let's see how an order travels from the guest to the kitchen, and how you see what each dish really earns you. Your cash register stays as it is."*

Say the coexistence sentence **in the first minute**: it removes the biggest objection.

## 2. Scenario A — QR at the table (3–4 min)
**Problem it solves:** orders written wrong or late at peak; waiters running between tables and kitchen; guests waiting to order.

| Step | Do | Say (value) |
|---|---|---|
| 1 | Hand the owner the table tent. They scan with **their own phone** | «Ոչ մի հավելված։ Սեղան 7-ը ճանաչվեց ավտոմատ։» — No app; the table is recognised |
| 2 | They open a dish, choose size, remove onion, add a note | «Ճշգրիտ պատվեր՝ առանց ձեռագրի։» — Exact order, no handwriting |
| 3 | They send. Point at their screen: "Sent · waiting for the restaurant" | «Պատվերը չի համարվում ընդունված, քանի դեռ Ձեր աշխատակիցը չի ընդունել։» — Not accepted until your staff accept it |
| 4 | Laptop: waiter view shows T7 new order → **Accept** | The waiter stays in control |
| 5 | KDS: tickets split to **Grill** and **Bar** automatically | «Խորովածը՝ մանղալին, գինին՝ բարին։» — Each station sees only its part |
| 6 | Tap **Start**, then **Ready** on the grill ticket | Their phone changes to "Preparing", then "Ready" — **let them notice it** |
| 7 | Overview: today's sales and the order counted | Everything is connected |

**Pause and ask:** «Ձեզ մոտ ինչքա՞ն ժամանակ է անցնում պատվերից մինչև խոհանոց ուրբաթ երեկոյան։» — How long from order to kitchen on your Friday nights?

## 3. Scenario B — direct takeaway (2 min)
**Problem:** phone lines busy; marketplace commissions; no customer data.
1. Website (show the premium home for 10 seconds: it's *their* brand, not a marketplace).
2. Takeaway, pickup 19:30, signed in as a demo member → submit.
3. Manager accepts → kitchen → **Ready for pickup** → cashier **Picked up**.
4. Show the customer's profile: order added, points earned.
> «Այս հաճախորդը Ձերն է, ոչ թե առաքման հարթակինը։» — This customer is yours, not the platform's.

Say clearly: the pickup message would go by SMS/WhatsApp in a pilot; here it's labelled **simulation**.

## 4. Scenario C — food cost (3 min) — usually the strongest for owners
**Problem:** prices rise, menu prices don't; nobody knows the real margin per dish.
1. Inventory → *Pork neck* → used in 4 dishes.
2. Open the khorovats recipe: lines, yield, cost, price ex-VAT, gross margin.
3. "Your supplier raised the price": enter the new price.
4. Watch the recalculation: margin falls; the system shows what price or portion restores it.
> «Հիմա Դուք գիտեք, թե որ ուտեստն է կորցնում շահույթը, նախքան ամսվա վերջը։» — You know which dish lost margin before the month ends.

Say: **gross** margin from your recipes; net profit only when you add your expenses.

## 5. Scenario F — owner's morning (2 min)
Overview → channels → best sellers → **menu-engineering matrix** → food-cost alerts → stock alerts → team → **Opportunities**. Open one insight and show "Why we think this" (the data behind it).
> «Ամեն առավոտ՝ 2 րոպեում։» — Every morning, in two minutes.

## 6. Optional deep dives
- **D Retention (3 min):** inactive members → offer → eligibility (consent!) → audience count → simulated campaign. Say: real sending starts in the pilot after consent and provider setup.
- **E Team (3 min):** new seasonal waiter → onboarding on the phone → task → message → done. Relevant for ski-season hiring.
- **Integrations page (1 min, only if asked about POS):** honest "Not connected" states; explain the coexistence path and the verification checklist.

## 7. Objection handling
| Objection | Answer |
|---|---|
| "We already have a cash register / POS" | «Շատ լավ։ Այն մնում է։ Մենք աշխատում ենք կողքին. դրամարկղը տալիս է ֆիսկալ կտրոնը, մենք՝ պատվեր, խոհանոց, ինքնարժեք և հաճախորդներ։ Եթե Ձեր համակարգն ունի պաշտոնական API, կստուգենք ինտեգրման հնարավորությունը։» |
| "Guests won't use QR" | Waiters can enter the same order on their phone; QR is an option, not a requirement. Measure the share in the pilot |
| "My staff won't learn it" | Each role sees only its screen; onboarding is built in; 30-day pilot with your team |
| "Can it take payments / print fiscal receipts?" | Not now. Payment stays on your terminal; fiscal receipt from your register. We don't claim what we haven't certified |
| "What about delivery platforms?" | Direct ordering first; platform integration only where an official partner API is available |
| "Is the AI safe for allergies?" | It answers only from what you enter, shows "not provided" when data is missing, and hands severe-allergy questions to staff |
| "Price?" | Starter / Growth / Advanced as in `RESTAURANT_SALES_OFFER.md`; start with the 30-day paid pilot |

## 8. Close (1 min)
> «Փորձենք 30 օր Ձեր իրական մենյուով և Ձեր թիմով։ Առաջին օրը կհամաձայնեցնենք՝ ինչ ենք չափում (QR պատվերների մասնաբաժին, պատվերից մինչև մատուցում ժամանակ, սխալներ)։»
> *"Let's try 30 days with your real menu and team. On day one we agree what we measure."*
Book the follow-up before leaving. Log the meeting in the CRM the same day.

## 9. Don'ts
- Don't show every module. Follow the owner's problem.
- Don't say "guaranteed", "fiscal", "integrated with your POS" (unless verified), "sent" for simulated messages, or "net profit".
- Don't type real guest data into the demo.
- Don't leave the session dirty: **Reset** after each meeting.
