"use client";
import Link from "next/link";
import { EXTRAS } from "@/lib/hospitality-data";
import { useEffect, useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, diffDays, eachNight } from "@/lib/dates";
import { amd, dHy, dShort, LANG_LABEL, SOURCE_LABEL, stamp, STATUS_LABEL, time } from "@/lib/format";
import { ROOM_TYPES, roomType } from "@/lib/hotel-data";
import { fitsGuests, freeRooms, nightlyRate, quote } from "@/lib/pricing";
import type { Reservation, ResStatus, RoomTypeId, Source } from "@/lib/types";
import { Icon } from "../icons";
import { Badge, Button, cn, Drawer, Field, Input, Modal, Select, SimBadge, Textarea, type Tone } from "../ui";

export const STATUS_TONE: Record<ResStatus, Tone> = { inquiry: "warn", confirmed: "info", checked_in: "ok", checked_out: "neutral", declined: "bad", cancelled: "bad", no_show: "bad" };

export function StatusBadge({ s }: { s: ResStatus }) {
  return <Badge tone={STATUS_TONE[s]} dot>{STATUS_LABEL[s]}</Badge>;
}

export function SourceBadge({ s }: { s: Source }) {
  const icon = { website: "globe", assistant: "sparkles", phone: "phone", booking: "external", airbnb: "external", instagram: "message", walkin: "door", expedia: "external", whatsapp: "message" } as const;
  return <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-2"><Icon name={icon[s]} size={14} className={s === "assistant" ? "text-signal" : "text-muted"} />{SOURCE_LABEL[s]}</span>;
}

const DECLINE_REASONS = ["Ազատ սենյակ չկա նշված օրերին", "Առաջարկվել են այլ ամսաթվեր", "Հյուրը չի պատասխանում", "Կրկնակի հարցում"];

