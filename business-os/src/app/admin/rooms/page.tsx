"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ReservationDrawer, StatusBadge } from "@/components/admin/reservation";
import { PageTitle } from "@/components/admin/shell";
import { AMENITY_ICON, Icon } from "@/components/icons";
import { Badge, Button, Drawer, Field, Input, Select, Tabs, Textarea, Toggle } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { dShort, PRIORITY_LABEL, stamp } from "@/lib/format";
import { AMENITY_LABEL } from "@/lib/hotel-data";
import { kindLabel } from "@/lib/engine";
import { LIVE_LABEL, liveRooms, type LiveStatus } from "@/lib/rooms";
import type { HkStatus, Priority } from "@/lib/types";

const TONE: Record<LiveStatus, "neutral" | "ok" | "warn" | "bad" | "info" | "dark"> = { occupied: "dark", departing: "warn", dirty: "warn", cleaning: "info", arriving: "ok", available: "ok", ooo: "bad" };

export default function Rooms() {
  const { state, dispatch } = useDemo();
  const sp = useSearchParams();
  const [filter, setFilter] = useState<"all" | LiveStatus>("all");
  const [open, setOpen] = useState<string | null>(sp.get("open"));
  const [resOpen, setResOpen] = useState<string | null>(null);
  const [issue, setIssue] = useState({ title: "", description: "", priority: "normal" as Priority, outOfOrder: false });
  useEffect(() => { if (sp.get("open")) setOpen(sp.get("open")); }, [sp]);
  const rooms = useMemo(() => liveRooms(state), [state]);
  const shown = rooms.filter((r) => filter === "all" || r.status === filter);
  const cur = rooms.find((r) => r.room.id === open);
  const g = (id?: string) => state.guests.find((x) => x.id === id);
  return (
    <>
      <PageTitle title="Սենյակներ" sub={`${state.rooms.length} սենյակ · կարգավիճակը թարմանում է ամրագրումներից, մաքրությունից և տեխնիկական հայտերից`} />
      <Tabs className="mb-4 w-fit max-w-full" value={filter} onChange={setFilter} items={[{ id: "all" as const, label: "Բոլորը", count: rooms.length }, ...(["available", "arriving", "occupied", "departing", "dirty", "cleaning", "ooo"] as LiveStatus[]).map((s) => ({ id: s, label: LIVE_LABEL[s], count: rooms.filter((r) => r.status === s).length }))]} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {shown.map((r) => (
          <button key={r.room.id} onClick={() => setOpen(r.room.id)} className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface text-left shadow-[var(--shadow-card)] transition hover:shadow-md">
            <div className="flex items-start justify-between gap-2 p-4 pb-3">
              <div><div className="text-[22px] font-semibold leading-none">{r.room.number}</div><div className="mt-1 text-[12.5px] text-muted">{r.type.name.hy}{r.room.floor ? ` · ${r.room.floor}-րդ հարկ` : " · տնակ"}</div></div>
              <Badge tone={TONE[r.status]} dot>{LIVE_LABEL[r.status]}</Badge>
            </div>
            <div className="space-y-1 border-t border-line px-4 py-3 text-[12.5px] text-muted">
              {r.current ? <div className="flex items-center gap-1.5"><Icon name="user" size={14} /><span className="truncate text-ink">{g(r.current.guestId)?.firstName} {g(r.current.guestId)?.lastName}</span> · մինչև {dShort(r.current.checkOut)}</div> : <div className="flex items-center gap-1.5"><Icon name="door" size={14} />Ազատ է հիմա</div>}
              <div className="flex items-center gap-1.5"><Icon name="calendar" size={14} />{r.next ? `Հաջորդ ժամանում՝ ${dShort(r.next.checkIn)}` : "Առաջիկա ամրագրում չկա"}</div>
              <div className="flex items-center gap-1.5"><Icon name="broom" size={14} />Մաքրություն՝ {({ clean: "մաքուր", dirty: "կարիք ունի", cleaning: "ընթացքում", inspected: "ստուգված" } as Record<HkStatus, string>)[r.hk]}</div>
            </div>
          </button>
        ))}
      </div>
      <Drawer open={!!cur} onClose={() => setOpen(null)} wide title={cur ? `Սենյակ ${cur.room.number}` : ""} sub={cur?.type.name.hy}>
        {cur && (
          <div className="space-y-4">
            <div className="relative aspect-[16/7] overflow-hidden rounded-xl"><Image src={cur.type.photos[0]} alt="" fill sizes="640px" className="object-cover" /></div>
            <div className="flex flex-wrap items-center gap-2"><Badge tone={TONE[cur.status]} dot>{LIVE_LABEL[cur.status]}</Badge><Badge>{cur.type.sizeM2} մ²</Badge><Badge>մինչև {cur.type.capacity.adults + cur.type.capacity.children} հյուր</Badge><Badge>{cur.type.bed.hy}</Badge></div>
            <section className="rounded-xl border border-line p-4">
              <div className="mb-2 text-[13px] font-semibold">Մաքրության կարգավիճակ</div>
              <div className="flex flex-wrap gap-2">
                {(["dirty", "cleaning", "clean", "inspected"] as HkStatus[]).map((s) => <Button key={s} size="sm" variant={cur.hk === s ? "primary" : "secondary"} onClick={() => dispatch({ type: "room.hk", roomId: cur.room.id, status: s })}>{({ dirty: "Մաքրման կարիք", cleaning: "Մաքրվում է", clean: "Մաքուր", inspected: "Ստուգված" } as Record<HkStatus, string>)[s]}</Button>)}
              </div>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-4 text-[13px]"><div className="mb-1 font-semibold">Ընթացիկ հյուր</div>{cur.current ? <button className="text-left" onClick={() => setResOpen(cur.current!.id)}>{g(cur.current.guestId)?.firstName} {g(cur.current.guestId)?.lastName}<span className="block text-muted">{dShort(cur.current.checkIn)} – {dShort(cur.current.checkOut)}</span></button> : <span className="text-muted">Չկա</span>}</div>
              <div className="rounded-xl border border-line p-4 text-[13px]"><div className="mb-1 font-semibold">Հաջորդ ամրագրում</div>{cur.next ? <button className="text-left" onClick={() => setResOpen(cur.next!.id)}>{g(cur.next.guestId)?.firstName} {g(cur.next.guestId)?.lastName}<span className="block text-muted">{dShort(cur.next.checkIn)} – {dShort(cur.next.checkOut)}</span></button> : <span className="text-muted">Չկա</span>}</div>
            </section>
            <section><div className="mb-2 text-[13px] font-semibold">Հարմարություններ</div><div className="flex flex-wrap gap-2">{cur.type.amenities.map((a) => <span key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-paper px-2.5 py-1.5 text-[12.5px]"><Icon name={AMENITY_ICON[a]} size={14} />{AMENITY_LABEL[a].hy}</span>)}</div></section>
            <section>
              <div className="mb-2 text-[13px] font-semibold">Առաջադրանքներ և տեխնիկական պատմություն</div>
              <ul className="space-y-1.5 text-[13px]">
                {state.hkTasks.filter((t) => t.roomId === cur.room.id).slice(0, 4).map((t) => <li key={t.id} className="flex justify-between rounded-lg bg-paper px-3 py-2"><span>{kindLabel[t.kind]} · {dShort(t.due)}</span><Badge tone={t.status === "done" ? "ok" : "neutral"}>{t.status === "done" ? "Ավարտված" : t.status === "in_progress" ? "Ընթացքում" : "Անելիք"}</Badge></li>)}
                {state.maint.filter((m) => m.roomId === cur.room.id).map((m) => <li key={m.id} className="flex justify-between rounded-lg bg-paper px-3 py-2"><span>{m.title} · {stamp(m.createdAt, state.baseDate)}</span><Badge tone={m.status === "resolved" ? "ok" : "bad"}>{m.status === "resolved" ? "Լուծված" : PRIORITY_LABEL[m.priority]}</Badge></li>)}
                {state.reservations.filter((r) => r.roomId === cur.room.id && r.status === "checked_out").slice(-3).reverse().map((r) => <li key={r.id} className="flex justify-between rounded-lg px-3 py-1.5 text-muted"><span>{g(r.guestId)?.firstName} {g(r.guestId)?.lastName} · {dShort(r.checkIn)}–{dShort(r.checkOut)}</span><StatusBadge s={r.status} /></li>)}
              </ul>
            </section>
            <section className="rounded-xl border border-line p-4">
              <div className="mb-3 text-[13px] font-semibold">Հայտնել տեխնիկական խնդիր</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Խնդիր" className="sm:col-span-2"><Input value={issue.title} onChange={(e) => setIssue({ ...issue, title: e.target.value })} placeholder="Օր.՝ ծորակը կաթում է" /></Field>
                <Field label="Նկարագրություն" className="sm:col-span-2"><Textarea value={issue.description} onChange={(e) => setIssue({ ...issue, description: e.target.value })} /></Field>
                <Field label="Առաջնահերթություն"><Select value={issue.priority} onChange={(e) => setIssue({ ...issue, priority: e.target.value as Priority })}>{(["low", "normal", "high", "urgent"] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</Select></Field>
                <label className="flex items-center gap-3 pt-5 text-[13px]"><Toggle on={issue.outOfOrder} onChange={(v) => setIssue({ ...issue, outOfOrder: v })} />Հանել վաճառքից</label>
              </div>
              <Button className="mt-3" variant="primary" icon="wrench" disabled={!issue.title.trim()} onClick={() => { dispatch({ type: "maint.create", roomId: cur.room.id, area: "Սենյակ", ...issue }); setIssue({ title: "", description: "", priority: "normal", outOfOrder: false }); }}>Ստեղծել հայտ</Button>
            </section>
          </div>
        )}
      </Drawer>
      <ReservationDrawer id={resOpen} onClose={() => setResOpen(null)} />
    </>
  );
}
