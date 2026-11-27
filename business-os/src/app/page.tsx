"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnPill } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { guestUrl, Qr } from "@/components/present/qr";
import { Badge } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";

export default function Launcher() {
  const { session, setRole } = useDemo();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); setRole("presenter"); }, [setRole]);
  const cards: { href: string; icon: IconName; title: string; text: string; primary?: boolean }[] = [
    { href: "/present", icon: "play", title: "Ներկայացման ռեժիմ", text: "Ուղեցույցով սցենարներ՝ հյուրի հեռախոսը և վահանակը կողք կողքի", primary: true },
    { href: "/admin", icon: "home", title: "Կառավարման վահանակ", text: "Ամրագրումներ, սենյակներ, մաքրություն, վերլուծություն" },
    { href: "/hotel/hy", icon: "globe", title: "Հյուրանոցի կայքը", text: "Pine Ridge · հայերեն, русский, English" },
  ];
  return (
    <main className="min-h-dvh bg-[#0c0c0d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-[14px] font-bold text-ink">R<span className="text-signal">.</span></span><div><div className="text-[16px] font-semibold">RISEUP Hotel OS</div><div className="text-[12.5px] text-white/50">Ինտերակտիվ ցուցադրություն · գոյություն չունեցող հյուրանոց</div></div></div>
          <div className="flex items-center gap-2 [&>span]:bg-white/10 [&>span]:text-white"><ConnPill /><Badge tone="dark" className="bg-white/10">Ներկայացնող {session.toUpperCase()}</Badge></div>
        </div>
        <h1 className="mt-12 max-w-3xl text-[36px] font-semibold leading-[1.08] tracking-tight sm:text-[52px]">Հյուրանոցի ամբողջ աշխատանքը՝ մեկ համակարգում։</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/65">Ուղիղ ամրագրումներ կայքից, 24/7 AI օգնական, ամրագրումների և սենյակների կառավարում, ավտոմատ մաքրության առաջադրանքներ և եկամտի վերլուծություն։</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className={`group rounded-2xl p-5 transition ${c.primary ? "bg-white text-ink hover:bg-white/90" : "bg-white/[0.06] hover:bg-white/[0.1]"}`}>
              <span className={`grid size-11 place-items-center rounded-xl ${c.primary ? "bg-signal text-white" : "bg-white/10"}`}><Icon name={c.icon} size={20} /></span>
              <div className="mt-5 text-[18px] font-semibold">{c.title}</div>
              <div className={`mt-1 text-[13.5px] ${c.primary ? "text-muted" : "text-white/55"}`}>{c.text}</div>
              <div className="mt-5 flex items-center gap-1 text-[13px] font-semibold">Բացել<Icon name="arrowRight" size={15} className="transition group-hover:translate-x-0.5" /></div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-5">
            <div className="rounded-xl bg-white p-2"><Qr value={guestUrl(session, origin || "https://example.invalid")} size={120} /></div>
            <div className="max-w-56 text-[13px] text-white/65"><div className="mb-1 text-[15px] font-semibold text-white">Հյուրի հեռախոս</div>Սկանավորեք՝ կայքը բացելու համար։ Գործողությունները կհայտնվեն այս սարքի վահանակում։</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <Image src="/img/hero-snow.jpg" alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover opacity-60" />
            <div className="relative p-5 text-[13px] text-white/85">
              <div className="mb-2 text-[15px] font-semibold text-white">Ինչպես ներկայացնել 3 րոպեում</div>
              <ol className="list-decimal space-y-1 pl-5"><li>Բացեք «Ներկայացման ռեժիմ» և սեղմեք «Վերագործարկել»</li><li>Ընտրեք սցենար 1-ը՝ «Հյուրը գրում է ժամը 23:30-ին»</li><li>Անցեք քայլերով. յուրաքանչյուր քայլում կա տեքստ, թե ինչ ասել</li><li>Ցույց տվեք «Առաջ / հետո» համեմատությունը և արժեքի հաշվիչը</li></ol>
            </div>
          </div>
        </div>
        <p className="mt-10 text-[12px] leading-relaxed text-white/40">Pine Ridge-ը գոյություն չունեցող հյուրանոց է։ Բոլոր անունները, գները, կոնտակտները և թվերը ցուցադրական են։ Արտաքին հաղորդագրություններ (WhatsApp, Telegram, էլ. փոստ) չեն ուղարկվում. դրանք նշված են որպես սիմուլյացիա։ Booking.com, Airbnb և այլ ծառայություններ միացված չեն։ Լուսանկարները՝ Unsplash։</p>
      </div>
    </main>
  );
}
