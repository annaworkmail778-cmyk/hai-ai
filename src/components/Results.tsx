"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, MessageCircle, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Counter from "./Counter";
import SectionHeading from "./SectionHeading";

const points: Array<[number, number]> = [
  [40, 208],
  [130, 192],
  [220, 150],
  [310, 118],
  [400, 84],
  [490, 46],
];
const linePath = `M ${points[0][0]} ${points[0][1]} ${points
  .slice(1)
  .map(([x, y], i) => {
    const [px, py] = points[i];
    const cx = (px + x) / 2;
    return `C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  })
  .join(" ")}`;
const areaPath = `${linePath} L 490 232 L 40 232 Z`;

export default function Results() {
  const { t } = useI18n();

  const bars = [
    { icon: Clock, ...t.results.bars.busywork, barBefore: "100%", barAfter: "19%" },
    { icon: MessageCircle, ...t.results.bars.reply, barBefore: "100%", barAfter: "8%" },
  ];
  const kpis = [
    { icon: TrendingUp, value: <Counter to={64} prefix="+" suffix="%" />, label: t.results.kpis.output },
    { icon: Zap, value: <Counter to={45} prefix="−" suffix="%" />, label: t.results.kpis.cost },
    { icon: Clock, value: <Counter to={10} suffix="×" />, label: t.results.kpis.speed },
  ];

  return (
    <section id="results" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute top-16 left-[-8%] h-[26rem] w-[26rem] rounded-full bg-white/45 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.results.eyebrow}
          title={
            <>
              {t.results.titleA} <span className="text-gradient-brand">{t.results.titleAccent}</span>
            </>
          }
          sub={t.results.sub}
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-4xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-cocoa-600">{t.results.chartTitle}</h3>
                <p className="mt-1 text-sm text-cocoa-400">{t.results.chartSub}</p>
              </div>
              <span className="glass-deep flex items-center gap-1.5 rounded-full px-3.5 py-2 font-display text-sm font-bold text-cocoa-600 shadow-soft">
                <TrendingUp className="h-4 w-4 text-rosegold-500" aria-hidden="true" />
                {t.results.chartBadge}
              </span>
            </div>

            <svg viewBox="0 0 520 260" className="mt-4 w-full" role="img" aria-label={t.results.chartAria}>
              <defs>
                <linearGradient id="results-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#CE8F72" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#CE8F72" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="results-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#E99BB0" />
                  <stop offset="1" stopColor="#6B3D36" />
                </linearGradient>
              </defs>
              {[70, 140, 210].map((y) => (
                <line key={y} x1="40" y1={y} x2="490" y2={y} stroke="#E9BFC9" strokeWidth="1" strokeDasharray="3 7" />
              ))}
              <motion.path d={areaPath} fill="url(#results-area)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 1 }} />
              <motion.path d={linePath} fill="none" stroke="url(#results-line)" strokeWidth="4.5" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }} />
              {points.map(([x, y], i) => (
                <motion.circle key={x} cx={x} cy={y} r="6" fill="#FFFBFA" stroke="#B87357" strokeWidth="3" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.22, duration: 0.35 }} />
              ))}
              {points.map(([x], i) => (
                <text key={x} x={x} y="252" textAnchor="middle" fontSize="13" fontWeight="600" fill="#A87A71" fontFamily="var(--font-body)">
                  M{i + 1}
                </text>
              ))}
            </svg>
          </motion.div>

          <div className="flex flex-col gap-5">
            {bars.map(({ icon: Icon, title, before, after, beforeVal, afterVal, chip, barBefore, barAfter }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card flex-1 rounded-4xl p-6 sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blush-200 text-cocoa-500">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-[15px] font-bold leading-snug text-cocoa-600">{title}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-cocoa-grad px-3 py-1.5 font-display text-xs font-bold text-blush-200">{chip}</span>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: before, val: beforeVal, w: barBefore, dark: false },
                    { label: after, val: afterVal, w: barAfter, dark: true },
                  ].map((row, r) => (
                    <div key={r}>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cocoa-300">{row.label}</span>
                        <span className="font-display text-sm font-bold text-cocoa-600">{row.val}</span>
                      </div>
                      <div className="h-3.5 overflow-hidden rounded-full bg-white/70">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: row.w }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 1.1, delay: 0.3 + r * 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${row.dark ? "bg-cocoa-grad" : "bg-blush-300"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {kpis.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card flex items-center gap-4 rounded-4xl p-6"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rosegold shadow-glow-gold">
                <Icon className="h-5.5 w-5.5 text-white" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-cocoa-600">{value}</p>
                <p className="mt-0.5 text-sm leading-snug text-cocoa-400">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs font-medium text-cocoa-300">{t.results.footnote}</p>
      </div>
    </section>
  );
}
