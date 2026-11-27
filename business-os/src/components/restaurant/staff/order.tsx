"use client";
/* Order detail with all staff actions (accept, reject, void, remake, serve, pickup, cancel), permission-checked. */
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, Button, cn, Input, Modal, type Tone } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { CHANNEL_HY, ORDER_STATUS_HY, STATION_HY, TICKET_STATUS_HY } from "@/lib/restaurant/staff-i18n";
import type { Order, OrderStatus } from "@/lib/restaurant/types";
import { hm, money, mins } from "./shell";

export const STATUS_TONE: Record<OrderStatus, Tone> = { submitted: "signal", accepted: "info", preparing: "warn", ready: "ok", served: "neutral", picked_up: "neutral", completed: "neutral", rejected: "bad", cancelled: "bad" };

export function OrderBadge({ o }: { o: Order }) {
  return <Badge tone={STATUS_TONE[o.status]} dot>{ORDER_STATUS_HY[o.status]}</Badge>;
}

export function SourceBadge({ o }: { o: Order }) {
  return <Badge tone={o.channel === "qr" ? "violet" : o.channel === "website" ? "info" : "neutral"}><Icon name={o.channel === "qr" ? "qr" : o.channel === "website" ? "globe" : "user"} size={12} />{CHANNEL_HY[o.channel]}</Badge>;
}

function Reason({ title, open, onClose, onOk, options }: { title: string; open: boolean; onClose: () => void; onOk: (r: string) => void; options: string[] }) {
  const [v, setV] = useState("");
  return (
    <Modal open={open} onClose={onClose} title={title} footer={<><Button variant="ghost" onClick={onClose}>Հետ</Button><Button variant="danger" disabled={!v.trim()} onClick={() => { onOk(v.trim()); setV(""); }}>Հաստատել</Button></>}>
      <div className="flex flex-wrap gap-2">{options.map((o) => <button key={o} onClick={() => setV(o)} className={cn("rounded-lg border px-3 py-1.5 text-[13px]", v === o ? "border-ink bg-ink text-white" : "border-line-2")}>{o}</button>)}</div>
      <Input className="mt-3" value={v} onChange={(e) => setV(e.target.value)} placeholder="Պատճառ" />
      <p className="mt-2 text-[12px] text-muted">Պատճառը գրանցվում է պատմության մեջ։ Եթե ուտեստն արդեն պատրաստվում էր, բաղադրիչները գրանցվում են որպես կորուստ։</p>
    </Modal>
  );
}

