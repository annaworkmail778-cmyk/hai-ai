"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Database, Headphones, Mail, MessageCircle, Workflow } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { WhatsAppIcon } from "./BrandIcons";
import RobotImage from "./RobotImage";
import SectionHeading from "./SectionHeading";

const services = [
  { key: "agents", icon: Bot },
  { key: "chatbots", icon: MessageCircle },
  { key: "workflow", icon: Workflow },
  { key: "email", icon: Mail },
  { key: "whatsapp", icon: WhatsAppIcon },
  { key: "support", icon: Headphones },
  { key: "crm", icon: Database },
  { key: "custom", icon: Brain },
] as const;

export default function Services() {
  const { t } = useI18n();
  return (
    <section id="services" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-10 left-[-8%] h-[26rem] w-[26rem] rounded-full bg-white/45 blur-3xl" />
        <div className="blob absolute bottom-0 right-[-6%] h-[22rem] w-[22rem] rounded-full bg-blush-300/35 blur-3xl" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <SectionHeading
            eyebrow={t.services.eyebrow}
            title={
              <>
                {t.services.titleA} <span className="text-gradient-brand">{t.services.titleAccent}</span>
              </>
            }
            sub={t.services.sub}
          />
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 right-0 hidden w-32 -rotate-6 xl:block"
          >
            <RobotImage move="float" alt="" className="w-full" />
          </motion.div>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ key, icon: Icon }, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.07 * i, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <div className="glass-card flex h-full cursor-pointer flex-col rounded-4xl p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white/90 hover:shadow-lift">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-cocoa-grad shadow-glow-gold transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                  <Icon className="h-6 w-6 text-blush-200" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold leading-snug text-cocoa-600">{t.services.items[key].title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-cocoa-400">{t.services.items[key].desc}</p>
                <span
                  className="mt-4 h-1 w-8 rounded-full bg-rosegold opacity-0 transition-all duration-300 group-hover:w-14 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
