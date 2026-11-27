"use client";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, CardHead, cn } from "@/components/ui";
import { computeKpis, OTA_SOURCES, periods } from "@/lib/analytics";
import { useDemo } from "@/lib/client/demo-store";
import { amd, pct } from "@/lib/format";
import { computeRoi, type RoiInputs } from "@/lib/roi";

type Def = { key: keyof RoiInputs; label: string; unit: string; min: number; max: number; step: number; pctv?: boolean; group: string; help: string };
const DEFS: Def[] = [
  { key: "monthlyInquiries", label: "Հարցումներ ամսական", unit: "", min: 20, max: 1500, step: 10, group: "Հաղորդակցություն", help: "Բոլոր ալիքներով՝ զանգեր, Instagram, WhatsApp, կայք" },
  { key: "minutesPerInquiry", label: "Րոպե մեկ հարցման վրա", unit: "րոպե", min: 1, max: 30, step: 1, group: "Հաղորդակցություն", help: "Պատասխան, ճշտումներ, գրառում" },
  { key: "staffHandling", label: "Աշխատակիցներ, որոնք պատասխանում են", unit: "", min: 1, max: 8, step: 1, group: "Հաղորդակցություն", help: "" },
  { key: "hourlyCost", label: "Աշխատաժամի արժեք", unit: "֏", min: 500, max: 8000, step: 100, group: "Հաղորդակցություն", help: "Աշխատավարձ + հարկեր ÷ աշխատաժամեր" },
  { key: "automationShare", label: "Ավտոմատ պատասխանվող հարցերի բաժին", unit: "%", min: 0, max: 0.9, step: 0.05, pctv: true, group: "Հաղորդակցություն", help: "Պարզ հարցեր՝ գներ, ժամեր, կանոններ" },
  { key: "firstResponseHours", label: "Առաջին պատասխանի միջին ժամանակ այսօր", unit: "ժամ", min: 0.1, max: 12, step: 0.1, group: "Հաղորդակցություն", help: "" },
  { key: "avgRoomPrice", label: "Միջին գին գիշերվա համար", unit: "֏", min: 10000, max: 200000, step: 1000, group: "Ամրագրումներ", help: "" },
  { key: "avgNights", label: "Կեցության միջին տևողություն", unit: "գիշեր", min: 1, max: 7, step: 0.1, group: "Ամրագրումներ", help: "" },
  { key: "occupancy", label: "Ընթացիկ զբաղվածություն", unit: "%", min: 0.1, max: 1, step: 0.01, pctv: true, group: "Ամրագրումներ", help: "Տեղեկատվական" },
  { key: "missedShare", label: "Կորցվող հարցումներ այսօր", unit: "%", min: 0, max: 0.5, step: 0.01, pctv: true, group: "Ամրագրումներ", help: "Ուշ կամ բոլորովին չպատասխանված" },
  { key: "recoverableShare", label: "Որքանը կարելի է վերականգնել 24/7 պատասխանով", unit: "%", min: 0, max: 1, step: 0.05, pctv: true, group: "Ամրագրումներ", help: "Զգուշավոր գնահատական" },
  { key: "directConversion", label: "Հարցումից ամրագրման փոխակերպում", unit: "%", min: 0.05, max: 0.9, step: 0.01, pctv: true, group: "Ամրագրումներ", help: "" },
  { key: "otaBookingsPerMonth", label: "OTA ամրագրումներ ամսական", unit: "", min: 0, max: 400, step: 1, group: "Միջնորդավճար", help: "Booking.com, Airbnb" },
  { key: "otaShiftShare", label: "Որքանը կարող է անցնել ուղիղ ամրագրման", unit: "%", min: 0, max: 0.5, step: 0.01, pctv: true, group: "Միջնորդավճար", help: "Օր.՝ կրկնվող հյուրեր" },
  { key: "otaCommission", label: "OTA միջնորդավճար", unit: "%", min: 0, max: 0.3, step: 0.01, pctv: true, group: "Միջնորդավճար", help: "" },
];

const DEFAULTS: RoiInputs = { monthlyInquiries: 300, minutesPerInquiry: 8, staffHandling: 2, hourlyCost: 1800, automationShare: 0.5, firstResponseHours: 3, avgRoomPrice: 45000, avgNights: 2, occupancy: 0.55, missedShare: 0.1, recoverableShare: 0.4, directConversion: 0.3, otaBookingsPerMonth: 40, otaShiftShare: 0.1, otaCommission: 0.15 };

