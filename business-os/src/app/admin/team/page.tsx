"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { ReviewCard } from "@/components/staff/review";
import { Avatar, Badge, Button, Card, CardHead, cn, Field, Input, Kpi, Modal, Select, Tabs, Textarea, Toggle } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { DEPT_LABEL, PERMISSIONS, POSITION_DEPT, POSITION_LABEL, type StaffModule } from "@/lib/hospitality-data";
import type { Dept, Position } from "@/lib/types";

const MOD_LABEL: Record<StaffModule, string> = { today: "Այսօր", requests: "Հյուրերի հարցումներ", housekeeping: "Մաքրություն", orders: "Պատվերներ", reservations: "Ամրագրումներ", messages: "Հաղորդագրություններ", learn: "Ուսուցում", team: "Թիմի կառավարում" };
const ENR = { in_progress: ["Ընթացքում", "info"], submitted: ["Ստուգման", "warn"], approved: ["Հաստատված", "ok"], changes_requested: ["Ուղղումներ", "bad"] } as const;

export default function Team() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"people" | "onboarding" | "roles" | "modules">("people");
  const [add, setAdd] = useState(false);
  const [mod, setMod] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", position: "waiter" as Position, supervisorId: "s-tatev" });
  const [mf, setMf] = useState({ title: "", dept: "all" as Dept | "all", lesson: "", checklist: "" });
  const pending = state.enrollments.filter((e) => e.status === "submitted");
  const enrolled = new Set(state.enrollments.map((e) => e.employeeId));
  const fullyDone = [...enrolled].filter((id) => state.enrollments.filter((e) => e.employeeId === id).every((e) => e.status === "approved")).length;
  return (
    <>
      <PageTitle title="Թիմ, դերեր և ուսուցում" sub="Աշխատակիցներ, բաժիններ, թույլտվություններ և onboarding" right={<Button variant="primary" icon="plus" onClick={() => setAdd(true)}>Նոր աշխատակից</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ակտիվ աշխատակիցներ" value={state.staff.filter((s) => s.active).length} icon="users" />
        <Kpi label="Բաժիններ" value={new Set(state.staff.map((s) => s.dept)).size} icon="home" />
        <Kpi label="Onboarding-ը ավարտած" value={`${fullyDone}/${enrolled.size}`} sub="բոլոր մոդուլները հաստատված" icon="star" tone="ok" />
        <Kpi label="Սպասում են ստուգման" value={pending.length} icon="bell" tone={pending.length ? "warn" : undefined} onClick={() => setTab("onboarding")} />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "people", label: "Աշխատակիցներ" }, { id: "onboarding", label: "Onboarding", count: pending.length }, { id: "roles", label: "Թույլտվություններ" }, { id: "modules", label: "Ուսուցման մոդուլներ" }]} />

      {tab === "people" && (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {state.staff.map((s) => {
              const enr = state.enrollments.filter((e) => e.employeeId === s.id);
              return (
                <li key={s.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !s.active && "opacity-55")}>
                  <Avatar initials={s.initials} />
                  <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">{s.name}</div><div className="text-[12.5px] text-muted">{POSITION_LABEL[s.position]} · {DEPT_LABEL[s.dept]} · ղեկավար՝ {state.staff.find((x) => x.id === s.supervisorId)?.name ?? "—"}</div></div>
                  <span className="w-28 text-[12.5px] text-muted">{s.shift}</span>
                  <Badge tone={enr.every((e) => e.status === "approved") ? "ok" : "info"}>Ուսուցում {enr.filter((e) => e.status === "approved").length}/{enr.length}</Badge>
                  <Toggle on={s.active} onChange={(v) => dispatch({ type: "employee.toggle", target: s.id, active: v })} label={s.active ? "Ակտիվ" : "Ապաակտիվ"} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {tab === "onboarding" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-muted">Սպասում են ստուգման</h3>
            {pending.length === 0 ? <Card><p className="text-center text-sm text-muted">Չկան</p></Card> : pending.map((e) => <ReviewCard key={e.id} e={e} />)}
          </div>
          <Card pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Առաջընթաց ըստ աշխատակցի" /></div>
            <ul className="divide-y divide-line">
              {state.staff.filter((s) => enrolled.has(s.id)).map((s) => (
                <li key={s.id} className="px-4 py-3">
                  <div className="mb-1.5 text-[13.5px] font-medium">{s.name} <span className="font-normal text-muted">· {POSITION_LABEL[s.position]}</span></div>
                  <div className="flex flex-wrap gap-1.5">{state.enrollments.filter((e) => e.employeeId === s.id).map((e) => { const m = state.training.find((x) => x.id === e.moduleId)!; return <Badge key={e.id} tone={ENR[e.status][1]}>{m.title} · {e.done.length}/{m.steps.length} · {ENR[e.status][0]}</Badge>; })}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "roles" && (
        <Card pad={false} className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead><tr className="border-b border-line text-left text-[12px] text-muted"><th className="px-4 py-2.5 font-medium">Պաշտոն</th>{(Object.keys(MOD_LABEL) as StaffModule[]).map((m) => <th key={m} className="px-2 py-2.5 text-center font-medium">{MOD_LABEL[m]}</th>)}</tr></thead>
            <tbody>{(Object.keys(PERMISSIONS) as Position[]).map((p) => (
              <tr key={p} className="border-b border-line last:border-0"><td className="px-4 py-2.5 font-medium">{POSITION_LABEL[p]}<span className="block text-[11.5px] font-normal text-muted">{DEPT_LABEL[POSITION_DEPT[p]]}</span></td>
                {(Object.keys(MOD_LABEL) as StaffModule[]).map((m) => <td key={m} className="px-2 py-2.5 text-center">{PERMISSIONS[p].includes(m) ? <Icon name="check" size={16} className="inline text-ok" /> : <span className="text-faint">—</span>}</td>)}
              </tr>))}
            </tbody>
          </table>
          <p className="border-t border-line px-4 py-3 text-[12px] text-muted">Ցուցադրական տարբերակում թույլտվությունները կիրառվում են ինտերֆեյսում (աշխատակցի հավելվածի նավիգացիա և «Թիմ» բաժին)։ Արտադրական տարբերակում դրանք պետք է ստուգվեն սերվերում (RLS / API)։</p>
        </Card>
      )}

      {tab === "modules" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button icon="plus" onClick={() => setMod(true)}>Նոր մոդուլ</Button></div>
          {state.training.map((m) => (
            <Card key={m.id}>
              <CardHead title={<>{m.title}{m.custom && <Badge tone="info" className="ml-2">Ստեղծված ղեկավարի կողմից</Badge>}</>} sub={`${m.dept === "all" ? "Բոլոր բաժինները" : DEPT_LABEL[m.dept]} · ${m.positions === "all" ? "բոլոր պաշտոնները" : m.positions.map((p) => POSITION_LABEL[p]).join(", ")} · ~${m.minutes} ր`} />
              <ol className="mt-3 flex flex-wrap gap-1.5 text-[12.5px]">{m.steps.map((s, i) => <li key={s.id} className="rounded-lg bg-paper px-2.5 py-1">{i + 1}. {s.title} <span className="text-muted">({{ lesson: "դաս", checklist: "ստուգաթերթ", quiz: "թեստ" }[s.kind]})</span></li>)}</ol>
              <div className="mt-2 text-[12px] text-muted">Նշանակված՝ {state.enrollments.filter((e) => e.moduleId === m.id).length} աշխատակցի</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={add} onClose={() => setAdd(false)} title="Նոր աշխատակից" footer={<><Button variant="ghost" onClick={() => setAdd(false)}>Չեղարկել</Button><Button variant="primary" disabled={!f.name.trim()} onClick={() => { dispatch({ type: "employee.create", name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), dept: POSITION_DEPT[f.position], position: f.position, supervisorId: f.supervisorId || null }); setAdd(false); setF({ ...f, name: "", phone: "", email: "" }); setTab("onboarding"); }}>Ավելացնել և նշանակել onboarding</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Անուն ազգանուն" className="sm:col-span-2"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Հեռախոս"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+374 …" /></Field>
          <Field label="Էլ․ փոստ"><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Պաշտոն"><Select value={f.position} onChange={(e) => setF({ ...f, position: e.target.value as Position })}>{(Object.keys(POSITION_LABEL) as Position[]).filter((p) => p !== "owner").map((p) => <option key={p} value={p}>{POSITION_LABEL[p]} · {DEPT_LABEL[POSITION_DEPT[p]]}</option>)}</Select></Field>
          <Field label="Ղեկավար"><Select value={f.supervisorId} onChange={(e) => setF({ ...f, supervisorId: e.target.value })}>{state.staff.filter((s) => PERMISSIONS[s.position].includes("team")).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          <p className="text-[12.5px] text-muted sm:col-span-2">Համակարգը ավտոմատ կնշանակի «Բարի գալուստ» և պաշտոնին համապատասխան մոդուլները, կստեղծի անձնական զրույց ղեկավարի հետ և ողջույնի հաղորդագրություն։ Հաշիվը ցուցադրական է (առանց գաղտնաբառի)։</p>
        </div>
      </Modal>

      <Modal open={mod} onClose={() => setMod(false)} title="Նոր ուսուցման մոդուլ" footer={<><Button variant="ghost" onClick={() => setMod(false)}>Չեղարկել</Button><Button variant="primary" disabled={!mf.title.trim() || !mf.lesson.trim()} onClick={() => { dispatch({ type: "training.module", title: mf.title.trim(), dept: mf.dept, positions: "all", lesson: mf.lesson.trim(), checklist: mf.checklist.split("\n").map((x) => x.trim()).filter(Boolean) }); setMod(false); setMf({ title: "", dept: "all", lesson: "", checklist: "" }); }}>Ստեղծել և նշանակել</Button></>}>
        <div className="grid gap-3">
          <Field label="Վերնագիր"><Input value={mf.title} onChange={(e) => setMf({ ...mf, title: e.target.value })} /></Field>
          <Field label="Բաժին"><Select value={mf.dept} onChange={(e) => setMf({ ...mf, dept: e.target.value as Dept | "all" })}><option value="all">Բոլորը</option>{(Object.keys(DEPT_LABEL) as Dept[]).map((d) => <option key={d} value={d}>{DEPT_LABEL[d]}</option>)}</Select></Field>
          <Field label="Դասի տեքստ"><Textarea value={mf.lesson} onChange={(e) => setMf({ ...mf, lesson: e.target.value })} /></Field>
          <Field label="Ստուգաթերթ (յուրաքանչյուր կետ նոր տողով)"><Textarea value={mf.checklist} onChange={(e) => setMf({ ...mf, checklist: e.target.value })} /></Field>
          <p className="text-[12.5px] text-muted">Մոդուլը կնշանակվի ընտրված բաժնի բոլոր ակտիվ աշխատակիցներին։</p>
        </div>
      </Modal>
    </>
  );
}
