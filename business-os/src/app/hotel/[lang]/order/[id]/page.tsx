"use client";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { amd, time } from "@/lib/format";
import { g, type GKey } from "@/lib/guest-i18n";
import type { Lang, OrderStatus } from "@/lib/types";

export default function OrderStatusPage({ params }: { params: Promise<{ lang: Lang; id: string }> }) {
  const { lang, id } = use(params);
  const { state } = useDemo();
  const o = state.orders.find((x) => x.id === id);
  if (!o) return <div className="mx-auto max-w-xl px-4 pb-20 pt-32 text-center text-pine/70">…</div>;
  const flow: OrderStatus[] = ["submitted", "accepted", "preparing", "ready", ...(o.type === "room_service" ? ["out_for_delivery" as OrderStatus] : []), "completed"];
  const idx = flow.indexOf(o.status);
  const ended = o.status === "rejected" || o.status === "cancelled";
  const at = (s: OrderStatus) => o.history.find((h) => h.status === s)?.at;
  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-28 sm:pt-32">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-pine/10">
        <div className="flex items-start justify-between gap-3">
          <div><div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brass">{g(lang, "orderStatus")}</div><h1 className="mt-1 font-serif text-[30px] font-semibold">{o.code}</h1><div className="text-[13.5px] text-pine/60">{g(lang, o.type)}{o.roomId ? ` · ${g(lang, "roomVerified")} ${o.roomId}` : o.tableId ? ` · ${g(lang, "table")} ${o.tableId.replace("T", "")}` : o.pickupTime ? ` · ${o.pickupTime}` : ""}</div></div>
          <span className={cn("rounded-full px-3 py-1.5 text-[12.5px] font-semibold", ended ? "bg-red-50 text-red-700" : o.status === "completed" ? "bg-emerald-50 text-emerald-800" : o.status === "submitted" ? "bg-amber-50 text-amber-800" : "bg-pine text-cream")}>{g(lang, `os_${o.status}` as GKey)}</span>
        </div>
        {ended ? <p className="mt-5 rounded-2xl bg-red-50 p-4 text-[14px] text-red-800">{g(lang, `os_${o.status}` as GKey)}{o.reason ? ` · ${o.reason}` : ""}</p> : (
          <ol className="mt-6 space-y-0">
            {flow.map((s, i) => (
              <li key={s} className="flex gap-3">
                <div className="flex flex-col items-center"><span className={cn("grid size-7 place-items-center rounded-full text-[12px] font-bold transition", i < idx || o.status === "completed" ? "bg-pine text-cream" : i === idx ? "pulse-ring bg-brass text-white" : "bg-pine/10 text-pine/40")}>{i < idx || o.status === "completed" ? <Icon name="check" size={14} /> : i + 1}</span>{i < flow.length - 1 && <span className={cn("my-1 w-0.5 flex-1 min-h-6", i < idx ? "bg-pine" : "bg-pine/15")} />}</div>
                <div className="pb-4"><div className={cn("text-[15px] font-semibold", i > idx && "text-pine/40")}>{g(lang, `os_${s}` as GKey)}</div>{at(s) && <div className="text-[12.5px] text-pine/55">{time(at(s)!)}</div>}</div>
              </li>
            ))}
          </ol>
        )}
        <ul className="mt-2 divide-y divide-pine/10 border-t border-pine/10">
          {o.items.map((it, i) => { const m = state.menu.items.find((x) => x.id === it.itemId); return <li key={i} className="flex items-center gap-3 py-2.5 text-[14px]">{m && <span className="relative size-10 shrink-0 overflow-hidden rounded-lg"><Image src={m.photo} alt="" fill sizes="40px" className="object-cover" /></span>}<span className="flex-1">{it.qty} × {m?.name[lang]}</span><span className="tnum">{amd(it.price * it.qty)}</span></li>; })}
        </ul>
        {o.discount > 0 && <div className="flex justify-between text-[14px] text-brass"><span>{g(lang, "discount")}</span><span>−{amd(o.discount)}</span></div>}
        <div className="flex justify-between border-t border-pine/10 pt-3 text-[17px] font-semibold"><span>{g(lang, "total")}</span><span className="tnum">{amd(o.total)}</span></div>
        {o.type === "room_service" && <p className="mt-3 text-[12.5px] text-pine/55">{g(lang, "settleNote")}</p>}
      </div>
      <div className="mt-4 flex justify-center gap-3"><Link href={`/hotel/${lang}/dining`} className="inline-flex h-11 items-center rounded-full border border-pine/25 px-5 text-[14px] font-semibold">{g(lang, "viewMenu")}</Link><Link href={`/hotel/${lang}/account`} className="inline-flex h-11 items-center rounded-full bg-pine px-5 text-[14px] font-semibold text-cream">{g(lang, "account")}</Link></div>
    </div>
  );
}
