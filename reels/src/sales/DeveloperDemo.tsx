import { interpolate, spring, useVideoConfig } from "remotion";
import { C, clamp, Conversation, ease, IgIcon, Notification, Rise, SmartphoneFrame, TgIcon, useSceneFrame, type ChatItem } from "../lb/ui";
import { Card, CountUp, Cta, DemoTimeline, sceneCount, Split, useWide, type Lang } from "./kit";

/*
 * Developer Sales OS — 30 s silent product demo (on-screen text, quiet music).
 * Flow: scattered inquiries → instant AI reply → qualified lead card → manager alert
 * → pipeline + management view → CTA. All names, projects and numbers are invented.
 */

const T = {
  en: {
    badge: "Demo · illustrative data",
    s1: { eyebrow: "The problem", title: "Inquiries arrive from five places at once.", note: "Some wait for hours. Some are never answered." },
    channels: ["Instagram", "Facebook", "Website form", "Missed call", "WhatsApp"],
    waiting: "No reply for 2 h 15 min",
    s2: { eyebrow: "Instant reply", title: "Every inquiry answered in seconds.", note: "In Armenian, Russian or English — with the questions your sales team needs." },
    chat: {
      name: "Anna · demo customer",
      channel: "Instagram Direct",
      live: "online",
      assistant: "Demo Residence assistant",
      m1: "Hi! Do you have 3-room apartments in Demo Residence? What's the price?",
      m2: "Hello! Yes, 3-room apartments from 92 m². To suggest the right option: what budget, and when do you plan to buy?",
      m3: "Up to 85M AMD, in about 3 months, with a mortgage.",
      m4: "Thank you! A sales manager will call you within 15 minutes.",
    },
    s3: { eyebrow: "Qualified automatically", title: "One complete lead card. No copy-paste." },
    lead: {
      title: "New lead",
      rows: [
        ["Name", "Anna (demo)"],
        ["Source", "Instagram"],
        ["Interest", "3 rooms · Demo Residence"],
        ["Budget", "up to 85M AMD"],
        ["Timeline", "~3 months"],
        ["Financing", "Mortgage"],
      ],
      hot: "Hot lead",
    },
    s4: { eyebrow: "Right person, right away", title: "The responsible manager knows instantly." },
    notif: { app: "Telegram", title: "New hot lead · Anna", text: "3 rooms · mortgage · assigned to Manager 1" },
    reminder: "Reminder in 15 min if not called",
    s5: { eyebrow: "Management view", title: "The whole pipeline in one place." },
    kpi: [
      ["Inquiries this week", 64, ""],
      ["Median first reply", 40, " s"],
      ["Followed up", 100, "%"],
    ] as [string, number, string][],
    cols: [
      ["New", 12],
      ["Contacted", 21],
      ["Meeting", 9],
      ["Reserved", 3],
    ] as [string, number][],
    cta: { product: "Developer Sales OS", line: "30-day pilot · works with your CRM or Google Sheets", site: "riseup-group.com" },
  },
  hy: {
    badge: "Դեմո · օրինակային տվյալներ",
    s1: { eyebrow: "Խնդիրը", title: "Հայտերը գալիս են հինգ տեղից միաժամանակ։", note: "Մի մասը ժամերով սպասում է, մի մասը՝ ընդհանրապես պատասխան չի ստանում։" },
    channels: ["Instagram", "Facebook", "Կայքի ձև", "Բաց թողնված զանգ", "WhatsApp"],
    waiting: "Անպատասխան՝ 2 ժ 15 ր",
    s2: { eyebrow: "Ակնթարթային պատասխան", title: "Ամեն հայտ պատասխան է ստանում վայրկյանների ընթացքում։", note: "Հայերեն, ռուսերեն կամ անգլերեն՝ այն հարցերով, որոնք պետք են Ձեր վաճառքի բաժնին։" },
    chat: {
      name: "Աննա · դեմո հաճախորդ",
      channel: "Instagram Direct",
      live: "առցանց",
      assistant: "Demo Residence-ի օգնական",
      m1: "Բարև Ձեզ։ Demo Residence-ում 3 սենյականոց բնակարաններ ունե՞ք։ Ի՞նչ արժեն։",
      m2: "Բարև Ձեզ։ Այո, 3 սենյականոցները՝ 92 մ²-ից։ Ճիշտ տարբերակ առաջարկելու համար ասեք՝ ի՞նչ բյուջե և ե՞րբ եք պլանավորում գնել։",
      m3: "Մինչև 85 մլն ֏, մոտ 3 ամսից, հիփոթեքով։",
      m4: "Շնորհակալություն։ Վաճառքի մենեջերը կզանգի Ձեզ 15 րոպեի ընթացքում։",
    },
    s3: { eyebrow: "Ավտոմատ որակավորում", title: "Մեկ ամբողջական քարտ, առանց ձեռքով պատճենելու։" },
    lead: {
      title: "Նոր հայտ",
      rows: [
        ["Անուն", "Աննա (դեմո)"],
        ["Աղբյուր", "Instagram"],
        ["Հետաքրքրություն", "3 սենյակ · Demo Residence"],
        ["Բյուջե", "մինչև 85 մլն ֏"],
        ["Ժամկետ", "~3 ամիս"],
        ["Ֆինանսավորում", "Հիփոթեք"],
      ],
      hot: "Տաք հայտ",
    },
    s4: { eyebrow: "Ճիշտ մարդուն, անմիջապես", title: "Պատասխանատու մենեջերը իմանում է միանգամից։" },
    notif: { app: "Telegram", title: "Նոր տաք հայտ · Աննա", text: "3 սենյակ · հիփոթեք · մենեջեր 1" },
    reminder: "Հիշեցում 15 րոպեից, եթե զանգ չլինի",
    s5: { eyebrow: "Ղեկավարի համար", title: "Ամբողջ վաճառքը՝ մեկ տեղում։" },
    kpi: [
      ["Հայտեր այս շաբաթ", 64, ""],
      ["Առաջին պատասխան (մեդիան)", 40, " վ"],
      ["Հետագա կապ", 100, "%"],
    ] as [string, number, string][],
    cols: [
      ["Նոր", 12],
      ["Կապ հաստատված", 21],
      ["Հանդիպում", 9],
      ["Ամրագրված", 3],
    ] as [string, number][],
    cta: { product: "Developer Sales OS", line: "30 օրվա պիլոտ · աշխատում է Ձեր CRM-ի կամ Google Sheets-ի հետ", site: "riseup-group.com" },
  },
};

