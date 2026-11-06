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

/* ── Channels ─────────────────────────────────────────────────────────── */

export type Channel = "instagram" | "whatsapp" | "telegram" | "google" | "web";

const channelBg: Record<Channel, string> = {
  instagram: "bg-[linear-gradient(45deg,#f9b234,#ee2a7b_55%,#6228d7)]",
  whatsapp: "bg-[#25d366]",
  telegram: "bg-[#2aabee]",
  google: "bg-white ring-1 ring-black/10",
  web: "bg-[#141414]",
};

/** Small round channel badge (generic glyphs, not official logos). */
export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full text-white", channelBg[channel], className)}
    >
      <svg viewBox="0 0 16 16" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="1.7">
        {channel === "instagram" && (
          <>
            <rect x="2.5" y="2.5" width="11" height="11" rx="3.2" />
            <circle cx="8" cy="8" r="2.6" />
            <circle cx="11.4" cy="4.6" r="0.6" fill="currentColor" stroke="none" />
          </>
        )}
        {channel === "whatsapp" && <path d="M3 13l.9-2.6A5.3 5.3 0 1 1 6 12.4z" />}
        {channel === "telegram" && <path d="M2.5 7.6 13.5 3l-2 10-3.6-2.8-1.8 1.8v-3l5-4.6-6.2 3.9z" strokeLinejoin="round" />}
        {channel === "google" && <path d="M12.8 8.2H8.2m4.6 0A4.8 4.8 0 1 1 11.3 4.6" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" />}
        {channel === "web" && (
          <>
            <circle cx="8" cy="8" r="5.5" />
            <path d="M2.5 8h11M8 2.5c-2.5 3-2.5 8 0 11M8 2.5c2.5 3 2.5 8 0 11" />
          </>
        )}
      </svg>
    </span>
  );
}

/* ── Devices ──────────────────────────────────────────────────────────── */

