"use client";
/*
 * AI Business Assistant. Every answer is computed from Restaurant OS data and shows its sources.
 * Answer kinds: analysis (read-only) · recommendation · proposed action (needs confirmation AND permission) · restricted.
 * Nothing is executed without the user pressing "Confirm" in the dialog. Deterministic engine in this demo (no LLM).
 * Also: staff SOP assistant (procedures search) for employees.
 */
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Guard } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Input, Modal, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { ask, QUESTIONS, sopSearch, type Answer } from "@/lib/restaurant/assistant";

type Turn = { q: string; a: Answer; done?: string[] };

export default function Assistant() {
  const { state, dispatch, can } = useR();
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [confirm, setConfirm] = useState<{ ti: number; ai: number } | null>(null);
  const [sq, setSq] = useState("");
  const run = (text: string) => { if (!text.trim()) return; setTurns((t) => [{ q: text, a: ask(state, text, Date.now()) }, ...t]); setQ(""); };
  const act = confirm ? turns[confirm.ti].a.actions![confirm.ai] : null;
  const sops = sq.trim() ? sopSearch(state, sq) : state.sops;

  return (
    <Guard perm="assistant.use">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">AI բիզնես օգնական</h1><p className="mt-1 text-[13.5px] text-muted">Պատասխանում է միայն Restaurant OS-ի տվյալներով և ցույց է տալիս աղբյուրը։ Գործողություններն առաջարկվում են և կատարվում միայն Ձեր հաստատումից հետո, Ձեր իրավունքների սահմաններում։</p></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="flex gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Հարցրեք հայերեն, ռուսերեն կամ անգլերեն…" className="h-11 flex-1" aria-label="Հարց" /><Button variant="primary" icon="send" type="submit" disabled={!q.trim()}>Հարցնել</Button></form>
            <div className="mt-3 flex flex-wrap gap-1.5">{QUESTIONS.map((x) => <button key={x.id} onClick={() => run(x.q)} className="rounded-lg bg-paper px-2.5 py-1.5 text-[12.5px] hover:bg-black/[0.06]">{x.q}</button>)}</div>
          </Card>
          {turns.map((t, ti) => (
            <Card key={ti}>
              <div className="text-[12.5px] text-muted">Հարց՝ {t.q}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2"><Icon name="sparkles" size={16} className="text-violet" /><h2 className="text-[16px] font-semibold">{t.a.title}</h2><Badge tone={t.a.kind === "recommendation" ? "violet" : "info"}>{t.a.kind === "recommendation" ? "Առաջարկություն" : "Վերլուծություն"}</Badge></div>
              <ul className="mt-2 space-y-1 text-[13.5px]">{t.a.lines.map((l, i) => <li key={i} className="flex gap-2"><span className="text-faint">•</span><span>{l}</span></li>)}</ul>
              {t.a.sources.length > 0 && <div className="mt-3 rounded-lg bg-paper px-3 py-2 text-[12px] text-muted"><span className="font-semibold">Աղբյուրներ՝ </span>{t.a.sources.join(" · ")}</div>}
              {t.a.actions && t.a.actions.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{t.a.actions.map((a, ai) => {
                const allowed = can(a.permission);
                const done = t.done?.includes(a.label);
                return <Button key={ai} size="sm" variant={done ? "ok" : "secondary"} disabled={!allowed || done} title={!allowed ? `Պահանջվում է իրավունք՝ ${a.permission}` : undefined} icon={done ? "check" : allowed ? "zap" : "x"} onClick={() => setConfirm({ ti, ai })}>{a.label}{!allowed && " · արգելված"}</Button>;
              })}</div>}
            </Card>
          ))}
          {!turns.length && <Card><p className="py-6 text-center text-[13px] text-muted">Ընտրեք հարց կամ գրեք Ձերը։</p></Card>}
        </div>
        <aside className="space-y-4">
          <Card>
            <CardHead title="Աշխատակցի ուղեցույց (SOP)" sub="Ընթացակարգեր ըստ դերի" icon="info" />
            <Input value={sq} onChange={(e) => setSq(e.target.value)} placeholder="օր.՝ ալերգիա, փակում, բողոք" aria-label="SOP որոնում" />
            <ul className="mt-3 space-y-3">{sops.map((x) => <li key={x.id} className="rounded-xl border border-line p-3"><div className="text-[13.5px] font-semibold">{x.title}</div><div className="mt-0.5 text-[11.5px] text-muted">{x.roles.join(", ")}</div><ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-[12.5px]">{x.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></li>)}{!sops.length && <li className="text-[13px] text-muted">Չի գտնվել։ Հարցրեք մենեջերին։</li>}</ul>
          </Card>
          <Card><CardHead title="Ինչպես է աշխատում" icon="filter" />
            <ul className="space-y-1.5 text-[12.5px] text-muted">
              <li><Badge tone="info">Վերլուծություն</Badge> միայն կարդում է տվյալները</li>
              <li><Badge tone="violet">Առաջարկություն</Badge> բացատրում է ինչու, թվերով</li>
              <li><Badge>Առաջարկվող գործողություն</Badge> կատարվում է միայն հաստատումից հետո</li>
              <li><Badge tone="bad">Արգելված</Badge> եթե Ձեր դերը իրավունք չունի</li>
              <li>Ցուցադրությունում օգտագործվում է կանոնային (ոչ LLM) շարժիչ։ LLM ադապտերը նկարագրված է AI ճարտարապետության փաստաթղթում։</li>
            </ul>
          </Card>
        </aside>
      </div>
      <Modal open={Boolean(act)} onClose={() => setConfirm(null)} title="Հաստատել գործողությունը"
        footer={<><Button variant="ghost" onClick={() => setConfirm(null)}>Չեղարկել</Button><Button variant="primary" icon="check" onClick={() => { if (!confirm || !act) return; act.events.forEach((e) => dispatch(e)); setTurns((ts) => ts.map((t, i) => (i === confirm.ti ? { ...t, done: [...(t.done ?? []), act.label] } : t))); setConfirm(null); }}>Հաստատել</Button></>}>
        {act && <div className="space-y-2 text-[13.5px]">
          <p className="font-medium">{act.label}</p>
          <p className="text-muted">Կկատարվեն հետևյալ գործողությունները ({act.events.length})՝</p>
          <ul className="space-y-1">{act.events.map((e, i) => <li key={i} className={cn("rounded-lg bg-paper px-2 py-1 font-mono text-[12px]")}>{e.type}{"title" in e ? ` · ${e.title}` : ""}</li>)}</ul>
          <p className="text-[12px] text-muted">Գործողությունը գրանցվում է Ձեր անունով։ Արտաքին հաղորդագրություններ չեն ուղարկվում։</p>
        </div>}
      </Modal>
    </Guard>
  );
}
