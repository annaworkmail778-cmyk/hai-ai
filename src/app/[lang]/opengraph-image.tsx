import { ImageResponse } from "next/og";
import { brand, COMPANY_NAME, TAGLINE } from "@/config/brand";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { og, OG_SIZE, OgGrid, OgWordmark, ogFonts } from "@/lib/og";

export const alt = `${COMPANY_NAME} — ${TAGLINE}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/* Isometric drawing of the four-layer system from the homepage intro. */
const SIDE = 150;
const GAP = 76;
const THICK = 7;
const COS = Math.cos(Math.PI / 6);
const ORIGIN = { x: 830, y: 118 };
const iso = (x: number, y: number, z: number) => ({ x: ORIGIN.x + (x - y) * COS, y: ORIGIN.y + (x + y) * 0.5 + z });
const pts = (list: Array<{ x: number; y: number }>) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

function SystemDrawing() {
  const levels = [0, 1, 2, 3];
  const corners = [
    [0, 0],
    [SIDE, 0],
    [SIDE, SIDE],
    [0, SIDE],
  ] as const;
  return (
    <svg width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", top: 0, left: 0 }}>
      {corners.map(([x, y]) => {
        const a = iso(x, y, 0);
        const b = iso(x, y, GAP * 3 + THICK);
        return <line key={`${x}-${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2c2c2c" strokeWidth="1.5" />;
      })}
      {[...levels].reverse().map((i) => {
        const z = i * GAP;
        const top = corners.map(([x, y]) => iso(x, y, z));
        const left = [iso(0, SIDE, z), iso(SIDE, SIDE, z), iso(SIDE, SIDE, z + THICK), iso(0, SIDE, z + THICK)];
        const right = [iso(SIDE, 0, z), iso(SIDE, SIDE, z), iso(SIDE, SIDE, z + THICK), iso(SIDE, 0, z + THICK)];
        const core = i === 0;
        const c = iso(SIDE / 2, SIDE / 2, z);
        return (
          <g key={i}>
            <polygon points={pts(left)} fill="#161616" stroke="#3a3a3a" strokeWidth="1" />
            <polygon points={pts(right)} fill="#1c1c1c" stroke="#3a3a3a" strokeWidth="1" />
            <polygon points={pts(top)} fill="#0c0c0c" stroke={core ? og.signal : "#4a4a4a"} strokeWidth="1.5" />
            {core && (
              <polygon
                points={pts([
                  iso(SIDE / 2 - 18, SIDE / 2 - 18, z),
                  iso(SIDE / 2 + 18, SIDE / 2 - 18, z),
                  iso(SIDE / 2 + 18, SIDE / 2 + 18, z),
                  iso(SIDE / 2 - 18, SIDE / 2 + 18, z),
                ])}
                fill={og.signal}
              />
            )}
            {!core && <circle cx={c.x} cy={c.y} r="2.5" fill="#5a5a5a" />}
            <line
              x1={iso(SIDE, 0, z).x + 10}
              y1={iso(SIDE, 0, z).y}
              x2={iso(SIDE, 0, z).x + 42}
              y2={iso(SIDE, 0, z).y}
              stroke={core ? og.signal : "#4a4a4a"}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const dict = getDictionary(locale);
  const host = new URL(brand.siteUrl).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: og.black,
          color: og.paper,
          fontFamily: og.sans,
        }}
      >
        <OgGrid color="#0d0d0d" />
        <SystemDrawing />
        {dict.intro.layers.map((label, i) => (
          <div
            key={label}
            style={{
              position: "absolute",
              left: iso(SIDE, 0, 0).x + 52,
              top: iso(SIDE, 0, i * GAP).y - 10,
              fontFamily: og.mono,
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: i === 0 ? og.paper : og.mute,
            }}
          >
            {label}
          </div>
        ))}
        <div style={{ position: "absolute", top: 56, left: 64, display: "flex" }}>
          <OgWordmark color={og.paper} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 172,
            width: 640,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: locale === "hy" ? 58 : 66, fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            {brand.tagline[locale]}
          </div>
          <div style={{ marginTop: 28, fontSize: 25, lineHeight: 1.35, color: og.mute, maxWidth: 560 }}>
            {brand.description[locale]}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 52,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${og.line}`,
            paddingTop: 20,
            fontFamily: og.mono,
            fontSize: 15,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: og.mute,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, background: og.signal }} />
            {host}
          </div>
          <div style={{ display: "flex" }}>{locales.map((l) => l.toUpperCase()).join(" / ")}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
