/* Fictional rate rules of the demo hotel. The assistant and the website quote ONLY from here. */
import { eachNight, overlaps, weekday } from "./dates.ts";
import { ROOMS, roomType } from "./hotel-data.ts";
import type { HotelState, RoomTypeId } from "./types.ts";

export type Season = "high" | "ski" | "regular";

export function seasonOf(d: string): Season {
  const m = Number(d.slice(5, 7));
  const day = Number(d.slice(8, 10));
  if ((m === 12 && day >= 25) || (m === 1 && day <= 10)) return "high";
  if ((m === 12 && day >= 15) || m === 1 || m === 2 || (m === 3 && day <= 15)) return "ski";
  return "regular";
}

export const SEASON_FACTOR: Record<Season, number> = { high: 1.4, ski: 1.15, regular: 1 };
export const WEEKEND_FACTOR = 1.15;

export function nightlyRate(typeId: RoomTypeId, night: string): number {
  const base = roomType(typeId).baseRate;
  const wd = weekday(night);
  const weekend = wd === 5 || wd === 6; // Friday and Saturday nights
  const r = base * SEASON_FACTOR[seasonOf(night)] * (weekend ? WEEKEND_FACTOR : 1);
  return Math.round(r / 1000) * 1000;
}

export type Quote = { nights: number; total: number; perNight: { date: string; rate: number }[] };

export function quote(typeId: RoomTypeId, checkIn: string, checkOut: string): Quote {
  const perNight = eachNight(checkIn, checkOut).map((date) => ({ date, rate: nightlyRate(typeId, date) }));
  return { nights: perNight.length, total: perNight.reduce((s, n) => s + n.rate, 0), perNight };
}

/** Lowest nightly rate of a room type over the next 60 days (for "from" prices). */
export function fromRate(typeId: RoomTypeId, today: string): number {
  let min = Infinity;
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.parse(today) + i * 86400000).toISOString().slice(0, 10);
    min = Math.min(min, nightlyRate(typeId, d));
  }
  return min;
}

const BLOCKING = new Set(["confirmed", "checked_in"]);

export function outOfOrderRooms(state: HotelState): Set<string> {
  return new Set(state.maint.filter((m) => m.outOfOrder && m.status !== "resolved" && m.roomId).map((m) => m.roomId!));
}

export function roomIsFree(state: HotelState, roomId: string, checkIn: string, checkOut: string, ignoreId?: string): boolean {
  if (outOfOrderRooms(state).has(roomId)) return false;
  return !state.reservations.some(
    (r) => r.id !== ignoreId && r.roomId === roomId && BLOCKING.has(r.status) && overlaps(r.checkIn, r.checkOut, checkIn, checkOut),
  );
}

export function freeRooms(state: HotelState, typeId: RoomTypeId, checkIn: string, checkOut: string, ignoreId?: string): string[] {
  return ROOMS.filter((r) => r.typeId === typeId && roomIsFree(state, r.id, checkIn, checkOut, ignoreId)).map((r) => r.id);
}

export function fitsGuests(typeId: RoomTypeId, adults: number, children: number): boolean {
  const c = roomType(typeId).capacity;
  return adults <= c.adults && adults + children <= c.adults + c.children;
}
