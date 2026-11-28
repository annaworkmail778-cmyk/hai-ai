"use client";
/*
 * Website chat (the restaurant's own channel): the guest writes, the message lands in the staff Unified Inbox.
 * Only configured low-risk intents (e.g. opening hours) get an automatic answer; everything else waits for staff.
 * The guest sees only the conversation started on this device.
 */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import type { Lang } from "@/lib/restaurant/types";
import { deviceKey } from "./store";

const T = {
  title: { hy: "Գրեք մեզ", ru: "Напишите нам", en: "Message us" },
  hint: { hy: "Հարցեր մենյուի, ամրագրման կամ միջոցառման մասին", ru: "Вопросы о меню, брони или мероприятии", en: "Questions about the menu, a booking or an event" },
  ph: { hy: "Ձեր հաղորդագրությունը…", ru: "Ваше сообщение…", en: "Your message…" },
  name: { hy: "Ձեր անունը", ru: "Ваше имя", en: "Your name" },
  wait: { hy: "Ստացվել է։ Մեր թիմը կպատասխանի այստեղ։", ru: "Получено. Команда ответит здесь.", en: "Received. Our team will reply here." },
  auto: { hy: "ավտոմատ պատասխան", ru: "автоответ", en: "automatic reply" },
  demo: { hy: "Ցուցադրական չատ · իրական անձնական տվյալներ մի գրեք", ru: "Демо-чат · не вводите реальные личные данные", en: "Demo chat · do not enter real personal data" },
} satisfies Record<string, Record<Lang, string>>;

export function ChatWidget({ lang }: { lang: Lang }) {
  const { state, dispatch } = useR();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => setKey(deviceKey()), []);
  const conv = key ? state.inbox.find((c) => c.channel === "webchat" && c.deviceKey === key) : undefined;
  const msgs = (conv?.messages ?? []).filter((m) => m.dir !== "note" && m.state !== "draft");
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length, open]);
  const send = () => {
    if (!text.trim() || !key) return;
    dispatch({ type: "inbox.receive", channel: "webchat", from: { name: conv?.customer.name ?? (name.trim() || "Web guest"), handle: `web:${key.slice(-6)}` }, text: text.trim().slice(0, 800), conversationId: conv?.id ?? `cv-web-${key}`, deviceKey: key });
    setText("");
  };
  const lastIn = msgs.length > 0 && msgs[msgs.length - 1].dir === "in";
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={T.title[lang]} className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[var(--rt-accent)] text-[var(--rt-bg)] shadow-lg">
        <Icon name={open ? "x" : "message"} size={22} />
      </button>
      {open && (
        <div className="fixed bottom-24 right-3 z-40 flex max-h-[70dvh] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[var(--rt-line)] bg-[var(--rt-bg)] text-[var(--rt-text)] shadow-2xl" role="dialog" aria-label={T.title[lang]}>
          <div className="border-b border-[var(--rt-line)] px-4 py-3"><div className="rt-serif text-[19px]">{T.title[lang]}</div><div className="text-[12.5px] text-[var(--rt-muted)]">{T.hint[lang]}</div></div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-[14px]">
            {msgs.map((m) => (
              <div key={m.id} className={cn("max-w-[85%] rounded-2xl px-3 py-2", m.dir === "in" ? "ml-auto bg-[var(--rt-accent)] text-[var(--rt-bg)]" : "bg-[var(--rt-card,rgba(127,127,127,0.12))]")}>
                {m.text}
                {m.state === "auto_delivered" || m.state === "auto_simulated" ? <div className="mt-1 text-[11px] opacity-60">{T.auto[lang]}</div> : null}
              </div>
            ))}
            {lastIn && <p className="text-[12px] text-[var(--rt-muted)]">{T.wait[lang]}</p>}
            <div ref={end} />
          </div>
          <div className="space-y-2 border-t border-[var(--rt-line)] p-3">
            {!conv && <input className="h-10 w-full rounded-xl border border-[var(--rt-line)] bg-transparent px-3 text-[14px]" placeholder={T.name[lang]} value={name} onChange={(e) => setName(e.target.value)} />}
            <div className="flex gap-2">
              <input className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--rt-line)] bg-transparent px-3 text-[14px]" placeholder={T.ph[lang]} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <button onClick={send} disabled={!text.trim()} className="grid size-11 place-items-center rounded-xl bg-[var(--rt-accent)] text-[var(--rt-bg)] disabled:opacity-40" aria-label="Send"><Icon name="send" size={18} /></button>
            </div>
            <p className="text-[11px] text-[var(--rt-faint)]">{T.demo[lang]}</p>
          </div>
        </div>
      )}
    </>
  );
}
