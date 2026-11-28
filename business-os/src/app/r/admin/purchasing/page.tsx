"use client";
/* Purchasing: rule-based replenishment suggestions, purchase orders, partial receiving with price variance. */
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Guard, hm, money } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Input, Modal, SimBadge } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";
import type { PurchaseOrder } from "@/lib/restaurant/types";

const STATUS: Record<PurchaseOrder["status"], [string, "neutral" | "info" | "warn" | "ok" | "bad"]> = { draft: ["Սևագիր", "neutral"], pending_approval: ["Սպասում է հաստատման", "warn"], approved: ["Հաստատված", "info"], sent: ["Ուղարկված", "info"], partial: ["Մասնակի ստացված", "warn"], received: ["Ստացված", "ok"], cancelled: ["Չեղարկված", "bad"] };

function Receive({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
  const { state, dispatch } = useR();
  const [lines, setLines] = useState(po.lines.map((l) => ({ ingredientId: l.ingredientId, qty: String(Math.max(0, l.qty - l.received)), cost: String(state.ingredients.find((i) => i.id === l.ingredientId)!.cost) })));
  return (
    <Modal open onClose={onClose} size="lg" title={`Ստանալ ${po.code}`} footer={<><Button variant="ghost" onClick={onClose}>Հետ</Button><Button variant="ok" icon="check" onClick={() => { dispatch({ type: "po.receive", poId: po.id, lines: lines.map((l) => ({ ingredientId: l.ingredientId, qty: Number(l.qty), cost: Number(l.cost) })) }); onClose(); }}>Գրանցել ստացումը</Button></>}>
      <p className="mb-3 text-[13px] text-muted">Մուտքագրեք փաստացի ստացված քանակը և հաշիվ-ապրանքագրի գինը։ Գնի փոփոխությունը ավտոմատ վերահաշվարկում է բոլոր բաղադրատոմսերը։</p>
      <table className="w-full text-[13px]"><thead className="text-left text-[11.5px] text-muted"><tr><th className="py-1">Բաղադրիչ</th><th className="py-1">Պատվիրված</th><th className="py-1">Ստացված</th><th className="py-1">Գին (հաշիվ)</th></tr></thead>
        <tbody>{lines.map((l, i) => { const ing = state.ingredients.find((x) => x.id === l.ingredientId)!; const pl = po.lines[i]; return (
          <tr key={l.ingredientId} className="border-t border-line"><td className="py-2 font-medium">{ing.name}</td><td className="tnum py-2 text-muted">{pl.qty} {ing.purchaseUnit} {pl.received ? `(արդեն՝ ${pl.received})` : ""}</td>
            <td className="py-2"><Input className="h-8 w-24" type="number" value={l.qty} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} /></td>
            <td className="py-2"><Input className="h-8 w-28" type="number" value={l.cost} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, cost: e.target.value } : x)))} />{Number(l.cost) !== ing.cost && <span className={`ml-2 text-[12px] ${Number(l.cost) > ing.cost ? "text-bad" : "text-ok"}`}>{Number(l.cost) > ing.cost ? "▲" : "▼"} {money(Math.abs(Number(l.cost) - ing.cost))}</span>}</td></tr>
        ); })}</tbody></table>
    </Modal>
  );
}

