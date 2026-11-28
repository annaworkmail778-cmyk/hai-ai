/*
 * Reducer for Hotel OS operations events (inbox, reviews, channel manager, folio, room moves, lost & found)
 * plus idempotent automations. Called from engine.ts. Deterministic: same events → same state on every device.
 * Nothing here sends anything externally: outbound inbox replies are stored as "simulated".
 */
import { classify, detectLang, routeDept } from "./ai/inbox-ai.ts";
import { analyseReview, REPLY_API } from "./ai/review-ai.ts";
import { COMMISSION_PCT } from "./channel-adapters.ts";
import { freeRooms, quote, roomIsFree } from "./pricing.ts";
import type { HotelState, StampedEvent, WorkflowId } from "./types.ts";
import { afterApprove, upsertGuest } from "./engine.ts";

/** Runs an automation at most once per idempotency key (protects against re-delivered sync events / retries). */
export function runAuto(state: HotelState, rule: WorkflowId, key: string, at: number, text: string, act: () => void) {
  if (!state.workflows[rule]) return false;
  if (state.autoLog.some((x) => x.key === key)) return false;
  act();
  state.autoLog.unshift({ id: `al-${state.autoLog.length + 1}-${key}`, key, rule, at, text });
  state.activity.unshift({ id: `aa-${key}`, at: at + 1, icon: "auto", text, by: "Ավտոմատացում", automated: true });
  return true;
}

const gm = (state: HotelState) => state.staff.find((s) => s.position === "general_manager")?.id ?? null;

