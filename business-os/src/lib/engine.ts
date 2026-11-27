/*
 * The demo's single source of truth: state = replay(seed(baseDate), events).
 * Every device replays the same ordered events, so the guest's phone, the dashboard and the
 * presenter always agree. Automations run inside the reducer and are deterministic.
 *
 * External messages are NEVER sent: they are written to the outbox as "simulated"/"scheduled".
 */
import { addDays, atTime, diffDays } from "./dates.ts";
import { replayEvents } from "./kernel/replay.ts";
import { roomType } from "./hotel-data.ts";
import { quote, roomIsFree } from "./pricing.ts";
import { createSeed } from "./seed.ts";
import { SERVICE_META, TRAINING } from "./hospitality-data.ts";
import { bookingCalc, earnFor, loyaltyOf, ORDER_FLOW, orderCalc, accountOf, tierRank } from "./rules.ts";
import type { Guest, GuestInput, HotelState, Lang, OutboxItem, Reservation, StampedEvent, Staff, TrainingModule } from "./types.ts";

type Tpl = Record<Lang, (p: { name: string; room: string; checkIn: string; checkOut: string; code: string; checkInTime: string }) => string>;

const T_RECEIVED: Tpl = {
  hy: (p) => `Բարև Ձեզ, ${p.name}։ Ձեր հարցումը (${p.room}, ${p.checkIn} – ${p.checkOut}) ստացվել է։ Սա դեռ հաստատված ամրագրում չէ. ընդունարանը կպատասխանի աշխատանքային ժամերին։`,
  ru: (p) => `Здравствуйте, ${p.name}! Ваш запрос (${p.room}, ${p.checkIn} – ${p.checkOut}) получен. Это ещё не подтверждённая бронь — ресепшн ответит в рабочее время.`,
  en: (p) => `Hello ${p.name}, we received your request (${p.room}, ${p.checkIn} – ${p.checkOut}). This is not a confirmed booking yet — reception will reply during working hours.`,
};
const T_CONFIRM: Tpl = {
  hy: (p) => `${p.name}, Ձեր ամրագրումը հաստատված է։ ${p.room}, ${p.checkIn} – ${p.checkOut}, կոդ՝ ${p.code}։ Մուտքը՝ ${p.checkInTime}-ից։ Սպասում ենք Ձեզ Pine Ridge-ում։`,
  ru: (p) => `${p.name}, ваше бронирование подтверждено: ${p.room}, ${p.checkIn} – ${p.checkOut}, код ${p.code}. Заезд с ${p.checkInTime}. Ждём вас в Pine Ridge!`,
  en: (p) => `${p.name}, your booking is confirmed: ${p.room}, ${p.checkIn} – ${p.checkOut}, code ${p.code}. Check-in from ${p.checkInTime}. See you at Pine Ridge!`,
};
const T_PREARRIVAL: Tpl = {
  hy: (p) => `${p.name}, վաղը սպասում ենք Ձեզ։ Մուտքը՝ ${p.checkInTime}-ից, ավտոկայանատեղին անվճար է։ Ճանապարհի հարցերով գրեք մեզ։`,
  ru: (p) => `${p.name}, ждём вас завтра! Заезд с ${p.checkInTime}, парковка бесплатная. Если нужна помощь с дорогой — напишите нам.`,
  en: (p) => `${p.name}, we look forward to welcoming you tomorrow. Check-in from ${p.checkInTime}; parking is free. Need directions? Just reply.`,
};
const T_REVIEW: Tpl = {
  hy: (p) => `${p.name}, շնորհակալություն, որ ընտրեցիք Pine Ridge-ը։ Կկիսվե՞ք Ձեր կարծիքով. դա մեզ շատ կօգնի։`,
  ru: (p) => `${p.name}, спасибо, что выбрали Pine Ridge! Поделитесь, пожалуйста, впечатлениями — это нам очень поможет.`,
  en: (p) => `${p.name}, thank you for staying at Pine Ridge! Would you share a short review? It helps us a lot.`,
};
const T_DECLINE: Tpl = {
  hy: (p) => `${p.name}, ցավոք, ${p.checkIn} – ${p.checkOut} ամսաթվերին «${p.room}» սենյակն ազատ չէ։ Կարո՞ղ ենք առաջարկել այլ ամսաթվեր կամ սենյակ։`,
  ru: (p) => `${p.name}, к сожалению, на ${p.checkIn} – ${p.checkOut} номер «${p.room}» недоступен. Можем предложить другие даты или номер?`,
  en: (p) => `${p.name}, unfortunately "${p.room}" is not available for ${p.checkIn} – ${p.checkOut}. May we suggest other dates or another room?`,
};

const fmt = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;

function vars(state: HotelState, res: Reservation, g: Guest) {
  return {
    name: g.firstName,
    room: roomType(res.typeId).name[g.lang],
    checkIn: fmt(res.checkIn),
    checkOut: fmt(res.checkOut),
    code: res.code,
    checkInTime: state.kb.checkIn,
  };
}

function upsertGuest(state: HotelState, input: GuestInput, id: string): Guest {
  const phone = input.phone.replace(/\s+/g, "");
  const found = phone.length > 5 ? state.guests.find((g) => g.phone.replace(/\s+/g, "") === phone) : undefined;
  if (found) return found;
  const g: Guest = { id, firstName: input.firstName.trim() || "Հյուր", lastName: input.lastName.trim(), phone: input.phone.trim(), email: input.email.trim(), lang: input.lang, country: "—", tags: ["Նոր հյուր"], preferences: [], notes: [] };
  state.guests.unshift(g);
  return g;
}

