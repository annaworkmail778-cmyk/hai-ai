"use client";
/* The single-form request page was replaced by the full booking journey; keep the URL working. */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect } from "react";

function Go({ lang }: { lang: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  useEffect(() => { router.replace(`/hotel/${lang}/booking${sp.toString() ? `?${sp.toString()}` : ""}`); }, [lang, sp, router]);
  return null;
}
export default function Book({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <Suspense><Go lang={lang} /></Suspense>;
}
