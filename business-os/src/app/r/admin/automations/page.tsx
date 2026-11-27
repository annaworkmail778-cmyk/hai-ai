"use client";
import { Guard, hm } from "@/components/restaurant/staff/shell";
import { Badge, Card, CardHead, SimBadge, Toggle } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import type { AutomationId } from "@/lib/restaurant/types";

const LIST: { id: AutomationId; trigger: string; action: string; value: string }[] = [
  { id: "station_routing", trigger: "Պատվերն ընդունված է", action: "Ուտեստները բաժանվում են տոմսերի ըստ կայանի (տաք, մանղալ, սառը, աղանդեր, բար)", value: "Յուրաքանչյուր կայան տեսնում է միայն իր գործը" },
  { id: "stock_deduction", trigger: "Պատվերն ընդունված է / չեղարկված է", action: "Պաշարը նվազում է ըստ բաղադրատոմսի մեկ անգամ. չեղարկումը մինչև պատրաստելը՝ վերադարձ, հետո՝ կորուստ", value: "Տեսական պաշարը միշտ թարմ է" },
  { id: "ready_notify", trigger: "Բոլոր կայանները պատրաստ են", action: "Ծանուցում մատուցողին, տանելու պատվերի դեպքում՝ SMS հյուրին", value: "Տաք ուտեստը չի սառչում" },
  { id: "low_stock_alert", trigger: "Պաշարը նվազագույնից ցածր է", action: "Ծանուցում պահեստապետին և առաջարկ գնումների բաժնում", value: "Ավելի քիչ «վերջացել է»" },
  { id: "price_change_alert", trigger: "Բաղադրիչի գինը փոխվել է ≥ 5%", action: "Բոլոր բաղադրատոմսերը վերահաշվարկվում են, ծանուցում մենեջերին", value: "Մարժայի պաշտպանություն" },
  { id: "late_ticket_alert", trigger: "Տոմսը անցել է կայանի կարմիր շեմը", action: "Տոմսը կարմիր է խոհանոցում, հաշվվում է ընդհանուր պատկերում", value: "Ուշացումները տեսանելի են" },
  { id: "request_escalation", trigger: "Հյուրը կանչում է մատուցողին / խնդրում հաշիվը", action: "Ծանուցում սեղանի մատուցողին, «Ուշադրություն է պահանջում» ցուցակ", value: "Ոչ մի կանչ չի կորչում" },
];

export default function Automations() {
  const { state, dispatch } = useR();
  return (
    <Guard perm="automations.manage">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Ավտոմատացումներ</h1><p className="mt-1 text-[13.5px] text-muted">Բոլոր ավտոմատացումներն աշխատում են այս ցուցադրության մեջ։ Արտաքին հաղորդագրությունները չեն ուղարկվում. դրանք նշված են որպես սիմուլյացիա։</p></div>
      <div className="grid gap-3 lg:grid-cols-2">{LIST.map((a) => (
        <Card key={a.id}><div className="flex items-start gap-3"><div className="flex-1"><div className="text-[12px] font-semibold uppercase tracking-wide text-muted">Երբ</div><div className="text-[14px] font-medium">{a.trigger}</div><div className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-muted">Ինչ է անում</div><div className="text-[13.5px]">{a.action}</div><Badge tone="ok" className="mt-2">{a.value}</Badge></div><Toggle on={state.automations[a.id]} onChange={(v) => dispatch({ type: "automation.toggle", target: a.id, on: v })} label={a.trigger} /></div></Card>
      ))}</div>
      <Card className="mt-4"><CardHead title="Արտաքին հաղորդագրություններ (սիմուլյացիա)" sub="Այն, ինչ կուղարկվեր իրական ինտեգրացիայի դեպքում" icon="send" />
        <ul className="divide-y divide-line">{state.outbox.slice(0, 15).map((o) => <li key={o.id} className="flex flex-wrap items-center gap-2 py-2 text-[13px]"><span className="tnum w-12 text-muted">{hm(o.at)}</span><Badge>{o.channel.toUpperCase()}</Badge><span className="font-medium">{o.to}</span><span className="min-w-0 flex-1 text-muted">{o.text}</span><SimBadge /></li>)}</ul>
      </Card>
    </Guard>
  );
}
