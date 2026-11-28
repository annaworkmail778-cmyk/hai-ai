"use client";
/*
 * Waiter application (mobile-first, one-handed): table screen with Order / Add / Bill / More.
 * Everything a waiter needs without paper: seats, courses, allergies, notes, fire course, serve, move items,
 * transfer / merge / hand over the table, bill split and payment through the (simulated) payment adapter.
 */
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { sessionLines, sessionTotal, TURN_MIN } from "@/lib/restaurant/ops";
import { modifierError, tableState } from "@/lib/restaurant/rules";
import type { SL, useStaffLang } from "@/lib/restaurant/staff-t";
import type { CartLine, MenuItem, Order, RestaurantState, TableSession } from "@/lib/restaurant/types";
import { money, mins } from "./shell";

type L = ReturnType<typeof useStaffLang>;
export const openSessionOf = (s: RestaurantState, tableId: string) => s.sessions.find((x) => x.status === "open" && (x.tableId === tableId || x.mergedTables?.includes(tableId)));
const uid = () => Math.random().toString(36).slice(2, 10);

const Btn = ({ children, onClick, tone = "dark", disabled, className, title }: { children: React.ReactNode; onClick?: () => void; tone?: "dark" | "ok" | "light" | "signal" | "bad"; disabled?: boolean; className?: string; title?: string }) => (
  <button title={title} disabled={disabled} onClick={onClick} className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-40",
    { dark: "bg-ink text-white", ok: "bg-ok text-white", light: "border border-line-2 bg-surface text-ink", signal: "bg-signal text-white", bad: "border border-bad/40 bg-bad-soft text-bad" }[tone], className)}>{children}</button>
);

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={cn("h-10 shrink-0 rounded-full border px-4 text-[14px] font-medium", on ? "border-ink bg-ink text-white" : "border-line-2 bg-surface")}>{children}</button>;
}

/* ---------------- Order tab ---------------- */

