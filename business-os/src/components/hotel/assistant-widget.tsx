"use client";
/* Guest-facing assistant. Every message is a synced event, so the hotel team sees the conversation live. */
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { greeting, respond, startQuick, type AssistantReply, type BookingPrefill, type QuickReply } from "@/lib/assistant";
import { useDemo } from "@/lib/client/demo-store";
import { addDays, nextFriday } from "@/lib/dates";
import { amd, dLang } from "@/lib/format";
import { ROOM_TYPES, roomType } from "@/lib/hotel-data";
import { fitsGuests, freeRooms, quote } from "@/lib/pricing";
import { t } from "@/lib/site-i18n";
import type { ChatCard, ChatMsg, Lang, RoomTypeId } from "@/lib/types";
import { Icon } from "../icons";
import { cn } from "../ui";

const uid = () => Math.random().toString(36).slice(2, 10);

export function AssistantWidget({ lang, autoOpen }: { lang: Lang; autoOpen?: boolean }) {
  const d = t(lang).assistant;
  const { state, dispatch, epoch, session } = useDemo();
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [quick, setQuick] = useState<QuickReply[]>([]);
  const [booking, setBooking] = useState<BookingPrefill | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const night = state.clock.mode === "night";
  const key = `bos:conv:${session}:${epoch}`;

  useEffect(() => {
    try { setConvId(sessionStorage.getItem(key)); } catch { setConvId(null); }
  }, [key]);
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);

  const conv = useMemo(() => state.conversations.find((c) => c.id === convId) ?? null, [state.conversations, convId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [conv?.messages.length, typing, booking, open]);

  const post = (id: string, reply: AssistantReply) => {
    for (const m of reply.messages) dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "assistant", text: m.text, at: Date.now(), intent: m.intent, cards: m.cards } });
    if (reply.action?.type === "handoff") dispatch({ type: "chat.handoff", conversationId: id, question: reply.action.question });
    if (reply.action?.type === "booking") setBooking(reply.action.prefill);
    setQuick(reply.quick);
  };

  const ensureConv = () => {
    if (convId && conv) return convId;
    const id = `c-${uid()}`;
    dispatch({ type: "chat.start", conversationId: id, lang });
    try { sessionStorage.setItem(key, id); } catch { /* ignore */ }
    setConvId(id);
    post(id, greeting(state, lang));
    return id;
  };

  const openPanel = () => { setOpen(true); if (!conv) ensureConv(); };

  const ask = (text: string, label?: string) => {
    const id = ensureConv();
    dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "guest", text: label ?? text, at: Date.now() } });
    setInput(""); setQuick([]); setTyping(true);
    setTimeout(() => { setTyping(false); post(id, respond(state, lang, text)); }, 650 + Math.random() * 450);
  };

  return (
    <>
      {!open && (
        <button onClick={openPanel} className="fixed bottom-5 right-4 z-40 flex items-center gap-2.5 rounded-full bg-pine py-2.5 pl-2.5 pr-5 text-cream shadow-[0_14px_34px_rgb(15_27_23/0.35)] transition hover:bg-pine-2 sm:right-6">
          <span className="pulse-ring grid size-9 place-items-center rounded-full bg-cream text-pine"><Icon name="message" size={18} /></span>
          <span className="text-left leading-tight"><span className="block text-[14px] font-semibold">{d.open}</span><span className="block text-[11.5px] text-cream/70">{night ? d.night : d.status}</span></span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(680px,calc(100dvh-40px))] sm:w-[400px] sm:overflow-hidden sm:rounded-3xl sm:shadow-[0_30px_80px_rgb(15_27_23/0.35)]">
          <header className="flex items-center gap-3 bg-pine px-4 py-3 text-cream">
            <span className="grid size-10 place-items-center rounded-full bg-cream/10 font-serif text-lg">PR</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">{d.title}</div>
              <div className="flex items-center gap-1.5 text-[12px] text-cream/70"><span className={cn("size-1.5 rounded-full", night ? "bg-amber-300" : "bg-emerald-400")} style={{ background: night ? "#f5c451" : "#4ade80" }} />{night ? d.night : d.status}</div>
            </div>
            <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label="Close"><Icon name="x" size={20} /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
            <p className="mx-auto max-w-[300px] text-center text-[11.5px] leading-snug text-pine/55">{d.disclosure}</p>
            {conv?.messages.map((m) => <Bubble key={m.id} m={m} lang={lang} onChoose={(typeId, card) => setBooking({ typeId, checkIn: card.checkIn, checkOut: card.checkOut, adults: card.adults, children: card.children })} />)}
            {typing && <div className="typing flex w-16 gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"><span className="size-1.5 rounded-full bg-pine/60" /><span className="size-1.5 rounded-full bg-pine/60" /><span className="size-1.5 rounded-full bg-pine/60" /></div>}
            {booking && conv && !typing && (
              <BookingCard lang={lang} prefill={booking} onSent={(resId) => {
                dispatch({ type: "chat.message", conversationId: conv.id, msg: { id: uid(), from: "assistant", at: Date.now(), intent: "inquiry_sent", text: lang === "hy" ? `Շնորհակալություն։ Ձեր հարցումն ուղարկված է ընդունարանին։ Սա դեռ հաստատված ամրագրում չէ. ${night ? `ընդունարանը կհաստատի այն առավոտյան (${state.kb.receptionHours.split("–")[0]}-ից հետո)` : "աշխատակիցը շուտով կհաստատի այն"}։` : lang === "ru" ? `Спасибо! Ваш запрос передан на ресепшн. Это ещё не подтверждённая бронь — ${night ? `ресепшн подтвердит её утром (после ${state.kb.receptionHours.split("–")[0]})` : "сотрудник скоро её подтвердит"}.` : `Thank you! Your request has been passed to reception. This is not a confirmed booking yet — ${night ? `reception will confirm it in the morning (after ${state.kb.receptionHours.split("–")[0]})` : "a team member will confirm it shortly"}.`, cards: [{ kind: "inquiry", reservationId: resId }] } });
                setBooking(null);
                setQuick(startQuick(lang).slice(1, 4));
              }} conversationId={conv.id} onCancel={() => setBooking(null)} />
            )}
            <div ref={endRef} />
          </div>
          {quick.length > 0 && (
            <div className="scrollbar-none flex gap-2 overflow-x-auto px-3.5 pb-2">
              {quick.map((q) => <button key={q.id} onClick={() => ask(q.id, q.label)} className="shrink-0 rounded-full border border-pine/20 bg-white px-3.5 py-2 text-[13px] font-medium text-pine transition hover:border-pine/40">{q.label}</button>)}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) ask(input.trim()); }} className="flex items-center gap-2 border-t border-pine/10 bg-white px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={d.placeholder} className="h-11 flex-1 rounded-full bg-cream px-4 text-[15px] text-pine outline-none placeholder:text-pine/45 focus:ring-2 focus:ring-pine/20" />
            <button type="submit" disabled={!input.trim()} className="grid size-11 place-items-center rounded-full bg-pine text-cream disabled:opacity-40" aria-label="Send"><Icon name="send" size={18} /></button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ m, lang, onChoose }: { m: ChatMsg; lang: Lang; onChoose: (t: RoomTypeId, card: Extract<ChatCard, { kind: "rooms" }>) => void }) {
  const { state } = useDemo();
  const d = t(lang).assistant;
  const mine = m.from === "guest";
  return (
    <div className={cn("rise-in flex flex-col gap-2", mine ? "items-end" : "items-start")}>
      {m.from === "staff" && <span className="px-1 text-[11px] font-semibold text-brass">{d.staff}</span>}
      <div className={cn("max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-snug shadow-sm", mine ? "rounded-br-md bg-pine text-cream" : m.from === "staff" ? "rounded-bl-md bg-[#fff6e6] text-pine ring-1 ring-brass/30" : "rounded-bl-md bg-white text-pine")}>{m.text}</div>
      {m.cards?.map((c, i) => {
        if (c.kind === "rooms") return (
          <div key={i} className="w-full space-y-2">
            {c.typeIds.map((id) => {
              const rt = roomType(id);
              const q = c.checkIn && c.checkOut ? quote(id, c.checkIn, c.checkOut) : null;
              const free = c.checkIn && c.checkOut ? freeRooms(state, id, c.checkIn, c.checkOut).length : 0;
              return (
                <div key={id} className="flex gap-3 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-pine/10">
                  <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl"><Image src={rt.photos[0]} alt="" fill sizes="72px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-[17px] font-semibold text-pine">{rt.name[lang]}</div>
                    {q && <div className="tnum text-[13px] text-pine/70">{amd(q.total)} · {q.nights} {t(lang).nights}</div>}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-emerald-700" style={{ color: "#17845b" }}>{free > 0 ? t(lang).availableNow : ""}</span>
                      <button onClick={() => onChoose(id, c)} className="rounded-full bg-pine px-3 py-1 text-[12.5px] font-semibold text-cream">{d.choose}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
        const res = state.reservations.find((r) => r.id === c.reservationId);
        if (!res) return null;
        return (
          <div key={i} className="w-full rounded-2xl border border-dashed border-brass/50 bg-[#fffaf0] p-3 text-[13px] text-pine">
            <div className="flex items-center justify-between font-semibold"><span>{t(lang).reference}: {res.code}</span><span className={cn("rounded-md px-1.5 py-0.5 text-[11px]", res.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : res.status === "declined" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800")}>{res.status === "confirmed" ? (lang === "hy" ? "Հաստատված" : lang === "ru" ? "Подтверждено" : "Confirmed") : res.status === "declined" ? (lang === "hy" ? "Մերժված" : lang === "ru" ? "Отклонено" : "Declined") : lang === "hy" ? "Սպասում է հաստատման" : lang === "ru" ? "Ожидает подтверждения" : "Awaiting confirmation"}</span></div>
            <div className="mt-1 text-pine/70">{roomType(res.typeId).name[lang]} · {dLang(res.checkIn, lang)} – {dLang(res.checkOut, lang)}</div>
          </div>
        );
      })}
    </div>
  );
}

function BookingCard({ lang, prefill, onSent, onCancel, conversationId }: { lang: Lang; prefill: BookingPrefill; onSent: (resId: string) => void; onCancel: () => void; conversationId: string }) {
  const d = t(lang);
  const { state, dispatch } = useDemo();
  const def = nextFriday(state.baseDate, 6);
  const [checkIn, setIn] = useState(prefill.checkIn ?? def);
  const [checkOut, setOut] = useState(prefill.checkOut ?? addDays(def, 2));
  const [adults, setAdults] = useState(prefill.adults ?? 2);
  const [children, setChildren] = useState(prefill.children ?? 0);
  const options = ROOM_TYPES.filter((r) => fitsGuests(r.id, adults, children));
  const [typeId, setType] = useState<RoomTypeId>(prefill.typeId && fitsGuests(prefill.typeId, adults, children) ? prefill.typeId : options[0]?.id ?? "classic");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const valid = checkIn < checkOut && name.trim().length > 1 && phone.replace(/\D/g, "").length >= 6 && fitsGuests(typeId, adults, children);
  const q = checkIn < checkOut ? quote(typeId, checkIn, checkOut) : null;
  const free = checkIn < checkOut ? freeRooms(state, typeId, checkIn, checkOut).length : 0;
  useEffect(() => { if (!fitsGuests(typeId, adults, children) && options[0]) setType(options[0].id); }, [adults, children, typeId, options]);
  const inp = "h-10 w-full rounded-xl border border-pine/15 bg-white px-3 text-[14px] text-pine outline-none focus:border-pine/40";
  const lab = "mb-1 block text-[11.5px] font-semibold text-pine/60";
  return (
    <div className="rise-in w-full rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-pine/15">
      <div className="mb-3 flex items-center justify-between"><span className="font-serif text-lg font-semibold text-pine">{d.assistant.bookingCard}</span><button onClick={onCancel} className="text-pine/50" aria-label="Close"><Icon name="x" size={18} /></button></div>
      <div className="grid grid-cols-2 gap-2">
        <label><span className={lab}>{d.checkIn}</span><input type="date" className={inp} value={checkIn} min={state.baseDate} onChange={(e) => { setIn(e.target.value); if (e.target.value >= checkOut) setOut(addDays(e.target.value, 1)); }} /></label>
        <label><span className={lab}>{d.checkOut}</span><input type="date" className={inp} value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setOut(e.target.value)} /></label>
        <label><span className={lab}>{d.adults}</span><select className={inp} value={adults} onChange={(e) => setAdults(+e.target.value)}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label><span className={lab}>{d.children}</span><select className={inp} value={children} onChange={(e) => setChildren(+e.target.value)}>{[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label className="col-span-2"><span className={lab}>{d.room}</span><select className={inp} value={typeId} onChange={(e) => setType(e.target.value as RoomTypeId)}>{options.map((r) => <option key={r.id} value={r.id}>{r.name[lang]}</option>)}</select></label>
        <label className="col-span-2"><span className={lab}>{d.firstName}</span><input className={inp} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
        <label className="col-span-2"><span className={lab}>{d.phone}</span><input className={inp} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+374 …" /></label>
      </div>
      {q && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-[13px] text-pine">
          <span>{d.total}, {q.nights} {d.nights}<span className={cn("block text-[11.5px]", free ? "text-emerald-700" : "text-red-700")} style={{ color: free ? "#17845b" : "#c2412f" }}>{free ? d.availableNow : d.notAvailable}</span></span>
          <span className="tnum text-[16px] font-semibold">{amd(q.total)}</span>
        </div>
      )}
      <button disabled={!valid} onClick={() => {
        const [first, ...rest] = name.trim().split(" ");
        const ev = dispatch({ type: "inquiry.create", guest: { firstName: first, lastName: rest.join(" "), phone: phone.trim(), email: "", lang }, typeId, checkIn, checkOut, adults, children, requests: "", source: "assistant", conversationId });
        onSent(`r-${ev.id}`);
      }} className="mt-3 h-11 w-full rounded-xl bg-pine text-[14.5px] font-semibold text-cream disabled:opacity-40">{d.assistant.sendRequest}</button>
      <p className="mt-2 text-center text-[11px] text-pine/50">{lang === "hy" ? "Ցուցադրական կայք. մի մուտքագրեք իրական անձնական տվյալներ։" : lang === "ru" ? "Демо-сайт: не вводите реальные личные данные." : "Demo site: please don't enter real personal data."}</p>
    </div>
  );
}
