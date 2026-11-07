import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../fonts";
import { Check, Glyph, hasFile, IgIcon, INK, SIGNAL, Word } from "../Reel01";
import type { IconName } from "./data";

/* Static brand images: highlight covers, Facebook cover, YouTube banner, watermark, price carousel. */

const SOFT = "rgba(255,255,255,.62)";
const glow = "radial-gradient(circle at 50% 50%, rgba(255,91,20,.22), transparent 55%)";

/* ── highlight covers (1080×1920; Instagram shows the centre circle) ── */

export function Cover({ icon }: { icon: IconName }) {
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <AbsoluteFill style={{ background: glow }} />
      <div style={{ width: 520, height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CoverIcon icon={icon} />
      </div>
    </AbsoluteFill>
  );
}

function CoverIcon({ icon }: { icon: IconName }) {
  const s = { fill: "none", stroke: SIGNAL, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (icon) {
    case "logo":
      return <Glyph size={360} />;
    case "dram":
      return <span style={{ fontSize: 440, lineHeight: 1, fontWeight: 500, color: SIGNAL, fontFamily: '"NotoArm", sans-serif' }}>֏</span>;
    case "grid":
      return (
        <svg viewBox="0 0 24 24" width={420} height={420} {...s}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" fill={SIGNAL} />
        </svg>
      );
    case "steps":
      return (
        <svg viewBox="0 0 24 24" width={420} height={420} {...s}>
          <rect x="3.5" y="14" width="4.5" height="6.5" rx="1.2" />
          <rect x="9.75" y="9.5" width="4.5" height="11" rx="1.2" />
          <rect x="16" y="4" width="4.5" height="16.5" rx="1.2" fill={SIGNAL} />
        </svg>
      );
    case "faq":
      return (
        <svg viewBox="0 0 24 24" width={420} height={420} {...s}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
          <path d="M9.8 7.8a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.4" />
          <circle cx="12" cy="13.9" r=".9" fill={SIGNAL} stroke="none" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" width={420} height={420} {...s}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.3v7.4l6-3.7z" fill={SIGNAL} />
        </svg>
      );
  }
}

/* ── cover background (Higgsfield image when present) ──────────────── */

function Backdrop({ shift = "50%" }: { shift?: string }) {
  const src = "bg/cover.jpg";
  return hasFile(src) ? (
    <>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${shift} 50%` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,11,12,.92) 0%, rgba(11,11,12,.6) 48%, rgba(11,11,12,0) 75%)" }} />
    </>
  ) : (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 50%, rgba(255,91,20,.35), transparent 45%), ${INK}` }} />
  );
}

function Pitch({ scale = 1, maxW = 820 }: { scale?: number; maxW?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 * scale, color: "#fff", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 * scale }}>
        <Glyph size={84 * scale} />
        <Word height={58 * scale} color="#fff" />
      </div>
      <h1 style={{ margin: 0, fontSize: 60 * scale, lineHeight: 1.08, fontWeight: 900, letterSpacing: "-0.02em", maxWidth: maxW * scale }}>
        AI ադմինիստրատոր Instagram-ի և WhatsApp-ի համար
      </h1>
      <p style={{ margin: 0, fontSize: 30 * scale, color: SOFT }}>Պատասխաններ 24/7 · Գրանցում · Պատվերներ · Մարքեթինգ · Կայքեր</p>
      <div style={{ display: "flex", gap: 16 * scale, marginTop: 6 * scale }}>
        <span style={{ padding: `${14 * scale}px ${28 * scale}px`, borderRadius: 60, background: SIGNAL, color: INK, fontSize: 30 * scale, fontWeight: 900 }}>Գրեք «ԴԵՄՈ»</span>
        <span style={{ padding: `${14 * scale}px ${28 * scale}px`, borderRadius: 60, background: "rgba(255,255,255,.12)", fontSize: 30 * scale, fontWeight: 700 }}>+374 77 200 433</span>
      </div>
    </div>
  );
}

