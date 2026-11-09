import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";
import type { Lang } from "./copy";
import { Brand, Check, clamp, Cursor, End, hasFile, IgIcon, INK, PAPER, Pop, SIGNAL, TgIcon, useSpring } from "./Reel01";

/* Reel 05 «ԿԱՏԱԼՈԳ» — Meta ad for shops with a large range and no proper catalogue. 1080×1920, 30 fps, 23 s. */

export const REEL05_FRAMES = 690;
const S = { hook: 0, pain: 90, turn: 195, split: 255, product: 450, end: 555 };

const PRODUCTS = [1, 2, 3, 4, 5, 6].map((n) => `products/p${n}.jpg`);
const PRICES = ["32 000 ֏", "24 500 ֏", "18 900 ֏", "145 000 ֏", "39 000 ֏", "52 000 ֏"];

const copy = {
  hy: {
    hook: "Ամբողջ օրը նույն հարցերը՞",
    pings: ["Գինը՞", "Չափսը՞", "Սև ունե՞ք", "Առաքում կա՞", "Գինը՞", "Կա՞ դեռ", "Ի՞նչ արժե", "Գինը՞", "Մեծ չափս կա՞"],
    shopName: "Ձեր խանութը",
    sending: "Ուղարկում եմ նկարները…",
    thinking: "Լավ, կմտածեմ…",
    seen: "Դիտված",
    left: "Հաճախորդը գնաց մրցակցի մոտ",
    painCaption: "Ժամեր՝ նույն հարցերին պատասխանելով, իսկ հաճախորդը գնում է մրցակցի մոտ։",
    turn: "Կա ավելի հեշտ ձև",
    splitTitle: "Նույն հաճախորդը։ Երկու խանութ։",
    without: "Առանց կատալոգի",
    withCat: "Կատալոգով",
    askPrice: "Գինը՞",
    wait: "2 ժամ անց…",
    lost: "Կորցրած հաճախորդ",
    order: "Պատվիրել",
    ordered: "Պատվերն ընդունված է",
    cats: ["Բոլորը", "Հագուստ", "Կոսմետիկա", "Կոշիկ", "Կահույք", "Տեխնիկա"],
    names: ["Կեդեր", "Օծանելիք", "Վուշե զգեստ", "Բազկաթոռ", "Ականջակալներ", "Ժամացույց"],
    search: "Որոնել ապրանք…",
    tgTitle: "Նոր պատվեր · 23:40",
    tgText: "2 ապրանք · 56 500 ֏ · կայքից",
    points: ["Բոլոր ապրանքներն ու գները՝ մեկ հղումով", "Պատվերներ 24/7, նույնիսկ գիշերը", "Հայտերը՝ անմիջապես ձեր Telegram-ում"],
    endTitle: "Ձեր խանութի\nկատալոգ-կայքը",
    price: "Ցանկացած ապրանքի համար",
    cta: "Գրեք «ԿԱՏԱԼՈԳ»",
    ctaNote: "Անվճար օրինակ՝ ձեր ապրանքներով",
  },
  ru: {
    hook: "Весь день одни и те же вопросы?",
    pings: ["Цена?", "Размер?", "Есть чёрный?", "Доставка есть?", "Цена?", "Ещё есть?", "Сколько стоит?", "Цена?", "Большой размер?"],
    shopName: "Ваш магазин",
    sending: "Отправляю фото…",
    thinking: "Ладно, подумаю…",
    seen: "Просмотрено",
    left: "Клиент ушёл к конкуренту",
    painCaption: "Часы уходят на одни и те же ответы, а клиент уходит к конкуренту.",
    turn: "Есть способ проще",
    splitTitle: "Один клиент. Два магазина.",
    without: "Без каталога",
    withCat: "С каталогом",
    askPrice: "Цена?",
    wait: "2 часа спустя…",
    lost: "Потерянный клиент",
    order: "Заказать",
    ordered: "Заказ принят",
    cats: ["Все", "Одежда", "Косметика", "Обувь", "Мебель", "Техника"],
    names: ["Кеды", "Парфюм", "Льняное платье", "Кресло", "Наушники", "Часы"],
    search: "Поиск товара…",
    tgTitle: "Новый заказ · 23:40",
    tgText: "2 товара · 56 500 ֏ · с сайта",
    points: ["Все товары и цены — по одной ссылке", "Заказы 24/7, даже ночью", "Заявки сразу в вашем Telegram"],
    endTitle: "Каталог-сайт\nдля вашего магазина",
    price: "Для любых товаров",
    cta: "Напишите «КАТАЛОГ»",
    ctaNote: "Бесплатный пример с вашими товарами",
  },
};
type T = (typeof copy)["hy"] | (typeof copy)["ru"];

