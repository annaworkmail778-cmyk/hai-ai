"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { HBar } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, CardHead, cn, Empty, Field, Input, Kpi, Select, Tabs, Toggle } from "@/components/ui";
import { respond } from "@/lib/assistant";
import { useDemo } from "@/lib/client/demo-store";
import { LANG_LABEL, stamp, time } from "@/lib/format";
import type { KnowledgeBase, Lang } from "@/lib/types";

const INTENT_LABEL: Record<string, string> = {
  availability: "Ազատ սենյակներ և ամսաթվեր", price: "Գներ", checkin: "Մուտք / ելք", breakfast: "Նախաճաշ", parking: "Ավտոկայանատեղի", wifi: "Wi‑Fi",
  pets: "Կենդանիներ", location: "Ճանապարհ և տրանսֆեր", attractions: "Տեսարժան վայրեր", ski: "Դահուկներ", spa: "Սպա", cancel: "Չեղարկում", offers: "Առաջարկներ",
  handoff: "Փոխանցված անձնակազմին", greet: "Ողջույն", thanks: "Շնորհակալություն", inquiry_sent: "Ամրագրման հարցում",
};

export default function AssistantAdmin() {
  const { state, dispatch } = useDemo();
  const sp = useSearchParams();
  const [tab, setTab] = useState<"conv" | "handoff" | "faq" | "kb">("conv");
  const [sel, setSel] = useState<string | null>(sp.get("open"));
  const [reply, setReply] = useState("");
  useEffect(() => { if (sp.get("open")) { setSel(sp.get("open")); setTab("conv"); } }, [sp]);
  const convs = state.conversations;
  const handoffs = convs.filter((c) => c.status === "handoff");
  const cur = convs.find((c) => c.id === sel) ?? (tab === "conv" ? convs[0] : undefined);
  const intents = useMemo(() => {
    const m = new Map<string, number>();
    convs.forEach((c) => c.messages.forEach((x) => { if (x.from === "assistant" && x.intent && x.intent !== "greet") m.set(x.intent, (m.get(x.intent) ?? 0) + 1); }));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [convs]);
  const answered = convs.length ? convs.filter((c) => c.status !== "handoff" && c.unanswered.length === 0).length / convs.length : 0;
  const after = convs.filter((c) => c.afterHours).length;
  const inquiries = state.reservations.filter((r) => r.source === "assistant").length;

  return (
    <>
      <PageTitle title="AI օգնական" sub="Հյուրերի զրույցները, անձնակազմին փոխանցված հարցերը և օգնականի գիտելիքների բազան" right={<Link href="/hotel/hy?chat=1" target="_blank"><Button icon="external">Բացել կայքում</Button></Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Զրույցներ" value={convs.length} sub={`${after} ոչ աշխատանքային ժամին`} icon="message" />
        <Kpi label="Պատասխանված ավտոմատ" value={`${Math.round(answered * 100)}%`} sub="առանց աշխատակցի" icon="sparkles" tone="ok" />
        <Kpi label="Փոխանցված անձնակազմին" value={handoffs.length} sub="սպասում են պատասխանի" icon="users" tone={handoffs.length ? "signal" : "ok"} />
        <Kpi label="Ամրագրման հարցումներ օգնականից" value={inquiries} sub="բոլոր ժամանակներում" icon="bell" tone="info" />
      </div>
      <Tabs className="my-4 w-fit max-w-full" value={tab} onChange={setTab} items={[{ id: "conv", label: "Զրույցներ", count: convs.length }, { id: "handoff", label: "Պահանջում են մարդ", count: handoffs.length }, { id: "faq", label: "Հաճախ տրվող հարցեր" }, { id: "kb", label: "Գիտելիքների բազա" }]} />

      {(tab === "conv" || tab === "handoff") && (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card pad={false} className="max-h-[640px] overflow-y-auto">
            <ul className="divide-y divide-line">
              {(tab === "handoff" ? handoffs : convs).map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <li key={c.id}><button onClick={() => setSel(c.id)} className={cn("w-full px-4 py-3 text-left hover:bg-paper", cur?.id === c.id && "bg-paper")}>
                    <div className="flex items-center justify-between gap-2"><span className="truncate text-[13.5px] font-medium">{c.guestName ?? "Անանուն հյուր"}</span><span className="shrink-0 text-[11.5px] text-faint">{stamp(c.displayAt ?? c.startedAt, state.baseDate)}</span></div>
                    <div className="mt-0.5 truncate text-[12.5px] text-muted">{last?.text ?? "…"}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge>{LANG_LABEL[c.lang]}</Badge>
                      {c.afterHours && <Badge tone="violet"><Icon name="moon" size={11} />Գիշեր</Badge>}
                      {c.status === "handoff" && <Badge tone="signal">Պահանջում է պատասխան</Badge>}
                      {c.reservationId && <Badge tone="info">Հարցում</Badge>}
                    </div>
                  </button></li>
                );
              })}
            </ul>
            {!(tab === "handoff" ? handoffs : convs).length && <div className="p-4"><Empty title="Դատարկ է" /></div>}
          </Card>
          <Card className="flex min-h-[420px] flex-col">
            {cur ? (
              <>
                <CardHead title={cur.guestName ?? "Անանուն հյուր"} sub={`${LANG_LABEL[cur.lang]} · կայքի օգնական · սկսվել է ${stamp(cur.displayAt ?? cur.startedAt, state.baseDate)}`} right={cur.status === "handoff" ? <Button size="sm" variant="ok" icon="check" onClick={() => dispatch({ type: "chat.resolve", conversationId: cur.id })}>Նշել պատասխանված</Button> : <Badge tone="ok">Լուծված</Badge>} />
                {cur.unanswered.length > 0 && <div className="mb-3 rounded-xl bg-signal-soft px-3 py-2 text-[13px] text-signal"><b>Օգնականը չուներ հաստատված պատասխան.</b> {cur.unanswered.join(" · ")}</div>}
                <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-paper p-3">
                  {cur.messages.map((m) => (
                    <div key={m.id} className={cn("flex flex-col", m.from === "guest" ? "items-start" : "items-end")}>
                      <div className={cn("max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13.5px]", m.from === "guest" ? "rounded-bl-md bg-surface shadow-sm" : m.from === "staff" ? "rounded-br-md bg-signal text-white" : "rounded-br-md bg-ink text-white")}>{m.text}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 px-1 text-[11px] text-faint">{m.from === "guest" ? "Հյուր" : m.from === "staff" ? "Աշխատակից" : "Օգնական"} · {time(m.at)}{m.intent && m.from === "assistant" && <span className="rounded bg-black/[0.06] px-1 text-muted">{INTENT_LABEL[m.intent] ?? m.intent}</span>}</div>
                    </div>
                  ))}
                </div>
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; dispatch({ type: "chat.message", conversationId: cur.id, msg: { id: Math.random().toString(36).slice(2), from: "staff", text: reply.trim(), at: Date.now() } }); setReply(""); }}>
                  <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Պատասխանել հյուրին անունից (կերևա հյուրի զրույցում)" />
                  <Button variant="primary" icon="send" type="submit" disabled={!reply.trim()}>Ուղարկել</Button>
                </form>
                {cur.reservationId && <Link href={`/admin/reservations?open=${cur.reservationId}`} className="mt-2 text-[12.5px] font-medium text-info">Բացել կապված հարցումը →</Link>}
              </>
            ) : <Empty icon="message" title="Ընտրեք զրույց" />}
          </Card>
        </div>
      )}

      {tab === "faq" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHead title="Ինչ են հարցնում հյուրերը" sub="Օգնականի պատասխանների թեմաներն ըստ բոլոր զրույցների" icon="chart" />
            <ul className="space-y-3">{intents.map(([k, v]) => <li key={k}><div className="mb-1 flex justify-between text-[13px]"><span>{INTENT_LABEL[k] ?? k}</span><span className="tnum text-muted">{v}</span></div><HBar value={v} max={intents[0]?.[1] ?? 1} tone={k === "handoff" ? "signal" : "ink"} /></li>)}</ul>
          </Card>
          <Card>
            <CardHead title="Չպատասխանված հարցեր" sub="Ավելացրեք պատասխանը գիտելիքների բազայում, որպեսզի հաջորդ անգամ օգնականը պատասխանի" icon="alert" />
            <ul className="space-y-2">{convs.flatMap((c) => c.unanswered.map((q, i) => <li key={c.id + i} className="flex items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2 text-[13px]"><span>«{q}»</span><Badge tone={c.status === "handoff" ? "signal" : "ok"}>{c.status === "handoff" ? "Սպասում է" : "Պատասխանված"}</Badge></li>))}</ul>
          </Card>
        </div>
      )}

      {tab === "kb" && <KnowledgeSettings />}
    </>
  );
}

