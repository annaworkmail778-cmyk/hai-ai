import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";
import type { Lang } from "./copy";
import { Brand, Bubble, Caption, Check, clamp, End, Glyph, hasFile, IgIcon, INK, PAPER, Pop, SIGNAL, TgIcon, useSpring } from "./Reel01";

/* Reel 04 «Ով ենք մենք» — pinned brand intro. 1080×1920, 30 fps, 25 s. */

export const REEL04_FRAMES = 750;
const S = { hook: 0, brand: 90, services: 150, chat: 375, trust: 525, end: 615 };

const copy = {
  hy: {
    question: "Ո՞վ է պատասխանում ձեր հաճախորդներին, երբ դուք զբաղված եք",
    pings: ["Բարև, վաղը ազատ ժամ կա՞", "Ինչ արժե", "Ուզում եմ պատվիրել"],
    brand: "Մենք Riseup-ն ենք",
    servicesEyebrow: "Ինչ ենք ստեղծում",
    services: ["AI ադմինիստրատոր", "Առցանց գրանցում", "Պատվերների համակարգ", "Մարքեթինգ", "Կայքեր"],
    serviceNotes: ["Instagram · WhatsApp · Telegram", "Օրացույց և հիշեցումներ", "Բոլոր պատվերները մեկ վահանակում", "Google Maps և Instagram", "3 լեզվով"],
    chat: [
      ["them", "Բարև, վաղը մանիկյուր կարելի՞ է"],
      ["us", "Բարև ձեզ։ Այո՝ 11:00 կամ 15:30։ Ո՞րն է հարմար"],
      ["them", "11:00"],
      ["us", "Գրանցված եք վաղը 11:00-ին։ Կհիշեցնենք առավոտյան"],
    ] as const,
    ai: "AI ադմինիստրատոր",
    speed: "Պատասխան՝ 3 վայրկյանում",
    tgTitle: "Նոր գրանցում",
    tgText: "Մանիկյուր · վաղը 11:00 · Instagram",
    trust: ["Պաշտոնապես՝ պայմանագրով", "Հայերեն · Русский · English", "Մատչելի գներ՝ 60 000 ֏-ից"],
    endTitle: "Անվճար ցույց կտանք՝\nձեր բիզնեսի օրինակով",
    price: "60 000 ֏-ից",
    cta: "Գրեք «ԴԵՄՈ»",
    ctaNote: "WhatsApp՝ +374 77 200 433",
    captions: {
      services: "Ստեղծում ենք AI ադմինիստրատոր, առցանց գրանցում, պատվերների համակարգ, մարքեթինգ և կայքեր։",
      chat: "Հաճախորդը պատասխան է ստանում վայրկյանների ընթացքում, դուք՝ պատրաստ գրանցում։",
      trust: "Աշխատում ենք պայմանագրով, երեք լեզվով։",
    },
  },
  ru: {
    question: "Кто отвечает вашим клиентам, когда вы заняты?",
    pings: ["Здравствуйте, завтра есть время?", "Сколько стоит?", "Хочу заказать"],
    brand: "Мы — Riseup",
    servicesEyebrow: "Что мы создаём",
    services: ["AI-администратор", "Онлайн-запись", "Система заказов", "Маркетинг", "Сайты"],
    serviceNotes: ["Instagram · WhatsApp · Telegram", "Календарь и напоминания", "Все заказы в одной панели", "Google Maps и Instagram", "На 3 языках"],
    chat: [
      ["them", "Здравствуйте, можно завтра на маникюр?"],
      ["us", "Здравствуйте! Да — 11:00 или 15:30. Как удобнее?"],
      ["them", "11:00"],
      ["us", "Вы записаны на завтра в 11:00. Утром напомним"],
    ] as const,
    ai: "AI-администратор",
    speed: "Ответ за 3 секунды",
    tgTitle: "Новая запись",
    tgText: "Маникюр · завтра 11:00 · Instagram",
    trust: ["Официально, по договору", "Հայերեն · Русский · English", "Цены от 60 000 ֏"],
    endTitle: "Бесплатно покажем\nна примере вашего бизнеса",
    price: "от 60 000 ֏",
    cta: "Напишите «ДЕМО»",
    ctaNote: "WhatsApp: +374 77 200 433",
    captions: {
      services: "Делаем AI-администратора, онлайн-запись, систему заказов, маркетинг и сайты.",
      chat: "Клиент получает ответ за секунды, а вы — готовую запись.",
      trust: "Работаем по договору, на трёх языках.",
    },
  },
};
type T = (typeof copy)["hy"] | (typeof copy)["ru"];

