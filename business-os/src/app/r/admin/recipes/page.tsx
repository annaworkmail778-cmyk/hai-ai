"use client";
/* Recipes & food cost: line-by-line costing with yield, VAT-aware margin, comparison with 28 days ago and with the session start. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { HBar } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Guard, Labelled, money, pct } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, Input, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { addDays } from "@/lib/dates";
import { dishEconomics, linesCost, recipeOf } from "@/lib/restaurant/rules";
import type { RestaurantState } from "@/lib/restaurant/types";

const costAt = (s: RestaurantState, at: number) => (id: string) => {
  const ing = s.ingredients.find((i) => i.id === id)!;
  const pts = s.prices.filter((p) => p.ingredientId === id && p.at <= at);
  return (pts.length ? pts[pts.length - 1].cost : ing.cost) / ing.unitsPerPurchase;
};
const unitLabel = (u: string) => (u === "g" ? "գ" : u === "ml" ? "մլ" : "հատ");

export default function Recipes() {
  const { state, dispatch, can } = useR();
  const sp = useSearchParams();
  const router = useRouter();
  const itemId = sp.get("item") ?? "khorovats";
  const [edit, setEdit] = useState<string | null>(null);
  const [qty, setQty] = useState("");
  const rows = useMemo(() => state.items.map((i) => dishEconomics(state, i.id)).sort((a, b) => a.gm - b.gm), [state]);
  const e = dishEconomics(state, itemId);
  const r = recipeOf(state, itemId);
  const then = dishEconomics(state, itemId, costAt(state, Date.parse(addDays(state.baseDate, -28) + "T12:00:00Z")));
  const start = dishEconomics(state, itemId, costAt(state, state.epochAt));
  const parts = r ? linesCost(state, r.lines).parts : [];
  const vat = state.settings.vat;
  return (
    <Guard perm="costs.view">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Բաղադրատոմսեր և ինքնարժեք</h1><p className="mt-1 text-[13.5px] text-muted">Ինքնարժեքը հաշվարկվում է բաղադրիչների ընթացիկ գներով։ Բանաձև՝ բաժնի քանակ ÷ ելք (yield) × միավորի գին։</p></div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card pad={false} className="h-fit overflow-hidden">
          <div className="border-b border-line px-4 py-2.5 text-[12px] text-muted">Դասավորված ըստ մարժայի (ցածրից բարձր)</div>
          <ul className="max-h-[70vh] overflow-y-auto">{rows.map((x) => (
            <li key={x.item.id}><button onClick={() => router.replace(`/r/admin/recipes?item=${x.item.id}`, { scroll: false })} className={cn("flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] hover:bg-paper", x.item.id === itemId && "bg-paper font-semibold")}>
              <span className="flex-1">{x.item.name.hy}</span><span className="tnum text-muted">{money(x.cost)}</span><Badge tone={x.gm >= 0.72 ? "ok" : x.gm >= 0.62 ? "warn" : "bad"}>{pct(x.gm, 0)}</Badge>
            </button></li>
          ))}</ul>
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-[20px] font-semibold">{e.item.name.hy}</h2><p className="text-[13px] text-muted">Բաղադրատոմս, տարբերակ {r?.version ?? "—"}{r?.note ? ` · ${r.note}` : ""}</p></div>
              <div className="flex gap-2"><Labelled kind="calculated" />{start.cost !== e.cost && <Badge tone="signal">Փոխվել է այս ցուցադրության ընթացքում</Badge>}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[["Ինքնարժեք", money(e.cost)], ["Մենյուի գին", money(e.item.price)], [vat.registered && vat.pricesIncludeVat ? `Զուտ գին (առանց ԱԱՀ ${Math.round(vat.rate * 100)}%)` : "Զուտ գին", money(e.net)], ["Համախառն շահույթ", money(e.gp)], ["Համախառն մարժա", pct(e.gm)]].map(([k, v], i) => (
                <div key={k} className={cn("rounded-xl p-3", i === 4 ? (e.gm >= 0.72 ? "bg-ok-soft text-ok" : e.gm >= 0.62 ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad") : "bg-paper")}><div className="text-[11.5px] opacity-75">{k}</div><div className="tnum mt-1 text-[19px] font-semibold">{v}</div></div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
              <span>Սննդի ինքնարժեքի %՝ <b className="text-ink">{pct(e.foodCostPct)}</b></span>
              <span>28 օր առաջ՝ ինքնարժեք {money(then.cost)}, մարժա {pct(then.gm)} {e.gm < then.gm - 0.0005 && <b className="text-bad">(−{((then.gm - e.gm) * 100).toFixed(1)} տ.կ.)</b>}</span>
              {start.cost !== e.cost && <span className="text-signal">Ցուցադրության սկզբում՝ {money(start.cost)} · {pct(start.gm)} → հիմա {money(e.cost)} · {pct(e.gm)}</span>}
            </div>
          </Card>
          <Card pad={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px]">
                <thead className="bg-paper text-left text-[11.5px] text-muted"><tr><th className="px-4 py-2">Բաղադրիչ</th><th className="px-3 py-2 text-right">Բաժին (մատուցված)</th><th className="px-3 py-2 text-right">Ելք</th><th className="px-3 py-2 text-right">Հում քանակ</th><th className="px-3 py-2 text-right">Գին</th><th className="px-3 py-2 text-right">Արժեք</th><th className="w-40 px-3 py-2">Մասնաբաժին</th></tr></thead>
                <tbody>{parts.map((p) => (
                  <tr key={p.ingredientId} className="border-t border-line">
                    <td className="px-4 py-2"><Link href={`/r/admin/inventory?open=${p.ingredientId}`} className="font-medium hover:underline">{p.ingredient?.name}</Link></td>
                    <td className="tnum px-3 py-2 text-right">{edit === p.ingredientId ? (
                      <span className="inline-flex items-center gap-1"><Input className="h-8 w-20" type="number" value={qty} onChange={(x) => setQty(x.target.value)} autoFocus /><Button size="sm" variant="primary" onClick={() => { dispatch({ type: "recipe.qty", itemId, ingredientId: p.ingredientId, qty: Number(qty) }); setEdit(null); }}>OK</Button></span>
                    ) : <button disabled={!can("inventory.adjust")} onClick={() => { setEdit(p.ingredientId); setQty(String(p.qty)); }} className="hover:underline disabled:no-underline" title="Փոխել քանակը">{p.qty} {unitLabel(p.ingredient?.unit ?? "g")}</button>}</td>
                    <td className="tnum px-3 py-2 text-right text-muted">{pct(p.yieldPct, 0)}</td>
                    <td className="tnum px-3 py-2 text-right text-muted">{Math.round(p.grossQty * 10) / 10} {unitLabel(p.ingredient?.unit ?? "g")}</td>
                    <td className="tnum px-3 py-2 text-right text-muted">{money(p.ingredient?.cost ?? 0)}/{p.ingredient?.purchaseUnit}</td>
                    <td className="tnum px-3 py-2 text-right font-semibold">{money(p.cost)}</td>
                    <td className="px-3 py-2"><HBar value={p.cost} max={e.cost} tone="signal" /></td>
                  </tr>
                ))}
                <tr className="border-t-2 border-line bg-paper font-semibold"><td className="px-4 py-2" colSpan={5}>Ընդամենը ինքնարժեք մեկ բաժնի համար</td><td className="tnum px-3 py-2 text-right">{money(e.cost)}</td><td /></tr></tbody>
              </table>
            </div>
          </Card>
          {e.item.groups.some((g) => g.options.some((o) => o.recipe)) && <p className="text-[12.5px] text-muted"><Icon name="info" size={13} className="mr-1 inline" />Հավելումները ({e.item.groups.flatMap((g) => g.options).filter((o) => o.recipe).map((o) => `${o.name.hy} +${money(o.price)}`).join(", ")}) ունեն իրենց բաղադրատոմսային տարբերությունը, որը հաշվարկվում է պատվերի պահին։</p>}
          <p className="text-[12px] text-faint">Գները ցուցադրական են։ ԱԱՀ-ի ռեժիմը կարգավորվում է «Կարգավորումներ» բաժնում (պիլոտում՝ Ձեր հաշվապահի հետ ճշտելով)։</p>
        </div>
      </div>
    </Guard>
  );
}
