/*
 * Business rules shared by the guest site, the dashboard and the reducer:
 * loyalty tiers and balances, direct-booking price breakdown, restaurant order totals.
 * All amounts are AMD. Points are earned only on completed eligible transactions (see engine.ts).
 */
import { EXTRAS } from "./hospitality-data.ts";
import { quote } from "./pricing.ts";
import type { HotelState, I18n, Lang, MenuItem, RoomTypeId, Tier } from "./types.ts";

export const earnFor = (state: HotelState, amount: number) => Math.floor(Math.max(0, amount) / 1000) * state.loyalty.earnPer1000;

export function accountOf(state: HotelState, guestId?: string) {
  return guestId ? state.accounts.find((a) => a.guestId === guestId) : undefined;
}

export function loyaltyOf(state: HotelState, guestId: string) {
  const entries = state.ledger.filter((e) => e.guestId === guestId).sort((a, b) => b.at - a.at);
  const balance = entries.reduce((s, e) => s + e.points, 0);
  const lifetime = entries.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0);
  const tiers = [...state.loyalty.tiers].sort((a, b) => a.minPoints - b.minPoints);
  let tier: Tier = tiers[0];
  for (const t of tiers) if (lifetime >= t.minPoints) tier = t;
  const next = tiers.find((t) => t.minPoints > lifetime);
  return { entries, balance, lifetime, tier, next, toNext: next ? next.minPoints - lifetime : 0, progress: next ? (lifetime - tier.minPoints) / (next.minPoints - tier.minPoints) : 1 };
}

export function tierRank(state: HotelState, tierId?: string) {
  return tierId ? state.loyalty.tiers.findIndex((t) => t.id === tierId) : 0;
}

export type Line = { label: I18n; amount: number; kind: "room" | "extra" | "discount" };

export type BookingCalc = {
  nights: number; roomTotal: number; extrasTotal: number; discount: number; total: number; lines: Line[];
  perRoom: number; memberPct: number; campaignPct: number; voucherAmount: number;
};

const L = (hy: string, ru: string, en: string): I18n => ({ hy, ru, en });

export function bookingCalc(state: HotelState, b: { typeId: RoomTypeId; rooms: number; checkIn: string; checkOut: string; adults: number; children: number; extras: { id: string; qty: number }[]; voucherId?: string; guestId?: string }): BookingCalc {
  const q = quote(b.typeId, b.checkIn, b.checkOut);
  const rooms = Math.max(1, b.rooms);
  const roomTotal = q.total * rooms;
  const lines: Line[] = [{ label: L(`${q.nights} գիշեր × ${rooms} սենյակ`, `${q.nights} ноч. × ${rooms} ном.`, `${q.nights} night${q.nights > 1 ? "s" : ""} × ${rooms} room${rooms > 1 ? "s" : ""}`), amount: roomTotal, kind: "room" }];
  let extrasTotal = 0;
  for (const e of b.extras) {
    const x = EXTRAS.find((y) => y.id === e.id);
    if (!x || e.qty <= 0) continue;
    const mult = x.unit === "night" ? q.nights : x.unit === "person" ? b.adults + b.children : 1;
    const amt = x.price * mult * e.qty;
    extrasTotal += amt;
    lines.push({ label: x.name, amount: amt, kind: "extra" });
  }
  let memberPct = 0, campaignPct = 0, voucherAmount = 0;
  const acc = accountOf(state, b.guestId);
  if (acc) {
    const lo = loyaltyOf(state, acc.guestId);
    memberPct = lo.tier.discountPct;
    const camp = state.campaigns.filter((c) => c.active && c.appliesTo === "stay" && c.tierIds.includes(lo.tier.id)).sort((x, y) => y.discountPct - x.discountPct)[0];
    campaignPct = camp?.discountPct ?? 0;
    if (memberPct) lines.push({ label: L(`Անդամի զեղչ (${lo.tier.name.hy}) −${memberPct}%`, `Скидка участника (${lo.tier.name.ru}) −${memberPct}%`, `Member discount (${lo.tier.name.en}) −${memberPct}%`), amount: -Math.round((roomTotal * memberPct) / 100), kind: "discount" });
    if (camp) lines.push({ label: { hy: `${camp.title.hy} −${campaignPct}%`, ru: `${camp.title.ru} −${campaignPct}%`, en: `${camp.title.en} −${campaignPct}%` }, amount: -Math.round((roomTotal * campaignPct) / 100), kind: "discount" });
    const v = b.voucherId ? state.vouchers.find((x) => x.id === b.voucherId && x.guestId === acc.guestId && x.status === "active") : undefined;
    const rw = v ? state.rewards.find((x) => x.id === v.rewardId && x.appliesTo === "stay") : undefined;
    if (rw) {
      voucherAmount = rw.kind === "pct" ? Math.round((roomTotal * rw.value) / 100) : rw.value;
      lines.push({ label: { hy: `Նվեր՝ ${rw.name.hy}`, ru: `Награда: ${rw.name.ru}`, en: `Reward: ${rw.name.en}` }, amount: -voucherAmount, kind: "discount" });
    }
  }
  const rawDiscount = Math.round((roomTotal * (memberPct + campaignPct)) / 100) + voucherAmount;
  const discount = Math.min(rawDiscount, Math.round(roomTotal * 0.5)); // never more than half the room price
  if (discount < rawDiscount) lines.push({ label: L("Զեղչերի սահմանափակում (առավելագույնը 50%)", "Ограничение скидок (максимум 50%)", "Discount cap (max 50%)"), amount: rawDiscount - discount, kind: "discount" });
  return { nights: q.nights, roomTotal, extrasTotal, discount, total: roomTotal + extrasTotal - discount, lines, perRoom: q.total, memberPct, campaignPct, voucherAmount };
}

export function itemPrice(item: MenuItem, options: string[]) {
  return item.price + item.options.filter((o) => options.includes(o.id)).reduce((s, o) => s + o.price, 0);
}

export function orderCalc(state: HotelState, items: { itemId: string; qty: number; options: string[] }[], guestId?: string, voucherId?: string) {
  const subtotal = items.reduce((s, i) => { const m = state.menu.items.find((x) => x.id === i.itemId); return s + (m ? itemPrice(m, i.options) * i.qty : 0); }, 0);
  let pct = 0, voucher = 0, label: I18n | null = null;
  const acc = accountOf(state, guestId);
  if (acc) {
    const lo = loyaltyOf(state, acc.guestId);
    const camp = state.campaigns.filter((c) => c.active && c.appliesTo === "order" && c.tierIds.includes(lo.tier.id)).sort((x, y) => y.discountPct - x.discountPct)[0];
    if (camp) { pct = camp.discountPct; label = camp.title; }
    const v = voucherId ? state.vouchers.find((x) => x.id === voucherId && x.guestId === acc.guestId && x.status === "active") : undefined;
    const rw = v ? state.rewards.find((x) => x.id === v.rewardId && x.appliesTo === "order") : undefined;
    if (rw) voucher = rw.kind === "pct" ? Math.round((subtotal * rw.value) / 100) : rw.value;
  }
  const discount = Math.min(subtotal, Math.round((subtotal * pct) / 100) + voucher);
  return { subtotal, pct, voucher, discount, total: subtotal - discount, campaignLabel: label };
}

export const ORDER_FLOW: Record<string, string[]> = {
  submitted: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["out_for_delivery", "completed"],
  out_for_delivery: ["completed"],
};

export const tr = (x: I18n, lang: Lang) => x[lang];
