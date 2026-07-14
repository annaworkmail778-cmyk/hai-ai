"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const FRAME_COUNT = 110;
const EDGE_CROP = 0.03; // hide screen-recording edges
/** Large screens get the 2× enhanced set (public/cinema-hd), phones the lighter one. */
const frameDir = () =>
  Math.min(window.devicePixelRatio || 1, 2) * window.innerWidth > 900 ? "/cinema-hd" : "/cinema";

/** Story acts as progress ranges (frame boundaries: lab 0–52, flight 53–94, salon 95–109). */
const ACTS = [
  { from: 0.0, to: 0.47, still: 30 },
  { from: 0.47, to: 0.86, still: 72 },
  { from: 0.86, to: 1.0, still: 103 },
] as const;

function actOpacity(p: number, from: number, to: number): number {
  const FADE = 0.05;
  if (p < from - FADE || p > to + FADE) return 0;
  if (p < from + FADE) return Math.max(0, (p - (from - FADE)) / (2 * FADE));
  if (p > to - FADE) return Math.max(0, ((to + FADE) - p) / (2 * FADE));
  return 1;
}

export default function StoryCinema() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(Array(FRAME_COUNT).fill(null));
  const startedRef = useRef(false);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const reduceRef = useRef(false);

  /* draw the closest loaded frame, cover-fit with a small edge crop */
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const want = frameRef.current;
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < FRAME_COUNT; d++) {
      const lo = want - d, hi = want + d;
      if (lo >= 0 && framesRef.current[lo]?.complete) { img = framesRef.current[lo]; break; }
      if (hi < FRAME_COUNT && framesRef.current[hi]?.complete) { img = framesRef.current[hi]; break; }
    }
    if (!img) return;
    const W = canvas.width, H = canvas.height;
    const iw = img.naturalWidth * (1 - EDGE_CROP * 2);
    const ih = img.naturalHeight * (1 - EDGE_CROP * 2);
    const s = Math.max(W / iw, H / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(
      img,
      img.naturalWidth * EDGE_CROP, img.naturalHeight * EDGE_CROP, iw, ih,
      (W - dw) / 2, (H - dh) / 2, dw, dh,
    );
  };

  /* progressive loading in waves: every 6th, every 2nd, then all */
  const startLoading = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const dir = frameDir();
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        if (framesRef.current[i]) return resolve();
        const img = new Image();
        img.onload = () => { if (i === frameRef.current || !ready) draw(); resolve(); };
        img.onerror = () => resolve();
        img.src = `${dir}/frame_${String(i).padStart(3, "0")}.jpg`;
        framesRef.current[i] = img;
      });
    (async () => {
      await Promise.all(Array.from({ length: FRAME_COUNT }, (_, i) => i).filter((i) => i % 6 === 0).map(load));
      setReady(true);
      draw();
      await Promise.all(Array.from({ length: FRAME_COUNT }, (_, i) => i).filter((i) => i % 2 === 0).map(load));
      await Promise.all(Array.from({ length: FRAME_COUNT }, (_, i) => i).map(load));
      draw();
    })();
  };

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw();
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        let frame = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
        if (reduceRef.current) {
          const act = ACTS.find((a) => p >= a.from && p <= a.to) ?? ACTS[0];
          frame = act.still; // no scrubbing for reduced motion — hold a still per act
        }
        if (frame !== frameRef.current) {
          frameRef.current = frame;
          draw();
        }
        setProgress(p);
      });
    };

    // begin fetching frames shortly before the section scrolls into view
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && startLoading()),
      { rootMargin: "150% 0px" },
    );
    io.observe(section);

    sizeCanvas();
    onScroll();
    window.addEventListener("resize", sizeCanvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", sizeCanvas);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acts = [t.cinema.act1, t.cinema.act2, t.cinema.act3];
  const activeAct = ACTS.findIndex((a) => progress >= a.from && progress <= a.to);

  return (
    <section ref={sectionRef} id="story" aria-label={t.cinema.eyebrow} className="relative h-[380vh] bg-[#0b070d]">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

        {/* loading shimmer until first frames arrive */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 grid place-items-center bg-[#0b070d] transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <span className="h-10 w-10 animate-pulse rounded-full bg-blush-300/40 blur-md" />
        </div>

        {/* cinematic edges + vignette */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0b070d] to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0b070d] to-transparent" />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(6,3,8,0.5) 96%)" }} />

        {/* eyebrow */}
        <p className="absolute left-1/2 top-8 -translate-x-1/2 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-blush-200/70">
          {t.cinema.eyebrow}
        </p>

        {/* act captions */}
        {acts.map((act, i) => (
          <div
            key={i}
            className="absolute inset-x-0 bottom-[12%] px-6 text-center"
            style={{ opacity: actOpacity(progress, ACTS[i].from, ACTS[i].to), transition: "opacity 120ms linear" }}
          >
            <p className="mx-auto font-display text-[10px] font-bold uppercase tracking-[0.28em] text-rosegold-300">
              {String(i + 1).padStart(2, "0")} — {act.kicker}
            </p>
            <h3 className="mx-auto mt-3 max-w-xl font-display text-3xl font-bold leading-tight text-cream-50 drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)] sm:text-4xl">
              {act.title}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-blush-100/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)] sm:text-base">
              {act.sub}
            </p>
          </div>
        ))}

        {/* act progress dots */}
        <div className="absolute bottom-[6%] left-1/2 flex -translate-x-1/2 items-center gap-2.5" aria-hidden="true">
          {ACTS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeAct ? "w-7 bg-blush-300" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>

        {/* scroll hint, fades out */}
        <p
          className="absolute bottom-[2.5%] left-1/2 -translate-x-1/2 font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-white/40"
          style={{ opacity: Math.max(0, 1 - progress * 12) }}
        >
          {t.cinema.scrollHint}
        </p>
      </div>
    </section>
  );
}
