import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import {
  AppFrame,
  Bubble,
  ChannelIcon,
  CheckBadge,
  Chip,
  Enter,
  PhoneFrame,
  QuickReplies,
  Stars,
  Toast,
  Typing,
  type Channel,
} from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — "Riseup Admin": AI replies + booking for a beauty salon. Names and figures are illustrative. */

const ui = {
  en: {
    salon: "Bella Studio",
    handle: "beauty salon · Instagram",
    ai: "AI administrator",
    msg1: "Hi! How much is a manicure? Any free time tomorrow?",
    ai1: "Hi! A gel manicure is 8 000 ֏ and takes about an hour. Tomorrow Ani is free at:",
    times: ["11:00", "14:30", "17:00"],
    ai2: "Done! You're booked for tomorrow at 11:00 with Ani. We'll remind you in the morning 💅",
    booked: "Booked",
    bookedText: "Tomorrow · 11:00 · Manicure · Ani",
    reminderTitle: "Reminder · Bella Studio",
    reminder: "Today at 11:00, manicure with Ani. Are you coming?",
    confirm: "Yes, I'm coming",
    move: "Move",
    confirmed: "Confirmed. See you at 11:00!",
    thanks: "Thank you for visiting! How did we do today?",
    reviewAsk: "Thank you! Could you leave a short review on Google? It takes 30 seconds.",
    reviewBtn: "Write a review on Google",
    today: "Bella Studio · Inbox & calendar",
    nav: ["Inbox", "Calendar", "Clients", "Reports"],
    inbox: "All chats",
    calendar: "Tomorrow",
    masters: ["Ani", "Mariam"],
    chats: [
      ["Lilit", "instagram", "Manicure tomorrow?"],
      ["Narine", "whatsapp", "Price of hair colouring?"],
      ["Mane", "telegram", "Can I move to Friday?"],
      ["Sona", "instagram", "Do you do eyebrows?"],
    ],
    replying: "AI is replying…",
    bookedAi: "Booked by AI",
    answered: "Answered",
    movedChip: "Moved",
    confirmedChip: "Confirmed",
    reviewChip: "Review requested",
    busy: "Busy",
    newVisit: "Lilit · Manicure",
    toast: "New booking from Instagram",
    toastText: "Lilit · manicure · tomorrow 11:00 · booked at 23:41",
    reportTitle: "Today in Bella Studio",
    report: [
      ["People wrote", "14"],
      ["Answered by AI", "12"],
      ["New bookings", "9"],
      ["Need you", "2"],
    ],
    reportNote: "Two clients asked for a manager. Open the chats →",
  },
  hy: {
    salon: "Bella Studio",
    handle: "գեղեցկության սրահ · Instagram",
    ai: "AI ադմինիստրատոր",
    msg1: "Բարև։ Մանիկյուրն ի՞նչ արժե։ Վաղը ազատ ժամ կա՞։",
    ai1: "Բարև ձեզ։ Գել մանիկյուրը 8 000 ֏ է, տևում է մոտ մեկ ժամ։ Վաղը Անին ազատ է՝",
    times: ["11:00", "14:30", "17:00"],
    ai2: "Պատրաստ է։ Դուք գրանցված եք վաղը՝ 11:00-ին, Անիի մոտ։ Առավոտյան կհիշեցնենք 💅",
    booked: "Գրանցված է",
    bookedText: "Վաղը · 11:00 · Մանիկյուր · Անի",
    reminderTitle: "Հիշեցում · Bella Studio",
    reminder: "Այսօր 11:00-ին մանիկյուր Անիի մոտ։ Գալի՞ս եք։",
    confirm: "Այո, գալիս եմ",
    move: "Տեղափոխել",
    confirmed: "Հաստատված է։ Սպասում ենք 11:00-ին։",
    thanks: "Շնորհակալություն այցի համար։ Ինչպե՞ս էր այսօր։",
    reviewAsk: "Շնորհակալություն։ Կթողնե՞ք կարճ կարծիք Google-ում։ Կտևի 30 վայրկյան։",
    reviewBtn: "Գրել կարծիք Google-ում",
    today: "Bella Studio · Նամակներ և օրացույց",
    nav: ["Նամակներ", "Օրացույց", "Հաճախորդներ", "Հաշվետվություն"],
    inbox: "Բոլոր նամակները",
    calendar: "Վաղը",
    masters: ["Անի", "Մարիամ"],
    chats: [
      ["Լիլիթ", "instagram", "Վաղը մանիկյուր կլինի՞"],
      ["Նարինե", "whatsapp", "Մազերի ներկումն ի՞նչ արժե"],
      ["Մանե", "telegram", "Կարո՞ղ եմ տեղափոխել ուրբաթ"],
      ["Սոնա", "instagram", "Հոնքեր անու՞մ եք"],
    ],
    replying: "AI-ն պատասխանում է…",
    bookedAi: "Գրանցել է AI-ն",
    answered: "Պատասխանված",
    movedChip: "Տեղափոխված",
    confirmedChip: "Հաստատված",
    reviewChip: "Կարծիք է խնդրվել",
    busy: "Զբաղված",
    newVisit: "Լիլիթ · Մանիկյուր",
    toast: "Նոր գրանցում Instagram-ից",
    toastText: "Լիլիթ · մանիկյուր · վաղը 11:00 · գրանցվել է 23:41-ին",
    reportTitle: "Այսօր Bella Studio-ում",
    report: [
      ["Գրել են", "14"],
      ["Պատասխանել է AI-ն", "12"],
      ["Նոր գրանցումներ", "9"],
      ["Ձեզ են սպասում", "2"],
    ],
    reportNote: "Երկու հաճախորդ մենեջեր են խնդրել։ Բացել նամակները →",
  },
  ru: {
    salon: "Bella Studio",
    handle: "салон красоты · Instagram",
    ai: "AI-администратор",
    msg1: "Здравствуйте! Сколько стоит маникюр? Есть время на завтра?",
    ai1: "Здравствуйте! Маникюр с гель-лаком — 8 000 ֏, около часа. Завтра Ани свободна в:",
    times: ["11:00", "14:30", "17:00"],
    ai2: "Готово! Вы записаны на завтра в 11:00 к Ани. Утром напомним 💅",
    booked: "Записано",
    bookedText: "Завтра · 11:00 · Маникюр · Ани",
    reminderTitle: "Напоминание · Bella Studio",
    reminder: "Сегодня в 11:00 маникюр у Ани. Вы придёте?",
    confirm: "Да, приду",
    move: "Перенести",
    confirmed: "Подтверждено. Ждём вас в 11:00!",
    thanks: "Спасибо за визит! Как вам сегодня?",
    reviewAsk: "Спасибо! Оставите короткий отзыв в Google? Это 30 секунд.",
    reviewBtn: "Написать отзыв в Google",
    today: "Bella Studio · Сообщения и календарь",
    nav: ["Сообщения", "Календарь", "Клиенты", "Отчёты"],
    inbox: "Все чаты",
    calendar: "Завтра",
    masters: ["Ани", "Мариам"],
    chats: [
      ["Лилит", "instagram", "Маникюр на завтра?"],
      ["Нарине", "whatsapp", "Сколько стоит окрашивание?"],
      ["Мане", "telegram", "Можно перенести на пятницу?"],
      ["Сона", "instagram", "Брови делаете?"],
    ],
    replying: "AI отвечает…",
    bookedAi: "Записал AI",
    answered: "Отвечено",
    movedChip: "Перенесено",
    confirmedChip: "Подтверждено",
    reviewChip: "Попросили отзыв",
    busy: "Занято",
    newVisit: "Лилит · Маникюр",
    toast: "Новая запись из Instagram",
    toastText: "Лилит · маникюр · завтра 11:00 · записалась в 23:41",
    reportTitle: "Сегодня в Bella Studio",
    report: [
      ["Написали", "14"],
      ["Ответил AI", "12"],
      ["Новые записи", "9"],
      ["Ждут вас", "2"],
    ],
    reportNote: "Два клиента попросили менеджера. Открыть чаты →",
  },
} satisfies Record<Locale, Record<string, unknown>>;

