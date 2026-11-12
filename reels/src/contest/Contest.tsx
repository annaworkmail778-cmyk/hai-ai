import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../fonts";
import { C, CheckDot, clamp, ease, IgIcon, Mark, Pointer, Rise, StageBg, useIn, Wordmark } from "../lb/ui";

/*
 * Contest video «Անվճար կայք Ձեր բիզնեսի համար» (Armenian), 9:16 and 4:5.
 * Scenes are cut at the pauses of public/voice/contest-hy.mp3 (36.6 s, ElevenLabs "Aram").
 * AI clips (Google Flow): public/contest/a-owner.mp4, b-winner.mp4, c-laptop.mp4.
 */

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const CONTEST = {
  dates: "Նոյեմբերի 13–25",
  results: "Արդյունքները՝ նոյեմբերի 26-ին",
  live: "ուղիղ եթերում",
};

/** Scene cuts (seconds), at the voice-over pauses. */
const T = {
  hook: [0, 2.7],
  search: [2.7, 6.55],
  announce: [6.55, 10.5],
  prizes: [10.5, 20.0],
  how: [20.0, 26.4],
  winner: [26.4, 29.2],
  cta: [29.2, 38.0],
} as const;
export const CONTEST_FRAMES = f(T.cta[1]);

/** Subtitles = the exact voice lines at their measured times. */
const CUES: Array<[number, number, string]> = [
  [0.0, 2.5, "Ունե՞ք բիզնես, բայց չունե՞ք կայք։"],
  [2.85, 6.35, "Հաճախորդները Ձեզ փնտրում են ինտերնետում... բայց չեն գտնում։"],
  [6.75, 10.4, "Ռայզափը խաղարկում է անվճար կայք Ձեր բիզնեսի համար։"],
  [10.65, 13.05, "Իսկ երկրորդ և երրորդ տեղերի համար՝"],
  [13.2, 16.85, "AI ադմինիստրատոր և AI գովազդային տեսանյութ։"],
  [17.0, 19.8, "Բոլոր մասնակիցներին՝ քսան տոկոս զեղչ։"],
  [20.1, 21.7, "Մասնակցելը շատ հեշտ է."],
  [21.9, 26.3, "Հետևեք մեր էջին և մեկնաբանեք «մասնակցում»՝ Ձեր բիզնեսի անունով։"],
  [26.5, 29.1, "Հաղթողներին կհայտարարենք ուղիղ եթերում։"],
  [29.35, 32.15, "Իսկ եթե չեք ուզում սպասել... գրեք «դեմո»,"],
  [32.3, 36.6, "և անվճար ցույց կտանք, թե ինչ կարող ենք անել Ձեր բիզնեսի համար։"],
].map(([s, e, t]) => [s as number, e as number, (t as string).replace("Ռայզափը", "Riseup-ը")]);

/** Layout helpers: 9:16 is the design size; 4:5 scales down and keeps everything above the subtitles. */
function useL() {
  const { height } = useVideoConfig();
  const tall = height > 1500;
  return { tall, k: tall ? 1.22 : 0.8, top: tall ? 250 : 120, subTop: tall ? 1600 : 1160 };
}

function Clip({ src, rate = 1, darken = 0.35 }: { src: string; rate?: number; darken?: number }) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 120], [1.04, 1.12]);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${darken + 0.25}) 0%, rgba(0,0,0,${darken * 0.4}) 40%, rgba(0,0,0,${darken + 0.35}) 100%)` }} />
    </AbsoluteFill>
  );
}

function Shell({ children, dur }: { children: ReactNode; dur: number }) {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [dur - 6, dur], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: inP * (1 - outP * 0.6) }}>{children}</AbsoluteFill>;
}

function BigWords({ text, size, delay = 2, accentLast = 0, color = "#fff" }: { text: string; size: number; delay?: number; accentLast?: number; color?: string }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <p style={{ margin: 0, fontSize: size, lineHeight: 1.06, fontWeight: 900, letterSpacing: "-0.02em", color, textAlign: "center", textShadow: "0 6px 40px rgba(0,0,0,.55)" }}>
      {words.map((w, i) => {
        const k = interpolate(frame, [delay + i * 3, delay + 12 + i * 3], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.22em", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 0.6}em) scale(${0.8 + k * 0.2})`, color: i >= words.length - accentLast ? C.signal : undefined }}>
            {w}
          </span>
        );
      })}
    </p>
  );
}