/** Facebook cover 1640×624. Phones crop the sides, so content sits inside the centre ~1200px. */
export function FbCover() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Backdrop shift="70%" />
      <div style={{ position: "absolute", left: 240, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Pitch scale={0.9} />
      </div>
    </AbsoluteFill>
  );
}

/** YouTube banner 2560×1440. Safe area for every device: centre 1546×423 (x 507–2053, y 508–931). */
export function YtBanner() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Backdrop shift="60%" />
      <div style={{ position: "absolute", left: 540, top: 508, height: 423, display: "flex", alignItems: "center" }}>
        <Pitch scale={1} maxW={1250} />
      </div>
    </AbsoluteFill>
  );
}

/** YouTube watermark 150×150. */
export function Watermark() {
  return (
    <AbsoluteFill style={{ background: INK, borderRadius: 150, alignItems: "center", justifyContent: "center" }}>
      <Glyph size={86} />
    </AbsoluteFill>
  );
}

/* ── price carousel (1080×1350) ─────────────────────────────────────── */

type Slide =
  | { kind: "cover" }
  | { kind: "plan"; group: string; name: string; for: string; setup: string; monthly: string; features: string[]; popular?: boolean }
  | { kind: "terms" };

export const SLIDES: Slide[] = [
  { kind: "cover" },
  { kind: "plan", group: "AI ադմինիստրատոր", name: "Start", for: "AI պատասխաններ մեկ ալիքի համար", setup: "60 000 ֏", monthly: "20 000 ֏", features: ["AI ադմինիստրատոր Instagram-ի կամ WhatsApp-ի համար", "Գիտի ձեր գները, ծառայություններն ու հասցեն", "Հավաքում է հայտերը և ուղարկում Telegram", "Պատասխանում է 3 լեզվով"] },
  { kind: "plan", group: "AI ադմինիստրատոր", name: "Pro", for: "Պատասխաններ + գրանցում, բոլոր ալիքները", setup: "120 000 ֏", monthly: "35 000 ֏", popular: true, features: ["Start-ի ամեն ինչը՝ Instagram-ի, WhatsApp-ի և Telegram-ի համար", "Առցանց գրանցման օրացույց", "Հիշեցումներ այցից առաջ", "Կարծիքի խնդրանքներ և օրվա հաշվետվություն"] },
  { kind: "plan", group: "Պատվերներ", name: "Instagram խանութ", for: "Instagram-ով վաճառող խանութների համար", setup: "90 000 ֏-ից", monthly: "25 000 ֏", features: ["AI պատասխաններ ապրանքների և մնացորդի մասին", "Պատվերների ընդունում չատում", "Պատվերների վահանակ՝ կարգավիճակներով", "Առաքիչ Telegram-ում և օրվա հաշվետվություն"] },
  { kind: "plan", group: "Անշարժ գույք", name: "Գործակալություն", for: "Գործակալությունների և կառուցապատողների համար", setup: "180 000 ֏-ից", monthly: "35 000 ֏", features: ["Բոլոր հայտերը մեկ ցուցակում", "AI-ի առաջին պատասխան գնորդներին", "Գնորդների և գույքի համադրում", "Հետզանգի հիշեցումներ"] },
  { kind: "plan", group: "Մարքեթինգ", name: "Google և կարծիքներ", for: "Լինել տեսանելի քարտեզում", setup: "0 ֏", monthly: "25 000 ֏", features: ["Google Maps պրոֆիլի կարգավորում և խնամք", "Ավտոմատ կարծիքի խնդրանքներ", "Պատասխան յուրաքանչյուր կարծիքի", "Google + Instagram փաթեթ՝ 60 000 ֏/ամիս"] },
  { kind: "plan", group: "Կայքեր", name: "Մեկ էջանոց կայք", for: "Արագ մեկնարկ առցանց", setup: "120 000 ֏-ից", monthly: "10 000 ֏", features: ["Մեկ էջ 3 լեզվով", "Կոնտակտային ձև և WhatsApp կոճակ", "Հոսթինգի և դոմենի կարգավորում", "Ընկերության կայք՝ 210 000 ֏-ից + 18 000 ֏/ամիս"] },
  { kind: "terms" },
];

