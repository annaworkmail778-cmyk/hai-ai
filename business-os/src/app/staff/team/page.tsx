"use client";
import { ReviewCard } from "@/components/staff/review";
import { Section, useMe } from "@/components/staff/shell";
import { Avatar, Badge } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { POSITION_LABEL } from "@/lib/hospitality-data";

export default function StaffTeam() {
  const { state } = useDemo();
  const { me, manager } = useMe();
  if (!manager) return <div className="rounded-2xl border border-line bg-surface p-8 text-center text-[14px] text-muted">Այս բաժինը հասանելի է միայն ղեկավարներին։<br />(Թույլտվությունները որոշվում են պաշտոնով)</div>;
  const top = me.position === "general_manager" || me.position === "owner";
  const team = state.staff.filter((s) => s.id !== me.id && (top || s.supervisorId === me.id || s.dept === me.dept));
  const ids = new Set(team.map((s) => s.id));
  const pending = state.enrollments.filter((e) => e.status === "submitted" && ids.has(e.employeeId));
  const today = state.baseDate;
  return (
    <>
      <h1 className="mb-4 text-[22px] font-semibold">Իմ թիմը</h1>
      <Section title={`Սպասում են Ձեր ստուգմանը (${pending.length})`}>
        {pending.length === 0 ? <div className="rounded-xl border border-line bg-surface p-4 text-center text-[13px] text-muted">Ստուգման սպասող մոդուլներ չկան</div> : <div className="space-y-3">{pending.map((e) => <ReviewCard key={e.id} e={e} />)}</div>}
      </Section>
      <Section title="Թիմի կարգավիճակ">
        <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
          {team.map((s) => {
            const enr = state.enrollments.filter((e) => e.employeeId === s.id);
            const appr = enr.filter((e) => e.status === "approved").length;
            const open = state.hkTasks.filter((t) => t.assigneeId === s.id && t.status !== "done" && t.due <= today).length + state.services.filter((x) => x.assigneeId === s.id && !["done", "cancelled"].includes(x.status)).length + state.staffTasks.filter((t) => t.assigneeId === s.id && t.status !== "done").length;
            const overdue = state.hkTasks.filter((t) => t.assigneeId === s.id && t.status !== "done" && t.due < today).length + state.staffTasks.filter((t) => t.assigneeId === s.id && t.status !== "done" && t.due < today).length;
            return (
              <li key={s.id} className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-0">
                <Avatar initials={s.initials} size={32} />
                <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">{s.name}{!s.active && <span className="text-muted"> · ապաակտիվ</span>}</div><div className="text-[12px] text-muted">{POSITION_LABEL[s.position]} · {s.shift}</div></div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={appr === enr.length ? "ok" : "info"}>Ուսուցում {appr}/{enr.length}</Badge>
                  <span className="text-[11.5px] text-muted">{open} գործ{overdue ? <b className="text-bad"> · {overdue} ժամկետանց</b> : ""}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
