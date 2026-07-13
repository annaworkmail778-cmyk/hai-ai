"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Sparkles } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Single Master",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Perfect for solo artists and independent beauty masters just starting with AI.",
    color: "#FBC7D4",
    features: [
      "1 staff profile",
      "Instagram + WhatsApp automation",
      "Automated booking confirmations",
      "24h reminder system",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    id: "business",
    name: "Business",
    subtitle: "Growing Salon",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "Built for salons with multiple masters, high booking volume, and growth ambitions.",
    color: "#D4A373",
    features: [
      "Up to 8 staff profiles",
      "All 4 channels (Instagram, WhatsApp, Telegram, Messenger)",
      "AI Upsell Agent",
      "Voice message control",
      "Google Calendar & Sheets sync",
      "Advanced analytics & reports",
      "Priority support",
      "Branded client notifications",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Multi-location Clinic",
    monthlyPrice: 199,
    annualPrice: 159,
    description: "Enterprise-grade automation for aesthetic clinics and multi-branch salon groups.",
    color: "#2D2424",
    features: [
      "Unlimited staff profiles",
      "Multi-location management",
      "All Business features",
      "Custom AI personality & tone",
      "ROI tracking dashboards",
      "Dedicated account manager",
      "Custom integrations",
      "SLA uptime guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F2] border border-[#FBC7D4]/40 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wide">Simple Pricing</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2424] leading-tight">
            Invest Once,{" "}
            <span className="text-gradient-rose italic">Earn Forever</span>
          </h2>
          <p className="mt-4 text-base text-[#4A3B3B] max-w-xl mx-auto leading-relaxed">
            Every plan includes a 14-day free trial. No credit card required. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-2xl bg-[#FFF0F2] border border-[#FBC7D4]/30">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                !annual ? "bg-white text-[#2D2424] shadow-sm" : "text-[#4A3B3B]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                annual ? "bg-white text-[#2D2424] shadow-sm" : "text-[#4A3B3B]"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-full bg-[#FBC7D4]/40 text-[10px] font-bold text-[#D4A373]">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl flex flex-col transition-all duration-300 cursor-default ${
                plan.popular
                  ? "border-2 shadow-[0_0_60px_rgba(212,163,115,0.25)]"
                  : "border border-[#FBC7D4]/25 shadow-[0_8px_32px_rgba(45,36,36,0.06)]"
              }`}
              style={
                plan.popular
                  ? {
                      borderImage: "linear-gradient(135deg, #D4A373, #FBC7D4, #D4A373) 1",
                      border: "2px solid transparent",
                      backgroundClip: "padding-box",
                      background: "white",
                    }
                  : { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)" }
              }
            >
              {/* Popular ribbon */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D4A373] to-[#FBC7D4] flex items-center gap-1.5 shadow-[0_4px_16px_rgba(212,163,115,0.4)]">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-[11px] font-bold text-white whitespace-nowrap">Most Popular</span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1 gap-7">
                {/* Plan header */}
                <div>
                  <div
                    className="inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ backgroundColor: plan.color + "22", color: plan.color }}
                  >
                    {plan.subtitle}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#2D2424]">{plan.name}</h3>
                  <p className="text-sm text-[#4A3B3B] mt-2 leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-[#2D2424]">
                    €{annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-[#4A3B3B] mb-1">/mo</span>
                  {annual && (
                    <span className="ml-2 mb-1 text-xs font-medium text-[#D4A373] line-through opacity-60">
                      €{plan.monthlyPrice}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: plan.color + "33" }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: plan.color }} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-[#4A3B3B]">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3.5 rounded-2xl text-sm font-semibold text-center transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#FBC7D4] to-[#D4A373] text-white shadow-[0_4px_20px_rgba(212,163,115,0.35)]"
                      : "border border-[#FBC7D4]/40 text-[#2D2424] hover:bg-[#FFF0F2]"
                  }`}
                >
                  {plan.cta}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-[#4A3B3B]"
        >
          All plans include 14-day free trial · SSL secured · GDPR compliant · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
