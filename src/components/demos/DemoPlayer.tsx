"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { interpolate, pad2 } from "@/i18n/format";
import { media } from "@/config/motion";
import { cn } from "@/lib/cn";
import { demos, type DemoId } from "./registry";
import { DemoStage } from "./DemoStage";
import type { DemoSide } from "./types";

export type DemoLabels = {
  play: string;
  pause: string;
  next: string;
  prev: string;
  /** "Step {n} of {total}" */
  stepOf: string;
  /** Accessible name of the whole player. */
  region: string;
  /** Accessible name of the screen switch shown on narrow layouts. */
  screens: string;
};

const STEP_MS = 4200;
const LAST_STEP_MS = 6000;

const subscribeReduced = (cb: () => void) => {
  const q = window.matchMedia(media.reducedMotion);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(media.reducedMotion).matches,
    () => false,
  );

/**
 * Interactive, step-by-step demo of a system: what the customer sees and what
 * the team sees, with a plain caption for every step. Plays by itself while it
 * is on screen (never with reduced motion), pauses while someone points at or
 * focuses it, and can be driven step by step.
 */
export function DemoPlayer({
  id,
  locale,
  labels,
  className,
}: {
  id: DemoId;
  locale: Locale;
  labels: DemoLabels;
  className?: string;
}) {
  const demo = demos[id];
  const steps = demo.steps[locale];
  const sides = demo.sides[locale];
  const last = steps.length - 1;

  const rootRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const elapsed = useRef(0);
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const [announce, setAnnounce] = useState(false);
  // On narrow screens one side is shown at a time; null = follow the story.
  const [pinnedSide, setPinnedSide] = useState<DemoSide | null>(null);

  const running = playing && inView && !hold && !reduced;
  const focus = demo.focus[step];
  const shownSide = pinnedSide ?? focus;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A new step starts its timer from zero (before paint, so no bar flashes full).
  useLayoutEffect(() => {
    elapsed.current = 0;
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
  }, [step]);

  // Autoplay clock: drives the active step's progress bar and advances.
  useEffect(() => {
    if (!running) return;
    const duration = step === last ? LAST_STEP_MS : STEP_MS;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - previous;
      previous = now;
      const t = Math.min(1, elapsed.current / duration);
      if (barRef.current) barRef.current.style.transform = `scaleX(${t})`;
      if (t >= 1) {
        setAnnounce(false);
        setPinnedSide(null);
        setStep((s) => (s >= last ? 0 : s + 1));
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step, last]);

  const go = (next: number) => {
    setAnnounce(true);
    setPinnedSide(null);
    setStep(((next % steps.length) + steps.length) % steps.length);
  };

  const current = steps[step];

  return (
    <section
      ref={rootRef}
      aria-label={labels.region}
      className={cn("@container", className)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      {/* Side switch — narrow screens only */}
      <div role="group" aria-label={labels.screens} className="mb-3 flex gap-1 rounded-full bg-fg/6 p-1 @2xl:hidden">
        {(["a", "b"] as const).map((side) => (
          <button
            key={side}
            type="button"
            aria-pressed={shownSide === side}
            onClick={() => setPinnedSide(side)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-small font-medium transition-colors",
              shownSide === side ? "bg-fg text-bg" : "text-fg-mute",
            )}
          >
            {sides[side]}
          </button>
        ))}
      </div>

      <div className="relative">
        <DemoStage id={id} locale={locale} step={step} shownSide={shownSide} />
        {/* What is happening right now, on top of the screens. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 @2xl:bottom-6">
          <p
            key={step}
            className="flex max-w-full animate-demo-chip items-center gap-2.5 rounded-full bg-signal py-2 pr-4 pl-2 text-small font-medium text-black shadow-[0_12px_32px_-12px_rgb(255_91_20/0.8)] motion-reduce:animate-none"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-[0.7rem] text-paper tabular-nums">
              {step + 1}
            </span>
            <span className="truncate">{current.title}</span>
          </p>
        </div>
      </div>

      {/* Caption + controls */}
      <div className="mt-6 grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_auto] @3xl:items-start">
        <div aria-live={announce ? "polite" : "off"} aria-atomic="true">
          <p className="label text-fg-mute">{interpolate(labels.stepOf, { n: step + 1, total: steps.length })}</p>
          <p className="mt-2 text-title font-medium">{current.title}</p>
          <p className="mt-2 max-w-[58ch] text-body text-fg-mute">{current.text}</p>
        </div>
        <div className="flex items-center gap-2">
          <ControlButton label={labels.prev} onClick={() => go(step - 1)}>
            <path d="M14.5 6 8.5 12l6 6" />
          </ControlButton>
          <ControlButton
            label={playing && !reduced ? labels.pause : labels.play}
            onClick={() => {
              setAnnounce(true);
              if (reduced) {
                go(step + 1);
                return;
              }
              setPlaying((p) => !p);
            }}
            strong
          >
            {playing && !reduced ? <path d="M9 6.5v11M15 6.5v11" /> : <path d="M8.5 5.8v12.4L18.5 12z" fill="currentColor" />}
          </ControlButton>
          <ControlButton label={labels.next} onClick={() => go(step + 1)}>
            <path d="m9.5 6 6 6-6 6" />
          </ControlButton>
        </div>
      </div>

      {/* Step list doubles as a progress bar */}
      <ol className="mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              aria-current={i === step ? "step" : undefined}
              aria-label={`${interpolate(labels.stepOf, { n: i + 1, total: steps.length })}: ${s.title}`}
              onClick={() => go(i)}
              className="group block w-full py-1 text-left"
            >
              <span className="relative block h-1 overflow-hidden rounded-full bg-rule-strong">
                {/* The current bar is driven by the clock; others are simply full or empty. */}
                <span
                  ref={i === step ? barRef : undefined}
                  className="absolute inset-0 block origin-left bg-signal"
                  style={i === step ? undefined : { transform: i < step ? "scaleX(1)" : "scaleX(0)" }}
                />
              </span>
              <span className={cn("mt-2.5 flex items-baseline gap-2 transition-colors", i === step ? "text-fg" : "text-fg-mute group-hover:text-fg")}>
                <span className="label">{pad2(i + 1)}</span>
                <span className="hidden text-small leading-snug @3xl:block">{s.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  strong = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-12 items-center justify-center rounded-full border transition-colors duration-(--dur-micro)",
        strong ? "border-fg bg-fg text-bg hover:bg-fg/85" : "border-rule-strong text-fg hover:border-fg",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
