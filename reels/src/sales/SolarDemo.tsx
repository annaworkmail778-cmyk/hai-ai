import { interpolate, spring, useVideoConfig } from "remotion";
import { C, clamp, ease, Notification, Rise, useSceneFrame } from "../lb/ui";
import { Card, CountUp, Cta, DemoTimeline, sceneCount, Split, useWide, type Lang } from "./kit";

/*
 * Solar Monitoring & Alerts — 30 s silent demo. Site names ("Demo-07"), values and
 * the report are invented. The note in scene 2 states the real constraint: it works
 * where the inverter platform provides data access.
 */

const SITES = 16;
const OFFLINE = 6; // index of the offline site (Demo-07)
const LOW = 10; // index of the low-output site (Demo-11)

const T = {
  en: {
    badge: "Demo · illustrative data",
    s1: { eyebrow: "The problem", title: "Dozens of sites. Who notices when one stops?", note: "Often the client calls first." },
    s2: { eyebrow: "Hourly checks", title: "Every site checked, every hour.", note: "Using your inverter platform's data access, with your credentials." },
    check: "Check 14:00 · 16 sites",
    s3: { eyebrow: "Alerts", title: "Your team gets a Telegram alert right away." },
    a1: { title: "Demo-07 · inverter offline", text: "No data for 2 h · last seen 11:58" },
    a2: { title: "Demo-11 · low output", text: "38% below expected for this hour" },
    s4: { eyebrow: "Daily summary", title: "One message every evening. Nothing missed." },
    summary: { title: "Daily summary · 16 sites", rows: [["Working normally", "14"], ["Offline", "1"], ["Low output", "1"], ["Technician assigned", "Demo-07"]] },
    s5: { eyebrow: "Monthly report", title: "A clear report for each client.", note: "You review it before it's sent." },
    report: { title: "Demo-03 · October", prod: "Production", kwh: "kWh", uptime: "Uptime", fixes: "Interventions" },
    cta: { product: "Solar Monitoring & Alerts", line: "Pilot on up to 10 sites · alerts in Telegram · monthly reports", site: "riseup-group.com" },
  },
  hy: {
    badge: "Դեմո · օրինակային տվյալներ",
    s1: { eyebrow: "Խնդիրը", title: "Տասնյակ կայաններ։ Ո՞վ կնկատի, երբ մեկը կանգնի։", note: "Հաճախ առաջինը զանգում է հաճախորդը։" },
    s2: { eyebrow: "Ժամային ստուգում", title: "Ամեն կայան ստուգվում է ամեն ժամ։", note: "Ձեր ինվերտորի հարթակի տվյալներով, Ձեր մուտքերով։" },
    check: "Ստուգում 14:00 · 16 կայան",
    s3: { eyebrow: "Ծանուցումներ", title: "Ձեր թիմը միանգամից ծանուցում է ստանում Telegram-ով։" },
    a1: { title: "Demo-07 · ինվերտորն անջատված է", text: "Տվյալներ չկան 2 ժամ · վերջինը՝ 11:58" },
    a2: { title: "Demo-11 · ցածր արտադրություն", text: "Սպասվածից 38%-ով ցածր" },
    s4: { eyebrow: "Օրվա ամփոփում", title: "Ամեն երեկո մեկ հաղորդագրություն։ Ոչինչ բաց չի թողնվում։" },
    summary: { title: "Օրվա ամփոփում · 16 կայան", rows: [["Նորմալ են աշխատում", "14"], ["Անջատված", "1"], ["Ցածր արտադրություն", "1"], ["Տեխնիկ ուղարկված", "Demo-07"]] },
    s5: { eyebrow: "Ամսական հաշվետվություն", title: "Պարզ հաշվետվություն յուրաքանչյուր հաճախորդի համար։", note: "Ուղարկելուց առաջ Դուք եք ստուգում։" },
    report: { title: "Demo-03 · հոկտեմբեր", prod: "Արտադրություն", kwh: "կՎտժ", uptime: "Աշխատաժամանակ", fixes: "Միջամտություններ" },
    cta: { product: "Solar Monitoring & Alerts", line: "Պիլոտ մինչև 10 կայանի համար · ծանուցումներ Telegram-ով · ամսական հաշվետվություններ", site: "riseup-group.com" },
  },
};

type Copy = (typeof T)["en"];

