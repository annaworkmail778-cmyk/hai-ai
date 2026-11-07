import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  getStaticFiles,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "./fonts";
import { reel01, type Copy, type Lang } from "./copy";

/* Reel 01 «23:40» — Riseup AI administrator. 1080×1920, 30 fps, 25 s. */

const INK = "#0b0b0c";
const PAPER = "#f3f2ee";
const SIGNAL = "#ff5b14";
const MUTE = "#6b6a66";
const IG = "linear-gradient(45deg,#f9b234,#ee2a7b 55%,#6228d7)";

export const REEL01_FRAMES = 750;

/** Scene starts (frames). */
const S = { hook: 0, sleep: 75, brand: 150, chat: 210, panel: 420, morning: 540, end: 615 };

/* ── helpers ─────────────────────────────────────────────────────────── */

function useSpring(delay = 0, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140, mass: 0.8, ...config } });
}

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Pop({ delay = 0, from = 40, children, style }: { delay?: number; from?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useSpring(delay);
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * from}px) scale(${0.92 + p * 0.08})`, ...style }}>
      {children}
    </div>
  );
}

function Glyph({ size = 120, color = "#fff", grow }: { size?: number; color?: string; grow?: [number, number, number] }) {
  const [a, b, c] = grow ?? [1, 1, 1];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} style={{ overflow: "visible" }}>
      <rect x="1.5" y="12" width="4" height="6.5" rx="1" fill={color} style={{ transformOrigin: "3.5px 18.5px", transform: `scaleY(${a})` }} />
      <rect x="7.75" y="8.5" width="4" height="10" rx="1" fill={color} style={{ transformOrigin: "9.75px 18.5px", transform: `scaleY(${b})` }} />
      <path d="M14 18.5V7.5h-1.6L16 2.5l3.6 5H18v11z" fill={SIGNAL} style={{ transformOrigin: "16px 18.5px", transform: `scaleY(${c})` }} />
    </svg>
  );
}

function IgIcon({ size = 44 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size / 3.4, background: IG, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width={size * 0.62} height={size * 0.62} fill="none" stroke="#fff" strokeWidth="1.7">
        <rect x="2.5" y="2.5" width="11" height="11" rx="3.2" />
        <circle cx="8" cy="8" r="2.6" />
        <circle cx="11.4" cy="4.6" r="0.6" fill="#fff" stroke="none" />
      </svg>
    </span>
  );
}

function TgIcon({ size = 44 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: "#2aabee", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width={size * 0.58} height={size * 0.58} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M2.5 7.6 13.5 3l-2 10-3.6-2.8-1.8 1.8v-3l5-4.6-6.2 3.9z" />
      </svg>
    </span>
  );
}

function Check({ size = 56, bg = "#e3efe4", color = "#1e5a2b" }: { size?: number; bg?: string; color?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function Cursor({ x, y, press }: { x: number; y: number; press: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.18})`, transformOrigin: "8px 6px", zIndex: 50, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}>
      <svg width="64" height="64" viewBox="0 0 24 24">
        <path d="M5 3l14 8.2-6.1 1.3 3.6 6.6-2.6 1.4-3.6-6.6L5.8 18z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Lower-third captions with a word-by-word highlight. Kept inside Instagram's safe zone. */
function Caption({ text, from, to, dark = true }: { text: string; from: number; to: number; dark?: boolean }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const shown = interpolate(frame, [from, to - 10], [0, words.length], clamp);
  const o = interpolate(frame, [from - 4, from + 4, to - 4, to + 2], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1405, display: "flex", justifyContent: "center", opacity: o }}>
      <p
        style={{
          margin: 0,
          padding: "18px 30px",
          borderRadius: 26,
          background: dark ? "rgba(11,11,12,.82)" : "rgba(255,255,255,.88)",
          color: dark ? "#fff" : INK,
          fontSize: 44,
          lineHeight: 1.28,
          fontWeight: 700,
          textAlign: "center",
          maxWidth: 940,
          backdropFilter: "blur(12px)",
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ color: i < shown && i >= shown - 1.5 ? SIGNAL : undefined, opacity: i < shown + 0.3 ? 1 : 0.35 }}>
            {w}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

/* ── 01 Hook: 23:40 ─────────────────────────────────────────────────── */

