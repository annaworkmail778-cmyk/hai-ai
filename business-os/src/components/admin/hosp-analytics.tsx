"use client";
import Link from "next/link";
import { useMemo } from "react";
import type { Period } from "@/lib/analytics";
import { useNow } from "@/lib/client/use-now";
import { useDemo } from "@/lib/client/demo-store";
import { amd, amdShort, pct } from "@/lib/format";
import { DEPT_LABEL } from "@/lib/hospitality-data";
import { guestStats, loyaltyStats, restaurantStats, staffStats } from "@/lib/hospitality-analytics";
import type { Dept } from "@/lib/types";
import { Bars } from "../charts";
import { Button, Card, CardHead, Kpi } from "../ui";

export type Area = "guests" | "restaurant" | "staff" | "loyalty";
const ms = (d: string) => Date.parse(`${d}T00:00:00+04:00`);

function Formulas({ items }: { items: string[] }) {
  return (
    <details className="mt-4 rounded-xl border border-line bg-surface p-4 text-[13px] text-muted" open>
      <summary className="cursor-pointer font-medium text-ink">Ինչպես են հաշվարկվում</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">{items.map((x) => <li key={x}>{x}</li>)}<li>Բոլոր թվերը ցուցադրական են (գեներացված տվյալներ + ներկայացման ընթացքում ստեղծված իրադարձություններ)։</li></ul>
    </details>
  );
}

