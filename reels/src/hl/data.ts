/* Instagram Highlights content. Copy follows docs/marketing/social-setup.md. */

export type Bubble = { from: "them" | "us"; text: string };
export type Visual =
  | { kind: "logo" }
  | { kind: "chat"; time?: string; bubbles: Bubble[]; note?: string }
  | { kind: "duo" }
  | { kind: "checks"; items: string[] }
  | { kind: "orders" }
  | { kind: "leads" }
  | { kind: "stars" }
  | { kind: "site" }
  | { kind: "prices"; cards: { name: string; setup: string; monthly?: string; tag?: string }[] }
  | { kind: "call" }
  | { kind: "connect" }
  | { kind: "calendar" }
  | { kind: "typing" }
  | { kind: "contact" };

export type Story = {
  id: string;
  title: string;
  body?: string;
  ru: string;
  visual: Visual;
  price?: string;
  cta?: boolean;
  bg?: "night" | "salon";
  frames?: number;
};

export type Highlight = { id: string; label: string; icon: IconName; stories: Story[] };
export type IconName = "logo" | "grid" | "dram" | "steps" | "faq" | "play";

export const HIGHLIGHTS: Highlight[] = [
  {
    id: "about",
    label: "Մեր մասին",
    icon: "logo",
    stories: [
      { id: "about-1", title: "AI գործիքներ Հայաստանի բիզնեսների համար", ru: "AI-инструменты для бизнеса в Армении", visual: { kind: "logo" }, bg: "night" },
      {
        id: "about-2",
        title: "Ձեր հաճախորդները գրում են ամեն ժամի",
        body: "Մենք անում ենք այնպես, որ ոչ մեկը չմնա առանց պատասխանի։",
        ru: "Ни один клиент без ответа",
        visual: {
          kind: "chat",
          time: "23:40",
          bubbles: [
            { from: "them", text: "Բարև, վաղը ազատ ժամ ունե՞ք" },
            { from: "us", text: "Բարև։ Այո՝ 11:00 կամ 15:30։ Ո՞րն է հարմար" },
          ],
          note: "Պատասխան 3 վայրկյանում",
        },
      },
      { id: "about-3", title: "Փոքր ընտանեկան թիմ Երևանից", body: "Մեկը կառուցում է համակարգերը, մյուսը՝ ձեր մարքեթինգը։", ru: "Семейная команда из Еревана", visual: { kind: "duo" }, bg: "night" },
      {
        id: "about-4",
        title: "Ինչու Riseup",
        ru: "Официально, по договору",
        visual: { kind: "checks", items: ["Պաշտոնապես՝ պայմանագրով և հաշիվ-ապրանքագրով", "Հայերեն, ռուսերեն, անգլերեն", "Մատչելի գներ տեղական բիզնեսի համար"] },
        cta: true,
      },
    ],
  },
  {
    id: "services",
    label: "Ծառայություններ",
    icon: "grid",
    stories: [
      {
        id: "services-1",
        title: "AI ադմինիստրատոր",
        body: "Պատասխանում է 24/7, գրանցում է, հիշեցնում այցի մասին։",
        ru: "AI-администратор 24/7",
        bg: "salon",
        price: "45 000 ֏-ից",
        cta: true,
        visual: {
          kind: "chat",
          bubbles: [
            { from: "them", text: "Մատնահարդարում ունե՞ք վաղը" },
            { from: "us", text: "Այո՝ 12:00, 14:30 կամ 17:00" },
            { from: "them", text: "14:30" },
            { from: "us", text: "Գրանցված եք վաղը 14:30-ին։ Կհիշեցնենք առավոտյան" },
          ],
        },
      },
      { id: "services-2", title: "Պատվերներ", body: "Instagram խանութի պատվերները՝ մեկ վահանակում։", ru: "Заказы из Instagram в одной панели", price: "70 000 ֏-ից", cta: true, visual: { kind: "orders" } },
      { id: "services-3", title: "Անշարժ գույք", body: "Բոլոր հայտերը մեկ տեղում, ոչ մի կորած գնորդ։", ru: "Все заявки в одном месте", price: "140 000 ֏-ից", cta: true, visual: { kind: "leads" } },
      { id: "services-4", title: "Մարքեթինգ", body: "Google Maps, կարծիքներ, Instagram կոնտենտ։", ru: "Google Maps, отзывы, Instagram", price: "20 000 ֏/ամիս-ից", cta: true, visual: { kind: "stars" } },
      { id: "services-5", title: "Կայքեր", body: "Արագ կայք 3 լեզվով։", ru: "Сайты на 3 языках", price: "80 000 ֏-ից", cta: true, visual: { kind: "site" } },
    ],
  },
  {
    id: "prices",
    label: "Գներ",
    icon: "dram",
    stories: [
      {
        id: "prices-1",
        title: "AI ադմինիստրատոր",
        ru: "AI-администратор",
        visual: {
          kind: "prices",
          cards: [
            { name: "Start · մեկ ալիք", setup: "45 000 ֏", monthly: "15 000 ֏ / ամիս" },
            { name: "Pro · բոլոր ալիքները + գրանցում", setup: "90 000 ֏", monthly: "25 000 ֏ / ամիս", tag: "Ամենաշատ ընտրվողը" },
          ],
        },
      },
      {
        id: "prices-2",
        title: "Պատվերներ և անշարժ գույք",
        ru: "Заказы и недвижимость",
        visual: {
          kind: "prices",
          cards: [
            { name: "Պատվերներ", setup: "70 000 ֏-ից", monthly: "20 000 ֏ / ամիս" },
            { name: "Անշարժ գույք", setup: "140 000 ֏-ից", monthly: "25 000 ֏ / ամիս" },
          ],
        },
      },
      {
        id: "prices-3",
        title: "Մարքեթինգ",
        body: "Առանց կարգավորման վճարի",
        ru: "Маркетинг без платы за настройку",
        visual: {
          kind: "prices",
          cards: [
            { name: "Google և կարծիքներ", setup: "20 000 ֏ / ամիս" },
            { name: "Google + Instagram", setup: "45 000 ֏ / ամիս" },
          ],
        },
      },
      {
        id: "prices-4",
        title: "Կայքեր",
        ru: "Сайты",
        visual: {
          kind: "prices",
          cards: [
            { name: "Մեկ էջանոց կայք", setup: "80 000 ֏-ից", monthly: "8 000 ֏ / ամիս" },
            { name: "Ընկերության կայք", setup: "150 000 ֏-ից", monthly: "12 000 ֏ / ամիս" },
          ],
        },
      },
      {
        id: "prices-5",
        title: "Ինչպես ենք վճարում",
        ru: "50% в начале, 50% при запуске",
        cta: true,
        visual: { kind: "checks", items: ["50% սկզբում, 50% մեկնարկին", "Ամսավճարը՝ միայն մեկնարկից հետո", "Պայմանագիր և հաշիվ-ապրանքագիր", "Առանց թաքնված վճարների"] },
      },
    ],
  },
  {
    id: "how",
    label: "Ինչպես",
    icon: "steps",
    stories: [
      { id: "how-1", title: "1. Անվճար զանգ", body: "20 րոպե։ Պատմում եք, թե ինչպես եք ստանում հաճախորդներ և ինչն է խլում ձեր ժամանակը։", ru: "Бесплатный звонок, 20 минут", visual: { kind: "call" } },
      {
        id: "how-2",
        title: "2. Դեմո ձեր բիզնեսի համար",
        body: "Ցույց ենք տալիս, թե ինչպես AI-ն կպատասխանի հենց ձեր գներով։",
        ru: "Демо для вашего бизнеса",
        visual: {
          kind: "chat",
          bubbles: [
            { from: "them", text: "Ինչ արժե մազերի ներկումը" },
            { from: "us", text: "Ձեր սրահում՝ 18 000 ֏-ից։ Գրանցե՞մ ձեզ" },
          ],
          note: "Ձեր գներով և ծառայություններով",
        },
      },
      { id: "how-3", title: "3. Կարգավորում և ուսուցում", body: "Միացնում ենք Instagram-ը, WhatsApp-ը կամ կայքը։ Ուսուցումը տևում է 1 ժամից պակաս։", ru: "Настройка и обучение", visual: { kind: "connect" } },
      { id: "how-4", title: "4. Ամսական սպասարկում", body: "Թարմացնում ենք գները, հետևում պատասխաններին, ավելացնում նորը։", ru: "Ежемесячная поддержка", visual: { kind: "calendar" }, cta: true },
    ],
  },
  {
    id: "faq",
    label: "Հարցեր",
    icon: "faq",
    stories: [
      ["AI-ն հայերեն գիտի՞", "Այո։ Պատասխանում է հայերեն, ռուսերեն և անգլերեն՝ այն լեզվով, որով գրում է հաճախորդը։", "AI знает армянский?"],
      ["Իսկ եթե AI-ն չիմանա պատասխանը", "Այն չի հորինում։ Հարցը մեկ րոպեում փոխանցում է ձեզ Telegram-ով, և դուք պատասխանում եք ինքներդ։", "А если AI не знает ответа?"],
      ["Պե՞տք է կայք ունենալ", "Ոչ։ AI ադմինիստրատորն աշխատում է ձեր Instagram-ում, WhatsApp-ում կամ Telegram-ում։", "Нужен ли сайт?"],
      ["Որքա՞ն ժամանակ է պետք մեկնարկի համար", "Սովորաբար 5–10 աշխատանքային օր՝ կախված փաթեթից։", "Сколько длится запуск?"],
      ["Ինչո՞ւ կա ամսավճար", "Ներառում է հոսթինգը, AI-ի օգտագործումը, սպասարկումը և փոքր փոփոխությունները։ Առանց թաքնված վճարների։", "Зачем ежемесячная оплата?"],
      ["Կարո՞ղ եմ դադարեցնել", "Այո՝ ամսավճարը կարող եք դադարեցնել ցանկացած ամիս՝ 30 օր առաջ տեղեկացնելով։", "Можно ли отменить?"],
      ["Ինչպե՞ս սկսել", "Գրեք «ԴԵՄՈ» Direct-ում կամ WhatsApp-ում՝ +374 77 200 433։ Անվճար ցույց կտանք ձեր բիզնեսի օրինակով։", "Как начать?"],
    ].map(([q, a, ru], i) => ({
      id: `faq-${i + 1}`,
      title: `Հարց ${i + 1}`,
      ru,
      visual: { kind: "chat" as const, bubbles: [{ from: "them" as const, text: q }, { from: "us" as const, text: a }] },
      cta: i === 6,
    })),
  },
  {
    id: "demo",
    label: "Դեմո",
    icon: "play",
    stories: [
      { id: "demo-1", title: "Գրեք «ԴԵՄՈ»", body: "24 ժամում կպատրաստենք օրինակ ձեր բիզնեսի համար։ Անվճար։", ru: "Напишите «ДЕМО» — пример за 24 часа", visual: { kind: "typing" }, bg: "salon" },
      { id: "demo-2", title: "Կապ", ru: "Связаться с нами", visual: { kind: "contact" } },
    ],
  },
];
