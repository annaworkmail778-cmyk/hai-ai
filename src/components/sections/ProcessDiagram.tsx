/**
 * The process architecture: chaos → order. Rendered statically at a given
 * stage (0–5) and animated by ProcessScroll on desktop via data attributes.
 */

type Module = { x: number; y: number; w: number; h: number; dots: number };

export const MODULES: Module[] = [
  { x: 110, y: 150, w: 150, h: 70, dots: 4 },
  { x: 325, y: 150, w: 150, h: 70, dots: 4 },
  { x: 540, y: 150, w: 150, h: 70, dots: 4 },
  { x: 200, y: 350, w: 400, h: 100, dots: 8 },
  { x: 180, y: 580, w: 180, h: 70, dots: 2 },
  { x: 440, y: 580, w: 180, h: 70, dots: 2 },
];

const CONNECTIONS: Array<[number, number, number, number]> = [
  [185, 220, 260, 350],
  [400, 220, 400, 350],
  [615, 220, 540, 350],
  [300, 450, 270, 580],
  [500, 450, 530, 580],
];

/**
 * Deterministic integer hash → [0, 1). Integer maths gives identical results
 * on the server and in every browser (Math.sin can differ in the last digits,
 * which would break hydration of the SVG attributes).
 */
function rand(seed: number) {
  let t = (seed * 0x6d2b79f5 + 0x9e3779b9) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Final (grid) positions of every data point, with a scattered origin. */
export const DOTS = MODULES.flatMap((m, mi) =>
  Array.from({ length: m.dots }, (_, i) => {
    const cols = m.dots >= 8 ? 4 : m.dots;
    const row = Math.floor(i / cols);
    const rows = Math.ceil(m.dots / cols);
    const col = i % cols;
    const gx = m.x + ((col + 1) * m.w) / (cols + 1);
    const gy = m.y + ((row + 1) * m.h) / (rows + 1);
    const seed = mi * 10 + i;
    return {
      gx: r1(gx),
      gy: r1(gy),
      sx: r1(90 + rand(seed) * 620),
      sy: r1(120 + rand(seed + 33) * 560),
      friction: [1, 6, 13, 17].includes(mi * 4 + i),
    };
  }),
);

/** A few tangled links between scattered points (the "before" state). */
const TANGLE: Array<[number, number]> = [
  [0, 9],
  [3, 14],
  [5, 20],
  [11, 2],
  [16, 7],
  [22, 12],
  [19, 1],
];

export function ProcessDiagram({ stage = 5, className }: { stage?: number; className?: string }) {
  const scattered = stage < 4;
  return (
    <svg viewBox="0 0 800 800" className={className} fill="none" aria-hidden="true">
      {/* Blueprint grid (Design) */}
      <g data-blueprint opacity={stage >= 3 ? 1 : 0} stroke="rgb(243 242 238 / 0.18)" strokeDasharray="4 6">
        {[100, 300, 500, 700].map((x) => (
          <line key={`x${x}`} x1={x} x2={x} y1={90} y2={710} pathLength={1} />
        ))}
        {[130, 330, 560, 700].map((y) => (
          <line key={`y${y}`} x1={60} x2={740} y1={y} y2={y} pathLength={1} />
        ))}
      </g>

      {/* Tangled links (Understand) */}
      <g data-tangle opacity={stage >= 1 && stage < 4 ? 1 : 0} stroke="rgb(243 242 238 / 0.35)">
        {TANGLE.map(([a, b], i) => (
          <line key={i} x1={DOTS[a].sx} y1={DOTS[a].sy} x2={DOTS[b].sx} y2={DOTS[b].sy} pathLength={1} />
        ))}
      </g>

      {/* Modules: dashed outline (Design) → solid (Build) */}
      {MODULES.map((m, i) => (
        <g key={i}>
          <rect
            data-module-outline
            x={m.x}
            y={m.y}
            width={m.w}
            height={m.h}
            rx={4}
            stroke="rgb(243 242 238 / 0.55)"
            strokeDasharray="5 6"
            pathLength={1}
            opacity={stage === 3 ? 1 : 0}
          />
          <rect
            data-module
            x={m.x}
            y={m.y}
            width={m.w}
            height={m.h}
            rx={4}
            fill="#151515"
            stroke="rgb(243 242 238 / 0.85)"
            opacity={stage >= 4 ? 1 : 0}
          />
        </g>
      ))}

      {/* Connections (Build) */}
      <g data-connections stroke="var(--color-paper)" strokeWidth={1.5} opacity={stage >= 4 ? 1 : 0}>
        {CONNECTIONS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
        ))}
      </g>

      {/* Data points: scattered → aligned. Friction rings travel with their point. */}
      {DOTS.map((d, i) => (
        <g key={i} data-dot transform={scattered ? `translate(${r1(d.sx - d.gx)} ${r1(d.sy - d.gy)})` : undefined}>
          <rect
            x={d.gx - 5}
            y={d.gy - 5}
            width={10}
            height={10}
            fill={d.friction && stage >= 2 && stage < 4 ? "var(--color-signal)" : "var(--color-paper)"}
            opacity={stage >= 1 ? 1 : 0}
          />
          {d.friction && (
            <circle
              data-ring
              cx={d.gx}
              cy={d.gy}
              r={20}
              stroke="var(--color-signal)"
              strokeWidth={1.5}
              opacity={stage === 2 || stage === 3 ? 1 : 0}
            />
          )}
        </g>
      ))}

      {/* Feedback loop (Improve) */}
      <g data-loop opacity={stage >= 5 ? 1 : 0}>
        <path
          d="M 640 690 A 330 330 0 1 0 160 110"
          stroke="var(--color-signal)"
          strokeWidth={1.5}
          pathLength={1}
        />
        <path d="M 148 96 L 160 110 L 142 116" stroke="var(--color-signal)" strokeWidth={1.5} />
      </g>
    </svg>
  );
}
