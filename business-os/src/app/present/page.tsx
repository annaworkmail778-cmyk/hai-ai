"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConnPill } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { guestUrl, Qr } from "@/components/present/qr";
import { Badge, Button, cn, Input, Modal, Segmented, Toggle } from "@/components/ui";
import { greeting, respond } from "@/lib/assistant";
import { useDemo } from "@/lib/client/demo-store";
import { freeRooms } from "@/lib/pricing";
import { scenarioDates } from "@/lib/seed";
import type { Lang } from "@/lib/types";

type Step = { title: string; say: string; phone?: string; admin?: string; action?: { label: string; run: () => void }; icon: IconName };

const uid = () => Math.random().toString(36).slice(2, 10);
type ScenarioId = "night" | "checkout" | "question" | "booking" | "dining" | "qr" | "vip" | "onboarding" | "comms";

/** Renders a page at a fixed "device" size and scales it to fit its box. */
function Device({ src, w, h, kind, label, reloadKey }: { src: string; w: number; h: number; kind: "phone" | "laptop"; label: string; reloadKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(el.clientWidth / w, el.clientHeight / h)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-white/50"><Icon name={kind === "phone" ? "smartphone" : "laptop"} size={14} />{label}</div>
      <div ref={box} className="relative min-h-0 flex-1">
        <div className={cn("absolute left-1/2 top-0 origin-top overflow-hidden bg-black shadow-[0_30px_80px_rgb(0_0_0/0.5)]", kind === "phone" ? "rounded-[44px] border-[10px] border-[#1d1d1f]" : "rounded-xl border-[8px] border-[#1d1d1f]")} style={{ width: w + (kind === "phone" ? 20 : 16), height: h + (kind === "phone" ? 20 : 16), transform: `translateX(-50%) scale(${scale})` }}>
          <iframe key={src + reloadKey} src={src} title={label} className="block bg-white" style={{ width: w, height: h, border: 0 }} />
        </div>
      </div>
    </div>
  );
}

