"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Bars } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, CardHead, cn, DemoDataBadge, Drawer, Kpi, Select, Tabs, Textarea } from "@/components/ui";
import { analyseReview, CATEGORY_DEPT, CATEGORY_LABEL, draftReviewReply, PLATFORM_LABEL, platformScore, REPLY_API, replyIssues, type Category } from "@/lib/ai/review-ai";
import { useDemo } from "@/lib/client/demo-store";
import { useNow } from "@/lib/client/use-now";
import { stamp } from "@/lib/format";
import { isManager } from "@/lib/hospitality-data";
import type { Review, ReviewPlatform, ReviewStatus } from "@/lib/types";

const ST: Record<ReviewStatus, [string, "warn" | "info" | "ok" | "neutral" | "violet"]> = { new: ["Նոր", "warn"], draft: ["Սևագիր", "info"], approved: ["Հաստատված", "ok"], published_demo: ["Հրապարակված (սիմ.)", "ok"], manual_required: ["Ձեռքով հրապարակել", "violet"] };
const DAY = 86400e3;

export default function Reviews() {
  const { state } = useDemo();
  const sp = useSearchParams();
  const router = useRouter();
  const now = useNow(60000);
  const [tab, setTab] = useState<"feed" | "insights" | "report">("feed");
  const [pf, setPf] = useState<ReviewPlatform | "all">("all");
  const [st, setSt] = useState<"open" | "all" | "negative">("open");
  const sel = state.reviews.find((r) => r.id === sp.get("r"));
  const list = state.reviews.filter((r) => (pf === "all" || r.platform === pf) && (st === "all" ? true : st === "negative" ? r.rating <= 3 : r.status === "new" || r.status === "draft"));
  const stats = useMemo(() => {
    const d90 = state.reviews.filter((r) => now - r.at < 90 * DAY);
    const avg = (l: Review[]) => (l.length ? l.reduce((a, r) => a + r.rating, 0) / l.length : 0);
    const byPf = (["google", "booking", "tripadvisor", "expedia"] as ReviewPlatform[]).map((p) => ({ p, n: d90.filter((r) => r.platform === p).length, avg: avg(d90.filter((r) => r.platform === p)) }));
    const cats = new Map<Category, { pos: number; neg: number }>();
    for (const r of d90) { const a = analyseReview(r); for (const c of a.categories) { const x = cats.get(c) ?? { pos: 0, neg: 0 }; if (a.negatives.includes(c)) x.neg++; else x.pos++; cats.set(c, x); } }
    const replied = state.reviews.filter((r) => r.reply?.approvedAt);
    const replyRate = state.reviews.length ? replied.length / state.reviews.length : 0;
    const replyH = replied.length ? replied.reduce((a, r) => a + (r.reply!.approvedAt! - r.at), 0) / replied.length / 3600e3 : 0;
    const sentiment = { positive: 0, mixed: 0, negative: 0 };
    d90.forEach((r) => sentiment[analyseReview(r).sentiment]++);
    return { d90, avg: avg(d90), byPf, cats: [...cats.entries()].sort((a, b) => b[1].neg - a[1].neg || b[1].pos - a[1].pos), replyRate, replyH, sentiment };
  }, [state.reviews, now]);
  const month = useMemo(() => {
    const m = state.baseDate.slice(0, 7);
    const l = state.reviews.filter((r) => new Date(r.at).toISOString().slice(0, 7) === m);
    return { m, n: l.length, avg: l.length ? l.reduce((a, r) => a + r.rating, 0) / l.length : 0, neg: l.filter((r) => r.rating <= 3).length, replied: l.filter((r) => r.reply?.approvedAt).length };
  }, [state.reviews, state.baseDate]);
  const open = state.reviews.filter((r) => r.status === "new" || r.status === "draft");
  return (
    <>
      <PageTitle title="Կարծիքներ և հեղինակություն" sub={<span className="flex flex-wrap items-center gap-2">Google, Booking.com, Tripadvisor, Expedia՝ մեկ տեղում <DemoDataBadge /><Badge tone="warn">Հարթակները միացված չեն</Badge></span>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Միջին գնահատական (90 օր)" value={`${stats.avg.toFixed(2)} / 5`} sub={`${stats.d90.length} կարծիք`} icon="star" tone="ok" />
        <Kpi label="Սպասում են պատասխանի" value={open.length} sub={`${open.filter((r) => r.rating <= 3).length} բացասական`} icon="message" tone={open.some((r) => r.rating <= 3) ? "bad" : "warn"} onClick={() => { setTab("feed"); setSt("open"); }} />
        <Kpi label="Պատասխանների մասնաբաժին" value={`${Math.round(stats.replyRate * 100)}%`} sub="հաստատված պատասխան ունեցող ÷ բոլոր կարծիքները" icon="check" />
        <Kpi label="Միջին պատասխանի ժամանակ" value={`${stats.replyH.toFixed(0)} ժ`} sub="կարծիքից մինչև պատասխանի հաստատում" icon="clock" />
      </div>
      <Tabs className="my-4 w-fit" value={tab} onChange={setTab} items={[{ id: "feed", label: "Կարծիքներ", count: open.length }, { id: "insights", label: "Վերլուծություն" }, { id: "report", label: "Ամսական հաշվետվություն" }]} />
      {tab === "feed" && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <Select className="max-w-48" value={pf} onChange={(e) => setPf(e.target.value as ReviewPlatform | "all")}><option value="all">Բոլոր հարթակները</option>{(Object.keys(PLATFORM_LABEL) as ReviewPlatform[]).map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}</Select>
            <Select className="max-w-56" value={st} onChange={(e) => setSt(e.target.value as typeof st)}><option value="open">Սպասում են պատասխանի</option><option value="negative">Բացասական (≤ 3)</option><option value="all">Բոլորը</option></Select>
          </div>
          <Card pad={false}>
            <ul className="divide-y divide-line">
              {list.length === 0 && <li className="p-10 text-center text-sm text-muted">Կարծիքներ չկան</li>}
              {list.map((r) => { const a = analyseReview(r); return (
                <li key={r.id}><button onClick={() => router.push(`/admin/reviews?r=${r.id}`)} className={cn("flex w-full flex-wrap items-start gap-3 px-4 py-3.5 text-left hover:bg-paper", r.rating <= 3 && r.status === "new" && "bg-bad-soft/40")}>
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-[13px] font-bold", r.rating >= 4 ? "bg-ok-soft text-ok" : r.rating === 3 ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad")}>{platformScore(r.platform, r.rating)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[13.5px]"><b>{r.title ?? "—"}</b><span className="text-muted">· {r.author} · {PLATFORM_LABEL[r.platform]} · {r.lang.toUpperCase()} · {stamp(r.at, state.baseDate)}</span></div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-2">{r.text}</p>
                    <div className="mt-1 flex flex-wrap gap-1">{a.categories.map((c) => <span key={c} className={cn("rounded px-1.5 text-[11px]", a.negatives.includes(c) ? "bg-bad-soft text-bad" : "bg-paper text-ink-2")}>{CATEGORY_LABEL[c]}</span>)}</div>
                  </div>
                  <Badge tone={ST[r.status][1]}>{ST[r.status][0]}</Badge>
                </button></li>); })}
            </ul>
          </Card>
        </>
      )}
      {tab === "insights" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHead title="Ըստ հարթակի (90 օր)" /><div className="mt-3"><Bars data={stats.byPf.map((x) => ({ label: `${PLATFORM_LABEL[x.p]} · ${x.n} կարծիք`, value: Math.round(x.avg * 100) / 100 }))} format={(v) => `${v.toFixed(2)} / 5`} tone="ok" /></div></Card>
          <Card><CardHead title="Տոնայնություն (90 օր)" /><div className="mt-3"><Bars data={[{ label: "Դրական", value: stats.sentiment.positive }, { label: "Խառը", value: stats.sentiment.mixed }, { label: "Բացասական", value: stats.sentiment.negative }]} /></div></Card>
          <Card className="lg:col-span-2" pad={false}>
            <div className="border-b border-line px-4 py-3"><CardHead title="Թեմաներ և պատասխանատու բաժին" sub="Ամենահաճախ բացասական թեմաները վերևում (բանալի բառերով դասակարգում)" /></div>
            <table className="w-full text-[13px]"><thead><tr className="border-b border-line text-left text-[12px] text-muted"><th className="px-4 py-2 font-medium">Թեմա</th><th className="font-medium">Դրական</th><th className="font-medium">Բացասական</th><th className="font-medium">Բաժին</th></tr></thead>
              <tbody>{stats.cats.map(([c, v]) => <tr key={c} className="border-b border-line last:border-0"><td className="px-4 py-2 font-medium">{CATEGORY_LABEL[c]}</td><td className="tnum text-ok">{v.pos}</td><td className={cn("tnum", v.neg > 0 && "font-semibold text-bad")}>{v.neg}</td><td className="text-muted">{CATEGORY_DEPT[c]}</td></tr>)}</tbody></table>
          </Card>
        </div>
      )}
      {tab === "report" && (
        <Card>
          <CardHead title={`Հեղինակության հաշվետվություն · ${month.m}`} right={<DemoDataBadge />} />
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Կարծիքներ", String(month.n)], ["Միջին", `${month.avg.toFixed(2)} / 5`], ["Բացասական (≤3)", String(month.neg)], ["Պատասխանված", `${month.replied}/${month.n}`]].map(([l, v]) => <div key={l} className="rounded-xl bg-paper p-3"><dt className="text-[12px] text-muted">{l}</dt><dd className="tnum mt-1 text-[18px] font-semibold">{v}</dd></div>)}</dl>
          <h4 className="mt-5 text-[13px] font-semibold">Գլխավոր թեմաներ (90 օր)</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-ink-2">{stats.cats.slice(0, 5).map(([c, v]) => <li key={c}>{CATEGORY_LABEL[c]}՝ {v.pos} դրական, {v.neg} բացասական → {CATEGORY_DEPT[c]}</li>)}</ul>
          <p className="mt-4 text-[12px] text-muted">Հաշվետվությունը ներառում է միայն Hotel OS-ում առկա կարծիքները։ Պատճառահետևանքային եզրակացություններ չեն արվում։ Արտահանումը PDF-ով՝ հաջորդ փուլում։</p>
        </Card>
      )}
      <ReviewDrawer r={sel} onClose={() => router.push("/admin/reviews")} />
    </>
  );
}

