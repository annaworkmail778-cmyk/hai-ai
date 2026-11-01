import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Bubble, Chip, Enter, Field, Meter, PhoneFrame, Toast, Typing } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "AI Lead Management System" concept project. */

const ui = {
  en: {
    business: "Your business",
    channel: "Instagram · Direct",
    ai: "AI assistant",
    m1: "Hi! How much does a website for a dental clinic cost?",
    r1: "Hello! Happy to help. Is it a new website or a redesign? And when would you like to launch?",
    m2: "A new one. Ideally within a month.",
    r2: "Great. A manager will call you tomorrow morning with options and prices. What's the best number?",
    m3: "+374 91 000000",
    crm: "CRM · Inquiries",
    cols: ["New", "Qualified", "In progress"],
    lead: "Dental clinic · website",
    leadSrc: "Instagram · 23:40",
    others: [
      ["Café · menu app", "Website"],
      ["Online store", "WhatsApp"],
      ["Logistics company", "Call"],
      ["Hotel · booking", "Website"],
    ],
    card: "Inquiry card",
    need: "Needs",
    needV: "New website",
    when: "Launch",
    whenV: "Within a month",
    budget: "Budget",
    budgetV: "Wants prices",
    phone: "Phone",
    ready: "Ready to buy",
    high: "High",
    owner: "Sales manager",
    assigned: "Assigned",
    callAt: "Call at 10:00",
    toast: "New inquiry assigned to you",
    toastText: "Dental clinic · call at 10:00",
    allIn: "All channels in one list",
  },
  hy: {
    business: "Ձեր բիզնեսը",
    channel: "Instagram · Direct",
    ai: "AI օգնական",
    m1: "Բարև ձեզ։ Ինչ արժե ատամնաբուժական կլինիկայի կայքը։",
    r1: "Բարև ձեզ։ Սիրով կօգնենք։ Սա նոր կա՞յք է, թե՞ վերանորոգում։ Եվ ե՞րբ եք ուզում գործարկել։",
    m2: "Նոր կայք։ Ցանկալի է՝ մեկ ամսում։",
    r2: "Հիանալի է։ Վաղն առավոտյան մենեջերը կզանգի ձեզ տարբերակներով և գներով։ Ո՞ր համարով զանգենք։",
    m3: "+374 91 000000",
    crm: "CRM · Հայտեր",
    cols: ["Նոր", "Որակավորված", "Աշխատանքում"],
    lead: "Կլինիկա · կայք",
    leadSrc: "Instagram · 23:40",
    others: [
      ["Սրճարան · մենյու", "Կայք"],
      ["Առցանց խանութ", "WhatsApp"],
      ["Լոգիստիկ ընկերություն", "Զանգ"],
      ["Հյուրանոց · ամրագրում", "Կայք"],
    ],
    card: "Հայտի քարտ",
    need: "Կարիք",
    needV: "Նոր կայք",
    when: "Գործարկում",
    whenV: "Մեկ ամսում",
    budget: "Բյուջե",
    budgetV: "Ուզում է իմանալ գինը",
    phone: "Հեռախոս",
    ready: "Պատրաստ է գնելու",
    high: "Բարձր",
    owner: "Վաճառքի մենեջեր",
    assigned: "Նշանակված է",
    callAt: "Զանգել 10:00-ին",
    toast: "Ձեզ նոր հայտ է նշանակվել",
    toastText: "Կլինիկա · զանգել 10:00-ին",
    allIn: "Բոլոր ալիքները մեկ ցուցակում",
  },
  ru: {
    business: "Ваш бизнес",
    channel: "Instagram · Direct",
    ai: "AI-ассистент",
    m1: "Здравствуйте! Сколько стоит сайт для стоматологии?",
    r1: "Здравствуйте! С радостью поможем. Это новый сайт или обновление старого? И когда хотите запустить?",
    m2: "Новый. Желательно в течение месяца.",
    r2: "Отлично. Завтра утром менеджер позвонит с вариантами и ценами. По какому номеру связаться?",
    m3: "+374 91 000000",
    crm: "CRM · Заявки",
    cols: ["Новые", "Квалифицированы", "В работе"],
    lead: "Стоматология · сайт",
    leadSrc: "Instagram · 23:40",
    others: [
      ["Кафе · меню", "Сайт"],
      ["Интернет-магазин", "WhatsApp"],
      ["Логистика", "Звонок"],
      ["Отель · бронирование", "Сайт"],
    ],
    card: "Карточка заявки",
    need: "Задача",
    needV: "Новый сайт",
    when: "Запуск",
    whenV: "В течение месяца",
    budget: "Бюджет",
    budgetV: "Хочет узнать цену",
    phone: "Телефон",
    ready: "Готовность купить",
    high: "Высокая",
    owner: "Менеджер по продажам",
    assigned: "Назначена",
    callAt: "Позвонить в 10:00",
    toast: "Вам назначена новая заявка",
    toastText: "Стоматология · позвонить в 10:00",
    allIn: "Все каналы в одном списке",
  },
} satisfies Record<Locale, Record<string, unknown>>;

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  return (
    <PhoneFrame time={step === 0 ? "23:40" : "23:41"} title={t.business} subtitle={t.channel}>
      <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
        <Enter>
          <Bubble from="them" meta="23:40">
            {t.m1}
          </Bubble>
        </Enter>
        {step === 0 && <Typing />}
        {step >= 1 && (
          <>
            <Enter delay={200}>
              <Bubble from="us" label={t.ai} meta="23:40">
                {t.r1}
              </Bubble>
            </Enter>
            <Enter delay={1400}>
              <Bubble from="them" meta="23:41">
                {t.m2}
              </Bubble>
            </Enter>
            <Enter delay={2600}>
              <Bubble from="us" label={t.ai} meta="23:41">
                {t.r2}
              </Bubble>
            </Enter>
            <Enter delay={3800}>
              <Bubble from="them" meta="23:41">
                {t.m3}
              </Bubble>
            </Enter>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function LeadCard({ t, owner }: { t: (typeof ui)["en"]; owner?: boolean }) {
  return (
    <div className="rounded-md border-2 border-signal bg-white p-2.5 shadow-sm">
      <p className="text-[0.8125rem] leading-snug font-semibold [overflow-wrap:anywhere]">{t.lead}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Chip tone="accent">{t.leadSrc}</Chip>
        {owner && <Chip tone="dark">{t.owner}</Chip>}
      </div>
    </div>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const column = step >= 3 ? 1 : 0;
  return (
    <AppFrame title={t.crm} toast={<Toast show={step === 3} title={t.toast} text={t.toastText} />}>
      <div className="@container flex h-full flex-col gap-3 p-3">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 @lg:grid-cols-3">
          {t.cols.map((name, ci) => (
            <div key={name} className={cn("flex min-h-0 flex-col gap-2 rounded-md bg-black/[0.04] p-2", ci === 2 && "hidden @lg:flex")}>
              <p className="flex items-center justify-between text-[0.75rem] font-semibold text-[#55544f]">
                {name}
              </p>
              {ci === column && (
                <Enter key={`lead-${column}`} pop>
                  <LeadCard t={t} owner={step >= 3} />
                </Enter>
              )}
              {t.others
                .filter((_, oi) => oi % 3 === ci)
                .map(([title, src]) => (
                  <div key={title} className="rounded-md border border-black/8 bg-white p-2.5">
                    <p className="text-[0.8125rem] leading-snug font-medium [overflow-wrap:anywhere]">{title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Chip>{src}</Chip>
                      {step >= 4 && <Chip tone="dark">{t.assigned}</Chip>}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {(step === 2 || step === 3) && (
          <Enter className="rounded-md border border-black/10 bg-white p-3 shadow-sm">
            <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.card}</p>
            <div className="mt-1">
              <Field label={t.need} value={t.needV} delay={150} />
              <Field label={t.when} value={t.whenV} delay={450} />
              <Field label={t.budget} value={t.budgetV} delay={750} />
              <Field label={t.phone} value="+374 91 000000" delay={1050} />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="shrink-0 text-[0.75rem] text-[#6b6a66]">{t.ready}</span>
              <Meter value={0.82} />
              <Chip tone="accent">{t.high}</Chip>
            </div>
            {step === 3 && <p className="mt-2 text-[0.75rem] font-semibold">→ {t.owner} · {t.callAt}</p>}
          </Enter>
        )}

        {step >= 4 && (
          <Enter className="flex items-center justify-center gap-2 rounded-md bg-[#141414] px-3 py-2 text-[0.8125rem] font-semibold text-white">
            <span aria-hidden="true" className="size-2 rounded-full bg-signal" />
            {t.allIn}
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const leadDemo: DemoDefinition = {
  focus: ["a", "a", "b", "b", "b"],
  posterStep: 2,
  sides: {
    en: { a: "Customer's phone", b: "Your CRM" },
    hy: { a: "Հաճախորդի հեռախոսը", b: "Ձեր CRM-ը" },
    ru: { a: "Телефон клиента", b: "Ваша CRM" },
  },
  steps: {
    en: [
      { title: "A customer writes at night", text: "A message arrives on Instagram at 23:40. Nobody from your team is online." },
      {
        title: "The assistant replies at once",
        text: "The AI assistant answers in seconds and asks what your sales team would ask: what the customer needs and when.",
      },
      {
        title: "The inquiry card fills itself",
        text: "Everything the customer said is saved in your CRM, and the AI marks how ready they are to buy.",
      },
      { title: "The right manager gets it", text: "The inquiry goes to the right manager, with a reminder to call in the morning." },
      {
        title: "Nothing gets lost",
        text: "Website, Instagram, WhatsApp and calls end up in one list. Every inquiry has an owner and a next step.",
      },
    ],
    hy: [
      { title: "Հաճախորդը գրում է գիշերը", text: "Հաղորդագրությունը գալիս է Instagram-ով ժամը 23:40-ին։ Ձեր թիմից ոչ ոք առցանց չէ։" },
      {
        title: "Օգնականն անմիջապես պատասխանում է",
        text: "AI օգնականը պատասխանում է վայրկյանների ընթացքում և տալիս այն հարցերը, որոնք կտար ձեր վաճառքի թիմը՝ ինչ է պետք և երբ։",
      },
      {
        title: "Հայտի քարտը լրացվում է ինքնուրույն",
        text: "Հաճախորդի ասած ամեն ինչ պահվում է CRM-ում, իսկ AI-ն նշում է, թե որքան է նա պատրաստ գնելու։",
      },
      { title: "Հայտը ստանում է ճիշտ մենեջերը", text: "Հայտն ուղարկվում է համապատասխան մենեջերին՝ առավոտյան զանգելու հիշեցումով։" },
      {
        title: "Ոչինչ չի կորչում",
        text: "Կայքը, Instagram-ը, WhatsApp-ը և զանգերը մեկ ցուցակում են։ Յուրաքանչյուր հայտ ունի պատասխանատու և հաջորդ քայլ։",
      },
    ],
    ru: [
      { title: "Клиент пишет ночью", text: "Сообщение приходит в Instagram в 23:40. Никого из команды нет в сети." },
      {
        title: "Ассистент отвечает сразу",
        text: "AI-ассистент отвечает за секунды и задаёт вопросы, которые задал бы ваш отдел продаж: что нужно клиенту и когда.",
      },
      {
        title: "Карточка заявки заполняется сама",
        text: "Всё, что сказал клиент, сохраняется в CRM, а AI отмечает, насколько он готов к покупке.",
      },
      { title: "Заявку получает нужный менеджер", text: "Заявка уходит нужному менеджеру с напоминанием позвонить утром." },
      {
        title: "Ничего не теряется",
        text: "Сайт, Instagram, WhatsApp и звонки — в одном списке. У каждой заявки есть ответственный и следующий шаг.",
      },
    ],
  },
  A: Customer,
  B: Team,
};
