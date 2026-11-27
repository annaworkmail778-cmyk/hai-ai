"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Bars } from "@/components/charts";
import { Badge, Button, Card, CardHead, cn, DemoDataBadge, Drawer, Field, Input, Kpi, Modal, Select, Tabs, Textarea, Toggle } from "@/components/ui";
import { useNow } from "@/lib/client/use-now";
import { useDemo } from "@/lib/client/demo-store";
import { amd, stamp } from "@/lib/format";
import { ALLERGEN_LABEL } from "@/lib/hospitality-data";
import { ORDER_FLOW } from "@/lib/rules";
import type { Order, OrderStatus } from "@/lib/types";

export const ORDER_ST: Record<OrderStatus, [string, "warn" | "info" | "ok" | "neutral" | "bad"]> = {
  submitted: ["Ուղարկված", "warn"], accepted: ["Ընդունված", "info"], preparing: ["Պատրաստվում է", "info"], ready: ["Պատրաստ է", "ok"],
  out_for_delivery: ["Առաքվում է", "info"], completed: ["Ավարտված", "neutral"], rejected: ["Մերժված", "bad"], cancelled: ["Չեղարկված", "bad"],
};
const TYPE = { room_service: "Սենյակ", dine_in: "Սեղան", takeaway: "Վերցնել" } as const;
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { accepted: "Ընդունել", preparing: "Սկսել պատրաստել", ready: "Պատրաստ է", out_for_delivery: "Առաքել", completed: "Ավարտել", cancelled: "Չեղարկել", rejected: "Մերժել" };
const DAY = 86400e3;