function ReviewDrawer({ r, onClose }: { r?: Review; onClose: () => void }) {
  const { state, dispatch, actor } = useDemo();
  const [text, setText] = useState<string | null>(null);
  const me = state.staff.find((s) => s.id === actor);
  if (!r) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const d = draftReviewReply(state, r);
  const value = text ?? r.reply?.text ?? d.text;
  const issues = replyIssues(value);
  const canApprove = !!me && isManager(me.position) && ["owner", "general_manager", "reception_manager"].includes(me.position);
  const locked = r.status === "published_demo" || r.status === "manual_required";
  return (
    <Drawer open onClose={() => { setText(null); onClose(); }} wide title={<span className="flex items-center gap-2">{r.title ?? "Կարծիք"} <Badge tone={ST[r.status][1]}>{ST[r.status][0]}</Badge></span>} sub={`${PLATFORM_LABEL[r.platform]} · ${platformScore(r.platform, r.rating)} · ${r.author} · ${stamp(r.at, state.baseDate)}`}
      footer={locked ? undefined : <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => { dispatch({ type: "review.draft", target: r.id, text: value }); setText(null); }}>Պահել սևագիրը</Button>
        <Button variant="primary" icon="check" disabled={!canApprove || r.status !== "draft" || issues.length > 0 || (text !== null && text !== r.reply?.text)} title={!canApprove ? "Հաստատել կարող է միայն ղեկավարը" : r.status !== "draft" ? "Նախ պահեք սևագիրը" : ""} onClick={() => dispatch({ type: "review.approve", target: r.id })}>{REPLY_API[r.platform] ? "Հաստատել և հրապարակել (սիմ.)" : "Հաստատել (ձեռքով հրապարակում)"}</Button>
      </div>}>
      <div className="space-y-4 text-[13.5px]">
        <p className="rounded-xl bg-paper p-4 leading-relaxed">{r.text}</p>
        <div className="flex flex-wrap gap-1.5">{d.analysis.categories.map((c) => <Badge key={c} tone={d.analysis.negatives.includes(c) ? "bad" : "neutral"}>{CATEGORY_LABEL[c]}</Badge>)}<Badge tone={d.analysis.sentiment === "positive" ? "ok" : d.analysis.sentiment === "negative" ? "bad" : "warn"}>{d.analysis.sentiment}</Badge></div>
        {r.taskId && <div className="rounded-lg bg-warn-soft px-3 py-2 text-[12.5px]">Ավտոմատացում․ ստեղծվել է առաջադրանք ղեկավարին ({r.taskId})</div>}
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[12.5px] font-semibold"><Icon name="sparkles" size={15} className="text-signal" />Պատասխան ({r.lang.toUpperCase()}) {!r.reply && <span className="font-normal text-muted">· AI սևագիր</span>}</div>
          <Textarea className="min-h-36" value={value} disabled={locked} onChange={(e) => setText(e.target.value)} />
          <ul className="mt-1.5 flex flex-wrap gap-x-3 text-[11.5px] text-muted">{d.rules.map((x) => <li key={x}>✓ {x}</li>)}</ul>
          {issues.map((i) => <p key={i} className="mt-1 text-[12px] text-bad">⚠ {i}</p>)}
        </div>
        <div className="rounded-xl border border-line p-3 text-[12.5px] text-muted">
          {REPLY_API[r.platform] ? <>{PLATFORM_LABEL[r.platform]}-ի պաշտոնական API-ն թույլ է տալիս պատասխանել (պահանջում է հաստատված մուտք/գործընկեր)։ Ցուցադրական ռեժիմում պատասխանը <b>չի հրապարակվում</b>։</> : <>{PLATFORM_LABEL[r.platform]}-ի համար պատասխանի պաշտոնական API հաստատված չէ․ հաստատումից հետո աշխատակիցը պատասխանը տեղադրում է ձեռքով հարթակի կառավարման վահանակում։</>}
          {r.reply?.approvedBy && <div className="mt-1">Հաստատել է՝ {state.staff.find((s) => s.id === r.reply!.approvedBy)?.name} · {stamp(r.reply.approvedAt!, state.baseDate)}</div>}
        </div>
      </div>
    </Drawer>
  );
}
