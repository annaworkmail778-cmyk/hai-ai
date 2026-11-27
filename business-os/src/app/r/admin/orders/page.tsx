"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { OrderBadge, OrderDetail, SourceBadge } from "@/components/restaurant/staff/order";
import { Guard, hm, money, mins, useNow } from "@/components/restaurant/staff/shell";
import { Card, Drawer, Empty, Tabs, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import type { OrderStatus } from "@/lib/restaurant/types";

const TABS: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: "new", label: "Սպասում են ընդունման", statuses: ["submitted"] },
  { id: "kitchen", label: "Խոհանոցում", statuses: ["accepted", "preparing"] },
  { id: "ready", label: "Պատրաստ", statuses: ["ready"] },
  { id: "served", label: "Մատուցված", statuses: ["served"] },
  { id: "closed", label: "Փակված / չեղարկված", statuses: ["completed", "picked_up", "cancelled", "rejected"] },
];

export default function OrdersPage() {
  const { state } = useR();
  const now = useNow();
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(sp.get("tab") ?? (state.orders.some((o) => o.status === "submitted") ? "new" : "kitchen"));
  const openId = sp.get("open");
  const cur = TABS.find((t) => t.id === tab)!;
  const list = state.orders.filter((o) => cur.statuses.includes(o.status)).sort((a, b) => (tab === "closed" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  const open = openId ? state.orders.find((o) => o.id === openId) : undefined;
  const setOpen = (id: string | null) => router.replace(id ? `/r/admin/orders?tab=${tab}&open=${id}` : `/r/admin/orders?tab=${tab}`, { scroll: false });
  return (
    <Guard perm="orders.view">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Պատվերներ</h1><p className="mt-1 text-[13.5px] text-muted">Բոլոր աղբյուրները մեկ ցուցակում՝ մատուցող, QR սեղանից, կայք։ Աղբյուրը պահպանվում է յուրաքանչյուր պատվերի վրա։</p></div>
      </div>
      <Tabs value={tab} onChange={(v) => { setTab(v); router.replace(`/r/admin/orders?tab=${v}`, { scroll: false }); }} items={TABS.map((t) => ({ id: t.id, label: t.label, count: state.orders.filter((o) => t.statuses.includes(o.status)).length }))} />
      <Card pad={false} className="mt-4 overflow-hidden">
        {!list.length ? <Empty title="Այստեղ պատվերներ չկան" /> : (
          <ul className="divide-y divide-line">
            {list.map((o) => {
              const table = o.tableId ? state.tables.find((t) => t.id === o.tableId) : undefined;
              return (
                <li key={o.id}>
                  <button onClick={() => setOpen(o.id)} className={cn("flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-paper", o.status === "submitted" && "bg-signal-soft/40")}>
                    <span className="w-20 text-[14px] font-semibold">{o.code}</span>
                    <span className="w-24 text-[13.5px]">{table ? <><Icon name="users" size={13} className="mr-1 inline text-muted" />Սեղան {table.label}</> : <><Icon name="clock" size={13} className="mr-1 inline text-muted" />{o.pickupAt ? hm(o.pickupAt) : "Տանելու"}</>}</span>
                    <SourceBadge o={o} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{o.lines.filter((l) => l.status === "active").map((l) => `${l.qty}× ${l.name}`).join(", ")}</span>
                    <span className="tnum text-[13.5px]">{money(o.total)}</span>
                    <span className="tnum w-14 text-right text-[12.5px] text-muted">{mins(o.createdAt, now)} ր</span>
                    <OrderBadge o={o} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open ? `Պատվեր ${open.code}` : ""} wide>
        {open && <OrderDetail o={open} now={now} />}
      </Drawer>
    </Guard>
  );
}
