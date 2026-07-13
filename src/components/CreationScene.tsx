"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import s from "./CreationScene.module.css";

/**
 * Cinematic "creation of HAI" sequence built on public/creation-scene.webp:
 * a slow camera push toward the chamber while the robot's eyes ignite in
 * baby pink, holographic particles rise, and the chest logo blooms.
 * Timeline lives in CreationScene.module.css; particles/grain render here.
 * Feature coordinates below are px in the source render (584 × 800).
 */

type CreationSceneProps = {
  className?: string;
  wordmark?: string;
  tagline?: string;
};

/** Claw fingertips + top status lights, % of frame — subtle machine life. */
const SPARKS = [
  { left: "25.2%", top: "31%", duration: 6.5, delay: 5.2 },
  { left: "73%", top: "31%", duration: 7.3, delay: 6.1 },
  { left: "19.4%", top: "53.8%", duration: 8.1, delay: 6.7 },
  { left: "79.2%", top: "53.6%", duration: 9, delay: 7.4 },
];

const RED_LIGHTS = [
  { left: "13%", top: "3.4%", delay: 0 },
  { left: "75.5%", top: "3.2%", delay: -1.9 },
];

/** Holographic motes inside the chamber + soft foreground bokeh. */
function ParticleCanvas({ rampDelay = 1.5 }: { rampDelay?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const MOTE_COLORS = ["#F6C8D4", "#EFA9BC", "#FFD9E6", "#9FE4EA"];

    type Mote = {
      kind: "mote" | "ember" | "bokeh";
      x: number; // fraction of width
      y: number; // fraction of height
      vy: number; // fraction/s (negative = rising)
      vx: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      r: number; // css px
      color: string;
      twinkleFreq: number;
    };

    const spawnMote = (kind: "mote" | "ember"): Mote => ({
      kind,
      // weighted toward the chamber's center line
      x: 0.5 + (rand(-1, 1) + rand(-1, 1)) * 0.062,
      y: rand(0.4, 0.72),
      vy: kind === "ember" ? rand(-0.02, -0.012) : rand(-0.045, -0.02),
      vx: 0,
      swayAmp: rand(0.002, 0.008),
      swayFreq: rand(0.3, 0.9),
      phase: rand(0, Math.PI * 2),
      r: kind === "ember" ? rand(1.8, 2.8) : rand(0.7, 1.7),
      color: kind === "ember" ? "#FFD9E6" : pick(MOTE_COLORS),
      twinkleFreq: rand(0.5, 1.6),
    });

    const spawnBokeh = (): Mote => ({
      kind: "bokeh",
      x: rand(0.05, 0.95),
      y: rand(0.1, 0.95),
      vy: rand(-0.006, 0.006),
      vx: rand(-0.006, 0.006),
      swayAmp: 0,
      swayFreq: 0,
      phase: rand(0, Math.PI * 2),
      r: rand(6, 15),
      color: "#F2BECB",
      twinkleFreq: rand(0.1, 0.3),
    });

    const motes: Mote[] = [
      ...Array.from({ length: 40 }, () => spawnMote("mote")),
      ...Array.from({ length: 6 }, () => spawnMote("ember")),
      ...Array.from({ length: 8 }, spawnBokeh),
    ];

    const t0 = performance.now();
    let last = t0;
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - t0) / 1000;
      // everything fades in over 2.5s once the sequence reaches rampDelay
      const ramp = Math.min(1, Math.max(0, (t - rampDelay) / 2.5));

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (ramp === 0) return;

      for (const m of motes) {
        m.y += m.vy * dt;
        m.x += m.vx * dt;
        if (m.kind !== "bokeh" && m.y < 0.36) {
          Object.assign(m, spawnMote(m.kind as "mote" | "ember"), { y: rand(0.66, 0.72) });
        }
        if (m.kind === "bokeh" && (m.x < -0.05 || m.x > 1.05 || m.y < -0.05 || m.y > 1.05)) {
          Object.assign(m, spawnBokeh());
        }

        const sway = m.swayAmp * Math.sin(t * m.swayFreq * Math.PI * 2 + m.phase);
        const px = (m.x + sway) * W;
        const py = m.y * H;
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * m.twinkleFreq * Math.PI + m.phase));

        if (m.kind === "bokeh") {
          const alpha = ramp * 0.038 * twinkle;
          const R = m.r * dpr * 2.2;
          const g = ctx.createRadialGradient(px, py, 0, px, py, R);
          g.addColorStop(0, `rgba(242, 190, 203, ${alpha})`);
          g.addColorStop(1, "rgba(242, 190, 203, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, R, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // fade near the glass walls so motes stay "inside" the cylinder
        const wall = Math.max(0, 1 - Math.abs(m.x - 0.5) / 0.13);
        const alpha = ramp * twinkle * Math.min(1, wall * 1.6) * (m.kind === "ember" ? 0.85 : 0.65);
        if (alpha <= 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = m.r * 6 * dpr;
        ctx.beginPath();
        ctx.arc(px, py, m.r * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [rampDelay]);

  return <canvas ref={ref} className={s.particles} aria-hidden="true" />;
}

/** Animated film grain, kept tiny and stretched by CSS. */
function GrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 128;
    canvas.height = 176;
    const image = ctx.createImageData(128, 176);
    let raf = 0;
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (frame++ % 4 !== 0) return; // ~15fps is plenty for grain
      const d = image.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className={s.grain} aria-hidden="true" />;
}

export default function CreationScene({
  className,
  wordmark = "HAI_AI Systems",
  tagline = "Intelligence, awakened.",
}: CreationSceneProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [take, setTake] = useState(0);

  const blurId = `${uid}-blur`;
  const blurSoftId = `${uid}-blur-soft`;
  const bloomId = `${uid}-bloom`;

  return (
    <div className={`${s.stage} ${className ?? ""}`}>
      {/* key remount restarts every CSS animation + canvas clock */}
      <div className={s.frame} key={take}>
        <div className={reduce ? s.cameraStill : s.camera}>
          <div className={reduce ? undefined : s.drift}>
            <Image
              src="/creation-scene.webp"
              alt="HAI, the HAI_AI robot assistant, awakening inside a glass creation chamber surrounded by holographic panels"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 73vh"
              className={s.art}
            />

            {/* chamber energy + glow work */}
            {!reduce && (
              <>
                <div className={`${s.arc} ${s.arcA}`} />
                <div className={`${s.arc} ${s.arcB}`} />
                <div className={s.surge} />
              </>
            )}
            <div className={s.ringGlow} />
            <div className={s.baseGlow} />
            <div className={s.floorMirror} />
            {!reduce && <div className={s.floorSweep} />}

            {/* holo side panels */}
            {!reduce && (
              <>
                <div className={s.panelL}>
                  <div className={s.panelTint} />
                  <div className={s.panelScan} />
                </div>
                <div className={s.panelR}>
                  <div className={s.panelTint} />
                  <div className={s.panelScan} />
                </div>
              </>
            )}

            {/* machine life */}
            {!reduce &&
              RED_LIGHTS.map((l, i) => (
                <div key={i} className={s.redLight} style={{ left: l.left, top: l.top, animationDelay: `${l.delay}s` }} />
              ))}
            {!reduce &&
              SPARKS.map((sp, i) => (
                <div
                  key={i}
                  className={s.spark}
                  style={{ left: sp.left, top: sp.top, animationDuration: `${sp.duration}s`, animationDelay: `${sp.delay}s` }}
                />
              ))}

            {/* face ignition — coordinates in source px (584 × 800) */}
            <svg className={s.fx} viewBox="0 0 584 800" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id={blurId} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <filter id={blurSoftId} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <radialGradient id={bloomId}>
                  <stop offset="0%" stopColor="#FFDCE9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFDCE9" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* persistent patches hide the original cyan eyes (visor-toned) */}
              <ellipse cx="279" cy="414" rx="10" ry="12" fill="#463C42" filter={`url(#${blurId})`} />
              <ellipse cx="307.5" cy="414.5" rx="12" ry="9" fill="#463C42" filter={`url(#${blurId})`} />

              {/* visor cover — the face starts dark, lifts at ignition */}
              {!reduce && (
                <ellipse
                  className={s.visorCover}
                  cx="293"
                  cy="418"
                  rx="31"
                  ry="21"
                  fill="#463C42"
                  opacity="0.96"
                  filter={`url(#${blurSoftId})`}
                />
              )}

              {/* baby-pink eyes */}
              <g className={reduce ? s.staticEyes : s.eyes}>
                <g className={reduce ? undefined : s.eyeBloom}>
                  <circle cx="279" cy="413" r="20" fill={`url(#${bloomId})`} opacity="0.55" />
                  <circle cx="307" cy="414" r="18" fill={`url(#${bloomId})`} opacity="0.5" />
                </g>
                {/* open eye — ring */}
                <ellipse
                  cx="279"
                  cy="413"
                  rx="5.8"
                  ry="7"
                  fill="none"
                  stroke="#E99BB0"
                  strokeWidth="6"
                  opacity="0.85"
                  filter={`url(#${blurId})`}
                />
                <ellipse cx="279" cy="413" rx="5.8" ry="7" fill="none" stroke="#FFE3EE" strokeWidth="2.8" />
                {/* winking eye — closed-lid crescent */}
                <path
                  d="M 313 411.2 C 307.5 409.8 302.8 412.3 300.9 417.2"
                  fill="none"
                  stroke="#E99BB0"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  opacity="0.85"
                  filter={`url(#${blurId})`}
                />
                <path
                  d="M 313 411.2 C 307.5 409.8 302.8 412.3 300.9 417.2"
                  fill="none"
                  stroke="#FFE3EE"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* chest logo ignition */}
            {!reduce && <div className={s.faceFlash} />}
            {!reduce && <div className={s.logoCover} />}
            <div className={s.logoBloom} style={reduce ? { opacity: 0.55, animation: "none" } : undefined} />
            {!reduce && <div className={s.logoShimmer} />}

            {!reduce && <ParticleCanvas />}
          </div>
        </div>

        {/* finishing layers (outside the camera so they don't zoom) */}
        {!reduce && <GrainCanvas />}
        <div className={s.grade} />
        <div className={s.vignette} />

        <div className={`${s.title} ${reduce ? s.staticTitle : ""}`}>
          <span className={s.wordmark}>{wordmark}</span>
          <span className={s.tagline}>{tagline}</span>
        </div>

        {!reduce && <div className={s.veil} />}

        <button
          type="button"
          className={`${s.replay} ${reduce ? s.staticReplayHidden : ""}`}
          onClick={() => setTake((t) => t + 1)}
          aria-label="Replay the creation sequence"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Replay
        </button>
      </div>
    </div>
  );
}
