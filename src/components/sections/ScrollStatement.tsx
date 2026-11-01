"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { media } from "@/config/motion";

/** Split "You tell us what *slows* you down." into words, marking emphasised ones. */
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
 * 03 — Positioning statement. A pinned typographic moment in two lines:
 * what the client brings (on black, one word underlined in the accent),
 * a paper wipe, then what we do about it.
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

        tl.fromTo(q("[data-mark]"), { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: "power2.inOut" }, 0.06)
          .to(q("[data-l1]"), { xPercent: desktop ? -3 : 0, opacity: 0.45, duration: 0.34 }, 0.04)
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
        tl.fromTo(q("[data-note]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.62);
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
      className="statement relative bg-black motion-safe:h-[200svh] lg:motion-safe:h-[260vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        {/* Black stage — what the client brings */}
        <div className="absolute inset-0 flex flex-col justify-center bg-black text-paper motion-reduce:relative motion-reduce:py-(--section-y)">
          <div className="shell">
            <p className="label flex items-center gap-3 text-mute">
              <span aria-hidden="true" className="size-1.5 bg-signal" />
              {eyebrow}
            </p>
            <h2 data-l1 className="mt-8 max-w-[18ch] text-display-l font-medium">
              {words.map(({ word, em }, i) => (
                <Fragment key={i}>
                  <span className="-my-[0.16em] inline-block overflow-clip py-[0.16em] align-top">
                    <span data-word className="relative inline-block">
                      {word}
                      {em && (
                        <span
                          data-mark
                          aria-hidden="true"
                          className="absolute -right-[0.02em] bottom-[0.02em] -left-[0.02em] block h-[0.08em] origin-left bg-signal motion-safe:scale-x-0"
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

        {/* Paper stage — what we do about it */}
        <div
          data-wipe
          data-theme="light"
          className="absolute inset-0 flex flex-col justify-center bg-bg text-fg motion-safe:[clip-path:inset(100%_0%_0%_0%)] motion-reduce:relative motion-reduce:py-(--section-y)"
        >
          <div className="shell">
            <p data-l2 className="max-w-[18ch] text-display-l font-medium">
              <MaskedWords text={line2} />
            </p>
            <p data-note className="mt-10 max-w-[44ch] text-lead text-fg-mute">
              {note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
