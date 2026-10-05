import { Bar, BrowserChrome, Canvas, Panel, Phone, T, palette, type SceneProps } from "../primitives";

/** Architectural elevation drawing used as the "hero image" inside the site mockups. */
function Elevation({ x, y, w, h, ink, accent }: { x: number; y: number; w: number; h: number; ink: string; accent: string }) {
  const floors = 9;
  const bays = 7;
  const fh = (h - 60) / floors;
  const bw = (w - 160) / bays;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill="#0c0c0c" />
      <g transform="translate(80 40)" stroke={ink} fill="none">
        <rect width={w - 160} height={h - 60} strokeWidth={1.4} />
        {Array.from({ length: floors - 1 }, (_, i) => (
          <line key={`f${i}`} x1={0} x2={w - 160} y1={(i + 1) * fh} y2={(i + 1) * fh} strokeWidth={1} opacity={0.6} />
        ))}
        {Array.from({ length: bays - 1 }, (_, i) => (
          <line key={`b${i}`} x1={(i + 1) * bw} x2={(i + 1) * bw} y1={0} y2={h - 60} strokeWidth={1} opacity={0.35} />
        ))}
        <rect x={bw * 3} y={fh * 5} width={bw} height={fh} fill={accent} stroke="none" opacity={0.9} />
      </g>
      <line x1={0} x2={w} y1={h - 20} y2={h - 20} stroke={ink} opacity={0.4} />
    </g>
  );
}

/** Cover — a corporate flagship site built as an editorial experience. */
export function EditorialSiteScene({ label, focus }: SceneProps) {
  const p = palette.light;
  return (
    <Canvas label={label} focus={focus}>
      <Panel x={110} y={110} w={1080} h={780} p={p} fill={p.raised}>
        <BrowserChrome w={1080} p={p} url="company.example" />
        {/* Site nav */}
        <g transform="translate(48 86)">
          <rect width={14} height={14} fill={p.solid} />
          <rect x={18} y={0} width={14} height={14} fill="none" stroke={p.solid} strokeWidth={1.5} />
          {["Projects", "Expertise", "Studio", "Contact"].map((n, i) => (
            <T key={n} x={560 + i * 110} y={12} size={12} color={p.text}>
              {n}
            </T>
          ))}
        </g>
        <T x={48} y={210} size={74} color={p.text} weight={500}>
          Engineering spaces
        </T>
        <T x={48} y={286} size={74} color={p.text} weight={500}>
          that last.
        </T>
        <T x={748} y={208} size={14} color={p.mute}>
          Design, engineering and delivery
        </T>
        <T x={748} y={230} size={14} color={p.mute}>
          for complex built environments.
        </T>
        <Elevation x={48} y={340} w={984} h={400} ink="#d8d6cf" accent={p.accent} />
        <T x={48} y={766} size={10} color={p.mute} mono>
          Scroll ↓
        </T>
      </Panel>

      <Phone x={1230} y={250} w={270} h={560} p={p}>
        <rect x={18} y={60} width={12} height={12} fill={p.solid} />
        <T x={18} y={128} size={34} color={p.text} weight={500}>
          Engineering
        </T>
        <T x={18} y={166} size={34} color={p.text} weight={500}>
          spaces that
        </T>
        <T x={18} y={204} size={34} color={p.text} weight={500}>
          last.
        </T>
        <Elevation x={0} y={238} w={254} h={220} ink="#d8d6cf" accent={p.accent} />
        <Bar x={18} y={482} w={150} h={8} color={p.line2} />
        <Bar x={18} y={500} w={110} h={8} color={p.line} />
      </Phone>

      <Panel x={70} y={760} w={300} h={170} p={p} fill={p.solid} stroke={p.solid}>
        <T x={26} y={110} size={92} color={p.bg} weight={500}>
          Aa
        </T>
        <T x={168} y={64} size={10} color={p.faint} mono>
          Display
        </T>
        <T x={168} y={86} size={10} color={p.faint} mono>
          120 / 0.92
        </T>
        <rect x={168} y={110} width={14} height={14} fill={p.accent} />
      </Panel>
    </Canvas>
  );
}

/** Gallery — the design system behind the experience. */
export function DesignSystemScene({ label, focus }: SceneProps) {
  const p = palette.dark;
  const swatches = ["#000000", "#111111", "#f3f2ee", "#ffffff", "#999999", "#ff5b14"];
  const scale: Array<[string, number]> = [
    ["Display", 76],
    ["Heading", 44],
    ["Title", 26],
    ["Body", 17],
    ["Label", 12],
  ];
  return (
    <Canvas label={label} focus={focus}>
      <Panel x={110} y={120} w={700} h={760} p={p}>
        <T x={36} y={56} size={11} color={p.mute} mono>
          Type scale
        </T>
        {scale.map(([name, size], i) => {
          const y = 130 + [0, 110, 200, 270, 320][i];
          return (
            <g key={name}>
              <T x={36} y={y + size * 0.4} size={size} color={p.text} weight={500} mono={name === "Label"}>
                {name === "Label" ? "Annotation" : "Clarity"}
              </T>
              <T x={664} y={y + 6} size={10} color={p.mute} mono anchor="end">
                {name} · {size}
              </T>
            </g>
          );
        })}
        <line x1={36} x2={664} y1={520} y2={520} stroke={p.line} />
        <T x={36} y={560} size={11} color={p.mute} mono>
          12-column grid
        </T>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={36 + i * 53} y={584} width={45} height={140} fill={i < 7 ? p.raised : "transparent"} stroke={p.line2} />
        ))}
      </Panel>

      <Panel x={850} y={120} w={640} h={360} p={p}>
        <T x={36} y={56} size={11} color={p.mute} mono>
          Colour
        </T>
        {swatches.map((c, i) => (
          <g key={c} transform={`translate(${36 + i * 96} 92)`}>
            <rect width={84} height={150} rx={3} fill={c} stroke={p.line2} />
            <T x={0} y={180} size={10} color={p.mute} mono>
              {c.replace("#", "")}
            </T>
          </g>
        ))}
      </Panel>

      <Panel x={850} y={520} w={640} h={360} p={p}>
        <T x={36} y={56} size={11} color={p.mute} mono>
          Components
        </T>
        <rect x={36} y={92} width={220} height={58} rx={2} fill={p.solid} />
        <T x={60} y={128} size={14} color={p.bg} weight={500}>
          Start a project →
        </T>
        <rect x={276} y={92} width={180} height={58} rx={2} fill="none" stroke={p.line2} />
        <T x={300} y={128} size={14} color={p.text} weight={500}>
          View work
        </T>
        <line x1={36} x2={600} y1={222} y2={222} stroke={p.line2} />
        <T x={36} y={210} size={16} color={p.faint}>
          Your company
        </T>
        <T x={36} y={196 - 30} size={10} color={p.mute} mono>
          Input
        </T>
        <rect x={36} y={262} width={56} height={30} rx={15} fill={p.accent} />
        <circle cx={77} cy={277} r={11} fill="#000" />
        <T x={110} y={283} size={14} color={p.text}>
          Reduced motion respected
        </T>
      </Panel>
    </Canvas>
  );
}
