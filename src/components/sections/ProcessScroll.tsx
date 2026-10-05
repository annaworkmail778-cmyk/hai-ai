"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { media } from "@/config/motion";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/Reveal";
import { DOTS, ProcessDiagram } from "./ProcessDiagram";

/**
 * 08 — Process. Desktop: pinned sequence where the architecture builds as
 * you scroll through five steps. Mobile / reduced motion: a vertical
 * narrative with the diagram at each stage.
 */
export function ProcessScroll({ t }: { t: Dictionary["process"] }) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop} and ${media.motionOk}`, () => {
        const q = gsap.utils.selector(section.querySelector("[data-pinned]"));
        const dots = q("[data-dot]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => setStep(Math.min(4, Math.floor(self.progress * 5))),
          },
        });

        // 01 Understand — points appear where they happen to be; tangled links.
        tl.fromTo(dots, { x: (i) => DOTS[i].sx - DOTS[i].gx, y: (i) => DOTS[i].sy - DOTS[i].gy }, { x: (i) => DOTS[i].sx - DOTS[i].gx, y: (i) => DOTS[i].sy - DOTS[i].gy, duration: 0.001 }, 0)
          .fromTo(q("[data-dot] rect"), { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, stagger: 0.004, duration: 0.06 }, 0.02)
          .fromTo(q("[data-tangle]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.06)
          .fromTo(q("[data-tangle] line"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.01, duration: 0.08 }, 0.06)
          // 02 Identify — friction points light up.
          .fromTo(q("[data-ring]"), { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, stagger: 0.015, duration: 0.06, ease: "back.out(2)" }, 0.22)
          .to(q("[data-dot] rect"), { fill: (i) => (DOTS[i].friction ? brand.accent : "#f3f2ee"), duration: 0.02 }, 0.22)
          // 03 Design — blueprint and dashed modules.
          .fromTo(q("[data-blueprint]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.41)
          .fromTo(q("[data-blueprint] line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.008, duration: 0.1 }, 0.41)
          .fromTo(q("[data-module-outline]"), { opacity: 0 }, { opacity: 1, stagger: 0.02, duration: 0.06 }, 0.46)
          .to(q("[data-tangle]"), { opacity: 0, duration: 0.06 }, 0.5)
          .to(dots, { x: 0, y: 0, stagger: 0.003, duration: 0.14, ease: "power2.inOut" }, 0.52)
          .to(q("[data-ring]"), { opacity: 0, duration: 0.05 }, 0.6)
          // 04 Build — modules solidify, connections draw.
          .fromTo(q("[data-module]"), { opacity: 0 }, { opacity: 1, stagger: 0.015, duration: 0.06 }, 0.62)
          .to(q("[data-module-outline]"), { opacity: 0, duration: 0.04 }, 0.68)
          .to(q("[data-dot] rect"), { fill: "#f3f2ee", duration: 0.02 }, 0.64)
          .fromTo(q("[data-connections]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.66)
          .fromTo(q("[data-connections] line"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.012, duration: 0.08 }, 0.66)
          // 05 Improve — the loop closes.
          .fromTo(q("[data-loop]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.82)
          .fromTo(q("[data-loop] path"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14 }, 0.82)
          .set({}, {}, 1);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="process"
      aria-labelledby="process-title"
      data-theme="dark"
      data-nav-theme="dark"
      className="relative bg-bg text-fg lg:motion-safe:h-[460vh]"
    >
      {/* Desktop pinned sequence */}
      <div data-pinned className="sticky top-0 hidden h-svh overflow-hidden lg:motion-safe:block">
        <div className="shell grid-editorial h-full items-center">
          <div className="col-span-5">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="process-title" className="mt-8 max-w-[13ch] text-display-l font-medium">
              {t.title}
            </h2>
            <ol className="mt-14 space-y-1">
              {t.steps.map((s, i) => (
                <li key={s.title} className="border-t border-rule py-4">
                  <div className="flex items-baseline gap-6">
                    <span className={cn("label transition-colors", i === step ? "text-signal" : "text-fg-mute")}>{pad2(i + 1)}</span>
                    <span className={cn("text-title transition-colors duration-(--dur-ui)", i === step ? "text-fg" : "text-fg-mute")}>
                      {s.title}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "grid pl-[calc(2ch+1.5rem)] transition-[grid-template-rows,opacity] duration-(--dur-reveal) ease-out",
                      i === step ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[44ch] pt-3 text-body text-fg-mute">{s.text}</p>
                      <p className="label pt-3 text-fg">
                        {t.outputLabel} · {s.output}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-span-6 col-start-7 flex justify-center">
            <ProcessDiagram stage={5} className="h-auto max-h-[78vh] w-full max-w-[44rem]" />
          </div>
        </div>
      </div>

      {/* Mobile / reduced-motion narrative */}
      <div className="py-(--section-y) lg:motion-safe:hidden">
        <div className="shell">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <RevealText as="h2" className="mt-8 max-w-[14ch] text-display-l font-medium" id="process-title-static">
            {t.title}
          </RevealText>
          <ol className="mt-16 grid gap-16 md:grid-cols-2 lg:grid-cols-3">
            {t.steps.map((s, i) => (
              <li key={s.title} className="border-t border-rule pt-6">
                <p className="label text-signal">{pad2(i + 1)}</p>
                <h3 className="mt-4 text-heading font-medium">{s.title}</h3>
                <p className="mt-4 text-body text-fg-mute">{s.text}</p>
                <p className="label mt-4">
                  {t.outputLabel} · {s.output}
                </p>
                <ProcessDiagram stage={i + 1} className="mt-8 h-auto w-full max-w-[24rem]" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