export function applyOps(state: HotelState, ev: StampedEvent, who: string): boolean {
  const id = ev.id;
  switch (ev.type) {
    /* ---------------- unified inbox ---------------- */
    case "inbox.inbound": {
      const text = ev.text.trim().slice(0, 2000);
      if (!text) return true;
      const c = classify(text);
      let t = state.inbox.find((x) => x.id === ev.threadId);
      if (!t) {
        t = { id: ev.threadId, channel: ev.channel, contact: { ...ev.contact, lang: ev.contact.lang ?? detectLang(text) }, guestId: ev.guestId, reservationId: ev.reservationId, status: "new", priority: "normal", assigneeId: null, dept: routeDept(c.intents), tags: [], messages: [], createdAt: ev.at, lastInboundAt: ev.at, audit: [{ at: ev.at, text: "Զրույցը ստացվեց (սիմուլյացված ալիք)", by: "Համակարգ" }] };
        state.inbox.unshift(t);
      } else if (t.status === "resolved") { t.status = "open"; t.audit.push({ at: ev.at, text: "Վերաբացվեց նոր հաղորդագրությամբ", by: "Համակարգ" }); }
      t.messages.push({ id: `im-${id}`, dir: "in", text, at: ev.at });
      t.lastInboundAt = ev.at;
      if (c.risk === "high" && c.intents.some((i) => ["refund", "payment", "complaint", "medical", "legal", "maintenance"].includes(i))) {
        const thread = t;
        runAuto(state, "inbox_escalation", `inbox_escalation:${thread.id}:${thread.messages.length}`, ev.at, `Բարձր ռիսկի հաղորդագրություն (${c.intents.join(", ")}) → ղեկավարին ծանուցում`, () => {
          thread.priority = c.intents.includes("medical") ? "urgent" : "high";
          thread.dept = routeDept(c.intents);
          state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `Ուշադրություն՝ ${thread.contact.name} (${thread.channel}) — ${c.intents.join(", ")}`, href: `/admin/inbox?t=${thread.id}`, read: false, kind: "handoff" });
        });
      }
      return true;
    }
    case "inbox.reply": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (!t || !ev.text.trim()) return true;
      t.messages.push({ id: `im-${id}`, dir: "out", text: ev.text.trim().slice(0, 2000), at: ev.at, by: ev.by, ai: ev.ai });
      if (!t.firstResponseAt) t.firstResponseAt = ev.at;
      if (t.status === "new") t.status = "open";
      if (!t.assigneeId && state.staff.some((s) => s.id === ev.by)) t.assigneeId = ev.by;
      t.audit.push({ at: ev.at, text: ev.ai ? "Ուղարկվեց AI սևագիրը՝ աշխատակցի հաստատմամբ (սիմուլյացիա)" : "Պատասխան ուղարկվեց (սիմուլյացիա)", by: who });
      return true;
    }
    case "inbox.note": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (t && ev.text.trim()) { t.messages.push({ id: `im-${id}`, dir: "note", text: ev.text.trim(), at: ev.at, by: ev.by }); t.audit.push({ at: ev.at, text: "Ներքին նշում", by: who }); }
      return true;
    }
    case "inbox.assign": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (!t) return true;
      t.assigneeId = ev.assigneeId;
      if (ev.dept) t.dept = ev.dept;
      if (t.status === "new" && ev.assigneeId) t.status = "open";
      t.audit.push({ at: ev.at, text: `Նշանակվեց՝ ${state.staff.find((s) => s.id === ev.assigneeId)?.name ?? "—"}${ev.dept ? ` · բաժին՝ ${ev.dept}` : ""}`, by: who });
      return true;
    }
    case "inbox.status": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (t && t.status !== ev.status) { t.status = ev.status; t.audit.push({ at: ev.at, text: `Կարգավիճակ՝ ${ev.status}`, by: who }); }
      return true;
    }
    case "inbox.tag": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (t) t.tags = ev.on ? [...new Set([...t.tags, ev.tag.trim().slice(0, 30)])] : t.tags.filter((x) => x !== ev.tag);
      return true;
    }
    case "inbox.escalate": {
      const t = state.inbox.find((x) => x.id === ev.threadId);
      if (!t) return true;
      t.escalated = true; t.priority = "high"; t.assigneeId = gm(state);
      t.audit.push({ at: ev.at, text: `Փոխանցվեց ղեկավարին՝ ${ev.reason}`, by: who });
      state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `Էսկալացիա՝ ${t.contact.name}. ${ev.reason}`, href: `/admin/inbox?t=${t.id}`, read: false, kind: "handoff" });
      return true;
    }

    /* ---------------- reviews ---------------- */
    case "review.add": {
      const rv = { ...ev.review, id: `rv-${id}`, at: ev.at, status: "new" as const };
      state.reviews.unshift(rv);
      const a = analyseReview(rv);
      if (rv.rating <= 3) runAuto(state, "negative_review_task", `negative_review:${rv.id}`, ev.at, `Բացասական կարծիք (${rv.rating}/5, ${rv.platform}) → առաջադրանք ղեկավարին`, () => {
        state.staffTasks.unshift({ id: `st-${id}`, title: `Պատասխանել կարծիքին (${rv.rating}/5) և ստուգել՝ ${a.negatives.join(", ") || "դժգոհություն"}`, detail: rv.text.slice(0, 160), assigneeId: gm(state), priority: "high", due: state.baseDate, status: "todo", createdAt: ev.at, origin: "automation" });
        (rv as { taskId?: string }).taskId = `st-${id}`;
        state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: `Նոր բացասական կարծիք՝ ${rv.platform}, ${rv.rating}/5`, href: `/admin/reviews?r=${rv.id}`, read: false, kind: "task" });
      });
      return true;
    }
    case "review.draft": {
      const rv = state.reviews.find((x) => x.id === ev.target);
      if (!rv || rv.status === "published_demo") return true;
      rv.reply = { text: ev.text.trim().slice(0, 3000), by: ev.by, at: ev.at };
      rv.status = "draft";
      return true;
    }
    case "review.approve": {
      const rv = state.reviews.find((x) => x.id === ev.target);
      if (!rv || !rv.reply || rv.status !== "draft") return true;
      const actor = state.staff.find((s) => s.id === ev.by);
      if (actor && !["owner", "general_manager", "reception_manager"].includes(actor.position)) return true; // approval needs a manager role
      rv.reply.approvedBy = ev.by; rv.reply.approvedAt = ev.at;
      rv.status = REPLY_API[rv.platform] ? "published_demo" : "manual_required";
      return true;
    }

    /* ---------------- channel manager (demo adapter) ---------------- */
    case "ota.import": {
      const b = ev.booking;
      if (!b.externalId || b.checkOut <= b.checkIn) return true;
      const existing = state.reservations.find((r) => r.external?.channel === b.channel && r.external.externalId === b.externalId);
      if (existing) {
        const same = existing.checkIn === b.checkIn && existing.checkOut === b.checkOut && existing.typeId === b.typeId && existing.adults === b.adults;
        if (same) { state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: b.channel, op: "duplicate", externalId: b.externalId, result: "ignored", text: "Կրկնակի ստացում․ արդեն ներմուծված է (idempotent)", reservationId: existing.id }); return true; }
        if (["cancelled", "checked_out", "no_show"].includes(existing.status)) { state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: b.channel, op: "modify", externalId: b.externalId, result: "failed", text: `Փոփոխություն փակված ամրագրման համար (${existing.status})`, reservationId: existing.id }); return true; }
        existing.checkIn = b.checkIn; existing.checkOut = b.checkOut; existing.typeId = b.typeId; existing.adults = b.adults; existing.children = b.children; existing.total = b.total;
        existing.external!.version++; existing.external!.lastSyncAt = ev.at;
        const keep = existing.roomId && roomIsFree(state, existing.roomId, b.checkIn, b.checkOut, existing.id) && state.rooms.find((r) => r.id === existing.roomId)?.typeId === b.typeId;
        if (!keep) existing.roomId = freeRooms(state, b.typeId, b.checkIn, b.checkOut, existing.id)[0] ?? null;
        existing.external!.syncState = existing.roomId ? "synced" : "conflict";
        existing.history.push({ at: ev.at, text: `Փոփոխվեց ${b.channel}-ի կողմից (տարբերակ ${existing.external!.version})`, by: "Ալիքների կառավարիչ" });
        state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: b.channel, op: "modify", externalId: b.externalId, result: existing.roomId ? "ok" : "conflict", text: existing.roomId ? `Փոփոխությունը կիրառվեց (${existing.code})` : `Կոնֆլիկտ․ նոր ամսաթվերին ազատ սենյակ չկա (${existing.code})`, reservationId: existing.id });
        return true;
      }
      const g = upsertGuest(state, b.guest, `g-${id}`);
      const roomId = freeRooms(state, b.typeId, b.checkIn, b.checkOut)[0] ?? null;
      const res = {
        id: `r-${id}`, code: `PR-${25000 + state.reservations.length}`, guestId: g.id, typeId: b.typeId, roomId, checkIn: b.checkIn, checkOut: b.checkOut,
        adults: b.adults, children: b.children, source: b.channel, status: "confirmed" as const, total: b.total || quote(b.typeId, b.checkIn, b.checkOut).total,
        createdAt: ev.at, requests: "", history: [{ at: ev.at, text: `Ներմուծվեց ${b.channel}-ից (${b.externalId})`, by: "Ալիքների կառավարիչ" }],
        external: { channel: b.channel, externalId: b.externalId, version: 1, syncState: roomId ? ("synced" as const) : ("conflict" as const), lastSyncAt: ev.at, commissionPct: COMMISSION_PCT[b.channel] },
      };
      state.reservations.push(res);
      state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: b.channel, op: "import", externalId: b.externalId, result: roomId ? "ok" : "conflict", text: roomId ? `Ներմուծվեց և նշանակվեց սենյակ ${roomId} (${res.code})` : `Կոնֆլիկտ․ «${b.typeId}» տեսակի ազատ սենյակ չկա — պահանջվում է ձեռքով լուծում (${res.code})`, reservationId: res.id });
      // a failed earlier attempt for the same external id is now resolved
      for (const l of state.syncLog) if (l.externalId === b.externalId && l.result === "failed") l.result = "ignored";
      runAuto(state, "ota_booking_alert", `ota_booking:${b.channel}:${b.externalId}`, ev.at, `Նոր ամրագրում ${b.channel}-ից → ծանուցում ընդունարանին`, () => {
        state.notifications.unshift({ id: `n-${id}`, at: ev.at, text: roomId ? `Նոր ամրագրում ${b.channel}-ից՝ ${g.firstName} ${g.lastName}, ${b.checkIn}` : `ԿՈՆՖԼԻԿՏ՝ ${b.channel} ամրագրում առանց ազատ սենյակի (${res.code})`, href: `/admin/reservations?open=${res.id}`, read: false, kind: "inquiry" });
      });
      if (roomId) afterApprove(state, res, g, id, ev.at, "Ալիքների կառավարիչ");
      return true;
    }
    case "ota.cancel": {
      const res = state.reservations.find((r) => r.external?.channel === ev.channel && r.external.externalId === ev.externalId);
      if (!res) { state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: ev.channel, op: "cancel", externalId: ev.externalId, result: "failed", text: "Չեղարկում անհայտ ամրագրման համար" }); return true; }
      if (res.status === "cancelled") { state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: ev.channel, op: "duplicate", externalId: ev.externalId, result: "ignored", text: "Արդեն չեղարկված է (idempotent)", reservationId: res.id }); return true; }
      if (res.status === "checked_in" || res.status === "checked_out") { state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: ev.channel, op: "cancel", externalId: ev.externalId, result: "conflict", text: "Ալիքը չեղարկում է արդեն ժամանած հյուրի ամրագրումը․ ստուգեք ձեռքով", reservationId: res.id }); res.external!.syncState = "conflict"; return true; }
      res.status = "cancelled"; res.external!.lastSyncAt = ev.at; res.external!.syncState = "synced";
      res.history.push({ at: ev.at, text: `Չեղարկվեց ${ev.channel}-ի կողմից`, by: "Ալիքների կառավարիչ" });
      state.hkTasks = state.hkTasks.filter((t) => !(t.reservationId === res.id && t.status !== "done"));
      state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: ev.channel, op: "cancel", externalId: ev.externalId, result: "ok", text: `Չեղարկվեց (${res.code}), սենյակը ազատվեց`, reservationId: res.id });
      return true;
    }
    case "ota.resolve": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res?.external || res.external.syncState !== "conflict") return true;
      if (!roomIsFree(state, ev.roomId, res.checkIn, res.checkOut, res.id)) return true;
      res.roomId = ev.roomId; res.external.syncState = "synced";
      res.history.push({ at: ev.at, text: `Կոնֆլիկտը լուծվեց՝ սենյակ ${ev.roomId}`, by: who });
      state.syncLog.unshift({ id: `sl-${id}`, at: ev.at, channel: res.external.channel, op: "modify", externalId: res.external.externalId, result: "ok", text: `Կոնֆլիկտը լուծվեց ձեռքով՝ սենյակ ${ev.roomId}`, reservationId: res.id });
      return true;
    }

    /* ---------------- front desk ---------------- */
    case "reservation.move": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || !["confirmed", "checked_in"].includes(res.status) || res.roomId === ev.roomId) return true;
      if (!state.rooms.some((r) => r.id === ev.roomId)) return true;
      const from = res.checkIn < state.baseDate && res.status === "checked_in" ? state.baseDate : res.checkIn;
      if (!roomIsFree(state, ev.roomId, from, res.checkOut, res.id)) return true;
      const old = res.roomId;
      res.roomId = ev.roomId;
      res.history.push({ at: ev.at, text: `Տեղափոխվեց ${old ?? "—"} → ${ev.roomId}${ev.reason ? ` (${ev.reason})` : ""}`, by: who });
      if (old && res.status === "checked_in") {
        state.hk[old] = "dirty";
        state.hkTasks.unshift({ id: `hk-${id}`, roomId: old, kind: "checkout", status: "todo", priority: "high", assigneeId: null, due: state.baseDate, reservationId: res.id, createdAt: ev.at, auto: true, note: "Հյուրը տեղափոխվեց այլ սենյակ" });
      }
      state.activity.unshift({ id: `a-${id}`, at: ev.at, icon: "room", text: `Սենյակի փոփոխություն՝ ${res.code}: ${old ?? "—"} → ${ev.roomId}`, by: who });
      return true;
    }
    case "reservation.noshow": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      if (!res || res.status !== "confirmed" || res.checkIn > state.baseDate) return true; // only on/after the arrival date
      res.status = "no_show";
      res.history.push({ at: ev.at, text: "Նշվեց «չներկայացավ» (no-show)", by: who });
      state.hkTasks = state.hkTasks.filter((t) => !(t.reservationId === res.id && t.status !== "done"));
      return true;
    }
    case "folio.add": {
      const res = state.reservations.find((r) => r.id === ev.reservationId);
      const amount = Math.round(Math.abs(ev.amount));
      if (!res || !amount || amount > 10_000_000 || !ev.label.trim()) return true;
      (res.folio ??= []).push({ id: `fl-${id}`, at: ev.at, kind: ev.kind, label: ev.label.trim().slice(0, 80), amount, method: ev.method, by: who });
      if (ev.kind === "payment" || ev.kind === "deposit") { if (folioOf(res).balance <= 0) res.payment = "paid"; }
      if (ev.kind === "charge" && folioOf(res).balance > 0) res.payment = "unpaid";
      return true;
    }

    /* ---------------- lost & found ---------------- */
    case "lost.create":
      if (ev.item.trim()) state.lostFound.unshift({ id: `lf-${id}`, roomId: ev.roomId, item: ev.item.trim().slice(0, 80), foundAt: ev.at, foundBy: ev.by, status: "stored", note: ev.note });
      return true;
    case "lost.status": {
      const x = state.lostFound.find((l) => l.id === ev.target);
      if (x) x.status = ev.status;
      return true;
    }
  }
  return false;
}

