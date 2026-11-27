"use client";
/* Lightweight SVG charts (no chart library). */
import { useState } from "react";
import { cn } from "./ui";

export function BarLine({ data, height = 220, barLabel, lineLabel, fmtBar, fmtLine }: {
  data: { label: string; bar: number; line?: number; highlight?: boolean }[];
  height?: number; barLabel: string; lineLabel?: string; fmtBar: (n: number) => string; fmtLine?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = height, padL = 8, padR = 8, padT = 16, padB = 26;
  const max = Math.max(1, ...data.map((d) => d.bar)) * 1.12;
  const bw = (W - padL - padR) / data.length;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ly = (v: number) => padT + (H - padT - padB) * (1 - v);
  const linePts = data.map((d, i) => `${padL + bw * i + bw / 2},${ly(d.line ?? 0)}`).join(" ");
  const every = Math.ceil(data.length / 10);
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" onMouseLeave={() => setHover(null)} role="img" aria-label={barLabel}>
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={padL} x2={W - padR} y1={padT + (H - padT - padB) * (1 - g)} y2={padT + (H - padT - padB) * (1 - g)} stroke="var(--color-line)" strokeDasharray="3 4" />)}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={padL + bw * i} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
            <rect x={padL + bw * i + bw * 0.18} y={y(d.bar)} width={bw * 0.64} height={Math.max(0, H - padB - y(d.bar))} rx={Math.min(4, bw * 0.2)} fill={d.highlight ? "var(--color-signal)" : hover === i ? "var(--color-ink)" : "var(--color-ink-2)"} opacity={hover === null || hover === i ? 0.92 : 0.45} />
            {i % every === 0 && <text x={padL + bw * i + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-muted)">{d.label}</text>}
          </g>
        ))}
        {lineLabel && <polyline points={linePts} fill="none" stroke="var(--color-signal)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ink-2" />{barLabel}</span>
        {lineLabel && <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-signal" />{lineLabel}</span>}
      </div>
      {h && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-[var(--shadow-pop)]">
          <div className="font-medium">{h.label}</div>
          <div className="tnum text-muted">{barLabel}: <span className="text-ink">{fmtBar(h.bar)}</span></div>
          {lineLabel && fmtLine && <div className="tnum text-muted">{lineLabel}: <span className="text-ink">{fmtLine(h.line ?? 0)}</span></div>}
        </div>
      )}
    </div>
  );
}

const PALETTE = ["#121212", "#ff5b14", "#2f62d0", "#17845b", "#6a52c7", "#b7790f", "#9a978f"];

export function Donut({ data, center, sub }: { data: { label: string; value: number }[]; center: string; sub?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-line)" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const offset = data.slice(0, i).reduce((a, x) => a + (x.value / total) * C, 0);
          return <circle key={d.label} cx="70" cy="70" r={R} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
        })}
        <g className="rotate-90" style={{ transformOrigin: "70px 70px" }}>
          <text x="70" y="68" textAnchor="middle" fontSize="20" fontWeight="600" fill="var(--color-ink)">{center}</text>
          {sub && <text x="70" y="86" textAnchor="middle" fontSize="10" fill="var(--color-muted)">{sub}</text>}
        </g>
      </svg>
      <ul className="w-full space-y-1.5 text-[13px]">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 truncate">{d.label}</span>
            <span className="tnum text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBar({ value, max, tone = "ink", className }: { value: number; max: number; tone?: "ink" | "signal" | "ok" | "warn" | "info"; className?: string }) {
  const w = max ? Math.max(2, (value / max) * 100) : 0;
  const color = { ink: "bg-ink-2", signal: "bg-signal", ok: "bg-ok", warn: "bg-warn", info: "bg-info" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-black/[0.06]", className)}>
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, w)}%` }} />
    </div>
  );
}

export function Spark({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${30 - ((v - min) / Math.max(1, max - min)) * 26 - 2}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn("h-8 w-full", className)}>
      <polyline points={pts} fill="none" stroke="var(--color-signal)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Labelled horizontal bar list built on HBar. */
export function Bars({ data, format = (n: number) => n.toLocaleString("en-US"), tone = "ink" }: { data: { label: string; value: number }[]; format?: (n: number) => string; tone?: "ink" | "signal" | "ok" | "warn" | "info" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between gap-3 text-[13px]"><span className="truncate">{d.label}</span><span className="tnum shrink-0 font-medium">{format(d.value)}</span></div>
          <HBar value={d.value} max={max} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
