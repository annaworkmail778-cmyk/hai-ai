"use client";
/*
 * Host workspace (tablet): tonight's reservations, incoming requests with suggested tables (no double booking —
 * the domain rejects overlapping assignments), waitlist with quoted times, walk-ins, no-shows and reminders.
 * Reminders are simulated (no SMS / WhatsApp provider connected) and labelled as such.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Guard, hm, mins, TopBar, useNow } from "@/components/restaurant/staff/shell";
import { LangSwitch, TablePicker } from "@/components/restaurant/staff/waiter";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { RES_BUFFER_MIN, slotsFor, suggestTables } from "@/lib/restaurant/ops";
import { useStaffLang } from "@/lib/restaurant/staff-t";
import type { Reservation } from "@/lib/restaurant/types";

const dayOf = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(ms);
const ST_TONE: Record<Reservation["status"], string> = { requested: "bg-signal-soft text-signal", confirmed: "bg-info-soft text-info", seated: "bg-ok-soft text-ok", completed: "bg-black/[0.05] text-muted", declined: "bg-bad-soft text-bad", cancelled: "bg-bad-soft text-bad", no_show: "bg-warn-soft text-warn" };
const inputCls = "h-11 w-full rounded-xl border border-line-2 bg-surface px-3 text-[15px]";

export default function Host() {
  const { state, dispatch } = useR();
  const L = useStaffLang();
  const now = useNow(15000);
  const today = dayOf(now);
  const tomorrow = dayOf(now + 86400000);
  const [day, setDay] = useState(today);
  const [picker, setPicker] = useState<null | { kind: "res"; id: string } | { kind: "wait"; id: string } | { kind: "walk"; party: number }>(null);
  const [form, setForm] = useState<null | { name: string; phone: string; party: number; time: string; allergies: string; note: string }>(null);
  const [wl, setWl] = useState({ name: "", phone: "", party: 2 });
  const [walk, setWalk] = useState(2);
  const [toast, setToast] = useState("");
  const label = (ids: string[]) => ids.map((id) => state.tables.find((t) => t.id === id)?.label).join(" + ");
  const list = state.reservations.filter((r) => dayOf(r.at) === day).sort((a, b) => a.at - b.at);
  const requests = list.filter((r) => r.status === "requested");
  const upcoming = list.filter((r) => r.status === "confirmed");
  const done = list.filter((r) => !["requested", "confirmed"].includes(r.status));
  const waiting = state.waitlist.filter((w) => w.status === "waiting" || w.status === "notified");
  const covers = list.filter((r) => ["confirmed", "seated", "completed"].includes(r.status)).reduce((a, r) => a + r.partySize, 0);
  const slots = useMemo(() => (form ? slotsFor(state, day, form.party) : []), [state, day, form]);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 3500); };

  const Row = ({ r }: { r: Reservation }) => {
    const sug = r.status === "requested" ? suggestTables(state, r.at, r.partySize, r.durationMin, r.id) : null;
    const late = r.status === "confirmed" && now > r.at + RES_BUFFER_MIN * 60000;
    return (
      <li className={cn("rounded-2xl border bg-surface p-3", late ? "border-warn/50" : "border-line")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum text-[20px] font-bold">{hm(r.at)}</span>
          <span className="text-[16px] font-semibold">{r.name}{r.vip ? " ★" : ""}</span>
          <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[13px] font-semibold"><Icon name="users" size={13} className="mr-1 inline" />{r.partySize}</span>
          {r.tableIds.length > 0 && <span className="rounded-md bg-ink px-1.5 py-0.5 text-[13px] font-semibold text-white">{label(r.tableIds)}</span>}
          <span className={cn("ml-auto rounded-md px-1.5 py-0.5 text-[12px] font-semibold", ST_TONE[r.status])}>{r.status}</span>
        </div>
        <div className="mt-1 text-[13px] text-muted">{r.code} · {L.t("source")}: {r.source}{r.occasion ? ` · ${r.occasion}` : ""}{r.note ? ` · ${r.note}` : ""}{r.reminded ? " · ✓ SMS (sim)" : ""}</div>
        {r.allergies && <div className="mt-1 text-[13px] font-semibold text-bad">⚠ {r.allergies}</div>}
        {late && <div className="mt-1 text-[13px] font-medium text-warn">+{mins(r.at, now)}′</div>}
        <div className="mt-2 flex flex-wrap gap-2">
          {r.status === "requested" && <>
            {sug ? <button className="h-11 rounded-xl bg-ok px-3 text-[14px] font-semibold text-white" onClick={() => dispatch({ type: "reservation.confirm", reservationId: r.id, tableIds: sug })}><Icon name="check" size={15} className="mr-1 inline" />{L.t("confirm")} · {label(sug)}</button>
              : <span className="self-center text-[13px] font-medium text-bad">{L.t("noAvailability")}</span>}
            <button className="h-11 rounded-xl border border-line-2 px-3 text-[14px]" onClick={() => setPicker({ kind: "res", id: r.id })}>{L.t("chooseTable")}</button>
            <button className="h-11 rounded-xl border border-bad/40 px-3 text-[14px] text-bad" onClick={() => { const why = prompt(L.t("reason")); if (why) dispatch({ type: "reservation.decline", reservationId: r.id, reason: why }); }}>{L.t("decline")}</button>
          </>}
          {r.status === "confirmed" && <>
            <button className="h-11 rounded-xl bg-ink px-3 text-[14px] font-semibold text-white" onClick={() => dispatch({ type: "reservation.seat", reservationId: r.id })}><Icon name="users" size={15} className="mr-1 inline" />{L.t("seatNow")}</button>
            {!r.reminded && <button className="h-11 rounded-xl border border-line-2 px-3 text-[14px]" onClick={() => { dispatch({ type: "reservation.remind", reservationId: r.id }); flash(L.t("remindSim")); }}>{L.t("remind")}</button>}
            <button className="h-11 rounded-xl border border-line-2 px-3 text-[14px]" onClick={() => setPicker({ kind: "res", id: r.id })}>{L.t("modify")}</button>
            <button disabled={!late} title={L.t("noShowAfter")} className="h-11 rounded-xl border border-warn/40 px-3 text-[14px] text-warn disabled:opacity-40" onClick={() => dispatch({ type: "reservation.noShow", reservationId: r.id })}>{L.t("noShow")}</button>
            <button className="h-11 rounded-xl px-3 text-[14px] text-muted" onClick={() => { const why = prompt(L.t("reason")); if (why) dispatch({ type: "reservation.cancel", reservationId: r.id, reason: why }); }}>{L.t("cancel")}</button>
          </>}
        </div>
      </li>
    );
  };

  return (
    <Guard perm="reservations.manage">
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur">
          <Link href="/r/admin" className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">R<span className="text-signal">.</span></Link>
          <div className="min-w-0 flex-1 truncate text-[14px] font-semibold">{L.t("host")}</div>
          <Link href="/r/floor" className="hidden h-9 items-center rounded-lg border border-line-2 px-3 text-[13px] sm:flex">{L.t("allTables")}</Link>
          <LangSwitch lang={L.lang} setLang={L.setLang} />
          <TopBar compact />
        </header>
        <div className="mx-auto grid max-w-6xl gap-4 p-3 sm:p-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {[today, tomorrow].map((d) => <button key={d} onClick={() => setDay(d)} className={cn("h-10 rounded-lg px-4 text-[14px] font-semibold", day === d ? "bg-ink text-white" : "border border-line bg-surface")}>{d === today ? L.t("today") : L.t("tomorrow")}</button>)}
              <span className="text-[13px] text-muted">{list.length} · {covers} {L.t("guests")}</span>
              <button className="ml-auto h-10 rounded-lg bg-signal px-4 text-[14px] font-semibold text-white" onClick={() => setForm({ name: "", phone: "+374 ", party: 2, time: "", allergies: "", note: "" })}><Icon name="plus" size={15} className="mr-1 inline" />{L.t("newRes")}</button>
            </div>
            {form && (
              <div className="rounded-2xl border border-signal/40 bg-surface p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input className={inputCls} placeholder={L.t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className={inputCls} placeholder={L.t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <select className={inputCls} value={form.party} onChange={(e) => setForm({ ...form, party: Number(e.target.value), time: "" })} aria-label={L.t("party")}>{Array.from({ length: 14 }, (_, i) => <option key={i} value={i + 1}>{i + 1} {L.t("guests")}</option>)}</select>
                  <input className={inputCls} placeholder={L.t("allergies")} value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
                  <input className={cn(inputCls, "sm:col-span-2")} placeholder={L.t("note")} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5" aria-label={L.t("time")}>{slots.filter((x) => x.at > now).map((x) => { const t = hm(x.at); return <button key={x.at} disabled={!x.ok} onClick={() => setForm({ ...form, time: String(x.at) })} className={cn("h-9 rounded-lg border px-2.5 text-[13px] tnum", form.time === String(x.at) ? "border-ink bg-ink text-white" : x.ok ? "border-line-2" : "border-line text-faint line-through")}>{t}</button>; })}</div>
                <div className="mt-2 flex gap-2">
                  <button disabled={!form.name.trim() || !form.time} className="h-11 rounded-xl bg-ink px-4 text-[14px] font-semibold text-white disabled:opacity-40" onClick={() => { dispatch({ type: "reservation.request", name: form.name, phone: form.phone, partySize: form.party, at: Number(form.time), allergies: form.allergies || undefined, note: form.note || undefined, source: "phone" }); setForm(null); }}>{L.t("create")}</button>
                  <button className="h-11 rounded-xl px-4 text-[14px] text-muted" onClick={() => setForm(null)}>{L.t("close")}</button>
                </div>
              </div>
            )}
            {requests.length > 0 && <section><h2 className="mb-2 text-[14px] font-semibold text-signal">{L.t("requests")} · {requests.length}</h2><ul className="space-y-2">{requests.map((r) => <Row key={r.id} r={r} />)}</ul></section>}
            <section><h2 className="mb-2 text-[14px] font-semibold">{day === today ? L.t("tonight") : L.t("tomorrow")} · {upcoming.length}</h2>{upcoming.length ? <ul className="space-y-2">{upcoming.map((r) => <Row key={r.id} r={r} />)}</ul> : <p className="text-[13px] text-muted">—</p>}</section>
            {done.length > 0 && <section><h2 className="mb-2 text-[14px] font-semibold text-muted">{L.t("finished")} · {done.length}</h2><ul className="space-y-2 opacity-80">{done.map((r) => <Row key={r.id} r={r} />)}</ul></section>}
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-line bg-surface p-3">
              <h2 className="text-[14px] font-semibold">{L.t("walkIn")}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5, 6, 8].map((x) => <button key={x} onClick={() => setWalk(x)} className={cn("h-10 w-10 rounded-lg border text-[14px] font-semibold", walk === x ? "border-ink bg-ink text-white" : "border-line-2")}>{x}</button>)}</div>
              {(() => { const sug = suggestTables(state, now, walk); return (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {sug ? <button className="h-11 rounded-xl bg-ok px-3 text-[14px] font-semibold text-white" onClick={() => dispatch({ type: "table.open", tableId: sug[0], partySize: walk })}>{L.t("seatNow")} · {label(sug.slice(0, 1))}</button> : <span className="text-[13px] text-bad">{L.t("noAvailability")}</span>}
                  <button className="h-11 rounded-xl border border-line-2 px-3 text-[14px]" onClick={() => setPicker({ kind: "walk", party: walk })}>{L.t("chooseTable")}</button>
                </div>
              ); })()}
            </section>
            <section className="rounded-2xl border border-line bg-surface p-3">
              <h2 className="text-[14px] font-semibold">{L.t("waitlist")} · {waiting.length}</h2>
              <ul className="mt-2 space-y-2">{waiting.map((w) => (
                <li key={w.id} className="rounded-xl border border-line p-2">
                  <div className="flex items-center gap-2 text-[14px]"><span className="font-semibold">{w.name}</span><span className="text-muted">· {w.partySize}</span><span className="tnum ml-auto text-[13px] text-muted">{mins(w.addedAt, now)}′ / {w.quotedMin}′</span></div>
                  {w.status === "notified" && <div className="text-[12px] text-info">✓ {L.t("notify")} (sim)</div>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {w.status === "waiting" && <button className="h-10 rounded-lg border border-line-2 px-3 text-[13px]" onClick={() => { dispatch({ type: "waitlist.notify", entryId: w.id }); flash(L.t("remindSim")); }}>{L.t("notify")}</button>}
                    <button className="h-10 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white" onClick={() => setPicker({ kind: "wait", id: w.id })}>{L.t("seatNow")}</button>
                    <button className="h-10 rounded-lg px-3 text-[13px] text-muted" onClick={() => dispatch({ type: "waitlist.remove", entryId: w.id })}>{L.t("cancel")}</button>
                  </div>
                </li>
              ))}</ul>
              <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-1.5">
                <input className={inputCls} placeholder={L.t("name")} value={wl.name} onChange={(e) => setWl({ ...wl, name: e.target.value })} />
                <input className={inputCls} placeholder={L.t("phone")} value={wl.phone} onChange={(e) => setWl({ ...wl, phone: e.target.value })} />
                <select className={inputCls} value={wl.party} onChange={(e) => setWl({ ...wl, party: Number(e.target.value) })} aria-label={L.t("party")}>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
              </div>
              <button disabled={!wl.name.trim()} className="mt-1.5 h-11 w-full rounded-xl border border-ink text-[14px] font-semibold disabled:opacity-40" onClick={() => { dispatch({ type: "waitlist.add", name: wl.name, phone: wl.phone, partySize: wl.party }); setWl({ name: "", phone: "", party: 2 }); }}>{L.t("addWaitlist")}</button>
            </section>
            <p className="text-[12px] text-muted">{L.t("remindSim")}</p>
          </aside>
        </div>
        {picker && <TablePicker L={L} onlyFree={picker.kind !== "res"} onClose={() => setPicker(null)} onPick={(id) => {
          if (picker.kind === "res") { const r = state.reservations.find((x) => x.id === picker.id)!; dispatch(r.status === "requested" ? { type: "reservation.confirm", reservationId: r.id, tableIds: [id] } : { type: "reservation.modify", reservationId: r.id, tableIds: [id] }); }
          else if (picker.kind === "wait") dispatch({ type: "waitlist.seat", entryId: picker.id, tableId: id });
          else dispatch({ type: "table.open", tableId: id, partySize: picker.party });
          setPicker(null);
        }} />}
        {toast && <div className="fixed inset-x-3 bottom-4 z-50 mx-auto max-w-md rounded-xl bg-ink px-4 py-3 text-center text-[14px] text-white shadow-lg" role="status">{toast}</div>}
      </div>
    </Guard>
  );
}
