"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { Check, Minus, X, ArrowRight } from "lucide-react";
import { matrix, plans, type Cell, type PlanId } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

export default function FeatureMatrix() {
  const { t, money } = useI18n();
  const colCount = plans.length + 1;
  const tr = (s: string) => t.compare.tr[s] ?? s;

  function CellValue({ value, highlight }: { value: Cell; highlight?: boolean }) {
    if (value === true) {
      return (
        <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-blush-200">
          <Check className="h-3.5 w-3.5 text-cocoa-500" aria-hidden="true" />
          <span className="sr-only">{t.compare.included}</span>
        </span>
      );
    }
    if (value === false) {
      return (
        <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-cocoa-100/40">
          <X className="h-3.5 w-3.5 text-cocoa-200" aria-hidden="true" />
          <span className="sr-only">{t.compare.notIncluded}</span>
        </span>
      );
    }
    if (value === "limited") {
      return (
        <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-rosegold-200/60">
          <Minus className="h-3.5 w-3.5 text-rosegold-500" aria-hidden="true" />
          <span className="sr-only">{t.compare.limited}</span>
        </span>
      );
    }
    return <span className={`font-display text-[13px] font-semibold ${highlight ? "text-cocoa-700" : "text-cocoa-600"}`}>{tr(value)}</span>;
  }

  const priceLabel = (monthly: number | null, suffix?: string) =>
    monthly === null ? t.pricing.custom : `${t.compare.fromPer} ${money(monthly, !!suffix)}${t.pricing.perMonth}`;

  return (
    <section id="compare" className="section-pad relative scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.18em] text-cocoa-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rosegold-400" aria-hidden="true" />
            {t.compare.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.12] tracking-tight text-cocoa-600 sm:text-4xl lg:text-5xl">
            {t.compare.titleA} <span className="text-gradient-brand">{t.compare.titleAccent}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cocoa-400 sm:text-lg">{t.compare.sub}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card mt-12 overflow-hidden rounded-4xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-blush-200">
                  <th scope="col" className="sticky left-0 z-10 bg-cream-50/95 px-5 py-5 align-bottom backdrop-blur">
                    <span className="font-display text-sm font-bold text-cocoa-600">{t.compare.features}</span>
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} scope="col" className={`px-4 py-5 text-center align-bottom ${plan.highlight ? "bg-blush-100/70" : ""}`}>
                      {plan.highlight && (
                        <span className="mb-1.5 inline-block rounded-full bg-rosegold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{t.compare.popular}</span>
                      )}
                      <span className="block font-display text-sm font-bold text-cocoa-600">{t.pricing.plans[plan.id].name}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-cocoa-300">{priceLabel(plan.monthly, plan.priceSuffix)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((group) => (
                  <Fragment key={group.title}>
                    <tr>
                      <th scope="colgroup" colSpan={colCount} className="sticky left-0 bg-blush-100/60 px-5 py-2.5 text-left font-display text-xs font-bold uppercase tracking-[0.14em] text-rosegold-500">
                        {tr(group.title)}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-b border-blush-200/70 last:border-0">
                        <th scope="row" className="sticky left-0 z-10 bg-cream-50/95 px-5 py-3.5 text-left align-middle backdrop-blur">
                          <span className="block text-[13px] font-medium text-cocoa-600">{tr(row.label)}</span>
                          {row.note && <span className="mt-0.5 block text-[11px] leading-snug text-cocoa-300">{tr(row.note)}</span>}
                        </th>
                        {plans.map((plan) => (
                          <td key={plan.id} className={`px-4 py-3.5 text-center align-middle ${plan.highlight ? "bg-blush-100/50" : ""}`}>
                            <CellValue value={row.values[plan.id as PlanId]} highlight={plan.highlight} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
                <tr>
                  <td className="sticky left-0 z-10 bg-cream-50/95 px-5 py-5 backdrop-blur" />
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-4 py-5 text-center ${plan.highlight ? "bg-blush-100/50" : ""}`}>
                      <a href="#contact" className="inline-flex items-center gap-1.5 rounded-full bg-cocoa-grad px-4 py-2.5 font-display text-xs font-bold text-blush-200 transition-transform duration-200 hover:-translate-y-0.5">
                        {plan.id === "clinic" ? t.compare.contact : t.compare.choose}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