function SiteGrid({ mode }: { mode: "problem" | "check" }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const size = wide ? 168 : 180;
  const sweep = interpolate(frame, [20, 110], [-0.2, 1.2], clamp);
  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(4, ${size}px)`, gap: 14 }}>
      {Array.from({ length: SITES }, (_, i) => {
        const bad = mode === "problem" && ((i === OFFLINE && frame > 50) || (i === LOW && frame > 80));
        const col = Math.floor(i % 4) / 3;
        const checked = mode === "check" && sweep > col;
        const color = bad ? (i === OFFLINE ? C.red : "#f0a020") : checked ? "#2fbf5b" : "rgba(255,255,255,.35)";
        return (
          <div key={i} style={{ height: size * 0.72, borderRadius: 18, background: "rgba(255,255,255,.06)", border: `2px solid ${bad ? color : "rgba(255,255,255,.14)"}`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 14 }}>
            <svg viewBox="0 0 24 16" width={size * 0.36}>
              {[0, 1, 2].map((r) => (
                <rect key={r} x={r * 8} y="2" width="7" height="12" rx="1" fill="none" stroke={color} strokeWidth="1.4" />
              ))}
            </svg>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.85)", fontSize: size * 0.15, fontWeight: 700, whiteSpace: "nowrap" }}>
              <span style={{ width: 10, height: 10, borderRadius: 10, background: color }} />
              Demo-{String(i + 1).padStart(2, "0")}
            </span>
          </div>
        );
      })}
      {mode === "check" && (
        <div style={{ position: "absolute", top: -10, bottom: -10, left: `${sweep * 100}%`, width: 4, background: C.signal, boxShadow: `0 0 30px ${C.signal}`, opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
      )}
    </div>
  );
}

function Problem({ t }: { t: Copy }) {
  return (
    <Split eyebrow={t.s1.eyebrow} title={t.s1.title} note={t.s1.note}>
      <SiteGrid mode="problem" />
    </Split>
  );
}

function Check({ t }: { t: Copy }) {
  const wide = useWide();
  return (
    <Split eyebrow={t.s2.eyebrow} title={t.s2.title} note={t.s2.note}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
        <Rise delay={4}>
          <span style={{ padding: "10px 20px", borderRadius: 30, background: "rgba(255,91,20,.15)", border: `1px solid ${C.signal}`, color: "#ffb38f", fontWeight: 700, fontSize: wide ? 22 : 28 }}>⟳ {t.check}</span>
        </Rise>
        <SiteGrid mode="check" />
      </div>
    </Split>
  );
}

function Alerts({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const s = wide ? 1.2 : 1.5;
  const p1 = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 120 } });
  const p2 = spring({ frame: frame - 48, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <Split eyebrow={t.s3.eyebrow} title={t.s3.title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: wide ? 680 : 900 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -70}px)` }}>
          <Notification app="Telegram" title={`⚠ ${t.a1.title}`} text={t.a1.text} s={s} />
        </div>
        <div style={{ opacity: p2, transform: `translateY(${(1 - p2) * -70}px)` }}>
          <Notification app="Telegram" title={`▼ ${t.a2.title}`} text={t.a2.text} s={s} />
        </div>
      </div>
    </Split>
  );
}

function Summary({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const fs = wide ? 26 : 32;
  const tone = [C.green, C.red, C.amber, C.ink];
  return (
    <Split eyebrow={t.s4.eyebrow} title={t.s4.title}>
      <Card width={wide ? 640 : 880}>
        <p style={{ margin: "0 0 16px", fontSize: fs * 1.1, fontWeight: 900 }}>{t.summary.title}</p>
        {t.summary.rows.map(([k, v], i) => {
          const at = 12 + i * 14;
          const o = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: i ? `1px solid ${C.line}` : undefined, fontSize: fs, opacity: o }}>
              <span style={{ color: C.mute }}>{k}</span>
              <span style={{ fontWeight: 900, color: tone[i] }}>{v}</span>
            </div>
          );
        })}
      </Card>
    </Split>
  );
}

const BARS = [62, 70, 58, 74, 80, 77, 40, 66, 82, 85, 79, 71, 68, 88];

function Report({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const fs = wide ? 22 : 28;
  return (
    <Split eyebrow={t.s5.eyebrow} title={t.s5.title} note={t.s5.note}>
      <Card width={wide ? 720 : 900}>
        <p style={{ margin: 0, fontSize: fs * 1.2, fontWeight: 900 }}>{t.report.title}</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: wide ? 190 : 240, margin: "22px 0", borderBottom: `1px solid ${C.line}` }}>
          {BARS.map((h, i) => {
            const k = interpolate(frame, [10 + i * 3, 30 + i * 3], [0, 1], { ...clamp, easing: ease });
            return <div key={i} style={{ flex: 1, height: `${h * k}%`, borderRadius: "8px 8px 0 0", background: i === 6 ? C.amber : C.signal }} />;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            [t.report.prod, <CountUp key="p" to={4180} delay={40} suffix={` ${t.report.kwh}`} />],
            [t.report.uptime, <CountUp key="u" to={99} delay={48} suffix="%" />],
            [t.report.fixes, <CountUp key="f" to={2} delay={56} />],
          ].map(([label, value], i) => (
            <div key={i} style={{ background: C.panel2, borderRadius: 16, padding: 16 }}>
              <p style={{ margin: 0, fontSize: fs * 0.8, color: C.mute }}>{label}</p>
              <p style={{ margin: "6px 0 0", fontSize: fs * 1.35, fontWeight: 900 }}>{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </Split>
  );
}

export function SolarDemo({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <DemoTimeline
      badge={t.badge}
      scenes={[<Problem key="1" t={t} />, <Check key="2" t={t} />, <Alerts key="3" t={t} />, <Summary key="4" t={t} />, <Report key="5" t={t} />, <Cta key="6" {...t.cta} />]}
    />
  );
}

export const SOLAR_FRAMES = sceneCount(6);
