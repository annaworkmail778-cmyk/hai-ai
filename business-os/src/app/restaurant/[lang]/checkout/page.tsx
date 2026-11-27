"use client";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { GuestShell, money } from "@/components/restaurant/guest/shell";
import { deviceKey, useCart, useMyOrders } from "@/components/restaurant/guest/store";
import { useR } from "@/lib/restaurant/client";
import { t } from "@/lib/restaurant/i18n";
import { cartLinePrice, cartTotals, earliestPickup } from "@/lib/restaurant/rules";
import type { Lang } from "@/lib/restaurant/types";

const hm = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(ms);

export default function Checkout({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const { state, dispatch } = useR();
  const cart = useCart("takeaway");
  const my = useMyOrders();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  const est = useMemo(() => earliestPickup(state, cart.lines, now), [state, cart.lines, now]);
  const slots = Array.from({ length: 8 }, (_, i) => est.at + i * state.settings.takeaway.slotMin * 60000);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const totals = cartTotals(state, cart.lines, true);
  const pickup = slot && slot >= est.at ? slot : est.at;
  const valid = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 6 && cart.count > 0 && !totals.belowMinimum;

  const submit = () => {
    const ev = dispatch({ type: "order.submit", channel: "website", orderType: "takeaway", contact: { name, phone }, pickupAt: pickup, note, lines: cart.lines, deviceKey: deviceKey() });
    my.push(`o-${ev.id}`);
    cart.clear();
    router.push(`/restaurant/${lang}/order/o-${ev.id}`);
  };

  return (
    <GuestShell lang={lang}>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1.2fr_1fr]">
        <section>
          <h1 className="rt-serif text-[38px]">{t("takeaway", lang)}</h1>
          <div className="mt-6 grid gap-4">
            <label><span className="mb-1.5 block text-[14px] font-semibold">{t("yourName", lang)}</span><input className="rt-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
            <label><span className="mb-1.5 block text-[14px] font-semibold">{t("yourPhone", lang)}</span><input className="rt-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+374 …" /></label>
            <div>
              <div className="mb-1.5 text-[14px] font-semibold">{t("pickupTime", lang)}</div>
              <div className="flex flex-wrap gap-2">{slots.map((x, i) => <button key={x} onClick={() => setSlot(x)} aria-pressed={pickup === x} className={`h-11 rounded-full border px-4 text-[14px] tnum ${pickup === x ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-accent-ink)]" : "border-[var(--rt-line)]"}`}>{i === 0 ? `${t("earliest", lang)} ` : ""}{hm(x)}</button>)}</div>
              <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-[var(--rt-faint)]"><Icon name="info" size={13} className="mt-0.5 shrink-0" />{t("estimateRule", lang)} (≈ {est.minutes} min)</p>
            </div>
            <label><span className="mb-1.5 block text-[14px] font-semibold">{t("note", lang)}</span><input className="rt-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} /></label>
          </div>
        </section>
        <aside className="rt-card h-fit p-5">
          <h2 className="rt-serif text-[24px]">{t("cart", lang)}</h2>
          <ul className="mt-3 divide-y divide-[var(--rt-line)] text-[14.5px]">
            {cart.lines.map((l, i) => { const it = state.items.find((x) => x.id === l.itemId)!; return <li key={i} className="flex justify-between gap-3 py-2"><span>{l.qty} × {it.name[lang]}</span><span className="tnum">{money(cartLinePrice(it, l.modifierIds) * l.qty)}</span></li>; })}
          </ul>
          <div className="mt-3 space-y-1.5 border-t border-[var(--rt-line)] pt-3 text-[14.5px]">
            <div className="flex justify-between"><span className="text-[var(--rt-muted)]">{t("subtotal", lang)}</span><span className="tnum">{money(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--rt-muted)]">{t("packaging", lang)}</span><span className="tnum">{money(totals.fee)}</span></div>
            <div className="flex justify-between text-[18px] font-semibold"><span>{t("total", lang)}</span><span className="tnum">{money(totals.total)}</span></div>
          </div>
          <p className="mt-3 text-[12.5px] text-[var(--rt-faint)]">{t("payOnSite", lang)}</p>
          <button className="rt-btn rt-btn-accent mt-4 w-full" disabled={!valid} onClick={submit}>{t("sendOrder", lang)}<Icon name="send" size={16} /></button>
        </aside>
      </main>
    </GuestShell>
  );
}
