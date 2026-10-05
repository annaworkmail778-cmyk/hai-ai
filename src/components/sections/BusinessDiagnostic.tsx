"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { media } from "@/config/motion";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";

/**
 * 07 — Interactive business diagnostic. Pick an area; the "report" shows the
 * common friction, a possible system and example improvements.
 */
export function BusinessDiagnostic({ t, contactHref }: { t: Dictionary["diagnostic"]; contactHref: string }) {
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const category = t.categories[index];

  const select = (i: number, focus = false) => {
    const next = (i + t.categories.length) % t.categories.length;
    if (next !== index) {
      setIndex(next);
      setRun((r) => r + 1);
    }
    if (focus) tabsRef.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => select(index + 1, true),
      ArrowRight: () => select(index + 1, true),
      ArrowUp: () => select(index - 1, true),
      ArrowLeft: () => select(index - 1, true),
      Home: () => select(0, true),
      End: () => select(t.categories.length - 1, true),
    };
    const action = keys[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // Re-run the "analysis" whenever the selection changes.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || run === 0) return;
      const mm = gsap.matchMedia();
      mm.add(media.motionOk, () => {
        gsap
          .timeline()
          .fromTo("[data-scan]", { yPercent: -100, autoAlpha: 1 }, { yPercent: 2200, duration: 0.55, ease: "power2.inOut" })
          .set("[data-scan]", { autoAlpha: 0 })
          .fromTo(
            "[data-report-item]",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 },
            0.25,
          );
      });
      return () => mm.revert();
    },
    { scope: panelRef, dependencies: [run] },
  );

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  return (
    <section
      aria-labelledby="diagnostic-title"
      data-theme="ink"
      data-nav-theme="dark"
      className="relative bg-bg py-(--section-y) text-fg"
    >
      <div className="shell">
        <div className="grid-editorial items-end gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="diagnostic-title" className="mt-8 max-w-[16ch] text-display-l font-medium">
              {t.title}
            </RevealText>
          </div>
          <p className="col-span-4 max-w-[36ch] text-lead text-fg-mute md:col-span-6 lg:col-span-4">{t.intro}</p>
        </div>

        <div className="mt-16 overflow-hidden rounded-sm border border-rule-strong bg-black lg:mt-20">
          {/* Console header */}
          <div className="flex h-12 items-center justify-between gap-4 border-b border-rule px-5 md:px-6">
            <p className="label flex items-center gap-3 text-fg-mute">
              <span aria-hidden="true" className="size-1.5 bg-signal" />
              {t.labels.report}
            </p>
            <p className="label text-fg-mute" aria-live="polite">
              <span className="text-fg">{category.name}</span>
              <span className="hidden sm:inline"> · {pad2(index + 1)}/{pad2(t.categories.length)}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-[17rem_1fr]">
            {/* Areas */}
            <div
              role="tablist"
              aria-label={t.labels.areas}
              aria-orientation="vertical"
              className="flex gap-1 overflow-x-auto border-b border-rule p-2 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:p-3"
            >
              {t.categories.map((c, i) => {
                const selected = i === index;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabsRef.current[i] = el;
                    }}
                    id={tabId(i)}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    onKeyDown={onKeyDown}
                    className={cn(
                      "group flex shrink-0 items-center justify-between gap-6 rounded-xs px-4 py-3 text-left transition-colors duration-(--dur-micro) lg:py-4",
                      selected ? "bg-surface text-fg" : "text-fg-mute hover:bg-surface/60 hover:text-fg",
                    )}
                  >
                    <span className="text-title whitespace-nowrap">{c.name}</span>
                    <span
                      aria-hidden="true"
                      className={cn("hidden size-1.5 transition-colors lg:block", selected ? "bg-signal" : "bg-transparent")}
                    />
                  </button>
                );
              })}
            </div>

            {/* Report */}
            <div
              ref={panelRef}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId(index)}
              tabIndex={0}
              className="relative overflow-hidden p-6 md:p-8 lg:p-12"
            >
              <span
                data-scan
                aria-hidden="true"
                className="pointer-events-none invisible absolute inset-x-0 top-0 block h-12 bg-gradient-to-b from-transparent via-signal/15 to-transparent"
              />
              <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
                <div data-report-item>
                  <p className="label text-fg-mute">{t.labels.friction}</p>
                  <ol className="mt-6 space-y-5">
                    {category.friction.map((f, i) => (
                      <li key={f} className="grid grid-cols-[2rem_1fr] gap-2">
                        <span className="label pt-[0.3em] text-fg-mute">{pad2(i + 1)}</span>
                        <span className="text-body">{f}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div data-report-item className="lg:border-x lg:border-rule lg:px-10">
                  <p className="label text-fg-mute">{t.labels.system}</p>
                  <p className="mt-6 text-heading font-medium">{category.system.name}</p>
                  <p className="mt-4 text-body text-fg-mute">{category.system.description}</p>
                  <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
                    {category.system.steps.map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span className="label border border-rule-strong px-2.5 py-1.5 text-fg">{step}</span>
                        {i < category.system.steps.length - 1 && <Arrow className="text-fg-mute" />}
                      </li>
                    ))}
                  </ol>
                </div>

                <div data-report-item>
                  <p className="label text-fg-mute">{t.labels.improvements}</p>
                  <ul className="mt-6 space-y-5">
                    {category.improvements.map((imp) => (
                      <li key={imp} className="grid grid-cols-[1.5rem_1fr] gap-2">
                        <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-[0.35em] size-3.5 text-signal">
                          <path d="M2 8.5 6 12.5 14 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        <span className="text-body">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div data-report-item className="mt-12 flex flex-col gap-6 border-t border-rule pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[60ch] text-small text-fg-mute">{t.labels.note}</p>
                <Link
                  href={`${contactHref}?area=${category.id}`}
                  className="group inline-flex shrink-0 items-center gap-3 font-medium"
                >
                  <span className="link-underline pb-1">{t.labels.cta}</span>
                  <Arrow className="transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