type T = (typeof ui)["en"];

function Chat({ t, step }: { t: T; step: number }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
      <Bubble from="them" meta="23:40">
        {t.msg1}
      </Bubble>
      {step === 0 && (
        <Enter delay={700}>
          <Typing />
        </Enter>
      )}
      <Enter key={`ai1-${step === 0}`} delay={step === 0 ? 1900 : 0} className="flex flex-col gap-2">
        <Bubble from="us" label={t.ai} meta="23:40">
          {t.ai1}
        </Bubble>
        <QuickReplies items={t.times} picked={step >= 1 ? 0 : undefined} />
      </Enter>
      {step >= 1 && (
        <>
          <Enter delay={900}>
            <Bubble from="us" label={t.ai} meta="23:41">
              {t.ai2}
            </Bubble>
          </Enter>
          <Enter pop delay={1700} className="flex items-center gap-2.5 rounded-xl bg-[#e3efe4] px-3 py-2 text-[#1e5a2b]">
            <CheckBadge className="size-7 bg-white" />
            <div className="min-w-0 leading-tight">
              <p className="text-[0.8125rem] font-semibold">{t.booked}</p>
              <p className="truncate text-[0.6875rem]">{t.bookedText}</p>
            </div>
          </Enter>
        </>
      )}
    </div>
  );
}

