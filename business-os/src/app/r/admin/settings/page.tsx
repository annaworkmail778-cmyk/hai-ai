"use client";
import { useState } from "react";
import { Guard, money } from "@/components/restaurant/staff/shell";
import { Button, Card, CardHead, Field, Input, Segmented, Toggle } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { CHANNEL_HY } from "@/lib/restaurant/staff-i18n";
import type { Channel } from "@/lib/restaurant/types";

export default function Settings() {
  const { state, dispatch } = useR();
  const s = state.settings;
  const [exp, setExp] = useState({ rent: String(s.expenses?.rent ?? ""), staff: String(s.expenses?.staff ?? ""), utilities: String(s.expenses?.utilities ?? ""), other: String(s.expenses?.other ?? "") });
  return (
    <Guard perm="automations.manage">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Կարգավորումներ</h1><p className="mt-1 text-[13.5px] text-muted">Կանոնները, որոնցով աշխատում է համակարգը։ Փոփոխությունները կիրառվում են անմիջապես բոլոր սարքերում։</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="ԱԱՀ և մարժայի հաշվարկ" icon="calc" />
          <label className="flex items-center justify-between py-1.5 text-[13.5px]">ԱԱՀ վճարող<Toggle on={s.vat.registered} onChange={(v) => dispatch({ type: "settings.update", patch: { vat: { ...s.vat, registered: v } } })} label="ԱԱՀ վճարող" /></label>
          <label className="flex items-center justify-between py-1.5 text-[13.5px]">Մենյուի գները ներառում են ԱԱՀ ({Math.round(s.vat.rate * 100)}%)<Toggle on={s.vat.pricesIncludeVat} onChange={(v) => dispatch({ type: "settings.update", patch: { vat: { ...s.vat, pricesIncludeVat: v } } })} label="Գները ներառում են ԱԱՀ" /></label>
          <p className="mt-1 text-[12px] text-muted">Մարժան հաշվարկվում է զուտ գնից (առանց ԱԱՀ), եթե ռեստորանը ԱԱՀ վճարող է։ Ճշտեք Ձեր հաշվապահի հետ։</p>
        </Card>
        <Card><CardHead title="Պատվերների ավտոմատ ընդունում" sub="Տեսանելի կանոն. մնացած պատվերները սպասում են աշխատակցի հաստատմանը" icon="check" />
          {(Object.keys(s.autoAccept) as Channel[]).map((c) => <label key={c} className="flex items-center justify-between py-1.5 text-[13.5px]">{CHANNEL_HY[c]}<Toggle on={s.autoAccept[c]} onChange={(v) => dispatch({ type: "settings.update", patch: { autoAccept: { ...s.autoAccept, [c]: v } } })} label={CHANNEL_HY[c]} /></label>)}
        </Card>
        <Card><CardHead title="Տանելու պատվերներ" icon="clock" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Նվազագույն պատվեր, ֏"><Input type="number" defaultValue={s.takeaway.minOrder} onBlur={(e) => dispatch({ type: "settings.update", patch: { takeaway: { ...s.takeaway, minOrder: Number(e.target.value) || 0 } } })} /></Field>
            <Field label="Փաթեթավորում, ֏"><Input type="number" defaultValue={s.takeaway.serviceFee} onBlur={(e) => dispatch({ type: "settings.update", patch: { takeaway: { ...s.takeaway, serviceFee: Number(e.target.value) || 0 } } })} /></Field>
            <Field label="Նախապատրաստման պաշար, րոպե"><Input type="number" defaultValue={s.takeaway.leadMin} onBlur={(e) => dispatch({ type: "settings.update", patch: { takeaway: { ...s.takeaway, leadMin: Number(e.target.value) || 0 } } })} /></Field>
            <Field label="Ժամային քայլ, րոպե"><Input type="number" defaultValue={s.takeaway.slotMin} onBlur={(e) => dispatch({ type: "settings.update", patch: { takeaway: { ...s.takeaway, slotMin: Math.max(5, Number(e.target.value) || 15) } } })} /></Field>
          </div>
          <p className="mt-2 text-[12px] text-muted">Առաքումը այս ցուցադրական ռեստորանի համար միացված չէ (կարգավորելի հնարավորություն)։</p>
        </Card>
        <Card><CardHead title="Ամսական ծախսեր (զուտ շահույթի համար)" sub="Առանց ծախսերի համակարգը ցույց է տալիս միայն համախառն շահույթ" icon="chart" />
          <div className="grid grid-cols-2 gap-3">{(["rent", "staff", "utilities", "other"] as const).map((k) => <Field key={k} label={{ rent: "Վարձակալություն", staff: "Աշխատավարձ", utilities: "Կոմունալ", other: "Այլ" }[k]}><Input type="number" value={exp[k]} onChange={(e) => setExp({ ...exp, [k]: e.target.value })} /></Field>)}</div>
          <div className="mt-3 flex gap-2"><Button variant="primary" onClick={() => dispatch({ type: "settings.update", patch: { expenses: { rent: Number(exp.rent) || 0, staff: Number(exp.staff) || 0, utilities: Number(exp.utilities) || 0, other: Number(exp.other) || 0 } } })}>Պահպանել</Button>{s.expenses && <Button variant="ghost" onClick={() => dispatch({ type: "settings.update", patch: { expenses: null } })}>Հեռացնել</Button>}</div>
          {s.expenses && <p className="mt-2 text-[12px] text-muted">Ընդամենը՝ {money(s.expenses.rent + s.expenses.staff + s.expenses.utilities + s.expenses.other)} / ամիս</p>}
        </Card>
        <Card><CardHead title="Կայքի ոճ" sub="Նույն համակարգը տարբեր ռեստորանների համար" icon="globe" />
          <Segmented value={state.brand.theme} onChange={(v) => dispatch({ type: "brand.theme", theme: v })} items={[{ id: "fine_dining", label: "Fine dining (մուգ)" }, { id: "family", label: "Ընտանեկան (բաց)" }]} />
        </Card>
      </div>
    </Guard>
  );
}
