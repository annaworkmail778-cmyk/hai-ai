"use client";
/* Phone / laptop frame used by presenter modes of every vertical. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";

/** Renders a page at a fixed "device" size and scales it to fit its box. */
export function Device({ src, w, h, kind, label, reloadKey }: { src: string; w: number; h: number; kind: "phone" | "laptop"; label: string; reloadKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(el.clientWidth / w, el.clientHeight / h)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-white/50"><Icon name={kind === "phone" ? "smartphone" : "laptop"} size={14} />{label}</div>
      <div ref={box} className="relative min-h-0 flex-1">
        <div className={cn("absolute left-1/2 top-0 origin-top overflow-hidden bg-black shadow-[0_30px_80px_rgb(0_0_0/0.5)]", kind === "phone" ? "rounded-[44px] border-[10px] border-[#1d1d1f]" : "rounded-xl border-[8px] border-[#1d1d1f]")} style={{ width: w + (kind === "phone" ? 20 : 16), height: h + (kind === "phone" ? 20 : 16), transform: `translateX(-50%) scale(${scale})` }}>
          <iframe key={src + reloadKey} src={src} title={label} className="block bg-white" style={{ width: w, height: h, border: 0 }} />
        </div>
      </div>
    </div>
  );
}

