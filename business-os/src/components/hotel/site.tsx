"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, nextFriday } from "@/lib/dates";
import { amd } from "@/lib/format";
import { HOTEL } from "@/lib/hotel-data";
import { fromRate } from "@/lib/pricing";
import { LANGS, t } from "@/lib/site-i18n";
import { g } from "@/lib/guest-i18n";
import { useGuestSession } from "@/lib/client/guest-session";
import type { Lang, RoomType } from "@/lib/types";
import { Icon } from "../icons";
import { cn } from "../ui";

export function Logo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className={cn("flex flex-col leading-none", light ? "text-cream" : "text-pine")}>
      <span className={cn("font-serif font-semibold tracking-[0.18em]", small ? "text-lg" : "text-xl")}>PINE RIDGE</span>
      <span className={cn("mt-1 text-[9.5px] font-medium uppercase tracking-[0.32em]", light ? "text-cream/70" : "text-pine/60")}>Hotel & Spa</span>
    </span>
  );
}

export function LangSwitch({ lang, light }: { lang: Lang; light?: boolean }) {
  const path = usePathname();
  return (
    <div className={cn("flex items-center rounded-full border p-0.5 text-[12px] font-semibold", light ? "border-white/30" : "border-pine/20")}>
      {LANGS.map((l) => (
        <Link key={l} href={path.replace(/^\/hotel\/(hy|ru|en)/, `/hotel/${l}`)} className={cn("rounded-full px-2 py-1 uppercase transition", l === lang ? (light ? "bg-white text-pine" : "bg-pine text-cream") : light ? "text-white/80 hover:text-white" : "text-pine/70 hover:text-pine")}>
          {l === "hy" ? "Հայ" : l === "ru" ? "Рус" : "Eng"}
        </Link>
      ))}
    </div>
  );
}

