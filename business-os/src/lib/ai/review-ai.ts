/*
 * Review intelligence (deterministic demo). Categorises reviews, scores sentiment and drafts a reply in the
 * review's language. Hard rules: no invented facts, no compensation promises, no guest personal data,
 * nothing is published without approval (and only where the platform has a reply API — see INTEGRATIONS).
 */
import type { HotelState, Lang, Review, ReviewPlatform } from "../types.ts";

export type Category = "cleanliness" | "staff" | "breakfast" | "location" | "noise" | "wifi" | "value" | "spa" | "temperature" | "response";
export const CATEGORY_LABEL: Record<Category, string> = { cleanliness: "Մաքրություն", staff: "Անձնակազմ", breakfast: "Նախաճաշ", location: "Գտնվելու վայր", noise: "Աղմուկ", wifi: "Wi‑Fi", value: "Գին/որակ", spa: "Սպա", temperature: "Ջերմաստիճան", response: "Արձագանքի արագություն" };
export const CATEGORY_DEPT: Record<Category, string> = { cleanliness: "Մաքրություն", staff: "Ընդունարան", breakfast: "Ռեստորան", location: "—", noise: "Տեխնիկական / Ընդունարան", wifi: "Տեխնիկական", value: "Ղեկավարություն", spa: "Սպա", temperature: "Տեխնիկական", response: "Ընդունարան" };

const CAT: [Category, RegExp][] = [
  ["cleanliness", /clean|spotless|dirty|чист|грязн|մաքուր|կեղտոտ/i],
  ["staff", /staff|reception|friendly|helpful|персонал|ресепшн|внимательн|անձնակազմ|բարեհամբույր|ուշադիր/i],
  ["breakfast", /breakfast|завтрак|նախաճաշ/i],
  ["location", /location|ropeway|close to|располож|рядом|գտնվելու վայր/i],
  ["noise", /noise|noisy|шум|աղմուկ/i],
  ["wifi", /wi-?fi|internet|интернет/i],
  ["value", /value|price|money|цен|деньги|գին/i],
  ["spa", /spa|massage|sauna|pool|спа|массаж|бассейн|սպա/i],
  ["temperature", /cold|heating|hot room|холодн|отоплен|սառն|ջեռուց/i],
  ["response", /slow|took .* hours|response|долго|ответ|ուշ/i],
];
const NEG = /slow|cold|noisy|noise|dirty|weak|could be better|disappoint|шумно|холодн|долго|грязн|медленн|могло быть|թույլ|սառն|աղմուկ|միօրինակ|կարող էր/i;

export function analyseReview(rv: Pick<Review, "text" | "rating">) {
  const categories = CAT.filter(([, re]) => re.test(rv.text)).map(([c]) => c);
  const negatives = categories.filter((c) => {
    const re = CAT.find(([k]) => k === c)![1];
    return rv.text.split(/[.!?։]/).some((sent) => re.test(sent) && NEG.test(sent));
  });
  const sentiment: "positive" | "mixed" | "negative" = rv.rating >= 4 && !negatives.length ? "positive" : rv.rating <= 2 ? "negative" : "mixed";
  return { categories, negatives, sentiment };
}

/** Platforms whose official API lets an approved partner post a reply (still requires approval/partner status). */
export const REPLY_API: Record<ReviewPlatform, boolean> = { google: true, booking: true, tripadvisor: false, expedia: false };
export const PLATFORM_LABEL: Record<ReviewPlatform, string> = { google: "Google", booking: "Booking.com", tripadvisor: "Tripadvisor", expedia: "Expedia" };
/** Booking.com shows scores out of 10; the model stores 1–5. */
export const platformScore = (p: ReviewPlatform, r: number) => (p === "booking" ? `${(r * 2).toFixed(0)}/10` : `${r}/5`);

