"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { Qr } from "@/components/present/qr";
import { Badge, Button, Card, CardHead, cn, Drawer, Field, Kpi, Select, Tabs } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { ago, PRIORITY_LABEL, stamp } from "@/lib/format";
import { DEPT_LABEL, SERVICE_META } from "@/lib/hospitality-data";
import type { Dept, ServiceStatus } from "@/lib/types";

const ST: Record<ServiceStatus, [string, "warn" | "info" | "ok" | "neutral" | "bad"]> = { new: ["Նոր", "warn"], assigned: ["Նշանակված", "info"], in_progress: ["Ընթացքում", "info"], done: ["Կատարված", "ok"], cancelled: ["Չեղարկված", "neutral"] };
const PRI_TONE = { low: "neutral", normal: "info", high: "warn", urgent: "bad" } as const;

export default function Requests() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"open" | "done">("open");
  const [dept, setDept] = useState<Dept | "all">("all");
  const [cur, setCur] = useState<string | null>(null);
  const [qr, setQr] = useState(false);
  const open = state.services.filter((s) => s.status !== "done" && s.status !== "cancelled");
  const done = state.services.filter((s) => s.status === "done" || s.status === "cancelled");
  const list = (tab === "open" ? open : done).filter((s) => dept === "all" || s.dept === dept).slice(0, 120);
  const sr = state.services.find((s) => s.id === cur);
  const finished = state.services.filter((s) => s.status === "done");
  const doneAt = (s: (typeof finished)[number]) => s.history.find((h) => h.text === "Կատարված է")?.at;
  const durs = finished.map((s) => { const d = doneAt(s); return d ? (d - s.createdAt) / 60000 : null; }).filter((x): x is number => x !== null && x > 0);
  const avg = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : 0;
  const name = (id: string | null) => state.staff.find((s) => s.id === id)?.name ?? "Չնշանակված";
  const depts = [...new Set(state.services.map((s) => s.dept))];
  return (
    <>
      <PageTitle title="Հյուրերի հարցումներ" sub="QR կոդերից եկող հարցումները ավտոմատ ուղղվում են համապատասխան բաժին" right={<Button icon="qr" onClick={() => setQr(true)}>QR կոդեր</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Նոր (չնշանակված)" value={open.filter((s) => s.status === "new").length} icon="bell" tone="warn" />
        <Kpi label="Ընթացքում" value={open.filter((s) => s.status !== "new").length} icon="tasks" />
        <Kpi label="Կատարված այսօր" value={finished.filter((s) => stamp(s.createdAt, state.baseDate).startsWith("Այսօր")).length} icon="check" tone="ok" />
        <Kpi label="Միջին կատարման ժամանակ" value={`${avg} ր`} sub={`${durs.length} կատարված հարցման հիման վրա`} icon="clock" />
      </div>
      <div className="my-4 flex flex-wrap items-center gap-3">
        <Tabs className="w-fit" value={tab} onChange={setTab} items={[{ id: "open", label: "Ակտիվ", count: open.length }, { id: "done", label: "Պատմություն", count: done.length }]} />
        <Select className="max-w-56" value={dept} onChange={(e) => setDept(e.target.value as Dept | "all")}><option value="all">Բոլոր բաժինները</option>{depts.map((d) => <option key={d} value={d}>{DEPT_LABEL[d]}</option>)}</Select>
      </div>
      <Card pad={false}>
        {list.length === 0 ? <div className="p-10 text-center text-sm text-muted">Հարցումներ չկան</div> : (
          <ul className="divide-y divide-line">
            {list.map((s) => (
              <li key={s.id}><button onClick={() => setCur(s.id)} className={cn("flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left hover:bg-paper", s.status === "new" && "bg-warn-soft/40")}>
                <span className="grid size-10 place-items-center rounded-xl bg-paper"><Icon name={SERVICE_META[s.type].icon as IconName} size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium">{SERVICE_META[s.type].staffLabel}{s.roomId ? ` · սենյակ ${s.roomId}` : s.point ? ` · ${s.point}` : ""}</div>
                  <div className="text-[12.5px] text-muted">{s.code} · {DEPT_LABEL[s.dept]} · {ago(s.createdAt)}{s.when ? ` · ժամը ${s.when}` : ""}{s.note ? ` · «${s.note}»` : ""}</div>
                </div>
                <Badge tone={PRI_TONE[s.priority]}>{PRIORITY_LABEL[s.priority]}</Badge>
                <span className="w-32 truncate text-[12.5px] text-ink-2">{name(s.assigneeId)}</span>
                <Badge tone={ST[s.status][1]} dot>{ST[s.status][0]}</Badge>
              </button></li>
            ))}
          </ul>
        )}
      </Card>
      <Drawer open={!!sr} onClose={() => setCur(null)} title={sr ? SERVICE_META[sr.type].staffLabel : ""} sub={sr ? `${sr.code} · ${sr.roomId ? `սենյակ ${sr.roomId}` : sr.point ?? ""} · ${DEPT_LABEL[sr.dept]}` : ""}
        footer={sr && sr.status !== "done" && sr.status !== "cancelled" ? <div className="flex flex-wrap gap-2">
          {sr.status !== "in_progress" && <Button onClick={() => dispatch({ type: "service.status", target: sr.id, status: "in_progress" })}>Սկսել</Button>}
          <Button variant="primary" icon="check" onClick={() => dispatch({ type: "service.status", target: sr.id, status: "done" })}>Կատարված է</Button>
          <Button variant="ghost" onClick={() => dispatch({ type: "service.status", target: sr.id, status: "cancelled" })}>Չեղարկել</Button>
        </div> : undefined}>
        {sr && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><Badge tone={ST[sr.status][1]} dot>{ST[sr.status][0]}</Badge><Badge tone={PRI_TONE[sr.priority]}>{PRIORITY_LABEL[sr.priority]}</Badge></div>
            {sr.note && <p className="rounded-xl bg-paper p-3 text-[14px]">«{sr.note}»</p>}
            {sr.status !== "done" && sr.status !== "cancelled" && (
              <Field label="Պատասխանատու">
                <Select value={sr.assigneeId ?? ""} onChange={(e) => dispatch({ type: "service.assign", target: sr.id, assigneeId: e.target.value || null })}>
                  <option value="">Չնշանակված</option>
                  {state.staff.filter((x) => x.active).sort((a, b) => Number(b.dept === sr.dept) - Number(a.dept === sr.dept)).map((x) => <option key={x.id} value={x.id}>{x.name} · {DEPT_LABEL[x.dept]}</option>)}
                </Select>
              </Field>
            )}
            <div><div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-faint">Պատմություն</div>
              <ol className="space-y-2 border-l border-line pl-4 text-[13px]">{sr.history.map((h, i) => <li key={i}><span className="font-medium">{h.text}</span><span className="text-muted"> · {h.by} · {stamp(h.at, state.baseDate)}</span></li>)}</ol>
            </div>
            <p className="text-[12px] text-muted">Հյուրը տեսնում է կարգավիճակը իր հեռախոսում իրական ժամանակում։ Հյուրի տվյալները QR կոդում չեն պահվում։</p>
          </div>
        )}
      </Drawer>
      <Drawer open={qr} onClose={() => setQr(false)} title="Ցուցադրական QR կոդեր" sub="Տպելու համար՝ սենյակներ, սեղաններ, սպա">
        <div className="space-y-4">
          <p className="text-[13px] text-muted">Սենյակի QR-ը պարունակում է միայն սենյակի համարը։ Հյուրը նախ հաստատում է իր կեցությունը, ապա տեսնում ծառայությունները։ Արտադրական տարբերակում QR-ը պարունակում է ստորագրված, պարբերաբար փոխվող token (տե՛ս տվյալների ճարտարապետության փաստաթուղթը)։</p>
          {state.reservations.filter((r) => r.status === "checked_in" && r.roomId).slice(0, 3).map((r) => <QrRow key={r.id} label={`Սենյակ ${r.roomId}`} path={`/q/room/${r.roomId}`} />)}
          <QrRow label="Սեղան 3" path="/q/table/T3" />
          <QrRow label="Սպա" path="/q/point/spa" />
        </div>
      </Drawer>
    </>
  );
}

function QrRow({ label, path }: { label: string; path: string }) {
  const url = typeof window !== "undefined" ? `${location.origin}${path}` : path;
  return (
    <Card>
      <CardHead title={label} sub={<a className="text-info underline" href={path} target="_blank" rel="noreferrer">{path}</a>} />
      <div className="mt-3 w-36"><Qr value={url} /></div>
    </Card>
  );
}
