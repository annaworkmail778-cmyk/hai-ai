# Riseup — Reels և գովազդային տեսանյութերի պրոմպտներ

Այս ֆայլը պատրաստի պրոմպտներ է տալիս երկու գործիքի համար.

- **Claude Code**՝ 2D անիմացիոն տեսանյութեր կոդով (Remotion). հեռախոսի էկրան, չատ, վահանակ, տեքստեր, թվեր։ Ամենաճշգրիտն ու ամենաէժանն է, քանի որ մեր կայքի դեմոները արդեն պատրաստ են։
- **Higgsfield**՝ կինեմատոգրաֆիկ կադրեր (B-roll). վարպետը սրահում, սեփականատերը գիշերը հեռախոսով, սրճարան և այլն։

**Լավագույն արդյունքը** երկուսի համադրությունն է. 2–3 վայրկյան Higgsfield կադր (խնդիրը), հետո 10–15 վայրկյան Claude Code անիմացիա (լուծումը), վերջում լոգո և կոչ։

---

## 1. Կանոններ բոլոր տեսանյութերի համար

| Կանոն | Ինչու |
|---|---|
| Ձևաչափ 9:16, 1080×1920, 15–30 վայրկյան | Reels, TikTok, Stories |
| **Առաջին 2 վայրկյանում՝ խնդիրը** («Գիշերը 23:40 է, հաճախորդը գրում է…») | Մարդիկ որոշում են 2 վայրկյանում՝ դիտել, թե ոչ |
| Միշտ **հայերեն ենթագրեր**՝ մեծ, էկրանի կենտրոնում | Մարդկանց մեծ մասը դիտում է առանց ձայնի |
| Մեկ տեսանյութ = մեկ խնդիր = մեկ լուծում | Պարզ է, հիշվում է |
| Վերջում՝ կոչ. «Գրեք **ԴԵՄՈ** դիրեկտում» կամ «riseup… կայքում» | Չափելի արդյունք |
| Ոչ մի կեղծ թիվ «արդյունքի» մասին («+300% վաճառք»)։ Թույլատրելի է ցույց տալ, թե ինչ է անում համակարգը | Վստահություն և Meta-ի կանոններ |
| Մի օգտագործեք իրական բրենդների լոգոներ, իրական մարդկանց դեմքեր կամ անուններ | Իրավական ռիսկ |

**Ձայնը.** լավագույն տարբերակը ձեր կամ ձեր կնոջ ձայնն է (հեռախոսով, լուռ սենյակում)։ Կենդանի հայերեն ձայնը ավելի շատ վստահություն է ներշնչում, քան ռոբոտինը։ Եթե օգտագործեք AI ձայն, նախ ստուգեք, որ հայերենը բնական է հնչում։

**Ֆոնային երաժշտություն.** հանգիստ, ժամանակակից, առանց բառերի, 90–110 BPM։

---

## 2. Claude Code. մեկանգամյա կարգավորում

Բացեք Claude Code-ը այս ռեպոզիտորիայում և ուղարկեք.

```
Create a separate Remotion project in the folder `reels/` (do not touch the website build).
Goal: render vertical 1080x1920 MP4 reels (30 fps) for Instagram/TikTok ads for Riseup.

Requirements:
- Reuse the look of the website demos in src/components/demos (kit.tsx: PhoneFrame, AppFrame,
  Bubble, Toast, Chip, Stat, Stars, ChannelIcon) — copy what you need into reels/src so
  Remotion can render it; keep brand colours: black #000, paper #f3f2ee, accent #ff5b14.
- Fonts: Geist for Latin, Noto Sans Armenian for Armenian (files are in src/assets/fonts).
- A reusable <Reel> composition with these props:
  hook (big Armenian text, first 2 s), scenes (array of animated UI scenes), subtitles
  (array of {from, to, text}), cta (final card with the Riseup logo, the text and the
  site URL), and an optional background video (for Higgsfield clips) and voiceover audio.
- Subtitles: large (64 px), white with a black rounded background, centred in the lower third,
  max 2 lines, word-by-word highlight in #ff5b14.
- Smooth spring animations: messages slide in, typing dots, notifications drop from the top,
  numbers count up, cards pop.
- Safe zones: keep important content away from the top 220 px and bottom 380 px
  (Instagram UI covers them).
- Add an npm script `npm run reel -- <id>` that renders reels/out/<id>.mp4.
Show me a still of frame 60 of the first reel when done.
```

