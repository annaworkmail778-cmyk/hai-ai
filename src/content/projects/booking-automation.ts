import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 */
export const bookingAutomation: Project = {
  id: "p-booking-automation",
  slug: "booking-automation",
  status: "concept",
  featured: true,
  order: 3,
  year: 2025,
  capabilities: ["automation", "sales-systems", "internal-tools"],
  technologies: ["Next.js", "Node.js", "PostgreSQL", "n8n", "Google Calendar API", "Telegram Bot API", "Stripe"],
  theme: "dark",
  coverImage: {
    kind: "composition",
    id: "booking-calendar",
    alt: {
      en: "Week calendar of appointments with automatic confirmations, reminders and waitlist notifications beside it.",
      hy: "Այցերի շաբաթական օրացույց՝ կողքին ավտոմատ հաստատումներով, հիշեցումներով և սպասման ցուցակի ծանուցումներով։",
      ru: "Недельный календарь приёмов с автоматическими подтверждениями, напоминаниями и уведомлениями листа ожидания.",
    },
  },
  gallery: [
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "booking-mobile",
        alt: {
          en: "Three phone screens of the booking flow: choose a service, pick a time, confirmation with reminders.",
          hy: "Ամրագրման հոսքի հեռախոսի երեք էկրան՝ ծառայության ընտրություն, ժամի ընտրություն և հաստատում՝ հիշեցումներով։",
          ru: "Три экрана записи на телефоне: выбор услуги, выбор времени и подтверждение с напоминаниями.",
        },
      },
      caption: {
        en: "Booking takes less than a minute — and needs no phone call.",
        hy: "Ամրագրումը տևում է մեկ րոպեից պակաս և զանգ չի պահանջում։",
        ru: "Запись занимает меньше минуты — и не требует звонка.",
      },
    },
    {
      layout: "split-left",
      visual: {
        kind: "composition",
        id: "booking-flow",
        alt: {
          en: "System flow from booking channels through an availability engine to confirmations, reminders and staff calendars.",
          hy: "Համակարգի հոսք՝ ամրագրման ալիքներից հասանելիության շարժիչով դեպի հաստատումներ, հիշեցումներ և աշխատակիցների օրացույցներ։",
          ru: "Схема системы: от каналов записи через движок доступности к подтверждениям, напоминаниям и календарям сотрудников.",
        },
      },
      caption: {
        en: "Availability is calculated from real calendars and service rules, not guessed.",
        hy: "Հասանելիությունը հաշվարկվում է իրական օրացույցներից և ծառայությունների կանոններից, ոչ թե ենթադրվում։",
        ru: "Доступность рассчитывается по реальным календарям и правилам услуг, а не на глаз.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "page", group: "input", label: { en: "Booking page", hy: "Ամրագրման էջ", ru: "Страница записи" } },
      { id: "messengers", group: "input", label: { en: "Messengers", hy: "Մեսենջերներ", ru: "Мессенджеры" } },
      { id: "staff", group: "input", label: { en: "Staff calendars", hy: "Աշխատակիցների օրացույցներ", ru: "Календари сотрудников" } },
      { id: "engine", group: "core", label: { en: "Availability engine", hy: "Հասանելիության շարժիչ", ru: "Движок доступности" } },
      { id: "rules", group: "core", label: { en: "Service rules", hy: "Ծառայությունների կանոններ", ru: "Правила услуг" } },
      { id: "reminders", group: "core", label: { en: "Reminder automation", hy: "Հիշեցումների ավտոմատացում", ru: "Автонапоминания" } },
      { id: "confirmed", group: "output", label: { en: "Confirmed visits", hy: "Հաստատված այցեր", ru: "Подтверждённые визиты" } },
      { id: "waitlist", group: "output", label: { en: "Waitlist recovery", hy: "Սպասման ցուցակ", ru: "Лист ожидания" } },
      { id: "schedule", group: "output", label: { en: "Daily schedules", hy: "Օրվա ժամանակացույցեր", ru: "Расписание дня" } },
    ],
    edges: [
      ["page", "engine"],
      ["messengers", "engine"],
      ["staff", "rules"],
      ["engine", "rules"],
      ["rules", "reminders"],
      ["engine", "confirmed"],
      ["reminders", "waitlist"],
      ["rules", "schedule"],
    ],
  },
  content: {
    en: {
      title: "Appointment & Booking Automation",
      subtitle: "Online booking, reminders and rescheduling that run without the front desk.",
      client: "Concept study — multi-location clinic",
      industry: "Healthcare & wellness",
      projectType: "Automation · Booking system",
      shortDescription:
        "A booking system connected to staff calendars, reminders and payments that removes manual scheduling from the front desk.",
      challenge: "Appointments were arranged by phone and chat, one message at a time.",
      solution: "Self-service booking with rules, reminders, waitlists and calendar sync.",
      context:
        "Clinics and studios with several specialists and locations handle dozens of appointments a day across phone, messengers and walk-ins.",
      challengeDetail: [
        "Administrators spent most of the day in scheduling conversations, while no-shows left gaps in the calendar.",
        "Each location kept its own calendar, so double bookings and idle hours were common.",
      ],
      research: [
        "Most calls were simple booking or rescheduling requests.",
        "Many no-shows happened simply because clients forgot.",
        "Cancelled slots were rarely refilled in time.",
        "Staff calendars and the booking log were updated in different places.",
      ],
      solutionDetail: [
        "We designed a booking flow clients can complete in under a minute on their phone, with availability calculated from real staff calendars and service rules.",
        "Confirmations, reminders and rescheduling links are sent automatically, and cancelled slots are offered to the waitlist.",
      ],
      systemsBuilt: [
        "Online booking with service and staff rules",
        "Two-way calendar synchronisation",
        "Automated confirmations and reminders",
        "Waitlist and slot recovery",
        "Daily schedules for each location",
      ],
      features: [
        { title: "Real availability", text: "Slots calculated from staff calendars and service rules." },
        { title: "Automatic reminders", text: "Clients are reminded before every appointment." },
        { title: "Self-service changes", text: "Rescheduling without a phone call." },
        { title: "Waitlist recovery", text: "Freed slots are offered to waiting clients." },
      ],
      services: ["Workflow design", "Automation", "Booking interface", "Calendar and payment integrations"],
      results: [
        "Fewer scheduling calls and messages",
        "Fewer no-shows thanks to reminders",
        "Cancelled slots refilled automatically",
        "One calendar view across locations",
      ],
    },
    hy: {
      title: "Այցերի և ամրագրումների ավտոմատացում",
      subtitle: "Առցանց ամրագրում, հիշեցումներ և վերապլանավորում, որոնք աշխատում են առանց ընդունարանի։",
      client: "Կոնցեպտ ուսումնասիրություն՝ մի քանի մասնաճյուղով կլինիկա",
      industry: "Առողջապահություն և բարեկեցություն",
      projectType: "Ավտոմատացում · Ամրագրման համակարգ",
      shortDescription:
        "Ամրագրման համակարգ՝ կապակցված աշխատակիցների օրացույցների, հիշեցումների և վճարումների հետ, որն ընդունարանն ազատում է ձեռքով պլանավորումից։",
      challenge: "Այցերը պայմանավորվում էին զանգերով և չաթերով՝ նամակ առ նամակ։",
      solution: "Ինքնասպասարկման ամրագրում՝ կանոններով, հիշեցումներով, սպասման ցուցակով և օրացույցների համաժամեցմամբ։",
      context:
        "Մի քանի մասնագետ և մասնաճյուղ ունեցող կլինիկաներն ու ստուդիաներն օրական տասնյակ այցեր են կազմակերպում զանգերով, մեսենջերներով և անմիջական այցերով։",
      challengeDetail: [
        "Ադմինիստրատորներն օրվա մեծ մասն անցկացնում էին պլանավորման զրույցներում, իսկ չներկայացումները բացեր էին թողնում օրացույցում։",
        "Յուրաքանչյուր մասնաճյուղ ուներ իր օրացույցը, ուստի կրկնակի ամրագրումներն ու պարապ ժամերը սովորական էին։",
      ],
      research: [
        "Զանգերի մեծ մասը պարզ ամրագրման կամ վերապլանավորման խնդրանքներ էին։",
        "Շատ չներկայացումներ տեղի էին ունենում պարզապես այն պատճառով, որ հաճախորդները մոռանում էին։",
        "Չեղարկված ժամերը հազվադեպ էին ժամանակին լրացվում։",
        "Աշխատակիցների օրացույցներն ու ամրագրումների մատյանը թարմացվում էին տարբեր տեղերում։",
      ],
      solutionDetail: [
        "Նախագծեցինք ամրագրման հոսք, որը հաճախորդը կարող է ավարտել հեռախոսով մեկ րոպեից պակաս ժամանակում, իսկ հասանելիությունը հաշվարկվում է աշխատակիցների իրական օրացույցներից և ծառայությունների կանոններից։",
        "Հաստատումները, հիշեցումները և վերապլանավորման հղումներն ուղարկվում են ավտոմատ, իսկ չեղարկված ժամերն առաջարկվում են սպասման ցուցակին։",
      ],
      systemsBuilt: [
        "Առցանց ամրագրում՝ ծառայությունների և աշխատակիցների կանոններով",
        "Օրացույցների երկկողմանի համաժամեցում",
        "Ավտոմատ հաստատումներ և հիշեցումներ",
        "Սպասման ցուցակ և ժամերի վերականգնում",
        "Յուրաքանչյուր մասնաճյուղի օրվա ժամանակացույց",
      ],
      features: [
        { title: "Իրական հասանելիություն", text: "Ժամերը հաշվարկվում են աշխատակիցների օրացույցներից և ծառայությունների կանոններից։" },
        { title: "Ավտոմատ հիշեցումներ", text: "Հաճախորդները հիշեցում են ստանում յուրաքանչյուր այցից առաջ։" },
        { title: "Ինքնուրույն փոփոխություններ", text: "Վերապլանավորում՝ առանց զանգի։" },
        { title: "Սպասման ցուցակ", text: "Ազատված ժամերն առաջարկվում են սպասող հաճախորդներին։" },
      ],
      services: ["Աշխատանքային հոսքերի նախագծում", "Ավտոմատացում", "Ամրագրման ինտերֆեյս", "Օրացույցների և վճարումների ինտեգրացիաներ"],
      results: [
        "Ավելի քիչ պլանավորման զանգեր և նամակներ",
        "Ավելի քիչ չներկայացումներ՝ շնորհիվ հիշեցումների",
        "Չեղարկված ժամերը լրացվում են ավտոմատ",
        "Մեկ օրացույց բոլոր մասնաճյուղերի համար",
      ],
    },
    ru: {
      title: "Автоматизация записи и бронирования",
      subtitle: "Онлайн-запись, напоминания и переносы, которые работают без администратора.",
      client: "Концепт — клиника с несколькими филиалами",
      industry: "Медицина и wellness",
      projectType: "Автоматизация · Система записи",
      shortDescription:
        "Система записи, связанная с календарями сотрудников, напоминаниями и оплатой, которая избавляет администраторов от ручного планирования.",
      challenge: "Запись велась по телефону и в чатах — сообщение за сообщением.",
      solution: "Самостоятельная запись с правилами, напоминаниями, листом ожидания и синхронизацией календарей.",
      context:
        "Клиники и студии с несколькими специалистами и филиалами ежедневно ведут десятки записей по телефону, в мессенджерах и при личном визите.",
      challengeDetail: [
        "Администраторы проводили большую часть дня в переписке о записи, а неявки оставляли пустые окна в расписании.",
        "У каждого филиала был свой календарь, поэтому двойные записи и простои были обычным делом.",
      ],
      research: [
        "Большинство звонков были простыми просьбами записать или перенести визит.",
        "Многие неявки происходили просто потому, что клиенты забывали.",
        "Отменённые окна редко успевали заполнить.",
        "Календари сотрудников и журнал записи обновлялись в разных местах.",
      ],
      solutionDetail: [
        "Мы спроектировали запись, которую клиент проходит с телефона меньше чем за минуту, а доступность рассчитывается по реальным календарям сотрудников и правилам услуг.",
        "Подтверждения, напоминания и ссылки для переноса отправляются автоматически, а освободившиеся окна предлагаются листу ожидания.",
      ],
      systemsBuilt: [
        "Онлайн-запись с правилами услуг и сотрудников",
        "Двусторонняя синхронизация календарей",
        "Автоматические подтверждения и напоминания",
        "Лист ожидания и восстановление окон",
        "Расписание дня для каждого филиала",
      ],
      features: [
        { title: "Реальная доступность", text: "Окна рассчитываются по календарям сотрудников и правилам услуг." },
        { title: "Автонапоминания", text: "Клиенты получают напоминание перед каждым визитом." },
        { title: "Самостоятельные изменения", text: "Перенос записи без звонка." },
        { title: "Лист ожидания", text: "Освободившиеся окна предлагаются ожидающим клиентам." },
      ],
      services: ["Проектирование процессов", "Автоматизация", "Интерфейс записи", "Интеграции календарей и оплаты"],
      results: [
        "Меньше звонков и сообщений о записи",
        "Меньше неявок благодаря напоминаниям",
        "Отменённые окна заполняются автоматически",
        "Единый календарь для всех филиалов",
      ],
    },
  },
};
