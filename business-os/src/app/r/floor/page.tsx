"use client";
/* Waiter / floor app (mobile-first): floor plans by area, table states, guest requests, QR orders to accept, food to serve. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { OrderDetail } from "@/components/restaurant/staff/order";
import { Guard, hm, mins, money, TopBar, useNow } from "@/components/restaurant/staff/shell";
import { Badge, Button, Drawer, Modal, Segmented, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { AREA_HY, REQUEST_HY, TABLE_STATE_HY } from "@/lib/restaurant/staff-i18n";
import { modifierError, tableState } from "@/lib/restaurant/rules";
import type { AreaId, CartLine, Table, TableState } from "@/lib/restaurant/types";

const FILL: Record<TableState, string> = {
  available: "fill-white stroke-[var(--color-line-2)]", reserved: "fill-[var(--color-info-soft)] stroke-[var(--color-info)]", seated: "fill-[#ecebe7] stroke-[var(--color-ink-2)]",
  ordering: "fill-[var(--color-signal-soft)] stroke-[var(--color-signal)]", waiting_food: "fill-[var(--color-warn-soft)] stroke-[var(--color-warn)]", eating: "fill-[var(--color-ok-soft)] stroke-[var(--color-ok)]",
  bill: "fill-[var(--color-violet-soft)] stroke-[var(--color-violet)]", cleaning: "fill-[#f1f0ec] stroke-[var(--color-faint)]",
};
const DOT: Record<TableState, string> = { available: "bg-white border border-line-2", reserved: "bg-info", seated: "bg-ink-2", ordering: "bg-signal", waiting_food: "bg-warn", eating: "bg-ok", bill: "bg-violet", cleaning: "bg-faint" };

function AddItems({ table, onClose }: { table: Table; onClose: () => void }) {
  const { state, dispatch } = useR();
  const [cat, setCat] = useState(state.categories[0].id);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pick, setPick] = useState<{ itemId: string; mods: string[] } | null>(null);
  const add = (itemId: string, mods: string[]) => setLines((ls) => { const i = ls.findIndex((l) => l.itemId === itemId && l.modifierIds.join() === mods.join()); return i >= 0 ? ls.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { itemId, qty: 1, modifierIds: mods, note: "" }]; });
  const pickItem = pick ? state.items.find((i) => i.id === pick.itemId)! : null;
  return (
    <Modal open onClose={onClose} size="lg" title={`Ավելացնել պատվեր · սեղան ${table.label}`} footer={<><span className="mr-auto text-[13px] text-muted">{lines.reduce((a, l) => a + l.qty, 0)} դիրք · ավտոմատ ընդունում (կանոն՝ մատուցողի պատվերներ)</span><Button variant="ghost" onClick={onClose}>Հետ</Button><Button variant="ok" icon="send" disabled={!lines.length} onClick={() => { dispatch({ type: "order.submit", channel: "waiter", orderType: "dine_in", tableId: table.id, note: "", lines }); onClose(); }}>Ուղարկել խոհանոց</Button></>}>
      <div className="flex gap-1.5 overflow-x-auto pb-2">{state.categories.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={cn("h-8 shrink-0 rounded-lg px-3 text-[12.5px] font-medium", cat === c.id ? "bg-ink text-white" : "bg-paper")}>{c.name.hy}</button>)}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {state.items.filter((i) => i.categoryId === cat).map((i) => (
          <button key={i.id} disabled={!i.available} onClick={() => (i.groups.some((g) => g.min > 0) ? setPick({ itemId: i.id, mods: [] }) : add(i.id, []))} className={cn("rounded-xl border border-line p-3 text-left text-[13px] hover:border-ink", !i.available && "opacity-40")}>
            <div className="font-medium leading-snug">{i.name.hy}</div><div className="tnum mt-1 text-muted">{money(i.price)}{!i.available && " · վերջացել է"}</div>
          </button>
        ))}
      </div>
      {pickItem && (
        <div className="mt-3 rounded-xl border border-signal/40 bg-signal-soft/40 p-3">
          <div className="text-[13px] font-semibold">{pickItem.name.hy}</div>
          {pickItem.groups.map((g) => <div key={g.id} className="mt-2 flex flex-wrap gap-1.5"><span className="mr-1 text-[12px] text-muted">{g.name.hy}:</span>{g.options.map((o) => <button key={o.id} onClick={() => setPick({ ...pick!, mods: g.max === 1 ? [...pick!.mods.filter((m) => !g.options.some((x) => x.id === m)), o.id] : pick!.mods.includes(o.id) ? pick!.mods.filter((m) => m !== o.id) : [...pick!.mods, o.id] })} className={cn("rounded-lg border px-2.5 py-1 text-[12.5px]", pick!.mods.includes(o.id) ? "border-ink bg-ink text-white" : "border-line-2 bg-white")}>{o.name.hy}</button>)}</div>)}
          <Button size="sm" variant="primary" className="mt-2" disabled={Boolean(modifierError(pickItem, pick!.mods))} onClick={() => { add(pickItem.id, pick!.mods); setPick(null); }}>Ավելացնել</Button>
        </div>
      )}
      {lines.length > 0 && <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-[13px]">{lines.map((l, i) => <li key={i} className="flex items-center gap-2 px-3 py-2"><span className="tnum font-semibold">{l.qty}×</span><span className="flex-1">{state.items.find((x) => x.id === l.itemId)?.name.hy}{l.modifierIds.length > 0 && <span className="text-muted"> · {l.modifierIds.map((m) => state.items.flatMap((x) => x.groups.flatMap((g) => g.options)).find((o) => o.id === m)?.name.hy).join(", ")}</span>}</span><button className="text-muted" onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Հեռացնել"><Icon name="x" size={14} /></button></li>)}</ul>}
    </Modal>
  );
}

export default function Floor() {
  const { state, dispatch, actor, me } = useR();
  const now = useNow(10000);
  const sp = useSearchParams();
  const router = useRouter();
  const openAreas = state.areas.filter((a) => a.open);
  const [area, setArea] = useState<AreaId>("hall");
  const [mine, setMine] = useState(me.role === "waiter");
  const [adding, setAdding] = useState<Table | null>(null);
  const [party, setParty] = useState(2);
  const tableId = sp.get("table");
  useEffect(() => { const t = state.tables.find((x) => x.id === tableId); if (t && t.areaId !== area) setArea(t.areaId); }, [tableId]); // eslint-disable-line react-hooks/exhaustive-deps
  const table = tableId ? state.tables.find((t) => t.id === tableId) : undefined;
  const setTable = (id: string | null) => router.replace(id ? `/r/floor?table=${id}` : "/r/floor", { scroll: false });
  const visible = (t: Table) => !mine || t.waiterId === actor;
  const states = useMemo(() => Object.fromEntries(state.tables.map((t) => [t.id, tableState(state, t, now)])) as Record<string, TableState>, [state, now]);

  const attention = [
    ...state.requests.filter((r) => r.status !== "done").map((r) => ({ id: r.id, tableId: r.tableId, at: r.at, kind: "req" as const, text: REQUEST_HY[r.kind], tone: "warn" as const })),
    ...state.orders.filter((o) => o.status === "submitted" && o.tableId).map((o) => ({ id: o.id, tableId: o.tableId!, at: o.createdAt, kind: "order" as const, text: `QR պատվեր ${o.code} · ընդունել`, tone: "signal" as const })),
    ...state.orders.filter((o) => o.status === "ready" && o.tableId).map((o) => ({ id: o.id, tableId: o.tableId!, at: o.readyAt ?? o.createdAt, kind: "ready" as const, text: `Պատրաստ է ${o.code} · մատուցել`, tone: "ok" as const })),
  ].filter((x) => visible(state.tables.find((t) => t.id === x.tableId)!)).sort((a, b) => a.at - b.at);

  const ar = state.areas.find((a) => a.id === area)!;
  const sess = table ? state.sessions.find((s) => s.tableId === table.id && s.status === "open") : undefined;
  const tOrders = sess ? state.orders.filter((o) => o.sessionId === sess.id) : [];
  const tReqs = table ? state.requests.filter((r) => r.tableId === table.id && r.status !== "done") : [];
  const res = table ? state.reservations.find((r) => r.tableId === table.id) : undefined;
  const kitchenBusy = tOrders.some((o) => ["submitted", "accepted", "preparing", "ready"].includes(o.status));

  return (
    <Guard perm="floor.use">
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur">
          <Link href="/r/admin" className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">R<span className="text-signal">.</span></Link>
          <div className="min-w-0 flex-1 truncate text-[14px] font-semibold">Սրահ</div>
          <TopBar compact />
        </header>
        <div className="mx-auto max-w-6xl p-3 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto">{openAreas.map((a) => <button key={a.id} onClick={() => setArea(a.id)} className={cn("h-9 shrink-0 rounded-lg px-3 text-[13px] font-medium", area === a.id ? "bg-ink text-white" : "bg-surface border border-line")}>{AREA_HY[a.id]}</button>)}</div>
            <div className="ml-auto"><Segmented value={mine ? "mine" : "all"} onChange={(v) => setMine(v === "mine")} items={[{ id: "mine", label: "Իմ սեղանները" }, { id: "all", label: "Բոլորը" }]} /></div>
          </div>
          {state.areas.some((a) => !a.open) && <p className="mt-2 text-[12px] text-muted">Տեռաս՝ {state.areas.find((a) => !a.open)?.note}</p>}

          <div className="mt-3 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-line bg-surface p-2 sm:p-4">
              <svg viewBox={`0 0 ${ar.w} ${ar.h}`} className="h-auto w-full" role="img" aria-label={`${AREA_HY[area]} · սեղանների պլան`}>
                <rect x="0.5" y="0.5" width={ar.w - 1} height={ar.h - 1} rx="2" className="fill-[var(--color-paper)] stroke-[var(--color-line)]" strokeWidth="0.3" />
                {state.tables.filter((t) => t.areaId === area).map((t) => {
                  const s = states[t.id];
                  const flag = state.requests.some((r) => r.tableId === t.id && r.status !== "done") || state.orders.some((o) => o.tableId === t.id && o.status === "submitted");
                  const ready = state.orders.some((o) => o.tableId === t.id && o.status === "ready");
                  const sessT = state.sessions.find((x) => x.tableId === t.id && x.status === "open");
                  return (
                    <g key={t.id} role="button" tabIndex={0} aria-label={`Սեղան ${t.label} · ${TABLE_STATE_HY[s]}`} onClick={() => setTable(t.id)} onKeyDown={(e) => e.key === "Enter" && setTable(t.id)} className={cn("cursor-pointer", !visible(t) && "opacity-30")}>
                      {t.shape === "round" ? <ellipse cx={t.x + t.w / 2} cy={t.y + t.h / 2} rx={t.w / 2} ry={t.h / 2} className={FILL[s]} strokeWidth={tableId === t.id ? 0.9 : 0.45} />
                        : <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="1.5" className={FILL[s]} strokeWidth={tableId === t.id ? 0.9 : 0.45} />}
                      <text x={t.x + t.w / 2} y={t.y + t.h / 2 - (sessT ? 0.6 : -1)} textAnchor="middle" fontSize="3.4" fontWeight="700" className="fill-[var(--color-ink)]">{t.label}</text>
                      {sessT && <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 3.2} textAnchor="middle" fontSize="2.2" className="fill-[var(--color-muted)]">{mins(sessT.openedAt, now)}′ · {sessT.partySize}հ</text>}
                      {flag && <circle cx={t.x + t.w - 0.5} cy={t.y + 0.8} r="1.6" className="fill-[var(--color-signal)]"><animate attributeName="r" values="1.4;2;1.4" dur="1.6s" repeatCount="indefinite" /></circle>}
                      {ready && <circle cx={t.x + 0.5} cy={t.y + 0.8} r="1.4" className="fill-[var(--color-ok)]" />}
                    </g>
                  );
                })}
              </svg>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11.5px] text-muted">{(Object.keys(TABLE_STATE_HY) as TableState[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", DOT[k])} />{TABLE_STATE_HY[k]}</span>)}</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-[14px] font-semibold">Ուշադրություն է պահանջում</h2><Badge tone={attention.length ? "signal" : "ok"}>{attention.length}</Badge></div>
              {!attention.length && <p className="py-6 text-center text-[13px] text-muted">Ամեն ինչ կարգին է</p>}
              <ul className="space-y-2">{attention.map((x) => {
                const t = state.tables.find((y) => y.id === x.tableId)!;
                return (
                  <li key={x.id} className={cn("flex items-center gap-3 rounded-xl border p-2.5", x.tone === "warn" ? "border-warn/40 bg-warn-soft/40" : x.tone === "signal" ? "border-signal/40 bg-signal-soft/40" : "border-ok/40 bg-ok-soft/40")}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink text-[14px] font-bold text-white">{t.label}</span>
                    <span className="min-w-0 flex-1 text-[13px]"><span className="block font-medium">{x.text}</span><span className="text-muted">{mins(x.at, now)} րոպե առաջ</span></span>
                    {x.kind === "req" ? <Button size="sm" variant="primary" onClick={() => dispatch({ type: "request.done", requestId: x.id })}>Կատարված</Button>
                      : x.kind === "order" ? <Button size="sm" variant="ok" onClick={() => dispatch({ type: "order.accept", orderId: x.id })}>Ընդունել</Button>
                      : <Button size="sm" variant="primary" onClick={() => dispatch({ type: "order.serve", orderId: x.id })}>Մատուցված</Button>}
                    <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper" onClick={() => setTable(t.id)} aria-label="Բացել սեղանը"><Icon name="chevron" size={16} /></button>
                  </li>
                );
              })}</ul>
            </div>
          </div>
        </div>

        <Drawer open={Boolean(table)} onClose={() => setTable(null)} wide title={table ? `Սեղան ${table.label} · ${AREA_HY[table.areaId]}` : ""} sub={table ? `${TABLE_STATE_HY[states[table.id]]} · ${table.seats} տեղ · ${state.staff.find((s) => s.id === (sess?.waiterId ?? table.waiterId))?.name}` : ""}
          footer={table && (
            <div className="flex w-full flex-wrap gap-2">
              {!sess && !state.cleaning.includes(table.id) && <><Segmented value={String(party)} onChange={(v) => setParty(Number(v))} items={[1, 2, 3, 4, 6].map((n) => ({ id: String(n), label: `${n}` }))} /><Button variant="primary" icon="users" onClick={() => dispatch({ type: "table.open", tableId: table.id, partySize: party })}>Նստեցնել ({party})</Button></>}
              {sess && <Button variant="primary" icon="plus" onClick={() => setAdding(table)}>Ավելացնել պատվեր</Button>}
              {sess && <Button variant="secondary" icon="check" disabled={kitchenBusy} title={kitchenBusy ? "Խոհանոցը դեռ աշխատում է այս սեղանի պատվերի վրա" : undefined} onClick={() => dispatch({ type: "table.close", tableId: table.id })}>Հաշիվը փակված է (POS)</Button>}
              {state.cleaning.includes(table.id) && <Button variant="ok" icon="broom" onClick={() => dispatch({ type: "table.clean", tableId: table.id })}>Մաքրված է</Button>}
            </div>
          )}>
          {table && (
            <div className="space-y-4">
              {res && <div className="rounded-xl bg-info-soft px-3 py-2 text-[13px] text-info"><Icon name="calendar" size={14} className="mr-1 inline" />Ամրագրում {hm(res.at)} · {res.name} · {res.partySize} հյուր{res.vip ? " · VIP" : ""}{res.note ? ` · ${res.note}` : ""}</div>}
              {tReqs.map((r) => <div key={r.id} className="flex items-center gap-2 rounded-xl border border-warn/40 bg-warn-soft/40 p-3 text-[13.5px]"><Icon name="bell" size={16} className="text-warn" /><span className="flex-1 font-medium">{REQUEST_HY[r.kind]} · {mins(r.at, now)} ր</span>{r.status === "new" && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "request.ack", requestId: r.id })}>Գնում եմ</Button>}<Button size="sm" variant="primary" onClick={() => dispatch({ type: "request.done", requestId: r.id })}>Կատարված</Button></div>)}
              {sess ? (tOrders.length ? tOrders.map((o) => <div key={o.id} className="rounded-xl border border-line p-3"><OrderDetail o={o} now={now} compact /></div>) : <p className="text-[13px] text-muted">Հյուրերը նստած են {mins(sess.openedAt, now)} րոպե, պատվեր դեռ չկա։</p>)
                : <p className="text-[13px] text-muted">{state.cleaning.includes(table.id) ? "Սեղանը պետք է մաքրել։" : "Սեղանը ազատ է։ Հյուրերը կարող են պատվիրել նաև QR կոդով։"}</p>}
              {sess && <p className="text-[12px] text-muted">Վճարումը կատարվում է Ձեր դրամարկղում (POS) ֆիսկալ կտրոնով։ Համակարգը միայն նշում է, որ հաշիվը փակված է։</p>}
            </div>
          )}
        </Drawer>
        {adding && <AddItems table={adding} onClose={() => setAdding(null)} />}
      </div>
    </Guard>
  );
}
