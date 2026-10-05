"use client";

import type Lenis from "lenis";

/**
 * Tiny module store for the active Lenis instance, so any component can
 * scroll programmatically without prop drilling. Falls back to native
 * scrolling when Lenis is disabled (reduced motion).
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToTarget(
  target: number | string | HTMLElement,
  options: { offset?: number; immediate?: boolean; duration?: number; onComplete?: () => void } = {},
) {
  const { offset = 0, immediate = false, duration, onComplete } = options;
  if (instance) {
    instance.scrollTo(target, { offset, immediate, duration, force: true, onComplete: () => onComplete?.() });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = immediate || reduce ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    onComplete?.();
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
  onComplete?.();
}