export function ReservationDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, dispatch } = useDemo();
  const res = state.reservations.find((r) => r.id === id) ?? null;
  const [roomId, setRoomId] = useState("");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const free = res ? freeRooms(state, res.typeId, res.checkIn, res.checkOut, res.id) : [];
  useEffect(() => { setRoomId(free[0] ?? ""); setDeclining(false); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!res) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const g = state.guests.find((x) => x.id === res.guestId)!;
  const nights = diffDays(res.checkIn, res.checkOut);
  const conv = res.conversationId ? state.conversations.find((c) => c.id === res.conversationId) : undefined;
  const msgs = state.outbox.filter((o) => o.reservationId === res.id);
  const tasks = state.hkTasks.filter((t) => t.reservationId === res.id);
  const at = res.displayAt ?? res.createdAt;
  const waitingMin = Math.round((Date.now() - res.createdAt) / 60000);
  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {res.status === "inquiry" && !declining && (
        <>
          <Button variant="danger" icon="x" onClick={() => setDeclining(true)}>Մերժել</Button>
          <Button variant="ok" icon="check" disabled={!roomId} onClick={() => dispatch({ type: "reservation.approve", reservationId: res.id, roomId })}>Հաստատել · սենյակ {roomId || "—"}</Button>
        </>
      )}
      {res.status === "inquiry" && declining && (
        <>
          <Select value={reason} onChange={(e) => setReason(e.target.value)} className="max-w-64">{DECLINE_REASONS.map((r) => <option key={r}>{r}</option>)}</Select>
          <Button variant="ghost" onClick={() => setDeclining(false)}>Չեղարկել</Button>
          <Button variant="primary" onClick={() => dispatch({ type: "reservation.decline", reservationId: res.id, reason })}>Մերժել և առաջարկել այլընտրանք</Button>
        </>
      )}
      {res.status === "confirmed" && (
        <>
          <Button variant="danger" onClick={() => dispatch({ type: "reservation.cancel", reservationId: res.id })}>Չեղարկել ամրագրումը</Button>
          <Button variant="primary" icon="logIn" disabled={res.checkIn !== state.baseDate} onClick={() => dispatch({ type: "reservation.checkin", reservationId: res.id })}>Գրանցել ժամանումը</Button>
        </>
      )}
      {res.status === "checked_in" && <Button variant="primary" icon="logOut" onClick={() => dispatch({ type: "reservation.checkout", reservationId: res.id })}>Գրանցել մեկնումը</Button>}
    </div>
  );
  return (
    <Drawer open={!!res} onClose={onClose} wide title={<span className="flex items-center gap-2">{res.code}<StatusBadge s={res.status} /></span>} sub={<>Ստեղծվել է {stamp(at, state.baseDate)} {res.afterHours && <Badge tone="violet" className="ml-1"><Icon name="moon" size={12} />Ոչ աշխատանքային ժամ</Badge>}</>} footer={footer}>
      {res.status === "inquiry" && (
        <div className="mb-4 rounded-xl border border-warn/30 bg-warn-soft px-3.5 py-3 text-[13px] text-warn">
          <div className="flex items-center gap-2 font-semibold"><Icon name="clock" size={15} />Հարցում, դեռ հաստատված չէ · սպասում է {waitingMin < 60 ? `${waitingMin} րոպե` : `${Math.round(waitingMin / 60)} ժամ`}</div>
          <div className="mt-1 text-ink-2">Ստուգեք սենյակը և հաստատեք։ Հյուրը կստանա հաստատում միայն Ձեր որոշումից հետո։</div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-line p-4">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-faint">Հյուր</div>
          <div className="text-[15px] font-semibold">{g.firstName} {g.lastName}</div>
          <div className="mt-1 space-y-0.5 text-[13px] text-muted"><div className="flex items-center gap-1.5"><Icon name="phone" size={14} />{g.phone}</div>{g.email && <div className="flex items-center gap-1.5"><Icon name="mail" size={14} />{g.email}</div>}<div className="flex items-center gap-1.5"><Icon name="globe" size={14} />{LANG_LABEL[g.lang]} · {g.country}</div></div>
          <div className="mt-2 flex flex-wrap gap-1">{g.tags.map((t) => <Badge key={t} tone={t === "VIP" ? "signal" : "neutral"}>{t}</Badge>)}</div>
          <Link href={`/admin/guests?open=${g.id}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-info">Հյուրի պրոֆիլը<Icon name="chevron" size={14} /></Link>
        </section>
        <section className="rounded-xl border border-line p-4">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-faint">Կեցություն</div>
          <div className="text-[15px] font-semibold">{dHy(res.checkIn)} → {dHy(res.checkOut)}</div>
          <div className="mt-1 space-y-0.5 text-[13px] text-muted">
            <div>{nights} գիշեր · {res.adults} մեծահասակ{res.children ? ` · ${res.children} երեխա` : ""}</div>
            <div>{roomType(res.typeId).name.hy}{res.roomId ? ` · սենյակ ${res.roomId}` : " · սենյակը նշանակված չէ"}</div>
            <div className="flex items-center gap-1.5">Աղբյուր՝ <SourceBadge s={res.source} /></div>
          </div>
        </section>
      </div>

      {res.status === "inquiry" && (
        <section className="mt-4 rounded-xl border border-line p-4">
          <div className="mb-2 flex items-center justify-between"><span className="text-[13px] font-semibold">Ընտրել սենյակ</span><span className="text-[12px] text-muted">Ազատ՝ {free.length} {roomType(res.typeId).name.hy}</span></div>
          {free.length ? (
            <div className="flex flex-wrap gap-2">{free.map((r) => <button key={r} onClick={() => setRoomId(r)} className={cn("h-9 min-w-14 rounded-lg border px-3 text-[13px] font-semibold", roomId === r ? "border-ink bg-ink text-white" : "border-line-2 hover:border-ink")}>{r}</button>)}</div>
          ) : <div className="text-[13px] text-bad">Այս տեսակի ազատ սենյակ չկա. մերժեք և առաջարկեք այլ ամսաթվեր կամ սենյակ։</div>}
        </section>
      )}

      <section className="mt-4 rounded-xl border border-line p-4">
        <div className="mb-2 text-[13px] font-semibold">Գնի հաշվարկ (գնացուցակից)</div>
        <div className="space-y-1 text-[13px]">
          {eachNight(res.checkIn, res.checkOut).map((n) => <div key={n} className="flex justify-between text-muted"><span>{dShort(n)}</span><span className="tnum">{amd(nightlyRate(res.typeId, n))}</span></div>)}
          {(res.extras?.length || res.discount) ? <>
            <div className="flex justify-between border-t border-line pt-1.5"><span>Սենյակ</span><span className="tnum">{amd(res.total)}</span></div>
            {res.extras?.map((x) => <div key={x.id} className="flex justify-between"><span>+ {EXTRAS.find((e) => e.id === x.id)?.name.hy ?? x.id}{x.qty > 1 ? ` × ${x.qty}` : ""}</span><span className="tnum">{amd(x.price)}</span></div>)}
            {!!res.discount && <div className="flex justify-between text-ok"><span>− {res.discountLabel ?? "Զեղչ"}</span><span className="tnum">−{amd(res.discount)}</span></div>}
            <div className="flex justify-between border-t border-line pt-1.5 text-[14px] font-semibold"><span>Ընդհանուր վճարման ենթակա</span><span className="tnum">{amd(res.total + (res.extras ?? []).reduce((a, x) => a + x.price, 0) - (res.discount ?? 0))}</span></div>
          </> : <div className="flex justify-between border-t border-line pt-1.5 text-[14px] font-semibold"><span>Ընդհանուր</span><span className="tnum">{amd(res.total)}</span></div>}
          {res.groupId && <div className="pt-1 text-[12px] text-muted">Խմբային ամրագրում՝ {state.reservations.filter((r) => r.groupId === res.groupId).map((r) => r.code).join(", ")} (զեղչերը և լրացուցիչները՝ առաջին սենյակի վրա)</div>}
        </div>
        {["confirmed", "checked_in", "checked_out"].includes(res.status) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[13px]">
            <span className="mr-auto">Վճարում՝ {res.payment === "paid" ? <Badge tone="ok">Վճարված</Badge> : <Badge tone="warn">Չվճարված</Badge>}</span>
            {res.payment !== "paid" && ["Կանխիկ", "Քարտ (տերմինալ)", "Բանկային փոխանցում"].map((m) => <Button key={m} size="sm" onClick={() => dispatch({ type: "reservation.pay", reservationId: res.id, method: m })}>{m}</Button>)}
          </div>
        )}
        {["confirmed", "checked_in", "checked_out"].includes(res.status) && res.payment !== "paid" && <p className="mt-2 text-[11.5px] text-muted">Վճարումը գրանցվում է ձեռքով։ Առցանց վճարման ինտեգրացիա չկա (ցուցադրական)։</p>}
      </section>

      {res.requests && <section className="mt-4 rounded-xl bg-paper p-4 text-[13px]"><div className="mb-1 font-semibold">Հյուրի խնդրանքը</div>{res.requests}</section>}
      {res.declineReason && <section className="mt-4 rounded-xl bg-bad-soft p-4 text-[13px] text-bad"><div className="mb-1 font-semibold">Մերժման պատճառ</div>{res.declineReason}</section>}

      {conv && (
        <section className="mt-4 rounded-xl border border-line p-4">
          <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[13px] font-semibold"><Icon name="sparkles" size={15} className="text-signal" />Զրույց AI օգնականի հետ</span><Link href={`/admin/assistant?open=${conv.id}`} className="text-[12px] font-medium text-info">Բացել</Link></div>
          <div className="max-h-52 space-y-1.5 overflow-y-auto text-[13px]">
            {conv.messages.map((m) => <div key={m.id} className={cn("rounded-lg px-2.5 py-1.5", m.from === "guest" ? "bg-ink text-white" : "bg-paper")}><span className="mr-1 text-[11px] opacity-60">{m.from === "guest" ? "Հյուր" : m.from === "staff" ? "Աշխատակից" : "Օգնական"} · {time(m.at)}</span>{m.text}</div>)}
          </div>
        </section>
      )}

      {(tasks.length > 0 || msgs.length > 0) && (
        <section className="mt-4 rounded-xl border border-line p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold"><Icon name="zap" size={15} className="text-signal" />Ավտոմատացումներ այս ամրագրման համար</div>
          <ul className="space-y-2 text-[13px]">
            {tasks.map((t) => <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2"><span className="flex items-center gap-2"><Icon name="broom" size={15} className="text-muted" />Մաքրության առաջադրանք՝ սենյակ {t.roomId}, {dShort(t.due)}</span><Badge tone={t.status === "done" ? "ok" : "neutral"}>{t.status === "done" ? "Ավարտված" : t.status === "in_progress" ? "Ընթացքում" : "Անելիք"}</Badge></li>)}
            {msgs.map((m) => <li key={m.id} className="rounded-lg bg-paper px-3 py-2"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{m.template} · {m.channel === "whatsapp" ? "WhatsApp" : m.channel === "telegram" ? "Telegram" : m.channel === "email" ? "Էլ. փոստ" : m.channel}</span><SimBadge scheduled={m.state === "scheduled"} /></div><div className="text-muted">{m.text}</div>{m.scheduledFor && <div className="mt-1 text-[12px] text-faint">Պլանավորված՝ {m.scheduledFor}</div>}</li>)}
          </ul>
        </section>
      )}

      <section className="mt-4">
        <div className="mb-2 text-[13px] font-semibold">Պատմություն</div>
        <ol className="space-y-2 border-l border-line pl-4 text-[13px]">
          {[...res.history].reverse().map((h, i) => <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-ink-2" />{h.text}<span className="block text-[12px] text-faint">{stamp(h.at, state.baseDate)} · {h.by}</span></li>)}
        </ol>
      </section>
    </Drawer>
  );
}

export function NewReservationModal({ open, onClose, preset }: { open: boolean; onClose: () => void; preset?: { roomId?: string; checkIn?: string } }) {
  const { state, dispatch } = useDemo();
  const [typeId, setType] = useState<RoomTypeId>("classic");
  const [checkIn, setIn] = useState(state.baseDate);
  const [checkOut, setOut] = useState(addDays(state.baseDate, 2));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomId, setRoomId] = useState("");
  const [source, setSource] = useState<Source>("phone");
  const [f, setF] = useState({ firstName: "", lastName: "", phone: "", email: "", requests: "" });
  useEffect(() => {
    if (!open) return;
    const room = preset?.roomId ? state.rooms.find((r) => r.id === preset.roomId) : undefined;
    if (room) setType(room.typeId);
    if (preset?.checkIn) { setIn(preset.checkIn); setOut(addDays(preset.checkIn, 2)); }
    setRoomId(preset?.roomId ?? "");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const free = checkIn < checkOut ? freeRooms(state, typeId, checkIn, checkOut) : [];
  useEffect(() => { if (roomId && !free.includes(roomId)) setRoomId(free[0] ?? ""); }, [typeId, checkIn, checkOut]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = checkIn < checkOut ? quote(typeId, checkIn, checkOut) : null;
  const ok = q && f.firstName.trim() && f.phone.trim() && fitsGuests(typeId, adults, children);
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Նոր ամրագրում (ձեռքով)" footer={<><Button variant="ghost" onClick={onClose}>Չեղարկել</Button><Button variant="primary" icon="check" disabled={!ok} onClick={() => { dispatch({ type: "reservation.create", guest: { ...f, lang: "hy" }, typeId, roomId: roomId || null, checkIn, checkOut, adults, children, source, requests: f.requests }); onClose(); }}>{roomId ? "Ստեղծել հաստատված ամրագրում" : "Ստեղծել հարցում"}</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ժամանում"><Input type="date" value={checkIn} onChange={(e) => setIn(e.target.value)} /></Field>
        <Field label="Մեկնում"><Input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setOut(e.target.value)} /></Field>
        <Field label="Սենյակի տեսակ"><Select value={typeId} onChange={(e) => setType(e.target.value as RoomTypeId)}>{ROOM_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name.hy}</option>)}</Select></Field>
        <Field label="Սենյակ" hint={`${free.length} ազատ սենյակ`}><Select value={roomId} onChange={(e) => setRoomId(e.target.value)}><option value="">— Նշանակել ավելի ուշ (հարցում)</option>{free.map((r) => <option key={r} value={r}>{r}</option>)}</Select></Field>
        <Field label="Մեծահասակներ"><Select value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</Select></Field>
        <Field label="Երեխաներ"><Select value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}</Select></Field>
        <Field label="Անուն"><Input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
        <Field label="Ազգանուն"><Input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        <Field label="Հեռախոս"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+374 …" /></Field>
        <Field label="Աղբյուր"><Select value={source} onChange={(e) => setSource(e.target.value as Source)}>{(["phone", "walkin", "instagram", "website", "booking", "airbnb"] as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}</Select></Field>
        <Field label="Խնդրանքներ" className="sm:col-span-2"><Textarea value={f.requests} onChange={(e) => setF({ ...f, requests: e.target.value })} /></Field>
      </div>
      {q && <div className="mt-3 flex items-center justify-between rounded-xl bg-paper px-4 py-3 text-sm"><span className="text-muted">{q.nights} գիշեր · գինը գնացուցակից</span><span className="tnum text-base font-semibold">{amd(q.total)}</span></div>}
      {!fitsGuests(typeId, adults, children) && <div className="mt-2 text-[13px] text-bad">Այս սենյակի տեսակը չի համապատասխանում հյուրերի թվին։</div>}
    </Modal>
  );
}

export function ResRow({ r, onOpen }: { r: Reservation; onOpen: (id: string) => void }) {
  const { state } = useDemo();
  const g = state.guests.find((x) => x.id === r.guestId);
  return (
    <button onClick={() => onOpen(r.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-paper">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">{g?.firstName} {g?.lastName}</div>
        <div className="truncate text-[12px] text-muted">{roomType(r.typeId).name.hy} · {dShort(r.checkIn)}–{dShort(r.checkOut)}</div>
      </div>
      <StatusBadge s={r.status} />
    </button>
  );
}
