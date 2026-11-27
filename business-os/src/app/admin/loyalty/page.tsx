"use client";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Bars } from "@/components/charts";
import { Avatar, Badge, Button, Card, CardHead, DemoDataBadge, Field, Input, Kpi, Modal, Select, Tabs, Textarea, Toggle } from "@/components/ui";
import { useNow } from "@/lib/client/use-now";
import { useDemo } from "@/lib/client/demo-store";
import { amd, stamp } from "@/lib/format";
import { loyaltyStats } from "@/lib/hospitality-analytics";
import { loyaltyOf } from "@/lib/rules";

export default function Loyalty() {
  const { state, dispatch } = useDemo();
  const [tab, setTab] = useState<"overview" | "members" | "campaigns" | "rules">("overview");
  const [create, setCreate] = useState(false);
  const [cf, setCf] = useState({ title: "", text: "", pct: "10", appliesTo: "order" as "stay" | "order", tierIds: state.loyalty.tiers.map((t) => t.id) });
  const now = useNow(60000);
  const s = useMemo(() => loyaltyStats(state, now), [state, now]);
  const members = useMemo(() => state.accounts.map((a) => ({ a, g: state.guests.find((x) => x.id === a.guestId)!, lo: loyaltyOf(state, a.guestId) })).sort((x, y) => y.lo.lifetime - x.lo.lifetime), [state]);
  const tierName = (id: string) => state.loyalty.tiers.find((t) => t.id === id)?.name.hy ?? id;
  return (
    <>
      <PageTitle title={`Հավատարմության ծրագիր · ${state.loyalty.programName}`} sub={<span className="flex flex-wrap items-center gap-2">Անդամներ, մակարդակներ, միավորներ, պարգևներ և արշավներ <DemoDataBadge /></span>} right={<Button variant="primary" icon="plus" onClick={() => setCreate(true)}>Նոր արշավ</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Անդամներ" value={s.members} sub={`${s.active90} ակտիվ վերջին 90 օրում`} icon="users" />
        <Kpi label="Չօգտագործված միավորներ" value={s.outstanding.toLocaleString("en-US")} sub={`≈ ${amd(s.liability)} պարտավորություն`} icon="star" tone="warn" />
        <Kpi label="Տրված / օգտագործված (30 օր)" value={`${s.issued30.toLocaleString("en-US")} / ${s.redeemed30.toLocaleString("en-US")}`} icon="refresh" />
        <Kpi label="Կրկնվող այցելություն" value={`${Math.round(s.repeatMembers * 100)}%`} sub={`ոչ անդամներ՝ ${Math.round(s.repeatNonMembers * 100)}%`} icon="chart" tone="ok" />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "overview", label: "Ամփոփում" }, { id: "members", label: "Անդամներ", count: s.members }, { id: "campaigns", label: "Արշավներ և պարգևներ" }, { id: "rules", label: "Կանոններ" }]} />

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHead title="Անդամներն ըստ մակարդակի" /><div className="mt-3"><Bars data={s.tiers.map((t) => ({ label: `${t.tier.name.hy} (${t.tier.minPoints.toLocaleString("en-US")}+ միավոր, −${t.tier.discountPct}%)`, value: t.count }))} tone="signal" /></div></Card>
          <Card><CardHead title="Վաուչերներ" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">{[["Ակտիվ", s.vouchers.active], ["Ամրագրված", s.vouchers.reserved], ["Օգտագործված", s.vouchers.used]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-paper p-3"><div className="tnum text-[20px] font-semibold">{v}</div><div className="text-[12px] text-muted">{l}</div></div>)}</div>
            <ul className="mt-4 space-y-1.5 text-[12.5px] text-muted">
              <li><b className="text-ink-2">Չօգտագործված միավորներ</b> = Σ անդամների մնացորդներ = տրված ({s.issuedAll.toLocaleString("en-US")}) − օգտագործված ({s.redeemedAll.toLocaleString("en-US")}) = {s.outstanding.toLocaleString("en-US")}</li>
              <li><b className="text-ink-2">Պարտավորություն</b> = միավորներ × {s.amdPerPoint.toFixed(0)} ֏ (ամենաէժան «գումարային» պարգևի ֏/միավոր հարաբերակցությունը)</li>
              <li><b className="text-ink-2">Կրկնվող այցելություն</b> = ≥2 ավարտված կեցությամբ հյուրեր ÷ ≥1 ավարտված կեցությամբ հյուրեր</li>
              <li>Միավորները տրվում են միայն <b className="text-ink-2">ավարտված</b> կեցությունների (check-out) և <b className="text-ink-2">ավարտված</b> պատվերների համար՝ զեղչից հետո գումարից։</li>
            </ul>
          </Card>
          <Card className="lg:col-span-2" pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Վերջին գործարքները" /></div>
            <ul className="divide-y divide-line">{[...state.ledger].sort((a, b) => b.at - a.at).slice(0, 12).map((e) => { const g = state.guests.find((x) => x.id === e.guestId); return <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]"><span className="flex-1">{g?.firstName} {g?.lastName} · <span className="text-muted">{e.reason}</span></span><span className="text-muted">{stamp(e.at, state.baseDate)}</span><span className={`tnum w-20 text-right font-semibold ${e.points < 0 ? "text-bad" : "text-ok"}`}>{e.points > 0 ? "+" : ""}{e.points}</span></li>; })}</ul>
          </Card>
        </div>
      )}

      {tab === "members" && (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {members.slice(0, 60).map(({ a, g, lo }) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <Avatar initials={`${g.firstName[0]}${g.lastName[0] ?? ""}`} />
                <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">{g.firstName} {g.lastName}{g.tags.includes("VIP") && <Badge tone="warn" className="ml-2">VIP</Badge>}</div><div className="truncate text-[12px] text-muted">{a.email} · {state.reservations.filter((r) => r.guestId === g.id && r.status === "checked_out").length} կեցություն · մարքեթինգ՝ {a.consent.marketing ? "այո" : "ոչ"}</div></div>
                <span className="flex items-center gap-1.5 text-[13px]"><span className="size-2.5 rounded-full" style={{ background: lo.tier.color }} />{lo.tier.name.hy}</span>
                <span className="tnum w-24 text-right text-[13.5px] font-semibold">{lo.balance.toLocaleString("en-US")}</span>
                <span className="tnum w-28 text-right text-[12px] text-muted">ընդամենը {lo.lifetime.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "campaigns" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Արշավներ (անձնական առաջարկներ)" sub="Ցուցադրվում են համապատասխան մակարդակի անդամների անձնական էջում և ավտոմատ կիրառվում" /></div>
            <ul className="divide-y divide-line">{state.campaigns.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">{c.title.hy} · −{c.discountPct}% {c.appliesTo === "stay" ? "կեցության" : "պատվերի"}</div><div className="text-[12px] text-muted">{c.tierIds.length === state.loyalty.tiers.length ? "Բոլոր մակարդակները" : c.tierIds.map(tierName).join(", ")} · կիրառվել է {c.uses} անգամ</div></div>
                <Toggle on={c.active} onChange={(v) => dispatch({ type: "campaign.toggle", target: c.id, active: v })} label={c.active ? "Ակտիվ" : "Անջատված"} />
              </li>))}
            </ul>
          </Card>
          <Card pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Պարգևներ (միավորների դիմաց)" /></div>
            <ul className="divide-y divide-line">{state.rewards.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-[13.5px]"><span className="flex-1"><span className="font-medium">{r.name.hy}</span><span className="block text-[12px] text-muted">{r.appliesTo === "stay" ? "Կեցություն" : "Ռեստորան"}{r.minTier ? ` · ${tierName(r.minTier)}+` : ""}</span></span><span className="tnum font-semibold">{r.cost.toLocaleString("en-US")} միավոր</span></li>))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "rules" && (
        <Card>
          <CardHead title="Միավորների կանոններ" sub="Փոփոխությունները կիրառվում են նոր գործարքների վրա" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Միավոր յուրաքանչյուր 1 000 ֏-ի համար"><Input inputMode="numeric" value={state.loyalty.earnPer1000} onChange={(e) => { const v = +e.target.value.replace(/\D/g, ""); if (v >= 0 && v <= 100) dispatch({ type: "loyalty.config", patch: { earnPer1000: v } }); }} /></Field>
            <Field label="Գրանցման բոնուս"><Input inputMode="numeric" value={state.loyalty.welcomeBonus} onChange={(e) => { const v = +e.target.value.replace(/\D/g, ""); if (v >= 0 && v <= 5000) dispatch({ type: "loyalty.config", patch: { welcomeBonus: v } }); }} /></Field>
            <div className="flex flex-col gap-3"><Toggle on={state.loyalty.eligible.stays} onChange={(v) => dispatch({ type: "loyalty.config", patch: { eligible: { ...state.loyalty.eligible, stays: v } } })} label="Միավորներ ավարտված կեցությունների համար" /><Toggle on={state.loyalty.eligible.orders} onChange={(v) => dispatch({ type: "loyalty.config", patch: { eligible: { ...state.loyalty.eligible, orders: v } } })} label="Միավորներ ավարտված պատվերների համար" /></div>
          </div>
          <table className="mt-6 w-full text-[13px]"><thead><tr className="border-b border-line text-left text-[12px] text-muted"><th className="py-2 font-medium">Մակարդակ</th><th className="py-2 font-medium">Շեմ (ընդհանուր միավոր)</th><th className="py-2 font-medium">Զեղչ կեցության համար</th><th className="py-2 font-medium">Առավելություններ</th></tr></thead>
            <tbody>{state.loyalty.tiers.map((t) => <tr key={t.id} className="border-b border-line last:border-0"><td className="py-2.5 font-medium"><span className="mr-2 inline-block size-2.5 rounded-full" style={{ background: t.color }} />{t.name.hy}</td><td className="tnum">{t.minPoints.toLocaleString("en-US")}</td><td>{t.discountPct}%</td><td className="text-muted">{t.benefits.map((b) => b.hy).join(" · ")}</td></tr>)}</tbody>
          </table>
        </Card>
      )}

      <Modal open={create} onClose={() => setCreate(false)} title="Նոր արշավ" footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Չեղարկել</Button><Button variant="primary" disabled={!cf.title.trim() || !(+cf.pct > 0 && +cf.pct <= 30) || !cf.tierIds.length} onClick={() => { dispatch({ type: "campaign.create", title: cf.title.trim(), text: cf.text.trim(), tierIds: cf.tierIds, discountPct: +cf.pct, appliesTo: cf.appliesTo }); setCreate(false); setTab("campaigns"); }}>Ստեղծել</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Վերնագիր" className="sm:col-span-2"><Input value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })} /></Field>
          <Field label="Տեքստ" className="sm:col-span-2"><Textarea value={cf.text} onChange={(e) => setCf({ ...cf, text: e.target.value })} /></Field>
          <Field label="Զեղչ (%)" hint="1–30"><Input inputMode="numeric" value={cf.pct} onChange={(e) => setCf({ ...cf, pct: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Կիրառվում է"><Select value={cf.appliesTo} onChange={(e) => setCf({ ...cf, appliesTo: e.target.value as "stay" | "order" })}><option value="order">Ռեստորանի պատվերներ</option><option value="stay">Կեցություններ</option></Select></Field>
          <div className="sm:col-span-2"><div className="mb-1.5 text-[12.5px] font-medium text-ink-2">Մակարդակներ</div><div className="flex flex-wrap gap-3">{state.loyalty.tiers.map((t) => <label key={t.id} className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={cf.tierIds.includes(t.id)} onChange={(e) => setCf({ ...cf, tierIds: e.target.checked ? [...cf.tierIds, t.id] : cf.tierIds.filter((x) => x !== t.id) })} />{t.name.hy}</label>)}</div></div>
        </div>
      </Modal>
    </>
  );
}
