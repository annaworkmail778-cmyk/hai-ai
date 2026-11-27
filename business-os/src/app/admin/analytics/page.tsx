"use client";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { BarLine, Donut, HBar } from "@/components/charts";
import { Icon } from "@/components/icons";
import { HospitalityAnalytics, type Area } from "@/components/admin/hosp-analytics";
import { Badge, Card, CardHead, DemoDataBadge, Kpi, Segmented, Tabs } from "@/components/ui";
import { computeKpis, DIRECT_SOURCES, periods } from "@/lib/analytics";
import { useDemo } from "@/lib/client/demo-store";
import { addDays } from "@/lib/dates";
import { amd, amdShort, dShort, pct, SOURCE_LABEL } from "@/lib/format";
import { roomType } from "@/lib/hotel-data";

type P = "last30" | "last90" | "next30";

export default function Analytics() {
  const { state } = useDemo();
  const [p, setP] = useState<P>("last30");
  const [area, setArea] = useState<Area | "rooms">("rooms");
  const per = periods(state.baseDate)[p];
  const k = useMemo(() => computeKpis(state, per), [state, per]);
  const prev = useMemo(() => (p === "next30" ? null : computeKpis(state, { from: addDays(per.from, -(p === "last30" ? 30 : 90)), to: per.from, label: "" })), [state, per, p]);
  const delta = (a: number, b?: number) => (b ? (a - b) / b : 0);
  const trend = (a: number, b?: number) => (prev && b ? <span className={delta(a, b) >= 0 ? "text-ok" : "text-bad"}>{delta(a, b) >= 0 ? "▲" : "▼"} {pct(Math.abs(delta(a, b)), 1)} նախորդ շրջանից</span> : undefined);
  const weekly = p === "last90";
  const chart = useMemo(() => {
    if (!weekly) return k.daily.map((d) => ({ label: dShort(d.date).split(" ")[0], bar: d.revenue, line: d.occupancy, highlight: d.date === state.baseDate }));
    const out: { label: string; bar: number; line: number }[] = [];
    for (let i = 0; i < k.daily.length; i += 7) { const w = k.daily.slice(i, i + 7); out.push({ label: dShort(w[0].date), bar: w.reduce((a, d) => a + d.revenue, 0), line: w.reduce((a, d) => a + d.occupancy, 0) / w.length }); }
    return out;
  }, [k, weekly, state.baseDate]);
  const maxType = Math.max(...k.byType.map((t) => t.revenue));
  return (
    <>
      <PageTitle title="Վերլուծություն" sub={<span className="flex flex-wrap items-center gap-2">Գործառնական և ֆինանսական պատկերը մեկ էջում <DemoDataBadge /></span>} right={<Segmented value={p} onChange={setP} items={[{ id: "last30", label: "30 օր" }, { id: "last90", label: "90 օր" }, { id: "next30", label: "Հաջորդ 30 օր" }]} />} />
      <Tabs className="mb-4 w-fit" value={area} onChange={setArea} items={[{ id: "rooms", label: "Սենյակներ և եկամուտ" }, { id: "guests", label: "Հյուրեր և կարծիքներ" }, { id: "restaurant", label: "Ռեստորան" }, { id: "staff", label: "Անձնակազմ" }, { id: "loyalty", label: "Հավատարմություն" }]} />
      {area !== "rooms" ? <HospitalityAnalytics area={area} per={per} /> : <>
      {p === "next30" && <div className="mb-4 rounded-xl bg-info-soft px-4 py-2.5 text-[13px] text-info">Ապագա ժամանակահատված. ցուցադրված են արդեն հաստատված («on the books») ամրագրումները։</div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Ընդհանուր եկամուտ (սենյակներ)" value={amdShort(k.revenue)} sub={trend(k.revenue, prev?.revenue)} icon="chart" />
        <Kpi label="Զբաղվածություն" value={pct(k.occupancy, 1)} sub={`${k.sold} / ${k.available} սենյակ-գիշեր`} icon="bed" />
        <Kpi label="ADR (միջին գին գիշերվա համար)" value={amdShort(k.adr)} sub={trend(k.adr, prev?.adr)} icon="calc" />
        <Kpi label="RevPAR (եկամուտ մեկ սենյակի համար)" value={amdShort(k.revpar)} sub={trend(k.revpar, prev?.revpar)} icon="zap" />
        <Kpi label="Ամրագրումներ" value={k.bookings} sub={`${k.cancelled} չեղարկված`} icon="list" />
        <Kpi label="Կեցության միջին տևողություն" value={`${k.alos.toFixed(1)} գիշեր`} icon="clock" />
        <Kpi label="Չեղարկման տոկոս" value={pct(k.cancellationRate, 1)} icon="x" tone={k.cancellationRate > 0.08 ? "bad" : "ok"} />
        <Kpi label="Հարցում → ամրագրում" value={p === "next30" ? "—" : pct(k.conversion)} sub={p === "next30" ? "միայն անցյալի համար" : `${k.converted} ամրագրում ${k.inquiries} հարցումից`} icon="check" tone="ok" />
        <Kpi label="Ուղիղ ամրագրումների բաժին" value={pct(k.directShare)} sub="եկամտից, առանց միջնորդի" icon="globe" tone="info" />
        <Kpi label="Միջնորդավճար OTA (գնահատում)" value={amdShort(k.otaCommission)} sub="Booking ≈15%, Airbnb ≈3%" icon="external" tone="warn" />
      </div>
      <Card className="mt-4">
        <CardHead title="Եկամտի դինամիկա" sub={weekly ? "Ըստ շաբաթների" : "Ըստ օրերի"} icon="chart" />
        <BarLine data={chart} barLabel="Եկամուտ" lineLabel="Զբաղվածություն" fmtBar={amd} fmtLine={(x) => pct(x)} height={240} />
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHead title="Ամրագրման աղբյուրներ" sub="Եկամտի բաշխում ըստ ալիքների" icon="globe" />
          <Donut data={k.bySource.map((s) => ({ label: SOURCE_LABEL[s.source], value: s.revenue }))} center={pct(k.directShare)} sub="ուղիղ" />
          <table className="mt-4 w-full text-[13px]">
            <thead className="text-left text-[12px] text-muted"><tr><th className="py-1.5 font-medium">Աղբյուր</th><th className="font-medium">Ամրագր.</th><th className="font-medium">Գիշեր</th><th className="text-right font-medium">Եկամուտ</th><th className="text-right font-medium">Միջնորդ.</th></tr></thead>
            <tbody className="divide-y divide-line">{k.bySource.map((s) => <tr key={s.source}><td className="py-2">{SOURCE_LABEL[s.source]} {DIRECT_SOURCES.includes(s.source) && <Badge tone="ok" className="ml-1">ուղիղ</Badge>}</td><td className="tnum">{s.bookings}</td><td className="tnum">{s.nights}</td><td className="tnum text-right">{amdShort(s.revenue)}</td><td className="tnum text-right text-muted">{s.commission ? amdShort(s.commission) : "—"}</td></tr>)}</tbody>
          </table>
        </Card>
        <Card>
          <CardHead title="Սենյակների արդյունավետություն" sub="Ըստ սենյակի տեսակի" icon="bed" />
          <ul className="space-y-4">
            {k.byType.map((t) => (
              <li key={t.typeId}>
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[13px]"><span className="font-medium">{roomType(t.typeId).name.hy} <span className="text-muted">· {t.rooms} սենյակ</span></span><span className="tnum">{amdShort(t.revenue)}</span></div>
                <HBar value={t.revenue} max={maxType} />
                <div className="mt-1 flex gap-4 text-[12px] text-muted"><span>Զբաղվածություն՝ {pct(t.occupancy)}</span><span>ADR՝ {amdShort(t.adr)}</span><span>{t.sold} գիշեր</span></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {p !== "next30" && (
        <Card className="mt-4">
          <CardHead title="Հարցումներ ըստ ժամի" sub="Հյուրանոցի սեփական ալիքներով եկած հարցումներ (կայք, օգնական, հեռախոս, Instagram)" icon="moon" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-paper p-4"><div className="text-[12.5px] text-muted">Ընդհանուր հարցումներ</div><div className="tnum mt-1 text-[24px] font-semibold">{k.inquiries}</div></div>
            <div className="rounded-xl bg-violet-soft p-4"><div className="text-[12.5px] text-violet">Ոչ աշխատանքային ժամին (22:00–08:00)</div><div className="tnum mt-1 text-[24px] font-semibold">{k.afterHoursInquiries} <span className="text-[15px] font-medium text-muted">({pct(k.afterHoursShare)})</span></div></div>
            <div className="rounded-xl bg-paper p-4 text-[13px] text-ink-2"><Icon name="sparkles" size={16} className="mb-1 text-signal" />Այս հարցումներին AI օգնականը պատասխանում է անմիջապես, իսկ ընդունարանը դրանք տեսնում է առավոտյան՝ մեկ ցուցակում։</div>
          </div>
        </Card>
      )}
      <details className="mt-4 rounded-xl border border-line bg-surface p-4 text-[13px] text-muted">
        <summary className="cursor-pointer font-medium text-ink">Ինչպես են հաշվարկվում ցուցանիշները</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Զբաղվածություն = վաճառված սենյակ-գիշերներ ÷ ({state.rooms.length} սենյակ × օրերի քանակ)</li>
          <li>ADR = սենյակների եկամուտ ÷ վաճառված սենյակ-գիշերներ</li>
          <li>RevPAR = սենյակների եկամուտ ÷ հասանելի սենյակ-գիշերներ = զբաղվածություն × ADR</li>
          <li>Եկամուտը հաշվարկվում է հյուրանոցի գնացուցակից յուրաքանչյուր գիշերվա համար (սեզոն, հանգստյան օրեր)</li>
          <li>Հարցում → ամրագրում = ամրագրված հարցումներ ÷ որոշում ստացած հարցումներ (սեփական ալիքներ)</li>
          <li>Բոլոր թվերը ցուցադրական են և հաշվարկվում են գեներացված տվյալներից</li>
        </ul>
      </details>
      </>}
    </>
  );
}
