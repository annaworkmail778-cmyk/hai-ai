"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { media } from "@/config/motion";

/** Split "We don't sell *tools*." into words, marking emphasised ones. */
function parseEmphasis(text: string) {
  const out: Array<{ word: string; em: boolean }> = [];
  let em = false;
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    let word = raw;
    const opens = word.startsWith("*");
    if (opens) {
      em = true;
      word = word.slice(1);
    }
    const closeIndex = word.indexOf("*");
    const closes = closeIndex >= 0;
    if (closes) word = word.slice(0, closeIndex) + word.slice(closeIndex + 1);
    out.push({ word, em });
    if (closes) em = false;
  }
  return out;
}

/**
 * 03 — Positioning statement. A pinned typographic moment:
 * a struck-out claim on black, a paper wipe, then the real position
 * travelling horizontally across the viewport.
 */
export function ScrollStatement({
  eyebrow,
  line1,
  line2,
  note,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  note: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = parseEmphasis(line1);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add({ desktop: media.desktop, motion: media.motionOk }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;
        const l2 = q("[data-l2]")[0] as HTMLElement | undefined;

        // The opening claim rises as the section arrives.
        gsap.fromTo(
          q("[data-l1] [data-word]"),
          { yPercent: 120, y: 0 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: section, start: "top 65%", once: true },
          },
        );

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const theme = self.progress > 0.42 ? "light" : "dark";
              if (section.dataset.navTheme !== theme) section.dataset.navTheme = theme;
            },
          },
        });

        tl.fromTo(q("[data-strike]"), { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: "power2.inOut" }, 0.06)
          .to(q("[data-l1]"), { xPercent: desktop ? -5 : 0, opacity: 0.4, duration: 0.34 }, 0.04)
          .fromTo(
            q("[data-wipe]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.16, ease: "power2.inOut" },
            0.32,
          )
          .fromTo(
            q("[data-l2] [data-word]"),
            { yPercent: 120, y: 0 },
            { yPercent: 0, duration: 0.1, stagger: 0.012, ease: "power3.out" },
            0.44,
          );

        if (desktop && l2) {
          tl.fromTo(
            l2,
            { x: () => window.innerWidth * 0.22 },
            { x: () => -(l2.scrollWidth - window.innerWidth * 0.8), duration: 0.5 },
            0.44,
          );
        }
        tl.fromTo(q("[data-note]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.86);
        tl.set({}, {}, 1);

        return () => {
          section.dataset.navTheme = "dark";
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label={eyebrow}
      data-theme="dark"
      data-nav-theme="dark"
      className="statement relative bg-black motion-safe:h-[230svh] lg:motion-safe:h-[340vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        {/* Black stage — the claim we reject */}
        <div className="absolute inset-0 flex flex-col justify-center bg-black text-paper motion-reduce:relative motion-reduce:py-(--section-y)">
          <div className="shell">
            <p className="label flex items-center gap-3 text-mute">
              <span aria-hidden="true" className="size-1.5 bg-signal" />
              {eyebrow}
            </p>
            <h2 data-l1 className="mt-8 text-display-xl font-medium uppercase md:max-w-[14ch]">
              {words.map(({ word, em }, i) => (
                <Fragment key={i}>
                  <span className="-my-[0.16em] inline-block overflow-clip py-[0.16em] align-top">
                    <span data-word className="relative inline-block">
                      {word}
                      {em && (
                        <span
                          data-strike
                          aria-hidden="true"
                          className="absolute top-[52%] -right-[0.04em] -left-[0.04em] block h-[0.07em] origin-left bg-signal motion-safe:scale-x-0"
                        />
                      )}
                    </span>
                  </span>
                  {i < words.length - 1 && " "}
                </Fragment>
              ))}
            </h2>
          </div>
        </div>

        {/* Paper stage — what we actually do */}
        <div
          data-wipe
          data-theme="light"
          className="absolute inset-0 flex flex-col justify-center bg-bg text-fg motion-safe:[clip-path:inset(100%_0%_0%_0%)] motion-reduce:relative motion-reduce:py-(--section-y)"
        >
          <div className="overflow-hidden">
            <p
              data-l2
              className="px-(--page-x) text-display-xl font-medium uppercase lg:motion-safe:w-max lg:motion-safe:whitespace-nowrap lg:motion-safe:px-0"
            >
              <MaskedWords text={line2} />
            </p>
          </div>
          <p data-note className="shell mt-12 max-w-[30ch] text-lead text-fg-mute">
            {note}
          </p>
        </div>
      </div>
    </section>
  );
}
