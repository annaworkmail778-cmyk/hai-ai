"use client";
/* Restaurant OS demo launcher. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Qr } from "@/components/present/qr";
import { ConnPillView } from "@/components/shared/conn-pill";
import { useR } from "@/lib/restaurant/client";
import { tableQrUrl } from "@/lib/restaurant/qr";

export default function RLauncher() {
  const { state, session, setRole, conn, mode, backend, pending } = useR();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setRole("presenter"); setOrigin(window.location.origin); }, [setRole]);
  const t7 = state.tables.find((t) => t.id === "T7")!;
  const cards: { href: string; icon: IconName; title: string; text: string; primary?: boolean }[] = [
    { href: "/present/restaurant", icon: "play", title: "Ներկայացման ռեժիմ", text: "Ուղեցույցով սցենարներ՝ հյուրի հեռախոս, խոհանոց և սեփականատիրոջ վահանակ", primary: true },
    { href: "/r/admin", icon: "home", title: "Կառավարման վահանակ", text: "Պատվերներ, սրահ, մենյու, ինքնարժեք, պահեստ, վերլուծություն" },
    { href: "/r/kds", icon: "flame", title: "Խոհանոցի էկրան", text: "Կայաններ՝ տաք, մանղալ, սառը, աղանդեր, բար" },
    { href: "/r/floor", icon: "smartphone", title: "Մատուցողի հավելված", text: "Սրահի պլան, սեղաններ, հյուրի կանչեր" },
    { href: "/restaurant/hy", icon: "globe", title: "Ռեստորանի կայքը", text: "Summit Table · հայերեն, русский, English" },
  ];
  return (
    <main className="min-h-dvh bg-[#0c0c0d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-[14px] font-bold text-ink">R<span className="text-signal">.</span></span><div><div className="text-[16px] font-semibold">RISEUP Restaurant OS</div><div className="text-[12.5px] text-white/50">Ինտերակտիվ ցուցադրություն · գոյություն չունեցող ռեստորան «{state.brand.name}»</div></div></div>
          <div className="[&>span]:bg-white/10 [&>span]:text-white"><ConnPillView conn={conn} mode={mode} backend={backend} pending={pending} /></div>
        </div>
        <h1 className="mt-12 max-w-3xl text-[36px] font-semibold leading-[1.08] tracking-tight sm:text-[52px]">Պատվերից մինչև շահույթ՝ մեկ համակարգում։</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/65">QR պատվերներ սեղանից, խոհանոցի էկրան՝ ըստ կայանների, ուտեստների ինքնարժեք և մարժա, պահեստ, գնումներ և սեփականատիրոջ վերլուծություն։ Ձեր դրամարկղը մնում է ինչպես կա։</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className={`group rounded-2xl p-5 transition ${c.primary ? "bg-white text-ink hover:bg-white/90 md:row-span-2" : "bg-white/[0.06] hover:bg-white/[0.1]"}`}>
              <span className={`grid size-11 place-items-center rounded-xl ${c.primary ? "bg-signal text-white" : "bg-white/10"}`}><Icon name={c.icon} size={20} /></span>
              <div className="mt-5 text-[18px] font-semibold">{c.title}</div>
              <div className={`mt-1 text-[13.5px] ${c.primary ? "text-muted" : "text-white/55"}`}>{c.text}</div>
            </Link>
          ))}
          <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-5">
            <div className="rounded-xl bg-white p-2"><Qr value={tableQrUrl(session, t7.token, origin || "https://example.invalid")} size={104} /></div>
            <div className="text-[13px] text-white/65"><div className="mb-1 text-[15px] font-semibold text-white">Սեղան 7 · QR</div>Սկանավորեք հեռախոսով՝ մենյուն բացելու համար։ Ներկայացնող {session.toUpperCase()}</div>
          </div>
        </div>
        <p className="mt-10 text-[12px] leading-relaxed text-white/40">Summit Table-ը գոյություն չունեցող ռեստորան է, որը ներկայացված չէ որպես Ծաղկաձորի իրական բիզնես։ Բոլոր անունները, գները, կոնտակտները և թվերը ցուցադրական են։ Արտաքին հաղորդագրություններ չեն ուղարկվում (սիմուլյացիա)։ POS, ֆիսկալ կտրոն, վճարումներ և առաքման հարթակներ միացված չեն։ Լուսանկարները՝ Unsplash։</p>
      </div>
    </main>
  );
}
