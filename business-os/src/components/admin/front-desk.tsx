"use client";
import { useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { folioOf } from "@/lib/engine-ops";
import { amd, stamp } from "@/lib/format";
import { ROOM_TYPES } from "@/lib/hotel-data";
import { freeRooms } from "@/lib/pricing";
import type { FolioLine, Reservation } from "@/lib/types";
import { Badge, Button, cn, Input, Select } from "../ui";

const SYNC: Record<NonNullable<Reservation["external"]>["syncState"], [string, "ok" | "warn" | "bad" | "info"]> = { synced: ["Համաժամեցված", "ok"], pending: ["Սպասում է", "info"], failed: ["Ձախողված", "bad"], conflict: ["Կոնֆլիկտ", "warn"] };
const CH = { booking: "Booking.com", expedia: "Expedia", airbnb: "Airbnb" } as const;

/** Folio, room move, no-show and channel sync — the front-desk operations of a reservation. */
export function FrontDeskPanel({ res }: { res: Reservation }) {
  const { state, dispatch } = useDemo();
  const [kind, setKind] = useState<FolioLine["kind"]>("charge");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Քարտ (տերմինալ)");
  const [moveTo, setMoveTo] = useState("");
  const live = ["confirmed", "checked_in", "checked_out"].includes(res.status);
  const orders = res.roomId ? state.orders.filter((o) => o.type === "room_service" && o.roomId === res.roomId && o.createdAt >= res.createdAt && res.status !== "checked_out") : [];
  const f = folioOf(res, orders);
  const from = res.status === "checked_in" && res.checkIn < state.baseDate ? state.baseDate : res.checkIn;
  const moves = ["confirmed", "checked_in"].includes(res.status) ? ROOM_TYPES.flatMap((t) => freeRooms(state, t.id, from, res.checkOut, res.id).filter((r) => r !== res.roomId).map((id) => ({ id, t: t.name.hy }))) : [];
  return (
    <>
      {res.external && (
        <section className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line p-3 text-[12.5px]">
          <b>{CH[res.external.channel]}</b><span className="font-mono">{res.external.externalId}</span><span className="text-muted">տարբերակ {res.external.version} · միջնորդավճար {res.external.commissionPct}% ≈ {amd((res.total * res.external.commissionPct) / 100)}</span>
          <span className="ml-auto flex items-center gap-1.5">Համաժամեցում՝ <Badge tone={SYNC[res.external.syncState][1]}>{SYNC[res.external.syncState][0]}</Badge></span>
          <p className="w-full text-[11.5px] text-faint">Ներքին կարգավիճակը ({res.status}) և ալիքի համաժամեցման կարգավիճակը պահվում են առանձին։ Ցուցադրական ադապտեր։</p>
        </section>
      )}
      {live && (
        <section className="mt-4 rounded-xl border border-line p-4">
          <div className="mb-2 flex items-center justify-between text-[13px]"><span className="font-semibold">Հաշիվ (folio)</span><span>Մնացորդ՝ <b className={cn("tnum", f.balance > 0 ? "text-bad" : "text-ok")}>{amd(f.balance)}</b></span></div>
          <ul className="space-y-1 text-[13px]">
            {f.lines.map((l, i) => <li key={i} className="flex justify-between gap-3"><span className={cn(l.kind === "credit" && "text-ok")}>{l.label}</span><span className="tnum">{l.amount < 0 ? "−" : ""}{amd(Math.abs(l.amount))}</span></li>)}
            <li className="flex justify-between border-t border-line pt-1.5 font-medium"><span>Գանձումներ / վճարված</span><span className="tnum">{amd(f.charges)} / {amd(f.paid)}</span></li>
          </ul>
          <div className="mt-3 grid gap-2 sm:grid-cols-[130px_1fr_110px_auto]">
            <Select value={kind} onChange={(e) => setKind(e.target.value as FolioLine["kind"])}><option value="charge">Գանձում</option><option value="deposit">Կանխավճար</option><option value="payment">Վճարում</option><option value="refund">Վերադարձ</option></Select>
            <Input placeholder={kind === "charge" ? "Օր․՝ Մինիբար" : "Նկարագրություն"} value={label} onChange={(e) => setLabel(e.target.value)} />
            <Input inputMode="numeric" placeholder="֏" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
            <Button disabled={!label.trim() || !(+amount > 0)} onClick={() => { dispatch({ type: "folio.add", reservationId: res.id, kind, label, amount: +amount, method: kind === "charge" ? undefined : method }); setLabel(""); setAmount(""); }}>Ավելացնել</Button>
          </div>
          {kind !== "charge" && <Select className="mt-2 max-w-56" value={method} onChange={(e) => setMethod(e.target.value)}>{["Կանխիկ", "Քարտ (տերմինալ)", "Բանկային փոխանցում"].map((m) => <option key={m}>{m}</option>)}</Select>}
          <p className="mt-2 text-[11.5px] text-faint">Վճարումները գրանցվում են ձեռքով․ քարտեր չեն գանձվում, վերադարձերը իրականում չեն կատարվում (պահանջում է վճարային համակարգ)։ {f.lines.some((l) => l.label.startsWith("Սենյակային")) && "Սենյակային սպասարկման ավարտված պատվերները ներառված են։"}</p>
          {(res.folio ?? []).length > 0 && <ol className="mt-2 space-y-0.5 text-[11.5px] text-muted">{res.folio!.map((x) => <li key={x.id}>{stamp(x.at, state.baseDate)} · {x.by} · {x.label}</li>)}</ol>}
        </section>
      )}
      {["confirmed", "checked_in"].includes(res.status) && (
        <section className="mt-4 grid gap-3 rounded-xl border border-line p-4 text-[13px] sm:grid-cols-2">
          <div>
            <div className="mb-1.5 font-semibold">Սենյակի փոփոխություն</div>
            <div className="flex gap-2"><Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)}><option value="">Ընտրել ազատ սենյակ…</option>{moves.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.t}</option>)}</Select><Button disabled={!moveTo} onClick={() => { dispatch({ type: "reservation.move", reservationId: res.id, roomId: moveTo, reason: "Ընդունարանի որոշում" }); setMoveTo(""); }}>Տեղափոխել</Button></div>
            <p className="mt-1 text-[11.5px] text-faint">Միայն ազատ սենյակներ․ ներսում գտնվող հյուրի հին սենյակի համար ստեղծվում է մաքրման առաջադրանք։</p>
          </div>
          {res.status === "confirmed" && (
            <div>
              <div className="mb-1.5 font-semibold">Չներկայացում</div>
              <Button variant="danger" disabled={res.checkIn > state.baseDate} onClick={() => dispatch({ type: "reservation.noshow", reservationId: res.id })}>Նշել no-show</Button>
              <p className="mt-1 text-[11.5px] text-faint">{res.checkIn > state.baseDate ? "Հասանելի է ժամանման օրվանից" : "Սենյակը ազատվում է, պատրաստման առաջադրանքները հանվում են"}</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