export default function Restaurant() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"orders" | "menu" | "tables" | "sales">("orders");
  const [cur, setCur] = useState<string | null>(null);
  const [create, setCreate] = useState(false);
  const [f, setF] = useState({ categoryId: "mains", name: "", desc: "", price: "", allergens: "" });
  const now = useNow(60000);
  const active = state.orders.filter((o) => !["completed", "rejected", "cancelled"].includes(o.status));
  const o = state.orders.find((x) => x.id === cur);
  const s = useMemo(() => {
    const win = (days: number) => state.orders.filter((x) => x.status === "completed" && now - x.createdAt < days * DAY);
    const d1 = win(1), d7 = win(7), d30 = win(30);
    const sum = (l: Order[]) => l.reduce((a, x) => a + x.total, 0);
    const qty = new Map<string, number>();
    for (const x of d30) for (const it of x.items) qty.set(it.itemId, (qty.get(it.itemId) ?? 0) + it.qty);
    const top = [...qty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ label: state.menu.items.find((m) => m.id === id)?.name.hy ?? id, value: n }));
    const byType = (["room_service", "dine_in", "takeaway"] as const).map((t) => ({ label: TYPE[t], value: sum(d30.filter((x) => x.type === t)) }));
    const closed30 = state.orders.filter((x) => now - x.createdAt < 30 * DAY && ["completed", "rejected", "cancelled"].includes(x.status));
    const rejected = closed30.filter((x) => x.status !== "completed").length;
    return { rev1: sum(d1), rev7: sum(d7), rev30: sum(d30), n30: d30.length, avg: d30.length ? Math.round(sum(d30) / d30.length) : 0, top, byType, rejectPct: closed30.length ? (rejected / closed30.length) * 100 : 0, disc30: d30.reduce((a, x) => a + x.discount, 0) };
  }, [state.orders, state.menu.items, now]);
  return (
    <>
      <PageTitle title="Ռեստորան և մենյու" sub="Պատվերներ, մենյուի կառավարում, սեղաններ և վաճառքներ" right={<Link href="/kds" target="_blank"><Button variant="primary" icon="flame">Բացել KDS</Button></Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ակտիվ պատվերներ" value={active.length} sub={`${active.filter((x) => x.status === "submitted").length} սպասում է ընդունման`} icon="coffee" tone="warn" />
        <Kpi label="Եկամուտ՝ վերջին 24 ժ" value={amd(s.rev1)} icon="chart" />
        <Kpi label="Միջին չեկ (30 օր)" value={amd(s.avg)} sub={`${s.n30} ավարտված պատվեր`} icon="calc" />
        <Kpi label="Մենյուից հասանելի" value={`${state.menu.items.filter((m) => m.available).length}/${state.menu.items.length}`} icon="list" tone="ok" />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "orders", label: "Պատվերներ", count: active.length }, { id: "menu", label: "Մենյու" }, { id: "tables", label: "Սեղաններ" }, { id: "sales", label: "Վաճառքներ" }]} />

      {tab === "orders" && (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {[...active, ...state.orders.filter((x) => !active.includes(x)).slice(0, 25)].map((x) => (
              <li key={x.id}><button onClick={() => setCur(x.id)} className={cn("flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-paper", x.status === "submitted" && "bg-warn-soft/40")}>
                <span className="w-16 font-semibold">{x.code}</span>
                <span className="w-28 text-[13px] text-ink-2">{TYPE[x.type]} {x.roomId ?? x.tableId ?? x.pickupTime ?? ""}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{x.items.map((it) => `${it.qty}× ${state.menu.items.find((m) => m.id === it.itemId)?.name.hy}`).join(", ")}</span>
                <span className="tnum w-24 text-right text-[13.5px] font-medium">{amd(x.total)}</span>
                <span className="w-28 text-[12px] text-muted">{stamp(x.createdAt, state.baseDate)}</span>
                <Badge tone={ORDER_ST[x.status][1]} dot>{ORDER_ST[x.status][0]}</Badge>
              </button></li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "menu" && (
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="text-[13px] text-muted">Գնի և հասանելիության փոփոխությունները անմիջապես երևում են հյուրի մենյուում</span><Button icon="plus" size="sm" onClick={() => setCreate(true)}>Նոր ուտեստ</Button></div>
          {state.menu.categories.map((c) => (
            <div key={c.id}>
              <div className="bg-paper px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-faint">{c.name.hy}</div>
              <ul className="divide-y divide-line">
                {state.menu.items.filter((m) => m.categoryId === c.id).map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-paper"><Image src={m.photo} alt="" fill sizes="44px" className="object-cover" /></span>
                    <div className="min-w-0 flex-1"><div className={cn("text-[14px] font-medium", !m.available && "text-muted line-through")}>{m.name.hy}</div><div className="truncate text-[12px] text-muted">{m.allergens.map((a) => ALLERGEN_LABEL[a]?.hy ?? a).join(", ") || "Առանց նշված ալերգենների"}{m.options.length ? ` · ${m.options.length} տարբերակ` : ""} · {m.prepMin} ր</div></div>
                    <PriceEdit value={m.price} onSave={(p) => dispatch({ type: "menu.update", itemId: m.id, patch: { price: p } })} />
                    <Toggle on={m.available} onChange={(v) => dispatch({ type: "menu.update", itemId: m.id, patch: { available: v } })} label={m.available ? "Հասանելի" : "Վերջացել է"} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      )}

      {tab === "tables" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {state.tables.map((t) => {
            const ord = active.filter((x) => x.tableId === t.id);
            return (
              <Card key={t.id} className={cn(ord.length > 0 && "ring-2 ring-signal")}>
                <div className="flex items-center justify-between"><span className="text-[18px] font-semibold">{t.label}</span><Badge tone={ord.length ? "warn" : "ok"}>{ord.length ? "Զբաղված" : "Ազատ"}</Badge></div>
                <div className="mt-1 text-[12.5px] text-muted">{t.seats} տեղ · {t.zone}</div>
                {ord.map((x) => <button key={x.id} onClick={() => setCur(x.id)} className="mt-2 block w-full rounded-lg bg-paper px-2.5 py-1.5 text-left text-[12.5px]">{x.code} · {ORDER_ST[x.status][0]} · {amd(x.total)}</button>)}
                <a href={`/q/table/${t.id}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[12px] text-info underline">QR՝ /q/table/{t.id}</a>
              </Card>
            );
          })}
          <p className="col-span-full text-[12.5px] text-muted">Սեղանի ամրագրումները (ժամով) կլինեն հաջորդ փուլում. ներկայումս սեղանի զբաղվածությունը որոշվում է ակտիվ պատվերներով։</p>
        </div>
      )}

      {tab === "sales" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHead title="Եկամուտ" right={<DemoDataBadge />} />
            <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[["24 ժամ", s.rev1], ["7 օր", s.rev7], ["30 օր", s.rev30]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-paper p-3"><dt className="text-[12px] text-muted">{l}</dt><dd className="tnum mt-1 text-[16px] font-semibold">{amd(v as number)}</dd></div>)}
            </dl>
            <ul className="mt-4 space-y-1.5 text-[12.5px] text-muted">
              <li><b className="text-ink-2">Եկամուտ</b> = ավարտված պատվերների գումար՝ զեղչերից հետո (մերժված/չեղարկված չեն հաշվվում)</li>
              <li><b className="text-ink-2">Միջին չեկ</b> = 30 օրվա եկամուտ ÷ ավարտված պատվերների քանակ = {amd(s.rev30)} ÷ {s.n30} = {amd(s.avg)}</li>
              <li><b className="text-ink-2">Մերժման/չեղարկման մասնաբաժին</b> = {s.rejectPct.toFixed(1)}% · <b className="text-ink-2">Զեղչեր 30 օր</b> = {amd(s.disc30)}</li>
            </ul>
          </Card>
          <Card><CardHead title="Եկամուտն ըստ պատվերի տեսակի (30 օր)" /><div className="mt-3"><Bars data={s.byType} format={amd} /></div></Card>
          <Card className="lg:col-span-2"><CardHead title="Ամենավաճառվող ուտեստներ (30 օր, հատ)" /><div className="mt-3"><Bars data={s.top} tone="signal" /></div></Card>
        </div>
      )}

      <Drawer open={!!o} onClose={() => setCur(null)} title={o ? `Պատվեր ${o.code}` : ""} sub={o ? `${TYPE[o.type]} ${o.roomId ?? o.tableId ?? o.pickupTime ?? ""} · ${o.guestName || "Հյուր"}` : ""}
        footer={o && (ORDER_FLOW[o.status] ?? []).length > 0 ? <div className="flex flex-wrap gap-2">{(ORDER_FLOW[o.status] as OrderStatus[]).filter((n) => n !== "out_for_delivery" || o.type === "room_service").map((n) => <Button key={n} variant={n === "rejected" || n === "cancelled" ? "ghost" : "primary"} onClick={() => dispatch({ type: "order.status", target: o.id, status: n, reason: n === "rejected" || n === "cancelled" ? "Չեղարկվել է անձնակազմի կողմից" : undefined })}>{NEXT_LABEL[n]}</Button>)}</div> : undefined}>
        {o && (
          <div className="space-y-4 text-[14px]">
            <Badge tone={ORDER_ST[o.status][1]} dot>{ORDER_ST[o.status][0]}</Badge>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {o.items.map((it, i) => { const m = state.menu.items.find((x) => x.id === it.itemId); return <li key={i} className="flex justify-between gap-3 px-3 py-2"><span>{it.qty} × {m?.name.hy}{it.options.length ? <span className="block text-[12px] text-muted">+ {m?.options.filter((x) => it.options.includes(x.id)).map((x) => x.name.hy).join(", ")}</span> : null}</span><span className="tnum">{amd(it.price * it.qty)}</span></li>; })}
            </ul>
            <dl className="space-y-1">
              <div className="flex justify-between"><dt className="text-muted">Ենթագումար</dt><dd className="tnum">{amd(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Զեղչ{o.voucherId ? " (վաուչեր)" : ""}</dt><dd className="tnum">−{amd(o.discount)}</dd></div>}
              <div className="flex justify-between font-semibold"><dt>Ընդամենը</dt><dd className="tnum">{amd(o.total)}</dd></div>
            </dl>
            {o.note && <p className="rounded-xl bg-paper p-3">«{o.note}»</p>}
            {o.reason && <p className="rounded-xl bg-bad-soft p-3 text-bad">{o.reason}</p>}
            <ol className="space-y-1.5 border-l border-line pl-4 text-[13px]">{o.history.map((h, i) => <li key={i}>{ORDER_ST[h.status][0]} <span className="text-muted">· {h.by} · {stamp(h.at, state.baseDate)}</span></li>)}</ol>
            {o.type === "room_service" && <p className="text-[12px] text-muted">Վճարումը կավելացվի սենյակի հաշվին (ցուցադրական․ իրական PMS/POS ինտեգրացիա չկա)։</p>}
          </div>
        )}
      </Drawer>

      <Modal open={create} onClose={() => setCreate(false)} title="Նոր ուտեստ" footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Չեղարկել</Button><Button variant="primary" disabled={!f.name.trim() || !(+f.price > 0)} onClick={() => { dispatch({ type: "menu.create", item: { categoryId: f.categoryId, name: f.name.trim(), desc: f.desc.trim(), price: +f.price, allergens: f.allergens.split(",").map((x) => x.trim()).filter(Boolean) } }); setCreate(false); setF({ ...f, name: "", desc: "", price: "", allergens: "" }); }}>Ավելացնել</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Բաժին"><Select value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>{state.menu.categories.map((c) => <option key={c.id} value={c.id}>{c.name.hy}</option>)}</Select></Field>
          <Field label="Գին (֏)"><Input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Անվանում" className="sm:col-span-2"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Նկարագրություն" className="sm:col-span-2"><Textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
          <Field label="Ալերգեններ (ստորակետով)" hint="օր․՝ gluten, dairy, nuts" className="sm:col-span-2"><Input value={f.allergens} onChange={(e) => setF({ ...f, allergens: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}

function PriceEdit({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState<string | null>(null);
  return v === null
    ? <button onClick={() => setV(String(value))} className="tnum w-28 rounded-lg px-2 py-1 text-right text-[13.5px] font-medium hover:bg-paper" title="Փոխել գինը">{amd(value)}</button>
    : <form onSubmit={(e) => { e.preventDefault(); if (+v > 0) onSave(+v); setV(null); }} className="flex w-28 items-center gap-1"><Input autoFocus className="h-8 text-right" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} onBlur={() => { if (+v > 0 && +v !== value) onSave(+v); setV(null); }} /></form>;
}
