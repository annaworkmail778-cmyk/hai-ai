import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGO } from "../logo";
import type { Status } from "./config";

/* Reusable UI pieces for the Lead-to-Booking demo. Brand: black / paper / signal orange. */

export const C = {
  bg: "#0a0a0b",
  bg2: "#141417",
  panel: "#ffffff",
  panel2: "#f6f5f1",
  line: "#e7e5df",
  ink: "#0b0b0c",
  mute: "#76756f",
  paper: "#f3f2ee",
  signal: "#ff5b14",
  green: "#1e8e3e",
  greenBg: "#e5f3e8",
  amber: "#b26a00",
  amberBg: "#fff1db",
  grey: "#5f5e59",
  greyBg: "#efede7",
  red: "#e5484d",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export function useIn(delay = 0, config: { damping?: number; stiffness?: number } = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.8, ...config } });
}

/** Fades/slides children in at `delay`. */
export function Rise({ delay = 0, y = 24, children, style }: { delay?: number; y?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useIn(delay);
  return <div style={{ opacity: Math.min(1, p * 1.3), transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
}

/* ── Brand ───────────────────────────────────────────────────────── */

export function Mark({ size = 100, color = "#fff", draw = 1 }: { size?: number; color?: string; draw?: number }) {
  return (
    <svg viewBox={LOGO.markViewBox} width={size * 1.13} height={size} style={{ overflow: "visible", display: "block" }}>
      <path fill={color} fillRule="evenodd" d={LOGO.mark} />
      <path fill={C.signal} fillRule="evenodd" d={LOGO.swoosh} style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }} />
    </svg>
  );
}

export function Wordmark({ height = 60, color = "#fff" }: { height?: number; color?: string }) {
  return (
    <svg viewBox={LOGO.wordViewBox} height={height} width={height * (1280 / 375)} style={{ display: "block" }}>
      <path fill={color} fillRule="evenodd" d={LOGO.word} />
    </svg>
  );
}

/* ── Icons ───────────────────────────────────────────────────────── */

export function IgIcon({ size = 40 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size / 3.4, background: "linear-gradient(45deg,#f9b234,#ee2a7b 55%,#6228d7)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width={size * 0.62} height={size * 0.62} fill="none" stroke="#fff" strokeWidth="1.7">
        <rect x="2.5" y="2.5" width="11" height="11" rx="3.2" />
        <circle cx="8" cy="8" r="2.6" />
        <circle cx="11.4" cy="4.6" r="0.6" fill="#fff" stroke="none" />
      </svg>
    </span>
  );
}

export function TgIcon({ size = 40 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: "#2aabee", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width={size * 0.58} height={size * 0.58} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M2.5 7.6 13.5 3l-2 10-3.6-2.8-1.8 1.8v-3l5-4.6-6.2 3.9z" />
      </svg>
    </span>
  );
}

export function CheckDot({ size = 34, bg = C.signal, color = "#000" }: { size?: number; bg?: string; color?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size, background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export function Pointer({ x, y, press }: { x: number; y: number; press: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 80, transform: `scale(${1 - press * 0.18})`, transformOrigin: "8px 6px", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}>
      <svg width="54" height="54" viewBox="0 0 24 24">
        <path d="M5 3l14 8.2-6.1 1.3 3.6 6.6-2.6 1.4-3.6-6.6L5.8 18z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      {press > 0.05 && <span style={{ position: "absolute", left: -14, top: -16, width: 44, height: 44, borderRadius: 44, border: `3px solid ${C.signal}`, opacity: 1 - press * 0.3, transform: `scale(${0.6 + press})` }} />}
    </div>
  );
}

/* ── Phone and chat ──────────────────────────────────────────────── */

export function SmartphoneFrame({ width, height, children, style }: { width: number; height: number; children: ReactNode; style?: CSSProperties }) {
  const s = width / 430;
  return (
    <div style={{ width, height, borderRadius: 64 * s, padding: 12 * s, background: "linear-gradient(145deg,#2a2a2e,#0c0c0e)", boxShadow: "0 50px 120px -40px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08) inset", position: "relative", flexShrink: 0, ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 52 * s, overflow: "hidden", background: C.panel, position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 48 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${30 * s}px`, fontSize: 17 * s, fontWeight: 700, color: C.ink, flexShrink: 0 }}>
          <span>9:41</span>
          <span style={{ width: 110 * s, height: 30 * s, borderRadius: 30, background: "#0b0b0c" }} />
          <span style={{ display: "flex", gap: 5 * s, alignItems: "center" }}>
            {[6, 9, 12].map((h) => (
              <span key={h} style={{ width: 4 * s, height: h * s, borderRadius: 2, background: C.ink }} />
            ))}
            <span style={{ marginLeft: 4 * s, width: 24 * s, height: 12 * s, borderRadius: 3, border: `1.5px solid ${C.ink}` }} />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ChatHeader({ name, channel, s = 1, live }: { name: string; channel: string; s?: number; live?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * s, padding: `${10 * s}px ${22 * s}px ${16 * s}px`, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
      <span style={{ width: 52 * s, height: 52 * s, borderRadius: 52, background: "linear-gradient(135deg,#f6d2c3,#e9b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 * s, fontWeight: 700, color: C.ink, boxShadow: "0 0 0 2px #fff, 0 0 0 4px #ee2a7b" }}>L</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 21 * s, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{name}</p>
        <p style={{ margin: 0, fontSize: 16 * s, color: C.mute, display: "flex", alignItems: "center", gap: 6 * s }}>
          <IgIcon size={18 * s} /> {channel}
        </p>
      </div>
      {live && <span style={{ marginLeft: "auto", fontSize: 15 * s, color: C.green, fontWeight: 700 }}>● {live}</span>}
    </div>
  );
}

export function MessageBubble({ from, children, label, s = 1, appear = 1 }: { from: "customer" | "riseup"; children: ReactNode; label?: string; s?: number; appear?: number }) {
  const us = from === "riseup";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: us ? "flex-end" : "flex-start", gap: 6 * s, opacity: Math.min(1, appear * 1.4), transform: `translateY(${(1 - appear) * 26 * s}px) scale(${0.96 + appear * 0.04})`, transformOrigin: us ? "100% 100%" : "0 100%" }}>
      {label && (
        <span style={{ fontSize: 14 * s, fontWeight: 700, color: C.mute, display: "flex", alignItems: "center", gap: 6 * s }}>
          <Mark size={13 * s} color={C.ink} /> {label}
        </span>
      )}
      <div
        style={{
          maxWidth: "82%",
          padding: `${14 * s}px ${18 * s}px`,
          borderRadius: 24 * s,
          [us ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 6 * s,
          background: us ? "linear-gradient(135deg,#232326,#0d0d0f)" : C.greyBg,
          color: us ? "#fff" : C.ink,
          fontSize: 19 * s,
          lineHeight: 1.36,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function TypingIndicator({ s = 1 }: { s?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ alignSelf: "flex-end", display: "flex", gap: 6 * s, padding: `${14 * s}px ${18 * s}px`, borderRadius: 22 * s, background: "#18181b" }}>
      {[0, 1, 2].map((k) => (
        <span key={k} style={{ width: 9 * s, height: 9 * s, borderRadius: 9, background: "#fff", opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame + k * 5) / 5)) }} />
      ))}
    </div>
  );
}

export type ChatItem = { from: "customer" | "riseup" | "system"; at: number; node: ReactNode; label?: boolean };

/** A conversation that grows over time; RiseUp messages are preceded by a typing indicator. */
export function Conversation({ items, s = 1, assistant, typingFrames = 24 }: { items: ChatItem[]; s?: number; assistant: string; typingFrames?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typing = items.find((m) => m.from === "riseup" && frame >= m.at - typingFrames && frame < m.at);
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 * s, padding: `${18 * s}px ${20 * s}px ${22 * s}px`, overflow: "hidden", background: C.panel }}>
      {items
        .filter((m) => frame >= m.at)
        .map((m, i) => {
          const appear = spring({ frame: frame - m.at, fps, config: { damping: 16, stiffness: 150, mass: 0.7 } });
          if (m.from === "system")
            return (
              <div key={i} style={{ alignSelf: "center", opacity: appear, padding: `${6 * s}px ${14 * s}px`, borderRadius: 20, background: C.greyBg, fontSize: 14 * s, fontWeight: 700, color: C.mute }}>
                {m.node}
              </div>
            );
          return (
            <MessageBubble key={i} from={m.from} s={s} appear={appear} label={m.label ? assistant : undefined}>
              {m.node}
            </MessageBubble>
          );
        })}
      {typing && <TypingIndicator s={s} />}
    </div>
  );
}

/* ── Booking ─────────────────────────────────────────────────────── */

export function SlotPicker({ day, slots, picked, pickedAt, s = 1 }: { day: string; slots: string[]; picked: number; pickedAt: number; s?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginTop: 10 * s }}>
      <p style={{ margin: `0 0 ${8 * s}px`, fontSize: 15 * s, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{day}</p>
      <div style={{ display: "flex", gap: 8 * s, flexWrap: "wrap" }}>
        {slots.map((slot, i) => {
          const on = i === picked && frame >= pickedAt;
          return (
            <span key={slot} style={{ padding: `${10 * s}px ${14 * s}px`, borderRadius: 14 * s, fontSize: 17 * s, fontWeight: 700, background: on ? C.signal : "rgba(255,255,255,.1)", color: on ? "#000" : "#fff", border: `1px solid ${on ? C.signal : "rgba(255,255,255,.22)"}`, transform: on ? "scale(1.06)" : undefined }}>
              {slot}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<Status, { fg: string; bg: string }> = {
  requested: { fg: C.amber, bg: C.amberBg },
  awaiting: { fg: C.grey, bg: C.greyBg },
  confirmed: { fg: C.green, bg: C.greenBg },
};

export function StatusPill({ status, label, s = 1 }: { status: Status; label: string; s?: number }) {
  const st = STATUS_STYLE[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 * s, padding: `${6 * s}px ${12 * s}px`, borderRadius: 30, fontSize: 15 * s, fontWeight: 700, background: st.bg, color: st.fg, whiteSpace: "nowrap" }}>
      <span style={{ width: 8 * s, height: 8 * s, borderRadius: 8, background: st.fg }} />
      {label}
    </span>
  );
}

/** Card the customer sees after choosing a time: a request, or a confirmation. */
export function AppointmentCard({ kind, title, text, note, s = 1 }: { kind: "request" | "confirmed"; title: string; text: string; note?: string; s?: number }) {
  const ok = kind === "confirmed";
  return (
    <div style={{ borderRadius: 22 * s, padding: `${16 * s}px ${18 * s}px`, background: ok ? C.greenBg : C.amberBg, border: `1px solid ${ok ? "#bfe3c8" : "#f3d6a6"}`, display: "flex", gap: 14 * s, alignItems: "flex-start", width: "100%" }}>
      {ok ? (
        <CheckDot size={34 * s} bg={C.green} color="#fff" />
      ) : (
        <span style={{ width: 34 * s, height: 34 * s, borderRadius: 34, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width={18 * s} height={18 * s} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2.5 1.5" />
          </svg>
        </span>
      )}
      <div>
        <p style={{ margin: 0, fontSize: 18 * s, fontWeight: 800, color: ok ? C.green : C.amber }}>{title}</p>
        <p style={{ margin: `${4 * s}px 0 0`, fontSize: 16 * s, color: C.ink }}>{text}</p>
        {note && <p style={{ margin: `${4 * s}px 0 0`, fontSize: 15 * s, color: C.mute }}>{note}</p>}
      </div>
    </div>
  );
}

/* ── Notification ────────────────────────────────────────────────── */

export function Notification({ app, title, text, s = 1, dark = true }: { app: string; title: string; text: string; s?: number; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 * s, padding: `${18 * s}px ${22 * s}px`, borderRadius: 28 * s, background: dark ? "rgba(26,26,30,.96)" : "rgba(255,255,255,.97)", color: dark ? "#fff" : C.ink, boxShadow: "0 30px 70px -20px rgba(0,0,0,.6)", border: `1px solid ${dark ? "rgba(255,255,255,.1)" : C.line}`, backdropFilter: "blur(14px)" }}>
      <TgIcon size={52 * s} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14 * s, color: dark ? "rgba(255,255,255,.55)" : C.mute, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{app} · RiseUp</p>
        <p style={{ margin: `${3 * s}px 0 0`, fontSize: 20 * s, fontWeight: 800 }}>{title}</p>
        <p style={{ margin: `${2 * s}px 0 0`, fontSize: 17 * s, color: dark ? "rgba(255,255,255,.75)" : C.mute }}>{text}</p>
      </div>
    </div>
  );
}

/* ── Backgrounds ─────────────────────────────────────────────────── */

export function StageBg({ children, glowX = "70%", glowY = "40%" }: { children?: ReactNode; glowX?: string; glowY?: string }) {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 3;
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${glowX} ${glowY}, #1d1a19 0%, ${C.bg2} 30%, ${C.bg} 70%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: `calc(${glowX} - 25%)`, top: `calc(${glowY} - 25%)`, width: "50%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,91,20,.16), transparent 65%)", transform: `translate(${drift}%, ${-drift}%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
      {children}
    </div>
  );
}

/** Headline block used on the side (16:9) or top (9:16) of a scene. */
export function Headline({ eyebrow, title, size, delay = 4, maxWidth }: { eyebrow?: string; title: string; size: number; delay?: number; maxWidth?: number }) {
  const frame = useCurrentFrame();
  const words = title.split(" ");
  return (
    <div style={{ maxWidth }}>
      {eyebrow && (
        <Rise delay={delay}>
          <p style={{ margin: `0 0 ${size * 0.35}px`, display: "flex", alignItems: "center", gap: 12, fontSize: size * 0.32, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
            <span style={{ width: 10, height: 10, background: C.signal, display: "inline-block" }} />
            {eyebrow}
          </p>
        </Rise>
      )}
      <h2 style={{ margin: 0, fontSize: size, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
        {words.map((w, i) => {
          const k = interpolate(frame, [delay + 4 + i * 2.5, delay + 18 + i * 2.5], [0, 1], { ...clamp, easing: ease });
          return (
            <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: k, transform: `translateY(${(1 - k) * 0.5}em)` }}>
              {w}
            </span>
          );
        })}
      </h2>
    </div>
  );
}
