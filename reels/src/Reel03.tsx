import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";
import { reel03, type Copy03, type Lang } from "./copy";
import { Brand, Caption, Check, clamp, Cursor, End, Glyph, hasFile, IgIcon, INK, MUTE, PAPER, SIGNAL, useSpring } from "./Reel01";

/* Reel 03 «Հաճախորդը մոռացավ» — reminders and the waiting list. 1080×1920, 30 fps, 21.5 s. */

export const REEL03_FRAMES = 645;
const S = { wait: 0, lost: 90, brand: 165, remind: 225, waitlist: 390, end: 510 };
const RED = "#e5484d";

/* ── 01 The clock runs, nobody comes ────────────────────────────────── */

function Wait({ t }: { t: Copy03 }) {
  const frame = useCurrentFrame();
  const minutes = Math.round(interpolate(frame, [8, 62], [0, 40], { ...clamp, easing: Easing.in(Easing.quad) }));
  const card = useSpring(0, { damping: 14, stiffness: 150 });
  const red = interpolate(frame, [62, 68], [0, 1], clamp);
  const head = useSpring(64, { damping: 11, stiffness: 220 });
  const shake = frame >= 62 && frame < 70 ? (random(`w${frame}`) - 0.5) * 24 : 0;
  const ringDeg = (minutes / 60) * 360;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1c1c1f, #000 70%)", alignItems: "center" }}>
      {/* progress ring */}
      <div style={{ position: "relative", marginTop: 260, width: 640, height: 640, transform: `translateX(${shake}px)` }}>
        <svg viewBox="0 0 100 100" width="640" height="640" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={red > 0.5 ? RED : SIGNAL} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(ringDeg / 360) * 276.5} 276.5`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ margin: 0, fontSize: 190, fontWeight: 900, letterSpacing: "-0.04em", color: red > 0.5 ? RED : "#fff" }}>
            11:{String(minutes).padStart(2, "0")}
          </p>
        </div>
      </div>
      {/* the appointment card */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "24px 34px",
          borderRadius: 30,
          background: red > 0.5 ? "rgba(229,72,77,.16)" : "rgba(255,255,255,.08)",
          border: `3px solid ${red > 0.5 ? RED : "rgba(255,255,255,.18)"}`,
          color: "#fff",
          fontSize: 44,
          fontWeight: 700,
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px) translateX(${shake}px)`,
        }}
      >
        <span style={{ color: "rgba(255,255,255,.6)" }}>11:00</span>
        {t.card}
        {red > 0.5 && <span style={{ padding: "6px 18px", borderRadius: 30, background: RED, fontSize: 30 }}>{t.noShow}</span>}
      </div>
      {frame >= 64 && (
        <div style={{ position: "absolute", bottom: 430, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <p style={{ margin: 0, padding: "18px 40px", borderRadius: 30, background: "#fff", color: INK, fontSize: 76, fontWeight: 900, letterSpacing: "-0.03em", whiteSpace: "nowrap", transform: `scale(${1.6 - head * 0.6})`, opacity: head }}>
            {t.forgot}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ── 02 The master waited. The hour is lost. ────────────────────────── */

function Lost({ t }: { t: Copy03 }) {
  const frame = useCurrentFrame();
  const a = useSpring(0, { damping: 13, stiffness: 180 });
  const b = useSpring(26, { damping: 11, stiffness: 220 });
  const strike = interpolate(frame, [40, 52], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile("video/receptionist.mp4")} startFrom={45} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(2px) brightness(.4) saturate(.7)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 110, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", opacity: a * (frame > 26 ? 0.45 : 1), transform: `translateY(${(1 - a) * 140}px)`, filter: `blur(${(1 - a) * 12}px)` }}>
          {t.lost[0]}
        </p>
        <div style={{ position: "relative", marginTop: 30, opacity: b, transform: `scale(${1.4 - b * 0.4})` }}>
          <p style={{ margin: 0, fontSize: 130, fontWeight: 900, letterSpacing: "-0.03em", color: SIGNAL }}>{t.lost[1]}</p>
          <span style={{ position: "absolute", left: 0, top: "52%", height: 14, width: `${strike * 100}%`, background: "#fff", borderRadius: 14, boxShadow: "0 0 30px rgba(255,255,255,.6)" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── 04 Reminders on the phone ──────────────────────────────────────── */

function Reminder({ when, text, delay, children }: { when: string; text: string; delay: number; children?: ReactNode }) {
  const p = useSpring(delay, { damping: 14, stiffness: 150 });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * -120}px) scale(${0.94 + p * 0.06})`, padding: 26, borderRadius: 36, background: "rgba(255,255,255,.9)", boxShadow: "0 24px 50px -24px rgba(0,0,0,.45)" }}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 700, color: MUTE }}>
        <IgIcon size={40} />
        <span style={{ flex: 1 }}>{when}</span>
      </p>
      <p style={{ margin: "14px 0 0", fontSize: 31, lineHeight: 1.3, color: INK }}>{text}</p>
      {children}
    </div>
  );
}

function Remind({ t }: { t: Copy03 }) {
  const frame = useCurrentFrame();
  const phone = useSpring(0, { damping: 16, stiffness: 110 });
  const cx = interpolate(frame, [40, 70], [900, 330], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(frame, [40, 70], [1500, 905], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [70, 74, 80], [0, 1, 0], clamp);
  const ok = frame >= 74;
  const ring = interpolate(frame, [74, 94], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #fff, ${PAPER} 60%)` }}>
      <div style={{ position: "absolute", left: -240, top: 980, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.22), transparent 65%)" }} />
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 230,
          width: 680,
          height: 1130,
          borderRadius: 90,
          border: "14px solid #1b1b1b",
          background: "linear-gradient(160deg,#ffd9c2,#f6b9cf 45%,#b9b4f5)",
          overflow: "hidden",
          boxShadow: "0 60px 120px -40px rgba(0,0,0,.45)",
          transform: `perspective(2000px) translateY(${(1 - phone) * 500}px) rotateX(${(1 - phone) * 25}deg)`,
          padding: "70px 28px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <span style={{ position: "absolute", top: 14, left: "50%", marginLeft: -85, width: 170, height: 40, borderRadius: 40, background: "#141414" }} />
        <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 150, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff" }}>{frame < 100 ? "19:00" : "09:00"}</p>
        <Reminder when={`${t.remTitle} · ${t.eve}`} text={t.rem1} delay={10}>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "center", fontSize: 25, fontWeight: 700 }}>
            <span style={{ padding: "16px 0", borderRadius: 22, background: ok ? "#2f9e4a" : SIGNAL, color: ok ? "#fff" : INK, boxShadow: `0 0 0 ${ring * 24}px rgba(255,91,20,${0.3 * (1 - ring)})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {ok && <Check size={30} bg="transparent" color="#fff" />}
              {ok ? t.confirmed : t.confirm}
            </span>
            <span style={{ padding: "16px 0", borderRadius: 22, background: "rgba(0,0,0,.06)", color: INK }}>{t.move}</span>
          </div>
        </Reminder>
        {frame >= 100 && <Reminder when={`${t.remTitle} · ${t.morning}`} text={t.rem2} delay={100} />}
      </div>
      {frame >= 40 && frame < 92 && <Cursor x={cx} y={cy} press={press} />}
      <Caption text={t.captions.s4} from={8} to={160} />
    </AbsoluteFill>
  );
}

/* ── 05 Cancellation → waiting list → slot filled ───────────────────── */

function Waitlist({ t }: { t: Copy03 }) {
  const frame = useCurrentFrame();
  const enter = useSpring(0, { damping: 18, stiffness: 90 });
  const state = frame < 30 ? "cancel" : frame < 70 ? "free" : "filled";
  const fill = useSpring(70, { damping: 10, stiffness: 180 });
  const msg = useSpring(34, { damping: 14, stiffness: 150 });
  const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const rowH = 92;
  const busy: Array<[number, number]> = [[0, 1], [1, 1], [2, 1.5], [6, 1]];
  const rx = interpolate(frame, [0, 120], [26, 14]);
  const ry = interpolate(frame, [0, 120], [18, 8]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1408, #0b0b0c 65%)", perspective: 2400 }}>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 470,
          width: 780,
          height: 900,
          borderRadius: 40,
          background: "#f6f5f1",
          overflow: "hidden",
          boxShadow: "0 80px 140px -50px rgba(0,0,0,.9)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 600}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-4deg)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "24px 30px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
          <Glyph size={38} color={INK} />
          <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: INK }}>{t.calTitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 14, padding: "18px 26px" }}>
          <div style={{ position: "relative", height: rowH * hours.length }}>
            {hours.map((h, i) => (
              <span key={h} style={{ position: "absolute", top: i * rowH, fontSize: 22, color: "#8a8984" }}>{h}</span>
            ))}
          </div>
          <div style={{ position: "relative", height: rowH * hours.length, borderRadius: 18, background: "#fff", backgroundImage: "linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px)", backgroundSize: `100% ${rowH}px` }}>
            {busy.map(([row, span]) => (
              <div key={row} style={{ position: "absolute", left: 8, right: 8, top: row * rowH + 4, height: span * rowH - 8, borderRadius: 16, background: "rgba(0,0,0,.06)" }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                top: 5 * rowH + 4,
                height: rowH - 8,
                borderRadius: 16,
                padding: "12px 18px",
                fontSize: 28,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: state === "free" ? "3px dashed #8a8984" : `3px solid ${state === "cancel" ? RED : "#2f7a3e"}`,
                background: state === "cancel" ? "rgba(229,72,77,.12)" : state === "free" ? "#fff" : "#e3efe4",
                color: state === "cancel" ? RED : state === "free" ? MUTE : "#1e5a2b",
                transform: state === "filled" ? `scale(${0.9 + fill * 0.1})` : undefined,
                boxShadow: state === "filled" ? `0 0 ${40 * fill}px rgba(47,158,74,.45)` : undefined,
              }}
            >
              <span>{state === "cancel" ? t.cancelled : state === "free" ? t.freed : t.filled}</span>
              {state === "filled" && <span style={{ fontSize: 20, padding: "6px 14px", borderRadius: 20, background: "#2f9e4a", color: "#fff", whiteSpace: "nowrap" }}>{t.filledChip}</span>}
            </div>
          </div>
        </div>
      </div>
      {/* offer sent to the waiting list */}
      {frame >= 34 && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 210, padding: "26px 30px", borderRadius: 40, background: "rgba(255,255,255,.95)", boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)", opacity: msg, transform: `translateY(${(1 - msg) * -260}px)` }}>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700, color: MUTE }}>
            <span style={{ color: SIGNAL }}>✦</span> {t.offerTo}
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 34, lineHeight: 1.3, fontWeight: 700, color: INK }}>{t.offer}</p>
        </div>
      )}
      <Caption text={t.captions.s5} from={6} to={118} />
    </AbsoluteFill>
  );
}

const SFX: Array<[number, string, number]> = [
  [0, "counter", 0.45],
  [62, "glitch", 0.7],
  [64, "bass", 0.95],
  [S.lost, "whoosh", 0.5],
  [S.lost + 26, "bass", 0.8],
  [S.lost + 40, "laser", 0.4],
  [S.brand, "laser", 0.7],
  [S.brand + 24, "bass", 0.6],
  [S.remind - 6, "whoosh", 0.6],
  [S.remind + 10, "buzz", 0.6],
  [S.remind + 74, "tap", 0.8],
  [S.remind + 76, "ding", 0.5],
  [S.remind + 100, "buzz", 0.5],
  [S.waitlist - 4, "whoosh", 0.6],
  [S.waitlist + 2, "glitch", 0.4],
  [S.waitlist + 34, "ding", 0.6],
  [S.waitlist + 70, "toggle", 0.8],
  [S.end, "chime", 0.7],
  [S.end + 80, "tap", 0.8],
];

export function Reel03({ lang }: { lang: Lang }) {
  const t = reel03[lang];
  const voice = `voice/reel-03-${lang}.mp3`;
  const scenes: Array<[number, number, ReactNode]> = [
    [S.wait, S.lost - S.wait, <Wait t={t} />],
    [S.lost, S.brand - S.lost, <Lost t={t} />],
    [S.brand, S.remind - S.brand, <Brand t={t} />],
    [S.remind, S.waitlist - S.remind, <Remind t={t} />],
    [S.waitlist, S.end - S.waitlist, <Waitlist t={t} />],
    [S.end, REEL03_FRAMES - S.end, <End t={t} />],
  ];
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#000" }}>
      {scenes.map(([from, dur, node], i) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          {node}
        </Sequence>
      ))}
      {SFX.map(([from, name, volume], i) => (
        <Sequence key={`sfx${i}`} from={from} layout="none">
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
        </Sequence>
      ))}
      {hasFile(voice) && <Audio src={staticFile(voice)} volume={1} />}
      {hasFile("music/reel-03.mp3") && <Audio src={staticFile("music/reel-03.mp3")} volume={0.18} />}
    </AbsoluteFill>
  );
}
