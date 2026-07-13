"use client";

import { motion } from "framer-motion";
import { Smartphone, BarChart3, Bot, Globe, CheckCircle2, Clock } from "lucide-react";

const milestones = [
  {
    id: 1,
    quarter: "Q3 2025",
    status: "live",
    icon: Globe,
    title: "Omnichannel Automation Core",
    description: "Instagram, WhatsApp, Telegram, and Messenger fully automated. n8n engine live.",
    color: "#D4A373",
  },
  {
    id: 2,
    quarter: "Q4 2025",
    status: "live",
    icon: CheckCircle2,
    title: "Voice Control & Google Sync",
    description: "Voice message parsing, Google Calendar integration, and Google Sheets logging launched.",
    color: "#D4A373",
  },
  {
    id: 3,
    quarter: "Q1 2026",
    status: "upcoming",
    icon: Smartphone,
    title: "Mobile & Web CRM App Launch",
    description: "A dedicated HAI-AI mobile app for salon owners — manage bookings, view analytics, and chat with your AI admin from anywhere.",
    color: "#FBC7D4",
    highlight: true,
  },
  {
    id: 4,
    quarter: "Q2 2026",
    status: "upcoming",
    icon: BarChart3,
    title: "Advanced ROI Tracking Dashboards",
    description: "Real-time revenue tracking, client lifetime value, channel performance, and upsell conversion rates — all in one beautiful dashboard.",
    color: "#FBC7D4",
  },
  {
    id: 5,
    quarter: "Q3 2026",
    status: "planned",
    icon: Bot,
    title: "Specialized AI Workers",
    description: "Domain-specific AI agents: a Rebooking Specialist, a VIP Client Concierge, and a Treatment Recommendation Engine.",
    color: "#FFB3C1",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-5 bg-gradient-to-b from-[#FDF8F5] to-[#FFFDFB]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F2] border border-[#FBC7D4]/40 mb-5">
            <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wide">What's Coming</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2424] leading-tight">
            The Future of{" "}
            <span className="text-gradient-rose italic">Beauty AI</span>
          </h2>
          <p className="mt-4 text-base text-[#4A3B3B] max-w-xl mx-auto leading-relaxed">
            We're building the most complete AI platform for the beauty industry. Here's what's on the horizon.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4A373] via-[#FBC7D4] to-[#FFB3C1]/30 hidden sm:block" />

          <div className="flex flex-col gap-6">
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
                className="relative flex gap-6 sm:pl-20"
              >
                {/* Node */}
                <div
                  className={`absolute left-0 top-6 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 hidden sm:flex ${
                    m.status === "live"
                      ? "bg-gradient-to-br from-[#D4A373] to-[#FBC7D4] shadow-[0_4px_16px_rgba(212,163,115,0.4)]"
                      : "bg-white border-2 border-[#FBC7D4]/40 shadow-sm"
                  }`}
                >
                  <m.icon
                    className="w-6 h-6"
                    style={{ color: m.status === "live" ? "white" : m.color }}
                    strokeWidth={1.8}
                  />
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-3xl p-6 transition-all duration-300 ${
                    m.highlight
                      ? "border-2 border-[#FBC7D4]/50 glow-blush"
                      : "glass-card"
                  }`}
                  style={m.highlight ? { background: "linear-gradient(135deg, #FFF0F2 0%, #FFFDFB 100%)" } : {}}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="text-xs font-semibold text-[#D4A373] bg-[#FFF0F2] px-3 py-1 rounded-full">
                          {m.quarter}
                        </span>
                        {m.status === "live" && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Live
                          </span>
                        )}
                        {m.status === "upcoming" && (
                          <span className="text-[10px] font-bold text-[#D4A373] bg-[#F5E6D3]/60 px-2.5 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                        {m.status === "planned" && (
                          <span className="text-[10px] font-medium text-[#4A3B3B] bg-[#FDF8F5] px-2.5 py-1 rounded-full border border-[#FBC7D4]/20">
                            Planned
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-lg text-[#2D2424]">{m.title}</h3>
                      <p className="text-sm text-[#4A3B3B] mt-2 leading-relaxed">{m.description}</p>
                    </div>

                    {/* Mobile icon */}
                    <div
                      className={`sm:hidden w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        m.status === "live"
                          ? "bg-gradient-to-br from-[#D4A373] to-[#FBC7D4]"
                          : "bg-[#FFF0F2]"
                      }`}
                    >
                      <m.icon
                        className="w-5 h-5"
                        style={{ color: m.status === "live" ? "white" : m.color }}
                        strokeWidth={1.8}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-[#4A3B3B] mb-4">
            Want early access to upcoming features?
          </p>
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FBC7D4] to-[#D4A373] text-white font-semibold text-sm shadow-[0_4px_20px_rgba(212,163,115,0.35)] hover:shadow-[0_8px_30px_rgba(212,163,115,0.5)] transition-shadow duration-300 cursor-pointer"
          >
            Join the Waitlist
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
