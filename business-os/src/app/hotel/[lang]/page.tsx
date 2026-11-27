"use client";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { BookingBar, RoomCard, SectionTitle } from "@/components/hotel/site";
import { Icon } from "@/components/icons";
import { amd } from "@/lib/format";
import { ATTRACTIONS, FACILITIES, HOTEL, OFFERS, ROOM_TYPES } from "@/lib/hotel-data";
import { t } from "@/lib/site-i18n";
import type { Lang } from "@/lib/types";

export default function HotelHome({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const d = t(lang);
  return (
    <>
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden pb-10 pt-28 sm:pb-16">
        <Image src="/img/hero-snow.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/55 via-night/25 to-night/75" />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-cream/85"><Icon name="pin" size={14} />{HOTEL.town[lang]} · {"★".repeat(HOTEL.stars)}</div>
          <h1 className="max-w-3xl font-serif text-[38px] font-semibold leading-[1.04] text-white sm:text-[68px]">{d.heroTitle}</h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-cream/85 sm:mt-5 sm:text-[17px]">{d.heroText}</p>
          <div className="mt-6 max-w-4xl sm:mt-8"><BookingBar lang={lang} /></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <SectionTitle eyebrow={HOTEL.fullName} title={d.introTitle} text={d.introText} />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-pine/10 ring-1 ring-pine/10">
          {d.stats.map(([n, l]) => (
            <div key={l} className="bg-cream p-6"><div className="font-serif text-[38px] font-semibold leading-none text-pine">{n}</div><div className="mt-2 text-[14px] text-pine/65">{l}</div></div>
          ))}
        </div>
      </section>

      <section id="rooms" className="bg-cream-2/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><SectionTitle title={d.roomsTitle} text={d.roomsText} /><Link href={`/hotel/${lang}/rooms`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brass">{d.allRooms}<Icon name="arrowRight" size={16} /></Link></div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{ROOM_TYPES.slice(0, 3).map((r) => <RoomCard key={r.id} room={r} lang={lang} />)}</div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">{ROOM_TYPES.slice(3).map((r) => <RoomCard key={r.id} room={r} lang={lang} />)}</div>
        </div>
      </section>

      <section id="offers" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle title={d.offersTitle} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {OFFERS.map((o) => (
            <article key={o.id} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-pine/10">
              <div className="relative aspect-[16/10]"><Image src={o.photo} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>
              <div className="p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brass">{o.valid[lang]}</div>
                <h3 className="mt-2 font-serif text-[24px] font-semibold leading-tight">{o.title[lang]}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-pine/70">{o.text[lang]}</p>
                <div className="mt-4 flex items-end justify-between border-t border-pine/10 pt-4">
                  <div><span className="text-[12px] text-pine/60">{d.from} </span><span className="tnum text-lg font-semibold">{amd(o.priceFrom)}</span><span className="block text-[12px] text-pine/60">{o.unit[lang]}</span></div>
                  <Link href={`/hotel/${lang}/booking?offer=${o.id}`} className="inline-flex h-10 items-center rounded-full bg-pine px-4 text-[13px] font-semibold text-cream">{d.nav.request}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="facilities" className="bg-night py-20 text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle title={d.facilitiesTitle} light />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((f) => (
              <article key={f.id}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={f.photo} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
                <h3 className="mt-4 font-serif text-[22px] font-semibold">{f.title[lang]}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-cream/65">{f.text[lang]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
        <div>
          <SectionTitle title={d.locationTitle} text={d.locationText} />
          <ul className="mt-8 divide-y divide-pine/10 border-y border-pine/10">
            {ATTRACTIONS.map((a) => <li key={a.name.en} className="flex items-center justify-between gap-4 py-3.5 text-[15px]"><span>{a.name[lang]}</span><span className="text-pine/60">{a.distance[lang]}</span></li>)}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3 text-[14px] font-semibold">
            <a href={`tel:${HOTEL.phone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-cream"><Icon name="phone" size={16} />{d.call}</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex h-11 items-center gap-2 rounded-full border border-pine/25 px-5" title="Demo"><Icon name="message" size={16} />{d.write}</a>
          </div>
        </div>
        <a href="https://www.google.com/maps/search/?api=1&query=Tsaghkadzor%2C%20Armenia" target="_blank" rel="noreferrer" className="group relative block min-h-[320px] overflow-hidden rounded-2xl ring-1 ring-pine/10">
          <Image src="/img/mountains.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-cream">
            <div><div className="font-serif text-2xl font-semibold">{HOTEL.town[lang]}</div><div className="text-[13px] text-cream/75">{ATTRACTIONS[3].distance[lang]}</div></div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-pine">{d.openMap}<Icon name="external" size={14} /></span>
          </div>
        </a>
      </section>
    </>
  );
}
