"use client";
/* Restaurant OS staff shell: permission-filtered navigation, connection status, notifications, demo role picker. */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { ConnPillView } from "@/components/shared/conn-pill";
import { Avatar, Badge, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { ROLE_LABEL } from "@/lib/restaurant/data";
import { HOME_OF, type Permission } from "@/lib/restaurant/permissions";
import { st, type StaffKey } from "@/lib/restaurant/staff-i18n";

export const money = (n: number) => `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} ֏`;
export const moneyK = (n: number) => (Math.abs(n) >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)} մլն ֏` : money(n));
export const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
export const hm = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(ms);
export const mins = (ms: number, now: number) => Math.max(0, Math.floor((now - ms) / 60000));

/** Re-renders every `ms` so timers stay live. */
export function useNow(ms = 15000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return now;
}

const NAV: { href: string; key: StaffKey; icon: IconName; perm: Permission; group?: StaffKey }[] = [
  { href: "/r/admin", key: "nav_overview", icon: "home", perm: "overview.view" },
  { href: "/r/admin/orders", key: "nav_orders", icon: "list", perm: "orders.view", group: "grp_service" },
  { href: "/r/floor", key: "nav_floor", icon: "users", perm: "floor.use" },
  { href: "/r/kds", key: "nav_kds", icon: "flame", perm: "kds.use" },
  { href: "/r/host", key: "nav_host", icon: "calendar", perm: "reservations.manage" },
  { href: "/r/admin/floor", key: "nav_floorplan", icon: "pin", perm: "floor.edit" },
  { href: "/r/admin/inbox", key: "nav_inbox", icon: "message", perm: "inbox.use", group: "grp_guests" },
  { href: "/r/admin/reviews", key: "nav_reviews", icon: "star", perm: "reviews.reply" },
  { href: "/r/admin/customers", key: "nav_customers", icon: "user", perm: "crm.view" },
  { href: "/r/admin/menu", key: "nav_menu", icon: "coffee", perm: "menu.availability", group: "grp_margin" },
  { href: "/r/admin/recipes", key: "nav_recipes", icon: "calc", perm: "costs.view" },
  { href: "/r/admin/inventory", key: "nav_inventory", icon: "kitchen", perm: "inventory.view" },
  { href: "/r/admin/purchasing", key: "nav_purchasing", icon: "car", perm: "purchasing.manage" },
  { href: "/r/admin/assistant", key: "nav_assistant", icon: "sparkles", perm: "assistant.use", group: "grp_insight" },
  { href: "/r/admin/analytics", key: "nav_analytics", icon: "chart", perm: "finance.view" },
  { href: "/r/admin/savings", key: "nav_savings", icon: "sparkles", perm: "finance.view" },
  { href: "/r/admin/team", key: "nav_team", icon: "tasks", perm: "team.view", group: "grp_system" },
  { href: "/r/admin/automations", key: "nav_automations", icon: "zap", perm: "automations.manage" },
  { href: "/r/admin/integrations", key: "nav_integrations", icon: "bolt", perm: "automations.manage" },
  { href: "/r/admin/settings", key: "nav_settings", icon: "filter", perm: "automations.manage" },
];

function Bell() {
  const { state, dispatch } = useR();
  const [open, setOpen] = useState(false);
  const unread = state.notices.filter((n) => !n.read).length;
  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open && unread) setTimeout(() => dispatch({ type: "notices.read" }), 1500); }} className="relative grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-black/5" aria-label="Ծանուցումներ">
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold leading-4 text-white">{unread}</span>}
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="rise-in absolute right-0 z-50 mt-2 w-[min(340px,90vw)] overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">
          <div className="border-b border-line px-4 py-2.5 text-sm font-semibold">Ծանուցումներ</div>
          <ul className="max-h-96 overflow-y-auto">
            {state.notices.slice(0, 14).map((n) => (
              <li key={n.id}><Link href={n.href} onClick={() => setOpen(false)} className={cn("flex gap-3 px-4 py-3 text-[13px] hover:bg-paper", !n.read && "bg-signal-soft/50")}>
                <Icon name={n.kind === "stock" ? "kitchen" : n.kind === "request" ? "bell" : "list"} size={16} className="mt-0.5 shrink-0 text-muted" />
                <span className="min-w-0"><span className="block">{n.text}</span><span className="text-[12px] text-faint">{hm(n.at)}</span></span>
              </Link></li>
            ))}
          </ul>
        </div>
      </>)}
    </div>
  );
}

export function ActorPicker() {
  const { state, actor, setActor, me } = useR();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-black/5" aria-label={st("demo_signin")}>
        <Avatar initials={me.initials} tone="dark" />
        <span className="hidden text-left leading-tight lg:block"><span className="block text-[13px] font-medium">{me.name.split(" ")[0]}</span><span className="block text-[11px] text-muted">{ROLE_LABEL[me.role]}</span></span>
        <Icon name="chevronDown" size={15} className="text-muted" />
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="rise-in absolute right-0 z-50 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]">
          <div className="px-3 py-2 text-[12px] text-muted">{st("demo_signin")}</div>
          {state.staff.map((s) => (
            <button key={s.id} onClick={() => { setActor(s.id); setOpen(false); router.push(HOME_OF[s.role]); }} className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-paper", s.id === actor && "bg-paper")}>
              <Avatar initials={s.initials} size={24} /><span className="flex-1">{s.name}<span className="block text-[11px] text-muted">{ROLE_LABEL[s.role]}</span></span>{s.id === actor && <Icon name="check" size={15} />}
            </button>
          ))}
        </div>
      </>)}
    </div>
  );
}

export function TopBar({ title, compact }: { title?: ReactNode; compact?: boolean }) {
  const { conn, mode, backend, pending } = useR();
  return (
    <div className="flex items-center gap-2">
      {title}
      {!compact && <Badge tone="warn" className="hidden uppercase tracking-wide md:inline-flex">Ցուցադրական տվյալներ</Badge>}
      <ConnPillView conn={conn} mode={mode} backend={backend} pending={pending} />
      <Bell />
      <ActorPicker />
    </div>
  );
}

export function RShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  const { state, can, setRole } = useR();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setRole("staff"); }, [setRole]);
  useEffect(() => setMenu(false), [path]);
  const counts: Record<string, number> = {
    "/r/admin/orders": state.orders.filter((o) => o.status === "submitted").length,
    "/r/floor": state.requests.filter((r) => r.status !== "done").length,
    "/r/admin/inventory": state.notices.filter((n) => n.kind === "stock" && !n.read).length,
  };
  const items = NAV.filter((n) => can(n.perm));
  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
      {items.map((n, i) => {
        const active = n.href === "/r/admin" ? path === "/r/admin" : path.startsWith(n.href);
        const showGroup = n.group && items.findIndex((x) => x.group === n.group) === i;
        return (
          <div key={n.href}>
            {showGroup && <div className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{st(n.group!)}</div>}
            <Link href={n.href} className={cn("flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium transition", active ? "bg-ink text-white" : "text-ink-2 hover:bg-black/[0.05]")}>
              <Icon name={n.icon} size={17} className={active ? "text-white" : "text-muted"} />
              <span className="flex-1 truncate">{st(n.key)}</span>
              {counts[n.href] ? <span className={cn("tnum rounded-md px-1.5 text-[11px] font-semibold leading-5", active ? "bg-white/20" : "bg-signal text-white")}>{counts[n.href]}</span> : null}
            </Link>
          </div>
        );
      })}
    </nav>
  );
  const brand = (
    <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-[13px] font-bold tracking-tight text-white">R<span className="text-signal">.</span></span>
      <div className="leading-tight"><div className="text-[14px] font-semibold tracking-tight">RISEUP Restaurant OS</div><div className="text-[12px] text-muted">{state.brand.name} · {state.brand.city.hy}</div></div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-paper lg:pl-[264px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-surface lg:flex">{brand}{nav}
        <div className="border-t border-line p-3 text-[12px] text-muted">
          <Link href="/present/restaurant" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-paper"><Icon name="play" size={15} />{st("nav_present")}</Link>
          <Link href="/restaurant/hy" target="_blank" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-paper"><Icon name="globe" size={15} />{st("nav_site")}<Icon name="external" size={13} /></Link>
        </div>
      </aside>
      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenu(false)} />
          <aside className="rise-in absolute inset-y-0 left-0 flex w-[280px] flex-col bg-surface">{brand}{nav}</aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur sm:px-5">
        <button onClick={() => setMenu(true)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5 lg:hidden" aria-label="Մենյու"><Icon name="menu" /></button>
        <div className="min-w-0 flex-1 truncate text-[13px] text-muted"><span className="font-medium text-ink">{state.brand.name}</span> · երեկոյան սպասարկում</div>
        <TopBar />
      </header>
      <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}

export function NoAccess() {
  const { me } = useR();
  return <div className="mx-auto max-w-md py-20 text-center"><Icon name="alert" size={28} className="mx-auto text-muted" /><h1 className="mt-3 text-[18px] font-semibold">Այս բաժինը հասանելի չէ</h1><p className="mt-1 text-[13.5px] text-muted">{ROLE_LABEL[me.role]} դերը չունի այս էջի թույլտվությունը։ Ընտրեք այլ դեր վերևի աջ անկյունում (ցուցադրական)։</p></div>;
}

/** Wraps a page body with a permission check (navigation is filtered too, but URLs can be typed). */
export function Guard({ perm, children }: { perm: Permission; children: ReactNode }) {
  const { can } = useR();
  return can(perm) ? <>{children}</> : <NoAccess />;
}

export function Labelled({ kind }: { kind: "actual" | "calculated" | "hypothetical" }) {
  const tone = kind === "actual" ? "info" : kind === "calculated" ? "dark" : "violet";
  return <Badge tone={tone} className="uppercase tracking-wide">{st(kind)}</Badge>;
}
