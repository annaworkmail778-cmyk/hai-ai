"use client";
/* Connection status pill shared by every vertical (live / reconnecting / local). */
import type { Conn } from "@/lib/kernel/demo-store";
import { Icon, type IconName } from "../icons";
import { cn } from "../ui";

export function ConnPillView({ conn, mode, backend, pending }: { conn: Conn; mode: "live" | "local"; backend: string; pending: number }) {
  const map = {
    live: { tone: "ok" as const, text: "Համաժամեցված", icon: "wifi" as IconName },
    connecting: { tone: "neutral" as const, text: "Միանում է…", icon: "wifi" as IconName },
    reconnecting: { tone: "warn" as const, text: pending ? `Վերամիացում… (${pending} սպասում է)` : "Վերամիացում…", icon: "wifiOff" as IconName },
    local: { tone: "info" as const, text: "Տեղային ռեժիմ", icon: "laptop" as IconName },
  }[conn];
  return (
    <span title={mode === "live" ? `Սինք․ ${backend || "…"}` : "Միայն այս սարքում (առանց ինտերնետի)"} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium", { ok: "bg-ok-soft text-ok", neutral: "bg-black/5 text-muted", warn: "bg-warn-soft text-warn", info: "bg-info-soft text-info" }[map.tone])}>
      <Icon name={map.icon} size={14} />{map.text}
    </span>
  );
}
