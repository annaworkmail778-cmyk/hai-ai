/*
 * Deterministic language / intent / reply-drafting engine for the inbox, guest chat and reviews.
 * Grounded only in Restaurant OS data. It NEVER asserts allergen safety, availability, discounts,
 * refunds, compensation or payments: those intents are marked "escalate" or "approval".
 * The interface (detect → classify → draft with facts + risk) is the seam for an LLM adapter later
 * (see docs/RESTAURANT_OS_AI_ARCHITECTURE.md).
 */
import type { Conversation, Lang, RestaurantState, Review } from "./types.ts";

export function detectLang(text: string): Lang {
  if (/[Ա-֏]/.test(text)) return "hy";
  if (/[Ѐ-ӿ]/.test(text)) return "ru";
  return "en";
}

export type Intent = "hours" | "menu" | "allergy" | "reservation" | "reservation_change" | "order_status" | "complaint" | "manager" | "delivery" | "price_discount" | "thanks" | "other";

const K: Record<Exclude<Intent, "other">, RegExp> = {
  allergy: /allerg|gluten|nut|lactose|vegan|celiac|аллерг|глютен|орех|лактоз|веган|ալերգ|գլյուտեն|ընկույզ|կաթնամթերք/i,
  complaint: /cold|late|rude|bad|terrible|disappoint|wrong|hair|sick|холодн|опозд|грубо|плох|ужас|разочар|не то|վատ|սառն|ուշ|կոպիտ|դժգոհ|սխալ/i,
  manager: /manager|owner|director|менеджер|управляющ|владел|մենեջեր|տնօրեն|ղեկավար/i,
  reservation_change: /(change|move|cancel|reschedul).{0,30}(reserv|book|table)|(перен|отмен|измен).{0,30}(брон|стол)|(փոխել|չեղարկել).{0,30}(ամրագր|սեղան)/i,
  reservation: /reserv|book a table|table for|table tonight|забронир|бронь|столик|стол на|ամրագր|սեղան/i,
  order_status: /order|where is my|status|заказ|где мой|պատվեր/i,
  delivery: /deliver|доставк|առաքում/i,
  price_discount: /discount|refund|compens|voucher|free|скидк|возврат|компенс|бесплатн|զեղչ|փոխհատուց|վերադարձ/i,
  hours: /open|close|hours|when.*(open|close)|работаете|часы|открыт|до скольки|ժամ|բաց եք|աշխատում/i,
  menu: /menu|dish|vegetarian|price|меню|блюд|цена|մենյու|ուտեստ|գին/i,
  thanks: /thank|great|delicious|спасибо|отлично|вкусно|շնորհակալ|համեղ|հիանալի/i,
};
const ORDER: Exclude<Intent, "other">[] = ["allergy", "complaint", "manager", "reservation_change", "price_discount", "order_status", "reservation", "delivery", "hours", "menu", "thanks"];

export function intentOf(text: string): Intent {
  for (const i of ORDER) if (K[i].test(text)) return i;
  return "other";
}

/** Low risk = factual answer from configured data; approval = staff must approve; escalate = human must handle. */
export const INTENT_RISK: Record<Intent, "low" | "approval" | "escalate"> = {
  hours: "low", menu: "low", thanks: "low", reservation: "approval", reservation_change: "approval", order_status: "approval",
  delivery: "approval", other: "approval", allergy: "escalate", complaint: "escalate", manager: "escalate", price_discount: "escalate",
};

const T = (l: Lang, hy: string, ru: string, en: string) => ({ hy, ru, en })[l];

export function hoursText(s: RestaurantState, l: Lang) {
  return s.brand.hours.map((h) => `${h.days[l]} ${h.open}–${h.close}`).join(", ");
}

