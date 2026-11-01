import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Chip, Enter, Field, PhoneFrame, Toast } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "Real Estate Sales Platform" concept project. */

const ui = {
  en: {
    project: "Residence B · Sales",
    site: "Residence B",
    siteSub: "Apartments online",
    building: "Building B",
    floor: "Floor",
    legend: ["Available", "Reserved", "Sold"],
    apt: "Apt",
    rooms: "3 rooms",
    area: "98 m²",
    floorN: "Floor 7",
    plan: "Floor plan",
    planRooms: ["Living room", "Bedroom", "Bedroom", "Kitchen", "Bath"],
    reserve: "Reserve for 48 hours",
    reservedTitle: "Reserved for you",
    reservedText: "Until Friday, 18:00",
    managerCall: "Your manager will call you today.",
    free: "available",
    toast: "Apt 7.03 reserved online",
    toastText: "Buyer from the website",
    card: "Buyer card",
    buyer: "Buyer",
    buyerV: "From the website",
    aptL: "Apartment",
    aptV: "7.03 · 3 rooms · 98 m²",
    status: "Status",
    statusV: "Reserved until Fri 18:00",
    next: "Next step",
    nextV: "Call about the payment plan",
    agents: "Agents see the same board",
  },
  hy: {
    project: "Բնակելի համալիր Բ · Վաճառք",
    site: "Համալիր Բ",
    siteSub: "Բնակարաններ առցանց",
    building: "Մասնաշենք Բ",
    floor: "Հարկ",
    legend: ["Ազատ", "Ամրագրված", "Վաճառված"],
    apt: "Բն.",
    rooms: "3 սենյակ",
    area: "98 մ²",
    floorN: "7-րդ հարկ",
    plan: "Հատակագիծ",
    planRooms: ["Հյուրասենյակ", "Ննջասենյակ", "Ննջասենյակ", "Խոհանոց", "Լոգարան"],
    reserve: "Ամրագրել 48 ժամով",
    reservedTitle: "Ամրագրված է ձեզ համար",
    reservedText: "Մինչև ուրբաթ, 18:00",
    managerCall: "Ձեր մենեջերն այսօր կզանգի ձեզ։",
    free: "ազատ",
    toast: "Բն. 7.03-ն ամրագրվեց առցանց",
    toastText: "Գնորդ կայքից",
    card: "Գնորդի քարտ",
    buyer: "Գնորդ",
    buyerV: "Կայքից",
    aptL: "Բնակարան",
    aptV: "7.03 · 3 սենյակ · 98 մ²",
    status: "Կարգավիճակ",
    statusV: "Ամրագրված է մինչև ուրբ 18:00",
    next: "Հաջորդ քայլը",
    nextV: "Զանգել վճարման պլանի մասին",
    agents: "Գործակալները տեսնում են նույն պատկերը",
  },
  ru: {
    project: "ЖК «Б» · Продажи",
    site: "ЖК «Б»",
    siteSub: "Квартиры онлайн",
    building: "Корпус Б",
    floor: "Этаж",
    legend: ["Свободно", "Бронь", "Продано"],
    apt: "Кв.",
    rooms: "3 комнаты",
    area: "98 м²",
    floorN: "7 этаж",
    plan: "Планировка",
    planRooms: ["Гостиная", "Спальня", "Спальня", "Кухня", "Ванная"],
    reserve: "Забронировать на 48 часов",
    reservedTitle: "Забронировано для вас",
    reservedText: "До пятницы, 18:00",
    managerCall: "Ваш менеджер позвонит сегодня.",
    free: "свободно",
    toast: "Кв. 7.03 забронирована онлайн",
    toastText: "Покупатель с сайта",
    card: "Карточка покупателя",
    buyer: "Покупатель",
    buyerV: "С сайта",
    aptL: "Квартира",
    aptV: "7.03 · 3 комнаты · 98 м²",
    status: "Статус",
    statusV: "Бронь до пт 18:00",
    next: "Следующий шаг",
    nextV: "Позвонить насчёт рассрочки",
    agents: "Агенты видят ту же шахматку",
  },
} satisfies Record<Locale, Record<string, unknown>>;

type Status = 0 | 1 | 2; // available, reserved, sold
const FLOORS = [9, 8, 7, 6, 5, 4, 3, 2];
// Deterministic board: [floor][unit] status before the reservation.
const BOARD: Record<number, Status[]> = {
  9: [0, 0, 1, 0],
  8: [2, 0, 0, 2],
  7: [0, 2, 0, 0],
  6: [2, 2, 1, 0],
  5: [0, 2, 2, 0],
  4: [2, 2, 2, 1],
  3: [2, 0, 2, 2],
  2: [2, 2, 2, 2],
};
const TARGET = { floor: 7, unit: 2 }; // apartment 7.03

