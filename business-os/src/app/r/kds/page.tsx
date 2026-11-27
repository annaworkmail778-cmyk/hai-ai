"use client";
/* Kitchen Display System: station routing, timers, one-tap start / ready / bump, all-day counts, sold-out, expo. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { ConnPillView } from "@/components/shared/conn-pill";
import { Guard, hm, mins, useNow } from "@/components/restaurant/staff/shell";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { ALLERGEN } from "@/lib/restaurant/i18n";
import { STATION_HY, TICKET_STATUS_HY } from "@/lib/restaurant/staff-i18n";
import { ticketAge } from "@/lib/restaurant/rules";
import type { StationId, Ticket } from "@/lib/restaurant/types";

type View = StationId | "all" | "expo";

export default function Kds() {
  const { state, dispatch, conn, mode, backend, pending, me, can } = useR();
  const now = useNow(5000);
  const sp = useSearchParams();
  const router = useRouter();
  const view = (sp.get("station") as View) ?? (me.station ?? "all");
  const [allDay, setAllDay] = useState(false);
  const [soldOut, setSoldOut] = useState(false);
  const setView = (v: View) => router.replace(`/r/kds?station=${v}`, { scroll: false });
  const station = (id: StationId) => state.stations.find((s) => s.id === id)!;
  const open = state.tickets.filter((t) => ["queued", "in_progress", "ready"].includes(t.status) && (view === "all" || view === "expo" || t.station === view));
  const sorted = [...open].sort((a, b) => Number(b.rush) - Number(a.rush) || a.firedAt - b.firedAt);
  const recent = state.tickets.filter((t) => t.status === "bumped" && t.bumpedAt && now - t.bumpedAt < 10 * 60000 && (view === "all" || t.station === view)).sort((a, b) => (b.bumpedAt ?? 0) - (a.bumpedAt ?? 0)).slice(0, 4);
  const counts: Record<string, number> = {};
  for (const t of open.filter((x) => x.status !== "ready")) { const o = state.orders.find((x) => x.id === t.orderId)!; for (const id of t.lineIds) { const l = o.lines.find((x) => x.id === id)!; counts[l.name] = (counts[l.name] ?? 0) + l.qty; } }
  const tone = (t: Ticket) => { if (t.status === "ready") return "ready"; const a = ticketAge(t, now), th = station(t.station).thresholds; return a > th.red ? "red" : a > th.amber ? "amber" : "ok"; };

  const card = (t: Ticket) => {
    const o = state.orders.find((x) => x.id === t.orderId)!;
    const table = o.tableId ? state.tables.find((x) => x.id === o.tableId) : undefined;
    const tn = tone(t);
    const lines = t.lineIds.map((id) => o.lines.find((l) => l.id === id)!).filter(Boolean);
    const allergens = Array.from(new Set(lines.flatMap((l) => state.items.find((i) => i.id === l.itemId)?.allergens ?? [])));
    const fresh = now - t.firedAt < 60000;
    return (
      <article key={t.id} className={cn("kds-card flex flex-col", tn === "amber" && "kds-amber", tn === "red" && "kds-red", tn === "ready" && "border-[#22c55e]", fresh && "kds-new")} aria-label={`${o.code} ${TICKET_STATUS_HY[t.status]}`}>
        <header className={cn("flex items-center gap-2 rounded-t-[12px] px-3 py-2", tn === "red" ? "bg-[#ef4444] text-white" : tn === "amber" ? "bg-[#e0a419] text-black" : tn === "ready" ? "bg-[#22c55e] text-black" : "bg-[#26262a]")}>
          <span className="text-[22px] font-black">{table ? table.label : "ՏԱՆ"}</span>
          <span className="text-[13px] font-semibold opacity-80">{o.code}{view === "all" || view === "expo" ? ` · ${STATION_HY[t.station]}` : ""}</span>
          {t.rush && <span className="rounded bg-white px-1.5 text-[12px] font-black text-[#ef4444]">ՇՏԱՊ</span>}
          {t.remake && <span className="rounded bg-black/30 px-1.5 text-[12px] font-bold">ՎԵՐԱՊԱՏՐ.</span>}
          <span className="tnum ml-auto text-[22px] font-black">{Math.floor(ticketAge(t, now))}′</span>
        </header>
        {allergens.length > 0 && <div className="bg-[#7f1d1d] px-3 py-1 text-[13px] font-bold text-white">ԱԼԵՐԳԵՆ՝ {allergens.map((a) => ALLERGEN[a].hy).join(", ")}</div>}
        <ul className="flex-1 space-y-2 p-3">
          {lines.map((l) => (
            <li key={l.id}>
              <div className="text-[21px] font-bold leading-tight"><span className="tnum mr-2 text-[#fbbf24]">{l.qty}×</span>{l.name}</div>
              {l.modifiers.length > 0 && <div className="pl-8 text-[16px] font-semibold text-[#93c5fd]">{l.modifiers.map((m) => m.name).join(" · ")}</div>}
              {l.note && <div className="pl-8 text-[16px] font-bold text-[#fca5a5]">«{l.note}»</div>}
            </li>
          ))}
          {o.note && <li className="rounded bg-[#3f3f46] px-2 py-1 text-[15px] font-semibold text-[#fde68a]">Պատվերի նշում՝ {o.note}</li>}
        </ul>
        <footer className="p-2 pt-0">
          {t.status === "queued" && <button onClick={() => dispatch({ type: "ticket.start", ticketId: t.id })} className="h-14 w-full rounded-xl bg-white text-[18px] font-bold text-black active:scale-[0.98]">Սկսել</button>}
          {t.status === "in_progress" && <button onClick={() => dispatch({ type: "ticket.ready", ticketId: t.id })} className="h-14 w-full rounded-xl bg-[#22c55e] text-[18px] font-bold text-black active:scale-[0.98]">Պատրաստ է</button>}
          {t.status === "ready" && <button onClick={() => dispatch({ type: "ticket.bump", ticketId: t.id })} className="h-14 w-full rounded-xl border-2 border-[#22c55e] text-[18px] font-bold text-[#22c55e] active:scale-[0.98]">Հանձնված ✓</button>}
          <div className="mt-1 text-center text-[12px] text-white/40">Ստացվել է {hm(t.firedAt)}</div>
        </footer>
      </article>
    );
  };

  const expoOrders = state.orders.filter((o) => ["accepted", "preparing", "ready"].includes(o.status)).sort((a, b) => (a.acceptedAt ?? 0) - (b.acceptedAt ?? 0));

  return (
    <Guard perm="kds.use">
      <div className="kds">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#0b0b0c]/95 px-3 py-2 backdrop-blur">
          <Link href="/r" className="grid size-9 place-items-center rounded-lg bg-white text-[13px] font-bold text-black">R<span className="text-signal">.</span></Link>
          <nav className="flex flex-wrap gap-1" aria-label="Կայաններ">
            {(["all", ...state.stations.map((s) => s.id), "expo"] as View[]).map((v) => {
              const n = v === "all" || v === "expo" ? state.tickets.filter((t) => t.status === "queued" || t.status === "in_progress").length : state.tickets.filter((t) => t.station === v && (t.status === "queued" || t.status === "in_progress")).length;
              return <button key={v} onClick={() => setView(v)} className={cn("h-11 rounded-xl px-4 text-[15px] font-bold", view === v ? "bg-white text-black" : "bg-white/10 text-white")}>{v === "all" ? "Բոլորը" : v === "expo" ? "Ելք (expo)" : STATION_HY[v]}{v !== "expo" && n > 0 && <span className="tnum ml-1.5 opacity-60">{n}</span>}</button>;
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setAllDay(!allDay)} className={cn("h-11 rounded-xl px-3 text-[14px] font-semibold", allDay ? "bg-[#fbbf24] text-black" : "bg-white/10")}>Ընդհանուր քանակ</button>
            {can("menu.availability") && <button onClick={() => setSoldOut(true)} className="h-11 rounded-xl bg-white/10 px-3 text-[14px] font-semibold">Վերջացել է…</button>}
            <span className="tnum text-[22px] font-black">{hm(now)}</span>
            <span className="[&>span]:bg-white/10 [&>span]:text-white"><ConnPillView conn={conn} mode={mode} backend={backend} pending={pending} /></span>
          </div>
        </header>
        <div className="flex gap-3 p-3">
          <div className="min-w-0 flex-1">
            {view === "expo" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {expoOrders.map((o) => {
                  const ts = state.tickets.filter((t) => t.orderId === o.id && t.status !== "voided");
                  const table = o.tableId ? state.tables.find((x) => x.id === o.tableId) : undefined;
                  return (
                    <article key={o.id} className={cn("kds-card p-3", o.status === "ready" && "border-[#22c55e]")}>
                      <div className="flex items-center gap-2"><span className="text-[22px] font-black">{table ? table.label : "ՏԱՆ"}</span><span className="text-[13px] text-white/60">{o.code}</span><span className="tnum ml-auto text-[18px] font-bold">{mins(o.acceptedAt ?? o.createdAt, now)}′</span></div>
                      <ul className="mt-2 space-y-1">{ts.map((t) => <li key={t.id} className="flex justify-between text-[15px]"><span>{STATION_HY[t.station]}</span><span className={cn("font-bold", t.status === "ready" || t.status === "bumped" ? "text-[#22c55e]" : t.status === "in_progress" ? "text-[#fbbf24]" : "text-white/50")}>{TICKET_STATUS_HY[t.status]}</span></li>)}</ul>
                      {o.status === "ready" && o.type === "dine_in" && <button onClick={() => dispatch({ type: "order.serve", orderId: o.id })} className="mt-3 h-12 w-full rounded-xl bg-[#22c55e] text-[16px] font-bold text-black">Տարվեց սեղանին</button>}
                      {o.status === "ready" && o.type === "takeaway" && <div className="mt-3 rounded-xl bg-white/10 py-2 text-center text-[14px]">Սպասում է հյուրին (դրամարկղ)</div>}
                    </article>
                  );
                })}
              </div>
            ) : sorted.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{sorted.map(card)}</div>
            ) : <div className="grid h-[60vh] place-items-center text-center text-white/50"><div><Icon name="check" size={40} className="mx-auto" /><p className="mt-2 text-[20px] font-semibold">Նոր տոմսեր չկան</p></div></div>}
            {recent.length > 0 && view !== "expo" && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-white/60">Վերջին հանձնվածները՝{recent.map((t) => <button key={t.id} onClick={() => dispatch({ type: "ticket.recall", ticketId: t.id })} className="rounded-lg bg-white/10 px-3 py-2 font-semibold text-white">{state.orders.find((o) => o.id === t.orderId)?.code} · վերադարձնել</button>)}</div>
            )}
          </div>
          {allDay && (
            <aside className="w-64 shrink-0 rounded-xl bg-[#17171a] p-3" aria-label="Ընդհանուր քանակ">
              <h2 className="text-[15px] font-bold text-white/70">Պատրաստելու ընդհանուր քանակ</h2>
              <ul className="mt-2 space-y-1.5">{Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => <li key={k} className="flex justify-between text-[17px]"><span>{k}</span><span className="tnum font-black text-[#fbbf24]">{v}</span></li>)}</ul>
            </aside>
          )}
        </div>
        {soldOut && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#17171a] p-4">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-[20px] font-bold">Ուտեստի հասանելիություն</h2><button onClick={() => setSoldOut(false)} className="grid size-11 place-items-center rounded-xl bg-white/10" aria-label="Փակել"><Icon name="x" /></button></div>
              <p className="mb-3 text-[14px] text-white/60">«Վերջացել է» նշումն անմիջապես երևում է QR մենյուում, կայքում և մատուցողի հավելվածում։</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{state.items.filter((i) => view === "all" || view === "expo" || i.station === view).map((i) => <button key={i.id} onClick={() => dispatch({ type: "menu.availability", itemId: i.id, available: !i.available })} className={cn("flex h-14 items-center justify-between rounded-xl px-4 text-left text-[16px] font-semibold", i.available ? "bg-white/10" : "bg-[#7f1d1d]")}>{i.name.hy}<span className="text-[13px]">{i.available ? "Հասանելի" : "ՎԵՐՋԱՑԵԼ Է"}</span></button>)}</div>
            </div>
          </div>
        )}
      </div>
    </Guard>
  );
}