export function draftReply(s: RestaurantState, c: Conversation, now: number): { text: string; intent: Intent; risk: "low" | "approval" | "escalate"; facts: string[] } {
  const last = [...c.messages].reverse().find((m) => m.dir === "in");
  const text = last?.text ?? "";
  const l = c.lang;
  const intent = intentOf(text);
  const risk = INTENT_RISK[intent];
  const name = c.customer.name.split(" ")[0];
  const hi = T(l, `Բարև Ձեզ, ${name}։`, `Здравствуйте, ${name}!`, `Hello ${name},`);
  const facts: string[] = [];
  let body = "";
  switch (intent) {
    case "hours":
      facts.push(`Աշխատանքային ժամեր՝ ${hoursText(s, "hy")}`);
      body = T(l, `Մենք աշխատում ենք՝ ${hoursText(s, l)}։ Սպասում ենք Ձեզ։`, `Мы работаем: ${hoursText(s, l)}. Будем рады вас видеть!`, `We are open ${hoursText(s, l)}. We look forward to seeing you!`);
      break;
    case "menu": {
      const avail = s.items.filter((i) => i.available).length;
      facts.push(`Մենյու՝ ${avail} հասանելի ուտեստ, հղում կայքին`);
      body = T(l, `Մեր մենյուն՝ լուսանկարներով և գներով, այստեղ է՝ /restaurant/hy/menu։ Եթե հարց ունեք որոշակի ուտեստի մասին, գրեք մեզ։`, `Наше меню с фото и ценами: /restaurant/ru/menu. Если есть вопрос по конкретному блюду — напишите нам.`, `Here is our menu with photos and prices: /restaurant/en/menu. If you have a question about a specific dish, just ask.`);
      break;
    }
    case "reservation":
      facts.push("Ամրագրումը կհաստատի հյուրընկալողը. ազատ սեղանների ստուգումը՝ համակարգում");
      body = T(l, `Ուրախ կլինենք Ձեզ հյուրընկալել։ Խնդրում ենք նշել ամսաթիվը, ժամը և հյուրերի քանակը. մենք կստուգենք ազատ սեղանները և կհաստատենք։ Կարող եք նաև ամրագրել կայքում՝ /restaurant/hy/reserve։`, `Будем рады вас видеть! Напишите, пожалуйста, дату, время и количество гостей — мы проверим свободные столы и подтвердим. Также можно забронировать на сайте: /restaurant/ru/reserve.`, `We'd love to host you! Please tell us the date, time and number of guests — we'll check availability and confirm. You can also book on our website: /restaurant/en/reserve.`);
      break;
    case "reservation_change":
      facts.push("Ամրագրման փոփոխությունը կատարում է աշխատակիցը");
      body = T(l, `Իհարկե։ Խնդրում ենք գրել ամրագրման անունը կամ կոդը և նոր ժամը. աշխատակիցը կստուգի և կհաստատի։`, `Конечно. Напишите, пожалуйста, имя или код брони и новое время — сотрудник проверит и подтвердит.`, `Of course. Please share the name or code of the reservation and the new time — a team member will check and confirm.`);
      break;
    case "order_status": {
      const code = /S-\d{4}/i.exec(text)?.[0]?.toUpperCase();
      const o = code ? s.orders.find((x) => x.code === code) : undefined;
      if (o) {
        const st = { submitted: ["սպասում է ընդունման", "ожидает подтверждения", "waiting to be accepted"], accepted: ["ընդունված է", "принят", "accepted"], preparing: ["պատրաստվում է", "готовится", "being prepared"], ready: ["պատրաստ է", "готов", "ready"], served: ["մատուցված է", "подан", "served"], picked_up: ["վերցված է", "получен", "picked up"], completed: ["ավարտված է", "завершён", "completed"], rejected: ["չի ընդունվել", "не принят", "not accepted"], cancelled: ["չեղարկված է", "отменён", "cancelled"] }[o.status];
        facts.push(`Պատվեր ${o.code}՝ կարգավիճակ «${st[0]}» (համակարգից)`);
        body = T(l, `Ձեր պատվեր ${o.code}-ի կարգավիճակը՝ ${st[0]}։`, `Статус вашего заказа ${o.code}: ${st[1]}.`, `Your order ${o.code} is currently ${st[2]}.`);
      } else body = T(l, `Խնդրում ենք նշել պատվերի համարը (օր.՝ S-1234), և մենք կստուգենք։`, `Пожалуйста, укажите номер заказа (например, S-1234) — мы проверим.`, `Please share your order number (e.g. S-1234) and we'll check.`);
      break;
    }
    case "allergy":
      facts.push("Ալերգիայի հարց. պատասխանում է միայն աշխատակիցը՝ հաստատված տվյալներով");
      body = T(l, `Շնորհակալություն, որ նախապես տեղեկացրիք։ Ալերգիայի հարցերով մեր աշխատակիցը կպատասխանի Ձեզ անձամբ՝ ստուգելով բաղադրությունը խոհանոցի հետ։`, `Спасибо, что предупредили. По вопросам аллергии вам лично ответит наш сотрудник, сверив состав с кухней.`, `Thank you for letting us know. A team member will answer your allergy question personally after checking the ingredients with the kitchen.`);
      break;
    case "complaint":
    case "manager":
      facts.push("Բողոք / մենեջերի խնդրանք. փոխանցվում է մենեջերին");
      body = T(l, `Ներողություն ենք խնդրում անհարմարության համար։ Ձեր հաղորդագրությունը փոխանցել ենք մենեջերին, որը շուտով կկապվի Ձեզ հետ։`, `Приносим извинения за неудобства. Мы передали ваше сообщение менеджеру, он скоро с вами свяжется.`, `We're sorry for the inconvenience. We've passed your message to the manager, who will contact you shortly.`);
      break;
    case "price_discount":
      facts.push("Զեղչ / փոխհատուցում. միայն մենեջերի որոշմամբ");
      body = T(l, `Շնորհակալություն հաղորդագրության համար։ Այս հարցով կպատասխանի մեր մենեջերը։`, `Спасибо за сообщение. По этому вопросу вам ответит наш менеджер.`, `Thank you for your message. Our manager will get back to you on this.`);
      break;
    case "delivery":
      facts.push(s.settings.delivery.enabled ? "Առաքումը միացված է" : "Առաքումը միացված չէ, տանելու պատվերը՝ միացված");
      body = s.settings.delivery.enabled ? T(l, "Այո, առաքում ունենք։", "Да, у нас есть доставка.", "Yes, we deliver.") : T(l, `Այս պահին առաքում չունենք, բայց կարող եք պատվիրել տանելու համար՝ /restaurant/hy/menu?mode=takeaway։`, `Сейчас доставки нет, но можно заказать с собой: /restaurant/ru/menu?mode=takeaway.`, `We don't deliver at the moment, but you can order takeaway: /restaurant/en/menu?mode=takeaway.`);
      break;
    case "thanks":
      body = T(l, `Շատ շնորհակալություն ջերմ խոսքերի համար։`, `Большое спасибо за тёплые слова!`, `Thank you so much for the kind words!`);
      break;
    default:
      body = T(l, `Շնորհակալություն հաղորդագրության համար։ Մեր աշխատակիցը շուտով կպատասխանի։`, `Спасибо за сообщение! Наш сотрудник скоро ответит.`, `Thank you for your message! A team member will reply shortly.`);
  }
  void now;
  return { text: `${hi} ${body}`, intent, risk, facts };
}