function statusOf(floor: number, unit: number, reserved: boolean): Status {
  if (reserved && floor === TARGET.floor && unit === TARGET.unit) return 1;
  return BOARD[floor][unit];
}

function Cell({ status, target, label }: { status: Status; target: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[3px] text-[0.625rem] font-semibold tabular-nums transition-colors duration-700",
        status === 0 && "border border-black/15 bg-white text-[#141414]",
        status === 1 && "border-2 border-signal bg-signal/20 text-[#141414]",
        status === 2 && "bg-[#2a2a2a] text-white/60",
        target && "ring-2 ring-[#141414] ring-offset-1",
      )}
    >
      {label}
    </div>
  );
}

function Legend({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-[#55544f]">
      {labels.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 rounded-[2px]",
              i === 0 && "border border-black/25 bg-white",
              i === 1 && "border-2 border-signal",
              i === 2 && "bg-[#2a2a2a]",
            )}
          />
          {l}
        </span>
      ))}
    </div>
  );
}

function Board({ reserved, highlight, compact = false }: { reserved: boolean; highlight: boolean; compact?: boolean }) {
  return (
    <div className={cn("grid gap-1", compact ? "grid-cols-[1.25rem_repeat(4,minmax(0,1fr))]" : "grid-cols-[1.75rem_repeat(4,minmax(0,1fr))]")}>
      {FLOORS.map((f) => (
        <div key={f} className="contents">
          <span className="flex items-center text-[0.625rem] text-[#8a8984] tabular-nums">{f}</span>
          {[0, 1, 2, 3].map((u) => (
            <div key={u} className={compact ? "h-5" : "h-7 @lg:h-9"}>
              <Cell
                status={statusOf(f, u, reserved)}
                target={highlight && f === TARGET.floor && u === TARGET.unit}
                label={`${f}.0${u + 1}`}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PlanSketch({ rooms }: { rooms: string[] }) {
  return (
    <div className="relative aspect-[4/3] w-full rounded-md border-2 border-[#141414] bg-[#f6f5f1] text-[0.5625rem] font-semibold text-[#55544f]">
      <div className="absolute top-0 left-0 flex h-[58%] w-[55%] items-center justify-center border-r-2 border-b-2 border-[#141414]">{rooms[0]}</div>
      <div className="absolute top-0 right-0 flex h-[58%] w-[45%] items-center justify-center border-b-2 border-[#141414]">{rooms[1]}</div>
      <div className="absolute bottom-0 left-0 flex h-[42%] w-[34%] items-center justify-center border-r-2 border-[#141414]">{rooms[3]}</div>
      <div className="absolute bottom-0 left-[34%] flex h-[42%] w-[22%] items-center justify-center border-r-2 border-[#141414]">{rooms[4]}</div>
      <div className="absolute right-0 bottom-0 flex h-[42%] w-[44%] items-center justify-center">{rooms[2]}</div>
    </div>
  );
}

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  return (
    <PhoneFrame time="12:20" title={t.site} subtitle={t.siteSub}>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        {step === 0 && (
          <Enter className="flex flex-col gap-2.5">
            <p className="text-[0.9375rem] font-semibold">{t.building}</p>
            <Legend labels={t.legend} />
            <Board reserved={false} highlight={false} compact />
          </Enter>
        )}
        {(step === 1 || step === 3 || step === 4) && (
          <Enter key="apt" className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <p className="text-[1rem] font-semibold">
                {t.apt} 7.03
              </p>
              {step === 1 ? <Chip tone="ok">{t.free}</Chip> : <Chip tone="accent">{t.legend[1]}</Chip>}
            </div>
            <p className="text-[0.8125rem] text-[#55544f]">
              {t.rooms} · {t.area} · {t.floorN}
            </p>
            <p className="text-[0.6875rem] font-semibold text-[#6b6a66]">{t.plan}</p>
            <PlanSketch rooms={t.planRooms} />
            {step === 1 && <div className="rounded-lg bg-signal px-3 py-2.5 text-center text-[0.8125rem] font-semibold text-black">{t.reserve}</div>}
          </Enter>
        )}
        {step === 2 && (
          <Enter key="done" className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#e3efe4] text-[#1e5a2b]">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <p className="text-[1rem] font-semibold">{t.reservedTitle}</p>
            <p className="text-[0.8125rem] text-[#55544f]">
              {t.apt} 7.03 · {t.reservedText}
            </p>
            <p className="text-[0.8125rem]">{t.managerCall}</p>
          </Enter>
        )}
      </div>
    </PhoneFrame>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const reserved = step >= 3;
  return (
    <AppFrame title={t.project} toast={<Toast show={step === 3} title={t.toast} text={t.toastText} />}>
      <div className="@container flex h-full flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.875rem] font-semibold">
            {t.building} · {t.floor} 2–9
          </p>
          <Legend labels={t.legend} />
        </div>
        <div className={cn("grid min-h-0 flex-1 gap-3", step === 4 && "@lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
          <div className={cn("rounded-md bg-white p-3", step === 4 && "hidden @lg:block")}>
            <Board reserved={reserved} highlight={step >= 3} />
          </div>
          {step === 4 && (
            <Enter className="flex flex-col gap-3 rounded-md border border-black/10 bg-white p-3 shadow-sm">
              <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.card}</p>
              <div>
                <Field label={t.buyer} value={t.buyerV} delay={100} />
                <Field label={t.aptL} value={t.aptV} delay={300} />
                <Field label={t.status} value={<Chip tone="accent">{t.statusV}</Chip>} delay={500} />
                <Field label={t.next} value={t.nextV} delay={700} />
              </div>
            </Enter>
          )}
        </div>
        {step === 0 && (
          <Enter delay={400} className="flex items-center justify-center gap-2 rounded-md bg-[#141414] px-3 py-2 text-[0.8125rem] font-semibold text-white">
            <span aria-hidden="true" className="size-2 rounded-full bg-signal" />
            {t.agents}
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const realEstateDemo: DemoDefinition = {
  focus: ["b", "a", "a", "b", "b"],
  posterStep: 3,
  sides: {
    en: { a: "Buyer's phone", b: "Sales team" },
    hy: { a: "Գնորդի հեռախոսը", b: "Վաճառքի թիմը" },
    ru: { a: "Телефон покупателя", b: "Отдел продаж" },
  },
  steps: {
    en: [
      {
        title: "Live availability for everyone",
        text: "Sales staff, agents and buyers see the same picture: which apartments are free, reserved or sold right now.",
      },
      { title: "The buyer picks an apartment", text: "Plan, size and floor are on the phone. No PDF files, no waiting for a call back." },
      { title: "Reserved in one tap", text: "The buyer reserves the apartment for 48 hours and knows a manager will call." },
      {
        title: "Everyone sees it at once",
        text: "The apartment is marked as reserved for the whole team, so it can't be promised to two buyers.",
      },
      { title: "The manager takes over", text: "The buyer, the apartment and the next step are already in the CRM." },
    ],
    hy: [
      {
        title: "Բոլորը տեսնում են նույն պատկերը",
        text: "Վաճառողները, գործակալները և գնորդները տեսնում են, թե որ բնակարաններն են այս պահին ազատ, ամրագրված կամ վաճառված։",
      },
      { title: "Գնորդն ընտրում է բնակարանը", text: "Հատակագիծը, մակերեսը և հարկը հեռախոսում են։ Ոչ PDF ֆայլեր, ոչ էլ հետզանգի սպասում։" },
      { title: "Ամրագրում մեկ հպումով", text: "Գնորդը բնակարանն ամրագրում է 48 ժամով և գիտի, որ մենեջերը կզանգի։" },
      {
        title: "Բոլորն անմիջապես տեսնում են",
        text: "Բնակարանը նշվում է որպես ամրագրված ամբողջ թիմի համար, ուստի այն չի կարող խոստացվել երկու գնորդի։",
      },
      { title: "Մենեջերը շարունակում է", text: "Գնորդը, բնակարանը և հաջորդ քայլն արդեն CRM-ում են։" },
    ],
    ru: [
      {
        title: "Актуальная шахматка для всех",
        text: "Менеджеры, агенты и покупатели видят одно и то же: какие квартиры свободны, забронированы или проданы прямо сейчас.",
      },
      { title: "Покупатель выбирает квартиру", text: "Планировка, площадь и этаж — в телефоне. Без PDF и ожидания обратного звонка." },
      { title: "Бронь в одно касание", text: "Покупатель бронирует квартиру на 48 часов и знает, что менеджер позвонит." },
      {
        title: "Все видят это сразу",
        text: "Квартира отмечается как забронированная для всей команды, и её нельзя пообещать двум покупателям.",
      },
      { title: "Дальше работает менеджер", text: "Покупатель, квартира и следующий шаг уже в CRM." },
    ],
  },
  A: Customer,
  B: Team,
};
