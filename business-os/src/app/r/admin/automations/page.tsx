"use client";
import { Guard, hm } from "@/components/restaurant/staff/shell";
import { Badge, Card, CardHead, SimBadge, Toggle } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import type { AutomationId } from "@/lib/restaurant/types";

type Def = { id: AutomationId; trigger: string; action: string; value: string; perm?: string; owner?: string };
const LIST: Def[] = [
  { id: "station_routing", trigger: "Պատվերն ընդունված է", action: "Ուտեստները բաժանվում են տոմսերի ըստ կայանի (տաք, մանղալ, սառը, աղանդեր, բար)", value: "Յուրաքանչյուր կայան տեսնում է միայն իր գործը" },
  { id: "stock_deduction", trigger: "Պատվերն ընդունված է / չեղարկված է", action: "Պաշարը նվազում է ըստ բաղադրատոմսի մեկ անգամ. չեղարկումը մինչև պատրաստելը՝ վերադարձ, հետո՝ կորուստ", value: "Տեսական պաշարը միշտ թարմ է" },
  { id: "ready_notify", trigger: "Բոլոր կայանները պատրաստ են", action: "Ծանուցում մատուցողին, տանելու պատվերի դեպքում՝ SMS հյուրին", value: "Տաք ուտեստը չի սառչում" },
  { id: "low_stock_alert", trigger: "Պաշարը նվազագույնից ցածր է", action: "Ծանուցում պահեստապետին և առաջարկ գնումների բաժնում", value: "Ավելի քիչ «վերջացել է»" },
  { id: "price_change_alert", trigger: "Բաղադրիչի գինը փոխվել է ≥ 5%", action: "Բոլոր բաղադրատոմսերը վերահաշվարկվում են, ծանուցում մենեջերին", value: "Մարժայի պաշտպանություն" },
  { id: "late_ticket_alert", trigger: "Տոմսը անցել է կայանի կարմիր շեմը", action: "Տոմսը կարմիր է խոհանոցում, հաշվվում է ընդհանուր պատկերում", value: "Ուշացումները տեսանելի են" },
  { id: "request_escalation", trigger: "Հյուրը կանչում է մատուցողին / խնդրում հաշիվը", action: "Ծանուցում սեղանի մատուցողին, «Ուշադրություն է պահանջում» ցուցակ", value: "Ոչ մի կանչ չի կորչում" },
  { id: "reservation_host_alert", trigger: "Նոր ամրագրման հարցում (կայք / չատ)", action: "Ծանուցում հոստեսին՝ առաջարկվող սեղանով", value: "Հարցումները չեն մոռացվում", owner: "Հոստես" },
  { id: "reservation_reminder", trigger: "Հոստեսը սեղմում է «Հիշեցնել»", action: "SMS հիշեցում հյուրին (սիմուլյացիա) · մեկ անգամ յուրաքանչյուր ամրագրման համար", value: "Ավելի քիչ չներկայացում", owner: "Հոստես" },
  { id: "walkin_assign", trigger: "Սպասման ցուցակից հյուրը նստեցվում է", action: "Սեղանը բացվում է, ցուցակից հեռացվում", value: "Արագ նստեցում", owner: "Հոստես" },
  { id: "bill_request_notify", trigger: "Հյուրը խնդրում է հաշիվը", action: "Ծանուցում մատուցողին և դրամարկղին", value: "Արագ վճարում", owner: "Մատուցող" },
  { id: "cancel_manager_alert", trigger: "Ուտեստը չեղարկվել է պատրաստելուց հետո", action: "Կորուստը գրանցվում է, ծանուցում մենեջերին", value: "Կորուստների վերահսկում", owner: "Մենեջեր" },
  { id: "low_stock_purchase_draft", trigger: "Պաշարը նվազագույնից ցածր է", action: "Մատակարարին գնման ՆԱԽԱԳԻԾ (չի ուղարկվում) · մեկ բաց նախագիծ մատակարարի համար", value: "Ժամանակի խնայողություն պահեստում", owner: "Պահեստապետ" },
  { id: "negative_review_task", trigger: "Նոր կարծիք ≤ 3★", action: "Առաջադրանք մենեջերին՝ պատասխանել և ստուգել պատճառը", value: "Արագ արձագանք", owner: "Մենեջեր" },
  { id: "inbox_auto_reply", trigger: "Մուտքային հաղորդագրություն՝ թույլատրված ցածր ռիսկի թեմայով", action: "Ավտոմատ պատասխան (միայն ժամեր / մենյու / շնորհակալություն)", value: "Ակնթարթային պատասխան պարզ հարցերին", owner: "Մենեջեր" },
  { id: "unusual_waste_alert", trigger: "Մեկ կորուստ ≥ 10 000 ֏", action: "Ծանուցում մենեջերին", value: "Անսովոր կորուստները տեսանելի են", owner: "Մենեջեր" },
  { id: "shift_handover", trigger: "Աշխատակիցը ստեղծում է հերթափոխի փոխանցում", action: "Ավտոմատ ամփոփում՝ բաց սեղաններ, խոհանոց, հաղորդագրություններ, պաշար", value: "Ոչինչ չի կորչում հերթափոխի ժամանակ", owner: "Մենեջեր" },
  { id: "daily_summary", trigger: "Մենեջերը փակում է օրը", action: "Օրվա ամփոփում՝ վաճառք, լավագույն ուտեստներ, կորուստ, խնդիրներ", value: "Սեփականատերը տեսնում է օրը մեկ էկրանով", owner: "Սեփականատեր" },
];