/* ---------------- reviews ---------------- */

const CAT: Record<keyof Review["categories"], { pos: RegExp; neg: RegExp }> = {
  food: { pos: /delicious|tasty|great food|fresh|amazing|вкусн|свеж|отличн.{0,10}(кухн|блюд)|համեղ|թարմ/i, neg: /\bcold\b|bland|overcooked|undercooked|salty|tasteless|холодн|пересол|невкусн|сыр(ое|ой)|անհամ|սառն|աղի/i },
  service: { pos: /friendly|attentive|great service|helpful|вежлив|внимательн|обслуживание.{0,10}(отлич|хорош)|սպասարկումը.{0,10}(լավ|հիանալի)|բարեհամբույր/i, neg: /rude|ignored|slow service|unfriendly|грубо|невнимательн|обслуживание.{0,10}(плох|медлен)|կոպիտ|անուշադիր/i },
  price: { pos: /good value|reasonable|worth|недорог|адекватн.{0,10}цен|արժե|մատչելի/i, neg: /expensive|overpriced|pricey|дорого|завышен|թանկ/i },
  ambience: { pos: /cozy|atmosphere|beautiful|view|fireplace|уютн|атмосфер|камин|вид|հարմարավետ|մթնոլորտ|բուխար|տեսարան/i, neg: /noisy|loud|cramped|dirty|шумно|тесно|грязно|աղմկոտ|կեղտոտ/i },
  wait: { pos: /quick|fast|on time|быстро|արագ/i, neg: /waited|long wait|slow|took forever|ждали|долго|ուշ|երկար սպասեցինք/i },
};

