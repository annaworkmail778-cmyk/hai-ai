"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const WEEKS_PER_MONTH = 4.33;
const CAPTURE_RATE = 0.7;
const GROWTH_PRICE = 89; // USD base

export default function Roi() {
  const { t, money } = useI18n();
  const [missed, setMissed] = useState(8);
  const [value, setValue] = useState(60); // USD base

  const recovered = Math.round(missed * WEEKS_PER_MONTH * CAPTURE_RATE * value);
  const roiX = Math.max(1, Math.round(recovered / GROWTH_PRICE));

  const facts = [t.roi.facts.dms, t.roi.facts.noshow, t.roi.facts.lost, t.roi.facts.cost];

  return (
    <section id="roi" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-10 left-[-8%] h-[26rem] w-[26rem] rounded-full bg-white/45 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.roi.eyebrow}
          title={
            <>
              {t.roi.titleA} <span className="text-gradient-brand">{t.roi.titleAccent}</span>
            </>
          }
          sub={t.roi.sub}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-5xl p-7 sm:p-9"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cocoa-grad shadow-glow-gold">
                <Calculator className="h-5 w-5 text-blush-200" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold text-cocoa-600">{t.roi.calcTitle}</h3>
            </div>

            <div className="mt-7 space-y-7">
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="roi-missed" className="font-display text-sm font-semibold text-cocoa-600">{t.roi.missed}</label>
                  <span className="font-display text-lg font-bold text-cocoa-600">{missed}</span>
                </div>
                <input id="roi-missed" type="range" min={1} max={40} value={missed} onChange={(e) => setMissed(Number(e.target.value))} className="mt-3 w-full cursor-pointer" style={{ accentColor: "#8A564C" }} />
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="roi-value" className="font-display text-sm font-semibold text-cocoa-600">{t.roi.value}</label>
                  <span className="font-display text-lg font-bold text-cocoa-600">{money(value)}</span>
                </div>
                <input id="roi-value" type="range" min={20} max={300} step={5} value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-3 w-full cursor-pointer" style={{ accentColor: "#8A564C" }} />
              </div>
            </div>

            <div className="mt-8 rounded-4xl bg-cocoa-grad p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rosegold-200">{t.roi.recovered}</p>
              <p className="mt-2 font-display text-4xl font-bold text-cream-50">
                {money(recovered)}
                <span className="text-lg font-semibold text-blush-200/80"> {t.roi.perMonth}</span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 font-display text-sm font-bold text-blush-100">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                {t.roi.roiChipA}{roiX}{t.roi.roiChipB}
              </p>
            </div>
            <p className="mt-3 text-center text-[11px] font-medium text-cocoa-300">{t.roi.disclaimer}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <div className="grid flex-1 grid-cols-2 gap-4">
              {facts.map((f) => (
                <div key={f.label} className="glass-card flex flex-col justify-center rounded-4xl p-5">
                  <p className="font-display text-2xl font-bold text-gradient-brand sm:text-3xl">{f.stat}</p>
                  <p className="mt-1.5 text-xs leading-snug text-cocoa-400">{f.label}</p>
                </div>
              ))}
            </div>
            <div className="glass-deep mt-4 rounded-4xl p-6">
              <p className="font-display text-base font-bold leading-relaxed text-cocoa-600">
                {t.roi.punchTitle}
                <span className="text-gradient-brand">{t.roi.punchAccent}</span>
              </p>
              <p className="mt-2 text-sm text-cocoa-400">{t.roi.punchSub}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
