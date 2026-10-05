/**
 * Motion tokens shared by GSAP timelines and CSS (see --ease-* / --dur-* in
 * src/styles/site.css). Keep durations and easing consistent across the site.
 */
export const ease = {
  /** Default reveal: fast start, long settle. */
  out: "expo.out",
  /** Section / camera transitions. */
  inOut: "power3.inOut",
  /** UI state changes. */
  ui: "power2.out",
  /** Magnetic return. */
  elastic: "elastic.out(1, 0.45)",
  /** Scrubbed timelines map scroll 1:1. */
  none: "none",
} as const;

export const duration = {
  micro: 0.2,
  ui: 0.45,
  reveal: 0.95,
  cinematic: 1.4,
} as const;

/** CSS equivalents, for inline styles. */
export const cssEase = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** Lenis smooth-scroll settings. */
export const smoothScroll = {
  duration: 1.15,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
} as const;

/** Breakpoints mirrored from the CSS theme (px). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const media = {
  desktop: `(min-width: ${breakpoints.lg}px)`,
  mobile: `(max-width: ${breakpoints.lg - 1}px)`,
  reducedMotion: "(prefers-reduced-motion: reduce)",
  motionOk: "(prefers-reduced-motion: no-preference)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;
