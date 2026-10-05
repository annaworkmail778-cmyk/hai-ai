"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { media } from "@/config/motion";

/**
 * Desktop (and motion-OK): vertical scrolling drives the horizontal `[data-track]`.
 * The wrapper's height is set to the horizontal distance + one viewport, and
 * the stage stays pinned with CSS `position: sticky` (no DOM re-parenting).
 * Elsewhere the children simply flow vertically.
 */
export function HorizontalScroller({ children, label }: { children: ReactNode; label?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const outer = outerRef.current;
      if (!outer) return;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop} and ${media.motionOk}`, () => {
        const track = outer.querySelector<HTMLElement>("[data-track]");
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const setHeight = () => {
          outer.style.height = `${distance() + window.innerHeight}px`;
        };
        setHeight();
        ScrollTrigger.addEventListener("refreshInit", setHeight);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: outer,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
            },
          },
        });

        // Depth: visuals drift against the direction of travel.
        outer.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-panel]") ?? el,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setHeight);
          outer.style.height = "";
        };
      });
      return () => mm.revert();
    },
    { scope: outerRef },
  );

  return (
    <div ref={outerRef} className="relative">
      <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-svh lg:motion-safe:overflow-hidden">
        {children}
        <div aria-hidden="true" className="absolute inset-x-(--page-x) bottom-8 hidden items-center gap-4 lg:motion-safe:flex">
          {label && <span className="label text-fg-mute">{label}</span>}
          <span className="relative block h-px flex-1 bg-rule">
            <span ref={barRef} className="absolute inset-0 block origin-left scale-x-0 bg-fg" />
          </span>
        </div>
      </div>
    </div>
  );
}