function Hook({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const slam = useSpring(4, { damping: 11, stiffness: 220, mass: 0.6 });
  const blur = interpolate(frame, [4, 12], [28, 0], clamp);
  const split = interpolate(frame, [4, 14], [22, 0], clamp);
  const laser = interpolate(frame, [16, 30], [-1400, 1400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const typed = Math.floor(interpolate(frame, [28, 50], [0, t.hookSub.length], clamp));
  const notif = useSpring(40, { damping: 15, stiffness: 160 });
  const zoom = interpolate(frame, [0, 75], [1.32, 1.42]);
  const shake = frame >= 4 && frame < 12 ? (random(`s${frame}`) - 0.5) * 18 : 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "62% 52%" }}>
        <OffthreadVideo src={staticFile("video/night.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.15) 45%, rgba(0,0,0,.7))" }} />

      {/* iOS-style notification */}
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          top: 250,
          transform: `translateY(${(1 - notif) * -260}px)`,
          opacity: notif,
          display: "flex",
          gap: 22,
          alignItems: "center",
          padding: "24px 28px",
          borderRadius: 40,
          background: "rgba(40,40,46,.72)",
          backdropFilter: "blur(18px)",
          color: "#fff",
        }}
      >
        <IgIcon size={78} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
            <span>{t.instagram} · {t.notifFrom}</span>
            <span style={{ fontWeight: 400, opacity: 0.6 }}>{t.now}</span>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 32, lineHeight: 1.3, opacity: 0.92 }}>{t.notifText}</p>
        </div>
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${shake}px, 40px)` }}>
        <div style={{ position: "relative", transform: `scale(${2.3 - slam * 1.3})`, opacity: Math.min(1, slam * 2), filter: `blur(${blur}px)` }}>
          <p style={{ margin: 0, fontSize: 330, fontWeight: 900, letterSpacing: "-0.04em", color: SIGNAL, position: "absolute", inset: 0, transform: `translateX(${split}px)`, opacity: 0.7, mixBlendMode: "screen" }}>
            23:40
          </p>
          <p style={{ margin: 0, fontSize: 330, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", position: "relative", textShadow: "0 20px 80px rgba(0,0,0,.6)" }}>23:40</p>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 64, fontWeight: 500, color: "rgba(255,255,255,.9)", minHeight: 80 }}>
          {t.hookSub.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 && typed < t.hookSub.length ? 1 : 0, color: SIGNAL }}>|</span>
        </p>
      </AbsoluteFill>

      {/* laser slice */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          width: 2600,
          height: 6,
          marginLeft: -1300,
          background: `linear-gradient(90deg, transparent, ${SIGNAL} 30%, #fff 50%, ${SIGNAL} 70%, transparent)`,
          boxShadow: `0 0 30px 8px ${SIGNAL}`,
          transform: `rotate(-24deg) translateX(${laser}px)`,
          opacity: frame > 15 && frame < 32 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
}

/* ── 02 You sleep. The admin too. ? ─────────────────────────────────── */

