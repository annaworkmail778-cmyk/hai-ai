"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, cn, Drawer, Field, Input, Kpi, Modal, Select, Tabs, Textarea, Toggle } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { ago, PRIORITY_LABEL, stamp } from "@/lib/format";
import type { MaintRequest, Priority } from "@/lib/types";

const PRI_TONE = { low: "neutral", normal: "info", high: "warn", urgent: "bad" } as const;
const ST: Record<MaintRequest["status"], [string, "bad" | "info" | "ok"]> = { open: ["Բաց", "bad"], in_progress: ["Ընթացքում", "info"], resolved: ["Լուծված", "ok"] };

export default function Maintenance() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [open, setOpen] = useState<string | null>(null);
  const [create, setCreate] = useState(false);
  const [f, setF] = useState({ roomId: "", area: "Սենյակ", title: "", description: "", priority: "normal" as Priority, outOfOrder: false });
  const active = state.maint.filter((m) => m.status !== "resolved");
  const history = state.maint.filter((m) => m.status === "resolved");
  const list = tab === "active" ? active : history;
  const resolved = history.filter((m) => m.resolvedAt);
  const avgH = resolved.length ? resolved.reduce((a, m) => a + (m.resolvedAt! - m.createdAt), 0) / resolved.length / 3600000 : 0;
  const cur = state.maint.find((m) => m.id === open);
  const staffName = (id: string | null) => state.staff.find((s) => s.id === id)?.name ?? "Չնշանակված";
  return (
    <>
      <PageTitle title="Տեխնիկական սպասարկում" sub="Հայտեր, առաջնահերթություններ, պատասխանատուներ և պատմություն" right={<Button variant="primary" icon="plus" onClick={() => setCreate(true)}>Նոր հայտ</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Բաց հայտեր" value={active.length} icon="wrench" tone="warn" />
        <Kpi label="Շտապ / բարձր" value={active.filter((m) => m.priority === "urgent" || m.priority === "high").length} icon="alert" tone="bad" />
        <Kpi label="Վաճառքից հանված սենյակներ" value={active.filter((m) => m.outOfOrder).length} icon="bed" />
        <Kpi label="Միջին լուծման ժամանակ" value={`${avgH.toFixed(1)} ժ`} icon="clock" tone="ok" />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "active", label: "Ակտիվ", count: active.length }, { id: "history", label: "Պատմություն", count: history.length }]} />
      <Card pad={false}>
        <ul className="divide-y divide-line">
          {list.map((m) => (
            <li key={m.id}><button onClick={() => setOpen(m.id)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left hover:bg-paper">
              <span className={cn("grid size-10 place-items-center rounded-xl text-[13px] font-semibold", m.outOfOrder && m.status !== "resolved" ? "bg-bad-soft text-bad" : "bg-paper")}>{m.roomId ?? <Icon name="home" size={16} />}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-medium">{m.title}</div><div className="truncate text-[12.5px] text-muted">{m.area} · {staffName(m.assigneeId)} · {ago(m.createdAt)}</div></div>
              <Badge tone={PRI_TONE[m.priority]}>{PRIORITY_LABEL[m.priority]}</Badge>
              <Badge tone={ST[m.status][1]} dot>{ST[m.status][0]}</Badge>
            </button></li>
          ))}
        </ul>
        {!list.length && <div className="p-8 text-center text-sm text-muted">Հայտեր չկան</div>}
      </Card>
      <Drawer open={!!cur} onClose={() => setOpen(null)} title={cur?.title ?? ""} sub={cur ? `${cur.roomId ? `Սենյակ ${cur.roomId} · ` : ""}${cur.area}` : ""}
        footer={cur && <div className="flex flex-wrap justify-end gap-2">{cur.status === "open" && <Button variant="primary" onClick={() => dispatch({ type: "maint.status", id: cur.id, status: "in_progress" })}>Սկսել աշխատանքը</Button>}{cur.status !== "resolved" ? <Button variant="ok" icon="check" onClick={() => dispatch({ type: "maint.status", id: cur.id, status: "resolved" })}>Նշել լուծված</Button> : <Button onClick={() => dispatch({ type: "maint.status", id: cur.id, status: "open" })}>Վերաբացել</Button>}</div>}>
        {cur && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap gap-2"><Badge tone={PRI_TONE[cur.priority]}>{PRIORITY_LABEL[cur.priority]}</Badge><Badge tone={ST[cur.status][1]} dot>{ST[cur.status][0]}</Badge>{cur.outOfOrder && <Badge tone="bad">Սենյակը վաճառքից հանված է</Badge>}</div>
            <p className="rounded-xl bg-paper p-3">{cur.description || "—"}</p>
            <Field label="Պատասխանատու"><Select value={cur.assigneeId ?? ""} onChange={(e) => dispatch({ type: "maint.assign", id: cur.id, assigneeId: e.target.value || null })}><option value="">Չնշանակված</option>{state.staff.filter((s) => s.role === "maintenance" || s.role === "manager").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            <div><div className="mb-2 font-semibold">Պատմություն</div><ol className="space-y-2 border-l border-line pl-4">{[...cur.log].reverse().map((l, i) => <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-ink-2" />{l.text}<span className="block text-[12px] text-faint">{stamp(l.at, state.baseDate)} · {l.by}</span></li>)}</ol></div>
          </div>
        )}
      </Drawer>
      <Modal open={create} onClose={() => setCreate(false)} title="Նոր տեխնիկական հայտ" footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Չեղարկել</Button><Button variant="primary" disabled={!f.title.trim()} onClick={() => { dispatch({ type: "maint.create", roomId: f.roomId || null, area: f.area, title: f.title, description: f.description, priority: f.priority, outOfOrder: f.outOfOrder && !!f.roomId }); setCreate(false); setF({ ...f, title: "", description: "" }); }}>Ստեղծել</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Սենյակ"><Select value={f.roomId} onChange={(e) => setF({ ...f, roomId: e.target.value })}><option value="">Ընդհանուր տարածք</option>{state.rooms.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}</Select></Field>
          <Field label="Տարածք"><Input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></Field>
          <Field label="Խնդիր" className="sm:col-span-2"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Նկարագրություն" className="sm:col-span-2"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Առաջնահերթություն"><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Priority })}>{(["low", "normal", "high", "urgent"] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</Select></Field>
          <label className="flex items-center gap-3 pt-5 text-[13px]"><Toggle on={f.outOfOrder} onChange={(v) => setF({ ...f, outOfOrder: v })} disabled={!f.roomId} />Հանել վաճառքից</label>
        </div>
      </Modal>
    </>
  );
}
