import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { ScrubClip } from "@/components/motion/ScrubClip";

/** 10 — Why us. Large editorial statements, revealed by a scroll-driven mask. */
export function WhyUs({ t }: { t: Dictionary["why"] }) {
  return (
    <section aria-label={t.eyebrow} data-theme="light" data-nav-theme="light" className="relative bg-bg pb-(--section-y) text-fg">
      <div className="shell">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <ol className="mt-12 lg:mt-16">
          {t.items.map((item, i) => (
            <li key={item.title} className="grid-editorial items-end gap-y-6 border-t border-rule py-12 lg:py-20">
              <span className="label col-span-4 self-start text-fg-mute md:col-span-1">{pad2(i + 1)}</span>
              <ScrubClip
                className={cn(
                  "col-span-4 md:col-span-7 lg:col-span-7",
                  i % 2 === 0 ? "lg:col-start-2" : "lg:col-start-3",
                )}
              >
                <h3 className="text-display-m font-medium uppercase md:text-display-l">{item.title}</h3>
              </ScrubClip>
              <Reveal className="col-span-4 md:col-span-6 md:col-start-2 lg:col-span-3 lg:col-start-10">
                <p className="text-body text-fg-mute">{item.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
