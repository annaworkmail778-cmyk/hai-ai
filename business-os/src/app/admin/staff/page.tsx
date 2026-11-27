"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Avatar, Badge, Button, Card, CardHead, cn, Field, Input, Modal, Select, Tabs, Textarea } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { addDays } from "@/lib/dates";
import { dShort, PRIORITY_LABEL, ROLE_LABEL, stamp } from "@/lib/format";
import type { Priority } from "@/lib/types";

const PRI_TONE = { low: "neutral", normal: "info", high: "warn", urgent: "bad" } as const;

export default function Staff() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"open" | "done" | "all">("open");
  const [who, setWho] = useState("");
  const [create, setCreate] = useState(false);
  const [f, setF] = useState({ title: "", detail: "", assigneeId: "s-gohar", priority: "normal" as Priority, due: state.baseDate });
  const today = state.baseDate;
  const tasks = state.staffTasks.filter((t) => (tab === "all" || (tab === "open" ? t.status !== "done" : t.status === "done")) && (!who || t.assigneeId === who)).sort((a, b) => a.due.localeCompare(b.due));
  const openCount = (id: string) => state.staffTasks.filter((t) => t.assigneeId === id && t.status !== "done").length + state.hkTasks.filter((t) => t.assigneeId === id && t.due === today && t.status !== "done").length;
  const doneToday = (name: string) => state.activity.filter((a) => a.by === name && a.at > Date.now() - 86400000).length;
  return (
    <>
      <PageTitle title="Անձնակազմ և առաջադրանքներ" sub="Ով ինչ է անում, ժամկետներ և գործողությունների պատմություն" right={<Button variant="primary" icon="plus" onClick={() => setCreate(true)}>Նոր առաջադրանք</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {state.staff.map((s) => (
          <button key={s.id} onClick={() => setWho(who === s.id ? "" : s.id)} className={cn("flex items-center gap-3 rounded-[var(--radius-card)] border bg-surface p-3.5 text-left shadow-[var(--shadow-card)] transition", who === s.id ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-2")}>
            <Avatar initials={s.initials} tone={s.role === "manager" ? "dark" : "neutral"} size={38} />
            <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-medium">{s.name}</div><div className="text-[12px] text-muted">{ROLE_LABEL[s.role]} · {s.shift}</div></div>
            <div className="text-right"><div className="tnum text-[18px] font-semibold leading-none">{openCount(s.id)}</div><div className="text-[11px] text-muted">բաց</div></div>
            <span className="sr-only">{doneToday(s.name)}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHead title="Առաջադրանքներ" sub={who ? `Ֆիլտր՝ ${state.staff.find((s) => s.id === who)?.name}` : "Բոլոր աշխատակիցները"} icon="tasks" right={<Tabs value={tab} onChange={setTab} items={[{ id: "open", label: "Բաց" }, { id: "done", label: "Ավարտված" }, { id: "all", label: "Բոլորը" }]} />} />
          <ul className="divide-y divide-line">
            {tasks.map((t) => {
              const s = state.staff.find((x) => x.id === t.assigneeId);
              const overdue = t.status !== "done" && t.due < today;
              return (
                <li key={t.id} className="flex items-start gap-3 py-3">
                  <button onClick={() => dispatch({ type: "staffTask.status", id: t.id, status: t.status === "done" ? "todo" : "done" })} className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", t.status === "done" ? "border-ok bg-ok text-white" : "border-line-2 hover:border-ink")} aria-label="Կատարված">{t.status === "done" && <Icon name="check" size={13} />}</button>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[14px]", t.status === "done" && "text-muted line-through")}>{t.title}</div>
                    {t.detail && <div className="text-[12.5px] text-muted">{t.detail}</div>}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                      <Badge tone={PRI_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                      <span className={cn(overdue && "font-medium text-bad")}>Ժամկետ՝ {t.due === today ? "այսօր" : t.due === addDays(today, 1) ? "վաղը" : dShort(t.due)}</span>
                      {t.origin === "assistant" && <Badge tone="violet"><Icon name="sparkles" size={11} />AI օգնականից</Badge>}
                      {s && <span>· {s.name}</span>}
                    </div>
                  </div>
                  {t.status === "todo" && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "staffTask.status", id: t.id, status: "in_progress" })}>Սկսել</Button>}
                  {t.status === "in_progress" && <Badge tone="info">Ընթացքում</Badge>}
                </li>
              );
            })}
            {!tasks.length && <li className="py-6 text-center text-sm text-muted">Առաջադրանքներ չկան</li>}
          </ul>
        </Card>
        <Card>
          <CardHead title="Գործողությունների պատմություն" icon="clock" />
          <ul className="max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
            {state.activity.slice(0, 40).map((a) => <li key={a.id} className="flex gap-2.5 text-[13px]"><span className={cn("mt-1.5 size-2 shrink-0 rounded-full", a.automated ? "bg-violet" : "bg-ink-2")} /><div><div>{a.text}</div><div className="text-[12px] text-faint">{stamp(a.at, today)} · {a.by}</div></div></li>)}
          </ul>
        </Card>
      </div>
      <Modal open={create} onClose={() => setCreate(false)} title="Նոր առաջադրանք" footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Չեղարկել</Button><Button variant="primary" disabled={!f.title.trim()} onClick={() => { dispatch({ type: "staffTask.create", ...f }); setCreate(false); setF({ ...f, title: "", detail: "" }); }}>Ստեղծել</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Առաջադրանք" className="sm:col-span-2"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Մանրամասներ" className="sm:col-span-2"><Textarea value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} /></Field>
          <Field label="Պատասխանատու"><Select value={f.assigneeId} onChange={(e) => setF({ ...f, assigneeId: e.target.value })}>{state.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          <Field label="Ժամկետ"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
          <Field label="Առաջնահերթություն"><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Priority })}>{(["low", "normal", "high", "urgent"] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</Select></Field>
        </div>
      </Modal>
    </>
  );
}
