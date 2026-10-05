import { Canvas, Check, Panel, Phone, Pill, T, palette, type SceneProps } from "../primitives";

type Slot = { day: number; start: number; dur: number; label: string; accent?: boolean; muted?: boolean };

const SLOTS: Slot[] = [
  { day: 0, start: 9, dur: 1, label: "Consultation" },
  { day: 0, start: 11, dur: 2, label: "Treatment" },
  { day: 0, start: 15, dur: 1, label: "Follow-up" },
  { day: 1, start: 10, dur: 1, label: "Consultation" },
  { day: 1, start: 12, dur: 1.5, label: "Treatment" },
  { day: 1, start: 16, dur: 1, label: "Consultation", muted: true },
  { day: 2, start: 9, dur: 2, label: "Treatment" },
  { day: 2, start: 12, dur: 1, label: "Waitlist fill", accent: true },
  { day: 2, start: 14, dur: 1, label: "Follow-up" },
  { day: 3, start: 10, dur: 1, label: "Consultation" },
  { day: 3, start: 14, dur: 2, label: "Treatment" },
  { day: 4, start: 9, dur: 1, label: "Follow-up" },
  { day: 4, start: 10.5, dur: 1, label: "New booking", accent: true },
  { day: 4, start: 13, dur: 2, label: "Treatment" },
  { day: 5, start: 10, dur: 1.5, label: "Consultation" },
  { day: 5, start: 12, dur: 1, label: "Follow-up", muted: true },
];

/** Cover — a week that books, confirms and reminds itself. */
export function CalendarScene({ label, focus }: SceneProps) {
  const p = palette.dark;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const x0 = 96;
  const y0 = 110;
  const colW = 150;
  const rowH = 62;
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);
  return (
    <Canvas label={label} focus={focus}>
      <Panel x={110} y={110} w={1040} h={790} p={p}>
        <T x={32} y={50} size={18} color={p.text} weight={500}>
          Week 41
        </T>
        <Pill x={150} y={30} label="All staff" p={p} />
        <T x={1008} y={50} size={11} color={p.mute} mono anchor="end">
          Auto-confirm · On
        </T>
        <line x1={0} x2={1040} y1={80} y2={80} stroke={p.line} />
        {days.map((d, i) => (
          <T key={d} x={x0 + i * colW + 14} y={y0 - 4} size={11} color={i === 4 ? p.text : p.mute} mono>
            {d} · {14 + i}
          </T>
        ))}
        {hours.map((h, i) => (
          <g key={h}>
            <T x={32} y={y0 + 24 + i * rowH} size={11} color={p.faint} mono>
              {`${h}:00`}
            </T>
            <line x1={x0} x2={x0 + colW * 6} y1={y0 + 12 + i * rowH} y2={y0 + 12 + i * rowH} stroke={p.line} />
          </g>
        ))}
        {days.map((_, i) => (
          <line key={i} x1={x0 + i * colW} x2={x0 + i * colW} y1={y0 + 12} y2={y0 + 12 + rowH * 10} stroke={p.line} />
        ))}
        {SLOTS.map((s, i) => {
          const x = x0 + s.day * colW + 6;
          const y = y0 + 14 + (s.start - 9) * rowH;
          const h = s.dur * rowH - 6;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect width={colW - 12} height={h} rx={3} fill={s.accent ? p.accent : s.muted ? "transparent" : p.raised} stroke={s.accent ? p.accent : p.line2} strokeDasharray={s.muted ? "4 4" : undefined} />
              <T x={12} y={22} size={12} color={s.accent ? "#000" : s.muted ? p.mute : p.text} weight={500}>
                {s.label}
              </T>
              {h > 50 && (
                <T x={12} y={42} size={9} color={s.accent ? "#000" : p.mute} mono>
                  {`${Math.floor(s.start)}:${s.start % 1 ? "30" : "00"}`}
                </T>
              )}
            </g>
          );
        })}
        {/* Now line */}
        <line x1={x0 + colW * 4} x2={x0 + colW * 5} y1={y0 + 12 + 3.4 * rowH} y2={y0 + 12 + 3.4 * rowH} stroke={p.accent} strokeWidth={2} />
        <circle cx={x0 + colW * 4} cy={y0 + 12 + 3.4 * rowH} r={5} fill={p.accent} />
      </Panel>

      {[
        { k: "Confirmed automatically", v: "New booking · Fri 10:30", accent: true },
        { k: "Reminder sent", v: "Treatment · Thu 14:00" },
        { k: "Rescheduled by client", v: "Moved to Tue 16:00" },
        { k: "Waitlist filled", v: "Wed 12:00 · Slot reused" },
      ].map((n, i) => (
        <Panel key={n.k} x={1190} y={190 + i * 150} w={330} h={118} p={p} fill={p.raised} stroke={n.accent ? p.accent : p.line2}>
          <T x={24} y={38} size={10} color={n.accent ? p.accent : p.mute} mono>
            {n.k}
          </T>
          <T x={24} y={76} size={17} color={p.text} weight={500}>
            {n.v}
          </T>
          <Check x={290} y={66} color={n.accent ? p.accent : p.mute} s={14} />
        </Panel>
      ))}
    </Canvas>
  );
}

