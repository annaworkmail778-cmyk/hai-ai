"use client";
/*
 * Staff workspace shell (mobile-first). Demo sign-in = pick an employee; permissions come from the
 * employee's position (PERMISSIONS). Production: real accounts + server-side RBAC (see data architecture doc).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { DEPT_LABEL, isManager, PERMISSIONS, POSITION_LABEL, type StaffModule } from "@/lib/hospitality-data";
import type { Channel, HotelState, Staff } from "@/lib/types";
import { Icon, type IconName } from "../icons";
import { Avatar, cn } from "../ui";

const K_IN = "bos:staff:in";
const kRead = (actor: string) => `bos:read:${actor}`;

export function useMe() {
  const { state, actor } = useDemo();
  const me = state.staff.find((s) => s.id === actor) ?? state.staff[0];
  return { me, can: (m: StaffModule) => PERMISSIONS[me.position].includes(m), manager: isManager(me.position) };
}

export const channelsFor = (state: HotelState, me: Staff): Channel[] =>
  state.channels.filter((c) => c.kind === "notice" || (c.kind === "department" && (c.dept === me.dept || isManager(me.position))) || ((c.kind === "direct" || c.kind === "task") && (c.members ?? []).includes(me.id)));

/** Per-employee read markers (demo: localStorage; production: read-receipt table). */
export function useReads() {
  const { state, actor } = useDemo();
  const [reads, setReads] = useState<Record<string, number>>({});
  useEffect(() => {
    const load = () => { try { setReads(JSON.parse(localStorage.getItem(kRead(actor)) ?? "{}")); } catch { setReads({}); } };
    load(); addEventListener("bos-reads", load); addEventListener("storage", load);
    return () => { removeEventListener("bos-reads", load); removeEventListener("storage", load); };
  }, [actor]);
  const markRead = useCallback((channelId: string) => {
    try { const cur = JSON.parse(localStorage.getItem(kRead(actor)) ?? "{}"); cur[channelId] = Date.now(); localStorage.setItem(kRead(actor), JSON.stringify(cur)); dispatchEvent(new Event("bos-reads")); } catch { /* ignore */ }
  }, [actor]);
  const unread = (channelId: string) => state.messages.filter((m) => m.channelId === channelId && m.authorId !== actor && m.at > (reads[channelId] ?? 0)).length;
  const urgent = (channelId: string) => state.messages.some((m) => m.channelId === channelId && m.urgent && m.authorId !== actor && m.at > (reads[channelId] ?? 0));
  return { unread, urgent, markRead };
}

export function StaffShell({ children }: { children: ReactNode }) {
  const { state, setRole, actor, setActor } = useDemo();
  const path = usePathname();
  const [signed, setSigned] = useState<boolean | null>(null);
  useEffect(() => { setRole("staff"); try { setSigned(localStorage.getItem(K_IN) === "1"); } catch { setSigned(false); } }, [setRole]);
  const { me, manager } = useMe();
  const { unread } = useReads();
  if (signed === null) return null;
  if (!signed) return <Picker onPick={(id) => { setActor(id); try { localStorage.setItem(K_IN, "1"); } catch { /* ignore */ } setSigned(true); }} current={actor} />;
  const totalUnread = channelsFor(state, me).reduce((a, c) => a + unread(c.id), 0);
  const nav: [string, string, IconName, number?][] = [["/staff", "Այսօր", "home"], ["/staff/messages", "Հաղորդ.", "message", totalUnread], ["/staff/learn", "Ուսուցում", "star"], ...(manager ? [["/staff/team", "Թիմ", "users"] as [string, string, IconName]] : [])];
  return (
    <div className="min-h-dvh bg-paper pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
          <Avatar initials={me.initials} tone="dark" size={36} />
          <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[15px] font-semibold">{me.name}</div><div className="truncate text-[12px] text-muted">{POSITION_LABEL[me.position]} · {DEPT_LABEL[me.dept]} · {me.shift}</div></div>
          <button onClick={() => { try { localStorage.removeItem(K_IN); } catch { /* ignore */ } setSigned(false); }} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-muted hover:bg-paper">Փոխել</button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pt-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-2xl" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
          {nav.map(([href, label, icon, badge]) => {
            const active = href === "/staff" ? path === "/staff" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11.5px] font-medium", active ? "text-ink" : "text-muted")}>
                <Icon name={icon} size={22} />{label}
                {badge ? <span className="absolute left-1/2 top-1.5 ml-2 min-w-4 rounded-full bg-signal px-1 text-[10px] font-bold leading-4 text-white">{badge}</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Picker({ onPick, current }: { onPick: (id: string) => void; current: string }) {
  const { state } = useDemo();
  const by = new Map<string, Staff[]>();
  for (const s of state.staff.filter((x) => x.active)) by.set(s.dept, [...(by.get(s.dept) ?? []), s]);
  return (
    <div className="min-h-dvh bg-paper px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-ink text-[14px] font-bold text-white">R<span className="text-signal">.</span></span><div className="leading-tight"><div className="text-[16px] font-semibold">Աշխատակցի հավելված</div><div className="text-[12.5px] text-muted">Pine Ridge · RISEUP Hospitality OS</div></div></div>
        <div className="mt-6 rounded-xl border border-dashed border-warn/50 bg-warn-soft/50 px-3.5 py-2.5 text-[12.5px] text-warn">Ցուցադրական մուտք․ ընտրեք աշխատակցին։ Իրական համակարգում՝ անձնական հաշիվ, գաղտնաբառ/SSO և սերվերային թույլտվություններ։</div>
        {[...by.entries()].map(([dept, list]) => (
          <div key={dept} className="mt-5">
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-faint">{DEPT_LABEL[dept as Staff["dept"]]}</div>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              {list.map((s) => (
                <button key={s.id} onClick={() => onPick(s.id)} className={cn("flex w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left last:border-0 hover:bg-paper", s.id === current && "bg-paper")}>
                  <Avatar initials={s.initials} size={32} />
                  <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{s.name}</span><span className="block text-[12px] text-muted">{POSITION_LABEL[s.position]}</span></span>
                  <Icon name="chevron" size={16} className="text-faint" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return <section className="mb-5"><div className="mb-2 flex items-center justify-between"><h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{title}</h2>{right}</div>{children}</section>;
}
