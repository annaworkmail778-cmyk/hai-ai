"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
};

export default function SectionHeading({ eyebrow, title, sub, align = "center" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}
    >
      <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.18em] text-cocoa-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rosegold-400" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold leading-[1.12] tracking-tight text-cocoa-600 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-5 text-base leading-relaxed text-cocoa-400 sm:text-lg">{sub}</p>}
    </motion.div>
  );
}