export default function Automations() {
  const { state, dispatch } = useR();
  return (
    <Guard perm="automations.manage">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Ավտոմատացումներ</h1><p className="mt-1 text-[13.5px] text-muted">Բոլոր ավտոմատացումներն աշխատում են այս ցուցադրության մեջ։ Արտաքին հաղորդագրությունները չեն ուղարկվում. դրանք նշված են որպես սիմուլյացիա։</p></div>
      <div className="grid gap-3 lg:grid-cols-2">{LIST.map((a) => (
        <Card key={a.id}><div className="flex items-start gap-3"><div className="flex-1"><div className="text-[12px] font-semibold uppercase tracking-wide text-muted">Երբ</div><div className="text-[14px] font-medium">{a.trigger}</div><div className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-muted">Ինչ է անում</div><div className="text-[13.5px]">{a.action}</div><div className="mt-2 flex flex-wrap items-center gap-2"><Badge tone="ok">{a.value}</Badge>{a.owner && <span className="text-[12px] text-muted">Պատասխանատու՝ {a.owner}</span>}<span className="text-[12px] text-muted">· կատարվել է {state.autolog.filter((l) => l.automationId === a.id && l.result === "ok").length} անգամ</span></div></div><Toggle on={state.automations[a.id]} onChange={(v) => dispatch({ type: "automation.toggle", target: a.id, on: v })} label={a.trigger} /></div></Card>
      ))}</div>
      <Card className="mt-4"><CardHead title="Կատարման մատյան" sub="Յուրաքանչյուր ավտոմատացում կատարվում է մեկ անգամ նույն օբյեկտի համար (կրկնություն և շրջապտույտ չկա)" icon="list" />
        <ul className="max-h-96 divide-y divide-line overflow-y-auto">{state.autolog.slice(0, 40).map((l) => <li key={l.id} className="flex flex-wrap items-center gap-2 py-2 text-[13px]"><span className="tnum w-12 text-muted">{hm(l.at)}</span><Badge tone={l.result === "ok" ? "ok" : l.result === "skipped" ? "neutral" : "bad"}>{l.result === "ok" ? "կատարված" : l.result === "skipped" ? "բաց թողնված" : "սխալ"}</Badge><span className="font-mono text-[11.5px] text-muted">{l.automationId}</span><span className="min-w-0 flex-1">{l.detail}</span></li>)}{!state.autolog.length && <li className="py-3 text-[13px] text-muted">Դատարկ է</li>}</ul>
      </Card>
      <Card className="mt-4"><CardHead title="Արտաքին հաղորդագրություններ (սիմուլյացիա)" sub="Այն, ինչ կուղարկվեր իրական ինտեգրացիայի դեպքում" icon="send" />
        <ul className="divide-y divide-line">{state.outbox.slice(0, 15).map((o) => <li key={o.id} className="flex flex-wrap items-center gap-2 py-2 text-[13px]"><span className="tnum w-12 text-muted">{hm(o.at)}</span><Badge>{o.channel.toUpperCase()}</Badge><span className="font-medium">{o.to}</span><span className="min-w-0 flex-1 text-muted">{o.text}</span><SimBadge /></li>)}</ul>
      </Card>
    </Guard>
  );
}
