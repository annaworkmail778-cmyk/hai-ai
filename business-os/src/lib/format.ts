import type { Lang, Priority, ResStatus, Source } from "./types.ts";

export const amd = (n: number) => `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} ֏`;
export const amdShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2).replace(/\.0+$/, "")} մլն ֏`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)} հզ. ֏`;
  return amd(n);
};
export const pct = (x: number, d = 0) => `${(x * 100).toFixed(d)}%`;

const HY_MONTHS = ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"];
const HY_MON = ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"];
export const HY_WD = ["Կիր", "Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ"];

export const dHy = (d: string) => `${Number(d.slice(8, 10))} ${HY_MONTHS[Number(d.slice(5, 7)) - 1]}`;
export const dShort = (d: string) => `${Number(d.slice(8, 10))} ${HY_MON[Number(d.slice(5, 7)) - 1]}`;
export const dNum = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;

export function dLang(d: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (lang === "hy") return dShort(d);
  return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", { ...opts, timeZone: "UTC" }).format(new Date(d + "T00:00:00Z"));
}

export const time = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(ms);
export const dayOf = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);

export function ago(ms: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - ms) / 60000));
  if (m < 1) return "հենց հիմա";
  if (m < 60) return `${m} րոպե առաջ`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ժամ առաջ`;
  return `${Math.round(h / 24)} օր առաջ`;
}

export function stamp(ms: number, today: string) {
  const d = dayOf(ms);
  if (d === today) return `այսօր, ${time(ms)}`;
  return `${dShort(d)}, ${time(ms)}`;
}

export const SOURCE_LABEL: Record<Source, string> = {
  website: "Կայք", assistant: "AI օգնական", phone: "Հեռախոս", booking: "Booking.com", airbnb: "Airbnb", instagram: "Instagram", walkin: "Անմիջապես", expedia: "Expedia", whatsapp: "WhatsApp",
};
export const STATUS_LABEL: Record<ResStatus, string> = {
  inquiry: "Հարցում", confirmed: "Հաստատված", checked_in: "Հյուրանոցում", checked_out: "Մեկնած", declined: "Մերժված", cancelled: "Չեղարկված", no_show: "Չներկայացած",
};
export const PRIORITY_LABEL: Record<Priority, string> = { low: "Ցածր", normal: "Սովորական", high: "Բարձր", urgent: "Շտապ" };
export const ROLE_LABEL = { manager: "Մենեջեր", reception: "Ընդունարան", housekeeping: "Մաքրություն", maintenance: "Տեխնիկական" } as const;
export const LANG_LABEL: Record<Lang, string> = { hy: "Հայերեն", ru: "Русский", en: "English" };

export const nightsHy = (n: number) => `${n} գիշեր`;
