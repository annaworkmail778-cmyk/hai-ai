"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { getLenis, setLenis } from "./scroll-store";
import { media, smoothScroll } from "@/config/motion";

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and the
 * scroll position always agree. Disabled for reduced-motion users and on
 * touch devices (native momentum scrolling is kept there).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia(media.reducedMotion).matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: smoothScroll.duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: smoothScroll.wheelMultiplier,
      touchMultiplier: smoothScroll.touchMultiplier,
      autoRaf: false,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Layout can shift once web fonts arrive — recompute trigger positions.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  // After client-side navigation Next.js sets the scroll position natively
  // (top of page or #hash target). Re-sync Lenis to it and re-measure triggers.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true });
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
