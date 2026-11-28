"use client";
/*
 * Review Management Center. Reviews from Google, Tripadvisor and TheFork in one place with rating trend, topic analysis
 * (food / service / price / ambience / wait) and AI-drafted replies that a person approves.
 * Publishing: Google has an official reply API (simulated adapter here); Tripadvisor and TheFork have no public reply API
 * for restaurants, so the approved reply is copied and posted manually. Low ratings create a manager task automatically.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Guard, hm } from "@/components/restaurant/staff/shell";
import { Badge, Button, Card, CardHead, Kpi, Modal, SimBadge, Textarea, cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { LINK_LABEL, REVIEW_PLATFORMS } from "@/lib/restaurant/channels";
import { draftReviewReply } from "@/lib/restaurant/nlp";
import type { Review, ReviewPlatform } from "@/lib/restaurant/types";

const CAT: Record<keyof Review["categories"], string> = { food: "Ուտեստներ", service: "Սպասարկում", price: "Գին", ambience: "Մթնոլորտ", wait: "Սպասում" };
const RS: Record<NonNullable<Review["reply"]>["status"], { label: string; tone: "ok" | "warn" | "info" | "neutral" }> = {
  draft: { label: "Նախագիծ", tone: "neutral" }, approved: { label: "Հաստատված", tone: "info" }, queued_not_connected: { label: "Սպասում է միացման", tone: "warn" },
  manual_required: { label: "Տեղադրել ձեռքով", tone: "warn" }, published_simulated: { label: "Հրապարակված (սիմուլյացիա)", tone: "ok" },
};
const day = (ms: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", day: "2-digit", month: "short" }).format(ms);
const Stars = ({ n }: { n: number }) => <span className="text-signal" aria-label={`${n} աստղ`}>{"★".repeat(n)}<span className="text-line-2">{"★".repeat(5 - n)}</span></span>;

export default function Reviews() {
  const { state, dispatch, can } = useR();
  const sp = useSearchParams();
  const router = useRouter();
  const [pf, setPf] = useState<"all" | ReviewPlatform | "unanswered" | "negative">("all");
  const [text, setText] = useState("");
  const [sim, setSim] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = sp.get("r");
  const setId = (x: string | null) => router.replace(x ? `/r/admin/reviews?r=${x}` : "/r/admin/reviews", { scroll: false });
  const all = state.reviews;
  const list = all.filter((r) => pf === "all" || (pf === "unanswered" ? !r.reply || r.reply.status === "draft" : pf === "negative" ? r.rating <= 3 : r.platform === pf)).sort((a, b) => b.at - a.at);
  const r = id ? all.find((x) => x.id === id) : undefined;
  const avg = (xs: Review[]) => (xs.length ? xs.reduce((a, x) => a + x.rating, 0) / xs.length : 0);
  const recent = all.filter((x) => x.at > Date.now() - 30 * 86400000), older = all.filter((x) => x.at <= Date.now() - 30 * 86400000);
  const cats = (Object.keys(CAT) as (keyof Review["categories"])[]).map((k) => { const v = all.map((x) => x.categories[k]).filter((x): x is number => x !== undefined); return { k, n: v.length, score: v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0 }; });
  const pick = (x: Review) => { setId(x.id); setText(x.reply?.text ?? draftReviewReply(x, state.brand.name)); setCopied(false); };

  return (
    <Guard perm="reviews.reply">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Կարծիքներ</h1><p className="mt-1 text-[13.5px] text-muted">Google, Tripadvisor և TheFork մեկ տեղում։ AI-ն պատրաստում է պատասխան, հրապարակում է մարդը։ Տվյալները ցուցադրական են։</p></div>
        <Button className="ml-auto" variant="secondary" icon="play" onClick={() => setSim(true)}>Սիմուլյացնել նոր կարծիք</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Միջին գնահատական" value={avg(all).toFixed(2)} sub={`${all.length} կարծիք`} icon="star" />
        <Kpi label="Վերջին 30 օր" value={avg(recent).toFixed(2)} sub={older.length ? `նախկինում՝ ${avg(older).toFixed(2)}` : "—"} icon="chart" tone={avg(recent) >= avg(older) ? "ok" : "warn"} />
        <Kpi label="Առանց պատասխանի" value={all.filter((x) => !x.reply || x.reply.status === "draft").length} icon="message" tone="signal" onClick={() => setPf("unanswered")} />
        <Kpi label="≤ 3★ (բաց առաջադրանքով)" value={all.filter((x) => x.rating <= 3 && state.tasks.some((t) => t.id === x.taskId && t.status === "open")).length} icon="alert" tone="bad" onClick={() => setPf("negative")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card><CardHead title="Թեմաների վերլուծություն" sub="−1 բացասական … +1 դրական · բառային վերլուծություն" icon="sparkles" />
          <ul className="space-y-2">{cats.map((c) => <li key={c.k} className="text-[13px]"><div className="flex justify-between"><span>{CAT[c.k]}</span><span className="tnum text-muted">{c.n ? c.score.toFixed(2) : "—"} · {c.n}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-paper"><div className={cn("h-full", c.score >= 0 ? "bg-ok" : "bg-bad")} style={{ width: `${Math.min(100, Math.abs(c.score) * 100)}%`, marginLeft: c.score >= 0 ? "50%" : `${50 - Math.min(50, Math.abs(c.score) * 50)}%`, maxWidth: "50%" }} /></div></li>)}</ul>
        </Card>
        <Card className="lg:col-span-2"><CardHead title="Հարթակներ" icon="bolt" />
          <ul className="grid gap-2 sm:grid-cols-3">{(Object.keys(REVIEW_PLATFORMS) as ReviewPlatform[]).map((p) => { const xs = all.filter((x) => x.platform === p); return (
            <li key={p} className="rounded-xl border border-line p-3"><div className="text-[13.5px] font-semibold">{REVIEW_PLATFORMS[p].name}</div><div className="tnum text-[20px] font-bold">{avg(xs).toFixed(2)} <span className="text-[12px] font-normal text-muted">· {xs.length}</span></div><Badge className="mt-1">{LINK_LABEL[REVIEW_PLATFORMS[p].state]}</Badge><p className="mt-1 text-[11.5px] text-muted">{REVIEW_PLATFORMS[p].limits[0]}</p></li>
          ); })}</ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card pad={false}>
          <div className="flex flex-wrap gap-1 border-b border-line p-2">{([["all", "Բոլորը"], ["unanswered", "Առանց պատասխանի"], ["negative", "≤ 3★"], ["google", "Google"], ["tripadvisor", "Tripadvisor"], ["thefork", "TheFork"]] as [typeof pf, string][]).map(([k, l]) => <button key={k} onClick={() => setPf(k)} className={cn("h-8 rounded-lg px-2.5 text-[12.5px] font-medium", pf === k ? "bg-ink text-white" : "bg-paper")}>{l}</button>)}</div>
          <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">{list.map((x) => (
            <li key={x.id}><button onClick={() => pick(x)} className={cn("w-full px-3 py-3 text-left hover:bg-paper", r?.id === x.id && "bg-signal-soft/40")}>
              <div className="flex items-center gap-2 text-[13px]"><Stars n={x.rating} /><span className="font-medium">{x.author}</span><span className="text-muted">· {REVIEW_PLATFORMS[x.platform].name} · {day(x.at)}</span>{x.reply && <Badge tone={RS[x.reply.status].tone} className="ml-auto">{RS[x.reply.status].label}</Badge>}</div>
              <p className="mt-1 line-clamp-2 text-[13px] text-ink-2">{x.text}</p>
            </button></li>
          ))}</ul>
        </Card>
        {r ? (
          <Card>
            <div className="flex flex-wrap items-center gap-2"><Stars n={r.rating} /><span className="text-[15px] font-semibold">{r.author}</span><span className="text-[12.5px] text-muted">{REVIEW_PLATFORMS[r.platform].name} · {day(r.at)} {hm(r.at)} · {r.lang.toUpperCase()}</span></div>
            <p className="mt-2 whitespace-pre-wrap text-[14px]">{r.text}</p>
            <div className="mt-2 flex flex-wrap gap-1">{(Object.keys(r.categories) as (keyof Review["categories"])[]).map((k) => <Badge key={k} tone={(r.categories[k] ?? 0) > 0 ? "ok" : (r.categories[k] ?? 0) < 0 ? "bad" : "neutral"}>{CAT[k]} {(r.categories[k] ?? 0) > 0 ? "+" : (r.categories[k] ?? 0) < 0 ? "−" : "0"}</Badge>)}</div>
            {r.taskId && <p className="mt-2 text-[12.5px] text-warn"><Icon name="tasks" size={13} className="mr-1 inline" />Առաջադրանք մենեջերին՝ {state.tasks.find((t) => t.id === r.taskId)?.status === "done" ? "կատարված" : "բաց"}</p>}
            <div className="mt-4 rounded-xl border border-violet/40 bg-violet-soft/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold"><Icon name="sparkles" size={15} className="text-violet" />Պատասխան{!r.reply && " · AI նախագիծ"}</div>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-28" />
              {r.reply && <div className="mt-2 flex items-center gap-2 text-[12.5px]"><Badge tone={RS[r.reply.status].tone}>{RS[r.reply.status].label}</Badge><span className="text-muted">{state.staff.find((s) => s.id === r.reply!.by)?.name ?? r.reply.by} · {hm(r.reply.at)}</span>{r.reply.status === "published_simulated" && <SimBadge />}</div>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" disabled={!text.trim()} onClick={() => dispatch({ type: "review.reply", reviewId: r.id, text, publish: false })}>Պահել նախագիծ</Button>
                {can("reviews.reply") && <Button variant="primary" icon={r.platform === "google" ? "send" : "check"} disabled={!text.trim()} onClick={() => dispatch({ type: "review.reply", reviewId: r.id, text, publish: true })}>{r.platform === "google" ? "Հաստատել և հրապարակել (սիմուլյացիա)" : "Հաստատել (տեղադրել ձեռքով)"}</Button>}
                {r.platform !== "google" && <Button variant="ghost" icon="copy" onClick={() => { navigator.clipboard?.writeText(text).catch(() => undefined); setCopied(true); }}>{copied ? "Պատճենված է" : "Պատճենել"}</Button>}
                <Button variant="ghost" onClick={() => setText(draftReviewReply(r, state.brand.name))}>Նոր նախագիծ</Button>
              </div>
              <p className="mt-2 text-[11.5px] text-faint">{REVIEW_PLATFORMS[r.platform].limits.join(" · ")}</p>
            </div>
          </Card>
        ) : <Card className="hidden lg:block"><p className="py-10 text-center text-[13px] text-muted">Ընտրեք կարծիք</p></Card>}
      </div>
      <Modal open={sim} onClose={() => setSim(false)} title="Սիմուլյացնել նոր կարծիք">
        <p className="mb-3 text-[13px] text-muted">Ցուցադրական․ ստեղծում է կարծիք այնպես, կարծես այն եկել է հարթակից։ Ցածր գնահատականը ավտոմատ առաջադրանք է ստեղծում։</p>
        <div className="space-y-2">{[
          { platform: "google" as const, rating: 2, author: "Davit K.", text: "We waited 40 minutes for the main course and the khorovats was cold. Service was friendly but slow." },
          { platform: "google" as const, rating: 5, author: "Lilit H.", text: "Հիանալի մթնոլորտ, համեղ ուտեստներ և շատ ուշադիր մատուցող։ Կվերադառնանք։" },
          { platform: "tripadvisor" as const, rating: 4, author: "Анна В.", text: "Очень вкусно и красивый вид, но цены немного высокие." },
        ].map((x) => <button key={x.text} className="w-full rounded-xl border border-line p-3 text-left hover:border-ink" onClick={() => { dispatch({ type: "review.receive", ...x }); setSim(false); setPf("all"); }}><div className="text-[12px] text-muted"><Stars n={x.rating} /> · {REVIEW_PLATFORMS[x.platform].name} · {x.author}</div><div className="text-[13.5px]">{x.text}</div></button>)}</div>
      </Modal>
    </Guard>
  );
}
