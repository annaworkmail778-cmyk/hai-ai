"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { media } from "@/config/motion";

/** Draws `[data-edge]` paths (pathLength=1) when the diagram enters the viewport. */
export function DrawOnView({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        gsap.fromTo(
          el.querySelectorAll("[data-edge]"),
          { strokeDasharray: "1 1", strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.inOut",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 75%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
