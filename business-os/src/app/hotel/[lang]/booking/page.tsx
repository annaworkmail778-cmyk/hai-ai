"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import { AuthPanel, inpG, labG } from "@/components/hotel/auth";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { useGuestSession } from "@/lib/client/guest-session";
import { addDays, nextFriday } from "@/lib/dates";
import { amd, dLang } from "@/lib/format";
import { g, type GKey } from "@/lib/guest-i18n";
import { CANCELLATION, EXTRAS } from "@/lib/hospitality-data";
import { OFFERS, ROOM_TYPES, roomType } from "@/lib/hotel-data";
import { fitsGuests, freeRooms, quote } from "@/lib/pricing";
import { bookingCalc } from "@/lib/rules";
import { t } from "@/lib/site-i18n";
import type { Lang, RoomTypeId } from "@/lib/types";

const STEPS: GKey[] = ["bk1", "bk2", "bk3", "bk4", "bk5"];

function Journey({ lang }: { lang: Lang }) {
  const d = t(lang);
  const sp = useSearchParams();
  const { state, dispatch } = useDemo();
  const { account, guest } = useGuestSession();
  const def = nextFriday(state.baseDate, 6);
  const [step, setStep] = useState(sp.get("room") || sp.get("in") ? 1 : 0);
  const [checkIn, setIn] = useState(sp.get("in") ?? def);
  const [checkOut, setOut] = useState(sp.get("out") ?? addDays(def, 2));
  const [adults, setAdults] = useState(Number(sp.get("a") ?? 2));
  const [children, setChildren] = useState(Number(sp.get("c") ?? 0));
  const [typeId, setType] = useState<RoomTypeId | null>((sp.get("room") as RoomTypeId) || null);
  const [rooms, setRooms] = useState(1);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [voucherId, setVoucher] = useState("");
  const offer = OFFERS.find((o) => o.id === sp.get("offer"));
  const [f, setF] = useState({ first: "", last: "", phone: "", email: "", requests: offer ? offer.title[lang] : "" });
  const [sent, setSent] = useState<string | null>(null);
  useEffect(() => { if (guest) setF((x) => ({ ...x, first: guest.firstName, last: guest.lastName, phone: guest.phone, email: guest.email })); }, [guest?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- refill only when the signed-in guest changes, not on every sync
  const nights = checkIn < checkOut ? quote("classic", checkIn, checkOut).nights : 0;
  const myVouchers = account ? state.vouchers.filter((v) => v.guestId === account.guestId && v.status === "active" && state.rewards.find((r) => r.id === v.rewardId)?.appliesTo === "stay") : [];
  const calc = useMemo(() => typeId && nights ? bookingCalc(state, { typeId, rooms, checkIn, checkOut, adults, children, extras: Object.entries(extras).map(([id, qty]) => ({ id, qty })), voucherId: voucherId || undefined, guestId: account?.guestId }) : null, [state, typeId, rooms, checkIn, checkOut, adults, children, extras, voucherId, account, nights]);
  const free = typeId && nights ? freeRooms(state, typeId, checkIn, checkOut).length : 0;
  const detailsOk = f.first.trim() && f.phone.replace(/\D/g, "").length >= 6;

  if (sent) {
    const r = state.reservations.find((x) => x.id === sent);
    return (
      <div className="rise-in mx-auto max-w-2xl rounded-3xl bg-white p-6 text-center ring-1 ring-pine/10 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-pine text-cream"><Icon name="check" size={26} /></span>
        <h1 className="mt-5 font-serif text-[36px] font-semibold">{g(lang, "pendingTitle")}</h1>
        <p className="mx-auto mt-2 max-w-md text-[15.5px] text-pine/70">{g(lang, "pendingText")}</p>
        {r && <div className="mx-auto mt-6 max-w-sm space-y-1.5 rounded-2xl border border-dashed border-brass/50 bg-[#fffaf0] p-4 text-left text-[14px]">
          <div className="flex justify-between"><span className="text-pine/60">{d.reference}</span><b>{r.code}{r.groupId ? ` +${rooms - 1}` : ""}</b></div>
          <div className="flex justify-between"><span className="text-pine/60">{d.room}</span><span>{roomType(r.typeId).name[lang]}{rooms > 1 ? ` × ${rooms}` : ""}</span></div>
          <div className="flex justify-between"><span className="text-pine/60">{dLang(r.checkIn, lang)} – {dLang(r.checkOut, lang)}</span><span className="tnum font-semibold">{amd(calc?.total ?? r.total)}</span></div>
          <div className={cn("mt-2 rounded-lg px-2.5 py-1.5 text-center text-[12.5px] font-semibold", r.status === "confirmed" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>{g(lang, `st_${r.status}` as GKey)}</div>
        </div>}
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href={`/hotel/${lang}/account`} className="inline-flex h-11 items-center rounded-full bg-pine px-6 text-[14px] font-semibold text-cream">{g(lang, "openAccount")}</Link><Link href={`/hotel/${lang}`} className="inline-flex h-11 items-center rounded-full border border-pine/25 px-6 text-[14px] font-semibold">{d.backHome}</Link></div>
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(4, s + 1));
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <ol className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {STEPS.map((k, i) => <li key={k} className="shrink-0"><button disabled={i > step} onClick={() => setStep(i)} className={cn("flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition", i === step ? "bg-pine text-cream" : i < step ? "bg-pine/10 text-pine" : "text-pine/40")}><span className={cn("grid size-5 place-items-center rounded-full text-[11px]", i < step ? "bg-brass text-white" : "bg-white/20")}>{i < step ? "✓" : i + 1}</span>{g(lang, k)}</button></li>)}
        </ol>
        <div key={step} className="rise-in">
          {step === 0 && (
            <div className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-pine/10 sm:grid-cols-2 sm:p-7">
              <label><span className={labG}>{d.checkIn}</span><input type="date" className={inpG} value={checkIn} min={state.baseDate} onChange={(e) => { setIn(e.target.value); if (e.target.value >= checkOut) setOut(addDays(e.target.value, 1)); }} /></label>
              <label><span className={labG}>{d.checkOut}</span><input type="date" className={inpG} value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setOut(e.target.value)} /></label>
              <label><span className={labG}>{d.adults}</span><select className={inpG} value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></label>
              <label><span className={labG}>{d.children}</span><select className={inpG} value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
              <button disabled={!nights} onClick={next} className="h-12 rounded-xl bg-pine text-[15px] font-semibold text-cream disabled:opacity-40 sm:col-span-2">{g(lang, "continue")} · {nights} {d.nights}</button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              {ROOM_TYPES.map((r) => {
                const q = quote(r.id, checkIn, checkOut);
                const fr = freeRooms(state, r.id, checkIn, checkOut).length;
                const perRoomGuests = Math.ceil((adults + children) / Math.max(1, typeId === r.id ? rooms : 1));
                const fit = fitsGuests(r.id, Math.min(adults, r.capacity.adults), 0) && perRoomGuests <= r.capacity.adults + r.capacity.children;
                const sel = typeId === r.id;
                return (
                  <div key={r.id} className={cn("flex flex-col gap-4 overflow-hidden rounded-3xl bg-white p-3 ring-1 transition sm:flex-row", sel ? "ring-2 ring-pine" : "ring-pine/10")}>
                    <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-2xl sm:aspect-auto sm:w-64"><Image src={r.photos[0]} alt="" fill sizes="256px" className="object-cover" /></div>
                    <div className="flex min-w-0 flex-1 flex-col py-1 pr-2">
                      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-serif text-[24px] font-semibold leading-tight">{r.name[lang]}</h3><Link href={`/hotel/${lang}/rooms/${r.slug}`} target="_blank" className="text-[12.5px] font-semibold text-brass">{d.details} ↗</Link></div>
                      <p className="mt-1 text-[14px] text-pine/65">{r.short[lang]}</p>
                      <div className="mt-2 text-[12.5px] text-pine/55">{r.sizeM2} {d.m2} · {d.upTo} {r.capacity.adults + r.capacity.children} {d.guestsShort} · {r.bed[lang]}</div>
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                        <div><div className="tnum text-[22px] font-semibold">{amd(q.total)}</div><div className="text-[12px] text-pine/55">{q.nights} {d.nights} · {amd(Math.round(q.total / q.nights))} {g(lang, "perNightFrom")} · {d.includes}</div></div>
                        {fr === 0 ? <span className="rounded-full bg-red-50 px-3 py-1.5 text-[12.5px] font-semibold text-red-700">{g(lang, "soldOut")}</span> : !fit ? <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[12.5px] font-semibold text-amber-800">{d.tooMany}</span> : (
                          <div className="flex items-center gap-2">
                            {sel && fr > 1 && <select aria-label={g(lang, "rooms")} value={rooms} onChange={(e) => setRooms(+e.target.value)} className="h-11 rounded-xl border border-pine/15 px-2 text-[14px]">{Array.from({ length: Math.min(3, fr) }, (_, i) => <option key={i} value={i + 1}>{i + 1} ×</option>)}</select>}
                            <button onClick={() => { setType(r.id); if (!sel) setRooms(Math.max(1, Math.ceil((adults + children) / (r.capacity.adults + r.capacity.children)))); }} className={cn("h-11 rounded-xl px-5 text-[14px] font-semibold", sel ? "bg-brass text-white" : "bg-pine text-cream")}>{sel ? g(lang, "selected") + " ✓" : g(lang, "select")}</button>
                          </div>
                        )}
                      </div>
                      {fr > 0 && fr <= 2 && <div className="mt-1 text-[12px] font-semibold text-red-700">{fr} {g(lang, "left")}</div>}
                    </div>
                  </div>
                );
              })}
              <button disabled={!typeId || !free} onClick={next} className="h-12 w-full rounded-xl bg-pine text-[15px] font-semibold text-cream disabled:opacity-40">{g(lang, "continue")}</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-serif text-[28px] font-semibold">{g(lang, "extrasTitle")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {EXTRAS.map((x) => {
                  const on = (extras[x.id] ?? 0) > 0;
                  return (
                    <button key={x.id} onClick={() => setExtras({ ...extras, [x.id]: on ? 0 : 1 })} className={cn("flex items-start gap-3 rounded-2xl bg-white p-4 text-left ring-1 transition", on ? "ring-2 ring-pine" : "ring-pine/10 hover:ring-pine/30")}>
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-pine bg-pine text-cream" : "border-pine/30")}>{on && <Icon name="check" size={13} />}</span>
                      <span className="flex-1"><span className="block font-semibold">{x.name[lang]}</span><span className="block text-[13px] text-pine/60">{x.desc[lang]}</span></span>
                      <span className="tnum shrink-0 text-[14px] font-semibold">{amd(x.price)}{x.unit === "person" ? " / " + d.guestsShort : ""}</span>
                    </button>
                  );
                })}
              </div>
              {account ? (
                <div className="rounded-2xl bg-[#fffaf0] p-4 ring-1 ring-brass/30">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-brass"><Icon name="star" size={16} />{g(lang, "memberRate")}</div>
                  {myVouchers.length > 0 && <label className="mt-3 block"><span className={labG}>{g(lang, "voucher")}</span><select className={inpG} value={voucherId} onChange={(e) => setVoucher(e.target.value)}><option value="">{g(lang, "noVoucher")}</option>{myVouchers.map((v) => <option key={v.id} value={v.id}>{state.rewards.find((r) => r.id === v.rewardId)?.name[lang]}</option>)}</select></label>}
                </div>
              ) : <div className="rounded-2xl bg-white p-4 text-[14px] text-pine/70 ring-1 ring-pine/10"><Icon name="star" size={16} className="mr-1.5 inline text-brass" />{g(lang, "signInForRate")} — <button onClick={() => setStep(3)} className="font-semibold text-brass">{g(lang, "signIn")}</button></div>}
              <button onClick={next} className="h-12 w-full rounded-xl bg-pine text-[15px] font-semibold text-cream">{g(lang, "continue")}</button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              {!account && <AuthPanel lang={lang} compact />}
              <div className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-pine/10 sm:grid-cols-2 sm:p-7">
                <h2 className="font-serif text-[24px] font-semibold sm:col-span-2">{g(lang, "guestDetails")}</h2>
                <label><span className={labG}>{g(lang, "first")} *</span><input className={inpG} value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} autoComplete="given-name" /></label>
                <label><span className={labG}>{g(lang, "last")}</span><input className={inpG} value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} autoComplete="family-name" /></label>
                <label><span className={labG}>{g(lang, "phone")} *</span><input className={inpG} value={f.phone} inputMode="tel" placeholder="+374 …" onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
                <label><span className={labG}>{g(lang, "email")}</span><input className={inpG} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
                <label className="sm:col-span-2"><span className={labG}>{g(lang, "requests")}</span><textarea className={cn(inpG, "h-24 py-3")} value={f.requests} onChange={(e) => setF({ ...f, requests: e.target.value })} /></label>
                <p className="text-[12px] text-pine/50 sm:col-span-2">{lang === "hy" ? "Ցուցադրական կայք. մի մուտքագրեք իրական անձնական տվյալներ։" : lang === "ru" ? "Демо-сайт: не вводите реальные личные данные." : "Demo site: please don't enter real personal data."}</p>
                <button disabled={!detailsOk} onClick={next} className="h-12 rounded-xl bg-pine text-[15px] font-semibold text-cream disabled:opacity-40 sm:col-span-2">{g(lang, "continue")}</button>
              </div>
            </div>
          )}
          {step === 4 && calc && typeId && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-pine/10 sm:p-7">
                <h2 className="font-serif text-[26px] font-semibold">{g(lang, "breakdown")}</h2>
                <ul className="mt-3 space-y-2 text-[14.5px]">{calc.lines.map((l, i) => <li key={i} className={cn("flex justify-between gap-3", l.kind === "discount" && "text-brass")}><span>{l.label[lang]}</span><span className="tnum">{l.amount < 0 ? "−" : ""}{amd(Math.abs(l.amount))}</span></li>)}</ul>
                <div className="mt-3 flex justify-between border-t border-pine/10 pt-3 text-[18px] font-semibold"><span>{g(lang, "total")}</span><span className="tnum">{amd(calc.total)}</span></div>
                {calc.vatIncluded > 0 && <div className="mt-1 flex justify-between text-[12.5px] text-pine/55"><span>{lang === "hy" ? "այդ թվում ԱԱՀ 20%" : lang === "ru" ? "в т.ч. НДС 20%" : "incl. VAT 20%"}</span><span className="tnum">{amd(calc.vatIncluded)}</span></div>}
                <div className="mt-1 text-[12.5px] text-pine/55">{d.includes}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 text-[13.5px] ring-1 ring-pine/10"><div className="mb-1 font-semibold">{g(lang, "policy")}</div><p className="text-pine/65">{CANCELLATION[lang]}</p></div>
                <div className="rounded-2xl bg-white p-4 text-[13.5px] ring-1 ring-pine/10"><div className="mb-1 font-semibold">{g(lang, "payment")}</div><p className="text-pine/65">{g(lang, "paymentNote")}</p></div>
              </div>
              <button onClick={() => {
                const ev = dispatch({ type: "booking.create", source: "website", input: { guest: { firstName: f.first.trim(), lastName: f.last.trim(), phone: f.phone.trim(), email: f.email.trim(), lang }, guestId: account?.guestId, typeId, rooms, checkIn, checkOut, adults, children, extras: Object.entries(extras).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty })), voucherId: voucherId || undefined, offerId: offer?.id, requests: f.requests.trim() } });
                setSent(`r-${ev.id}`); window.scrollTo({ top: 0, behavior: "smooth" });
              }} className="h-13 w-full rounded-xl bg-pine py-4 text-[16px] font-semibold text-cream transition hover:bg-pine-2">{g(lang, "submit")}</button>
            </div>
          )}
        </div>
      </div>
      <aside className="h-fit space-y-3 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-pine/10">
          {typeId && <div className="relative aspect-[16/10]"><Image src={roomType(typeId).photos[0]} alt="" fill sizes="360px" className="object-cover" /></div>}
          <div className="p-5 text-[14px]">
            <div className="font-serif text-[22px] font-semibold">{typeId ? roomType(typeId).name[lang] + (rooms > 1 ? ` × ${rooms}` : "") : g(lang, "bk2")}</div>
            <div className="mt-1 text-pine/65">{dLang(checkIn, lang)} – {dLang(checkOut, lang)} · {nights} {d.nights} · {adults + children} {d.guestsShort}</div>
            {calc && <div className="mt-4 flex items-end justify-between border-t border-pine/10 pt-4"><span>{g(lang, "total")}</span><span className="tnum text-[22px] font-semibold">{amd(calc.total)}</span></div>}
            {calc && calc.discount > 0 && <div className="mt-1 text-right text-[12.5px] text-brass">−{amd(calc.discount)}</div>}
            {account && <div className="mt-3 rounded-xl bg-[#fffaf0] px-3 py-2 text-[12.5px] text-brass">{g(lang, "memberRate")}</div>}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Booking({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
      <h1 className="mb-6 font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">{t(lang).bookTitle}</h1>
      <Suspense><Journey lang={lang} /></Suspense>
    </div>
  );
}
