"use client";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { BookingBar, RoomCard, SectionTitle } from "@/components/hotel/site";
import { Icon } from "@/components/icons";
import { Parallax, Reveal, Tilt } from "@/components/hotel/motion";
import { FaqList } from "@/components/hotel/faq";
import { amd } from "@/lib/format";
import { g } from "@/lib/guest-i18n";
import { LOYALTY } from "@/lib/hospitality-data";
import { ATTRACTIONS, FACILITIES, HOTEL, OFFERS, ROOM_TYPES } from "@/lib/hotel-data";
import { t } from "@/lib/site-i18n";
import type { Lang } from "@/lib/types";

const state0Menu = ["/img/food/steak.jpg", "/img/food/salmon.jpg", "/img/food/cake.jpg"];

export default function HotelHome({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const d = t(lang);
  return (
    <>
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden pb-10 pt-28 sm:pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden"><Parallax speed={0.18}><Image src="/img/hero-snow.jpg" alt="" fill priority sizes="100vw" className="hero-zoom object-cover" /></Parallax></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/55 via-night/25 to-night/75" />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="hero-in mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-cream/85"><Icon name="pin" size={14} />{HOTEL.town[lang]} · {"★".repeat(HOTEL.stars)}</div>
          <h1 style={{ animationDelay: "120ms" }} className="hero-in max-w-3xl font-serif text-[38px] font-semibold leading-[1.04] text-white sm:text-[68px]">{d.heroTitle}</h1>
          <p style={{ animationDelay: "240ms" }} className="hero-in mt-4 max-w-xl text-[16px] leading-relaxed text-cream/85 sm:mt-5 sm:text-[17px]">{d.heroText}</p>
          <div style={{ animationDelay: "380ms" }} className="hero-in mt-6 max-w-4xl sm:mt-8"><BookingBar lang={lang} /></div>
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
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{ROOM_TYPES.slice(0, 3).map((r, i) => <Reveal key={r.id} delay={i * 90}><RoomCard room={r} lang={lang} /></Reveal>)}</div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">{ROOM_TYPES.slice(3).map((r, i) => <Reveal key={r.id} delay={i * 90}><RoomCard room={r} lang={lang} /></Reveal>)}</div>
        </div>
      </section>

      <section id="offers" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle title={d.offersTitle} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal as="article" key={o.id} delay={i * 90} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-pine/10">
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
            </Reveal>
          ))}
        </div>
      </section>

      <section id="spa" className="relative isolate overflow-hidden bg-night py-24 text-cream">
        <div className="absolute inset-0 -z-10 opacity-35"><Parallax speed={0.1}><Image src="/img/spa-2.jpg" alt="" fill sizes="100vw" className="object-cover" /></Parallax></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/85 to-night/40" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <SectionTitle eyebrow={g(lang, "spaHours")} title={g(lang, "spaTitle")} text={g(lang, "spaText")} light />
            <ul className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              {(["spaPool", "spaSauna", "spaMassage"] as const).map((k) => <li key={k} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-[14.5px] font-medium backdrop-blur">{g(lang, k)}</li>)}
            </ul>
            <Link href={`/hotel/${lang}/booking`} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cream px-6 text-[15px] font-semibold text-pine">{g(lang, "bookSpa")}<Icon name="arrowRight" size={16} /></Link>
          </Reveal>
          <Tilt>
            <div className="grid grid-cols-5 gap-3">
              <Reveal className="col-span-3"><div className="reveal-img relative aspect-[3/4] overflow-hidden rounded-3xl"><Image src="/img/spa-1.jpg" alt="" fill sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" /></div></Reveal>
              <Reveal delay={160} className="col-span-2 mt-16"><div className="reveal-img relative aspect-[3/4] overflow-hidden rounded-3xl"><Image src="/img/bathroom.jpg" alt="" fill sizes="(min-width: 768px) 20vw, 40vw" className="object-cover" /></div></Reveal>
            </div>
          </Tilt>
        </div>
      </section>

      <section id="dining" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1.1fr_1fr]">
        <Reveal><div className="reveal-img relative aspect-[5/4] overflow-hidden rounded-3xl"><Image src="/img/dining.jpg" alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" /></div></Reveal>
        <Reveal delay={120}>
          <SectionTitle eyebrow={g(lang, "dining")} title={g(lang, "diningSection")} text={g(lang, "diningSectionText")} />
          <div className="mt-6 flex gap-3">
            {state0Menu.map((src) => <div key={src} className="relative size-20 overflow-hidden rounded-2xl ring-1 ring-pine/10 sm:size-24"><Image src={src} alt="" fill sizes="96px" className="object-cover" /></div>)}
          </div>
          <Link href={`/hotel/${lang}/dining`} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-pine px-6 text-[15px] font-semibold text-cream">{g(lang, "viewMenu")}<Icon name="arrowRight" size={16} /></Link>
        </Reveal>
      </section>

      <section id="circle" className="bg-cream-2/60 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><SectionTitle eyebrow={g(lang, "membershipTitle")} title={g(lang, "joinTitle")} text={g(lang, "membershipText")} /></Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LOYALTY.tiers.map((tr, i) => (
              <Reveal key={tr.id} delay={i * 70}>
                <Tilt max={7}>
                  <div className="relative h-44 overflow-hidden rounded-3xl p-5 text-white shadow-[0_18px_40px_rgb(15_27_23/0.18)]" style={{ background: `linear-gradient(135deg, ${tr.color}, #0f1b17 140%)` }}>
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">Pine Ridge Circle</div>
                    <div className="mt-2 font-serif text-[26px] font-semibold">{tr.name[lang]}</div>
                    <div className="absolute bottom-5 left-5 right-5 text-[13px] text-white/85">{tr.minPoints ? `${tr.minPoints.toLocaleString("en-US")}+ ${g(lang, "points")}` : g(lang, "joinNow")}{tr.discountPct ? ` · ${tr.discountPct}% ${g(lang, "tierDiscount")}` : ""}</div>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 flex flex-wrap items-center gap-4"><Link href={`/hotel/${lang}/account`} className="inline-flex h-12 items-center rounded-full bg-pine px-6 text-[15px] font-semibold text-cream">{g(lang, "joinNow")} · +{LOYALTY.welcomeBonus} {g(lang, "points")}</Link><span className="text-[14px] text-pine/65">{LOYALTY.earnPer1000} {g(lang, "perAmd")}</span></Reveal>
        </div>
      </section>

      <section id="facilities" className="bg-night py-20 text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle title={d.facilitiesTitle} light />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((f, i) => (
              <Reveal as="article" key={f.id} delay={i * 80}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={f.photo} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div>
                <h3 className="mt-4 font-serif text-[22px] font-semibold">{f.title[lang]}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-cream/65">{f.text[lang]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 pt-24 sm:px-6">
        <Reveal><SectionTitle title={g(lang, "faqTitle")} /></Reveal>
        <Reveal className="mt-8"><FaqList lang={lang} /></Reveal>
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
