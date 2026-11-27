"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMe } from "@/components/staff/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, cn, Segmented } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import { DEPT_LABEL } from "@/lib/hospitality-data";
import { askSop, type SopAnswer } from "@/lib/sop-assistant";
import type { Enrollment } from "@/lib/types";

export const ENR_ST: Record<Enrollment["status"], [string, "info" | "warn" | "ok" | "bad"]> = { in_progress: ["Ընթացքում", "info"], submitted: ["Սպասում է ղեկավարի ստուգման", "warn"], approved: ["Հաստատված", "ok"], changes_requested: ["Պահանջվում են ուղղումներ", "bad"] };

export default function StaffLearn() {
  const { state, actor } = useDemo();
  const { me } = useMe();
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"path" | "sops" | "ask">((sp.get("t") as "sops" | "ask") ?? "path");
  const eid = sp.get("e");
  const mine = state.enrollments.filter((e) => e.employeeId === actor);
  const cur = mine.find((e) => e.id === eid);
  if (cur) return <Player e={cur} onBack={() => router.push("/staff/learn")} />;
  const total = mine.reduce((a, e) => a + (state.training.find((m) => m.id === e.moduleId)?.steps.length ?? 0), 0);
  const done = mine.reduce((a, e) => a + e.done.length, 0);
  return (
    <>
      <h1 className="mb-3 text-[22px] font-semibold">Ուսուցում</h1>
      <Segmented value={tab} onChange={setTab} items={[{ id: "path", label: "Իմ ծրագիրը" }, { id: "sops", label: "Ընթացակարգեր" }, { id: "ask", label: "Օգնական" }]} />
      <div className="mt-4">
        {tab === "path" && (
          <>
            <div className="mb-4 rounded-2xl bg-ink p-4 text-white">
              <div className="text-[12.5px] text-white/70">Ընդհանուր առաջընթաց</div>
              <div className="mt-1 flex items-end justify-between"><span className="tnum text-[28px] font-semibold">{total ? Math.round((done / total) * 100) : 0}%</span><span className="text-[12.5px] text-white/70">{done}/{total} քայլ · {mine.filter((e) => e.status === "approved").length}/{mine.length} մոդուլ հաստատված</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
            </div>
            <ol className="space-y-2">
              {mine.map((e, i) => { const m = state.training.find((x) => x.id === e.moduleId)!; return (
                <li key={e.id}><button onClick={() => router.push(`/staff/learn?e=${e.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left hover:border-ink/20">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-bold", e.status === "approved" ? "bg-ok text-white" : "bg-paper")}>{e.status === "approved" ? <Icon name="check" size={18} /> : i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold">{m.title}</span><span className="block text-[12.5px] text-muted">{m.steps.length} քայլ · ~{m.minutes} ր · {e.done.length}/{m.steps.length} արված</span></span>
                  <Badge tone={ENR_ST[e.status][1]}>{ENR_ST[e.status][0]}</Badge>
                </button></li>); })}
            </ol>
            <p className="mt-4 text-[12px] text-muted">Ուղին․ բարի գալուստ → ընթացակարգեր → ստուգաթերթեր → թեստ (≥70%) → ղեկավարի ստուգում → ավարտ։</p>
          </>
        )}
        {tab === "sops" && <SopLibrary dept={me.dept} />}
        {tab === "ask" && <SopAssistant />}
      </div>
    </>
  );
}

function Player({ e, onBack }: { e: Enrollment; onBack: () => void }) {
  const { state, dispatch } = useDemo();
  const m = state.training.find((x) => x.id === e.moduleId)!;
  const [open, setOpen] = useState<string | null>(m.steps.find((s) => !e.done.includes(s.id))?.id ?? null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Record<string, number>>({});
  const locked = e.status === "submitted" || e.status === "approved";
  const allDone = m.steps.every((s) => e.done.includes(s.id));
  return (
    <>
      <div className="mb-3 flex items-center gap-2"><button onClick={onBack} className="grid size-9 place-items-center rounded-lg hover:bg-surface" aria-label="Հետ"><Icon name="chevronLeft" size={20} /></button><div><div className="text-[17px] font-semibold">{m.title}</div><div className="text-[12px] text-muted">{m.dept === "all" ? "Բոլոր աշխատակիցների համար" : DEPT_LABEL[m.dept]} · ~{m.minutes} ր</div></div></div>
      <div className="mb-3"><Badge tone={ENR_ST[e.status][1]}>{ENR_ST[e.status][0]}</Badge></div>
      {e.status === "changes_requested" && e.reviewNote && <div className="mb-3 rounded-xl border border-bad/30 bg-bad-soft p-3 text-[13.5px]"><b>Ղեկավարի մեկնաբանություն․</b> {e.reviewNote}</div>}
      {e.status === "approved" && e.reviewNote && <div className="mb-3 rounded-xl border border-ok/30 bg-ok-soft p-3 text-[13.5px]"><b>Ղեկավար․</b> {e.reviewNote}</div>}
      <ol className="space-y-2">
        {m.steps.map((s, i) => {
          const isDone = e.done.includes(s.id);
          return (
            <li key={s.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center gap-3 p-3.5 text-left">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[12.5px] font-bold", isDone ? "bg-ok text-white" : "bg-paper")}>{isDone ? <Icon name="check" size={15} /> : i + 1}</span>
                <span className="flex-1"><span className="block text-[14.5px] font-semibold">{s.title}</span><span className="text-[12px] text-muted">{{ lesson: "Դաս", checklist: "Ստուգաթերթ", quiz: "Թեստ" }[s.kind]}{s.kind === "quiz" && e.scores[s.id] !== undefined ? ` · վերջին արդյունք ${e.scores[s.id]}%` : ""}</span></span>
                <Icon name="chevronDown" size={17} className={cn("text-muted transition", open === s.id && "rotate-180")} />
              </button>
              {open === s.id && (
                <div className="border-t border-line p-4">
                  {s.kind === "lesson" && <><p className="text-[14.5px] leading-relaxed">{s.body}</p>{!isDone && !locked && <Button variant="primary" className="mt-4 w-full" onClick={() => dispatch({ type: "training.step", enrollmentId: e.id, stepId: s.id })}>Կարդացել եմ</Button>}</>}
                  {s.kind === "checklist" && <>
                    <ul className="space-y-2">{s.items!.map((it, k) => <li key={k}><label className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5 text-[14px]"><input type="checkbox" disabled={isDone || locked} checked={isDone || !!checks[`${s.id}-${k}`]} onChange={(ev) => setChecks({ ...checks, [`${s.id}-${k}`]: ev.target.checked })} className="size-5 accent-[var(--color-ink)]" />{it}</label></li>)}</ul>
                    {!isDone && !locked && <Button variant="primary" className="mt-4 w-full" disabled={!s.items!.every((_, k) => checks[`${s.id}-${k}`])} onClick={() => dispatch({ type: "training.step", enrollmentId: e.id, stepId: s.id })}>Բոլորը կատարված են</Button>}
                  </>}
                  {s.kind === "quiz" && <>
                    {s.questions!.map((q, qi) => (
                      <fieldset key={qi} className="mb-4"><legend className="mb-2 text-[14px] font-semibold">{qi + 1}. {q.q}</legend>
                        <div className="space-y-1.5">{q.options.map((o, oi) => <label key={oi} className={cn("flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[14px]", answers[`${s.id}-${qi}`] === oi ? "border-ink bg-paper" : "border-line")}><input type="radio" name={`${s.id}-${qi}`} disabled={isDone || locked} checked={answers[`${s.id}-${qi}`] === oi} onChange={() => setAnswers({ ...answers, [`${s.id}-${qi}`]: oi })} className="accent-[var(--color-ink)]" />{o}</label>)}</div>
                      </fieldset>
                    ))}
                    {result[s.id] !== undefined && <div className={cn("mb-3 rounded-xl p-3 text-[13.5px]", result[s.id] >= 70 ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad")}>Արդյունք՝ {result[s.id]}%։ {result[s.id] >= 70 ? "Թեստը հանձնված է։" : "Անհրաժեշտ է առնվազն 70%։ Կրկին փորձեք։"}</div>}
                    {!isDone && !locked && <Button variant="primary" className="w-full" disabled={s.questions!.some((_, qi) => answers[`${s.id}-${qi}`] === undefined)} onClick={() => { const ok = s.questions!.filter((q, qi) => answers[`${s.id}-${qi}`] === q.answer).length; const score = Math.round((ok / s.questions!.length) * 100); setResult({ ...result, [s.id]: score }); dispatch({ type: "training.step", enrollmentId: e.id, stepId: s.id, score }); }}>Ստուգել պատասխանները</Button>}
                  </>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!locked && <Button variant="primary" className="mt-4 h-12 w-full" disabled={!allDone} onClick={() => dispatch({ type: "training.submit", enrollmentId: e.id })}>{allDone ? "Ուղարկել ղեկավարին ստուգման" : `Ավարտեք բոլոր քայլերը (${e.done.length}/${m.steps.length})`}</Button>}
    </>
  );
}

function SopLibrary({ dept }: { dept: string }) {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = state.sops.filter((s) => !q.trim() || `${s.title} ${s.tags.join(" ")} ${s.body.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => Number(b.dept === dept) - Number(a.dept === dept));
  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Որոնել ընթացակարգ…" className="mb-3 h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] outline-none focus:border-ink/30" />
      <ul className="space-y-2">{list.map((s) => (
        <li key={s.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center gap-3 p-3.5 text-left"><Icon name="list" size={18} className="text-muted" /><span className="flex-1"><span className="block text-[14.5px] font-semibold">{s.title}</span><span className="text-[12px] text-muted">{s.dept === "all" ? "Բոլորի համար" : DEPT_LABEL[s.dept]}</span></span><Badge tone="ok">Հաստատված</Badge></button>
          {open === s.id && <ol className="list-decimal space-y-1.5 border-t border-line py-3 pl-9 pr-4 text-[14px]">{s.body.map((b, i) => <li key={i}>{b}</li>)}</ol>}
        </li>))}
      </ul>
    </>
  );
}

function SopAssistant() {
  const { state, dispatch, actor } = useDemo();
  const { me } = useMe();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ q: string; a: SopAnswer }[]>([]);
  const ask = (text: string) => { if (!text.trim()) return; setLog([...log, { q: text, a: askSop(state, me, text) }]); setQ(""); };
  const toSupervisor = (text: string, sid: string) => {
    const id = `dm-${[actor, sid].sort().join("-")}`;
    if (!state.channels.some((c) => c.id === id)) dispatch({ type: "channel.open", channel: { id, kind: "direct", name: "", members: [actor, sid] } });
    dispatch({ type: "msg.send", channelId: id, text: `Հարց (ընթացակարգերում պատասխան չգտնվեց)․ ${text}` });
    router.push(`/staff/messages?c=${id}`);
  };
  return (
    <>
      <div className="mb-3 rounded-xl border border-line bg-surface p-3 text-[12.5px] text-muted"><Icon name="sparkles" size={14} className="mr-1 inline text-signal" />Օգնականը պատասխանում է <b>միայն հաստատված ընթացակարգերից</b> և նշում աղբյուրը։ Եթե պատասխան չկա, հարցը ուղարկում է Ձեր ղեկավարին։ (Ցուցադրական․ բանալի բառերով որոնում, առանց LLM-ի)</div>
      <div className="mb-3 flex flex-wrap gap-1.5">{["Ինչպես պատրաստել VIP սենյակ", "Ինչ անել հյուրի բողոքի դեպքում", "Հրդեհի դեպքում ինչ անել", "Ինչպես աշխատում են միավորները"].map((s) => <button key={s} onClick={() => ask(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] hover:border-ink/30">{s}</button>)}</div>
      <div className="space-y-3">
        {log.map((x, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-ink px-3.5 py-2.5 text-[14px] text-white">{x.q}</div>
            {x.a.kind === "answer" ? (
              <div className="max-w-[92%] rounded-2xl border border-line bg-surface p-3.5 text-[14px]">
                <div className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-ok">Աղբյուր՝ {x.a.sop.title}</div>
                <ul className="list-disc space-y-1 pl-5">{x.a.lines.map((l, k) => <li key={k}>{l}</li>)}</ul>
                {x.a.others.length > 0 && <div className="mt-2 text-[12px] text-muted">Տե՛ս նաև՝ {x.a.others.map((o) => o.title).join(", ")}</div>}
              </div>
            ) : (
              <div className="max-w-[92%] rounded-2xl border border-warn/40 bg-warn-soft/50 p-3.5 text-[14px]">
                Հաստատված ընթացակարգերում այս հարցի պատասխանը չգտա և չեմ ենթադրի։ {x.a.supervisor ? <>Հարցրեք Ձեր ղեկավարին՝ <b>{x.a.supervisor.name}</b>։</> : "Դիմեք ղեկավարությանը։"}
                {x.a.supervisor && <Button size="sm" className="mt-2.5" icon="send" onClick={() => toSupervisor(x.q, (x.a as { supervisor: { id: string } }).supervisor.id)}>Ուղարկել հարցը ղեկավարին</Button>}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-4 flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ձեր հարցը…" className="h-11 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[14px] outline-none focus:border-ink/30" /><Button variant="primary" className="h-11">Հարցնել</Button></form>
    </>
  );
}
