"use client";
/*
 * Guest table booking. Slots come from the same availability rules the host uses (turn time + buffer, combinable tables),
 * so a slot shown as available can actually be seated. A website booking is a REQUEST: the host confirms or declines it,
 * and the guest sees that status on this device. No reminder message is actually sent (no messaging provider connected).
 */
import { use, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ChatWidget } from "@/components/restaurant/guest/chat";
import { GuestShell } from "@/components/restaurant/guest/shell";
import { deviceKey } from "@/components/restaurant/guest/store";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { slotsFor } from "@/lib/restaurant/ops";
import type { Lang, ResStatus } from "@/lib/restaurant/types";

const T = {
  title: { hy: "Ամրագրել սեղան", ru: "Забронировать стол", en: "Book a table" },
  sub: { hy: "Ընտրեք օրը, հյուրերի քանակը և ժամը։ Ռեստորանը կհաստատի Ձեր հարցումը։", ru: "Выберите дату, количество гостей и время. Ресторан подтвердит запрос.", en: "Choose a date, party size and time. The restaurant confirms your request." },
  date: { hy: "Օր", ru: "Дата", en: "Date" }, party: { hy: "Հյուրեր", ru: "Гостей", en: "Guests" }, time: { hy: "Ժամ", ru: "Время", en: "Time" },
  name: { hy: "Անուն", ru: "Имя", en: "Name" }, phone: { hy: "Հեռախոս", ru: "Телефон", en: "Phone" },
  allergies: { hy: "Ալերգիաներ կամ սննդակարգ", ru: "Аллергии или диета", en: "Allergies or diet" }, occasion: { hy: "Առիթ (ծննդյան օր…)", ru: "Повод (день рождения…)", en: "Occasion (birthday…)" },
  note: { hy: "Նշում", ru: "Комментарий", en: "Note" }, send: { hy: "Ուղարկել հարցումը", ru: "Отправить запрос", en: "Send request" },
  none: { hy: "Այս օրը ազատ ժամ չկա այդքան հյուրի համար։ Գրեք մեզ չատում։", ru: "На эту дату нет свободного времени для такой компании. Напишите нам в чат.", en: "No free time for this party size on that day. Message us in the chat." },
  big: { hy: "9+ հյուրի համար հարցումը կքննարկի մենեջերը", ru: "Запросы на 9+ гостей рассматривает менеджер", en: "Parties of 9+ are reviewed by a manager" },
  mine: { hy: "Իմ ամրագրումները (այս սարքում)", ru: "Мои брони (на этом устройстве)", en: "My bookings (this device)" },
  cancel: { hy: "Չեղարկել", ru: "Отменить", en: "Cancel" },
  demo: { hy: "Ցուցադրական ամրագրում․ իրական ռեստորան չկա, հաղորդագրություն չի ուղարկվում։", ru: "Демо-бронь: ресторан вымышленный, сообщения не отправляются.", en: "Demo booking: the restaurant is fictional and no message is sent." },
} satisfies Record<string, Record<Lang, string>>;
const ST: Record<ResStatus, Record<Lang, string>> = {
  requested: { hy: "Սպասում է հաստատման", ru: "Ожидает подтверждения", en: "Awaiting confirmation" }, confirmed: { hy: "Հաստատված է", ru: "Подтверждена", en: "Confirmed" },
  seated: { hy: "Բարի գալուստ", ru: "Добро пожаловать", en: "Welcome" }, completed: { hy: "Ավարտված", ru: "Завершена", en: "Completed" },
  declined: { hy: "Մերժված", ru: "Отклонена", en: "Declined" }, cancelled: { hy: "Չեղարկված", ru: "Отменена", en: "Cancelled" }, no_show: { hy: "Չներկայացում", ru: "Неявка", en: "No-show" },
};
const fmtDay = (ms: number, lang: Lang) => new Intl.DateTimeFormat(lang === "hy" ? "hy-AM" : lang === "ru" ? "ru-RU" : "en-GB", { timeZone: "Asia/Yerevan", weekday: "short", day: "numeric", month: "short" }).format(ms);
const dayOf = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(ms);
const hm = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(ms);

