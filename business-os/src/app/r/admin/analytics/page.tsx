"use client";
/* Owner analytics: sales & channels, dish profitability & menu engineering, operations, and data-backed answers. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BarLine, HBar } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Guard, Labelled, money, moneyK, pct } from "@/components/restaurant/staff/shell";
import { Badge, Card, CardHead, Kpi, Segmented, Tabs, cn } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";
import { CHANNEL_HY } from "@/lib/restaurant/staff-i18n";
import type { RestaurantState } from "@/lib/restaurant/types";

const CLS: Record<string, [string, string, string]> = {
  star: ["Աստղ", "bg-ok-soft text-ok", "Պահել տեսանելի, չփոխել"],
  plowhorse: ["Աշխատող ձի", "bg-warn-soft text-warn", "Վերանայել գինը կամ բաժինը"],
  puzzle: ["Հանելուկ", "bg-info-soft text-info", "Ավելի լավ առաջարկել"],
  dog: ["Թույլ", "bg-bad-soft text-bad", "Վերանայել կամ հանել"],
};

function Sales({ s, period }: { s: RestaurantState; period: A.Period }) {
  const r = A.periodDays(s, period);
  const sm = A.summary(s, r);
  const days = A.byDay(s, period === "28d" || period === "7d" ? r : A.periodDays(s, "28d"));
  const hours = A.byHour(s, r);
  const cats = s.categories.map((c) => { const d = A.dishes(s, r).rows.filter((x) => x.item.categoryId === c.id); return { c, gross: d.reduce((a, x) => a + x.gross, 0), gp: d.reduce((a, x) => a + x.gp, 0) }; });
  const maxCat = Math.max(...cats.map((x) => x.gross), 1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Վաճառք" value={moneyK(sm.gross)} sub={`Զուտ (առանց ԱԱՀ)՝ ${moneyK(sm.net)}`} icon="chart" />
        <Kpi label="Պատվերներ" value={sm.orders} sub={`${sm.covers} հյուր սրահում`} icon="list" />
        <Kpi label="Միջին չեկ" value={money(sm.aov)} icon="calc" />
        <Kpi label="Համախառն շահույթ" value={moneyK(sm.gp)} sub={`մարժա ${pct(sm.gm)}`} icon="sparkles" tone="ok" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHead title="Վաճառք և մարժա ըստ օրերի" icon="chart" /><BarLine data={days.map((d) => ({ label: d.day.slice(8), bar: d.gross, line: d.gm, highlight: [5, 6].includes(new Date(d.day + "T12:00:00Z").getUTCDay()) }))} barLabel="Վաճառք" lineLabel="Համախառն մարժա" fmtBar={moneyK} fmtLine={(x) => pct(x)} /></Card>
        <Card><CardHead title="Պատվերներ ըստ ժամի" sub={A.PERIOD_LABEL[period]} icon="clock" /><BarLine data={hours.map((h) => ({ label: `${h.hour}`, bar: h.orders, highlight: h.hour >= 19 && h.hour <= 21 }))} barLabel="Պատվերներ" fmtBar={(n) => `${n}`} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHead title="Եկամուտ ըստ ալիքի" icon="globe" />
          <table className="w-full text-[13px]"><thead className="text-left text-[11.5px] text-muted"><tr><th className="py-1">Ալիք</th><th className="py-1 text-right">Պատվեր</th><th className="py-1 text-right">Վաճառք</th><th className="py-1 text-right">Մասնաբաժին</th><th className="py-1 text-right">Միջին չեկ</th></tr></thead>
            <tbody>{sm.byChannel.map((c) => <tr key={c.channel} className="border-t border-line"><td className="py-2 font-medium">{CHANNEL_HY[c.channel]}</td><td className="tnum py-2 text-right">{c.orders}</td><td className="tnum py-2 text-right">{moneyK(c.gross)}</td><td className="tnum py-2 text-right">{pct(c.share, 0)}</td><td className="tnum py-2 text-right">{money(c.aov)}</td></tr>)}</tbody></table>
          <p className="mt-2 text-[12px] text-muted">Տանելու պատվերների չեկը բնականաբար ցածր է (ըմպելիքներ չկան)։</p>
        </Card>
        <Card><CardHead title="Եկամուտ ըստ կատեգորիայի" icon="list" />
          <ul className="space-y-2.5">{cats.map((x) => <li key={x.c.id} className="text-[13px]"><div className="flex justify-between"><span>{x.c.name.hy}</span><span className="tnum">{moneyK(x.gross)} <span className="text-muted">· շահ. {moneyK(x.gp)}</span></span></div><HBar value={x.gross} max={maxCat} className="mt-1" /></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}

function Menu({ s, period }: { s: RestaurantState; period: A.Period }) {
  const d = A.dishes(s, A.periodDays(s, period));
  const food = d.rows.filter((x) => x.item.categoryId !== "drinks");
  const totalQty = food.reduce((a, x) => a + x.qty, 0) || 1;
  const maxShare = Math.max(...food.map((x) => x.qty / totalQty)) * 1.1, maxGp = Math.max(...food.map((x) => x.now.gp)) * 1.1;
  const W = 100, H = 60, X = (v: number) => 6 + (v / maxShare) * (W - 10), Y = (v: number) => H - 6 - (v / maxGp) * (H - 10);
  return (
    <div className="space-y-4">
      <Card>
        <CardHead title="Մենյուի ինժեներիա" sub="Հորիզոնական՝ պահանջարկ (վաճառքի մասնաբաժին), ուղղահայաց՝ համախառն շահույթ մեկ բաժնից։ Գծեր՝ արդար մասնաբաժնի 70% և միջին շահույթ" icon="sparkles" right={<Labelled kind="calculated" />} />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Մենյուի ինժեներիայի գրաֆիկ">
          <line x1={X(d.fairShare)} x2={X(d.fairShare)} y1="2" y2={H - 4} stroke="var(--color-line-2)" strokeDasharray="1 1" strokeWidth="0.25" />
          <line x1="4" x2={W - 2} y1={Y(d.avgGp)} y2={Y(d.avgGp)} stroke="var(--color-line-2)" strokeDasharray="1 1" strokeWidth="0.25" />
          <text x={W - 3} y="5" textAnchor="end" fontSize="2.2" className="fill-[var(--color-ok)]">Աստղեր</text><text x="7" y="5" fontSize="2.2" className="fill-[var(--color-info)]">Հանելուկներ</text>
          <text x={W - 3} y={H - 2} textAnchor="end" fontSize="2.2" className="fill-[var(--color-warn)]">Աշխատող ձիեր</text><text x="7" y={H - 2} fontSize="2.2" className="fill-[var(--color-bad)]">Թույլ</text>
          {food.map((x) => <g key={x.item.id}><circle cx={X(x.qty / totalQty)} cy={Y(x.now.gp)} r="1.1" className={x.cls === "star" ? "fill-[var(--color-ok)]" : x.cls === "plowhorse" ? "fill-[var(--color-warn)]" : x.cls === "puzzle" ? "fill-[var(--color-info)]" : "fill-[var(--color-bad)]"} /><text x={X(x.qty / totalQty) + 1.6} y={Y(x.now.gp) + 0.8} fontSize="1.9" className="fill-[var(--color-ink-2)]">{x.item.name.hy}</text></g>)}
        </svg>
      </Card>
      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-[13px]">
          <thead className="bg-paper text-left text-[11.5px] text-muted"><tr><th className="px-4 py-2">Ուտեստ</th><th className="px-3 py-2 text-right">Բաժին</th><th className="px-3 py-2 text-right">Վաճառք</th><th className="px-3 py-2 text-right">Ինքնարժեք (փաստ.)</th><th className="px-3 py-2 text-right">Համախառն շահույթ</th><th className="px-3 py-2 text-right">Մարժա</th><th className="px-3 py-2 text-right">Ինքն./բաժին այսօր</th><th className="px-3 py-2">Դաս</th></tr></thead>
          <tbody>{d.rows.map((x) => <tr key={x.item.id} className="border-t border-line hover:bg-paper">
            <td className="px-4 py-2"><Link href={`/r/admin/recipes?item=${x.item.id}`} className="font-medium hover:underline">{x.item.name.hy}</Link></td>
            <td className="tnum px-3 py-2 text-right">{x.qty}</td><td className="tnum px-3 py-2 text-right">{moneyK(x.gross)}</td><td className="tnum px-3 py-2 text-right text-muted">{moneyK(x.cost)}</td>
            <td className="tnum px-3 py-2 text-right font-semibold">{moneyK(x.gp)}</td><td className="tnum px-3 py-2 text-right">{pct(x.gm)}</td><td className="tnum px-3 py-2 text-right text-muted">{money(x.now.cost)}</td>
            <td className="px-3 py-2">{x.cls ? <span className={cn("rounded-md px-1.5 py-0.5 text-[11.5px] font-medium", CLS[x.cls][1])} title={CLS[x.cls][2]}>{CLS[x.cls][0]}</span> : <span className="text-[11.5px] text-faint">ըմպելիք</span>}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>
    </div>
  );
}

function Ops({ s, period }: { s: RestaurantState; period: A.Period }) {
  const r = A.periodDays(s, period);
  const sm = A.summary(s, r);
  const prep = A.prepStats(s, r);
  const so = s.history.stockouts.filter((x) => x.day >= r.from && x.day <= r.to);
  const low = A.stockStatus(s).filter((x) => x.low);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ուշացած տոմսեր" value={pct(sm.late.rate)} sub={`${sm.late.late} / ${sm.late.tickets} տոմս`} icon="clock" tone={sm.late.rate > 0.05 ? "warn" : "ok"} />
        <Kpi label="Չեղարկված / մերժված պատվերներ" value={sm.cancelled.orders} sub={`${moneyK(sm.cancelled.gross)} · ${pct(sm.cancelled.rate)}`} icon="x" />
        <Kpi label="Վերապատրաստված ուտեստներ" value={sm.remakes.count} sub={`ինքնարժեք ${money(sm.remakes.cost)} · ${pct(sm.remakes.rate)} դիրքերից`} icon="refresh" tone="warn" />
        <Kpi label="Սննդի կորուստ" value={money(sm.waste.cost)} sub={`${sm.waste.entries} գրանցում`} icon="alert" tone="warn" />
      </div>
      <Card><CardHead title="Պատրաստման ժամանակ ըստ կայանի" sub="Տոմսի ստացումից մինչև «Պատրաստ է» · ուշացած = կարմիր շեմից ավելի" icon="flame" right={<Labelled kind="actual" />} />
        <table className="w-full text-[13px]"><thead className="text-left text-[11.5px] text-muted"><tr><th className="py-1">Կայան</th><th className="py-1 text-right">Տոմս</th><th className="py-1 text-right">Միջին</th><th className="py-1 text-right">90-րդ պերց.</th><th className="py-1 text-right">Շեմ</th><th className="py-1 text-right">Ուշացած</th><th className="py-1 text-right">Ուրբ–Շբթ 19–22</th></tr></thead>
          <tbody>{prep.map((p) => <tr key={p.station.id} className="border-t border-line"><td className="py-2 font-medium">{p.station.name}</td><td className="tnum py-2 text-right">{p.tickets}</td><td className="tnum py-2 text-right">{p.avg.toFixed(1)} ր</td><td className="tnum py-2 text-right">{p.p90} ր</td><td className="tnum py-2 text-right text-muted">{p.station.thresholds.red} ր</td><td className={cn("tnum py-2 text-right", p.lateRate > 0.05 && "text-warn")}>{pct(p.lateRate)}</td><td className={cn("tnum py-2 text-right font-semibold", p.peakLateRate > 0.2 && "text-bad")}>{p.peakTickets ? pct(p.peakLateRate) : "—"}</td></tr>)}</tbody></table>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="Վերջացած ուտեստներ" sub="Ժամանակ, երբ ուտեստը հասանելի չէր" icon="alert" />
          {so.length ? <ul className="space-y-1.5 text-[13px]">{so.map((x, i) => <li key={i} className="flex justify-between"><span>{x.day.slice(5).split("-").reverse().join(".")} · {s.items.find((it) => it.id === x.itemId)?.name.hy}</span><span className="tnum">{Math.round((x.minutes / 60) * 10) / 10} ժ</span></li>)}</ul> : <p className="text-[13px] text-muted">Այս ժամանակահատվածում չկա</p>}
        </Card>
        <Card><CardHead title="Ներկայիս պակասորդ" sub="Բաղադրիչներ նվազագույնից ցածր" icon="kitchen" right={<Link href="/r/admin/purchasing" className="text-[13px] font-medium text-info">Պատվիրել</Link>} />
          <ul className="space-y-1.5 text-[13px]">{low.map((x) => <li key={x.ingredient.id} className="flex justify-between"><span>{x.ingredient.name}</span><span className="tnum text-bad">{Math.round(x.qty)} / {x.ingredient.minLevel} {x.ingredient.unit}</span></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}

/** Natural-language-style questions with deterministic answers from the same data (no AI claims). */
function Ask({ s }: { s: RestaurantState }) {
  const r = A.periodDays(s, "7d");
  const Q = [
    { q: "Ո՞ր ուտեստներն են բերել ամենաշատ համախառն շահույթ վերջին 7 օրում", a: () => A.dishes(s, r).rows.filter((x) => x.item.categoryId !== "drinks").sort((a, b) => b.gp - a.gp).slice(0, 5).map((x) => `${x.item.name.hy} — ${moneyK(x.gp)} (${x.qty} բաժին, մարժա ${pct(x.gm)})`), src: "Ավարտված պատվերներ × բաղադրատոմսային ինքնարժեք" },
    { q: "Ո՞ր բաղադրիչներն են վերջանում", a: () => A.stockStatus(s).filter((x) => x.low).map((x) => `${x.ingredient.name} — ${Math.round(x.qty)} ${x.ingredient.unit} (նվազ. ${x.ingredient.minLevel})`), src: "Պաշարի մատյան" },
    { q: "Ո՞ր ժամերին է ամենաշատ պատվերը", a: () => A.byHour(s, r).sort((a, b) => b.orders - a.orders).slice(0, 3).map((h) => `${h.hour}:00–${h.hour + 1}:00 — ${h.orders} պատվեր, ${moneyK(h.gross)}`), src: "Ավարտված պատվերներ, վերջին 7 օր" },
    { q: "Ո՞ր ուտեստների ինքնարժեքն է աճել", a: () => A.marginErosion(s).filter((x) => x.delta < 0).slice(0, 5).map((x) => `${x.item.name.hy} — ${money(x.costThen)} → ${money(x.costNow)}, մարժա ${pct(x.gmThen)} → ${pct(x.gmNow)}`), src: "Գների պատմություն, 28 օր" },
    { q: "Ո՞ր կայանում են պատվերները ուշանում", a: () => A.prepStats(s, A.periodDays(s, "28d")).sort((a, b) => b.lateRate - a.lateRate).slice(0, 3).map((p) => `${p.station.name} — ${pct(p.lateRate)} ուշացած (պիկին՝ ${pct(p.peakLateRate)})`), src: "Խոհանոցի տոմսեր, 28 օր" },
  ];
  const [open, setOpen] = useState(0);
  return (
    <Card>
      <CardHead title="Հարցրեք տվյալներին" sub="Պատասխանները հաշվարկվում են անմիջապես համակարգի տվյալներից (ոչ թե AI-ի ենթադրություններից)" icon="message" />
      <div className="flex flex-wrap gap-2">{Q.map((x, i) => <button key={i} onClick={() => setOpen(i)} className={cn("rounded-full border px-3 py-1.5 text-left text-[13px]", open === i ? "border-ink bg-ink text-white" : "border-line-2")}>{x.q}</button>)}</div>
      <div className="mt-3 rounded-xl bg-paper p-4"><ul className="space-y-1 text-[13.5px]">{Q[open].a().map((l) => <li key={l}>• {l}</li>)}</ul><div className="mt-2 text-[12px] text-muted">Աղբյուր՝ {Q[open].src}</div></div>
    </Card>
  );
}

