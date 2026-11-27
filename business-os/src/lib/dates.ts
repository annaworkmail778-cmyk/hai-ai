/* Date helpers on "YYYY-MM-DD" strings (calendar dates, UTC arithmetic, no DST issues). */

export const TZ = "Asia/Yerevan";

export function todayIn(tz = TZ, now = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function toUtc(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

export function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(d: string, n: number): string {
  return fromUtc(toUtc(d) + n * 86400000);
}

export function diffDays(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(d: string): number {
  return new Date(toUtc(d)).getUTCDay();
}

export function eachNight(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) out.push(d);
  return out;
}

export function overlaps(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

/** Next Friday at least `minDays` ahead. */
export function nextFriday(from: string, minDays = 5): string {
  let d = addDays(from, minDays);
  while (weekday(d) !== 5) d = addDays(d, 1);
  return d;
}

/** Hour (0–23) of a timestamp in the hotel's time zone. */
export function hourIn(ms: number, tz = TZ): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(ms)) % 24;
}

/** Build a timestamp for a calendar date + "HH:MM" in Yerevan (UTC+4, no DST). */
export function atTime(d: string, hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return toUtc(d) + (h - 4) * 3600000 + m * 60000;
}