/** Folio = booking (room + extras − discount) + posted charges − payments/deposits + refunds. Paid restaurant orders to the room are included as charges. */
export function folioOf(res: import("./types.ts").Reservation, orders: import("./types.ts").Order[] = []) {
  const lines: { label: string; amount: number; kind: "charge" | "credit" }[] = [{ label: "Կեցություն", amount: res.total, kind: "charge" }];
  for (const x of res.extras ?? []) lines.push({ label: `Լրացուցիչ՝ ${x.id}`, amount: x.price, kind: "charge" });
  if (res.discount) lines.push({ label: res.discountLabel ?? "Զեղչ", amount: -res.discount, kind: "credit" });
  for (const o of orders) if (o.status === "completed") lines.push({ label: `Սենյակային սպասարկում ${o.code}`, amount: o.total, kind: "charge" });
  for (const f of res.folio ?? []) lines.push({ label: `${f.label}${f.method ? ` · ${f.method}` : ""}`, amount: f.kind === "charge" || f.kind === "refund" ? f.amount : -f.amount, kind: f.kind === "charge" || f.kind === "refund" ? "charge" : "credit" });
  const charges = res.total + (res.extras ?? []).reduce((a, x) => a + x.price, 0) - (res.discount ?? 0)
    + orders.filter((o) => o.status === "completed").reduce((a, o) => a + o.total, 0)
    + (res.folio ?? []).filter((f) => f.kind === "charge").reduce((a, f) => a + f.amount, 0);
  const sum = (k: string) => (res.folio ?? []).filter((f) => f.kind === k).reduce((a, f) => a + f.amount, 0);
  let paid = sum("payment") + sum("deposit") - sum("refund");
  if (res.payment === "paid" && !(res.folio ?? []).some((f) => f.kind === "payment" || f.kind === "deposit")) paid = charges; // legacy "record payment" (whole amount)
  return { lines, charges, paid, balance: charges - paid };
}