/** A phone with a status bar and an app header. Fills its box; keeps phone proportions. */
export function PhoneFrame({
  time,
  title,
  subtitle,
  badge,
  channel,
  children,
  footer,
}: {
  time: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  /** Draws the avatar and header in the style of that messenger. */
  channel?: Channel;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[19rem] items-stretch justify-center">
      <div className="relative flex aspect-[9/18.5] max-h-full w-full flex-col overflow-hidden rounded-[2.25rem] border-[5px] border-[#1b1b1b] bg-white text-[#141414] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_30px_70px_-24px_rgb(0_0_0/0.8),0_0_80px_-30px_rgb(255_91_20/0.35)]">
        <div className="flex items-center justify-between px-6 pt-2.5 pb-1 text-[0.6875rem] font-semibold tabular-nums">
          <span>{time}</span>
          <span aria-hidden="true" className="absolute top-2 left-1/2 h-[1.1rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-[#141414]" />
          <span aria-hidden="true" className="flex items-center gap-1">
            <span className="flex items-end gap-px">
              {[3, 5, 7, 9].map((h) => (
                <span key={h} className="w-[3px] rounded-[1px] bg-[#141414]" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-0.5 h-2.5 w-5 rounded-[3px] border border-[#141414] p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-[#141414]" />
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2.5 border-b border-black/[0.07] bg-white/90 px-3.5 py-2.5 backdrop-blur">
          <span
            aria-hidden="true"
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center rounded-full p-[2px]",
              channel === "instagram" ? channelBg.instagram : "bg-transparent",
            )}
          >
            <span className="flex size-full items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#2b2b2b,#0e0e0e)] text-[0.6875rem] font-semibold text-white">
              {title.slice(0, 1)}
            </span>
            {channel && channel !== "instagram" && <ChannelIcon channel={channel} className="absolute -right-0.5 -bottom-0.5 size-3.5 ring-2 ring-white" />}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[0.8125rem] font-semibold">{title}</p>
            {subtitle && (
              <p className="flex items-center gap-1 truncate text-[0.6875rem] text-[#6b6a66]">
                {channel === "instagram" && <ChannelIcon channel="instagram" className="size-3" />}
                <span className="truncate">{subtitle}</span>
              </p>
            )}
          </div>
          {badge}
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#ffffff,#f7f6f2)]">{children}</div>
        {footer}
        <span aria-hidden="true" className="mx-auto mt-auto mb-1.5 h-1 w-24 shrink-0 rounded-full bg-[#141414]/80" />
      </div>
    </div>
  );
}

/**
 * A desktop app window with a title bar and, on wide screens, a side menu.
 * `nav` lists the menu items; `active` is highlighted.
 */
export function AppFrame({
  title,
  children,
  toast,
  nav,
  active = 0,
}: {
  title: string;
  children: ReactNode;
  toast?: ReactNode;
  nav?: string[];
  active?: number;
}) {
  return (
    <div className="@container/app relative flex h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#f6f5f1] text-[#141414] shadow-[0_30px_70px_-28px_rgb(0_0_0/0.85)]">
      {nav && (
        <aside className="hidden w-[9.5rem] shrink-0 flex-col gap-1 bg-[#121212] p-3 text-white @3xl/app:flex">
          <p className="mb-3 flex items-center gap-2 px-1.5 pt-1 text-[0.8125rem] font-semibold">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
              <rect x="1.5" y="12" width="4" height="6.5" rx="1" fill="currentColor" />
              <rect x="7.75" y="8.5" width="4" height="10" rx="1" fill="currentColor" />
              <path d="M14 18.5V7.5h-1.6L16 2.5l3.6 5H18v11z" fill={ACCENT} />
            </svg>
            Riseup
          </p>
          {nav.map((item, i) => (
            <span
              key={item}
              className={cn(
                "flex items-center gap-2 truncate rounded-lg px-2 py-1.5 text-[0.75rem]",
                i === active ? "bg-white/10 font-semibold text-white" : "text-white/55",
              )}
            >
              <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", i === active ? "bg-signal" : "bg-white/25")} />
              <span className="truncate">{item}</span>
            </span>
          ))}
        </aside>
      )}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-black/[0.07] bg-white px-4 py-2.5">
          {!nav && (
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="size-2.5 rounded-full bg-[#28c840]/80" />
            </span>
          )}
          <p className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">{title}</p>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#e3efe4] px-2 py-0.5 text-[0.625rem] font-semibold text-[#1e5a2b] @md/app:flex">
            <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-[#2f9e4a] motion-reduce:animate-none" />
            Live
          </span>
        </div>
        <div className="relative min-h-0 flex-1">{children}</div>
        {toast}
      </div>
    </div>
  );
}

/* ── Feedback ─────────────────────────────────────────────────────────── */

/** Notification card sliding in at the top right of a screen. */
export function Toast({
  show,
  title,
  text,
  channel = "telegram",
  className,
}: {
  show: boolean;
  title: string;
  text?: string;
  /** Icon shown on the card; defaults to Telegram, where owners get alerts. */
  channel?: Channel | null;
  className?: string;
}) {
  return (
    <div
      aria-hidden={show ? undefined : true}
      className={cn(
        "pointer-events-none absolute top-14 right-3 left-3 z-10 rounded-xl border border-black/10 bg-white/95 p-3 shadow-[0_18px_40px_-14px_rgb(0_0_0/0.4)] backdrop-blur transition-[opacity,transform] duration-500 ease-out sm:left-auto sm:w-[17.5rem]",
        show ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
        className,
      )}
      style={{ transitionDelay: show ? "500ms" : "0ms" }}
    >
      <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
        {channel ? <ChannelIcon channel={channel} /> : <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />}
        {title}
      </p>
      {text && <p className="mt-1 pl-6 text-[0.75rem] text-[#55544f]">{text}</p>}
    </div>
  );
}

/** Sparkle used to mark what the AI did. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={cn("size-2.5 shrink-0 text-signal", className)} fill="currentColor">
      <path d="M6 0c.4 2.9 1.9 4.6 6 6-4.1 1.4-5.6 3.1-6 6-.4-2.9-1.9-4.6-6-6 4.1-1.4 5.6-3.1 6-6z" />
    </svg>
  );
}

/** Chat bubble. `label` marks messages written by the AI. */
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
        <span className="flex items-center gap-1 text-[0.625rem] font-semibold text-[#55544f]">
          <Sparkle />
          {label}
        </span>
      )}
      <div
        className={cn(
          "max-w-[86%] rounded-[1.1rem] px-3 py-2 text-[0.8125rem] leading-snug [overflow-wrap:anywhere]",
          us
            ? "rounded-br-md bg-[linear-gradient(135deg,#2a2a2a,#0d0d0d)] text-white shadow-[0_6px_16px_-10px_rgb(0_0_0/0.6)]"
            : "rounded-bl-md bg-[#efede7] text-[#141414]",
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

/** Row of quick-reply buttons under a message; `picked` is the one tapped. */
export function QuickReplies({ items, picked }: { items: string[]; picked?: number }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {items.map((item, i) => (
        <span
          key={item}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold transition-colors duration-300",
            i === picked ? "border-signal bg-signal text-black" : "border-black/12 bg-white text-[#141414]",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────── */

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

/** Small figure card: a label, a big value and an optional note. */
export function Stat({
  label,
  value,
  note,
  accent = false,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <Enter
      pop
      delay={delay}
      className={cn("min-w-0 rounded-xl p-3", accent ? "bg-[#141414] text-white" : "bg-white ring-1 ring-black/[0.06]")}
    >
      <p className={cn("truncate text-[0.6875rem] font-medium", accent ? "text-white/60" : "text-[#6b6a66]")}>{label}</p>
      <p className="mt-1 text-[1.35rem] leading-none font-semibold tabular-nums">{value}</p>
      {note && <p className={cn("mt-1.5 truncate text-[0.6875rem] font-semibold", accent ? "text-signal" : "text-[#2f7a3e]")}>{note}</p>}
    </Enter>
  );
}

/** Animated column chart; values are 0–1, `highlight` marks one column. */
export function Bars({ values, highlight, className }: { values: number[]; highlight?: number; className?: string }) {
  return (
    <div className={cn("flex h-16 items-end gap-1", className)}>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            "flex-1 origin-bottom animate-demo-bar rounded-t-[3px]",
            i === highlight ? "bg-signal" : "bg-[#141414]/15",
          )}
          style={{ height: `${Math.max(6, v * 100)}%`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

/** Five stars, `value` of them filled. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex gap-0.5", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 12 12" className={cn("size-3", i < value ? "text-[#f5b301]" : "text-black/15")} fill="currentColor">
          <path d="m6 .8 1.6 3.4 3.7.4-2.8 2.5.8 3.7L6 9 2.7 10.8l.8-3.7L.7 4.6l3.7-.4z" />
        </svg>
      ))}
    </span>
  );
}

/** Round check mark in a green disc. */
export function CheckBadge({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex size-12 items-center justify-center rounded-full bg-[#e3efe4] text-[#1e5a2b]", className)}>
      <svg viewBox="0 0 24 24" className="size-[50%]" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/** Placeholder lines that shimmer while the AI is writing. */
export function Drafting({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          className="h-2 animate-demo-shimmer rounded-full bg-[linear-gradient(90deg,rgb(0_0_0/0.06),rgb(255_91_20/0.35),rgb(0_0_0/0.06))] bg-[length:200%_100%] motion-reduce:animate-none"
          style={{ width: `${92 - i * 18}%` }}
        />
      ))}
    </div>
  );
}