Հետո յուրաքանչյուր տեսանյութի համար ուղարկեք ներքևի «Claude Code պրոմպտը»։

---

## 3. Higgsfield. ընդհանուր ոճ

Ավելացրեք այս տողը յուրաքանչյուր Higgsfield պրոմպտի վերջում, որ բոլոր կադրերը նույն ոճով լինեն.

```
Vertical 9:16, cinematic, shallow depth of field, soft warm practical lights, modern Yerevan
interior, natural skin tones, subtle film grain, slow handheld camera, no text, no logos,
no brand names on screens, 4–5 seconds.
```

---

## 4. Տեսանյութերի սցենարներ (10 հատ)

Յուրաքանչյուրում կա.
- **Ձայն** (հայերեն տեքստը);
- **Higgsfield** կադր;
- **Claude Code** պրոմպտ;
- **Գովազդի տեքստ**։

### Reel 1. «Գիշերը 23:40 է» (AI ադմինիստրատոր)

**Ձայն.**
> Գիշերը 23:40 է։ Հաճախորդը գրում է՝ «Մանիկյուրն ի՞նչ արժե, վաղը ազատ ժամ կա՞»։ Դուք քնած եք։ Իսկ Riseup-ը արդեն պատասխանել է, գրանցել է նրան վաղը 11:00-ին և ձեզ ուղարկել է ծանուցում։ Առավոտյան դուք ունեք նոր հաճախորդ։ Riseup. AI ադմինիստրատոր, որը երբեք չի քնում։

**Higgsfield (0–3 վրկ).**
```
Close-up of a smartphone lighting up on a dark bedside table at night, a new message
notification glow, a woman asleep softly out of focus in the background, quiet blue night
light from the window.
```

**Claude Code.**
```
Render reel "night-salon" with <Reel>:
hook: "Գիշերը 23:40 է։ Ո՞վ կպատասխանի ձեր հաճախորդին։"
Scenes: 0–3 s background video night.mp4; 3–9 s phone with Instagram chat of "Bella Studio":
client bubble "Բարև։ Մանիկյուրն ի՞նչ արժե։ Վաղը ազատ ժամ կա՞։", typing dots, AI bubble
"Գել մանիկյուրը 8 000 ֏ է։ Վաղը ազատ է՝" with quick replies 11:00 / 14:30 / 17:00, tap 11:00;
9–13 s green "Գրանցված է · Վաղը 11:00" card pops; 13–17 s Telegram notification drops:
"Նոր գրանցում Instagram-ից · Լիլիթ · 11:00"; 17–20 s CTA "Riseup — AI ադմինիստրատոր 24/7 ·
Գրեք ԴԵՄՈ". Subtitles from the voiceover text in docs/marketing/reels-prompts.md, Reel 1.
```

**Գովազդի տեքստ.**
> Ձեր դիրեկտին գիշերը ո՞վ է պատասխանում 🌙
> Riseup AI ադմինիստրատորը պատասխանում է 24/7, գրանցում է հաճախորդներին և հիշեցնում այցի մասին։
> Մեկնարկային գին՝ 60 000 ֏-ից։ Գրեք «ԴԵՄՈ», և անվճար ցույց կտանք ձեր սրահի օրինակով։

### Reel 2. «Նույն հարցը 100 անգամ» (AI ադմինիստրատոր)

**Ձայն.**
> «Ի՞նչ արժե»։ «Որտե՞ղ եք»։ «Ազատ ժամ կա՞»։ Ձեր ադմինիստրատորն այս հարցերին պատասխանում է օրական հարյուր անգամ։ Riseup-ը պատասխանում է նրա փոխարեն՝ վայրկյանների ընթացքում, հայերեն, ռուսերեն և անգլերեն։ Իսկ ադմինիստրատորը զբաղվում է հաճախորդներով, որոնք արդեն սրահում են։