export function SiteHeader({ lang, overlay }: { lang: Lang; overlay?: boolean }) {
  const d = t(lang);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const light = overlay && !scrolled && !open;
  const links: [string, string][] = [[`/hotel/${lang}/rooms`, d.nav.rooms], [`/hotel/${lang}/dining`, g(lang, "dining")], [`/hotel/${lang}#spa`, g(lang, "spaTitle").split(" ")[0]], [`/hotel/${lang}#offers`, d.nav.offers], [`/hotel/${lang}#location`, d.nav.location]];
  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-300", light ? "bg-transparent" : "border-b border-pine/10 bg-cream/95 backdrop-blur")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href={`/hotel/${lang}`} aria-label="Pine Ridge"><Logo light={light} /></Link>
        <nav className="hidden items-center gap-7 text-[14px] font-medium md:flex">
          {links.map(([href, label]) => <Link key={href} href={href} className={cn("transition", light ? "text-white/85 hover:text-white" : "text-pine/80 hover:text-pine")}>{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LangSwitch lang={lang} light={light} /></div>
          <AccountLink lang={lang} light={light} />
          <Link href={`/hotel/${lang}/booking`} className={cn("hidden h-10 items-center rounded-full px-5 text-[14px] font-semibold transition sm:inline-flex", light ? "bg-white text-pine hover:bg-cream" : "bg-pine text-cream hover:bg-pine-2")}>{d.nav.request}</Link>
          <button onClick={() => setOpen(!open)} className={cn("grid size-10 place-items-center rounded-full md:hidden", light ? "text-white" : "text-pine")} aria-label="Menu"><Icon name={open ? "x" : "menu"} size={22} /></button>
        </div>
      </div>
      {open && (
        <div className="border-t border-pine/10 bg-cream px-4 pb-5 pt-2 md:hidden">
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-pine/10 py-3.5 font-serif text-xl text-pine">{label}</Link>)}
          <div className="mt-4 flex items-center justify-between">
            <LangSwitch lang={lang} />
            <Link href={`/hotel/${lang}/booking`} onClick={() => setOpen(false)} className="inline-flex h-11 items-center rounded-full bg-pine px-6 font-semibold text-cream">{d.nav.request}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="bg-night text-cream/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div><Logo light /><p className="mt-4 max-w-xs text-sm text-cream/60">{d.tagline} · {HOTEL.town[lang]}</p></div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-cream">{d.contactTitle}</div>
          <div>{HOTEL.phone}</div><div>{HOTEL.email}</div><div className="mt-1 text-cream/60">{d.locationText}</div>
        </div>
        <p className="text-[12.5px] leading-relaxed text-cream/50">{d.footerDemo}</p>
      </div>
    </footer>
  );
}

export function BookingBar({ lang, compact }: { lang: Lang; compact?: boolean }) {
  const d = t(lang);
  const { state } = useDemo();
  const router = useRouter();
  const [checkIn, setIn] = useState("");
  const [checkOut, setOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  useEffect(() => {
    const f = nextFriday(state.baseDate, 6);
    setIn(f); setOut(addDays(f, 2));
  }, [state.baseDate]);
  const go = () => router.push(`/hotel/${lang}/booking?in=${checkIn}&out=${checkOut}&a=${adults}&c=${children}`);
  const cell = "flex min-w-0 flex-col gap-1 px-4 py-2.5";
  const lbl = "text-[11px] font-semibold uppercase tracking-[0.12em] text-pine/55";
  const inp = "w-full min-w-0 bg-transparent text-[15px] font-medium text-pine outline-none";
  return (
    <div className={cn("grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgb(15_27_23/0.18)] sm:grid-cols-[1fr_1fr_1fr_auto]", compact && "shadow-none ring-1 ring-pine/10")}>
      <label className={cn(cell, "border-b border-r border-pine/10 sm:border-b-0")}><span className={lbl}>{d.checkIn}</span><input type="date" className={inp} value={checkIn} min={state.baseDate} onChange={(e) => { setIn(e.target.value); if (e.target.value >= checkOut) setOut(addDays(e.target.value, 1)); }} /></label>
      <label className={cn(cell, "border-b border-pine/10 sm:border-b-0 sm:border-r")}><span className={lbl}>{d.checkOut}</span><input type="date" className={inp} value={checkOut} min={checkIn ? addDays(checkIn, 1) : undefined} onChange={(e) => setOut(e.target.value)} /></label>
      <div className={cn(cell, "col-span-2 border-b border-pine/10 sm:col-span-1 sm:border-b-0 sm:border-r")}>
        <span className={lbl}>{d.guests}</span>
        <div className="flex items-center gap-3 text-[15px] font-medium text-pine">
          <select aria-label={d.adults} className="bg-transparent outline-none" value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {d.adults.toLowerCase()}</option>)}</select>
          <select aria-label={d.children} className="bg-transparent outline-none" value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2].map((n) => <option key={n} value={n}>{n} {d.children.toLowerCase()}</option>)}</select>
        </div>
      </div>
      <button onClick={go} className="col-span-2 m-2 inline-flex h-12 sm:col-span-1 items-center justify-center gap-2 rounded-xl bg-pine px-6 text-[15px] font-semibold text-cream transition hover:bg-pine-2">{d.checkAvailability}<Icon name="arrowRight" size={17} /></button>
    </div>
  );
}

export function RoomCard({ room, lang }: { room: RoomType; lang: Lang }) {
  const d = t(lang);
  const { state } = useDemo();
  return (
    <Link href={`/hotel/${lang}/rooms/${room.slug}`} className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-pine/10 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(15_27_23/0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={room.photos[0]} alt={room.name[lang]} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-[23px] font-semibold leading-tight text-pine">{room.name[lang]}</h3>
        <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-pine/70">{room.short[lang]}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-pine/60">
          <span className="flex items-center gap-1"><Icon name="users" size={14} />{d.upTo} {room.capacity.adults + room.capacity.children} {d.guestsShort}</span>
          <span>{room.sizeM2} {d.m2}</span>
          <span className="flex items-center gap-1"><Icon name="view" size={14} />{room.view[lang]}</span>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-pine/10 pt-4">
          <div className="text-pine"><span className="text-[12px] text-pine/60">{d.from} </span><span className="tnum text-lg font-semibold">{amd(fromRate(room.id, state.baseDate))}</span><span className="text-[12px] text-pine/60"> {d.perNight}</span></div>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-brass">{d.details}<Icon name="arrowRight" size={15} /></span>
        </div>
      </div>
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, text, light }: { eyebrow?: string; title: string; text?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <div className={cn("mb-3 text-[12px] font-semibold uppercase tracking-[0.24em]", light ? "text-brass" : "text-brass")}>{eyebrow}</div>}
      <h2 className={cn("font-serif text-[34px] font-semibold leading-[1.08] sm:text-[44px]", light ? "text-cream" : "text-pine")}>{title}</h2>
      {text && <p className={cn("mt-4 text-[16px] leading-relaxed", light ? "text-cream/70" : "text-pine/70")}>{text}</p>}
    </div>
  );
}

function AccountLink({ lang, light }: { lang: Lang; light?: boolean }) {
  const { guest } = useGuestSession();
  return (
    <Link href={`/hotel/${lang}/account`} aria-label={g(lang, "account")} className={cn("flex h-10 items-center gap-2 rounded-full px-2.5 text-[13px] font-semibold transition", light ? "text-white hover:bg-white/10" : "text-pine hover:bg-pine/5")}>
      <span className={cn("grid size-7 place-items-center rounded-full text-[11px]", light ? "bg-white/15" : "bg-pine/10")}>{guest ? `${guest.firstName[0]}${guest.lastName[0] ?? ""}` : <Icon name="user" size={15} />}</span>
      <span className="hidden lg:inline">{guest ? guest.firstName : g(lang, "signIn")}</span>
    </Link>
  );
}
