import { Bars, Canvas, Chart, Panel, Pill, T, palette } from "../primitives";

/** Cover — the operations room: one live view of orders, stages and risk. */
export function OpsDashboardScene({ label }: { label?: string }) {
  const p = palette.dark;
  const kpis: Array<[string, string, boolean?]> = [
    ["Orders today", "128"],
    ["In production", "46"],
    ["At risk", "3", true],
    ["Avg. lead time", "2.4 d"],
  ];
  const throughput = [0.42, 0.48, 0.45, 0.56, 0.52, 0.6, 0.58, 0.63, 0.61, 0.7, 0.66, 0.74, 0.71, 0.78];
  const stages = [0.45, 0.62, 0.92, 0.38, 0.3];
  const rows: Array<[string, string, string, boolean?]> = [
    ["#44120", "Production", "Today"],
    ["#44117", "Quality check", "Today"],
    ["#44109", "Production", "Late · 1 d", true],
    ["#44102", "Delivery", "Tomorrow"],
    ["#44098", "Design", "Thu"],
  ];
  return (
    <Canvas label={label}>
      <Panel x={90} y={100} w={1420} h={800} p={p}>
        {/* Sidebar */}
        <rect x={0} y={0} width={200} height={800} rx={6} fill={p.panel2} />
        <rect x={26} y={30} width={10} height={10} fill={p.accent} />
        <T x={46} y={41} size={15} color={p.text} weight={600}>
          Operations
        </T>
        {["Overview", "Orders", "Production", "Inventory", "Delivery", "Reports"].map((n, i) => (
          <g key={n}>
            {i === 0 && <rect x={14} y={78 + i * 44} width={172} height={36} rx={3} fill={p.raised} />}
            <T x={30} y={102 + i * 44} size={13} color={i === 0 ? p.text : p.mute}>
              {n}
            </T>
          </g>
        ))}

        {/* KPIs */}
        {kpis.map(([k, v, risk], i) => (
          <g key={k} transform={`translate(${232 + i * 296} 32)`}>
            <rect width={276} height={128} rx={4} fill={p.panel2} stroke={risk ? p.accent : p.line} />
            <T x={22} y={36} size={10} color={risk ? p.accent : p.mute} mono>
              {k}
            </T>
            <T x={22} y={100} size={50} color={p.text} weight={500}>
              {v}
            </T>
          </g>
        ))}

        {/* Throughput */}
        <g transform="translate(232 186)">
          <rect width={720} height={300} rx={4} fill={p.panel2} stroke={p.line} />
          <T x={24} y={36} size={10} color={p.mute} mono>
            Throughput · 14 days
          </T>
          <Chart x={24} y={70} w={672} h={200} values={throughput} p={p} />
        </g>

        {/* Bottlenecks */}
        <g transform="translate(976 186)">
          <rect width={420} height={300} rx={4} fill={p.panel2} stroke={p.line} />
          <T x={24} y={36} size={10} color={p.mute} mono>
            Work in progress by stage
          </T>
          <Bars x={24} y={70} w={372} h={170} values={stages} p={p} highlight={2} />
          {["Intake", "Design", "Prod.", "QA", "Ship"].map((s, i) => (
            <T key={s} x={24 + i * 76.4 + 33} y={270} size={9} color={i === 2 ? p.accent : p.mute} mono anchor="middle">
              {s}
            </T>
          ))}
        </g>

        {/* Orders table */}
        <g transform="translate(232 510)">
          <rect width={1164} height={262} rx={4} fill={p.panel2} stroke={p.line} />
          {["Order", "Stage", "Owner", "Due"].map((h, i) => (
            <T key={h} x={24 + i * 290} y={36} size={10} color={p.mute} mono>
              {h}
            </T>
          ))}
          {rows.map(([id, stage, due, late], i) => (
            <g key={id} transform={`translate(0 ${56 + i * 40})`}>
              <line x1={0} x2={1164} y1={0} y2={0} stroke={p.line} />
              <T x={24} y={26} size={14} color={p.text} weight={500}>
                {id}
              </T>
              <Pill x={314} y={8} label={stage} p={p} tone={late ? "accent" : "default"} size={10} />
              <circle cx={614} cy={20} r={10} fill={p.raised} stroke={p.line2} />
              <T x={634} y={25} size={12} color={p.mute}>
                {["Team A", "Team B", "Team A", "Logistics", "Studio"][i]}
              </T>
              <T x={894} y={26} size={14} color={late ? p.accent : p.text}>
                {due}
              </T>
            </g>
          ))}
        </g>
      </Panel>
    </Canvas>
  );
}

/** Gallery — stage timeline: where each order is, and what is about to slip. */
export function OpsTimelineScene({ label }: { label?: string }) {
  const p = palette.light;
  const orders = [
    { id: "#44120", segs: [[0, 1.2], [1.2, 2.4], [2.4, 4.6]] },
    { id: "#44117", segs: [[0.4, 1.4], [1.4, 3.1], [3.1, 4.2]] },
    { id: "#44109", segs: [[0.2, 1.6], [1.6, 4.9]], late: true },
    { id: "#44102", segs: [[1, 2], [2, 3.4], [3.4, 5.4]] },
    { id: "#44098", segs: [[1.6, 3], [3, 5.6]] },
    { id: "#44091", segs: [[2.2, 3.8], [3.8, 6.1]] },
  ] as Array<{ id: string; segs: number[][]; late?: boolean }>;
  const dayW = 150;
  const x0 = 290;
  return (
    <Canvas label={label}>
      <Panel x={110} y={140} w={1380} h={720} p={p} fill={p.raised}>
        <T x={36} y={52} size={20} color={p.text} weight={500}>
          Production timeline
        </T>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <g key={d}>
            <T x={x0 - 110 + i * dayW + 120} y={110} size={11} color={p.mute} mono>
              {d}
            </T>
            <line x1={x0 + i * dayW} x2={x0 + i * dayW} y1={124} y2={660} stroke={p.line} />
          </g>
        ))}
        <line x1={x0 + 2.7 * dayW} x2={x0 + 2.7 * dayW} y1={120} y2={668} stroke={p.accent} strokeWidth={2} />
        <T x={x0 + 2.7 * dayW + 10} y={684} size={10} color={p.accent} mono>
          Now
        </T>
        {orders.map((o, i) => (
          <g key={o.id} transform={`translate(0 ${150 + i * 84})`}>
            <T x={36} y={34} size={15} color={p.text} weight={500}>
              {o.id}
            </T>
            {o.segs.map(([a, b], j) => (
              <rect
                key={j}
                x={x0 + a * dayW + 2}
                y={12}
                width={(b - a) * dayW - 4}
                height={34}
                rx={3}
                fill={o.late && j === o.segs.length - 1 ? p.accent : j === 0 ? p.solid : j === 1 ? p.mute : p.line2}
                opacity={j === 2 ? 0.9 : 1}
              />
            ))}
          </g>
        ))}
      </Panel>
      <Panel x={1150} y={90} w={360} h={150} p={p} fill={p.solid} stroke={p.solid}>
        <T x={26} y={42} size={10} color={p.accent} mono>
          Risk detected
        </T>
        <T x={26} y={82} size={18} color={p.bg} weight={500}>
          #44109 will miss Friday
        </T>
        <T x={26} y={112} size={12} color={p.faint}>
          Suggested: move to Line B tonight
        </T>
      </Panel>
    </Canvas>
  );
}
