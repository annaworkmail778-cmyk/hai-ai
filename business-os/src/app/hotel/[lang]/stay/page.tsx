"use client";
/*
 * In-room / on-site guest services reached via QR. A room QR identifies ONLY the room: guest data is shown
 * after the guest verifies the stay (demo: last name of the in-house reservation; production: a signed,
 * rotating stay token issued at check-in — see docs/HOSPITALITY_OS_DATA_ARCHITECTURE.md).
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { DemoAuthBadge, inpG, labG } from "@/components/hotel/auth";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";
import { useNow } from "@/lib/client/use-now";
import { useDemo } from "@/lib/client/demo-store";
import { useGuestSession } from "@/lib/client/guest-session";
import { time } from "@/lib/format";
import { g, type GKey } from "@/lib/guest-i18n";
import { SERVICE_META } from "@/lib/hospitality-data";
import type { Lang, ServiceType } from "@/lib/types";

const ROOM_SERVICES: ServiceType[] = ["towels", "cleaning", "toiletries", "laundry", "maintenance", "wakeup", "luggage", "spa", "checkout", "issue", "reception", "other"];
const POINT_SERVICES: Record<string, ServiceType[]> = { spa: ["spa", "towels", "issue", "other"], lobby: ["reception", "luggage", "issue", "other"], pool: ["towels", "maintenance", "issue", "other"] };
const POINT_NAME: Record<string, Record<Lang, string>> = { spa: { hy: "Սպա", ru: "Спа", en: "Spa" }, lobby: { hy: "Լոբբի", ru: "Лобби", en: "Lobby" }, pool: { hy: "Լողավազան", ru: "Бассейн", en: "Pool" } };

function Stay({ lang }: { lang: Lang }) {
  const sp = useSearchParams();
  const room = sp.get("room");
  const point = sp.get("point");
  const { state, dispatch } = useDemo();
  const { stay, stayRes, verifyStay, leaveStay } = useGuestSession();
  const now = useNow(60000);
  const [last, setLast] = useState("");
  const [err, setErr] = useState(false);
  const [hint, setHint] = useState(false);
  const [pick, setPick] = useState<ServiceType | null>(null);
  const [note, setNote] = useState("");
  const [when, setWhen] = useState("07:30");
  const [sent, setSent] = useState(false);

  const inHouse = room ? state.reservations.find((r) => r.status === "checked_in" && r.roomId === room) : undefined;
  const verified = !!stay && (!room || stay.roomId === room);
  const roomId = verified ? stay!.roomId : null;

  if (!room && !point && !stay) return <Shell><p className="text-center text-pine/70">{g(lang, "needStay")}</p></Shell>;

  if (room && !verified) {
    const submit = () => {
      const gu = inHouse && state.guests.find((x) => x.id === inHouse.guestId);
      if (inHouse && gu && gu.lastName.trim().toLowerCase() === last.trim().toLowerCase()) { verifyStay(room, inHouse.id); setErr(false); }
      else setErr(true);
    };
    const hintName = inHouse ? state.guests.find((x) => x.id === inHouse.guestId)?.lastName : null;
    return (
      <Shell>
        <div className="rounded-3xl bg-white p-6 ring-1 ring-pine/10">
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brass">{g(lang, "roomVerified")} {room}</div>
          <h1 className="mt-1 font-serif text-[30px] font-semibold">{g(lang, "verify")}</h1>
          <p className="mt-2 text-[14.5px] text-pine/70">{g(lang, "verifyText")}</p>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-5 flex gap-2">
            <input className={inpG} value={last} onChange={(e) => setLast(e.target.value)} placeholder={g(lang, "last")} aria-label={g(lang, "last")} autoComplete="family-name" />
            <button className="h-12 shrink-0 rounded-xl bg-pine px-5 text-[14px] font-semibold text-cream">{g(lang, "continue")}</button>
          </form>
          {err && <p className="mt-2 text-[13px] text-red-700">{g(lang, "verifyFail")}</p>}
          <div className="mt-6 rounded-2xl border border-dashed border-brass/40 bg-[#fffaf0] p-4 text-[13px] text-pine/75">
            <div className="flex items-center justify-between gap-2"><DemoAuthBadge lang={lang} /><button onClick={() => setHint(!hint)} className="font-semibold text-brass">{g(lang, "demoHint")}</button></div>
            {hint && <p className="mt-2">{hintName ? <>«{hintName}»</> : g(lang, "verifyFail")}</p>}
          </div>
        </div>
      </Shell>
    );
  }

  const list = roomId ? ROOM_SERVICES : POINT_SERVICES[point ?? ""] ?? POINT_SERVICES.lobby;
  const mine = state.services.filter((s) => (roomId ? s.roomId === roomId && s.createdAt >= (stayRes?.createdAt ?? 0) : s.point === point && s.createdAt > now - 6 * 3600e3)).slice(0, 8);
  const guestName = stayRes ? state.guests.find((x) => x.id === stayRes.guestId)?.firstName : null;
  const send = () => {
    if (!pick) return;
    dispatch({ type: "service.create", serviceType: pick, roomId: roomId ?? undefined, point: roomId ? undefined : point ?? undefined, guestId: stayRes?.guestId, note: note.trim(), when: pick === "wakeup" ? when : undefined });
    setSent(true); setNote("");
    setTimeout(() => { setSent(false); setPick(null); }, 1600);
  };
  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brass">{roomId ? `${g(lang, "roomVerified")} ${roomId}` : POINT_NAME[point ?? "lobby"]?.[lang]}</div>
          <h1 className="mt-1 font-serif text-[32px] font-semibold leading-tight">{guestName ? `${g(lang, "hello")}, ${guestName}` : g(lang, "services")}</h1>
        </div>
        {roomId && <button onClick={leaveStay} className="mt-1 text-[12.5px] font-semibold text-pine/55 underline">{g(lang, "leaveStay")}</button>}
      </div>
      {roomId && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href={`/hotel/${lang}/dining`} className="flex items-center gap-3 rounded-2xl bg-pine p-4 text-cream"><Icon name="coffee" size={22} /><span className="text-[14.5px] font-semibold">{g(lang, "orderFood")}</span></Link>
          <Link href={`/hotel/${lang}?chat=1`} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-pine/10"><Icon name="sparkles" size={22} className="text-brass" /><span className="text-[14.5px] font-semibold">{g(lang, "askAssistant")}</span></Link>
        </div>
      )}
      <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-[0.14em] text-pine/55">{g(lang, "services")}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {list.map((s) => (
          <button key={s} onClick={() => { setPick(s); setSent(false); }} className={cn("flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-2 text-center text-[12.5px] font-semibold leading-tight ring-1 transition", pick === s ? "bg-pine text-cream ring-pine" : "bg-white text-pine ring-pine/10 hover:ring-pine/30")}>
            <Icon name={SERVICE_META[s].icon as IconName} size={24} />{SERVICE_META[s].label[lang]}
          </button>
        ))}
      </div>
      {pick && (
        <div className="rise-in mt-4 rounded-3xl bg-white p-5 ring-1 ring-pine/10">
          <div className="font-serif text-[22px] font-semibold">{SERVICE_META[pick].label[lang]}</div>
          {pick === "wakeup" && <label className="mt-3 block"><span className={labG}>{g(lang, "when")}</span><input type="time" className={inpG} value={when} onChange={(e) => setWhen(e.target.value)} /></label>}
          <label className="mt-3 block"><span className={labG}>{g(lang, "note")}</span><textarea className={cn(inpG, "h-20 py-2.5")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <button onClick={send} disabled={sent} className={cn("mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition", sent ? "bg-emerald-600 text-white" : "bg-pine text-cream")}>{sent ? <><Icon name="check" size={18} />{g(lang, "requestSent")}</> : g(lang, "send")}</button>
        </div>
      )}
      {mine.length > 0 && (
        <>
          <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-[0.14em] text-pine/55">{g(lang, "myRequests")}</h2>
          <ul className="mt-3 space-y-2">
            {mine.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-pine/10">
                <span className="grid size-10 place-items-center rounded-xl bg-cream"><Icon name={SERVICE_META[s.type].icon as IconName} size={19} /></span>
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">{SERVICE_META[s.type].label[lang]}</div><div className="text-[12px] text-pine/55">{s.code} · {time(s.createdAt)}{s.when ? ` · ${s.when}` : ""}</div></div>
                <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold", s.status === "done" ? "bg-emerald-50 text-emerald-800" : s.status === "new" ? "bg-amber-50 text-amber-800" : s.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-pine text-cream")}>{g(lang, `rs_${s.status}` as GKey)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:pt-28">{children}</div>;
}

export default function StayPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  return <Suspense><Stay lang={lang} /></Suspense>;
}
