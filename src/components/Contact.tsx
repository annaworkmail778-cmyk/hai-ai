"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import RobotImage from "./RobotImage";
import SectionHeading from "./SectionHeading";

const fieldClass =
  "w-full rounded-2xl border border-blush-300/70 bg-white/80 px-5 py-3.5 text-[15px] text-cocoa-600 placeholder:text-cocoa-200 transition-all duration-200 focus:border-rosegold-400 focus:bg-white focus:shadow-glow-gold focus:outline-none";

export default function Contact() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  }

  return (
    <section id="contact" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-0 left-[10%] h-[26rem] w-[26rem] rounded-full bg-white/50 blur-3xl" />
        <div className="blob absolute bottom-0 right-[-6%] h-[24rem] w-[24rem] rounded-full bg-blush-300/40 blur-3xl" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={
            <>
              {t.contact.titleA} <span className="text-gradient-brand">{t.contact.titleAccent}</span>
            </>
          }
          sub={t.contact.sub}
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-deep rounded-5xl p-7 shadow-lift sm:p-10"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center py-10 text-center">
                  <RobotImage move="bounce" sparkles alt={t.contact.sentTitle} className="w-36" />
                  <h3 className="mt-6 font-display text-2xl font-bold text-cocoa-600">{t.contact.sentTitle}</h3>
                  <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-cocoa-400">{t.contact.sentBody}</p>
                  <button type="button" onClick={() => setSent(false)} className="btn btn-secondary mt-8">
                    {t.contact.sendAnother}
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block font-display text-sm font-semibold text-cocoa-600">{t.contact.name}</label>
                      <input id="name" name="name" type="text" required placeholder={t.contact.namePh} className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block font-display text-sm font-semibold text-cocoa-600">{t.contact.email}</label>
                      <input id="email" name="email" type="email" required placeholder={t.contact.emailPh} className={fieldClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="mb-2 block font-display text-sm font-semibold text-cocoa-600">{t.contact.company}</label>
                    <input id="company" name="company" type="text" placeholder={t.contact.companyPh} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block font-display text-sm font-semibold text-cocoa-600">{t.contact.message}</label>
                    <textarea id="message" name="message" required rows={4} placeholder={t.contact.messagePh} className={`${fieldClass} resize-none`} />
                  </div>
                  <div className="flex flex-col gap-3.5 pt-2 sm:flex-row">
                    <button type="submit" disabled={sending} className="btn btn-primary flex-1 disabled:cursor-wait disabled:opacity-70">
                      {sending ? t.contact.sending : t.contact.talk}
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <a href="mailto:hello@haiai.systems" className="btn btn-secondary flex-1">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      {t.contact.getStarted}
                    </a>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden w-full max-w-xs lg:block"
          >
            <div className="glass-deep relative mb-4 ml-10 rounded-3xl rounded-bl-md px-5 py-3.5 shadow-soft">
              <p className="font-display text-sm font-semibold text-cocoa-600">{t.contact.bubble}</p>
            </div>
            <RobotImage move="sway" alt={t.contact.bubble} className="mx-auto w-full max-w-[250px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
