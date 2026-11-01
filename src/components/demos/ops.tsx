import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Chip, Enter, PhoneFrame } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "Business Operations Dashboard" concept project. */

const ui = {
  en: {
    app: "Factory app",
    appSub: "Production",
    order: "Order",
    product: "Kitchen cabinets",
    stage: "Stage",
    stages: ["Design", "Cutting", "Assembly", "Quality check", "Delivery"],
    done: "Cutting done",
    movedTo: "Moved to Assembly",
    materials: "Materials ready?",
    yes: "Yes",
    no: "No",
    missing: "Missing: hinges",
    reported: "Reported to the manager",
    dash: "Operations dashboard",
    busiest: "Busiest stage",
    risk: "May be late",
    riskText: "Order #131 · materials missing · due Friday",
    action: "Write to the supplier",
    report: "Weekly report",
    reportReady: "Ready · sent to management, Mon 09:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    finished: "Orders finished",
    onTime: "On time",
  },
  hy: {
    app: "Արտադրամասի հավելված",
    appSub: "Արտադրություն",
    order: "Պատվեր",
    product: "Խոհանոցային պահարաններ",
    stage: "Փուլ",
    stages: ["Դիզայն", "Կտրում", "Հավաքում", "Որակի ստուգում", "Առաքում"],
    done: "Կտրումն ավարտված է",
    movedTo: "Անցավ հավաքման փուլ",
    materials: "Նյութերը պատրա՞ստ են",
    yes: "Այո",
    no: "Ոչ",
    missing: "Պակասում են ծխնիները",
    reported: "Ղեկավարը տեղեկացված է",
    dash: "Գործառնական վահանակ",
    busiest: "Ամենածանրաբեռնված փուլը",
    risk: "Կարող է ուշանալ",
    riskText: "Պատվեր #131 · նյութեր չկան · ժամկետը՝ ուրբաթ",
    action: "Գրել մատակարարին",
    report: "Շաբաթական հաշվետվություն",
    reportReady: "Պատրաստ է · ուղարկված է ղեկավարությանը, երկ 09:00",
    days: ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ"],
    finished: "Ավարտված պատվերներ",
    onTime: "Ժամանակին",
  },
  ru: {
    app: "Приложение цеха",
    appSub: "Производство",
    order: "Заказ",
    product: "Кухонные шкафы",
    stage: "Этап",
    stages: ["Дизайн", "Раскрой", "Сборка", "Контроль качества", "Доставка"],
    done: "Раскрой завершён",
    movedTo: "Передано на сборку",
    materials: "Материалы готовы?",
    yes: "Да",
    no: "Нет",
    missing: "Не хватает петель",
    reported: "Руководитель уведомлён",
    dash: "Дашборд производства",
    busiest: "Самый загруженный этап",
    risk: "Может опоздать",
    riskText: "Заказ #131 · нет материалов · срок — пятница",
    action: "Написать поставщику",
    report: "Еженедельный отчёт",
    reportReady: "Готов · отправлен руководству, пн 09:00",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт"],
    finished: "Готовые заказы",
    onTime: "В срок",
  },
} satisfies Record<Locale, Record<string, unknown>>;

