"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { scrollToTarget } from "@/components/motion/scroll-store";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ButtonLink, ArrowLink } from "@/components/ui/Button";
import { SystemFallback } from "@/components/three/SystemFallback";
import { SCENE, type SceneTier } from "@/components/three/choreography";
import type { PointerState, SceneProgress } from "@/components/three/SystemScene";
import type { Dictionary } from "@/i18n/types";
import { media } from "@/config/motion";
import { pad2 } from "@/i18n/format";

const SystemScene = dynamic(() => import("@/components/three/SystemScene"), { ssr: false });

type Props = {
  tagline: string;
  intro: Dictionary["intro"];
  hero: Dictionary["hero"];
  workHref: string;
  contactHref: string;
};

function detectTier(): SceneTier {
  const mobile = window.matchMedia(`${media.mobile}, (pointer: coarse)`).matches;
  if (mobile) return "mobile";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
  return weak ? "low" : "high";
}

function supportsWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * 01 — 3D scroll intro → 02 — hero resolution.
 * A tall scroll track with a sticky stage. One ScrollTrigger drives both the
 * WebGL choreography (via a shared progress ref) and the DOM overlay timeline.
 */
export function ScrollIntro({ tagline, intro, hero, workHref, contactHref }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef<SceneProgress>({ value: 0 });
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const labelRefs = useRef<Array<HTMLElement | null>>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [tier, setTier] = useState<SceneTier>("high");
  const [animate, setAnimate] = useState(true);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  // Capability detection runs once on the client.
  useEffect(() => {
    const reduce = window.matchMedia(media.reducedMotion).matches;
    const id = requestAnimationFrame(() => {
      setAnimate(!reduce);
      setTier(detectTier());
      setMode(supportsWebGL2() ? "webgl" : "fallback");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Stop rendering when the intro is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Subtle pointer parallax (desktop, motion OK).
  useEffect(() => {
    const query = window.matchMedia(`${media.finePointer} and ${media.motionOk}`);
    if (!query.matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(media.reducedMotion, () => {
        progress.current.value = 1;
      });

      mm.add(media.motionOk, () => {
        const statementWords = q("[data-statement] [data-word]");
        const heroWords = q("[data-hero-title] [data-word]");
        const heroRest = q("[data-hero-rest]");
        const introUi = q("[data-intro-ui]");
        const labelLayer = q("[data-label-layer]");
        const counter = counterRef.current;
        const bar = barRef.current;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              progress.current.value = p;
              const scene = p < SCENE.introEnd ? 1 : p < SCENE.connect[0] ? 2 : p < SCENE.resolve[0] ? 3 : 4;
              if (counter) counter.textContent = pad2(scene);
              if (bar) bar.style.transform = `scaleY(${p.toFixed(4)})`;
            },
          },
        });

        // Scene 01 → 02: the opening UI steps back.
        tl.to(introUi, { autoAlpha: 0, y: -32, duration: 0.07, ease: "power1.in" }, 0.035);

        // Layer labels follow the smoothed 3D progress; this raw-scroll fade makes
        // sure they are gone before the statement arrives, even on fast scrolls.
        tl.to(labelLayer, { autoAlpha: 0, duration: 0.04 }, 0.44);

        // Scene 03: statement rises in front of the object, then leaves.
        // (y: 0 clears the CSS pre-hydration offset so only yPercent moves the words.)
        tl.fromTo(
          statementWords,
          { yPercent: 135, y: 0, autoAlpha: 1 },
          { yPercent: 0, duration: 0.07, stagger: 0.008, ease: "power3.out" },
          0.5,
        ).to(
          statementWords,
          { yPercent: -150, autoAlpha: 0, duration: 0.05, stagger: 0.006, ease: "power2.in" },
          0.68,
        );

        // Scene 04: hero resolves.
        tl.fromTo(
          heroWords,
          { yPercent: 135, y: 0 },
          { yPercent: 0, duration: 0.08, stagger: 0.01, ease: "power3.out" },
          0.79,
        ).fromTo(
          heroRest,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.07, stagger: 0.015, ease: "power2.out" },
          0.86,
        );

        tl.set({}, {}, 1);
        return () => {
          progress.current.value = 0;
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Keep trigger positions right once the heavy scene has mounted.
  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  const introEnd = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return 0;
    return section.offsetTop + section.offsetHeight - window.innerHeight + 1;
  }, []);

  // Fast-forward to the resolved hero and hand focus to its headline.
  const skipIntro = () =>
    scrollToTarget(introEnd(), {
      duration: 1.6,
      onComplete: () => titleRef.current?.focus({ preventScroll: true }),
    });

  return (
    <section
      ref={sectionRef}
      id="intro"
      data-theme="dark"
      data-nav-theme="dark"
      data-nav-solid="false"
      className="intro relative h-svh bg-black motion-safe:h-[280svh] lg:motion-safe:h-[460vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Statement — always in front of the object so every word stays readable;
            on phones it sits below the raised object, on desktop across it. */}
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-end pb-[14vh] motion-reduce:hidden lg:items-center lg:pb-0">
          <div className="shell">
            <p
              data-statement
              className="max-w-[16ch] text-display-m font-medium text-paper/90 [text-shadow:0_2px_28px_rgb(0_0_0/0.9)] lg:max-w-[17ch] lg:text-display-l"
            >
              <MaskedWords text={intro.statement} />
            </p>
          </div>
        </div>

        {/* WebGL stage */}
        <div
          role="img"
          aria-label={intro.sceneLabel}
          className="absolute inset-0 z-[1] transition-opacity duration-[1800ms] ease-out"
          style={{ opacity: ready || mode === "fallback" ? 1 : 0 }}
        >
          {mode === "webgl" && (
            <SystemScene
              progress={progress}
              pointer={pointer}
              labels={labelRefs}
              tier={tier}
              animate={animate}
              active={active}
              onReady={() => setReady(true)}
            />
          )}
          {mode === "fallback" && (
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[12vw]">
              <SystemFallback className="w-[min(78vw,560px)]" />
            </div>
          )}
        </div>

        {/* Layer labels, projected onto the levels each frame. */}
        <div data-label-layer aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] motion-reduce:hidden">
          {intro.layers.map((name, i) => (
            <div
              key={name}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 opacity-0 will-change-transform"
            >
              <div className="flex -translate-x-full -translate-y-1/2 items-center gap-3 pr-3">
                <div className="text-right">
                  <p className="label text-paper">
                    <span className="mr-2 hidden text-mute md:inline">{pad2(i + 1)}</span>
                    {name}
                  </p>
                  <p className="mt-1 hidden text-small text-mute md:block">{intro.layerNotes[i]}</p>
                </div>
                <span className="block h-px w-6 bg-paper/50 md:w-16" />
                <span className="block size-1.5 bg-signal" />
              </div>
            </div>
          ))}
        </div>

        {/* Scene 01 UI */}
        <div
          data-intro-ui
          className="intro-ui shell absolute inset-x-0 bottom-0 z-[4] flex flex-col gap-8 pb-[max(1.75rem,5vh)] motion-reduce:hidden md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-[17ch] text-heading font-medium text-paper">{tagline}</p>
          <div className="flex shrink-0 flex-row-reverse items-center justify-between gap-5 md:flex-col md:items-end">
            <button
              type="button"
              onClick={skipIntro}
              className="label text-mute transition-colors hover:text-paper"
            >
              {intro.skip}
            </button>
            <div className="flex items-center gap-3 text-paper/80">
              <span className="label hidden sm:inline">{intro.scroll}</span>
              <span aria-hidden="true" className="relative block h-12 w-px overflow-hidden bg-paper/15">
                <span className="absolute inset-0 block animate-cue bg-paper" />
              </span>
            </div>
          </div>
        </div>

        {/* Scene counter (desktop) */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-(--page-x) hidden -translate-y-1/2 flex-col items-center gap-4 lg:motion-safe:flex"
        >
          <span className="label text-paper">
            <span ref={counterRef}>01</span>
          </span>
          <span className="relative block h-28 w-px bg-paper/15">
            <span ref={barRef} className="absolute inset-0 block origin-top scale-y-0 bg-paper" />
          </span>
          <span className="label text-mute">04</span>
        </div>

        {/* Scene 04 — hero */}
        <div className="intro-hero shell absolute inset-x-0 bottom-0 z-[4] pb-[max(2rem,7vh)]">
          <div className="lg:max-w-[64%]">
            <p data-hero-rest className="label mb-8 hidden items-center gap-3 text-mute sm:flex">
              <span aria-hidden="true" className="inline-block size-1.5 bg-signal" />
              {hero.eyebrow}
            </p>
            <h1 ref={titleRef} tabIndex={-1} data-hero-title className="text-display-l font-medium text-paper outline-none">
              <MaskedWords text={hero.title} />
            </h1>
            <div className="mt-6 flex flex-col gap-7 md:mt-10 xl:flex-row xl:items-end xl:gap-16">
              <p data-hero-rest className="max-w-[38ch] text-lead text-mute">
                {hero.lead}
              </p>
              <div data-hero-rest className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <ButtonLink href={workHref} variant="solid">
                  {hero.primary}
                </ButtonLink>
                <ArrowLink href={contactHref} className="text-paper">
                  {hero.secondary}
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <noscript>
        <style>{`.intro-hero [data-word]{transform:none!important}.intro-hero [data-hero-rest]{opacity:1!important}.intro-ui{display:none}`}</style>
      </noscript>
    </section>
  );
}
