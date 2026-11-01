import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Chip, Enter, PhoneFrame, Toast } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "Appointment & Booking Automation" concept project. */

const ui = {
  en: {
    clinic: "Clinic booking",
    online: "Online booking",
    title: "Book a visit",
    service: "Service",
    services: [
      ["Check-up", "30 min"],
      ["Teeth cleaning", "45 min"],
      ["Consultation", "20 min"],
    ],
    day: "Day",
    days: ["Tue 14", "Wed 15", "Thu 16"],
    time: "Time",
    times: ["10:00", "11:30", "15:00", "16:30"],
    book: "Book · Wed 11:30",
    booked: "You're booked",
    bookedText: "Wed 15 · 11:30 · Check-up",
    addCal: "Add to my calendar",
    reminderTitle: "Reminder",
    reminder: "Your visit is tomorrow at 11:30.",
    confirm: "Confirm",
    move: "Move",
    moveTitle: "Choose a new time",
    moved: "Visit moved",
    movedText: "Thu 16 · 15:00",
    calendar: "Calendar · Wednesday 15",
    staff: ["Dentist", "Hygienist", "Orthodontist"],
    visit: "Visit",
    newVisit: "Check-up · new client",
    bookedOnline: "Booked online",
    reminderSent: "Reminder sent",
    movedBlock: "Moved to Thu 15:00",
    waitlist: "Offering to the waiting list…",
    filled: "Filled from the waiting list",
    toast: "New online booking",
    toastText: "Dentist · Wed 11:30",
  },
  hy: {
    clinic: "Կլինիկայի գրանցում",
    online: "Առցանց գրանցում",
    title: "Գրանցվել այցի",
    service: "Ծառայություն",
    services: [
      ["Ստուգում", "30 րոպե"],
      ["Ատամների մաքրում", "45 րոպե"],
      ["Խորհրդատվություն", "20 րոպե"],
    ],
    day: "Օր",
    days: ["Երք 14", "Չրք 15", "Հնգ 16"],
    time: "Ժամ",
    times: ["10:00", "11:30", "15:00", "16:30"],
    book: "Գրանցվել · Չրք 11:30",
    booked: "Դուք գրանցված եք",
    bookedText: "Չրք 15 · 11:30 · Ստուգում",
    addCal: "Ավելացնել իմ օրացույցում",
    reminderTitle: "Հիշեցում",
    reminder: "Ձեր այցը վաղն է՝ ժամը 11:30-ին։",
    confirm: "Հաստատել",
    move: "Տեղափոխել",
    moveTitle: "Ընտրեք նոր ժամ",
    moved: "Այցը տեղափոխված է",
    movedText: "Հնգ 16 · 15:00",
    calendar: "Օրացույց · չորեքշաբթի, 15",
    staff: ["Ատամնաբույժ", "Հիգիենիստ", "Օրթոդոնտ"],
    visit: "Այց",
    newVisit: "Ստուգում · նոր հաճախորդ",
    bookedOnline: "Գրանցվել է առցանց",
    reminderSent: "Հիշեցումն ուղարկված է",
    movedBlock: "Տեղափոխվել է Հնգ 15:00",
    waitlist: "Առաջարկվում է սպասման ցուցակին…",
    filled: "Լրացվել է սպասման ցուցակից",
    toast: "Նոր առցանց գրանցում",
    toastText: "Ատամնաբույժ · Չրք 11:30",
  },
  ru: {
    clinic: "Запись в клинику",
    online: "Онлайн-запись",
    title: "Запись на приём",
    service: "Услуга",
    services: [
      ["Осмотр", "30 мин"],
      ["Чистка зубов", "45 мин"],
      ["Консультация", "20 мин"],
    ],
    day: "День",
    days: ["Вт 14", "Ср 15", "Чт 16"],
    time: "Время",
    times: ["10:00", "11:30", "15:00", "16:30"],
    book: "Записаться · Ср 11:30",
    booked: "Вы записаны",
    bookedText: "Ср 15 · 11:30 · Осмотр",
    addCal: "Добавить в мой календарь",
    reminderTitle: "Напоминание",
    reminder: "Ваш визит завтра в 11:30.",
    confirm: "Подтвердить",
    move: "Перенести",
    moveTitle: "Выберите новое время",
    moved: "Визит перенесён",
    movedText: "Чт 16 · 15:00",
    calendar: "Календарь · среда, 15",
    staff: ["Стоматолог", "Гигиенист", "Ортодонт"],
    visit: "Приём",
    newVisit: "Осмотр · новый клиент",
    bookedOnline: "Запись онлайн",
    reminderSent: "Напоминание отправлено",
    movedBlock: "Перенесено на Чт 15:00",
    waitlist: "Предлагаем листу ожидания…",
    filled: "Занято из листа ожидания",
    toast: "Новая онлайн-запись",
    toastText: "Стоматолог · Ср 11:30",
  },
} satisfies Record<Locale, Record<string, unknown>>;

