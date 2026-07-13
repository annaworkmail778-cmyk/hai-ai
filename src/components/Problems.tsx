"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, RefreshCw, Clock, Coins, MessageSquare, Target } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import RobotImage from "./RobotImage";
import SectionHeading from "./SectionHeading";

const items = [
  { key: "repetitive", icon: RefreshCw },
  { key: "slow", icon: MessageSquare },
  { key: "time", icon: Clock },
  { key: "cost", icon: Coins },
  { key: "missed", icon: Target },
] as const;

export default function Problems() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="problems" className="section-pad relative scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            align="left"
            eyebrow={t.problems.eyebrow}
            title={
              <>
                {t.problems.titleA} <span className="text-gradient-brand">{t.problems.titleAccent}</span>
              </>
            }
            sub={t.problems.sub}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="glass-deep relative mb-3 -ml-6 rounded-3xl rounded-bl-md px-5 py-3.5 shadow-soft">
              <p className="font-display text-sm font-semibold text-cocoa-600">{t.problems.bubble}</p>
            </div>
            <RobotImage move="sway" alt={t.problems.bubble} className="w-32" />
          </motion.div>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map(({ key, icon: Icon }, i) => {
            const open = openIndex === i;
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-pressed={open}
                  className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-4xl text-left"
                >
                  <div className="glass-card flex h-full min-h-52 flex-col rounded-4xl p-6 transition-all duration-300 group-hover:shadow-lift">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush-200 text-cocoa-500">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.16em] text-rosegold-500">
                      {t.problems.problemLabel}
                    </p>
                    <p className="mt-1.5 font-display text-base font-bold leading-snug text-cocoa-600">
                      {t.problems.items[key].problem}
                    </p>
                    <p className="mt-auto pt-4 text-xs font-medium text-cocoa-300">{t.problems.tapHint}</p>
                  </div>

                  <div
                    className={`absolute inset-0 flex flex-col rounded-4xl bg-cocoa-grad p-6 transition-transform duration-300 ease-out ${
                      open ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                    }`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                      <Check className="h-5 w-5 text-blush-200" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.16em] text-rosegold-200">
                      {t.problems.solutionLabel}
                    </p>
                    <p className="mt-1.5 font-display text-base font-bold leading-snug text-cream-50">
                      {t.problems.items[key].solution}
                    </p>
                    <p className="mt-auto pt-4 text-xs font-medium text-blush-200/80">{t.problems.handled}</p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
