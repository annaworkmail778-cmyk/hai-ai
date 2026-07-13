"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const order = [
  { key: "maria", initials: "MP" },
  { key: "daniel", initials: "DR" },
  { key: "sophie", initials: "SL" },
] as const;

export default function Testimonials() {
  const { t } = useI18n();
  return (
    <section id="testimonials" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute bottom-10 left-[-8%] h-[24rem] w-[24rem] rounded-full bg-rosegold-200/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={
            <>
              {t.testimonials.titleA} <span className="text-gradient-brand">{t.testimonials.titleAccent}</span>
            </>
          }
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {order.map(({ key, initials }, i) => {
            const item = t.testimonials.items[key];
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <figure className="glass-card relative flex h-full flex-col rounded-4xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-blush-300/70" aria-hidden="true" />
                  <div className="flex gap-1" aria-label="5 / 5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-rosegold-400 text-rosegold-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-cocoa-500">&ldquo;{item.quote}&rdquo;</blockquote>
                  <p className="mt-5">
                    <span className="inline-block rounded-full bg-cocoa-grad px-3.5 py-1.5 font-display text-xs font-bold text-blush-200">{item.metric}</span>
                  </p>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-blush-200/80 pt-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-cocoa-grad font-display text-sm font-bold text-blush-200">{initials}</span>
                    <div>
                      <p className="font-display text-sm font-bold text-cocoa-600">{item.name}</p>
                      <p className="text-xs font-medium text-cocoa-300">{item.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
