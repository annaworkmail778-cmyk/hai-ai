"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { NewReservationModal, ReservationDrawer, SourceBadge, StatusBadge } from "@/components/admin/reservation";
import { PageTitle } from "@/components/admin/shell";
import { BarLine } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Avatar, Badge, Button, Card, CardHead, cn, Empty, Kpi } from "@/components/ui";
import { computeKpis, occupiedOn } from "@/lib/analytics";
import { useDemo } from "@/lib/client/demo-store";
import { addDays } from "@/lib/dates";
import { amd, amdShort, ago, dShort, pct, PRIORITY_LABEL, stamp, time } from "@/lib/format";
import { roomType } from "@/lib/hotel-data";
import { LIVE_LABEL, liveRooms, type LiveStatus } from "@/lib/rooms";

const LIVE_TONE: Record<LiveStatus, string> = {
  occupied: "bg-ink text-white", departing: "bg-ink-2 text-white ring-2 ring-warn", dirty: "bg-warn-soft text-warn ring-1 ring-warn/40", cleaning: "bg-info-soft text-info ring-1 ring-info/30",
  arriving: "bg-ok-soft text-ok ring-1 ring-ok/40", available: "bg-surface text-ink-2 ring-1 ring-line-2", ooo: "ooo-stripes text-muted ring-1 ring-line-2",
};