export default function Purchasing() {
  const { state, dispatch } = useR();
  const [rec, setRec] = useState<PurchaseOrder | null>(null);
  const stock = useMemo(() => A.stockStatus(state), [state]);
  const onOrder = (id: string) => state.pos.filter((p) => p.status === "sent" || p.status === "partial" || p.status === "draft").flatMap((p) => p.lines).filter((l) => l.ingredientId === id).reduce((a, l) => a + (l.qty - l.received), 0);
  const suggestions = stock.filter((x) => x.low).map((x) => {
    const need = Math.max(0, x.ingredient.parLevel - x.qty) / x.ingredient.unitsPerPurchase - onOrder(x.ingredient.id);
    return { ...x, units: Math.max(0, Math.ceil(need * 10) / 10) };
  }).filter((x) => x.units > 0);
  const bySupplier = state.suppliers.map((s) => ({ s, items: suggestions.filter((x) => x.ingredient.supplierId === s.id) })).filter((x) => x.items.length);
  return (
    <Guard perm="purchasing.manage">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Գնումներ</h1><p className="mt-1 text-[13.5px] text-muted">Առաջարկները հաշվարկվում են կանոնով՝ (նպատակային պաշար − առկա պաշար) − արդեն պատվիրված, ըստ մատակարարի։</p></div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHead title="Լրացման առաջարկներ" sub={`${suggestions.length} բաղադրիչ նվազագույնից ցածր է`} icon="sparkles" />
          {!bySupplier.length && <p className="py-6 text-center text-[13px] text-muted">Բոլոր բաղադրիչները նորմայի սահմաններում են կամ արդեն պատվիրված են</p>}
          <div className="space-y-3">{bySupplier.map(({ s, items }) => (
            <div key={s.id} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{s.name}</span><span className="text-[12px] text-muted">Առաքում՝ {s.deliveryDays} · {s.leadDays} օր</span>
                <Button size="sm" variant="primary" className="ml-auto" icon="plus" onClick={() => dispatch({ type: "po.create", supplierId: s.id, lines: items.map((x) => ({ ingredientId: x.ingredient.id, qty: x.units })) })}>Ստեղծել պատվեր</Button></div>
              <ul className="mt-2 space-y-1 text-[13px]">{items.map((x) => <li key={x.ingredient.id} className="flex justify-between"><span>{x.ingredient.name}</span><span className="tnum text-muted">{x.units} {x.ingredient.purchaseUnit} × {money(x.ingredient.cost)} = <b className="text-ink">{money(x.units * x.ingredient.cost)}</b></span></li>)}</ul>
            </div>
          ))}</div>
        </Card>
        <Card>
          <CardHead title="Գնման պատվերներ" sub="Ուղարկումը մատակարարին՝ սիմուլյացիա" icon="car" />
          {!state.pos.length && <p className="py-6 text-center text-[13px] text-muted">Այս ցուցադրության ընթացքում պատվերներ դեռ չկան</p>}
          <ul className="space-y-3">{state.pos.map((p) => (
            <li key={p.id} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{p.code}</span><Badge tone={STATUS[p.status][1]}>{STATUS[p.status][0]}</Badge><span className="text-[12.5px] text-muted">{state.suppliers.find((s) => s.id === p.supplierId)?.name} · {hm(p.createdAt)}</span>
                <span className="ml-auto flex gap-2">{p.status === "draft" && <Button size="sm" variant="primary" icon="send" onClick={() => dispatch({ type: "po.send", poId: p.id })}>Ուղարկել</Button>}{(p.status === "sent" || p.status === "partial") && <Button size="sm" variant="ok" icon="check" onClick={() => setRec(p)}>Ստանալ</Button>}</span></div>
              <ul className="mt-2 space-y-0.5 text-[12.5px] text-muted">{p.lines.map((l) => { const ing = state.ingredients.find((i) => i.id === l.ingredientId)!; return <li key={l.ingredientId} className="flex justify-between"><span>{ing.name}</span><span className="tnum">{l.received}/{l.qty} {ing.purchaseUnit} · {money(l.cost)}</span></li>; })}</ul>
              {p.status !== "draft" && <div className="mt-2"><SimBadge /></div>}
            </li>
          ))}</ul>
        </Card>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-faint"><Icon name="info" size={13} />Մատակարարները ցուցադրական են։ Պատվերը մատակարարին չի ուղարկվում (Telegram/էլ. փոստ՝ սիմուլյացիա)։</p>
      {rec && <Receive po={rec} onClose={() => setRec(null)} />}
    </Guard>
  );
}
