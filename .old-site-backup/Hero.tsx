"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, TrendingUp, Star, Send, Check } from "lucide-react";

const chatMessages = [
  {
    id: 1,
    from: "client",
    avatar: "A",
    name: "Alina K.",
    text: "Hi! Do you have a slot free on Friday at 3pm for a facial + lash lift? 🌸",
    time: "14:02",
    delay: 0.5,
  },
  {
    id: 2,
    from: "ai",
    text: "Hi Alina! Friday 3pm is perfect ✨ I've confirmed your Signature Facial + Lash Lift with Marina. A reminder will arrive 24hrs before. Shall I add a complimentary brow tint? 💅",
    time: "14:02",
    delay: 1.4,
  },
  {
    id: 3,
    from: "client",
    avatar: "A",
    name: "Alina K.",
    text: "Yes please! You guys are the best 🥰",
    time: "14:03",
    delay: 2.4,
  },
  {
    id: 4,
    from: "ai",
    text: "Done! Brow tint added 🎀 Your full booking is confirmed. See you Friday at 3pm!",
    time: "14:03",
    delay: 3.2,
  },
];

const metrics = [
  { icon: Clock, value: "3 hrs", label: "saved daily", color: "#FBC7D4" },
  { icon: TrendingUp, value: "+40%", label: "client retention", color: "#D4A373" },
  { icon: Star, value: "24/7", label: "AI on duty", color: "#FFB3C1" },
];

export default function Hero() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    chatMessages.forEach((msg) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, msg.delay * 1000 + 1200);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FFF0F2] blur-3xl opacity-70" />
        <div className="absolute bottom-1/3 left-1/5 w-72 h-72 rounded-full bg-[#FBC7D4] blur-3xl opacity-30" />
        <div className="absolute top-1/2 right-1/6 w-64 h-64 rounded-full bg-[#F5E6D3] blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F2] border border-[#FBC7D4]/40 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-[#FBC7D4] pulse-dot" />
            <span className="text-xs font-semibold text-[#D4A373] tracking-wide uppercase">
              AI-Powered Beauty Automation
            </span>
          </motion.div>

          {/* Headline */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D2424] leading-[1.15] tracking-tight">
              Your Salon Runs{" "}
              <span className="text-gradient-rose italic">Itself</span>
              <br />
              While You{" "}
              <span className="relative">
                Focus on
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FBC7D4] to-[#D4A373] rounded-full" />
              </span>{" "}
              Beauty.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#4A3B3B] leading-relaxed max-w-lg">
              HAI-AI handles bookings, reminders, and client messages on Instagram, WhatsApp, and Telegram — 24/7. Your chair stays full, your stress stays low.
            </p>
          </div>

          {/* Metric badges */}
          <div className="flex flex-wrap gap-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-card cursor-default"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: m.color + "33" }}
                >
                  <m.icon className="w-4 h-4" style={{ color: m.color }} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-display font-bold text-base text-[#2D2424] leading-tight">{m.value}</p>
                  <p className="text-xs text-[#4A3B3B]">{m.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(212,163,115,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#FBC7D4] to-[#D4A373] text-white font-semibold text-sm shadow-[0_4px_20px_rgba(212,163,115,0.35)] transition-shadow duration-300 text-center cursor-pointer"
            >
              Start Free Trial — 14 Days
            </motion.a>
            <motion.a
              href="#flow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-4 rounded-2xl border border-[#FBC7D4]/50 text-[#2D2424] font-medium text-sm hover:bg-[#FFF0F2] transition-colors duration-200 text-center cursor-pointer"
            >
              See How It Works
            </motion.a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#FBC7D4", "#D4A373", "#FFB3C1", "#FFF0F2"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: c === "#FFF0F2" ? "#FBC7D4" : c }}
                >
                  {["S", "M", "L", "A"][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2D2424]">Trusted by 200+ salon owners</p>
              <div className="flex gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#D4A373] text-[#D4A373]" />
                ))}
                <span className="text-xs text-[#4A3B3B] ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Chat mockup + mascot */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative flex justify-center"
        >
          {/* Mascot floating beside chat */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-8 lg:-left-24 top-1/2 -translate-y-1/2 z-10 hidden sm:block"
          >
            <div className="relative w-40 h-40 lg:w-52 lg:h-52">
              <Image
                src="/mascot.jpeg"
                alt="HAI-AI mascot robot — your AI admin"
                fill
                className="object-contain"
                style={{ background: "transparent" }}
                priority
              />
            </div>
            {/* Speech indicator */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FBC7D4] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Phone mockup */}
          <div className="relative w-full max-w-sm">
            {/* Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#FBC7D4]/20 to-[#D4A373]/10 blur-2xl scale-105" />

            <div className="relative glass-card rounded-[2.5rem] overflow-hidden border border-[#FBC7D4]/30 shadow-[0_32px_80px_rgba(45,36,36,0.12)]">
              {/* Status bar */}
              <div className="bg-gradient-to-r from-[#FFF0F2] to-[#FDF8F5] px-5 py-3 flex items-center justify-between border-b border-[#FBC7D4]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2D2424]">HAI-AI Admin</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-[10px] text-[#4A3B3B]">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0F2] border border-[#FBC7D4]/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-[10px] font-medium text-[#D4A373]">Instagram DM</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="bg-[#FFFDFB] px-4 py-5 flex flex-col gap-3 min-h-[360px]">
                {chatMessages.map((msg) =>
                  visibleMessages.includes(msg.id) ? (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${msg.from === "ai" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {msg.from === "client" && (
                        <div className="w-7 h-7 rounded-full bg-[#FBC7D4]/50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#2D2424]">
                          {msg.avatar}
                        </div>
                      )}
                      {msg.from === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">AI</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.from === "client"
                            ? "chat-bubble-in bg-white border border-[#FBC7D4]/20 text-[#2D2424] rounded-bl-sm shadow-sm"
                            : "chat-bubble-out bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] text-white rounded-br-sm shadow-sm"
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.from === "client" ? "text-[#4A3B3B]/50" : "text-white/70"}`}>
                          {msg.time}
                          {msg.from === "ai" && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  ) : null
                )}

                {/* Typing indicator */}
                {visibleMessages.length < chatMessages.length && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">AI</span>
                    </div>
                    <div className="px-3.5 py-3 rounded-2xl rounded-br-sm bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex gap-1">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/80 pulse-dot"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="bg-[#FDF8F5] px-4 py-3 border-t border-[#FBC7D4]/20 flex items-center gap-2">
                <div className="flex-1 h-9 rounded-xl bg-white border border-[#FBC7D4]/30 flex items-center px-3">
                  <span className="text-xs text-[#4A3B3B]/40">Message HAI-AI…</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center cursor-pointer">
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
