/*
 * The demo's single source of truth: state = replay(seed(baseDate), events).
 * Every device replays the same ordered events, so the guest's phone, the dashboard and the
 * presenter always agree. Automations run inside the reducer and are deterministic.
 *
 * External messages are NEVER sent: they are written to the outbox as "simulated"/"scheduled".
 */
import { addDays, atTime, diffDays } from "./dates.ts";
import { roomType } from "./hotel-data.ts";
import { quote, roomIsFree } from "./pricing.ts";
import { createSeed } from "./seed.ts";
import type { Guest, GuestInput, HotelState, Lang, OutboxItem, Reservation, StampedEvent } from "./types.ts";

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
      const m = state.maint.find((x) => x.id === ev.id);
      if (!m) return state;
      m.status = ev.status;
      if (ev.status === "resolved") m.resolvedAt = ev.at;
      m.log.push({ at: ev.at, text: ev.status === "resolved" ? "Ավարտված է" : ev.status === "in_progress" ? "Աշխատանքը սկսված է" : "Վերաբացվեց", by: who });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "maint", text: `${m.title}. ${ev.status === "resolved" ? "ավարտված է" : "ընթացքում է"}`, by: who });
      return state;
    }
    case "maint.assign": {
      const m = state.maint.find((x) => x.id === ev.id);
      if (m) m.assigneeId = ev.assigneeId;
      return state;
    }
    case "staffTask.create":
      state.staffTasks.unshift({ id: `st-${id}`, title: ev.title, detail: ev.detail, assigneeId: ev.assigneeId, priority: ev.priority, due: ev.due, status: "todo", createdAt: ev.at, origin: "manual" });
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "task", text: `Նոր առաջադրանք՝ ${ev.title}`, by: who });
      return state;
    case "staffTask.status": {
      const t = state.staffTasks.find((x) => x.id === ev.id);
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
      state.workflows[ev.id] = ev.on;
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "auto", text: `Ավտոմատացում «${ev.id}»՝ ${ev.on ? "միացված" : "անջատված"}`, by: who });
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
  }
  return state;
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
  const s = createSeed(baseDate);
  const seen = new Set<string>();
  for (const e of events) {
    if (seen.has(e.id)) continue; // at-least-once delivery → apply each event once
    seen.add(e.id);
    apply(s, e);
  }
  s.reservations.sort((a, b) => (b.displayAt ?? b.createdAt) - (a.displayAt ?? a.createdAt));
  return s;
}
