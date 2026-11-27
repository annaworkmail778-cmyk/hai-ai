"use client";
import { useState } from "react";
import { FAQ } from "@/lib/guest-i18n";
import type { Lang } from "@/lib/types";
import { Icon } from "../icons";
import { cn } from "../ui";

const IDX: Record<Lang, number> = { hy: 0, ru: 1, en: 2 };

export function FaqList({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-pine/10 border-y border-pine/10">
      {FAQ.map((f, i) => (
        <div key={i}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-serif text-[20px] font-semibold text-pine">
            {f.q[IDX[lang]]}<Icon name="chevronDown" size={20} className={cn("shrink-0 transition-transform duration-300", open === i && "rotate-180")} />
          </button>
          <div className={cn("grid transition-[grid-template-rows] duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <p className="overflow-hidden text-[15px] leading-relaxed text-pine/70"><span className="block pb-5">{f.a[IDX[lang]]}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}
