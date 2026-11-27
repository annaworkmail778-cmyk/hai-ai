"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Card, CardHead, cn, Kpi, Select, SimBadge, Toggle } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { stamp } from "@/lib/format";
import type { OutboxItem, WorkflowId } from "@/lib/types";

const WF: { id: WorkflowId; trigger: string; action: string; icon: IconName; channels: string; core?: boolean; manualBefore: string }[] = [
  { id: "inquiry_alert", trigger: "Նոր հարցում կայքից կամ օգնականից", action: "Ծանուցում վահանակում + հաղորդագրություն ընդունարանին + հաստատում հյուրին, որ հարցումը ստացվել է", icon: "bell", channels: "Վահանակ · Telegram · էլ. փոստ", manualBefore: "Ինչ-որ մեկը պետք է նկատի հաղորդագրությունը և ձեռքով պատասխանի" },
  { id: "approve_calendar", trigger: "Աշխատակիցը հաստատում է ամրագրումը", action: "Օրացույցն ու սենյակի կարգավիճակը թարմանում են, հյուրը ստանում է հաստատում", icon: "calendar", channels: "Օրացույց · էլ. փոստ / WhatsApp", core: true, manualBefore: "Գրանցում տետրում, առանձին հաղորդագրություն հյուրին" },
  { id: "approve_prep_task", trigger: "Ամրագրումը հաստատված է", action: "Ստեղծվում է սենյակի պատրաստման առաջադրանք ժամանման օրվա համար", icon: "broom", channels: "Մաքրության վահանակ", manualBefore: "Զանգ կամ գրառում հավաքարարին" },
  { id: "pre_arrival", trigger: "Ժամանումից 1 օր առաջ, 10:00", action: "Նախաժամանման հաղորդագրություն՝ մուտքի ժամ, ավտոկայանատեղի, ճանապարհ", icon: "send", channels: "WhatsApp", manualBefore: "Ընդունարանը մոռանում է կամ գրում ամեն հյուրին առանձին" },
  { id: "checkout_task", trigger: "Հյուրը մեկնում է", action: "Ստեղծվում է մաքրման առաջադրանք, շտապ՝ եթե նույն օրը նոր հյուր է գալիս", icon: "logOut", channels: "Մաքրության վահանակ", manualBefore: "Ընդունարանը զանգում է հավաքարարին" },
  { id: "review_request", trigger: "Մեկնումից հաջորդ օրը, 11:00", action: "Շնորհակալություն և կարծիքի խնդրանք", icon: "star", channels: "Էլ. փոստ", manualBefore: "Սովորաբար չի արվում" },
  { id: "unanswered_followup", trigger: "Օգնականը չունի հաստատված պատասխան", action: "Հարցը փոխանցվում է անձնակազմին, ստեղծվում է առաջադրանք ընդունարանին", icon: "sparkles", channels: "Վահանակ · առաջադրանք", manualBefore: "Հարցը մնում է անպատասխան" },
];

const CH: Record<OutboxItem["channel"], string> = { email: "Էլ. փոստ", whatsapp: "WhatsApp", telegram: "Telegram", sms: "SMS", in_app: "Վահանակ" };
const INTEGRATIONS: [string, string][] = [["Telegram (անձնակազմի ծանուցումներ)", "Telegram Bot API"], ["WhatsApp (հյուրերին)", "WhatsApp Business Platform"], ["Էլ. փոստ", "Էլ. փոստի ծառայություն (օր.՝ Resend)"], ["Booking.com / Airbnb օրացույց", "iCal համաժամեցում"], ["Աշխատանքային հոսքեր", "n8n"]];