function OrderTab({ sess, L, now }: { sess: TableSession; L: L; now: number }) {
  const { state, dispatch, can, pendingIds } = useR();
  const [sel, setSel] = useState<string[]>([]);
  const [moveTo, setMoveTo] = useState(false);
  const orders = state.orders.filter((o) => o.sessionId === sess.id && o.status !== "rejected");
  const held = Array.from(new Set(state.tickets.filter((t) => t.status === "held" && orders.some((o) => o.id === t.orderId)).map((t) => t.course))).sort();
  const lineTicket = (o: Order, id: string) => state.tickets.find((t) => t.orderId === o.id && t.lineIds.includes(id));
  if (!orders.length) return <p className="py-8 text-center text-[14px] text-muted">{L.t("order")}: —</p>;
  return (
    <div className="space-y-3">
      {held.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-info/40 bg-info-soft p-3">
          <span className="text-[14px] font-medium text-info">{L.t("held")}: {held.map((c) => `${L.t("course")} ${c}`).join(", ")}</span>
          {held.map((c) => <Btn key={c} tone="dark" className="ml-auto min-h-10" onClick={() => dispatch({ type: "order.fireCourse", tableId: sess.tableId, course: c })}><Icon name="send" size={16} />{L.t("fireCourse")} {c}</Btn>)}
        </div>
      )}
      {orders.map((o) => {
        const notSent = pendingIds.includes(o.id.replace(/^o-/, ""));
        return (
          <section key={o.id} className="rounded-2xl border border-line bg-surface">
            <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
              <span className="font-semibold">{o.code}</span>
              <span className={cn("rounded-md px-1.5 py-0.5 text-[12px] font-semibold", o.status === "ready" ? "bg-ok-soft text-ok" : o.status === "submitted" ? "bg-signal-soft text-signal" : o.status === "cancelled" ? "bg-bad-soft text-bad" : "bg-black/[0.05] text-ink-2")}>{L.order(o.status)}</span>
              {o.channel === "qr" && <span className="rounded-md bg-violet-soft px-1.5 py-0.5 text-[12px] text-violet">QR</span>}
              <span className="ml-auto text-[12px] text-muted">{mins(o.createdAt, now)} {L.t("minAgo")}</span>
              {notSent && <span className="w-full rounded-md bg-warn-soft px-2 py-1 text-[12.5px] font-medium text-warn"><Icon name="wifiOff" size={13} className="mr-1 inline" />{L.t("notConfirmed")}</span>}
            </header>
            <ul className="divide-y divide-line">
              {o.lines.filter((l) => l.status === "active").map((l) => {
                const t = lineTicket(o, l.id);
                const item = state.items.find((i) => i.id === l.itemId);
                return (
                  <li key={l.id} className="flex items-start gap-3 px-3 py-2.5">
                    {o.status !== "submitted" && o.status !== "cancelled" && <input type="checkbox" aria-label={L.t("moveItems")} className="mt-1 size-5 accent-[var(--color-ink)]" checked={sel.includes(l.id)} onChange={(e) => setSel(e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id))} />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-medium"><span className="tnum">{l.qty}×</span> {item ? L.item(item.name) : l.name}{l.remakeOf && <span className="ml-1 text-[12px] text-warn">↻</span>}</div>
                      <div className="text-[12.5px] text-muted">{[l.seat ? `${L.t("seat")} ${l.seat}` : null, l.course ? `${L.t("course")} ${l.course}` : null, ...l.modifiers.map((m) => item?.groups.flatMap((g) => g.options).find((x) => x.id === m.id)?.name[L.lang] ?? m.name)].filter(Boolean).join(" · ")}</div>
                      {l.note && <div className="text-[12.5px] italic text-signal">«{l.note}»</div>}
                    </div>
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold", !t ? "text-faint" : t.status === "ready" || t.status === "bumped" ? "bg-ok-soft text-ok" : t.status === "in_progress" ? "bg-warn-soft text-warn" : t.status === "held" ? "bg-info-soft text-info" : "bg-black/[0.05] text-ink-2")}>{t ? L.ticket(t.status) : "—"}</span>
                    {can("orders.void") && !l.remakeOf && o.status !== "submitted" && <button aria-label={L.t("void")} title={L.t("void")} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad" onClick={() => { const r = prompt(L.t("reason")); if (r) dispatch({ type: "order.voidLine", orderId: o.id, lineId: l.id, reason: r }); }}><Icon name="x" size={16} /></button>}
                  </li>
                );
              })}
            </ul>
            <footer className="flex flex-wrap gap-2 p-2">
              {o.status === "submitted" && <Btn tone="ok" className="flex-1" onClick={() => dispatch({ type: "order.accept", orderId: o.id })}><Icon name="check" size={17} />{L.t("accept")}</Btn>}
              {o.status === "ready" && <Btn tone="dark" className="flex-1" onClick={() => dispatch({ type: "order.serve", orderId: o.id })}><Icon name="check" size={17} />{L.t("serve")}</Btn>}
            </footer>
          </section>
        );
      })}
      {sel.length > 0 && (
        <div className="sticky bottom-2 flex gap-2 rounded-2xl bg-ink p-2 text-white shadow-lg">
          <span className="self-center px-2 text-[14px]">{sel.length} ✓</span>
          <Btn tone="light" className="flex-1" onClick={() => setMoveTo(true)}><Icon name="arrowRight" size={16} />{L.t("moveItems")}</Btn>
          <Btn tone="light" onClick={() => setSel([])}><Icon name="x" size={16} /></Btn>
        </div>
      )}
      {moveTo && <TablePicker L={L} exclude={sess.tableId} onClose={() => setMoveTo(false)} onPick={(to) => {
        const byOrder = new Map<string, string[]>();
        for (const id of sel) { const o = orders.find((x) => x.lines.some((l) => l.id === id)); if (o) byOrder.set(o.id, [...(byOrder.get(o.id) ?? []), id]); }
        byOrder.forEach((ids, orderId) => dispatch({ type: "order.moveLines", orderId, lineIds: ids, toTableId: to }));
        setSel([]); setMoveTo(false);
      }} />}
    </div>
  );
}

/* ---------------- Add tab ---------------- */

