"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { InstagramIcon, MessengerIcon, TelegramIcon, TikTokIcon, WhatsAppIcon } from "./BrandIcons";

const channels = [
  { key: "instagram" as const, Icon: InstagramIcon, href: "https://instagram.com" },
  { key: "messenger" as const, Icon: MessengerIcon, href: "https://messenger.com" },
  { key: "whatsapp" as const, Icon: WhatsAppIcon, href: "https://whatsapp.com" },
  { key: "telegram" as const, Icon: TelegramIcon, href: "https://telegram.org" },
  { key: "tiktok" as const, Icon: TikTokIcon, href: "https://tiktok.com" },
];

export default function ChannelStrip() {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-5 px-6 sm:mt-20"
    >
      <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-cocoa-300">
        {t.channels.title}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {channels.map(({ key, Icon, href }, i) => (
          <motion.li
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.channels[key]}
              className="group flex items-center gap-2.5 rounded-full glass px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-glow-gold sm:px-5 sm:py-3"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa-grad text-blush-200 transition-transform duration-200 group-hover:scale-110">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-semibold text-cocoa-600">{t.channels[key]}</span>
            </a>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
