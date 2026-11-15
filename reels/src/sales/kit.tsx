import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../fonts";
import { C, clamp, ease, Headline, Mark, Rise, StageBg, useSceneFrame, Wordmark } from "../lb/ui";

/*
 * Shared shell for the short silent sales demos (Developer Sales OS, Solar Alerts).
 * Each scene = headline (left on 16:9, top on 9:16) + a visual. Every video carries
 * a permanent "Demo · illustrative data" badge: all names and numbers are invented.
 */

export type Lang = "en" | "hy";
export const SCENE = 150; // 5 s at 30 fps
export const FADE = 12;

export function useWide() {
  const { width, height } = useVideoConfig();
  return width > height;
}

export function DemoBadge({ text }: { text: string }) {
  const wide = useWide();
  return (
    <div style={{ position: "absolute", top: wide ? 40 : 70, right: wide ? 48 : 40, zIndex: 90, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 40, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.8)", fontSize: wide ? 20 : 26, fontWeight: 700, letterSpacing: "0.02em" }}>
      <span style={{ width: 10, height: 10, borderRadius: 10, background: C.signal }} />
      {text}
    </div>
  );
}

export function BrandCorner() {
  const wide = useWide();
  return (
    <div style={{ position: "absolute", top: wide ? 42 : 72, left: wide ? 56 : 48, zIndex: 90, display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
      <Mark size={wide ? 34 : 42} />
      <Wordmark height={wide ? 26 : 32} />
    </div>
  );
}

/** Fade in/out wrapper for one scene. */
function Fade({ dur, children }: { dur: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, FADE, dur - FADE, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
}

/** Headline + visual layout that adapts to 16:9 and 9:16. */
export function Split({ eyebrow, title, children, note }: { eyebrow?: string; title: string; children: ReactNode; note?: string }) {
  const wide = useWide();
  if (wide)
    return (
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "120px 110px 110px", gap: 70 }}>
        <div style={{ width: 720, flexShrink: 0 }}>
          <Headline eyebrow={eyebrow} title={title} size={66} />
          {note && (
            <Rise delay={30}>
              <p style={{ margin: "28px 0 0", fontSize: 26, lineHeight: 1.4, color: "rgba(255,255,255,.6)" }}>{note}</p>
            </Rise>
          )}
        </div>
        <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{children}</div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ padding: "200px 64px 160px", flexDirection: "column", gap: 50 }}>
      <Headline eyebrow={eyebrow} title={title} size={70} />
      {note && (
        <Rise delay={30}>
          <p style={{ margin: "-20px 0 0", fontSize: 30, lineHeight: 1.4, color: "rgba(255,255,255,.6)" }}>{note}</p>
        </Rise>
      )}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{children}</div>
    </AbsoluteFill>
  );
}

/** White card used for lead cards, tables and reports. */
export function Card({ children, style, width }: { children: ReactNode; style?: CSSProperties; width?: number }) {
  return (
    <div style={{ width, background: C.panel, color: C.ink, borderRadius: 28, padding: 34, boxShadow: "0 50px 120px -40px rgba(0,0,0,.75)", ...style }}>
      {children}
    </div>
  );
}

/** Animated count-up number. */
export function CountUp({ to, delay = 0, dur = 40, suffix = "" }: { to: number; delay?: number; dur?: number; suffix?: string }) {
  const frame = useSceneFrame();
  const v = interpolate(frame, [delay, delay + dur], [0, to], { ...clamp, easing: ease });
  return (
    <>
      {Math.round(v)}
      {suffix}
    </>
  );
}

export function Cta({ product, line, site }: { product: string; line: string; site: string }) {
  const wide = useWide();
  const frame = useSceneFrame();
  const draw = interpolate(frame, [6, 40], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 36, textAlign: "center", padding: 80 }}>
      <Mark size={wide ? 120 : 150} draw={draw} />
      <Rise delay={20}>
        <p style={{ margin: 0, fontSize: wide ? 76 : 84, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{product}</p>
      </Rise>
      <Rise delay={30}>
        <p style={{ margin: 0, fontSize: wide ? 34 : 40, color: "rgba(255,255,255,.75)", maxWidth: 1100, lineHeight: 1.35 }}>{line}</p>
      </Rise>
      <Rise delay={42}>
        <span style={{ display: "inline-block", padding: "18px 34px", borderRadius: 60, background: C.signal, color: "#000", fontSize: wide ? 32 : 38, fontWeight: 900 }}>{site}</span>
      </Rise>
    </AbsoluteFill>
  );
}

/** Plays scenes back to back with fades, background, badge, brand and quiet music. */
export function DemoTimeline({ scenes, badge }: { scenes: ReactNode[]; badge: string }) {
  const total = scenes.length * SCENE;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.bg }}>
      <StageBg />
      {scenes.map((node, i) => (
        <Sequence key={i} from={i * SCENE} durationInFrames={SCENE}>
          <Fade dur={SCENE}>{node}</Fade>
        </Sequence>
      ))}
      <BrandCorner />
      <DemoBadge text={badge} />
      <Audio src={staticFile("music/lb-demo.mp3")} volume={(fr) => interpolate(fr, [0, 30, total - 45, total], [0, 0.3, 0.3, 0], clamp)} />
    </AbsoluteFill>
  );
}

export const sceneCount = (n: number) => n * SCENE;