export default function Automations() {
  const { state, dispatch } = useDemo();
  const [wf, setWf] = useState<"" | WorkflowId>("");
  const runs = (id: WorkflowId) => state.outbox.filter((o) => o.workflowId === id).length + (id === "approve_prep_task" || id === "checkout_task" ? state.hkTasks.filter((t) => t.auto && (id === "checkout_task" ? t.kind === "checkout" : t.kind === "arrival_prep")).length : 0) + (id === "unanswered_followup" ? state.staffTasks.filter((t) => t.origin === "assistant").length : 0);
  const log = state.outbox.filter((o) => !wf || o.workflowId === wf);
  const autoTasks = state.hkTasks.filter((t) => t.auto).length + state.staffTasks.filter((t) => t.origin === "assistant").length;
  return (
    <>
      <PageTitle title="Ավտոմատացումներ" sub="Աշխատանքային հոսքեր, որոնք կատարվում են առանց ձեռքով աշխատանքի" />
      <div className="mb-4 rounded-xl border border-dashed border-violet/40 bg-violet-soft px-4 py-3 text-[13px] text-ink-2">
        <div className="flex items-center gap-2 font-semibold text-violet"><Icon name="info" size={16} />Ցուցադրական ռեժիմ</div>
        Ներքին գործողությունները (օրացույց, առաջադրանքներ, ծանուցումներ վահանակում) իրական են այս ցուցադրության մեջ։ Արտաքին հաղորդագրությունները (WhatsApp, Telegram, էլ. փոստ) <b>պատրաստվում են, բայց չեն ուղարկվում</b>. դրանք նշված են «Սիմուլյացիա» պիտակով։ Իրական ներդրման ժամանակ դրանք միանում են ստորև նշված ծառայություններին։
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ակտիվ հոսքեր" value={`${Object.values(state.workflows).filter(Boolean).length}/7`} icon="zap" tone="violet" />
        <Kpi label="Պատրաստված հաղորդագրություններ" value={state.outbox.length} sub="սիմուլյացիա, չեն ուղարկվել" icon="send" />
        <Kpi label="Ավտոմատ առաջադրանքներ" value={autoTasks} icon="tasks" tone="ok" />
        <Kpi label="Ծանուցումներ վահանակում" value={state.notifications.length} icon="bell" tone="info" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {WF.map((w, i) => (
          <Card key={w.id} className={cn(!state.workflows[w.id] && "opacity-60")}>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet"><Icon name={w.icon} size={19} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3"><div className="text-[14px] font-semibold">{i + 1}. {w.trigger}</div><Toggle on={state.workflows[w.id]} disabled={w.core} label={w.trigger} onChange={(v) => dispatch({ type: "workflow.toggle", id: w.id, on: v })} /></div>
                <div className="mt-1 flex items-start gap-1.5 text-[13px] text-ink-2"><Icon name="arrowRight" size={15} className="mt-0.5 shrink-0 text-faint" />{w.action}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-muted"><Badge>{w.channels}</Badge><Badge tone="ok">{runs(w.id)} անգամ</Badge>{w.core && <Badge tone="dark">Հիմնական</Badge>}</div>
                <div className="mt-2 text-[12px] text-faint">Առանց համակարգի՝ {w.manualBefore}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHead title="Պատրաստված հաղորդագրություններ" sub="Ինչ կուղարկեր համակարգը. այստեղ ոչինչ չի ուղարկվում" icon="send" right={<Select value={wf} onChange={(e) => setWf(e.target.value as WorkflowId | "")} className="max-w-64"><option value="">Բոլոր հոսքերը</option>{WF.map((w) => <option key={w.id} value={w.id}>{w.trigger}</option>)}</Select>} />
          <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {log.slice(0, 60).map((o) => (
              <li key={o.id} className="rounded-xl border border-line p-3 text-[13px]">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{o.template}</span><SimBadge scheduled={o.state === "scheduled"} /></div>
                <div className="mt-1 text-[12px] text-muted">{CH[o.channel]} → {o.to} · {o.scheduledFor ? `պլանավորված՝ ${o.scheduledFor}` : stamp(o.at, state.baseDate)}</div>
                <div className="mt-2 rounded-lg bg-paper px-3 py-2 text-ink-2">{o.text}</div>
              </li>
            ))}
            {!log.length && <li className="py-6 text-center text-muted">Դեռ հաղորդագրություններ չկան</li>}
          </ul>
        </Card>
        <Card>
          <CardHead title="Ինտեգրացիաներ" sub="Այս ցուցադրության մեջ ոչ մեկը միացված չէ" icon="external" />
          <ul className="space-y-2.5">{INTEGRATIONS.map(([k, v]) => <li key={k} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2.5 text-[13px]"><div><div className="font-medium">{k}</div><div className="text-[12px] text-muted">{v}</div></div><Badge tone="neutral">Միացված չէ · սիմուլյացիա</Badge></li>)}</ul>
          <p className="mt-3 text-[12px] text-faint">Իրական պիլոտում հոսքերը կատարվում են n8n-ով, իսկ հաղորդագրությունները ուղարկվում են միայն ծառայությունները միացնելուց և հյուրանոցի հաստատումից հետո։</p>
        </Card>
      </div>
    </>
  );
}
