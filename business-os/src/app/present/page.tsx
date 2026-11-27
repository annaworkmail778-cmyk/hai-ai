"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConnPill } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { guestUrl, Qr } from "@/components/present/qr";
import { Device } from "@/components/shared/device-frame";
import { Badge, Button, cn, Input, Modal, Segmented, Toggle } from "@/components/ui";
import { greeting, respond } from "@/lib/assistant";
import { useDemo } from "@/lib/client/demo-store";
import { freeRooms } from "@/lib/pricing";
import { scenarioDates } from "@/lib/seed";
import type { Lang } from "@/lib/types";

type Step = { title: string; say: string; phone?: string; admin?: string; action?: { label: string; run: () => void }; icon: IconName };

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Present() {
  const { state, dispatch, session, setSession, mode, setMode, reset, epoch, setRole } = useDemo();
  const [scenario, setScenario] = useState<"night" | "checkout" | "question">("night");
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>("ru");
  const [phoneSrc, setPhone] = useState(`/hotel/ru`);
  const [adminSrc, setAdmin] = useState("/admin");
  const [reload, setReload] = useState(0);
  const [realPhone, setRealPhone] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [beforeAfter, setBA] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pin, setPin] = useState("");
  const [pinNeeded, setPinNeeded] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setRole("presenter"); setOrigin(window.location.origin); }, [setRole]);
  const night = state.clock.mode === "night";

  const latestInquiry = useMemo(() => [...state.reservations].filter((r) => r.status === "inquiry").sort((a, b) => b.createdAt - a.createdAt)[0], [state.reservations]);
  const latestScenario = useMemo(() => [...state.reservations].filter((r) => r.source === "assistant" && r.id.startsWith("r-")).sort((a, b) => b.createdAt - a.createdAt)[0], [state.reservations]);
  const departing = state.reservations.find((r) => r.status === "checked_in" && r.checkOut === state.baseDate);
  const convKey = `bos:conv:${session}:${epoch}`;

  const sc = scenarioDates(state.baseDate);
  const question: Record<Lang, string> = {
    ru: "Добрый вечер! Есть семейный номер на следующие выходные на 4 человек? Сколько стоит?",
    hy: "Բարի երեկո։ Ունե՞ք ընտանեկան սենյակ հաջորդ հանգստյան օրերին 4 հոգու համար։ Ինչ արժե։",
    en: "Good evening! Do you have a family room for 4 people next weekend? How much is it?",
  };

  const autoAsk = () => {
    const id = `c-${uid()}`;
    dispatch({ type: "chat.start", conversationId: id, lang });
    const post = (r: ReturnType<typeof respond>) => r.messages.forEach((m) => dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "assistant", text: m.text, at: Date.now(), intent: m.intent, cards: m.cards } }));
    post(greeting({ ...state, clock: { mode: "night" } }, lang));
    dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "guest", text: question[lang], at: Date.now() } });
    post(respond({ ...state, clock: { mode: "night" } }, lang, question[lang]));
    try { sessionStorage.setItem(convKey, id); } catch { /* ignore */ }
    setPhone(`/hotel/${lang}?chat=1`); setReload((x) => x + 1);
  };
  const autoSubmit = () => {
    let conv: string | null = null;
    try { conv = sessionStorage.getItem(convKey); } catch { /* ignore */ }
    const names: Record<Lang, [string, string]> = { ru: ["Мария", "Волкова"], hy: ["Աննա", "Մելքոնյան"], en: ["Sophie", "Laurent"] };
    const ev = dispatch({ type: "inquiry.create", guest: { firstName: names[lang][0], lastName: names[lang][1], phone: lang === "ru" ? "+7 900 000 12 34" : "+374 00 123 456", email: "", lang }, typeId: "family", checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 2, requests: lang === "ru" ? "Приедем поздно, около 22:00" : "", source: "assistant", conversationId: conv ?? undefined });
    if (conv) dispatch({ type: "chat.message", conversationId: conv, msg: { id: uid(), from: "assistant", at: Date.now(), intent: "inquiry_sent", text: lang === "ru" ? "Спасибо! Ваш запрос передан на ресепшн. Это ещё не подтверждённая бронь — ресепшн подтвердит её утром." : lang === "hy" ? "Շնորհակալություն։ Հարցումն ուղարկված է ընդունարանին։ Սա դեռ հաստատված ամրագրում չէ. ընդունարանը կհաստատի առավոտյան։" : "Thank you! Your request is with reception. It is not a confirmed booking yet — reception will confirm it in the morning.", cards: [{ kind: "inquiry", reservationId: `r-${ev.id}` }] } });
    setReload((x) => x + 1);
  };
  const autoApprove = () => {
    const r = latestScenario?.status === "inquiry" ? latestScenario : latestInquiry;
    if (!r) return;
    const room = freeRooms(state, r.typeId, r.checkIn, r.checkOut, r.id)[0];
    if (room) dispatch({ type: "reservation.approve", reservationId: r.id, roomId: room });
  };

  const SCENARIOS: Record<typeof scenario, { title: string; time: string; steps: Step[] }> = {
    night: {
      title: "Հյուրը գրում է ժամը 23:30-ին", time: "≈ 3 րոպե",
      steps: [
        { icon: "moon", title: "Գիշեր է, ընդունարանը փակ է", say: "Պատկերացրեք՝ ժամը 23:30-ն է։ Ընդունարանում ոչ ոք չկա։ Հյուրը հեռախոսով բացում է հյուրանոցի կայքը։", phone: `/hotel/${lang}`, admin: "/admin", action: { label: night ? "Գիշերային ռեժիմը միացված է" : "Միացնել գիշերային ռեժիմը (23:30)", run: () => dispatch({ type: "clock.set", mode: "night" }) } },
        { icon: "sparkles", title: "Հյուրը հարցնում է օգնականին", say: "Հյուրը հարցնում է ընտանեկան սենյակի և գնի մասին։ Կարող եք գրել հարցը հեռախոսում կամ սեղմել «Ավտոմատ»։", phone: `/hotel/${lang}?chat=1`, action: { label: "Ավտոմատ. հյուրը գրում է հարցը", run: autoAsk } },
        { icon: "check", title: "Օգնականը պատասխանում է տվյալներով", say: "Օգնականը ցույց է տալիս ազատ սենյակները և ճշգրիտ գինը հյուրանոցի գնացուցակից։ Այն ոչինչ չի հորինում և ամրագրում չի հաստատում։" },
        { icon: "send", title: "Հյուրն ուղարկում է հարցումը", say: "Հյուրը լրացնում է անունն ու հեռախոսը։ Էկրանին՝ «Հարցումը ստացվել է, դեռ հաստատված չէ»։", action: { label: "Ավտոմատ. ուղարկել հարցումը", run: autoSubmit } },
        { icon: "bell", title: "Հարցումը վահանակում է", say: "Առավոտյան ընդունարանը տեսնում է հարցումը մեկ ցուցակում՝ զրույցի հետ միասին։ Ոչինչ չի կորել ինչ-որ մեկի հեռախոսում։", admin: "/admin" },
        { icon: "users", title: "Աշխատակիցը ստուգում և հաստատում է", say: "Աշխատակիցը ընտրում է ազատ սենյակը և հաստատում մեկ սեղմումով։ Որոշումը միշտ մարդունն է։", admin: latestInquiry ? `/admin/reservations?status=inquiry&open=${(latestScenario?.status === "inquiry" ? latestScenario : latestInquiry).id}` : "/admin/reservations?status=inquiry", action: { label: "Ավտոմատ. հաստատել առաջին ազատ սենյակով", run: autoApprove } },
        { icon: "calendar", title: "Ամրագրումը օրացույցում է", say: "Օրացույցն ու սենյակի կարգավիճակը թարմացվեցին ավտոմատ։ Կրկնակի ամրագրում հնարավոր չէ։", admin: "/admin/calendar" },
        { icon: "broom", title: "Մաքրության առաջադրանքը ստեղծվեց", say: "Համակարգը ինքն է ստեղծել սենյակի պատրաստման առաջադրանքը ժամանման օրվա համար և նշանակել ամենաքիչ ծանրաբեռնված հավաքարարին։", admin: "/admin/housekeeping?day=upcoming" },
        { icon: "mail", title: "Հյուրը ստանում է հաստատում", say: "Հաստատման հաղորդագրությունը պատրաստված է, իսկ նախաժամանման հաղորդագրությունը՝ պլանավորված։ Ցուցադրության մեջ դրանք չեն ուղարկվում (սիմուլյացիա)։ Հյուրի զրույցում կարգավիճակը փոխվեց «Հաստատված»։", admin: "/admin/automations" },
        { icon: "chart", title: "Մենեջերը տեսնում է ամբողջ պատկերը", say: "Զբաղվածություն, ժամանումներ, առաջադրանքներ, եկամուտ՝ ամեն ինչ թարմացվել է։ Այս ամենը՝ առանց զանգերի և տետրերի։", admin: "/admin", action: { label: "Վերադարձնել ցերեկային ռեժիմ", run: () => dispatch({ type: "clock.set", mode: "live" }) } },
      ],
    },
    checkout: {
      title: "Հյուրի մեկնում և ավտոմատ մաքրություն", time: "≈ 1.5 րոպե",
      steps: [
        { icon: "logOut", title: "Այսօրվա մեկնումները", say: "Ընդհանուր պատկերում տեսնում ենք, թե ովքեր են այսօր մեկնում։", admin: "/admin" },
        { icon: "check", title: "Գրանցել մեկնումը", say: `Ընդունարանը սեղմում է «Մեկնեց»${departing ? ` (սենյակ ${departing.roomId})` : ""}։ Ուրիշ ոչինչ անել պետք չէ։`, action: departing ? { label: `Ավտոմատ. մեկնում՝ սենյակ ${departing.roomId}`, run: () => dispatch({ type: "reservation.checkout", reservationId: departing.id }) } : undefined },
        { icon: "broom", title: "Առաջադրանքը հավաքարարի մոտ է", say: "Մաքրման առաջադրանքը ստեղծվեց ավտոմատ։ Եթե նույն օրը նոր հյուր է գալիս, առաջադրանքը նշվում է «Շտապ»։", admin: "/admin/housekeeping" },
        { icon: "bed", title: "Սենյակը պատրաստ է", say: "Հավաքարարը նշում է «Ավարտել», և ընդունարանը անմիջապես տեսնում է, որ սենյակը մաքուր է։", admin: "/admin/rooms" },
        { icon: "star", title: "Կարծիքի հարցում", say: "Վաղը առավոտյան հյուրին կգնա շնորհակալություն և կարծիքի խնդրանք (ցուցադրության մեջ՝ պլանավորված սիմուլյացիա)։", admin: "/admin/automations" },
      ],
    },
    question: {
      title: "Հարց, որին օգնականը չգիտի պատասխանը", time: "≈ 1 րոպե",
      steps: [
        { icon: "message", title: "Հյուրը տալիս է անսովոր հարց", say: "Օրինակ՝ «Do you have an EV charging station?»։ Օգնականը չունի հաստատված պատասխան և չի հորինում։", phone: `/hotel/en?chat=1`, action: { label: "Ավտոմատ. հյուրը հարցնում է", run: () => {
          const id = `c-${uid()}`;
          dispatch({ type: "chat.start", conversationId: id, lang: "en" });
          dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "guest", text: "Hi! Can I rent a sled for the kids at the hotel?", at: Date.now() } });
          const r = respond(state, "en", "Hi! Can I rent a sled for the kids at the hotel?");
          r.messages.forEach((m) => dispatch({ type: "chat.message", conversationId: id, msg: { id: uid(), from: "assistant", text: m.text, at: Date.now(), intent: m.intent } }));
          if (r.action?.type === "handoff") dispatch({ type: "chat.handoff", conversationId: id, question: r.action.question });
          try { sessionStorage.setItem(convKey, id); } catch { /* ignore */ }
          setPhone("/hotel/en?chat=1"); setReload((x) => x + 1);
        } } },
        { icon: "tasks", title: "Հարցը փոխանցվեց անձնակազմին", say: "Ստեղծվեց առաջադրանք ընդունարանին և ծանուցում վահանակում։", admin: "/admin/staff" },
        { icon: "send", title: "Աշխատակիցը պատասխանում է", say: "Աշխատակիցը պատասխանում է վահանակից, և պատասխանը հայտնվում է հյուրի զրույցում։ Այնուհետև պատասխանը կարելի է ավելացնել գիտելիքների բազայում։", admin: "/admin/assistant?open=" + (state.conversations.find((c) => c.status === "handoff")?.id ?? "") },
      ],
    },
  };
  const cur = SCENARIOS[scenario];
  const go = (i: number) => {
    setStep(i);
    const s = cur.steps[i];
    if (s.phone && s.phone !== phoneSrc) setPhone(s.phone);
    if (s.admin) { setAdmin(s.admin); setReload((x) => x + 1); }
  };
  const doReset = async () => {
    const r = await reset(pin || undefined);
    if (r === "pin") { setPinNeeded(true); return; }
    setConfirmReset(false); setPinNeeded(false); setStep(0); setScenario("night");
    try { Object.keys(sessionStorage).filter((k) => k.startsWith("bos:conv:")).forEach((k) => sessionStorage.removeItem(k)); } catch { /* ignore */ }
    setPhone(`/hotel/${lang}`); setAdmin("/admin"); setReload((x) => x + 1);
  };
  const sessionAuto = state.outbox.filter((o) => o.id.includes("-")).length + state.activity.filter((a) => a.automated && a.id.includes("-")).length;
  const url = guestUrl(session, origin);

  return (
    <div className="flex h-dvh flex-col bg-[#0c0c0d] text-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <Link href="/" className="mr-2 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white text-[12px] font-bold text-ink">R<span className="text-signal">.</span></span><span className="text-[14px] font-semibold">Hotel OS · Ներկայացում</span></Link>
        <Segmented value={session} onChange={(v) => setSession(v)} items={[{ id: "a", label: "Ներկայացնող A" }, { id: "b", label: "Ներկայացնող B" }]} />
        <div className="[&>span]:bg-white/10 [&>span]:text-white"><ConnPill /></div>
        <label className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-[12.5px]"><Icon name="moon" size={14} />23:30<Toggle on={night} onChange={(v) => dispatch({ type: "clock.set", mode: v ? "night" : "live" })} label="Գիշերային ռեժիմ" /></label>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Segmented value={lang} onChange={(l) => { setLang(l); setPhone(`/hotel/${l}`); }} items={[{ id: "hy", label: "Հայ" }, { id: "ru", label: "Рус" }, { id: "en", label: "Eng" }]} />
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon="qr" onClick={() => setShowQr(true)}>QR հյուրի համար</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon={mode === "live" ? "laptop" : "wifi"} onClick={() => setMode(mode === "live" ? "local" : "live")}>{mode === "live" ? "Անցնել տեղային ռեժիմի" : "Անցնել առցանց ռեժիմի"}</Button>
          <Button size="sm" variant="signal" icon="refresh" onClick={() => setConfirmReset(true)}>Վերագործարկել</Button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-white/10">
          <div className="space-y-1.5 p-3">
            {(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map((k, i) => (
              <button key={k} onClick={() => { setScenario(k); setStep(0); const s = SCENARIOS[k].steps[0]; if (s.phone) setPhone(s.phone); if (s.admin) setAdmin(s.admin); setReload((x) => x + 1); }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", scenario === k ? "bg-white text-ink" : "bg-white/5 hover:bg-white/10")}>
                <span className={cn("grid size-7 place-items-center rounded-lg text-[12px] font-bold", scenario === k ? "bg-signal text-white" : "bg-white/10")}>{i + 1}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-semibold">{SCENARIOS[k].title}</span><span className={cn("text-[12px]", scenario === k ? "text-muted" : "text-white/50")}>{SCENARIOS[k].steps.length} քայլ · {SCENARIOS[k].time}</span></span>
              </button>
            ))}
          </div>
          <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
            {cur.steps.map((s, i) => (
              <li key={i}>
                <button onClick={() => go(i)} className={cn("w-full rounded-xl p-3 text-left transition", step === i ? "bg-white/[0.12] ring-1 ring-signal/60" : "hover:bg-white/[0.06]")}>
                  <div className="flex items-center gap-2.5"><span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold", i < step ? "bg-ok" : step === i ? "bg-signal" : "bg-white/10")}>{i < step ? "✓" : i + 1}</span><Icon name={s.icon} size={15} className="text-white/60" /><span className="text-[13.5px] font-semibold">{s.title}</span></div>
                  {step === i && <p className="mt-2 pl-[34px] text-[13px] leading-relaxed text-white/75">{s.say}</p>}
                </button>
                {step === i && s.action && <div className="pl-[46px] pr-2 pt-1"><Button size="sm" variant="signal" icon="play" className="h-auto min-h-8 whitespace-normal py-1.5 text-left leading-snug" onClick={s.action.run}>{s.action.label}</Button></div>}
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" icon="chevronLeft" disabled={step === 0} onClick={() => go(step - 1)}>Հետ</Button>
            <Button size="sm" variant="secondary" className="flex-1 border-0" iconRight="chevron" disabled={step === cur.steps.length - 1} onClick={() => go(step + 1)}>Հաջորդ քայլը</Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setBA(!beforeAfter)}>Առաջ / հետո</Button>
          </div>
        </aside>
        <main className="relative grid min-h-0 grid-cols-1 gap-5 p-5 md:grid-cols-[minmax(220px,0.36fr)_1fr]">
          {realPhone ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <div className="text-[13px] text-white/60">Հյուրի իրական հեռախոս</div>
              <div className="rounded-2xl bg-white p-3"><Qr value={url} size={210} /></div>
              <div className="max-w-60 break-all text-[12px] text-white/50">{url}</div>
              <p className="text-[12.5px] text-white/60">Սկանավորեք տիրոջ հեռախոսով։ Նրա գործողությունները կհայտնվեն վահանակում մի քանի վայրկյանում (առցանց ռեժիմ)։</p>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setRealPhone(false)}>Ցույց տալ հեռախոսը էկրանին</Button>
            </div>
          ) : <Device src={phoneSrc} w={390} h={844} kind="phone" label="Հյուրի հեռախոս" reloadKey={reload} />}
          <Device src={adminSrc} w={1360} h={860} kind="laptop" label="Հյուրանոցի վահանակ" reloadKey={reload} />
          <div className="absolute bottom-3 left-5 flex items-center gap-3 text-[12px] text-white/50">
            <label className="flex items-center gap-2"><Toggle on={realPhone} onChange={setRealPhone} label="Իրական հեռախոս" />Հյուրը իր հեռախոսով</label>
            <Badge tone="violet"><Icon name="zap" size={12} />Այս ցուցադրության ավտոմատ գործողություններ՝ {sessionAuto}</Badge>
          </div>
        </main>
      </div>

      <Modal open={beforeAfter} onClose={() => setBA(false)} size="lg" title="Առանց համակարգի / RISEUP Hotel OS-ով">
        <p className="mb-3 text-[13px] text-muted">Օրինակային համեմատություն. ժամանակները գնահատականներ են, ոչ թե չափված արդյունքներ։ Իրական թվերը չափվում են պիլոտի ընթացքում։</p>
        <div className="overflow-hidden rounded-xl border border-line text-[13px]">
          {[
            ["Հյուրը գրում է 23:30-ին", "Պատասխանը՝ առավոտյան (≈ 9 ժամ հետո). հյուրը կարող է ամրագրել այլ տեղ", "Պատասխան՝ անմիջապես, հարցումը պահպանված է"],
            ["Ազատ սենյակի ստուգում", "Տետր կամ Excel, զանգ գործընկերոջը", "Ազատ սենյակները երևում են ավտոմատ"],
            ["Ամրագրման հաստատում", "Գրանցում, առանձին հաղորդագրություն հյուրին (≈ 10 րոպե)", "Մեկ սեղմում (≈ 1 րոպե)"],
            ["Սենյակի պատրաստում", "Զանգ հավաքարարին, կարող է մոռացվել", "Առաջադրանքը ստեղծվում է ավտոմատ"],
            ["Մեկնում և մաքրություն", "Ընդունարանը զանգում է, սենյակը պատրաստ է ուշ", "Առաջադրանք՝ շտապության նշումով"],
            ["Կարծիքի հարցում", "Սովորաբար չի արվում", "Պլանավորվում է ավտոմատ"],
            ["Եկամտի և զբաղվածության պատկեր", "Ամսվա վերջում, ձեռքով հաշվարկ", "Ամեն օր, մեկ էկրանում"],
          ].map(([a, b, c], i) => (
            <div key={i} className={cn("grid grid-cols-[1fr_1.2fr_1.2fr] gap-3 px-3 py-2.5", i % 2 ? "bg-paper" : "bg-surface")}>
              <span className="font-medium">{a}</span><span className="text-bad">{b}</span><span className="text-ok">{c}</span>
            </div>
          ))}
        </div>
      </Modal>
      <Modal open={showQr} onClose={() => setShowQr(false)} title="QR կոդ հյուրի հեռախոսի համար">
        <div className="flex flex-col items-center gap-3 text-center">
          <Qr value={url} size={240} />
          <div className="break-all text-[12px] text-muted">{url}</div>
          <p className="text-[13px] text-muted">Ներկայացնող {session.toUpperCase()}-ի սեսիա։ Հյուրի գործողությունները կհայտնվեն այս վահանակում (պահանջում է ինտերնետ երկու սարքերում)։</p>
          <Button variant="primary" onClick={() => { setRealPhone(true); setShowQr(false); }}>Ցույց տալ QR-ը հեռախոսի փոխարեն</Button>
        </div>
      </Modal>
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Վերագործարկել ցուցադրությունը" footer={<><Button variant="ghost" onClick={() => setConfirmReset(false)}>Չեղարկել</Button><Button variant="signal" icon="refresh" onClick={doReset}>Վերագործարկել</Button></>}>
        <p className="text-[13.5px] text-muted">Բոլոր գործողությունները (հարցումներ, հաստատումներ, առաջադրանքներ) կջնջվեն, և ցուցադրությունը կսկսվի նախնական տվյալներից։ Սա վերաբերում է միայն ներկայացնող {session.toUpperCase()}-ի սեսիային։</p>
        {pinNeeded && <div className="mt-3"><Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Ներկայացնողի PIN" /><div className="mt-1 text-[12px] text-bad">Պահանջվում է PIN</div></div>}
      </Modal>
    </div>
  );
}
