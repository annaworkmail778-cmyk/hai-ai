"use client";
import { useMemo, useState } from "react";
import { NewReservationModal, ReservationDrawer } from "@/components/admin/reservation";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, weekday } from "@/lib/dates";
import { HY_WD } from "@/lib/format";
import { ROOM_TYPES } from "@/lib/hotel-data";
import { outOfOrderRooms } from "@/lib/pricing";
import type { Reservation } from "@/lib/types";

const DAYS = 14;
const COL = 56;

export default function CalendarPage() {
  const { state } = useDemo();
  const [start, setStart] = useState(addDays(state.baseDate, -1));
  const [open, setOpen] = useState<string | null>(null);
  const [newRes, setNewRes] = useState<{ roomId: string; checkIn: string } | null>(null);
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
  const end = addDays(start, DAYS);
  const ooo = outOfOrderRooms(state);
  const guests = useMemo(() => new Map(state.guests.map((g) => [g.id, g])), [state.guests]);
  const visible = state.reservations.filter((r) => ["confirmed", "checked_in", "checked_out"].includes(r.status) && r.roomId && r.checkIn < end && r.checkOut > start);
  const inquiries = state.reservations.filter((r) => r.status === "inquiry" && r.checkIn < end && r.checkOut > start);
  const bar = (r: Reservation, row = false) => {
    const from = r.checkIn < start ? 0 : days.indexOf(r.checkIn);
    const to = r.checkOut > end ? DAYS : days.indexOf(r.checkOut);
    const g = guests.get(r.guestId);
    const tone = r.status === "inquiry" ? "inquiry-stripes text-warn ring-1 ring-warn/50 bg-warn-soft" : r.status === "checked_in" ? "bg-ok text-white" : r.status === "checked_out" ? "bg-line-2 text-ink-2" : "bg-ink text-white";
    return (
      <button key={r.id} onClick={() => setOpen(r.id)} title={`${g?.firstName} ${g?.lastName}`}
        className={cn("absolute top-1.5 flex h-[30px] items-center gap-1 overflow-hidden rounded-md px-2 text-[12px] font-medium shadow-sm transition hover:brightness-110", tone, row && "z-10")}
        style={{ left: from * COL + (r.checkIn < start ? 0 : COL / 2) + 2, width: Math.max(24, (to - from) * COL - (r.checkIn < start ? 0 : COL / 2) + (r.checkOut > end ? 0 : COL / 2) - 4) }}>
        {r.status === "inquiry" && <Icon name="bell" size={12} />}<span className="truncate">{g?.firstName} {g?.lastName?.[0] ?? ""}.</span>
      </button>
    );
  };
  return (
    <>
      <PageTitle title="Սենյակների օրացույց" sub="Ամրագրումները ըստ սենյակների։ Գծավոր տողերում՝ դեռ չհաստատված հարցումներ։"
        right={<><Button icon="chevronLeft" onClick={() => setStart(addDays(start, -7))}>Շաբաթ</Button><Button onClick={() => setStart(addDays(state.baseDate, -1))}>Այսօր</Button><Button iconRight="chevron" onClick={() => setStart(addDays(start, 7))}>Շաբաթ</Button></>} />
      <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-ink" />Հաստատված</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-ok" />Հյուրանոցում</span>
        <span className="flex items-center gap-1.5"><span className="inquiry-stripes h-3 w-5 rounded ring-1 ring-warn/50" />Հարցում (չհաստատված)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-line-2" />Մեկնած</span>
        <span className="flex items-center gap-1.5"><span className="ooo-stripes h-3 w-5 rounded" />Չի գործում</span>
        <span className="ml-auto">Սեղմեք դատարկ վանդակի վրա՝ նոր ամրագրման համար</span>
      </div>
      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ width: 132 + DAYS * COL }}>
            <div className="sticky top-0 z-20 flex border-b border-line bg-surface">
              <div className="w-[132px] shrink-0 px-3 py-2 text-[12px] font-medium text-muted">Սենյակ</div>
              {days.map((d) => {
                const wd = weekday(d);
                return <div key={d} style={{ width: COL }} className={cn("shrink-0 py-1.5 text-center text-[11px] leading-tight", d === state.baseDate ? "bg-signal-soft font-semibold text-signal" : wd === 5 || wd === 6 ? "bg-paper text-ink-2" : "text-muted")}><div>{HY_WD[wd]}</div><div className="text-[13px] font-semibold">{Number(d.slice(8))}</div></div>;
              })}
            </div>
            {ROOM_TYPES.map((t) => {
              const typeInq = inquiries.filter((r) => r.typeId === t.id);
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-2 border-b border-line bg-paper/70 px-3 py-1.5 text-[12px] font-semibold text-ink-2">{t.name.hy}{typeInq.length > 0 && <Badge tone="warn">{typeInq.length} հարցում</Badge>}</div>
                  {typeInq.length > 0 && (
                    <div className="flex border-b border-line bg-warn-soft/20">
                      <div className="w-[132px] shrink-0 px-3 py-2.5 text-[12px] text-warn">Չնշանակված</div>
                      <div className="relative h-[42px]" style={{ width: DAYS * COL }}>{typeInq.map((r) => bar(r, true))}</div>
                    </div>
                  )}
                  {state.rooms.filter((r) => r.typeId === t.id).map((room) => (
                    <div key={room.id} className="flex border-b border-line last:border-b-0">
                      <div className="flex w-[132px] shrink-0 items-center gap-2 px-3 text-[13px] font-medium">{room.number}{ooo.has(room.id) && <Badge tone="bad">ՉԳ</Badge>}</div>
                      <div className={cn("relative h-[42px]", ooo.has(room.id) && "ooo-stripes")} style={{ width: DAYS * COL }}>
                        {days.map((d, i) => <button key={d} aria-label={`${room.number} ${d}`} onClick={() => setNewRes({ roomId: room.id, checkIn: d })} className={cn("absolute inset-y-0 border-r border-line/60 hover:bg-info-soft/50", d === state.baseDate && "bg-signal-soft/40")} style={{ left: i * COL, width: COL }} />)}
                        {visible.filter((r) => r.roomId === room.id).map((r) => bar(r))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
      <NewReservationModal open={!!newRes} onClose={() => setNewRes(null)} preset={newRes ?? undefined} />
    </>
  );
}
