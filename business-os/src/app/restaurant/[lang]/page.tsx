"use client";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { Icon } from "@/components/icons";
import { ChatWidget } from "@/components/restaurant/guest/chat";
import { GuestShell, money, RESERVE, useReveal } from "@/components/restaurant/guest/shell";
import { useR } from "@/lib/restaurant/client";
import { t } from "@/lib/restaurant/i18n";
import type { Lang } from "@/lib/restaurant/types";

const COPY = {
  eyebrow: { hy: "Ժամանակակից լեռնային խոհանոց · Ծաղկաձոր", ru: "Современная горная кухня · Цахкадзор", en: "Modern mountain kitchen · Tsaghkadzor" },
  fire: { hy: "Կրակ", ru: "Огонь", en: "Fire" },
  fireText: { hy: "Ամեն ինչ սկսվում է ծիրանենու փայտի կրակից։ Մեր խորովածը եփվում է դանդաղ, ինչպես մեր պապերն էին անում։", ru: "Всё начинается с огня на абрикосовых дровах. Наш хоровац готовится медленно — как это делали наши деды.", en: "Everything begins with an apricot-wood fire. Our khorovats cooks slowly, the way our grandparents did it." },
  tonir: { hy: "Թոնիր", ru: "Тонир", en: "Tonir" },
  tonirText: { hy: "Լավաշը թխվում է ամեն երեկո, ձեր աչքի առաջ։", ru: "Лаваш пекут каждый вечер, прямо у вас на глазах.", en: "Lavash is baked every evening, right in front of you." },
  mountain: { hy: "Լեռներ", ru: "Горы", en: "Mountain" },
  mountainText: { hy: "Ուրց, անանուխ, մասրենի՝ հավաքված Ծաղկաձորի լանջերից։", ru: "Чабрец, мята, шиповник — собранные на склонах Цахкадзора.", en: "Thyme, mint and rosehip gathered on the slopes around Tsaghkadzor." },
  atmosphere: { hy: "Մթնոլորտ", ru: "Атмосфера", en: "Atmosphere" },
  atmosphereText: { hy: "Բուխարու սրահ, առանձնասենյակ մինչև 14 հյուրի համար և ամառային տեռաս լեռների տեսարանով։", ru: "Каминный зал, приватный зал до 14 гостей и летняя терраса с видом на горы.", en: "A fireplace lounge, a private room for up to 14 guests and a summer terrace facing the mountains." },
  reservations: { hy: "Ամրագրումներ՝ հեռախոսով", ru: "Бронирование по телефону", en: "Reservations by phone" },
};
const c = (k: keyof typeof COPY, l: Lang) => COPY[k][l];