export default function Roi() {
  const { state } = useDemo();
  const [inp, setInp] = useState<RoiInputs>(DEFAULTS);
  const [measured, setMeasured] = useState<Set<string>>(new Set());
  const k = useMemo(() => computeKpis(state, periods(state.baseDate).last30), [state]);
  const r = computeRoi(inp);
  const useDemoData = () => {
    const ota = k.bySource.filter((s) => OTA_SOURCES.includes(s.source)).reduce((a, s) => a + s.bookings, 0);
    setInp({ ...inp, monthlyInquiries: Math.max(20, Math.round(k.inquiries / 10) * 10), avgRoomPrice: Math.round(k.adr / 1000) * 1000, avgNights: Math.round(k.alos * 10) / 10, occupancy: Math.round(k.occupancy * 100) / 100, otaBookingsPerMonth: ota, directConversion: Math.round(k.conversion * 100) / 100 });
    setMeasured(new Set(["monthlyInquiries", "avgRoomPrice", "avgNights", "occupancy", "otaBookingsPerMonth", "directConversion"]));
  };
  const set = (key: keyof RoiInputs, v: number) => { setInp({ ...inp, [key]: v }); setMeasured((m) => { const n = new Set(m); n.delete(key); return n; }); };
  const groups = [...new Set(DEFS.map((d) => d.group))];
  return (
    <>
      <PageTitle title="Արժեքի հաշվիչ" sub="Որքան ժամանակ և եկամուտ կարող է տալ ավտոմատացումը՝ Ձեր սեփական թվերով" right={<><Button icon="chart" onClick={useDemoData}>Լրացնել ցուցադրական հյուրանոցի տվյալներով</Button><Button variant="ghost" icon="refresh" onClick={() => { setInp(DEFAULTS); setMeasured(new Set()); }}>Զրոյացնել</Button></>} />
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-[13px] text-ink-2"><Icon name="info" size={17} className="mt-0.5 shrink-0 text-warn" /><div><b>Սա կանխատեսում է, ոչ թե երաշխիք։</b> Բոլոր արդյունքները հաշվարկվում են ստորև նշված ենթադրություններից, որոնք կարող եք փոխել։ <Badge tone="info">Չափված</Badge> պիտակը նշանակում է, որ արժեքը վերցված է ցուցադրական հյուրանոցի տվյալներից (վերջին 30 օր), մնացածը՝ ենթադրություններ են։ Իրական արդյունքը չափվում է պիլոտի ընթացքում։</div></div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          {groups.map((g) => (
            <Card key={g}>
              <CardHead title={g} />
              <div className="space-y-4">
                {DEFS.filter((d) => d.group === g).map((d) => (
                  <div key={d.key}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                      <span className="flex items-center gap-1.5">{d.label}{measured.has(d.key) ? <Badge tone="info">Չափված</Badge> : <Badge>Ենթադրություն</Badge>}</span>
                      <span className="flex items-center gap-1"><input type="number" value={d.pctv ? Math.round(inp[d.key] * 100) : inp[d.key]} step={d.pctv ? 1 : d.step} onChange={(e) => set(d.key, d.pctv ? +e.target.value / 100 : +e.target.value)} className="tnum h-8 w-24 rounded-md border border-line-2 px-2 text-right text-[13px]" /><span className="w-10 text-[12px] text-muted">{d.unit}</span></span>
                    </div>
                    <input type="range" min={d.min} max={d.max} step={d.step} value={inp[d.key]} onChange={(e) => set(d.key, +e.target.value)} className="w-full accent-[var(--color-ink)]" aria-label={d.label} />
                    {d.help && <div className="text-[12px] text-faint">{d.help}</div>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          <section className="rounded-[var(--radius-card)] bg-ink p-5 text-white shadow-[var(--shadow-card)]">
            <div className="text-[13px] text-white/60">Հնարավոր ամսական արժեք (կանխատեսում)</div>
            <div className="tnum mt-1 text-[34px] font-semibold tracking-tight">{amd(r.totalMonthly)}</div>
            <div className="mt-1 text-[12.5px] text-white/60">ժամանակի արժեք + լրացուցիչ ամրագրումներ + խնայված միջնորդավճար</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[["Խնայված ժամեր / ամիս", `${r.hoursSaved.toFixed(0)} ժ`], ["Լրիվ դրույքի համարժեք", r.fte.toFixed(2)], ["Լրացուցիչ ամրագրումներ / ամիս", r.extraBookings.toFixed(1)], ["Ավտոմատացված պատասխաններ", pct(r.automationShare)]].map(([a, b]) => <div key={a} className="rounded-xl bg-white/[0.07] p-3"><div className="text-[12px] text-white/60">{a}</div><div className="tnum mt-1 text-[20px] font-semibold">{b}</div></div>)}
            </div>
            <div className="mt-3 rounded-xl bg-white/[0.07] p-3 text-[13px]"><div className="text-white/60">Առաջին պատասխանի ժամանակ</div><div className="mt-1"><span className="tnum font-semibold">{inp.firstResponseHours.toFixed(1)} ժ</span> → <span className="font-semibold text-signal">անմիջապես</span> <span className="text-white/60">հարցերի {pct(r.automationShare)}-ի համար, 24/7</span></div></div>
          </section>
          <Card>
            <CardHead title="Հաշվարկներ" sub="Յուրաքանչյուր թիվ՝ իր բանաձևով" icon="calc" />
            <ul className="divide-y divide-line">
              {r.lines.map((l) => (
                <li key={l.label} className="py-2.5">
                  <div className="flex items-baseline justify-between gap-3 text-[13.5px]"><span>{l.label}</span><span className={cn("tnum font-semibold", l.unit === "AMD" && "text-ok")}>{l.unit === "AMD" ? amd(l.value) : l.unit === "h" ? `${l.value.toFixed(1)} ժ` : l.unit === "fte" ? l.value.toFixed(2) : l.value.toFixed(1)}</span></div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-faint">{l.formula}</div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-faint">Բանաձևերը պարզ են միտումնավոր. իրական արդյունքը կախված է հյուրանոցի գործընթացներից և չափվում է պիլոտի ընթացքում։</p>
          </Card>
        </div>
      </div>
    </>
  );
}
