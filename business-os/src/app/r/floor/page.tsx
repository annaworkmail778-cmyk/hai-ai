"use client";
/*
 * Waiter / floor app (mobile-first, one-handed). Home: my section, floor map, attention queue, shift summary.
 * Table screen (?table=): Order / Add / Bill / More — see components/restaurant/staff/waiter.tsx.
 * Staff language (hy / ru / en) is a per-device preference.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Guard, mins, money, TopBar, useNow } from "@/components/restaurant/staff/shell";
import { LangSwitch, openSessionOf, TableScreen } from "@/components/restaurant/staff/waiter";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { tableState } from "@/lib/restaurant/rules";
import { useStaffLang } from "@/lib/restaurant/staff-t";
import type { AreaId, Table, TableState } from "@/lib/restaurant/types";

const FILL: Record<TableState, string> = {
  available: "fill-white stroke-[var(--color-line-2)]", reserved: "fill-[var(--color-info-soft)] stroke-[var(--color-info)]", seated: "fill-[#ecebe7] stroke-[var(--color-ink-2)]",
  ordering: "fill-[var(--color-signal-soft)] stroke-[var(--color-signal)]", waiting_food: "fill-[var(--color-warn-soft)] stroke-[var(--color-warn)]", eating: "fill-[var(--color-ok-soft)] stroke-[var(--color-ok)]",
  bill: "fill-[var(--color-violet-soft)] stroke-[var(--color-violet)]", payment_pending: "fill-[var(--color-violet-soft)] stroke-[var(--color-ink)]",
  cleaning: "fill-[#f1f0ec] stroke-[var(--color-faint)]", blocked: "fill-[#e4e3df] stroke-[var(--color-faint)]",
};
const DOT: Record<TableState, string> = { available: "bg-white border border-line-2", reserved: "bg-info", seated: "bg-ink-2", ordering: "bg-signal", waiting_food: "bg-warn", eating: "bg-ok", bill: "bg-violet", payment_pending: "bg-ink", cleaning: "bg-faint", blocked: "bg-[#c9c7c1]" };


export default function Floor() {
  const { state, dispatch, actor, me, conn } = useR();
  const L = useStaffLang();
  const now = useNow(10000);
  const sp = useSearchParams();
  const router = useRouter();
  const openAreas = state.areas.filter((a) => a.open);
  const [area, setArea] = useState<AreaId>("hall");
  const [mine, setMine] = useState(me.role === "waiter");
  const tableId = sp.get("table");
  useEffect(() => { const t = state.tables.find((x) => x.id === tableId); if (t && t.areaId !== area) setArea(t.areaId); }, [tableId]); // eslint-disable-line react-hooks/exhaustive-deps
  const setTable = (id: string | null) => router.replace(id ? `/r/floor?table=${id}` : "/r/floor", { scroll: false });
  const waiterOf = (t: Table) => openSessionOf(state, t.id)?.waiterId ?? t.waiterId;
  const visible = (t: Table) => !mine || waiterOf(t) === actor;
  const states = useMemo(() => Object.fromEntries(state.tables.map((t) => [t.id, tableState(state, t, now)])) as Record<string, TableState>, [state, now]);

  const attention = [
    ...state.requests.filter((r) => r.status !== "done").map((r) => ({ id: r.id, tableId: r.tableId, at: r.at, kind: "req" as const, text: L.req(r.kind), tone: "warn" as const })),
    ...state.orders.filter((o) => o.status === "submitted" && o.tableId).map((o) => ({ id: o.id, tableId: o.tableId!, at: o.createdAt, kind: "order" as const, text: `${L.t("qrOrder")} ${o.code}`, tone: "signal" as const })),
    ...state.orders.filter((o) => o.status === "ready" && o.tableId).map((o) => ({ id: o.id, tableId: o.tableId!, at: o.readyAt ?? o.createdAt, kind: "ready" as const, text: `${L.t("readyToServe")} · ${o.code}`, tone: "ok" as const })),
  ].filter((x) => { const t = state.tables.find((y) => y.id === x.tableId); return t ? visible(t) : false; }).sort((a, b) => a.at - b.at);

  // Shift summary for the signed-in waiter (served / open tables / sales recorded today on their sessions).
  const mySessions = state.sessions.filter((x) => x.waiterId === actor && x.openedAt >= state.epochAt - 12 * 3600000);
  const myOpen = mySessions.filter((x) => x.status === "open").length;
  const mySales = state.orders.filter((o) => o.waiterId === actor && o.createdAt >= state.epochAt - 12 * 3600000 && !["rejected", "cancelled"].includes(o.status)).reduce((a, o) => a + o.total, 0);

  if (tableId && state.tables.some((t) => t.id === tableId)) {
    return (
      <Guard perm="floor.use">
        <div className="min-h-dvh bg-paper">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur">
            <Link href="/r/admin" className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">R<span className="text-signal">.</span></Link>
            <div className="min-w-0 flex-1 truncate text-[14px] font-semibold">{L.area(state.tables.find((t) => t.id === tableId)!.areaId)}</div>
            <LangSwitch lang={L.lang} setLang={L.setLang} />
            <TopBar compact />
          </header>
          <div className="px-3 pb-10">
            {conn === "reconnecting" && <div className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] font-medium text-warn"><Icon name="wifiOff" size={14} className="mr-1 inline" />{L.t("notConfirmed")}</div>}
            <TableScreen tableId={tableId} L={L} onBack={() => setTable(null)} />
          </div>
        </div>
      </Guard>
    );
  }

  const ar = state.areas.find((a) => a.id === area)!;
  return (
    <Guard perm="floor.use">
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur">
          <Link href="/r/admin" className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">R<span className="text-signal">.</span></Link>
          <div className="min-w-0 flex-1 truncate text-[14px] font-semibold">{me.name.split(" ")[0]}</div>
          <LangSwitch lang={L.lang} setLang={L.setLang} />
          <TopBar compact />
        </header>
        <div className="mx-auto max-w-6xl p-3 sm:p-5">
          {conn === "reconnecting" && <div className="mb-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] font-medium text-warn"><Icon name="wifiOff" size={14} className="mr-1 inline" />{L.t("notConfirmed")}</div>}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-line bg-surface p-3"><div className="text-[12px] text-muted">{L.t("myTables")}</div><div className="tnum text-[22px] font-bold">{myOpen}</div></div>
            <div className="rounded-2xl border border-line bg-surface p-3"><div className="text-[12px] text-muted">{L.t("attention")}</div><div className={cn("tnum text-[22px] font-bold", attention.length > 0 && "text-signal")}>{attention.length}</div></div>
            <div className="rounded-2xl border border-line bg-surface p-3"><div className="text-[12px] text-muted">{L.t("sales")}</div><div className="tnum truncate text-[18px] font-bold leading-[33px]">{money(mySales)}</div></div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto">{openAreas.map((a) => <button key={a.id} onClick={() => setArea(a.id)} className={cn("h-10 shrink-0 rounded-lg px-3 text-[13.5px] font-medium", area === a.id ? "bg-ink text-white" : "border border-line bg-surface")}>{L.area(a.id)}</button>)}</div>
            <div className="ml-auto flex rounded-lg border border-line-2 bg-surface p-0.5">
              <button onClick={() => setMine(true)} className={cn("h-9 rounded-md px-3 text-[13px] font-medium", mine ? "bg-ink text-white" : "text-muted")}>{L.t("myTables")}</button>
              <button onClick={() => setMine(false)} className={cn("h-9 rounded-md px-3 text-[13px] font-medium", !mine ? "bg-ink text-white" : "text-muted")}>{L.t("allTables")}</button>
            </div>
          </div>

          <div className="mt-3 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="order-2 rounded-2xl border border-line bg-surface p-2 sm:p-4 lg:order-1">
              <svg viewBox={`0 0 ${ar.w} ${ar.h}`} className="h-auto w-full" role="img" aria-label={L.area(area)}>
                <rect x="0.5" y="0.5" width={ar.w - 1} height={ar.h - 1} rx="2" className="fill-[var(--color-paper)] stroke-[var(--color-line)]" strokeWidth="0.3" />
                {state.tables.filter((t) => t.areaId === area).map((t) => {
                  const s = states[t.id];
                  const flag = state.requests.some((r) => r.tableId === t.id && r.status !== "done") || state.orders.some((o) => o.tableId === t.id && o.status === "submitted");
                  const ready = state.orders.some((o) => o.tableId === t.id && o.status === "ready");
                  const sessT = openSessionOf(state, t.id);
                  return (
                    <g key={t.id} role="button" tabIndex={0} aria-label={`${L.t("table")} ${t.label} · ${L.tableSt(s)}`} onClick={() => setTable(t.id)} onKeyDown={(e) => e.key === "Enter" && setTable(t.id)} className={cn("cursor-pointer", !visible(t) && "opacity-30")}>
                      {t.shape === "round" ? <ellipse cx={t.x + t.w / 2} cy={t.y + t.h / 2} rx={t.w / 2} ry={t.h / 2} className={FILL[s]} strokeWidth={0.45} strokeDasharray={s === "blocked" ? "1 0.8" : undefined} />
                        : <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="1.5" className={FILL[s]} strokeWidth={0.45} strokeDasharray={s === "blocked" ? "1 0.8" : undefined} />}
                      <text x={t.x + t.w / 2} y={t.y + t.h / 2 - (sessT ? 0.6 : -1)} textAnchor="middle" fontSize="3.4" fontWeight="700" className="fill-[var(--color-ink)]">{t.label}</text>
                      {sessT && <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 3.2} textAnchor="middle" fontSize="2.2" className="fill-[var(--color-muted)]">{mins(sessT.openedAt, now)}′ · {sessT.partySize}</text>}
                      {sessT?.allergies && <text x={t.x + 0.8} y={t.y + t.h - 0.8} fontSize="2.6" className="fill-[var(--color-bad)]">⚠</text>}
                      {flag && <circle cx={t.x + t.w - 0.5} cy={t.y + 0.8} r="1.6" className="fill-[var(--color-signal)]"><animate attributeName="r" values="1.4;2;1.4" dur="1.6s" repeatCount="indefinite" /></circle>}
                      {ready && <circle cx={t.x + 0.5} cy={t.y + 0.8} r="1.4" className="fill-[var(--color-ok)]" />}
                    </g>
                  );
                })}
              </svg>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11.5px] text-muted">{(Object.keys(DOT) as TableState[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", DOT[k])} />{L.tableSt(k)}</span>)}</div>
            </div>
            <div className="order-1 rounded-2xl border border-line bg-surface p-3 lg:order-2">
              <h2 className="mb-2 text-[14px] font-semibold">{L.t("attention")}</h2>
              {!attention.length && <p className="py-6 text-center text-[13px] text-muted">✓</p>}
              <ul className="space-y-2">{attention.map((x) => {
                const t = state.tables.find((y) => y.id === x.tableId)!;
                return (
                  <li key={x.id} className={cn("flex items-center gap-2 rounded-xl border p-2", x.tone === "warn" ? "border-warn/40 bg-warn-soft/40" : x.tone === "signal" ? "border-signal/40 bg-signal-soft/40" : "border-ok/40 bg-ok-soft/40")}>
                    <button onClick={() => setTable(t.id)} className="grid size-11 shrink-0 place-items-center rounded-lg bg-ink text-[15px] font-bold text-white" aria-label={`${L.t("table")} ${t.label}`}>{t.label}</button>
                    <span className="min-w-0 flex-1 text-[13.5px]"><span className="block font-medium leading-snug">{x.text}</span><span className="text-muted">{mins(x.at, now)} {L.t("minAgo")}</span></span>
                    {x.kind === "req" ? <button className="h-11 rounded-xl bg-ink px-3 text-[13.5px] font-semibold text-white" onClick={() => dispatch({ type: "request.done", requestId: x.id })}>{L.t("done")}</button>
                      : x.kind === "order" ? <button className="h-11 rounded-xl bg-ok px-3 text-[13.5px] font-semibold text-white" onClick={() => dispatch({ type: "order.accept", orderId: x.id })}>{L.t("accept")}</button>
                      : <button className="h-11 rounded-xl bg-ink px-3 text-[13.5px] font-semibold text-white" onClick={() => dispatch({ type: "order.serve", orderId: x.id })}>{L.t("serve")}</button>}
                  </li>
                );
              })}</ul>
            </div>
          </div>
        </div>
      </div>
    </Guard>
  );
}