export default function Reserve({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const { state, dispatch } = useR();
  const [now] = useState(() => Date.now());
  const days = Array.from({ length: 7 }, (_, i) => now + i * 86400000);
  const [day, setDay] = useState(dayOf(now));
  const [party, setParty] = useState(2);
  const [at, setAt] = useState<number | null>(null);
  const [f, setF] = useState({ name: "", phone: "", allergies: "", occasion: "", note: "" });
  const [key, setKey] = useState("");
  useEffect(() => setKey(deviceKey()), []);
  const slots = useMemo(() => slotsFor(state, day, party).filter((x) => x.at > now + 30 * 60000), [state, day, party, now]);
  const mine = key ? state.reservations.filter((r) => r.deviceKey === key).sort((a, b) => b.at - a.at) : [];
  const valid = f.name.trim().length > 1 && f.phone.replace(/\D/g, "").length >= 6 && at;
  const inp = "h-12 w-full rounded-xl border border-[var(--rt-line)] bg-transparent px-4 text-[15px]";

  return (
    <GuestShell lang={lang}>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="rt-serif text-[40px] leading-tight">{T.title[lang]}</h1>
        <p className="mt-2 text-[var(--rt-muted)]">{T.sub[lang]}</p>

        <section className="mt-8">
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--rt-muted)]">{T.date[lang]}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">{days.map((d) => <button key={d} onClick={() => { setDay(dayOf(d)); setAt(null); }} className={cn("h-12 shrink-0 rounded-xl border px-4 text-[14px]", day === dayOf(d) ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-bg)]" : "border-[var(--rt-line)]")}>{fmtDay(d, lang)}</button>)}</div>
        </section>
        <section className="mt-6">
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--rt-muted)]">{T.party[lang]}</h2>
          <div className="flex flex-wrap gap-2">{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => { setParty(n); setAt(null); }} className={cn("size-12 rounded-xl border text-[15px]", party === n ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-bg)]" : "border-[var(--rt-line)]")}>{n}{n === 10 ? "+" : ""}</button>)}</div>
          {party >= 9 && <p className="mt-2 text-[13px] text-[var(--rt-muted)]">{T.big[lang]}</p>}
        </section>
        <section className="mt-6">
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--rt-muted)]">{T.time[lang]}</h2>
          {slots.some((x) => x.ok) ? <div className="flex flex-wrap gap-2">{slots.map((x) => <button key={x.at} disabled={!x.ok} onClick={() => setAt(x.at)} className={cn("tnum h-11 rounded-xl border px-3 text-[14px]", at === x.at ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-bg)]" : x.ok ? "border-[var(--rt-line)]" : "border-transparent text-[var(--rt-faint)] line-through")}>{hm(x.at)}</button>)}</div>
            : <p className="text-[14px] text-[var(--rt-muted)]">{T.none[lang]}</p>}
        </section>
        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <input className={inp} placeholder={T.name[lang]} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
          <input className={inp} placeholder={T.phone[lang]} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
          <input className={inp} placeholder={T.allergies[lang]} value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} />
          <input className={inp} placeholder={T.occasion[lang]} value={f.occasion} onChange={(e) => setF({ ...f, occasion: e.target.value })} />
          <input className={cn(inp, "sm:col-span-2")} placeholder={T.note[lang]} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </section>
        <button disabled={!valid} onClick={() => { dispatch({ type: "reservation.request", name: f.name, phone: f.phone, partySize: party, at: at!, allergies: f.allergies || undefined, occasion: f.occasion || undefined, note: f.note || undefined, source: "website", deviceKey: key }); setAt(null); setF({ name: "", phone: "", allergies: "", occasion: "", note: "" }); }} className="rt-btn rt-btn-accent mt-6 w-full justify-center disabled:opacity-40">{T.send[lang]}<Icon name="arrowRight" size={17} /></button>
        <p className="mt-3 text-[12.5px] text-[var(--rt-faint)]">{T.demo[lang]}</p>

        {mine.length > 0 && (
          <section className="mt-10">
            <h2 className="rt-serif text-[24px]">{T.mine[lang]}</h2>
            <ul className="mt-3 space-y-2">{mine.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--rt-line)] p-4">
                <div><div className="text-[16px]">{fmtDay(r.at, lang)} · <span className="tnum">{hm(r.at)}</span> · {r.partySize}</div><div className="text-[13px] text-[var(--rt-muted)]">{r.code}</div></div>
                <span className={cn("ml-auto rounded-full px-3 py-1 text-[13px]", r.status === "confirmed" ? "bg-[var(--rt-accent)] text-[var(--rt-bg)]" : "border border-[var(--rt-line)]")}>{ST[r.status][lang]}</span>
                {(r.status === "requested" || r.status === "confirmed") && r.at > now && <button className="text-[13px] text-[var(--rt-muted)] underline" onClick={() => dispatch({ type: "reservation.cancel", reservationId: r.id, reason: "guest (website)" })}>{T.cancel[lang]}</button>}
              </li>
            ))}</ul>
          </section>
        )}
      </main>
      <ChatWidget lang={lang} />
    </GuestShell>
  );
}
