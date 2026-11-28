"use client";
import Link from "next/link";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, CardHead, cn, Kpi, Select, Tabs } from "@/components/ui";
import { CLASS_LABEL, COMMISSION_PCT, demoOtaBooking, INTEGRATIONS } from "@/lib/channel-adapters";
import { useDemo } from "@/lib/client/demo-store";
import { addDays } from "@/lib/dates";
import { amd, stamp } from "@/lib/format";
import { ROOM_TYPES } from "@/lib/hotel-data";
import { freeRooms } from "@/lib/pricing";
import type { OtaChannel, SyncLogEntry } from "@/lib/types";

const CH: Record<OtaChannel, string> = { booking: "Booking.com", expedia: "Expedia", airbnb: "Airbnb" };
const RES_TONE: Record<SyncLogEntry["result"], "ok" | "bad" | "warn" | "neutral"> = { ok: "ok", failed: "bad", conflict: "warn", ignored: "neutral" };
const RES_LABEL: Record<SyncLogEntry["result"], string> = { ok: "Հաջող", failed: "Ձախողված", conflict: "Կոնֆլիկտ", ignored: "Անտեսված" };

export default function Channels() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"overview" | "mapping" | "log">("overview");
  const [seq, setSeq] = useState(1);
  const ota = state.reservations.filter((r) => r.external);
  const conflicts = ota.filter((r) => r.external!.syncState === "conflict" && !["cancelled", "checked_out"].includes(r.status));
  const failed = state.syncLog.filter((l) => l.result === "failed");
  const month = state.baseDate.slice(0, 7);
  const thisMonth = ota.filter((r) => r.checkIn.slice(0, 7) === month && ["confirmed", "checked_in", "checked_out"].includes(r.status));
  const simulate = (channel: OtaChannel) => {
    const ci = addDays(state.baseDate, 10 + (seq % 20)), co = addDays(ci, 2);
    dispatch({ type: "ota.import", booking: demoOtaBooking(channel, seq, ci, co, (["deluxe", "classic", "junior", "family"] as const)[seq % 4]) });
    setSeq(seq + 1);
  };
  const lastExt = [...ota].sort((a, b) => b.createdAt - a.createdAt)[0];
  return (
    <>
      <PageTitle title="Ալիքների կառավարում (OTA)" sub={<span className="flex flex-wrap items-center gap-2">Ամրագրումներ Booking.com-ից, Expedia-ից և Airbnb-ից մեկ օրացույցում <Badge tone="warn">Ցուցադրական ադապտեր · իրական կապ չկա</Badge></span>} right={<Link href="/admin/integrations"><Button icon="external">Ինտեգրացիաների մատրից</Button></Link>} />
      <div className="mb-4 rounded-xl border border-warn/40 bg-warn-soft/60 px-4 py-3 text-[13px] text-ink-2">
        <b>Ինչպես կաշխատի իրականում.</b> Booking.com-ի և Expedia-ի API-ները հասանելի են միայն հավաստագրված Connectivity գործընկերներին, Airbnb-ն նոր հարցումներ չի ընդունում։ Իրական միացումը կլինի հավաստագրված ալիքների կառավարչի (channel manager / PMS) միջոցով կամ գործընկերային կարգավիճակ ստանալուց հետո։ iCal-ը միայն զբաղվածություն է փոխանցում և լիարժեք ինտեգրացիա չէ։
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="OTA ամրագրումներ այս ամիս" value={thisMonth.length} sub={amd(thisMonth.reduce((a, r) => a + r.total, 0))} icon="external" />
        <Kpi label="Միջնորդավճար (գնահատում)" value={amd(thisMonth.reduce((a, r) => a + (r.total * r.external!.commissionPct) / 100, 0))} sub="ամրագրման գումար × ալիքի % (կարգավորելի)" icon="calc" tone="warn" />
        <Kpi label="Կոնֆլիկտներ" value={conflicts.length} sub="ամրագրում առանց ազատ սենյակի" icon="alert" tone={conflicts.length ? "bad" : "ok"} onClick={() => setTab("overview")} />
        <Kpi label="Ձախողված համաժամեցում" value={failed.length} icon="refresh" tone={failed.length ? "bad" : "ok"} onClick={() => setTab("log")} />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "overview", label: "Ալիքներ և կոնֆլիկտներ", count: conflicts.length }, { id: "mapping", label: "Սենյակների համապատասխանեցում" }, { id: "log", label: "Համաժամեցման մատյան", count: failed.length }]} />
      {tab === "overview" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Card pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Ալիքներ" sub="Կարգավիճակը ազնիվ է․ «միացված» երբեք չի ցուցադրվում առանց իրական մուտքի" /></div>
            <ul className="divide-y divide-line">
              {(Object.keys(CH) as OtaChannel[]).map((c) => {
                const meta = INTEGRATIONS.find((i) => i.id === (c === "airbnb" ? "airbnb" : `${c}_res`))!;
                const n = ota.filter((r) => r.external!.channel === c).length;
                return (
                  <li key={c} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                    <span className="grid size-10 place-items-center rounded-xl bg-paper text-[13px] font-bold">{CH[c].slice(0, 2)}</span>
                    <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">{CH[c]}</div><div className="text-[12px] text-muted">{n} ամրագրում համակարգում · միջնորդավճար {COMMISSION_PCT[c]}% · {CLASS_LABEL[meta.cls]}</div></div>
                    <Badge tone="warn">Ցուցադրական ադապտեր</Badge>
                    <Button size="sm" icon="plus" onClick={() => simulate(c)}>Սիմուլյացնել ամրագրում</Button>
                  </li>
                );
              })}
            </ul>
            {lastExt && <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 text-[12.5px]">
              <span className="text-muted">Վերջին ներմուծվածը՝ <Link className="text-info" href={`/admin/reservations?open=${lastExt.id}`}>{lastExt.code}</Link> ({lastExt.external!.externalId})</span>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "ota.import", booking: { channel: lastExt.external!.channel, externalId: lastExt.external!.externalId, typeId: lastExt.typeId, checkIn: lastExt.checkIn, checkOut: lastExt.checkOut, adults: lastExt.adults, children: lastExt.children, total: lastExt.total, guest: { firstName: "x", lastName: "x", phone: "", email: "", lang: "en" } } })}>Կրկնակի ստացում (թեստ)</Button>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "ota.import", booking: { channel: lastExt.external!.channel, externalId: lastExt.external!.externalId, typeId: lastExt.typeId, checkIn: lastExt.checkIn, checkOut: addDays(lastExt.checkOut, 1), adults: lastExt.adults, children: lastExt.children, total: Math.round(lastExt.total * 1.5), guest: { firstName: "x", lastName: "x", phone: "", email: "", lang: "en" } } })}>Փոփոխություն +1 գիշեր</Button>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "ota.cancel", channel: lastExt.external!.channel, externalId: lastExt.external!.externalId })}>Չեղարկում ալիքից</Button>
            </div>}
          </Card>
          <Card pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Կոնֆլիկտներ" sub="Ալիքը ամրագրում է ուղարկել, բայց ազատ սենյակ չկա․ համակարգը սենյակը կրկնակի չի վաճառում" /></div>
            {conflicts.length === 0 ? <div className="p-8 text-center text-[13px] text-muted"><Icon name="check" size={22} className="mx-auto mb-1 text-ok" />Կոնֆլիկտներ չկան</div> : (
              <ul className="divide-y divide-line">{conflicts.map((r) => { const alts = ROOM_TYPES.flatMap((t) => freeRooms(state, t.id, r.checkIn, r.checkOut, r.id).map((id) => ({ id, t: t.name.hy }))); return (
                <li key={r.id} className="space-y-2 px-4 py-3 text-[13px]">
                  <div><Link className="font-semibold text-info" href={`/admin/reservations?open=${r.id}`}>{r.code}</Link> · {CH[r.external!.channel]} {r.external!.externalId} · {r.checkIn} → {r.checkOut}</div>
                  {alts.length ? <Select defaultValue="" onChange={(e) => e.target.value && dispatch({ type: "ota.resolve", reservationId: r.id, roomId: e.target.value })}><option value="">Նշանակել այլ սենյակ (upgrade)…</option>{alts.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.t}</option>)}</Select> : <div className="text-bad">Ազատ սենյակ չկա․ կապվեք ալիքի և հյուրի հետ (relocation)</div>}
                </li>); })}</ul>
            )}
          </Card>
        </div>
      )}
      {tab === "mapping" && (
        <Card pad={false} className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead><tr className="border-b border-line text-left text-[12px] text-muted"><th className="px-4 py-2.5 font-medium">Hotel OS սենյակի տեսակ</th>{(Object.keys(CH) as OtaChannel[]).map((c) => <th key={c} className="font-medium">{CH[c]}</th>)}</tr></thead>
            <tbody>{ROOM_TYPES.map((t) => <tr key={t.id} className="border-b border-line last:border-0"><td className="px-4 py-2.5 font-medium">{t.name.hy} <span className="text-muted">({state.rooms.filter((r) => r.typeId === t.id).length})</span></td>{(Object.keys(CH) as OtaChannel[]).map((c) => <td key={c} className="font-mono text-[12px] text-ink-2">{c === "airbnb" && t.id !== "chalet" ? <span className="text-faint">—</span> : `${c.toUpperCase().slice(0, 3)}-${t.id.toUpperCase()}`}</td>)}</tr>)}</tbody>
          </table>
          <p className="border-t border-line px-4 py-3 text-[12px] text-muted">Ցուցադրական համապատասխանեցում։ Իրականում ID-ները գալիս են ալիքների կառավարչից․ գների և հասանելիության ուղարկումը (ARI push) աշխատում է միայն «dry-run» ռեժիմում, մինչև հաճախորդի հաստատումը։</p>
        </Card>
      )}
      {tab === "log" && (
        <Card pad={false}>
          <ul className="divide-y divide-line">{state.syncLog.slice(0, 60).map((l) => (
            <li key={l.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13px]", l.result === "failed" && "bg-bad-soft/40")}>
              <span className="w-28 text-[12px] text-muted">{stamp(l.at, state.baseDate)}</span>
              <span className="w-24 font-medium">{CH[l.channel]}</span>
              <span className="w-20 text-[12px] uppercase text-muted">{l.op}</span>
              <span className="font-mono text-[12px]">{l.externalId}</span>
              <span className="min-w-0 flex-1 truncate text-ink-2">{l.text}</span>
              <Badge tone={RES_TONE[l.result]}>{RES_LABEL[l.result]}</Badge>
              {l.result === "failed" && l.op === "import" && <Button size="sm" icon="refresh" onClick={() => dispatch({ type: "ota.import", booking: { ...demoOtaBooking(l.channel, 77, addDays(state.baseDate, 21), addDays(state.baseDate, 24), "family"), externalId: l.externalId } })}>Կրկնել</Button>}
            </li>))}
          </ul>
          <p className="border-t border-line px-4 py-3 text-[12px] text-muted">Յուրաքանչյուր գործողություն idempotent է․ նույն ամրագրման կրկնակի ստացումը նոր ամրագրում չի ստեղծում, իսկ ավտոմատացումները կատարվում են մեկ անգամ (idempotency key)։</p>
        </Card>
      )}
    </>
  );
}
