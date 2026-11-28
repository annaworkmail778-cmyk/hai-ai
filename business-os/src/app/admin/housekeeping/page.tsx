"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { LostFound } from "@/components/admin/lost-found";
import { Icon } from "@/components/icons";
import { Avatar, Badge, Button, Card, CardHead, cn, Empty, Kpi, Segmented, Select } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { addDays } from "@/lib/dates";
import { kindLabel } from "@/lib/engine";
import { dShort, PRIORITY_LABEL, stamp } from "@/lib/format";
import { roomType } from "@/lib/hotel-data";
import type { HkTask, TaskStatus } from "@/lib/types";

const PRI_TONE = { low: "neutral", normal: "info", high: "warn", urgent: "bad" } as const;
const COLS: { id: TaskStatus; label: string }[] = [{ id: "todo", label: "Անելիք" }, { id: "in_progress", label: "Ընթացքում" }, { id: "done", label: "Ավարտված" }];

export default function Housekeeping() {
  const { state, dispatch } = useDemo();
  const sp = useSearchParams();
  const [day, setDay] = useState<"today" | "tomorrow" | "upcoming">((sp.get("day") as "upcoming") ?? "today");
  const [who, setWho] = useState("");
  const date = day === "today" ? state.baseDate : addDays(state.baseDate, 1);
  const inDay = (d: string) => (day === "upcoming" ? d > addDays(state.baseDate, 1) : d === date);
  const hks = state.staff.filter((s) => s.role === "housekeeping");
  const tasks = state.hkTasks.filter((t) => inDay(t.due) && (!who || t.assigneeId === who));
  const order = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sorted = (s: TaskStatus) => tasks.filter((t) => t.status === s).sort((a, b) => order[a.priority] - order[b.priority] || (a.dueTime ?? "").localeCompare(b.dueTime ?? ""));
  const all = state.hkTasks.filter((t) => inDay(t.due));
  const arrivalsReady = all.filter((t) => t.kind === "arrival_prep");
  return (
    <>
      <PageTitle title="Մաքրություն" sub="Առաջադրանքները ստեղծվում են ավտոմատ՝ ամրագրման հաստատումից և հյուրի մեկնումից հետո"
        right={<><Segmented value={day} onChange={setDay} items={[{ id: "today", label: `Այսօր · ${dShort(state.baseDate)}` }, { id: "tomorrow", label: "Վաղը" }, { id: "upcoming", label: "Առաջիկա" }]} /><Select value={who} onChange={(e) => setWho(e.target.value)} className="max-w-64"><option value="">Բոլոր աշխատակիցները</option>{hks.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ընդհանուր առաջադրանքներ" value={all.length} icon="broom" />
        <Kpi label="Ընթացքում" value={all.filter((t) => t.status === "in_progress").length} icon="clock" tone="info" />
        <Kpi label="Ավարտված" value={all.filter((t) => t.status === "done").length} sub={`${all.length ? Math.round((all.filter((t) => t.status === "done").length / all.length) * 100) : 0}% կատարված`} icon="check" tone="ok" />
        <Kpi label="Ժամանման համար պատրաստ" value={`${arrivalsReady.filter((t) => t.status === "done").length}/${arrivalsReady.length}`} sub="սենյակներ մինչև 14:00" icon="logIn" tone="warn" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {COLS.map((c) => (
          <div key={c.id} className="rounded-[var(--radius-card)] bg-black/[0.03] p-2.5">
            <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1 text-[13px] font-semibold">{c.label}<Badge>{sorted(c.id).length}</Badge></div>
            <div className="space-y-2">
              {sorted(c.id).map((t) => <TaskCard key={t.id} t={t} />)}
              {!sorted(c.id).length && <div className="rounded-xl border border-dashed border-line-2 py-6 text-center text-[12.5px] text-faint">Դատարկ է</div>}
            </div>
          </div>
        ))}
      </div>
      <Card className="mt-4">
        <CardHead title="Օրվա ամփոփում ըստ աշխատակիցների" icon="users" />
        <div className="grid gap-3 sm:grid-cols-3">
          {hks.map((s) => {
            const mine = all.filter((t) => t.assigneeId === s.id);
            const done = mine.filter((t) => t.status === "done").length;
            return <div key={s.id} className="rounded-xl border border-line p-3"><div className="flex items-center gap-2"><Avatar initials={s.initials} /><div><div className="text-[13.5px] font-medium">{s.name}</div><div className="text-[12px] text-muted">Հերթափոխ՝ {s.shift}</div></div></div><div className="mt-3 flex justify-between text-[12.5px]"><span className="text-muted">Կատարված</span><span className="tnum font-medium">{done}/{mine.length}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-ok" style={{ width: `${mine.length ? (done / mine.length) * 100 : 0}%` }} /></div></div>;
          })}
        </div>
      </Card>
      {!all.length && <div className="mt-4"><Empty title="Այս օրվա համար առաջադրանքներ չկան" /></div>}
      <LostFound />
    </>
  );

  function TaskCard({ t }: { t: HkTask }) {
    const res = t.reservationId ? state.reservations.find((r) => r.id === t.reservationId) : undefined;
    const room = state.rooms.find((r) => r.id === t.roomId);
    return (
      <div className={cn("rise-in rounded-xl border bg-surface p-3 shadow-[var(--shadow-card)]", t.priority === "urgent" && t.status !== "done" ? "border-bad/40" : "border-line")}>
        <div className="flex items-start justify-between gap-2">
          <div><div className="text-[16px] font-semibold leading-tight">Սենյակ {t.roomId}</div><div className="text-[12px] text-muted">{room ? roomType(room.typeId).name.hy : ""}</div></div>
          <Badge tone={PRI_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
        </div>
        <div className="mt-2 text-[13px]">{kindLabel[t.kind]}<span className="text-muted"> · {t.due === state.baseDate ? "այսօր" : dShort(t.due)}{t.dueTime ? `, մինչև ${t.dueTime}` : ""}</span></div>
        {t.note && <div className="mt-1.5 rounded-lg bg-warn-soft px-2 py-1 text-[12px] text-warn">{t.note}</div>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
          {t.auto && <Badge tone="violet"><Icon name="zap" size={11} />Ավտոմատ</Badge>}
          {res && <span>{res.code}</span>}
          <span>· {stamp(t.createdAt, state.baseDate)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Select value={t.assigneeId ?? ""} onChange={(e) => dispatch({ type: "hk.assign", taskId: t.id, assigneeId: e.target.value || null })} className="h-8 flex-1 text-[12.5px]"><option value="">Չնշանակված</option>{state.staff.filter((s) => s.role === "housekeeping").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          {t.status === "todo" && <Button size="sm" variant="primary" onClick={() => dispatch({ type: "hk.status", taskId: t.id, status: "in_progress" })}>Սկսել</Button>}
          {t.status === "in_progress" && <Button size="sm" variant="ok" icon="check" onClick={() => dispatch({ type: "hk.status", taskId: t.id, status: "done" })}>Ավարտել</Button>}
          {t.status === "done" && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "hk.status", taskId: t.id, status: "todo" })}>Վերաբացել</Button>}
        </div>
      </div>
    );
  }
}
