"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useMemo, useState } from "react";
import { inpG, labG } from "@/components/hotel/auth";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { useGuestSession } from "@/lib/client/guest-session";
import { amd } from "@/lib/format";
import { g } from "@/lib/guest-i18n";
import { ALLERGEN_LABEL } from "@/lib/hospitality-data";
import { itemPrice, orderCalc } from "@/lib/rules";
import type { Lang, MenuItem, OrderType } from "@/lib/types";

type Line = { key: string; itemId: string; qty: number; options: string[] };

function Dining({ lang }: { lang: Lang }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useDemo();
  const { account, guest, stay, stayRes } = useGuestSession();
  const tableParam = sp.get("table");
  const [cat, setCat] = useState(state.menu.categories[0].id);
  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<MenuItem | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [type, setType] = useState<OrderType>(tableParam ? "dine_in" : stay ? "room_service" : "takeaway");
  const [table, setTable] = useState(tableParam ?? "T1");
  const [name, setName] = useState(guest?.firstName ?? "");
  const [phone, setPhone] = useState(guest?.phone ?? "");
  const [pickup, setPickup] = useState("19:30");
  const [note, setNote] = useState("");
  const [voucherId, setVoucher] = useState("");
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const myVouchers = account ? state.vouchers.filter((v) => v.guestId === account.guestId && v.status === "active" && state.rewards.find((r) => r.id === v.rewardId)?.appliesTo === "order") : [];
  const calc = useMemo(() => orderCalc(state, cart, account?.guestId, voucherId || undefined), [state, cart, account, voucherId]);
  const add = (m: MenuItem, options: string[]) => {
    const key = `${m.id}|${options.sort().join(",")}`;
    setCart((c) => c.some((l) => l.key === key) ? c.map((l) => l.key === key ? { ...l, qty: l.qty + 1 } : l) : [...c, { key, itemId: m.id, qty: 1, options }]);
  };
  const ready = cart.length > 0 && (type === "room_service" ? !!stay : type === "dine_in" ? !!table : name.trim() && phone.replace(/\D/g, "").length >= 6);
  const submit = () => {
    const ev = dispatch({ type: "order.create", order: { type, roomId: type === "room_service" ? stay?.roomId : undefined, tableId: type === "dine_in" ? table : undefined, guestId: account?.guestId ?? (type === "room_service" ? stayRes?.guestId : undefined), guestName: name.trim() || guest?.firstName || (stayRes ? state.guests.find((x) => x.id === stayRes.guestId)?.firstName ?? "" : ""), phone: phone.trim() || undefined, items: cart.map(({ itemId, qty, options }) => ({ itemId, qty, options })), note: note.trim(), pickupTime: type === "takeaway" ? pickup : undefined, voucherId: voucherId || undefined } });
    router.push(`/hotel/${lang}/order/o-${ev.id}`);
  };
  const items = state.menu.items.filter((m) => m.categoryId === cat);
  return (
    <>
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden pb-10 pt-28">
        <Image src="/img/dining.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night/85 via-night/40 to-night/30" />
        <div className="mx-auto w-full max-w-6xl px-4 text-cream sm:px-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.28em] text-cream/75">{g(lang, "dining")}</div>
          <h1 className="mt-2 font-serif text-[42px] font-semibold leading-tight sm:text-[60px]">{g(lang, "diningTitle")}</h1>
          <p className="mt-2 max-w-xl text-[16px] text-cream/80">{g(lang, "diningText")}</p>
          {(tableParam || stay) && <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[13.5px] font-semibold backdrop-blur"><Icon name="pin" size={15} />{tableParam ? `${g(lang, "table")} ${tableParam.replace("T", "")}` : `${g(lang, "roomVerified")} ${stay!.roomId}`}</div>}
        </div>
      </section>
      <div className="sticky top-16 z-30 border-b border-pine/10 bg-cream/95 backdrop-blur sm:top-[72px]">
        <div className="scrollbar-none mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
          {state.menu.categories.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={cn("shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition", cat === c.id ? "bg-pine text-cream" : "text-pine/65 hover:bg-pine/5")}>{c.name[lang]}</button>)}
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-32 pt-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {items.map((m) => (
          <article key={m.id} className={cn("group overflow-hidden rounded-3xl bg-white ring-1 ring-pine/10 transition", m.available ? "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(15_27_23/0.12)]" : "opacity-55")}>
            <button disabled={!m.available} onClick={() => { setSheet(m); setOpts([]); }} className="block w-full text-left">
              <div className="relative aspect-[4/3] overflow-hidden"><Image src={m.photo} alt={m.name[lang]} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />{!m.available && <span className="absolute left-3 top-3 rounded-full bg-night/80 px-3 py-1 text-[12px] font-semibold text-cream">{g(lang, "unavailable")}</span>}{m.tags.includes("signature") && <span className="absolute right-3 top-3 rounded-full bg-brass px-2.5 py-1 text-[11px] font-semibold text-white">★</span>}</div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3"><h3 className="font-serif text-[20px] font-semibold leading-tight">{m.name[lang]}</h3><span className="tnum shrink-0 text-[15px] font-semibold">{amd(m.price)}</span></div>
                <p className="mt-1 text-[13.5px] text-pine/65">{m.desc[lang]}</p>
                {m.allergens.length > 0 && <div className="mt-2 text-[11.5px] text-pine/50">{g(lang, "allergens")}: {m.allergens.map((a) => ALLERGEN_LABEL[a]?.[lang] ?? a).join(", ")}</div>}
              </div>
            </button>
          </article>
        ))}
      </div>
      {count > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-4 left-1/2 z-40 flex h-14 w-[min(92vw,420px)] -translate-x-1/2 items-center justify-between rounded-2xl bg-pine px-5 text-cream shadow-[0_18px_40px_rgb(15_27_23/0.35)]">
          <span className="flex items-center gap-2 font-semibold"><span className="grid size-7 place-items-center rounded-full bg-cream text-[13px] text-pine">{count}</span>{g(lang, "cart")}</span><span className="tnum font-semibold">{amd(calc.total)}</span>
        </button>
      )}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/50 sm:items-center" onClick={() => setSheet(null)}>
          <div className="rise-in w-full max-w-lg overflow-hidden rounded-t-3xl bg-cream sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/9]"><Image src={sheet.photo} alt="" fill sizes="512px" className="object-cover" /></div>
            <div className="p-5">
              <h3 className="font-serif text-[26px] font-semibold">{sheet.name[lang]}</h3>
              <p className="mt-1 text-[14.5px] text-pine/70">{sheet.desc[lang]}</p>
              {sheet.allergens.length > 0 && <p className="mt-2 text-[12.5px] text-pine/55">{g(lang, "allergens")}: {sheet.allergens.map((a) => ALLERGEN_LABEL[a]?.[lang] ?? a).join(", ")}</p>}
              {sheet.options.length > 0 && <div className="mt-4"><div className={labG}>{g(lang, "options")}</div><div className="space-y-2">{sheet.options.map((o) => <label key={o.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[14px] ring-1 ring-pine/10"><span className="flex items-center gap-2.5"><input type="checkbox" checked={opts.includes(o.id)} onChange={(e) => setOpts(e.target.checked ? [...opts, o.id] : opts.filter((x) => x !== o.id))} className="size-5 accent-[var(--color-pine)]" />{o.name[lang]}</span><span className="tnum text-pine/60">{o.price ? `+${amd(o.price)}` : ""}</span></label>)}</div></div>}
              <button onClick={() => { add(sheet, opts); setSheet(null); }} className="mt-5 h-12 w-full rounded-xl bg-pine text-[15px] font-semibold text-cream">{g(lang, "add")} · {amd(itemPrice(sheet, opts))}</button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-night/50" onClick={() => setOpen(false)}>
          <aside className="rise-in flex h-full w-full max-w-md flex-col bg-cream" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-pine/10 px-5 py-4"><span className="font-serif text-[24px] font-semibold">{g(lang, "cart")}</span><button onClick={() => setOpen(false)} aria-label="Close"><Icon name="x" size={22} /></button></header>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <ul className="space-y-2">{cart.map((l) => { const m = state.menu.items.find((x) => x.id === l.itemId)!; return (
                <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-pine/10">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl"><Image src={m.photo} alt="" fill sizes="56px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{m.name[lang]}</div><div className="truncate text-[12px] text-pine/55">{m.options.filter((o) => l.options.includes(o.id)).map((o) => o.name[lang]).join(", ")}</div><div className="tnum text-[13px]">{amd(itemPrice(m, l.options) * l.qty)}</div></div>
                  <div className="flex items-center gap-1.5"><button onClick={() => setCart(cart.map((x) => x.key === l.key ? { ...x, qty: x.qty - 1 } : x).filter((x) => x.qty > 0))} className="grid size-8 place-items-center rounded-full bg-cream text-lg">−</button><span className="tnum w-5 text-center font-semibold">{l.qty}</span><button onClick={() => setCart(cart.map((x) => x.key === l.key ? { ...x, qty: x.qty + 1 } : x))} className="grid size-8 place-items-center rounded-full bg-cream text-lg">+</button></div>
                </li>); })}</ul>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 ring-1 ring-pine/10">{(["room_service", "dine_in", "takeaway"] as OrderType[]).map((o) => <button key={o} onClick={() => setType(o)} className={cn("rounded-xl py-2.5 text-[13px] font-semibold", type === o ? "bg-pine text-cream" : "text-pine/65")}>{g(lang, o)}</button>)}</div>
              {type === "room_service" && (stay ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800"><b>{g(lang, "roomVerified")} {stay.roomId}</b> · {g(lang, "settleNote")}</div> : <div className="rounded-2xl bg-amber-50 px-4 py-3 text-[13.5px] text-amber-800">{g(lang, "needStay")}</div>)}
              {type === "dine_in" && <label><span className={labG}>{g(lang, "table")}</span><select className={inpG} value={table} onChange={(e) => setTable(e.target.value)}>{state.tables.map((tb) => <option key={tb.id} value={tb.id}>{tb.label} · {tb.zone}</option>)}</select></label>}
              {type === "takeaway" && <div className="grid grid-cols-2 gap-2"><label><span className={labG}>{g(lang, "first")}</span><input className={inpG} value={name} onChange={(e) => setName(e.target.value)} /></label><label><span className={labG}>{g(lang, "phone")}</span><input className={inpG} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></label><label className="col-span-2"><span className={labG}>{g(lang, "pickup")}</span><input type="time" className={inpG} value={pickup} onChange={(e) => setPickup(e.target.value)} /></label></div>}
              <label><span className={labG}>{g(lang, "kitchenNote")}</span><textarea className={cn(inpG, "h-20 py-2.5")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
              {myVouchers.length > 0 && <label><span className={labG}>{g(lang, "voucher")}</span><select className={inpG} value={voucherId} onChange={(e) => setVoucher(e.target.value)}><option value="">{g(lang, "noVoucher")}</option>{myVouchers.map((v) => <option key={v.id} value={v.id}>{state.rewards.find((r) => r.id === v.rewardId)?.name[lang]}</option>)}</select></label>}
              <div className="space-y-1.5 rounded-2xl bg-white p-4 text-[14px] ring-1 ring-pine/10">
                <div className="flex justify-between"><span>{g(lang, "subtotal")}</span><span className="tnum">{amd(calc.subtotal)}</span></div>
                {calc.discount > 0 && <div className="flex justify-between text-brass"><span>{g(lang, "discount")}{calc.campaignLabel ? ` · ${calc.campaignLabel[lang]}` : ""}</span><span className="tnum">−{amd(calc.discount)}</span></div>}
                <div className="flex justify-between border-t border-pine/10 pt-2 text-[17px] font-semibold"><span>{g(lang, "total")}</span><span className="tnum">{amd(calc.total)}</span></div>
              </div>
            </div>
            <footer className="border-t border-pine/10 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"><button disabled={!ready} onClick={submit} className="h-13 w-full rounded-xl bg-pine py-3.5 text-[16px] font-semibold text-cream disabled:opacity-40">{g(lang, "placeOrder")}</button></footer>
          </aside>
        </div>
      )}
    </>
  );
}

export default function DiningPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  return <Suspense><Dining lang={lang} /></Suspense>;
}