function Sleep({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const w1 = useSpring(0, { damping: 13, stiffness: 180 });
  const w2 = useSpring(26, { damping: 13, stiffness: 180 });
  const burst = useSpring(52, { damping: 9, stiffness: 200, mass: 0.7 });
  const glitch = frame >= 42 && frame < 52;
  const gx = glitch ? (random(`g${frame}`) - 0.5) * 40 : 0;
  const wordsOut = interpolate(frame, [50, 56], [1, 0], clamp);
  const style = (p: number): CSSProperties => ({
    margin: 0,
    fontSize: 118,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#fff",
    opacity: Math.min(1, p * 1.5),
    transform: `translateY(${(1 - p) * 160}px) skewY(${(1 - p) * 8}deg)`,
    filter: `blur(${(1 - p) * 14}px)`,
  });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1a1a1c, #000 70%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: wordsOut, transform: `translateX(${gx}px)`, padding: "0 60px" }}>
        <p style={{ ...style(w1), opacity: Math.min(1, w1 * 1.5) * (frame > 26 ? 0.38 : 1) }}>{t.w1}</p>
        <div style={{ position: "relative", marginTop: 30 }}>
          {glitch && <p style={{ ...style(w2), position: "absolute", inset: 0, color: SIGNAL, transform: `translateX(${-gx * 0.6}px)`, mixBlendMode: "screen" }}>{t.w2}</p>}
          <p style={style(w2)}>{t.w2}</p>
        </div>
      </div>
      {frame >= 50 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 760, height: 760, transform: `scale(${burst}) rotate(${(1 - burst) * -40 + frame * 0.15}deg)` }}>
            <svg viewBox="0 0 200 200" width="760" height="760">
              <polygon
                fill={SIGNAL}
                points={Array.from({ length: 28 }, (_, i) => {
                  const r = i % 2 ? 62 + random(`b${i}`) * 10 : 96 - random(`c${i}`) * 8;
                  const a = (i / 28) * Math.PI * 2;
                  return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
                }).join(" ")}
              />
            </svg>
            <p style={{ position: "absolute", inset: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 380, fontWeight: 900, color: "#fff", transform: `rotate(${-((1 - burst) * -40 + frame * 0.15)}deg)` }}>?</p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

/* ── 03 Riseup doesn't sleep ────────────────────────────────────────── */

function Brand({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const g1 = useSpring(14, { damping: 12, stiffness: 160 });
  const g2 = useSpring(19, { damping: 12, stiffness: 160 });
  const g3 = useSpring(24, { damping: 10, stiffness: 170 });
  const text = useSpring(28, { damping: 15, stiffness: 140 });
  const out = interpolate(frame, [50, 60], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile("video/laser.mp4")} startFrom={60} muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + out * 0.35})`, filter: `blur(${out * 18}px)`, opacity: 1 - out * 0.6 }}>
        <div style={{ transform: "translateY(-140px)" }}>
          <Glyph size={260} grow={[g1, g2, g3]} />
        </div>
        <p
          style={{
            margin: 0,
            marginTop: -40,
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: `${(1 - text) * 0.25 - 0.03}em`,
            color: "#fff",
            opacity: text,
            textAlign: "center",
            textShadow: `0 0 60px rgba(255,91,20,.55)`,
            padding: "0 50px",
          }}
        >
          {t.notSleep}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── 04 Chat: answer, book ──────────────────────────────────────────── */

function Bubble({ from, label, children, delay }: { from: "them" | "us"; label?: string; children: ReactNode; delay: number }) {
  const us = from === "us";
  return (
    <Pop delay={delay} from={50} style={{ display: "flex", flexDirection: "column", alignItems: us ? "flex-end" : "flex-start", gap: 8 }}>
      {label && (
        <span style={{ fontSize: 24, fontWeight: 700, color: "#55544f", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: SIGNAL }}>✦</span>
          {label}
        </span>
      )}
      <div
        style={{
          maxWidth: "84%",
          padding: "20px 26px",
          borderRadius: 34,
          [us ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 10,
          background: us ? "linear-gradient(135deg,#2a2a2a,#0d0d0d)" : "#efede7",
          color: us ? "#fff" : INK,
          fontSize: 32,
          lineHeight: 1.32,
          boxShadow: us ? "0 12px 28px -14px rgba(0,0,0,.6)" : undefined,
        }}
      >
        {children}
      </div>
    </Pop>
  );
}

function Chat({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const phone = useSpring(0, { damping: 16, stiffness: 110 });
  const title = useSpring(4);
  // cursor path to the first time chip, tap at frame 135
  const cx = interpolate(frame, [96, 132], [880, 410], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(frame, [96, 132], [1550, 1290], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [132, 136, 142], [0, 1, 0], clamp);
  const picked = frame >= 136;
  const ripple = interpolate(frame, [136, 156], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #fff, ${PAPER} 60%)` }}>
      <div style={{ position: "absolute", left: -200, top: 900, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.22), transparent 65%)" }} />
      <p
        style={{
          position: "absolute",
          top: 170,
          left: 80,
          right: 80,
          margin: 0,
          textAlign: "center",
          fontSize: 66,
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: INK,
          opacity: title,
          transform: `translateY(${(1 - title) * 40}px)`,
        }}
      >
        {t.s4Title}
      </p>

      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: 230,
          top: 400,
          width: 620,
          height: 975,
          borderRadius: 86,
          border: "14px solid #1b1b1b",
          background: "linear-gradient(180deg,#fff,#f7f6f2)",
          overflow: "hidden",
          boxShadow: "0 60px 120px -40px rgba(0,0,0,.45), 0 0 0 2px rgba(0,0,0,.06)",
          transform: `perspective(2000px) translateY(${(1 - phone) * 500}px) rotateX(${(1 - phone) * 25}deg)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 46, display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <span style={{ width: 170, height: 40, borderRadius: 40, background: "#141414" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 30px", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
          <span style={{ width: 74, height: 74, borderRadius: 74, padding: 4, background: IG, display: "flex" }}>
            <span style={{ flex: 1, borderRadius: 70, border: "4px solid #fff", background: "linear-gradient(135deg,#2b2b2b,#0e0e0e)", color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>B</span>
          </span>
          <div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: INK }}>{t.salon}</p>
            <p style={{ margin: 0, fontSize: 24, color: MUTE }}>{t.handle} · Instagram</p>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 26, right: 26, bottom: 26, display: "flex", flexDirection: "column", gap: 22 }}>
            <Bubble from="them" delay={12}>{t.msg1}</Bubble>
            {frame >= 35 && frame < 70 && (
              <div style={{ alignSelf: "flex-end", display: "flex", gap: 10, padding: "22px 26px", borderRadius: 30, background: "#141414" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 14, height: 14, borderRadius: 14, background: "#fff", opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame - i * 5) / 5)) }} />
                ))}
              </div>
            )}
            {frame >= 70 && <Bubble from="us" label={t.ai} delay={70}>{t.ai1}</Bubble>}
            {frame >= 88 && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, position: "relative" }}>
                {t.times.map((time, i) => (
                  <Pop key={time} delay={88 + i * 5} from={20}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "14px 26px",
                        borderRadius: 40,
                        fontSize: 30,
                        fontWeight: 700,
                        border: `2px solid ${picked && i === 0 ? SIGNAL : "rgba(0,0,0,.14)"}`,
                        background: picked && i === 0 ? SIGNAL : "#fff",
                        color: INK,
                        position: "relative",
                        boxShadow: picked && i === 0 ? `0 0 0 ${ripple * 26}px rgba(255,91,20,${0.35 * (1 - ripple)})` : undefined,
                      }}
                    >
                      {time}
                    </span>
                  </Pop>
                ))}
              </div>
            )}
            {frame >= 150 && <Bubble from="us" label={t.ai} delay={150}>{t.ai2}</Bubble>}
            {frame >= 172 && (
              <Pop delay={172} from={30} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", borderRadius: 28, background: "#e3efe4", color: "#1e5a2b" }}>
                <Check size={58} bg="#fff" />
                <div>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{t.booked}</p>
                  <p style={{ margin: 0, fontSize: 25 }}>{t.bookedText}</p>
                </div>
              </Pop>
            )}
          </div>
        </div>
      </div>
      {frame >= 96 && frame < 160 && <Cursor x={cx} y={cy} press={press} />}
      <Caption text={t.captions.s4} from={14} to={205} />
    </AbsoluteFill>
  );
}

/* ── 05 Owner's panel in 3D + Telegram ──────────────────────────────── */

function Panel({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const enter = useSpring(0, { damping: 18, stiffness: 90 });
  const block = useSpring(28, { damping: 10, stiffness: 180 });
  const tg = useSpring(50, { damping: 14, stiffness: 150 });
  const rx = interpolate(frame, [0, 120], [30, 16]);
  const ry = interpolate(frame, [0, 120], [-22, -10]);
  const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const busy: Array<[number, number, number]> = [[0, 2.5, 1.5], [0, 5, 1], [1, 0, 1], [1, 2, 1.5], [1, 5.5, 1]];
  const rowH = 96;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1408, #0b0b0c 65%)", perspective: 2400 }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 360,
          width: 860,
          height: 1000,
          borderRadius: 40,
          background: "#f6f5f1",
          boxShadow: "0 80px 140px -50px rgba(0,0,0,.9), 0 0 0 2px rgba(255,255,255,.08)",
          transform: `translateY(${(1 - enter) * 600}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(5deg)`,
          overflow: "hidden",
          opacity: enter,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "26px 34px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
          <Glyph size={40} color={INK} />
          <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: INK, flex: 1 }}>{t.panel}</p>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1e5a2b", background: "#e3efe4", padding: "6px 16px", borderRadius: 30 }}>● Live</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 14, padding: "22px 30px 0", fontSize: 28, fontWeight: 700, color: "#55544f" }}>
          <span>{t.tomorrow}</span>
          {t.masters.map((m) => (
            <span key={m} style={{ textAlign: "center" }}>{m}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 14, padding: "16px 30px" }}>
          <div style={{ position: "relative", height: rowH * hours.length }}>
            {hours.map((h, i) => (
              <span key={h} style={{ position: "absolute", top: i * rowH, fontSize: 22, color: "#8a8984" }}>{h}</span>
            ))}
          </div>
          {[0, 1].map((col) => (
            <div key={col} style={{ position: "relative", height: rowH * hours.length, borderRadius: 18, background: "#fff", backgroundImage: `linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px)`, backgroundSize: `100% ${rowH}px` }}>
              {busy.filter(([c]) => c === col).map(([, row, span]) => (
                <div key={row} style={{ position: "absolute", left: 8, right: 8, top: row * rowH + 4, height: span * rowH - 8, borderRadius: 16, background: "rgba(0,0,0,.06)", fontSize: 22, color: MUTE, padding: "10px 14px" }}>{t.busy}</div>
              ))}
              {col === 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    top: rowH + 4,
                    height: rowH - 8,
                    borderRadius: 16,
                    background: "rgba(255,91,20,.16)",
                    border: `3px solid ${SIGNAL}`,
                    fontSize: 24,
                    fontWeight: 700,
                    color: INK,
                    padding: "10px 14px",
                    transform: `scale(${block})`,
                    opacity: block,
                    boxShadow: `0 0 ${40 * block}px rgba(255,91,20,.55)`,
                  }}
                >
                  {t.visit}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Telegram notification in front */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 230,
          transform: `translateY(${(1 - tg) * -300}px) rotateX(${(1 - tg) * 40}deg)`,
          opacity: tg,
          display: "flex",
          gap: 22,
          alignItems: "center",
          padding: "26px 30px",
          borderRadius: 40,
          background: "rgba(255,255,255,.95)",
          boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)",
        }}
      >
        <TgIcon size={80} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 34, fontWeight: 700, color: INK }}>{t.tgTitle}</p>
          <p style={{ margin: "6px 0 0", fontSize: 28, color: "#55544f" }}>{t.tgText}</p>
        </div>
      </div>
      <Caption text={t.captions.s5} from={6} to={118} />
    </AbsoluteFill>
  );
}

/* ── 06 Morning reminder ────────────────────────────────────────────── */

function Morning({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const clock = useSpring(0, { damping: 14, stiffness: 150 });
  const card = useSpring(12, { damping: 14, stiffness: 150 });
  const knob = interpolate(frame, [38, 46], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const done = useSpring(50);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg,#ffd9c2,#f6b9cf 45%,#b9b4f5)", alignItems: "center" }}>
      <p style={{ margin: "250px 0 0", fontSize: 250, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff", textShadow: "0 20px 60px rgba(0,0,0,.18)", transform: `scale(${0.8 + clock * 0.2})`, opacity: clock }}>
        09:00
      </p>
      <div style={{ width: 920, marginTop: 40, padding: 38, borderRadius: 48, background: "rgba(255,255,255,.82)", backdropFilter: "blur(20px)", boxShadow: "0 40px 80px -40px rgba(0,0,0,.4)", opacity: card, transform: `translateY(${(1 - card) * 120}px)` }}>
        <p style={{ margin: 0, display: "flex", gap: 18, alignItems: "center", fontSize: 32, fontWeight: 700, color: INK }}>
          <IgIcon size={56} />
          {t.reminderTitle}
        </p>
        <p style={{ margin: "20px 0 0", fontSize: 40, lineHeight: 1.3, color: INK }}>{t.reminder}</p>
        <div style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderRadius: 30, background: "#fff" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: INK }}>{t.confirm}</span>
          <span style={{ width: 132, height: 76, borderRadius: 76, background: knob > 0.5 ? SIGNAL : "#d9d6ce", position: "relative", transition: "none" }}>
            <span style={{ position: "absolute", top: 6, left: 6 + knob * 56, width: 64, height: 64, borderRadius: 64, background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,.25)" }} />
          </span>
        </div>
        {frame >= 50 && (
          <div style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "center", fontSize: 34, fontWeight: 700, color: "#1e5a2b", opacity: done, transform: `translateY(${(1 - done) * 20}px)` }}>
            <Check size={54} />
            {t.confirmed}
          </div>
        )}
      </div>
      <Caption text={t.captions.s6} from={4} to={74} />
    </AbsoluteFill>
  );
}

/* ── 07 End card ────────────────────────────────────────────────────── */

function End({ t }: { t: Copy }) {
  const frame = useCurrentFrame();
  const logo = useSpring(2, { damping: 12, stiffness: 150 });
  const title = useSpring(14);
  const price = useSpring(30);
  const btn = useSpring(42);
  const cx = interpolate(frame, [52, 76], [930, 640], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(frame, [52, 76], [1500, 1110], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [76, 80, 86], [0, 1, 0], clamp);
  const clicked = frame >= 80;
  const ring = interpolate(frame, [80, 104], [0, 1], clamp);
  const drift = Math.sin(frame / 40) * 40;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg,#fff7f1,#ffe3d2 55%,#ffd2b8)", alignItems: "center" }}>
      <div style={{ position: "absolute", left: -220 + drift, top: 120, width: 760, height: 760, borderRadius: 760, background: "radial-gradient(circle, rgba(255,91,20,.32), transparent 65%)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", right: -260 - drift, top: 1050, width: 820, height: 820, borderRadius: 820, background: "radial-gradient(circle, rgba(246,185,207,.6), transparent 65%)", filter: "blur(10px)" }} />

      <div style={{ marginTop: 300, display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.7 + logo * 0.3})`, opacity: logo }}>
        <Glyph size={130} color={INK} grow={[logo, logo, logo]} />
        <span style={{ fontSize: 120, fontWeight: 700, letterSpacing: "-0.04em", color: INK }}>Riseup</span>
      </div>
      <p style={{ margin: "50px 60px 0", textAlign: "center", whiteSpace: "pre-line", fontSize: 68, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.02em", color: INK, opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>
        {t.endTitle}
      </p>
      <span style={{ marginTop: 44, padding: "16px 34px", borderRadius: 60, background: INK, color: "#fff", fontSize: 40, fontWeight: 700, opacity: price, transform: `scale(${0.8 + price * 0.2})` }}>
        {t.price}
      </span>
      <div style={{ marginTop: 70, opacity: btn, transform: `translateY(${(1 - btn) * 60}px) scale(${1 - press * 0.05})` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "34px 60px",
            borderRadius: 100,
            background: clicked ? SIGNAL : INK,
            color: clicked ? INK : "#fff",
            fontSize: 54,
            fontWeight: 900,
            boxShadow: `0 30px 60px -24px rgba(255,91,20,.7), 0 0 0 ${ring * 40}px rgba(255,91,20,${0.3 * (1 - ring)})`,
          }}
        >
          {t.cta}
          <IgIcon size={64} />
        </div>
      </div>
      <p style={{ marginTop: 34, fontSize: 34, color: "#55544f", opacity: btn }}>{t.ctaNote}</p>
      {frame >= 52 && frame < 110 && <Cursor x={cx} y={cy} press={press} />}
    </AbsoluteFill>
  );
}

