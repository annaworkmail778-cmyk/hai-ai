import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, getStaticFiles, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../fonts";
import { BASE_SCENES, FPS, LB_COPY, SCENE_IDS, SITE, subtitleCues, TIMELINE, totalSeconds, type LbCopy, type LbLang, type SceneId } from "./config";
import {
  AppointmentCard,
  C,
  ChatHeader,
  CheckDot,
  clamp,
  Conversation,
  ease,
  Headline,
  IgIcon,
  Mark,
  Notification,
  Pointer,
  Rise,
  SlotPicker,
  SmartphoneFrame,
  StageBg,
  StatusPill,
  TgIcon,
  TimeScale,
  useIn,
  useSceneFrame,
  Wordmark,
  type ChatItem,
} from "./ui";

export const lbFrames = (lang: LbLang) => Math.round(totalSeconds(lang) * FPS);
const f = (sec: number) => Math.round(sec * FPS);

function useWide() {
  const { width, height } = useVideoConfig();
  return width > height;
}

function hasFile(path: string) {
  try {
    return getStaticFiles().some((x) => x.name === path);
  } catch {
    return false;
  }
}

/** Fade + slight scale at the edges of every scene, so cuts feel like one continuous piece. */
function SceneShell({ children, dur, k }: { children: ReactNode; dur: number; k: number }) {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [dur - 12, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), transform: `scale(${1.015 - inP * 0.015 + outP * 0.02})` }}>
      <TimeScale.Provider value={k}>{children}</TimeScale.Provider>
    </AbsoluteFill>
  );
}

/** Content box that keeps clear of the subtitle band. */
function Layout({ side, main, mainStyle }: { side: ReactNode; main: ReactNode; mainStyle?: CSSProperties }) {
  const wide = useWide();
  return wide ? (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "70px 120px 150px", gap: 80 }}>
      <div style={{ flex: "0 0 640px" }}>{side}</div>
      <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", ...mainStyle }}>{main}</div>
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ padding: "190px 70px 330px", flexDirection: "column", gap: 44 }}>
      <div>{side}</div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", ...mainStyle }}>{main}</div>
    </AbsoluteFill>
  );
}

const phoneSize = (wide: boolean) => (wide ? { width: 430, height: 860, s: 1 } : { width: 620, height: 1100, s: 1.42 });

function Points({ items, starts, size }: { items: string[]; starts: number[]; size: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.55, marginTop: size * 1.1 }}>
      {items.map((p, i) => (
        <Rise key={p} delay={starts[i]}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <CheckDot size={size * 1.25} />
            <span style={{ fontSize: size, fontWeight: 600, color: "#fff" }}>{p}</span>
          </div>
        </Rise>
      ))}
    </div>
  );
}

/* ── 1 · The problem ─────────────────────────────────────────────── */