const img = (i: number) => (hasFile(PRODUCTS[i]) ? staticFile(PRODUCTS[i]) : null);

function Thumb({ i, size, radius = 18 }: { i: number; size: number; radius?: number }) {
  const src = img(i);
  return src ? (
    <Img src={src} style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: radius, background: "#e6dfd3", flexShrink: 0 }} />
  );
}

function Phone({ children, width = 760, height = 1240, style }: { children: ReactNode; width?: number; height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ width, height, borderRadius: 80, background: "#fff", border: "14px solid #111", overflow: "hidden", boxShadow: "0 60px 120px -50px rgba(0,0,0,.6)", position: "relative", ...style }}>
      {children}
    </div>
  );
}

function ChatHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "34px 34px 24px", borderBottom: "1px solid #eceae4" }}>
      <IgIcon size={64} />
      <div>
        <p style={{ margin: 0, fontSize: 34, fontWeight: 700, color: INK }}>{title}</p>
        <p style={{ margin: 0, fontSize: 24, color: "#8a8983" }}>{sub}</p>
      </div>
    </div>
  );
}

/* ── 01 Hook: the Direct explodes ─────────────────────────────────── */

function Hook({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const slam = useSpring(2, { damping: 11, stiffness: 220, mass: 0.6 });
  const phone = useSpring(6, { damping: 15, stiffness: 120 });
  const count = Math.min(47, Math.round(interpolate(frame, [10, 80], [3, 47], clamp)));
  const shake = frame > 10 && frame < 85 && frame % 5 === 0 ? (random(`h${frame}`) - 0.5) * 16 : 0;
  const visible = Math.floor(interpolate(frame, [10, 80], [0, t.pings.length], clamp));
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center" }}>
      <h1
        style={{
          margin: "250px 70px 0",
          textAlign: "center",
          fontSize: 92,
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: "#fff",
          transform: `scale(${1.25 - slam * 0.25})`,
          opacity: slam,
        }}
      >
        {t.hook}
      </h1>
      <div style={{ marginTop: 60, transform: `translateY(${(1 - phone) * 300}px) translateX(${shake}px)`, opacity: phone }}>
        <Phone width={720} height={1060}>
          <div style={{ position: "relative" }}>
            <ChatHeader title="Direct" sub={t.shopName} />
            <span style={{ position: "absolute", right: 34, top: 42, minWidth: 74, height: 56, padding: "0 16px", borderRadius: 56, background: "#ff3b30", color: "#fff", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 16, padding: "24px 30px", height: 900, overflow: "hidden" }}>
            {t.pings.slice(0, visible).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, alignSelf: "flex-start" }}>
                <span style={{ width: 52, height: 52, borderRadius: 52, background: ["#f6b9cf", "#c8e1ff", "#ffe3d2", "#d9f2df"][i % 4], flexShrink: 0 }} />
                <span style={{ padding: "18px 26px", borderRadius: 30, borderBottomLeftRadius: 8, background: "#efede7", color: INK, fontSize: 34, fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
}

/* ── 02 Pain: photos one by one, the customer leaves ──────────────── */

function Pain({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const hour = interpolate(frame, [0, 70], [14, 19], clamp);
  const time = `${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.floor((hour % 1) * 60)).padStart(2, "0")}`;
  const gone = interpolate(frame, [78, 92], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #fff, ${PAPER} 60%)`, alignItems: "center" }}>
      <div style={{ marginTop: 200, display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderRadius: 50, background: INK, color: "#fff", fontSize: 40, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
        <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke={SIGNAL} strokeWidth={2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {time}
      </div>
      <div style={{ marginTop: 40, filter: `grayscale(${gone})` }}>
        <Phone width={720} height={980}>
          <ChatHeader title="Direct" sub={t.shopName} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "26px 30px" }}>
            <Pop delay={0} from={30} style={{ alignSelf: "flex-start" }}>
              <span style={{ display: "inline-block", padding: "18px 26px", borderRadius: 30, background: "#efede7", color: INK, fontSize: 34 }}>{t.pings[0]}</span>
            </Pop>
            <Pop delay={6} from={30} style={{ alignSelf: "flex-end" }}>
              <span style={{ display: "inline-block", padding: "18px 26px", borderRadius: 30, background: INK, color: "#fff", fontSize: 32 }}>{t.sending}</span>
            </Pop>
            <div style={{ alignSelf: "flex-end", display: "grid", gridTemplateColumns: "repeat(3, 160px)", gap: 10 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Pop key={i} delay={12 + i * 9} from={20}>
                  <Thumb i={i} size={160} radius={16} />
                </Pop>
              ))}
            </div>
            <Pop delay={70} from={30} style={{ alignSelf: "flex-start" }}>
              <span style={{ display: "inline-block", padding: "18px 26px", borderRadius: 30, background: "#efede7", color: INK, fontSize: 34 }}>{t.thinking}</span>
            </Pop>
            <p style={{ margin: 0, alignSelf: "flex-end", fontSize: 24, color: "#8a8983", opacity: interpolate(frame, [76, 82], [0, 1], clamp) }}>{t.seen}</p>
          </div>
          <div style={{ position: "absolute", inset: 0, zIndex: 10, background: `rgba(11,11,12,${0.55 * gone})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ padding: "22px 34px", borderRadius: 40, background: "#ff3b30", color: "#fff", fontSize: 38, fontWeight: 900, opacity: gone, transform: `scale(${0.8 + gone * 0.2})` }}>{t.left}</span>
          </div>
        </Phone>
      </div>
      <PainCaption text={t.painCaption} />
    </AbsoluteFill>
  );
}

function PainCaption({ text }: { text: string }) {
  const o = useSpring(8);
  return (
    <p style={{ position: "absolute", left: 70, right: 70, top: 1490, margin: 0, textAlign: "center", fontSize: 44, lineHeight: 1.25, fontWeight: 700, color: INK, opacity: o }}>{text}</p>
  );
}

/* ── 04 Split: without a catalogue vs with one ────────────────────── */

function Split({ t }: { t: T }) {
  const frame = useCurrentFrame();
  const title = useSpring(2);
  const takeover = interpolate(frame, [160, 190], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const scroll = interpolate(frame, [0, 150], [0, -520], clamp);
  // Right side: cursor taps the first card, then "Order", then confirmation.
  const cx = interpolate(frame, [40, 66, 96, 112], [820, 690, 690, 760], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(frame, [40, 66, 96, 112], [1500, 1010, 1010, 1270], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press1 = interpolate(frame, [66, 70, 76], [0, 1, 0], clamp);
  const press2 = interpolate(frame, [112, 116, 122], [0, 1, 0], clamp);
  const opened = frame >= 70;
  const done = frame >= 116;

  const label = (text: string, color: string) => (
    <p style={{ margin: "0 0 18px", display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 900, color: "#fff" }}>
      <span style={{ width: 16, height: 16, borderRadius: 16, background: color }} />
      {text}
    </p>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <h2 style={{ position: "absolute", top: 230, left: 60, right: 60, margin: 0, textAlign: "center", fontSize: 64, lineHeight: 1.1, fontWeight: 900, color: "#fff", opacity: title * (1 - takeover), transform: `translateY(${(1 - title) * 30}px)` }}>
        {t.splitTitle}
      </h2>

      {/* Left — without a catalogue */}
      <div style={{ position: "absolute", top: 400, left: 40, width: 480, opacity: 1 - takeover, filter: `grayscale(${0.6 + takeover * 0.4})`, transform: `translateX(${-takeover * 200}px)` }}>
        {label(t.without, "#ff3b30")}
        <div style={{ height: 1000, borderRadius: 50, overflow: "hidden", background: "#fff", border: "10px solid #111", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, transform: `translateY(${scroll}px)` }}>
            {Array.from({ length: 24 }).map((_, k) => (
              <Thumb key={k} i={(k * 5) % 6} size={150} radius={0} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 30, display: "flex", flexDirection: "column", gap: 12 }}>
            <Pop delay={20}>
              <span style={{ display: "inline-block", padding: "14px 22px", borderRadius: 26, background: INK, color: "#fff", fontSize: 28 }}>{t.askPrice}</span>
            </Pop>
            <Pop delay={60}>
              <span style={{ display: "inline-block", padding: "12px 20px", borderRadius: 26, background: "#efede7", color: "#8a8983", fontSize: 24 }}>{t.wait}</span>
            </Pop>
            <Pop delay={100}>
              <span style={{ display: "inline-block", padding: "14px 22px", borderRadius: 26, background: "#efede7", color: INK, fontSize: 28 }}>{t.thinking}</span>
            </Pop>
            <Pop delay={128}>
              <span style={{ display: "inline-block", padding: "14px 22px", borderRadius: 26, background: "#ff3b30", color: "#fff", fontSize: 26, fontWeight: 900 }}>✕ {t.lost}</span>
            </Pop>
          </div>
        </div>
      </div>

      {/* Right — with a catalogue */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 560,
          width: 480,
          transformOrigin: "50% 0",
          transform: `translateX(${-takeover * 300}px) scale(${1 + takeover * 0.35})`,
        }}
      >
        {label(t.withCat, SIGNAL)}
        <div style={{ height: 1000, borderRadius: 50, overflow: "hidden", background: "#faf8f4", border: "10px solid #111", position: "relative", boxShadow: `0 0 ${60 + takeover * 60}px rgba(255,91,20,.35)` }}>
          <div style={{ padding: "22px 20px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {t.cats.slice(0, 4).map((c, k) => (
              <span key={c} style={{ padding: "8px 14px", borderRadius: 20, fontSize: 20, fontWeight: 700, background: k === 0 ? INK : "#ece8df", color: k === 0 ? "#fff" : INK }}>{c}</span>
            ))}
          </div>
          {!opened ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 20px" }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Pop key={i} delay={6 + i * 4} from={20}>
                  <div style={{ background: "#fff", borderRadius: 18, padding: 8 }}>
                    <Thumb i={i} size={190} radius={12} />
                    <p style={{ margin: "8px 4px 0", fontSize: 20, fontWeight: 700, color: INK }}>{t.names[i]}</p>
                    <p style={{ margin: "2px 4px 4px", fontSize: 20, fontWeight: 900, color: SIGNAL }}>{PRICES[i]}</p>
                  </div>
                </Pop>
              ))}
            </div>
          ) : (
            <div style={{ padding: "8px 20px" }}>
              <Pop delay={70} from={20}>
                <Thumb i={0} size={420} radius={22} />
                <p style={{ margin: "18px 4px 0", fontSize: 34, fontWeight: 900, color: INK }}>{t.names[0]}</p>
                <p style={{ margin: "4px 4px 0", fontSize: 34, fontWeight: 900, color: SIGNAL }}>{PRICES[0]}</p>
                <div style={{ display: "flex", gap: 8, margin: "14px 4px" }}>
                  {["38", "39", "40", "41", "42"].map((s, k) => (
                    <span key={s} style={{ padding: "8px 14px", borderRadius: 12, border: "2px solid", borderColor: k === 2 ? INK : "#ddd", fontSize: 22, fontWeight: 700, color: INK }}>{s}</span>
                  ))}
                </div>
                <div style={{ marginTop: 18, padding: "22px 0", borderRadius: 24, textAlign: "center", fontSize: done ? 26 : 32, fontWeight: 900, background: done ? "#1e8e3e" : SIGNAL, color: done ? "#fff" : INK, transform: `scale(${1 - press2 * 0.05})` }}>
                  {done ? `✓ ${t.ordered}` : t.order}
                </div>
              </Pop>
            </div>
          )}
        </div>
      </div>
      {frame >= 40 && frame < 150 && takeover === 0 && <Cursor x={cx} y={cy} press={Math.max(press1, press2)} />}
    </AbsoluteFill>
  );
}

/* ── 05 Product: the full catalogue and an order in Telegram ──────── */

function Product({ t }: { t: T }) {
  const phone = useSpring(0, { damping: 16, stiffness: 120 });
  const tg = useSpring(30, { damping: 13, stiffness: 160 });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #2a1408, ${INK} 65%)`, alignItems: "center" }}>
      <div style={{ marginTop: 330, transform: `translateY(${(1 - phone) * 200}px) scale(${0.92 + phone * 0.08})`, opacity: phone }}>
        <Phone width={700} height={860} style={{ background: "#faf8f4" }}>
          <div style={{ padding: "30px 28px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: INK }}>{t.shopName}</span>
            <span style={{ fontSize: 26, color: "#8a8983" }}>HY · RU · EN</span>
          </div>
          <div style={{ margin: "0 28px", padding: "16px 22px", borderRadius: 20, background: "#ece8df", fontSize: 24, color: "#8a8983" }}>{t.search}</div>
          <div style={{ padding: "16px 28px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {t.cats.map((c, k) => (
              <span key={c} style={{ padding: "8px 14px", borderRadius: 20, fontSize: 20, fontWeight: 700, background: k === 0 ? INK : "#ece8df", color: k === 0 ? "#fff" : INK }}>{c}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "0 28px" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 8 }}>
                <Thumb i={i} size={186} radius={10} />
                <p style={{ margin: "6px 2px 0", fontSize: 19, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.names[i]}</p>
                <p style={{ margin: "2px 2px 2px", fontSize: 19, fontWeight: 900, color: SIGNAL }}>{PRICES[i]}</p>
              </div>
            ))}
          </div>
        </Phone>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 150 + (1 - tg) * -260, opacity: tg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "24px 28px", borderRadius: 36, background: "rgba(20,20,22,.96)", color: "#fff", boxShadow: "0 30px 60px -20px rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
          <TgIcon size={72} />
          <div>
            <p style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>{t.tgTitle}</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, color: "rgba(255,255,255,.7)" }}>{t.tgText}</p>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1230, display: "flex", flexDirection: "column", gap: 16 }}>
        {t.points.map((p, i) => (
          <Pop key={p} delay={40 + i * 12} from={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 28px", borderRadius: 30, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}>
              <Check size={56} bg={SIGNAL} color={INK} />
              <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{p}</span>
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
}

/* ── Sound design ─────────────────────────────────────────────────── */

const SFX: Array<[number, string, number]> = [
  [0, "bass", 0.9],
  [2, "glitch", 0.5],
  ...[12, 20, 28, 36, 44, 52, 60, 68, 76].map((f) => [f, "pops", 0.35] as [number, string, number]),
  [S.pain - 4, "whoosh", 0.55],
  [S.pain + 6, "typing", 0.4],
  [S.pain + 70, "ding", 0.5],
  [S.pain + 80, "buzz", 0.6],
  [S.turn - 4, "glitch", 0.6],
  [S.turn, "laser", 0.7],
  [S.turn + 24, "bass", 0.8],
  [S.split - 4, "whoosh", 0.6],
  [S.split + 66, "tap", 0.8],
  [S.split + 112, "tap", 0.8],
  [S.split + 118, "ding", 0.6],
  [S.split + 128, "buzz", 0.4],
  [S.split + 160, "whoosh", 0.6],
  [S.product + 30, "chime", 0.6],
  [S.product + 40, "pops", 0.45],
  [S.end, "chime", 0.7],
  [S.end + 80, "tap", 0.8],
];

export function Reel05({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const voice = `voice/reel-05-${lang}.mp3`;
  const scenes: Array<[number, number, ReactNode]> = [
    [S.hook, S.pain - S.hook, <Hook t={t} />],
    [S.pain, S.turn - S.pain, <Pain t={t} />],
    [S.turn, S.split - S.turn, <Brand t={{ notSleep: t.turn }} />],
    [S.split, S.product - S.split, <Split t={t} />],
    [S.product, S.end - S.product, <Product t={t} />],
    [S.end, REEL05_FRAMES - S.end, <End t={t} />],
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
      {hasFile("music/reel-05.mp3") && <Audio src={staticFile("music/reel-05.mp3")} volume={0.18} />}
    </AbsoluteFill>
  );
}
