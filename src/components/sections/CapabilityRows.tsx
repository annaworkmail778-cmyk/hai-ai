"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/components/motion/gsap";
import { media } from "@/config/motion";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { PlusIcon, Arrow } from "@/components/ui/Arrow";

export type CapabilityRow = {
  id: string;
  name: string;
  summary: string;
  points: string[];
  related?: { title: string; href: string };
  relatedLabel: string;
};

/**
 * Large typographic capability list. Rows expand (button + region);
 * on desktop a preview of related work follows the pointer.
 */
export function CapabilityRows({ rows, previews }: { rows: CapabilityRow[]; previews: ReactNode[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useEffect(() => {
    const q = window.matchMedia(`${media.finePointer} and ${media.motionOk} and ${media.desktop}`);
    const update = () => setPreviewEnabled(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);

  // Pointer-following preview.
  useEffect(() => {
    if (!previewEnabled) return;
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float) return;
    const xTo = gsap.quickTo(float, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.7, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    list.addEventListener("pointermove", onMove);
    return () => list.removeEventListener("pointermove", onMove);
  }, [previewEnabled]);

  return (
    <div className="relative">
      <ul ref={listRef} className="relative border-b border-rule" onPointerLeave={() => setHovered(null)}>
        {rows.map((row, i) => {
          const isOpen = open === row.id;
          const panelId = `${baseId}-${row.id}`;
          return (
            <li key={row.id} id={row.id} className="border-t border-rule" onPointerEnter={() => setHovered(i)}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : row.id)}
                  className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 text-left md:grid-cols-[4rem_1fr_minmax(0,22rem)_auto] md:gap-8 lg:py-8"
                >
                  <span className="label text-fg-mute">{pad2(i + 1)}</span>
                  <span
                    className={cn(
                      "min-w-0 text-heading font-medium transition-[translate,color] duration-(--dur-ui) ease-out group-hover:translate-x-3 md:text-display-m",
                      hovered !== null && hovered !== i && "lg:text-fg-mute",
                    )}
                  >
                    {row.name}
                  </span>
                  <span className="hidden text-small text-fg-mute md:block">{row.summary}</span>
                  <PlusIcon open={isOpen} className="text-[1.4rem] text-fg" />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-label={row.name}
                className={cn(
                  "grid transition-[grid-template-rows] duration-(--dur-reveal) ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden" inert={!isOpen}>
                  <div className="grid gap-8 pb-10 md:grid-cols-[4rem_1fr] md:gap-8 lg:pb-14">
                    <div className="hidden md:block" />
                    <div className="grid gap-8 lg:grid-cols-[1fr_1fr_auto] lg:gap-12">
                      <p className="text-lead text-fg-mute md:hidden">{row.summary}</p>
                      <ul className="grid gap-x-12 gap-y-3 sm:grid-cols-2 lg:col-span-2">
                        {row.points.map((point) => (
                          <li key={point} className="flex gap-3 text-body">
                            <span aria-hidden="true" className="mt-[0.6em] block size-1 shrink-0 bg-signal" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      {row.related && (
                        <Link href={row.related.href} className="group/rel inline-flex items-start gap-3 self-end text-small">
                          <span className="label text-fg-mute">{row.relatedLabel}</span>
                          <span className="link-underline">{row.related.title}</span>
                          <Arrow className="transition-transform group-hover/rel:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {previewEnabled && (
        <div
          ref={floatRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-(--z-raised) hidden lg:block"
        >
          <div
            className={cn(
              "relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xs transition-[opacity,scale] duration-(--dur-ui) ease-out",
              "h-[15rem] w-[24rem]",
              hovered === null ? "scale-90 opacity-0" : "scale-100 opacity-100",
            )}
          >
            {previews.map((preview, i) => (
              <div
                key={i}
                className={cn("absolute inset-0 transition-opacity duration-(--dur-ui)", hovered === i ? "opacity-100" : "opacity-0")}
              >
                {preview}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
