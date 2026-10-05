/**
 * Drawing primitives for the coded project compositions (SVG, server-rendered).
 * One art direction for every scene: graphite or paper ground, hairline
 * panels, mono annotations, a single signal-orange accent.
 *
 * All coordinates are in a 1600 × 1000 view box.
 */
import type { ReactNode, SVGProps } from "react";

export type Tone = "dark" | "light";

export const palette = {
  dark: {
    bg: "#0a0a0a",
    panel: "#111111",
    panel2: "#171717",
    raised: "#1d1d1d",
    line: "#262626",
    line2: "#363636",
    text: "#ecebe7",
    mute: "#8d8c88",
    faint: "#4b4a47",
    accent: "#ff5b14",
    solid: "#e9e8e4",
  },
  light: {
    bg: "#e7e5de",
    panel: "#f7f6f2",
    panel2: "#efede7",
    raised: "#ffffff",
    line: "#d6d3cb",
    line2: "#c3c0b7",
    text: "#111111",
    mute: "#6b6a66",
    faint: "#aaa79f",
    accent: "#ff5b14",
    solid: "#141414",
  },
} as const;

export type Palette = (typeof palette)[Tone];

export const MONO = "var(--font-geist-mono), var(--font-armenian), ui-monospace, monospace";

/** Which part of a composition stays in frame when a narrow container crops it. */
export type Focus = "left" | "center" | "right";

/** Props shared by every scene component. */
export type SceneProps = { label?: string; focus?: Focus };

const ALIGN: Record<Focus, string> = { left: "xMinYMid", center: "xMidYMid", right: "xMaxYMid" };

/** Root SVG: covers its container (like object-fit: cover), cropped towards `focus`. */
export function Canvas({ children, label, focus = "center" }: { children: ReactNode; label?: string; focus?: Focus }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio={`${ALIGN[focus]} slice`}
      className="absolute inset-0 h-full w-full"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ fontFamily: "var(--font-geist), var(--font-armenian), ui-sans-serif, sans-serif" }}
    >
      {children}
    </svg>
  );
}

type PanelProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  p: Palette;
  fill?: string;
  stroke?: string;
  r?: number;
  shadow?: boolean;
  children?: ReactNode;
};

/** A UI surface. Children are positioned in panel-local coordinates. */
export function Panel({ x, y, w, h, p, fill, stroke, r = 6, shadow = true, children }: PanelProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {shadow && (
        <>
          <rect x={0} y={30} width={w} height={h} rx={r} fill="#000" opacity={0.1} />
          <rect x={0} y={10} width={w} height={h} rx={r} fill="#000" opacity={0.08} />
        </>
      )}
      <rect width={w} height={h} rx={r} fill={fill ?? p.panel} stroke={stroke ?? p.line} strokeWidth={1.5} />
      {children}
    </g>
  );
}

type TextProps = Omit<SVGProps<SVGTextElement>, "x" | "y"> & {
  x: number;
  y: number;
  size?: number;
  color: string;
  weight?: number;
  mono?: boolean;
  anchor?: "start" | "middle" | "end";
  tracking?: number;
  children: ReactNode;
};

export function T({ x, y, size = 16, color, weight = 400, mono, anchor = "start", tracking, children, ...rest }: TextProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={color}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily={mono ? MONO : undefined}
      letterSpacing={tracking ?? (mono ? size * 0.08 : size > 30 ? -size * 0.03 : -size * 0.005)}
      style={mono ? { textTransform: "uppercase" } : undefined}
      {...rest}
    >
      {children}
    </text>
  );
}

/** Rounded skeleton bar (stands in for secondary text). */
export function Bar({ x, y, w, h = 8, color, r = 4, opacity = 1 }: { x: number; y: number; w: number; h?: number; color: string; r?: number; opacity?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={color} opacity={opacity} />;
}

/** Status pill with mono caption. */
export function Pill({
  x,
  y,
  label,
  p,
  tone = "default",
  size = 11,
}: {
  x: number;
  y: number;
  label: string;
  p: Palette;
  tone?: "default" | "accent" | "solid" | "ghost";
  size?: number;
}) {
  const w = label.length * size * 0.72 + size * 1.8;
  const h = size * 2.1;
  const fill = tone === "accent" ? p.accent : tone === "solid" ? p.solid : "transparent";
  const stroke = tone === "ghost" ? p.line2 : tone === "default" ? p.line2 : fill;
  const color = tone === "accent" ? "#000" : tone === "solid" ? p.bg : p.mute;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={1.2} />
      <T x={w / 2} y={h * 0.66} size={size} color={color} mono anchor="middle" weight={500}>
        {label}
      </T>
    </g>
  );
}

