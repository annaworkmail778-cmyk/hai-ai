import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";
import { Check, clamp, Glyph, IgIcon, INK, Pop, SIGNAL, TgIcon, useSpring, Word, hasFile } from "../Reel01";
import type { Highlight, Story, Visual } from "./data";

/* One Instagram highlight story: 1080×1920. Top 250px and bottom 300px stay clear for Instagram UI. */

export const STORY_FRAMES = 210;
const SOFT = "rgba(255,255,255,.62)";

export function StoryFrame({ hl, index }: { hl: Highlight; index: number }) {
  const s = hl.stories[index];
  const frame = useCurrentFrame();
  const title = useSpring(6);
  const body = useSpring(16);
  const drift = Math.sin(frame / 50) * 30;
  const bg = s.bg ? `bg/${s.bg}.jpg` : null;
  const hasBg = bg && hasFile(bg);

  return (
    <AbsoluteFill style={{ background: INK, fontFamily: FONT, color: "#fff" }}>
      {hasBg ? (
        <>
          <Img src={staticFile(bg)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 - frame / 4000})` }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,12,.92) 0%, rgba(11,11,12,.55) 45%, rgba(11,11,12,.9) 100%)" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: -260 + drift, top: 180, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.28), transparent 65%)" }} />
          <div style={{ position: "absolute", right: -320 - drift, top: 1100, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.16), transparent 65%)" }} />
        </>
      )}

      {/* header */}
      <div style={{ position: "absolute", top: 250, left: 80, right: 80, display: "flex", alignItems: "center", gap: 20 }}>
        <Glyph size={58} />
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: SOFT }}>{hl.label}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {hl.stories.map((_, i) => (
            <span key={i} style={{ width: i === index ? 36 : 12, height: 12, borderRadius: 12, background: i === index ? SIGNAL : "rgba(255,255,255,.25)" }} />
          ))}
        </span>
      </div>

      {/* title */}
      <div style={{ position: "absolute", top: 360, left: 80, right: 80 }}>
        <h1 style={{ margin: 0, fontSize: s.title.length > 26 ? 76 : 92, lineHeight: 1.08, fontWeight: 900, letterSpacing: "-0.02em", opacity: title, transform: `translateY(${(1 - title) * 50}px)` }}>{s.title}</h1>
        {s.body && <p style={{ margin: "28px 0 0", fontSize: 40, lineHeight: 1.32, color: SOFT, opacity: body, transform: `translateY(${(1 - body) * 30}px)` }}>{s.body}</p>}
      </div>

      {/* visual */}
      <div style={{ position: "absolute", left: 80, right: 80, top: s.body ? 780 : 680, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <VisualBlock v={s.visual} />
      </div>

      {/* footer */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1450, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          {s.price && (
            <Pop delay={70}>
              <span style={{ display: "inline-block", padding: "16px 30px", borderRadius: 60, background: "#fff", color: INK, fontSize: 40, fontWeight: 900 }}>{s.price}</span>
            </Pop>
          )}
          {s.cta && (
            <Pop delay={80}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 30px", borderRadius: 60, background: SIGNAL, color: INK, fontSize: 40, fontWeight: 900 }}>
                Գրեք «ԴԵՄՈ»
                <IgIcon size={46} />
              </span>
            </Pop>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 30, color: "rgba(255,255,255,.45)", opacity: body }}>{s.ru}</p>
      </div>

      <Sfx story={s} />
    </AbsoluteFill>
  );
}

function Sfx({ story }: { story: Story }) {
  const cues: Array<[number, string, number]> = [[0, "whoosh", 0.35]];
  if (story.visual.kind === "chat") story.visual.bubbles.forEach((_, i) => cues.push([bubbleDelay(i) + 2, "ding", 0.3]));
  if (story.visual.kind === "checks" || story.visual.kind === "prices") cues.push([30, "pops", 0.35]);
  if (story.visual.kind === "logo") cues.push([10, "laser", 0.4], [26, "bass", 0.5]);
  if (story.visual.kind === "typing") cues.push([30, "typing", 0.4], [86, "tap", 0.6], [92, "ding", 0.5]);
  if (story.visual.kind === "stars") cues.push([40, "counter", 0.35]);
  if (story.price || story.cta) cues.push([72, "tap", 0.35]);
  return (
    <>
      {cues.map(([at, name, volume], i) => (
        <Sequence key={i} from={at}>
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

/* ── visuals ─────────────────────────────────────────────────────────── */

const card = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 40 } as const;
const bubbleDelay = (i: number) => 24 + i * 34;

function VisualBlock({ v }: { v: Visual }) {
  switch (v.kind) {
    case "logo":
      return <LogoReveal />;
    case "chat":
      return <ChatCard v={v} />;
    case "duo":
      return <Duo />;
    case "checks":
      return <Checks items={v.items} />;
    case "orders":
      return <Orders />;
    case "leads":
      return <Leads />;
    case "stars":
      return <Stars />;
    case "site":
      return <Site />;
    case "prices":
      return <Prices cards={v.cards} />;
    case "call":
      return <Call />;
    case "connect":
      return <Connect />;
    case "calendar":
      return <Calendar />;
    case "typing":
      return <Typing />;
    case "contact":
      return <Contact />;
  }
}

function LogoReveal() {
  const a = useSpring(8, { damping: 12, stiffness: 150 });
  const c = useSpring(18, { damping: 12, stiffness: 150 });
  const w = useSpring(30);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div style={{ filter: "drop-shadow(0 0 60px rgba(255,91,20,.45))" }}>
        <Glyph size={300} grow={[a, a, c]} />
      </div>
      <div style={{ opacity: w, transform: `translateY(${(1 - w) * 30}px)` }}>
        <Word height={110} color="#fff" />
      </div>
    </div>
  );
}

function ChatCard({ v }: { v: Extract<Visual, { kind: "chat" }> }) {
  const p = useSpring(0, { damping: 16, stiffness: 120 });
  const n = useSpring(bubbleDelay(v.bubbles.length) + 4);
  return (
    <div style={{ width: "100%", opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
      <div style={{ ...card, background: "#f7f6f2", color: INK, padding: "30px 30px 36px", display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 40px 80px -30px rgba(255,91,20,.45)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, borderBottom: "1px solid #e4e2dc" }}>
          <IgIcon size={52} />
          <span style={{ fontSize: 30, fontWeight: 700 }}>Direct</span>
          {v.time && <span style={{ marginLeft: "auto", fontSize: 30, fontWeight: 700, color: "#8a8983" }}>{v.time}</span>}
        </div>
        {v.bubbles.map((b, i) => (
          <Pop key={i} delay={bubbleDelay(i)} from={40} style={{ display: "flex", justifyContent: b.from === "us" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "86%",
                padding: "20px 26px",
                borderRadius: 32,
                [b.from === "us" ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 8,
                background: b.from === "us" ? INK : "#e9e7e0",
                color: b.from === "us" ? "#fff" : INK,
                fontSize: 34,
                lineHeight: 1.3,
              }}
            >
              {b.text}
            </div>
          </Pop>
        ))}
      </div>
      {v.note && (
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 700, color: SIGNAL, opacity: n }}>
          <Check size={44} bg={SIGNAL} color={INK} /> {v.note}
        </div>
      )}
    </div>
  );
}

function Duo() {
  const frame = useCurrentFrame();
  const a = useSpring(20);
  const b = useSpring(32);
  const lines = ["const reply = await ai(msg);", "book(client, '14:30');", "notify(owner);"];
  return (
    <div style={{ display: "flex", gap: 30, width: "100%" }}>
      <div style={{ ...card, flex: 1, padding: 34, opacity: a, transform: `translateY(${(1 - a) * 60}px) rotate(${(1 - a) * -4}deg)` }}>
        <p style={{ margin: "0 0 24px", fontSize: 34, fontWeight: 900 }}>Համակարգեր</p>
        {lines.map((l, i) => (
          <p key={i} style={{ margin: "0 0 12px", fontFamily: "monospace", fontSize: 22, color: i === 1 ? SIGNAL : SOFT, clipPath: `inset(0 ${100 - interpolate(frame, [40 + i * 18, 60 + i * 18], [0, 100], clamp)}% 0 0)` }}>
            {l}
          </p>
        ))}
      </div>
      <div style={{ ...card, flex: 1, padding: 34, opacity: b, transform: `translateY(${(1 - b) * 60}px) rotate(${(1 - b) * 4}deg)` }}>
        <p style={{ margin: "0 0 24px", fontSize: 34, fontWeight: 900 }}>Մարքեթինգ</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const o = interpolate(frame, [44 + i * 5, 54 + i * 5], [0, 1], clamp);
            return <div key={i} style={{ aspectRatio: "1", borderRadius: 10, opacity: o, transform: `scale(${0.6 + o * 0.4})`, background: i % 4 === 0 ? SIGNAL : i % 3 === 0 ? "#f6b9cf" : "rgba(255,255,255,.18)" }} />;
          })}
        </div>
      </div>
    </div>
  );
}

function Checks({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
      {items.map((t, i) => (
        <Pop key={i} delay={24 + i * 12} from={40}>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 26, padding: "30px 34px" }}>
            <Check size={64} bg={SIGNAL} color={INK} />
            <span style={{ fontSize: 38, lineHeight: 1.25, fontWeight: 700 }}>{t}</span>
          </div>
        </Pop>
      ))}
    </div>
  );
}

function Orders() {
  const frame = useCurrentFrame();
  const rows = [
    ["#1042", "Կարմիր զգեստ, M", 28],
    ["#1043", "Կոշիկ, 38", 44],
    ["#1044", "Պայուսակ", 60],
  ] as const;
  return (
    <div style={{ ...card, width: "100%", padding: 34, background: "#f7f6f2", color: INK }}>
      <p style={{ margin: "0 0 24px", fontSize: 32, fontWeight: 900 }}>Պատվերներ · այսօր</p>
      {rows.map(([id, name, at], i) => {
        const o = interpolate(frame, [at, at + 10], [0, 1], clamp);
        const shipped = frame > at + 50;
        return (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 0", borderTop: i ? "1px solid #e4e2dc" : undefined, opacity: o, transform: `translateX(${(1 - o) * -40}px)` }}>
            <span style={{ fontSize: 28, color: "#8a8983", fontWeight: 700 }}>{id}</span>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{name}</span>
            <span style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 40, fontSize: 26, fontWeight: 700, background: shipped ? "#e3efe4" : "#ffe3d2", color: shipped ? "#1e5a2b" : "#b4400d" }}>{shipped ? "Առաքվում է" : "Նոր"}</span>
          </div>
        );
      })}
    </div>
  );
}

function Leads() {
  const frame = useCurrentFrame();
  const src = ["Instagram", "Facebook", "list.am"];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 30 }}>
      <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
        {src.map((s, i) => {
          const fly = interpolate(frame, [30 + i * 14, 56 + i * 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          return (
            <span key={s} style={{ padding: "16px 26px", borderRadius: 40, border: `2px solid ${SIGNAL}`, fontSize: 30, fontWeight: 700, transform: `translateY(${fly * 40}px)`, opacity: 1 - fly * 0.5 }}>
              {s}
            </span>
          );
        })}
      </div>
      <div style={{ ...card, padding: 30, background: "#f7f6f2", color: INK }}>
        <p style={{ margin: "0 0 14px", fontSize: 30, fontWeight: 900 }}>Բոլոր հայտերը</p>
        {["3 սեն. բնակարան, Կենտրոն", "Առանձնատուն, Աջափնյակ", "2 սեն., նորակառույց"].map((t, i) => {
          const o = interpolate(frame, [56 + i * 14, 66 + i * 14], [0, 1], clamp);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderTop: i ? "1px solid #e4e2dc" : undefined, opacity: o }}>
              <span style={{ width: 16, height: 16, borderRadius: 16, background: SIGNAL }} />
              <span style={{ fontSize: 30, fontWeight: 700 }}>{t}</span>
              <span style={{ marginLeft: "auto", fontSize: 24, color: "#8a8983" }}>{src[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Star({ fill }: { fill: number }) {
  return (
    <svg viewBox="0 0 24 24" width={64} height={64}>
      <defs>
        <clipPath id={`s${Math.round(fill * 100)}`}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3l-6.1 3.4 1.5-6.7L2.3 9.4l6.8-.7z" fill="#e4e2dc" />
      <path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3l-6.1 3.4 1.5-6.7L2.3 9.4l6.8-.7z" fill="#fbbc04" clipPath={`url(#s${Math.round(fill * 100)})`} />
    </svg>
  );
}

function Stars() {
  const frame = useCurrentFrame();
  const p = useSpring(10);
  const fill = interpolate(frame, [30, 90], [0, 4.9], clamp);
  const count = Math.round(interpolate(frame, [30, 110], [12, 148], clamp));
  return (
    <div style={{ ...card, width: "100%", padding: 40, background: "#fff", color: INK, opacity: p, transform: `scale(${0.9 + p * 0.1})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg viewBox="0 0 24 24" width={60} height={60}>
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#ea4335" />
        </svg>
        <div>
          <p style={{ margin: 0, fontSize: 36, fontWeight: 900 }}>Ձեր բիզնեսը</p>
          <p style={{ margin: 0, fontSize: 26, color: "#8a8983" }}>Google Maps · Երևան</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 30 }}>
        <span style={{ fontSize: 56, fontWeight: 900, marginRight: 16 }}>{fill.toFixed(1)}</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, fill - i))} />
        ))}
      </div>
      <p style={{ margin: "18px 0 0", fontSize: 32, fontWeight: 700 }}>
        {count} կարծիք <span style={{ color: "#1e8e3e" }}>· աճում է</span>
      </p>
    </div>
  );
}

function Site() {
  const frame = useCurrentFrame();
  const langs = ["ՀԱՅ", "РУС", "ENG"];
  const li = frame < 110 ? 0 : frame < 150 ? 1 : 2;
  const blocks = [70, 180, 120, 120];
  return (
    <div style={{ width: 420, height: 640, borderRadius: 60, border: "10px solid #222", background: "#f7f6f2", padding: 26, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 40px 80px -30px rgba(255,91,20,.5)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Glyph size={34} color={INK} />
        <span style={{ display: "flex", gap: 6 }}>
          {langs.map((l, i) => (
            <span key={l} style={{ padding: "6px 10px", borderRadius: 20, fontSize: 18, fontWeight: 700, background: i === li ? SIGNAL : "#e9e7e0", color: INK }}>
              {l}
            </span>
          ))}
        </span>
      </div>
      {blocks.map((h, i) => {
        const o = interpolate(frame, [20 + i * 16, 34 + i * 16], [0, 1], clamp);
        return <div key={i} style={{ height: h, borderRadius: 20, background: i === 1 ? INK : i === 0 ? "#e9e7e0" : "#ffe3d2", opacity: o, transform: `translateY(${(1 - o) * 40}px)` }} />;
      })}
    </div>
  );
}

function Prices({ cards }: { cards: { name: string; setup: string; monthly?: string; tag?: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%" }}>
      {cards.map((c, i) => (
        <Pop key={i} delay={22 + i * 14} from={50}>
          <div style={{ ...card, padding: "36px 40px", background: c.tag ? "#fff" : card.background, color: c.tag ? INK : "#fff", position: "relative" }}>
            {c.tag && <span style={{ position: "absolute", top: -24, right: 36, padding: "10px 22px", borderRadius: 30, background: SIGNAL, color: INK, fontSize: 24, fontWeight: 900 }}>{c.tag}</span>}
            <p style={{ margin: 0, fontSize: 34, fontWeight: 700, opacity: 0.75 }}>{c.name}</p>
            <p style={{ margin: "14px 0 0", fontSize: 72, fontWeight: 900, letterSpacing: "-0.02em" }}>{c.setup}</p>
            {c.monthly && <p style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, color: c.tag ? "#b4400d" : SIGNAL }}>+ {c.monthly}</p>}
          </div>
        </Pop>
      ))}
    </div>
  );
}

function Call() {
  const frame = useCurrentFrame();
  const secs = Math.round(interpolate(frame, [20, 180], [0, 1200], clamp));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pulse = (frame % 40) / 40;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      <div style={{ position: "relative", width: 260, height: 260, borderRadius: 260, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 ${pulse * 60}px rgba(255,91,20,${0.35 * (1 - pulse)})` }}>
        <Glyph size={130} color={INK} />
      </div>
      <p style={{ margin: 0, fontSize: 96, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
        {mm}:{ss}
      </p>
      <span style={{ padding: "14px 30px", borderRadius: 40, background: "#1e8e3e", fontSize: 32, fontWeight: 700 }}>Անվճար</span>
    </div>
  );
}

function Connect() {
  const frame = useCurrentFrame();
  const icons: Array<[ReactNode, number, number]> = [
    [<IgIcon size={110} key="ig" />, -300, -180],
    [<WaIcon key="wa" />, 300, -180],
    [<TgIcon size={110} key="tg" />, -300, 200],
    [<WebIcon key="web" />, 300, 200],
  ];
  return (
    <div style={{ position: "relative", width: 900, height: 640 }}>
      <svg width={900} height={640} style={{ position: "absolute", inset: 0 }}>
        {icons.map(([, x, y], i) => {
          const d = interpolate(frame, [30 + i * 12, 60 + i * 12], [0, 1], clamp);
          return <line key={i} x1={450} y1={320} x2={450 + x * d} y2={320 + y * d} stroke={SIGNAL} strokeWidth={6} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 450 - 110, top: 320 - 110, width: 220, height: 220, borderRadius: 220, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 80px rgba(255,91,20,.5)" }}>
        <Glyph size={110} color={INK} />
      </div>
      {icons.map(([node, x, y], i) => {
        const o = interpolate(frame, [56 + i * 12, 66 + i * 12], [0, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: 450 + x - 55, top: 320 + y - 55, opacity: o, transform: `scale(${0.5 + o * 0.5})` }}>
            {node}
          </div>
        );
      })}
    </div>
  );
}

function WaIcon() {
  return (
    <span style={{ width: 110, height: 110, borderRadius: 110, background: "#25d366", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 24 24" width={62} height={62} fill="none" stroke="#fff" strokeWidth={2}>
        <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" strokeLinejoin="round" />
        <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" fill="#fff" stroke="none" />
      </svg>
    </span>
  );
}

function WebIcon() {
  return (
    <span style={{ width: 110, height: 110, borderRadius: 110, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 24 24" width={62} height={62} fill="none" stroke={INK} strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
      </svg>
    </span>
  );
}

function Calendar() {
  const frame = useCurrentFrame();
  const months = ["Հնվ", "Փտր", "Մրտ", "Ապր", "Մյս", "Հնս"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, width: "100%" }}>
      {months.map((m, i) => {
        const o = interpolate(frame, [24 + i * 12, 34 + i * 12], [0, 1], clamp);
        const done = frame > 44 + i * 12;
        return (
          <div key={m} style={{ ...card, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: o, transform: `scale(${0.8 + o * 0.2})`, background: done ? "rgba(255,91,20,.14)" : card.background }}>
            <span style={{ fontSize: 38, fontWeight: 900 }}>{m}</span>
            {done ? <Check size={60} bg={SIGNAL} color={INK} /> : <span style={{ width: 60, height: 60 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Typing() {
  const frame = useCurrentFrame();
  const word = "ԴԵՄՈ";
  const n = Math.floor(interpolate(frame, [30, 70], [0, word.length], clamp));
  const sent = frame >= 90;
  const fly = interpolate(frame, [90, 110], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
      {sent && (
        <div style={{ alignSelf: "flex-end", padding: "28px 44px", borderRadius: 44, borderBottomRightRadius: 10, background: SIGNAL, color: INK, fontSize: 90, fontWeight: 900, opacity: fly, transform: `translateY(${(1 - fly) * 120}px)` }}>{word}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 22px 22px 40px", borderRadius: 60, background: "#fff", color: INK }}>
        <span style={{ fontSize: 56, fontWeight: 900, flex: 1 }}>
          {sent ? <span style={{ color: "#b5b3ad", fontSize: 40, fontWeight: 400 }}>Հաղորդագրություն...</span> : word.slice(0, n)}
          {!sent && <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color: SIGNAL }}>|</span>}
        </span>
        <span style={{ width: 90, height: 90, borderRadius: 90, background: n === word.length && !sent ? SIGNAL : INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width={44} height={44} fill="#fff">
            <path d="M3 11.5 20 4l-6.5 17-2.6-7z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function Contact() {
  const rows: Array<[ReactNode, string, string]> = [
    [<WaIcon key="wa" />, "WhatsApp", "+374 77 200 433"],
    [<IgIcon size={110} key="ig" />, "Instagram Direct", "Գրեք «ԴԵՄՈ»"],
    [<MailIcon key="m" />, "Email", "riseup.group.2026@gmail.com"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
      {rows.map(([icon, label, value], i) => (
        <Pop key={label} delay={20 + i * 14} from={40}>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 30, padding: "28px 34px" }}>
            <span style={{ transform: "scale(.8)", display: "flex" }}>{icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 28, color: SOFT }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: value.length > 20 ? 34 : 44, fontWeight: 900 }}>{value}</p>
            </div>
          </div>
        </Pop>
      ))}
      <Pop delay={70}>
        <p style={{ margin: "10px 0 0", fontSize: 32, color: SOFT, textAlign: "center" }}>Երևան, Հայաստան</p>
      </Pop>
    </div>
  );
}

function MailIcon() {
  return (
    <span style={{ width: 110, height: 110, borderRadius: 110, background: SIGNAL, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 24 24" width={58} height={58} fill="none" stroke={INK} strokeWidth={2}>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </span>
  );
}