/** Gallery — three-step booking on mobile. */
export function BookingPhonesScene({ label, focus }: SceneProps) {
  const p = palette.light;
  const times = ["9:30", "10:30", "11:00", "13:30", "15:00", "16:30"];
  return (
    <Canvas label={label} focus={focus}>
      <Phone x={220} y={190} p={p}>
        <T x={22} y={78} size={11} color={p.mute} mono>
          Step 1 of 3
        </T>
        <T x={22} y={112} size={24} color={p.text} weight={500}>
          Choose a service
        </T>
        {["Consultation", "Treatment", "Follow-up", "Check-up"].map((s, i) => (
          <g key={s} transform={`translate(18 ${142 + i * 92})`}>
            <rect width={248} height={78} rx={8} fill={i === 1 ? p.raised : "transparent"} stroke={i === 1 ? p.solid : p.line} strokeWidth={i === 1 ? 1.6 : 1.2} />
            <T x={18} y={34} size={16} color={p.text} weight={500}>
              {s}
            </T>
            <T x={18} y={58} size={10} color={p.mute} mono>
              {["30 min", "60 min", "20 min", "45 min"][i]}
            </T>
          </g>
        ))}
      </Phone>

      <Phone x={650} y={140} p={p}>
        <T x={22} y={78} size={11} color={p.mute} mono>
          Step 2 of 3
        </T>
        <T x={22} y={112} size={24} color={p.text} weight={500}>
          Friday, 18 Oct
        </T>
        <g transform="translate(22 140)">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <g key={i} transform={`translate(${i * 35} 0)`}>
              <T x={14} y={12} size={10} color={p.mute} mono anchor="middle">
                {d}
              </T>
              <rect x={0} y={22} width={28} height={28} rx={14} fill={i === 4 ? p.solid : "transparent"} />
              <T x={14} y={41} size={12} color={i === 4 ? p.bg : p.text} anchor="middle">
                {14 + i}
              </T>
            </g>
          ))}
        </g>
        {times.map((t, i) => (
          <g key={t} transform={`translate(${22 + (i % 2) * 124} ${222 + Math.floor(i / 2) * 70})`}>
            <rect width={116} height={54} rx={6} fill={i === 1 ? p.accent : "transparent"} stroke={i === 1 ? p.accent : p.line2} />
            <T x={58} y={33} size={15} color={i === 1 ? "#000" : p.text} anchor="middle" weight={500}>
              {t}
            </T>
          </g>
        ))}
        <rect x={22} y={500} width={240} height={50} rx={4} fill={p.solid} />
        <T x={142} y={531} size={12} color={p.bg} mono anchor="middle" weight={600}>
          Continue
        </T>
      </Phone>

      <Phone x={1080} y={190} p={p}>
        <T x={22} y={78} size={11} color={p.mute} mono>
          Confirmed
        </T>
        <circle cx={142} cy={176} r={46} fill="none" stroke={p.accent} strokeWidth={2} />
        <path d="M120 176 L136 192 L165 160" fill="none" stroke={p.accent} strokeWidth={3} />
        <T x={142} y={268} size={22} color={p.text} weight={500} anchor="middle">
          Fri, 10:30
        </T>
        <T x={142} y={296} size={11} color={p.mute} mono anchor="middle">
          Treatment · 60 min
        </T>
        {["Reminder 24 h before", "Reminder 2 h before", "Reschedule anytime"].map((r, i) => (
          <g key={r} transform={`translate(22 ${340 + i * 46})`}>
            <Check x={0} y={0} color={p.solid} s={13} />
            <T x={26} y={12} size={14} color={p.text}>
              {r}
            </T>
          </g>
        ))}
      </Phone>
    </Canvas>
  );
}
