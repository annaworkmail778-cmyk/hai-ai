"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { scrollToTarget } from "@/components/motion/scroll-store";
import { Arrow } from "@/components/ui/Arrow";
import { cn } from "@/lib/cn";

/* ── Live local time (brand time zone) ─────────────────────────── */

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 15_000);
  return () => window.clearInterval(id);
}

export function LocalTime({ timeZone, intlLocale }: { timeZone: string; intlLocale: string }) {
  const time = useSyncExternalStore(
    subscribeMinute,
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).format(new Date()),
    () => "--:--",
  );
  return (
    <time suppressHydrationWarning className="tabular-nums">
      {time}
    </time>
  );
}

/* ── Back to top ───────────────────────────────────────────────── */

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToTarget(0, { duration: 1.6 })}
      className="group label inline-flex items-center gap-2 text-fg-mute transition-colors hover:text-fg"
    >
      <span>{label}</span>
      <Arrow direction="up" className="transition-transform duration-(--dur-ui) group-hover:-translate-y-0.5" />
    </button>
  );
}

/* ── Text fitted exactly to its container width ────────────────── */

export function FitText({ text, className }: { text: string; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const span = textRef.current;
    if (!box || !span) return;
    const fit = () => {
      span.style.fontSize = "100px";
      const natural = span.getBoundingClientRect().width;
      const available = box.clientWidth;
      if (natural > 0) span.style.fontSize = `${(available / natural) * 100 * 0.995}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);

  // CSS approximation before measurement avoids a visible jump.
  const approx = `calc((min(100vw, var(--shell-max)) - 2 * var(--page-x)) / ${Math.max(text.length, 4) * 0.66})`;

  return (
    <div ref={boxRef} className={cn("w-full overflow-hidden", className)} aria-hidden="true">
      <span
        ref={textRef}
        className="block w-max leading-[0.8] font-semibold tracking-[-0.045em] whitespace-nowrap uppercase"
        style={{ fontSize: approx }}
      >
        {text}
      </span>
    </div>
  );
}