function Problem({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const photo = interpolate(frame, [0, 70], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const zoom = interpolate(frame, [0, 80], [1.04, 1.35], clamp);
  const ph = phoneSize(wide);
  const dim = interpolate(frame, [150, 175], [0, 1], clamp);
  const unanswered = Math.min(t.problem.inbox.length, Math.floor(interpolate(frame, [70, 165], [0, t.problem.inbox.length + 0.99], clamp)));
  return (
    <AbsoluteFill>
      <StageBg glowX={wide ? "72%" : "50%"} glowY={wide ? "50%" : "62%"} />
      <Layout
        side={
          <>
            <Headline title={t.problem.line1} size={wide ? 66 : 52} delay={8} />
            <div style={{ marginTop: wide ? 36 : 22, opacity: interpolate(frame, [125, 140], [0, 1], clamp), transform: `translateY(${interpolate(frame, [125, 145], [20, 0], clamp)}px)` }}>
              <p style={{ margin: 0, fontSize: wide ? 50 : 42, lineHeight: 1.12, fontWeight: 800, color: C.signal }}>{t.problem.line2}</p>
            </div>
          </>
        }
        main={
          <SmartphoneFrame width={ph.width} height={ph.height}>
            <div style={{ padding: `${10 * ph.s}px ${22 * ph.s}px`, display: "flex", alignItems: "center", gap: 10 * ph.s, borderBottom: `1px solid ${C.line}` }}>
              <IgIcon size={30 * ph.s} />
              <span style={{ fontSize: 22 * ph.s, fontWeight: 800, color: C.ink }}>Direct</span>
              <span style={{ marginLeft: "auto", minWidth: 34 * ph.s, height: 30 * ph.s, padding: `0 ${10 * ph.s}px`, borderRadius: 30, background: C.red, color: "#fff", fontSize: 16 * ph.s, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unanswered}</span>
            </div>
            <div style={{ flex: 1, padding: `${14 * ph.s}px ${16 * ph.s}px`, display: "flex", flexDirection: "column", gap: 12 * ph.s, background: "#fbfaf8" }}>
              {t.problem.inbox.map((m, i) => {
                const at = 70 + i * 16;
                const p = useIn(at, { damping: 13, stiffness: 170 });
                const jitter = frame > at && frame < at + 8 ? (random(`j${i}${frame}`) - 0.5) * 8 : 0;
                const rot = (random(`r${i}`) - 0.5) * 3 * (1 - dim * 0.6);
                return (
                  <div key={i} style={{ opacity: p * (1 - dim * 0.45), transform: `translate(${(1 - p) * 60 + jitter}px, 0) rotate(${rot}deg)`, display: "flex", alignItems: "center", gap: 12 * ph.s, padding: `${12 * ph.s}px ${14 * ph.s}px`, borderRadius: 18 * ph.s, background: "#fff", boxShadow: "0 8px 22px -14px rgba(0,0,0,.4)", border: `1px solid ${C.line}` }}>
                    <span style={{ width: 40 * ph.s, height: 40 * ph.s, borderRadius: 40, flexShrink: 0, background: ["#f6b9cf", "#c8e1ff", "#ffe3d2", "#d9f2df", "#e8d9ff", "#fde2a8"][i % 6] }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 16 * ph.s, color: C.ink, lineHeight: 1.3 }}>{m}</p>
                      <p style={{ margin: `${3 * ph.s}px 0 0`, fontSize: 13 * ph.s, color: dim > 0.5 ? C.red : C.mute, fontWeight: 700 }}>{dim > 0.5 ? `● ${t.problem.unanswered}` : t.now}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `${16 * ph.s}px`, background: `linear-gradient(transparent, rgba(229,72,77,${0.22 * dim}))`, display: "flex", justifyContent: "center" }}>
              <span style={{ opacity: dim, padding: `${10 * ph.s}px ${18 * ph.s}px`, borderRadius: 30, background: C.red, color: "#fff", fontSize: 17 * ph.s, fontWeight: 800 }}>{t.problem.missed}</span>
            </div>
          </SmartphoneFrame>
        }
      />
      {/* Opening: the salon, pushing into the glowing phone on the desk. */}
      <AbsoluteFill style={{ opacity: photo, pointerEvents: "none" }}>
        <Img src={staticFile("bg/salon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 80%", transform: `scale(${zoom})`, transformOrigin: "45% 82%" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.55))" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── 2 · Meet RiseUp ─────────────────────────────────────────────── */

function Intro({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const collapse = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const mark = useIn(22, { damping: 20, stiffness: 90 });
  const arrow = interpolate(frame, [30, 52], [0, 1], { ...clamp, easing: ease });
  const word = useIn(40, { damping: 20, stiffness: 110 });
  const sweep = interpolate(frame, [38, 75], [-60, 160], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glow = 0.3 + 0.12 * Math.sin(frame / 12);
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="45%" />
      {/* the noisy inbox folds into one clean line */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = (1 - collapse) * (wide ? 420 : 320);
        return (
          <div key={i} style={{ position: "absolute", left: "50%", top: "45%", width: 300, height: 64, marginLeft: -150, marginTop: -32, borderRadius: 20, background: "#fff", opacity: 0.9 * (1 - collapse), transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r * 0.6}px) rotate(${(1 - collapse) * (i % 2 ? 6 : -6)}deg) scale(${1 - collapse * 0.6})` }} />
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: wide ? 120 : 260 }}>
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, rgba(255,91,20,${glow}), transparent 62%)`, filter: "blur(30px)", opacity: mark }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", opacity: mark, filter: `blur(${(1 - mark) * 12}px)`, transform: `scale(${0.8 + mark * 0.2})` }}>
            <Mark size={wide ? 190 : 220} draw={arrow} />
            <div style={{ position: "absolute", inset: -10, overflow: "hidden", mixBlendMode: "screen" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, width: 90, left: `${sweep}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent)", transform: "skewX(-18deg)" }} />
            </div>
          </div>
          <div style={{ marginTop: 34, opacity: word, transform: `translateY(${(1 - word) * 20}px)` }}>
            <Wordmark height={wide ? 74 : 84} />
          </div>
          <div style={{ marginTop: 46, textAlign: "center", padding: "0 60px" }}>
            <Rise delay={58}>
              <p style={{ margin: 0, fontSize: wide ? 64 : 66, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{t.intro.meet}</p>
            </Rise>
            <Rise delay={72}>
              <p style={{ margin: "16px auto 0", maxWidth: wide ? 1100 : 900, fontSize: wide ? 38 : 42, lineHeight: 1.25, fontWeight: 500, color: "rgba(255,255,255,.72)" }}>{t.intro.sub}</p>
            </Rise>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── 3 · Automatic response ──────────────────────────────────────── */

export const CHAT_AT = [10, 70, 125, 165, 205, 245];

function DetailsCard({ t, s }: { t: LbCopy; s: number }) {
  const frame = useSceneFrame();
  const rows: Array<[string, string, number]> = [
    [t.dashboard.columns[1], t.dashboard.rows[0][1], CHAT_AT[2] + 6],
    [t.dashboard.columns[0], t.dashboard.rows[0][0], CHAT_AT[4] + 6],
    [t.dashboard.columns[2], t.dashboard.rows[0][2], CHAT_AT[0] + 6],
  ];
  return (
    <div style={{ marginTop: 40 * s, borderRadius: 24, padding: "22px 26px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
      {rows.map(([k, v, at]) => {
        const on = frame >= at;
        return (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 26 * s }}>
            <span style={{ color: "rgba(255,255,255,.55)" }}>{k}</span>
            <span style={{ color: on ? "#fff" : "rgba(255,255,255,.2)", fontWeight: 700 }}>{on ? v : "…"}</span>
          </div>
        );
      })}
    </div>
  );
}

function Chat({ t }: { t: LbCopy }) {
  const wide = useWide();
  const ph = phoneSize(wide);
  const items: ChatItem[] = t.chat.messages.map((m, i) => ({ from: m.from, at: CHAT_AT[i], node: m.text, label: m.from === "riseup" && i === 1 }));
  return (
    <AbsoluteFill>
      <StageBg glowX={wide ? "70%" : "50%"} glowY="55%" />
      <Layout
        side={
          <>
            <Headline eyebrow="Instagram" title={t.chat.title} size={wide ? 64 : 60} />
            {wide ? <Points items={t.chat.points} starts={[80, 170, 250]} size={32} /> : null}
            {wide && <DetailsCard t={t} s={1} />}
          </>
        }
        main={
          <SmartphoneFrame width={ph.width} height={ph.height}>
            <ChatHeader name={t.salon} channel={t.instagram} s={ph.s} />
            <Conversation items={items} s={ph.s} assistant={t.assistant} />
          </SmartphoneFrame>
        }
      />
    </AbsoluteFill>
  );
}

/* ── 4 · Booking ─────────────────────────────────────────────────── */

const BK = { day: 12, offer: 52, tap: 118, request: 140, step1: 150, step2: 214 };

function MiniCalendar({ t, s }: { t: LbCopy; s: number }) {
  const frame = useSceneFrame();
  const on = frame >= BK.request;
  const pulse = 0.6 + 0.4 * Math.sin(frame / 6);
  return (
    <div style={{ marginTop: 36 * s, borderRadius: 24, padding: "20px 24px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
      <p style={{ margin: "0 0 12px", fontSize: 22 * s, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.booking.day}</p>
      {t.booking.slots.map((slot, i) => {
        const mine = i === t.booking.picked;
        return (
          <div key={slot} style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 0", borderTop: i ? "1px solid rgba(255,255,255,.08)" : undefined }}>
            <span style={{ width: 120, fontSize: 24 * s, color: "rgba(255,255,255,.7)", fontVariantNumeric: "tabular-nums" }}>{slot}</span>
            {mine && on ? (
              <span style={{ flex: 1, padding: "10px 16px", borderRadius: 14, border: `2px dashed rgba(255,177,77,${pulse})`, color: "#ffb14d", fontSize: 22 * s, fontWeight: 700 }}>
                {t.dashboard.rows[0][0]} · {t.dashboard.rows[0][1]} — {t.dashboard.status.requested}
              </span>
            ) : (
              <span style={{ flex: 1, height: 2, background: "rgba(255,255,255,.08)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Steps({ t, s }: { t: LbCopy; s: number }) {
  const frame = useSceneFrame();
  const rows: Array<[string, number, boolean]> = [
    [t.booking.stepRequest, BK.step1, true],
    [t.booking.stepConfirm, BK.step2, false],
  ];
  return (
    <div style={{ marginTop: 30 * s, display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map(([label, at, done]) => {
        const on = frame >= at;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: on ? 1 : 0.35 }}>
            {done && on ? (
              <CheckDot size={36 * s} bg={C.amber} color="#fff" />
            ) : (
              <span style={{ width: 36 * s, height: 36 * s, borderRadius: 36, border: "2px dashed rgba(255,255,255,.5)", flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 28 * s, fontWeight: 700, color: "#fff" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Booking({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const ph = phoneSize(wide);
  const s = ph.s;
  const prior: ChatItem[] = t.chat.messages.slice(3).map((m) => ({ from: m.from, at: -100, node: m.text }));
  const items: ChatItem[] = [
    ...prior,
    { from: "customer", at: BK.day, node: t.booking.customerDay },
    {
      from: "riseup",
      at: BK.offer,
      node: (
        <>
          {t.booking.offer}
          <SlotPicker day={t.booking.day} slots={t.booking.slots} picked={t.booking.picked} pickedAt={BK.tap} s={s} />
        </>
      ),
    },
    { from: "customer", at: BK.tap + 6, node: t.booking.slots[t.booking.picked] },
    { from: "riseup", at: BK.request, node: <AppointmentCard kind="request" title={t.booking.requestTitle} text={t.booking.requestText} note={t.booking.requestNote} s={s} /> },
  ];
  // Pointer path: from the bottom of the phone to the chosen slot.
  // Where the chosen slot chip sits when it is tapped (measured from the rendered frames; the chips differ by language).
  const hy = t === LB_COPY.hy;
  const target = wide ? (hy ? [0.55, 0.86] : [0.64, 0.8]) : hy ? [0.54, 0.84] : [0.64, 0.78];
  const tx = interpolate(frame, [70, 112], [ph.width * 0.85, ph.width * target[0]], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ty = interpolate(frame, [70, 112], [ph.height * 1.02, ph.height * target[1]], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [BK.tap - 4, BK.tap, BK.tap + 8], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <StageBg glowX={wide ? "70%" : "50%"} glowY="55%" />
      <Layout
        side={
          <>
            <Headline eyebrow="Instagram" title={t.booking.title} size={wide ? 64 : 60} />
            {wide && <MiniCalendar t={t} s={1} />}
            <Steps t={t} s={wide ? 1 : 1.05} />
          </>
        }
        main={
          <div style={{ position: "relative" }}>
            <SmartphoneFrame width={ph.width} height={ph.height}>
              <ChatHeader name={t.salon} channel={t.instagram} s={s} />
              <Conversation items={items} s={s} assistant={t.assistant} />
            </SmartphoneFrame>
            {frame >= 70 && frame < BK.tap + 16 && <Pointer x={tx} y={ty} press={press} />}
          </div>
        }
      />
    </AbsoluteFill>
  );
}

/* ── 5 · Dashboard ───────────────────────────────────────────────── */

const DB = { newRow: 30, kpi: 40, cursor: 170, click: 205, confirmed: 210, toast: 225 };

function Kpi({ label, from, to, at, s }: { label: string; from: number; to: number; at: number; s: number }) {
  const frame = useSceneFrame();
  const v = Math.round(interpolate(frame, [at, at + 20], [from, to], clamp));
  const bump = interpolate(frame, [at, at + 6, at + 18], [0, 1, 0], clamp);
  return (
    <div style={{ flex: 1, borderRadius: 18 * s, padding: `${16 * s}px ${18 * s}px`, background: "#fff", border: `1px solid ${C.line}` }}>
      <p style={{ margin: 0, fontSize: 15 * s, color: C.mute, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: `${6 * s}px 0 0`, fontSize: 40 * s, fontWeight: 800, color: C.ink, transform: `scale(${1 + bump * 0.08})`, transformOrigin: "0 50%" }}>{v}</p>
    </div>
  );
}

function Dashboard({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const d = t.dashboard;
  const win = useIn(0, { damping: 20, stiffness: 100 });
  const s = wide ? 1 : 1.12;
  const annaStatus = frame >= DB.confirmed ? "confirmed" : "requested";
  const newRow = useIn(DB.newRow, { damping: 15, stiffness: 140 });
  const flash = interpolate(frame, [DB.newRow, DB.newRow + 50], [1, 0], clamp);
  const toast = useIn(DB.toast, { damping: 16, stiffness: 140 });
  const W = wide ? 1560 : 940;
  const H = wide ? 820 : 1010;
  // Pointer to Anna's "Confirm" button.
  const btn = wide ? { x: 1425, y: 292 } : { x: 120, y: 360 };
  const px = interpolate(frame, [DB.cursor, DB.click - 4], [btn.x + (wide ? -260 : 300), btn.x], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const py = interpolate(frame, [DB.cursor, DB.click - 4], [btn.y + 200, btn.y], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [DB.click - 4, DB.click, DB.click + 8], [0, 1, 0], clamp);

  const rows = d.rows.map((r, i) => (i === 0 ? ([...r.slice(0, 4), annaStatus] as typeof r) : r));

  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="40%" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: wide ? "center" : "flex-start", paddingTop: wide ? 0 : 170, paddingBottom: wide ? 110 : 0 }}>
        {!wide && (
          <div style={{ width: W, marginBottom: 30 }}>
            <Headline eyebrow="RiseUp" title={d.heading} size={60} />
          </div>
        )}
        <div style={{ position: "relative", width: W, height: H, borderRadius: 28, overflow: "hidden", background: C.panel2, boxShadow: "0 60px 140px -50px rgba(0,0,0,.8)", display: "flex", opacity: win, transform: `translateY(${(1 - win) * 60}px) scale(${0.96 + win * 0.04})` }}>
          {wide && (
            <aside style={{ width: 250, background: "#0e0e10", padding: "28px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
                <Mark size={30} />
                <Wordmark height={24} />
              </div>
              {d.nav.map((n, i) => (
                <span key={n} style={{ padding: "12px 14px", borderRadius: 12, fontSize: 17, fontWeight: 600, color: i === 0 ? "#fff" : "rgba(255,255,255,.55)", background: i === 0 ? "rgba(255,255,255,.08)" : undefined, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: i === 0 ? C.signal : "rgba(255,255,255,.25)" }} />
                  {n}
                </span>
              ))}
            </aside>
          )}
          <div style={{ flex: 1, padding: wide ? "28px 34px" : "28px 28px", display: "flex", flexDirection: "column", gap: 20 * s, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {!wide && <Mark size={34} color={C.ink} />}
              {wide && <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: C.ink }}>{d.heading}</p>}
              <span style={{ marginLeft: wide ? "auto" : 0, fontSize: 14 * s, color: C.green, fontWeight: 700 }}>● {d.synced}</span>
            </div>
            <div style={{ display: "flex", gap: 14 * s }}>
              {d.kpis.map(([label, a, b], i) => (
                <Kpi key={label} label={label} from={a} to={b} at={i === 2 ? DB.confirmed : DB.kpi} s={s} />
              ))}
            </div>
            {wide ? (
              <div style={{ borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1.3fr 1.2fr 1.9fr", padding: "14px 22px", fontSize: 14, fontWeight: 700, color: C.mute, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${C.line}` }}>
                  {d.columns.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1.3fr 1.2fr 1.9fr", alignItems: "center", padding: "16px 22px", fontSize: 18, color: C.ink, borderBottom: `1px solid ${C.line}`, background: i === 0 ? `rgba(255,91,20,${0.1 * flash})` : undefined, opacity: i === 0 ? newRow : 1, transform: i === 0 ? `translateY(${(1 - newRow) * -30}px)` : undefined }}>
                    <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                      {r[0]}
                      {i === 0 && flash > 0.05 && <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 10, background: C.signal, color: "#000", fontWeight: 800 }}>{d.newLead}</span>}
                    </span>
                    <span>{r[1]}</span>
                    <span style={{ color: C.mute }}>{r[2]}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{r[3]}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <StatusPill status={r[4]} label={d.status[r[4]]} />
                      {i === 0 && annaStatus === "requested" && <span style={{ padding: "6px 14px", borderRadius: 10, background: C.ink, color: "#fff", fontSize: 14, fontWeight: 700, transform: `scale(${1 - press * 0.08})` }}>{d.confirm}</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {wide && (
              <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
                <Panel title={d.recentTitle}>
                  {d.recent.map(([who, msg, when], i) => (
                    <div key={who} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: i ? `1px solid ${C.line}` : undefined, opacity: i === 0 ? newRow : 1 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 38, background: ["#f6d2c3", "#c8e1ff", "#d9f2df"][i], flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
                          {who} <IgIcon size={16} />
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 15, color: C.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg}</p>
                      </div>
                      <span style={{ fontSize: 13, color: C.mute }}>{when}</span>
                    </div>
                  ))}
                </Panel>
                <Panel title={d.todayTitle}>
                  {d.today.map(([when, what, st], i) => {
                    const status = st === "anna" ? annaStatus : (st as "confirmed");
                    return (
                      <div key={when} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
                        <span style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: status === "confirmed" ? C.green : C.amber }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{when}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 15, color: C.mute }}>{what}</p>
                        </div>
                      </div>
                    );
                  })}
                </Panel>
              </div>
            )}
            {!wide && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {rows.map((r, i) => (
                  <div key={i} style={{ borderRadius: 20, padding: "20px 22px", background: i === 0 ? `rgba(255,${241 - 30 * flash},${235 - 60 * flash},1)` : "#fff", border: `1px solid ${C.line}`, opacity: i === 0 ? newRow : 1, transform: i === 0 ? `translateY(${(1 - newRow) * -30}px)` : undefined }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>{r[0]}</span>
                      {i === 0 && flash > 0.05 && <span style={{ fontSize: 15, padding: "4px 10px", borderRadius: 10, background: C.signal, color: "#000", fontWeight: 800 }}>{d.newLead}</span>}
                      <span style={{ marginLeft: "auto" }}>
                        <StatusPill status={r[4]} label={d.status[r[4]]} s={1.15} />
                      </span>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 21, color: C.mute }}>
                      {r[1]} · {r[2]} · {r[3]}
                    </p>
                    {i === 0 && annaStatus === "requested" && (
                      <span style={{ display: "inline-block", marginTop: 12, padding: "10px 18px", borderRadius: 12, background: C.ink, color: "#fff", fontSize: 19, fontWeight: 700, transform: `scale(${1 - press * 0.08})` }}>{d.confirm}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {frame >= DB.cursor && frame < DB.click + 20 && <Pointer x={px} y={py} press={press} />}
        </div>
        {/* What Anna receives once the team confirms. */}
        <div style={{ position: wide ? "absolute" : "relative", right: wide ? 150 : undefined, bottom: wide ? 150 : undefined, marginTop: wide ? 0 : 30, width: wide ? 520 : W, opacity: toast, transform: `translateY(${(1 - toast) * 40}px)` }}>
          <div style={{ borderRadius: 24, padding: 6, background: "#fff", boxShadow: "0 30px 70px -20px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 6px", fontSize: 15 * s, color: C.mute, fontWeight: 700 }}>
              <IgIcon size={22 * s} /> {t.instagram} · {d.rows[0][0]}
            </div>
            <AppointmentCard kind="confirmed" title={t.booking.confirmedTitle} text={t.booking.confirmedText} s={s} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, padding: "14px 20px", minHeight: 0, overflow: "hidden" }}>
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.mute, textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</p>
      {children}
    </div>
  );
}

/* ── 6 · Follow-up and notification ──────────────────────────────── */

const FU = { divider: 40, follow: 92, tag: 118, notify: 175 };

function FollowUp({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const ph = phoneSize(wide);
  const s = ph.s;
  const fu = t.followup;
  const items: ChatItem[] = [
    { from: "customer", at: -100, node: fu.earlier },
    { from: "riseup", at: -100, node: fu.earlierReply },
    { from: "system", at: FU.divider, node: fu.later },
    { from: "riseup", at: FU.follow, node: fu.message, label: true },
  ];
  const note = useIn(FU.notify, { damping: 14, stiffness: 150 });
  const tag = useIn(FU.tag);
  return (
    <AbsoluteFill>
      <StageBg glowX={wide ? "70%" : "50%"} glowY="55%" />
      <Layout
        side={
          <>
            <Headline eyebrow="RiseUp" title={fu.title} size={wide ? 64 : 60} />
            {wide && (
              <div style={{ marginTop: 56, opacity: note, transform: `translateX(${(1 - note) * -60}px)` }}>
                <Notification app={fu.notifyApp} title={fu.notifyTitle} text={fu.notifyText} s={1.15} />
              </div>
            )}
          </>
        }
        main={
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SmartphoneFrame width={ph.width} height={wide ? 760 : 980}>
              <ChatHeader name={fu.customer} channel={t.instagram} s={s} />
              <Conversation items={items} s={s} assistant={t.assistant} />
            </SmartphoneFrame>
            <div style={{ marginTop: 22, maxWidth: ph.width + 80, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)`, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 30, border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.8)", fontSize: 18 * s }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: C.signal, flexShrink: 0 }} />
              {fu.optional}
            </div>
          </div>
        }
      />
      {!wide && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 440 + (1 - note) * -120, opacity: note }}>
          <Notification app={fu.notifyApp} title={fu.notifyTitle} text={fu.notifyText} s={1.35} />
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ── 7 · Business value ──────────────────────────────────────────── */

function NodeIcon({ i, size }: { i: number; size: number }) {
  if (i === 0) return <IgIcon size={size} />;
  if (i === 1) return <Mark size={size * 0.82} />;
  if (i === 4) return <TgIcon size={size} />;
  const paths = [
    "",
    "",
    "M5 20c0-4 3.1-6 7-6s7 2 7 6M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
    "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8 3v4M16 3v4M9 14.5l2 2 4-4",
  ];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[i]} />
    </svg>
  );
}

function Value({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const n = t.value.nodes.length;
  const node = wide ? 150 : 132;
  const gapPx = wide ? 120 : 64;
  const draw = interpolate(frame, [10, 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pulse = (frame % 50) / 50;
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY={wide ? "38%" : "40%"} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: wide ? 140 : 300, gap: wide ? 80 : 70 }}>
        <div style={{ position: "relative", display: "flex", flexDirection: wide ? "row" : "column", alignItems: "center", gap: gapPx }}>
          {/* connector */}
          <div style={{ position: "absolute", background: "rgba(255,255,255,.12)", ...(wide ? { left: node / 2, right: node / 2, top: node / 2 - 1, height: 2 } : { top: node / 2, bottom: node / 2, left: node / 2 - 1, width: 2 }) }}>
            <div style={{ position: "absolute", background: C.signal, ...(wide ? { left: 0, top: 0, bottom: 0, width: `${draw * 100}%` } : { left: 0, right: 0, top: 0, height: `${draw * 100}%` }) }} />
            {draw > 0.98 && <div style={{ position: "absolute", width: 14, height: 14, borderRadius: 14, background: "#fff", boxShadow: `0 0 16px ${C.signal}`, ...(wide ? { top: -6, left: `calc(${pulse * 100}% - 7px)` } : { left: -6, top: `calc(${pulse * 100}% - 7px)` }) }} />}
          </div>
          {t.value.nodes.map((label, i) => {
            const at = 10 + (i / (n - 1)) * 80;
            const p = useIn(at, { damping: 14, stiffness: 150 });
            const core = i === 1;
            return (
              <div key={label} style={{ position: "relative", display: "flex", flexDirection: wide ? "column" : "row", alignItems: "center", gap: wide ? 18 : 26, width: wide ? node + 40 : 600, opacity: p, transform: `scale(${0.7 + p * 0.3})` }}>
                <div style={{ width: node, height: node, borderRadius: core ? node : 36, background: core ? "#0b0b0c" : "rgba(255,255,255,.07)", border: `2px solid ${core ? C.signal : "rgba(255,255,255,.18)"}`, boxShadow: core ? `0 0 60px rgba(255,91,20,.45)` : undefined, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <NodeIcon i={i} size={node * 0.48} />
                </div>
                <span style={{ fontSize: wide ? 24 : 34, fontWeight: 700, color: "#fff", textAlign: wide ? "center" : "left" }}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? "18px 70px" : 18 }}>
          {t.value.lines.map((line, i) => (
            <Rise key={line} delay={110 + i * 22}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <CheckDot size={wide ? 40 : 46} />
                <span style={{ fontSize: wide ? 40 : 44, fontWeight: 800, color: "#fff" }}>{line}</span>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── 8 · Call to action ──────────────────────────────────────────── */

function Cta({ t }: { t: LbCopy }) {
  const frame = useSceneFrame();
  const wide = useWide();
  const mark = useIn(2, { damping: 20, stiffness: 90 });
  const arrow = interpolate(frame, [8, 30], [0, 1], { ...clamp, easing: ease });
  const btn = useIn(52, { damping: 15, stiffness: 140 });
  const ring = (frame % 60) / 60;
  const glow = 0.28 + 0.1 * Math.sin(frame / 14);
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="42%" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: wide ? 110 : 260, textAlign: "center" }}>
        <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: 1000, background: `radial-gradient(circle, rgba(255,91,20,${glow}), transparent 60%)`, filter: "blur(30px)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: mark, transform: `scale(${0.85 + mark * 0.15})` }}>
            <Mark size={wide ? 120 : 130} draw={arrow} />
            <Wordmark height={wide ? 92 : 98} />
          </div>
          <Rise delay={18}>
            <p style={{ margin: "48px 60px 0", fontSize: wide ? 68 : 70, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", maxWidth: wide ? 1400 : 940 }}>{t.cta.tagline}</p>
          </Rise>
          <Rise delay={34}>
            <p style={{ margin: "20px 0 0", fontSize: wide ? 36 : 40, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{t.cta.discover}</p>
          </Rise>
          <div style={{ marginTop: 50, opacity: btn, transform: `translateY(${(1 - btn) * 30}px)` }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: wide ? "26px 48px" : "30px 52px", borderRadius: 100, background: C.signal, color: "#000", fontSize: wide ? 36 : 40, fontWeight: 800, boxShadow: `0 0 0 ${ring * 26}px rgba(255,91,20,${0.35 * (1 - ring)}), 0 24px 60px -20px rgba(255,91,20,.8)` }}>
              {t.cta.button}
              <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <Rise delay={64}>
            <p style={{ margin: "34px 0 0", fontSize: wide ? 32 : 36, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>{SITE}</p>
          </Rise>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── Subtitles ───────────────────────────────────────────────────── */

function Subtitles({ lang }: { lang: LbLang }) {
  const frame = useCurrentFrame();
  const wide = useWide();
  const sec = frame / FPS;
  const cue = subtitleCues(lang).find((c) => sec >= c.start && sec < c.end);
  if (!cue) return null;
  const local = (sec - cue.start) * FPS;
  const o = interpolate(local, [0, 5], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...(wide ? { bottom: 40 } : { top: 1640 }), display: "flex", justifyContent: "center", padding: "0 60px", zIndex: 90 }}>
      <p style={{ margin: 0, maxWidth: wide ? 1400 : 960, padding: wide ? "14px 28px" : "18px 30px", borderRadius: 18, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: wide ? 36 : 42, lineHeight: 1.3, fontWeight: 600, textAlign: "center", opacity: o }}>{cue.text}</p>
    </div>
  );
}

/* ── Sound ───────────────────────────────────────────────────────── */

function sfx(lang: LbLang): Array<[number, string, number]> {
  const tl = TIMELINE[lang];
  const at = (id: SceneId, offset = 0) => f(tl[id][0]) + Math.round(offset * stretch(lang, id));
  return [
    ...[0, 1, 2, 3, 4, 5].map((i) => [at("problem", 70 + i * 16), "pops", 0.22] as [number, string, number]),
    [at("intro") - 4, "whoosh", 0.35],
    [at("intro", 30), "chime", 0.35],
    ...CHAT_AT.map((a, i) => [at("chat", a), i % 2 ? "ding" : "pops", 0.25] as [number, string, number]),
    [at("chat", 44), "typing", 0.15],
    [at("chat", 140), "typing", 0.15],
    [at("booking", BK.tap), "tap", 0.45],
    [at("booking", BK.request), "ding", 0.3],
    [at("dashboard") - 4, "whoosh", 0.3],
    [at("dashboard", DB.newRow), "pops", 0.3],
    [at("dashboard", DB.click), "tap", 0.45],
    [at("dashboard", DB.confirmed), "chime", 0.35],
    [at("followup", FU.follow), "ding", 0.3],
    [at("followup", FU.notify), "ding", 0.35],
    [at("value") - 4, "whoosh", 0.3],
    [at("cta") - 4, "whoosh", 0.35],
    [at("cta", 10), "chime", 0.4],
  ];
}

/* ── Composition ─────────────────────────────────────────────────── */

/** How much longer (or shorter) a scene is in this language than its base design. */
function stretch(lang: LbLang, id: SceneId) {
  const [s, e] = TIMELINE[lang][id];
  const [bs, be] = BASE_SCENES[id];
  return (e - s) / (be - bs);
}

const SCENE_VIEWS: Record<SceneId, (t: LbCopy) => ReactNode> = {
  problem: (t) => <Problem t={t} />,
  intro: (t) => <Intro t={t} />,
  chat: (t) => <Chat t={t} />,
  booking: (t) => <Booking t={t} />,
  dashboard: (t) => <Dashboard t={t} />,
  followup: (t) => <FollowUp t={t} />,
  value: (t) => <Value t={t} />,
  cta: (t) => <Cta t={t} />,
};

export function LeadBookingDemo({ lang }: { lang: LbLang }) {
  const t = LB_COPY[lang];
  const voice = `voice/lb-demo-${lang}.mp3`;
  const music = "music/lb-demo.mp3";
  const withVoice = hasFile(voice);
  const end = lbFrames(lang);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.bg }}>
      {SCENE_IDS.map((id) => {
        const [s, e] = TIMELINE[lang][id];
        const dur = f(e) - f(s);
        return (
          <Sequence key={id} from={f(s)} durationInFrames={dur} name={id}>
            <SceneShell dur={dur} k={stretch(lang, id)}>
              {SCENE_VIEWS[id](t)}
            </SceneShell>
          </Sequence>
        );
      })}
      <Subtitles lang={lang} />
      {sfx(lang).map(([from, name, volume], i) => (
        <Sequence key={`sfx${i}`} from={from} layout="none">
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
        </Sequence>
      ))}
      {withVoice && <Audio src={staticFile(voice)} volume={1} />}
      {hasFile(music) && (
        <Audio
          src={staticFile(music)}
          volume={(fr) => interpolate(fr, [0, 30, end - 60, end], [0, 1, 1, 0], clamp) * (withVoice ? 0.2 : 0.32)}
        />
      )}
    </AbsoluteFill>
  );
}
