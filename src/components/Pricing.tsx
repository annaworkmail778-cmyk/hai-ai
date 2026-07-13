"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { plans, type Plan } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div role="group" aria-label={t.pricing.eyebrow} className="glass-card inline-flex items-center gap-1 rounded-full p-1.5">
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={!annual}
          className={`cursor-pointer rounded-full px-5 py-2.5 font-display text-sm font-semibold transition-all duration-200 ${
            !annual ? "bg-cocoa-grad text-blush-200 shadow-glow-gold" : "text-cocoa-500 hover:text-cocoa-700"
          }`}
        >
          {t.pricing.monthly}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={annual}
          className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold transition-all duration-200 ${
            annual ? "bg-cocoa-grad text-blush-200 shadow-glow-gold" : "text-cocoa-500 hover:text-cocoa-700"
          }`}
        >
          {t.pricing.yearly}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${annual ? "bg-blush-200 text-cocoa-600" : "bg-rosegold-200 text-cocoa-600"}`}>
            {t.pricing.yearlyBadge}
          </span>
        </button>
      </div>
      <p className="flex items-center gap-1.5 text-center text-xs font-medium text-cocoa-300">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-rosegold-400" aria-hidden="true" />
        {t.pricing.pilot}
      </p>
    </div>
  );
}

export default function Pricing() {
  const { t, money } = useI18n();
  const [annual, setAnnual] = useState(true);

  function priceView(plan: Plan): { big: string; per: string; sub: string } {
    if (plan.monthly === null) return { big: t.pricing.custom, per: "", sub: t.pricing.customAnnual };
    if (!annual || plan.annual === null) {
      return {
        big: money(plan.monthly, !!plan.priceSuffix),
        per: t.pricing.perMonth,
        sub: annual && plan.annual === null ? t.pricing.customAnnual : t.pricing.billedMonthly,
      };
    }
    const monthlyEq = Math.round(plan.annual / 12);
    const save = plan.monthly * 12 - plan.annual;
    return {
      big: money(monthlyEq),
      per: t.pricing.perMonth,
      sub: `${money(plan.annual)} ${t.pricing.billedYearly} · ${t.pricing.save} ${money(save)}`,
    };
  }

  return (
    <section id="pricing" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-16 right-[-8%] h-[26rem] w-[26rem] rounded-full bg-white/45 blur-3xl" />
        <div className="blob absolute bottom-0 left-[-8%] h-[24rem] w-[24rem] rounded-full bg-blush-300/35 blur-3xl" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.18em] text-cocoa-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rosegold-400" aria-hidden="true" />
            {t.pricing.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.12] tracking-tight text-cocoa-600 sm:text-4xl lg:text-5xl">
            {t.pricing.titleA} <span className="text-gradient-brand">{t.pricing.titleAccent}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cocoa-400 sm:text-lg">{t.pricing.sub}</p>
        </div>

        <BillingToggle annual={annual} onChange={setAnnual} />

        <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const highlight = plan.highlight;
            const view = priceView(plan);
            const p = t.pricing.plans[plan.id];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`relative flex h-full flex-col rounded-5xl p-7 transition-all duration-300 hover:-translate-y-1.5 ${highlight ? "bg-cocoa-grad shadow-lift ring-2 ring-rosegold-300/60" : "glass-card hover:shadow-lift"}`}>
                  {"badge" in p && p.badge && (
                    <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-rosegold px-4 py-2 font-display text-xs font-bold text-white shadow-glow-gold">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {p.badge}
                    </span>
                  )}

                  <h3 className={`font-display text-xl font-bold ${highlight ? "text-cream-50" : "text-cocoa-600"}`}>{p.name}</h3>
                  <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${highlight ? "text-rosegold-200" : "text-rosegold-500"}`}>{p.bestFor}</p>

                  <div className="mt-5 flex items-end gap-1">
                    <span className={`font-display text-4xl font-bold leading-none ${highlight ? "text-cream-50" : "text-cocoa-600"}`}>{view.big}</span>
                    {view.per && <span className={`pb-1 text-sm font-medium ${highlight ? "text-blush-200/80" : "text-cocoa-300"}`}>{view.per}</span>}
                  </div>
                  <p className={`mt-1.5 text-xs font-medium ${highlight ? "text-blush-200/80" : "text-cocoa-300"}`}>{view.sub}</p>
                  <p className={`mt-1 text-xs font-semibold ${highlight ? "text-blush-100" : "text-cocoa-400"}`}>
                    {t.pricing.setupPrefix}
                    {money(plan.setup, plan.id === "clinic")}
                    {t.pricing.setupSuffix}
                  </p>

                  <a href="#contact" className={`btn mt-6 w-full ${highlight ? "bg-white text-cocoa-600 hover:bg-blush-100" : "btn-primary"}`}>
                    {p.cta}
                  </a>

                  <p className={`mt-5 text-sm leading-relaxed ${highlight ? "text-blush-100" : "text-cocoa-400"}`}>{p.description}</p>

                  <div className={`my-5 h-px w-full ${highlight ? "bg-white/20" : "bg-blush-200"}`} />

                  <ul className="flex flex-1 flex-col gap-3">
                    {p.includes.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${highlight ? "bg-white/20" : "bg-blush-200"}`}>
                          <Check className={`h-3 w-3 ${highlight ? "text-blush-200" : "text-cocoa-500"}`} aria-hidden="true" />
                        </span>
                        <span className={`text-sm leading-snug ${highlight ? "text-blush-50" : "text-cocoa-500"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p className={`mt-5 rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-snug ${highlight ? "bg-white/10 text-blush-100" : "bg-blush-100/70 text-cocoa-400"}`}>{p.upgradeHint}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-cocoa-300">
          {t.pricing.footnote}{" "}
          <a href="#contact" className="font-semibold text-cocoa-500 underline underline-offset-2 hover:text-cocoa-700">
            {t.pricing.footnoteLink}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