/* ── Sound design ───────────────────────────────────────────────────── */

const SFX: Array<[number, string, number]> = [
  [0, "buzz", 0.9],
  [4, "bass", 0.9],
  [15, "laser", 0.6],
  [40, "ding", 0.55],
  [S.sleep, "whoosh", 0.5],
  [S.sleep + 42, "glitch", 0.7],
  [S.sleep + 52, "bass", 0.9],
  [S.brand, "laser", 0.7],
  [S.brand + 24, "bass", 0.6],
  [S.chat - 6, "whoosh", 0.6],
  [S.chat + 12, "ding", 0.5],
  [S.chat + 36, "typing", 0.45],
  [S.chat + 136, "tap", 0.8],
  [S.chat + 172, "ding", 0.55],
  [S.panel - 4, "whoosh", 0.6],
  [S.panel + 50, "ding", 0.6],
  [S.morning - 4, "whoosh", 0.5],
  [S.morning + 40, "toggle", 0.8],
  [S.end, "chime", 0.7],
  [S.end + 80, "tap", 0.8],
];

function hasFile(path: string) {
  try {
    return getStaticFiles().some((f) => f.name === path);
  } catch {
    return false;
  }
}

/* ── Composition ────────────────────────────────────────────────────── */

export function Reel01({ lang }: { lang: Lang }) {
  const t = reel01[lang];
  const voice = `voice/reel-01-${lang}.mp3`;
  const scenes: Array<[number, number, ReactNode]> = [
    [S.hook, S.sleep - S.hook, <Hook t={t} />],
    [S.sleep, S.brand - S.sleep, <Sleep t={t} />],
    [S.brand, S.chat - S.brand, <Brand t={t} />],
    [S.chat, S.panel - S.chat, <Chat t={t} />],
    [S.panel, S.morning - S.panel, <Panel t={t} />],
    [S.morning, S.end - S.morning, <Morning t={t} />],
    [S.end, REEL01_FRAMES - S.end, <End t={t} />],
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
      {hasFile("music/reel-01.mp3") && <Audio src={staticFile("music/reel-01.mp3")} volume={0.18} />}
    </AbsoluteFill>
  );
}
