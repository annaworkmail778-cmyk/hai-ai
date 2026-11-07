import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";
import { reel02, type Copy02, type Lang } from "./copy";
import { Brand, Caption, Check, clamp, End, hasFile, IgIcon, INK, MUTE, PAPER, SIGNAL, TgIcon, useSpring } from "./Reel01";

/* Reel 02 «Նույն հարցը 100 անգամ» — 1080×1920, 30 fps, 22.5 s. */

export const REEL02_FRAMES = 675;
const S = { flood: 0, tower: 90, brand: 165, inbox: 225, langs: 420, end: 540 };

function WaIcon({ size = 44 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: "#25d366", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width={size * 0.6} height={size * 0.6} fill="none" stroke="#fff" strokeWidth="1.7">
        <path d="M3 13l.9-2.6A5.3 5.3 0 1 1 6 12.4z" />
      </svg>
    </span>
  );
}

function Channel({ c, size }: { c: string; size: number }) {
  return c === "whatsapp" ? <WaIcon size={size} /> : c === "telegram" ? <TgIcon size={size} /> : <IgIcon size={size} />;
}

/* ── 01 Flood of the same questions ─────────────────────────────────── */

function Flood({ t }: { t: Copy02 }) {
  const frame = useCurrentFrame();
  const count = Math.round(interpolate(frame, [0, 84], [1, 100], { ...clamp, easing: Easing.in(Easing.quad) }));
  const head = useSpring(46, { damping: 12, stiffness: 200 });
  const bubbles = Array.from({ length: 13 }, (_, i) => ({
    x: 40 + random(`x${i}`) * 480,
    y: 470 + (i / 13) * 820 + random(`y${i}`) * 60,
    r: (random(`r${i}`) - 0.5) * 14,
    at: 2 + i * 6,
    text: t.questions[i % t.questions.length],
    ch: ["instagram", "whatsapp", "telegram"][i % 3],
  }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(frame, [0, 90], [1.08, 1.18])})` }}>
        <OffthreadVideo src={staticFile("video/receptionist.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(1.5px) brightness(.6) saturate(1.1)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.1) 40%, rgba(0,0,0,.65))" }} />
      {bubbles.map((b, i) => {
        const p = interpolate(frame, [b.at, b.at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
        if (frame < b.at) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              transform: `scale(${p}) rotate(${b.r}deg)`,
              display: "flex",
              gap: 14,
              alignItems: "center",
              padding: "16px 24px 16px 16px",
              borderRadius: 40,
              background: "rgba(255,255,255,.94)",
              boxShadow: "0 20px 40px -16px rgba(0,0,0,.6)",
              fontSize: 34,
              fontWeight: 700,
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            <Channel c={b.ch} size={52} />
            {b.text}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 200, fontWeight: 900, color: SIGNAL, letterSpacing: "-0.04em", textShadow: "0 10px 60px rgba(0,0,0,.6)" }}>×{count}</p>
      </div>
      {frame >= 46 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 520 }}>
          <p style={{ margin: 0, padding: "18px 40px", borderRadius: 30, background: INK, color: "#fff", fontSize: 88, fontWeight: 900, letterSpacing: "-0.03em", transform: `scale(${1.6 - head * 0.6})`, opacity: head }}>
            {t.same}
          </p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

/* ── 02 Tower of «How much?» → «100 times a day» ────────────────────── */

function Tower({ t }: { t: Copy02 }) {
  const frame = useCurrentFrame();
  const lines = 11;
  const reveal = interpolate(frame, [0, 40], [0, lines], { ...clamp, easing: Easing.in(Easing.quad) });
  const cut = frame >= 46;
  const p = useSpring(46, { damping: 11, stiffness: 220 });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      {!cut ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {Array.from({ length: lines }, (_, i) => {
            const v = Math.max(0, Math.min(1, reveal - i));
            const size = 40 + i * 9;
            return (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontSize: size,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: i === lines - 1 ? "#fff" : `rgba(255,255,255,${0.15 + i * 0.06})`,
                  opacity: v,
                  transform: `translateY(${(1 - v) * 60}px)`,
                  filter: `blur(${(1 - v) * 10}px)`,
                }}
              >
                {t.tower}
              </p>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", transform: `scale(${1.5 - p * 0.5})`, opacity: p }}>
          <p style={{ margin: 0, fontSize: 96, fontWeight: 900, color: "#fff" }}>{t.perDay[0]}</p>
          <p style={{ margin: 0, fontSize: 420, lineHeight: 0.9, fontWeight: 900, color: SIGNAL, letterSpacing: "-0.05em" }}>{t.perDay[1]}</p>
          <p style={{ margin: 0, fontSize: 96, fontWeight: 900, color: "#fff" }}>{t.perDay[2]}</p>
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ── 04 Inbox: every chat answered ──────────────────────────────────── */

function Inbox({ t }: { t: Copy02 }) {
  const frame = useCurrentFrame();
  const title = useSpring(0);
  const card = useSpring(6, { damping: 16, stiffness: 110 });
  const count = Math.round(interpolate(frame, [30, 150], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) }));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 25%, #fff, ${PAPER} 60%)` }}>
      <div style={{ position: "absolute", right: -260, top: 900, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.2), transparent 65%)" }} />
      <p style={{ position: "absolute", top: 170, left: 70, right: 70, margin: 0, textAlign: "center", whiteSpace: "pre-line", fontSize: 70, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.03em", color: INK, opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>
        {t.inboxTitle}
      </p>
      <div style={{ position: "absolute", left: 90, right: 90, top: 400, borderRadius: 48, background: "#fff", boxShadow: "0 50px 100px -40px rgba(0,0,0,.35)", padding: 34, opacity: card, transform: `translateY(${(1 - card) * 300}px)` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 22, borderBottom: "1px solid rgba(0,0,0,.07)" }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: MUTE }}>{t.answered}</span>
          <span style={{ fontSize: 76, fontWeight: 900, color: INK, letterSpacing: "-0.03em" }}>
            {count}
            <span style={{ color: SIGNAL }}>%</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          {t.chats.map(([name, ch, text], i) => {
            const at = 30 + i * 20;
            const done = frame >= at;
            const flip = interpolate(frame, [at, at + 8], [0, 1], clamp);
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 18px", borderRadius: 26, background: done ? "#f3faf4" : "#f6f5f1", border: `2px solid ${done ? "rgba(47,122,62,.25)" : "transparent"}` }}>
                <span style={{ position: "relative", width: 72, height: 72, borderRadius: 72, background: INK, color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {name.slice(0, 1)}
                  <span style={{ position: "absolute", right: -6, bottom: -6 }}>
                    <Channel c={ch} size={34} />
                  </span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: INK }}>{name}</p>
                  <p style={{ margin: 0, fontSize: 26, color: MUTE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</p>
                </div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 18px",
                    borderRadius: 30,
                    fontSize: 24,
                    fontWeight: 700,
                    background: done ? "#e3efe4" : "rgba(255,91,20,.12)",
                    color: done ? "#1e5a2b" : "#b33c06",
                    transform: `scale(${done ? 0.9 + flip * 0.1 : 1})`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {done ? <Check size={30} bg="transparent" /> : <span style={{ width: 12, height: 12, borderRadius: 12, background: SIGNAL }} />}
                  {done ? t.aiDone : t.waiting}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Caption text={t.captions.s4} from={20} to={192} />
    </AbsoluteFill>
  );
}

/* ── 05 Three languages ─────────────────────────────────────────────── */

function Langs({ t }: { t: Copy02 }) {
  const frame = useCurrentFrame();
  const title = useSpring(0);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2a1408, #0b0b0c 65%)" }}>
      <p style={{ position: "absolute", top: 190, left: 0, right: 0, margin: 0, textAlign: "center", fontSize: 92, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", opacity: title, transform: `scale(${0.9 + title * 0.1})` }}>
        {t.langTitle}
      </p>
      {t.langs.map(([code, q, a], i) => {
        const p = springIn(frame, 8 + i * 10);
        const angle = (i - 1) * 7;
        const x = 540 + (i - 1) * 330;
        return (
          <div
            key={code}
            style={{
              position: "absolute",
              left: x - 180,
              top: 430 + Math.abs(i - 1) * 70,
              width: 360,
              height: 820,
              borderRadius: 64,
              border: "10px solid #1b1b1b",
              background: "linear-gradient(180deg,#fff,#f7f6f2)",
              boxShadow: "0 50px 100px -30px rgba(0,0,0,.8)",
              transform: `translateY(${(1 - p) * 700}px) rotate(${angle * p}deg)`,
              zIndex: i === 1 ? 3 : 1,
              overflow: "hidden",
              padding: "70px 22px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <span style={{ alignSelf: "center", padding: "8px 22px", borderRadius: 30, background: SIGNAL, color: INK, fontSize: 28, fontWeight: 900 }}>{code}</span>
            <div style={{ flex: 1 }} />
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", padding: "16px 20px", borderRadius: 26, borderBottomLeftRadius: 8, background: "#efede7", fontSize: 25, lineHeight: 1.3, color: INK }}>{q}</div>
            <div style={{ alignSelf: "flex-end", fontSize: 20, fontWeight: 700, color: "#55544f" }}>
              <span style={{ color: SIGNAL }}>✦</span> AI
            </div>
            <div style={{ alignSelf: "flex-end", maxWidth: "92%", padding: "16px 20px", borderRadius: 26, borderBottomRightRadius: 8, background: "linear-gradient(135deg,#2a2a2a,#0d0d0d)", color: "#fff", fontSize: 26, lineHeight: 1.3, opacity: interpolate(frame, [30 + i * 10, 40 + i * 10], [0, 1], clamp) }}>
              {a}
            </div>
          </div>
        );
      })}
      <Caption text={t.captions.s5} from={6} to={118} />
    </AbsoluteFill>
  );
}

/** Spring-like ease without a hook (used inside a loop). */
function springIn(frame: number, delay: number) {
  return interpolate(frame, [delay, delay + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
}

/* ── Sound design ───────────────────────────────────────────────────── */

const SFX: Array<[number, string, number]> = [
  [0, "pops", 0.75],
  [0, "counter", 0.4],
  [46, "bass", 0.9],
  [S.tower, "whoosh", 0.5],
  [S.tower + 46, "bass", 0.95],
  [S.brand, "laser", 0.7],
  [S.brand + 24, "bass", 0.6],
  [S.inbox - 6, "whoosh", 0.6],
  ...[0, 1, 2, 3, 4, 5].map((i): [number, string, number] => [S.inbox + 30 + i * 20, "tap", 0.55]),
  [S.inbox + 150, "ding", 0.6],
  [S.langs - 4, "whoosh", 0.6],
  [S.langs + 30, "ding", 0.5],
  [S.end, "chime", 0.7],
  [S.end + 80, "tap", 0.8],
];

export function Reel02({ lang }: { lang: Lang }) {
  const t = reel02[lang];
  const voice = `voice/reel-02-${lang}.mp3`;
  const scenes: Array<[number, number, ReactNode]> = [
    [S.flood, S.tower - S.flood, <Flood t={t} />],
    [S.tower, S.brand - S.tower, <Tower t={t} />],
    [S.brand, S.inbox - S.brand, <Brand t={t} />],
    [S.inbox, S.langs - S.inbox, <Inbox t={t} />],
    [S.langs, S.end - S.langs, <Langs t={t} />],
    [S.end, REEL02_FRAMES - S.end, <End t={t} />],
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
      {hasFile("music/reel-02.mp3") && <Audio src={staticFile("music/reel-02.mp3")} volume={0.18} />}
    </AbsoluteFill>
  );
}