function ModSheet({ item, L, onClose, onAdd }: { item: MenuItem; L: L; onClose: () => void; onAdd: (mods: string[], note: string, qty: number) => void }) {
  const [mods, setMods] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const err = modifierError(item, mods);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label={L.item(item.name)}>
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-3xl">
        <div className="flex items-center justify-between"><h3 className="text-[18px] font-semibold">{L.item(item.name)}</h3><button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-paper" aria-label={L.t("close")}><Icon name="x" /></button></div>
        {item.allergens.length > 0 && <p className="mt-1 text-[13px] text-bad">{L.t("allergen")}: {item.allergens.join(", ")}</p>}
        {!item.allergensVerified && <p className="mt-1 text-[13px] text-warn">⚠ allergens not provided</p>}
        {item.groups.map((g) => (
          <div key={g.id} className="mt-3">
            <div className="mb-1.5 text-[13px] font-semibold text-muted">{g.name[L.lang]}{g.min > 0 ? " *" : ""}</div>
            <div className="flex flex-wrap gap-2">{g.options.map((o) => <Chip key={o.id} on={mods.includes(o.id)} onClick={() => setMods(g.max === 1 ? [...mods.filter((m) => !g.options.some((x) => x.id === m)), ...(mods.includes(o.id) && g.min === 0 ? [] : [o.id])] : mods.includes(o.id) ? mods.filter((m) => m !== o.id) : [...mods, o.id])}>{o.name[L.lang]}{o.price ? ` +${o.price}` : ""}</Chip>)}</div>
          </div>
        ))}
        <input className="mt-3 h-12 w-full rounded-xl border border-line-2 px-3 text-[15px]" placeholder={L.t("note")} value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-line-2"><button className="grid size-12 place-items-center text-[22px]" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="tnum w-8 text-center font-semibold">{qty}</span><button className="grid size-12 place-items-center text-[22px]" onClick={() => setQty(qty + 1)}>+</button></div>
          <Btn tone="dark" className="flex-1" disabled={Boolean(err)} onClick={() => onAdd(mods, note, qty)}>{L.t("add")}</Btn>
        </div>
      </div>
    </div>
  );
}