type T = (typeof ui)["en"];

function Option({ active, children, className }: { active?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-[0.8125rem] transition-colors",
        active ? "border-[#141414] bg-[#141414] text-white" : "border-black/10 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Picker({ t, day, time }: { t: T; day: number; time: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.6875rem] font-semibold text-[#6b6a66]">{t.day}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {t.days.map((d, i) => (
          <Option key={d} active={i === day} className="text-center">
            {d}
          </Option>
        ))}
      </div>
      <p className="mt-1 text-[0.6875rem] font-semibold text-[#6b6a66]">{t.time}</p>
      <div className="grid grid-cols-4 gap-1">
        {t.times.map((h, i) => (
          <Option key={h} active={i === time} className="px-1 text-center tabular-nums">
            {h}
          </Option>
        ))}
      </div>
    </div>
  );
}

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  return (
    <PhoneFrame time={step >= 2 ? "18:05" : "21:12"} title={t.clinic} subtitle={t.online}>
      <div className="relative flex flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        {step === 0 && (
          <Enter className="flex flex-col gap-2">
            <p className="text-[0.9375rem] font-semibold">{t.title}</p>
            <p className="text-[0.6875rem] font-semibold text-[#6b6a66]">{t.service}</p>
            {t.services.map(([name, length], i) => (
              <Option key={name} active={i === 0} className="flex items-center justify-between">
                <span>{name}</span>
                <span className={i === 0 ? "text-white/70" : "text-[#8a8984]"}>{length}</span>
              </Option>
            ))}
            <Picker t={t} day={1} time={1} />
            <div className="rounded-lg bg-signal px-3 py-2 text-center text-[0.8125rem] font-semibold text-black">{t.book}</div>
          </Enter>
        )}

        {(step === 1 || step === 2) && (
          <Enter key="booked" className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#e3efe4] text-[#1e5a2b]">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <p className="text-[1rem] font-semibold">{t.booked}</p>
            <p className="text-[0.8125rem] text-[#55544f]">{t.bookedText}</p>
            <div className="rounded-lg border border-black/10 px-3 py-2 text-[0.75rem] font-semibold">{t.addCal}</div>
          </Enter>
        )}

        {step === 2 && (
          <Enter delay={300} className="absolute inset-x-2.5 top-2.5 rounded-xl bg-white/95 p-3 shadow-[0_12px_30px_-10px_rgb(0_0_0/0.4)] ring-1 ring-black/10 backdrop-blur">
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold">
              <span aria-hidden="true" className="size-2 rounded-full bg-signal" />
              {t.reminderTitle} · {t.clinic}
            </p>
            <p className="mt-1 text-[0.8125rem]">{t.reminder}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center text-[0.75rem] font-semibold">
              <span className="rounded-md bg-[#141414] py-1.5 text-white">{t.confirm}</span>
              <span className="rounded-md bg-black/6 py-1.5">{t.move}</span>
            </div>
          </Enter>
        )}

        {step === 3 && (
          <Enter key="move" className="flex flex-col gap-2">
            <p className="text-[0.9375rem] font-semibold">{t.moveTitle}</p>
            <Picker t={t} day={2} time={2} />
            <Enter delay={1600} className="mt-1 flex items-center gap-2 rounded-lg bg-[#e3efe4] px-3 py-2.5 text-[0.8125rem] font-semibold text-[#1e5a2b]">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {t.moved} · {t.movedText}
            </Enter>
          </Enter>
        )}

        {step === 4 && (
          <Enter key="moved" className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-[1rem] font-semibold">{t.moved}</p>
            <p className="text-[0.8125rem] text-[#55544f]">{t.movedText} · {t.services[0][0]}</p>
          </Enter>
        )}
      </div>
    </PhoneFrame>
  );
}

const ROWS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

