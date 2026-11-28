"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NewReservationModal, ReservationDrawer, SourceBadge, StatusBadge } from "@/components/admin/reservation";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Button, Card, cn, Empty, Input, Select, Tabs } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { diffDays } from "@/lib/dates";
import { amd, dShort, SOURCE_LABEL, stamp, time } from "@/lib/format";
import { roomType } from "@/lib/hotel-data";
import type { ResStatus, Source } from "@/lib/types";

type Tab = "all" | "inquiry" | "upcoming" | "inhouse" | "past" | "closed";

export default function Reservations() {
  const { state } = useDemo();
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get("status") as Tab) === "inquiry" ? "inquiry" : "upcoming");
  const [q, setQ] = useState("");
  const [src, setSrc] = useState<"" | Source>("");
  const [open, setOpen] = useState<string | null>(sp.get("open"));
  const [newRes, setNewRes] = useState(sp.get("new") === "1");
  const [limit, setLimit] = useState(40);
  useEffect(() => { if (sp.get("open")) setOpen(sp.get("open")); }, [sp]);
  const today = state.baseDate;
  const match: Record<Tab, (s: ResStatus, r: { checkIn: string; checkOut: string }) => boolean> = {
    all: () => true,
    inquiry: (s) => s === "inquiry",
    upcoming: (s, r) => s === "confirmed" && r.checkIn >= today,
    inhouse: (s) => s === "checked_in",
    past: (s) => s === "checked_out" || s === "no_show",
    closed: (s) => s === "declined" || s === "cancelled",
  };
  const guests = useMemo(() => new Map(state.guests.map((g) => [g.id, g])), [state.guests]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = state.reservations.filter((r) => match[tab](r.status, r) && (!src || r.source === src));
    if (needle) list = list.filter((r) => { const g = guests.get(r.guestId); return [r.code, g?.firstName, g?.lastName, g?.phone, r.roomId].join(" ").toLowerCase().includes(needle); });
    if (tab === "upcoming") list = [...list].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    if (tab === "past") list = [...list].sort((a, b) => b.checkOut.localeCompare(a.checkOut));
    return list;
  }, [state.reservations, tab, q, src, guests]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = (t: Tab) => state.reservations.filter((r) => match[t](r.status, r)).length;
  return (
    <>
      <PageTitle title="Ամրագրումներ" sub="Բոլոր ալիքների հարցումներն ու ամրագրումները մեկ ցուցակում" right={<Button variant="primary" icon="plus" onClick={() => setNewRes(true)}>Նոր ամրագրում</Button>} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tabs value={tab} onChange={(t) => { setTab(t); setLimit(40); }} items={[
          { id: "inquiry", label: "Հարցումներ", count: count("inquiry") }, { id: "upcoming", label: "Առաջիկա", count: count("upcoming") }, { id: "inhouse", label: "Հյուրանոցում", count: count("inhouse") },
          { id: "past", label: "Ավարտված" }, { id: "closed", label: "Մերժված / չեղարկված" }, { id: "all", label: "Բոլորը" },
        ]} />
        <div className="relative min-w-52 flex-1"><Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Որոնել՝ անուն, կոդ, հեռախոս, սենյակ" className="pl-9" /></div>
        <Select value={src} onChange={(e) => setSrc(e.target.value as Source | "")} className="max-w-64"><option value="">Բոլոր աղբյուրները</option>{(Object.keys(SOURCE_LABEL) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}</Select>
      </div>
      <Card pad={false} className="overflow-hidden">
        <div className="hidden grid-cols-[110px_1.4fr_1.2fr_1fr_110px_120px_130px_120px] gap-3 border-b border-line bg-paper/60 px-4 py-2.5 text-[12px] font-medium text-muted lg:grid">
          <span>Կոդ</span><span>Հյուր</span><span>Ամսաթվեր</span><span>Սենյակ</span><span>Հյուրեր</span><span>Աղբյուր</span><span className="text-right">Գումար</span><span>Կարգավիճակ</span>
        </div>
        {rows.length === 0 && <div className="p-6"><Empty icon="search" title="Արդյունք չկա" text="Փոխեք ֆիլտրը կամ որոնումը" /></div>}
        <ul className="divide-y divide-line">
          {rows.slice(0, limit).map((r) => {
            const g = guests.get(r.guestId);
            return (
              <li key={r.id}>
                <button onClick={() => setOpen(r.id)} className={cn("grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 text-left text-[13.5px] transition hover:bg-paper lg:grid-cols-[110px_1.4fr_1.2fr_1fr_110px_120px_130px_120px] lg:items-center", r.status === "inquiry" && "bg-warn-soft/30")}>
                  <span className="tnum hidden font-medium text-muted lg:block">{r.code}</span>
                  <span className="min-w-0"><span className="block truncate font-medium">{g?.firstName} {g?.lastName}</span><span className="flex items-center gap-1 text-[12px] text-faint">{stamp(r.displayAt ?? r.createdAt, today)}{r.afterHours && <Icon name="moon" size={12} className="text-violet" />}</span></span>
                  <span className="lg:hidden"><StatusBadge s={r.status} /></span>
                  <span className="text-muted lg:text-ink">{dShort(r.checkIn)} → {dShort(r.checkOut)} <span className="text-faint">· {diffDays(r.checkIn, r.checkOut)} գ.</span></span>
                  <span className="hidden truncate lg:block">{roomType(r.typeId).name.hy}<span className="text-muted">{r.roomId ? ` · ${r.roomId}` : ""}</span></span>
                  <span className="hidden text-muted lg:block">{r.adults}{r.children ? ` + ${r.children}` : ""}</span>
                  <span className="hidden lg:block"><SourceBadge s={r.source} /></span>
                  <span className="tnum hidden text-right font-medium lg:block">{amd(r.total)}</span>
                  <span className="hidden lg:block"><StatusBadge s={r.status} /></span>
                </button>
              </li>
            );
          })}
        </ul>
        {rows.length > limit && <div className="border-t border-line p-3 text-center"><Button size="sm" onClick={() => setLimit(limit + 60)}>Ցույց տալ ավելին ({rows.length - limit})</Button></div>}
      </Card>
      <p className="mt-3 text-[12px] text-faint">Ցուցադրական տվյալներ։ Գները հաշվարկվում են հյուրանոցի գնացուցակից (սեզոն, հանգստյան օրեր)։ {rows.length} գրառում · վերջին թարմացում {time(Date.now())}</p>
      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
      <NewReservationModal open={newRes} onClose={() => setNewRes(false)} />
    </>
  );
}
