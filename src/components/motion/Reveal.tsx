"use client";

import { useRef, type ReactNode, type CSSProperties, type RefObject } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";
import { media } from "@/config/motion";

/** Elements the reveal wrappers may render as. */
type Tag = "p" | "h1" | "h2" | "h3" | "h4" | "div" | "span" | "li" | "ul" | "ol" | "blockquote" | "dl";

type RevealTextProps = {
  as?: Tag;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Seconds to wait after the trigger fires. */
  delay?: number;
  /** Animate on mount instead of on scroll. */
  immediate?: boolean;
  /** ScrollTrigger start position. */
  start?: string;
  style?: CSSProperties;
};

/**
 * Masked line reveal for headlines. Lines slide up from behind a clip mask.
 * Re-splits automatically on resize and when web fonts finish loading.
 * Text stays fully readable without JavaScript and for reduced motion.
 */
export function RevealText({
  as = "p",
  children,
  className,
  id,
  delay = 0,
  immediate = false,
  start = "top 88%",
  style,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          tag: "span",
          linesClass: "reveal-line",
          aria: "none",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 120,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.085,
              delay,
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            }),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  // Narrow the polymorphic tag for JSX typing; all options are HTMLElements.
  const Comp = as as "div";
  return (
    <Comp ref={ref as RefObject<HTMLDivElement>} id={id} className={className} style={style}>
      {children}
    </Comp>
  );
}

type RevealProps = {
  as?: Tag;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset in px. Keep small — this is for secondary elements. */
  y?: number;
  /** Stagger direct children instead of the wrapper. */
  stagger?: number;
  start?: string;
  style?: CSSProperties;
};

/** Quiet fade-up for small elements (labels, paragraphs, lists). */
export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  y = 18,
  stagger,
  start = "top 90%",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: 1,
          ease: "expo.out",
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const Comp = as as "div";
  return (
    <Comp ref={ref as RefObject<HTMLDivElement>} className={className} style={style}>
      {children}
    </Comp>
  );
}

type MediaRevealProps = {
  children: ReactNode;
  className?: string;
  /** Direction the mask opens towards. */
  from?: "bottom" | "top" | "left" | "right";
  start?: string;
  style?: CSSProperties;
};

const CLIP_FROM: Record<NonNullable<MediaRevealProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/** Clip-path reveal with a slow inner scale settle — for visuals and media. */
export function MediaReveal({ children, className, from = "bottom", start = "top 85%", style }: MediaRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.firstElementChild as HTMLElement | null;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } });
        tl.fromTo(
          el,
          { clipPath: CLIP_FROM[from] },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
        );
        if (inner) {
          tl.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Percentage of own height to travel across the viewport. */
  amount?: number;
  style?: CSSProperties;
};

/** Scroll-linked vertical drift for depth. Desktop + motion-OK only. */
export function Parallax({ children, className, amount = 10, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${media.motionOk} and ${media.desktop}`, () => {
        gsap.fromTo(
          el,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
