"use client";
/* Stable entry for printed QR codes: /s/a/hotel → stores session "a" and opens the guest site. */
import { use, useEffect } from "react";

export default function SessionEntry({ params }: { params: Promise<{ code: string; target: string }> }) {
  const { code, target } = use(params);
  useEffect(() => {
    const c = code.toLowerCase().replace(/[^a-z0-9]/g, "") || "a";
    try { localStorage.setItem("bos:session", JSON.stringify(c)); localStorage.setItem("bos:mode", JSON.stringify("live")); } catch { /* private mode */ }
    const nav = (navigator.language || "hy").slice(0, 2);
    const lang = nav === "ru" ? "ru" : nav === "en" ? "en" : "hy";
    const dest = target === "admin" ? "/admin" : target === "present" ? "/present" : `/hotel/${lang}`;
    window.location.replace(`${dest}?s=${c}`);
  }, [code, target]);
  return <main className="grid min-h-dvh place-items-center bg-pine text-cream"><p className="font-serif text-2xl">Pine Ridge</p></main>;
}