**Higgsfield.**
```
A tired salon receptionist at a modern reception desk, typing fast on a phone while two
clients wait, phone vibrating repeatedly, warm beauty-salon lighting, slight push-in.
```

**Claude Code.**
```
Render reel "same-questions": hook "Նույն հարցը՝ օրական 100 անգամ"; scene 1: a stack of 6
incoming chat bubbles flying in fast ("Ի՞նչ արժե", "Որտե՞ղ եք", "Ազատ ժամ կա՞", "Ի՞նչ արժե",
"Կիրակի աշխատու՞մ եք", "Ի՞նչ արժե") with a counter 1→100; scene 2: each bubble gets an AI
answer with a sparkle label "AI ադմինիստրատոր"; scene 3: 3 language chips ՀԱՅ / РУС / ENG;
CTA "Riseup · 60 000 ֏-ից".
```

**Գովազդի տեքստ.**
> Ձեր ադմինիստրատորը ամբողջ օրը պատասխանում է նույն հարցերին։ Riseup-ը կանի դա նրա փոխարեն։ 3 լեզու, 24/7, ձեր գներով։

### Reel 3. «Հաճախորդը մոռացավ» (հիշեցումներ)

**Ձայն.**
> Վարպետը սպասում է։ Հաճախորդը չի գալիս։ Մեկ ժամ կորավ։ Riseup-ը հաճախորդին հիշեցում է ուղարկում այցի օրը առավոտյան։ Մեկ հպում՝ «Այո, գալիս եմ», կամ «Տեղափոխել»։ Ազատված ժամն առաջարկվում է հաջորդին։

**Higgsfield.**
```
A nail master sitting alone at a clean manicure table, checking the wall clock, empty chair
opposite, afternoon light, slow dolly-in, a feeling of waiting.
```

**Claude Code.**
```
Render reel "reminder": hook "Հաճախորդը մոռացավ։ Ժամը կորավ։"; scene: phone lock screen
09:00 with a gradient wallpaper, reminder notification "Այսօր 11:00 · մանիկյուր · Գալի՞ս եք"
with buttons, finger tap on "Այո, գալիս եմ", green confirmation; second scene: salon calendar
where the visit turns green; CTA.
```

### Reel 4. «Պատվերը կորավ դիրեկտում» (պատվերներ)

**Ձայն.**
> Հարյուր նամակ դիրեկտում։ Մեկը պատվեր էր, և այն կորավ։ Riseup-ը պատասխանում է «Կա՞, ի՞նչ արժե» հարցերին, ընդունում է պատվերը, դնում այն մեկ վահանակում և հասցեն ուղարկում առաքիչին։ Ոչ մի կորած պատվեր։

**Higgsfield.**
```
A young woman owner of a small clothing shop surrounded by packages, scrolling an endless
chat on her phone, stressed, clothes rack behind, daylight, quick handheld.
```

**Claude Code.**
```
Render reel "lost-order": hook "Այս պատվերը կորավ 100 նամակի մեջ"; scene 1: endless
scrolling chat list with one message highlighted red then disappearing; scene 2: AI answers
"Այո, M չափսը կա։ 18 900 ֏" with a product card; scene 3: kanban board Նոր → Վճարված →
Ճանապարհին → Հանձնված, card #1042 moving across; scene 4: Telegram message to courier with
address; CTA "Riseup Պատվերներ · 90 000 ֏-ից".
```

### Reel 5. «Տետրը և Excel-ը» (պատվերներ և մնացորդ)

**Ձայն.**
> Պատվերները՝ տետրում, մնացորդը՝ հիշողության մեջ, առաքիչը զանգում է հասցեի համար։ Riseup-ով բոլոր պատվերները մեկ էկրանին են, մնացորդն ինքն է թարմանում, իսկ երեկոյան ստանում եք օրվա վաճառքը մեկ նամակով։

