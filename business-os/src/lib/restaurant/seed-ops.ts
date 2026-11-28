/* Deterministic demo seed for the operations modules: customers & loyalty, reservations, waitlist, inbox, reviews, team. Fictional. */
import { addDays, atTime } from "../dates.ts";
import { analyzeReview, detectLang, draftReply } from "./nlp.ts";
import type { Conversation, Customer, InboxChannel, RestaurantState, Review, ReviewPlatform } from "./types.ts";

export function seedOps(s: RestaurantState, E: number, r: () => number) {
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const day = (d: number, t: string) => atTime(addDays(s.baseDate, d), t);

  s.loyalty = { enabled: true, earnPer1000: 10, tiers: [{ id: "member", name: "Անդամ", min: 0 }, { id: "silver", name: "Արծաթ", min: 1500 }, { id: "gold", name: "Ոսկի", min: 4000 }], ledger: [] };

  /* customers (≈ 60), built from fictional names; phones use the fictional +374 00 range */
  const first = ["Աննա", "Արամ", "Լիլիթ", "Գևորգ", "Մարիամ", "Դավիթ", "Նարե", "Տիգրան", "Սոնա", "Հայկ", "Ольга", "Иван", "Мария", "Сергей", "James", "Emma", "Liam", "Sofia", "Karen", "Ani"];
  const last = ["Մ.", "Հ.", "Պ.", "Ս.", "Գ.", "Վ.", "К.", "С.", "B.", "W."];
  const food = s.items.filter((i) => i.categoryId !== "drinks").map((i) => i.id);
  for (let i = 0; i < 60; i++) {
    const name = `${pick(first)} ${pick(last)}`;
    const visits = 1 + Math.floor(r() ** 2 * 14);
    const spend = visits * (14000 + Math.floor(r() * 18000));
    const lastDays = Math.floor(r() * 75);
    const c: Customer = {
      id: `cu-seed-${i}`, name, phone: `+374 00 ${String(100 + i).padStart(3, "0")} ${String(10 + Math.floor(r() * 89))}`, lang: detectLang(name),
      firstSeen: day(-120 - Math.floor(r() * 200), "13:00"), lastVisit: day(-lastDays, "20:00"), visits, spend, orders: visits,
      favourites: [pick(food), pick(food)].filter((x, j, a) => a.indexOf(x) === j), tags: visits >= 8 ? ["Կանոնավոր"] : lastDays > 45 ? ["Վաղուց չի եկել"] : [],
      consent: { marketing: r() < 0.62, at: day(-100, "12:00"), source: "website" }, points: Math.floor(spend / 1000) * 10, tier: "member",
      dietary: r() < 0.08 ? pick(["Առանց գլյուտենի", "Բուսակեր", "Ընկույզի ալերգիա"]) : undefined,
    };
    c.tier = c.points >= 4000 ? "gold" : c.points >= 1500 ? "silver" : "member";
    s.customers.push(c);
    s.loyalty.ledger.push({ key: `seed:${c.id}`, customerId: c.id, points: c.points, at: c.lastVisit!, reason: "Նախորդ այցեր (ցուցադրական)" });
  }
  const vip = s.customers[3]; vip.tags.push("VIP"); vip.name = "James C."; vip.lang = "en"; vip.dietary = "Ընկույզի ալերգիա";
  const anna = s.customers[0]; anna.name = "Աննա Մ."; anna.lang = "hy";

  /* reservations tonight (confirmed) + website requests waiting for the host + tomorrow */
  const res = (code: number, name: string, phone: string, party: number, at: number, tableIds: string[], status: "confirmed" | "requested", extra: Partial<RestaurantState["reservations"][number]> = {}) => {
    s.reservations.push({ id: `rv-${code}`, code: `R-${String(code).padStart(4, "0")}`, name, phone, partySize: party, at, durationMin: party <= 2 ? 75 : party <= 4 ? 95 : 120, tableIds, status, source: "website", history: [{ at: E - 3 * 864e5, text: "Հարցումը ստացվեց", by: "Կայք" }, ...(status === "confirmed" ? [{ at: E - 2 * 864e5, text: "Հաստատվեց", by: "Էլեն Սահակյան" }] : [])], ...extra });
  };
  res(301, anna.name, anna.phone, 4, E + 25 * 60000, ["T3"], "confirmed", { occasion: "Ամուսնության տարեդարձ", customerId: anna.id });
  res(302, vip.name, vip.phone, 2, E + 40 * 60000, ["T15"], "confirmed", { allergies: "Ընկույզ", vip: true, customerId: vip.id, source: "phone" });
  res(303, "Ольга С.", "+374 00 303 11", 4, E + 55 * 60000, ["T6"], "confirmed", { source: "inbox" });
  res(304, "Սամվել Գ.", "+374 00 304 12", 2, E + 75 * 60000, ["L2"], "confirmed");
  res(305, "Emma W.", "+374 00 305 13", 6, E + 95 * 60000, [], "requested", { occasion: "Birthday", note: "Window table if possible" });
  res(306, "Կարեն Վ.", "+374 00 306 14", 9, E + 120 * 60000, [], "requested", { note: "Ընկերական ընթրիք" });
  res(307, "Мария К.", "+374 00 307 15", 3, E + 864e5 + 2 * 3600000, ["L5"], "confirmed");
  s.seq.res = 307;
  s.waitlist.push({ id: "wl-1", name: "Լևոն Ա.", phone: "+374 00 401 20", partySize: 3, addedAt: E - 6 * 60000, quotedMin: 15, status: "waiting" });

  /* reviews (≈ 36 over 60 days) */
  const R: [ReviewPlatform, number, string][] = [
    ["google", 5, "Amazing khorovats and a cozy fireplace lounge. Friendly, attentive staff."],
    ["google", 4, "Delicious food and beautiful atmosphere, but a bit expensive."],
    ["google", 2, "We waited almost 40 minutes for the steak and it arrived cold. Disappointing on a Saturday."],
    ["tripadvisor", 5, "Отличная кухня, свежие салаты и уютная атмосфера у камина. Обслуживание внимательное."],
    ["tripadvisor", 3, "Вкусно, но долго ждали заказ и было шумно в главном зале."],
    ["google", 5, "Շատ համեղ խորոված և հիանալի մթնոլորտ։ Սպասարկումը լավն էր։"],
    ["google", 3, "Համեղ էր, բայց երկար սպասեցինք ուտեստներին։"],
    ["thefork", 4, "Great value for the quality. The trout bowl was fresh and tasty."],
    ["google", 1, "Rude waiter and the burger was overcooked. Will not come back."],
    ["tripadvisor", 4, "Lovely view and cozy interior. Food was good, service a little slow."],
    ["google", 5, "Вкусно и уютно, особенно хоровац и лаваш из тонира!"],
    ["thefork", 2, "Дорого для такого размера порций, и холодные блюда."],
  ];
  const authors = ["Anna", "Mark", "Елена", "Գոհար", "Tom", "Ирина", "Արմեն", "Kate", "Сергей", "Նարինե", "Paul", "Lena"];
  for (let i = 0; i < 36; i++) {
    const [platform, base, text] = R[i % R.length];
    const rating = Math.max(1, Math.min(5, base + (i >= R.length && r() < 0.3 ? (r() < 0.5 ? 1 : -1) : 0)));
    const at = day(-Math.floor((i / 36) * 58) - 1, `${12 + Math.floor(r() * 10)}:${String(Math.floor(r() * 59)).padStart(2, "0")}`);
    const rev: Review = { id: `rv-r-seed-${i}`, platform, rating, text, lang: detectLang(text), author: `${authors[i % authors.length]} ${String.fromCharCode(65 + (i % 20))}.`, at, categories: analyzeReview(text) };
    if (i > 5 && r() < 0.6) rev.reply = { text: "(Նախկինում պատասխանված)", status: platform === "google" ? "published_simulated" : "manual_required", by: "Լուսինե Հակոբյան", at: at + 864e5 };
    s.reviews.push(rev);
  }
  s.reviews.sort((a, b) => b.at - a.at);

  /* inbox (simulated channels + website chat) */
  const conv = (id: string, channel: InboxChannel, name: string, handle: string, msgs: [string, number][], extra: Partial<Conversation> = {}) => {
    const c: Conversation = { id, channel, customer: { name, handle }, lang: detectLang(msgs[0][0]), status: "new", priority: "normal", tags: [], messages: msgs.map(([text, ago], i) => ({ id: `${id}-m${i}`, dir: "in" as const, text, at: E - ago * 60000, author: name, state: "received" as const })), unread: msgs.length, firstInAt: E - msgs[0][1] * 60000, ...extra };
    c.draft = draftReply(s, c, E);
    if (["allergy", "complaint", "manager", "price_discount"].includes(c.draft.intent)) c.priority = "high";
    c.tags = c.draft.intent === "other" ? [] : [c.draft.intent];
    s.inbox.push(c);
  };
  conv("cv-wa-1", "whatsapp", "Լիլիթ Ա.", "+374 00 512 34", [["Բարև, մինչև ժամը քանիսն եք բաց այսօր։", 12]]);
  conv("cv-ig-1", "instagram", "mila.travels", "@mila.travels", [["Hi! Can we book a table for 6 tomorrow at 8pm? It's a birthday 🎉", 26]]);
  conv("cv-wa-2", "whatsapp", "Сергей П.", "+374 00 513 77", [["Здравствуйте! В хороваце есть орехи? У ребёнка аллергия на орехи.", 9]]);
  conv("cv-fb-1", "messenger", "David K.", "fb:david.k", [["Ordered takeaway S-1258 an hour ago, the khorovats was cold when I got home. Not happy.", 48]]);
  conv("cv-mail-1", "email", "events@example.com", "events@example.com", [["Hello, we would like to organise a private dinner for 14 people next Friday. Do you have a set menu and what is the deposit?", 180]], { status: "open", assigneeId: "s-lusine" });
  conv("cv-web-1", "webchat", "Հյուր (կայք)", "web:visitor-7", [["Ունե՞ք բուսակերային ուտեստներ։", 4]]);
  const done = s.inbox.find((c) => c.id === "cv-mail-1")!;
  done.messages.push({ id: "cv-mail-1-n", dir: "note", text: "Ստուգել P1-ի հասանելիությունը ուրբաթ երեկոյան", at: E - 150 * 60000, author: "Լուսինե Հակոբյան" });
  s.inboxSettings = { autoReplyIntents: ["hours"] };

  /* team: shifts today, tasks, messages, SOPs */
  const today = s.baseDate;
  const sh = (staffId: string, start: string, end: string, section?: string) => s.shifts.push({ id: `sh-${staffId}`, staffId, day: today, start, end, section });
  sh("s-lusine", "14:00", "23:30"); sh("s-elen", "16:00", "23:00", "Մուտք"); sh("s-ani", "16:00", "23:30", "Սրահ 1–8"); sh("s-davit", "16:00", "23:30", "Սրահ 9–16, բար"); sh("s-mariam", "17:00", "00:00", "Բուխարու սրահ, P1");
  sh("s-gor", "14:00", "23:00"); sh("s-hayk", "16:00", "23:30", "Մանղալ"); sh("s-narine", "15:00", "23:00", "Տաք"); sh("s-sona", "15:00", "23:00", "Սառը"); sh("s-tigran", "17:00", "00:30", "Բար"); sh("s-ruzan", "16:00", "00:00", "Դրամարկղ"); sh("s-vahe", "09:00", "17:00", "Պահեստ");
  s.tasks.push(
    { id: "tk-seed-1", title: "Ստուգել սառնարանների ջերմաստիճանը և գրանցել", role: "chef", priority: "normal", status: "open", createdAt: E - 120 * 60000, due: E + 60 * 60000, source: "manual" },
    { id: "tk-seed-2", title: "Պատրաստել P1-ը 10 հոգու ընթրիքի համար", assigneeId: "s-mariam", priority: "high", status: "done", createdAt: E - 180 * 60000, doneAt: E - 40 * 60000, source: "manual" },
    { id: "tk-seed-3", title: "Թարմացնել բարի ալկոհոլի գույքագրումը", assigneeId: "s-tigran", priority: "normal", status: "open", createdAt: E - 300 * 60000, due: E - 30 * 60000, source: "manual" },
    { id: "tk-seed-4", title: "Պատասխանել 2★ կարծիքին Google-ում", role: "manager", priority: "high", status: "open", createdAt: E - 864e5, source: "automation" },
  );
  s.teamMsgs.push(
    { id: "tm-1", channel: "kitchen", at: E - 50 * 60000, by: "s-gor", text: "Սաղմոնը քիչ է մնացել. մատուցողներ՝ առաջարկեք իշխանը։" },
    { id: "tm-2", channel: "floor", at: E - 35 * 60000, by: "s-lusine", text: "P1՝ 10 հոգի, ընկերական ընթրիք. Մարիամ՝ պատասխանատու։", urgent: false },
    { id: "tm-3", channel: "all", at: E - 200 * 60000, by: "s-owner", text: "Շնորհակալություն բոլորին երեկվա երեկոյի համար. 4.8★ կարծիքներ։" },
  );
  s.sops = [
    { id: "sop-allergy", title: "Ալերգիա ունեցող հյուր", roles: ["waiter", "host", "chef", "cook", "manager"], tags: ["ալերգիա", "allergy", "аллерг", "ընկույզ", "գլյուտեն"], steps: ["Գրանցեք ալերգիան սեղանի «Ալերգիաներ» դաշտում. այն կերևա յուրաքանչյուր խոհանոցային տոմսի վրա։", "Երբեք մի ասեք «անվտանգ է», եթե ալերգենը հաստատված չէ մենյուում. ստուգեք շեֆի հետ։", "Պատվերի մեջ ավելացրեք նշում և զգուշացրեք խոհանոցին։", "Ուտեստը մատուցեք առանձին, անվանելով այն։"] },
    { id: "sop-order", title: "Պատվեր առանց թղթի", roles: ["waiter"], tags: ["պատվեր", "order", "заказ", "կուրս"], steps: ["Բացեք սեղանը, նշեք հյուրերի քանակը։", "Ավելացրեք ուտեստները, ընտրեք տեղը և կուրսը։", "Ուղարկեք. խմիչքներն ու առաջին կուրսը գնում են անմիջապես, հաջորդները՝ «պահված» են մինչև «Ուղարկել կուրսը»։", "Սպասեք «Պատրաստ է» ծանուցմանը և նշեք «Մատուցված»։"] },
    { id: "sop-bill", title: "Հաշիվ և վճարում", roles: ["waiter", "cashier", "manager"], tags: ["հաշիվ", "bill", "счёт", "վճարում", "split"], steps: ["Պատրաստեք հաշիվը՝ ամբողջական, ըստ տեղերի կամ հավասար մասերով։", "Քարտով վճարումը հաստատվում է միայն տերմինալի պատասխանով։", "Կանխիկը գրանցում է գանձապահը. ֆիսկալ կտրոնը տրվում է դրամարկղից։", "Բոլոր մասերը վճարված լինելուց հետո փակեք սեղանը։"] },
    { id: "sop-complaint", title: "Հյուրի բողոք", roles: ["waiter", "host", "manager"], tags: ["բողոք", "complaint", "жалоба", "սառն"], steps: ["Լսեք և ներողություն խնդրեք առանց արդարանալու։", "Առաջարկեք վերապատրաստել ուտեստը (Վերապատրաստել՝ պատճառով)։", "Տեղեկացրեք մենեջերին. փոխհատուցման որոշումը մենեջերինն է։"] },
    { id: "sop-close", title: "Հերթափոխի ավարտ", roles: ["manager", "waiter", "chef"], tags: ["հերթափոխ", "shift", "смена", "փակում"], steps: ["Ստեղծեք հերթափոխի փոխանցում (համակարգը կլրացնի բաց սեղաններն ու խնդիրները)։", "Գրանցեք կորուստները։", "Մենեջերը փակում է օրը՝ «Օրվա ամփոփում»։"] },
  ];
}
