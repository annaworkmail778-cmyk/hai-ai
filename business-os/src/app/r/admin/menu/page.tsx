"use client";
/* Menu management: availability (reflected on QR, website and waiter app instantly), prices, margin per dish. */
import { useState } from "react";
import { Guard, money, pct } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, Input, Toggle, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { STATION_HY } from "@/lib/restaurant/staff-i18n";
import { dishEconomics } from "@/lib/restaurant/rules";

export default function MenuAdmin() {
  const { state, dispatch, can } = useR();
  const [edit, setEdit] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const showCost = can("costs.view");
  return (
    <Guard perm="menu.availability">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Մենյու</h1><p className="mt-1 text-[13.5px] text-muted">«Վերջացել է» նշումը անմիջապես երևում է QR մենյուում, կայքում և մատուցողի հավելվածում, և նման ուտեստով պատվեր չի ընդունվում։</p></div>
      <div className="space-y-4">
        {state.categories.map((c) => (
          <Card key={c.id} pad={false} className="overflow-hidden">
            <div className="border-b border-line bg-paper px-4 py-2 text-[13px] font-semibold">{c.name.hy}</div>
            <ul className="divide-y divide-line">{state.items.filter((i) => i.categoryId === c.id).map((i) => {
              const e = dishEconomics(state, i.id);
              return (
                <li key={i.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13.5px]", !i.available && "bg-bad-soft/40")}>
                  <span className="min-w-40 flex-1 font-medium">{i.name.hy}{!i.allergensVerified && <Badge tone="warn" className="ml-2">Ալերգենները նշված չեն</Badge>}</span>
                  <span className="w-28 text-[12.5px] text-muted">{STATION_HY[i.station]}</span>
                  {showCost && <span className="tnum w-28 text-right text-[12.5px] text-muted">ինքն. {money(e.cost)}</span>}
                  {showCost && <Badge tone={e.gm >= 0.72 ? "ok" : e.gm >= 0.62 ? "warn" : "bad"}>{pct(e.gm, 0)}</Badge>}
                  <span className="w-36 text-right">{edit === i.id ? <span className="inline-flex gap-1"><Input className="h-8 w-24" type="number" value={price} onChange={(x) => setPrice(x.target.value)} autoFocus /><Button size="sm" variant="primary" onClick={() => { dispatch({ type: "menu.price", itemId: i.id, price: Number(price) }); setEdit(null); }}>OK</Button></span>
                    : <button disabled={!can("menu.price")} className="tnum font-semibold hover:underline disabled:no-underline" onClick={() => { setEdit(i.id); setPrice(String(i.price)); }}>{money(i.price)}</button>}</span>
                  <label className="flex w-36 items-center justify-end gap-2 text-[12.5px]">{i.available ? "Հասանելի" : <span className="font-semibold text-bad">Վերջացել է</span>}<Toggle on={i.available} onChange={(v) => dispatch({ type: "menu.availability", itemId: i.id, available: v })} label={`${i.name.hy} հասանելի`} /></label>
                </li>
              );
            })}</ul>
          </Card>
        ))}
      </div>
    </Guard>
  );
}
