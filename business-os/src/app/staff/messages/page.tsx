"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { channelsFor, useMe, useReads } from "@/components/staff/shell";
import { Icon, type IconName } from "@/components/icons";
import { Avatar, Button, cn, Toggle } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { stamp } from "@/lib/format";
import { DEPT_LABEL, POSITION_LABEL } from "@/lib/hospitality-data";
import type { Channel } from "@/lib/types";

const KIND_ICON: Record<Channel["kind"], IconName> = { notice: "bell", department: "users", direct: "user", task: "tasks" };
const KIND_LABEL: Record<Channel["kind"], string> = { notice: "Հայտարարություններ", department: "Բաժիններ", direct: "Անձնական", task: "Առաջադրանքների քննարկում" };

export default function StaffMessages() {
  const { state, actor, dispatch } = useDemo();
  const { me, manager } = useMe();
  const { unread, urgent, markRead } = useReads();
  const sp = useSearchParams();
  const router = useRouter();
  const cid = sp.get("c");
  const [newDm, setNewDm] = useState(false);
  const mine = channelsFor(state, me);
  const title = (c: Channel) => c.kind === "direct" ? state.staff.find((s) => s.id === (c.members ?? []).find((m) => m !== actor))?.name ?? c.name : c.name;
  const last = (c: Channel) => state.messages.filter((m) => m.channelId === c.id).slice(-1)[0];
  const ch = mine.find((c) => c.id === cid);

  if (ch) return <Thread ch={ch} title={title(ch)} onBack={() => router.push("/staff/messages")} markRead={markRead} canNotice={manager} />;

  const groups = (["notice", "department", "direct", "task"] as const).map((k) => ({ k, list: mine.filter((c) => c.kind === k).sort((a, b) => (last(b)?.at ?? 0) - (last(a)?.at ?? 0)) })).filter((g) => g.list.length);
  return (
    <>
      <div className="mb-4 flex items-center justify-between"><h1 className="text-[22px] font-semibold">Հաղորդագրություններ</h1><Button size="sm" icon="plus" onClick={() => setNewDm(!newDm)}>Նոր</Button></div>
      {newDm && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-surface">
          {state.staff.filter((s) => s.id !== actor && s.active).map((s) => (
            <button key={s.id} onClick={() => { const id = `dm-${[actor, s.id].sort().join("-")}`; if (!state.channels.some((c) => c.id === id)) dispatch({ type: "channel.open", channel: { id, kind: "direct", name: s.name, members: [actor, s.id] } }); router.push(`/staff/messages?c=${id}`); }} className="flex w-full items-center gap-3 border-b border-line px-3.5 py-2.5 text-left last:border-0 hover:bg-paper">
              <Avatar initials={s.initials} size={30} /><span className="flex-1 text-[14px]">{s.name}<span className="block text-[12px] text-muted">{POSITION_LABEL[s.position]}</span></span>
            </button>
          ))}
        </div>
      )}
      {groups.map(({ k, list }) => (
        <section key={k} className="mb-5">
          <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{KIND_LABEL[k]}</h2>
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {list.map((c) => { const l = last(c); const n = unread(c.id); return (
              <li key={c.id}><button onClick={() => router.push(`/staff/messages?c=${c.id}`)} className="flex w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left last:border-0 hover:bg-paper">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", urgent(c.id) ? "bg-bad text-white" : "bg-paper")}><Icon name={KIND_ICON[c.kind]} size={18} /></span>
                <span className="min-w-0 flex-1"><span className={cn("block truncate text-[14.5px]", n ? "font-semibold" : "font-medium")}>{title(c)}{c.dept && c.kind === "department" ? <span className="font-normal text-muted"> · {DEPT_LABEL[c.dept]}</span> : null}</span><span className="block truncate text-[12.5px] text-muted">{l ? `${l.urgent ? "❗ " : l.handover ? "↪ " : ""}${state.staff.find((s) => s.id === l.authorId)?.name.split(" ")[0] ?? ""}: ${l.text}` : "Դեռ հաղորդագրություն չկա"}</span></span>
                <span className="flex flex-col items-end gap-1">{l && <span className="text-[11px] text-faint">{stamp(l.at, state.baseDate).replace("Այսօր ", "")}</span>}{n > 0 && <span className={cn("min-w-5 rounded-full px-1.5 text-center text-[11px] font-bold leading-5 text-white", urgent(c.id) ? "bg-bad" : "bg-signal")}>{n}</span>}</span>
              </button></li>); })}
          </ul>
        </section>
      ))}
    </>
  );
}

