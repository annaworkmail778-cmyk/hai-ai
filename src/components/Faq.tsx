"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const keys = ["what", "time", "tech", "tools", "cost", "secure"] as const;

export default function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad relative scroll-mt-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow={t.faq.eyebrow}
          title={
            <>
              {t.faq.titleA} <span className="text-gradient-brand">{t.faq.titleAccent}</span>
            </>
          }
        />

        <div className="mt-12 space-y-4">
          {keys.map((key, i) => {
            const item = t.faq.items[key];
            const isOpen = open === i;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className={`glass-card overflow-hidden rounded-3xl transition-shadow duration-300 ${isOpen ? "shadow-lift" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-button-${i}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-base font-bold text-cocoa-600 sm:text-lg">{item.q}</span>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${isOpen ? "bg-cocoa-grad rotate-180" : "bg-blush-200"}`}>
                    <ChevronDown className={`h-4.5 w-4.5 transition-colors duration-300 ${isOpen ? "text-blush-200" : "text-cocoa-500"}`} aria-hidden="true" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-6 pb-6 text-[15px] leading-relaxed text-cocoa-400">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
