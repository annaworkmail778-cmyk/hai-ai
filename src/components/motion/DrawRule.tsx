"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { media } from "@/config/motion";
import { cn } from "@/lib/cn";

/**
 * Section transition: a hairline that expands across the full viewport as
 * the section arrives (scroll-scrubbed). Static for reduced motion.
 */
export function DrawRule({ className, tone = "fg" }: { className?: string; tone?: "fg" | "signal" }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const line = el.firstElementChild as HTMLElement;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden="true" className={cn("w-full pt-px", className)}>
      <span className={cn("block h-px w-full origin-left", tone === "signal" ? "bg-signal" : "bg-fg/40")} />
    </div>
  );
}
