"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Headphones, TrendingUp, Wallet, Wrench } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const reasons = [
  { key: "time", icon: Clock },
  { key: "cost", icon: Wallet },
  { key: "always", icon: Headphones },
  { key: "smart", icon: Brain },
  { key: "growth", icon: TrendingUp },
  { key: "custom", icon: Wrench },
] as const;

export default function WhyChooseUs() {
  const { t } = useI18n();
  return (
    <section id="why-us" className="section-pad relative scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.why.eyebrow}
          title={
            <>
              {t.why.titleA} <span className="text-gradient-brand">{t.why.titleAccent}</span>
            </>
          }
          sub={t.why.sub}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ key, icon: Icon }, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.07 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="group glass-card flex h-full cursor-pointer items-start gap-4 rounded-4xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/90 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rosegold shadow-glow-gold transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5.5 w-5.5 text-white" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-cocoa-600">{t.why.items[key].title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-cocoa-400">{t.why.items[key].desc}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
