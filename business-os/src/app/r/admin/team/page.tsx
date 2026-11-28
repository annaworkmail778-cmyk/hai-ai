"use client";
/* Team: today's shifts and sections, tasks, internal messages, shift handover and day close summary. */
import { useState } from "react";
import { Guard, hm } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Input, Select, Toggle, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { ROLE_LABEL } from "@/lib/restaurant/data";
import type { TeamMsg } from "@/lib/restaurant/types";

const CH: Record<TeamMsg["channel"], string> = { all: "Բոլորը", kitchen: "Խոհանոց", floor: "Սրահ", managers: "Մենեջերներ" };

export default function Team() {
  const { state, dispatch, can, actor } = useR();
  const [title, setTitle] = useState("");
  const [who, setWho] = useState("");
  const [high, setHigh] = useState(false);
  const [ch, setCh] = useState<TeamMsg["channel"]>("all");
  const [msg, setMsg] = useState("");
  const [ho, setHo] = useState("");
  const [showDone, setShowDone] = useState(false);
  const name = (id?: string) => state.staff.find((s) => s.id === id)?.name ?? (id === "presenter" ? "Ներկայացնող" : id ?? "—");
  const tasks = state.tasks.filter((t) => (showDone ? t.status === "done" : t.status === "open")).sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high") || a.createdAt - b.createdAt);

  return (
    <Guard perm="team.view">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Թիմ և հերթափոխեր</h1><p className="mt-1 text-[13.5px] text-muted">Հերթափոխեր, առաջադրանքներ, ներքին հաղորդագրություններ և հերթափոխի փոխանցում։ Ցուցադրական աշխատակիցներ։</p></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHead title="Այսօրվա հերթափոխ" sub={`${state.shifts.length} աշխատակից`} icon="users" />
          <ul className="divide-y divide-line text-[13px]">{state.shifts.map((s) => { const st = state.staff.find((x) => x.id === s.staffId); return (
            <li key={s.id} className="flex items-center gap-2 py-2"><div className="min-w-0 flex-1"><div className="font-medium">{st?.name}</div><div className="text-[12px] text-muted">{st ? ROLE_LABEL[st.role] : ""}{s.section ? ` · ${s.section}` : ""}</div></div><span className="tnum text-muted">{s.start}–{s.end}</span></li>
          ); })}</ul>
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Առաջադրանքներ" sub={`${state.tasks.filter((t) => t.status === "open").length} բաց`} icon="tasks" right={<div className="flex items-center gap-2 text-[12.5px]">Կատարվածները<Toggle on={showDone} onChange={setShowDone} label="Կատարվածները" /></div>} />
          {can("team.manage") && <div className="mb-3 flex flex-wrap gap-2"><Input className="min-w-48 flex-1" placeholder="Նոր առաջադրանք" value={title} onChange={(e) => setTitle(e.target.value)} /><Select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Պատասխանատու"><option value="">Պատասխանատու…</option>{state.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select><label className="flex items-center gap-1 text-[12.5px]"><input type="checkbox" checked={high} onChange={(e) => setHigh(e.target.checked)} />Կարևոր</label><Button variant="primary" icon="plus" disabled={!title.trim()} onClick={() => { dispatch({ type: "task.create", title, assigneeId: who || undefined, priority: high ? "high" : "normal" }); setTitle(""); }}>Ավելացնել</Button></div>}
          <ul className="divide-y divide-line">{tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-3 py-2.5">
              <button disabled={t.status === "done" || !(can("team.manage") || t.assigneeId === actor || (t.role && state.staff.find((s) => s.id === actor)?.role === t.role))} onClick={() => dispatch({ type: "task.done", taskId: t.id })} className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 disabled:opacity-50", t.status === "done" ? "border-ok bg-ok text-white" : "border-line-2")} aria-label="Կատարված">{t.status === "done" ? "✓" : ""}</button>
              <div className="min-w-0 flex-1 text-[13.5px]"><div className={cn("font-medium", t.status === "done" && "text-muted line-through")}>{t.title}</div><div className="text-[12px] text-muted">{t.assigneeId ? name(t.assigneeId) : t.role ? ROLE_LABEL[t.role] : "—"} · {t.source === "automation" ? "ավտոմատ" : t.source === "assistant" ? "AI օգնական" : "ձեռքով"} · {hm(t.createdAt)}</div></div>
              {t.priority === "high" && <Badge tone="bad">Կարևոր</Badge>}
            </li>
          ))}{!tasks.length && <li className="py-4 text-center text-[13px] text-muted">Դատարկ է</li>}</ul>
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Ներքին հաղորդագրություններ" icon="message" right={<div className="flex gap-1">{(Object.keys(CH) as TeamMsg["channel"][]).map((k) => <button key={k} onClick={() => setCh(k)} className={cn("h-8 rounded-lg px-2.5 text-[12.5px]", ch === k ? "bg-ink text-white" : "bg-paper")}>{CH[k]}</button>)}</div>} />
          <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (msg.trim()) { dispatch({ type: "team.msg", channel: ch, text: msg }); setMsg(""); } }}><Input className="flex-1" placeholder={`Գրել «${CH[ch]}» ալիքում`} value={msg} onChange={(e) => setMsg(e.target.value)} /><Button variant="primary" icon="send" type="submit" disabled={!msg.trim()}>Ուղարկել</Button></form>
          <ul className="max-h-80 space-y-2 overflow-y-auto">{state.teamMsgs.filter((m) => ch === "all" || m.channel === ch).map((m) => <li key={m.id} className={cn("rounded-xl px-3 py-2 text-[13px]", m.urgent ? "bg-bad-soft" : "bg-paper")}><div className="text-[11.5px] text-muted">{name(m.by)} · {CH[m.channel]} · {hm(m.at)}</div>{m.text}</li>)}</ul>
        </Card>
        <Card>
          <CardHead title="Հերթափոխի փոխանցում" icon="refresh" />
          <textarea className="min-h-20 w-full rounded-lg border border-line-2 p-2 text-[13px]" placeholder="Լրացուցիչ նշում (կամընտիր)" value={ho} onChange={(e) => setHo(e.target.value)} />
          <Button className="mt-2 w-full" variant="primary" onClick={() => { dispatch({ type: "shift.handover", text: ho || undefined }); setHo(""); }}>Ստեղծել փոխանցում</Button>
          <p className="mt-1 text-[11.5px] text-muted">Ավտոմատ ներառում է բաց սեղանները, խոհանոցը, անպատասխան հաղորդագրությունները, առաջադրանքները և պաշարը։</p>
          <ul className="mt-3 space-y-2">{state.handovers.slice(0, 3).map((h) => <li key={h.id} className="rounded-xl border border-line p-2 text-[12.5px]"><div className="text-[11.5px] text-muted">{name(h.by)} · {hm(h.at)}</div><pre className="whitespace-pre-wrap font-sans">{h.text}</pre></li>)}</ul>
          {can("team.manage") && <div className="mt-4 border-t border-line pt-3">
            <Button className="w-full" variant="secondary" icon="moon" onClick={() => dispatch({ type: "day.close" })}>Փակել օրը (ամփոփում)</Button>
            {state.summaries[0] && <div className="mt-2 rounded-xl bg-paper p-2 text-[12.5px]"><div className="text-[11.5px] text-muted">{hm(state.summaries[0].at)} · {name(state.summaries[0].by)}</div><ul className="mt-1 space-y-0.5">{state.summaries[0].text.map((l, i) => <li key={i}>{l}</li>)}</ul></div>}
          </div>}
        </Card>
      </div>
    </Guard>
  );
}
