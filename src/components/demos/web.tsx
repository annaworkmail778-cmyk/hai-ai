import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Chip, Enter, PhoneFrame } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — illustrates the "Corporate website" concept project. */

const ui = {
  en: {
    oldTitle: "Old website",
    loading: "Loading…",
    welcome: "Welcome to our website",
    oldText: "We are a leading company with many years of experience.",
    newSite: "Engineering group",
    newSub: "New website",
    headline: "Engineering spaces that last.",
    sub: "Design, engineering and delivery of complex buildings.",
    projects: "Our projects",
    contact: "Contact us",
    cms: "Website editor",
    newProject: "New project",
    fTitle: "Title",
    titles: { hy: "Բիզնես կենտրոն Երևանում", ru: "Бизнес-центр в Ереване", en: "Business centre in Yerevan" },
    photos: "Photos",
    publish: "Publish",
    published: "Published in 3 languages",
    newCard: "New project",
    sendTitle: "Request a consultation",
    name: "Name",
    phone: "Phone",
    send: "Send",
    sent: "Request sent",
    sentText: "Thank you! We'll get back to you.",
  },
  hy: {
    oldTitle: "Հին կայքը",
    loading: "Բեռնվում է…",
    welcome: "Բարի գալուստ մեր կայք",
    oldText: "Մենք տարիների փորձ ունեցող առաջատար ընկերություն ենք։",
    newSite: "Ինժեներական խումբ",
    newSub: "Նոր կայքը",
    headline: "Կառույցներ, որոնք ծառայում են տասնամյակներ։",
    sub: "Բարդ շենքերի նախագծում, ինժեներիա և կառուցում։",
    projects: "Մեր նախագծերը",
    contact: "Կապ մեզ հետ",
    cms: "Կայքի խմբագիր",
    newProject: "Նոր նախագիծ",
    fTitle: "Անվանում",
    titles: { hy: "Բիզնես կենտրոն Երևանում", ru: "Бизнес-центр в Ереване", en: "Business centre in Yerevan" },
    photos: "Լուսանկարներ",
    publish: "Հրապարակել",
    published: "Հրապարակված է 3 լեզվով",
    newCard: "Նոր նախագիծ",
    sendTitle: "Խորհրդատվության հայտ",
    name: "Անուն",
    phone: "Հեռախոս",
    send: "Ուղարկել",
    sent: "Հայտն ուղարկված է",
    sentText: "Շնորհակալություն։ Մենք կկապվենք ձեզ հետ։",
  },
  ru: {
    oldTitle: "Старый сайт",
    loading: "Загрузка…",
    welcome: "Добро пожаловать на наш сайт",
    oldText: "Мы — ведущая компания с многолетним опытом.",
    newSite: "Инженерная группа",
    newSub: "Новый сайт",
    headline: "Здания, которые служат десятилетиями.",
    sub: "Проектирование, инженерия и строительство сложных объектов.",
    projects: "Наши проекты",
    contact: "Связаться",
    cms: "Редактор сайта",
    newProject: "Новый проект",
    fTitle: "Название",
    titles: { hy: "Բիզնես կենտրոն Երևանում", ru: "Бизнес-центр в Ереване", en: "Business centre in Yerevan" },
    photos: "Фотографии",
    publish: "Опубликовать",
    published: "Опубликовано на 3 языках",
    newCard: "Новый проект",
    sendTitle: "Заявка на консультацию",
    name: "Имя",
    phone: "Телефон",
    send: "Отправить",
    sent: "Заявка отправлена",
    sentText: "Спасибо! Мы свяжемся с вами.",
  },
} satisfies Record<Locale, Record<string, unknown>>;