type Copy = (typeof T)["en"];

function ChannelIcon({ i, size }: { i: number; size: number }) {
  if (i === 0) return <IgIcon size={size} />;
  const colors = ["", "#1877f2", "#3a3a3a", "#e5484d", "#25d366"];
  const glyph = ["", "f", "⌂", "☎", "✆"];
  return (
    <span style={{ width: size, height: size, borderRadius: size / 3.4, background: colors[i], color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, fontWeight: 900, flexShrink: 0 }}>{glyph[i]}</span>
  );
}

function Problem({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  return (
    <Split eyebrow={t.s1.eyebrow} title={t.s1.title} note={t.s1.note}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: wide ? 640 : 860 }}>
        {t.channels.map((ch, i) => {
          const p = spring({ frame: frame - 8 - i * 9, fps, config: { damping: 15, stiffness: 140 } });
          return (
            <div key={ch} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderRadius: 22, background: "rgba(255,255,255,.96)", color: C.ink, opacity: p, transform: `translateX(${(1 - p) * 60}px)`, boxShadow: "0 20px 50px -25px rgba(0,0,0,.7)" }}>
              <ChannelIcon i={i} size={wide ? 46 : 54} />
              <span style={{ fontSize: wide ? 26 : 32, fontWeight: 700 }}>{ch}</span>
              <span style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: 14, background: C.signal }} />
            </div>
          );
        })}
        <Rise delay={70}>
          <div style={{ alignSelf: "flex-start", marginTop: 10, padding: "12px 22px", borderRadius: 40, background: "rgba(229,72,77,.15)", border: `1px solid ${C.red}`, color: "#ff8a8d", fontSize: wide ? 24 : 30, fontWeight: 700 }}>⏱ {t.waiting}</div>
        </Rise>
      </div>
    </Split>
  );
}

function Reply({ t }: { t: Copy }) {
  const wide = useWide();
  const w = wide ? 400 : 500;
  const s = w / 430;
  const items: ChatItem[] = [
    { from: "customer", at: 6, node: t.chat.m1 },
    { from: "riseup", at: 40, node: t.chat.m2, label: true },
    { from: "customer", at: 80, node: t.chat.m3 },
    { from: "riseup", at: 112, node: t.chat.m4, label: true },
  ];
  return (
    <Split eyebrow={t.s2.eyebrow} title={t.s2.title} note={t.s2.note}>
      <SmartphoneFrame width={w} height={w * 2.05}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <ChatHeaderLite name={t.chat.name} channel={t.chat.channel} live={t.chat.live} s={s} />
          <Conversation items={items} s={s} assistant={t.chat.assistant} typingFrames={18} />
        </div>
      </SmartphoneFrame>
    </Split>
  );
}

