import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand } from "@/config/brand";
import { LOGO } from "@/config/logo";

/**
 * Shared pieces for generated Open Graph images (next/og → Satori).
 * Satori needs TTF/OTF files: Geist covers Latin and Cyrillic, Noto Sans
 * Armenian covers Armenian. Both are licensed under the SIL OFL 1.1.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const og = {
  black: "#000000",
  ink: "#0a0a0a",
  graphite: "#111111",
  line: "#262626",
  lineStrong: "#3a3a3a",
  paper: "#f3f2ee",
  paperLine: "#d9d6ce",
  mute: "#999999",
  muteInk: "#6b6a66",
  signal: brand.accent,
  sans: "Geist, Noto Sans Armenian",
  mono: "Geist Mono, Noto Sans Armenian",
};

type Font = { name: string; data: Buffer; weight: 400 | 500; style: "normal" };

let fonts: Promise<Font[]> | undefined;

export function ogFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const load = (file: string) => readFile(join(dir, file));
  fonts ??= Promise.all([
    load("Geist-Regular.ttf"),
    load("Geist-Medium.ttf"),
    load("GeistMono-Regular.ttf"),
    load("NotoSansArmenian-Regular.ttf"),
    load("NotoSansArmenian-Medium.ttf"),
  ]).then(([regular, medium, mono, hy, hyMedium]) => [
    { name: "Geist", data: regular, weight: 400, style: "normal" },
    { name: "Geist", data: medium, weight: 500, style: "normal" },
    { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
    { name: "Noto Sans Armenian", data: hy, weight: 400, style: "normal" },
    { name: "Noto Sans Armenian", data: hyMedium, weight: 500, style: "normal" },
  ]);
  return fonts;
}

/** Riseup logo (R mark + wordmark), traced from the approved artwork. */
export function OgWordmark({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
      <svg width={size * 1.6} height={size * 1.42} viewBox={LOGO.markViewBox}>
        <path fill={color} fillRule="evenodd" d={LOGO.mark} />
        <path fill={og.signal} fillRule="evenodd" d={LOGO.swoosh} />
      </svg>
      <svg width={size * 3.6} height={size * 1.05} viewBox={LOGO.wordViewBox}>
        <path fill={color} fillRule="evenodd" d={LOGO.word} />
      </svg>
    </div>
  );
}

/** Drafting grid used as the background of every card. */
export function OgGrid({ color, step = 48 }: { color: string; step?: number }) {
  const { width, height } = OG_SIZE;
  const xs = Array.from({ length: Math.floor(width / step) }, (_, i) => (i + 1) * step);
  const ys = Array.from({ length: Math.floor(height / step) }, (_, i) => (i + 1) * step);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {xs.map((x) => (
        <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} stroke={color} strokeWidth="1" />
      ))}
      {ys.map((y) => (
        <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} stroke={color} strokeWidth="1" />
      ))}
    </svg>
  );
}