function KnowledgeSettings() {
  const { state, dispatch } = useDemo();
  const [kb, setKb] = useState<KnowledgeBase>(state.kb);
  const [lang, setLang] = useState<Lang>("ru");
  const [q, setQ] = useState("Во сколько заезд?");
  useEffect(() => setKb(state.kb), [state.kb]);
  const dirty = JSON.stringify(kb) !== JSON.stringify(state.kb);
  const preview = respond({ ...state, kb }, lang, q);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHead title="Հյուրանոցի կանոններ և տվյալներ" sub="Օգնականը պատասխանում է միայն այս տվյալներով և գնացուցակով։ Փոփոխությունը կիրառվում է անմիջապես։" icon="info" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Մուտքի ժամ"><Input value={kb.checkIn} onChange={(e) => setKb({ ...kb, checkIn: e.target.value })} /></Field>
          <Field label="Ելքի ժամ"><Input value={kb.checkOut} onChange={(e) => setKb({ ...kb, checkOut: e.target.value })} /></Field>
          <Field label="Նախաճաշի ժամեր"><Input value={kb.breakfast} onChange={(e) => setKb({ ...kb, breakfast: e.target.value })} /></Field>
          <label className="flex items-center gap-3 pt-5 text-[13px]"><Toggle on={kb.breakfastIncluded} onChange={(v) => setKb({ ...kb, breakfastIncluded: v })} />Նախաճաշը ներառված է</label>
          <Field label="Ընդունարանի ժամեր"><Input value={kb.receptionHours} onChange={(e) => setKb({ ...kb, receptionHours: e.target.value })} /></Field>
          <Field label="Ավտոկայանատեղի"><Select value={kb.parking} onChange={(e) => setKb({ ...kb, parking: e.target.value as KnowledgeBase["parking"] })}><option value="free">Անվճար</option><option value="paid">Վճարովի</option><option value="none">Չկա</option></Select></Field>
          <Field label="Կենդանիներ"><Select value={kb.pets} onChange={(e) => setKb({ ...kb, pets: e.target.value as KnowledgeBase["pets"] })}><option value="allowed_small">Փոքր կենդանիներ՝ թույլատրված</option><option value="not_allowed">Թույլատրված չեն</option></Select></Field>
          <Field label="Կենդանու վճար (֏ / գիշեր)"><Input type="number" value={kb.petFee} onChange={(e) => setKb({ ...kb, petFee: +e.target.value })} /></Field>
          <Field label="Տրանսֆեր օդանավակայանից (֏)"><Input type="number" value={kb.airportTransfer} onChange={(e) => setKb({ ...kb, airportTransfer: +e.target.value })} /></Field>
          <Field label="Սպայի ժամեր"><Input value={kb.spaHours} onChange={(e) => setKb({ ...kb, spaHours: e.target.value })} /></Field>
          <Field label="Անվճար չեղարկում (օր առաջ)"><Input value={kb.cancellation} onChange={(e) => setKb({ ...kb, cancellation: e.target.value })} /></Field>
          <label className="flex items-center gap-3 pt-5 text-[13px]"><Toggle on={kb.skiShuttle} onChange={(v) => setKb({ ...kb, skiShuttle: v })} />Տրանսֆեր դեպի ճոպանուղի</label>
        </div>
        <div className="mt-4 flex gap-2"><Button variant="primary" disabled={!dirty} onClick={() => dispatch({ type: "kb.update", patch: kb })}>Պահպանել</Button><Button variant="ghost" disabled={!dirty} onClick={() => setKb(state.kb)}>Չեղարկել</Button></div>
      </Card>
      <Card>
        <CardHead title="Փորձարկել օգնականը" sub="Նախադիտում՝ չպահպանված փոփոխություններով" icon="sparkles" />
        <div className="flex gap-2"><Select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="max-w-28"><option value="hy">Հայ</option><option value="ru">Рус</option><option value="en">Eng</option></Select><Input value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="mt-3 space-y-2">
          {preview.messages.map((m, i) => <div key={i} className="whitespace-pre-line rounded-2xl rounded-bl-md bg-paper px-3 py-2 text-[13.5px]">{m.text}<div className="mt-1 text-[11px] text-faint">{INTENT_LABEL[m.intent] ?? m.intent}</div></div>)}
          {preview.action?.type === "handoff" && <Badge tone="signal">Կփոխանցվի անձնակազմին</Badge>}
        </div>
      </Card>
    </div>
  );
}
