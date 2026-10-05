import type { Locale } from "@/i18n/config";
import type { SystemMap } from "@/content/types";
import { localize } from "@/content/localize";
import { DrawOnView } from "./DrawOnView";

type Group = "input" | "core" | "output";
const GROUPS: Group[] = ["input", "core", "output"];

/**
 * Case-study system diagram generated from project data.
 * Desktop: three columns with orthogonal connectors. Mobile: stacked groups.
 * Colours follow the surrounding section theme.
 */
export function SystemDiagram({
  system,
  locale,
  legend,
  label,
}: {
  system: SystemMap;
  locale: Locale;
  legend: Record<Group, string>;
  label: string;
}) {
  const byGroup = Object.fromEntries(GROUPS.map((g) => [g, system.nodes.filter((n) => n.group === g)])) as Record<
    Group,
    SystemMap["nodes"]
  >;

  /* ── Horizontal layout ─────────────────────────────────────────── */
  const W = 1200;
  const NW = 270;
  const NH = 64;
  const GAP = 44;
  const colX: Record<Group, number> = { input: 20, core: 465, output: 910 };
  const maxN = Math.max(...GROUPS.map((g) => byGroup[g].length), 1);
  const H = 110 + maxN * NH + (maxN - 1) * GAP + 40;
  const pos = new Map<string, { x: number; y: number; group: Group; i: number }>();
  for (const g of GROUPS) {
    const nodes = byGroup[g];
    const total = nodes.length * NH + (nodes.length - 1) * GAP;
    const top = 110 + (maxN * NH + (maxN - 1) * GAP - total) / 2;
    nodes.forEach((n, i) => pos.set(n.id, { x: colX[g], y: top + i * (NH + GAP), group: g, i }));
  }

  const edgePath = (from: string, to: string) => {
    const a = pos.get(from);
    const b = pos.get(to);
    if (!a || !b) return null;
    if (a.group === b.group) {
      // Same column: a short vertical step on the inner left edge.
      const x = a.x + 28;
      const [y1, y2] = a.y < b.y ? [a.y + NH, b.y] : [a.y, b.y + NH];
      return `M${x} ${y1} L${x} ${y2}`;
    }
    const [l, r] = a.x < b.x ? [a, b] : [b, a];
    const x1 = l.x + NW;
    const y1 = l.y + NH / 2;
    const x2 = r.x;
    const y2 = r.y + NH / 2;
    const mid = (x1 + x2) / 2;
    return y1 === y2 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} L${mid} ${y1} L${mid} ${y2} L${x2} ${y2}`;
  };

  /* ── Vertical (mobile) layout ──────────────────────────────────── */
  const VW = 420;
  const VNH = 54;
  const vertical: Array<{ g: Group; top: number; nodes: Array<{ n: SystemMap["nodes"][number]; y: number }> }> = [];
  let vy = 0;
  for (const g of GROUPS) {
    const top = vy;
    vertical.push({ g, top, nodes: byGroup[g].map((n, i) => ({ n, y: top + 44 + i * (VNH + 12) })) });
    vy = top + 44 + byGroup[g].length * (VNH + 12) + 52;
  }
  const VH = vy - 40;

  const nodeClass = (g: Group) => (g === "core" ? "fill-surface stroke-fg" : "fill-bg stroke-rule-strong");

  return (
    <DrawOnView>
      <figure className="text-fg">
        <figcaption className="sr-only">
          {label}.{" "}
          {GROUPS.map((g) => `${legend[g]}: ${byGroup[g].map((n) => localize(n.label, locale)).join(", ")}.`).join(" ")}
        </figcaption>
        {/* Desktop */}
        <svg viewBox={`0 0 ${W} ${H}`} className="hidden h-auto w-full md:block" aria-hidden="true">
          {GROUPS.map((g) => (
            <g key={g}>
              <text x={colX[g]} y={52} className="fill-fg-mute" fontSize={13} letterSpacing={1.4} style={{ textTransform: "uppercase", fontFamily: "var(--font-geist-mono), var(--font-armenian), monospace" }}>
                {legend[g]}
              </text>
              <line x1={colX[g]} x2={colX[g] + NW} y1={70} y2={70} className="stroke-rule-strong" />
            </g>
          ))}
          {system.edges.map(([from, to], i) => {
            const d = edgePath(from, to);
            return d ? <path key={i} data-edge d={d} fill="none" pathLength={1} className="stroke-fg-mute" strokeWidth={1.4} /> : null;
          })}
          {system.nodes.map((n) => {
            const p = pos.get(n.id)!;
            return (
              <g key={n.id} transform={`translate(${p.x} ${p.y})`}>
                <rect width={NW} height={NH} rx={4} className={nodeClass(n.group)} strokeWidth={1.3} />
                <rect x={18} y={NH / 2 - 4} width={8} height={8} className={n.group === "core" ? "fill-signal" : "fill-fg-mute"} />
                <text x={40} y={NH / 2 + 6} fontSize={17} className="fill-fg" fontWeight={500}>
                  {localize(n.label, locale)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Mobile */}
        <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full md:hidden" aria-hidden="true">
          {vertical.map(({ g, top, nodes }, gi) => (
            <g key={g}>
              <text x={0} y={top + 20} className="fill-fg-mute" fontSize={12} letterSpacing={1.2} style={{ textTransform: "uppercase", fontFamily: "var(--font-geist-mono), var(--font-armenian), monospace" }}>
                {legend[g]}
              </text>
              {nodes.map(({ n, y }) => (
                <g key={n.id} transform={`translate(0 ${y})`}>
                  <rect width={VW} height={VNH} rx={4} className={nodeClass(g)} strokeWidth={1.2} />
                  <rect x={16} y={VNH / 2 - 4} width={8} height={8} className={g === "core" ? "fill-signal" : "fill-fg-mute"} />
                  <text x={36} y={VNH / 2 + 6} fontSize={16} className="fill-fg" fontWeight={500}>
                    {localize(n.label, locale)}
                  </text>
                </g>
              ))}
              {gi < vertical.length - 1 && (
                <path
                  data-edge
                  d={`M${VW / 2} ${nodes[nodes.length - 1].y + VNH + 8} L${VW / 2} ${vertical[gi + 1].top + 4}`}
                  pathLength={1}
                  className="stroke-fg-mute"
                  strokeWidth={1.4}
                  fill="none"
                />
              )}
            </g>
          ))}
        </svg>
      </figure>
    </DrawOnView>
  );
}