const T: Record<Lang, { thanks: (n: string) => string; pos: string; neg: (c: string) => string; fix: string; close: string }> = {
  en: { thanks: (n) => `Dear ${n}, thank you for taking the time to share your feedback.`, pos: "We are delighted you enjoyed your stay and we will pass your kind words on to the team.", neg: (c) => `We are sorry that ${c} did not meet your expectations. We have shared your comments with the responsible team so we can review what happened.`, fix: "", close: "We hope to welcome you back to Pine Ridge." },
  ru: { thanks: (n) => `Уважаемый(ая) ${n}, спасибо, что поделились впечатлениями.`, pos: "Мы рады, что вам понравилось, и обязательно передадим ваши слова команде.", neg: (c) => `Нам жаль, что ${c} не оправдал(и) ваших ожиданий. Мы передали ваш отзыв ответственной команде, чтобы разобраться в ситуации.`, fix: "", close: "Будем рады видеть вас снова в Pine Ridge." },
  hy: { thanks: (n) => `Հարգելի ${n}, շնորհակալություն Ձեր կարծիքի համար։`, pos: "Ուրախ ենք, որ Ձեզ դուր է եկել, և անպայման կփոխանցենք Ձեր խոսքերը թիմին։", neg: (c) => `Ցավում ենք, որ ${c} չի համապատասխանել Ձեր սպասելիքներին։ Ձեր կարծիքը փոխանցել ենք պատասխանատու թիմին՝ իրավիճակը վերլուծելու համար։`, fix: "", close: "Սպասում ենք Ձեզ կրկին Pine Ridge-ում։" },
};
const CAT_WORD: Record<Lang, Partial<Record<Category, string>>> = {
  en: { cleanliness: "the cleanliness", noise: "the noise level", wifi: "the Wi‑Fi", breakfast: "breakfast", temperature: "the room temperature", response: "our response time", value: "the value", staff: "our service" },
  ru: { cleanliness: "чистота", noise: "уровень шума", wifi: "Wi‑Fi", breakfast: "завтрак", temperature: "температура в номере", response: "скорость реакции", value: "соотношение цены и качества", staff: "сервис" },
  hy: { cleanliness: "մաքրությունը", noise: "աղմուկը", wifi: "Wi‑Fi-ը", breakfast: "նախաճաշը", temperature: "սենյակի ջերմաստիճանը", response: "մեր արձագանքի արագությունը", value: "գին/որակ հարաբերակցությունը", staff: "սպասարկումը" },
};

/** First name only (or initial) — never repeat surnames, booking codes or other personal data. */
const safeName = (author: string) => author.split(" ")[0].replace(/[^\p{L}-]/gu, "") || "guest";

export function draftReviewReply(_state: HotelState, rv: Review) {
  const a = analyseReview(rv);
  const t = T[rv.lang];
  const neg = a.negatives.map((c) => CAT_WORD[rv.lang][c]).filter(Boolean) as string[];
  const parts = [t.thanks(safeName(rv.author))];
  if (a.sentiment === "positive" || (rv.rating >= 4 && !neg.length)) parts.push(t.pos);
  if (neg.length) parts.push(t.neg(neg.slice(0, 2).join(rv.lang === "en" ? " and " : rv.lang === "ru" ? " и " : " և ")));
  parts.push(t.close);
  return { text: parts.join(" "), analysis: a, rules: ["Առանց փոխհատուցման խոստումների", "Առանց անձնական տվյալների", "Միայն հաստատումից հետո"] };
}

/** Guard used before approval: flags compensation promises / personal data in an edited reply. */
export function replyIssues(text: string) {
  const issues: string[] = [];
  if (/refund|compensat|free night|discount|voucher|возмещ|компенсац|бесплатн|скидк|փոխհատուց|զեղչ|անվճար գիշեր/i.test(text)) issues.push("Պատասխանը խոստանում է փոխհատուցում/զեղչ․ պահանջվում է ղեկավարի որոշում");
  if (/\+?\d[\d\s-]{7,}|@\w+\.\w+|PR-\d+|BDC-\d+/i.test(text)) issues.push("Պատասխանում կա հեռախոս, էլ․ փոստ կամ ամրագրման կոդ");
  return issues;
}
