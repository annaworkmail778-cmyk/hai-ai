"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { GuestShell, money } from "@/components/restaurant/guest/shell";
import { deviceKey } from "@/components/restaurant/guest/store";
import { useR } from "@/lib/restaurant/client";
import { GUEST_STATUS, t } from "@/lib/restaurant/i18n";
import type { Lang, OrderStatus } from "@/lib/restaurant/types";

const hm = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(ms);

export default function OrderStatusPage({ params }: { params: Promise<{ lang: Lang; id: string }> }) {
  const { lang, id } = use(params);
  const { state, dispatch } = useR();
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => setKey(deviceKey()), []);
  const o = state.orders.find((x) => x.id === id);
  // only the device that placed the order can see it
  const visible = o && key && o.deviceKey === key;
  if (!key) return null;
  if (!visible) return <GuestShell lang={lang}><main className="mx-auto max-w-lg px-5 py-24 text-center"><p className="text-[var(--rt-muted)]">{t("orderNotFound", lang)}</p><Link href={`/restaurant/${lang}/menu`} className="rt-btn rt-btn-accent mt-6">{t("menu", lang)}</Link></main></GuestShell>;

  const steps: OrderStatus[] = o.type === "takeaway" ? ["submitted", "accepted", "preparing", "ready", "picked_up"] : ["submitted", "accepted", "preparing", "ready", "served"];
  const failed = o.status === "rejected" || o.status === "cancelled";
  const cur = o.status === "completed" ? steps.length - 1 : steps.indexOf(o.status);
  const st = GUEST_STATUS[o.status];
  const table = o.tableId ? state.tables.find((x) => x.id === o.tableId) : undefined;
  const at = (s: OrderStatus) => o.history.find((h) => h.status === s)?.at;
  return (
    <GuestShell lang={lang}>
      <main className="mx-auto max-w-lg px-5 py-8">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--rt-faint)]">{t("orderNo", lang)} {o.code}{table ? ` · ${t("table", lang)} ${table.label}` : ` · ${t("takeaway", lang)}`}</p>
        <h1 className="rt-serif mt-2 text-[44px] leading-none" aria-live="polite">{st.label[lang]}</h1>
        <p className="mt-2 text-[16px] text-[var(--rt-muted)]">{o.status === "ready" && o.type === "takeaway" ? `${st.text[lang]} · ${t("pickupCode", lang)}: ${o.code.slice(-4)}` : st.text[lang]}{failed && o.reason ? ` — ${o.reason}` : ""}</p>
        {!failed && (
          <ol className="mt-8 space-y-0">
            {steps.map((s, i) => {
              const done = i <= cur, now = i === cur && o.status !== "completed";
              return (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center"><span className={`grid size-8 place-items-center rounded-full border-2 ${done ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-accent-ink)]" : "border-[var(--rt-line)] text-[var(--rt-faint)]"} ${now ? "rt-pulse" : ""}`}>{done ? <Icon name="check" size={15} /> : i + 1}</span>{i < steps.length - 1 && <span className={`h-9 w-0.5 ${i < cur ? "bg-[var(--rt-accent)]" : "bg-[var(--rt-line)]"}`} />}</div>
                  <div className="pt-1"><div className={done ? "font-semibold" : "text-[var(--rt-faint)]"}>{GUEST_STATUS[s].label[lang]}</div>{at(s) && <div className="tnum text-[12.5px] text-[var(--rt-faint)]">{hm(at(s)!)}</div>}</div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-[var(--rt-faint)]"><Icon name="refresh" size={13} />{t("trackHint", lang)}</p>
        <div className="rt-card mt-6 p-5">
          <ul className="divide-y divide-[var(--rt-line)] text-[14.5px]">
            {o.lines.filter((l) => l.status === "active" && !l.remakeOf).map((l) => { const it = state.items.find((x) => x.id === l.itemId); return <li key={l.id} className="flex justify-between gap-3 py-2"><span>{l.qty} × {it?.name[lang] ?? l.name}{l.modifiers.length > 0 && <span className="block text-[12.5px] text-[var(--rt-muted)]">{l.modifiers.map((m) => it?.groups.flatMap((g) => g.options).find((x) => x.id === m.id)?.name[lang] ?? m.name).join(", ")}</span>}</span><span className="tnum">{money(l.unitPrice * l.qty)}</span></li>; })}
          </ul>
          <div className="mt-2 flex justify-between border-t border-[var(--rt-line)] pt-3 text-[17px] font-semibold"><span>{t("total", lang)}</span><span className="tnum">{money(o.total)}</span></div>
          <p className="mt-2 text-[12.5px] text-[var(--rt-faint)]">{t("payOnSite", lang)}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {o.status === "submitted" && <button className="rt-btn rt-btn-ghost" onClick={() => dispatch({ type: "order.cancel", orderId: o.id, reason: "Հյուրը չեղարկեց" })}>{t("cancelOrder", lang)}</button>}
          {table && <Link href={`/restaurant/${lang}/menu`} className="rt-btn rt-btn-accent">{t("orderMore", lang)}</Link>}
        </div>
      </main>
    </GuestShell>
  );
}
