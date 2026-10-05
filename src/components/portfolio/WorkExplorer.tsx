"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/components/motion/gsap";
import { media } from "@/config/motion";
import { cn } from "@/lib/cn";
import { Arrow } from "@/components/ui/Arrow";

export type WorkItem = {
  slug: string;
  href: string;
  capabilities: string[];
  /** Pre-rendered gallery card (server component output). */
  card: ReactNode;
  /** Pre-rendered visual for the index preview. */
  preview: ReactNode;
  row: { index: string; title: string; industry: string; type: string; year: number; concept?: string };
};

type Labels = {
  filterLabel: string;
  all: string;
  views: { gallery: string; index: string; label: string };
  columns: { number: string; project: string; industry: string; type: string; year: string };
  empty: string;
};

/** Filterable work index with a gallery view and a compact index view. */
export function WorkExplorer({
  items,
  filters,
  labels,
}: {
  items: WorkItem[];
  filters: Array<{ id: string; label: string }>;
  labels: Labels;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"gallery" | "index">("gallery");
  const visible = filter === "all" ? items : items.filter((i) => i.capabilities.includes(filter));

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-rule py-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={labels.filterLabel} className="-mx-1 flex flex-wrap gap-1">
          {[{ id: "all", label: labels.all }, ...filters].map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "label rounded-xs px-3 py-2 transition-colors duration-(--dur-micro)",
                filter === f.id ? "bg-fg text-bg" : "text-fg-mute hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label={labels.views.label} className="flex items-center gap-1">
          {(["gallery", "index"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "label rounded-xs border px-3 py-2 transition-colors duration-(--dur-micro)",
                view === v ? "border-fg text-fg" : "border-transparent text-fg-mute hover:text-fg",
              )}
            >
              {labels.views[v]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && <p className="py-24 text-lead text-fg-mute">{labels.empty}</p>}

      {view === "gallery" ? <Gallery items={visible} /> : <IndexTable items={visible} labels={labels} />}
    </div>
  );
}

/** Editorial rhythm: one full-width project, then an offset pair, repeat. */
function Gallery({ items }: { items: WorkItem[] }) {
  const blocks: WorkItem[][] = [];
  let i = 0;
  while (i < items.length) {
    blocks.push(items.slice(i, i + 1));
    i += 1;
    if (i < items.length) {
      blocks.push(items.slice(i, i + 2));
      i += 2;
    }
  }
  return (
    <div className="space-y-24 pt-16 md:space-y-32 lg:pt-24">
      {blocks.map((block, b) =>
        block.length === 1 ? (
          <div key={block[0].slug}>{block[0].card}</div>
        ) : (
          <div key={block[0].slug} className="grid-editorial gap-y-24">
            <div className={cn("col-span-4 md:col-span-8", b % 4 === 1 ? "lg:col-span-7" : "lg:col-span-5 lg:col-start-1 lg:mt-48")}>
              {block[0].card}
            </div>
            <div className={cn("col-span-4 md:col-span-8", b % 4 === 1 ? "lg:col-span-4 lg:col-start-9 lg:mt-56" : "lg:col-span-6 lg:col-start-7")}>
              {block[1].card}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function IndexTable({ items, labels }: { items: WorkItem[]; labels: Labels }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = window.matchMedia(`${media.finePointer} and ${media.motionOk} and ${media.desktop}`);
    const update = () => setPreview(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!preview) return;
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float) return;
    const xTo = gsap.quickTo(float, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    list.addEventListener("pointermove", onMove);
    return () => list.removeEventListener("pointermove", onMove);
  }, [preview]);

  return (
    <div className="relative pt-10">
      <div className="label hidden grid-cols-[4rem_1fr_14rem_14rem_5rem_2rem] gap-6 pb-4 text-fg-mute lg:grid">
        <span>{labels.columns.number}</span>
        <span>{labels.columns.project}</span>
        <span>{labels.columns.industry}</span>
        <span>{labels.columns.type}</span>
        <span>{labels.columns.year}</span>
        <span />
      </div>
      <ul ref={listRef} className="relative border-b border-rule" onPointerLeave={() => setHovered(null)}>
        {items.map((item, i) => (
          <li key={item.slug} onPointerEnter={() => setHovered(i)}>
            <Link
              href={item.href}
              data-cursor="view"
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-rule py-6 lg:grid-cols-[4rem_1fr_14rem_14rem_5rem_2rem] lg:gap-6 lg:py-8"
            >
              <span className="label text-fg-mute">{item.row.index}</span>
              <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span
                  className={cn(
                    "text-heading font-medium transition-[translate,color] duration-(--dur-ui) group-hover:translate-x-2",
                    hovered !== null && hovered !== i && "lg:text-fg-mute",
                  )}
                >
                  {item.row.title}
                </span>
                {item.row.concept && <span className="label text-fg-mute">{item.row.concept}</span>}
              </span>
              <span className="hidden text-small text-fg-mute lg:block">{item.row.industry}</span>
              <span className="hidden text-small text-fg-mute lg:block">{item.row.type}</span>
              <span className="label hidden text-fg-mute lg:block">{item.row.year}</span>
              <Arrow className="text-fg transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
      {preview && (
        <div ref={floatRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-(--z-raised)">
          <div
            className={cn(
              "relative h-[16rem] w-[25rem] -translate-x-1/2 -translate-y-[110%] overflow-hidden rounded-xs transition-[opacity,scale] duration-(--dur-ui) ease-out",
              hovered === null ? "scale-90 opacity-0" : "scale-100 opacity-100",
            )}
          >
            {items.map((item, i) => (
              <div key={item.slug} className={cn("absolute inset-0 transition-opacity", hovered === i ? "opacity-100" : "opacity-0")}>
                {item.preview}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