function AddTab({ sess, L, onSent }: { sess: TableSession; L: L; onSent: () => void }) {
  const { state, dispatch } = useR();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("fav");
  const [seat, setSeat] = useState(0);
  const [course, setCourse] = useState(0);
  const [draft, setDraft] = useState<CartLine[]>([]);
  const [pick, setPick] = useState<MenuItem | null>(null);
  const fav = useMemo(() => ["khorovats", "salad", "areni", "cappuccino", "ribeye", "salmon", "burger", "water"], []);
  const list = state.items.filter((i) => (q ? [i.name.hy, i.name.ru, i.name.en].some((n) => n.toLowerCase().includes(q.toLowerCase())) : cat === "fav" ? fav.includes(i.id) : i.categoryId === cat));
  const add = (item: MenuItem, modifierIds: string[] = [], note = "", qty = 1) => setDraft((d) => {
    const line: CartLine = { itemId: item.id, qty, modifierIds, note, seat: seat || undefined, course: item.categoryId === "drinks" ? 0 : course };
    const i = d.findIndex((x) => x.itemId === line.itemId && x.seat === line.seat && x.course === line.course && x.note === line.note && x.modifierIds.join() === line.modifierIds.join());
    return i >= 0 ? d.map((x, j) => (j === i ? { ...x, qty: x.qty + qty } : x)) : [...d, line];
  });
  const total = draft.reduce((a, l) => { const it = state.items.find((x) => x.id === l.itemId)!; return a + (it.price + it.groups.flatMap((g) => g.options).filter((o) => l.modifierIds.includes(o.id)).reduce((s, o) => s + o.price, 0)) * l.qty; }, 0);
  return (
    <div className="pb-28">
      {sess.allergies && <div className="mb-2 rounded-xl bg-bad-soft px-3 py-2 text-[14px] font-semibold text-bad">⚠ {L.t("allergies")}: {sess.allergies}</div>}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label={L.t("seat")}><Chip on={seat === 0} onClick={() => setSeat(0)}>{L.t("shared")}</Chip>{Array.from({ length: Math.min(12, sess.partySize) }, (_, i) => <Chip key={i} on={seat === i + 1} onClick={() => setSeat(i + 1)}>{L.t("seat")} {i + 1}</Chip>)}</div>
        <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label={L.t("course")}>{[0, 1, 2, 3].map((c) => <Chip key={c} on={course === c} onClick={() => setCourse(c)}>{c === 0 ? L.t("now") : `${c} · ${L.t(`c${c}` as "c1")}`}</Chip>)}</div>
        <input className="h-12 w-full rounded-xl border border-line-2 bg-surface px-3 text-[16px]" placeholder={L.t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        {!q && <div className="flex gap-1.5 overflow-x-auto pb-1"><Chip on={cat === "fav"} onClick={() => setCat("fav")}>★ {L.t("favourites")}</Chip>{state.categories.map((c) => <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>{c.name[L.lang]}</Chip>)}</div>}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((i) => (
          <button key={i.id} disabled={!i.available} onClick={() => (i.groups.length ? setPick(i) : add(i))} className={cn("min-h-20 rounded-2xl border border-line bg-surface p-3 text-left active:scale-[0.98]", !i.available && "opacity-40")}>
            <div className="text-[15px] font-semibold leading-snug">{L.item(i.name)}</div>
            <div className="tnum mt-1 text-[13px] text-muted">{money(i.price)}{!i.available && " · ✕"}{i.groups.some((g) => g.min > 0) && " · •••"}</div>
          </button>
        ))}
      </div>
      {draft.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <ul className="max-h-40 space-y-1 overflow-y-auto text-[14px]">
              {draft.map((l, i) => { const it = state.items.find((x) => x.id === l.itemId)!; return (
                <li key={i} className="flex items-center gap-2">
                  <button className="grid size-8 place-items-center rounded-lg bg-paper" onClick={() => setDraft(draft.map((x, j) => (j === i ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0))} aria-label="−">−</button>
                  <span className="tnum w-6 text-center font-semibold">{l.qty}</span>
                  <span className="min-w-0 flex-1 truncate">{L.item(it.name)} <span className="text-muted">{[l.seat ? `${L.t("seat")} ${l.seat}` : null, l.course ? `${L.t("course")} ${l.course}` : null].filter(Boolean).join(" · ")}</span></span>
                </li>
              ); })}
            </ul>
            <Btn tone="ok" className="mt-2 w-full" onClick={() => { dispatch({ type: "order.submit", channel: "waiter", orderType: "dine_in", tableId: sess.tableId, note: "", lines: draft }); setDraft([]); onSent(); }}>
              <Icon name="send" size={18} />{L.t("sendKitchen")} · {draft.reduce((a, l) => a + l.qty, 0)} · <span className="tnum">{money(total)}</span>
            </Btn>
          </div>
        </div>
      )}
      {pick && <ModSheet item={pick} L={L} onClose={() => setPick(null)} onAdd={(m, note, qty) => { add(pick, m, note, qty); setPick(null); }} />}
    </div>
  );
}

/* ---------------- Bill tab ---------------- */