function ChatHeaderLite({ name, channel, s }: { name: string; channel: string; live?: string; s: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * s, padding: `${10 * s}px ${22 * s}px ${16 * s}px`, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
      <span style={{ width: 50 * s, height: 50 * s, borderRadius: 50, background: "linear-gradient(135deg,#f6d2c3,#e9b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 * s, fontWeight: 700 }}>A</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 20 * s, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{name}</p>
        <p style={{ margin: 0, fontSize: 15 * s, color: C.mute, display: "flex", alignItems: "center", gap: 6 * s }}>
          <IgIcon size={17 * s} /> {channel}
        </p>
      </div>
    </div>
  );
}

function LeadCard({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const fs = wide ? 26 : 32;
  return (
    <Split eyebrow={t.s3.eyebrow} title={t.s3.title}>
      <Card width={wide ? 660 : 880}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <span style={{ fontSize: fs * 1.15, fontWeight: 900 }}>{t.lead.title}</span>
          <Rise delay={95} y={10}>
            <span style={{ padding: "8px 18px", borderRadius: 30, background: "#ffe7dc", color: "#c43d00", fontWeight: 900, fontSize: fs * 0.85 }}>🔥 {t.lead.hot}</span>
          </Rise>
        </div>
        {t.lead.rows.map(([k, v], i) => {
          const at = 14 + i * 12;
          const shown = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "14px 0", borderTop: i ? `1px solid ${C.line}` : undefined, fontSize: fs }}>
              <span style={{ color: C.mute }}>{k}</span>
              <span style={{ fontWeight: 700, opacity: shown, transform: `translateX(${(1 - shown) * 20}px)` }}>{v}</span>
            </div>
          );
        })}
      </Card>
    </Split>
  );
}

function Alert({ t }: { t: Copy }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 120 } });
  const s = wide ? 1.25 : 1.55;
  return (
    <Split eyebrow={t.s4.eyebrow} title={t.s4.title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, width: wide ? 680 : 900 }}>
        <div style={{ transform: `translateY(${(1 - p) * -80}px)`, opacity: p }}>
          <Notification app={t.notif.app} title={t.notif.title} text={t.notif.text} s={s} />
        </div>
        <Rise delay={55}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderRadius: 20, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.85)", fontSize: wide ? 24 : 30, fontWeight: 700 }}>
            <TgIcon size={wide ? 34 : 42} /> ⏰ {t.reminder}
          </div>
        </Rise>
      </div>
    </Split>
  );
}

function Pipeline({ t }: { t: Copy }) {
  const wide = useWide();
  const fs = wide ? 22 : 28;
  return (
    <Split eyebrow={t.s5.eyebrow} title={t.s5.title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: wide ? 760 : 920 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {t.kpi.map(([label, value, suffix], i) => (
            <Rise key={label} delay={6 + i * 8}>
              <Card style={{ padding: 22, borderRadius: 22 }}>
                <p style={{ margin: 0, fontSize: fs * 0.8, color: C.mute, lineHeight: 1.25, minHeight: fs * 2 }}>{label}</p>
                <p style={{ margin: "8px 0 0", fontSize: fs * 2, fontWeight: 900, color: i === 2 ? C.green : C.ink }}>
                  <CountUp to={value} delay={14 + i * 8} suffix={suffix} />
                </p>
              </Card>
            </Rise>
          ))}
        </div>
        <Rise delay={36}>
          <Card style={{ padding: 22, borderRadius: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {t.cols.map(([col, n], i) => (
                <div key={col} style={{ background: C.panel2, borderRadius: 16, padding: 14 }}>
                  <p style={{ margin: 0, fontSize: fs * 0.78, fontWeight: 700, color: C.mute, minHeight: fs * 2, lineHeight: 1.2 }}>{col}</p>
                  <p style={{ margin: "6px 0 10px", fontSize: fs * 1.5, fontWeight: 900, color: i === 3 ? C.signal : C.ink }}>
                    <CountUp to={n} delay={46 + i * 6} />
                  </p>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ height: fs * 0.9, borderRadius: 8, background: "#fff", border: `1px solid ${C.line}`, marginTop: 6 }} />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </Rise>
      </div>
    </Split>
  );
}

export function DeveloperDemo({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <DemoTimeline
      badge={t.badge}
      scenes={[<Problem key="1" t={t} />, <Reply key="2" t={t} />, <LeadCard key="3" t={t} />, <Alert key="4" t={t} />, <Pipeline key="5" t={t} />, <Cta key="6" {...t.cta} />]}
    />
  );
}

export const DEVELOPER_FRAMES = sceneCount(6);