export default function Overview() {
  const { state, dispatch, actor } = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const [newRes, setNewRes] = useState(false);
  const today = state.baseDate;
  const me = state.staff.find((s) => s.id === actor);
  const rooms = useMemo(() => liveRooms(state), [state]);
  const occupied = occupiedOn(state, today).length;
  const avail = rooms.filter((r) => r.status === "available" || r.status === "arriving").length;
  const arrivals = state.reservations.filter((r) => r.checkIn === today && (r.status === "confirmed" || r.status === "checked_in"));
  const departures = state.reservations.filter((r) => r.checkOut === today && (r.status === "checked_in" || r.status === "checked_out") && r.roomId);
  const inquiries = state.reservations.filter((r) => r.status === "inquiry").sort((a, b) => a.createdAt - b.createdAt);
  const confirmedUpcoming = state.reservations.filter((r) => r.status === "confirmed" && r.checkIn >= today).length;
  const hkOpen = state.hkTasks.filter((t) => t.due === today && t.status !== "done");
  const stOpen = state.staffTasks.filter((t) => t.status !== "done" && t.due <= addDays(today, 1));
  const handoffs = state.conversations.filter((c) => c.status === "handoff");
  const urgentMaint = state.maint.filter((m) => m.status !== "resolved" && (m.priority === "urgent" || m.priority === "high"));
  const mtd = computeKpis(state, { from: today.slice(0, 8) + "01", to: addDays(today, 1), label: "" });
  const last14 = computeKpis(state, { from: addDays(today, -13), to: addDays(today, 1), label: "" });
  const autoToday = state.activity.filter((a) => a.automated).length + state.outbox.length;
  const recentAuto = state.outbox.slice(0, 3);

  return (
    <>
      <PageTitle
        title={`Բարի ${new Date().getHours() < 12 ? "լույս" : "օր"}, ${me?.name.split(" ")[0] ?? ""}`}
        sub="Այսօրվա գործողությունները մեկ էկրանում։ Թվերը թարմանում են յուրաքանչյուր գործողությունից հետո։"
        right={<><Link href="/admin/calendar"><Button icon="calendar">Օրացույց</Button></Link><Button variant="primary" icon="plus" onClick={() => setNewRes(true)}>Նոր ամրագրում</Button></>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Զբաղվածություն այսօր" value={pct(occupied / state.rooms.length)} sub={`${occupied} / ${state.rooms.length} սենյակ`} icon="bed" />
        <Kpi label="Ժամանումներ" value={arrivals.length} sub={`${arrivals.filter((a) => a.status === "checked_in").length} արդեն ժամանել են`} icon="logIn" tone="ok" />
        <Kpi label="Մեկնումներ" value={departures.length} sub={`${departures.filter((d) => d.status === "checked_out").length} արդեն մեկնել են`} icon="logOut" />
        <Kpi label="Սպասող հարցումներ" value={inquiries.length} sub={inquiries[0] ? `ամենահինը՝ ${ago(inquiries[0].createdAt)}` : "բոլորը մշակված են"} icon="bell" tone={inquiries.length ? "signal" : "ok"} />
        <Kpi label="Հաստատված առաջիկայում" value={confirmedUpcoming} sub="ապագա ամրագրումներ" icon="check" tone="info" />
        <Kpi label="Ազատ սենյակներ այսօր" value={avail} sub={`${rooms.filter((r) => r.status === "dirty" || r.status === "cleaning").length} մաքրման փուլում`} icon="door" />
        <Kpi label="Բաց առաջադրանքներ" value={hkOpen.length + stOpen.length} sub={`${hkOpen.length} մաքրություն · ${stOpen.length} այլ`} icon="tasks" tone="warn" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHead title="Ուշադրություն է պահանջում" sub="Ամենակարևորը՝ վերևում" icon="alert" right={<Badge tone={inquiries.length + handoffs.length ? "signal" : "ok"}>{inquiries.length + handoffs.length + urgentMaint.length}</Badge>} />
          <ul className="divide-y divide-line">
            {inquiries.map((r) => {
              const g = state.guests.find((x) => x.id === r.guestId);
              return (
                <li key={r.id} className="flash flex flex-wrap items-center gap-3 py-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-signal-soft text-signal"><Icon name={r.source === "assistant" ? "sparkles" : "bell"} size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">Նոր հարցում՝ {g?.firstName} {g?.lastName} · {roomType(r.typeId).name.hy}</div>
                    <div className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted"><span>{dShort(r.checkIn)}–{dShort(r.checkOut)} · {r.adults + r.children} հյուր · {amd(r.total)}</span><SourceBadge s={r.source} />{r.afterHours && <Badge tone="violet"><Icon name="moon" size={11} />{time(r.displayAt ?? r.createdAt)}</Badge>}</div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => setOpen(r.id)}>Դիտել և հաստատել</Button>
                </li>
              );
            })}
            {handoffs.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-lg bg-violet-soft text-violet"><Icon name="sparkles" size={17} /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-medium">Օգնականը փոխանցել է հարց. «{c.unanswered[c.unanswered.length - 1]}»</div><div className="text-[12.5px] text-muted">{c.guestName ?? "Հյուր"} · {stamp(c.displayAt ?? c.startedAt, today)}</div></div>
                <Link href={`/admin/assistant?open=${c.id}`}><Button size="sm">Պատասխանել</Button></Link>
              </li>
            ))}
            {urgentMaint.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-lg bg-bad-soft text-bad"><Icon name="wrench" size={17} /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-medium">{m.roomId ? `Սենյակ ${m.roomId}. ` : ""}{m.title}</div><div className="text-[12.5px] text-muted">{PRIORITY_LABEL[m.priority]} · {m.outOfOrder ? "սենյակը չի վաճառվում" : "սենյակը գործում է"}</div></div>
                <Link href="/admin/maintenance"><Button size="sm">Բացել</Button></Link>
              </li>
            ))}
            {!inquiries.length && !handoffs.length && !urgentMaint.length && <li className="py-2"><Empty title="Ամեն ինչ մշակված է" text="Նոր հարցումներ և փոխանցված հարցեր չկան" /></li>}
          </ul>
        </Card>

        <Card>
          <CardHead title="Եկամուտ" sub="Վերջին 14 օր · ցուցադրական տվյալներ" icon="chart" right={<Link href="/admin/analytics" className="text-[12.5px] font-medium text-info">Վերլուծություն</Link>} />
          <div className="mb-3 grid grid-cols-3 gap-3 text-[12.5px]">
            <div><div className="text-muted">Ամսվա եկամուտ</div><div className="tnum text-[18px] font-semibold">{amdShort(mtd.revenue)}</div></div>
            <div><div className="text-muted">ADR</div><div className="tnum text-[18px] font-semibold">{amdShort(mtd.adr)}</div></div>
            <div><div className="text-muted">Զբաղվածություն</div><div className="tnum text-[18px] font-semibold">{pct(mtd.occupancy)}</div></div>
          </div>
          <BarLine height={170} data={last14.daily.map((d) => ({ label: dShort(d.date).split(" ")[0], bar: d.revenue, line: d.occupancy, highlight: d.date === today }))} barLabel="Եկամուտ" lineLabel="Զբաղվածություն" fmtBar={amd} fmtLine={(x) => pct(x)} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Այսօրվա ժամանումները" sub={`${arrivals.length} հյուր`} icon="logIn" />
          <ul className="divide-y divide-line">
            {arrivals.map((r) => {
              const g = state.guests.find((x) => x.id === r.guestId);
              const prep = state.hkTasks.find((t) => t.reservationId === r.id && t.kind === "arrival_prep");
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper text-[13px] font-semibold">{r.roomId}</span>
                  <button onClick={() => setOpen(r.id)} className="min-w-0 flex-1 text-left"><div className="truncate text-[14px] font-medium">{g?.firstName} {g?.lastName}</div><div className="text-[12.5px] text-muted">{r.checkOut ? `մինչև ${dShort(r.checkOut)}` : ""} · {r.adults + r.children} հյուր · {prep ? (prep.status === "done" ? "սենյակը պատրաստ է" : "սենյակը պատրաստվում է") : "—"}</div></button>
                  {r.status === "confirmed" ? <Button size="sm" variant="ok" icon="logIn" onClick={() => dispatch({ type: "reservation.checkin", reservationId: r.id })}>Ժամանեց</Button> : <StatusBadge s={r.status} />}
                </li>
              );
            })}
            {!arrivals.length && <Empty title="Այսօր ժամանումներ չկան" />}
          </ul>
        </Card>
        <Card>
          <CardHead title="Այսօրվա մեկնումները" sub="Մեկնումը գրանցելիս մաքրության առաջադրանքը ստեղծվում է ավտոմատ" icon="logOut" />
          <ul className="divide-y divide-line">
            {departures.map((r) => {
              const g = state.guests.find((x) => x.id === r.guestId);
              const task = state.hkTasks.find((t) => t.reservationId === r.id && t.kind === "checkout");
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper text-[13px] font-semibold">{r.roomId}</span>
                  <button onClick={() => setOpen(r.id)} className="min-w-0 flex-1 text-left"><div className="truncate text-[14px] font-medium">{g?.firstName} {g?.lastName}</div><div className="text-[12.5px] text-muted">{task ? `մաքրություն՝ ${task.status === "done" ? "ավարտված" : task.status === "in_progress" ? "ընթացքում" : "սպասում է"}` : "դեռ հյուրանոցում է"}</div></button>
                  {r.status === "checked_in" ? <Button size="sm" variant="primary" icon="logOut" onClick={() => dispatch({ type: "reservation.checkout", reservationId: r.id })}>Մեկնեց</Button> : <StatusBadge s={r.status} />}
                </li>
              );
            })}
            {!departures.length && <Empty title="Այսօր մեկնումներ չկան" />}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHead title="Սենյակների կարգավիճակը հիմա" icon="bed" right={<Link href="/admin/rooms" className="text-[12.5px] font-medium text-info">Բոլոր սենյակները</Link>} />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {rooms.map((r) => <Link key={r.room.id} href={`/admin/rooms?open=${r.room.id}`} title={`${r.room.number} · ${LIVE_LABEL[r.status]}`} className={cn("flex aspect-square flex-col items-center justify-center rounded-xl text-center transition hover:scale-[1.04]", LIVE_TONE[r.status])}><span className="text-[14px] font-semibold">{r.room.number}</span><span className="mt-0.5 line-clamp-1 px-1 text-[9.5px] opacity-80">{LIVE_LABEL[r.status]}</span></Link>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-muted">{(Object.keys(LIVE_LABEL) as LiveStatus[]).map((s) => <span key={s} className="flex items-center gap-1.5"><span className={cn("size-3 rounded", LIVE_TONE[s])} />{LIVE_LABEL[s]} ({rooms.filter((r) => r.status === s).length})</span>)}</div>
        </Card>
        <Card>
          <CardHead title="Վերջին գործողություններ" icon="clock" right={<Badge tone="violet"><Icon name="zap" size={12} />{autoToday} ավտոմատ</Badge>} />
          <ul className="space-y-2.5">
            {state.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex gap-3 text-[13px]">
                <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg", a.automated ? "bg-violet-soft text-violet" : "bg-paper text-muted")}><Icon name={a.icon === "auto" ? "zap" : a.icon === "inquiry" ? "bell" : a.icon === "approve" ? "check" : a.icon === "maint" ? "wrench" : a.icon === "checkout" ? "logOut" : a.icon === "checkin" ? "logIn" : a.icon === "decline" ? "x" : "tasks"} size={14} /></span>
                <div className="min-w-0"><div className="leading-snug">{a.text}</div><div className="text-[12px] text-faint">{stamp(a.at, today)} · {a.by}</div></div>
              </li>
            ))}
          </ul>
          {recentAuto.length > 0 && <Link href="/admin/automations" className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-info">Պատրաստված հաղորդագրություններ ({state.outbox.length})<Icon name="chevron" size={14} /></Link>}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Մաքրություն այսօր" icon="broom" right={<Link href="/admin/housekeeping" className="text-[12.5px] font-medium text-info">Բացել</Link>} />
          <div className="space-y-2">
            {state.staff.filter((s) => s.role === "housekeeping").map((s) => {
              const mine = state.hkTasks.filter((t) => t.due === today && t.assigneeId === s.id);
              const done = mine.filter((t) => t.status === "done").length;
              return <div key={s.id} className="flex items-center gap-3"><Avatar initials={s.initials} /><div className="flex-1"><div className="flex justify-between text-[13px]"><span>{s.name}</span><span className="tnum text-muted">{done}/{mine.length}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-ok" style={{ width: `${mine.length ? (done / mine.length) * 100 : 0}%` }} /></div></div></div>;
            })}
          </div>
        </Card>
        <Card>
          <CardHead title="Վերջին ամրագրումները" icon="list" right={<Link href="/admin/reservations" className="text-[12.5px] font-medium text-info">Բոլորը</Link>} />
          <ul className="divide-y divide-line">
            {state.reservations.filter((r) => r.status !== "declined").slice(0, 5).map((r) => {
              const g = state.guests.find((x) => x.id === r.guestId);
              return <li key={r.id}><button onClick={() => setOpen(r.id)} className="flex w-full items-center gap-3 py-2.5 text-left"><div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-medium">{g?.firstName} {g?.lastName}</div><div className="text-[12px] text-muted">{roomType(r.typeId).name.hy} · {dShort(r.checkIn)}–{dShort(r.checkOut)}</div></div><SourceBadge s={r.source} /><StatusBadge s={r.status} /></button></li>;
            })}
          </ul>
        </Card>
      </div>
      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
      <NewReservationModal open={newRes} onClose={() => setNewRes(false)} />
    </>
  );
}