export default function Analytics() {
  const { state } = useR();
  const sp = useSearchParams();
  const router = useRouter();
  const tab = sp.get("tab") ?? "sales";
  const [period, setPeriod] = useState<A.Period>("28d");
  const view = useMemo(() => ({ sales: <Sales s={state} period={period} />, menu: <Menu s={state} period={period} />, ops: <Ops s={state} period={period} />, ask: <Ask s={state} /> })[tab as "sales"] ?? null, [state, tab, period]);
  const np = A.netProfit(state, A.periodDays(state, period));
  return (
    <Guard perm="finance.view">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Վերլուծություն</h1><p className="mt-1 text-[13.5px] text-muted">Նույն տվյալները, որոնք տեսնում են սրահն ու խոհանոցը. թվերը համընկնում են բոլոր էկրաններում։</p></div>
        <Segmented value={period} onChange={setPeriod} items={(["today", "yesterday", "7d", "28d"] as A.Period[]).map((p) => ({ id: p, label: A.PERIOD_LABEL[p] }))} />
      </div>
      <Tabs value={tab} onChange={(v) => router.replace(`/r/admin/analytics?tab=${v}`, { scroll: false })} items={[{ id: "sales", label: "Վաճառք և ալիքներ" }, { id: "menu", label: "Ուտեստների շահութաբերություն" }, { id: "ops", label: "Գործառնություններ" }, { id: "ask", label: "Հարցեր" }]} />
      <div className="mt-4">{view}</div>
      <Card className="mt-4"><div className="flex flex-wrap items-center gap-3 text-[13px]"><Icon name="info" size={16} className="text-muted" />
        <span><b>Համախառն շահույթ ≠ զուտ շահույթ։</b> Համախառն շահույթը = զուտ վաճառք − սննդի ինքնարժեք։</span>
        {np ? <Badge tone="ok">Զուտ շահույթ ({A.PERIOD_LABEL[period]})՝ {moneyK(np.value)} (ծախսեր՝ {moneyK(np.expenses)})</Badge> : <span className="text-muted">Զուտ շահույթը հաշվարկելու համար մուտքագրեք ամսական ծախսերը <Link href="/r/admin/settings" className="text-info">Կարգավորումներում</Link>։</span>}
      </div></Card>
    </Guard>
  );
}