/* ── 01 Hook: the unanswered question ─────────────────────────────── */

function WaIcon({ size = 44 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: "#25d366", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" stroke="#fff" strokeWidth={2}>
        <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Hook({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const typed = Math.floor(interpolate(frame, [4, 40], [0, t.question.length], clamp));
  const icons = [<IgIcon size={56} key="ig" />, <WaIcon size={56} key="wa" />, <TgIcon size={56} key="tg" />];
  const pos: Array<[number, number, number]> = [
    [70, 330, -4],
    [430, 1180, 3],
    [120, 1420, -2],
  ];
  const zoom = interpolate(frame, [0, 90], [1, 1.06]);
  return (
    <AbsoluteFill style={{ background: INK, color: "#fff", transform: `scale(${zoom})` }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 640 }}>
        <p style={{ margin: 0, fontSize: t.question.length > 50 ? 72 : 82, lineHeight: 1.12, fontWeight: 900, letterSpacing: "-0.02em" }}>
          {t.question.slice(0, typed)}
          <span style={{ color: SIGNAL, opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>
        </p>
      </div>
      {t.pings.map((p, i) => {
        const at = 38 + i * 12;
        const s = useSpring(at, { damping: 11, stiffness: 200 });
        const [x, y, r] = pos[i];
        const shake = frame > at && frame < at + 8 ? (random(`p${i}${frame}`) - 0.5) * 14 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: x + shake, top: y + Math.sin((frame + i * 20) / 14) * 8, opacity: s, transform: `scale(${0.6 + s * 0.4}) rotate(${r}deg)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 28px 18px 18px", borderRadius: 60, background: "#1c1c1e", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 24px 50px -20px rgba(0,0,0,.8)" }}>
              {icons[i]}
              <span style={{ fontSize: 34, fontWeight: 700 }}>{p}</span>
              <span style={{ width: 22, height: 22, borderRadius: 22, background: "#ff3b30", marginLeft: 6 }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── 03 Services: five cards ──────────────────────────────────────── */

function ServiceIcon({ i, on }: { i: number; on: number }) {
  const frame = useCurrentFrame();
  const c = on > 0.5 ? "#fff" : INK;
  const st = { fill: "none", stroke: c, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const wob = Math.sin(frame / 8) * on;
  const icons: ReactNode[] = [
    <svg key="0" viewBox="0 0 24 24" width={60} height={60} {...st}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z" />
      {[8.5, 12, 15.5].map((x, k) => (
        <circle key={k} cx={x} cy={10 + Math.sin(frame / 4 + k) * on} r={0.9} fill={c} stroke="none" />
      ))}
    </svg>,
    <svg key="1" viewBox="0 0 24 24" width={60} height={60} {...st}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="m9 14.5 2 2 4-4" style={{ opacity: on }} />
    </svg>,
    <svg key="2" viewBox="0 0 24 24" width={60} height={60} {...st}>
      <path d="M5 4h14v16H5z" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" />
    </svg>,
    <svg key="3" viewBox="0 0 24 24" width={60} height={60} {...st}>
      <path d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6l-5.3 2.9 1.2-5.9-4.4-4 5.9-.7z" style={{ transformOrigin: "12px 12px", transform: `rotate(${wob * 8}deg)` }} />
    </svg>,
    <svg key="4" viewBox="0 0 24 24" width={60} height={60} {...st}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.8 3.2 2.8 13.8 0 17M12 3.5c-2.8 3.2-2.8 13.8 0 17" style={{ transformOrigin: "12px 12px", transform: `rotate(${wob * 6}deg)` }} />
    </svg>,
  ];
  return <>{icons[i]}</>;
}

function Services({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const head = useSpring(2);
  const step = 26;
  const active = Math.min(4, Math.floor((frame - 14) / step));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 25%, #fff, ${PAPER} 65%)`, color: INK }}>
      <div style={{ position: "absolute", top: 260, left: 80, right: 80, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: SIGNAL, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.servicesEyebrow}</span>
      </div>
      <div style={{ position: "absolute", top: 340, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 22 }}>
        {t.services.map((name, i) => {
          const at = 14 + i * step;
          const s = useSpring(at, { damping: 14, stiffness: 150 });
          const on = frame >= at && (i === active || frame > 14 + 5 * step + 20) ? (i === active && frame < 14 + 5 * step + 20 ? 1 : 0) : 0;
          const glow = interpolate(frame, [at, at + 8, at + step, at + step + 8], [0, 1, 1, 0], clamp);
          const final = interpolate(frame, [14 + 5 * step + 10, 14 + 5 * step + 30], [0, 1], clamp);
          const hl = i === 4 ? Math.max(glow * (1 - final), 0) : glow;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 36px",
                borderRadius: 40,
                background: hl > 0.5 ? INK : "#fff",
                color: hl > 0.5 ? "#fff" : INK,
                boxShadow: hl > 0.5 ? "0 30px 60px -24px rgba(255,91,20,.6)" : "0 14px 30px -22px rgba(0,0,0,.35)",
                opacity: s,
                transform: `translateX(${(1 - s) * 260}px) scale(${1 + hl * 0.03})`,
              }}
            >
              <span style={{ width: 96, height: 96, borderRadius: 28, background: hl > 0.5 ? SIGNAL : "#f1efe9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ServiceIcon i={i} on={hl > 0.5 ? 1 : on} />
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 46, fontWeight: 900, letterSpacing: "-0.01em" }}>{name}</p>
                <p style={{ margin: "6px 0 0", fontSize: 28, color: hl > 0.5 ? "rgba(255,255,255,.6)" : "#6b6a66" }}>{t.serviceNotes[i]}</p>
              </div>
              <span style={{ marginLeft: "auto", opacity: final }}>
                <Check size={52} bg={SIGNAL} color={INK} />
              </span>
            </div>
          );
        })}
      </div>
      <Caption text={t.captions.services} from={6} to={220} />
    </AbsoluteFill>
  );
}

/* ── 04 Chat: answered in seconds, booking lands in Telegram ──────── */

function Chat({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const phone = useSpring(0, { damping: 16, stiffness: 120 });
  const tg = useSpring(100, { damping: 13, stiffness: 160 });
  const speed = useSpring(46);
  const delays = [8, 30, 58, 76];
  const typing = frame > 16 && frame < 30;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #fff, ${PAPER} 60%)`, color: INK }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, height: 1020, borderRadius: 70, background: "#fff", border: "12px solid #111", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 22, opacity: phone, transform: `translateY(${(1 - phone) * 120}px)`, boxShadow: "0 60px 120px -50px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 20, borderBottom: "1px solid #eceae4" }}>
          <IgIcon size={58} />
          <div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Direct</p>
            <p style={{ margin: 0, fontSize: 24, color: "#8a8983" }}>{t.ai}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 34, fontWeight: 900 }}>23:40</span>
        </div>
        {t.chat.map(([from, text], i) => (
          <Bubble key={i} from={from} delay={delays[i]} label={from === "us" && i === 1 ? t.ai : undefined}>
            {text}
          </Bubble>
        ))}
        {typing && (
          <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, padding: "18px 24px", borderRadius: 30, background: "#111" }}>
            {[0, 1, 2].map((k) => (
              <span key={k} style={{ width: 12, height: 12, borderRadius: 12, background: "#fff", opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + k * 4) / 4)) }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 90, top: 1300, opacity: speed, transform: `scale(${0.8 + speed * 0.2})` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 26px", borderRadius: 50, background: SIGNAL, color: INK, fontSize: 32, fontWeight: 900 }}>{t.speed}</span>
      </div>
      {/* Telegram notification for the owner */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 140 + (1 - tg) * -260, opacity: tg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "24px 28px", borderRadius: 36, background: "rgba(20,20,22,.94)", color: "#fff", boxShadow: "0 30px 60px -20px rgba(0,0,0,.6)" }}>
          <TgIcon size={70} />
          <div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>{t.tgTitle}</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, color: "rgba(255,255,255,.7)" }}>{t.tgText}</p>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <Check size={54} bg={SIGNAL} color={INK} />
          </span>
        </div>
      </div>
      <Caption text={t.captions.chat} from={4} to={146} />
    </AbsoluteFill>
  );
}

