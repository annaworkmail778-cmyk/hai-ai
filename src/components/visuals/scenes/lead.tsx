import { Bar, Canvas, Check, Meter, Panel, Pill, T, palette } from "../primitives";

const p = palette.dark;

type Card = { id: string; source: string; score: number; hot?: boolean };

const COLUMNS: Array<{ title: string; count: number; cards: Card[] }> = [
  {
    title: "New",
    count: 12,
    cards: [
      { id: "2094", source: "Website", score: 0.42 },
      { id: "2093", source: "Instagram", score: 0.61 },
      { id: "2091", source: "Call", score: 0.35 },
      { id: "2090", source: "WhatsApp", score: 0.54 },
      { id: "2088", source: "Website", score: 0.28 },
    ],
  },
  {
    title: "Qualified",
    count: 8,
    cards: [
      { id: "2081", source: "WhatsApp", score: 0.86, hot: true },
      { id: "2077", source: "Website", score: 0.74 },
      { id: "2072", source: "Call", score: 0.69 },
      { id: "2069", source: "Instagram", score: 0.71 },
    ],
  },
  {
    title: "Proposal",
    count: 5,
    cards: [
      { id: "2058", source: "Website", score: 0.82 },
      { id: "2051", source: "Referral", score: 0.77 },
      { id: "2047", source: "Call", score: 0.8 },
    ],
  },
  {
    title: "Won",
    count: 3,
    cards: [
      { id: "2033", source: "Website", score: 0.9 },
      { id: "2029", source: "WhatsApp", score: 0.88 },
    ],
  },
];

function LeadCard({ x, y, card }: { x: number; y: number; card: Card }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={236} height={108} rx={4} fill={p.panel2} stroke={card.hot ? p.accent : p.line} strokeWidth={card.hot ? 1.6 : 1.2} />
      <T x={16} y={30} size={15} color={p.text} weight={500}>
        Inquiry #{card.id}
      </T>
      <T x={220} y={30} size={10} color={p.mute} mono anchor="end">
        {card.source}
      </T>
      <Bar x={16} y={44} w={120} color={p.line2} h={6} />
      <T x={16} y={84} size={9} color={p.mute} mono>
        AI score
      </T>
      <T x={220} y={84} size={12} color={card.hot ? p.accent : p.text} weight={600} anchor="end">
        {Math.round(card.score * 100)}
      </T>
      <Meter x={16} y={92} w={204} value={card.score} p={p} accent={card.hot} />
    </g>
  );
}

/** Cover — unified lead pipeline with AI qualification. */
export function LeadPipelineScene({ label }: { label?: string }) {
  const sources = ["Website", "Instagram", "WhatsApp", "Calls"];
  return (
    <Canvas label={label}>
      {/* Channels converging into one inbox */}
      {sources.map((s, i) => {
        const y = 330 + i * 92;
        return (
          <g key={s}>
            <rect x={70} y={y - 5} width={8} height={8} fill={i === 2 ? p.accent : p.mute} />
            <T x={90} y={y + 3} size={12} color={p.mute} mono>
              {s}
            </T>
            <path d={`M190 ${y} C 230 ${y}, 225 470, 262 470`} fill="none" stroke={p.line2} strokeWidth={1.4} />
          </g>
        );
      })}

      <Panel x={262} y={150} w={1100} h={720} p={p}>
        {/* Top bar */}
        <rect x={24} y={22} width={10} height={10} fill={p.accent} />
        <T x={46} y={33} size={17} color={p.text} weight={600}>
          Pipeline
        </T>
        {["Inbox", "Pipeline", "Reports", "Automations"].map((tab, i) => (
          <g key={tab}>
            <T x={220 + i * 110} y={33} size={13} color={i === 1 ? p.text : p.mute}>
              {tab}
            </T>
            {i === 1 && <rect x={220} y={52} width={56} height={2} fill={p.text} />}
          </g>
        ))}
        <rect x={830} y={16} width={180} height={28} rx={14} fill={p.panel2} stroke={p.line} />
        <T x={848} y={34} size={11} color={p.faint} mono>
          Search leads
        </T>
        <circle cx={1040} cy={30} r={13} fill={p.raised} stroke={p.line2} />
        <circle cx={1066} cy={30} r={13} fill={p.raised} stroke={p.line2} />
        <line x1={0} x2={1100} y1={54} y2={54} stroke={p.line} />

        {/* Kanban */}
        {COLUMNS.map((col, c) => {
          const x = 24 + c * 266;
          return (
            <g key={col.title}>
              <T x={x} y={92} size={11} color={p.mute} mono>
                {col.title}
              </T>
              <T x={x + 236} y={92} size={11} color={p.text} mono anchor="end">
                {col.count}
              </T>
              <line x1={x} x2={x + 236} y1={104} y2={104} stroke={p.line} />
              {col.cards.map((card, i) => (
                <LeadCard key={card.id} x={x} y={120 + i * 120} card={card} />
              ))}
            </g>
          );
        })}
      </Panel>

      {/* AI qualification panel */}
      <Panel x={1190} y={392} w={350} h={420} p={p} fill={p.raised} stroke={p.line2}>
        <T x={24} y={38} size={11} color={p.mute} mono>
          AI qualification
        </T>
        <circle cx={316} cy={34} r={4} fill={p.accent} />
        <T x={24} y={78} size={20} color={p.text} weight={500}>
          Inquiry #2081
        </T>
        <T x={24} y={168} size={86} color={p.text} weight={500}>
          86
        </T>
        <T x={140} y={168} size={18} color={p.mute}>
          / 100
        </T>
        {["Budget range confirmed", "Decision maker on the call", "Start within 30 days"].map((r, i) => (
          <g key={r}>
            <Check x={24} y={204 + i * 36} color={p.accent} s={13} />
            <T x={50} y={216 + i * 36} size={14} color={p.text}>
              {r}
            </T>
          </g>
        ))}
        <rect x={24} y={340} width={302} height={52} rx={3} fill={p.accent} />
        <T x={44} y={372} size={12} color="#000" mono weight={600}>
          Assign to sales →
        </T>
      </Panel>

      <T x={262} y={930} size={11} color={p.mute} mono>
        01 — Unified inbox · AI qualification
      </T>
      <line x1={262} x2={560} y1={944} y2={944} stroke={p.line2} />
    </Canvas>
  );
}

