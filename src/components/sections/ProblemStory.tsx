"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/Reveal";

/**
 * 05 — Problems we solve. Sticky editorial heading on the left; problems
 * scroll on the right. The active problem shows its flow:
 * problem → possible system → outcome.
 */
export function ProblemStory({ t }: { t: Dictionary["problems"] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-problem]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.problem));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const steps = (item: Dictionary["problems"]["items"][number]) => [
    { label: t.labels.problem, text: item.text },
    { label: t.labels.system, text: item.system },
    { label: t.labels.outcome, text: item.outcome },
  ];

  return (
    <section
      aria-labelledby="problems-title"
      data-theme="light"
      data-nav-theme="light"
      className="relative bg-bg py-(--section-y) text-fg"
    >
      <div className="shell grid-editorial gap-y-16">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3.5rem)]">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="problems-title" className="mt-8 max-w-[14ch] text-display-l font-medium">
              {t.title}
            </RevealText>
            <p className="mt-8 max-w-[40ch] text-lead text-fg-mute">{t.intro}</p>

            <div aria-hidden="true" className="mt-16 hidden items-end gap-5 lg:flex">
              <span className="text-display-xl leading-none font-medium tabular-nums">{pad2(active + 1)}</span>
              <span className="label mb-3 text-fg-mute">/ {pad2(t.items.length)}</span>
            </div>
            <ol aria-hidden="true" className="mt-8 hidden max-w-sm space-y-2.5 lg:block">
              {t.items.map((item, i) => (
                <li key={item.title} className="flex items-center gap-4">
                  <span
                    className={cn(
                      "block h-px transition-[width,background-color] duration-(--dur-ui) ease-out",
                      i === active ? "w-10 bg-signal" : "w-4 bg-rule-strong",
                    )}
                  />
                  <span className={cn("text-small transition-colors", i === active ? "text-fg" : "text-fg-mute")}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ol ref={listRef} className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
          {t.items.map((item, i) => (
            <li
              key={item.title}
              data-problem={i}
              data-active={i === active}
              className="group border-t border-rule py-14 transition-opacity duration-(--dur-reveal) ease-out lg:flex lg:min-h-[68vh] lg:flex-col lg:justify-center lg:py-20 lg:motion-safe:opacity-25 lg:motion-safe:data-[active=true]:opacity-100"
            >
              <p className="label text-fg-mute">{pad2(i + 1)}</p>
              <h3 className="mt-5 text-display-m font-medium">{item.title}</h3>

              <ol className="relative mt-10 space-y-8 pl-8">
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-2 left-[3px] block w-px origin-top bg-rule-strong transition-transform duration-[1400ms] ease-out lg:motion-safe:scale-y-0 lg:motion-safe:group-data-[active=true]:scale-y-100"
                />
                {steps(item).map((step, s) => (
                  <li key={step.label} className="relative">
                    <span
                      aria-hidden="true"
                      className={cn("absolute top-[0.35em] -left-8 block size-[7px]", s === 2 ? "bg-signal" : "bg-fg")}
                    />
                    <p className="label text-fg-mute">{step.label}</p>
                    <p className={cn("mt-2 max-w-[42ch] text-lead", s === 0 && "text-fg-mute")}>{step.text}</p>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
