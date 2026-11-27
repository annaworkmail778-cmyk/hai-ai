"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, nextFriday } from "@/lib/dates";
import { amd, dLang } from "@/lib/format";
import { OFFERS, ROOM_TYPES, roomType } from "@/lib/hotel-data";
import { fitsGuests, freeRooms, quote } from "@/lib/pricing";
import { t } from "@/lib/site-i18n";
import type { Lang, RoomTypeId } from "@/lib/types";

function BookForm({ lang }: { lang: Lang }) {
  const d = t(lang);
  const sp = useSearchParams();
  const { state, dispatch } = useDemo();
  const def = nextFriday(state.baseDate, 6);
  const offer = OFFERS.find((o) => o.id === sp.get("offer"));
  const [checkIn, setIn] = useState(sp.get("in") ?? def);
  const [checkOut, setOut] = useState(sp.get("out") ?? addDays(def, 2));
  const [adults, setAdults] = useState(Number(sp.get("a") ?? 2));
  const [children, setChildren] = useState(Number(sp.get("c") ?? 0));
  const [typeId, setType] = useState<RoomTypeId>((sp.get("room") as RoomTypeId) || (offer?.id === "ski-weekend" ? "deluxe" : "classic"));
  const [f, setF] = useState({ firstName: "", lastName: "", phone: "", email: "", message: offer ? `${offer.title[lang]}` : "" });
  const [consent, setConsent] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const valid = checkIn < checkOut;
  const q = valid ? quote(typeId, checkIn, checkOut) : null;
  const fits = fitsGuests(typeId, adults, children);
  const free = valid ? freeRooms(state, typeId, checkIn, checkOut).length : 0;
  const ok = valid && fits && f.firstName.trim() && f.phone.replace(/\D/g, "").length >= 6 && consent;
  const night = state.clock.mode === "night";

  if (sentId) {
    const res = state.reservations.find((r) => r.id === sentId);
    return (
      <div className="rise-in mx-auto max-w-2xl rounded-3xl bg-white p-6 text-center shadow-[0_18px_40px_rgb(15_27_23/0.1)] ring-1 ring-pine/10 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-pine text-cream"><Icon name="check" size={26} /></span>
        <h1 className="mt-5 font-serif text-[36px] font-semibold leading-tight">{d.sentTitle}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-relaxed text-pine/75">{d.sentText}</p>
        {night && <p className="mx-auto mt-3 max-w-md rounded-xl bg-cream px-4 py-3 text-[14px] text-pine/80"><Icon name="moon" size={15} className="mr-1.5 inline" />{d.sentNight}</p>}
        {res && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-dashed border-brass/50 bg-[#fffaf0] p-4 text-left text-[14px]">
            <div className="flex justify-between"><span className="text-pine/60">{d.reference}</span><span className="font-semibold">{res.code}</span></div>
            <div className="mt-1.5 flex justify-between"><span className="text-pine/60">{d.room}</span><span>{roomType(res.typeId).name[lang]}</span></div>
            <div className="mt-1.5 flex justify-between"><span className="text-pine/60">{d.checkIn} – {d.checkOut}</span><span>{dLang(res.checkIn, lang)} – {dLang(res.checkOut, lang)}</span></div>
            <div className="mt-1.5 flex justify-between"><span className="text-pine/60">{d.total}</span><span className="tnum font-semibold">{amd(res.total)}</span></div>
            <div className="mt-3 rounded-lg bg-amber-50 px-2.5 py-1.5 text-center text-[12.5px] font-semibold text-amber-800">{res.status === "confirmed" ? (lang === "hy" ? "Հաստատված է ընդունարանի կողմից" : lang === "ru" ? "Подтверждено ресепшн" : "Confirmed by reception") : lang === "hy" ? "Սպասում է ընդունարանի հաստատմանը" : lang === "ru" ? "Ожидает подтверждения ресепшн" : "Awaiting confirmation by reception"}</div>
          </div>
        )}
        <div className="mx-auto mt-8 max-w-sm text-left">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-brass">{d.nextSteps}</div>
          {[d.step1, d.step2, d.step3].map((s, i) => <div key={s} className="flex gap-3 py-1.5 text-[14.5px]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-pine/10 text-[12px] font-semibold">{i + 1}</span>{s}</div>)}
        </div>
        <Link href={`/hotel/${lang}`} className="mt-8 inline-flex h-11 items-center rounded-full border border-pine/25 px-6 text-[14px] font-semibold">{d.backHome}</Link>
      </div>
    );
  }

  const inp = "h-12 w-full rounded-xl border border-pine/15 bg-white px-3.5 text-[15px] outline-none transition focus:border-pine/45";
  const lab = "mb-1.5 block text-[12.5px] font-semibold text-pine/60";
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={(e) => { e.preventDefault(); setTouched(true); if (!ok) return; const ev = dispatch({ type: "inquiry.create", guest: { firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim(), email: f.email.trim(), lang }, typeId, checkIn, checkOut, adults, children, requests: f.message.trim(), source: "website" }); setSentId(`r-${ev.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-3xl bg-white p-5 ring-1 ring-pine/10 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={lab}>{d.checkIn}</span><input type="date" required className={inp} value={checkIn} min={state.baseDate} onChange={(e) => { setIn(e.target.value); if (e.target.value >= checkOut) setOut(addDays(e.target.value, 1)); }} /></label>
          <label><span className={lab}>{d.checkOut}</span><input type="date" required className={inp} value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setOut(e.target.value)} /></label>
          <label><span className={lab}>{d.adults}</span><select className={inp} value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label><span className={lab}>{d.children}</span><select className={inp} value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>
        <div className="mt-6"><span className={lab}>{d.room}</span>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ROOM_TYPES.map((r) => {
              const fit = fitsGuests(r.id, adults, children);
              const fr = valid ? freeRooms(state, r.id, checkIn, checkOut).length : 0;
              return (
                <button type="button" key={r.id} disabled={!fit} onClick={() => setType(r.id)} className={cn("flex items-center gap-3 rounded-2xl p-2 text-left ring-1 transition disabled:opacity-40", typeId === r.id ? "bg-pine-soft ring-2 ring-pine" : "bg-white ring-pine/15 hover:ring-pine/35")}>
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl"><Image src={r.photos[0]} alt="" fill sizes="56px" className="object-cover" /></span>
                  <span className="min-w-0"><span className="block truncate font-serif text-[17px] font-semibold">{r.name[lang]}</span><span className="tnum block text-[12.5px] text-pine/60">{valid ? amd(quote(r.id, checkIn, checkOut).total) : ""}{fit && valid ? <span className={fr ? "text-emerald-700" : "text-red-700"} style={{ color: fr ? "#17845b" : "#c2412f" }}> · {fr ? "✓" : "✕"}</span> : null}</span></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label><span className={lab}>{d.firstName} *</span><input className={cn(inp, touched && !f.firstName.trim() && "border-red-400")} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} autoComplete="given-name" /></label>
          <label><span className={lab}>{d.lastName}</span><input className={inp} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} autoComplete="family-name" /></label>
          <label><span className={lab}>{d.phone} *</span><input className={cn(inp, touched && f.phone.replace(/\D/g, "").length < 6 && "border-red-400")} value={f.phone} inputMode="tel" placeholder="+374 …" onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></label>
          <label><span className={lab}>{d.email}</span><input type="email" className={inp} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label className="sm:col-span-2"><span className={lab}>{d.message}</span><textarea className={cn(inp, "h-24 py-3")} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
        </div>
        <label className="mt-4 flex items-start gap-3 text-[14px] text-pine/75"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className={cn("mt-0.5 size-5 accent-[var(--color-pine)]", touched && !consent && "outline outline-2 outline-red-400")} />{d.consent}</label>
        <p className="mt-2 text-[12px] text-pine/50">{lang === "hy" ? "Ցուցադրական կայք. մի մուտքագրեք իրական անձնական տվյալներ։" : lang === "ru" ? "Демо-сайт: не вводите реальные личные данные." : "Demo site: please don't enter real personal data."}</p>
        <button type="submit" className="mt-6 h-13 w-full rounded-xl bg-pine py-3.5 text-[16px] font-semibold text-cream transition hover:bg-pine-2 sm:w-auto sm:px-10">{d.send}</button>
      </form>
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-pine/10">
          <div className="relative aspect-[16/10]"><Image src={roomType(typeId).photos[0]} alt="" fill sizes="360px" className="object-cover" /></div>
          <div className="p-5">
            <div className="font-serif text-[22px] font-semibold">{roomType(typeId).name[lang]}</div>
            {q && <div className="mt-1 text-[14px] text-pine/65">{dLang(checkIn, lang)} – {dLang(checkOut, lang)} · {q.nights} {d.nights} · {adults + children} {d.guestsShort}</div>}
            {q && <div className="mt-4 flex items-end justify-between border-t border-pine/10 pt-4"><span className="text-[14px]">{d.total}</span><span className="tnum text-[22px] font-semibold">{amd(q.total)}</span></div>}
            <div className="mt-1 text-[12.5px] text-pine/55">{d.includes}</div>
            <div className={cn("mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium", !fits ? "bg-red-50 text-red-800" : free ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}><Icon name={!fits ? "alert" : free ? "check" : "info"} size={16} />{!fits ? d.tooMany : free ? d.availableNow : d.notAvailable}</div>
          </div>
        </div>
        <p className="px-2 text-[13px] leading-relaxed text-pine/60">{d.bookText}</p>
      </aside>
    </div>
  );
}

export default function Book({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const d = t(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
      <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">{d.bookTitle}</h1>
      <p className="mb-8 mt-3 max-w-xl text-[16px] text-pine/70">{d.bookText}</p>
      <Suspense><BookForm lang={lang} /></Suspense>
    </div>
  );
}
