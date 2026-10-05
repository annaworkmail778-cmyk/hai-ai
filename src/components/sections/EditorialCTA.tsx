"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { media } from "@/config/motion";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ButtonLink, ArrowLink } from "@/components/ui/Button";

/**
 * 11 — Final call to action. A black panel scales out from an inset frame
 * to full bleed, then the closing line resolves. Flows straight into the footer.
 */
export function EditorialCTA({
  eyebrow,
  line1,
  line2,
  primary,
  secondary,
  primaryHref,
  secondaryHref,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  primary: string;
  secondary: string;
  primaryHref: string;
  secondaryHref: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();
      mm.add({ desktop: media.desktop, motion: media.motionOk }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;
        const inset = desktop ? "inset(16% 12% 16% 12% round 6px)" : "inset(12% 5% 12% 5% round 6px)";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const theme = self.progress > 0.3 ? "dark" : "light";
              if (section.dataset.navTheme !== theme) section.dataset.navTheme = theme;
            },
          },
        });
        tl.fromTo(q("[data-panel]"), { clipPath: inset }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.45, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-panel-inner]"), { scale: 0.92 }, { scale: 1, duration: 0.45, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-line1]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.08)
          .fromTo(q("[data-line2] [data-word]"), { yPercent: 130, y: 0 }, { yPercent: 0, duration: 0.18, stagger: 0.03, ease: "power3.out" }, 0.28)
          .fromTo(q("[data-cta]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.46)
          .set({}, {}, 1);
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
      data-theme="light"
      data-nav-theme="light"
      className="cta relative bg-bg motion-safe:h-[170svh] lg:motion-safe:h-[220vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div
          data-panel
          data-theme="dark"
          className="absolute inset-0 bg-bg text-fg motion-reduce:relative"
        >
          <div data-panel-inner className="flex h-full flex-col justify-center motion-reduce:py-(--section-y)">
            <div className="shell">
              <p className="label flex items-center gap-3 text-fg-mute">
                <span aria-hidden="true" className="size-1.5 bg-signal" />
                {eyebrow}
              </p>
              <p data-line1 className="mt-10 max-w-[26ch] text-heading font-medium text-fg-mute">
                {line1}
              </p>
              <h2 data-line2 className="mt-6 text-display-xl font-medium">
                <MaskedWords text={line2} />
              </h2>
              <div data-cta className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6">
                <ButtonLink href={primaryHref}>{primary}</ButtonLink>
                <ArrowLink href={secondaryHref}>{secondary}</ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
