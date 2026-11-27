"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ReservationDrawer, StatusBadge } from "@/components/admin/reservation";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Avatar, Badge, Button, Card, Drawer, Empty, Input, Select, Textarea } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { diffDays } from "@/lib/dates";
import { amd, dShort, LANG_LABEL, stamp } from "@/lib/format";
import { roomType } from "@/lib/hotel-data";

export default function Guests() {
  const { state, dispatch } = useDemo();
  const sp = useSearchParams();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("");
  const [open, setOpen] = useState<string | null>(sp.get("open"));
  const [resOpen, setResOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [limit, setLimit] = useState(40);
  useEffect(() => { if (sp.get("open")) setOpen(sp.get("open")); }, [sp]);
  const stats = useMemo(() => {
    const m = new Map<string, { stays: number; nights: number; spent: number; last?: string; upcoming: number }>();
    for (const r of state.reservations) {
      const s = m.get(r.guestId) ?? { stays: 0, nights: 0, spent: 0, upcoming: 0 };
      if (r.status === "checked_out" || r.status === "checked_in") { s.stays++; s.nights += diffDays(r.checkIn, r.checkOut); s.spent += r.total; if (!s.last || r.checkIn > s.last) s.last = r.checkIn; }
      if (r.status === "confirmed") s.upcoming++;
      m.set(r.guestId, s);
    }
    return m;
  }, [state.reservations]);
  const list = state.guests.filter((g) => {
    const s = stats.get(g.id);
    if (!s || (s.stays === 0 && s.upcoming === 0 && !state.reservations.some((r) => r.guestId === g.id))) return false;
    if (seg === "repeat" && (s.stays ?? 0) < 2) return false;
    if (seg === "upcoming" && !s.upcoming) return false;
    if (seg === "vip" && !g.tags.includes("VIP")) return false;
    const n = q.trim().toLowerCase();
    return !n || `${g.firstName} ${g.lastName} ${g.phone} ${g.email}`.toLowerCase().includes(n);
  }).sort((a, b) => (stats.get(b.id)?.last ?? "").localeCompare(stats.get(a.id)?.last ?? ""));
  const g = state.guests.find((x) => x.id === open);
  const gs = g ? stats.get(g.id) : undefined;
  const repeatShare = (() => { const all = [...stats.values()].filter((s) => s.stays > 0); return all.length ? all.filter((s) => s.stays >= 2).length / all.length : 0; })();
  return (
    <>
      <PageTitle title="Հյուրեր (CRM)" sub={`Հյուրերի պրոֆիլներ, նախընտրություններ և պատմություն · կրկնվող հյուրեր՝ ${Math.round(repeatShare * 100)}%`} />
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1"><Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Որոնել՝ անուն, հեռախոս, էլ. փոստ" className="pl-9" /></div>
        <Select value={seg} onChange={(e) => setSeg(e.target.value)} className="max-w-64"><option value="">Բոլոր հյուրերը</option><option value="repeat">Կրկնվող հյուրեր</option><option value="upcoming">Առաջիկա ժամանում</option><option value="vip">VIP</option></Select>
      </div>
      <Card pad={false}>
        <ul className="divide-y divide-line">
          {list.slice(0, limit).map((x) => {
            const s = stats.get(x.id)!;
            return (
              <li key={x.id}><button onClick={() => setOpen(x.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper">
                <Avatar initials={`${x.firstName[0]}${x.lastName[0] ?? ""}`} />
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-medium">{x.firstName} {x.lastName}</div><div className="truncate text-[12.5px] text-muted">{x.phone} · {LANG_LABEL[x.lang]} · {x.country}</div></div>
                <div className="hidden flex-wrap justify-end gap-1 sm:flex">{x.tags.slice(0, 2).map((t) => <Badge key={t} tone={t === "VIP" ? "signal" : t === "Կրկնվող հյուր" ? "info" : "neutral"}>{t}</Badge>)}</div>
                <div className="hidden w-28 text-right text-[12.5px] text-muted md:block"><div className="tnum text-ink">{s.stays} կեցություն</div>{s.last ? `վերջինը՝ ${dShort(s.last)}` : "—"}</div>
                <div className="tnum hidden w-28 text-right text-[13px] font-medium lg:block">{amd(s.spent)}</div>
              </button></li>
            );
          })}
        </ul>
        {list.length > limit && <div className="border-t border-line p-3 text-center"><Button size="sm" onClick={() => setLimit(limit + 60)}>Ցույց տալ ավելին</Button></div>}
        {!list.length && <div className="p-6"><Empty icon="users" title="Հյուր չի գտնվել" /></div>}
      </Card>
      <Drawer open={!!g} onClose={() => setOpen(null)} wide title={g ? `${g.firstName} ${g.lastName}` : ""} sub={g ? `${LANG_LABEL[g.lang]} · ${g.country}` : ""}>
        {g && gs && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Կեցություններ", gs.stays], ["Գիշերներ", gs.nights], ["Ծախսված", amd(gs.spent)], ["Միջին գիշեր", gs.nights ? amd(gs.spent / gs.nights) : "—"]].map(([k, v]) => <div key={String(k)} className="rounded-xl bg-paper p-3"><div className="text-[12px] text-muted">{k}</div><div className="tnum mt-1 text-[16px] font-semibold">{v}</div></div>)}
            </div>
            <section className="rounded-xl border border-line p-4 text-[13px]">
              <div className="mb-2 font-semibold">Կոնտակտներ</div>
              <div className="flex items-center gap-2"><Icon name="phone" size={15} className="text-muted" />{g.phone}</div>
              <div className="mt-1 flex items-center gap-2"><Icon name="mail" size={15} className="text-muted" />{g.email || "—"}</div>
              <div className="mt-3 flex flex-wrap gap-1">{g.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            </section>
            <section className="rounded-xl border border-line p-4 text-[13px]">
              <div className="mb-2 font-semibold">Նախընտրություններ և խնդրանքներ</div>
              {g.preferences.length ? <ul className="flex flex-wrap gap-1.5">{g.preferences.map((p) => <li key={p} className="rounded-lg bg-paper px-2.5 py-1">{p}</li>)}</ul> : <div className="text-muted">Դեռ գրանցված չեն</div>}
              {state.reservations.filter((r) => r.guestId === g.id && r.requests).map((r) => <div key={r.id} className="mt-2 text-muted">«{r.requests}» · {dShort(r.checkIn)}</div>)}
            </section>
            <section>
              <div className="mb-2 text-[13px] font-semibold">Կեցությունների պատմություն</div>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {state.reservations.filter((r) => r.guestId === g.id).sort((a, b) => b.checkIn.localeCompare(a.checkIn)).map((r) => (
                  <li key={r.id}><button onClick={() => setResOpen(r.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] hover:bg-paper"><span className="flex-1">{dShort(r.checkIn)} – {dShort(r.checkOut)} · {roomType(r.typeId).name.hy}{r.roomId ? ` · ${r.roomId}` : ""}</span><span className="tnum text-muted">{amd(r.total)}</span><StatusBadge s={r.status} /></button></li>
                ))}
              </ul>
            </section>
            {state.conversations.filter((c) => c.reservationId && state.reservations.find((r) => r.id === c.reservationId)?.guestId === g.id).map((c) => (
              <section key={c.id} className="rounded-xl border border-line p-4 text-[13px]"><div className="mb-1 flex items-center gap-1.5 font-semibold"><Icon name="sparkles" size={14} className="text-signal" />Զրույց օգնականի հետ · {stamp(c.displayAt ?? c.startedAt, state.baseDate)}</div><div className="text-muted">{c.messages.length} հաղորդագրություն</div></section>
            ))}
            <section className="rounded-xl border border-line p-4">
              <div className="mb-2 text-[13px] font-semibold">Ներքին նշումներ</div>
              <ul className="mb-3 space-y-2 text-[13px]">{g.notes.map((n, i) => <li key={i} className="rounded-lg bg-paper px-3 py-2">{n.text}<div className="mt-0.5 text-[12px] text-faint">{n.author} · {stamp(n.at, state.baseDate)}</div></li>)}{!g.notes.length && <li className="text-muted">Նշումներ չկան</li>}</ul>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Օր.՝ նախընտրում է բարձր հարկ, ալերգիա ընկույզի նկատմամբ" />
              <Button className="mt-2" variant="primary" size="sm" disabled={!note.trim()} onClick={() => { dispatch({ type: "guest.note", guestId: g.id, text: note.trim() }); setNote(""); }}>Ավելացնել նշում</Button>
            </section>
          </div>
        )}
      </Drawer>
      <ReservationDrawer id={resOpen} onClose={() => setResOpen(null)} />
    </>
  );
}
