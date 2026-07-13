"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { addOns, type AddOn } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

export default function AddOns() {
  const { t, money } = useI18n();

  const priceOf = (a: AddOn) => {
    const base = money(a.priceUsd);
    const P = t.addons.price;
    switch (a.priceType) {
      case "moUsage":
        return `${base}${P.perMo} ${P.plusUsage}`;
      case "moRev":
        return `${base}${P.perMo} ${P.orRevShare}`;
      case "once":
        return `${base} ${P.oneTime}`;
      case "from":
        return `${P.from} ${base}`;
      default:
        return `${base}${P.perMo}`;
    }
  };

  return (
    <section id="add-ons" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute bottom-10 right-[-8%] h-[24rem] w-[24rem] rounded-full bg-blush-300/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.18em] text-cocoa-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rosegold-400" aria-hidden="true" />
            {t.addons.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.12] tracking-tight text-cocoa-600 sm:text-4xl lg:text-5xl">
            {t.addons.titleA} <span className="text-gradient-brand">{t.addons.titleAccent}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cocoa-400 sm:text-lg">{t.addons.sub}</p>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {addOns.map((addon, i) => {
            const { id, icon: Icon } = addon;
            const item = t.addons.items[id as keyof typeof t.addons.items];
            const badge = "badge" in item ? item.badge : undefined;
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group glass-card flex h-full flex-col rounded-4xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cocoa-grad shadow-glow-gold transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5.5 w-5.5 text-blush-200" aria-hidden="true" />
                    </span>
                    {badge && (
                      <span className="rounded-full bg-rosegold-200/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cocoa-600">{badge}</span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-base font-bold text-cocoa-600">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cocoa-400">{item.description}</p>

                  <p className="mt-3 flex items-start gap-1.5 text-xs font-medium leading-snug text-cocoa-500">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rosegold-400" aria-hidden="true" />
                    {item.benefit}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="font-display text-base font-bold text-cocoa-600">{priceOf(addon)}</span>
                    <a href="#contact" aria-label={`${t.addons.add} — ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full bg-blush-200 text-cocoa-500 transition-all duration-200 hover:bg-cocoa-500 hover:text-blush-200">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-8 overflow-hidden rounded-5xl bg-cocoa-grad p-8 shadow-lift sm:p-12"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-rosegold-300/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-rosegold-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t.addons.entEyebrow}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-cream-50 sm:text-3xl">{t.addons.entTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-blush-100">{t.addons.entSub}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col xl:flex-row">
              <a href="#contact" className="btn bg-white text-cocoa-600 hover:bg-blush-100">
                {t.addons.entCta1}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#contact" className="btn border border-white/40 bg-white/10 text-cream-50 hover:bg-white/20">
                {t.addons.entCta2}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
