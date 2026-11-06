import type { Project } from "../types";

/**
 * DEMO CONTENT — example project for the "Riseup Admin" product.
 * Not a client engagement; no measured results are claimed.
 */
export const salonAiAdmin: Project = {
  id: "p-salon-ai-admin",
  slug: "salon-ai-admin",
  status: "concept",
  featured: true,
  order: 1,
  year: 2026,
  capabilities: ["ai-admin"],
  technologies: ["Claude / OpenAI", "Instagram & WhatsApp API", "Telegram Bot API", "Next.js", "Supabase", "n8n"],
  theme: "dark",
  demo: "salon",
  coverImage: {
    kind: "composition",
    id: "booking-calendar",
    alt: {
      en: "A salon calendar with online bookings, reminders and a waiting list.",
      hy: "Սրահի օրացույց՝ առցանց գրանցումներով, հիշեցումներով և սպասման ցուցակով։",
      ru: "Календарь салона с онлайн-записями, напоминаниями и листом ожидания.",
    },
  },
  gallery: [],
  system: {
    nodes: [
      { id: "ig", group: "input", label: { en: "Instagram", hy: "Instagram", ru: "Instagram" } },
      { id: "wa", group: "input", label: { en: "WhatsApp & Telegram", hy: "WhatsApp և Telegram", ru: "WhatsApp и Telegram" } },
      { id: "ai", group: "core", label: { en: "AI administrator", hy: "AI ադմինիստրատոր", ru: "AI-администратор" } },
      { id: "cal", group: "core", label: { en: "Booking calendar", hy: "Գրանցումների օրացույց", ru: "Календарь записей" } },
      { id: "remind", group: "core", label: { en: "Reminders", hy: "Հիշեցումներ", ru: "Напоминания" } },
      { id: "owner", group: "output", label: { en: "Alerts to the owner", hy: "Ծանուցումներ սեփականատիրոջը", ru: "Уведомления владельцу" } },
      { id: "reviews", group: "output", label: { en: "Google reviews", hy: "Google կարծիքներ", ru: "Отзывы в Google" } },
      { id: "report", group: "output", label: { en: "Daily report", hy: "Օրվա հաշվետվություն", ru: "Отчёт за день" } },
    ],
    edges: [
      ["ig", "ai"],
      ["wa", "ai"],
      ["ai", "cal"],
      ["cal", "remind"],
      ["ai", "owner"],
      ["remind", "reviews"],
      ["cal", "report"],
    ],
  },
  content: {
    en: {
      title: "AI administrator for a beauty salon",
      subtitle: "Answers every message, books visits and sends reminders — day and night.",
      client: "Example — beauty salon with several masters",
      industry: "Beauty & wellness",
      projectType: "AI replies · Online booking",
      shortDescription:
        "An AI administrator that answers Instagram, WhatsApp and Telegram, books visits into the calendar, reminds clients and asks for reviews.",
      challenge: "Messages at night and on weekends stay unanswered, and clients go to another salon.",
      solution: "An AI administrator that answers in seconds and books the visit right in the chat.",
      context:
        "Salons in Yerevan get most new clients through Instagram. The administrator answers the same questions all day: prices, free times, address.",
      challengeDetail: [
        "Many messages arrive in the evening and at night, when nobody is at work. By morning the client has already booked somewhere else.",
        "Some clients forget their visit, so the master's time is lost and the day has gaps.",
      ],
      research: [
        "Most messages are about prices, free times and the address.",
        "Clients prefer to book in the chat instead of calling.",
        "Without reminders, clients forget visits booked a few days ahead.",
        "Happy clients rarely leave reviews unless someone asks.",
      ],
      solutionDetail: [
        "The AI administrator learns your price list, masters, working hours and rules. It answers politely in Armenian, Russian or English and books the visit into the calendar.",
        "Clients get a reminder on the day of the visit and a short “thank you” with a review link afterwards. You get a Telegram alert for every booking and a short report every evening.",
      ],
      systemsBuilt: [
        "AI replies in Instagram, WhatsApp and Telegram",
        "Online booking calendar for every master",
        "Reminders with confirm and move buttons",
        "Review requests after the visit",
        "Telegram alerts and a daily report",
      ],
      features: [
        { title: "Answers in seconds", text: "Prices, free times and address — at any hour, in three languages." },
        { title: "Books in the chat", text: "The client taps a time; the visit lands in the master's calendar." },
        { title: "Reminds clients", text: "A reminder on the day of the visit, with confirm and move buttons." },
        { title: "Calls you when needed", text: "Difficult questions go to you or your administrator with the whole chat." },
      ],
      services: ["Setup and training of the AI", "Booking calendar", "Instagram, WhatsApp and Telegram connection", "Monthly support"],
      results: [
        "Every message gets an answer, even at night",
        "Less time spent on the same questions",
        "Fewer forgotten visits",
        "More reviews on Google",
      ],
    },
    hy: {
      title: "AI ադմինիստրատոր գեղեցկության սրահի համար",
      subtitle: "Պատասխանում է բոլոր նամակներին, գրանցում է այցերը և ուղարկում հիշեցումներ՝ ցերեկ թե գիշեր։",
      client: "Օրինակ՝ գեղեցկության սրահ մի քանի վարպետով",
      industry: "Գեղեցկություն և խնամք",
      projectType: "AI պատասխաններ · Առցանց գրանցում",
      shortDescription:
        "AI ադմինիստրատոր, որը պատասխանում է Instagram-ում, WhatsApp-ում և Telegram-ում, գրանցում է այցերը օրացույցում, հիշեցնում է հաճախորդներին և խնդրում կարծիք։",
      challenge: "Գիշերը և հանգստյան օրերին նամակներն անպատասխան են մնում, և հաճախորդը գնում է այլ սրահ։",
      solution: "AI ադմինիստրատոր, որը պատասխանում է վայրկյանների ընթացքում և գրանցում այցը հենց չատում։",
      context:
        "Երևանի սրահները նոր հաճախորդների մեծ մասը ստանում են Instagram-ով։ Ադմինիստրատորը ամբողջ օրը պատասխանում է նույն հարցերին՝ գներ, ազատ ժամեր, հասցե։",
      challengeDetail: [
        "Շատ նամակներ գալիս են երեկոյան և գիշերը, երբ աշխատավայրում ոչ ոք չկա։ Մինչև առավոտ հաճախորդն արդեն գրանցվել է այլ տեղ։",
        "Որոշ հաճախորդներ մոռանում են իրենց այցը, վարպետի ժամանակը կորչում է, և օրում բացեր են առաջանում։",
      ],
      research: [
        "Նամակների մեծ մասը գների, ազատ ժամերի և հասցեի մասին է։",
        "Հաճախորդները նախընտրում են գրանցվել չատում, քան զանգել։",
        "Առանց հիշեցման հաճախորդները մոռանում են մի քանի օր առաջ արված գրանցումը։",
        "Գոհ հաճախորդները հազվադեպ են կարծիք թողնում, եթե նրանց չխնդրեն։",
      ],
      solutionDetail: [
        "AI ադմինիստրատորը սովորում է ձեր գնացուցակը, վարպետներին, աշխատանքային ժամերն ու կանոնները։ Պատասխանում է քաղաքավարի՝ հայերեն, ռուսերեն կամ անգլերեն, և գրանցում այցը օրացույցում։",
        "Հաճախորդը այցի օրը ստանում է հիշեցում, իսկ այցից հետո՝ կարճ «շնորհակալություն» կարծիքի հղումով։ Դուք Telegram-ով ստանում եք ծանուցում յուրաքանչյուր գրանցման մասին և կարճ հաշվետվություն ամեն երեկո։",
      ],
      systemsBuilt: [
        "AI պատասխաններ Instagram-ում, WhatsApp-ում և Telegram-ում",
        "Առցանց գրանցման օրացույց յուրաքանչյուր վարպետի համար",
        "Հիշեցումներ՝ հաստատելու և տեղափոխելու կոճակներով",
        "Կարծիքի խնդրանք այցից հետո",
        "Telegram ծանուցումներ և օրվա հաշվետվություն",
      ],
      features: [
        { title: "Պատասխանում է վայրկյաններում", text: "Գներ, ազատ ժամեր և հասցե՝ ցանկացած ժամի, երեք լեզվով։" },
        { title: "Գրանցում է չատում", text: "Հաճախորդը սեղմում է ժամը, և այցը հայտնվում է վարպետի օրացույցում։" },
        { title: "Հիշեցնում է հաճախորդներին", text: "Հիշեցում այցի օրը՝ հաստատելու և տեղափոխելու կոճակներով։" },
        { title: "Կանչում է ձեզ, երբ պետք է", text: "Բարդ հարցերը փոխանցվում են ձեզ կամ ադմինիստրատորին՝ ամբողջ չատով։" },
      ],
      services: ["AI-ի կարգավորում և ուսուցում", "Գրանցման օրացույց", "Instagram, WhatsApp և Telegram միացում", "Ամսական սպասարկում"],
      results: [
        "Յուրաքանչյուր նամակ ստանում է պատասխան, նույնիսկ գիշերը",
        "Ավելի քիչ ժամանակ նույն հարցերի վրա",
        "Ավելի քիչ մոռացված այցեր",
        "Ավելի շատ կարծիքներ Google-ում",
      ],
    },
    ru: {
      title: "AI-администратор для салона красоты",
      subtitle: "Отвечает на каждое сообщение, записывает клиентов и напоминает о визитах — днём и ночью.",
      client: "Пример — салон красоты с несколькими мастерами",
      industry: "Красота и уход",
      projectType: "AI-ответы · Онлайн-запись",
      shortDescription:
        "AI-администратор, который отвечает в Instagram, WhatsApp и Telegram, записывает в календарь, напоминает клиентам и просит отзывы.",
      challenge: "Сообщения ночью и в выходные остаются без ответа, и клиент уходит в другой салон.",
      solution: "AI-администратор, который отвечает за секунды и записывает клиента прямо в чате.",
      context:
        "Салоны Еревана получают большинство новых клиентов через Instagram. Администратор весь день отвечает на одни и те же вопросы: цены, свободное время, адрес.",
      challengeDetail: [
        "Много сообщений приходит вечером и ночью, когда никого нет на работе. К утру клиент уже записался в другое место.",
        "Часть клиентов забывает о визите — время мастера теряется, в дне появляются окна.",
      ],
      research: [
        "Большинство сообщений — о ценах, свободном времени и адресе.",
        "Клиентам удобнее записаться в чате, чем звонить.",
        "Без напоминаний клиенты забывают о записи, сделанной за несколько дней.",
        "Довольные клиенты редко оставляют отзывы, если их не попросить.",
      ],
      solutionDetail: [
        "AI-администратор изучает ваш прайс, мастеров, часы работы и правила. Он вежливо отвечает на армянском, русском или английском и записывает визит в календарь.",
        "В день визита клиент получает напоминание, а после — короткое «спасибо» со ссылкой на отзыв. Вам приходит уведомление в Telegram о каждой записи и короткий отчёт каждый вечер.",
      ],
      systemsBuilt: [
        "AI-ответы в Instagram, WhatsApp и Telegram",
        "Календарь онлайн-записи для каждого мастера",
        "Напоминания с кнопками «подтвердить» и «перенести»",
        "Просьба об отзыве после визита",
        "Уведомления в Telegram и отчёт за день",
      ],
      features: [
        { title: "Отвечает за секунды", text: "Цены, свободное время и адрес — в любое время, на трёх языках." },
        { title: "Записывает в чате", text: "Клиент выбирает время — визит появляется в календаре мастера." },
        { title: "Напоминает клиентам", text: "Напоминание в день визита с кнопками «подтвердить» и «перенести»." },
        { title: "Зовёт вас, когда нужно", text: "Сложные вопросы передаются вам или администратору вместе со всем чатом." },
      ],
      services: ["Настройка и обучение AI", "Календарь записи", "Подключение Instagram, WhatsApp и Telegram", "Ежемесячная поддержка"],
      results: [
        "Каждое сообщение получает ответ, даже ночью",
        "Меньше времени на одни и те же вопросы",
        "Меньше забытых визитов",
        "Больше отзывов в Google",
      ],
    },
  },
};
