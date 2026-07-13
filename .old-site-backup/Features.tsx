"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { MessageCircle, Bell, Mic, TrendingUp, Zap } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const channels = [
  { name: "Instagram", color: "#E1306C", bg: "#FFF0F5" },
  { name: "WhatsApp", color: "#25D366", bg: "#F0FFF4" },
  { name: "Telegram", color: "#229ED9", bg: "#F0F8FF" },
  { name: "Messenger", color: "#0099FF", bg: "#F0F5FF" },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-5">
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
            <Zap className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wide">Core Features</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2424] leading-tight">
            Everything Your Salon{" "}
            <span className="text-gradient-rose italic">Needs to Thrive</span>
          </h2>
          <p className="mt-4 text-base text-[#4A3B3B] max-w-xl mx-auto leading-relaxed">
            From instant booking to intelligent upselling — HAI-AI handles your admin so your team stays focused on what they do best.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">

          {/* Card 1: Omnichannel Sync — large */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(45,36,36,0.10)" }}
            className="lg:col-span-2 glass-card rounded-3xl p-8 cursor-default transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#D4A373]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#2D2424]">Omnichannel Sync</h3>
                <p className="text-sm text-[#4A3B3B] mt-1 leading-relaxed">
                  Every DM, message, and inquiry — unified in one intelligent inbox, replied to instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {channels.map((ch) => (
                <div
                  key={ch.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#FBC7D4]/20 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  style={{ backgroundColor: ch.bg }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: ch.color + "22" }}
                  >
                    <span className="text-xs font-bold" style={{ color: ch.color }}>
                      {ch.name.slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#2D2424]">{ch.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-[#4A3B3B]">Live</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-[#D4A373] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] pulse-dot" />
              All channels synced — real time, zero delay
            </div>
          </motion.div>

          {/* Card 2: 24h Autopilot Reminders */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(45,36,36,0.10)" }}
            className="glass-card rounded-3xl p-8 flex flex-col gap-6 cursor-default transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #FFF0F2 0%, #FFFDFB 100%)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-[#FBC7D4]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#2D2424]">24h Autopilot Reminders</h3>
                <p className="text-sm text-[#4A3B3B] mt-1 leading-relaxed">
                  Elegant, branded reminders sent automatically — no-shows drop by 60%.
                </p>
              </div>
            </div>

            {/* Notification preview */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Booking Confirmed", time: "Now", status: "sent" },
                { label: "Reminder — 24hrs before", time: "Thu 14:00", status: "scheduled" },
                { label: "Day-of reminder", time: "Fri 09:00", status: "scheduled" },
              ].map((n, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/90 border border-[#FBC7D4]/20 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${n.status === "sent" ? "bg-green-400" : "bg-[#FBC7D4]"}`} />
                    <span className="text-xs font-medium text-[#2D2424]">{n.label}</span>
                  </div>
                  <span className="text-[10px] text-[#4A3B3B]">{n.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Voice Message Control */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(45,36,36,0.10)" }}
            className="glass-card rounded-3xl p-8 flex flex-col gap-6 cursor-default transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-[#D4A373]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#2D2424]">Voice Message Control</h3>
                <p className="text-sm text-[#4A3B3B] mt-1 leading-relaxed">
                  Send a voice note on Telegram — HAI-AI transcribes and updates your calendar instantly.
                </p>
              </div>
            </div>

            {/* Soundbar visual */}
            <div className="flex items-center gap-1.5 px-4 py-4 rounded-2xl bg-[#FFF0F2] border border-[#FBC7D4]/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-0.5 flex-1">
                {[4, 8, 14, 10, 18, 12, 20, 8, 16, 10, 14, 6, 18, 12, 8, 16, 10, 20, 6, 14].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 0.4, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-[#D4A373] to-[#FBC7D4]"
                    style={{ height: `${h}px`, originY: "center" }}
                  />
                ))}
              </div>
              <span className="text-xs text-[#4A3B3B] ml-1">0:12</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/80 border border-[#FBC7D4]/20">
              <p className="text-[11px] text-[#4A3B3B] leading-relaxed">
                <span className="font-semibold text-[#2D2424]">HAI-AI understood:</span> "Move Alina's Friday 3pm to Saturday 11am, add a hydra facial" ✓
              </p>
            </div>
          </motion.div>

          {/* Card 4: AI Upsell Agent + Mascot */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(45,36,36,0.10)" }}
            className="lg:col-span-2 glass-card rounded-3xl p-8 cursor-default transition-all duration-300 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FDF8F5 0%, #FFF0F2 50%, #FDF8F5 100%)" }}
          >
            {/* Mascot in card */}
            <div className="absolute right-4 bottom-0 w-40 h-40 hidden sm:block">
              <Image
                src="/mascot.jpeg"
                alt="HAI-AI mascot holding calendar"
                fill
                className="object-contain object-bottom"
                style={{ background: "transparent" }}
              />
            </div>

            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#D4A373]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#2D2424]">AI Upsell Agent</h3>
                <p className="text-sm text-[#4A3B3B] mt-1 leading-relaxed">
                  At the right moment, HAI-AI suggests the perfect add-on treatment — naturally, warmly, and effectively.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm">
              <div className="px-4 py-3 rounded-2xl bg-white/80 border border-[#FBC7D4]/20 shadow-sm">
                <p className="text-xs text-[#4A3B3B] leading-relaxed">
                  <span className="font-semibold text-[#D4A373]">HAI-AI suggests:</span> Since you're booked for a Facial, would you like to add our Signature Glow Peel? It's only +€25 and your skin will love it 🌟
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FBC7D4] to-[#D4A373] text-white text-xs font-semibold text-center cursor-pointer">
                  Yes, add it!
                </div>
                <div className="px-3 py-2 rounded-xl border border-[#FBC7D4]/30 text-[#4A3B3B] text-xs font-medium cursor-pointer">
                  Maybe next time
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D4A373] font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Average +€35 revenue per booking
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
