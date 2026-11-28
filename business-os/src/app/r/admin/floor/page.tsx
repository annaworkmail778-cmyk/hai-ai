"use client";
/* Floor plan editor (manager): drag tables, change seats / shape, mark a table unavailable. One event per drop. */
import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Guard } from "@/components/restaurant/staff/shell";
import { Button, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { AREA_HY } from "@/lib/restaurant/staff-i18n";
import type { AreaId } from "@/lib/restaurant/types";

export default function FloorEditor() {
  const { state, dispatch } = useR();
  const [area, setArea] = useState<AreaId>("hall");
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const [reason, setReason] = useState("");
  const svg = useRef<SVGSVGElement>(null);
  const ar = state.areas.find((a) => a.id === area)!;
  const t = sel ? state.tables.find((x) => x.id === sel) : undefined;
  const busy = (id: string) => state.sessions.some((x) => x.status === "open" && (x.tableId === id || x.mergedTables?.includes(id)));
  const pt = (e: React.PointerEvent) => { const m = svg.current!.getScreenCTM()!.inverse(); const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return { x: p.x, y: p.y }; };

  return (
    <Guard perm="floor.edit">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div><h1 className="text-[22px] font-semibold tracking-tight">Սրահի պլան</h1><p className="text-[13px] text-muted">Քաշեք սեղանները՝ տեղը փոխելու համար։ Փոփոխությունը միանգամից երևում է մատուցողի և հոստեսի էկրաններին։</p></div>
          <div className="ml-auto flex gap-1">{state.areas.map((a) => <button key={a.id} onClick={() => { setArea(a.id); setSel(null); }} className={cn("h-9 rounded-lg px-3 text-[13px] font-medium", area === a.id ? "bg-ink text-white" : "border border-line bg-surface")}>{AREA_HY[a.id]}{!a.open && " ·  փակ"}</button>)}</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-line bg-surface p-3">
            <svg ref={svg} viewBox={`0 0 ${ar.w} ${ar.h}`} className="h-auto w-full touch-none select-none" role="img" aria-label={`${AREA_HY[area]} · խմբագրում`}
              onPointerMove={(e) => { if (!drag) return; const p = pt(e); setDrag({ ...drag, x: p.x - drag.dx, y: p.y - drag.dy }); }}
              onPointerUp={() => { if (drag) { dispatch({ type: "table.layout", tableId: drag.id, x: drag.x, y: drag.y }); setDrag(null); } }}>
              <defs><pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="var(--color-line)" strokeWidth="0.12" /></pattern></defs>
              <rect width={ar.w} height={ar.h} fill="url(#grid)" />
              {state.tables.filter((x) => x.areaId === area).map((x) => {
                const pos = drag?.id === x.id ? { x: drag.x, y: drag.y } : { x: x.x, y: x.y };
                const cls = cn(sel === x.id ? "fill-[var(--color-signal-soft)] stroke-[var(--color-signal)]" : x.blocked ? "fill-[#e4e3df] stroke-[var(--color-faint)]" : "fill-white stroke-[var(--color-ink-2)]");
                return (
                  <g key={x.id} className="cursor-grab" tabIndex={0} role="button" aria-label={`Սեղան ${x.label}`}
                    onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); const p = pt(e); setSel(x.id); setReason(x.blocked ?? ""); setDrag({ id: x.id, dx: p.x - x.x, dy: p.y - x.y, x: x.x, y: x.y }); }}
                    onKeyDown={(e) => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (d) { e.preventDefault(); dispatch({ type: "table.layout", tableId: x.id, x: x.x + d[0], y: x.y + d[1] }); } if (e.key === "Enter") setSel(x.id); }}>
                    {x.shape === "round" ? <ellipse cx={pos.x + x.w / 2} cy={pos.y + x.h / 2} rx={x.w / 2} ry={x.h / 2} className={cls} strokeWidth="0.45" strokeDasharray={x.blocked ? "1 0.8" : undefined} />
                      : <rect x={pos.x} y={pos.y} width={x.w} height={x.h} rx="1.5" className={cls} strokeWidth="0.45" strokeDasharray={x.blocked ? "1 0.8" : undefined} />}
                    <text x={pos.x + x.w / 2} y={pos.y + x.h / 2 + 0.4} textAnchor="middle" fontSize="3.2" fontWeight="700" className="pointer-events-none fill-[var(--color-ink)]">{x.label}</text>
                    <text x={pos.x + x.w / 2} y={pos.y + x.h / 2 + 3.6} textAnchor="middle" fontSize="2.1" className="pointer-events-none fill-[var(--color-muted)]">{x.seats} տեղ</text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-2 text-[12px] text-muted">Ստեղնաշարով՝ ընտրեք սեղանը (Tab) և տեղափոխեք սլաքներով։</p>
          </div>
          <aside className="rounded-2xl border border-line bg-surface p-4">
            {!t ? <p className="text-[13px] text-muted">Ընտրեք սեղան։</p> : (
              <div className="space-y-4">
                <div><div className="text-[20px] font-bold">Սեղան {t.label}</div><div className="text-[13px] text-muted">{AREA_HY[t.areaId]} · {busy(t.id) ? "Զբաղված է" : "Ազատ"}</div></div>
                <div>
                  <div className="mb-1 text-[12.5px] font-semibold text-muted">Տեղերի քանակ</div>
                  <div className="flex items-center gap-2"><Button size="sm" variant="secondary" onClick={() => dispatch({ type: "table.layout", tableId: t.id, seats: t.seats - 1 })}>−</Button><span className="tnum w-8 text-center text-[18px] font-semibold">{t.seats}</span><Button size="sm" variant="secondary" onClick={() => dispatch({ type: "table.layout", tableId: t.id, seats: t.seats + 1 })}>+</Button></div>
                </div>
                <div>
                  <div className="mb-1 text-[12.5px] font-semibold text-muted">Ձև</div>
                  <div className="flex gap-2">{(["round", "rect"] as const).map((sh) => <Button key={sh} size="sm" variant={t.shape === sh ? "primary" : "secondary"} onClick={() => dispatch({ type: "table.layout", tableId: t.id, shape: sh })}>{sh === "round" ? "Կլոր" : "Ուղղանկյուն"}</Button>)}</div>
                </div>
                <div>
                  <div className="mb-1 text-[12.5px] font-semibold text-muted">Միավորվող սեղաններ</div>
                  <p className="text-[13px]">{t.combinableWith?.length ? t.combinableWith.map((id) => state.tables.find((x) => x.id === id)?.label).join(", ") : "—"}</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <div className="mb-1 text-[12.5px] font-semibold text-muted">Հասանելիություն</div>
                  {t.blocked ? <>
                    <p className="text-[13px]">Անհասանելի է՝ {t.blocked}</p>
                    <Button size="sm" variant="ok" className="mt-2" icon="check" onClick={() => dispatch({ type: "table.block", tableId: t.id, reason: null })}>Դարձնել հասանելի</Button>
                  </> : <>
                    <input className="h-10 w-full rounded-lg border border-line-2 px-3 text-[13px]" placeholder="Պատճառ (օր.՝ նորոգում)" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <Button size="sm" variant="secondary" className="mt-2" disabled={!reason.trim() || busy(t.id)} title={busy(t.id) ? "Սեղանին հյուրեր կան" : undefined} onClick={() => dispatch({ type: "table.block", tableId: t.id, reason })}><Icon name="x" size={14} />Անհասանելի</Button>
                  </>}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Guard>
  );
}
