"use client";

import { motion } from "framer-motion";
import { Bot, MessageCircle, Puzzle, TrendingUp, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Counter from "./Counter";
import RobotImage from "./RobotImage";
import SectionHeading from "./SectionHeading";
import { InstagramIcon, MessengerIcon, TelegramIcon, TikTokIcon, WhatsAppIcon } from "./BrandIcons";

const channelIcons = [InstagramIcon, MessengerIcon, WhatsAppIcon, TelegramIcon, TikTokIcon];

export default function About() {
  const { t } = useI18n();
  const pills = [
    { icon: Zap, label: t.about.pills.automation },
    { icon: Bot, label: t.about.pills.agents },
    { icon: MessageCircle, label: t.about.pills.chatbots },
    { icon: Puzzle, label: t.about.pills.integrations },
    { icon: TrendingUp, label: t.about.pills.growth },
  ];

  return (
    <section id="about" className="section-pad relative scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        {/* marketing visual */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="glass-card overflow-hidden rounded-6xl p-6 shadow-lift sm:p-8">
            {/* header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-cocoa-600">{t.about.cardTitle}</p>
                <p className="mt-0.5 text-xs text-cocoa-300">{t.about.cardSub}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-blush-100/80 px-3 py-1.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rosegold-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rosegold-400" />
                </span>
                <span className="font-display text-[11px] font-bold uppercase tracking-wide text-cocoa-500">Live</span>
              </span>
            </div>

            {/* channel icons */}
            <ul className="mt-5 flex flex-wrap gap-2">
              {channelIcons.map((Icon, i) => (
                <li
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-cocoa-500 shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Icon className="h-4.5 w-4.5" />
                </li>
              ))}
            </ul>

            {/* robot + value chips */}
            <div className="relative mt-4">
              <div
                aria-hidden="true"
                className="absolute inset-x-8 top-6 bottom-4 rounded-full bg-blush-200/60 blur-2xl"
              />
              <RobotImage move="sway" alt={t.about.badge} className="mx-auto w-44 sm:w-52" glow={false} />

              <div className="glass-deep animate-float-slow absolute left-0 top-6 rounded-2xl px-3.5 py-2.5 shadow-soft">
                <p className="font-display text-sm font-bold text-cocoa-600">{t.about.replyValue}</p>
                <p className="text-[10px] font-medium text-cocoa-300">{t.about.replyTitle}</p>
              </div>
              <div
                className="glass-deep animate-float absolute right-0 top-10 rounded-2xl px-3.5 py-2.5 shadow-soft"
                style={{ animationDelay: "-2s" }}
              >
                <p className="font-display text-sm font-bold text-cocoa-600">{t.about.bookValue}</p>
                <p className="text-[10px] font-medium text-cocoa-300">{t.about.bookTitle}</p>
              </div>
            </div>
          </div>

          {/* floating stat badges */}
          <div className="glass-deep animate-float absolute -right-3 top-6 rounded-3xl px-5 py-4 text-center shadow-soft sm:-right-6">
            <p className="font-display text-2xl font-bold text-cocoa-600">
              <Counter to={30} suffix="+" />
            </p>
            <p className="mt-0.5 text-xs font-medium text-cocoa-300">{t.about.statHoursLabel}</p>
          </div>
          <div
            className="glass-deep animate-float-slow absolute -bottom-5 left-6 rounded-3xl px-5 py-4 text-center shadow-soft"
            style={{ animationDelay: "-3s" }}
          >
            <p className="font-display text-2xl font-bold text-cocoa-600">
              <Counter to={98} suffix="%" />
            </p>
            <p className="mt-0.5 text-xs font-medium text-cocoa-300">{t.about.statSatLabel}</p>
          </div>
        </motion.div>

        {/* copy */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow={t.about.badge}
            title={
              <>
                {t.about.titleA} <span className="text-gradient-brand">{t.about.titleAccent}</span>
              </>
            }
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mt-6 text-base leading-relaxed text-cocoa-400 sm:text-lg">{t.about.p1}</p>
            <p className="mt-4 text-base leading-relaxed text-cocoa-400 sm:text-lg">{t.about.p2}</p>

            <ul className="mt-8 flex flex-wrap gap-3">
              {pills.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="glass-card flex items-center gap-2 rounded-full px-4 py-2.5 transition-shadow duration-200 hover:shadow-glow-gold"
                >
                  <Icon className="h-4 w-4 text-rosegold-400" aria-hidden="true" />
                  <span className="font-display text-sm font-semibold text-cocoa-600">{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
