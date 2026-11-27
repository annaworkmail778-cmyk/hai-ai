"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { dHy, time } from "@/lib/format";
import { Icon, type IconName } from "../icons";
import { ConnPillView } from "../shared/conn-pill";
import { Avatar, Badge, cn, DemoDataBadge } from "../ui";

const NAV: { href: string; label: string; icon: IconName; group?: string }[] = [
  { href: "/admin", label: "Ընդհանուր պատկեր", icon: "home" },
  { href: "/admin/reservations", label: "Ամրագրումներ", icon: "list", group: "Ամրագրումներ" },
  { href: "/admin/calendar", label: "Օրացույց", icon: "calendar" },
  { href: "/admin/rooms", label: "Սենյակներ", icon: "bed" },
  { href: "/admin/guests", label: "Հյուրեր (CRM)", icon: "users" },
  { href: "/admin/housekeeping", label: "Մաքրություն", icon: "broom", group: "Աշխատանք" },
  { href: "/admin/maintenance", label: "Տեխնիկական սպասարկում", icon: "wrench" },
  { href: "/admin/staff", label: "Անձնակազմ և առաջադրանքներ", icon: "tasks" },
  { href: "/admin/assistant", label: "AI օգնական", icon: "sparkles", group: "Ավտոմատացում" },
  { href: "/admin/automations", label: "Ավտոմատացումներ", icon: "zap" },
  { href: "/admin/analytics", label: "Վերլուծություն", icon: "chart", group: "Կառավարում" },
  { href: "/admin/roi", label: "Արժեքի հաշվիչ", icon: "calc" },
];

export function ConnPill() {
  const { conn, mode, backend, pending } = useDemo();
  return <ConnPillView conn={conn} mode={mode} backend={backend} pending={pending} />;
}

function Bell() {
  const { state, dispatch } = useDemo();
  const [open, setOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;
  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open && unread) setTimeout(() => dispatch({ type: "notifications.read" }), 1500); }} className="relative grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-black/5" aria-label="Ծանուցումներ">
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold leading-4 text-white">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="rise-in absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">
            <div className="border-b border-line px-4 py-2.5 text-sm font-semibold">Ծանուցումներ</div>
            <ul className="max-h-96 overflow-y-auto">
              {state.notifications.slice(0, 12).map((n) => (
                <li key={n.id}><Link href={n.href} onClick={() => setOpen(false)} className={cn("flex gap-3 px-4 py-3 text-[13px] hover:bg-paper", !n.read && "bg-signal-soft/50")}>
                  <Icon name={n.kind === "inquiry" ? "bell" : n.kind === "handoff" ? "sparkles" : n.kind === "maint" ? "wrench" : "tasks"} size={16} className="mt-0.5 shrink-0 text-muted" />
                  <span className="min-w-0"><span className="block">{n.text}</span><span className="text-[12px] text-faint">{time(n.at)}</span></span>
                </Link></li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function ActorSwitch() {
  const { state, actor, setActor } = useDemo();
  const me = state.staff.find((s) => s.id === actor) ?? state.staff[1];
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-black/5">
        <Avatar initials={me.initials} tone="dark" />
        <span className="hidden text-left leading-tight lg:block"><span className="block text-[13px] font-medium">{me.name.split(" ")[0]}</span><span className="block text-[11px] text-muted">{{ manager: "Մենեջեր", reception: "Ընդունարան", housekeeping: "Մաքրություն", maintenance: "Տեխնիկական" }[me.role]}</span></span>
        <Icon name="chevronDown" size={15} className="text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="rise-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]">
            <div className="px-3 py-2 text-[12px] text-muted">Մուտք գործել որպես (ցուցադրական)</div>
            {state.staff.map((s) => (
              <button key={s.id} onClick={() => { setActor(s.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-paper", s.id === actor && "bg-paper")}>
                <Avatar initials={s.initials} size={24} /><span className="flex-1">{s.name}</span>{s.id === actor && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { state, setRole } = useDemo();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setRole("staff"); }, [setRole]);
  useEffect(() => setMenu(false), [path]);
  const counts: Record<string, number> = {
    "/admin/reservations": state.reservations.filter((r) => r.status === "inquiry").length,
    "/admin/housekeeping": state.hkTasks.filter((t) => t.due === state.baseDate && t.status !== "done").length,
    "/admin/assistant": state.conversations.filter((c) => c.status === "handoff").length,
    "/admin/maintenance": state.maint.filter((m) => m.status !== "resolved").length,
  };
  const night = state.clock.mode === "night";
  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <div key={n.href}>
            {n.group && <div className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{n.group}</div>}
            <Link href={n.href} className={cn("flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium transition", active ? "bg-ink text-white" : "text-ink-2 hover:bg-black/[0.05]")}>
              <Icon name={n.icon} size={17} className={active ? "text-white" : "text-muted"} />
              <span className="flex-1 truncate">{n.label}</span>
              {counts[n.href] ? <span className={cn("tnum rounded-md px-1.5 text-[11px] font-semibold leading-5", active ? "bg-white/20" : n.href === "/admin/reservations" || n.href === "/admin/assistant" ? "bg-signal text-white" : "bg-black/[0.07] text-ink-2")}>{counts[n.href]}</span> : null}
            </Link>
          </div>
        );
      })}
    </nav>
  );
  const brand = (
    <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-[13px] font-bold tracking-tight text-white">R<span className="text-signal">.</span></span>
      <div className="leading-tight"><div className="text-[14px] font-semibold tracking-tight">RISEUP Hotel OS</div><div className="text-[12px] text-muted">Pine Ridge · Ծաղկաձոր</div></div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-paper lg:pl-[264px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-surface lg:flex">{brand}{nav}
        <div className="border-t border-line p-3 text-[12px] text-muted"><Link href="/present" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-paper"><Icon name="play" size={15} />Ներկայացման ռեժիմ</Link><Link href="/hotel/hy" target="_blank" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-paper"><Icon name="globe" size={15} />Հյուրանոցի կայքը<Icon name="external" size={13} /></Link></div>
      </aside>
      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenu(false)} />
          <aside className="rise-in absolute inset-y-0 left-0 flex w-[280px] flex-col bg-surface">{brand}{nav}</aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur sm:px-5">
        <button onClick={() => setMenu(true)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5 lg:hidden" aria-label="Մենյու"><Icon name="menu" /></button>
        <div className="min-w-0 flex-1 truncate text-[13px] text-muted"><span className="font-medium text-ink">Այսօր՝ {dHy(state.baseDate)}</span>{night && <Badge tone="violet" className="ml-2"><Icon name="moon" size={12} />Գիշերային սցենար · 23:30</Badge>}</div>
        <div className="hidden sm:block"><DemoDataBadge /></div>
        <ConnPill />
        <Bell />
        <ActorSwitch />
      </header>
      <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">{title}</h1>{sub && <p className="mt-1 text-[13.5px] text-muted">{sub}</p>}</div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}
