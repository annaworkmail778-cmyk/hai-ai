"use client";
/* Inventory: stock on hand, alerts, price history, used-in recipes, purchase price update with live margin impact, waste log. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Spark } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Guard, Labelled, hm, money, pct } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, Drawer, Field, Input, Select, Tabs, cn } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";
import { wasteQty } from "@/lib/restaurant/engine";
import { dishEconomics, unitCost } from "@/lib/restaurant/rules";
import type { RestaurantState } from "@/lib/restaurant/types";

const STORAGE: Record<string, string> = { fridge: "Սառնարան", freezer: "Սառցարան", dry: "Չոր պահեստ", bar: "Բար" };
const fmtQty = (q: number, unit: string) => (unit === "pcs" ? `${Math.round(q)} հատ` : q >= 1000 ? `${(q / 1000).toFixed(1)} ${unit === "g" ? "կգ" : "լ"}` : `${Math.round(q)} ${unit === "g" ? "գ" : "մլ"}`);

/** Cost of an ingredient at the start of this demo session (to show the effect of changes made during the meeting). */
const sessionStartCost = (s: RestaurantState, id: string) => {
  const pts = s.prices.filter((p) => p.ingredientId === id && p.at <= s.epochAt);
  return pts.length ? pts[pts.length - 1].cost : s.ingredients.find((i) => i.id === id)!.cost;
};

function IngredientDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { state, dispatch, can } = useR();
  const ing = state.ingredients.find((i) => i.id === id)!;
  const st = A.stockStatus(state).find((x) => x.ingredient.id === id)!;
  const [price, setPrice] = useState(String(ing.cost));
  const [waste, setWaste] = useState("");
  const [reason, setReason] = useState("Ժամկետանց");
  const usage = useMemo(() => A.monthlyUsage(state), [state]);
  const start = sessionStartCost(state, id);
  const changed = start !== ing.cost;
  const startCostOf = (x: string) => { const i = state.ingredients.find((y) => y.id === x)!; return (x === id ? start : i.cost) / i.unitsPerPurchase; };
  const usedIn = state.recipes.filter((r) => r.lines.some((l) => l.ingredientId === id)).map((r) => ({ r, now: dishEconomics(state, r.itemId), before: dishEconomics(state, r.itemId, startCostOf), line: r.lines.find((l) => l.ingredientId === id)! }));
  const history = state.prices.filter((p) => p.ingredientId === id).sort((a, b) => a.at - b.at);
  const moves = state.moves.filter((m) => m.ingredientId === id).slice(-8).reverse();
  const monthlyImpact = ((ing.cost - start) / ing.unitsPerPurchase) * (usage[id] ?? 0);
  return (
    <Drawer open onClose={onClose} wide title={ing.name} sub={`${STORAGE[ing.storage]} · ${state.suppliers.find((s) => s.id === ing.supplierId)?.name}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={cn("rounded-xl p-3", st.low ? "bg-bad-soft text-bad" : "bg-paper")}><div className="text-[11.5px]">Պաշար</div><div className="tnum text-[18px] font-semibold">{fmtQty(st.qty, ing.unit)}</div><div className="text-[11px] opacity-70">նվազագույնը՝ {fmtQty(ing.minLevel, ing.unit)}</div></div>
          <div className="rounded-xl bg-paper p-3"><div className="text-[11.5px] text-muted">Գին</div><div className="tnum text-[18px] font-semibold">{money(ing.cost)}</div><div className="text-[11px] text-muted">/ {ing.purchaseUnit}</div></div>
          <div className="rounded-xl bg-paper p-3"><div className="text-[11.5px] text-muted">Ամսական օգտագործում</div><div className="tnum text-[18px] font-semibold">{fmtQty(usage[id] ?? 0, ing.unit)}</div><div className="text-[11px] text-muted">վաճառքից (28 օր → 30)</div></div>
        </div>

        {can("inventory.adjust") && (
          <Card className="border-signal/30">
            <div className="text-[14px] font-semibold">Թարմացնել գնման գինը</div>
            <p className="mt-0.5 text-[12.5px] text-muted">Օր.՝ մատակարարի նոր հաշիվ-ապրանքագիր։ Բոլոր բաղադրատոմսերը վերահաշվարկվում են անմիջապես. անցած վաճառքի ինքնարժեքը չի փոխվում։</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Field label={`Նոր գին, ֏ / ${ing.purchaseUnit}`} className="w-48"><Input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
              <Button variant="signal" icon="refresh" disabled={!(Number(price) > 0) || Number(price) === ing.cost} onClick={() => dispatch({ type: "ingredient.price", ingredientId: id, cost: Number(price), source: "invoice" })}>Կիրառել</Button>
              {Number(price) > 0 && Number(price) !== ing.cost && <span className="text-[12.5px] text-muted">{Number(price) > ing.cost ? "+" : ""}{pct((Number(price) - ing.cost) / ing.cost)}</span>}
            </div>
          </Card>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between"><h3 className="text-[14px] font-semibold">Օգտագործվում է {usedIn.length} ուտեստում</h3>{changed && <Badge tone="signal">Գինը փոխվել է այս ցուցադրության ընթացքում՝ {money(start)} → {money(ing.cost)}</Badge>}</div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead className="bg-paper text-left text-[11.5px] text-muted"><tr><th className="px-3 py-2">Ուտեստ</th><th className="px-3 py-2 text-right">Քանակ / բաժին</th><th className="px-3 py-2 text-right">Ինքնարժեք</th><th className="px-3 py-2 text-right">Համախառն մարժա</th><th className="px-3 py-2 text-right">Գին</th></tr></thead>
              <tbody>{usedIn.map(({ r, now, before, line }) => (
                <tr key={r.itemId} className="border-t border-line">
                  <td className="px-3 py-2"><Link href={`/r/admin/recipes?item=${r.itemId}`} className="font-medium hover:underline">{now.item.name.hy}</Link></td>
                  <td className="tnum px-3 py-2 text-right text-muted">{fmtQty(line.qty / line.yieldPct, ing.unit)}</td>
                  <td className="tnum px-3 py-2 text-right">{changed && <span className="text-muted line-through">{money(before.cost)}</span>} {money(now.cost)}</td>
                  <td className={cn("tnum px-3 py-2 text-right font-semibold", changed && now.gm < before.gm ? "text-bad" : changed ? "text-ok" : "")}>{changed && <span className="font-normal text-muted">{pct(before.gm)} → </span>}{pct(now.gm)}</td>
                  <td className="tnum px-3 py-2 text-right">{money(now.item.price)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {changed && <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-paper px-3 py-2 text-[13px]"><Labelled kind="calculated" /> Ամսական ինքնարժեքի փոփոխություն՝ <b className={cn("tnum", monthlyImpact > 0 ? "text-bad" : "text-ok")}>{monthlyImpact > 0 ? "+" : ""}{money(monthlyImpact)}</b> <span className="text-muted">= գնի տարբերություն × ամսական օգտագործում ({fmtQty(usage[id] ?? 0, ing.unit)})</span></div>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[14px] font-semibold">Գնի պատմություն</h3>
            {history.length > 1 && <Spark values={history.map((h) => h.cost)} className="mb-2 h-10 w-full" />}
            <ul className="space-y-1 text-[12.5px]">{history.slice().reverse().map((h, i) => <li key={i} className="flex justify-between"><span className="text-muted">{new Date(h.at).toISOString().slice(0, 10)} · {h.source === "invoice" ? "հաշիվ" : h.source === "manual" ? "ձեռքով" : "սկզբնական"}</span><span className="tnum">{money(h.cost)}</span></li>)}</ul>
          </div>
          <div>
            <h3 className="mb-2 text-[14px] font-semibold">Այսօրվա շարժը</h3>
            <ul className="space-y-1 text-[12.5px]">{moves.map((m) => <li key={m.key} className="flex justify-between gap-2"><span className="text-muted">{hm(m.at)} · {{ consume: "Պատվեր", reverse: "Վերադարձ", waste: "Կորուստ", receive: "Ստացում", adjust: "Գույքագրում" }[m.kind]}{m.reason ? ` · ${m.reason}` : ""}</span><span className={cn("tnum", m.qty < 0 || m.kind === "waste" ? "text-bad" : "text-ok")}>{m.kind === "waste" && !m.qty ? `−${fmtQty(wasteQty(m), ing.unit)} (եփած)` : `${m.qty > 0 ? "+" : "−"}${fmtQty(Math.abs(m.qty), ing.unit)}`}</span></li>)}</ul>
          </div>
        </div>

        {can("inventory.adjust") && (
          <div className="rounded-xl border border-line p-3">
            <h3 className="text-[14px] font-semibold">Գրանցել կորուստ</h3>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <Field label={`Քանակ (${ing.unit === "pcs" ? "հատ" : ing.unit === "g" ? "գ" : "մլ"})`} className="w-32"><Input type="number" value={waste} onChange={(e) => setWaste(e.target.value)} /></Field>
              <Field label="Պատճառ" className="w-48"><Select value={reason} onChange={(e) => setReason(e.target.value)}>{["Ժամկետանց", "Ավելորդ պատրաստում", "Մաքրման կորուստ", "Վնասված"].map((r) => <option key={r}>{r}</option>)}</Select></Field>
              <Button variant="danger" disabled={!(Number(waste) > 0) || Number(waste) > st.qty} onClick={() => { dispatch({ type: "stock.waste", ingredientId: id, qty: Number(waste), reason }); setWaste(""); }}>Գրանցել</Button>
              {Number(waste) > 0 && <span className="text-[12.5px] text-muted">≈ {money(Number(waste) * unitCost(ing))}</span>}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function Stocktake() {
  const { state, dispatch, can } = useR();
  const stock = useMemo(() => A.stockStatus(state), [state]);
  const [storage, setStorage] = useState<string>("fridge");
  const [vals, setVals] = useState<Record<string, string>>({});
  const rows = stock.filter((x) => x.ingredient.storage === storage);
  const entered = rows.filter((x) => vals[x.ingredient.id] !== undefined && vals[x.ingredient.id] !== "");
  const variance = entered.reduce((a, x) => a + (Number(vals[x.ingredient.id]) - x.qty) * (x.ingredient.cost / x.ingredient.unitsPerPurchase), 0);
  const last = state.counts[0];
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">{Object.entries(STORAGE).map(([k, v]) => <button key={k} onClick={() => setStorage(k)} className={cn("h-8 rounded-lg px-3 text-[12.5px] font-medium", storage === k ? "bg-ink text-white" : "bg-paper")}>{v}</button>)}<span className="ml-auto text-[12.5px] text-muted">Տարբերություն՝ <b className={cn("tnum", variance < 0 ? "text-bad" : "text-ink")}>{money(variance)}</b></span></div>
        <table className="w-full text-[13px]"><thead className="text-left text-[11.5px] text-muted"><tr><th className="px-3 py-2">Բաղադրիչ</th><th className="px-2 text-right">Համակարգում</th><th className="px-2 text-right">Հաշվված</th><th className="px-3 text-right">Տարբերություն</th></tr></thead>
          <tbody>{rows.map((x) => { const v = vals[x.ingredient.id]; const d = v === undefined || v === "" ? null : Number(v) - x.qty; return (
            <tr key={x.ingredient.id} className="border-t border-line"><td className="px-3 py-1.5 font-medium">{x.ingredient.name}</td><td className="tnum px-2 text-right text-muted">{fmtQty(x.qty, x.ingredient.unit)}</td>
              <td className="px-2 text-right"><input inputMode="decimal" aria-label={`${x.ingredient.name} հաշվված`} className="h-9 w-24 rounded-lg border border-line-2 px-2 text-right tnum" value={v ?? ""} onChange={(e) => setVals({ ...vals, [x.ingredient.id]: e.target.value.replace(",", ".") })} /> <span className="text-[11px] text-muted">{x.ingredient.unit}</span></td>
              <td className={cn("tnum px-3 text-right", d !== null && d < 0 ? "text-bad" : "text-muted")}>{d === null ? "—" : `${d > 0 ? "+" : ""}${Math.round(d * 100) / 100}`}</td></tr>
          ); })}</tbody></table>
        <div className="flex items-center gap-2 border-t border-line p-3"><span className="text-[12.5px] text-muted">{entered.length} դիրք լրացված</span><Button className="ml-auto" variant="primary" icon="check" disabled={!entered.length || !can("inventory.adjust")} onClick={() => { dispatch({ type: "stock.count", lines: entered.map((x) => ({ ingredientId: x.ingredient.id, counted: Number(vals[x.ingredient.id]) })) }); setVals({}); }}>Հաստատել գույքագրումը</Button></div>
      </Card>
      <Card><h2 className="text-[15px] font-semibold">Վերջին գույքագրումը</h2>
        {!last ? <p className="mt-2 text-[13px] text-muted">Դեռ չի կատարվել այս ցուցադրությունում։</p> : <>
          <p className="mt-1 text-[12.5px] text-muted">{state.staff.find((x) => x.id === last.by)?.name ?? last.by} · {last.lines.length} դիրք · տարբերություն՝ <b className="tnum text-ink">{money(last.lines.reduce((a, l) => a + (l.counted - l.expected) * l.unitCost, 0))}</b></p>
          <ul className="mt-2 space-y-1 text-[12.5px]">{last.lines.filter((l) => l.counted !== l.expected).map((l) => <li key={l.ingredientId} className="flex justify-between"><span>{state.ingredients.find((i) => i.id === l.ingredientId)?.name}</span><span className={cn("tnum", l.counted < l.expected ? "text-bad" : "text-ok")}>{money((l.counted - l.expected) * l.unitCost)}</span></li>)}</ul>
        </>}
        <p className="mt-3 text-[12px] text-muted">Հաստատումից հետո համակարգի պաշարը ճշգրտվում է հաշվվածին, տարբերությունը գրանցվում է որպես ճշգրտում։</p>
      </Card>
    </div>
  );
}

function AllergenCheck() {
  const { state } = useR();
  const missing = state.items.filter((i) => !i.allergensVerified);
  return (
    <Card className="mt-4"><div className="mb-2 flex items-center gap-2"><h2 className="text-[15px] font-semibold">Ալերգենների ստուգում</h2><Badge tone={missing.length ? "warn" : "ok"}>{missing.length} ուտեստ առանց հաստատված ալերգենների</Badge></div>
      <p className="mb-3 text-[12.5px] text-muted">Ալերգենները նշվում և հաստատվում են խոհարարի կողմից յուրաքանչյուր ուտեստի համար։ Չհաստատված ուտեստի դեպքում հյուրը տեսնում է «Հարցրեք մատուցողին»։ Համակարգը չի երաշխավորում ալերգենների բացակայություն։</p>
      <ul className="divide-y divide-line text-[13px]">{state.items.map((i) => <li key={i.id} className="flex flex-wrap items-center gap-2 py-2"><span className="min-w-0 flex-1 font-medium">{i.name.hy}</span>{i.allergens.map((a) => <Badge key={a}>{a}</Badge>)}{i.allergensVerified ? <Badge tone="ok">հաստատված</Badge> : <Badge tone="warn">չի հաստատված</Badge>}</li>)}</ul>
    </Card>
  );
}

export default function Inventory() {
  const { state } = useR();
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(sp.get("tab") ?? "stock");
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const open = sp.get("open");
  const stock = useMemo(() => A.stockStatus(state), [state]);
  const waste = useMemo(() => A.wasteIn(state, A.periodDays(state, "28d")).concat(A.wasteIn(state, A.periodDays(state, "today"))), [state]);
  const changes = useMemo(() => A.priceChanges(state), [state]);
  const rows = stock.filter((x) => (!lowOnly || x.low) && x.ingredient.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => Number(b.low) - Number(a.low) || a.ingredient.name.localeCompare(b.ingredient.name));
  const setOpen = (id: string | null) => router.replace(id ? `/r/admin/inventory?tab=${tab}&open=${id}` : `/r/admin/inventory?tab=${tab}`, { scroll: false });
  const wasteByIng = Object.entries(waste.reduce<Record<string, number>>((a, w) => ({ ...a, [w.ingredientId]: (a[w.ingredientId] ?? 0) + w.cost }), {})).sort((a, b) => b[1] - a[1]);
  return (
    <Guard perm="inventory.view">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Պահեստ</h1><p className="mt-1 text-[13.5px] text-muted">Պաշարը նվազում է ավտոմատ, երբ խոհանոցն ընդունում է պատվերը (ըստ բաղադրատոմսի)։ Չեղարկումը մինչև պատրաստելը վերադարձնում է պաշարը, իսկ պատրաստելուց հետո՝ գրանցվում է որպես կորուստ։</p></div>
      <Tabs value={tab} onChange={setTab} items={[{ id: "stock", label: "Պաշար", count: stock.filter((x) => x.low).length }, { id: "prices", label: "Գների փոփոխություն", count: changes.length }, { id: "waste", label: "Կորուստներ" }, { id: "count", label: "Գույքագրում" }, { id: "allergens", label: "Ալերգեններ" }]} />
      {tab === "count" && <Stocktake />}
      {tab === "allergens" && <AllergenCheck />}
      {tab === "stock" && (
        <Card pad={false} className="mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3"><Input className="max-w-xs" placeholder="Որոնել բաղադրիչ" value={q} onChange={(e) => setQ(e.target.value)} /><label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />Միայն նվազագույնից ցածր</label><span className="ml-auto text-[13px] text-muted">Պաշարի արժեք՝ <b className="tnum text-ink">{money(stock.reduce((a, x) => a + x.value, 0))}</b></span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="bg-paper text-left text-[11.5px] text-muted"><tr><th className="px-4 py-2">Բաղադրիչ</th><th className="px-3 py-2">Պահպանում</th><th className="px-3 py-2 text-right">Պաշար</th><th className="px-3 py-2 text-right">Նվազագույն</th><th className="px-3 py-2 text-right">Գին</th><th className="px-3 py-2 text-right">Արժեք</th><th className="px-3 py-2">Կարգավիճակ</th></tr></thead>
              <tbody>{rows.map((x) => (
                <tr key={x.ingredient.id} onClick={() => setOpen(x.ingredient.id)} className="cursor-pointer border-t border-line hover:bg-paper">
                  <td className="px-4 py-2 font-medium">{x.ingredient.name}</td>
                  <td className="px-3 py-2 text-muted">{STORAGE[x.ingredient.storage]}</td>
                  <td className={cn("tnum px-3 py-2 text-right", x.low && "font-semibold text-bad")}>{fmtQty(x.qty, x.ingredient.unit)}</td>
                  <td className="tnum px-3 py-2 text-right text-muted">{fmtQty(x.ingredient.minLevel, x.ingredient.unit)}</td>
                  <td className="tnum px-3 py-2 text-right">{money(x.ingredient.cost)}<span className="text-muted">/{x.ingredient.purchaseUnit}</span></td>
                  <td className="tnum px-3 py-2 text-right">{money(x.value)}</td>
                  <td className="px-3 py-2">{x.low ? <Badge tone="bad">Ցածր</Badge> : x.expiring.length ? <Badge tone="warn">Ժամկետը մոտ է</Badge> : <Badge tone="ok">Կարգին է</Badge>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      {tab === "prices" && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] text-muted"><Labelled kind="calculated" />Ազդեցություն = գնի փոփոխություն × փաստացի ամսական օգտագործում (վերջին 28 օրվա վաճառքից, ըստ բաղադրատոմսերի)</div>
          <table className="w-full text-[13px]"><thead className="text-left text-[11.5px] text-muted"><tr><th className="py-2">Բաղադրիչ</th><th className="py-2 text-right">Էր</th><th className="py-2 text-right">Հիմա</th><th className="py-2 text-right">Փոփոխություն</th><th className="py-2 text-right">Ամսական ազդեցություն</th><th className="py-2 text-right">Ուտեստներ</th></tr></thead>
            <tbody>{changes.map((c) => <tr key={c.ingredient.id} onClick={() => setOpen(c.ingredient.id)} className="cursor-pointer border-t border-line hover:bg-paper"><td className="py-2 font-medium">{c.ingredient.name}</td><td className="tnum py-2 text-right text-muted">{money(c.from)}</td><td className="tnum py-2 text-right">{money(c.to)}</td><td className={cn("tnum py-2 text-right", c.pct > 0 ? "text-bad" : "text-ok")}>{c.pct > 0 ? "+" : ""}{pct(c.pct)}</td><td className={cn("tnum py-2 text-right font-semibold", c.monthlyImpact > 0 ? "text-bad" : "text-ok")}>{c.monthlyImpact > 0 ? "+" : ""}{money(c.monthlyImpact)}</td><td className="tnum py-2 text-right">{c.dishes.length}</td></tr>)}</tbody>
          </table>
        </Card>
      )}
      {tab === "waste" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card><div className="mb-2 flex items-center gap-2"><h2 className="text-[15px] font-semibold">Կորուստ ըստ բաղադրիչի</h2><Labelled kind="actual" /></div><p className="mb-3 text-[12.5px] text-muted">Վերջին 28 օր + այսօր · ընդամենը՝ <b className="tnum text-ink">{money(waste.reduce((a, w) => a + w.cost, 0))}</b></p><ul className="space-y-1.5 text-[13px]">{wasteByIng.slice(0, 10).map(([id, v]) => <li key={id} className="flex justify-between"><span>{state.ingredients.find((i) => i.id === id)?.name}</span><span className="tnum">{money(v)}</span></li>)}</ul></Card>
          <Card><h2 className="mb-2 text-[15px] font-semibold">Վերջին գրանցումները</h2><ul className="max-h-[420px] space-y-1 overflow-y-auto text-[12.5px]">{waste.slice().reverse().slice(0, 40).map((w, i) => <li key={i} className="flex justify-between gap-2 border-b border-line py-1"><span className="text-muted">{w.day.slice(5).split("-").reverse().join(".")} · {state.ingredients.find((x) => x.id === w.ingredientId)?.name} · {w.reason}</span><span className="tnum">{money(w.cost)}</span></li>)}</ul></Card>
        </div>
      )}
      {open && <IngredientDrawer id={open} onClose={() => setOpen(null)} />}
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-faint"><Icon name="info" size={13} />Ցուցադրական պահեստային տվյալներ։ Ֆիզիկական գույքագրումը և մատակարարների հաշիվները պիլոտում մուտքագրվում են Ձեր թիմի կողմից։</p>
    </Guard>
  );
}