export default function RestaurantHome({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const { state } = useR();
  const ref = useReveal();
  const b = state.brand;
  const signature = ["khorovats", "ribeye", "cocktail"].map((id) => state.items.find((i) => i.id === id)!);
  return (
    <GuestShell lang={lang} overlay>
      <div ref={ref}>
        <section className="relative flex min-h-[100svh] items-end overflow-hidden">
          <Image src="/img/restaurant.jpg" alt="" fill priority sizes="100vw" className="rt-hero-img object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--rt-hero-overlay)" }} />
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
            <p className="rt-rise text-[12.5px] font-semibold uppercase tracking-[0.22em] text-[var(--rt-gold)]">{c("eyebrow", lang)}</p>
            <h1 className="rt-serif rt-rise rt-rise-2 mt-4 text-[64px] leading-[0.92] sm:text-[112px]">{b.name}</h1>
            <p className="rt-rise rt-rise-2 mt-4 max-w-xl text-[19px] text-[var(--rt-muted)] sm:text-[22px]">{b.tagline[lang]}</p>
            <div className="rt-rise rt-rise-3 mt-8 flex flex-wrap gap-3">
              <Link href={`/restaurant/${lang}/menu`} className="rt-btn rt-btn-accent">{t("menu", lang)}<Icon name="arrowRight" size={17} /></Link>
              <Link href={`/restaurant/${lang}/menu?mode=takeaway`} className="rt-btn rt-btn-ghost">{t("takeaway", lang)}</Link>
              <Link href={`/restaurant/${lang}/reserve`} className="rt-btn rt-btn-ghost">{RESERVE[lang]}</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:items-center md:py-28">
          <div className="rt-reveal">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.22em] text-[var(--rt-gold)]">{t("story", lang)}</p>
            <h2 className="rt-serif mt-3 text-[40px] leading-[1.05] sm:text-[52px]">{b.tagline[lang]}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--rt-muted)]">{b.story[lang]}</p>
          </div>
          <div className="rt-clip relative aspect-[4/5] overflow-hidden"><Image src="/img/food/skewers.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="rt-parallax object-cover" /></div>
        </section>

        <section className="border-y border-[var(--rt-line)] bg-[var(--rt-bg-2)]">
          <div className="mx-auto grid max-w-6xl gap-px px-5 sm:px-8 md:grid-cols-3">
            {(["fire", "tonir", "mountain"] as const).map((k, i) => (
              <div key={k} className="rt-reveal py-12 md:px-8" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="rt-serif text-[34px]">{c(k, lang)}</div>
                <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--rt-muted)]">{c(`${k}Text` as keyof typeof COPY, lang)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <h2 className="rt-serif rt-reveal text-[40px] sm:text-[52px]">{t("signature", lang)}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {signature.map((d, i) => (
              <Link key={d.id} href={`/restaurant/${lang}/menu`} className="rt-reveal group block" style={{ transitionDelay: `${i * 140}ms` }}>
                <div className="rt-clip relative aspect-[4/5] overflow-hidden">{d.photo && <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-[1.2s] group-hover:scale-[1.04]" />}</div>
                <div className="mt-4 flex items-baseline justify-between gap-3"><span className="rt-serif text-[24px]">{d.name[lang]}</span><span className="tnum text-[var(--rt-muted)]">{money(d.price)}</span></div>
                <p className="mt-1 text-[14.5px] text-[var(--rt-muted)]">{d.desc[lang]}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="grid grid-cols-2 gap-2 px-2 md:grid-cols-4">
            {["/img/dining.jpg", "/img/food/salmon.jpg", "/img/mountains.jpg", "/img/food/wine.jpg"].map((src, i) => (
              <div key={src} className={`rt-clip relative overflow-hidden ${i % 2 ? "aspect-[3/4]" : "aspect-[3/4] md:mt-16"}`}><Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="rt-parallax object-cover" /></div>
            ))}
          </div>
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
            <h2 className="rt-serif rt-reveal text-[40px] sm:text-[52px]">{c("atmosphere", lang)}</h2>
            <p className="rt-reveal mt-4 text-[17px] leading-relaxed text-[var(--rt-muted)]">{c("atmosphereText", lang)}</p>
          </div>
        </section>

        <section id="visit" className="border-t border-[var(--rt-line)] bg-[var(--rt-bg-2)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
            <div className="rt-reveal"><h2 className="rt-serif text-[36px]">{t("visit", lang)}</h2><p className="mt-3 text-[var(--rt-muted)]">{b.address[lang]}</p><a className="mt-4 inline-flex items-center gap-2 text-[var(--rt-accent)]" href="https://www.google.com/maps/search/?api=1&query=Tsaghkadzor" target="_blank" rel="noreferrer"><Icon name="pin" size={16} />{t("directions", lang)}</a></div>
            <div className="rt-reveal"><div className="text-[12.5px] font-semibold uppercase tracking-[0.22em] text-[var(--rt-gold)]">{t("hours", lang)}</div><ul className="mt-3 space-y-1.5">{b.hours.map((h) => <li key={h.open + h.close} className="flex justify-between gap-4 border-b border-[var(--rt-line)] pb-1.5"><span>{h.days[lang]}</span><span className="tnum text-[var(--rt-muted)]">{h.open}–{h.close}</span></li>)}</ul></div>
            <div className="rt-reveal"><div className="text-[12.5px] font-semibold uppercase tracking-[0.22em] text-[var(--rt-gold)]">{c("reservations", lang)}</div><p className="mt-3 text-[20px]">{b.phone}</p><p className="text-[var(--rt-muted)]">{b.email}</p>
              <Link href={`/restaurant/${lang}/menu?mode=takeaway`} className="rt-btn rt-btn-accent mt-6">{t("takeaway", lang)}<Icon name="arrowRight" size={17} /></Link></div>
          </div>
        </section>
      </div>
      <ChatWidget lang={lang} />
    </GuestShell>
  );
}
