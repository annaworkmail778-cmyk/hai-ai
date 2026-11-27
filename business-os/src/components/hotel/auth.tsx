"use client";
import { useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { useGuestSession } from "@/lib/client/guest-session";
import { g } from "@/lib/guest-i18n";
import { loyaltyOf } from "@/lib/rules";
import type { Lang } from "@/lib/types";
import { Icon } from "../icons";
import { cn } from "../ui";

const uid = () => Math.random().toString(36).slice(2, 10);
export const inpG = "h-12 w-full rounded-xl border border-pine/15 bg-white px-3.5 text-[15px] text-pine outline-none transition focus:border-pine/45";
export const labG = "mb-1.5 block text-[12.5px] font-semibold text-pine/60";

export function DemoAuthBadge({ lang }: { lang: Lang }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brass/50 bg-[#fffaf0] px-2.5 py-1 text-[11.5px] font-semibold text-brass"><Icon name="info" size={13} />{g(lang, "demoAuth")}</span>;
}

/** Sign-in / registration panel (demo identity, no password). */
export function AuthPanel({ lang, onDone, compact }: { lang: Lang; onDone?: () => void; compact?: boolean }) {
  const { state, dispatch } = useDemo();
  const { signIn } = useGuestSession();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [f, setF] = useState({ first: "", last: "", phone: "", email: "", marketing: true });
  const demo = state.accounts.slice(0, 3);
  const login = (accId: string) => { signIn(accId); onDone?.(); };
  return (
    <div className={cn("rounded-3xl bg-white ring-1 ring-pine/10", compact ? "p-5" : "p-6 sm:p-8")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-full bg-cream p-1 text-[13px] font-semibold">
          {(["signin", "register"] as const).map((m) => <button key={m} onClick={() => { setMode(m); setErr(""); }} className={cn("rounded-full px-4 py-1.5", mode === m ? "bg-pine text-cream" : "text-pine/70")}>{g(lang, m === "signin" ? "signIn" : "register")}</button>)}
        </div>
        <DemoAuthBadge lang={lang} />
      </div>
      {mode === "signin" ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); const a = state.accounts.find((x) => x.email.toLowerCase() === email.trim().toLowerCase()); if (a) login(a.id); else setErr(g(lang, "noAccount")); }} className="flex gap-2">
            <input className={inpG} type="email" placeholder={g(lang, "email")} value={email} onChange={(e) => setEmail(e.target.value)} aria-label={g(lang, "email")} />
            <button className="h-12 shrink-0 rounded-xl bg-pine px-5 text-[14px] font-semibold text-cream">{g(lang, "continue")}</button>
          </form>
          {err && <p className="mt-2 text-[13px] text-red-700">{err}</p>}
          <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-pine/50">{g(lang, "demoMembers")}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {demo.map((a) => {
              const gu = state.guests.find((x) => x.id === a.guestId)!;
              const lo = loyaltyOf(state, a.guestId);
              return (
                <button key={a.id} onClick={() => login(a.id)} className="rounded-2xl p-3 text-left ring-1 ring-pine/15 transition hover:ring-pine/40">
                  <div className="text-[14px] font-semibold text-pine">{gu.firstName} {gu.lastName}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-pine/60"><span className="size-2 rounded-full" style={{ background: lo.tier.color }} />{lo.tier.name[lang]} · {lo.balance.toLocaleString("en-US")} {g(lang, "points")}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-pine/45">{a.email}</div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (!f.first.trim() || !f.email.includes("@")) return; if (state.accounts.some((a) => a.email.toLowerCase() === f.email.trim().toLowerCase())) { setErr(g(lang, "noAccount")); return; } const id = `acc-${uid()}`; dispatch({ type: "account.register", accountId: id, email: f.email.trim(), marketing: f.marketing, guest: { firstName: f.first.trim(), lastName: f.last.trim(), phone: f.phone.trim(), email: f.email.trim(), lang } }); login(id); }} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><div className="font-serif text-[24px] font-semibold text-pine">{g(lang, "joinTitle")}</div><p className="mt-1 text-[14px] text-pine/65">{g(lang, "joinText")}</p></div>
          <label><span className={labG}>{g(lang, "first")}</span><input className={inpG} value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} autoComplete="given-name" /></label>
          <label><span className={labG}>{g(lang, "last")}</span><input className={inpG} value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} autoComplete="family-name" /></label>
          <label><span className={labG}>{g(lang, "email")}</span><input className={inpG} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label><span className={labG}>{g(lang, "phone")}</span><input className={inpG} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" placeholder="+374 …" /></label>
          <label className="flex items-center gap-2.5 text-[14px] text-pine/75 sm:col-span-2"><input type="checkbox" checked={f.marketing} onChange={(e) => setF({ ...f, marketing: e.target.checked })} className="size-5 accent-[var(--color-pine)]" />{g(lang, "marketing")}</label>
          {err && <p className="text-[13px] text-red-700 sm:col-span-2">{err}</p>}
          <button className="h-12 rounded-xl bg-pine text-[15px] font-semibold text-cream sm:col-span-2">{g(lang, "register")} · +{state.loyalty.welcomeBonus} {g(lang, "points")}</button>
        </form>
      )}
    </div>
  );
}