export function CarouselSlide({ index }: { index: number }) {
  const s = SLIDES[index];
  return (
    <AbsoluteFill style={{ background: INK, color: "#fff", fontFamily: FONT, padding: 80 }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 100% 0%, rgba(255,91,20,.3), transparent 45%)" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
        <Glyph size={52} />
        <Word height={36} color="#fff" />
        <span style={{ marginLeft: "auto", fontSize: 28, color: SOFT, fontWeight: 700 }}>
          {index + 1} / {SLIDES.length}
        </span>
      </div>
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {s.kind === "cover" && (
          <>
            <span style={{ alignSelf: "flex-start", padding: "12px 26px", borderRadius: 40, background: SIGNAL, color: INK, fontSize: 30, fontWeight: 900 }}>Մեկնարկային գներ</span>
            <h1 style={{ margin: "36px 0 0", fontSize: 120, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.03em" }}>Հստակ գներ։</h1>
            <p style={{ margin: "36px 0 0", fontSize: 44, lineHeight: 1.3, color: SOFT }}>Մեկանգամյա կարգավորում, հետո փոքր ամսավճար։ Առանց թաքնված վճարների։</p>
            <p style={{ margin: "60px 0 0", fontSize: 36, fontWeight: 700, color: SIGNAL }}>Սահեցրեք ձախ</p>
          </>
        )}
        {s.kind === "plan" && (
          <>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: SIGNAL, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.group}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 14 }}>
              <h1 style={{ margin: 0, fontSize: 84, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.02em" }}>{s.name}</h1>
              {s.popular && <span style={{ padding: "10px 22px", borderRadius: 30, background: "#fff", color: INK, fontSize: 26, fontWeight: 900 }}>Ամենաշատ ընտրվողը</span>}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 36, color: SOFT }}>{s.for}</p>
            <div style={{ display: "flex", gap: 24, marginTop: 44 }}>
              <PriceBox label="կարգավորում" value={s.setup} />
              <PriceBox label="ամսական" value={s.monthly} accent />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 44 }}>
              {s.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <Check size={46} bg={SIGNAL} color={INK} />
                  <span style={{ fontSize: 34, lineHeight: 1.3 }}>{f}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {s.kind === "terms" && (
          <>
            <h1 style={{ margin: 0, fontSize: 84, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.02em" }}>Ինչպես ենք վճարում</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 44 }}>
              {["50% սկզբում, 50% մեկնարկին", "Ամսավճարը՝ միայն մեկնարկից հետո", "Պայմանագիր և հաշիվ-ապրանքագիր", "«Սկսած» գինը ճշտվում է անվճար զանգից հետո"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <Check size={46} bg={SIGNAL} color={INK} />
                  <span style={{ fontSize: 36, lineHeight: 1.3 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 20, alignSelf: "flex-start", padding: "26px 44px", borderRadius: 80, background: SIGNAL, color: INK, fontSize: 48, fontWeight: 900 }}>
              Գրեք «ԴԵՄՈ» <IgIcon size={56} />
            </div>
            <p style={{ margin: "28px 0 0", fontSize: 34, color: SOFT }}>WhatsApp՝ +374 77 200 433</p>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

function PriceBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, padding: "28px 32px", borderRadius: 32, background: accent ? "#fff" : "rgba(255,255,255,.07)", color: accent ? INK : "#fff", border: "1px solid rgba(255,255,255,.12)" }}>
      <p style={{ margin: 0, fontSize: 28, opacity: 0.7, fontWeight: 700 }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: 54, fontWeight: 900, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
