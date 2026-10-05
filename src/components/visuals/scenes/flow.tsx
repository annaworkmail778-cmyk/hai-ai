import { Canvas, Connector, T, palette, type Tone } from "../primitives";

export type FlowSpec = {
  tone: Tone;
  columns: Array<{ title: string; nodes: Array<{ id: string; label: string; accent?: boolean }> }>;
  edges: Array<[string, string]>;
  caption?: string;
};

const NODE_W = 236;
const NODE_H = 66;

/** Data-driven system flow: columns of nodes with orthogonal connectors. */
export function FlowScene({ spec, label }: { spec: FlowSpec; label?: string }) {
  const p = palette[spec.tone];
  const cols = spec.columns.length;
  const marginX = 130;
  const gapX = (1600 - marginX * 2 - NODE_W) / (cols - 1);
  const pos = new Map<string, { x: number; y: number }>();

  spec.columns.forEach((col, c) => {
    const total = col.nodes.length * NODE_H + (col.nodes.length - 1) * 34;
    const top = 520 - total / 2;
    col.nodes.forEach((n, i) => {
      pos.set(n.id, { x: marginX + c * gapX, y: top + i * (NODE_H + 34) });
    });
  });

  return (
    <Canvas label={label}>
      {spec.columns.map((col, c) => (
        <g key={col.title}>
          <T x={marginX + c * gapX} y={180} size={12} color={p.mute} mono>
            {String(c + 1).padStart(2, "0")} — {col.title}
          </T>
          <line x1={marginX + c * gapX} x2={marginX + c * gapX + NODE_W} y1={198} y2={198} stroke={p.line2} />
        </g>
      ))}

      {spec.edges.map(([from, to], i) => {
        const a = pos.get(from);
        const b = pos.get(to);
        if (!a || !b) return null;
        const x1 = a.x + NODE_W;
        const y1 = a.y + NODE_H / 2;
        const x2 = b.x - 4;
        const y2 = b.y + NODE_H / 2;
        const mid = (x1 + x2) / 2;
        const d = `M${x1} ${y1} L${mid} ${y1} L${mid} ${y2} L${x2} ${y2}`;
        const accent = spec.columns.some((col) => col.nodes.some((n) => n.id === to && n.accent));
        return <Connector key={i} d={d} color={accent ? p.accent : p.line2} />;
      })}

      {spec.columns.map((col) =>
        col.nodes.map((n) => {
          const { x, y } = pos.get(n.id)!;
          return (
            <g key={n.id} transform={`translate(${x} ${y})`}>
              <rect width={NODE_W} height={NODE_H} rx={4} fill={n.accent ? p.raised : p.panel} stroke={n.accent ? p.accent : p.line2} strokeWidth={1.4} />
              <rect x={16} y={NODE_H / 2 - 4} width={8} height={8} fill={n.accent ? p.accent : p.mute} />
              <T x={36} y={NODE_H / 2 + 6} size={16} color={p.text} weight={500}>
                {n.label}
              </T>
            </g>
          );
        }),
      )}

      {spec.caption && (
        <T x={marginX} y={900} size={11} color={p.mute} mono>
          {spec.caption}
        </T>
      )}
    </Canvas>
  );
}
