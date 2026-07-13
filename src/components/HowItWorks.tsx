"use client";

import { motion } from "framer-motion";
import { Phone, Lightbulb, Code, Plug, Rocket, LifeBuoy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import RobotImage from "./RobotImage";
import SectionHeading from "./SectionHeading";

const steps = [
  { key: "discovery", icon: Phone },
  { key: "strategy", icon: Lightbulb },
  { key: "dev", icon: Code },
  { key: "integration", icon: Plug },
  { key: "launch", icon: Rocket },
  { key: "support", icon: LifeBuoy },
] as const;

export default function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="how-it-works" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-1/4 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-white/45 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.how.eyebrow}
          title={
            <>
              {t.how.titleA} <span className="text-gradient-brand">{t.how.titleAccent}</span>
            </>
          }
          sub={t.how.sub}
        />

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[27px] top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-blush-300 via-rosegold-300 to-cocoa-300 sm:left-1/2 sm:-translate-x-1/2"
            />

            <ol className="space-y-10">
              {steps.map(({ key, icon: Icon }, i) => {
                const left = i % 2 === 0;
                return (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.65, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative flex items-start gap-6 sm:w-[calc(50%+28px)] ${
                      left ? "sm:mr-auto sm:flex-row-reverse sm:text-right" : "sm:ml-auto"
                    }`}
                  >
                    <span className="glass-deep relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-glow-gold">
                      <Icon className="h-6 w-6 text-cocoa-500" aria-hidden="true" />
                      <span className="absolute -top-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-cocoa-grad font-display text-[11px] font-bold text-blush-200">
                        {i + 1}
                      </span>
                    </span>

                    <div className="glass-card flex-1 rounded-4xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                      <h3 className="font-display text-lg font-bold text-cocoa-600">{t.how.steps[key].title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-cocoa-400">{t.how.steps[key].desc}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex flex-col items-center"
          >
            <RobotImage move="bounce" sparkles alt={t.how.celebrate} className="w-36 sm:w-40" />
            <p className="glass-deep mt-4 rounded-full px-6 py-3 font-display text-sm font-semibold text-cocoa-600 shadow-soft">
              {t.how.celebrate}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
