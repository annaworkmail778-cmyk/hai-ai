"use client";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { AuthPanel, DemoAuthBadge, inpG, labG } from "@/components/hotel/auth";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { useGuestSession } from "@/lib/client/guest-session";
import { amd, dLang } from "@/lib/format";
import { g, type GKey } from "@/lib/guest-i18n";
import { roomType } from "@/lib/hotel-data";
import { SERVICE_META } from "@/lib/hospitality-data";
import { loyaltyOf, tierRank } from "@/lib/rules";
import type { Lang } from "@/lib/types";

type Tab = "overview" | "stays" | "orders" | "rewards" | "profile";
const STATUS_TONE: Record<string, string> = { inquiry: "bg-amber-100 text-amber-800", confirmed: "bg-emerald-100 text-emerald-800", checked_in: "bg-emerald-100 text-emerald-800", checked_out: "bg-pine/10 text-pine/70", declined: "bg-red-100 text-red-800", cancelled: "bg-red-100 text-red-800", no_show: "bg-red-100 text-red-800" };

export default function AccountPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const { state, dispatch } = useDemo();
  const { account, guest, signOut } = useGuestSession();
  const [tab, setTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState(false);
  if (!account || !guest) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">{g(lang, "account")}</h1>
        <p className="mb-6 mt-2 text-[16px] text-pine/70">{g(lang, "joinText")}</p>
        <AuthPanel lang={lang} />
      </div>
    );
  }
  const lo = loyaltyOf(state, guest.id);
  const res = state.reservations.filter((r) => r.guestId === guest.id);
  const upcoming = res.filter((r) => ["inquiry", "confirmed", "checked_in"].includes(r.status)).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = res.filter((r) => !["inquiry", "confirmed", "checked_in"].includes(r.status)).sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const orders = state.orders.filter((o) => o.guestId === guest.id).sort((a, b) => b.createdAt - a.createdAt);
  const requests = state.services.filter((s) => s.guestId === guest.id).sort((a, b) => b.createdAt - a.createdAt);
  const vouchers = state.vouchers.filter((v) => v.guestId === guest.id);
  const offers = state.campaigns.filter((c) => c.active && c.tierIds.includes(lo.tier.id));
  const tabs: [Tab, GKey][] = [["overview", "overview"], ["stays", "stays"], ["orders", "orders"], ["rewards", "rewards"], ["profile", "profile"]];
  const ResCard = ({ r }: { r: (typeof res)[number] }) => (
    <div className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-pine/10">
      <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:block"><Image src={roomType(r.typeId).photos[0]} alt="" fill sizes="112px" className="object-cover" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-serif text-[19px] font-semibold">{roomType(r.typeId).name[lang]}</span><span className={cn("rounded-md px-2 py-0.5 text-[12px] font-semibold", STATUS_TONE[r.status])}>{g(lang, `st_${r.status}` as GKey)}</span></div>
        <div className="mt-0.5 text-[13.5px] text-pine/65">{dLang(r.checkIn, lang)} – {dLang(r.checkOut, lang)} · {r.code}{r.roomId && r.status !== "inquiry" ? ` · ${g(lang, "roomVerified")} ${r.roomId}` : ""}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]"><span className="tnum font-semibold">{amd(r.total + (r.extras ?? []).reduce((a, x) => a + x.price, 0) - (r.discount ?? 0))}</span>{r.status !== "inquiry" && r.status !== "cancelled" && r.status !== "declined" && <span className={cn("rounded px-1.5 text-[11.5px] font-semibold", r.payment === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-pine/5 text-pine/60")}>{g(lang, r.payment === "paid" ? "paid" : "unpaid")}</span>}{r.discount ? <span className="text-[12px] text-brass">−{amd(r.discount)}</span> : null}</div>
        {["inquiry", "confirmed"].includes(r.status) && <button onClick={() => { if (confirm(g(lang, "cancel") + "?")) dispatch({ type: "reservation.guestCancel", reservationId: r.id }); }} className="mt-2 text-[12.5px] font-semibold text-red-700">{g(lang, "cancel")}</button>}
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
      <section className="relative overflow-hidden rounded-[28px] bg-night p-6 text-cream sm:p-9">
        <Image src="/img/winter-forest.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2"><DemoAuthBadge lang={lang} /></div>
            <div className="text-[14px] text-cream/70">{g(lang, "welcome")},</div>
            <h1 className="font-serif text-[38px] font-semibold leading-tight sm:text-[48px]">{guest.firstName} {guest.lastName}</h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px]"><span className="size-2.5 rounded-full" style={{ background: lo.tier.color === "#121212" ? "#f5c451" : lo.tier.color }} />{state.loyalty.programName} · {lo.tier.name[lang]}</div>
          </div>
          <div className="min-w-56">
            <div className="tnum font-serif text-[46px] font-semibold leading-none">{lo.balance.toLocaleString("en-US")}</div>
            <div className="text-[13px] text-cream/70">{g(lang, "points")}</div>
            {lo.next && <><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-brass" style={{ width: `${Math.round(lo.progress * 100)}%` }} /></div><div className="mt-1.5 text-[12px] text-cream/65">{lo.toNext.toLocaleString("en-US")} {g(lang, "points")} {g(lang, "toNext")} {lo.next.name[lang]}</div></>}
          </div>
        </div>
      </section>
      <div className="scrollbar-none mt-5 flex gap-1 overflow-x-auto">
        {tabs.map(([id, k]) => <button key={id} onClick={() => setTab(id)} className={cn("shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold", tab === id ? "bg-pine text-cream" : "text-pine/65 hover:bg-pine/5")}>{g(lang, k)}</button>)}
        <button onClick={signOut} className="ml-auto shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold text-pine/60 hover:bg-pine/5">{g(lang, "signOut")}</button>
      </div>
      <div className="mt-5">
        {tab === "overview" && (
          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <h2 className="font-serif text-[24px] font-semibold">{g(lang, "upcoming")}</h2>
              {upcoming.length ? upcoming.map((r) => <ResCard key={r.id} r={r} />) : <div className="rounded-2xl bg-white p-5 text-[14px] text-pine/60 ring-1 ring-pine/10">{g(lang, "none")} · <Link className="font-semibold text-brass" href={`/hotel/${lang}/booking`}>{g(lang, "bk2")} →</Link></div>}
              {orders.slice(0, 2).map((o) => <Link key={o.id} href={`/hotel/${lang}/order/${o.id}`} className="flex items-center justify-between rounded-2xl bg-white p-4 text-[14px] ring-1 ring-pine/10"><span>{g(lang, "dining")} · {o.code}</span><span className="font-semibold">{g(lang, `os_${o.status}` as GKey)}</span></Link>)}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-5 ring-1 ring-pine/10">
                <h3 className="font-serif text-[20px] font-semibold">{g(lang, "benefits")}</h3>
                <ul className="mt-2 space-y-1.5 text-[14px] text-pine/75">{lo.tier.benefits.map((b) => <li key={b.en} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-brass" />{b[lang]}</li>)}</ul>
              </div>
              {offers.map((c) => <div key={c.id} className="rounded-2xl bg-[#fffaf0] p-5 ring-1 ring-brass/30"><div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brass">{g(lang, "offers")}</div><div className="mt-1 font-serif text-[19px] font-semibold">{c.title[lang]}</div><p className="mt-1 text-[13.5px] text-pine/70">{c.text[lang]}</p></div>)}
            </div>
          </div>
        )}
        {tab === "stays" && <div className="space-y-3"><h2 className="font-serif text-[22px] font-semibold">{g(lang, "upcoming")}</h2>{upcoming.length ? upcoming.map((r) => <ResCard key={r.id} r={r} />) : <p className="text-pine/60">{g(lang, "none")}</p>}<h2 className="pt-4 font-serif text-[22px] font-semibold">{g(lang, "previous")}</h2>{past.length ? past.map((r) => <ResCard key={r.id} r={r} />) : <p className="text-pine/60">{g(lang, "none")}</p>}</div>}
        {tab === "orders" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><h2 className="font-serif text-[22px] font-semibold">{g(lang, "dining")}</h2>{orders.length ? orders.map((o) => <Link key={o.id} href={`/hotel/${lang}/order/${o.id}`} className="block rounded-2xl bg-white p-4 ring-1 ring-pine/10"><div className="flex justify-between text-[14px]"><span className="font-semibold">{o.code} · {g(lang, o.type)}</span><span>{g(lang, `os_${o.status}` as GKey)}</span></div><div className="mt-1 text-[13px] text-pine/60">{o.items.length} × · {amd(o.total)}</div></Link>) : <p className="text-pine/60">{g(lang, "none")}</p>}</div>
            <div className="space-y-2"><h2 className="font-serif text-[22px] font-semibold">{g(lang, "myRequests")}</h2>{requests.length ? requests.map((s) => <div key={s.id} className="flex justify-between rounded-2xl bg-white p-4 text-[14px] ring-1 ring-pine/10"><span>{SERVICE_META[s.type].label[lang]} · {s.roomId}</span><span className="font-semibold">{g(lang, `rs_${s.status}` as GKey)}</span></div>) : <p className="text-pine/60">{g(lang, "none")}</p>}</div>
          </div>
        )}
        {tab === "rewards" && (
          <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-serif text-[22px] font-semibold">{g(lang, "rewards")}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {state.rewards.map((rw) => {
                  const locked = tierRank(state, lo.tier.id) < tierRank(state, rw.minTier);
                  const can = !locked && lo.balance >= rw.cost;
                  return (
                    <div key={rw.id} className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-pine/10">
                      <div className="font-semibold">{rw.name[lang]}</div>
                      <div className="mt-1 text-[13px] text-pine/60">{rw.cost.toLocaleString("en-US")} {g(lang, "points")}</div>
                      <button disabled={!can} onClick={() => dispatch({ type: "loyalty.redeem", guestId: guest.id, rewardId: rw.id })} className="mt-3 h-10 rounded-xl bg-pine text-[13.5px] font-semibold text-cream disabled:bg-pine/10 disabled:text-pine/45">{locked ? g(lang, "tierLocked") : can ? g(lang, "redeem") : g(lang, "notEnough")}</button>
                    </div>
                  );
                })}
              </div>
              <h3 className="mt-6 font-serif text-[20px] font-semibold">{g(lang, "vouchers")}</h3>
              <ul className="mt-2 space-y-2">{vouchers.map((v) => <li key={v.id} className="flex justify-between rounded-xl bg-white px-4 py-3 text-[14px] ring-1 ring-pine/10"><span>{state.rewards.find((r) => r.id === v.rewardId)?.name[lang]}</span><span className={cn("font-semibold", v.status === "active" ? "text-emerald-700" : "text-pine/50")}>{g(lang, v.status as GKey)}</span></li>)}{!vouchers.length && <li className="text-pine/60">{g(lang, "none")}</li>}</ul>
            </div>
            <div>
              <h2 className="font-serif text-[22px] font-semibold">{g(lang, "history")}</h2>
              <ul className="mt-3 divide-y divide-pine/10 rounded-2xl bg-white ring-1 ring-pine/10">{lo.entries.slice(0, 20).map((e) => <li key={e.id} className="flex justify-between gap-3 px-4 py-3 text-[13.5px]"><span><span className="block">{e.reason}</span><span className="text-[12px] text-pine/50">{new Date(e.at).toLocaleDateString(lang === "hy" ? "hy-AM" : lang === "ru" ? "ru-RU" : "en-GB")}</span></span><span className={cn("tnum font-semibold", e.points > 0 ? "text-emerald-700" : "text-red-700")}>{e.points > 0 ? "+" : ""}{e.points.toLocaleString("en-US")}</span></li>)}</ul>
              <p className="mt-2 text-[12px] text-pine/50">{state.loyalty.earnPer1000} {g(lang, "points")} / 1 000 ֏ · {lang === "hy" ? "միայն ավարտված կեցությունների և պատվերների համար" : lang === "ru" ? "только за завершённые проживания и заказы" : "completed stays and orders only"}</p>
            </div>
          </div>
        )}
        {tab === "profile" && (
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); dispatch({ type: "account.update", accountId: account.id, phone: String(fd.get("phone")), preferences: String(fd.get("prefs")).split(",").map((x) => x.trim()).filter(Boolean), consent: { marketing: fd.get("marketing") === "on", analytics: fd.get("analytics") === "on" } }); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="grid max-w-2xl gap-4 rounded-3xl bg-white p-6 ring-1 ring-pine/10 sm:grid-cols-2">
            <label><span className={labG}>{g(lang, "email")}</span><input className={inpG} value={account.email} readOnly /></label>
            <label><span className={labG}>{g(lang, "phone")}</span><input name="phone" className={inpG} defaultValue={guest.phone} /></label>
            <label className="sm:col-span-2"><span className={labG}>{g(lang, "preferences")}</span><input name="prefs" className={inpG} defaultValue={guest.preferences.join(", ")} /></label>
            <label className="flex items-center gap-2.5 text-[14px] sm:col-span-2"><input type="checkbox" name="marketing" defaultChecked={account.consent.marketing} className="size-5 accent-[var(--color-pine)]" />{g(lang, "marketing")}</label>
            <label className="flex items-center gap-2.5 text-[14px] sm:col-span-2"><input type="checkbox" name="analytics" defaultChecked={account.consent.analytics} className="size-5 accent-[var(--color-pine)]" />{g(lang, "consentAnalytics")}</label>
            <p className="text-[12.5px] text-pine/55 sm:col-span-2">{g(lang, "privacyNote")}</p>
            <button className="h-12 rounded-xl bg-pine text-[15px] font-semibold text-cream sm:col-span-2">{saved ? g(lang, "saved") + " ✓" : g(lang, "save")}</button>
          </form>
        )}
      </div>
    </div>
  );
}
