"use client";
/*
 * Restaurant OS presenter: guided scenarios A (QR table), B (takeaway), C (food cost), F (owner overview).
 * Three live devices on one session: guest phone, owner/manager laptop, kitchen display.
 * Every auto-action dispatches the same events a real user would; nothing is faked on screen.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Qr } from "@/components/present/qr";
import { ConnPillView } from "@/components/shared/conn-pill";
import { Device } from "@/components/shared/device-frame";
import { money } from "@/components/restaurant/staff/shell";
import { Badge, Button, cn, Input, Modal, Segmented } from "@/components/ui";
import * as A from "@/lib/restaurant/analytics";
import { useR } from "@/lib/restaurant/client";
import { tableQrUrl } from "@/lib/restaurant/qr";
import type { Lang } from "@/lib/restaurant/types";

type ScenarioId = "A" | "B" | "C" | "F";
type Step = { title: string; say: string; icon: IconName; phone?: string; laptop?: string; kds?: string; action?: { label: string; run: () => void; done?: boolean } };

const readLs = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } };
const writeLs = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const device = () => { let k = readLs("rst:device", ""); if (!k) { k = `d-${Math.random().toString(36).slice(2, 12)}`; writeLs("rst:device", k); } return k; };

export default function PresentRestaurant() {
  const R = useR();
  const { state, dispatch, session, setSession, mode, setMode, reset, conn, backend, pending } = R;
  const [scenario, setScenario] = useState<ScenarioId>("A");
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>("hy");
  const [reload, setReload] = useState(0);
  const [realPhone, setRealPhone] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [beforeAfter, setBA] = useState(false);
  const [confirm, setConfirm] = useState<null | ScenarioId | "all">(null);
  const [pin, setPin] = useState("");
  const [pinNeeded, setPinNeeded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [frames, setFrames] = useState({ phone: "/restaurant/hy", laptop: "/r/admin", kds: "/r/kds" });
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const t7 = state.tables.find((t) => t.id === "T7")!;
  const qrUrl = tableQrUrl(session, t7.token, origin);
  const myIds = () => readLs<string[]>("rst:myorders", []);
  const lastQr = useMemo(() => [...state.orders].filter((o) => o.tableId === "T7" && o.channel === "qr" && o.createdAt > state.epochAt).sort((a, b) => b.createdAt - a.createdAt)[0], [state.orders, state.epochAt]);
  const lastTa = useMemo(() => [...state.orders].filter((o) => o.channel === "website" && o.createdAt > state.epochAt && myIds().includes(o.id)).sort((a, b) => b.createdAt - a.createdAt)[0], [state.orders, state.epochAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = A.summary(state, A.periodDays(state, "today"));
  const pork = state.ingredients.find((i) => i.id === "pork")!;

  const goPhone = (p: string) => setFrames((f) => ({ ...f, phone: p }));
  const submitQr = () => {
    writeLs("rst:table", { token: t7.token, at: Date.now() });
    const ev = dispatch({ type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: t7.token, note: "", lines: [{ itemId: "khorovats", qty: 1, modifierIds: ["large", "no-onion"], note: "" }, { itemId: "salad", qty: 1, modifierIds: ["feta"], note: "" }, { itemId: "areni", qty: 2, modifierIds: [], note: "" }], deviceKey: device() });
    writeLs("rst:myorders", [`o-${ev.id}`, ...myIds()].slice(0, 20));
    goPhone(`/restaurant/${lang}/order/o-${ev.id}`); setReload((x) => x + 1);
  };
  const submitTa = () => {
    const ev = dispatch({ type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: lang === "ru" ? "Анна" : lang === "en" ? "Anna" : "Աննա", phone: "+374 00 000 777" }, pickupAt: Date.now() + 30 * 60000, note: "", lines: [{ itemId: "khorovats", qty: 1, modifierIds: [], note: "" }, { itemId: "burger", qty: 1, modifierIds: ["bacon"], note: "" }, { itemId: "lavash-basket", qty: 1, modifierIds: [], note: "" }], deviceKey: device() });
    writeLs("rst:myorders", [`o-${ev.id}`, ...myIds()].slice(0, 20));
    goPhone(`/restaurant/${lang}/order/o-${ev.id}`); setReload((x) => x + 1);
  };
  const tickets = (orderId?: string) => state.tickets.filter((t) => t.orderId === orderId && t.status !== "voided");
  const startAll = (id?: string) => tickets(id).filter((t) => t.status === "queued").forEach((t) => dispatch({ type: "ticket.start", ticketId: t.id }));
  const readyAll = (id?: string) => tickets(id).filter((t) => t.status === "queued" || t.status === "in_progress").forEach((t) => dispatch({ type: "ticket.ready", ticketId: t.id }));

  const S: Record<ScenarioId, { title: string; time: string; steps: Step[] }> = {
    A: { title: "Հյուրը պատվիրում է սեղանից (QR)", time: "≈ 4 րոպե", steps: [
      { icon: "qr", title: "Հյուրը սկանավորում է սեղան 7-ի QR կոդը", say: "Ոչ մի հավելված։ Համակարգը ինքն է ճանաչում ռեստորանը և սեղանը։ QR կոդը նույնականացնում է միայն սեղանը, ոչ թե հյուրին։", phone: `/q/${session}/${t7.token}?l=${lang}`, laptop: "/r/floor?table=T7", kds: "/r/kds" },
      { icon: "coffee", title: "Մենյու՝ լուսանկարներով, բաղադրությամբ, ալերգեններով", say: "Հյուրը ընտրում է խորոված մեծ բաժնով, առանց սոխի, աղցան ֆետայով և գինի։ Գները միայն մենյուից են, վերջացած ուտեստը հնարավոր չէ պատվիրել։", phone: `/restaurant/${lang}/menu` },
      { icon: "send", title: "Պատվերն ուղարկված է, բայց դեռ ընդունված չէ", say: "Հյուրը տեսնում է «Սպասում ենք ռեստորանի հաստատմանը»։ Մենք երբեք չենք ասում «ընդունված», քանի դեռ աշխատակիցը չի ընդունել։", action: { label: "Ավտոմատ. հյուրը ուղարկում է պատվերը", run: submitQr, done: Boolean(lastQr) } },
      { icon: "users", title: "Մատուցողը տեսնում է սեղան 7-ի պատվերը", say: "Մատուցողի հեռախոսում սեղանը նարնջագույն է՝ «Պատվեր է սպասում»։ Մեկ սեղմում՝ և պատվերը խոհանոցում է։", laptop: "/r/floor?table=T7", action: { label: "Ավտոմատ. մատուցողը ընդունում է", run: () => lastQr && dispatch({ type: "order.accept", orderId: lastQr.id }), done: Boolean(lastQr && lastQr.status !== "submitted") } },
      { icon: "flame", title: "Խոհանոցը ստանում է ճիշտ տոմսերը", say: "Խորովածը՝ մանղալին, աղցանը՝ սառը խոհանոցին, գինին՝ բարին։ Յուրաքանչյուր կայան տեսնում է միայն իր գործը, հավելումները և ալերգենները։ Պաշարը նվազել է ըստ բաղադրատոմսի։", kds: "/r/kds?station=all", action: { label: "Ավտոմատ. խոհանոցը սկսում է", run: () => startAll(lastQr?.id) } },
      { icon: "check", title: "Բոլոր կայանները պատրաստ են", say: "Հյուրի էկրանը ինքն է թարմացվում՝ «Պատրաստվում է», ապա «Պատրաստ է»։ «Պատրաստ է» ցույց է տրվում միայն երբ բոլոր կայաններն ավարտել են։", phone: lastQr ? `/restaurant/${lang}/order/${lastQr.id}` : undefined, action: { label: "Ավտոմատ. բոլոր տոմսերը պատրաստ են", run: () => readyAll(lastQr?.id) } },
      { icon: "users", title: "Մատուցողը մատուցում է", say: "Մատուցողը ստանում է ծանուցում և նշում «Մատուցված»։ Վճարումը կատարվում է Ձեր դրամարկղում, ինչպես հիմա։", laptop: "/r/floor?table=T7", action: { label: "Ավտոմատ. մատուցված է", run: () => lastQr && dispatch({ type: "order.serve", orderId: lastQr.id }) } },
      { icon: "chart", title: "Պատվերն արդեն վերլուծության մեջ է", say: `Այսօրվա վաճառքը՝ ${money(today.gross)}, որից QR՝ ${money(today.byChannel.find((c) => c.channel === "qr")?.gross ?? 0)}։ Նույն տվյալները, առանց ձեռքով հաշվարկի։`, laptop: "/r/admin" },
    ] },
    B: { title: "Առցանց պատվեր՝ տանելու համար", time: "≈ 3 րոպե", steps: [
      { icon: "globe", title: "Ռեստորանի սեփական կայքը", say: "Պրեմիում կայք՝ ռեստորանի ոճով, երեք լեզվով։ Սա Ձեր ուղիղ ալիքն է՝ առանց առաքման հարթակի միջնորդավճարի։", phone: `/restaurant/${lang}`, laptop: "/r/admin/orders" },
      { icon: "coffee", title: "Ընտրում է ուտեստներ և վերցնելու ժամ", say: "Նվազագույն պատվերը, փաթեթավորումը և ժամի գնահատականը հաշվարկվում են կարգավորված կանոններով և խոհանոցի ներկայիս ծանրաբեռնվածությամբ, ոչ թե պատահական խոստումներով։", phone: `/restaurant/${lang}/menu?mode=takeaway`, action: { label: "Ավտոմատ. հաճախորդը ուղարկում է պատվերը", run: submitTa, done: Boolean(lastTa) } },
      { icon: "check", title: "Ռեստորանն ընդունում է", say: "Պատվերը «Սպասում են ընդունման» ցուցակում է։ Մենեջերը ընդունում է, և խոհանոցը ստանում է տոմսերը։", laptop: "/r/admin/orders?tab=new", action: { label: "Ավտոմատ. ընդունել", run: () => lastTa && dispatch({ type: "order.accept", orderId: lastTa.id }) } },
      { icon: "flame", title: "Խոհանոցը պատրաստում է", say: "Նույն խոհանոցի էկրանը՝ «ՏԱՆ» նշումով։", kds: "/r/kds?station=all", action: { label: "Ավտոմատ. պատրաստել և ավարտել", run: () => { startAll(lastTa?.id); readyAll(lastTa?.id); } } },
      { icon: "bell", title: "Հաճախորդը տեսնում է «Պատրաստ է»", say: "Կարգավիճակի էջում՝ վերցնելու կոդը։ SMS-ը կպատրաստվեր ավտոմատ (ցուցադրության մեջ՝ սիմուլյացիա, չի ուղարկվում)։", phone: lastTa ? `/restaurant/${lang}/order/${lastTa.id}` : undefined, laptop: "/r/admin/automations" },
      { icon: "chart", title: "Վերցված է, տվյալները թարմացված են", say: "Գանձապահը նշում է «Վերցվեց»։ Վաճառքը և կայքի ալիքի մասնաբաժինը թարմացվում են։", laptop: "/r/admin", action: { label: "Ավտոմատ. վերցվեց", run: () => lastTa && dispatch({ type: "order.pickup", orderId: lastTa.id }) } },
    ] },
    C: { title: "Ինքնարժեք և պահեստ", time: "≈ 3 րոպե", steps: [
      { icon: "kitchen", title: "Պահեստը", say: "Պաշարը նվազում է ավտոմատ յուրաքանչյուր ընդունված պատվերով։ Կարմիրով՝ նվազագույնից ցածր բաղադրիչները։", laptop: "/r/admin/inventory" },
      { icon: "search", title: "Բաղադրիչ՝ խոզի վիզ", say: `Պաշար, գին (${money(pork.cost)}/կգ), գնի պատմություն և որ ուտեստներում է օգտագործվում։`, laptop: "/r/admin/inventory?open=pork" },
      { icon: "calc", title: "Խորովածի բաղադրատոմսը", say: "Յուրաքանչյուր բաղադրիչ՝ քանակով, ելքով և արժեքով։ Ինքնարժեք, զուտ գին առանց ԱԱՀ, համախառն շահույթ և մարժա։", laptop: "/r/admin/recipes?item=khorovats" },
      { icon: "refresh", title: "Մատակարարը բարձրացրել է գինը", say: "Նոր հաշիվ՝ 4 100 ֏/կգ։ Մուտքագրում ենք մեկ անգամ, և բոլոր բաղադրատոմսերը վերահաշվարկվում են անմիջապես։", laptop: "/r/admin/inventory?open=pork", action: { label: "Ավտոմատ. գինը՝ 4 100 ֏/կգ", run: () => dispatch({ type: "ingredient.price", ingredientId: "pork", cost: 4100, source: "invoice" }), done: pork.cost === 4100 } },
      { icon: "alert", title: "Մարժան նվազեց, տեսնում ենք ամսական ազդեցությունը", say: "Տեսնում ենք մինչև/հետո ինքնարժեքը և մարժան, ինչպես նաև ամսական ազդեցությունը փաստացի վաճառքի ծավալով։ Ծանուցում ստացավ նաև մենեջերը։", laptop: "/r/admin/recipes?item=khorovats" },
      { icon: "chart", title: "Վերլուծությունը թարմացվեց", say: "Գների փոփոխության աղյուսակում և խնայողության հաշվիչում արդեն երևում է նոր գինը։ Անցած վաճառքի ինքնարժեքը չի փոխվում։", laptop: "/r/admin/inventory?tab=prices" },
    ] },
    F: { title: "Սեփականատիրոջ առավոտը", time: "≈ 3 րոպե", steps: [
      { icon: "home", title: "Վաճառքը մեկ էկրանում", say: "Վերջին 7 օրը նախորդ շաբաթվա համեմատ, միջին չեկ, համախառն մարժա։", laptop: "/r/admin" },
      { icon: "globe", title: "Պատվերների ալիքները", say: "Մատուցող, QR, կայք. որ ալիքն է ավելի մեծ չեկ բերում։", laptop: "/r/admin/analytics?tab=sales" },
      { icon: "star", title: "Ամենավաճառվող և ամենաշահավետ ուտեստները", say: "Մենյուի ինժեներիա՝ աստղեր, աշխատող ձիեր, հանելուկներ և թույլ ուտեստներ։", laptop: "/r/admin/analytics?tab=menu" },
      { icon: "alert", title: "Ինքնարժեքի խնդիրները", say: "Որ ուտեստների մարժան է նվազել բաղադրիչների գնաճի պատճառով, և որքան։", laptop: "/r/admin/recipes" },
      { icon: "kitchen", title: "Պահեստի ազդանշաններ", say: "Ինչ է վերջանում, ինչի ժամկետն է մոտենում, և պատրաստի գնման առաջարկ։", laptop: "/r/admin/purchasing" },
      { icon: "sparkles", title: "Բարելավման հնարավորություններ", say: "Յուրաքանչյուր առաջարկ ցույց է տալիս, թե որ տվյալներից է բխում։ Խնայողության հաշվիչում թվերը բաժանված են՝ փաստացի, հաշվարկված և ենթադրական։", laptop: "/r/admin/savings" },
    ] },
  };
  const cur = S[scenario];

  const go = (i: number, sc = scenario) => {
    const s = S[sc].steps[i];
    setStep(i);
    setFrames((f) => ({ phone: s.phone ?? f.phone, laptop: s.laptop ?? f.laptop, kds: s.kds ?? f.kds }));
    setReload((x) => x + 1);
  };
  const choose = (sc: ScenarioId) => { setScenario(sc); go(0, sc); };
  const doReset = async (target: ScenarioId | "all") => {
    const r = await reset(pin || undefined);
    if (r === "pin") { setPinNeeded(true); return; }
    setConfirm(null); setPinNeeded(false);
    try { ["rst:myorders", "rst:table", "rst:cart:table", "rst:cart:takeaway"].forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    const sc = target === "all" ? "A" : target;
    setScenario(sc);
    setTimeout(() => go(0, sc), 50);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#0c0c0d] text-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <Link href="/r" className="mr-2 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white text-[12px] font-bold text-ink">R<span className="text-signal">.</span></span><span className="text-[14px] font-semibold">Restaurant OS · Ներկայացում</span></Link>
        <Segmented value={session} onChange={(v) => setSession(v)} items={[{ id: "a", label: "Ներկայացնող A" }, { id: "b", label: "Ներկայացնող B" }]} />
        <span className="[&>span]:bg-white/10 [&>span]:text-white"><ConnPillView conn={conn} mode={mode} backend={backend} pending={pending} /></span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Segmented value={lang} onChange={(l) => { setLang(l); goPhone(frames.phone.replace(/^\/restaurant\/(hy|ru|en)/, `/restaurant/${l}`)); setReload((x) => x + 1); }} items={[{ id: "hy", label: "Հայ" }, { id: "ru", label: "Рус" }, { id: "en", label: "Eng" }]} />
          <Segmented value={state.brand.theme} onChange={(v) => dispatch({ type: "brand.theme", theme: v })} items={[{ id: "fine_dining", label: "Fine dining" }, { id: "family", label: "Ընտանեկան" }]} />
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon="qr" onClick={() => setShowQr(true)}>QR սեղան 7</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon={mode === "live" ? "laptop" : "wifi"} onClick={() => setMode(mode === "live" ? "local" : "live")}>{mode === "live" ? "Տեղային ռեժիմ" : "Առցանց ռեժիմ"}</Button>
          <Button size="sm" variant="signal" icon="refresh" onClick={() => setConfirm("all")}>Վերագործարկել տվյալները</Button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-white/10">
          <div className="space-y-1.5 p-3">
            {(Object.keys(S) as ScenarioId[]).map((k) => (
              <div key={k} className={cn("flex items-center rounded-xl transition", scenario === k ? "bg-white text-ink" : "bg-white/5 hover:bg-white/10")}>
                <button onClick={() => choose(k)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-[12px] font-bold", scenario === k ? "bg-signal text-white" : "bg-white/10")}>{k}</span>
                  <span className="min-w-0"><span className="block truncate text-[13.5px] font-semibold">{S[k].title}</span><span className={cn("text-[12px]", scenario === k ? "text-muted" : "text-white/50")}>{S[k].steps.length} քայլ · {S[k].time}</span></span>
                </button>
                <button onClick={() => setConfirm(k)} title="Վերսկսել սցենարը (տվյալները՝ սկզբնական)" aria-label={`Վերսկսել սցենար ${k}`} className={cn("mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg", scenario === k ? "hover:bg-black/5" : "hover:bg-white/10")}><Icon name="refresh" size={15} /></button>
              </div>
            ))}
          </div>
          <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
            {cur.steps.map((s, i) => (
              <li key={i}>
                <button onClick={() => go(i)} className={cn("w-full rounded-xl p-3 text-left transition", step === i ? "bg-white/[0.12] ring-1 ring-signal/60" : "hover:bg-white/[0.06]")}>
                  <div className="flex items-center gap-2.5"><span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold", i < step ? "bg-ok" : step === i ? "bg-signal" : "bg-white/10")}>{i < step ? "✓" : i + 1}</span><Icon name={s.icon} size={15} className="text-white/60" /><span className="text-[13.5px] font-semibold">{s.title}</span></div>
                  {step === i && <p className="mt-2 pl-[34px] text-[13px] leading-relaxed text-white/75">{s.say}</p>}
                </button>
                {step === i && s.action && <div className="pl-[46px] pr-2 pt-1"><Button size="sm" variant={s.action.done ? "secondary" : "signal"} icon={s.action.done ? "check" : "play"} className="h-auto min-h-8 whitespace-normal py-1.5 text-left leading-snug" onClick={() => { s.action!.run(); setReload((x) => x + 1); }}>{s.action.label}</Button></div>}
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon="chevronLeft" disabled={step === 0} onClick={() => go(step - 1)}>Հետ</Button>
            <Button size="sm" variant="secondary" className="flex-1 border-0" iconRight="chevron" disabled={step === cur.steps.length - 1} onClick={() => go(step + 1)}>Հաջորդ քայլը</Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setBA(true)}>Առաջ / հետո</Button>
          </div>
        </aside>
        <main className="relative grid min-h-0 grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(200px,0.3fr)_1fr]">
          {realPhone ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <div className="text-[13px] text-white/60">Հյուրի իրական հեռախոս · սեղան 7</div>
              <div className="rounded-2xl bg-white p-3"><Qr value={qrUrl} size={200} /></div>
              <div className="max-w-60 break-all text-[12px] text-white/50">{qrUrl}</div>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setRealPhone(false)}>Ցույց տալ հեռախոսը էկրանին</Button>
            </div>
          ) : <Device src={frames.phone} w={390} h={844} kind="phone" label="Հյուրի հեռախոս" reloadKey={reload} />}
          <div className="grid min-h-0 grid-rows-[1.35fr_1fr] gap-4">
            <Device src={frames.laptop} w={1360} h={860} kind="laptop" label="Սեփականատեր / մենեջեր" reloadKey={reload} />
            <Device src={frames.kds} w={1280} h={720} kind="laptop" label="Խոհանոցի էկրան" reloadKey={reload} />
          </div>
          <div className="absolute bottom-2 left-4 flex flex-wrap items-center gap-3 text-[12px] text-white/50">
            <button onClick={() => setRealPhone(!realPhone)} className="underline-offset-2 hover:underline">{realPhone ? "Հեռախոսը էկրանին" : "Հյուրը իր հեռախոսով (QR)"}</button>
            <Badge tone="violet">Սիմուլյացված հաղորդագրություններ՝ {state.outbox.filter((o) => !o.id.includes("seed")).length}</Badge>
            <Badge tone="warn">Ցուցադրական տվյալներ · գոյություն չունեցող ռեստորան</Badge>
          </div>
        </main>
      </div>

      <Modal open={beforeAfter} onClose={() => setBA(false)} size="lg" title="Առանց համակարգի / RISEUP Restaurant OS-ով">
        <p className="mb-3 text-[13px] text-muted">Օրինակային համեմատություն, ոչ թե չափված արդյունքներ։ Իրական ազդեցությունը չափվում է պիլոտի ընթացքում՝ առաջին օրվա ելակետի համեմատ։</p>
        <div className="overflow-hidden rounded-xl border border-line text-[13px]">
          {[["Պատվերի ընդունում", "Մատուցողը գրում է թղթին, տանում խոհանոց", "Հյուրը կամ մատուցողը ուղարկում է թվային, ճիշտ կայանին"], ["Հավելումներ և ալերգիաներ", "Կարող են կորչել թղթի վրա", "Տոմսի վրա, ալերգենները՝ կարմիրով"], ["«Վերջացել է»", "Հյուրը իմանում է պատվերից հետո", "Մենյուից անհետանում է անմիջապես"], ["Ուշացումներ", "Երևում են, երբ հյուրը բողոքում է", "Ժամաչափը կարմիր է, մենեջերը տեսնում է"], ["Ինքնարժեք", "Excel, ամիսը մեկ անգամ, եթե ընդհանրապես", "Յուրաքանչյուր ուտեստի մարժան՝ գնի փոփոխության պահին"], ["Պաշար", "Իմանում եք, երբ վերջացել է", "Ազդանշան նվազագույնից ցածր, պատրաստի գնման առաջարկ"], ["Սեփականատիրոջ պատկեր", "Ամսվա վերջում, դրամարկղի հաշվետվությունից", "Ամեն առավոտ՝ ալիքներ, ուտեստներ, մարժա, հնարավորություններ"]].map(([a, b, c], i) => (
            <div key={i} className={cn("grid grid-cols-[1fr_1.2fr_1.2fr] gap-3 px-3 py-2.5", i % 2 ? "bg-paper" : "bg-surface")}><span className="font-medium">{a}</span><span className="text-bad">{b}</span><span className="text-ok">{c}</span></div>
          ))}
        </div>
      </Modal>
      <Modal open={showQr} onClose={() => setShowQr(false)} title="QR կոդ՝ սեղան 7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Qr value={qrUrl} size={240} />
          <div className="break-all text-[12px] text-muted">{qrUrl}</div>
          <p className="text-[13px] text-muted">Սեփականատերը սկանավորում է իր հեռախոսով։ Նրա պատվերը կհայտնվի այս էկրանին (պահանջվում է ինտերնետ)։</p>
          <Button variant="primary" onClick={() => { setRealPhone(true); setShowQr(false); }}>Ցույց տալ QR-ը հեռախոսի փոխարեն</Button>
        </div>
      </Modal>
      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} title={confirm === "all" ? "Վերագործարկել ցուցադրական տվյալները" : `Վերսկսել սցենար ${confirm}`} footer={<><Button variant="ghost" onClick={() => setConfirm(null)}>Չեղարկել</Button><Button variant="signal" icon="refresh" onClick={() => confirm && doReset(confirm)}>Վերագործարկել</Button></>}>
        <p className="text-[13.5px] text-muted">Այս ցուցադրության բոլոր գործողությունները կջնջվեն, տվյալները կվերադառնան սկզբնական վիճակին{confirm !== "all" ? `, և կբացվի սցենար ${confirm}-ի առաջին քայլը` : ""}։ Վերաբերում է միայն ներկայացնող {session.toUpperCase()}-ի սեսիային։</p>
        {pinNeeded && <div className="mt-3"><Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Ներկայացնողի PIN" /><div className="mt-1 text-[12px] text-bad">Պահանջվում է PIN</div></div>}
      </Modal>
    </div>
  );
}