export default function Present() {
  const { state, dispatch, session, setSession, mode, setMode, reset, epoch, setRole, setActor } = useDemo();
  const [scenario, setScenario] = useState<ScenarioId>("night");
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

  /* ---- helpers for the Hospitality OS journeys (they write the same device-local demo identity the guest/staff UIs use) ---- */
  const [ids, setIds] = useState<Record<string, string>>({});
  const remember = (k: string, v: string) => setIds((x) => ({ ...x, [k]: v }));
  const lsSet = (k: string, v: unknown) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("bos-guest")); } catch { /* ignore */ } };
  const signGuest = (accId: string | null) => lsSet(`bos:guest:${session}`, accId);
  const staffAs = (id: string) => { setActor(id); try { localStorage.setItem("bos:staff:in", "1"); } catch { /* ignore */ } };
  const show = (phone?: string, admin?: string) => { if (phone) setPhone(phone); if (admin) setAdmin(admin); setReload((x) => x + 1); };
  const inHouse = state.reservations.find((r) => r.status === "checked_in" && r.roomId && /^\d/.test(r.roomId));
  const inHouseName = inHouse ? state.guests.find((g) => g.id === inHouse.guestId)?.lastName : "";
  const newOrder = state.orders.find((o) => o.id === ids.order);
  const newSr = state.services.find((x) => x.id === ids.sr);
  const newEmp = state.staff.find((x) => x.id === ids.emp);
  const newEnr = newEmp ? state.enrollments.filter((e) => e.employeeId === newEmp.id) : [];
  const vipRes = state.reservations.find((r) => r.id === ids.vipRes);
  const bookRes = state.reservations.find((r) => r.id === ids.bookRes);
  const elena: Record<Lang, [string, string]> = { ru: ["Елена", "Арутюнян"], hy: ["Էլենա", "Հարությունյան"], en: ["Elena", "Harutyunyan"] };
  const autoRegisterAndBook = () => {
    const accId = `acc-${uid()}`;
    const email = `elena.${uid().slice(0, 4)}@example.com`;
    const guest = { firstName: elena[lang][0], lastName: elena[lang][1], phone: `+374 00 ${Math.floor(100000 + Math.random() * 899999)}`, email, lang };
    dispatch({ type: "account.register", accountId: accId, email, marketing: true, guest });
    const ev = dispatch({ type: "booking.create", source: "website", input: { guest, typeId: "deluxe", rooms: 1, checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 0, extras: [{ id: "spa", qty: 1 }, { id: "transfer", qty: 1 }], requests: "" } });
    signGuest(accId); remember("bookRes", `r-${ev.id}`);
    show(`/hotel/${lang}/account`, "/admin/reservations?status=inquiry");
  };
  const approve = (r?: typeof bookRes) => { if (!r || r.status !== "inquiry") return; const room = freeRooms(state, r.typeId, r.checkIn, r.checkOut, r.id)[0]; if (room) dispatch({ type: "reservation.approve", reservationId: r.id, roomId: room }); };
  const advanceOrder = (to: "accepted" | "preparing" | "ready" | "completed") => { if (newOrder) dispatch({ type: "order.status", target: newOrder.id, status: to }); };
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
    booking: {
      title: "Նոր հյուր․ հաշիվ և ուղիղ ամրագրում", time: "≈ 3 րոպե",
      steps: [
        { icon: "globe", title: "Հյուրը բացում է կայքը", say: "Պրեմիում կայք՝ սենյակներ, սպա, ռեստորան, անդամակցություն։ Հյուրը սեղմում է «Ստուգել հասանելիությունը»։", phone: `/hotel/${lang}`, admin: "/admin" },
        { icon: "calendar", title: "Ամրագրման քայլերը", say: "Ամսաթվեր → սենյակ (իրական հասանելիությամբ) → լրացուցիչ ծառայություններ → տվյալներ → գնի մանրամասն հաշվարկ և չեղարկման պայմաններ։", phone: `/hotel/${lang}/booking?in=${sc.checkIn}&out=${sc.checkOut}&a=2&c=0` },
        { icon: "user", title: "Գրանցում և հարցում", say: "Հյուրը գրանցվում է Pine Ridge Circle-ում (+500 միավոր) և ուղարկում ամրագրման հարցումը սպա և տրանսֆեր ծառայություններով։ Կարգավիճակը՝ «Սպասում է հաստատման», վճարում չի կատարվում։", action: { label: "Ավտոմատ. գրանցել և ուղարկել", run: autoRegisterAndBook } },
        { icon: "check", title: "Ընդունարանը հաստատում է", say: "Վահանակում հայտը իր լրացուցիչ ծառայություններով և հաշվարկով։ Սենյակը ընտրվում է, մաքրության առաջադրանքը ստեղծվում է ավտոմատ։", admin: bookRes ? `/admin/reservations?open=${bookRes.id}` : "/admin/reservations?status=inquiry", action: { label: bookRes?.status === "confirmed" ? "Հաստատված է ✓" : "Ավտոմատ. հաստատել", run: () => approve(bookRes) } },
        { icon: "star", title: "Հյուրի անձնական էջը", say: "Հյուրը տեսնում է հաստատված ամրագրումը, միավորները և մակարդակը։ Միավորներ կեցության համար տրվում են միայն մեկնելուց հետո (ավարտված գործարք)։", phone: `/hotel/${lang}/account` },
      ],
    },
    dining: {
      title: "Ռեստորանի պատվեր → խոհանոց (KDS)", time: "≈ 2 րոպե",
      steps: [
        { icon: "qr", title: "Հյուրը սկանավորում է սեղանի QR-ը", say: "Մենյուն լուսանկարներով, ալերգեններով և տարբերակներով։ Սեղանը արդեն ընտրված է QR-ից։", phone: `/hotel/${lang}/dining?table=T3`, admin: "/kds" },
        { icon: "send", title: "Պատվերն ուղարկվում է", say: "Ստեյք և գինի, մեկնաբանություն խոհանոցին։ Պատվերը ակնթարթորեն հայտնվում է խոհանոցի էկրանին։", action: { label: newOrder ? `Պատվեր ${newOrder.code} ✓` : "Ավտոմատ. պատվիրել սեղան 3-ից", run: () => { const ev = dispatch({ type: "order.create", order: { type: "dine_in", tableId: "T3", guestName: elena[lang][0], items: [{ itemId: "steak", qty: 1, options: [] }, { itemId: "wine", qty: 2, options: [] }], note: "Medium rare, please" } }); remember("order", `o-${ev.id}`); show(`/hotel/${lang}/order/o-${ev.id}`, "/kds"); } } },
        { icon: "flame", title: "Խոհանոցը ընդունում և պատրաստում է", say: "Խոհարարը սեղմում է «Ընդունել», «Սկսել»։ Հյուրը տեսնում է կարգավիճակը իրական ժամանակում։", action: { label: "Ավտոմատ. ընդունել և սկսել", run: () => { advanceOrder("accepted"); setTimeout(() => advanceOrder("preparing"), 400); } } },
        { icon: "check", title: "Պատրաստ է և մատուցված", say: "«Պատրաստ է» → մատուցողը նշում է «Մատուցված է»։ Վաճառքը հաշվվում է ռեստորանի վերլուծության մեջ։", action: { label: "Ավտոմատ. պատրաստ → մատուցված", run: () => { advanceOrder("ready"); setTimeout(() => advanceOrder("completed"), 600); } } },
        { icon: "chart", title: "Ռեստորանի ցուցանիշներ", say: "Եկամուտ, միջին չեկ, ամենավաճառվող ուտեստներ՝ բանաձևերով։", admin: "/admin/restaurant" },
      ],
    },
    qr: {
      title: "Սենյակի QR․ թարմ սրբիչներ", time: "≈ 2 րոպե",
      steps: [
        { icon: "qr", title: "Հյուրը սկանավորում է սենյակի QR-ը", say: `QR-ը պարունակում է միայն սենյակի համարը՝ ոչ մի անձնական տվյալ։ Հյուրը հաստատում է կեցությունը ազգանունով${inHouseName ? ` (ցուցադրական՝ «${inHouseName}»)` : ""}։`, phone: inHouse ? `/hotel/${lang}/stay?room=${inHouse.roomId}` : `/hotel/${lang}/stay`, admin: "/admin/requests" },
        { icon: "check", title: "Կեցությունը հաստատված է", say: "Հյուրը տեսնում է ծառայությունները՝ սրբիչներ, մաքրում, տեխնիկական խնդիր, արթնացում, ուտելիք սենյակ։", action: inHouse ? { label: "Ավտոմատ. հաստատել կեցությունը", run: () => { lsSet(`bos:stay:${session}`, { roomId: inHouse.roomId, reservationId: inHouse.id }); show(`/hotel/${lang}/stay?room=${inHouse.roomId}`); } } : undefined },
        { icon: "bath", title: "Խնդրանք՝ թարմ սրբիչներ", say: "Խնդրանքը ավտոմատ ուղղվում է մաքրության բաժին։", action: inHouse ? { label: newSr ? `${newSr.code} ✓` : "Ավտոմատ. խնդրել սրբիչներ", run: () => { const ev = dispatch({ type: "service.create", serviceType: "towels", roomId: inHouse.roomId!, guestId: inHouse.guestId, note: "2 large towels" }); remember("sr", `sr-${ev.id}`); show(undefined, "/admin/requests"); } } : undefined },
        { icon: "smartphone", title: "Հավաքարարը ստանում է առաջադրանքը", say: "Լիլիթի հեռախոսում (աշխատակցի հավելված) հարցումը «Իմ գործերը» ցուցակում է։ Նա սեղմում է «Սկսել», ապա «Կատարված է»։", phone: "/staff", action: { label: "Ավտոմատ. Լիլիթը վերցնում և կատարում է", run: () => { staffAs("s-lilit"); if (newSr) { dispatch({ type: "service.assign", target: newSr.id, assigneeId: "s-lilit" }); dispatch({ type: "service.status", target: newSr.id, status: "in_progress" }); setTimeout(() => dispatch({ type: "service.status", target: newSr.id, status: "done" }), 900); } show("/staff"); } } },
        { icon: "check", title: "Հյուրը տեսնում է «Կատարված է»", say: "Կարգավիճակը թարմացվեց հյուրի էջում, իսկ մենեջերը տեսնում է կատարման ժամանակը։", phone: inHouse ? `/hotel/${lang}/stay?room=${inHouse.roomId}` : undefined, admin: "/admin/requests" },
      ],
    },
    vip: {
      title: "Վերադարձող VIP հյուր և անձնական առավելություն", time: "≈ 2 րոպե",
      steps: [
        { icon: "star", title: "James-ը մուտք է գործում", say: "Պլատինե մակարդակ, 9 կեցություն, միավորներ և անձնական առաջարկներ։", phone: "/hotel/en/account", admin: "/admin/loyalty", action: { label: "Ավտոմատ. մուտք որպես James", run: () => { signGuest("acc-james"); show("/hotel/en/account"); } } },
        { icon: "sparkles", title: "Փոխանակում է միավորները պարգևի", say: "«20% զեղչ կեցության համար (Ոսկի+)»՝ 5 000 միավոր։ Ստեղծվում է վաուչեր։", action: { label: "Ավտոմատ. ստանալ պարգևը", run: () => dispatch({ type: "loyalty.redeem", guestId: "g-james", rewardId: "rw-vip" }) } },
        { icon: "calendar", title: "Ամրագրում վաուչերով", say: "Ամրագրման հաշվարկում երևում են անդամի զեղչը, արշավը և վաուչերը (առավելագույնը 50%)։", action: { label: vipRes ? `${vipRes.code} ✓` : "Ավտոմատ. ամրագրել շալե", run: () => { const v = state.vouchers.find((x) => x.guestId === "g-james" && x.status === "active" && x.rewardId === "rw-vip"); const g = state.guests.find((x) => x.id === "g-james")!; const ev = dispatch({ type: "booking.create", source: "website", input: { guest: { firstName: g.firstName, lastName: g.lastName, phone: g.phone, email: g.email, lang: "en" }, guestId: g.id, typeId: "chalet", rooms: 1, checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 0, extras: [{ id: "romance", qty: 1 }], voucherId: v?.id, requests: "High floor, extra pillow" } }); remember("vipRes", `r-${ev.id}`); show("/hotel/en/account", `/admin/reservations?open=r-${ev.id}`); } } },
        { icon: "users", title: "Ընդունարանը տեսնում է VIP-ը", say: "Զեղչը, վաուչերը և նախասիրությունները (բարձր հարկ, լրացուցիչ բարձ) տեսանելի են։ Հաստատելուց հետո վաուչերը դառնում է «օգտագործված»։", admin: vipRes ? `/admin/reservations?open=${vipRes.id}` : "/admin/reservations", action: { label: vipRes?.status === "confirmed" ? "Հաստատված է ✓" : "Ավտոմատ. հաստատել", run: () => approve(vipRes) } },
      ],
    },
    onboarding: {
      title: "Նոր աշխատակցի onboarding", time: "≈ 3 րոպե",
      steps: [
        { icon: "users", title: "Մենեջերը ավելացնում է աշխատակից", say: "Նոր մատուցող՝ Նարե։ Համակարգը նշանակում է «Բարի գալուստ» և ռեստորանի մոդուլները, ստեղծում զրույց ղեկավարի հետ։", admin: "/admin/team", action: { label: newEmp ? `${newEmp.name} ✓` : "Ավտոմատ. ավելացնել Նարեին", run: () => { const ev = dispatch({ type: "employee.create", name: "Նարե Հովհաննիսյան", phone: "+374 00 222 333", email: "nare@example.com", dept: "restaurant", position: "waiter", supervisorId: "s-tatev" }); remember("emp", `s-${ev.id}`); show(undefined, "/admin/team"); } } },
        { icon: "smartphone", title: "Նարեն բացում է հավելվածը", say: "Հեռախոսում՝ ուսուցման ծրագիրը․ դասեր, ստուգաթերթեր, թեստ (≥70%)։", phone: "/staff/learn", action: newEmp ? { label: "Մուտք որպես Նարե", run: () => { staffAs(newEmp.id); show("/staff/learn"); } } : undefined },
        { icon: "check", title: "Անցնում է քայլերը և ուղարկում", say: "Բոլոր քայլերը կատարված են, թեստը՝ 100%։ Մոդուլները ուղարկվում են ղեկավարի ստուգման։", action: newEnr.length ? { label: "Ավտոմատ. ավարտել և ուղարկել", run: () => { for (const e of newEnr) { const m = state.training.find((x) => x.id === e.moduleId); for (const st of m?.steps ?? []) dispatch({ type: "training.step", enrollmentId: e.id, stepId: st.id, score: st.kind === "quiz" ? 100 : undefined }); dispatch({ type: "training.submit", enrollmentId: e.id }); } show("/staff/learn"); } } : undefined },
        { icon: "star", title: "Ղեկավարը հաստատում է", say: "Թաթևը (ռեստորանի մենեջեր) տեսնում է արդյունքները և հաստատում։ Ուղղումներ պահանջելու դեպքում մոդուլը վերադառնում է աշխատակցին։", phone: "/staff/team", action: { label: "Ավտոմատ. հաստատել որպես Թաթև", run: () => { staffAs("s-tatev"); for (const e of newEnr.filter((x) => x.status === "submitted")) dispatch({ type: "training.review", enrollmentId: e.id, approved: true, note: "Բարի գալուստ թիմ, Նարե։" }); show("/staff/team", "/admin/team"); } } },
      ],
    },
    comms: {
      title: "Ներքին հաղորդակցություն և հերթափոխ", time: "≈ 2 րոպե",
      steps: [
        { icon: "message", title: "Ղեկավարը գրում է շտապ հաղորդագրություն", say: "Անահիտը (մաքրության ղեկավար) բաժնի ալիքում նշում է շտապ առաջադրանք։", phone: "/staff/messages?c=ch-housekeeping", action: { label: "Ավտոմատ. շտապ հաղորդագրություն", run: () => { staffAs("s-anahit"); dispatch({ type: "msg.send", channelId: "ch-housekeeping", text: "VIP ժամանում ժամը 14:00-ին, շալե C1։ Խնդրում եմ ստուգել մինչև 13:30։", urgent: true }); show("/staff/messages?c=ch-housekeeping"); } } },
        { icon: "bell", title: "Հավաքարարը տեսնում է չկարդացածը", say: "Լիլիթի հեռախոսում՝ կարմիր նշան և չկարդացածների քանակ։", phone: "/staff/messages", action: { label: "Մուտք որպես Լիլիթ", run: () => { staffAs("s-lilit"); show("/staff/messages"); } } },
        { icon: "refresh", title: "Հերթափոխի փոխանցում", say: "Երեկոյան հերթափոխին փոխանցվում է նշում, որը հաջորդ հերթափոխը տեսնում է «Այսօր» էջում։", action: { label: "Ավտոմատ. փոխանցման նշում", run: () => { staffAs("s-lilit"); dispatch({ type: "msg.send", channelId: "ch-housekeeping", text: "C1-ը ստուգված է։ 204-ում պետք է փոխել լոգասենյակի լամպը (տեխնիկականին տեղեկացված է)։", handover: true }); show("/staff"); } } },
        { icon: "users", title: "Մենեջերը տեսնում է ամբողջ պատկերը", say: "Վահանակում՝ անձնակազմի արձագանքի ժամանակը, ժամկետանց առաջադրանքները և onboarding-ի առաջընթացը։", admin: "/admin/analytics" },
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
    setConfirmReset(false); setPinNeeded(false); setStep(0); setScenario("night"); setIds({}); signGuest(null); lsSet(`bos:stay:${session}`, null);
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