function Thread({ ch, title, onBack, markRead, canNotice }: { ch: Channel; title: string; onBack: () => void; markRead: (id: string) => void; canNotice: boolean }) {
  const { state, actor, dispatch } = useDemo();
  const [text, setText] = useState("");
  const [urgentF, setUrgent] = useState(false);
  const [handover, setHandover] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const msgs = state.messages.filter((m) => m.channelId === ch.id);
  useEffect(() => { markRead(ch.id); end.current?.scrollIntoView({ block: "end" }); }, [ch.id, msgs.length, markRead]);
  const readOnly = ch.kind === "notice" && !canNotice;
  const ref = ch.ref?.kind === "service" ? state.services.find((s) => s.id === ch.ref!.id) : undefined;
  return (
    <div className="flex min-h-[calc(100dvh-170px)] flex-col">
      <div className="mb-3 flex items-center gap-2"><button onClick={onBack} className="grid size-9 place-items-center rounded-lg hover:bg-surface" aria-label="Հետ"><Icon name="chevronLeft" size={20} /></button><div className="min-w-0"><div className="truncate text-[16px] font-semibold">{title}</div><div className="text-[12px] text-muted">{ch.kind === "task" ? `Առաջադրանքի քննարկում${ref ? ` · ${({ new: "նոր", assigned: "նշանակված", in_progress: "ընթացքում", done: "կատարված", cancelled: "չեղարկված" })[ref.status]}` : ""}` : ch.kind === "department" ? "Բաժնի ալիք" : ch.kind === "notice" ? "Միայն ղեկավարները կարող են գրել" : "Անձնական"}</div></div></div>
      <div className="flex-1 space-y-2.5">
        {msgs.length === 0 && <div className="py-10 text-center text-[13px] text-muted">Սկսեք զրույցը</div>}
        {msgs.map((m) => { const mine = m.authorId === actor; const a = state.staff.find((s) => s.id === m.authorId); return (
          <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
            {!mine && <Avatar initials={a?.initials ?? "?"} size={28} />}
            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14px]", mine ? "bg-ink text-white" : "border border-line bg-surface", m.urgent && "ring-2 ring-bad")}>
              {!mine && <div className="mb-0.5 text-[11.5px] font-semibold text-muted">{a?.name}</div>}
              {(m.urgent || m.handover) && <div className={cn("mb-1 text-[11px] font-bold uppercase tracking-wider", m.urgent ? "text-bad" : mine ? "text-white/70" : "text-info")}>{m.urgent ? "Շտապ" : "Հերթափոխի փոխանցում"}</div>}
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className={cn("mt-1 text-[10.5px]", mine ? "text-white/60" : "text-faint")}>{stamp(m.at, state.baseDate)}</div>
            </div>
          </div>); })}
        <div ref={end} />
      </div>
      {readOnly ? <div className="mt-4 rounded-xl bg-surface p-3 text-center text-[12.5px] text-muted">Հայտարարությունների ալիքում գրում են միայն ղեկավարները</div> : (
        <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; dispatch({ type: "msg.send", channelId: ch.id, text, urgent: urgentF || undefined, handover: handover || undefined }); setText(""); setUrgent(false); setHandover(false); }} className="sticky bottom-[72px] mt-4 rounded-2xl border border-line bg-surface p-2.5 shadow-[var(--shadow-pop)]">
          <div className="flex gap-2"><textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Գրել հաղորդագրություն…" className="min-h-10 flex-1 resize-none rounded-xl bg-paper px-3 py-2.5 text-[14px] outline-none" /><button className="grid size-10 place-items-center rounded-xl bg-ink text-white" aria-label="Ուղարկել"><Icon name="send" size={17} /></button></div>
          <div className="mt-2 flex flex-wrap gap-4 px-1 text-[12.5px]"><Toggle on={urgentF} onChange={setUrgent} label="Շտապ" />{ch.kind === "department" && <Toggle on={handover} onChange={setHandover} label="Հերթափոխի փոխանցում" />}</div>
        </form>
      )}
    </div>
  );
}