// Orders per stage (index into stages) before and after #128 moves on.
const ORDERS: Array<[number, number]> = [
  [121, 4],
  [123, 3],
  [124, 2],
  [125, 2],
  [126, 2],
  [127, 1],
  [128, 1],
  [129, 0],
  [130, 0],
  [131, 2],
];

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const second = step >= 2;
  return (
    <PhoneFrame time={second ? "14:05" : "11:40"} title={t.app} subtitle={t.appSub}>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        <Enter key={second ? "131" : "128"} className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-2 rounded-lg border border-black/10 px-3 py-2">
            <p className="text-[1.0625rem] font-semibold tabular-nums">
              {t.order} #{second ? 131 : 128}
            </p>
            <p className="truncate text-[0.75rem] text-[#55544f]">{t.product}</p>
          </div>
          <p className="text-[0.6875rem] font-semibold text-[#6b6a66]">{t.stage}</p>
          <div className="flex flex-col gap-1.5">
            {t.stages.slice(0, 4).map((s, i) => {
              const current = second ? 2 : step === 0 ? 1 : 2;
              return (
                <div
                  key={s}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-1.5 text-[0.8125rem] transition-colors duration-500",
                    i < current && "border-transparent bg-[#e3efe4] text-[#1e5a2b]",
                    i === current && "border-[#141414] bg-[#141414] text-white",
                    i > current && "border-black/10 text-[#8a8984]",
                  )}
                >
                  {s}
                  {i < current && <span aria-hidden="true">✓</span>}
                </div>
              );
            })}
          </div>
          {step === 0 && <div className="rounded-lg bg-signal px-3 py-2.5 text-center text-[0.8125rem] font-semibold text-black">{t.done}</div>}
          {step === 1 && (
            <Enter className="rounded-lg bg-[#e3efe4] px-3 py-2.5 text-center text-[0.8125rem] font-semibold text-[#1e5a2b]">✓ {t.movedTo}</Enter>
          )}
          {second && (
            <Enter delay={200} className="rounded-lg border-2 border-signal p-3">
              <p className="text-[0.8125rem] font-semibold">{t.materials}</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[0.75rem] font-semibold">
                <span className="rounded-md bg-black/6 py-1.5">{t.yes}</span>
                <span className="rounded-md bg-signal py-1.5 text-black">{t.no}</span>
              </div>
              <p className="mt-2 text-[0.75rem] text-[#55544f]">{t.missing}</p>
              <p className="mt-1 text-[0.75rem] font-semibold">→ {t.reported}</p>
            </Enter>
          )}
        </Enter>
      </div>
    </PhoneFrame>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const moved = step >= 1;
  return (
    <AppFrame title={t.dash}>
      <div className="@container flex h-full flex-col gap-3 overflow-hidden p-3">
        {step < 3 && (
          <div className="grid min-h-0 grid-cols-3 gap-2 @lg:grid-cols-5">
            {t.stages.map((s, si) => {
              const orders = ORDERS.filter(([id, stage]) => (id === 128 && moved ? 2 : stage) === si);
              const busiest = si === 2 && moved;
              return (
                <div
                  key={s}
                  className={cn(
                    "flex min-w-0 flex-col gap-1.5 rounded-md p-2 transition-colors duration-500",
                    busiest ? "bg-signal/12 ring-1 ring-signal" : "bg-black/[0.04]",
                    si > 2 && "hidden @lg:flex",
                  )}
                >
                  <p className="truncate text-[0.6875rem] font-semibold text-[#55544f]">{s}</p>
                  {orders.map(([id]) => (
                    <Enter key={`${id}-${id === 128 && moved}`} pop={id === 128 && moved}>
                      <div
                        className={cn(
                          "rounded-[5px] border bg-white px-2 py-1.5 text-[0.75rem] font-semibold tabular-nums",
                          id === 128 && moved ? "border-signal" : "border-black/8",
                          id === 131 && step >= 2 && "border-2 border-signal",
                        )}
                      >
                        #{id}
                      </div>
                    </Enter>
                  ))}
                  {busiest && <span className="text-[0.625rem] font-semibold text-[#8a3a12]">{t.busiest}</span>}
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <Enter delay={400} className="rounded-md border-2 border-signal bg-white p-3 shadow-sm">
            <p className="flex items-center gap-2 text-[0.875rem] font-semibold">
              <span aria-hidden="true" className="size-2 animate-demo-pulse rounded-full bg-signal" />
              {t.risk}
            </p>
            <p className="mt-1 text-[0.8125rem] [overflow-wrap:anywhere]">{t.riskText}</p>
            <span className="mt-2.5 inline-block rounded-md bg-[#141414] px-3 py-1.5 text-[0.75rem] font-semibold text-white">{t.action}</span>
          </Enter>
        )}

        {step === 3 && (
          <Enter key="report" className="flex flex-1 flex-col gap-3 rounded-md border border-black/10 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.875rem] font-semibold">{t.report}</p>
              <Chip tone="ok">{t.reportReady}</Chip>
            </div>
            <div className="flex flex-wrap gap-3 text-[0.6875rem] text-[#55544f]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[2px] bg-[#141414]" />
                {t.finished}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[2px] bg-signal" />
                {t.onTime}
              </span>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-5 items-end gap-3">
              {t.days.map((d, i) => {
                const total = [0.62, 0.78, 0.55, 0.9, 0.7][i];
                const ok = [0.54, 0.7, 0.5, 0.86, 0.66][i];
                return (
                  <div key={d} className="flex h-full flex-col items-center justify-end gap-1.5">
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <Enter delay={i * 120} className="w-1/3 rounded-t-sm bg-[#141414]" style={{ height: `${total * 100}%` }}>
                        <span />
                      </Enter>
                      <Enter delay={i * 120 + 60} className="w-1/3 rounded-t-sm bg-signal" style={{ height: `${ok * 100}%` }}>
                        <span />
                      </Enter>
                    </div>
                    <span className="text-[0.6875rem] text-[#6b6a66]">{d}</span>
                  </div>
                );
              })}
            </div>
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const opsDemo: DemoDefinition = {
  focus: ["a", "b", "b", "b"],
  posterStep: 2,
  sides: {
    en: { a: "Worker's phone", b: "Manager's dashboard" },
    hy: { a: "Աշխատողի հեռախոսը", b: "Ղեկավարի վահանակը" },
    ru: { a: "Телефон сотрудника", b: "Дашборд руководителя" },
  },
  steps: {
    en: [
      { title: "One tap on the factory floor", text: "Workers mark each finished stage from their phone. No calls, no paper notes." },
      { title: "Everyone sees where orders are", text: "The dashboard shows every order by stage, and where work is piling up." },
      { title: "Problems show up early", text: "Missing materials are flagged right away, while there's still time to act." },
      { title: "Reports build themselves", text: "The weekly report is ready on Monday morning, without anyone copying numbers." },
    ],
    hy: [
      { title: "Մեկ հպում արտադրամասում", text: "Աշխատողներն իրենց հեռախոսից նշում են յուրաքանչյուր ավարտված փուլը։ Ոչ զանգեր, ոչ թղթեր։" },
      {
        title: "Բոլորը տեսնում են, թե որտեղ է պատվերը",
        text: "Վահանակը ցույց է տալիս բոլոր պատվերներն ըստ փուլերի և այն տեղը, որտեղ աշխատանքը կուտակվում է։",
      },
      { title: "Խնդիրները երևում են շուտ", text: "Պակասող նյութերն անմիջապես նշվում են, երբ դեռ ժամանակ կա ինչ-որ բան անելու։" },
      { title: "Հաշվետվություններն ինքնաշխատ են", text: "Շաբաթական հաշվետվությունը պատրաստ է երկուշաբթի առավոտյան՝ առանց ձեռքով թվեր պատճենելու։" },
    ],
    ru: [
      { title: "Одно касание в цехе", text: "Сотрудники отмечают каждый готовый этап с телефона. Без звонков и бумажек." },
      { title: "Все видят, где заказы", text: "Дашборд показывает каждый заказ по этапам и где копится работа." },
      { title: "Проблемы видны заранее", text: "Нехватка материалов отмечается сразу — пока ещё есть время что-то сделать." },
      { title: "Отчёты собираются сами", text: "Еженедельный отчёт готов в понедельник утром, и никто не копирует цифры вручную." },
    ],
  },
  A: Customer,
  B: Team,
};
