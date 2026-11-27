"use client";
/* Business Performance & Savings Calculator: actual sample metrics, calculated metrics, hypothetical improvement scenarios. */
import { useMemo } from "react";
import { Icon } from "@/components/icons";
import { Guard, Labelled, money, moneyK, pct } from "@/components/restaurant/staff/shell";
import { Card, CardHead, Kpi } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";

export default function Savings() {
  const { state, dispatch } = useR();
  const sav = useMemo(() => A.savings(state), [state]);
  const sm = useMemo(() => A.summary(state, A.periodDays(state, "28d")), [state]);
  const set = (key: string, v: number) => dispatch({ type: "settings.update", patch: { savings: { [key]: v } } });
  return (
    <Guard perm="finance.view">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Արդյունավետություն և խնայողություն</h1>
        <p className="mt-1 max-w-3xl text-[13.5px] text-muted">Հաշվիչը ցույց է տալիս, թե որտեղ է ռեստորանը կորցնում գումար, և ինչ ներուժ կա բարելավման համար։ Յուրաքանչյուր թիվ ունի պիտակ՝ փաստացի (ցուցադրական տվյալներ), հաշվարկված (բանաձև փաստացի տվյալների վրա), կամ ենթադրական (Ձեր կարգավորած ենթադրություն)։ <b>Սա երաշխիք կամ կանխատեսում չէ։</b></p></div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Վաճառք (28 օր)" value={moneyK(sm.gross)} sub={<Labelled kind="actual" />} />
        <Kpi label="Սննդի ինքնարժեք" value={pct(sm.foodCostPct)} sub={<Labelled kind="calculated" />} />
        <Kpi label="Կորուստ (28 օր)" value={money(sm.waste.cost)} sub={<Labelled kind="actual" />} />
        <Kpi label="Վերապատրաստում (28 օր)" value={money(sm.remakes.cost)} sub={<>{sm.remakes.count} դեպք · <Labelled kind="actual" /></>} />
        <Kpi label="Ուշացած տոմսեր" value={pct(sm.late.rate)} sub={<Labelled kind="actual" />} />
      </div>

      <div className="mt-4 space-y-3">
        {sav.rows.map((r) => (
          <Card key={r.id}>
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[15px] font-semibold">{r.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]"><Labelled kind={r.actual.kind} /><span>{r.actual.label}</span>{r.actual.unit === "amd" && <b className="tnum">{money(r.actual.value)}</b>}</div>
                <div className="mt-1 text-[12px] text-muted">Աղբյուր՝ {r.actual.source}</div>
              </div>
              <div className="text-[13px]"><div className="text-[12px] text-muted">{r.base.label}</div><div className="tnum text-[18px] font-semibold">{r.id === "labour" ? `${Math.round(r.base.value)} պատվեր` : money(r.base.value)}</div></div>
              <div>
                <label className="block text-[12px] text-muted">{r.assumption.label} <Labelled kind="hypothetical" /></label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="range" min={0} max={r.assumption.unit === "min" ? 5 : 100} step={r.assumption.unit === "min" ? 0.5 : 5} value={r.assumption.value} onChange={(e) => set(r.assumption.key, Number(e.target.value))} className="flex-1 accent-[var(--color-violet)]" aria-label={r.assumption.label} />
                  <span className="tnum w-14 text-right font-semibold">{r.assumption.value}{r.assumption.unit === "%" ? "%" : " ր"}</span>
                </div>
                {r.id === "labour" && <label className="mt-2 flex items-center gap-2 text-[12px] text-muted">Աշխատաժամի արժեք, ֏<input type="number" className="h-8 w-24 rounded-lg border border-line-2 px-2 text-ink" value={state.settings.savings.labourCostPerHour} onChange={(e) => set("labourCostPerHour", Number(e.target.value) || 0)} /></label>}
              </div>
              <div className="rounded-xl bg-violet-soft p-3 text-violet"><div className="text-[11.5px]">Ենթադրական ամսական արդյունք</div><div className="tnum text-[20px] font-semibold">{money(r.result)}</div></div>
            </div>
            <div className="mt-3 border-t border-line pt-2 text-[12px] text-muted"><Icon name="calc" size={12} className="mr-1 inline" />Բանաձև՝ {r.formula}{r.note ? ` · ${r.note}` : ""}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-violet/30">
        <CardHead title="Ենթադրական ամսական բարելավման ներուժ" sub={sav.basis} icon="sparkles" right={<Labelled kind="hypothetical" />} />
        <div className="tnum text-[34px] font-semibold tracking-tight text-violet">{money(sav.total)}</div>
        <ul className="mt-3 space-y-1 text-[12.5px] text-muted">
          <li>• Արդյունքը հիմնված է ցուցադրական ռեստորանի տվյալների և վերևի ենթադրությունների վրա։ Ձեր ռեստորանի համար այն չափվում է պիլոտի ընթացքում՝ առաջին օրվա ելակետի համեմատ։</li>
          <li>• «Պատվերի ընդունման ժամանակը» ազատված աշխատաժամ է, ոչ անպայման կանխիկ խնայողություն։</li>
          <li>• Եկամտի աճի երաշխիքներ չենք տալիս։ Զուտ շահույթը ցույց է տրվում միայն այն դեպքում, երբ ծախսերը մուտքագրված են։</li>
        </ul>
      </Card>
    </Guard>
  );
}
