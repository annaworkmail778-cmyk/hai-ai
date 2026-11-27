"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { Icon } from "@/components/icons";
import { CartBar, CartSheet, MenuBrowser } from "@/components/restaurant/guest/menu";
import { GuestShell, money } from "@/components/restaurant/guest/shell";
import { deviceKey, useCart, useMyOrders, useTableCtx } from "@/components/restaurant/guest/store";
import { useR } from "@/lib/restaurant/client";
import { t } from "@/lib/restaurant/i18n";
import { cartTotals } from "@/lib/restaurant/rules";
import type { Lang, RequestKind } from "@/lib/restaurant/types";

export default function MenuPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const sp = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useR();
  const { table: ctx } = useTableCtx();
  const table = ctx ? state.tables.find((x) => x.token === ctx.token) : undefined;
  const mode: "table" | "takeaway" = sp.get("mode") === "takeaway" || !table ? "takeaway" : "table";
  const cart = useCart(mode);
  const my = useMyOrders();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<RequestKind | null>(null);
  const totals = cartTotals(state, cart.lines, mode === "takeaway");
  const area = table ? state.areas.find((a) => a.id === table.areaId) : undefined;
  const myActive = my.ids.map((id) => state.orders.find((o) => o.id === id)).filter((o) => o && o.tableId === table?.id && !["completed", "cancelled", "rejected"].includes(o.status));
  const unavailable = cart.lines.some((l) => !state.items.find((i) => i.id === l.itemId)?.available);

  const send = () => {
    if (!table) return;
    const ev = dispatch({ type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: table.token, note: "", lines: cart.lines, deviceKey: deviceKey() });
    my.push(`o-${ev.id}`);
    cart.clear();
    router.push(`/restaurant/${lang}/order/o-${ev.id}`);
  };
  const request = (kind: RequestKind) => { if (!table) return; dispatch({ type: "table.request", tableToken: table.token, kind }); setSent(kind); setTimeout(() => setSent(null), 4000); };

  const header = mode === "table" && table ? (
    <div className="mx-auto max-w-5xl px-4 pt-5">
      <div className="rt-card flex flex-wrap items-center gap-3 p-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--rt-accent)] text-[18px] font-bold text-[var(--rt-accent-ink)]">{table.label}</div>
        <div className="min-w-0 flex-1"><div className="font-semibold">{t("table", lang)} {table.label} · {area?.name[lang]}</div><div className="text-[13px] text-[var(--rt-muted)]">{t("qrWelcome", lang)}</div></div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={() => request("waiter")} className="rt-btn rt-btn-ghost h-10 flex-1 whitespace-nowrap px-3 text-[13px]"><Icon name="bell" size={15} />{t("callWaiter", lang)}</button>
          <button onClick={() => request("bill")} className="rt-btn rt-btn-ghost h-10 flex-1 whitespace-nowrap px-3 text-[13px]"><Icon name="list" size={15} />{t("requestBill", lang)}</button>
        </div>
        {sent && <div className="rt-fade w-full rounded-xl bg-[color-mix(in_srgb,var(--rt-accent)_14%,transparent)] px-3 py-2 text-[13.5px]" role="status"><Icon name="check" size={14} className="mr-1 inline" />{t("requestSent", lang)}</div>}
        {myActive.length > 0 && <div className="flex w-full flex-wrap gap-2">{myActive.map((o) => <Link key={o!.id} href={`/restaurant/${lang}/order/${o!.id}`} className="rt-chip border-[var(--rt-accent)] text-[var(--rt-text)]"><span className="size-1.5 rounded-full bg-[var(--rt-accent)]" />{t("orderNo", lang)} {o!.code}</Link>)}</div>}
      </div>
    </div>
  ) : (
    <div className="mx-auto max-w-5xl px-4 pt-5">
      <div className="rt-card flex items-center gap-3 p-4"><Icon name="clock" size={20} className="text-[var(--rt-accent)]" /><div className="text-[14px]"><span className="font-semibold">{t("takeaway", lang)}</span> · <span className="text-[var(--rt-muted)]">{t("minOrder", lang)} {money(state.settings.takeaway.minOrder)}</span></div></div>
    </div>
  );

  return (
    <GuestShell lang={lang}>
      <MenuBrowser lang={lang} header={header} onAdd={cart.add} />
      <CartBar lang={lang} count={cart.count} total={totals.total} onClick={() => setOpen(true)} />
      {open && (
        <CartSheet lang={lang} lines={cart.lines} setQty={cart.setQty} onClose={() => setOpen(false)} footer={
          <div className="space-y-3">
            <div className="flex justify-between text-[15px]"><span className="text-[var(--rt-muted)]">{t("subtotal", lang)}</span><span className="tnum">{money(totals.subtotal)}</span></div>
            {totals.fee > 0 && <div className="flex justify-between text-[15px]"><span className="text-[var(--rt-muted)]">{t("packaging", lang)}</span><span className="tnum">{money(totals.fee)}</span></div>}
            <div className="flex justify-between text-[18px] font-semibold"><span>{t("total", lang)}</span><span className="tnum">{money(totals.total)}</span></div>
            <p className="text-[12.5px] text-[var(--rt-faint)]">{t("payOnSite", lang)}</p>
            {mode === "table"
              ? <button className="rt-btn rt-btn-accent w-full" disabled={!cart.count || unavailable} onClick={send}>{t("sendOrder", lang)}<Icon name="send" size={16} /></button>
              : <>
                  {totals.belowMinimum && cart.count > 0 && <p className="text-[13px] text-[var(--rt-accent)]">{t("minOrder", lang)}: {money(state.settings.takeaway.minOrder)}</p>}
                  <Link href={`/restaurant/${lang}/checkout`} aria-disabled={!cart.count || totals.belowMinimum || unavailable} className={`rt-btn rt-btn-accent w-full ${!cart.count || totals.belowMinimum || unavailable ? "pointer-events-none opacity-40" : ""}`}>{t("order", lang)}<Icon name="arrowRight" size={16} /></Link>
                </>}
          </div>
        } />
      )}
    </GuestShell>
  );
}
