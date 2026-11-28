"use client";
/*
 * Guest CRM & loyalty. Profiles are created from orders, reservations and chats (fictional demo guests only).
 * Marketing consent is explicit and recorded with source and time; no campaign is sent from the demo.
 * Points are earned once per completed order (idempotent ledger key), tiers are configurable.
 */
import { useMemo, useState } from "react";
import { Guard, money } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Drawer, Input, Kpi, Toggle, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import type { Customer } from "@/lib/restaurant/types";

const mask = (p: string) => p.replace(/\d(?=\d{2})/g, "•");
const day = (ms?: number) => (ms ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", day: "2-digit", month: "short" }).format(ms) : "—");

export default function Customers() {
  const { state, dispatch, can } = useR();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<"all" | "vip" | "lapsed" | "new" | "consent" | "diet">("all");
  const [sel, setSel] = useState<Customer | null>(null);
  const [notes, setNotes] = useState("");
  const [diet, setDiet] = useState("");
  const now = state.epochAt;
  const segs = useMemo(() => ({
    all: (c: Customer) => Boolean(c),
    vip: (c: Customer) => c.tier === "gold" || c.tags.includes("VIP"),
    lapsed: (c: Customer) => c.visits >= 2 && (c.lastVisit ?? 0) < now - 45 * 86400000,
    new: (c: Customer) => c.firstSeen > now - 14 * 86400000,
    consent: (c: Customer) => c.consent.marketing,
    diet: (c: Customer) => Boolean(c.dietary),
  }), [now]);
  const list = state.customers.filter(segs[seg]).filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~")).sort((a, b) => b.spend - a.spend);
  const cur = sel ? state.customers.find((c) => c.id === sel.id) : undefined;
  const ledger = cur ? state.loyalty.ledger.filter((l) => l.customerId === cur.id).slice(-10).reverse() : [];
  const repeat = state.customers.filter((c) => c.visits >= 2).length;

  return (
    <Guard perm="crm.view">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Հաճախորդներ և լոյալություն</h1><p className="mt-1 text-[13.5px] text-muted">Պրոֆիլները ստեղծվում են պատվերներից, ամրագրումներից և չատից։ Բոլոր հաճախորդները ցուցադրական են։ Մարքեթինգային հաղորդագրություններ չեն ուղարկվում։</p></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Պրոֆիլներ" value={state.customers.length} icon="users" />
        <Kpi label="Կրկնվող հյուրեր" value={`${Math.round((repeat / Math.max(1, state.customers.length)) * 100)}%`} sub={`${repeat} հյուր ≥ 2 այց`} icon="refresh" />
        <Kpi label="Մարքեթինգի համաձայնություն" value={state.customers.filter((c) => c.consent.marketing).length} sub="միայն բացահայտ համաձայնությամբ" icon="check" tone="ok" />
        <Kpi label="Վերադարձնելու թեկնածուներ" value={state.customers.filter(segs.lapsed).length} sub="≥ 2 այց, 45+ օր չեն եկել" icon="clock" tone="warn" onClick={() => setSeg("lapsed")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card pad={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
            {([["all", "Բոլորը"], ["vip", "VIP / Gold"], ["lapsed", "Վերադարձնել"], ["new", "Նոր"], ["consent", "Համաձայնությամբ"], ["diet", "Սննդակարգ"]] as [typeof seg, string][]).map(([k, l]) => <button key={k} onClick={() => setSeg(k)} className={cn("h-8 rounded-lg px-2.5 text-[12.5px] font-medium", seg === k ? "bg-ink text-white" : "bg-paper")}>{l}</button>)}
            <Input className="ml-auto h-8 w-48" placeholder="Անուն կամ հեռախոս" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-[13px]">
            <thead className="text-left text-[11.5px] uppercase tracking-wide text-muted"><tr><th className="px-3 py-2">Հյուր</th><th>Մակարդակ</th><th className="text-right">Այցեր</th><th className="text-right">Ծախս</th><th className="text-right">Միավոր</th><th className="px-3">Վերջին այց</th></tr></thead>
            <tbody className="divide-y divide-line">{list.slice(0, 60).map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-paper" onClick={() => { setSel(c); setNotes(c.notes ?? ""); setDiet(c.dietary ?? ""); }}>
                <td className="px-3 py-2"><div className="font-medium">{c.name}</div><div className="text-[11.5px] text-muted">{mask(c.phone)} · {c.lang.toUpperCase()}{c.dietary ? ` · ⚠ ${c.dietary}` : ""}</div></td>
                <td><Badge tone={c.tier === "gold" ? "signal" : c.tier === "silver" ? "info" : "neutral"}>{c.tier}</Badge>{c.tags.slice(0, 2).map((t) => <Badge key={t} className="ml-1">{t}</Badge>)}</td>
                <td className="tnum text-right">{c.visits}</td><td className="tnum text-right">{money(c.spend)}</td><td className="tnum text-right">{c.points}</td><td className="px-3 text-muted">{day(c.lastVisit)}</td>
              </tr>
            ))}</tbody>
          </table></div>
          {list.length > 60 && <p className="p-3 text-[12px] text-muted">Ցուցադրված է 60 / {list.length}</p>}
        </Card>
        <Card>
          <CardHead title="Լոյալության ծրագիր" sub="Կարգավորվող կանոններ" icon="star" />
          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between"><span>Միացված</span><Toggle on={state.loyalty.enabled} disabled={!can("team.manage")} label="Լոյալություն" onChange={(v) => dispatch({ type: "loyalty.config", enabled: v })} /></div>
            <div className="flex items-center justify-between gap-2"><span>Միավոր յուրաքանչյուր 1 000 ֏-ի համար</span><div className="flex items-center gap-1"><Button size="sm" variant="secondary" disabled={!can("team.manage")} onClick={() => dispatch({ type: "loyalty.config", earnPer1000: Math.max(0, state.loyalty.earnPer1000 - 1) })}>−</Button><span className="tnum w-6 text-center font-semibold">{state.loyalty.earnPer1000}</span><Button size="sm" variant="secondary" disabled={!can("team.manage")} onClick={() => dispatch({ type: "loyalty.config", earnPer1000: state.loyalty.earnPer1000 + 1 })}>+</Button></div></div>
            <ul className="space-y-1">{state.loyalty.tiers.map((t) => <li key={t.id} className="flex justify-between rounded-lg bg-paper px-2 py-1.5"><span className="font-medium">{t.name}</span><span className="tnum text-muted">≥ {t.min} միավոր</span></li>)}</ul>
            <p className="text-[12px] text-muted">Միավորները հաշվարկվում են մեկ անգամ յուրաքանչյուր փակված պատվերի համար (կրկնակի հաշվարկ չի լինում)։ Կանխիկացում դեռ չկա. պլանավորված է։</p>
          </div>
        </Card>
      </div>
      <Drawer open={Boolean(cur)} onClose={() => setSel(null)} title={cur?.name ?? ""} sub={cur ? `${cur.phone} · ${cur.tier} · ${cur.points} միավոր` : ""}
        footer={cur && <Button variant="primary" onClick={() => dispatch({ type: "customer.update", customerId: cur.id, notes, dietary: diet })}>Պահպանել</Button>}>
        {cur && <div className="space-y-4 text-[13px]">
          <div className="grid grid-cols-3 gap-2"><Kpi label="Այցեր" value={cur.visits} /><Kpi label="Ծախս" value={money(cur.spend)} /><Kpi label="Պատվերներ" value={cur.orders} /></div>
          <div><div className="mb-1 font-semibold text-muted">Սիրելի ուտեստներ</div>{cur.favourites.length ? cur.favourites.map((f) => <Badge key={f} className="mr-1">{state.items.find((i) => i.id === f)?.name.hy ?? f}</Badge>) : "—"}</div>
          <label className="block"><span className="font-semibold text-muted">Ալերգիա / սննդակարգ</span><Input value={diet} onChange={(e) => setDiet(e.target.value)} /></label>
          <label className="block"><span className="font-semibold text-muted">Նշումներ</span><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          <div className="flex items-center justify-between rounded-xl border border-line p-3"><div><div className="font-semibold">Մարքեթինգային համաձայնություն</div><div className="text-[12px] text-muted">{cur.consent.marketing ? "Տրված" : "Չի տրված"} · {cur.consent.source} · {day(cur.consent.at)}</div></div><Toggle on={cur.consent.marketing} label="Համաձայնություն" onChange={(v) => dispatch({ type: "customer.update", customerId: cur.id, consent: v })} /></div>
          <div><div className="mb-1 font-semibold text-muted">Միավորների պատմություն</div><ul className="divide-y divide-line">{ledger.map((l) => <li key={l.key} className="flex justify-between py-1.5"><span>{l.reason}</span><span className="tnum text-ok">+{l.points}</span></li>)}{!ledger.length && <li className="text-muted">—</li>}</ul></div>
          <div><div className="mb-1 font-semibold text-muted">Ամրագրումներ</div><ul>{state.reservations.filter((r) => r.customerId === cur.id).map((r) => <li key={r.id} className="text-muted">{r.code} · {day(r.at)} · {r.partySize} · {r.status}</li>)}</ul></div>
        </div>}
      </Drawer>
    </Guard>
  );
}