export function OrderDetail({ o, now, compact }: { o: Order; now: number; compact?: boolean }) {
  const { state, dispatch, can } = useR();
  const [dlg, setDlg] = useState<null | { kind: "reject" | "cancel" | "void" | "remake"; lineId?: string }>(null);
  const table = o.tableId ? state.tables.find((t) => t.id === o.tableId) : undefined;
  const tickets = state.tickets.filter((t) => t.orderId === o.id);
  const lineTicket = (id: string) => tickets.find((t) => t.lineIds.includes(id));
  const live = ["accepted", "preparing", "ready", "served"].includes(o.status);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[18px] font-semibold tracking-tight">{o.code}</span><OrderBadge o={o} /><SourceBadge o={o} />
        <span className="text-[13px] text-muted">{table ? `Սեղան ${table.label}` : `Տանելու · ${o.contact?.name ?? ""}`} · {hm(o.createdAt)} · {mins(o.createdAt, now)} ր</span>
      </div>
      {o.type === "takeaway" && o.contact && <div className="rounded-lg bg-paper px-3 py-2 text-[13px]"><Icon name="phone" size={13} className="mr-1 inline" />{o.contact.phone}{o.pickupAt && <> · վերցնելու ժամ՝ <b className="tnum">{hm(o.pickupAt)}</b></>}</div>}
      {o.note && <div className="rounded-lg bg-warn-soft px-3 py-2 text-[13px] text-warn">Նշում՝ {o.note}</div>}
      <ul className="divide-y divide-line rounded-xl border border-line">
        {o.lines.map((l) => {
          const t = lineTicket(l.id);
          return (
            <li key={l.id} className={cn("flex items-start gap-3 px-3 py-2.5", l.status === "voided" && "opacity-50")}>
              <span className="tnum w-6 shrink-0 text-[14px] font-semibold">{l.qty}×</span>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[14px] font-medium", l.status === "voided" && "line-through")}>{l.name}{l.remakeOf && <Badge tone="warn" className="ml-1.5">Վերապատրաստում</Badge>}</div>
                {l.modifiers.length > 0 && <div className="text-[12.5px] text-muted">{l.modifiers.map((m) => m.name).join(", ")}</div>}
                {l.note && <div className="text-[12.5px] italic text-signal">«{l.note}»</div>}
                {l.voidReason && <div className="text-[12px] text-bad">Չեղարկված՝ {l.voidReason}</div>}
                <div className="mt-0.5 text-[11.5px] text-faint">{STATION_HY[l.station]}{t ? ` · ${TICKET_STATUS_HY[t.status]}` : ""}</div>
              </div>
              <span className="tnum text-[13.5px]">{money(l.unitPrice * l.qty)}</span>
              {!compact && l.status === "active" && !l.remakeOf && (
                <div className="flex gap-1">
                  {can("orders.void") && ["submitted", "accepted", "preparing", "ready", "served"].includes(o.status) && <button className="grid size-7 place-items-center rounded-md text-muted hover:bg-bad-soft hover:text-bad" title="Չեղարկել դիրքը" onClick={() => setDlg({ kind: "void", lineId: l.id })}><Icon name="x" size={14} /></button>}
                  {can("orders.remake") && ["preparing", "ready", "served"].includes(o.status) && t && t.status !== "queued" && <button className="grid size-7 place-items-center rounded-md text-muted hover:bg-warn-soft hover:text-warn" title="Վերապատրաստել" onClick={() => setDlg({ kind: "remake", lineId: l.id })}><Icon name="refresh" size={14} /></button>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between text-[14px]"><span className="text-muted">Ընդամենը{o.fee ? ` (ներառյալ փաթեթավորում ${money(o.fee)})` : ""}</span><span className="tnum font-semibold">{money(o.total)}</span></div>
      <div className="flex flex-wrap gap-2">
        {o.status === "submitted" && can("orders.accept") && <><Button variant="ok" icon="check" onClick={() => dispatch({ type: "order.accept", orderId: o.id })}>Ընդունել և ուղարկել խոհանոց</Button><Button variant="danger" onClick={() => setDlg({ kind: "reject" })}>Մերժել</Button></>}
        {o.status === "ready" && o.type === "dine_in" && <Button variant="primary" icon="check" onClick={() => dispatch({ type: "order.serve", orderId: o.id })}>Մատուցված է</Button>}
        {o.status === "ready" && o.type === "takeaway" && <Button variant="primary" icon="check" onClick={() => dispatch({ type: "order.pickup", orderId: o.id })}>Վերցվեց (վճարված է POS-ում)</Button>}
        {live && can("orders.void") && !compact && <Button variant="ghost" onClick={() => setDlg({ kind: "cancel" })}>Չեղարկել պատվերը</Button>}
      </div>
      {!compact && (
        <ol className="space-y-1 border-t border-line pt-3 text-[12.5px] text-muted">
          {o.history.map((h, i) => <li key={i} className="flex gap-2"><span className="tnum w-11 text-faint">{hm(h.at)}</span><span className="text-ink-2">{ORDER_STATUS_HY[h.status]}</span><span>· {h.by}{h.note ? ` · ${h.note}` : ""}</span></li>)}
        </ol>
      )}
      <Reason open={dlg?.kind === "reject"} onClose={() => setDlg(null)} title="Մերժել պատվերը" options={["Ուտեստը վերջացել է", "Խոհանոցը ծանրաբեռնված է", "Կրկնակի պատվեր"]} onOk={(r) => { dispatch({ type: "order.reject", orderId: o.id, reason: r }); setDlg(null); }} />
      <Reason open={dlg?.kind === "cancel"} onClose={() => setDlg(null)} title="Չեղարկել պատվերը" options={["Հյուրը հրաժարվեց", "Սխալ սեղան", "Կրկնակի պատվեր"]} onOk={(r) => { dispatch({ type: "order.cancel", orderId: o.id, reason: r }); setDlg(null); }} />
      <Reason open={dlg?.kind === "void"} onClose={() => setDlg(null)} title="Չեղարկել դիրքը" options={["Հյուրը փոխեց պատվերը", "Սխալ է մուտքագրվել", "Ուտեստը վերջացել է"]} onOk={(r) => { dispatch({ type: "order.voidLine", orderId: o.id, lineId: dlg!.lineId!, reason: r }); setDlg(null); }} />
      <Reason open={dlg?.kind === "remake"} onClose={() => setDlg(null)} title="Վերապատրաստել ուտեստը" options={["Սխալ եփվածություն", "Սառն էր", "Սխալ հավելում", "Ալերգիայի նշումը բաց է թողնվել"]} onOk={(r) => { dispatch({ type: "order.remake", orderId: o.id, lineId: dlg!.lineId!, reason: r }); setDlg(null); }} />
    </div>
  );
}
