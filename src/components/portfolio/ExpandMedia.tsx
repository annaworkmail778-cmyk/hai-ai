"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { media } from "@/config/motion";
import { cn } from "@/lib/cn";

/**
 * Full-width media that "scales out": it starts inset to the page margins
 * and opens to full bleed as it scrolls through the viewport.
 */
export function ExpandMedia({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.firstElementChild as HTMLElement | null;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        const probe = document.querySelector<HTMLElement>(".shell");
        const margin = probe ? parseFloat(getComputedStyle(probe).paddingLeft) || 24 : 24;
        gsap.fromTo(
          el,
          { clipPath: `inset(0px ${margin}px 0px ${margin}px round 6px)` },
          {
            clipPath: "inset(0px 0px 0px 0px round 0px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "top 10%", scrub: true },
          },
        );
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.1 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden motion-safe:[clip-path:inset(0_var(--page-x)_0_var(--page-x)_round_6px)]",
        className,
      )}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
