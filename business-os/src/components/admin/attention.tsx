"use client";
import Link from "next/link";
import { useDemo } from "@/lib/client/demo-store";
import { useNow } from "@/lib/client/use-now";
import { Icon, type IconName } from "../icons";
import { cn } from "../ui";

/** "Needs attention now" strip on the overview: every item is a live count with a link to the place where it is resolved. */
export function AttentionStrip() {
  const { state } = useDemo();
  const now = useNow(30000);
  const awaiting = state.inbox.filter((t) => t.status !== "resolved" && t.messages.filter((m) => m.dir === "in" || m.dir === "out").slice(-1)[0]?.dir === "in").length;
  const lateReq = state.services.filter((s) => ["new", "assigned", "in_progress"].includes(s.status) && now - s.createdAt > 30 * 60000).length;
  const negReviews = state.reviews.filter((r) => r.rating <= 3 && (r.status === "new" || r.status === "draft")).length;
  const conflicts = state.reservations.filter((r) => r.external?.syncState === "conflict" && !["cancelled", "checked_out"].includes(r.status)).length + state.syncLog.filter((l) => l.result === "failed").length;
  const inquiries = state.reservations.filter((r) => r.status === "inquiry").length;
  const notReady = state.reservations.filter((r) => r.checkIn === state.baseDate && r.status === "confirmed" && r.roomId && state.hk[r.roomId] !== "clean" && state.hk[r.roomId] !== "inspected").length;
  const items: [string, number, string, IconName][] = [
    ["Ամրագրման հարցումներ", inquiries, "/admin/reservations?status=inquiry", "calendar"],
    ["Զրույցներ առանց պատասխանի", awaiting, "/admin/inbox", "message"],
    ["Ժամանման սենյակ պատրաստ չէ", notReady, "/admin/housekeeping", "broom"],
    ["Ուշացած հյուրի հարցումներ", lateReq, "/admin/requests", "qr"],
    ["Բացասական կարծիքներ", negReviews, "/admin/reviews", "star"],
    ["Ալիքների խնդիրներ", conflicts, "/admin/channels", "refresh"],
  ];
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {items.map(([label, n, href, icon]) => (
        <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:-translate-y-px", n ? "border-signal/40 bg-signal-soft/60" : "border-line bg-surface")}>
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", n ? "bg-signal text-white" : "bg-paper text-faint")}><Icon name={icon} size={16} /></span>
          <span className="min-w-0"><span className="tnum block text-[18px] font-semibold leading-tight">{n}</span><span className="block truncate text-[11.5px] text-muted">{label}</span></span>
        </Link>
      ))}
    </div>
  );
}
