"use client";

import { useEffect } from "react";

const DELAY_MS = 1000;
const DURATION_MS = 15000;

/**
 * Hands-free page tour for demo recordings: wait 1s after load, then smoothly
 * scroll top → bottom over 15s with user input blocked, stop at the bottom.
 * Activates ONLY when the URL contains `?demo`, so real visitors are never
 * affected. Runs once — no loop; interaction is restored when it finishes.
 */
export default function DemoScroll() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("demo")) return;

    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    const swallow = (e: Event) => e.preventDefault();
    const swallowKeys = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
        e.preventDefault();
      }
    };

    const block = () => {
      document.body.style.pointerEvents = "none";
      window.addEventListener("wheel", swallow, { passive: false });
      window.addEventListener("touchmove", swallow, { passive: false });
      window.addEventListener("keydown", swallowKeys);
    };
    const unblock = () => {
      document.body.style.pointerEvents = "";
      window.removeEventListener("wheel", swallow);
      window.removeEventListener("touchmove", swallow);
      window.removeEventListener("keydown", swallowKeys);
      html.style.scrollBehavior = prevBehavior;
    };

    // rAF drives the motion — CSS smooth-scroll would fight it
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    block();

    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    let raf = 0;

    const timer = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DURATION_MS);
        // recompute each frame: page height can grow as images stream in
        const max = html.scrollHeight - window.innerHeight;
        window.scrollTo(0, easeInOutQuad(p) * max);
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          window.scrollTo(0, html.scrollHeight - window.innerHeight);
          unblock();
        }
      };
      raf = requestAnimationFrame(tick);
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      unblock();
    };
  }, []);

  return null;
}
