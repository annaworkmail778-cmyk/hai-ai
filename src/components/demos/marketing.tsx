import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Bars, ChannelIcon, Chip, Drafting, Enter, PhoneFrame, Sparkle, Stars, Stat } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — "Riseup Marketing": content plan, Google reviews and a monthly report for a café. Names and figures are illustrative. */

const TILES = [
  "bg-[linear-gradient(150deg,#f7c59f,#e07a5f)]",
  "bg-[linear-gradient(150deg,#3d405b,#81b29a)]",
  "bg-[linear-gradient(150deg,#f2cc8f,#e9a15b)]",
  "bg-[linear-gradient(150deg,#81b29a,#2f5d50)]",
  "bg-[linear-gradient(150deg,#e07a5f,#9c2c2c)]",
  "bg-[linear-gradient(150deg,#d8c3a5,#8e8d8a)]",
];

const ui = {
  en: {
    cafe: "Aroma Café",
    handle: "coffee & desserts",
    posts: "posts",
    followers: "followers",
    postTitle: "Autumn menu",
    postSub: "Pumpkin latte · −20% until Sunday",
    likes: "248 likes",
    caption: "Our autumn menu is here 🍂 Pumpkin latte and apple pie, −20% until Sunday. See you at Aroma!",
    thanks: "Thank you for visiting Aroma Café! How was everything?",
    rate: "Tap to rate",
    review: "Great coffee and very kind staff. The apple pie is the best in town!",
    posted: "Posted on Google",
    plan: "Content plan · November",
    planned: "12 posts planned",
    drafting: "AI is writing the next post…",
    draftTitle: "Fri · 18:00 · Autumn menu",
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    approve: "Approve",
    profile: "Google profile",
    rating: "Rating",
    reviews: "reviews",
    newReview: "New review · Ani M.",
    reply: "Suggested reply",
    replyText: "Thank you, Ani! We're glad you liked the pie. See you again soon!",
    replied: "Reply posted",
    report: "Report · November",
    stats: [
      ["Profile views", "3 140", ""],
      ["Calls from Google", "96", ""],
      ["Route requests", "214", ""],
      ["New reviews", "17", "4.8 ★"],
    ],
    title: "Aroma Café · Marketing",
    nav: ["Content", "Reviews", "Google", "Reports"],
  },
  hy: {
    cafe: "Aroma Café",
    handle: "սուրճ և աղանդեր",
    posts: "գրառում",
    followers: "հետևորդ",
    postTitle: "Աշնանային մենյու",
    postSub: "Դդմով լատե · −20% մինչև կիրակի",
    likes: "248 հավանում",
    caption: "Մեր աշնանային մենյուն արդեն այստեղ է 🍂 Դդմով լատե և խնձորով կարկանդակ՝ −20% մինչև կիրակի։ Սպասում ենք ձեզ Aroma-ում։",
    thanks: "Շնորհակալություն Aroma Café այցելելու համար։ Ինչպե՞ս էր ամեն ինչ։",
    rate: "Սեղմեք՝ գնահատելու համար",
    review: "Հիանալի սուրճ և շատ բարի անձնակազմ։ Խնձորով կարկանդակը քաղաքում լավագույնն է։",
    posted: "Հրապարակված է Google-ում",
    plan: "Կոնտենտ պլան · նոյեմբեր",
    planned: "12 գրառում պլանավորված է",
    drafting: "AI-ն գրում է հաջորդ գրառումը…",
    draftTitle: "Ուրբ · 18:00 · Աշնանային մենյու",
    days: ["Եր", "Եք", "Չր", "Հն", "Ու", "Շբ", "Կր"],
    approve: "Հաստատել",
    profile: "Google պրոֆիլ",
    rating: "Գնահատական",
    reviews: "կարծիք",
    newReview: "Նոր կարծիք · Անի Մ.",
    reply: "Առաջարկվող պատասխան",
    replyText: "Շնորհակալություն, Անի։ Ուրախ ենք, որ կարկանդակը դուր եկավ։ Սպասում ենք նորից։",
    replied: "Պատասխանը հրապարակված է",
    report: "Հաշվետվություն · նոյեմբեր",
    stats: [
      ["Պրոֆիլի դիտումներ", "3 140", ""],
      ["Զանգեր Google-ից", "96", ""],
      ["Երթուղու հարցումներ", "214", ""],
      ["Նոր կարծիքներ", "17", "4.8 ★"],
    ],
    title: "Aroma Café · Մարքեթինգ",
    nav: ["Կոնտենտ", "Կարծիքներ", "Google", "Հաշվետվություն"],
  },
  ru: {
    cafe: "Aroma Café",
    handle: "кофе и десерты",
    posts: "публикаций",
    followers: "подписчиков",
    postTitle: "Осеннее меню",
    postSub: "Тыквенный латте · −20% до воскресенья",
    likes: "248 отметок «Нравится»",
    caption: "Осеннее меню уже здесь 🍂 Тыквенный латте и яблочный пирог — −20% до воскресенья. Ждём вас в Aroma!",
    thanks: "Спасибо, что посетили Aroma Café! Как вам всё понравилось?",
    rate: "Нажмите, чтобы оценить",
    review: "Отличный кофе и очень приветливый персонал. Яблочный пирог — лучший в городе!",
    posted: "Опубликовано в Google",
    plan: "Контент-план · ноябрь",
    planned: "Запланировано 12 публикаций",
    drafting: "AI пишет следующую публикацию…",
    draftTitle: "Пт · 18:00 · Осеннее меню",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    approve: "Одобрить",
    profile: "Профиль в Google",
    rating: "Рейтинг",
    reviews: "отзывов",
    newReview: "Новый отзыв · Ани М.",
    reply: "Предложенный ответ",
    replyText: "Спасибо, Ани! Рады, что вам понравился пирог. Ждём вас снова!",
    replied: "Ответ опубликован",
    report: "Отчёт · ноябрь",
    stats: [
      ["Просмотры профиля", "3 140", ""],
      ["Звонки из Google", "96", ""],
      ["Запросы маршрута", "214", ""],
      ["Новые отзывы", "17", "4.8 ★"],
    ],
    title: "Aroma Café · Маркетинг",
    nav: ["Контент", "Отзывы", "Google", "Отчёты"],
  },
} satisfies Record<Locale, Record<string, unknown>>;

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];

  if (step >= 2) {
    return (
      <PhoneFrame time="15:20" title={t.cafe} subtitle="WhatsApp" channel="whatsapp">
        <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
          <Enter className="max-w-[86%] rounded-[1.1rem] rounded-bl-md bg-[#efede7] px-3 py-2 text-[0.8125rem] leading-snug">
            {t.thanks}
            <span className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5">
              <Stars value={step >= 2 ? 5 : 0} className="[&_svg]:size-4" />
              <span className="text-[0.625rem] text-[#6b6a66]">{t.rate}</span>
            </span>
          </Enter>
          <Enter pop delay={1100} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10">
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold">
              <ChannelIcon channel="google" />
              Google · {t.cafe}
            </p>
            <Stars value={5} className="mt-2 [&_svg]:size-4" />
            <p className="mt-1.5 text-[0.8125rem] leading-snug">{t.review}</p>
            <Enter delay={1600} className="mt-2">
              <Chip tone="ok">✓ {t.posted}</Chip>
            </Enter>
          </Enter>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame time="18:00" title={t.cafe} subtitle={t.handle} channel="instagram">
      <div className="flex flex-1 flex-col overflow-hidden">
        {step === 0 ? (
          <div className="px-3 py-3">
            <div className="flex justify-around text-center text-[0.6875rem] leading-tight">
              <p>
                <span className="block text-[0.9375rem] font-semibold">86</span>
                {t.posts}
              </p>
              <p>
                <span className="block text-[0.9375rem] font-semibold">2 410</span>
                {t.followers}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-0.5">
              {TILES.map((tile, i) => (
                <span key={tile} className={cn("aspect-square rounded-[3px]", tile, i === 0 && "ring-2 ring-signal ring-offset-1")} />
              ))}
            </div>
          </div>
        ) : (
          <Enter className="flex flex-1 flex-col">
            <div className="relative mx-0 aspect-square shrink-0 overflow-hidden bg-[linear-gradient(150deg,#f7c59f,#e07a5f_55%,#9c2c2c)] p-4 text-white">
              <span aria-hidden="true" className="absolute -right-6 -bottom-6 size-28 rounded-full bg-white/15" />
              <span aria-hidden="true" className="absolute right-8 bottom-10 size-12 rounded-full bg-[#f2cc8f]" />
              <p className="text-[1.15rem] leading-tight font-semibold">{t.postTitle}</p>
              <p className="mt-1 text-[0.75rem] text-white/85">{t.postSub}</p>
            </div>
            <div className="px-3 py-2">
              <p className="flex items-center gap-3 text-[#141414]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="size-5 text-[#ee2a7b]" fill="currentColor">
                  <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
                </svg>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 18.5 5.3 15A8 8 0 1 1 9 18.7z" />
                </svg>
              </p>
              <p className="mt-1 text-[0.75rem] font-semibold">{t.likes}</p>
              <p className="mt-0.5 line-clamp-3 text-[0.75rem] leading-snug text-[#3a3936]">{t.caption}</p>
            </div>
          </Enter>
        )}
      </div>
    </PhoneFrame>
  );
}

function Team({ step, locale }: ScreenProps) {
  const t = ui[locale];
  const active = step === 0 ? 0 : step === 3 ? 1 : step === 4 ? 3 : 0;

  return (
    <AppFrame title={t.title} nav={t.nav} active={active}>
      <div className="@container h-full overflow-hidden p-3">
        {step <= 1 && (
          <div className="grid h-full gap-3 @lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="rounded-xl bg-white p-3 ring-1 ring-black/[0.06]">
              <p className="text-[0.75rem] font-semibold">{t.plan}</p>
              <p className="text-[0.6875rem] text-[#6b6a66]">{t.planned}</p>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[0.625rem] text-[#8a8984]">
                {t.days.map((d) => (
                  <span key={d}>{d}</span>
                ))}
                {Array.from({ length: 28 }, (_, i) => {
                  const post = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26].includes(i);
                  const today = i === 11;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md tabular-nums",
                        today ? "bg-signal font-semibold text-black" : post ? "bg-[#141414] text-white" : "bg-[#f6f5f1]",
                      )}
                    >
                      {i + 1}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="hidden flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-black/[0.06] @lg:flex">
              <p className="flex items-center gap-1.5 text-[0.75rem] font-semibold">
                <Sparkle />
                {step === 0 ? t.drafting : t.draftTitle}
              </p>
              <span aria-hidden="true" className="aspect-[4/3] rounded-lg bg-[linear-gradient(150deg,#f7c59f,#e07a5f_55%,#9c2c2c)]" />
              {step === 0 ? (
                <Drafting lines={4} />
              ) : (
                <Enter className="flex flex-col gap-2">
                  <p className="text-[0.6875rem] leading-snug text-[#3a3936]">{t.caption}</p>
                  <Chip tone="ok" className="self-start">
                    ✓ {t.approve}
                  </Chip>
                </Enter>
              )}
            </div>
          </div>
        )}

        {(step === 2 || step === 3) && (
          <div className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/[0.06]">
              <ChannelIcon channel="google" className="size-8" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[0.8125rem] font-semibold">{t.cafe}</p>
                <p className="text-[0.6875rem] text-[#6b6a66]">{t.profile}</p>
              </div>
              <div className="text-right leading-tight">
                <Enter key={`r-${step}`} pop>
                  <p className="text-[1.35rem] font-semibold tabular-nums">{step === 3 ? "4.8" : "4.6"}</p>
                </Enter>
                <p className="text-[0.625rem] text-[#6b6a66] tabular-nums">
                  {step === 3 ? 41 : 38} {t.reviews}
                </p>
              </div>
            </div>
            {step === 3 && (
              <Enter className="flex min-h-0 flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-signal/40">
                <p className="flex items-center justify-between gap-2 text-[0.75rem] font-semibold">
                  {t.newReview}
                  <Stars value={5} />
                </p>
                <p className="text-[0.75rem] leading-snug text-[#3a3936]">{t.review}</p>
                <Enter delay={700} className="rounded-lg bg-[#f6f5f1] p-2.5">
                  <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-[#55544f]">
                    <Sparkle />
                    {t.reply}
                  </p>
                  <p className="mt-1 text-[0.75rem] leading-snug">{t.replyText}</p>
                </Enter>
                <Enter delay={1800}>
                  <Chip tone="ok">✓ {t.replied}</Chip>
                </Enter>
              </Enter>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex h-full flex-col gap-3">
            <p className="text-[0.75rem] font-semibold">{t.report}</p>
            <div className="grid grid-cols-2 gap-2 @lg:grid-cols-4">
              {t.stats.map(([label, value, note], i) => (
                <Stat key={label} label={label} value={value} note={note} accent={i === 0} delay={i * 140} />
              ))}
            </div>
            <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-3 ring-1 ring-black/[0.06]">
              <p className="mb-2 text-[0.6875rem] font-semibold text-[#55544f]">{t.stats[0][0]}</p>
              <Bars values={[0.32, 0.4, 0.38, 0.5, 0.46, 0.58, 0.55, 0.64, 0.7, 0.66, 0.78, 0.9]} highlight={11} className="h-auto min-h-16 flex-1" />
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}

export const marketingDemo: DemoDefinition = {
  focus: ["b", "a", "a", "b", "b"],
  posterStep: 4,
  sides: {
    en: { a: "Client's phone", b: "Your marketing panel" },
    hy: { a: "Հաճախորդի հեռախոսը", b: "Ձեր մարքեթինգի վահանակը" },
    ru: { a: "Телефон клиента", b: "Ваша маркетинговая панель" },
  },
  steps: {
    en: [
      { title: "A plan for the whole month", text: "We prepare 12–16 posts a month with AI and our own hands. You only look and approve." },
      { title: "Posts go out on time", text: "Each post is published at the right hour, with a clear offer and a call to visit." },
      { title: "Clients leave reviews", text: "After a visit the client gets a short “thank you” message with a link to rate you on Google." },
      { title: "Every review gets an answer", text: "The rating grows, and each review gets a polite reply. People see a business that cares." },
      { title: "A clear report every month", text: "How many people saw you on Google, called and asked for directions. Simple numbers, no jargon." },
    ],
    hy: [
      { title: "Պլան ամբողջ ամսվա համար", text: "Պատրաստում ենք ամսական 12–16 գրառում՝ AI-ով և մեր ձեռքով։ Դուք միայն նայում և հաստատում եք։" },
      { title: "Գրառումները դուրս են գալիս ժամանակին", text: "Յուրաքանչյուր գրառում հրապարակվում է ճիշտ ժամին՝ հստակ առաջարկով և այցելելու կոչով։" },
      { title: "Հաճախորդները կարծիք են թողնում", text: "Այցից հետո հաճախորդը ստանում է կարճ «շնորհակալություն» նամակ՝ Google-ում գնահատելու հղումով։" },
      { title: "Ամեն կարծիք ստանում է պատասխան", text: "Գնահատականը բարձրանում է, և յուրաքանչյուր կարծիքի տրվում է քաղաքավարի պատասխան։ Մարդիկ տեսնում են հոգատար բիզնես։" },
      { title: "Պարզ հաշվետվություն ամեն ամիս", text: "Քանի մարդ է ձեզ տեսել Google-ում, զանգել և երթուղի խնդրել։ Պարզ թվեր, առանց բարդ բառերի։" },
    ],
    ru: [
      { title: "План на весь месяц", text: "Готовим 12–16 публикаций в месяц — с AI и своими руками. Вам остаётся посмотреть и одобрить." },
      { title: "Публикации выходят вовремя", text: "Каждый пост выходит в нужный час — с понятным предложением и приглашением прийти." },
      { title: "Клиенты оставляют отзывы", text: "После визита клиент получает короткое «спасибо» со ссылкой, чтобы оценить вас в Google." },
      { title: "На каждый отзыв — ответ", text: "Рейтинг растёт, а каждый отзыв получает вежливый ответ. Люди видят, что о них заботятся." },
      { title: "Понятный отчёт каждый месяц", text: "Сколько людей увидели вас в Google, позвонили и построили маршрут. Простые цифры, без жаргона." },
    ],
  },
  A: Customer,
  B: Team,
};