**Higgsfield.**
```
Hands writing orders in a paper notebook next to a phone and a cup of coffee, messy desk,
then the notebook closes, top-down shot, warm light.
```

**Claude Code.**
```
Render reel "notebook": hook "Պատվերները դեռ տետրո՞ւմ եք գրում"; morph a paper notebook
graphic into the order board UI; stock counter M: 3 → 2 with a "Քիչ է" chip; daily report
card with 3 stats counting up; CTA.
```

### Reel 6. «Ո՞ր գնորդն ինչ էր ուզում» (անշարժ գույք)

**Ձայն.**
> Հայտեր list.am-ից, Instagram-ից, զանգերով։ Ո՞վ էր ուզում երկսենյականոց Արաբկիրում։ Riseup-ը բոլոր հայտերը հավաքում է մեկ տեղում, AI-ն տալիս է առաջին պատասխանը և առաջարկում համապատասխան բնակարանները։ Գործակալը ստանում է հիշեցում՝ ում զանգել այսօր։

**Higgsfield.**
```
A real-estate agent in a small Yerevan office with sticky notes all over the monitor,
phone ringing, city view through the window, late afternoon, slow pan.
```

**Claude Code.**
```
Render reel "realestate": hook "Ո՞ր գնորդն էր ուզում 2 սենյականոց Արաբկիրում"; scene 1:
three source chips (list.am-ը որպես տեքստ, ոչ լոգո / Instagram / Զանգ) flowing into one list;
scene 2: buyer card "Արամ · 2 սեն. · Արաբկիր · մինչև 80 000 $" connecting with lines to 3
apartment cards; scene 3: reminder "Արամին 5 օր է չեք զանգել"; CTA "Riseup Գույք".
```

### Reel 7. «Ինչու ձեզ չեն գտնում Google-ում» (մարքեթինգ)

**Ձայն.**
> Մարդը փնտրում է «սրճարան մոտակայքում»։ Google-ը ցույց է տալիս նրանց, ում թարմ լուսանկարներ, ճիշտ ժամեր և շատ կարծիքներ ունեն։ Riseup-ը խնամում է ձեր Google պրոֆիլը, հաճախորդներից կարծիքներ է խնդրում և պատասխանում յուրաքանչյուրին։

**Higgsfield.**
```
A person on a Yerevan street at evening holding a phone with a map app (no logos visible),
looking around for a café, warm street lights, cinematic.
```

**Claude Code.**
```
Render reel "google": hook "Ինչու՞ ձեզ չեն գտնում քարտեզում"; scene: map with 3 pins, your
pin grey with "3 կարծիք", competitor pin with "120 կարծիք"; then your profile gets photos,
hours, rating 4.6 → 4.8, review cards pop with AI replies; CTA "Riseup Մարքեթինգ ·
25 000 ֏/ամիս".
```

### Reel 8. «Կարծիքներ առանց խնդրելու ամաչելու» (մարքեթինգ)

**Ձայն.**
> Գոհ հաճախորդները հազվադեպ են կարծիք թողնում, եթե նրանց չխնդրեն։ Riseup-ը այցից հետո ուղարկում է կարճ «շնորհակալություն» նամակ՝ հղումով։ Մեկ հպում, հինգ աստղ, նոր հաճախորդներ։

**Higgsfield.**
```
A smiling client leaving a cozy café, checking her phone at the door, a soft notification
light on her face, golden hour.
```

**Claude Code.**
```
Render reel "reviews": WhatsApp-style message "Շնորհակալություն այցի համար։ Ինչպե՞ս էր
ամեն ինչ։", stars fill one by one with a sparkle, review text types in, chip "Հրապարակված է
Google-ում", counter 38 → 41 կարծիք; CTA.
```

### Reel 9. «Instagram-ի համար ժամանակ չկա» (մարքեթինգ)

