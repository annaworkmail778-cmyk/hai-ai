"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { MessageCircle, Calendar, Sheet, Bell, ArrowRight } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: MessageCircle,
    label: "Client DM",
    description: 'Alina sends an Instagram DM: "Appointment Friday 3pm?"',
    color: "#E1306C",
    bg: "#FFF0F5",
    accent: "#FFF0F5",
  },
  {
    id: 2,
    icon: null,
    label: "n8n Engine",
    description: "HAI-AI processes intent, checks availability, and prepares a personalized response — in under 2 seconds.",
    color: "#D4A373",
    bg: "#FDF8F5",
    accent: "#F5E6D3",
    isEngine: true,
  },
  {
    id: 3,
    icon: null,
    label: "AI Books & Logs",
    description: "The slot is added to Google Calendar, the client data logged to Google Sheets, confirmation sent.",
    color: "#FBC7D4",
    bg: "#FFF0F2",
    accent: "#FFF0F2",
    isMascot: true,
  },
  {
    id: 4,
    icon: Bell,
    label: "Stylist Notified",
    description: "Your master stylist gets an instant Telegram ping with full booking details and special requests.",
    color: "#229ED9",
    bg: "#F0F8FF",
    accent: "#F0F8FF",
  },
];

export default function AutomationFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="flow" ref={ref} className="py-24 px-5 bg-gradient-to-b from-[#FDF8F5] to-[#FFFDFB]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F2] border border-[#FBC7D4]/40 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] pulse-dot" />
            <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wide">Powered by n8n</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2424] leading-tight">
            From DM to Done —{" "}
            <span className="text-gradient-rose italic">in Seconds</span>
          </h2>
          <p className="mt-4 text-base text-[#4A3B3B] max-w-xl mx-auto leading-relaxed">
            Watch how HAI-AI turns a client message into a confirmed booking, a calendar entry, and a stylist notification — automatically.
          </p>
        </motion.div>

        {/* Flow: Horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex lg:flex-col items-center gap-4 flex-1">
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.18, duration: 0.6, ease: "easeOut" }}
                className="relative flex-1 w-full glass-card rounded-3xl p-6 flex flex-col gap-4 cursor-default"
                style={{ background: `linear-gradient(135deg, ${step.accent} 0%, #FFFDFB 100%)` }}
                whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(45,36,36,0.10)" }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-bold text-[#4A3B3B] border border-[#FBC7D4]/30">
                  {step.id}
                </div>

                {/* Icon / Engine / Mascot */}
                {step.isEngine ? (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative" style={{ backgroundColor: step.color + "22" }}>
                    {/* Pulsing n8n glow */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: step.color + "44" }}
                    />
                    <span className="text-lg font-display font-bold relative z-10" style={{ color: step.color }}>
                      n8
                    </span>
                  </div>
                ) : step.isMascot ? (
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/mascot.jpeg"
                      alt="HAI-AI robot booking the appointment"
                      fill
                      className="object-contain"
                      style={{ background: "transparent" }}
                    />
                  </div>
                ) : step.icon ? (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: step.color + "22" }}>
                    <step.icon className="w-6 h-6" style={{ color: step.color }} strokeWidth={1.8} />
                  </div>
                ) : null}

                {/* Booking icons for step 3 */}
                {step.isMascot && (
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 border border-[#FBC7D4]/20 text-[10px] font-medium text-[#2D2424]">
                      <Calendar className="w-3 h-3 text-[#D4A373]" />
                      Google Cal
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 border border-[#FBC7D4]/20 text-[10px] font-medium text-[#2D2424]">
                      <Sheet className="w-3 h-3 text-green-500" />
                      Sheets
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-display font-semibold text-base text-[#2D2424]">{step.label}</h3>
                  <p className="text-xs text-[#4A3B3B] mt-1.5 leading-relaxed">{step.description}</p>
                </div>

                {/* Glow line for n8n engine */}
                {step.isEngine && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-0.5 w-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                    }}
                  />
                )}
              </motion.div>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.18 + 0.3 }}
                  className="flex-shrink-0 flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5 text-[#FBC7D4] rotate-90 lg:rotate-0" />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 glass-card rounded-3xl p-6 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { value: "< 2s", label: "Average response time" },
            { value: "99.9%", label: "Uptime guarantee" },
            { value: "0", label: "Bookings lost to slow replies" },
            { value: "∞", label: "Simultaneous conversations" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl font-bold text-gradient-rose">{stat.value}</p>
              <p className="text-xs text-[#4A3B3B] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
