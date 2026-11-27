"use client";
/*
 * QR table entry: /q/{session}/{token}. The token identifies the table only (never a guest).
 * Stores the presenter session and the table context on this device, then opens the menu in the phone's language.
 */
import { use, useEffect } from "react";

export default function QrEntry({ params }: { params: Promise<{ session: string; token: string }> }) {
  const { session, token } = use(params);
  useEffect(() => {
    const s = session.toLowerCase().replace(/[^a-z0-9]/g, "") || "a";
    const tk = token.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
    try {
      localStorage.setItem("rst:session", JSON.stringify(s));
      localStorage.setItem("rst:mode", JSON.stringify("live"));
      localStorage.setItem("rst:table", JSON.stringify({ token: tk, at: Date.now() }));
    } catch { /* private mode: the menu still works without a remembered table */ }
    const nav = (navigator.language || "hy").slice(0, 2);
    const lang = nav === "ru" ? "ru" : nav === "en" ? "en" : "hy";
    window.location.replace(`/restaurant/${lang}/menu?s=${s}`);
  }, [session, token]);
  return <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#12100e", color: "#f3ece2", fontFamily: "Georgia, serif", fontSize: 28 }}>Summit Table</main>;
}