**Ձայն.**
> Գիտեք, որ Instagram-ը կարևոր է, բայց գրառելու ժամանակ չկա։ Ամեն ամիս մենք պատրաստում ենք 12–16 գրառում։ Դուք միայն նայում և հաստատում եք։

**Claude Code.**
```
Render reel "content-plan": a month calendar fills with post thumbnails one by one (12 of
them), one opens as a full Instagram post mockup "Աշնանային մենյու −20%", an "Հաստատել"
button gets tapped; CTA "Google + Instagram · 60 000 ֏/ամիս".
```

### Reel 10. «Կայք 3 լեզվով» (կայքեր)

**Ձայն.**
> Հաճախորդը ձեր մասին լսել է և բացում է կայքը։ Այն դանդաղ է, հին, և հասկանալի չէ, թե ինչ եք անում։ Նա փակում է։ Riseup-ը ստեղծում է արագ և պարզ կայք երեք լեզվով, որը մեկ նախադասությամբ բացատրում է ձեր գործը։

**Higgsfield.**
```
A man in a car waiting, impatiently looking at a phone loading screen, then giving up and
locking the phone, overcast daylight.
```

**Claude Code.**
```
Render reel "website": split screen: left "Առաջ" — an old slow website with a loading
spinner; right "Հիմա" — a clean fast site in a phone frame with language switch ՀԱՅ/РУС/ENG
and a contact form that sends; CTA "Կայք՝ 120 000 ֏-ից".
```

---

## 5. Շարք «Օրվա խնդիրը» (ամեն օր նոր տեսանյութ)

Ամեն օր մեկ կարճ տեսանյութ (10–15 վայրկյան). մեկ իրական խնդիր, մեկ լուծում։ Claude Code-ում ամեն առավոտ ուղարկեք.

```
Create today's "Problem of the day" reel with the <Reel> template.
Business type: {սրահ | կլինիկա | խանութ | գործակալություն | սրճարան | ավտոսերվիս | մարզասրահ}.
Problem (one sentence, Armenian): {…}
Riseup product that solves it: {AI ադմինիստրատոր | Պատվերներ | Գույք | Մարքեթինգ | Կայք}.
Structure: 0–2 s big hook with the problem; 2–10 s animated UI showing the product solving it
(reuse existing scenes); 10–13 s CTA "Գրեք ԴԵՄՈ". Write the Armenian subtitles yourself:
short, simple words, no jargon, max 6 words per line. Also give me the Instagram caption
(3 short lines + 5 Armenian/Russian hashtags).
```

**30 օրվա խնդիրների ցանկ (սկսելու համար).**

1. Սրահ. հաճախորդը գրել է կիրակի, պատասխան չի ստացել։
2. Կլինիկա. ադմինիստրատորը չի հասցնում պատասխանել զանգերին։
3. Խանութ. «Գինը դիրեկտում»-ից հետո հաճախորդը չի գրում։
4. Ատամնաբույժ. հիվանդը մոռացել է այցը։
5. Սրճարան. Google-ում աշխատանքային ժամերը սխալ են։
6. Գործակալություն. գնորդը զանգել է, մոռացել են հետ զանգել։
7. Խանութ. չափսը վերջացել է, բայց Instagram-ում դեռ վաճառվում է։
8. Բարբերշոփ. երեկոյան ժամերն են պահանջված, առավոտյանները՝ դատարկ։
9. Ռեստորան. մարդիկ հարցնում են մենյուն դիրեկտում։
10. Ավտոսերվիս. հաճախորդը չգիտի, թե երբ է մեքենան պատրաստ։
11. Մարզասրահ. փորձնական այցի հայտերը կորչում են։
12. Տորթերի խանութ. պատվերի մանրամասները խառնվում են։
13. Կոսմետոլոգ. նույն ծառայության գինը հարցնում են 50 անգամ։
14. Ծաղկի խանութ. առաքիչը չի գտնում հասցեն։
15. Սրահ. նոր վարպետը չգիտի գնացուցակը։
16. Կլինիկա. ռուսալեզու հաճախորդներին չեն պատասխանում։
17. Սրճարան. կարծիքներին ոչ ոք չի պատասխանում։
18. Խանութ. սեփականատերը չգիտի օրվա վաճառքը։
19. Գործակալություն. նոր բնակարանը հրապարակում են 3 տեղում ձեռքով։
20. Սրահ. հաճախորդը ուզում է տեղափոխել այցը, բայց չի կարողանում զանգել։
21. Կլինիկա. կայք չկա, մարդիկ չեն վստահում։
22. Ցանկացած բիզնես. Instagram-ում վերջին գրառումը 3 ամիս առաջ է։
23. Խանութ. նույն հաճախորդը գրում է WhatsApp-ում և Instagram-ում, պատասխանում են երկու անգամ։
24. Սրահ. չեղարկված ժամը մնում է դատարկ։
25. Ռեստորան. սեղանի ամրագրումը միայն զանգով է։
26. Գործակալություն. գործակալները չեն տեսնում, թե գույքն արդեն ամրագրվա՞ծ է։
27. Կլինիկա. հիվանդներին հետազոտության արդյունքի մասին ձեռքով են տեղեկացնում։
28. Խանութ. զեղչի մասին ոչ ոք չգիտի։
29. Սրահ. սեփականատերը արձակուրդում է, բայց ամբողջ օրը դիրեկտում է։
30. Ցանկացած բիզնես. «Մենք փոքր ենք, մեզ AI պետք չէ»։ Ցույց տվեք 60 000 ֏-ի օրինակը։

