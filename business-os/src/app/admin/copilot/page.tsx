"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Icon } from "@/components/icons";
import { Badge, Button, cn } from "@/components/ui";
import { askCopilot, SUGGESTED_QUESTIONS, type CopilotAnswer } from "@/lib/ai/copilot";
import { useDemo } from "@/lib/client/demo-store";
import { useNow } from "@/lib/client/use-now";
import { POSITION_LABEL } from "@/lib/hospitality-data";

export default function Copilot() {
  const { state, actor, dispatch } = useDemo();
  const now = useNow(60000);
  const me = state.staff.find((s) => s.id === actor) ?? state.staff[0];
  const [log, setLog] = useState<{ q: string; a: CopilotAnswer; done: string[] }[]>([]);
  const [q, setQ] = useState("");
  const ask = (text: string) => { if (!text.trim()) return; setLog((l) => [...l, { q: text, a: askCopilot(state, text, me, now), done: [] }]); setQ(""); };
  return (
    <>
      <PageTitle title="AI բիզնես օգնական" sub={<span className="flex flex-wrap items-center gap-2">Հարցրեք բիզնեսի մասին․ յուրաքանչյուր թիվ ունի բանաձև և աղբյուր <Badge tone="neutral">Դեր՝ {POSITION_LABEL[me.position]}</Badge></span>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="flex min-h-[60dvh] flex-col rounded-xl border border-line bg-surface">
          <div className="flex-1 space-y-5 p-4">
            {log.length === 0 && (
              <div className="mx-auto max-w-xl py-8 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink text-signal"><Icon name="sparkles" size={22} /></span>
                <h3 className="mt-3 text-[17px] font-semibold">Ինչ ստուգենք այսօր</h3>
                <p className="mt-1 text-[13px] text-muted">Օգնականը կարդում է միայն թույլատրված տվյալները, չի հորինում թվեր կամ պատճառներ և ոչինչ չի փոխում առանց Ձեր հաստատման։</p>
                <Button variant="primary" icon="sparkles" className="mt-4" onClick={() => ask("Ամփոփիր այսօրվա օրը")}>Այսօրվա ամփոփում</Button>
              </div>
            )}
            {log.map((x, i) => (
              <div key={i} className="space-y-2">
                <div className="ml-auto w-fit max-w-[80%] rounded-2xl bg-ink px-4 py-2.5 text-[13.5px] text-white">{x.q}</div>
                <div className={cn("max-w-[92%] rounded-2xl border p-4 text-[13.5px]", x.a.refused ? "border-warn/40 bg-warn-soft/50" : "border-line bg-paper/60")}>
                  <p className="font-medium">{x.a.answer}</p>
                  {x.a.items.length > 0 && <ul className="mt-2 space-y-1 text-[13px]">{x.a.items.map((it, k) => <li key={k} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" />{x.a.refused ? <button className="text-left text-info underline" onClick={() => ask(it)}>{it}</button> : it}</li>)}</ul>}
                  {x.a.figures.length > 0 && (
                    <details className="mt-3 rounded-lg bg-surface p-3 text-[12.5px]" open={i === log.length - 1}>
                      <summary className="cursor-pointer font-semibold">Թվեր և բանաձևեր</summary>
                      <table className="mt-2 w-full"><tbody>{x.a.figures.map((f) => <tr key={f.label} className="border-t border-line align-top"><td className="py-1.5 pr-3 font-medium">{f.label}</td><td className="tnum py-1.5 pr-3">{f.value}</td><td className="py-1.5 text-muted">{f.formula}<span className="block text-[11px] text-faint">աղբյուր՝ {f.source}</span></td></tr>)}</tbody></table>
                    </details>
                  )}
                  {x.a.actions.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-faint">Առաջարկվող գործողություններ · պահանջում են հաստատում</div>
                      {x.a.actions.map((ac) => { const done = x.done.includes(ac.label); return (
                        <div key={ac.label} className="flex flex-wrap items-center gap-2 rounded-lg bg-surface px-3 py-2"><span className="flex-1">{ac.label}</span>
                          <Button size="sm" variant={done ? "ok" : "primary"} disabled={done} icon={done ? "check" : "tasks"} onClick={() => { dispatch({ type: "staffTask.create", title: ac.task.title, detail: ac.task.detail, assigneeId: ac.task.assigneeId, priority: ac.task.priority, due: state.baseDate }); setLog((l) => l.map((y, k) => (k === i ? { ...y, done: [...y.done, ac.label] } : y))); }}>{done ? "Ստեղծված է" : "Հաստատել և ստեղծել"}</Button>
                        </div>); })}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-faint">Վերլուծություն միայն կարդալու ռեժիմով · ցուցադրական տվյալներ</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2 border-t border-line p-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Օր․՝ Ո՞ր սենյակներն են պատրաստ չէ" className="h-10 flex-1 rounded-lg bg-paper px-3 text-[13.5px] outline-none ring-1 ring-line focus:ring-ink/30" /><Button variant="primary" icon="send">Հարցնել</Button></form>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-faint">Հարցերի օրինակներ</div>
            <div className="flex flex-col gap-1.5">{SUGGESTED_QUESTIONS.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-paper">{s}</button>)}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4 text-[12.5px] text-muted">
            <div className="mb-1.5 font-semibold text-ink">Սահմաններ</div>
            <ul className="list-disc space-y-1 pl-4">
              <li><b>Կարդում է</b>՝ ամրագրումներ, սենյակներ, առաջադրանքներ, զրույցներ, կարծիքներ</li>
              <li><b>Առաջարկում է</b>՝ առաջադրանքներ, որոնք ստեղծվում են միայն Ձեր հաստատմամբ</li>
              <li><b>Չի անում</b>՝ հաղորդագրություններ, վճարումներ, գների փոփոխություն, ամրագրումների չեղարկում</li>
              <li>Ֆինանսական տվյալները հասանելի են միայն ղեկավարներին</li>
              <li>Ցուցադրական տարբերակը օգտագործում է դետերմինիստական գործիքներ, ոչ LLM</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