/* 1 · Hook */
function Hook() {
  const L = useL();
  return (
    <AbsoluteFill>
      <Clip src="contest/a-owner.mp4" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: L.top + 40 * L.k, padding: `${L.top + 40 * L.k}px 60px 0` }}>
        <BigWords text="Ունե՞ք բիզնես," size={104 * L.k} />
        <BigWords text="բայց չունե՞ք կայք" size={104 * L.k} delay={10} accentLast={1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* 2 · Customers search and do not find you */
function Search() {
  const frame = useCurrentFrame();
  const L = useL();
  const q = "ծաղկի խանութ մոտակայքում";
  const typed = Math.floor(interpolate(frame, [6, 40], [0, q.length], clamp));
  const results = ["Flora Studio", "Ծաղիկներ 24/7", "Rose House"];
  const missing = useIn(78, { damping: 13, stiffness: 160 });
  const w = 880 * L.k;
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="45%" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: L.top }}>
        <Rise delay={2}>
          <p style={{ margin: "0 60px", fontSize: 62 * L.k, lineHeight: 1.12, fontWeight: 900, color: "#fff", textAlign: "center" }}>
            Հաճախորդները Ձեզ փնտրում են…
          </p>
        </Rise>
        <div style={{ marginTop: 50 * L.k, width: w, borderRadius: 36 * L.k, background: "#fff", padding: 26 * L.k, boxShadow: "0 40px 100px -40px rgba(0,0,0,.8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: `${18 * L.k}px ${24 * L.k}px`, borderRadius: 60, border: `2px solid ${C.line}`, fontSize: 32 * L.k, color: C.ink }}>
            <svg viewBox="0 0 24 24" width={34 * L.k} height={34 * L.k} fill="none" stroke={C.mute} strokeWidth={2.2} strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <span>
              {q.slice(0, typed)}
              <span style={{ opacity: frame % 16 < 8 && typed < q.length ? 1 : 0, color: C.signal }}>|</span>
            </span>
          </div>
          <div style={{ marginTop: 18 * L.k, display: "flex", flexDirection: "column", gap: 12 * L.k }}>
            {results.map((r, i) => {
              const p = useIn(44 + i * 8, { damping: 16, stiffness: 150 });
              return (
                <div key={r} style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)`, display: "flex", alignItems: "center", gap: 18, padding: `${16 * L.k}px ${20 * L.k}px`, borderRadius: 22 * L.k, background: C.panel2 }}>
                  <span style={{ width: 56 * L.k, height: 56 * L.k, borderRadius: 16, background: ["#f6d2c3", "#ffe3d2", "#f6b9cf"][i], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 30 * L.k, fontWeight: 800, color: C.ink }}>{r}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 22 * L.k, color: C.mute }}>★ 4.{8 - i} · Կայք · Պատվիրել առցանց</p>
                  </div>
                  <span style={{ padding: `${8 * L.k}px ${16 * L.k}px`, borderRadius: 20, background: C.ink, color: "#fff", fontSize: 20 * L.k, fontWeight: 700 }}>Կայք</span>
                </div>
              );
            })}
            <div style={{ opacity: missing, transform: `scale(${0.9 + missing * 0.1})`, display: "flex", alignItems: "center", gap: 18, padding: `${16 * L.k}px ${20 * L.k}px`, borderRadius: 22 * L.k, border: `3px dashed ${C.red}`, background: "#fff5f5" }}>
              <span style={{ width: 56 * L.k, height: 56 * L.k, borderRadius: 16, background: C.greyBg, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 30 * L.k, fontWeight: 800, color: C.grey }}>Ձեր բիզնեսը</p>
                <p style={{ margin: "2px 0 0", fontSize: 24 * L.k, color: C.red, fontWeight: 800 }}>Չի գտնվել</p>
              </div>
            </div>
          </div>
        </div>
        <Rise delay={84}>
          <p style={{ margin: `${36 * L.k}px 0 0`, fontSize: 62 * L.k, fontWeight: 900, color: C.signal }}>…բայց չեն գտնում</p>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* 3 · Announcement with confetti */
function Confetti({ from = 0 }: { from?: number }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - from;
  if (t < 0) return null;
  return (
    <>
      {Array.from({ length: 70 }).map((_, i) => {
        const x = random(`cx${i}`) * width;
        const speed = 7 + random(`cs${i}`) * 9;
        const y = -60 + t * speed - random(`cy${i}`) * 500;
        const rot = t * (4 + random(`cr${i}`) * 8);
        const size = 12 + random(`cz${i}`) * 16;
        const col = [C.signal, "#fff", "#ffb14d", "#f3f2ee"][i % 4];
        if (y > height + 40) return null;
        return <span key={i} style={{ position: "absolute", left: x + Math.sin((t + i * 7) / 9) * 30, top: y, width: size, height: size * 0.45, background: col, borderRadius: 3, transform: `rotate(${rot}deg)`, opacity: 0.9 }} />;
      })}
    </>
  );
}

function Announce() {
  const L = useL();
  const frame = useCurrentFrame();
  const mark = useIn(0, { damping: 18, stiffness: 120 });
  const pill = useIn(8, { damping: 12, stiffness: 180 });
  const glow = 0.3 + 0.12 * Math.sin(frame / 8);
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="42%" />
      <div style={{ position: "absolute", left: "50%", top: "40%", width: 1100, height: 1100, marginLeft: -550, marginTop: -550, borderRadius: 1100, background: `radial-gradient(circle, rgba(255,91,20,${glow}), transparent 60%)` }} />
      <Confetti from={10} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: L.top + (L.tall ? 60 : 0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 * L.k, opacity: mark, transform: `scale(${0.8 + mark * 0.2})` }}>
          <Mark size={90 * L.k} />
          <Wordmark height={66 * L.k} />
        </div>
        <span style={{ marginTop: 44 * L.k, padding: `${14 * L.k}px ${34 * L.k}px`, borderRadius: 60, background: C.signal, color: "#000", fontSize: 40 * L.k, fontWeight: 900, letterSpacing: "0.08em", opacity: pill, transform: `scale(${0.6 + pill * 0.4}) rotate(${(1 - pill) * -8}deg)` }}>ՄՐՑՈՒՅԹ</span>
        <div style={{ marginTop: 40 * L.k }}>
          <BigWords text="ԱՆՎՃԱՐ ԿԱՅՔ" size={128 * L.k} delay={14} accentLast={2} />
          <div style={{ height: 14 }} />
          <BigWords text="Ձեր բիզնեսի համար" size={64 * L.k} delay={24} />
        </div>
        <Rise delay={40}>
          <span style={{ display: "inline-block", marginTop: 44 * L.k, padding: `${14 * L.k}px ${30 * L.k}px`, borderRadius: 40, border: "2px solid rgba(255,255,255,.35)", color: "#fff", fontSize: 38 * L.k, fontWeight: 700 }}>{CONTEST.dates}</span>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* 4 · Prizes (second/third and discount appear with the voice) */
function Medal({ n, size }: { n: number; size: number }) {
  const bg = ["linear-gradient(135deg,#ffe08a,#e2a63b)", "linear-gradient(135deg,#f1f1f1,#a9adb3)", "linear-gradient(135deg,#f0b78a,#b56a35)"][n - 1];
  return <span style={{ width: size, height: size, borderRadius: size, background: bg, color: "#2b1a00", fontSize: size * 0.48, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 10px 24px -10px rgba(0,0,0,.6)" }}>{n}</span>;
}

function Prizes() {
  const L = useL();
  const frame = useCurrentFrame();
  const rows: Array<[number, string, string, number]> = [
    [1, "Կայք Ձեր բիզնեսի համար", "3 լեզվով · հոսթինգը 3 ամիս անվճար", 2],
    [2, "AI ադմինիստրատոր", "Instagram-ի համար · 50% զեղչով", f(10.7 - T.prizes[0])],
    [3, "AI գովազդային տեսանյութ", "Ձեր ապրանքի կամ ծառայության համար", f(13.3 - T.prizes[0])],
  ];
  const disc = useIn(f(17.0 - T.prizes[0]), { damping: 12, stiffness: 170 });
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="40%" />
      <AbsoluteFill style={{ alignItems: "center", padding: `${L.top}px ${60 * L.k}px 0` }}>
        <Rise delay={0}>
          <p style={{ margin: 0, fontSize: 64 * L.k, fontWeight: 900, color: "#fff" }}>Մրցանակներ</p>
        </Rise>
        <div style={{ marginTop: 40 * L.k, width: "100%", display: "flex", flexDirection: "column", gap: 22 * L.k }}>
          {rows.map(([n, title, sub, at]) => {
            const p = useIn(at, { damping: 14, stiffness: 160 });
            const first = n === 1;
            return (
              <div key={n} style={{ opacity: p, transform: `translateX(${(1 - p) * 120}px)`, display: "flex", alignItems: "center", gap: 26 * L.k, padding: `${(first ? 32 : 24) * L.k}px ${30 * L.k}px`, borderRadius: 34 * L.k, background: first ? "#fff" : "rgba(255,255,255,.08)", border: first ? `3px solid ${C.signal}` : "1px solid rgba(255,255,255,.14)", boxShadow: first ? "0 30px 80px -30px rgba(255,91,20,.7)" : undefined }}>
                <Medal n={n} size={(first ? 96 : 80) * L.k} />
                <div>
                  <p style={{ margin: 0, fontSize: (first ? 44 : 38) * L.k, fontWeight: 900, color: first ? C.ink : "#fff", lineHeight: 1.15 }}>{title}</p>
                  <p style={{ margin: `${6 * L.k}px 0 0`, fontSize: 26 * L.k, color: first ? C.mute : "rgba(255,255,255,.65)" }}>{sub}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 34 * L.k, opacity: disc, transform: `scale(${0.7 + disc * 0.3}) rotate(${(1 - disc) * 6}deg)`, padding: `${22 * L.k}px ${36 * L.k}px`, borderRadius: 30 * L.k, background: C.signal, color: "#000", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 30 * L.k, fontWeight: 700 }}>Բոլոր մասնակիցներին</p>
          <p style={{ margin: 0, fontSize: 66 * L.k, fontWeight: 900, lineHeight: 1.05 }}>−20% զեղչ</p>
        </div>
      </AbsoluteFill>
      {frame >= f(17.0 - T.prizes[0]) && <Confetti from={f(17.0 - T.prizes[0])} />}
    </AbsoluteFill>
  );
}

/* 5 · How to take part */
function How() {
  const L = useL();
  const frame = useCurrentFrame();
  const s1 = f(21.9 - T.how[0]);
  const s2 = f(23.6 - T.how[0]);
  const comment = "ՄԱՍՆԱԿՑՈՒՄ — Անի Beauty, սրահ";
  const typed = Math.floor(interpolate(frame, [s2 + 6, s2 + 50], [0, comment.length], clamp));
  const sent = frame >= s2 + 58;
  const followed = frame >= s1 + 22;
  // Target: the "Follow" button (measured on the rendered frames).
  const tx = 760 * L.k + (L.tall ? -56 : 317);
  const ty = 300 * L.k - (L.tall ? 76 : 77);
  const cx = interpolate(frame, [s1 - 10, s1 + 18], [tx + 140, tx], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(frame, [s1 - 10, s1 + 18], [ty + 400 * L.k, ty], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(frame, [s1 + 18, s1 + 22, s1 + 30], [0, 1, 0], clamp);
  const card = { borderRadius: 34 * L.k, background: "#fff", padding: `${26 * L.k}px ${30 * L.k}px`, boxShadow: "0 30px 80px -30px rgba(0,0,0,.8)" } as const;
  const step = (n: number, label: string, at: number) => {
    const p = useIn(at, { damping: 15, stiffness: 160 });
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 * L.k, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
        <span style={{ width: 54 * L.k, height: 54 * L.k, borderRadius: 54, background: C.signal, color: "#000", fontSize: 30 * L.k, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
        <span style={{ fontSize: 40 * L.k, fontWeight: 800, color: "#fff" }}>{label}</span>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <StageBg glowX="50%" glowY="45%" />
      <AbsoluteFill style={{ padding: `${L.top - 20}px ${60 * L.k}px 0` }}>
        <Rise delay={0}>
          <p style={{ margin: `0 0 ${34 * L.k}px`, fontSize: 62 * L.k, fontWeight: 900, color: "#fff", textAlign: "center" }}>Ինչպես մասնակցել</p>
        </Rise>
        {step(1, "Հետևեք մեր էջին", s1 - 12)}
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, marginBottom: 40 * L.k, opacity: interpolate(frame, [s1 - 12, s1], [0, 1], clamp) }}>
          <span style={{ width: 84 * L.k, height: 84 * L.k, borderRadius: 84, background: "#0b0b0c", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 3px #fff, 0 0 0 6px #ee2a7b" }}>
            <Mark size={42 * L.k} />
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 32 * L.k, fontWeight: 800, color: C.ink }}>riseup.group.2026</p>
            <p style={{ margin: "2px 0 0", fontSize: 24 * L.k, color: C.mute, display: "flex", alignItems: "center", gap: 8 }}>
              <IgIcon size={24 * L.k} /> Instagram · Facebook · TikTok
            </p>
          </div>
          <span style={{ padding: `${12 * L.k}px ${26 * L.k}px`, borderRadius: 14, fontSize: 26 * L.k, fontWeight: 800, background: followed ? C.greyBg : "#0095f6", color: followed ? C.ink : "#fff", transform: `scale(${1 - press * 0.08})` }}>{followed ? "Հետևում եք" : "Հետևել"}</span>
        </div>
        {step(2, "Մեկնաբանեք «ՄԱՍՆԱԿՑՈՒՄ»", s2 - 8)}
        <div style={{ ...card, opacity: interpolate(frame, [s2 - 8, s2 + 4], [0, 1], clamp) }}>
          {sent ? (
            <Rise delay={s2 + 58} y={14}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ width: 56 * L.k, height: 56 * L.k, borderRadius: 56, background: "#f6d2c3", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 26 * L.k, color: C.ink }}>
                    <b>ani.beauty</b> {comment}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 22 * L.k, color: C.mute }}>հիմա · Պատասխանել</p>
                </div>
              </div>
            </Rise>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: `${14 * L.k}px ${20 * L.k}px`, borderRadius: 40, border: `2px solid ${C.line}` }}>
              <span style={{ fontSize: 28 * L.k, color: typed ? C.ink : C.mute, flex: 1 }}>
                {typed ? comment.slice(0, typed) : "Ավելացնել մեկնաբանություն…"}
                {typed > 0 && <span style={{ color: C.signal, opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}
              </span>
              <span style={{ fontSize: 26 * L.k, fontWeight: 800, color: typed === comment.length ? "#0095f6" : "#b8d9f5" }}>Ուղարկել</span>
            </div>
          )}
        </div>
      </AbsoluteFill>
      {frame >= s1 - 10 && frame < s1 + 40 && <Pointer x={cx} y={cy + L.top} press={press} />}
    </AbsoluteFill>
  );
}

/* 6 · The winner */
function Winner() {
  const L = useL();
  const note = useIn(10, { damping: 13, stiffness: 160 });
  return (
    <AbsoluteFill>
      <Clip src="contest/b-winner.mp4" darken={0.25} />
      <Confetti from={14} />
      <div style={{ position: "absolute", left: 50, right: 50, top: L.top - 80 + (1 - note) * -200, opacity: note }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: `${22 * L.k}px ${26 * L.k}px`, borderRadius: 32, background: "rgba(255,255,255,.96)", boxShadow: "0 30px 70px -20px rgba(0,0,0,.6)" }}>
          <span style={{ width: 70 * L.k, height: 70 * L.k, borderRadius: 20, background: "#0b0b0c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Mark size={36 * L.k} />
          </span>
          <div>
            <p style={{ margin: 0, fontSize: 22 * L.k, color: C.mute, fontWeight: 700 }}>RISEUP · հիմա</p>
            <p style={{ margin: "4px 0 0", fontSize: 34 * L.k, fontWeight: 900, color: C.ink }}>Շնորհավորում ենք, Դուք հաղթեցիք</p>
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: L.tall ? 430 : 300 }}>
        <Rise delay={16}>
          <p style={{ margin: 0, padding: "0 50px", fontSize: 60 * L.k, fontWeight: 900, color: "#fff", textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{CONTEST.results}</p>
        </Rise>
        <Rise delay={24}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 20, padding: `${12 * L.k}px ${26 * L.k}px`, borderRadius: 40, background: C.red, color: "#fff", fontSize: 34 * L.k, fontWeight: 800 }}>
            <span style={{ width: 14, height: 14, borderRadius: 14, background: "#fff" }} /> {CONTEST.live}
          </span>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* 7 · For those who don't want to wait + end card */
function Cta() {
  const L = useL();
  const frame = useCurrentFrame();
  const endAt = f(32.3 - T.cta[0]);
  const end = interpolate(frame, [endAt, endAt + 18], [0, 1], { ...clamp, easing: ease });
  const btn = useIn(f(31.1 - T.cta[0]), { damping: 13, stiffness: 170 });
  const ring = (frame % 50) / 50;
  return (
    <AbsoluteFill>
      <Clip src="contest/c-laptop.mp4" rate={0.36} darken={0.3 + end * 0.45} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: L.top, opacity: 1 - end }}>
        <BigWords text="Չե՞ք ուզում սպասել" size={78 * L.k} delay={2} />
        <div style={{ marginTop: 34 * L.k, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, padding: "0 50px" }}>
          {["Կայք", "AI ադմինիստրատոր", "Ավտոմատացում"].map((c, i) => (
            <Rise key={c} delay={14 + i * 7}>
              <span style={{ display: "inline-block", padding: `${14 * L.k}px ${26 * L.k}px`, borderRadius: 40, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: 36 * L.k, fontWeight: 700, backdropFilter: "blur(10px)" }}>{c}</span>
            </Rise>
          ))}
        </div>
        <div style={{ marginTop: 50 * L.k, opacity: btn, transform: `scale(${0.7 + btn * 0.3})` }}>
          <span style={{ display: "inline-block", padding: `${26 * L.k}px ${50 * L.k}px`, borderRadius: 80, background: C.signal, color: "#000", fontSize: 54 * L.k, fontWeight: 900, boxShadow: `0 0 0 ${ring * 26}px rgba(255,91,20,${0.35 * (1 - ring)})` }}>Գրեք «ԴԵՄՈ»</span>
        </div>
      </AbsoluteFill>
      {/* End card */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: L.tall ? 380 : 260, opacity: end, transform: `scale(${0.94 + end * 0.06})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 * L.k }}>
          <Mark size={110 * L.k} />
          <Wordmark height={82 * L.k} />
        </div>
        <p style={{ margin: `${44 * L.k}px 50px 0`, fontSize: 40 * L.k, color: "rgba(255,255,255,.75)", fontWeight: 600, textAlign: "center" }}>Մասնակցելու համար մեկնաբանեք</p>
        <span style={{ marginTop: 18 * L.k, padding: `${20 * L.k}px ${40 * L.k}px`, borderRadius: 30, background: "#fff", color: C.ink, fontSize: 64 * L.k, fontWeight: 900, letterSpacing: "0.03em" }}>ՄԱՍՆԱԿՑՈՒՄ</span>
        <p style={{ margin: `${30 * L.k}px 0 0`, fontSize: 36 * L.k, color: "#fff", fontWeight: 700 }}>{CONTEST.dates} · Riseup</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Subtitles() {
  const frame = useCurrentFrame();
  const L = useL();
  const sec = frame / FPS;
  const cue = CUES.find(([s, e]) => sec >= s && sec < e);
  if (!cue) return null;
  const o = interpolate((sec - cue[0]) * FPS, [0, 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: L.subTop, display: "flex", justifyContent: "center", padding: "0 60px", zIndex: 90 }}>
      <p style={{ margin: 0, maxWidth: 960, padding: "16px 28px", borderRadius: 18, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: 40 * L.k, lineHeight: 1.3, fontWeight: 700, textAlign: "center", opacity: o }}>{cue[2]}</p>
    </div>
  );
}

const SFX: Array<[number, string, number]> = [
  [0, "bass", 0.5],
  [f(T.search[0]) + 6, "typing", 0.2],
  [f(T.search[0]) + 78, "buzz", 0.3],
  [f(T.announce[0]) - 3, "whoosh", 0.35],
  [f(T.announce[0]) + 10, "chime", 0.45],
  [f(T.announce[0]) + 12, "pops", 0.35],
  [f(T.prizes[0]), "whoosh", 0.3],
  [f(10.7), "pops", 0.3],
  [f(13.3), "pops", 0.3],
  [f(17.0), "chime", 0.4],
  [f(T.how[0]), "whoosh", 0.3],
  [f(21.9) + 22, "tap", 0.5],
  [f(23.6) + 6, "typing", 0.2],
  [f(23.6) + 58, "ding", 0.35],
  [f(T.winner[0]) + 10, "ding", 0.4],
  [f(T.winner[0]) + 14, "pops", 0.35],
  [f(T.cta[0]), "whoosh", 0.3],
  [f(31.1), "tap", 0.45],
  [f(32.3), "chime", 0.45],
];

/** Voice only (requested): set to true to bring back the music and sound effects. */
const WITH_MUSIC_AND_SFX = false;

export function ContestVideo() {
  const scenes: Array<[keyof typeof T, ReactNode]> = [
    ["hook", <Hook />],
    ["search", <Search />],
    ["announce", <Announce />],
    ["prizes", <Prizes />],
    ["how", <How />],
    ["winner", <Winner />],
    ["cta", <Cta />],
  ];
  const end = CONTEST_FRAMES;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.bg }}>
      {scenes.map(([id, node]) => {
        const dur = f(T[id][1]) - f(T[id][0]);
        return (
          <Sequence key={id} from={f(T[id][0])} durationInFrames={dur} name={id}>
            <Shell dur={dur}>{node}</Shell>
          </Sequence>
        );
      })}
      <Subtitles />
      {WITH_MUSIC_AND_SFX &&
        SFX.map(([from, name, volume], i) => (
          <Sequence key={i} from={from} layout="none">
            <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
          </Sequence>
        ))}
      <Audio src={staticFile("voice/contest-hy.mp3")} volume={1} />
      {WITH_MUSIC_AND_SFX && (
        <Audio src={staticFile("music/lb-demo.mp3")} startFrom={f(14)} volume={(fr) => interpolate(fr, [0, 20, end - 45, end], [0, 1, 1, 0], clamp) * 0.22} />
      )}
    </AbsoluteFill>
  );
}