function Block({ row, span = 1, className, children }: { row: number; span?: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("absolute inset-x-1 overflow-hidden rounded-md px-2 py-1.5 text-[0.75rem] leading-tight", className)}
      style={{ top: `calc(${(row / ROWS.length) * 100}% + 2px)`, height: `calc(${(span / ROWS.length) * 100}% - 4px)` }}
    >
      {children}
    </div>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const existing: Array<[number, number, number]> = [
    // [staff column, start row (fractional = half hour), length in rows]
    [0, 0, 1],
    [0, 3, 1],
    [1, 1, 1],
    [1, 4.5, 1],
    [2, 0.5, 1],
    [2, 2.5, 1.5],
    [2, 5, 1],
  ];
  return (
    <AppFrame title={t.calendar} toast={<Toast show={step === 1} title={t.toast} text={t.toastText} />}>
      <div className="@container flex h-full flex-col p-3">
        <div className="grid grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] gap-x-1.5 pb-2 text-[0.75rem] font-semibold text-[#55544f]">
          <span />
          {t.staff.map((s, i) => (
            <span key={s} className={cn("truncate", i === 2 && "hidden @md:block")}>
              {s}
            </span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] gap-x-1.5">
          <div className="relative">
            {ROWS.map((r, i) => (
              <span
                key={r}
                className="absolute left-0 -translate-y-1/2 text-[0.6875rem] text-[#8a8984] tabular-nums"
                style={{ top: `${(i / ROWS.length) * 100}%` }}
              >
                {r}
              </span>
            ))}
          </div>
          {[0, 1, 2].map((col) => (
            <div
              key={col}
              className={cn(
                "relative rounded-md bg-white [background-image:linear-gradient(rgb(0_0_0/0.06)_1px,transparent_1px)]",
                col === 2 && "hidden @md:block",
              )}
              style={{ backgroundSize: `100% ${100 / ROWS.length}%` }}
            >
              {existing
                .filter(([c]) => c === col)
                .map(([, row, span]) => (
                  <Block key={row} row={row} span={span} className="bg-black/[0.07] text-[#55544f]">
                    {t.visit}
                  </Block>
                ))}
              {col === 0 && step >= 1 && (
                <Block
                  row={1.5}
                  className={cn(
                    "border-2 transition-colors duration-500",
                    step === 3 && "border-dashed border-[#8a8984] bg-white text-[#55544f]",
                    step === 4 && "border-[#2f7a3e] bg-[#e3efe4] text-[#1e5a2b]",
                    step < 3 && "border-signal bg-signal/15 text-[#141414]",
                  )}
                >
                  <Enter key={step} className="flex h-full flex-col justify-between gap-1">
                    <span className="font-semibold">{step === 3 ? t.movedBlock : step === 4 ? t.filled : t.newVisit}</span>
                    <span className="flex flex-wrap gap-1">
                      {step < 3 && <Chip tone="accent">{step === 2 ? t.reminderSent : t.bookedOnline}</Chip>}
                      {step === 3 && <Chip>{t.waitlist}</Chip>}
                    </span>
                  </Enter>
                </Block>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

export const bookingDemo: DemoDefinition = {
  focus: ["a", "b", "a", "a", "b"],
  posterStep: 1,
  sides: {
    en: { a: "Client's phone", b: "Clinic calendar" },
    hy: { a: "Հաճախորդի հեռախոսը", b: "Կլինիկայի օրացույցը" },
    ru: { a: "Телефон клиента", b: "Календарь клиники" },
  },
  steps: {
    en: [
      { title: "The client books online", text: "They choose a service, a day and a free time. No phone call needed, at any hour." },
      {
        title: "It appears in the calendar",
        text: "The visit lands in the right specialist's calendar right away. Double bookings are impossible.",
      },
      { title: "A reminder the day before", text: "The client gets a reminder and can confirm or move the visit in one tap." },
      { title: "Plans change? One tap", text: "The client picks a new time themselves. Nobody has to call the clinic." },
      { title: "Free time gets filled", text: "The freed time is offered to people on the waiting list, so the day stays full." },
    ],
    hy: [
      { title: "Հաճախորդը գրանցվում է առցանց", text: "Նա ընտրում է ծառայությունը, օրը և ազատ ժամը։ Զանգել պետք չէ՝ ցանկացած ժամի։" },
      {
        title: "Այցը հայտնվում է օրացույցում",
        text: "Այցն անմիջապես հայտնվում է ճիշտ մասնագետի օրացույցում։ Կրկնակի գրանցումն անհնար է։",
      },
      { title: "Հիշեցում նախորդ օրը", text: "Հաճախորդը ստանում է հիշեցում և մեկ հպումով կարող է հաստատել կամ տեղափոխել այցը։" },
      { title: "Պլանները փոխվե՞լ են։ Մեկ հպում", text: "Հաճախորդն ինքն է ընտրում նոր ժամը։ Ոչ ոք ստիպված չէ զանգել կլինիկա։" },
      { title: "Ազատ ժամը լրացվում է", text: "Ազատված ժամն առաջարկվում է սպասման ցուցակի մարդկանց, և օրը մնում է լեցուն։" },
    ],
    ru: [
      { title: "Клиент записывается онлайн", text: "Он выбирает услугу, день и свободное время. Звонить не нужно — в любое время суток." },
      {
        title: "Запись появляется в календаре",
        text: "Визит сразу попадает в календарь нужного специалиста. Двойная запись невозможна.",
      },
      { title: "Напоминание накануне", text: "Клиент получает напоминание и в одно касание подтверждает или переносит визит." },
      { title: "Планы изменились? Одно касание", text: "Клиент сам выбирает новое время. Никому не нужно звонить в клинику." },
      { title: "Свободное время занято", text: "Освободившееся время предлагается людям из листа ожидания, и день остаётся заполненным." },
    ],
  },
  A: Customer,
  B: Team,
};