function Client({ step, locale }: ScreenProps) {
  const t = ui[locale];

  if (step === 3) {
    return (
      <PhoneFrame time="09:00" title={t.salon} subtitle={t.handle} channel="instagram">
        <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-[linear-gradient(160deg,#ffd9c2,#f6b9cf_45%,#b9b4f5)] px-3 pt-6">
          <p className="text-[2.6rem] leading-none font-semibold text-white tabular-nums drop-shadow">09:00</p>
          <Enter pop delay={400} className="mt-6 w-full rounded-2xl bg-white/85 p-3 shadow-[0_14px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur">
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold">
              <ChannelIcon channel="instagram" />
              {t.reminderTitle}
            </p>
            <p className="mt-1.5 text-[0.8125rem]">{t.reminder}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center text-[0.75rem] font-semibold">
              <span className="rounded-lg bg-signal py-1.5 text-black ring-2 ring-signal/30">{t.confirm}</span>
              <span className="rounded-lg bg-black/6 py-1.5">{t.move}</span>
            </div>
          </Enter>
          <Enter pop delay={2200} className="mt-3 flex w-full items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[0.8125rem] font-semibold text-[#1e5a2b]">
            <CheckBadge className="size-6" />
            {t.confirmed}
          </Enter>
        </div>
      </PhoneFrame>
    );
  }

  if (step >= 4) {
    return (
      <PhoneFrame time="12:15" title={t.salon} subtitle={t.handle} channel="instagram">
        <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
          <Enter>
            <Bubble from="us" label={t.ai} meta="12:15">
              {t.thanks}
            </Bubble>
          </Enter>
          <Enter delay={800} className="flex justify-end">
            <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/10">
              <Stars value={5} className="[&_svg]:size-4" />
            </span>
          </Enter>
          <Enter delay={1700}>
            <Bubble from="us" label={t.ai} meta="12:16">
              {t.reviewAsk}
            </Bubble>
          </Enter>
          <Enter pop delay={2500} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2 text-[0.8125rem] font-semibold shadow-sm ring-1 ring-black/10">
            <ChannelIcon channel="google" />
            {t.reviewBtn}
          </Enter>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame time={step === 0 ? "23:40" : "23:41"} title={t.salon} subtitle={t.handle} channel="instagram">
      <Chat t={t} step={step} />
    </PhoneFrame>
  );
}

const HOURS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function Slot({ row, span = 1, className, children }: { row: number; span?: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1 text-[0.6875rem] leading-tight", className)}
      style={{ top: `calc(${(row / HOURS.length) * 100}% + 2px)`, height: `calc(${(span / HOURS.length) * 100}% - 4px)` }}
    >
      {children}
    </div>
  );
}

function Salon({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const lilitStatus =
    step === 0 ? t.replying : step === 3 ? t.confirmedChip : step >= 4 ? t.reviewChip : t.bookedAi;
  const others = [t.answered, t.movedChip, t.answered];
  const busy: Array<[number, number, number]> = [
    [0, 2.5, 1.5],
    [0, 5, 1],
    [1, 0, 1],
    [1, 2, 1.5],
    [1, 5.5, 1],
  ];

  return (
    <AppFrame
      title={t.today}
      nav={t.nav}
      active={step === 5 ? 3 : 0}
      toast={<Toast show={step === 2} title={t.toast} text={t.toastText} />}
    >
      <div className="@container grid h-full grid-cols-1 gap-3 p-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-h-0 flex-col rounded-xl bg-white p-2.5 ring-1 ring-black/[0.06]">
          <p className="px-1 pb-2 text-[0.75rem] font-semibold text-[#55544f]">{t.inbox}</p>
          <ul className="flex flex-col gap-1.5">
            {t.chats.map(([name, channel, text], i) => {
              const first = i === 0;
              return (
                <li
                  key={name}
                  className={cn(
                    "flex items-center gap-2 rounded-lg p-2 transition-colors duration-500",
                    first ? "bg-signal/10 ring-1 ring-signal/40" : "bg-[#f6f5f1]",
                  )}
                >
                  <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#141414] text-[0.6875rem] font-semibold text-white">
                    {name.slice(0, 1)}
                    <ChannelIcon channel={channel as Channel} className="absolute -right-1 -bottom-1 size-3.5 ring-2 ring-white" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-[0.75rem] font-semibold">{name}</p>
                    <p className="truncate text-[0.6875rem] text-[#6b6a66]">{text}</p>
                  </div>
                  {first ? (
                    <Enter key={lilitStatus} className="shrink-0">
                      <Chip tone={step === 0 ? "plain" : step === 3 ? "ok" : "accent"}>{lilitStatus}</Chip>
                    </Enter>
                  ) : (
                    <Chip className="hidden shrink-0 @md:inline-flex">{others[i - 1]}</Chip>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden min-h-0 flex-col rounded-xl bg-white p-2.5 ring-1 ring-black/[0.06] @lg:flex">
          <div className="grid grid-cols-[2.5rem_repeat(2,minmax(0,1fr))] gap-x-1.5 pb-2 text-[0.75rem] font-semibold text-[#55544f]">
            <span>{t.calendar}</span>
            {t.masters.map((m) => (
              <span key={m} className="truncate text-center">
                {m}
              </span>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[2.5rem_repeat(2,minmax(0,1fr))] gap-x-1.5">
            <div className="relative">
              {HOURS.map((h, i) => (
                <span
                  key={h}
                  className="absolute left-0 text-[0.625rem] text-[#8a8984] tabular-nums"
                  style={{ top: `${(i / HOURS.length) * 100}%` }}
                >
                  {h}
                </span>
              ))}
            </div>
            {[0, 1].map((col) => (
              <div
                key={col}
                className="relative rounded-lg bg-[#faf9f6] [background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px)]"
                style={{ backgroundSize: `100% ${100 / HOURS.length}%` }}
              >
                {busy
                  .filter(([c]) => c === col)
                  .map(([, row, span]) => (
                    <Slot key={row} row={row} span={span} className="bg-black/[0.06] text-[#6b6a66]">
                      {t.busy}
                    </Slot>
                  ))}
                {col === 0 && step >= 1 && (
                  <Slot
                    row={1}
                    className={cn(
                      "border-2 font-semibold transition-colors duration-500",
                      step >= 3 ? "border-[#2f7a3e] bg-[#e3efe4] text-[#1e5a2b]" : "border-signal bg-signal/15 text-[#141414]",
                    )}
                  >
                    <Enter pop key={step >= 3 ? "ok" : "new"}>
                      {t.newVisit}
                    </Enter>
                  </Slot>
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 5 && (
          <Enter
            pop
            className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-[#141414] p-4 text-white shadow-[0_24px_50px_-18px_rgb(0_0_0/0.7)] @lg:inset-x-auto @lg:right-4 @lg:w-[19rem]"
          >
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
              <ChannelIcon channel="telegram" />
              {t.reportTitle}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {t.report.map(([label, value], i) => (
                <Enter key={label} delay={300 + i * 150} className="rounded-lg bg-white/[0.07] px-2.5 py-2">
                  <p className="text-[1.25rem] leading-none font-semibold tabular-nums">{value}</p>
                  <p className="mt-1 truncate text-[0.6875rem] text-white/60">{label}</p>
                </Enter>
              ))}
            </div>
            <p className="mt-3 text-[0.6875rem] text-signal">{t.reportNote}</p>
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const salonDemo: DemoDefinition = {
  focus: ["a", "a", "b", "a", "a", "b"],
  posterStep: 2,
  sides: {
    en: { a: "Client's Instagram", b: "Your Riseup panel" },
    hy: { a: "Հաճախորդի Instagram-ը", b: "Ձեր Riseup վահանակը" },
    ru: { a: "Instagram клиента", b: "Ваша панель Riseup" },
  },
  steps: {
    en: [
      { title: "A message at 23:40", text: "A client asks on Instagram about the price and a free time. The AI administrator answers in seconds, in Armenian, Russian or English." },
      { title: "Booked right in the chat", text: "The client taps a free time. The AI books the visit and confirms it. No calls, no waiting until morning." },
      { title: "You see everything", text: "The visit appears in the master's calendar, and you get a short note in Telegram. Chats from Instagram, WhatsApp and Telegram are in one list." },
      { title: "A reminder on the day", text: "In the morning the client gets a reminder and confirms with one tap. Fewer people forget their visit." },
      { title: "A review after the visit", text: "After the visit the AI thanks the client and asks for a Google review. More reviews help new clients find you." },
      { title: "Your day in one message", text: "Every evening you get a short report: how many people wrote, how many booked, and who is waiting for you." },
    ],
    hy: [
      { title: "Նամակ 23:40-ին", text: "Հաճախորդը Instagram-ում հարցնում է գինը և ազատ ժամը։ AI ադմինիստրատորը պատասխանում է վայրկյանների ընթացքում՝ հայերեն, ռուսերեն կամ անգլերեն։" },
      { title: "Գրանցում հենց չատում", text: "Հաճախորդը սեղմում է ազատ ժամը։ AI-ն գրանցում է այցը և հաստատում։ Ո՛չ զանգ, ո՛չ էլ սպասել մինչև առավոտ։" },
      { title: "Դուք տեսնում եք ամեն ինչ", text: "Այցը հայտնվում է վարպետի օրացույցում, իսկ դուք Telegram-ով ստանում եք կարճ ծանուցում։ Instagram-ի, WhatsApp-ի և Telegram-ի նամակները մեկ ցուցակում են։" },
      { title: "Հիշեցում այցի օրը", text: "Առավոտյան հաճախորդը ստանում է հիշեցում և մեկ հպումով հաստատում։ Ավելի քիչ մարդիկ են մոռանում իրենց այցը։" },
      { title: "Կարծիք այցից հետո", text: "Այցից հետո AI-ն շնորհակալություն է հայտնում և խնդրում կարծիք Google-ում։ Շատ կարծիքները օգնում են նոր հաճախորդներին գտնել ձեզ։" },
      { title: "Ձեր օրը մեկ նամակում", text: "Ամեն երեկո ստանում եք կարճ հաշվետվություն՝ քանիսն են գրել, քանիսն են գրանցվել, և ով է սպասում ձեզ։" },
    ],
    ru: [
      { title: "Сообщение в 23:40", text: "Клиент спрашивает в Instagram цену и свободное время. AI-администратор отвечает за секунды — на армянском, русском или английском." },
      { title: "Запись прямо в чате", text: "Клиент нажимает свободное время. AI записывает и подтверждает визит. Без звонков и ожидания до утра." },
      { title: "Вы видите всё", text: "Визит появляется в календаре мастера, а вам приходит короткое уведомление в Telegram. Чаты из Instagram, WhatsApp и Telegram — в одном списке." },
      { title: "Напоминание в день визита", text: "Утром клиент получает напоминание и подтверждает одним касанием. Меньше людей забывают о визите." },
      { title: "Отзыв после визита", text: "После визита AI благодарит клиента и просит оставить отзыв в Google. Больше отзывов — новым клиентам легче вас найти." },
      { title: "Ваш день в одном сообщении", text: "Каждый вечер вы получаете короткий отчёт: сколько людей написали, сколько записались и кто ждёт вашего ответа." },
    ],
  },
  A: Client,
  B: Salon,
};