/** Small square avatar/initials block. */
export function Avatar({ x, y, s = 28, p, label }: { x: number; y: number; s?: number; p: Palette; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx={s / 2} fill={p.raised} stroke={p.line2} />
      <T x={s / 2} y={s * 0.64} size={s * 0.38} color={p.mute} anchor="middle" weight={600}>
        {label}
      </T>
    </g>
  );
}

/** Horizontal score/progress bar. */
export function Meter({ x, y, w, value, p, accent = false, h = 4 }: { x: number; y: number; w: number; value: number; p: Palette; accent?: boolean; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={p.line} />
      <rect x={x} y={y} width={w * value} height={h} rx={h / 2} fill={accent ? p.accent : p.solid} />
    </g>
  );
}

/** Line/area chart from normalised values (0–1). */
export function Chart({
  x,
  y,
  w,
  h,
  values,
  p,
  area = true,
  accentLast = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  values: number[];
  p: Palette;
  area?: boolean;
  accentLast?: boolean;
}) {
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [x + i * step, y + h - v * h] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <g>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={x} x2={x + w} y1={y + h * g} y2={y + h * g} stroke={p.line} strokeWidth={1} />
      ))}
      {area && <path d={`${line} L${x + w} ${y + h} L${x} ${y + h} Z`} fill={p.solid} opacity={0.06} />}
      <path d={line} fill="none" stroke={p.solid} strokeWidth={2} />
      {accentLast && (
        <>
          <line x1={last[0]} x2={last[0]} y1={y} y2={y + h} stroke={p.accent} strokeWidth={1} strokeDasharray="3 4" />
          <circle cx={last[0]} cy={last[1]} r={5} fill={p.accent} />
        </>
      )}
    </g>
  );
}

/** Vertical bars from normalised values. */
export function Bars({ x, y, w, h, values, p, highlight }: { x: number; y: number; w: number; h: number; values: number[]; p: Palette; highlight?: number }) {
  const gap = 10;
  const bw = (w - gap * (values.length - 1)) / values.length;
  return (
    <g>
      {values.map((v, i) => (
        <rect
          key={i}
          x={x + i * (bw + gap)}
          y={y + h - v * h}
          width={bw}
          height={v * h}
          rx={2}
          fill={i === highlight ? p.accent : p.solid}
          opacity={i === highlight ? 1 : 0.85}
        />
      ))}
    </g>
  );
}

/** Check mark glyph. */
export function Check({ x, y, color, s = 14 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <path
      d={`M${x} ${y + s * 0.55} L${x + s * 0.38} ${y + s * 0.9} L${x + s} ${y + s * 0.1}`}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
    />
  );
}

/** Thin connector with an arrow head. */
export function Connector({ d, color, dashed = false, arrow = true, width = 1.5 }: { d: string; color: string; dashed?: boolean; arrow?: boolean; width?: number }) {
  const end = d.trim().split(/[\sML,]+/).filter(Boolean).map(Number);
  const ex = end[end.length - 2];
  const ey = end[end.length - 1];
  const px = end[end.length - 4];
  const py = end[end.length - 3];
  const angle = Math.atan2(ey - py, ex - px);
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "4 6" : undefined} />
      {arrow && (
        <path
          d={`M${ex + Math.cos(a1) * 9} ${ey + Math.sin(a1) * 9} L${ex} ${ey} L${ex + Math.cos(a2) * 9} ${ey + Math.sin(a2) * 9}`}
          fill="none"
          stroke={color}
          strokeWidth={width}
        />
      )}
    </g>
  );
}

/** Browser chrome (no brand logos): three dots, address bar. */
export function BrowserChrome({ w, p, url }: { w: number; p: Palette; url: string }) {
  return (
    <g>
      <line x1={0} x2={w} y1={44} y2={44} stroke={p.line} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={22 + i * 18} cy={22} r={5} fill="none" stroke={p.line2} strokeWidth={1.4} />
      ))}
      <rect x={w / 2 - 170} y={11} width={340} height={22} rx={11} fill={p.panel2} stroke={p.line} />
      <T x={w / 2} y={27} size={11} color={p.mute} anchor="middle" mono>
        {url}
      </T>
    </g>
  );
}

/** Phone frame (neutral, no device branding). Content is drawn in local coords (w × h). */
export function Phone({ x, y, w = 300, h = 620, p, children }: { x: number; y: number; w?: number; h?: number; p: Palette; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-2} y={30} width={w + 4} height={h} rx={44} fill="#000" opacity={0.14} />
      <rect width={w} height={h} rx={40} fill={p.solid === "#141414" ? "#101010" : "#050505"} />
      <rect x={8} y={8} width={w - 16} height={h - 16} rx={33} fill={p.panel} />
      <rect x={w / 2 - 44} y={20} width={88} height={22} rx={11} fill="#000" />
      <g transform="translate(8 8)">{children}</g>
    </g>
  );
}
