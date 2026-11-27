"use client";
/* QR entry points: /q/room/204, /q/table/T3, /q/point/spa. Picks the guest's language and redirects. */
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function QrEntry({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = use(params);
  const router = useRouter();
  useEffect(() => {
    const nav = (navigator.language || "en").toLowerCase();
    const lang = nav.startsWith("hy") ? "hy" : nav.startsWith("ru") ? "ru" : "en";
    const safe = encodeURIComponent(id.slice(0, 12));
    const to = kind === "table" ? `/hotel/${lang}/dining?table=${safe}` : kind === "point" ? `/hotel/${lang}/stay?point=${safe}` : `/hotel/${lang}/stay?room=${safe}`;
    router.replace(to);
  }, [kind, id, router]);
  return <div className="grid min-h-svh place-items-center text-sm text-ink-3">…</div>;
}
