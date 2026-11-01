import type { Locale } from "@/i18n/config";
import { AppFrame, Bubble, Chip, Enter, Meter, PhoneFrame, Typing } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "AI Customer Support System" concept project. */

const ui = {
  en: {
    shop: "Online store",
    chatSub: "Support chat",
    ai: "AI assistant",
    q1: "Hi! Where is my order #4412?",
    a1: "Your order #4412 left our warehouse yesterday. Tracking number: TRK-80421. It should arrive on Thursday.",
    thanks: "Thank you!",
    q2: "My lamp arrived broken. I want a refund.",
    wait: "A colleague will join this chat shortly.",
    desk: "Support desk",
    convo: "Conversation",
    looking: "Checking the order…",
    sources: "Sources",
    src1: "Order system",
    src1v: "#4412 · shipped yesterday · TRK-80421",
    src2: "Delivery rules",
    src2v: "Arrives in 2–3 working days",
    checked: "Checked against your data",
    sent: "Sent automatically",
    handoff: "Handed to a person",
    summary: "Summary",
    summaryV: "Damaged item · order #4398 · wants a refund",
    takeOver: "Take over",
    note: "The customer won't have to repeat anything.",
    topics: "What customers asked this week",
    topicsList: ["Delivery status", "Returns", "Payment", "Product questions"],
    byAi: "Answered by AI",
    byPeople: "Handled by people",
  },
  hy: {
    shop: "Առցանց խանութ",
    chatSub: "Աջակցման չաթ",
    ai: "AI օգնական",
    q1: "Բարև ձեզ։ Որտե՞ղ է իմ #4412 պատվերը։",
    a1: "Ձեր #4412 պատվերը երեկ դուրս է եկել պահեստից։ Հետևելու համարը՝ TRK-80421։ Այն պետք է հասնի հինգշաբթի։",
    thanks: "Շնորհակալություն։",
    q2: "Լամպը կոտրված է հասել։ Ուզում եմ գումարս հետ ստանալ։",
    wait: "Մեր աշխատակիցը շուտով կմիանա զրույցին։",
    desk: "Աջակցման կենտրոն",
    convo: "Զրույց",
    looking: "Ստուգում ենք պատվերը…",
    sources: "Աղբյուրներ",
    src1: "Պատվերների համակարգ",
    src1v: "#4412 · ուղարկվել է երեկ · TRK-80421",
    src2: "Առաքման կանոններ",
    src2v: "Առաքում 2–3 աշխատանքային օրում",
    checked: "Ստուգված է ձեր տվյալներով",
    sent: "Ուղարկվել է ավտոմատ",
    handoff: "Փոխանցվել է աշխատակցին",
    summary: "Ամփոփում",
    summaryV: "Վնասված ապրանք · պատվեր #4398 · ուզում է վերադարձ",
    takeOver: "Վերցնել զրույցը",
    note: "Հաճախորդը ստիպված չի լինի կրկնել ոչինչ։",
    topics: "Ինչ էին հարցնում հաճախորդներն այս շաբաթ",
    topicsList: ["Առաքման կարգավիճակ", "Վերադարձ", "Վճարում", "Հարցեր ապրանքի մասին"],
    byAi: "Պատասխանել է AI-ն",
    byPeople: "Պատասխանել են աշխատակիցները",
  },
  ru: {
    shop: "Интернет-магазин",
    chatSub: "Чат поддержки",
    ai: "AI-ассистент",
    q1: "Здравствуйте! Где мой заказ #4412?",
    a1: "Ваш заказ #4412 вчера отправлен со склада. Номер для отслеживания: TRK-80421. Он должен прийти в четверг.",
    thanks: "Спасибо!",
    q2: "Лампа пришла разбитой. Хочу вернуть деньги.",
    wait: "Сотрудник скоро подключится к чату.",
    desk: "Служба поддержки",
    convo: "Диалог",
    looking: "Проверяем заказ…",
    sources: "Источники",
    src1: "Система заказов",
    src1v: "#4412 · отправлен вчера · TRK-80421",
    src2: "Правила доставки",
    src2v: "Доставка за 2–3 рабочих дня",
    checked: "Проверено по вашим данным",
    sent: "Отправлено автоматически",
    handoff: "Передано сотруднику",
    summary: "Кратко",
    summaryV: "Повреждённый товар · заказ #4398 · хочет возврат",
    takeOver: "Взять диалог",
    note: "Клиенту не придётся ничего повторять.",
    topics: "О чём спрашивали клиенты на этой неделе",
    topicsList: ["Статус доставки", "Возврат", "Оплата", "Вопросы о товаре"],
    byAi: "Ответил AI",
    byPeople: "Ответили сотрудники",
  },
} satisfies Record<Locale, Record<string, unknown>>;

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const second = step >= 3;
  return (
    <PhoneFrame time={second ? "22:31" : "22:15"} title={t.shop} subtitle={t.chatSub}>
      <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
        {!second && (
          <>
            <Enter>
              <Bubble from="them" meta="22:15">
                {t.q1}
              </Bubble>
            </Enter>
            {step === 1 && <Typing />}
            {step === 2 && (
              <>
                <Enter delay={150}>
                  <Bubble from="us" label={t.ai} meta="22:15">
                    {t.a1}
                  </Bubble>
                </Enter>
                <Enter delay={1500}>
                  <Bubble from="them" meta="22:16">
                    {t.thanks}
                  </Bubble>
                </Enter>
              </>
            )}
          </>
        )}
        {second && (
          <>
            <Enter key="q2">
              <Bubble from="them" meta="22:31">
                {t.q2}
              </Bubble>
            </Enter>
            <Enter delay={900}>
              <Bubble from="us" label={t.ai} meta="22:31">
                {t.wait}
              </Bubble>
            </Enter>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  return (
    <AppFrame title={t.desk}>
      <div className="@container flex h-full flex-col gap-3 overflow-hidden p-3">
        {step <= 2 && (
          <>
            <div className="rounded-md border border-black/10 bg-white p-3">
              <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.convo} · {t.chatSub}</p>
              <p className="mt-1.5 text-[0.875rem]">“{t.q1}”</p>
            </div>
            {step === 0 && (
              <Enter delay={600} className="flex items-center gap-2 text-[0.8125rem] text-[#55544f]">
                <span aria-hidden="true" className="size-2 animate-demo-typing rounded-full bg-signal" />
                {t.looking}
              </Enter>
            )}
            {step >= 1 && (
              <Enter className="rounded-md border border-black/10 bg-white p-3">
                <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.sources}</p>
                {[
                  [t.src1, t.src1v],
                  [t.src2, t.src2v],
                ].map(([name, value], i) => (
                  <Enter key={name} delay={300 + i * 500} className="mt-2 flex items-start gap-2.5 rounded-md bg-black/[0.04] p-2.5">
                    <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-sm bg-signal" />
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-semibold">{name}</p>
                      <p className="text-[0.75rem] text-[#55544f] [overflow-wrap:anywhere]">{value}</p>
                    </div>
                  </Enter>
                ))}
                <Enter delay={1400} className="mt-3 flex flex-wrap items-center gap-2">
                  <Chip tone="ok">{t.checked}</Chip>
                  {step === 2 && <Chip tone="dark">{t.sent}</Chip>}
                </Enter>
              </Enter>
            )}
          </>
        )}

        {step === 3 && (
          <Enter key="handoff" className="flex flex-col gap-3">
            <div className="rounded-md border border-black/10 bg-white p-3">
              <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.convo} · {t.chatSub}</p>
              <p className="mt-1.5 text-[0.875rem]">“{t.q2}”</p>
            </div>
            <Enter delay={500} className="rounded-md border-2 border-signal bg-white p-3">
              <p className="flex items-center gap-2 text-[0.875rem] font-semibold">
                <span aria-hidden="true" className="size-2 animate-demo-pulse rounded-full bg-signal" />
                {t.handoff}
              </p>
              <p className="mt-2 text-[0.75rem] font-semibold text-[#55544f]">{t.summary}</p>
              <p className="text-[0.8125rem] [overflow-wrap:anywhere]">{t.summaryV}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-[#141414] px-3 py-1.5 text-[0.75rem] font-semibold text-white">{t.takeOver}</span>
                <span className="text-[0.75rem] text-[#55544f]">{t.note}</span>
              </div>
            </Enter>
          </Enter>
        )}

        {step === 4 && (
          <Enter key="topics" className="flex flex-col gap-3 rounded-md border border-black/10 bg-white p-3">
            <p className="text-[0.875rem] font-semibold">{t.topics}</p>
            {t.topicsList.map((topic, i) => (
              <div key={topic} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-3">
                <span className="truncate text-[0.8125rem]">{topic}</span>
                <Meter value={[0.86, 0.48, 0.3, 0.2][i]} accent={i === 0} />
              </div>
            ))}
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip tone="dark">{t.byAi}</Chip>
              <Chip>{t.byPeople}</Chip>
            </div>
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const supportDemo: DemoDefinition = {
  focus: ["a", "b", "a", "b", "b"],
  posterStep: 1,
  sides: {
    en: { a: "Customer's phone", b: "Support desk" },
    hy: { a: "Հաճախորդի հեռախոսը", b: "Աջակցման կենտրոնը" },
    ru: { a: "Телефон клиента", b: "Служба поддержки" },
  },
  steps: {
    en: [
      { title: "A customer asks a question", text: "Questions come in through website chat, Telegram and email, at any hour." },
      { title: "The assistant checks the facts", text: "It looks up the order and your delivery rules. It answers from real data, not guesses." },
      { title: "A clear answer in seconds", text: "The customer gets a correct, friendly reply with the tracking number." },
      {
        title: "Hard cases go to a person",
        text: "Refunds and complaints go to your team with a short summary, so nobody asks the customer twice.",
      },
      { title: "You see what customers ask", text: "A weekly view shows the most common questions, so you can fix the cause." },
    ],
    hy: [
      { title: "Հաճախորդը հարց է տալիս", text: "Հարցերը գալիս են կայքի չաթից, Telegram-ից և էլ. փոստից՝ ցանկացած ժամի։" },
      {
        title: "Օգնականը ստուգում է փաստերը",
        text: "Նա ստուգում է պատվերը և ձեր առաքման կանոնները։ Պատասխանում է իրական տվյալներով, ոչ թե ենթադրությամբ։",
      },
      { title: "Հստակ պատասխան վայրկյաններում", text: "Հաճախորդը ստանում է ճիշտ և բարեհամբույր պատասխան՝ հետևելու համարով։" },
      {
        title: "Բարդ դեպքերը՝ աշխատակցին",
        text: "Վերադարձներն ու բողոքները հասնում են ձեր թիմին կարճ ամփոփումով, որպեսզի հաճախորդին նույնը երկրորդ անգամ չհարցնեն։",
      },
      {
        title: "Տեսնում եք, թե ինչ են հարցնում",
        text: "Շաբաթական ամփոփումը ցույց է տալիս ամենահաճախ տրվող հարցերը, որպեսզի կարողանաք վերացնել պատճառը։",
      },
    ],
    ru: [
      { title: "Клиент задаёт вопрос", text: "Вопросы приходят в чат на сайте, в Telegram и на почту — в любое время." },
      { title: "Ассистент проверяет факты", text: "Он смотрит заказ и ваши правила доставки. Отвечает по реальным данным, а не наугад." },
      { title: "Понятный ответ за секунды", text: "Клиент получает точный и вежливый ответ с номером для отслеживания." },
      {
        title: "Сложные случаи — сотруднику",
        text: "Возвраты и жалобы попадают к команде с кратким описанием, чтобы клиента не переспрашивали.",
      },
      {
        title: "Видно, о чём спрашивают клиенты",
        text: "Недельная сводка показывает самые частые вопросы, чтобы можно было устранить причину.",
      },
    ],
  },
  A: Customer,
  B: Team,
};