function leastBusyHousekeeper(state: HotelState, day: string): string | null {
  const hks = state.staff.filter((s) => s.role === "housekeeping");
  let best: string | null = null;
  let min = Infinity;
  for (const s of hks) {
    const c = state.hkTasks.filter((t) => t.assigneeId === s.id && t.due === day && t.status !== "done").length;
    if (c < min) { min = c; best = s.id; }
  }
  return best;
}

function outbox(state: HotelState, item: Omit<OutboxItem, "id">, id: string) {
  state.outbox.unshift({ ...item, id });
}

function displayTime(state: HotelState, ev: StampedEvent): { at: number; afterHours: boolean } {
  if (state.clock.mode === "night") {
    // The night scenario shows the request as if it arrived at 23:31 (reception closed).
    const day = addDays(state.baseDate, -1);
    return { at: atTime(day, "23:31") + (ev.at % 60000), afterHours: true };
  }
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", hour12: false }).format(ev.at)) % 24;
  return { at: ev.at, afterHours: h >= 22 || h < 8 };
}

const STAFF_NAME = (state: HotelState, by: string) => (by === "guest" ? "Հյուր" : by === "presenter" ? "Ներկայացում" : state.staff.find((s) => s.id === by)?.name ?? "Ընդունարան");

export function apply(state: HotelState, ev: StampedEvent): HotelState {
  const id = ev.id;
  const who = STAFF_NAME(state, ev.by);
  switch (ev.type) {
    case "inquiry.create": {
      const g = upsertGuest(state, ev.guest, `g-${id}`);
      const { at, afterHours } = displayTime(state, ev);
      const res: Reservation = {
        id: `r-${id}`, code: `PR-${25000 + state.reservations.length}`, guestId: g.id, typeId: ev.typeId, roomId: null,
        checkIn: ev.checkIn, checkOut: ev.checkOut, adults: ev.adults, children: ev.children, source: ev.source, status: "inquiry",
        total: quote(ev.typeId, ev.checkIn, ev.checkOut).total, createdAt: ev.at, displayAt: at, afterHours, requests: ev.requests,
        conversationId: ev.conversationId, history: [{ at, text: afterHours ? "Հարցումը ստացվեց ոչ աշխատանքային ժամին" : "Հարցումը ստացվեց", by: ev.source === "assistant" ? "AI օգնական" : "Կայք" }],
      };
      state.reservations.push(res);
      if (ev.conversationId) {
        const c = state.conversations.find((x) => x.id === ev.conversationId);
        if (c) { c.reservationId = res.id; c.guestName = g.firstName; }
      }
      state.activity.unshift({ id: `a-${id}`, at, icon: "inquiry", text: `Նոր հարցում՝ ${roomType(ev.typeId).name.hy}, ${fmt(ev.checkIn)}–${fmt(ev.checkOut)} (${g.firstName})`, by: ev.source === "assistant" ? "AI օգնական" : "Կայք" });
      if (state.workflows.inquiry_alert) {
        state.notifications.unshift({ id: `n-${id}`, at, text: `Նոր հարցում՝ ${g.firstName} ${g.lastName}, ${roomType(ev.typeId).name.hy}`, href: `/admin/reservations?open=${res.id}`, read: false, kind: "inquiry" });
        outbox(state, { at, channel: "telegram", to: "Ընդունարանի խումբ", template: "Նոր հարցում (անձնակազմին)", text: `🛎 Նոր հարցում ${res.code}. ${g.firstName} ${g.lastName}, ${roomType(ev.typeId).name.hy}, ${fmt(ev.checkIn)}–${fmt(ev.checkOut)}, ${ev.adults}+${ev.children} հյուր։`, state: "simulated", workflowId: "inquiry_alert", reservationId: res.id }, `o1-${id}`);
        outbox(state, { at, channel: ev.guest.email ? "email" : "whatsapp", to: `${g.firstName} ${g.lastName}`, template: "Հարցումը ստացվել է (հյուրին)", text: T_RECEIVED[g.lang](vars(state, res, g)), state: "simulated", workflowId: "inquiry_alert", reservationId: res.id }, `o2-${id}`);
      }
      return state;
    }
    case "reservation.create": {
      const g = upsertGuest(state, ev.guest, `g-${id}`);
      const ok = !ev.roomId || roomIsFree(state, ev.roomId, ev.checkIn, ev.checkOut);
      const res: Reservation = {
        id: `r-${id}`, code: `PR-${25000 + state.reservations.length}`, guestId: g.id, typeId: ev.typeId, roomId: ok ? ev.roomId : null,
        checkIn: ev.checkIn, checkOut: ev.checkOut, adults: ev.adults, children: ev.children, source: ev.source,
        status: ev.roomId && ok ? "confirmed" : "inquiry", total: quote(ev.typeId, ev.checkIn, ev.checkOut).total, createdAt: ev.at,
        requests: ev.requests, history: [{ at: ev.at, text: "Ստեղծվեց ձեռքով", by: who }],
      };
      state.reservations.push(res);
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "approve", text: `Ձեռքով ամրագրում ${res.code}՝ ${g.firstName} ${g.lastName}`, by: who });
      if (res.status === "confirmed") afterApprove(state, res, g, id, ev.at, who);
      return state;
    }
    case "reservation.approve": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || res.status !== "inquiry") return state;
      if (!roomIsFree(state, ev.roomId, res.checkIn, res.checkOut, res.id)) return state; // never double-book
      res.status = "confirmed";
      res.roomId = ev.roomId;
      voucherState(state, res.voucherId, "used");
      res.history.push({ at: ev.at, text: `Հաստատվեց, սենյակ ${ev.roomId}`, by: who });
      const g = state.guests.find((x) => x.id === res.guestId)!;
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "approve", text: `Ամրագրումը հաստատվեց՝ ${res.code}, սենյակ ${ev.roomId}`, by: who });
      afterApprove(state, res, g, id, ev.at, who);
      return state;
    }
    case "reservation.decline": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || res.status !== "inquiry") return state;
      res.status = "declined";
      res.declineReason = ev.reason;
      voucherState(state, res.voucherId, "active");
      res.history.push({ at: ev.at, text: `Մերժվեց՝ ${ev.reason}`, by: who });
      const g = state.guests.find((x) => x.id === res.guestId)!;
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "decline", text: `Հարցումը մերժվեց՝ ${res.code}`, by: who });
      outbox(state, { at: ev.at, channel: "email", to: `${g.firstName} ${g.lastName}`, template: "Այլընտրանքի առաջարկ (հյուրին)", text: T_DECLINE[g.lang](vars(state, res, g)), state: "simulated", workflowId: "approve_calendar", reservationId: res.id }, `o-${id}`);
      return state;
    }
    case "reservation.cancel": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || !["confirmed", "inquiry"].includes(res.status)) return state;
      res.status = "cancelled";
      res.history.push({ at: ev.at, text: "Չեղարկվեց", by: who });
      voucherState(state, res.voucherId, "active");
      state.hkTasks = state.hkTasks.filter((t) => !(t.reservationId === res.id && t.kind === "arrival_prep" && t.status !== "done"));
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "decline", text: `Ամրագրումը չեղարկվեց՝ ${res.code}`, by: who });
      return state;
    }
    case "reservation.checkin": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || res.status !== "confirmed") return state;
      res.status = "checked_in";
      res.history.push({ at: ev.at, text: "Հյուրը ժամանեց", by: who });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "checkin", text: `Մուտք՝ սենյակ ${res.roomId} (${res.code})`, by: who });
      return state;
    }
    case "reservation.checkout": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || res.status !== "checked_in" || !res.roomId) return state;
      res.status = "checked_out";
      // Early departure: the stay ends today.
      if (res.checkOut > state.baseDate) { res.checkOut = state.baseDate > res.checkIn ? state.baseDate : addDays(res.checkIn, 1); res.total = quote(res.typeId, res.checkIn, res.checkOut).total; }
      res.history.push({ at: ev.at, text: "Հյուրը մեկնեց", by: who });
      state.hk[res.roomId] = "dirty";
      const g = state.guests.find((x) => x.id === res.guestId)!;
      // Loyalty: points only for a completed stay of a member, if stays are eligible.
      if (state.loyalty.eligible.stays && accountOf(state, res.guestId)) {
        const extras = (res.extras ?? []).reduce((a, x) => a + x.price, 0);
        const pts = earnFor(state, res.total - (res.discount ?? 0) + extras);
        if (pts > 0) state.ledger.push({ id: `l-${id}`, guestId: res.guestId, at: ev.at, points: pts, reason: `Կեցություն ${res.code}`, ref: res.id });
      }
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "checkout", text: `Ելք՝ սենյակ ${res.roomId} (${g.firstName} ${g.lastName})`, by: who });
      if (state.workflows.checkout_task) {
        const nextArrival = state.reservations.find((r) => r.roomId === res.roomId && r.checkIn === state.baseDate && r.status === "confirmed");
        state.hkTasks.unshift({
          id: `hk-${id}`, roomId: res.roomId, kind: "checkout", status: "todo", priority: nextArrival ? "urgent" : "high",
          assigneeId: leastBusyHousekeeper(state, state.baseDate), due: state.baseDate, dueTime: nextArrival ? state.kb.checkIn : "16:00",
          reservationId: res.id, createdAt: ev.at, auto: true, note: nextArrival ? `Այսօր ժամանում է նոր հյուր (${nextArrival.code})` : undefined,
        });
        state.activity.unshift({ id: `a2-${id}`, at: ev.at + 1, icon: "auto", text: `Ավտոմատ առաջադրանք՝ մաքրել սենյակ ${res.roomId}`, by: "Ավտոմատացում", automated: true });
      }
      if (state.workflows.review_request) {
        outbox(state, { at: ev.at, channel: "email", to: `${g.firstName} ${g.lastName}`, template: "Կարծիքի հարցում (հյուրին)", text: T_REVIEW[g.lang](vars(state, res, g)), state: "scheduled", scheduledFor: `${addDays(state.baseDate, 1)} 11:00`, workflowId: "review_request", reservationId: res.id }, `o-${id}`);
      }
      return state;
    }
    case "hk.status": {
      const t = state.hkTasks.find((x) => x.id === ev.taskId);
      if (!t) return state;
      t.status = ev.status;
      if (["checkout", "arrival_prep"].includes(t.kind)) state.hk[t.roomId] = ev.status === "done" ? "clean" : ev.status === "in_progress" ? "cleaning" : state.hk[t.roomId];
      if (ev.status === "done") state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Սենյակ ${t.roomId}. ${kindLabel[t.kind]} ավարտված է`, by: who });
      return state;
    }
    case "hk.assign": {
      const t = state.hkTasks.find((x) => x.id === ev.taskId);
      if (t) t.assigneeId = ev.assigneeId;
      return state;
    }
    case "room.hk":
      state.hk[ev.roomId] = ev.status;
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "room", text: `Սենյակ ${ev.roomId}. կարգավիճակ՝ ${hkLabel[ev.status]}`, by: who });
      return state;
    case "maint.create": {
      state.maint.unshift({ id: `m-${id}`, roomId: ev.roomId, area: ev.area, title: ev.title, description: ev.description, priority: ev.priority, status: "open", assigneeId: state.staff.find((s) => s.role === "maintenance")?.id ?? null, createdAt: ev.at, outOfOrder: ev.outOfOrder, log: [{ at: ev.at, text: "Հայտը ստեղծվեց", by: who }] });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "maint", text: `Նոր տեխնիկական հայտ՝ ${ev.roomId ? "սենյակ " + ev.roomId : ev.area}. ${ev.title}`, by: who });
      state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `Տեխնիկական հայտ՝ ${ev.title}`, href: "/admin/maintenance", read: false, kind: "maint" });
      return state;
    }
    case "maint.status": {
      const m = state.maint.find((x) => x.id === ev.target);
      if (!m) return state;
      m.status = ev.status;
      if (ev.status === "resolved") m.resolvedAt = ev.at;
      m.log.push({ at: ev.at, text: ev.status === "resolved" ? "Ավարտված է" : ev.status === "in_progress" ? "Աշխատանքը սկսված է" : "Վերաբացվեց", by: who });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "maint", text: `${m.title}. ${ev.status === "resolved" ? "ավարտված է" : "ընթացքում է"}`, by: who });
      return state;
    }
    case "maint.assign": {
      const m = state.maint.find((x) => x.id === ev.target);
      if (m) m.assigneeId = ev.assigneeId;
      return state;
    }
    case "staffTask.create":
      state.staffTasks.unshift({ id: `st-${id}`, title: ev.title, detail: ev.detail, assigneeId: ev.assigneeId, priority: ev.priority, due: ev.due, status: "todo", createdAt: ev.at, origin: "manual" });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Նոր առաջադրանք՝ ${ev.title}`, by: who });
      return state;
    case "staffTask.status": {
      const t = state.staffTasks.find((x) => x.id === ev.target);
      if (!t) return state;
      t.status = ev.status;
      if (ev.status === "done") state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Ավարտված է՝ ${t.title}`, by: who });
      return state;
    }
    case "chat.start": {
      if (state.conversations.some((c) => c.id === ev.conversationId)) return state;
      const { at, afterHours } = displayTime(state, ev);
      state.conversations.unshift({ id: ev.conversationId, lang: ev.lang, channel: "website", startedAt: ev.at, displayAt: at, afterHours, messages: [], status: "open", unanswered: [] });
      return state;
    }
    case "chat.message": {
      const c = state.conversations.find((x) => x.id === ev.conversationId);
      if (!c || c.messages.some((m) => m.id === ev.msg.id)) return state;
      c.messages.push(ev.msg);
      return state;
    }
    case "chat.handoff": {
      const c = state.conversations.find((x) => x.id === ev.conversationId);
      if (!c) return state;
      c.status = "handoff";
      c.unanswered.push(ev.question);
      const { at } = displayTime(state, ev);
      state.notifications.unshift({ id: `n-${id}`, at, text: `Օգնականը փոխանցեց հարց. «${ev.question.slice(0, 60)}»`, href: "/admin/assistant", read: false, kind: "handoff" });
      if (state.workflows.unanswered_followup) {
        state.staffTasks.unshift({ id: `st-${id}`, title: `Պատասխանել հյուրին. «${ev.question.slice(0, 80)}»`, detail: "Օգնականը հաստատված պատասխան չուներ և հարցը փոխանցեց անձնակազմին։", assigneeId: state.staff.find((s) => s.role === "reception")?.id ?? null, priority: "high", due: c.afterHours ? state.baseDate : state.baseDate, status: "todo", createdAt: ev.at, origin: "assistant", link: { kind: "conversation", id: c.id } });
        state.activity.unshift({ id: `a-${id}`, at, icon: "auto", text: "Չպատասխանված հարց → առաջադրանք ընդունարանին", by: "Ավտոմատացում", automated: true });
      }
      return state;
    }
    case "chat.resolve": {
      const c = state.conversations.find((x) => x.id === ev.conversationId);
      if (c) c.status = "resolved";
      state.staffTasks.filter((t) => t.link?.id === ev.conversationId).forEach((t) => (t.status = "done"));
      return state;
    }
    case "guest.note": {
      const g = state.guests.find((x) => x.id === ev.guestId);
      if (g) g.notes.unshift({ at: ev.at, author: who, text: ev.text });
      return state;
    }
    case "workflow.toggle":
      state.workflows[ev.target] = ev.on;
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "auto", text: `Ավտոմատացում «${ev.target}»՝ ${ev.on ? "միացված" : "անջատված"}`, by: who });
      return state;
    case "kb.update":
      state.kb = { ...state.kb, ...ev.patch };
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: "Օգնականի գիտելիքների բազան թարմացվեց", by: who });
      return state;
    case "clock.set":
      state.clock = { mode: ev.mode };
      return state;
    case "notifications.read":
      state.notifications.forEach((n) => (n.read = true));
      return state;
    default:
      applyHospitality(state, ev, who);
      return state;
  }
}

function afterApprove(state: HotelState, res: Reservation, g: Guest, id: string, at: number, who: string) {
  void who;
  if (state.workflows.approve_calendar) {
    outbox(state, { at, channel: g.email ? "email" : "whatsapp", to: `${g.firstName} ${g.lastName}`, template: "Ամրագրման հաստատում (հյուրին)", text: T_CONFIRM[g.lang](vars(state, res, g)), state: "simulated", workflowId: "approve_calendar", reservationId: res.id }, `oc-${id}`);
  }
  if (state.workflows.approve_prep_task && res.roomId) {
    const soon = diffDays(state.baseDate, res.checkIn) <= 1;
    state.hkTasks.unshift({
      id: `hkp-${id}`, roomId: res.roomId, kind: "arrival_prep", status: "todo", priority: soon ? "high" : "normal",
      assigneeId: leastBusyHousekeeper(state, res.checkIn), due: res.checkIn, dueTime: state.kb.checkIn, reservationId: res.id, createdAt: at, auto: true,
      note: res.requests ? `Հյուրի խնդրանք՝ ${res.requests}` : undefined,
    });
    state.activity.unshift({ id: `a2-${id}`, at: at + 1, icon: "auto", text: `Ավտոմատ առաջադրանք՝ պատրաստել սենյակ ${res.roomId} (${fmt(res.checkIn)})`, by: "Ավտոմատացում", automated: true });
  }
  if (state.workflows.pre_arrival) {
    const sendDay = addDays(res.checkIn, -1);
    const now = sendDay <= state.baseDate;
    outbox(state, { at: at + 2, channel: "whatsapp", to: `${g.firstName} ${g.lastName}`, template: "Նախաժամանման հաղորդագրություն", text: T_PREARRIVAL[g.lang](vars(state, res, g)), state: now ? "simulated" : "scheduled", scheduledFor: now ? undefined : `${sendDay} 10:00`, workflowId: "pre_arrival", reservationId: res.id }, `op-${id}`);
  }
}

export const kindLabel: Record<string, string> = { checkout: "Մաքրում ելքից հետո", arrival_prep: "Պատրաստում ժամանման համար", stayover: "Ամենօրյա մաքրում", inspection: "Ստուգում" };
export const hkLabel: Record<string, string> = { clean: "Մաքուր", dirty: "Մաքրման կարիք ունի", cleaning: "Մաքրվում է", inspected: "Ստուգված" };

/** Replays events on a fresh seed. Events must be ordered (server order). */
export function replay(baseDate: string, events: StampedEvent[]): HotelState {
  // at-least-once delivery → the kernel applies each event once
  const s = replayEvents(createSeed(baseDate), events, apply);
  s.reservations.sort((a, b) => (b.displayAt ?? b.createdAt) - (a.displayAt ?? a.createdAt));
  return s;
}

/* ---------------- Hospitality OS expansion ---------------- */

function voucherState(state: HotelState, voucherId: string | undefined, status: "active" | "reserved" | "used", ref?: string) {
  const v = voucherId ? state.vouchers.find((x) => x.id === voucherId) : undefined;
  if (!v) return;
  if (status === "used" && v.status !== "reserved") return;
  if (status === "active" && v.status !== "reserved") return;
  v.status = status;
  if (ref) v.ref = ref;
}

const initials = (name: string) => name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
const ORDER_STATUS_HY: Record<string, string> = { submitted: "Ուղարկված", accepted: "Ընդունված", preparing: "Պատրաստվում է", ready: "Պատրաստ է", out_for_delivery: "Ճանապարհին", completed: "Ավարտված", rejected: "Մերժված", cancelled: "Չեղարկված" };

function enroll(state: HotelState, s: Staff, at: number, modules: TrainingModule[] = state.training) {
  for (const m of modules) {
    if (!(m.positions === "all" || m.positions.includes(s.position))) continue;
    if (state.enrollments.some((e) => e.employeeId === s.id && e.moduleId === m.id)) continue;
    state.enrollments.push({ id: `en-${s.id}-${m.id}`, employeeId: s.id, moduleId: m.id, done: [], scores: {}, status: "in_progress", assignedAt: at });
  }
}

function applyHospitality(state: HotelState, ev: StampedEvent, who: string) {
  const id = ev.id;
  switch (ev.type) {
    case "account.register": {
      if (state.accounts.some((a) => a.email.toLowerCase() === ev.email.toLowerCase())) return;
      const g = upsertGuest(state, { ...ev.guest, email: ev.email }, `g-${id}`);
      if (!g.email) g.email = ev.email;
      state.accounts.push({ id: ev.accountId, guestId: g.id, email: ev.email, createdAt: ev.at, consent: { marketing: ev.marketing, analytics: true }, favourites: [] });
      if (state.loyalty.welcomeBonus) state.ledger.push({ id: `l-${id}`, guestId: g.id, at: ev.at, points: state.loyalty.welcomeBonus, reason: "Ողջույնի բոնուս" });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: `Նոր անդամ՝ ${g.firstName} ${g.lastName} (${state.loyalty.programName})`, by: "Կայք" });
      return;
    }
    case "account.update": {
      const a = state.accounts.find((x) => x.id === ev.accountId);
      if (!a) return;
      if (ev.consent) a.consent = ev.consent;
      if (ev.favourites) a.favourites = ev.favourites;
      const g = state.guests.find((x) => x.id === a.guestId);
      if (g && ev.phone) g.phone = ev.phone;
      if (g && ev.preferences) g.preferences = ev.preferences;
      return;
    }
    case "booking.create": {
      const b = ev.input;
      const g = b.guestId ? state.guests.find((x) => x.id === b.guestId) ?? upsertGuest(state, b.guest, `g-${id}`) : upsertGuest(state, b.guest, `g-${id}`);
      const calc = bookingCalc(state, { ...b, guestId: g.id });
      const { at, afterHours } = displayTime(state, ev);
      const groupId = `grp-${id}`;
      const voucherOk = calc.voucherAmount > 0 ? b.voucherId : undefined;
      for (let k = 0; k < Math.max(1, b.rooms); k++) {
        const res: Reservation = {
          id: k === 0 ? `r-${id}` : `r-${id}-${k}`, code: `PR-${25000 + state.reservations.length}`, guestId: g.id, typeId: b.typeId, roomId: null,
          checkIn: b.checkIn, checkOut: b.checkOut, adults: k === 0 ? b.adults : Math.min(2, b.adults), children: k === 0 ? b.children : 0, source: ev.source, status: "inquiry",
          total: calc.perRoom, createdAt: ev.at, displayAt: at, afterHours, requests: b.requests, groupId: b.rooms > 1 ? groupId : undefined, offerId: b.offerId,
          extras: k === 0 ? b.extras.filter((x) => x.qty > 0).map((x) => ({ ...x, price: calc.lines.find((l) => l.kind === "extra" && l.label.en === (EXTRA_NAME_EN(x.id)))?.amount ?? 0 })) : undefined,
          discount: k === 0 ? calc.discount : 0, discountLabel: k === 0 && calc.discount ? calc.lines.filter((l) => l.kind === "discount").map((l) => l.label.hy).join(" · ") : undefined,
          voucherId: k === 0 ? voucherOk : undefined, payment: "unpaid",
          history: [{ at, text: b.rooms > 1 ? `Ամրագրման հարցում՝ ${b.rooms} սենյակ (կայք)` : "Ամրագրման հարցում կայքից", by: g.firstName }],
        };
        state.reservations.push(res);
      }
      if (voucherOk) voucherState(state, voucherOk, "reserved", `r-${id}`);
      const lead = state.reservations.find((r) => r.id === `r-${id}`)!;
      state.activity.unshift({ id: `a-${id}`, at, icon: "inquiry", text: `Նոր ամրագրման հարցում՝ ${roomType(b.typeId).name.hy}${b.rooms > 1 ? ` × ${b.rooms}` : ""}, ${fmt(b.checkIn)}–${fmt(b.checkOut)} (${g.firstName})`, by: "Կայք" });
      if (state.workflows.inquiry_alert) {
        state.notifications.unshift({ id: `n-${id}`, at, text: `Նոր ամրագրում կայքից՝ ${g.firstName} ${g.lastName}`, href: `/admin/reservations?open=${lead.id}`, read: false, kind: "inquiry" });
        outbox(state, { at, channel: "email", to: `${g.firstName} ${g.lastName}`, template: "Հարցումը ստացվել է (հյուրին)", text: T_RECEIVED[g.lang](vars(state, lead, g)), state: "simulated", workflowId: "inquiry_alert", reservationId: lead.id }, `ob-${id}`);
      }
      return;
    }
    case "reservation.pay": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || !["confirmed", "checked_in", "checked_out"].includes(res.status)) return;
      res.payment = "paid";
      res.history.push({ at: ev.at, text: `Վճարումը գրանցվեց ձեռքով (${ev.method})`, by: who });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "approve", text: `Վճարումը գրանցվեց՝ ${res.code} (${ev.method})`, by: who });
      return;
    }
    case "reservation.guestCancel": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || !["inquiry", "confirmed"].includes(res.status)) return;
      res.status = "cancelled";
      res.history.push({ at: ev.at, text: "Չեղարկվեց հյուրի կողմից (անձնական էջից)", by: "Հյուր" });
      voucherState(state, res.voucherId, "active");
      state.hkTasks = state.hkTasks.filter((t) => !(t.reservationId === res.id && t.status !== "done"));
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "decline", text: `Հյուրը չեղարկեց ամրագրումը՝ ${res.code}`, by: "Հյուր" });
      return;
    }
    case "loyalty.redeem": {
      const rw = state.rewards.find((x) => x.id === ev.rewardId);
      if (!rw || !accountOf(state, ev.guestId)) return;
      const lo = loyaltyOf(state, ev.guestId);
      if (lo.balance < rw.cost || tierRank(state, lo.tier.id) < tierRank(state, rw.minTier)) return;
      state.ledger.push({ id: `l-${id}`, guestId: ev.guestId, at: ev.at, points: -rw.cost, reason: `Նվեր՝ ${rw.name.hy}`, ref: `v-${id}` });
      state.vouchers.push({ id: `v-${id}`, guestId: ev.guestId, rewardId: rw.id, status: "active", createdAt: ev.at });
      return;
    }
    case "loyalty.config":
      state.loyalty = { ...state.loyalty, ...ev.patch };
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: "Լոյալության ծրագրի կարգավորումները թարմացվեցին", by: who });
      return;
    case "campaign.create":
      state.campaigns.unshift({ id: `cp-${id}`, title: { hy: ev.title, ru: ev.title, en: ev.title }, text: { hy: ev.text, ru: ev.text, en: ev.text }, tierIds: ev.tierIds, discountPct: ev.discountPct, appliesTo: ev.appliesTo, active: true, createdAt: ev.at, uses: 0 });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: `Նոր արշավ՝ ${ev.title}`, by: who });
      return;
    case "campaign.toggle": {
      const c = state.campaigns.find((x) => x.id === ev.target);
      if (c) c.active = ev.active;
      return;
    }
    case "order.create": {
      const o = ev.order;
      const items = o.items.map((i) => { const m = state.menu.items.find((x) => x.id === i.itemId)!; return { ...i, price: m ? m.price + m.options.filter((op) => i.options.includes(op.id)).reduce((s, op) => s + op.price, 0) : 0 }; }).filter((i) => i.price > 0 && i.qty > 0);
      if (!items.length) return;
      const calc = orderCalc(state, items, o.guestId, o.voucherId);
      const voucherOk = calc.voucher > 0 ? o.voucherId : undefined;
      const order = { id: `o-${id}`, code: `R-${4000 + state.orders.length}`, type: o.type, roomId: o.roomId, tableId: o.tableId, guestId: o.guestId, guestName: o.guestName || "Հյուր", phone: o.phone, items, subtotal: calc.subtotal, discount: calc.discount, total: calc.total, note: o.note, status: "submitted" as const, createdAt: ev.at, pickupTime: o.pickupTime, voucherId: voucherOk, history: [{ at: ev.at, status: "submitted" as const, by: o.guestName || "Հյուր" }] };
      state.orders.push(order);
      if (voucherOk) voucherState(state, voucherOk, "reserved", order.id);
      state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `Նոր պատվեր ${order.code}՝ ${o.type === "room_service" ? `սենյակ ${o.roomId}` : o.type === "dine_in" ? `սեղան ${o.tableId?.replace("T", "")}` : "տանելու"}`, href: "/admin/restaurant", read: false, kind: "task" });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "inquiry", text: `Նոր պատվեր ${order.code} (${calc.total.toLocaleString("en-US").replace(/,/g, " ")} ֏)`, by: o.guestName || "Հյուր" });
      return;
    }
    case "order.status": {
      const o = state.orders.find((x) => x.id === ev.target);
      if (!o || !(ORDER_FLOW[o.status] ?? []).includes(ev.status)) return; // only valid transitions
      if (ev.status === "out_for_delivery" && o.type !== "room_service") return;
      o.status = ev.status;
      if (ev.reason) o.reason = ev.reason;
      o.history.push({ at: ev.at, status: ev.status, by: who });
      if (ev.status === "accepted") voucherState(state, o.voucherId, "used");
      if (ev.status === "rejected" || ev.status === "cancelled") voucherState(state, o.voucherId, "active");
      if (ev.status === "completed" && state.loyalty.eligible.orders && accountOf(state, o.guestId)) {
        const pts = earnFor(state, o.total);
        if (pts > 0) state.ledger.push({ id: `l-${id}`, guestId: o.guestId!, at: ev.at, points: pts, reason: `Պատվեր ${o.code}`, ref: o.id });
      }
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Պատվեր ${o.code}՝ ${ORDER_STATUS_HY[ev.status]}`, by: who });
      return;
    }
    case "menu.update": {
      const m = state.menu.items.find((x) => x.id === ev.itemId);
      if (!m) return;
      if (ev.patch.price !== undefined && ev.patch.price > 0) m.price = Math.round(ev.patch.price);
      if (ev.patch.available !== undefined) m.available = ev.patch.available;
      return;
    }
    case "menu.create":
      state.menu.items.push({ id: `mi-${id}`, categoryId: ev.item.categoryId, name: { hy: ev.item.name, ru: ev.item.name, en: ev.item.name }, desc: { hy: ev.item.desc, ru: ev.item.desc, en: ev.item.desc }, price: Math.max(100, Math.round(ev.item.price)), photo: "/img/restaurant.jpg", allergens: ev.item.allergens, tags: ["new"], options: [], available: true, prepMin: 15 });
      return;
    case "service.create": {
      const meta = SERVICE_META[ev.serviceType];
      const { at } = displayTime(state, ev);
      const sr = { id: `sr-${id}`, code: `S-${2000 + state.services.length}`, type: ev.serviceType, dept: meta.dept, roomId: ev.roomId, point: ev.point, guestId: ev.guestId, note: ev.note, when: ev.when, priority: meta.priority, status: "new" as const, assigneeId: null, createdAt: ev.at, history: [{ at, text: ev.roomId ? `Հարցումը ստացվեց QR-ով (սենյակ ${ev.roomId})` : "Հարցումը ստացվեց", by: "Հյուր" }] };
      state.services.unshift(sr);
      state.notifications.unshift({ id: `n-${id}`, at, text: `${meta.staffLabel}${ev.roomId ? ` · սենյակ ${ev.roomId}` : ""}`, href: "/admin/requests", read: false, kind: "task" });
      state.activity.unshift({ id: `a-${id}`, at, icon: "task", text: `Նոր հարցում ${sr.code}՝ ${meta.staffLabel}${ev.roomId ? `, սենյակ ${ev.roomId}` : ""} → ${({ housekeeping: "Մաքրություն", maintenance: "Տեխնիկական", reception: "Ընդունարան", spa: "Սպա" } as Record<string, string>)[meta.dept] ?? meta.dept}`, by: "Հյուր" });
      return;
    }
    case "service.assign": {
      const sr = state.services.find((x) => x.id === ev.target);
      if (!sr || sr.status === "done" || sr.status === "cancelled") return;
      sr.assigneeId = ev.assigneeId;
      if (sr.status === "new" && ev.assigneeId) sr.status = "assigned";
      sr.history.push({ at: ev.at, text: `Նշանակվեց՝ ${state.staff.find((s) => s.id === ev.assigneeId)?.name ?? "—"}`, by: who });
      return;
    }
    case "service.status": {
      const sr = state.services.find((x) => x.id === ev.target);
      if (!sr || sr.status === "done" || sr.status === "cancelled") return;
      sr.status = ev.status;
      sr.history.push({ at: ev.at, text: ({ in_progress: "Ընթացքում է", done: "Կատարված է", cancelled: "Չեղարկված է", assigned: "Նշանակված է", new: "Վերաբացված" } as Record<string, string>)[ev.status], by: who });
      if (ev.status === "done") state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Կատարված է ${sr.code}՝ ${SERVICE_META[sr.type].staffLabel}${sr.roomId ? `, սենյակ ${sr.roomId}` : ""}`, by: who });
      return;
    }
    case "employee.create": {
      const sid = `s-${id}`;
      const role = ev.dept === "housekeeping" ? "housekeeping" : ev.dept === "maintenance" ? "maintenance" : ev.dept === "management" ? "manager" : "reception";
      const s: Staff = { id: sid, name: ev.name.trim(), role, initials: initials(ev.name), phone: ev.phone, shift: "09:00–18:00", dept: ev.dept, position: ev.position, supervisorId: ev.supervisorId, active: true, email: ev.email, startedAt: state.baseDate };
      state.staff.push(s);
      enroll(state, s, ev.at);
      state.channels.push({ id: `dm-${sid}-${ev.supervisorId ?? "s-narek"}`, kind: "direct", name: "", members: [sid, ev.supervisorId ?? "s-narek"] });
      state.messages.push({ id: `m-${id}`, channelId: `dm-${sid}-${ev.supervisorId ?? "s-narek"}`, authorId: ev.supervisorId ?? "s-narek", text: `Բարի գալուստ թիմ, ${s.name.split(" ")[0]}։ Ձեր ուսուցման ծրագիրը պատրաստ է «Ուսուցում» բաժնում։ Հարցերի դեպքում գրեք ինձ։`, at: ev.at });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: `Նոր աշխատակից՝ ${s.name}. ստեղծվեց ուսուցման ծրագիր`, by: who });
      return;
    }
    case "employee.toggle": {
      const s = state.staff.find((x) => x.id === ev.target);
      if (s) s.active = ev.active;
      return;
    }
    case "training.step": {
      const e = state.enrollments.find((x) => x.id === ev.enrollmentId);
      const m = e && state.training.find((x) => x.id === e.moduleId);
      const step = m?.steps.find((x) => x.id === ev.stepId);
      if (!e || !step || e.status === "approved" || e.status === "submitted") return;
      if (step.kind === "quiz") {
        e.scores[step.id] = ev.score ?? 0;
        if ((ev.score ?? 0) < 70) return; // a quiz counts as done only at ≥ 70%
      }
      if (!e.done.includes(step.id)) e.done.push(step.id);
      return;
    }
    case "training.submit": {
      const e = state.enrollments.find((x) => x.id === ev.enrollmentId);
      const m = e && state.training.find((x) => x.id === e.moduleId);
      if (!e || !m || !m.steps.every((st) => e.done.includes(st.id))) return;
      e.status = "submitted";
      const s = state.staff.find((x) => x.id === e.employeeId);
      state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `${s?.name} ավարտեց «${m.title}» մոդուլը. սպասում է ստուգման`, href: "/admin/team", read: false, kind: "task" });
      return;
    }
    case "training.review": {
      const e = state.enrollments.find((x) => x.id === ev.enrollmentId);
      if (!e || e.status !== "submitted") return;
      e.status = ev.approved ? "approved" : "changes_requested";
      e.reviewNote = ev.note;
      if (!ev.approved) e.done = e.done.filter((d) => !state.training.find((m) => m.id === e.moduleId)?.steps.find((st) => st.id === d && st.kind === "quiz"));
      const s = state.staff.find((x) => x.id === e.employeeId);
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "note", text: `${s?.name}՝ ուսուցման մոդուլը ${ev.approved ? "հաստատվեց" : "վերադարձվեց լրամշակման"}`, by: who });
      if (e.status === "changes_requested") e.status = "in_progress";
      return;
    }
    case "training.module": {
      const m: TrainingModule = { id: `tm-${id}`, title: ev.title, dept: ev.dept, positions: ev.positions, minutes: 10, custom: true, steps: [{ id: `${id}-l`, kind: "lesson", title: ev.title, body: ev.lesson }, ...(ev.checklist.length ? [{ id: `${id}-c`, kind: "checklist" as const, title: "Ստուգաթերթ", items: ev.checklist }] : [])] };
      state.training.push(m);
      for (const s of state.staff.filter((x) => x.active)) enroll(state, s, ev.at, [m]);
      return;
    }
    case "msg.send": {
      if (!ev.text.trim() || !state.channels.some((c) => c.id === ev.channelId)) return;
      state.messages.push({ id: `m-${id}`, channelId: ev.channelId, authorId: ev.by, text: ev.text.trim().slice(0, 1200), at: ev.at, urgent: ev.urgent, handover: ev.handover });
      return;
    }
    case "channel.open":
      if (!state.channels.some((c) => c.id === ev.channel.id)) state.channels.push(ev.channel);
      return;
  }
}

const EXTRA_NAME_EN = (id: string) => ({ transfer: "Airport transfer", spa: "Spa ritual for two", late: "Late check-out until 16:00", romance: "Romantic set-up", ski: "Ski pack" } as Record<string, string>)[id];
export { TRAINING };