export function HospitalityAnalytics({ area, per }: { area: Area; per: Period }) {
  const { state } = useDemo();
  const now = useNow(60000);
  const from = ms(per.from), to = ms(per.to);
  const g = useMemo(() => guestStats(state, per), [state, per]);
  const r = useMemo(() => restaurantStats(state, from, to), [state, from, to]);
  const st = useMemo(() => staffStats(state, from, to), [state, from, to]);
  const lo = useMemo(() => loyaltyStats(state, now), [state, now]);
  if (area === "guests") return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Հյուրերի գոհունակություն" value={`${g.satisfaction.toFixed(2)} / 5`} sub={`${g.reviewCount} կարծիք`} icon="star" tone="ok" />
        <Kpi label="Վերադարձող հյուրեր" value={pct(g.returningRate)} sub={`${g.returning} / ${g.stays} կեցություն`} icon="refresh" />
        <Kpi label="Չներկայացում (no-show)" value={pct(g.noShowRate, 1)} sub={`${g.noShows} / ${g.due} սպասվող ժամանում`} icon="x" tone={g.noShowRate > 0.05 ? "bad" : undefined} />
        <Kpi label="Անդամների կեցություններ" value={pct(g.memberShare)} sub={`լրացուցիչ ծառայություններ՝ ${amdShort(g.extrasRevenue)}`} icon="users" tone="info" />
      </div>
      <Formulas items={[`Ժամանակահատված՝ ժամանումներ ${per.from}-ից մինչև ${per.to} (չներառյալ)`, "Գոհունակություն = կարծիք թողած կեցությունների միջին գնահատական (1–5)", "Վերադարձող = կեցություններ, որոնց հյուրը նախկինում ունեցել է ավարտված կեցություն ÷ բոլոր կեցությունները", "No-show = «չներկայացած» ÷ մինչև այսօր սպասվող ժամանումներ (հաստատված, ներսում, մեկնած, չներկայացած)", "Անդամների կեցություններ = Pine Ridge Circle անդամների կեցություններ ÷ բոլոր կեցությունները"]} />
    </>
  );
  if (area === "restaurant") return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ռեստորանի եկամուտ" value={amdShort(r.revenue)} sub={`${r.orders} ավարտված պատվեր`} icon="coffee" />
        <Kpi label="Միջին չեկ" value={amd(r.avgCheck)} icon="calc" />
        <Kpi label="Միջին պատրաստման ժամանակ" value={`${r.avgPrepMin.toFixed(0)} ր`} sub="ընդունում → պատրաստ" icon="clock" />
        <Kpi label="Մերժված / չեղարկված" value={pct(r.lossRate, 1)} sub={`զեղչեր՝ ${amdShort(r.discount)}`} icon="x" tone={r.lossRate > 0.08 ? "bad" : undefined} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="Եկամուտն ըստ տեսակի" /><div className="mt-3"><Bars format={amd} data={[{ label: "Սենյակային սպասարկում", value: r.byType.room_service }, { label: "Սրահում", value: r.byType.dine_in }, { label: "Վերցնել", value: r.byType.takeaway }]} /></div></Card>
        <Card><CardHead title="Մանրամասներ" right={<Link href="/admin/restaurant"><Button size="sm">Ռեստորան</Button></Link>} /><p className="mt-3 text-[13px] text-muted">Ամենավաճառվող ուտեստները, մենյուն և սեղանները՝ «Ռեստորան և մենյու» բաժնում։</p></Card>
      </div>
      <Formulas items={[`Պատվերներ, որոնք ստեղծվել են ${per.from}-ից մինչև ${per.to}`, `Եկամուտ = ավարտված պատվերների գումար զեղչերից հետո; Միջին չեկ = ${amd(r.revenue)} ÷ ${r.orders}`, "Տեսակների գումարը հավասար է ընդհանուր եկամտին", "Պատրաստման ժամանակ = «ընդունված» → «պատրաստ» միջին րոպեները", "Կորուստ = (մերժված + չեղարկված) ÷ փակված պատվերներ"]} />
    </>
  );
  if (area === "staff") return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Հյուրերի հարցումներ" value={st.requests} sub={`${st.completed} կատարված`} icon="qr" />
        <Kpi label="Միջին արձագանք" value={`${st.avgResponseMin.toFixed(0)} ր`} sub="հարցումից մինչև առաջին գործողություն" icon="zap" />
        <Kpi label="Միջին կատարում" value={`${st.avgCompletionMin.toFixed(0)} ր`} icon="clock" />
        <Kpi label="Ժամկետանց առաջադրանքներ" value={st.overdue} icon="alert" tone={st.overdue ? "bad" : "ok"} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="Հարցումներ ըստ բաժնի" /><div className="mt-3"><Bars data={st.byDept.map(([d, n]) => ({ label: DEPT_LABEL[d as Dept], value: n }))} tone="info" /></div></Card>
        <Card><CardHead title="Onboarding" right={<Link href="/admin/team"><Button size="sm">Թիմ</Button></Link>} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">{[["Առաջընթաց", pct(st.onboardingProgress)], ["Հաստատված մոդուլ", `${st.modulesApproved}/${st.modulesTotal}`], ["Սպասում է ստուգման", String(st.awaitingReview)]].map(([l, v]) => <div key={l} className="rounded-xl bg-paper p-3"><div className="tnum text-[18px] font-semibold">{v}</div><div className="text-[12px] text-muted">{l}</div></div>)}</div>
        </Card>
      </div>
      <Formulas items={["Արձագանք = հարցման ստեղծումից մինչև առաջին գործողությունը (նշանակում/սկսում) միջին րոպեները", "Կատարում = հարցումից մինչև «կատարված» միջին րոպեները", "Ժամկետանց = չավարտված մաքրության և անձնակազմի առաջադրանքներ, որոնց ժամկետը անցել է", "Onboarding առաջընթաց = կատարված քայլեր ÷ նշանակված քայլեր"]} />
    </>
  );
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Անդամներ" value={lo.members} sub={`${lo.active90} ակտիվ (90 օր)`} icon="users" />
        <Kpi label="Չօգտագործված միավորներ" value={lo.outstanding.toLocaleString("en-US")} sub={`≈ ${amdShort(lo.liability)}`} icon="star" tone="warn" />
        <Kpi label="Կրկնվող այց․ (անդամներ)" value={pct(lo.repeatMembers)} sub={`ոչ անդամներ՝ ${pct(lo.repeatNonMembers)}`} icon="refresh" tone="ok" />
        <Kpi label="Օգտագործված վաուչերներ" value={lo.vouchers.used} sub={`${lo.vouchers.active} ակտիվ`} icon="check" />
      </div>
      <Card className="mt-4"><CardHead title="Մանրամասն կառավարում" right={<Link href="/admin/loyalty"><Button size="sm">Հավատարմություն</Button></Link>} /><p className="mt-2 text-[13px] text-muted">Մակարդակներ, արշավներ, կանոններ և անդամների ցուցակ՝ «Հավատարմություն» բաժնում։ Կրկնվող այցելության տարբերությունը համեմատություն է, ոչ թե պատճառահետևանքային ապացույց։</p></Card>
    </>
  );
}
