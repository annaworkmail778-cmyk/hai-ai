"use client";
/*
 * Unified Communications Inbox. Every channel lands in one list; AI (deterministic, rule-based in this demo) detects
 * language and intent and prepares a draft with the facts it used. Staff approve, edit or discard. Only intents the
 * manager enabled AND classified low-risk are answered automatically. Third-party channels are simulated: nothing is sent.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Guard, hm, mins, useNow } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Modal, SimBadge, Textarea, Toggle, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { CHANNELS, INTENT_HY, LINK_LABEL } from "@/lib/restaurant/channels";
import { INTENT_RISK, type Intent } from "@/lib/restaurant/nlp";
import type { Conversation, InboxChannel } from "@/lib/restaurant/types";

const RISK: Record<"low" | "approval" | "escalate", { label: string; tone: "ok" | "warn" | "bad" }> = { low: { label: "Ցածր ռիսկ", tone: "ok" }, approval: { label: "Պահանջում է հաստատում", tone: "warn" }, escalate: { label: "Մենեջերին", tone: "bad" } };
const ST: Record<Conversation["status"], string> = { new: "Նոր", open: "Բաց", pending: "Սպասում է հյուրին", resolved: "Լուծված" };
const SAVED = ["Շնորհակալություն, փոխանցում եմ մենեջերին և կպատասխանենք մինչև 30 րոպե։", "Ձեր ամրագրումը հաստատված է։ Սպասում ենք Ձեզ։", "Ցավոք, այդ ժամին ազատ սեղան չկա։ Կարող ենք առաջարկել 30 րոպե ուշ։"];
const SAMPLES: { channel: InboxChannel; name: string; text: string }[] = [
  { channel: "whatsapp", name: "Արամ Ս.", text: "Բարև, այսօր երեկոյան 4 հոգու համար սեղան կա՞ ժամը 8-ին" },
  { channel: "instagram", name: "maria.travels", text: "Hi! What time do you open on Sunday?" },
  { channel: "messenger", name: "Олег П.", text: "Здравствуйте, у моей жены аллергия на орехи, можно ли у вас поужинать?" },
  { channel: "email", name: "events@company.example", text: "We would like a private dinner for 14 people next Friday. Can you send a price?" },
];

export default function Inbox() {
  const { state, dispatch, can } = useR();
  const now = useNow(15000);
  const sp = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "high" | "resolved" | InboxChannel>("active");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [settings, setSettings] = useState(false);
  const [sim, setSim] = useState(false);
  const id = sp.get("c");
  const setId = (x: string | null) => router.replace(x ? `/r/admin/inbox?c=${x}` : "/r/admin/inbox", { scroll: false });
  const list = state.inbox.filter((c) => filter === "active" ? c.status !== "resolved" : filter === "high" ? c.priority === "high" && c.status !== "resolved" : filter === "resolved" ? c.status === "resolved" : c.channel === filter)
    .sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high") || (b.messages.at(-1)?.at ?? 0) - (a.messages.at(-1)?.at ?? 0));
  const c = id ? state.inbox.find((x) => x.id === id) : undefined;
  const open = (x: Conversation) => { setId(x.id); setEditing(false); setText(""); if (x.unread || x.status === "new") dispatch({ type: "inbox.read", conversationId: x.id }); };
  const canSendRisk = (r?: "low" | "approval" | "escalate") => r !== "escalate" || can("inbox.settings");
  const unanswered = state.inbox.filter((x) => x.status !== "resolved" && x.messages.at(-1)?.dir === "in");

  return (
    <Guard perm="inbox.use">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Հաղորդագրություններ</h1><p className="mt-1 text-[13.5px] text-muted">Բոլոր ալիքները մեկ տեղում։ AI-ն պատրաստում է նախագիծ, ուղարկում է աշխատակիցը։ Արտաքին ալիքները միացված չեն՝ սիմուլյացիա։</p></div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" icon="play" onClick={() => setSim(true)}>Սիմուլյացնել մուտքային</Button>
          {can("inbox.settings") && <Button variant="secondary" icon="filter" onClick={() => setSettings(true)}>Ավտոպատասխան</Button>}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 text-[12.5px]">
        <Badge tone={unanswered.length ? "signal" : "ok"}>Սպասում են պատասխանի՝ {unanswered.length}</Badge>
        <Badge tone="bad">Բարձր առաջնահերթություն՝ {state.inbox.filter((x) => x.priority === "high" && x.status !== "resolved").length}</Badge>
        {(Object.keys(CHANNELS) as InboxChannel[]).map((k) => <Badge key={k} tone={CHANNELS[k].state === "in_product" ? "ok" : "neutral"}>{CHANNELS[k].name}՝ {LINK_LABEL[CHANNELS[k].state]}</Badge>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card pad={false} className={cn(c && "hidden lg:block")}>
          <div className="flex flex-wrap gap-1 border-b border-line p-2">{([["active", "Բաց"], ["high", "Կարևոր"], ["resolved", "Լուծված"], ...(Object.keys(CHANNELS) as InboxChannel[]).map((k) => [k, CHANNELS[k].name])] as [typeof filter, string][]).map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={cn("h-8 rounded-lg px-2.5 text-[12.5px] font-medium", filter === k ? "bg-ink text-white" : "bg-paper")}>{l}</button>)}</div>
          <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
            {list.map((x) => { const last = x.messages.filter((m) => m.dir !== "note").at(-1); return (
              <li key={x.id}><button onClick={() => open(x)} className={cn("flex w-full gap-3 px-3 py-3 text-left hover:bg-paper", c?.id === x.id && "bg-signal-soft/40")}>
                <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", x.unread ? "bg-signal" : "bg-transparent")} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5"><span className="truncate text-[13.5px] font-semibold">{x.customer.name}</span>{x.priority === "high" && <Icon name="alert" size={13} className="text-bad" />}<span className="ml-auto shrink-0 text-[11.5px] text-muted">{last ? hm(last.at) : ""}</span></span>
                  <span className="mt-0.5 flex gap-1.5 text-[11.5px] text-muted"><span>{CHANNELS[x.channel].name}</span>·<span>{x.lang.toUpperCase()}</span>·<span>{ST[x.status]}</span></span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-ink-2">{last?.dir === "out" ? "↩ " : ""}{last?.text}</span>
                </span>
              </button></li>
            ); })}
            {!list.length && <li className="p-6 text-center text-[13px] text-muted">Դատարկ է</li>}
          </ul>
        </Card>

        {c ? (
          <Card pad={false}>
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <button className="grid size-8 place-items-center rounded-lg hover:bg-paper lg:hidden" onClick={() => setId(null)} aria-label="Հետ"><Icon name="chevronLeft" size={16} /></button>
              <div className="min-w-0"><div className="text-[15px] font-semibold">{c.customer.name}</div><div className="text-[12px] text-muted">{CHANNELS[c.channel].name} · {c.customer.handle} · լեզու՝ {c.lang.toUpperCase()}{c.firstReplyAt ? ` · առաջին պատասխան՝ ${mins(c.firstInAt, c.firstReplyAt)} ր` : ""}</div></div>
              {CHANNELS[c.channel].state !== "in_product" && <SimBadge />}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <select value={c.assigneeId ?? ""} onChange={(e) => dispatch({ type: "inbox.assign", conversationId: c.id, assigneeId: e.target.value })} className="h-9 rounded-lg border border-line-2 bg-surface px-2 text-[13px]" aria-label="Պատասխանատու"><option value="" disabled>Պատասխանատու…</option>{state.staff.filter((s) => ["owner", "manager", "host"].includes(s.role)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <select value={c.status} onChange={(e) => dispatch({ type: "inbox.status", conversationId: c.id, status: e.target.value as Conversation["status"] })} className="h-9 rounded-lg border border-line-2 bg-surface px-2 text-[13px]" aria-label="Կարգավիճակ">{(Object.keys(ST) as Conversation["status"][]).map((k) => <option key={k} value={k}>{ST[k]}</option>)}</select>
              </div>
            </div>
            {c.tags.length > 0 && <div className="flex flex-wrap gap-1 px-4 pt-2">{c.tags.map((t) => <Badge key={t}>{INTENT_HY[t as Intent] ?? t}</Badge>)}</div>}
            <div className="max-h-[48vh] space-y-2 overflow-y-auto px-4 py-3">
              {c.messages.map((m) => (
                <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-[13.5px]", m.dir === "in" ? "bg-paper" : m.dir === "note" ? "mx-auto border border-dashed border-warn/50 bg-warn-soft/40 text-[12.5px]" : "ml-auto bg-ink text-white")}>
                  {m.dir === "note" && <div className="text-[11px] font-semibold text-warn">Ներքին նշում · {m.author}</div>}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className={cn("mt-1 text-[11px]", m.dir === "out" ? "text-white/60" : "text-muted")}>{hm(m.at)}{m.dir !== "note" ? ` · ${m.author}` : ""}{m.state === "simulated" || m.state === "auto_simulated" ? " · սիմուլյացիա, չի ուղարկվել" : m.state === "delivered" || m.state === "auto_delivered" ? " · առաքված (կայք)" : ""}{m.state?.startsWith("auto") ? " · ավտոմատ" : ""}</div>
                </div>
              ))}
            </div>
            {c.draft && !editing && (
              <div className="mx-4 mb-3 rounded-xl border border-violet/40 bg-violet-soft/40 p-3">
                <div className="flex flex-wrap items-center gap-2"><Icon name="sparkles" size={15} className="text-violet" /><span className="text-[13px] font-semibold">AI նախագիծ</span><Badge>{INTENT_HY[c.draft.intent as Intent] ?? c.draft.intent}</Badge><Badge tone={RISK[c.draft.risk].tone}>{RISK[c.draft.risk].label}</Badge></div>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px]">{c.draft.text}</p>
                {c.draft.facts.length > 0 && <div className="mt-2 text-[12px] text-muted">Օգտագործված փաստեր՝ {c.draft.facts.join(" · ")}</div>}
                {c.draft.risk === "escalate" && <p className="mt-2 text-[12.5px] font-medium text-bad">Ալերգիա, բողոք, զեղչ կամ մենեջերի պահանջ․ ուղարկել կարող է միայն մենեջերը։</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="ok" icon="send" disabled={!canSendRisk(c.draft.risk)} onClick={() => dispatch({ type: "inbox.send", conversationId: c.id, text: c.draft!.text, approved: true, fromDraft: true })}>Հաստատել և ուղարկել</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setText(c.draft!.text); setEditing(true); }}>Խմբագրել</Button>
                </div>
              </div>
            )}
            <div className="space-y-2 border-t border-line p-3">
              <div className="flex flex-wrap gap-1.5">{SAVED.map((s) => <button key={s} onClick={() => { setText(s); setEditing(true); }} className="max-w-full truncate rounded-lg bg-paper px-2 py-1 text-[12px]">{s.slice(0, 42)}…</button>)}</div>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Պատասխան…" />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" icon="send" disabled={!text.trim() || (c.draft && editing ? !canSendRisk(c.draft.risk) : false)} onClick={() => { dispatch({ type: "inbox.send", conversationId: c.id, text, approved: true, fromDraft: editing }); setText(""); setEditing(false); }}>Ուղարկել</Button>
                <span className="text-[12px] text-muted">{CHANNELS[c.channel].state === "in_product" ? "Կառաքվի կայքի չատում" : "Կգրանցվի որպես սիմուլյացիա․ իրական հաղորդագրություն չի ուղարկվի"}</span>
                <div className="ml-auto flex gap-1.5"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ներքին նշում" className="h-9 w-40 rounded-lg border border-line-2 px-2 text-[13px]" /><Button size="sm" variant="secondary" disabled={!note.trim()} onClick={() => { dispatch({ type: "inbox.note", conversationId: c.id, text: note }); setNote(""); }}>Նշում</Button></div>
              </div>
              {CHANNELS[c.channel].limits.length > 0 && <p className="text-[11.5px] text-faint">{CHANNELS[c.channel].limits.join(" · ")}</p>}
            </div>
          </Card>
        ) : (
          <Card className="hidden lg:block"><CardHead title="Ալիքների միացում" sub="Ինչ է պետք իրական միացման համար" icon="bolt" />
            <ul className="space-y-3">{(Object.keys(CHANNELS) as InboxChannel[]).map((k) => <li key={k} className="rounded-xl border border-line p-3"><div className="flex items-center gap-2"><span className="text-[14px] font-semibold">{CHANNELS[k].name}</span><Badge tone={CHANNELS[k].state === "in_product" ? "ok" : "neutral"} className="ml-auto">{LINK_LABEL[CHANNELS[k].state]}</Badge></div>{CHANNELS[k].needs.length > 0 && <ul className="mt-1 list-disc pl-5 text-[12.5px] text-muted">{CHANNELS[k].needs.map((n) => <li key={n}>{n}</li>)}</ul>}<p className="mt-1 text-[12px] text-faint">{CHANNELS[k].limits.join(" · ")}</p></li>)}</ul>
          </Card>
        )}
      </div>

      <Modal open={settings} onClose={() => setSettings(false)} title="Ավտոմատ պատասխաններ" footer={<Button variant="primary" onClick={() => setSettings(false)}>Պատրաստ է</Button>}>
        <p className="mb-3 text-[13px] text-muted">Ավտոմատ պատասխանը թույլատրված է միայն ցածր ռիսկի հարցերի համար։ Ալերգիա, բողոք, ամրագրում, գին և մենեջերի պահանջ միշտ անցնում են աշխատակցի միջոցով։</p>
        <ul className="space-y-2">{(Object.keys(INTENT_RISK) as Intent[]).filter((i) => i !== "other").map((i) => {
          const allowed = ["hours", "menu", "thanks"].includes(i) && INTENT_RISK[i] === "low";
          const on = state.inboxSettings.autoReplyIntents.includes(i);
          return <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2"><span className="flex-1 text-[13.5px]">{INTENT_HY[i]}</span><Badge tone={RISK[INTENT_RISK[i]].tone}>{RISK[INTENT_RISK[i]].label}</Badge><Toggle on={on} disabled={!allowed} label={INTENT_HY[i]} onChange={(v) => dispatch({ type: "inbox.autoreply", intents: v ? [...state.inboxSettings.autoReplyIntents, i] : state.inboxSettings.autoReplyIntents.filter((x) => x !== i) })} /></li>;
        })}</ul>
      </Modal>
      <Modal open={sim} onClose={() => setSim(false)} title="Սիմուլյացնել մուտքային հաղորդագրություն">
        <p className="mb-3 text-[13px] text-muted">Ցուցադրական․ ստեղծում է մուտքային հաղորդագրություն, կարծես այն եկել է նշված ալիքից։ Իրական ալիքին ոչինչ չի միանում։</p>
        <ul className="space-y-2">{SAMPLES.map((x) => <li key={x.text}><button className="w-full rounded-xl border border-line p-3 text-left hover:border-ink" onClick={() => { const ev = dispatch({ type: "inbox.receive", channel: x.channel, from: { name: x.name, handle: `${x.channel}:${x.name}` }, text: x.text }); setSim(false); setTimeout(() => { const cv = state.inbox.find((y) => y.customer.handle === `${x.channel}:${x.name}` && y.status !== "resolved"); setId(cv?.id ?? `cv-${ev.id}`); }, 50); }}><div className="text-[12px] text-muted">{CHANNELS[x.channel].name} · {x.name}</div><div className="text-[13.5px]">{x.text}</div></button></li>)}</ul>
      </Modal>
    </Guard>
  );
}
