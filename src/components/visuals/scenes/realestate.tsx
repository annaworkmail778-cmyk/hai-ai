import { Bar, Canvas, Panel, Phone, Pill, T, palette, type SceneProps } from "../primitives";

/* ── Shared data ───────────────────────────────────────────────── */

type Status = "available" | "reserved" | "sold";

/** Deterministic availability matrix: floors (top → bottom) × units. */
function matrix(floors: number, units: number): Status[][] {
  const rows: Status[][] = [];
  for (let f = 0; f < floors; f++) {
    const row: Status[] = [];
    for (let u = 0; u < units; u++) {
      // Integer hash: identical on server and client.
      let t = ((f + 1) * 73856093) ^ ((u + 1) * 19349663);
      t = Math.imul(t ^ (t >>> 13), 0x5bd1e995);
      const r = ((t ^ (t >>> 15)) >>> 0) / 4294967296;
      row.push(r < 0.42 ? "sold" : r < 0.62 ? "reserved" : "available");
    }
    rows.push(row);
  }
  return rows;
}

/* ── Floor plan drawing ────────────────────────────────────────── */

function FloorPlan({ x, y, ink, mute, accent }: { x: number; y: number; ink: string; mute: string; accent: string }) {
  const wall = (pts: Array<[number, number, number, number]>, w: number) =>
    pts.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={w} strokeLinecap="square" />);
  const win = (x1: number, y1: number, x2: number, y2: number) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1.2} />
      <line x1={x1 + (y1 === y2 ? 0 : 6)} y1={y1 + (y1 === y2 ? 6 : 0)} x2={x2 + (y1 === y2 ? 0 : 6)} y2={y2 + (y1 === y2 ? 6 : 0)} stroke={ink} strokeWidth={1.2} />
      <line x1={x1 - (y1 === y2 ? 0 : 6)} y1={y1 - (y1 === y2 ? 6 : 0)} x2={x2 - (y1 === y2 ? 0 : 6)} y2={y2 - (y1 === y2 ? 6 : 0)} stroke={ink} strokeWidth={1.2} />
    </g>
  );
  const door = (cx: number, cy: number, r: number, start: number) => {
    const a0 = (start * Math.PI) / 180;
    const a1 = ((start + 90) * Math.PI) / 180;
    return (
      <g>
        <line x1={cx} y1={cy} x2={cx + Math.cos(a0) * r} y2={cy + Math.sin(a0) * r} stroke={ink} strokeWidth={1.4} />
        <path d={`M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}`} fill="none" stroke={mute} strokeWidth={1} strokeDasharray="3 4" />
      </g>
    );
  };
  const room = (cx: number, cy: number, name: string, area: string, highlight = false) => (
    <g>
      <T x={cx} y={cy} size={11} color={highlight ? accent : mute} mono anchor="middle">
        {name}
      </T>
      <T x={cx} y={cy + 26} size={19} color={ink} weight={500} anchor="middle">
        {area}
      </T>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Living-room highlight */}
      <rect x={4} y={4} width={352} height={322} fill={accent} opacity={0.07} />
      {/* Outer walls */}
      {wall(
        [
          [0, 0, 60, 0],
          [300, 0, 395, 0],
          [495, 0, 565, 0],
          [665, 0, 700, 0],
          [700, 0, 700, 600],
          [0, 600, 30, 600],
          [140, 600, 195, 600],
          [255, 600, 700, 600],
          [0, 0, 0, 60],
          [0, 270, 0, 600],
        ],
        10,
      )}
      {win(60, 0, 300, 0)}
      {win(395, 0, 495, 0)}
      {win(565, 0, 665, 0)}
      {win(30, 600, 140, 600)}
      {win(0, 60, 0, 270)}
      {/* Interior walls */}
      {wall(
        [
          [140, 330, 220, 330],
          [320, 330, 380, 330],
          [440, 330, 550, 330],
          [610, 330, 700, 330],
          [360, 0, 360, 330],
          [530, 0, 530, 330],
          [170, 420, 170, 600],
          [280, 420, 300, 420],
          [360, 420, 470, 420],
          [530, 420, 590, 420],
          [650, 420, 700, 420],
          [280, 420, 280, 600],
          [450, 420, 450, 600],
          [570, 420, 570, 600],
        ],
        5,
      )}
      {door(380, 330, 60, -90)}
      {door(550, 330, 60, -90)}
      {door(300, 420, 60, 0)}
      {door(470, 420, 60, 0)}
      {door(590, 420, 60, 0)}
      {door(195, 600, 60, -90)}

      {room(180, 160, "Living", "38.4 m²", true)}
      {room(445, 160, "Bedroom", "18.2 m²")}
      {room(615, 160, "Bedroom", "18.2 m²")}
      {room(85, 470, "Kitchen", "14.9 m²")}
      {room(365, 515, "Bath", "9.9 m²")}
      {room(510, 515, "WC", "7.0 m²")}
      {room(635, 515, "Store", "7.6 m²")}

      {/* Dimension lines */}
      <g stroke={mute} strokeWidth={1}>
        <line x1={0} x2={700} y1={-46} y2={-46} />
        <line x1={0} x2={0} y1={-56} y2={-36} />
        <line x1={700} x2={700} y1={-56} y2={-36} />
        <line x1={-46} x2={-46} y1={0} y2={600} />
        <line x1={-56} x2={-36} y1={0} y2={0} />
        <line x1={-56} x2={-36} y1={600} y2={600} />
      </g>
      <rect x={322} y={-58} width={56} height={22} fill="var(--plan-bg, #e7e5de)" />
      <T x={350} y={-42} size={12} color={mute} mono anchor="middle">
        12.60
      </T>
      <T x={-60} y={305} size={12} color={mute} mono anchor="middle" transform="rotate(-90 -60 305)">
        10.80
      </T>
      {/* North arrow */}
      <g transform="translate(760 40)">
        <circle r={18} fill="none" stroke={mute} />
        <path d="M0 -14 L6 6 L0 2 L-6 6 Z" fill={ink} />
        <T x={0} y={40} size={10} color={mute} mono anchor="middle">
          N
        </T>
      </g>
    </g>
  );
}

