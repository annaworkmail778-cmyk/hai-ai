"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { ChannelIcon, CHANNEL_LABEL } from "@/components/admin/channel-icon";
import { Icon } from "@/components/icons";
import { Avatar, Badge, Button, cn, Select, Textarea } from "@/components/ui";
import { draftReply, SAVED_REPLIES } from "@/lib/ai/inbox-ai";
import { useDemo } from "@/lib/client/demo-store";
import { useNow } from "@/lib/client/use-now";
import { ago, stamp, STATUS_LABEL } from "@/lib/format";
import { DEPT_LABEL } from "@/lib/hospitality-data";
import type { Dept, InboxThread, MsgChannel, ThreadStatus } from "@/lib/types";

const ST: Record<ThreadStatus, [string, "warn" | "info" | "neutral" | "ok"]> = { new: ["Նոր", "warn"], open: ["Բաց", "info"], pending: ["Սպասման մեջ", "neutral"], resolved: ["Լուծված", "ok"] };
const SLA_MIN = 15;
const lastVisible = (t: InboxThread) => t.messages.filter((m) => m.dir === "in" || m.dir === "out").slice(-1)[0];
const awaiting = (t: InboxThread) => t.status !== "resolved" && lastVisible(t)?.dir === "in";

export default function Inbox() {
  const { state } = useDemo();
  const sp = useSearchParams();
  const router = useRouter();
  const now = useNow(30000);
  const [q, setQ] = useState("");
  const [ch, setCh] = useState<MsgChannel | "all">("all");
  const [view, setView] = useState<"open" | "mine" | "awaiting" | "resolved" | "all">("open");
  const { actor } = useDemo();
  const sel = sp.get("t");
  const list = useMemo(() => state.inbox
    .filter((t) => (ch === "all" || t.channel === ch))
    .filter((t) => view === "all" ? true : view === "resolved" ? t.status === "resolved" : view === "mine" ? t.assigneeId === actor && t.status !== "resolved" : view === "awaiting" ? awaiting(t) : t.status !== "resolved")
    .filter((t) => !q.trim() || `${t.contact.name} ${t.contact.handle} ${t.messages.map((m) => m.text).join(" ")} ${t.tags.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(awaiting(b)) - Number(awaiting(a)) || (b.priority === "urgent" || b.priority === "high" ? 1 : 0) - (a.priority === "urgent" || a.priority === "high" ? 1 : 0) || b.lastInboundAt - a.lastInboundAt), [state.inbox, ch, view, q, actor]);
  const t = state.inbox.find((x) => x.id === sel);
  const waiting = state.inbox.filter(awaiting);
  const responded = state.inbox.filter((x) => x.firstResponseAt);
  const avgFirst = responded.length ? Math.round(responded.reduce((a, x) => a + (x.firstResponseAt! - x.createdAt), 0) / responded.length / 60000) : 0;
  const webchats = state.conversations.filter((c) => c.status !== "resolved").length;
  return (
    <>
      <PageTitle title="Միասնական մուտքային" sub={<span className="flex flex-wrap items-center gap-2">WhatsApp, Instagram, Messenger, էլ․ փոստ, կայքի չատ և Booking.com՝ մեկ տեղում <Badge tone="warn">Ալիքները սիմուլյացված են · միացված չեն</Badge></span>}
        right={<div className="flex gap-2 text-[12.5px]"><span className="rounded-lg bg-surface px-3 py-1.5 ring-1 ring-line"><b className="tnum">{waiting.length}</b> սպասում է պատասխանի</span><span className="rounded-lg bg-surface px-3 py-1.5 ring-1 ring-line" title="Միջին ժամանակը մինչև առաջին պատասխանը (բոլոր պատասխանված զրույցներ)">Առաջին պատասխան՝ <b className="tnum">{avgFirst} ր</b></span></div>} />
      <div className="grid min-h-[70dvh] overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_300px]">
        <aside className={cn("flex min-h-0 flex-col border-line lg:border-r", t && "hidden lg:flex")}>
          <div className="space-y-2 border-b border-line p-3">
            <div className="relative"><Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Որոնել անուն, տեքստ, պիտակ…" className="h-9 w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] outline-none ring-1 ring-line focus:ring-ink/30" /></div>
            <div className="scrollbar-none flex gap-1 overflow-x-auto text-[12px]">
              {([["open", "Բաց"], ["awaiting", "Սպասում են"], ["mine", "Իմը"], ["resolved", "Լուծված"], ["all", "Բոլորը"]] as const).map(([k, l]) => <button key={k} onClick={() => setView(k)} className={cn("shrink-0 rounded-md px-2.5 py-1 font-medium", view === k ? "bg-ink text-white" : "text-ink-2 hover:bg-paper")}>{l}</button>)}
            </div>
            <div className="scrollbar-none flex gap-1 overflow-x-auto">
              <button onClick={() => setCh("all")} className={cn("shrink-0 rounded-md px-2 py-1 text-[12px]", ch === "all" ? "bg-paper font-semibold" : "text-muted")}>Բոլոր ալիքները</button>
              {(Object.keys(CHANNEL_LABEL) as MsgChannel[]).map((c) => <button key={c} onClick={() => setCh(c)} title={CHANNEL_LABEL[c]} className={cn("grid size-7 shrink-0 place-items-center rounded-md", ch === c ? "bg-paper ring-1 ring-ink/20" : "opacity-70 hover:opacity-100")}><ChannelIcon c={c} size={16} /></button>)}
            </div>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
            {list.length === 0 && <li className="p-8 text-center text-[13px] text-muted">Զրույցներ չկան</li>}
            {list.map((x) => {
              const lm = lastVisible(x);
              const late = awaiting(x) && now - x.lastInboundAt > SLA_MIN * 60000;
              return (
                <li key={x.id}><button onClick={() => router.push(`/admin/inbox?t=${x.id}`)} className={cn("flex w-full gap-3 px-3 py-3 text-left transition hover:bg-paper", sel === x.id && "bg-paper", awaiting(x) && "bg-signal-soft/30")}>
                  <div className="relative"><Avatar initials={x.contact.name.slice(0, 2).toUpperCase()} size={36} /><span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-surface ring-1 ring-line"><ChannelIcon c={x.channel} size={12} /></span></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><span className={cn("truncate text-[13.5px]", awaiting(x) ? "font-semibold" : "font-medium")}>{x.contact.name}</span>{(x.priority === "high" || x.priority === "urgent") && <span className="size-1.5 shrink-0 rounded-full bg-bad" title="Բարձր առաջնահերթություն" />}<span className="ml-auto shrink-0 text-[11px] text-faint">{ago(lm?.at ?? x.createdAt, now)}</span></div>
                    <div className="truncate text-[12.5px] text-muted">{lm?.dir === "out" ? "↩ " : ""}{lm?.text}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1"><Badge tone={ST[x.status][1]}>{ST[x.status][0]}</Badge>{late && <Badge tone="bad">SLA {SLA_MIN} ր ✕</Badge>}{x.escalated && <Badge tone="violet">Ղեկավար</Badge>}{x.tags.slice(0, 2).map((g) => <span key={g} className="rounded bg-paper px-1.5 text-[11px] text-ink-2">#{g}</span>)}</div>
                  </div>
                </button></li>
              );
            })}
          </ul>
          {webchats > 0 && <Link href="/admin/assistant" className="border-t border-line px-3 py-2.5 text-[12px] text-info">Կայքի AI օգնականի {webchats} ակտիվ զրույց →</Link>}
        </aside>
        {t ? <Thread t={t} onBack={() => router.push("/admin/inbox")} now={now} /> : <div className="hidden place-items-center p-10 text-center text-[13.5px] text-muted lg:grid xl:col-span-2"><div><Icon name="message" size={28} className="mx-auto mb-2 text-faint" />Ընտրեք զրույց ձախ ցուցակից</div></div>}
      </div>
    </>
  );
}

function Thread({ t, onBack, now }: { t: InboxThread; onBack: () => void; now: number }) {
  const { state, dispatch, actor } = useDemo();
  const [text, setText] = useState("");
  const [note, setNote] = useState(false);
  const [usedDraft, setUsedDraft] = useState(false);
  const lastIn = [...t.messages].reverse().find((m) => m.dir === "in");
  const draft = lastIn ? draftReply(state, lastIn.text, t.contact.name.split(" ")[0]) : null;
  const guest = state.guests.find((g) => g.id === t.guestId);
  const res = state.reservations.find((r) => r.id === t.reservationId) ?? (guest ? [...state.reservations].reverse().find((r) => r.guestId === guest.id) : undefined);
  const me = state.staff.find((s) => s.id === actor);
  const send = () => {
    if (!text.trim()) return;
    dispatch(note ? { type: "inbox.note", threadId: t.id, text } : { type: "inbox.reply", threadId: t.id, text, ai: usedDraft });
    setText(""); setUsedDraft(false);
  };
  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <button onClick={onBack} className="grid size-8 place-items-center rounded-lg hover:bg-paper lg:hidden" aria-label="Հետ"><Icon name="chevronLeft" size={18} /></button>
          <ChannelIcon c={t.channel} size={18} />
          <div className="mr-auto min-w-0"><div className="truncate text-[15px] font-semibold">{t.contact.name}</div><div className="truncate text-[12px] text-muted">{CHANNEL_LABEL[t.channel]} · {t.contact.handle} · {t.contact.lang.toUpperCase()}</div></div>
          <Select className="h-8 max-w-40 text-[12.5px]" value={t.status} onChange={(e) => dispatch({ type: "inbox.status", threadId: t.id, status: e.target.value as ThreadStatus })}>{(Object.keys(ST) as ThreadStatus[]).map((s) => <option key={s} value={s}>{ST[s][0]}</option>)}</Select>
          {!t.escalated && <Button size="sm" variant="ghost" icon="alert" onClick={() => dispatch({ type: "inbox.escalate", threadId: t.id, reason: "Պահանջվում է ղեկավարի որոշում" })}>Ղեկավարին</Button>}
        </header>
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-paper/50 p-4">
          {t.messages.map((m) => m.dir === "system" ? <div key={m.id} className="text-center text-[11.5px] text-muted">— {m.text} —</div> : (
            <div key={m.id} className={cn("flex", m.dir !== "in" && "justify-end")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px]", m.dir === "in" ? "bg-surface ring-1 ring-line" : m.dir === "note" ? "border border-dashed border-warn/60 bg-warn-soft text-ink" : "bg-ink text-white")}>
                {m.dir === "note" && <div className="mb-0.5 text-[10.5px] font-bold uppercase tracking-wider text-warn">Ներքին նշում · հյուրը չի տեսնում</div>}
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={cn("mt-1 flex items-center gap-1.5 text-[10.5px]", m.dir === "out" ? "text-white/60" : "text-faint")}>{stamp(m.at, state.baseDate)}{m.by && m.by !== "AI" ? ` · ${state.staff.find((s) => s.id === m.by)?.name ?? m.by}` : ""}{m.ai && " · AI սևագիր"}{m.dir === "out" && " · սիմուլյացիա, չի ուղարկվել"}</div>
              </div>
            </div>
          ))}
        </div>
        {draft && t.status !== "resolved" && (
          <div className="border-t border-line bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <Icon name="sparkles" size={15} className="text-signal" /><b>AI սևագիր</b>
              <Badge tone="neutral">{draft.lang.toUpperCase()}</Badge>
              <Badge tone="info">{draft.intents.join(", ")}</Badge>
              <Badge tone={draft.autoAllowed ? "ok" : "bad"}>{draft.autoAllowed ? "Ցածր ռիսկ" : "Պահանջում է հաստատում"}</Badge>
              <span className="text-muted">{draft.reason}</span>
            </div>
            <p className="mt-2 rounded-lg bg-paper p-2.5 text-[13px]">{draft.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <span>Աղբյուրներ՝ {draft.sources.length ? draft.sources.join(", ") : "չկան (հաստատված պատասխան չկա)"}</span>
              <Button size="sm" className="ml-auto" onClick={() => { setText(draft.text); setNote(false); setUsedDraft(true); }}>Խմբագրել</Button>
              <Button size="sm" variant="primary" icon="send" onClick={() => dispatch({ type: "inbox.reply", threadId: t.id, text: draft.text, ai: true })}>Հաստատել և ուղարկել</Button>
            </div>
          </div>
        )}
        <div className="border-t border-line p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <div className="flex rounded-md bg-paper p-0.5 text-[12px]"><button onClick={() => setNote(false)} className={cn("rounded px-2.5 py-1", !note && "bg-surface font-semibold shadow-sm")}>Պատասխան</button><button onClick={() => setNote(true)} className={cn("rounded px-2.5 py-1", note && "bg-surface font-semibold shadow-sm")}>Ներքին նշում</button></div>
            {SAVED_REPLIES.map((r) => <button key={r.id} onClick={() => { setText(r.text[t.contact.lang]); setNote(false); }} className="rounded-md border border-line px-2 py-1 text-[11.5px] text-ink-2 hover:bg-paper">{r.title}</button>)}
          </div>
          <div className="flex gap-2"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={note ? "Նշում թիմի համար…" : `Պատասխան (${t.contact.lang.toUpperCase()})…`} className={cn("min-h-16 flex-1", note && "bg-warn-soft/40")} /><Button variant={note ? "secondary" : "primary"} icon="send" disabled={!text.trim()} onClick={send} className="self-end">{note ? "Պահել" : "Ուղարկել"}</Button></div>
          <p className="mt-1.5 text-[11px] text-faint">Ցուցադրական․ ուղարկված պատասխանը պահվում է միայն Hotel OS-ում և իրական ալիքով չի գնում։</p>
        </div>
      </section>
      <aside className="hidden min-h-0 space-y-4 overflow-y-auto border-l border-line p-4 text-[13px] xl:block">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">Կոնտակտ</div>
          <div className="font-semibold">{guest ? `${guest.firstName} ${guest.lastName}` : t.contact.name}</div>
          <div className="text-muted">{guest ? `${guest.tags.join(" · ") || "Հյուր"}` : "Նոր կոնտակտ (lead)"}</div>
          {guest && <Link href="/admin/guests" className="text-[12px] text-info">Հյուրի պրոֆիլ →</Link>}
        </div>
        {res && <div className="rounded-lg bg-paper p-3"><div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Ամրագրում</div><Link href={`/admin/reservations?open=${res.id}`} className="font-semibold text-info">{res.code}</Link><div className="text-muted">{res.checkIn} → {res.checkOut} · {STATUS_LABEL[res.status]}{res.roomId ? ` · ${res.roomId}` : ""}</div></div>}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Նշանակում</div>
          <Select value={t.assigneeId ?? ""} onChange={(e) => dispatch({ type: "inbox.assign", threadId: t.id, assigneeId: e.target.value || null })}><option value="">Չնշանակված</option>{state.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Select value={t.dept} onChange={(e) => dispatch({ type: "inbox.assign", threadId: t.id, assigneeId: t.assigneeId, dept: e.target.value as Dept })}>{(["reception", "housekeeping", "maintenance", "spa", "restaurant", "management"] as Dept[]).map((d) => <option key={d} value={d}>{DEPT_LABEL[d]}</option>)}</Select>
          {me && t.assigneeId !== me.id && <Button size="sm" className="w-full" onClick={() => dispatch({ type: "inbox.assign", threadId: t.id, assigneeId: me.id })}>Վերցնել ինձ</Button>}
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">Պիտակներ</div>
          <div className="flex flex-wrap gap-1">{["ամրագրում", "վճարում", "բողոք", "տեխնիկական", "VIP", "սպա"].map((g) => <button key={g} onClick={() => dispatch({ type: "inbox.tag", threadId: t.id, tag: g, on: !t.tags.includes(g) })} className={cn("rounded-md px-2 py-0.5 text-[11.5px]", t.tags.includes(g) ? "bg-ink text-white" : "bg-paper text-ink-2")}>#{g}</button>)}</div>
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">Գործողություններ</div>
          <div className="grid gap-1.5">
            <Button size="sm" icon="tasks" onClick={() => dispatch({ type: "staffTask.create", title: `Զրույց՝ ${t.contact.name}. ${lastIn?.text.slice(0, 60) ?? ""}`, detail: `Միասնական մուտք · ${CHANNEL_LABEL[t.channel]}`, assigneeId: t.assigneeId, priority: t.priority === "urgent" ? "urgent" : t.priority === "high" ? "high" : "normal", due: state.baseDate })}>Ստեղծել առաջադրանք</Button>
            <Link href={`/admin/reservations?new=1`} className="w-full"><Button size="sm" icon="calendar" className="w-full">Նոր ամրագրման հարցում</Button></Link>
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">Աուդիտ</div>
          <ol className="space-y-1 border-l border-line pl-3 text-[11.5px] text-muted">{t.audit.slice(-8).map((a, i) => <li key={i}>{a.text} · {a.by} · {stamp(a.at, state.baseDate)}</li>)}</ol>
          {t.firstResponseAt && <div className="mt-2 text-[11.5px] text-muted">Առաջին պատասխանը՝ {Math.round((t.firstResponseAt - t.createdAt) / 60000)} րոպեում</div>}
          {!t.firstResponseAt && <div className="mt-2 text-[11.5px] text-bad">Պատասխան չկա արդեն {Math.round((now - t.createdAt) / 60000)} րոպե</div>}
        </div>
      </aside>
    </>
  );
}