/* ── 05 Trust ─────────────────────────────────────────────────────── */

function Trust({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 30) * 30;
  return (
    <AbsoluteFill style={{ background: INK, color: "#fff" }}>
      <div style={{ position: "absolute", left: -240 + drift, top: 200, width: 900, height: 900, borderRadius: 900, background: "radial-gradient(circle, rgba(255,91,20,.3), transparent 65%)" }} />
      <div style={{ position: "absolute", top: 300, left: 80 }}>
        <Glyph size={90} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 560, display: "flex", flexDirection: "column", gap: 30 }}>
        {t.trust.map((line, i) => (
          <Pop key={i} delay={6 + i * 14} from={50}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "36px 40px", borderRadius: 40, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}>
              <Check size={72} bg={SIGNAL} color={INK} />
              <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.2 }}>{line}</span>
            </div>
          </Pop>
        ))}
      </div>
      <Caption text={t.captions.trust} from={4} to={88} />
    </AbsoluteFill>
  );
}

/* ── Sound design ─────────────────────────────────────────────────── */

const SFX: Array<[number, string, number]> = [
  [2, "typing", 0.45],
  [38, "buzz", 0.5],
  [50, "buzz", 0.45],
  [62, "buzz", 0.45],
  [S.brand - 4, "glitch", 0.6],
  [S.brand, "laser", 0.7],
  [S.brand + 24, "bass", 0.8],
  [S.services - 4, "whoosh", 0.6],
  ...[0, 1, 2, 3, 4].map((i) => [S.services + 14 + i * 26, "tap", 0.55] as [number, string, number]),
  [S.services + 160, "pops", 0.5],
  [S.chat - 4, "whoosh", 0.6],
  [S.chat + 10, "ding", 0.45],
  [S.chat + 18, "typing", 0.35],
  [S.chat + 32, "ding", 0.5],
  [S.chat + 60, "ding", 0.45],
  [S.chat + 78, "ding", 0.5],
  [S.chat + 100, "chime", 0.55],
  [S.trust - 4, "whoosh", 0.5],
  [S.trust + 6, "pops", 0.5],
  [S.trust + 20, "pops", 0.45],
  [S.trust + 34, "pops", 0.45],
  [S.end, "chime", 0.7],
  [S.end + 80, "tap", 0.8],
];

export function Reel04({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const voice = `voice/reel-04-${lang}.mp3`;
  const scenes: Array<[number, number, ReactNode]> = [
    [S.hook, S.brand - S.hook, <Hook t={t} />],
    [S.brand, S.services - S.brand, <Brand t={{ notSleep: t.brand }} />],
    [S.services, S.chat - S.services, <Services t={t} />],
    [S.chat, S.trust - S.chat, <Chat t={t} />],
    [S.trust, S.end - S.trust, <Trust t={t} />],
    [S.end, REEL04_FRAMES - S.end, <End t={t} />],
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
      {hasFile("music/reel-04.mp3") && <Audio src={staticFile("music/reel-04.mp3")} volume={0.18} />}
    </AbsoluteFill>
  );
}