export function analyzeReview(text: string): Review["categories"] {
  const out: Review["categories"] = {};
  for (const k of Object.keys(CAT) as (keyof Review["categories"])[]) {
    if (CAT[k].neg.test(text)) out[k] = -1;
    else if (CAT[k].pos.test(text)) out[k] = 1;
  }
  return out;
}

/** Review reply in the review's language, referring only to what the guest mentioned; no promises, no personal data. */
export function draftReviewReply(s: Review, brand: string): string {
  const l = s.lang;
  const c = s.categories;
  const neg = Object.entries(c).filter(([, v]) => v === -1).map(([k]) => k);
  const pos = Object.entries(c).filter(([, v]) => v === 1).map(([k]) => k);
  const name = { hy: { food: "ուտեստների", service: "սպասարկման", price: "գների", ambience: "մթնոլորտի", wait: "սպասման ժամանակի" }, ru: { food: "блюдах", service: "обслуживании", price: "ценах", ambience: "атмосфере", wait: "времени ожидания" }, en: { food: "the food", service: "the service", price: "our prices", ambience: "the atmosphere", wait: "the waiting time" } }[l] as Record<string, string>;
  const list = (xs: string[]) => xs.map((x) => name[x]).join(l === "en" ? " and " : l === "ru" ? " и " : " և ");
  if (s.rating >= 4) {
    return T(l,
      `Շնորհակալություն ջերմ կարծիքի համար${pos.length ? ` և ${list(pos)} մասին բարի խոսքերի համար` : ""}։ Ուրախ ենք, որ Ձեզ դուր եկավ, և սպասում ենք Ձեզ կրկին ${brand}-ում։`,
      `Спасибо за тёплый отзыв${pos.length ? ` и добрые слова о ${list(pos)}` : ""}! Рады, что вам понравилось, ждём вас снова в ${brand}.`,
      `Thank you for the lovely review${pos.length ? ` and the kind words about ${list(pos)}` : ""}. We're glad you enjoyed your visit and hope to welcome you back to ${brand} soon.`);
  }
  return T(l,
    `Շնորհակալություն, որ կիսվեցիք Ձեր կարծիքով։ Ցավում ենք, որ ${neg.length ? `${list(neg)} հարցում` : "այցելությունը"} չարդարացրեց Ձեր սպասելիքները։ Մենք քննարկել ենք սա մեր թիմի հետ։ Եթե ցանկանաք պատմել մանրամասներ, խնդրում ենք կապվել մեզ հետ ուղղակիորեն։`,
    `Спасибо, что поделились мнением. Нам жаль, что ${neg.length ? `впечатление о ${list(neg)}` : "визит"} не оправдал ваших ожиданий. Мы обсудили это с командой. Если захотите рассказать подробнее, пожалуйста, свяжитесь с нами напрямую.`,
    `Thank you for sharing your feedback. We're sorry that ${neg.length ? list(neg) : "your visit"} did not meet your expectations. We have discussed this with our team. If you'd like to share more details, please contact us directly.`);
}