/** Gallery — conversation with AI-drafted replies and extracted details. */
export function LeadConversationScene({ label }: { label?: string }) {
  const messages: Array<{ from: "client" | "ai"; lines: string[] }> = [
    { from: "client", lines: ["Hi! We need one place to track client", "requests — we lose some every week."] },
    { from: "ai", lines: ["Happy to help. Roughly how many requests", "do you get per week, and from where?"] },
    { from: "client", lines: ["About 150. Mostly Instagram and calls."] },
    { from: "ai", lines: ["Thank you — I've booked a 20-minute call", "with the team for Tuesday at 11:00."] },
  ];
  let y = 120;
  return (
    <Canvas label={label}>
      <Panel x={110} y={130} w={780} h={740} p={p}>
        <T x={28} y={44} size={18} color={p.text} weight={500}>
          Inquiry #2081
        </T>
        <Pill x={190} y={24} label="WhatsApp" p={p} />
        <line x1={0} x2={780} y1={72} y2={72} stroke={p.line} />
        {messages.map((m, i) => {
          const h = 30 + m.lines.length * 26;
          const w = 470;
          const x = m.from === "client" ? 28 : 780 - 28 - w;
          const top = y;
          y += h + 22;
          return (
            <g key={i} transform={`translate(${x} ${top})`}>
              <rect width={w} height={h} rx={6} fill={m.from === "client" ? p.panel2 : "transparent"} stroke={m.from === "ai" ? p.line2 : "none"} />
              {m.from === "ai" && <rect width={3} height={h} fill={p.accent} />}
              {m.lines.map((line, j) => (
                <T key={j} x={20} y={34 + j * 26} size={16} color={p.text}>
                  {line}
                </T>
              ))}
              {m.from === "ai" && (
                <T x={w} y={h + 18} size={9} color={p.mute} mono anchor="end">
                  AI draft · approved by sales
                </T>
              )}
            </g>
          );
        })}
        <rect x={28} y={660} width={724} height={52} rx={26} fill={p.panel2} stroke={p.line} />
        <T x={52} y={692} size={14} color={p.faint}>
          Reply…
        </T>
      </Panel>

      <Panel x={950} y={210} w={530} h={580} p={p} fill={p.raised} stroke={p.line2}>
        <T x={28} y={44} size={11} color={p.mute} mono>
          Extracted details
        </T>
        <Pill x={360} y={24} label="Qualified" p={p} tone="accent" />
        {[
          ["Need", "Request tracking system"],
          ["Volume", "~150 per week"],
          ["Channels", "Instagram, phone"],
          ["Timing", "This quarter"],
          ["Owner", "Sales team"],
          ["Next step", "Call · Tue 11:00"],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(28 ${92 + i * 76})`}>
            <line x1={0} x2={474} y1={0} y2={0} stroke={p.line} />
            <T x={0} y={32} size={10} color={p.mute} mono>
              {k}
            </T>
            <T x={0} y={58} size={18} color={i === 5 ? p.accent : p.text} weight={500}>
              {v}
            </T>
          </g>
        ))}
      </Panel>
      <T x={950} y={850} size={11} color={p.mute} mono>
        02 — Every conversation becomes structured data
      </T>
    </Canvas>
  );
}
