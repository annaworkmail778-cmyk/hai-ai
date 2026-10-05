import { Bar, Canvas, Meter, Panel, Pill, T, palette } from "../primitives";

/** Cover — support inbox where AI drafts, cites and escalates. */
export function SupportInboxScene({ label }: { label?: string }) {
  const p = palette.dark;
  const threads: Array<[string, string, boolean?]> = [
    ["Where is my order?", "Delivery", true],
    ["Change billing address", "Billing"],
    ["Return a damaged item", "Returns"],
    ["Reset account access", "Account"],
    ["Invoice for March", "Billing"],
    ["Delivery to another city", "Delivery"],
  ];
  return (
    <Canvas label={label}>
      <Panel x={80} y={110} w={1440} h={780} p={p}>
        {/* Inbox list */}
        <rect x={0} y={0} width={400} height={780} rx={6} fill={p.panel2} />
        <T x={28} y={48} size={18} color={p.text} weight={500}>
          Inbox
        </T>
        <T x={372} y={48} size={11} color={p.mute} mono anchor="end">
          AI resolved · 64 today
        </T>
        {threads.map(([title, intent, active], i) => (
          <g key={title} transform={`translate(14 ${78 + i * 104})`}>
            <rect width={372} height={92} rx={4} fill={active ? p.raised : "transparent"} stroke={active ? p.line2 : "none"} />
            {active && <rect width={3} height={92} fill={p.accent} />}
            <T x={20} y={34} size={15} color={p.text} weight={500}>
              {title}
            </T>
            <Bar x={20} y={50} w={220} h={6} color={p.line2} />
            <Pill x={20} y={62} label={intent} p={p} tone={active ? "accent" : "default"} size={9} />
          </g>
        ))}

        {/* Conversation */}
        <g transform="translate(428 0)">
          <T x={10} y={48} size={18} color={p.text} weight={500}>
            Where is my order?
          </T>
          <line x1={0} x2={600} y1={78} y2={78} stroke={p.line} />
          <g transform="translate(10 106)">
            <rect width={460} height={104} rx={6} fill={p.panel2} />
            <T x={20} y={36} size={16} color={p.text}>
              Hi, I ordered a lamp last Monday and
            </T>
            <T x={20} y={62} size={16} color={p.text}>
              still have no tracking. Order #44120.
            </T>
            <T x={20} y={88} size={10} color={p.mute} mono>
              Customer · Telegram
            </T>
          </g>
          <g transform="translate(110 240)">
            <rect width={480} height={210} rx={6} fill="transparent" stroke={p.accent} strokeWidth={1.4} />
            <T x={20} y={34} size={10} color={p.accent} mono>
              AI draft · confidence high
            </T>
            {[
              "Thanks for your patience! Your order #44120",
              "left our warehouse yesterday. Tracking:",
              "TRK-80421 — expected delivery Thursday.",
            ].map((l, i) => (
              <T key={l} x={20} y={70 + i * 26} size={16} color={p.text}>
                {l}
              </T>
            ))}
            <T x={20} y={170} size={10} color={p.mute} mono>
              Sources · Order system · Delivery policy §3
            </T>
          </g>
          {["Send", "Edit", "Hand off"].map((b, i) => (
            <g key={b} transform={`translate(${110 + i * 132} 474)`}>
              <rect width={120} height={44} rx={3} fill={i === 0 ? p.solid : "transparent"} stroke={i === 0 ? p.solid : p.line2} />
              <T x={60} y={28} size={11} color={i === 0 ? p.bg : p.text} mono anchor="middle" weight={600}>
                {b}
              </T>
            </g>
          ))}
        </g>

        {/* Knowledge panel */}
        <g transform="translate(1056 0)">
          <line x1={0} x2={0} y1={0} y2={780} stroke={p.line} />
          <T x={30} y={48} size={11} color={p.mute} mono>
            Matched knowledge
          </T>
          {[
            ["Order status lookup", 0.96],
            ["Delivery policy §3", 0.88],
            ["Shipping partners", 0.61],
            ["Returns policy §2", 0.32],
          ].map(([k, v], i) => (
            <g key={k as string} transform={`translate(30 ${86 + i * 92})`}>
              <T x={0} y={20} size={15} color={p.text}>
                {k as string}
              </T>
              <T x={330} y={20} size={11} color={p.mute} mono anchor="end">
                {Math.round((v as number) * 100)}
              </T>
              <Meter x={0} y={38} w={330} value={v as number} p={p} accent={i === 0} />
            </g>
          ))}
          <line x1={30} x2={360} y1={470} y2={470} stroke={p.line} />
          <T x={30} y={506} size={11} color={p.mute} mono>
            Escalation rules
          </T>
          {["Refund over limit → human", "Angry sentiment → human", "Legal question → human"].map((r, i) => (
            <T key={r} x={30} y={544 + i * 34} size={14} color={p.text}>
              {r}
            </T>
          ))}
        </g>
      </Panel>
    </Canvas>
  );
}

/** Gallery — the knowledge base the assistant is grounded in. */
export function KnowledgeScene({ label }: { label?: string }) {
  const p = palette.light;
  const docs = ["Delivery policy", "Returns policy", "Warranty terms", "Product catalogue", "Order system", "Pricing rules"];
  return (
    <Canvas label={label}>
      {docs.map((d, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <Panel key={d} x={150 + col * 330} y={180 + row * 330} w={290} h={290} p={p} fill={i === 4 ? p.solid : p.raised} stroke={i === 4 ? p.solid : p.line}>
            <T x={26} y={44} size={10} color={i === 4 ? p.accent : p.mute} mono>
              {i === 4 ? "Live system" : "Document"}
            </T>
            <T x={26} y={86} size={21} color={i === 4 ? p.bg : p.text} weight={500}>
              {d}
            </T>
            {[0, 1, 2, 3, 4].map((l) => (
              <Bar key={l} x={26} y={124 + l * 22} w={[220, 190, 230, 160, 200][l]} h={7} color={i === 4 ? "#3a3a3a" : p.line} />
            ))}
            <T x={26} y={262} size={10} color={i === 4 ? p.faint : p.mute} mono>
              {i === 4 ? "Synced · real time" : "Indexed · v3"}
            </T>
          </Panel>
        );
      })}
      <Panel x={1170} y={260} w={330} h={480} p={p} fill={p.raised}>
        <T x={26} y={44} size={10} color={p.mute} mono>
          Answer quality
        </T>
        {[
          ["Grounded in sources", 0.94],
          ["Escalated correctly", 0.9],
          ["Tone consistency", 0.86],
        ].map(([k, v], i) => (
          <g key={k as string} transform={`translate(26 ${90 + i * 110})`}>
            <T x={0} y={18} size={14} color={p.text}>
              {k as string}
            </T>
            <Meter x={0} y={40} w={278} value={v as number} p={p} accent={i === 0} h={5} />
          </g>
        ))}
        <T x={26} y={430} size={11} color={p.mute} mono>
          Reviewed weekly by the team
        </T>
      </Panel>
    </Canvas>
  );
}