/** Cover — floor plan with unit card and live availability. */
export function FloorplanScene({ label, focus }: SceneProps) {
  const p = palette.light;
  const grid = matrix(10, 6);
  return (
    <Canvas label={label} focus={focus}>
      <FloorPlan x={180} y={230} ink={p.solid} mute={p.mute} accent={p.accent} />

      <Panel x={1040} y={150} w={460} h={430} p={p} fill={p.raised}>
        <T x={30} y={46} size={11} color={p.mute} mono>
          Unit 7.04 · Building A
        </T>
        <Pill x={330} y={26} label="Available" p={p} tone="accent" />
        <T x={30} y={98} size={30} color={p.text} weight={500}>
          4-room residence
        </T>
        {[
          ["Floor", "7 of 12"],
          ["Area", "142.6 m²"],
          ["Rooms", "4"],
          ["Orientation", "South-west"],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(${30 + (i % 2) * 210} ${140 + Math.floor(i / 2) * 84})`}>
            <line x1={0} x2={190} y1={0} y2={0} stroke={p.line} />
            <T x={0} y={30} size={10} color={p.mute} mono>
              {k}
            </T>
            <T x={0} y={58} size={20} color={p.text} weight={500}>
              {v}
            </T>
          </g>
        ))}
        <rect x={30} y={346} width={196} height={52} rx={3} fill={p.solid} />
        <T x={128} y={378} size={12} color={p.bg} mono anchor="middle" weight={600}>
          Reserve unit
        </T>
        <rect x={238} y={346} width={192} height={52} rx={3} fill="none" stroke={p.line2} />
        <T x={334} y={378} size={12} color={p.text} mono anchor="middle">
          Book viewing
        </T>
      </Panel>

      <Panel x={1040} y={620} w={460} h={270} p={p}>
        <T x={30} y={40} size={11} color={p.mute} mono>
          Availability · Building A
        </T>
        {grid.map((row, f) =>
          row.map((s, u) => {
            const isUnit = f === 3 && u === 3;
            return (
              <rect
                key={`${f}-${u}`}
                x={30 + u * 66}
                y={62 + f * 19}
                width={58}
                height={13}
                rx={2}
                fill={isUnit ? p.accent : s === "sold" ? p.solid : s === "reserved" ? p.faint : "transparent"}
                stroke={isUnit ? p.accent : s === "available" ? p.line2 : "none"}
              />
            );
          }),
        )}
      </Panel>

      <T x={180} y={930} size={11} color={p.mute} mono>
        Plan · Unit 7.04 · 1:100
      </T>
      <line x1={180} x2={880} y1={944} y2={944} stroke={p.line2} />
    </Canvas>
  );
}

/** Gallery — the sales "chessboard": every unit, every status, live. */
export function UnitMatrixScene({ label, focus }: SceneProps) {
  const p = palette.dark;
  const floors = 14;
  const units = 8;
  const grid = matrix(floors, units);
  const counts = grid.flat().reduce(
    (acc, s) => ({ ...acc, [s]: acc[s] + 1 }),
    { available: 0, reserved: 0, sold: 0 } as Record<Status, number>,
  );
  const cellW = 92;
  const cellH = 34;
  return (
    <Canvas label={label} focus={focus}>
      <Panel x={110} y={110} w={1000} h={780} p={p}>
        <T x={32} y={50} size={18} color={p.text} weight={500}>
          Building A — availability
        </T>
        {["All", "3 rooms", "4 rooms", "Terrace"].map((f, i) => (
          <Pill key={f} x={430 + i * 128} y={30} label={f} p={p} tone={i === 2 ? "solid" : "default"} />
        ))}
        <line x1={0} x2={1000} y1={80} y2={80} stroke={p.line} />
        {grid.map((row, f) => (
          <g key={f}>
            <T x={32} y={130 + f * (cellH + 12)} size={11} color={p.mute} mono>
              {String(floors - f).padStart(2, "0")}
            </T>
            {row.map((s, u) => {
              const highlight = f === 7 && u === 3;
              return (
                <g key={u} transform={`translate(${80 + u * (cellW + 14)} ${108 + f * (cellH + 12)})`}>
                  <rect
                    width={cellW}
                    height={cellH}
                    rx={3}
                    fill={highlight ? p.accent : s === "sold" ? p.raised : "transparent"}
                    stroke={highlight ? p.accent : s === "reserved" ? p.mute : p.line2}
                    strokeDasharray={s === "reserved" && !highlight ? "4 4" : undefined}
                  />
                  <T x={12} y={22} size={11} color={highlight ? "#000" : s === "sold" ? p.faint : p.text} mono>
                    {`${floors - f}.${String(u + 1).padStart(2, "0")}`}
                  </T>
                </g>
              );
            })}
          </g>
        ))}
      </Panel>

      <Panel x={1160} y={230} w={340} h={540} p={p} fill={p.raised} stroke={p.line2}>
        <T x={28} y={44} size={11} color={p.mute} mono>
          Sales overview
        </T>
        {(
          [
            ["Available", counts.available, "outline"],
            ["Reserved", counts.reserved, "dashed"],
            ["Sold", counts.sold, "solid"],
          ] as const
        ).map(([k, v, style], i) => (
          <g key={k} transform={`translate(28 ${84 + i * 110})`}>
            <rect width={18} height={18} rx={2} fill={style === "solid" ? p.line2 : "transparent"} stroke={p.mute} strokeDasharray={style === "dashed" ? "3 3" : undefined} />
            <T x={32} y={14} size={11} color={p.mute} mono>
              {k}
            </T>
            <T x={0} y={74} size={52} color={p.text} weight={500}>
              {v}
            </T>
          </g>
        ))}
        <line x1={28} x2={312} y1={420} y2={420} stroke={p.line} />
        <T x={28} y={456} size={11} color={p.mute} mono>
          Selected
        </T>
        <T x={28} y={492} size={22} color={p.accent} weight={500}>
          Unit 7.04 · Hold 48 h
        </T>
      </Panel>
    </Canvas>
  );
}

/** Gallery — buyer journey on mobile: browse, inspect, book a viewing. */
export function RealEstatePhonesScene({ label, focus }: SceneProps) {
  const p = palette.light;
  const grid = matrix(5, 4);
  return (
    <Canvas label={label} focus={focus}>
      {/* Phone 1 — list */}
      <Phone x={230} y={190} p={p}>
        <T x={22} y={78} size={11} color={p.mute} mono>
          Building A
        </T>
        <T x={22} y={110} size={24} color={p.text} weight={500}>
          Residences
        </T>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(18 ${140 + i * 104})`}>
            <rect width={248} height={90} rx={8} fill={p.raised} stroke={p.line} />
            <rect x={10} y={10} width={70} height={70} rx={4} fill={p.panel2} />
            <path d="M20 22h50v46H20z M45 22v24 M20 46h25" fill="none" stroke={p.mute} strokeWidth={1.2} />
            <T x={94} y={34} size={14} color={p.text} weight={500}>
              {["Unit 7.04", "Unit 5.02", "Unit 9.01", "Unit 3.06"][i]}
            </T>
            <T x={94} y={56} size={10} color={p.mute} mono>
              {["4 rooms · 142.6 m²", "3 rooms · 96.0 m²", "2 rooms · 64.3 m²", "3 rooms · 98.4 m²"][i]}
            </T>
            <rect x={94} y={66} width={64} height={14} rx={7} fill={i === 0 ? p.accent : "transparent"} stroke={i === 0 ? p.accent : p.line2} />
          </g>
        ))}
      </Phone>

      {/* Phone 2 — unit */}
      <Phone x={650} y={140} p={p}>
        <rect x={0} y={56} width={284} height={230} fill={p.panel2} />
        <g transform="translate(36 84)" stroke={p.solid} fill="none">
          <rect width={212} height={176} strokeWidth={4} />
          <line x1={110} y1={0} x2={110} y2={96} strokeWidth={2.5} />
          <line x1={0} y1={96} x2={160} y2={96} strokeWidth={2.5} />
          <line x1={160} y1={96} x2={160} y2={176} strokeWidth={2.5} />
          <rect x={4} y={4} width={104} height={90} fill={p.accent} opacity={0.12} stroke="none" />
        </g>
        <T x={22} y={326} size={11} color={p.mute} mono>
          Unit 7.04 · Floor 7
        </T>
        <T x={22} y={360} size={24} color={p.text} weight={500}>
          4-room residence
        </T>
        {[
          ["Area", "142.6 m²"],
          ["View", "South-west"],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(${22 + i * 130} 392)`}>
            <T x={0} y={14} size={10} color={p.mute} mono>
              {k}
            </T>
            <T x={0} y={40} size={16} color={p.text} weight={500}>
              {v}
            </T>
          </g>
        ))}
        <rect x={22} y={500} width={240} height={50} rx={4} fill={p.solid} />
        <T x={142} y={531} size={12} color={p.bg} mono anchor="middle" weight={600}>
          Book a viewing
        </T>
      </Phone>

      {/* Phone 3 — confirmation */}
      <Phone x={1070} y={190} p={p}>
        <T x={22} y={78} size={11} color={p.mute} mono>
          Viewing booked
        </T>
        <circle cx={142} cy={170} r={44} fill="none" stroke={p.accent} strokeWidth={2} />
        <path d="M122 170 L137 185 L164 156" fill="none" stroke={p.accent} strokeWidth={3} />
        <T x={142} y={262} size={22} color={p.text} weight={500} anchor="middle">
          Thursday, 16:30
        </T>
        <T x={142} y={290} size={11} color={p.mute} mono anchor="middle">
          Sales office · Building A
        </T>
        <line x1={22} x2={262} y1={330} y2={330} stroke={p.line} />
        {grid.map((row, f) =>
          row.map((s, u) => (
            <rect
              key={`${f}-${u}`}
              x={52 + u * 46}
              y={352 + f * 22}
              width={38}
              height={14}
              rx={2}
              fill={f === 2 && u === 1 ? p.accent : s === "sold" ? p.solid : "transparent"}
              stroke={s === "available" ? p.line2 : "none"}
            />
          )),
        )}
        <Bar x={22} y={490} w={240} h={50} r={4} color={p.panel2} />
        <T x={142} y={521} size={12} color={p.text} mono anchor="middle">
          Add to calendar
        </T>
      </Phone>
    </Canvas>
  );
}
