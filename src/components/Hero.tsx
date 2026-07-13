"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Calendar, Clock, MessageCircle, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import RobotImage from "./RobotImage";
import ChannelStrip from "./ChannelStrip";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  // pointer position, normalized to -0.5..0.5, smoothed with a spring
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const smx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.5 });
  const smy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.5 });

  // scroll progress across the hero → vertical parallax drift
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const K = reduce ? 0 : 1;
  const robotScroll = useTransform(scrollYProgress, [0, 1], [0, -34 * K]);
  const chipScroll = useTransform(scrollYProgress, [0, 1], [0, -80 * K]);

  // depth layers: blobs (far, opposite) · robot (mid) · chips (near)
  const blobX = useTransform(smx, (v) => v * -70 * K);
  const blobY = useTransform(smy, (v) => v * -70 * K);
  const robotX = useTransform(smx, (v) => v * 26 * K);
  const robotY = useTransform(() => smy.get() * 26 * K + robotScroll.get());
  const chipX = useTransform(smx, (v) => v * 46 * K);
  const chipY = useTransform(() => smy.get() * 46 * K + chipScroll.get());

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, px, py]);

  return (
    <section id="hero" className="relative overflow-hidden pt-36 pb-14 sm:pt-44 lg:pb-20">
      {/* ambient blobs (far parallax layer) */}
      <motion.div style={{ x: blobX, y: blobY }} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute -top-32 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-white/50 blur-3xl" />
        <div className="blob absolute top-1/3 left-[-12%] h-[28rem] w-[28rem] rounded-full bg-blush-300/40 blur-3xl" style={{ animationDelay: "-5s" }} />
        <div className="blob absolute bottom-[-20%] right-[20%] h-[24rem] w-[24rem] rounded-full bg-rosegold-200/30 blur-3xl" style={{ animationDelay: "-9s" }} />
      </motion.div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        {/* copy */}
        <div className="text-center lg:text-left">
          <motion.span variants={fadeUp} initial="hidden" animate="show" custom={0} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-cocoa-400">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rosegold-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rosegold-400" />
            </span>
            {t.hero.badge}
          </motion.span>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="mt-6 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight text-cocoa-600 sm:text-6xl lg:text-[3.9rem]">
            {t.hero.titleA}
            <br />
            {t.hero.titleB} <span className="text-gradient-brand">{t.hero.titleAccent}</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cocoa-400 sm:text-lg lg:mx-0">
            {t.hero.sub}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
            <a href="#contact" className="btn btn-primary w-full sm:w-auto">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#contact" className="btn btn-secondary w-full sm:w-auto">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-8 font-display text-sm font-medium text-cocoa-300">
            {t.hero.tagline}
          </motion.p>
        </div>

        {/* mascot stage with cinematic parallax */}
        <motion.div
          ref={stageRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md [perspective:1000px]"
        >
          <div className="glass-card relative rounded-6xl p-8 shadow-lift sm:p-10">
            {/* robot (mid layer) */}
            <motion.div style={{ x: robotX, y: robotY }}>
              <RobotImage move="wobble" variant="2" sparkles priority alt="HAI, the HAI_AI robot assistant, winking hello" className="mx-auto w-56 sm:w-64" />
            </motion.div>

            {/* floating chips (near layer) */}
            <motion.div style={{ x: chipX, y: chipY }} className="pointer-events-none absolute inset-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="glass-deep animate-float-slow absolute -left-4 top-16 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-soft sm:-left-8">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cocoa-grad">
                  <Clock className="h-3.5 w-3.5 text-blush-200" aria-hidden="true" />
                </span>
                <span className="font-display text-xs font-semibold text-cocoa-600">{t.hero.chipAlways}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.6 }} className="glass-deep animate-float absolute -right-3 top-40 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-soft sm:-right-7" style={{ animationDelay: "-2s" }}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-rosegold">
                  <Zap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <span className="font-display text-xs font-semibold text-cocoa-600">{t.hero.chipHours}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} className="glass-deep animate-float-slow absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 shadow-soft" style={{ animationDelay: "-4s" }}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-blush-400">
                  <MessageCircle className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <span className="font-display text-xs font-semibold text-cocoa-600">{t.hero.chipHello}</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* channel brand icons — where your customers already are */}
      <ChannelStrip />
    </section>
  );
}