function BillTab({ sess, L }: { sess: TableSession; L: L }) {
  const { state, dispatch, can } = useR();
  const [n, setN] = useState(2);
  const lines = sessionLines(state, sess);
  const total = sessionTotal(state, sess);
  const b = sess.bill;
  const kitchenBusy = state.orders.some((o) => o.sessionId === sess.id && ["submitted", "accepted", "preparing", "ready"].includes(o.status));
  const settled = b && b.parts.every((p) => p.status === "paid" || p.status === "recorded");
  const locked = b?.parts.some((p) => p.status !== "open" && p.status !== "declined");
  const bySeat = new Map<string, number>();
  for (const l of lines) bySeat.set(l.seat ? `${L.t("seat")} ${l.seat}` : L.t("shared"), (bySeat.get(l.seat ? `${L.t("seat")} ${l.seat}` : L.t("shared")) ?? 0) + l.unitPrice * l.qty);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-3">
        <div className="flex justify-between text-[17px] font-semibold"><span>{L.t("total")}</span><span className="tnum">{money(total)}</span></div>
        <div className="mt-1 flex flex-wrap gap-x-4 text-[13px] text-muted">{[...bySeat.entries()].map(([k, v]) => <span key={k}>{k}: <span className="tnum">{money(v)}</span></span>)}</div>
      </div>
      {can("bill.manage") && !locked && (
        <div className="flex flex-wrap gap-2">
          <Btn tone="light" onClick={() => dispatch({ type: "bill.prepare", tableId: sess.tableId, mode: "single" })}>{L.t("single")}</Btn>
          <Btn tone="light" onClick={() => dispatch({ type: "bill.prepare", tableId: sess.tableId, mode: "seats" })}>{L.t("bySeat")}</Btn>
          <div className="flex items-center gap-1 rounded-xl border border-line-2 bg-surface pl-3"><span className="text-[14px]">{L.t("equal")}</span>
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className="h-11 bg-transparent px-1 text-[15px]" aria-label={L.t("equal")}>{[2, 3, 4, 5, 6].map((x) => <option key={x}>{x}</option>)}</select>
            <button className="h-12 rounded-r-xl bg-ink px-3 text-white" onClick={() => dispatch({ type: "bill.prepare", tableId: sess.tableId, mode: "equal", n })}><Icon name="check" size={16} /></button>
          </div>
        </div>
      )}
      {b && (
        <ul className="space-y-2">
          {b.parts.map((p) => {
            const pay = p.paymentId ? state.payments.find((x) => x.id === p.paymentId) : undefined;
            return (
              <li key={p.id} className="rounded-2xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2"><span className="font-semibold">{p.label}</span><span className="tnum ml-auto text-[16px] font-semibold">{money(p.amount)}</span></div>
                <div className={cn("mt-1 text-[13px] font-medium", p.status === "paid" ? "text-ok" : p.status === "recorded" ? "text-info" : p.status === "pending" ? "text-warn" : p.status === "declined" ? "text-bad" : "text-muted")}>
                  {p.status === "paid" ? `${L.t("paid")} · ${pay?.providerRef ?? ""}` : p.status === "recorded" ? `${L.t("recorded")} (${p.method === "pos" ? "POS" : "cash"})` : p.status === "pending" ? L.t("waitingTerminal") : p.status === "declined" ? L.t("declined") : L.t("open")}
                </div>
                {(p.status === "open" || p.status === "declined") && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {can("bill.manage") && <Btn tone="dark" className="flex-1" onClick={() => dispatch({ type: "payment.request", tableId: sess.tableId, partId: p.id, method: "card_terminal" })}><Icon name="calc" size={16} />{L.t("payCard")}</Btn>}
                    {can("payment.record") && <Btn tone="light" onClick={() => dispatch({ type: "payment.record", tableId: sess.tableId, partId: p.id, method: "cash" })}>{L.t("recordCash")}</Btn>}
                    {can("payment.record") && <Btn tone="light" onClick={() => dispatch({ type: "payment.record", tableId: sess.tableId, partId: p.id, method: "pos" })}>{L.t("recordPos")}</Btn>}
                  </div>
                )}
                {p.status === "pending" && pay && (
                  <div className="mt-2 rounded-xl border border-dashed border-violet/50 bg-violet-soft p-2">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">{L.t("simAdapter")}</div>
                    <div className="mt-2 flex gap-2">
                      <Btn tone="ok" className="flex-1" onClick={() => dispatch({ type: "payment.result", paymentId: pay.id, approved: true, providerRef: `DEMO-${uid().toUpperCase()}`, adapter: "demo-terminal" })}>{L.t("demoApprove")}</Btn>
                      <Btn tone="bad" onClick={() => dispatch({ type: "payment.result", paymentId: pay.id, approved: false, providerRef: `DEMO-${uid().toUpperCase()}`, adapter: "demo-terminal" })}>{L.t("demoDecline")}</Btn>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Btn tone="ok" className="w-full" disabled={!settled || kitchenBusy} onClick={() => dispatch({ type: "table.close", tableId: sess.tableId, via: "bill" })}><Icon name="check" size={18} />{L.t("closeTable")}</Btn>
      <p className="text-[12.5px] text-muted">{L.t("fiscal")}</p>
    </div>
  );
}

/* ---------------- More tab ---------------- */

export function TablePicker({ L, exclude, onClose, onPick, onlyFree }: { L: L; exclude?: string; onClose: () => void; onPick: (id: string) => void; onlyFree?: boolean }) {
  const { state } = useR();
  const now = Date.now();
  const tables = state.tables.filter((t) => t.id !== exclude && state.areas.find((a) => a.id === t.areaId)?.open && !t.blocked && (!onlyFree || tableState(state, t, now) === "available"));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label={L.t("chooseTable")}>
      <div className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-4 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-[17px] font-semibold">{L.t("chooseTable")}</h3><button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-paper" aria-label={L.t("close")}><Icon name="x" /></button></div>
        <div className="grid grid-cols-4 gap-2">{tables.map((t) => { const st = tableState(state, t, now); return <button key={t.id} onClick={() => onPick(t.id)} className={cn("min-h-16 rounded-xl border p-2 text-center", st === "available" ? "border-ok/40 bg-ok-soft/40" : "border-line bg-paper")}><div className="text-[17px] font-bold">{t.label}</div><div className="text-[11px] text-muted">{L.tableSt(st)}</div></button>; })}</div>
      </div>
    </div>
  );
}

function MoreTab({ sess, L }: { sess: TableSession; L: L }) {
  const { state, dispatch, can } = useR();
  const [allergies, setAllergies] = useState(sess.allergies ?? "");
  const [notes, setNotes] = useState(sess.notes ?? "");
  const [party, setParty] = useState(sess.partySize);
  const [picker, setPicker] = useState<null | "transfer" | "merge">(null);
  const waiters = state.staff.filter((x) => x.role === "waiter" || x.role === "manager");
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl border border-line bg-surface p-3">
        <label className="block text-[13px] font-semibold text-bad">{L.t("allergies")}<input className="mt-1 h-12 w-full rounded-xl border border-line-2 px-3 text-[15px] text-ink" value={allergies} onChange={(e) => setAllergies(e.target.value)} /></label>
        <label className="block text-[13px] font-semibold text-muted">{L.t("serviceNotes")}<input className="mt-1 h-12 w-full rounded-xl border border-line-2 px-3 text-[15px] text-ink" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-[14px]">{L.t("guests")}<input type="number" min={1} max={30} className="h-11 w-20 rounded-xl border border-line-2 px-3" value={party} onChange={(e) => setParty(Number(e.target.value))} /></label>
        <Btn tone="dark" className="w-full" onClick={() => dispatch({ type: "table.notes", tableId: sess.tableId, allergies, notes, partySize: party })}>{L.t("save")}</Btn>
      </div>
      {can("tables.transfer") && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Btn tone="light" onClick={() => setPicker("transfer")}><Icon name="arrowRight" size={16} />{L.t("transfer")}</Btn>
        <Btn tone="light" onClick={() => setPicker("merge")}><Icon name="plus" size={16} />{L.t("merge")}</Btn>
      </div>}
      <div className="rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 text-[13px] font-semibold text-muted">{L.t("assign")}</div>
        <div className="flex flex-wrap gap-2">{waiters.map((w) => <Chip key={w.id} on={sess.waiterId === w.id} onClick={() => dispatch({ type: "table.assign", tableId: sess.tableId, waiterId: w.id })}>{w.name.split(" ")[0]}</Chip>)}</div>
      </div>
      {can("payment.record") && <Btn tone="light" className="w-full" onClick={() => dispatch({ type: "table.close", tableId: sess.tableId, via: "pos" })}>{L.t("recordPos")} → {L.t("closeTable")}</Btn>}
      {picker && <TablePicker L={L} exclude={sess.tableId} onlyFree={picker === "transfer"} onClose={() => setPicker(null)} onPick={(id) => { dispatch(picker === "transfer" ? { type: "table.transfer", fromTableId: sess.tableId, toTableId: id } : { type: "table.merge", tableId: sess.tableId, withTableId: id }); setPicker(null); }} />}
    </div>
  );
}

/* ---------------- Table screen ---------------- */

export function TableScreen({ tableId, L, onBack }: { tableId: string; L: L; onBack: () => void }) {
  const { state, dispatch, can } = useR();
  const now = Date.now();
  const [tab, setTab] = useState<"order" | "add" | "bill" | "more">("order");
  const [party, setParty] = useState(2);
  const table = state.tables.find((t) => t.id === tableId)!;
  const sess = openSessionOf(state, tableId);
  const st = tableState(state, table, now);
  const res = state.reservations.find((r) => r.status === "confirmed" && r.tableIds.includes(tableId) && r.at > now - 30 * 60000 && r.at - now < 3 * 3600000);
  const reqs = sess ? state.requests.filter((r) => r.sessionId === sess.id && r.status !== "done") : [];
  const turn = sess ? TURN_MIN(sess.partySize) - mins(sess.openedAt, now) : 0;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-14 z-20 -mx-3 border-b border-line bg-paper/95 px-3 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="grid size-11 place-items-center rounded-xl border border-line-2 bg-surface" aria-label="Back"><Icon name="chevronLeft" /></button>
          <div className="min-w-0 flex-1">
            <div className="text-[20px] font-bold leading-tight">{L.t("table")} {table.label}{sess?.mergedTables?.length ? ` + ${sess.mergedTables.map((x) => state.tables.find((t) => t.id === x)?.label).join(" + ")}` : ""}</div>
            <div className="text-[13px] text-muted">{L.tableSt(st)}{sess ? ` · ${sess.partySize} ${L.t("guests")} · ${mins(sess.openedAt, now)}′ · ${state.staff.find((x) => x.id === sess.waiterId)?.name.split(" ")[0]}` : ""}{sess && turn < 0 ? ` · +${-turn}′` : ""}</div>
          </div>
        </div>
        {sess?.allergies && <div className="mt-2 rounded-lg bg-bad-soft px-2 py-1 text-[13px] font-semibold text-bad">⚠ {sess.allergies}</div>}
        {sess?.notes && <div className="mt-1 text-[13px] text-muted">📝 {sess.notes}</div>}
        {reqs.map((r) => <div key={r.id} className="mt-2 flex items-center gap-2 rounded-lg bg-warn-soft px-2 py-1 text-[13.5px] text-warn"><Icon name="bell" size={14} /><span className="flex-1 font-medium">{L.req(r.kind)} · {mins(r.at, now)}′</span><button className="rounded-lg bg-ink px-3 py-1.5 text-white" onClick={() => dispatch({ type: "request.done", requestId: r.id })}>{L.t("done")}</button></div>)}
        {sess && <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-black/[0.05] p-1" role="tablist">{(["order", "add", "bill", "more"] as const).map((k) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-10 rounded-lg text-[14px] font-semibold", tab === k ? "bg-surface shadow-sm" : "text-muted")}>{L.t(k)}</button>)}</div>}
      </div>
      <div className="pt-3">
        {!sess ? (
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            {res && <div className="rounded-xl bg-info-soft px-3 py-2 text-[14px] text-info">{L.t("reservedAt")} {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(res.at)} · {res.name} · {res.partySize}{res.allergies ? ` · ⚠ ${res.allergies}` : ""}</div>}
            {st === "cleaning" ? <Btn tone="ok" className="w-full" onClick={() => dispatch({ type: "table.clean", tableId })}><Icon name="broom" size={18} />{L.t("cleaned")}</Btn>
              : st === "blocked" ? <p className="text-[14px] text-muted">{L.tableSt("blocked")}: {table.blocked}</p>
              : can("tables.manage") && <>
                <div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5, 6, 8].map((x) => <Chip key={x} on={party === x} onClick={() => setParty(x)}>{x}</Chip>)}</div>
                <Btn tone="dark" className="w-full" onClick={() => { dispatch({ type: "table.open", tableId, partySize: party }); setTab("add"); }}><Icon name="users" size={18} />{L.t("openTable")} · {party}</Btn>
              </>}
          </div>
        ) : tab === "order" ? <OrderTab sess={sess} L={L} now={now} /> : tab === "add" ? <AddTab sess={sess} L={L} onSent={() => setTab("order")} /> : tab === "bill" ? <BillTab sess={sess} L={L} /> : <MoreTab sess={sess} L={L} />}
      </div>
    </div>
  );
}

export function LangSwitch({ lang, setLang }: { lang: SL; setLang: (l: SL) => void }) {
  return <div className="flex rounded-lg border border-line-2 bg-surface p-0.5" role="group" aria-label="Language">{(["hy", "ru", "en"] as const).map((l) => <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cn("h-8 rounded-md px-2 text-[12px] font-semibold uppercase", lang === l ? "bg-ink text-white" : "text-muted")}>{l}</button>)}</div>;
}
