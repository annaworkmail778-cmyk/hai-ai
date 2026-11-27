"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section, useMe } from "@/components/staff/shell";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Button, cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { ago, amd, PRIORITY_LABEL, time } from "@/lib/format";
import { DEPT_LABEL, SERVICE_META } from "@/lib/hospitality-data";
import type { Priority } from "@/lib/types";

const HK_KIND = { checkout: "Ելքից հետո մաքրում", arrival_prep: "Ժամանման պատրաստում", stayover: "Ընթացիկ մաքրում", inspection: "Ստուգում" } as const;
const PRI_TONE = { low: "neutral", normal: "info", high: "warn", urgent: "bad" } as const;
const RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

type Item = { key: string; icon: IconName; title: string; sub: string; priority: Priority; overdue?: boolean; status: string; actions: { label: string; primary?: boolean; run: () => void }[]; thread?: { kind: "service"; id: string; name: string } };

export default function StaffToday() {
  const { state, dispatch, actor } = useDemo();
  const { me, can, manager } = useMe();
  const router = useRouter();
  const today = state.baseDate;
  const items: Item[] = [];

  if (can("housekeeping")) for (const t of state.hkTasks.filter((x) => x.status !== "done" && x.due <= today && (x.assigneeId === actor || (manager && !x.assigneeId)))) {
    items.push({ key: t.id, icon: "broom", title: `${HK_KIND[t.kind]} · սենյակ ${t.roomId}`, sub: `${t.dueTime ? `մինչև ${t.dueTime} · ` : ""}${t.assigneeId ? "" : "չնշանակված · "}${t.note ?? ""}`, priority: t.priority, overdue: t.due < today, status: t.status,
      actions: [...(!t.assigneeId ? [{ label: "Վերցնել", run: () => dispatch({ type: "hk.assign", taskId: t.id, assigneeId: actor }) }] : []), t.status === "todo" ? { label: "Սկսել", run: () => dispatch({ type: "hk.status", taskId: t.id, status: "in_progress" }) } : { label: "Ավարտել", primary: true, run: () => dispatch({ type: "hk.status", taskId: t.id, status: "done" }) }] });
  }
  if (can("requests") || me.dept === "housekeeping") for (const s of state.services.filter((x) => (x.status === "new" || x.status === "assigned" || x.status === "in_progress") && (x.assigneeId === actor || (!x.assigneeId && (x.dept === me.dept || manager))))) {
    items.push({ key: s.id, icon: SERVICE_META[s.type].icon as IconName, title: `${SERVICE_META[s.type].staffLabel}${s.roomId ? ` · սենյակ ${s.roomId}` : s.point ? ` · ${s.point}` : ""}`, sub: `${s.code} · ${DEPT_LABEL[s.dept]} · ${ago(s.createdAt)}${s.when ? ` · ժամը ${s.when}` : ""}${s.note ? ` · «${s.note}»` : ""}`, priority: s.priority, status: s.status, thread: { kind: "service", id: s.id, name: `${s.code} ${SERVICE_META[s.type].staffLabel}` },
      actions: [...(!s.assigneeId ? [{ label: "Վերցնել", run: () => dispatch({ type: "service.assign", target: s.id, assigneeId: actor }) }] : []), s.status !== "in_progress" ? { label: "Սկսել", run: () => { if (!s.assigneeId) dispatch({ type: "service.assign", target: s.id, assigneeId: actor }); dispatch({ type: "service.status", target: s.id, status: "in_progress" }); } } : { label: "Կատարված է", primary: true, run: () => dispatch({ type: "service.status", target: s.id, status: "done" }) }] });
  }
  for (const m of state.maint.filter((x) => x.status !== "resolved" && (x.assigneeId === actor || (me.dept === "maintenance" && !x.assigneeId)))) {
    items.push({ key: m.id, icon: "wrench", title: `${m.title}${m.roomId ? ` · սենյակ ${m.roomId}` : ""}`, sub: `${m.area} · ${ago(m.createdAt)}${m.outOfOrder ? " · վաճառքից հանված" : ""}`, priority: m.priority, status: m.status,
      actions: [...(!m.assigneeId ? [{ label: "Վերցնել", run: () => dispatch({ type: "maint.assign", target: m.id, assigneeId: actor }) }] : []), m.status === "open" ? { label: "Սկսել", run: () => dispatch({ type: "maint.status", target: m.id, status: "in_progress" }) } : { label: "Լուծված է", primary: true, run: () => dispatch({ type: "maint.status", target: m.id, status: "resolved" }) }] });
  }
  for (const t of state.staffTasks.filter((x) => x.status !== "done" && x.assigneeId === actor)) {
    items.push({ key: t.id, icon: "tasks", title: t.title, sub: `${t.detail ?? ""}${t.due < today ? " · ժամկետանց" : ""}`, priority: t.priority, overdue: t.due < today, status: t.status,
      actions: [t.status === "todo" ? { label: "Սկսել", run: () => dispatch({ type: "staffTask.status", target: t.id, status: "in_progress" }) } : { label: "Ավարտել", primary: true, run: () => dispatch({ type: "staffTask.status", target: t.id, status: "done" }) }] });
  }
  items.sort((a, b) => Number(!!b.overdue) - Number(!!a.overdue) || RANK[a.priority] - RANK[b.priority]);

  const orders = can("orders") ? state.orders.filter((o) => ["submitted", "accepted", "preparing", "ready", "out_for_delivery"].includes(o.status)) : [];
  const enr = state.enrollments.filter((e) => e.employeeId === actor && e.status !== "approved");
  const handover = state.messages.filter((m) => m.handover && state.channels.find((c) => c.id === m.channelId)?.dept === me.dept).slice(-1)[0];
  const arrivals = can("reservations") ? state.reservations.filter((r) => r.checkIn === today && r.status === "confirmed") : [];
  const departures = can("reservations") ? state.reservations.filter((r) => r.checkOut === today && r.status === "checked_in") : [];
  const openThread = (t: NonNullable<Item["thread"]>) => {
    const id = `task-${t.id}`;
    if (!state.channels.some((c) => c.id === id)) {
      const sr = state.services.find((x) => x.id === t.id);
      const members = [...new Set([actor, sr?.assigneeId, me.supervisorId].filter(Boolean) as string[])];
      dispatch({ type: "channel.open", channel: { id, kind: "task", name: t.name, members, ref: { kind: "service", id: t.id } } });
    }
    router.push(`/staff/messages?c=${id}`);
  };

  return (
    <>
      {enr.length > 0 && (
        <Link href="/staff/learn" className="mb-4 flex items-center gap-3 rounded-2xl bg-ink p-4 text-white">
          <Icon name="star" size={22} className="text-signal" />
          <div className="min-w-0 flex-1"><div className="text-[14.5px] font-semibold">Ձեր ուսուցման ծրագիրը</div><div className="text-[12.5px] text-white/70">{enr.map((e) => `${state.training.find((m) => m.id === e.moduleId)?.title} · ${e.status === "submitted" ? "ստուգման մեջ" : e.status === "changes_requested" ? "պահանջվում են ուղղումներ" : `${e.done.length}/${state.training.find((m) => m.id === e.moduleId)?.steps.length}`}`).join(" · ")}</div></div>
          <Icon name="chevron" size={18} />
        </Link>
      )}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat label="Իմ գործերը" value={items.length} />
        <Stat label="Ժամկետանց" value={items.filter((i) => i.overdue).length} tone={items.some((i) => i.overdue) ? "bad" : undefined} />
        <Stat label="Շտապ" value={items.filter((i) => i.priority === "urgent" || i.priority === "high").length} tone="warn" />
      </div>
      {handover && <Section title="Փոխանցում նախորդ հերթափոխից"><div className="rounded-xl border border-info/30 bg-info-soft/50 p-3.5 text-[13.5px]"><div>{handover.text}</div><div className="mt-1 text-[12px] text-muted">{state.staff.find((s) => s.id === handover.authorId)?.name} · {time(handover.at)}</div></div></Section>}
      <Section title="Իմ գործերը այսօր">
        {items.length === 0 ? <div className="rounded-xl border border-line bg-surface p-6 text-center text-[13.5px] text-muted">Ամեն ինչ արված է 👌</div> : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.key} className={cn("rounded-2xl border bg-surface p-3.5", i.overdue ? "border-bad/40" : "border-line")}>
                <div className="flex items-start gap-3">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", i.status === "in_progress" ? "bg-info-soft text-info" : "bg-paper")}><Icon name={i.icon} size={19} /></span>
                  <div className="min-w-0 flex-1"><div className="text-[14.5px] font-semibold leading-snug">{i.title}</div><div className="text-[12.5px] text-muted">{i.sub}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">{i.overdue && <Badge tone="bad">Ժամկետանց</Badge>}<Badge tone={PRI_TONE[i.priority]}>{PRIORITY_LABEL[i.priority]}</Badge>{i.status === "in_progress" && <Badge tone="info" dot>Ընթացքում</Badge>}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {i.actions.map((a) => <Button key={a.label} size="sm" variant={a.primary ? "primary" : "secondary"} className="h-10 flex-1" onClick={a.run}>{a.label}</Button>)}
                  {i.thread && <Button size="sm" variant="ghost" icon="message" className="h-10" onClick={() => openThread(i.thread!)} aria-label="Քննարկել" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      {can("orders") && (
        <Section title="Ռեստորանի պատվերներ" right={me.dept === "kitchen" || manager ? <Link href="/kds" className="text-[12.5px] font-semibold text-info">Բացել KDS</Link> : undefined}>
          {orders.length === 0 ? <div className="rounded-xl border border-line bg-surface p-4 text-center text-[13px] text-muted">Ակտիվ պատվերներ չկան</div> : (
            <ul className="space-y-2">{orders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">{o.code} · {o.type === "room_service" ? `Սենյակ ${o.roomId}` : o.type === "dine_in" ? `Սեղան ${o.tableId?.replace("T", "")}` : `Վերցնել ${o.pickupTime ?? ""}`}</div><div className="truncate text-[12.5px] text-muted">{o.items.map((it) => `${it.qty}× ${state.menu.items.find((m) => m.id === it.itemId)?.name.hy}`).join(", ")} · {amd(o.total)}</div></div>
                {o.status === "ready" && o.type !== "room_service" ? <Button size="sm" variant="primary" onClick={() => dispatch({ type: "order.status", target: o.id, status: "completed" })}>Մատուցված է</Button>
                  : o.status === "ready" ? <Button size="sm" variant="primary" onClick={() => dispatch({ type: "order.status", target: o.id, status: "out_for_delivery" })}>Տանել սենյակ</Button>
                  : o.status === "out_for_delivery" ? <Button size="sm" variant="primary" onClick={() => dispatch({ type: "order.status", target: o.id, status: "completed" })}>Հանձնված է</Button>
                  : <Badge tone={o.status === "submitted" ? "warn" : "info"} dot>{({ submitted: "Նոր", accepted: "Ընդունված", preparing: "Պատրաստվում է" } as Record<string, string>)[o.status]}</Badge>}
              </li>))}
            </ul>
          )}
        </Section>
      )}
      {can("reservations") && (
        <Section title="Ժամանումներ և մեկնումներ այսօր">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/reservations" className="rounded-2xl border border-line bg-surface p-3.5"><div className="tnum text-[22px] font-semibold">{arrivals.length}</div><div className="text-[12.5px] text-muted">ժամանում</div></Link>
            <Link href="/admin/reservations" className="rounded-2xl border border-line bg-surface p-3.5"><div className="tnum text-[22px] font-semibold">{departures.length}</div><div className="text-[12.5px] text-muted">մեկնում</div></Link>
          </div>
        </Section>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" | "warn" }) {
  return <div className="rounded-2xl border border-line bg-surface p-3"><div className={cn("tnum text-[22px] font-semibold", tone === "bad" && value ? "text-bad" : tone === "warn" && value ? "text-warn" : "")}>{value}</div><div className="text-[12px] text-muted">{label}</div></div>;
}
