import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Building blocks for the interactive demos. Screens are real HTML with
 * readable text sizes, drawn in light interface colours inside dark device
 * frames, with the brand accent for what is new or important.
 */

export const ACCENT = "var(--color-signal)";

/** Fades/slides content in when `show` turns true (content keeps its space). */
export function Appear({
  show,
  delay = 0,
  className,
  children,
}: {
  show: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden={show ? undefined : true}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
      style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/** Mount animation for content that is added at a step. */
export function Enter({
  delay = 0,
  pop = false,
  className,
  children,
  style,
}: {
  delay?: number;
  pop?: boolean;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={cn(pop ? "animate-demo-pop" : "animate-demo-in", className)} style={{ animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/** A phone with a status bar and an app header. Fills its box; keeps phone proportions. */
export function PhoneFrame({
  time,
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  time: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[19rem] items-stretch justify-center">
      <div className="relative flex aspect-[9/18.5] max-h-full w-full flex-col overflow-hidden rounded-[2rem] border-[6px] border-[#232323] bg-white text-[#141414] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)]">
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[0.6875rem] font-semibold tabular-nums">
          <span>{time}</span>
          <span aria-hidden="true" className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-[#232323]" />
          <span aria-hidden="true" className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-[1px] bg-[#141414]" />
            <span className="h-2.5 w-5 rounded-[3px] border border-[#141414] p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-[#141414]" />
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2.5 border-b border-black/8 px-3.5 py-2.5">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#141414] text-[0.625rem] font-semibold text-white">
            {title.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[0.8125rem] font-semibold">{title}</p>
            {subtitle && <p className="truncate text-[0.6875rem] text-[#6b6a66]">{subtitle}</p>}
          </div>
          {badge}
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        {footer}
      </div>
    </div>
  );
}

/** A desktop app window with a title bar. */
export function AppFrame({ title, children, toast }: { title: string; children: ReactNode; toast?: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#f6f5f1] text-[#141414] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.75)]">
      <div className="flex items-center gap-3 border-b border-black/8 bg-white px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-black/12" />
          <span className="size-2.5 rounded-full bg-black/12" />
          <span className="size-2.5 rounded-full bg-black/12" />
        </span>
        <p className="truncate text-[0.8125rem] font-semibold">{title}</p>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      {toast}
    </div>
  );
}

/** Notification card sliding in at the top right of a screen. */
export function Toast({ show, title, text, className }: { show: boolean; title: string; text?: string; className?: string }) {
  return (
    <div
      aria-hidden={show ? undefined : true}
      className={cn(
        "pointer-events-none absolute top-14 right-3 left-3 z-10 rounded-md border border-black/10 bg-white p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] transition-[opacity,transform] duration-500 ease-out sm:left-auto sm:w-[17rem]",
        show ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
        className,
      )}
      style={{ transitionDelay: show ? "500ms" : "0ms" }}
    >
      <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />
        {title}
      </p>
      {text && <p className="mt-1 pl-4 text-[0.75rem] text-[#55544f]">{text}</p>}
    </div>
  );
}

/** Chat bubble. `ai` bubbles carry a small label. */
export function Bubble({
  from,
  children,
  meta,
  label,
}: {
  from: "them" | "us";
  children: ReactNode;
  meta?: string;
  label?: string;
}) {
  const us = from === "us";
  return (
    <div className={cn("flex flex-col gap-1", us ? "items-end" : "items-start")}>
      {label && (
        <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold text-[#55544f]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
          {label}
        </span>
      )}
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-3 py-2 text-[0.8125rem] leading-snug",
          us ? "rounded-br-md bg-[#141414] text-white" : "rounded-bl-md bg-[#efede7] text-[#141414]",
        )}
      >
        {children}
      </div>
      {meta && <span className="px-1 text-[0.625rem] text-[#8a8984] tabular-nums">{meta}</span>}
    </div>
  );
}

/** "…" typing indicator. */
export function Typing({ from = "us" }: { from?: "them" | "us" }) {
  return (
    <div className={cn("flex", from === "us" ? "justify-end" : "justify-start")}>
      <div aria-hidden="true" className={cn("flex gap-1 rounded-2xl px-3 py-2.5", from === "us" ? "bg-[#141414]" : "bg-[#efede7]")}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("size-1.5 animate-demo-typing rounded-full", from === "us" ? "bg-white" : "bg-[#141414]")}
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Chip({ children, tone = "plain", className }: { children: ReactNode; tone?: "plain" | "accent" | "dark" | "ok"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap",
        tone === "plain" && "bg-black/6 text-[#3a3936]",
        tone === "accent" && "bg-signal text-black",
        tone === "dark" && "bg-[#141414] text-white",
        tone === "ok" && "bg-[#e3efe4] text-[#1e5a2b]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Label + value row used in record cards. */
export function Field({ label, value, show = true, delay = 0 }: { label: string; value: ReactNode; show?: boolean; delay?: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-black/6 py-1.5 last:border-0">
      <span className="shrink-0 text-[0.75rem] text-[#6b6a66]">{label}</span>
      <Appear show={show} delay={delay} className="min-w-0 text-right text-[0.8125rem] font-medium">
        {value}
      </Appear>
    </div>
  );
}

/** Horizontal bar that fills to `value` (0–1). */
export function Meter({ value, accent = true }: { value: number; accent?: boolean }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/8">
      <div
        className={cn("h-full rounded-full transition-[width] delay-300 duration-[1200ms] ease-out", accent ? "bg-signal" : "bg-[#141414]")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
