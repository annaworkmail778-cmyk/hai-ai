"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarLine, Donut } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Guard, hm, money, moneyK, pct, useNow } from "@/components/restaurant/staff/shell";
import { Badge, Card, CardHead, Kpi, Segmented, cn } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";
import { CHANNEL_HY, STATION_HY } from "@/lib/restaurant/staff-i18n";
import { ticketAge } from "@/lib/restaurant/rules";
import type { Channel } from "@/lib/restaurant/types";

const delta = (a: number, b: number) => (b ? (a - b) / b : 0);

export default function Overview() {
  const { state } = useR();
  const now = useNow();
  const [period, setPeriod] = useState<A.Period>("7d");
  const range = A.periodDays(state, period);
  const prevRange = A.previousPeriod(state, period);
  const sm = useMemo(() => A.summary(state, range), [state, range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useMemo(() => (prevRange ? A.summary(state, prevRange) : null), [state, prevRange?.from]); // eslint-disable-line react-hooks/exhaustive-deps
  const days = useMemo(() => A.byDay(state, A.periodDays(state, "28d")), [state]);
  const dishes = useMemo(() => A.dishes(state, A.periodDays(state, "28d")), [state]);
  const erosion = useMemo(() => A.marginErosion(state).filter((x) => x.delta < -0.005).slice(0, 3), [state]);
  const stock = useMemo(() => A.stockStatus(state), [state]);
  const ins = useMemo(() => A.insights(state), [state]);
  const sav = useMemo(() => A.savings(state), [state]);
  const [openIns, setOpenIns] = useState<string | null>(null);

  const pending = state.orders.filter((o) => o.status === "submitted");
  const dayKey = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(ms);
  const resToday = state.reservations.filter((r) => dayKey(r.at) === dayKey(now) && ["requested", "confirmed", "seated", "completed"].includes(r.status));
  const resReq = resToday.filter((r) => r.status === "requested").length;
  const unanswered = state.inbox.filter((c) => c.status !== "resolved" && c.messages.at(-1)?.dir === "in").length;
  const avgRating = state.reviews.length ? state.reviews.reduce((a, r) => a + r.rating, 0) / state.reviews.length : 0;
  const noReply = state.reviews.filter((r) => !r.reply || r.reply.status === "draft").length;
  const openTasks = state.tasks.filter((t) => t.status === "open");
  const late = state.tickets.filter((t) => (t.status === "queued" || t.status === "in_progress") && ticketAge(t, now) > (state.stations.find((s) => s.id === t.station)?.thresholds.red ?? 99));
  const reqs = state.requests.filter((r) => r.status !== "done");
  const low = stock.filter((x) => x.low);
  const expiring = state.expiring;
  const best = dishes.rows.filter((d) => d.item.categoryId !== "drinks").slice(0, 5);
  const topMargin = [...dishes.rows].filter((d) => d.item.categoryId !== "drinks").sort((a, b) => b.gp - a.gp).slice(0, 5);
  const cmp = (a: number, b?: number) => (b !== undefined && prev ? <span className={cn("font-medium", a >= b ? "text-ok" : "text-bad")}>{a >= b ? "▲" : "▼"} {pct(Math.abs(delta(a, b)))}</span> : null);
  const cmpLabel = period === "today" ? "նախորդ շաբաթվա նույն օրվա համեմատ" : period === "yesterday" ? "նախորդ շաբաթվա նույն օրվա համեմատ" : period === "7d" ? "նախորդ 7 օրվա համեմատ" : "";

  return (
    <Guard perm="overview.view">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Ընդհանուր պատկեր</h1><p className="mt-1 text-[13.5px] text-muted">Վաճառք, ալիքներ, մարժա, պահեստ և հնարավորություններ՝ նույն տվյալներից, որոնցով աշխատում է սրահն ու խոհանոցը</p></div>
        <Segmented value={period} onChange={setPeriod} items={(["today", "yesterday", "7d", "28d"] as A.Period[]).map((p) => ({ id: p, label: A.PERIOD_LABEL[p] }))} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Վաճառք (ներառյալ ԱԱՀ)" value={moneyK(sm.gross)} sub={<>{cmp(sm.gross, prev?.gross)} {cmpLabel}{period === "today" ? ` · ${sm.openOrders} բաց պատվեր` : ""}</>} icon="chart" />
        <Kpi label="Պատվերներ" value={sm.orders} sub={cmp(sm.orders, prev?.orders)} icon="list" />
        <Kpi label="Միջին չեկ" value={money(sm.aov)} sub={cmp(sm.aov, prev?.aov)} icon="calc" />
        <Kpi label="Համախառն մարժա" value={pct(sm.gm)} sub={<>Սննդի ինքնարժեք՝ {pct(sm.foodCostPct)}</>} icon="sparkles" tone="ok" />
        <Kpi label="Կորուստ և վերապատրաստում" value={money(sm.waste.cost + sm.remakes.cost)} sub={<>{sm.remakes.count} վերապատրաստում · {sm.cancelled.orders} չեղարկում</>} icon="alert" tone="warn" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/r/host" className="rounded-[var(--radius-card)] border border-line bg-surface p-3 hover:border-line-2"><div className="text-[12px] text-muted">Ամրագրումներ այսօր</div><div className="tnum text-[20px] font-semibold">{resToday.length} <span className="text-[13px] font-normal text-muted">· {resToday.reduce((a, r) => a + r.partySize, 0)} հյուր</span></div>{resReq > 0 && <div className="text-[12px] font-medium text-signal">{resReq} սպասում է հաստատման</div>}</Link>
        <Link href="/r/admin/inbox" className="rounded-[var(--radius-card)] border border-line bg-surface p-3 hover:border-line-2"><div className="text-[12px] text-muted">Անպատասխան հաղորդագրություններ</div><div className={cn("tnum text-[20px] font-semibold", unanswered > 0 && "text-signal")}>{unanswered}</div><div className="text-[12px] text-muted">5 ալիք · արտաքինները՝ սիմուլյացիա</div></Link>
        <Link href="/r/admin/reviews" className="rounded-[var(--radius-card)] border border-line bg-surface p-3 hover:border-line-2"><div className="text-[12px] text-muted">Կարծիքներ</div><div className="tnum text-[20px] font-semibold">{avgRating.toFixed(2)}★ <span className="text-[13px] font-normal text-muted">· {state.reviews.length}</span></div><div className="text-[12px] text-muted">{noReply} առանց պատասխանի</div></Link>
        <Link href="/r/admin/team" className="rounded-[var(--radius-card)] border border-line bg-surface p-3 hover:border-line-2"><div className="text-[12px] text-muted">Բաց առաջադրանքներ</div><div className="tnum text-[20px] font-semibold">{openTasks.length}</div><div className="text-[12px] text-bad">{openTasks.filter((t) => t.priority === "high").length} կարևոր</div></Link>
      </div>
      <p className="mt-2 text-[12px] text-muted">Վաճառք = ընդունված և փակված պատվերներ (չեղարկվածները՝ ոչ)։ Մարժան համախառն է (ԱԱՀ-ից հետո, բաղադրատոմսային ինքնարժեքով)։ Զուտ շահույթը ցույց չի տրվում, քանի դեռ ծախսերը մուտքագրված չեն։</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHead title="Վաճառք ըստ օրերի" sub="Վերջին 28 օր · ուրբաթ-շաբաթը ընդգծված" icon="chart" right={<Link href="/r/admin/analytics" className="text-[13px] font-medium text-info">Մանրամասն</Link>} />
          <BarLine data={days.map((d) => ({ label: d.day.slice(8), bar: d.gross, line: d.gm, highlight: [5, 6].includes(new Date(d.day + "T12:00:00Z").getUTCDay()) }))} barLabel="Վաճառք" lineLabel="Համախառն մարժա" fmtBar={moneyK} fmtLine={(x) => pct(x)} />
        </Card>
        <Card>
          <CardHead title="Պատվերների ալիքներ" sub={A.PERIOD_LABEL[period]} icon="globe" />
          <Donut data={sm.byChannel.map((c) => ({ label: CHANNEL_HY[c.channel as Channel], value: c.gross }))} center={String(sm.orders)} sub="պատվեր" />
          <table className="mt-3 w-full text-[13px]"><tbody>{sm.byChannel.map((c) => <tr key={c.channel} className="border-t border-line"><td className="py-1.5">{CHANNEL_HY[c.channel]}</td><td className="tnum text-right">{c.orders} պատվեր</td><td className="tnum text-right">{pct(c.share, 0)}</td><td className="tnum text-right text-muted">չեկ {money(c.aov)}</td></tr>)}</tbody></table>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Ամենավաճառվող ուտեստներ" sub="Վերջին 28 օր" icon="star" />
          <ol className="space-y-2">{best.map((d, i) => <li key={d.item.id} className="flex items-center gap-3 text-[13.5px]"><span className="tnum w-5 text-faint">{i + 1}</span><span className="flex-1 font-medium">{d.item.name.hy}</span><span className="tnum text-muted">{d.qty} բաժ.</span><span className="tnum w-28 text-right">{moneyK(d.gross)}</span></li>)}</ol>
        </Card>
        <Card>
          <CardHead title="Ամենաշատ համախառն շահույթ բերող ուտեստներ" sub="Վերջին 28 օր · շահույթ = զուտ վաճառք − ինքնարժեք" icon="sparkles" />
          <ol className="space-y-2">{topMargin.map((d, i) => <li key={d.item.id} className="flex items-center gap-3 text-[13.5px]"><span className="tnum w-5 text-faint">{i + 1}</span><Link href={`/r/admin/recipes?item=${d.item.id}`} className="flex-1 font-medium hover:underline">{d.item.name.hy}</Link><Badge tone={d.now.gm >= 0.7 ? "ok" : "warn"}>{pct(d.now.gm, 0)}</Badge><span className="tnum w-28 text-right">{moneyK(d.gp)}</span></li>)}</ol>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHead title="Ինքնարժեքի խնդիրներ" sub="Մարժան նվազել է բաղադրիչների գնաճի պատճառով" icon="alert" />
          {erosion.length ? <ul className="space-y-2.5">{erosion.map((e) => <li key={e.item.id}><Link href={`/r/admin/recipes?item=${e.item.id}`} className="flex items-center justify-between gap-2 text-[13.5px] hover:underline"><span className="font-medium">{e.item.name.hy}</span><span className="tnum text-bad">{pct(e.gmThen)} → {pct(e.gmNow)}</span></Link><div className="text-[12px] text-muted">Ինքնարժեք՝ {money(e.costThen)} → {money(e.costNow)}</div></li>)}</ul> : <p className="text-[13px] text-muted">Էական փոփոխություն չկա</p>}
        </Card>
        <Card>
          <CardHead title="Պահեստի ազդանշաններ" sub={`${low.length} նվազագույնից ցածր · ${expiring.length} ժամկետը մոտենում է`} icon="kitchen" right={<Link href="/r/admin/purchasing" className="text-[13px] font-medium text-info">Պատվիրել</Link>} />
          <ul className="space-y-1.5 text-[13.5px]">
            {low.map((x) => <li key={x.ingredient.id} className="flex justify-between gap-2"><Link href={`/r/admin/inventory?open=${x.ingredient.id}`} className="hover:underline">{x.ingredient.name}</Link><span className="tnum text-bad">{Math.round(x.qty)} / {x.ingredient.minLevel} {x.ingredient.unit}</span></li>)}
            {expiring.map((x) => <li key={x.ingredientId} className="flex justify-between gap-2"><span>{state.ingredients.find((i) => i.id === x.ingredientId)?.name}</span><span className="text-warn">ժամկետը՝ {x.expiresDay.slice(5).split("-").reverse().join(".")}</span></li>)}
          </ul>
        </Card>
        <Card>
          <CardHead title="Հիմա սրահում" sub="Կենդանի սպասարկում" icon="flame" right={<Link href="/r/admin/orders" className="text-[13px] font-medium text-info">Պատվերներ</Link>} />
          <div className="grid grid-cols-3 gap-2 text-center">
            <Link href="/r/admin/orders" className={cn("rounded-xl p-3", pending.length ? "bg-signal-soft text-signal" : "bg-paper")}><div className="tnum text-[24px] font-semibold">{pending.length}</div><div className="text-[11.5px]">սպասում է ընդունման</div></Link>
            <Link href="/r/kds" className={cn("rounded-xl p-3", late.length ? "bg-bad-soft text-bad" : "bg-paper")}><div className="tnum text-[24px] font-semibold">{late.length}</div><div className="text-[11.5px]">ուշացող տոմս</div></Link>
            <Link href="/r/floor" className={cn("rounded-xl p-3", reqs.length ? "bg-warn-soft text-warn" : "bg-paper")}><div className="tnum text-[24px] font-semibold">{reqs.length}</div><div className="text-[11.5px]">հյուրի կանչ</div></Link>
          </div>
          <ul className="mt-3 space-y-1 text-[12.5px] text-muted">{late.slice(0, 3).map((t) => <li key={t.id}><Icon name="clock" size={12} className="mr-1 inline text-bad" />{STATION_HY[t.station]} · {state.orders.find((o) => o.id === t.orderId)?.code} · {Math.round(ticketAge(t, now))} ր</li>)}</ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHead title="Բարելավման հնարավորություններ" sub="Յուրաքանչյուր առաջարկ ցույց է տալիս, թե որ տվյալներից է բխում" icon="sparkles" right={<Link href="/r/admin/savings" className="text-[13px] font-medium text-info">Խնայողության հաշվիչ →</Link>} />
        <div className="grid gap-3 md:grid-cols-2">
          {ins.map((x) => (
            <div key={x.id} className={cn("rounded-xl border p-4", x.tone === "warn" ? "border-warn/30 bg-warn-soft/40" : x.tone === "ok" ? "border-ok/30 bg-ok-soft/40" : "border-line bg-paper")}>
              <div className="text-[14px] font-semibold">{x.title}</div>
              <div className="mt-1 text-[13px] text-ink-2">→ {x.action}</div>
              <button className="mt-2 text-[12.5px] font-medium text-info" onClick={() => setOpenIns(openIns === x.id ? null : x.id)} aria-expanded={openIns === x.id}>Ինչու ենք այդպես կարծում</button>
              {openIns === x.id && <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-muted">{x.evidence.map((e) => <li key={e}>• {e}</li>)}<li><Link href={x.href} className="text-info">Բացել տվյալները →</Link></li></ul>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-violet-soft px-4 py-3 text-[13px] text-violet">
          <Icon name="calc" size={16} />Ենթադրական ամսական բարելավման ներուժ՝ <b className="tnum">{money(sav.total)}</b> · հաշվարկը թափանցիկ է և հիմնված է Ձեր կարգավորած ենթադրությունների վրա, երաշխիք չէ։
          <Link href="/r/admin/savings" className="ml-auto font-semibold">Բացել հաշվիչը</Link>
        </div>
      </Card>
      <p className="mt-4 text-[12px] text-faint">Թարմացված՝ {hm(now)} · Summit Table-ը ցուցադրական ռեստորան է</p>
    </Guard>
  );
}