const LANGS = ["hy", "ru", "en"] as const;

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];
  if (step === 0) {
    return (
      <PhoneFrame time="09:12" title={t.oldTitle} subtitle="www">
        <div className="flex flex-1 flex-col gap-3 overflow-hidden bg-[#f2f2f2] px-3.5 py-3">
          <div className="flex items-center gap-2 text-[0.75rem] text-[#8a8984]">
            <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-[#c9c9c9] border-t-[#8a8984]" />
            {t.loading}
          </div>
          <div className="h-28 rounded-md bg-[#dcdcdc]" />
          <p className="text-center text-[0.9375rem] font-semibold text-[#6b6a66]">{t.welcome}</p>
          <p className="text-center text-[0.75rem] text-[#8a8984]">{t.oldText}</p>
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-[#dcdcdc]" />
            <div className="h-2 w-5/6 rounded bg-[#dcdcdc]" />
            <div className="h-2 w-2/3 rounded bg-[#dcdcdc]" />
          </div>
        </div>
      </PhoneFrame>
    );
  }
  return (
    <PhoneFrame time="09:12" title={t.newSite} subtitle={t.newSub}>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        {step <= 2 && (
          <Enter key="home" className="flex flex-col gap-3">
            <div className="flex justify-end gap-1 text-[0.625rem] font-semibold">
              {LANGS.map((l) => (
                <span key={l} className={cn("rounded px-1.5 py-0.5", l === locale ? "bg-[#141414] text-white" : "text-[#8a8984]")}>
                  {l.toUpperCase()}
                </span>
              ))}
            </div>
            <p className="text-[1.375rem] leading-[1.1] font-semibold">{t.headline}</p>
            <p className="text-[0.8125rem] text-[#55544f]">{t.sub}</p>
            <div className="relative h-28 overflow-hidden rounded-md bg-[#141414]">
              <div className="absolute inset-3 border border-white/30 [background-image:linear-gradient(rgb(255_255_255/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.15)_1px,transparent_1px)] [background-size:16px_16px]" />
              <span className="absolute bottom-5 left-1/2 h-3 w-8 -translate-x-1/2 bg-signal" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-center text-[0.75rem] font-semibold">
              <span className="rounded-md bg-[#141414] py-2 text-white">{t.projects}</span>
              <span className="rounded-md border border-black/15 py-2">{t.contact}</span>
            </div>
          </Enter>
        )}
        {step === 3 && (
          <Enter key="contact" className="flex flex-col gap-2.5">
            <div className="rounded-md border-2 border-signal p-2.5">
              <p className="text-[0.625rem] font-semibold text-[#8a3a12]">{t.newCard}</p>
              <p className="text-[0.8125rem] font-semibold">{t.titles[locale]}</p>
            </div>
            <p className="mt-1 text-[0.9375rem] font-semibold">{t.sendTitle}</p>
            <div className="rounded-md border border-black/15 px-3 py-2 text-[0.8125rem] text-[#55544f]">{t.name}</div>
            <div className="rounded-md border border-black/15 px-3 py-2 text-[0.8125rem] text-[#55544f]">{t.phone}</div>
            <Enter delay={1200} className="flex items-center justify-center gap-2 rounded-md bg-[#e3efe4] px-3 py-2.5 text-[0.8125rem] font-semibold text-[#1e5a2b]">
              ✓ {t.sent}
            </Enter>
            <Enter delay={1500}>
              <p className="text-center text-[0.75rem] text-[#55544f]">{t.sentText}</p>
            </Enter>
          </Enter>
        )}
      </div>
    </PhoneFrame>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  return (
    <AppFrame title={t.cms}>
      <div className="@container flex h-full flex-col gap-3 overflow-hidden p-3">
        <div className="flex items-center justify-between">
          <p className="text-[0.9375rem] font-semibold">{t.newProject}</p>
          {step >= 2 && <Chip tone={step === 2 ? "accent" : "ok"}>{step === 2 ? t.publish : t.published}</Chip>}
        </div>
        <div className="rounded-md border border-black/10 bg-white p-3">
          <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.fTitle}</p>
          <div className="mt-2 flex flex-col gap-2">
            {LANGS.map((l, i) => (
              <div key={l} className="flex items-center gap-2.5">
                <span className="w-7 shrink-0 text-[0.6875rem] font-semibold text-[#8a8984]">{l.toUpperCase()}</span>
                <div className="min-w-0 flex-1 rounded-md border border-black/12 px-2.5 py-1.5 text-[0.8125rem]">
                  {step >= 2 ? (
                    <Enter delay={i * 450}>
                      <span className="block truncate">{t.titles[l]}</span>
                    </Enter>
                  ) : (
                    <span className="block h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-black/10 bg-white p-3">
          <p className="text-[0.75rem] font-semibold text-[#55544f]">{t.photos}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[5px] bg-black/[0.06]">
                {step >= 2 && (
                  <Enter delay={1400 + i * 200} className="absolute inset-0 bg-[#2a2a2a]">
                    <span className="absolute inset-x-[18%] bottom-0 h-[62%] border-x-2 border-t-2 border-white/40" />
                  </Enter>
                )}
              </div>
            ))}
          </div>
        </div>
        {step >= 2 && (
          <Enter
            delay={2200}
            className={cn(
              "mt-auto rounded-md px-3 py-2.5 text-center text-[0.8125rem] font-semibold",
              step === 2 ? "bg-signal text-black" : "bg-[#e3efe4] text-[#1e5a2b]",
            )}
          >
            {step === 2 ? t.publish : `✓ ${t.published}`}
          </Enter>
        )}
      </div>
    </AppFrame>
  );
}

export const webDemo: DemoDefinition = {
  focus: ["a", "a", "b", "a"],
  posterStep: 1,
  sides: {
    en: { a: "Visitor's phone", b: "Your team's editor" },
    hy: { a: "Այցելուի հեռախոսը", b: "Ձեր թիմի խմբագիրը" },
    ru: { a: "Телефон посетителя", b: "Редактор для команды" },
  },
  steps: {
    en: [
      {
        title: "Before: slow and generic",
        text: "The old website loaded slowly and looked like a template. Visitors couldn't tell what the company does.",
      },
      { title: "After: clear in seconds", text: "The new site opens fast on any phone and explains the company in one sentence." },
      {
        title: "Your team adds projects",
        text: "New projects go in through a simple editor, in Armenian, Russian and English, without developers.",
      },
      { title: "Visitors get in touch", text: "Every page leads to a short contact form, so interested clients reach you." },
    ],
    hy: [
      {
        title: "Առաջ՝ դանդաղ և անդեմ",
        text: "Հին կայքը դանդաղ էր բեռնվում և նման էր պատրաստի ձևանմուշի։ Այցելուները չէին հասկանում, թե ինչով է զբաղվում ընկերությունը։",
      },
      {
        title: "Հիմա՝ պարզ մի քանի վայրկյանում",
        text: "Նոր կայքն արագ է բացվում ցանկացած հեռախոսում և մեկ նախադասությամբ բացատրում է ընկերության գործը։",
      },
      {
        title: "Ձեր թիմն ավելացնում է նախագծեր",
        text: "Նոր նախագծերն ավելացվում են պարզ խմբագրիչով՝ հայերեն, ռուսերեն և անգլերեն, առանց ծրագրավորողների։",
      },
      {
        title: "Այցելուները կապվում են ձեզ հետ",
        text: "Յուրաքանչյուր էջ տանում է դեպի կարճ հայտի ձև, որպեսզի հետաքրքրված հաճախորդները հասնեն ձեզ։",
      },
    ],
    ru: [
      {
        title: "Раньше: медленно и безлико",
        text: "Старый сайт долго загружался и выглядел как шаблон. Посетители не понимали, чем занимается компания.",
      },
      {
        title: "Теперь: понятно за секунды",
        text: "Новый сайт быстро открывается на любом телефоне и одной фразой объясняет, чем занимается компания.",
      },
      {
        title: "Команда добавляет проекты",
        text: "Новые проекты добавляются в простом редакторе — на армянском, русском и английском, без программистов.",
      },
      {
        title: "Посетители оставляют заявку",
        text: "Каждая страница ведёт к короткой форме заявки, чтобы заинтересованные клиенты связались с вами.",
      },
    ],
  },
  A: Customer,
  B: Team,
};