---

## 6. Գովազդ Meta-ում (Instagram + Facebook)

- **Նպատակ (Objective).** Engagement → Messages (Instagram Direct)։ Մարդիկ գրում են ձեզ, և դուք խոսում եք։
- **Տեղ.** Երևան + 10 կմ, հետո փորձեք Գյումրի և Վանաձոր։
- **Տարիք.** 23–55։
- **Հետաքրքրություններ.** Small business, Entrepreneurship, Beauty salon, Instagram business, Facebook Page admins։
- **Բյուջե.** սկսեք 2–3 հազար դրամով օրական, մեկ տեսանյութի համար։ 3–4 օրից հետո թողեք լավագույնը (ամենաշատ նամակներ բերողը), մնացածն անջատեք։
- **Մի ծախսեք** 50 000 ֏-ի մեծ մասը գովազդի վրա, քանի դեռ անվճար օրգանիկ տեսանյութերը ցույց չեն տվել, թե որ թեման է աշխատում։
- **Արագ պատասխան.** յուրաքանչյուր «ԴԵՄՈ» նամակին պատասխանեք 5 րոպեի ընթացքում։ Լավագույնը՝ ձեր սեփական Riseup AI ադմինիստրատորով, որ հենց դա լինի առաջին դեմոն։

**Գովազդի տեքստի ձևանմուշ.**

```
{Խնդիրը մեկ նախադասությամբ} 😩
Riseup-ը {լուծումը մեկ նախադասությամբ}։
✅ {օգուտ 1}
✅ {օգուտ 2}
Մեկնարկային գին՝ {գին} ֏-ից։ Գրեք «ԴԵՄՈ», և անվճար ցույց կտանք ձեր բիզնեսի օրինակով։
```

**Հեշթեգեր.** #yerevan #երևան #բիզնես #փոքրբիզնես #ереван #бизнесереван #салонкрасотыереван #smallbusinessarmenia #ai

---

## 7. Ինչ ֆայլեր են պետք Claude Code-ին

- `reels/assets/video/` — Higgsfield կադրերը (mp4, 9:16)
- `reels/assets/voice/` — ձայնագրությունները (mp3/wav, մեկ ֆայլ յուրաքանչյուր reel-ի համար)
- `reels/assets/music/` — լիցենզավորված կամ անվճար ֆոնային երաժշտություն

Ձայնագրելուց հետո ասեք Claude Code-ին. «Sync subtitles to reels/assets/voice/reel-1.mp3»։ Նա կհամապատասխանեցնի ենթագրերը ձայնին։
