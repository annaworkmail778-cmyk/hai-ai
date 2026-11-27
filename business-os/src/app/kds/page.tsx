"use client";
/* Kitchen Display System: full-screen, touch-first. Every action is a synced event; the guest's order page updates live. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { ORDER_FLOW } from "@/lib/rules";
import type { Order, OrderStatus } from "@/lib/types";

const COLS: { id: string; title: string; statuses: OrderStatus[] }[] = [
  { id: "new", title: "Նոր", statuses: ["submitted"] },
  { id: "cook", title: "Պատրաստվում է", statuses: ["accepted", "preparing"] },
  { id: "ready", title: "Պատրաստ է", statuses: ["ready", "out_for_delivery"] },
];
const TYPE = { room_service: "Սենյակ", dine_in: "Սեղան", takeaway: "Վերցնել" } as const;
const NEXT: Partial<Record<OrderStatus, [OrderStatus, string]>> = { submitted: ["accepted", "Ընդունել"], accepted: ["preparing", "Սկսել"], preparing: ["ready", "Պատրաստ է"], out_for_delivery: ["completed", "Հանձնված է"] };
const REASONS = ["Բաղադրիչը վերջացել է", "Խոհանոցը փակ է", "Կրկնակի պատվեր"];

export default function Kds() {
  const { state, dispatch, setRole, conn } = useDemo();
  const [now, setNow] = useState(Date.now());
  const [reject, setReject] = useState<string | null>(null);
  useEffect(() => { setRole("staff"); const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, [setRole]);
  const live = state.orders.filter((o) => COLS.some((c) => c.statuses.includes(o.status))).sort((a, b) => a.createdAt - b.createdAt);
  const doneToday = state.orders.filter((o) => o.status === "completed" && now - o.createdAt < 86400e3).length;
  const item = (id: string) => state.menu.items.find((m) => m.id === id);
  const act = (o: Order, s: OrderStatus, reason?: string) => dispatch({ type: "order.status", target: o.id, status: s, reason });
  return (
    <div className="min-h-dvh bg-[#0e1110] text-white">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#0e1110]/95 px-4 py-3 backdrop-blur">
        <Link href="/admin/restaurant" className="grid size-10 place-items-center rounded-xl bg-white/5" aria-label="Հետ"><Icon name="chevronLeft" size={20} /></Link>
        <div className="mr-auto"><div className="text-[18px] font-semibold">Խոհանոցի էկրան</div><div className="text-[12.5px] text-white/50">Pine Ridge Restaurant · {conn === "live" ? "համաժամեցված" : conn === "local" ? "տեղային ռեժիմ" : "միանում է…"}</div></div>
        <Stat label="Նոր" value={live.filter((o) => o.status === "submitted").length} hot />
        <Stat label="Խոհանոցում" value={live.filter((o) => o.status === "accepted" || o.status === "preparing").length} />
        <Stat label="Կատարված 24ժ" value={doneToday} />
      </header>
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {COLS.map((c) => {
          const list = live.filter((o) => c.statuses.includes(o.status));
          return (
            <section key={c.id} className="min-w-0">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">{c.title}<span className="rounded-md bg-white/10 px-1.5 text-white">{list.length}</span></h2>
              <div className="space-y-3">
                {list.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-[13px] text-white/35">Դատարկ է</div>}
                {list.map((o) => {
                  const mins = Math.max(0, Math.floor((now - o.createdAt) / 60000));
                  const target = Math.max(...o.items.map((i) => item(i.itemId)?.prepMin ?? 10));
                  const late = o.status !== "ready" && o.status !== "out_for_delivery" && mins > target;
                  const next = o.status === "ready" ? (o.type === "room_service" ? (["out_for_delivery", "Առաքել սենյակ"] as [OrderStatus, string]) : (["completed", "Հանձնված է"] as [OrderStatus, string])) : NEXT[o.status];
                  return (
                    <article key={o.id} className={cn("rise-in overflow-hidden rounded-2xl bg-[#1a1f1d] ring-1", o.status === "submitted" ? "ring-signal" : late ? "ring-red-500/70" : "ring-white/10")}>
                      <div className={cn("flex items-center justify-between gap-2 px-4 py-2.5", o.status === "submitted" ? "bg-signal/20" : "bg-white/5")}>
                        <div className="font-semibold"><span className="text-[17px]">{o.code}</span><span className="ml-2 text-[13px] text-white/70">{TYPE[o.type]} {o.roomId ?? o.tableId?.replace("T", "") ?? o.pickupTime ?? ""}</span></div>
                        <span className={cn("tnum rounded-lg px-2 py-0.5 text-[13px] font-semibold", late ? "bg-red-500 text-white" : "bg-white/10")}>{mins} ր{late ? ` / ${target}` : ""}</span>
                      </div>
                      <ul className="space-y-1.5 px-4 py-3">
                        {o.items.map((it, i) => { const m = item(it.itemId); return (
                          <li key={i} className="text-[15.5px]"><span className="tnum mr-2 font-bold text-signal">{it.qty}×</span>{m?.name.hy}
                            {it.options.length > 0 && <div className="ml-7 text-[13px] text-amber-300">+ {m?.options.filter((x) => it.options.includes(x.id)).map((x) => x.name.hy).join(", ")}</div>}
                            {m && m.allergens.length > 0 && <div className="ml-7 text-[12px] text-white/45">Ալերգեններ՝ {m.allergens.join(", ")}</div>}
                          </li>); })}
                      </ul>
                      {o.note && <div className="mx-4 mb-3 rounded-lg bg-amber-400/15 px-3 py-2 text-[13.5px] text-amber-200"><Icon name="alert" size={14} className="mr-1.5 inline" />{o.note}</div>}
                      <div className="flex gap-2 border-t border-white/10 p-3">
                        {next && <button onClick={() => act(o, next[0])} className={cn("h-12 flex-1 rounded-xl text-[15px] font-semibold", o.status === "submitted" ? "bg-signal text-white" : "bg-white text-[#0e1110]")}>{next[1]}</button>}
                        {(ORDER_FLOW[o.status] ?? []).includes("rejected") && <button onClick={() => setReject(o.id)} className="h-12 rounded-xl bg-white/10 px-4 text-[14px] font-semibold">Մերժել</button>}
                      </div>
                      {reject === o.id && (
                        <div className="space-y-2 border-t border-white/10 p-3">
                          <div className="text-[12.5px] text-white/60">Պատճառը (հյուրը կտեսնի)</div>
                          <div className="flex flex-wrap gap-2">{REASONS.map((r) => <button key={r} onClick={() => { act(o, "rejected", r); setReject(null); }} className="rounded-lg bg-red-500/20 px-3 py-2 text-[13px] text-red-100">{r}</button>)}<button onClick={() => setReject(null)} className="px-3 py-2 text-[13px] text-white/50">Չեղարկել</button></div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, hot }: { label: string; value: number; hot?: boolean }) {
  return <div className={cn("rounded-xl px-3 py-1.5 text-center", hot && value ? "bg-signal" : "bg-white/5")}><div className="tnum text-[18px] font-bold leading-tight">{value}</div><div className="text-[11px] text-white/60">{label}</div></div>;
}
