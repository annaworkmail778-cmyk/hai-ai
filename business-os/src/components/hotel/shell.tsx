"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useDemo } from "@/lib/client/demo-store";
import type { Lang } from "@/lib/types";
import { AssistantWidget } from "./assistant-widget";
import { SiteFooter, SiteHeader } from "./site";

function Inner({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const { setRole } = useDemo();
  const path = usePathname();
  const sp = useSearchParams();
  useEffect(() => { setRole("guest"); document.documentElement.lang = lang; }, [setRole, lang]);
  const home = path === `/hotel/${lang}`;
  return (
    <div className="min-h-dvh bg-cream text-pine">
      <SiteHeader lang={lang} overlay={home} />
      <main>{children}</main>
      <SiteFooter lang={lang} />
      <AssistantWidget lang={lang} autoOpen={sp.get("chat") === "1"} />
    </div>
  );
}

export function HotelShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Suspense><Inner lang={lang}>{children}</Inner></Suspense>;
}
