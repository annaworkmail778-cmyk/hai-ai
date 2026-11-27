/*
 * Hotel KPIs computed from reservations. Definitions (standard hospitality metrics):
 *   Available room-nights = rooms × days in the period
 *   Sold room-nights      = nights of stays (confirmed / in-house / completed) inside the period
 *   Room revenue          = sum of nightly rates of those nights
 *   Occupancy             = sold ÷ available
 *   ADR                   = revenue ÷ sold room-nights
 *   RevPAR                = revenue ÷ available room-nights  (= occupancy × ADR)
 * Everything is fictional demo data.
 */
import { addDays, eachNight } from "./dates.ts";
import { nightlyRate } from "./pricing.ts";
import type { HotelState, Reservation, RoomTypeId, Source } from "./types.ts";

export const STAY_STATUSES = new Set(["confirmed", "checked_in", "checked_out"]);
export const DIRECT_SOURCES: Source[] = ["website", "assistant", "phone", "instagram", "walkin"];
export const OTA_SOURCES: Source[] = ["booking", "airbnb"];
/** Commission assumptions for the demo (editable in the ROI module): Booking.com ≈ 15%, Airbnb host fee ≈ 3%. */
export const COMMISSION: Partial<Record<Source, number>> = { booking: 0.15, airbnb: 0.03 };

export type Period = { from: string; to: string; label: string }; // [from, to)

export function periods(today: string) {
  return {
    last30: { from: addDays(today, -30), to: today, label: "Վերջին 30 օր" },
    last90: { from: addDays(today, -90), to: today, label: "Վերջին 90 օր" },
    next30: { from: today, to: addDays(today, 30), label: "Հաջորդ 30 օր (ամրագրված)" },
  } satisfies Record<string, Period>;
}

function nightsIn(r: Reservation, p: Period) {
  return eachNight(r.checkIn, r.checkOut).filter((d) => d >= p.from && d < p.to);
}

export type Kpis = {
  available: number; sold: number; revenue: number; occupancy: number; adr: number; revpar: number;
  bookings: number; cancelled: number; cancellationRate: number; alos: number;
  inquiries: number; converted: number; conversion: number; pendingInquiries: number;
  afterHoursInquiries: number; afterHoursShare: number;
  bySource: { source: Source; bookings: number; revenue: number; nights: number; commission: number }[];
  directShare: number; otaCommission: number;
  byType: { typeId: RoomTypeId; rooms: number; sold: number; revenue: number; occupancy: number; adr: number }[];
  daily: { date: string; revenue: number; occupancy: number }[];
};

export function computeKpis(state: HotelState, p: Period): Kpis {
  const rooms = state.rooms.length;
  const days = eachNight(p.from, p.to);
  const available = rooms * days.length;
  const stays = state.reservations.filter((r) => STAY_STATUSES.has(r.status));
  const dailyRev = new Map<string, number>(days.map((d) => [d, 0]));
  const dailySold = new Map<string, number>(days.map((d) => [d, 0]));
  let sold = 0, revenue = 0;
  const src = new Map<Source, { bookings: number; revenue: number; nights: number }>();
  const typ = new Map<RoomTypeId, { sold: number; revenue: number }>();
  for (const r of stays) {
    const ns = nightsIn(r, p);
    if (!ns.length) continue;
    let rr = 0;
    for (const d of ns) {
      const rate = nightlyRate(r.typeId, d);
      rr += rate;
      dailyRev.set(d, (dailyRev.get(d) ?? 0) + rate);
      dailySold.set(d, (dailySold.get(d) ?? 0) + 1);
    }
    sold += ns.length;
    revenue += rr;
    const s = src.get(r.source) ?? { bookings: 0, revenue: 0, nights: 0 };
    s.revenue += rr; s.nights += ns.length;
    if (r.checkIn >= p.from && r.checkIn < p.to) s.bookings += 1;
    src.set(r.source, s);
    const t = typ.get(r.typeId) ?? { sold: 0, revenue: 0 };
    t.sold += ns.length; t.revenue += rr;
    typ.set(r.typeId, t);
  }

  const arriving = state.reservations.filter((r) => r.checkIn >= p.from && r.checkIn < p.to);
  const bookingsAll = arriving.filter((r) => STAY_STATUSES.has(r.status) || r.status === "cancelled" || r.status === "no_show");
  const cancelled = bookingsAll.filter((r) => r.status === "cancelled").length;
  const completedStays = arriving.filter((r) => STAY_STATUSES.has(r.status));
  const alos = completedStays.length ? completedStays.reduce((s, r) => s + eachNight(r.checkIn, r.checkOut).length, 0) / completedStays.length : 0;

  // Requests that came through the hotel's own channels, by the time they arrived.
  const fromT = Date.parse(p.from + "T00:00:00+04:00"), toT = Date.parse(p.to + "T00:00:00+04:00");
  const requests = state.reservations.filter((r) => DIRECT_SOURCES.includes(r.source) && r.source !== "walkin" && (r.displayAt ?? r.createdAt) >= fromT && (r.displayAt ?? r.createdAt) < toT);
  const pendingInquiries = state.reservations.filter((r) => r.status === "inquiry").length;
  const decided = requests.filter((r) => r.status !== "inquiry");
  const converted = decided.filter((r) => r.status !== "declined").length;
  const afterHoursInquiries = requests.filter((r) => r.afterHours).length;

  const bySource = [...src.entries()].map(([source, v]) => ({ source, ...v, commission: Math.round(v.revenue * (COMMISSION[source] ?? 0)) })).sort((a, b) => b.revenue - a.revenue);
  const directRevenue = bySource.filter((s) => DIRECT_SOURCES.includes(s.source)).reduce((a, s) => a + s.revenue, 0);

  const byType = (["classic", "deluxe", "junior", "family", "chalet"] as RoomTypeId[]).map((typeId) => {
    const n = state.rooms.filter((r) => r.typeId === typeId).length;
    const v = typ.get(typeId) ?? { sold: 0, revenue: 0 };
    return { typeId, rooms: n, sold: v.sold, revenue: v.revenue, occupancy: v.sold / (n * days.length || 1), adr: v.sold ? v.revenue / v.sold : 0 };
  });

  return {
    available, sold, revenue, occupancy: available ? sold / available : 0, adr: sold ? revenue / sold : 0, revpar: available ? revenue / available : 0,
    bookings: bookingsAll.length, cancelled, cancellationRate: bookingsAll.length ? cancelled / bookingsAll.length : 0, alos,
    inquiries: requests.length, converted, conversion: decided.length ? converted / decided.length : 0, pendingInquiries,
    afterHoursInquiries, afterHoursShare: requests.length ? afterHoursInquiries / requests.length : 0,
    bySource, directShare: revenue ? directRevenue / revenue : 0, otaCommission: bySource.reduce((a, s) => a + s.commission, 0),
    byType,
    daily: days.map((d) => ({ date: d, revenue: dailyRev.get(d) ?? 0, occupancy: (dailySold.get(d) ?? 0) / rooms })),
  };
}

/** Rooms occupied on a given night (in-house or arriving confirmed). */
export function occupiedOn(state: HotelState, night: string) {
  return state.reservations.filter((r) => r.roomId && (r.status === "checked_in" || r.status === "confirmed") && r.checkIn <= night && r.checkOut > night);
}
