"use client";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AMENITY_ICON, Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, nextFriday } from "@/lib/dates";
import { amd, dLang } from "@/lib/format";
import { AMENITY_LABEL, ROOM_TYPES } from "@/lib/hotel-data";
import { fitsGuests, freeRooms, quote } from "@/lib/pricing";
import { t } from "@/lib/site-i18n";
import type { Lang } from "@/lib/types";

export default function RoomDetail({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = use(params);
  const room = ROOM_TYPES.find((r) => r.slug === slug);
  if (!room) notFound();
  const d = t(lang);
  const { state } = useDemo();
  const router = useRouter();
  const [photo, setPhoto] = useState<number | null>(null);
  const [checkIn, setIn] = useState("");
  const [checkOut, setOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  useEffect(() => { const f = nextFriday(state.baseDate, 6); setIn(f); setOut(addDays(f, 2)); }, [state.baseDate]);
  const valid = checkIn && checkOut > checkIn;
  const q = valid ? quote(room.id, checkIn, checkOut) : null;
  const fits = fitsGuests(room.id, adults, children);
  const free = valid ? freeRooms(state, room.id, checkIn, checkOut).length : 0;
  const inp = "h-11 w-full rounded-xl border border-pine/15 bg-white px-3 text-[15px] outline-none focus:border-pine/40";
  return (
    <div className="pb-20 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link href={`/hotel/${lang}/rooms`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-pine/60 hover:text-pine"><Icon name="chevronLeft" size={16} />{d.allRooms}</Link>
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
          {room.photos.map((p, i) => (
            <button key={p + i} onClick={() => setPhoto(i)} className={cn("relative overflow-hidden rounded-2xl", i === 0 ? "aspect-[4/3] sm:row-span-2 sm:aspect-auto" : "hidden aspect-[4/3] sm:block")}>
              <Image src={p} alt={room.name[lang]} fill priority={i === 0} sizes={i === 0 ? "(min-width: 640px) 66vw, 100vw" : "33vw"} className="object-cover transition duration-500 hover:scale-[1.03]" />
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">{room.name[lang]}</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-pine/75">{room.description[lang]}</p>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-pine/10 ring-1 ring-pine/10 sm:grid-cols-4">
              {[[d.size, `${room.sizeM2} ${d.m2}`], [d.capacity, `${d.upTo} ${room.capacity.adults + room.capacity.children} ${d.guestsShort}`], [d.bed, room.bed[lang]], [d.view, room.view[lang]]].map(([k, v]) => (
                <div key={k} className="bg-cream p-4"><dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-pine/50">{k}</dt><dd className="mt-1.5 text-[15px] font-medium">{v}</dd></div>
              ))}
            </dl>
            <h2 className="mt-10 font-serif text-[26px] font-semibold">{d.amenities}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.amenities.map((a) => <li key={a} className="flex items-center gap-2.5 text-[15px]"><span className="grid size-9 place-items-center rounded-full bg-white text-brass ring-1 ring-pine/10"><Icon name={AMENITY_ICON[a]} size={17} /></span>{AMENITY_LABEL[a][lang]}</li>)}
            </ul>
            <h2 className="mt-10 font-serif text-[26px] font-semibold">{d.policies}</h2>
            <ul className="mt-3 space-y-1.5 text-[15px] text-pine/75">
              <li>{d.checkInFrom} {state.kb.checkIn} · {d.checkOutUntil} {state.kb.checkOut}</li>
              <li>{d.includes} · {state.kb.breakfast}</li>
              {state.kb.pets === "allowed_small" && <li>{d.petsOk}</li>}
            </ul>
          </div>
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-[0_18px_40px_rgb(15_27_23/0.1)] ring-1 ring-pine/10 lg:sticky lg:top-24">
            <div className="font-serif text-[22px] font-semibold">{d.priceForDates}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <label><span className="mb-1 block text-[12px] font-semibold text-pine/55">{d.checkIn}</span><input type="date" className={inp} value={checkIn} min={state.baseDate} onChange={(e) => { setIn(e.target.value); if (e.target.value >= checkOut) setOut(addDays(e.target.value, 1)); }} /></label>
              <label><span className="mb-1 block text-[12px] font-semibold text-pine/55">{d.checkOut}</span><input type="date" className={inp} value={checkOut} min={checkIn ? addDays(checkIn, 1) : undefined} onChange={(e) => setOut(e.target.value)} /></label>
              <label><span className="mb-1 block text-[12px] font-semibold text-pine/55">{d.adults}</span><select className={inp} value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
              <label><span className="mb-1 block text-[12px] font-semibold text-pine/55">{d.children}</span><select className={inp} value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2].map((n) => <option key={n}>{n}</option>)}</select></label>
            </div>
            {q && (
              <div className="mt-4 space-y-1.5 border-t border-pine/10 pt-4 text-[14px]">
                {q.perNight.map((n) => <div key={n.date} className="flex justify-between text-pine/70"><span>{dLang(n.date, lang, { weekday: "short", day: "numeric", month: "short" })}</span><span className="tnum">{amd(n.rate)}</span></div>)}
                <div className="flex justify-between border-t border-pine/10 pt-2 text-[16px] font-semibold"><span>{d.total} · {q.nights} {d.nights}</span><span className="tnum">{amd(q.total)}</span></div>
                <div className="text-[12.5px] text-pine/55">{d.includes}</div>
              </div>
            )}
            <div className={cn("mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium", !fits ? "bg-red-50 text-red-800" : free ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
              <Icon name={!fits ? "alert" : free ? "check" : "info"} size={16} />{!fits ? d.tooMany : free ? d.availableNow : d.notAvailable}
            </div>
            <button disabled={!valid || !fits} onClick={() => router.push(`/hotel/${lang}/book?in=${checkIn}&out=${checkOut}&a=${adults}&c=${children}&room=${room.id}`)} className="mt-4 h-12 w-full rounded-xl bg-pine text-[15px] font-semibold text-cream transition hover:bg-pine-2 disabled:opacity-40">{d.requestThisRoom}</button>
          </aside>
        </div>
      </div>
      {photo !== null && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-night/95 p-4" onClick={() => setPhoto(null)}>
          <div className="relative aspect-[3/2] w-full max-w-5xl"><Image src={room.photos[photo]} alt="" fill sizes="100vw" className="rounded-xl object-contain" /></div>
          <div className="absolute bottom-6 flex gap-2">{room.photos.map((_, i) => <button key={i} onClick={(e) => { e.stopPropagation(); setPhoto(i); }} className={cn("size-2.5 rounded-full", i === photo ? "bg-white" : "bg-white/35")} aria-label={`Photo ${i + 1}`} />)}</div>
          <button className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close"><Icon name="x" size={22} /></button>
        </div>
      )}
    </div>
  );
}
