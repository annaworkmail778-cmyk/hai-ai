import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 */
export const realEstateSalesPlatform: Project = {
  id: "p-real-estate-sales-platform",
  slug: "real-estate-sales-platform",
  status: "concept",
  featured: true,
  order: 2,
  year: 2026,
  capabilities: ["business-applications", "sales-systems", "custom-software", "web-experiences"],
  technologies: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Three.js", "Telegram Bot API"],
  theme: "light",
  coverImage: {
    kind: "composition",
    id: "realestate-plan",
    alt: {
      en: "Architectural floor plan of a residence beside a unit card marked available and a building availability grid.",
      hy: "Բնակարանի ճարտարապետական հատակագիծ՝ «հասանելի» նշումով բնակարանի քարտի և շենքի հասանելիության ցանցի կողքին։",
      ru: "Архитектурная планировка квартиры рядом с карточкой свободного объекта и сеткой доступности по дому.",
    },
  },
  gallery: [
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "realestate-matrix",
        alt: {
          en: "Availability matrix of a residential building: every unit by floor with sold, reserved and available states.",
          hy: "Բնակելի շենքի հասանելիության աղյուսակ՝ բոլոր բնակարաններն ըստ հարկերի՝ վաճառված, ամրագրված և հասանելի կարգավիճակներով։",
          ru: "Шахматка жилого дома: все квартиры по этажам со статусами «продано», «бронь» и «свободно».",
        },
      },
      caption: {
        en: "One live inventory — the same truth for the sales team, agents and the website.",
        hy: "Մեկ կենդանի բազա՝ նույն ճշմարտությունը վաճառքի թիմի, գործակալների և կայքի համար։",
        ru: "Одна живая база — одна и та же правда для отдела продаж, агентов и сайта.",
      },
    },
    {
      layout: "inset",
      visual: {
        kind: "composition",
        id: "realestate-mobile",
        alt: {
          en: "Three phone screens: browsing residences, viewing a unit plan and a confirmed viewing appointment.",
          hy: "Հեռախոսի երեք էկրան՝ բնակարանների դիտում, հատակագծի ուսումնասիրում և հաստատված այց։",
          ru: "Три экрана телефона: подбор квартир, планировка объекта и подтверждённый просмотр.",
        },
      },
      caption: {
        en: "Buyers explore plans and book viewings on their phone, without waiting for a PDF.",
        hy: "Գնորդներն ուսումնասիրում են հատակագծերը և ամրագրում այցերը հեռախոսով՝ առանց PDF սպասելու։",
        ru: "Покупатели смотрят планировки и записываются на просмотр с телефона — без ожидания PDF.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "inventory", group: "input", label: { en: "Unit inventory", hy: "Բնակարանների բազա", ru: "База объектов" } },
      { id: "buyers", group: "input", label: { en: "Buyer inquiries", hy: "Գնորդների հարցումներ", ru: "Запросы покупателей" } },
      { id: "agents", group: "input", label: { en: "Agent requests", hy: "Գործակալների հարցումներ", ru: "Запросы агентов" } },
      { id: "availability", group: "core", label: { en: "Live availability", hy: "Կենդանի հասանելիություն", ru: "Живая доступность" } },
      { id: "crm", group: "core", label: { en: "Sales CRM", hy: "Վաճառքի CRM", ru: "CRM продаж" } },
      { id: "holds", group: "core", label: { en: "Reservation engine", hy: "Ամրագրման համակարգ", ru: "Система бронирования" } },
      { id: "website", group: "output", label: { en: "Website & plans", hy: "Կայք և հատակագծեր", ru: "Сайт и планировки" } },
      { id: "portal", group: "output", label: { en: "Agent portal", hy: "Գործակալների պորտալ", ru: "Портал агентов" } },
      { id: "reports", group: "output", label: { en: "Sales reports", hy: "Վաճառքի հաշվետվություններ", ru: "Отчёты продаж" } },
    ],
    edges: [
      ["inventory", "availability"],
      ["buyers", "crm"],
      ["agents", "holds"],
      ["availability", "crm"],
      ["crm", "holds"],
      ["availability", "website"],
      ["holds", "portal"],
      ["crm", "reports"],
    ],
  },
  content: {
    en: {
      title: "Real Estate Sales Platform",
      subtitle: "Live availability, reservations and buyer journeys for residential developments.",
      client: "Concept study — residential developer",
      industry: "Real estate development",
      projectType: "Sales platform · CRM · Web",
      shortDescription:
        "A sales platform that connects live unit availability, reservations and buyer communication in one system for the sales team and buyers.",
      challenge: "Availability lived in spreadsheets that were outdated by the afternoon.",
      solution: "One live inventory feeding the sales CRM, the website and the buyer's phone.",
      context:
        "Residential developers sell hundreds of units across several buildings, through an in-house sales team and external agents.",
      challengeDetail: [
        "Unit availability was tracked in spreadsheets shared by email. By the time a buyer asked about a unit, the information was often out of date.",
        "Double reservations, slow answers and manual reporting cost the team time — and buyers' trust.",
      ],
      research: [
        "The same unit could be promised to two buyers on the same day.",
        "Managers rebuilt the availability report by hand every week.",
        "Buyers mostly browsed on mobile, but plans and prices arrived as PDFs.",
        "Agents could not see what the in-house team had already reserved.",
      ],
      solutionDetail: [
        "We designed one live inventory of every unit — status, plan, area and history — as the single source of truth.",
        "The sales CRM, the public website and agent access all read from it. Reservations lock a unit instantly, expire automatically, and every change is logged.",
      ],
      systemsBuilt: [
        "Live unit inventory and availability matrix",
        "Reservation and hold management",
        "Sales CRM with buyer history",
        "Public website with interactive plans",
        "Agent portal with role-based access",
      ],
      features: [
        { title: "Live chessboard", text: "Every unit and status across buildings, in real time." },
        { title: "Instant holds", text: "Reservations lock units and expire automatically." },
        { title: "Interactive plans", text: "Buyers explore floor plans on any device." },
        { title: "Agent access", text: "External agents see exactly what they need — nothing more." },
      ],
      services: ["Sales process mapping", "Product design", "Platform development", "Website and integrations"],
      results: [
        "No more double reservations",
        "Availability always current for the whole team",
        "Faster answers to buyers",
        "Sales reports generated automatically",
      ],
    },
    hy: {
      title: "Անշարժ գույքի վաճառքի հարթակ",
      subtitle: "Կենդանի հասանելիություն, ամրագրումներ և գնորդի ճանապարհ բնակելի նախագծերի համար։",
      client: "Կոնցեպտ ուսումնասիրություն՝ բնակելի շինարարության կառուցապատող",
      industry: "Անշարժ գույքի կառուցապատում",
      projectType: "Վաճառքի հարթակ · CRM · Վեբ",
      shortDescription:
        "Վաճառքի հարթակ, որը մեկ համակարգում միավորում է բնակարանների կենդանի հասանելիությունը, ամրագրումները և հաղորդակցությունը գնորդների հետ։",
      challenge: "Հասանելիությունը պահվում էր աղյուսակներում, որոնք կեսօրին արդեն հնացած էին։",
      solution: "Մեկ կենդանի բազա, որը սնում է վաճառքի CRM-ը, կայքը և գնորդի հեռախոսը։",
      context:
        "Բնակելի նախագծերի կառուցապատողները մի քանի շենքում հարյուրավոր բնակարաններ են վաճառում՝ սեփական վաճառքի թիմի և արտաքին գործակալների միջոցով։",
      challengeDetail: [
        "Բնակարանների հասանելիությունը պահվում էր էլ. փոստով փոխանցվող աղյուսակներում։ Երբ գնորդը հարցնում էր բնակարանի մասին, տեղեկությունը հաճախ արդեն հնացած էր։",
        "Կրկնակի ամրագրումները, դանդաղ պատասխաններն ու ձեռքով հաշվետվությունները թիմից խլում էին ժամանակ, իսկ գնորդներից՝ վստահություն։",
      ],
      research: [
        "Նույն բնակարանը մեկ օրում կարող էր խոստացվել երկու գնորդի։",
        "Մենեջերներն ամեն շաբաթ ձեռքով վերակազմում էին հասանելիության հաշվետվությունը։",
        "Գնորդները հիմնականում դիտում էին հեռախոսով, բայց հատակագծերն ու գները ստանում էին PDF-ով։",
        "Գործակալները չէին տեսնում, թե ինչ է արդեն ամրագրել ներքին թիմը։",
      ],
      solutionDetail: [
        "Նախագծեցինք բոլոր բնակարանների մեկ կենդանի բազա՝ կարգավիճակ, հատակագիծ, մակերես և պատմություն՝ որպես ճշմարտության միակ աղբյուր։",
        "Վաճառքի CRM-ը, հանրային կայքը և գործակալների հասանելիությունը կարդում են նույն բազայից։ Ամրագրումն ակնթարթորեն կողպում է բնակարանը, ավտոմատ ավարտվում է, և յուրաքանչյուր փոփոխություն գրանցվում է։",
      ],
      systemsBuilt: [
        "Բնակարանների կենդանի բազա և հասանելիության աղյուսակ",
        "Ամրագրումների և պահումների կառավարում",
        "Վաճառքի CRM՝ գնորդների պատմությամբ",
        "Հանրային կայք՝ ինտերակտիվ հատակագծերով",
        "Գործակալների պորտալ՝ դերերով հասանելիությամբ",
      ],
      features: [
        { title: "Կենդանի աղյուսակ", text: "Բոլոր բնակարաններն ու կարգավիճակները բոլոր շենքերում՝ իրական ժամանակում։" },
        { title: "Ակնթարթային պահումներ", text: "Ամրագրումները կողպում են բնակարանները և ավտոմատ ավարտվում։" },
        { title: "Ինտերակտիվ հատակագծեր", text: "Գնորդներն ուսումնասիրում են հատակագծերը ցանկացած սարքով։" },
        { title: "Գործակալների հասանելիություն", text: "Արտաքին գործակալները տեսնում են ճիշտ այն, ինչ պետք է, ոչ ավելին։" },
      ],
      services: ["Վաճառքի գործընթացի քարտեզագրում", "Արտադրանքի դիզայն", "Հարթակի մշակում", "Կայք և ինտեգրացիաներ"],
      results: [
        "Կրկնակի ամրագրումներն այլևս չկան",
        "Հասանելիությունը միշտ արդիական է ամբողջ թիմի համար",
        "Ավելի արագ պատասխաններ գնորդներին",
        "Վաճառքի հաշվետվությունները ստեղծվում են ավտոմատ",
      ],
    },
    ru: {
      title: "Платформа продаж недвижимости",
      subtitle: "Живая доступность, бронирование и путь покупателя для жилых комплексов.",
      client: "Концепт — девелопер жилой недвижимости",
      industry: "Девелопмент",
      projectType: "Платформа продаж · CRM · Веб",
      shortDescription:
        "Платформа продаж, которая объединяет живую доступность квартир, бронирование и коммуникацию с покупателями в одной системе.",
      challenge: "Доступность жила в таблицах, которые устаревали уже к обеду.",
      solution: "Одна живая база объектов для CRM продаж, сайта и телефона покупателя.",
      context:
        "Девелоперы продают сотни квартир в нескольких домах — через собственный отдел продаж и внешних агентов.",
      challengeDetail: [
        "Доступность квартир вели в таблицах, которые пересылали по почте. Когда покупатель спрашивал о квартире, данные часто уже были неактуальны.",
        "Двойные брони, медленные ответы и ручная отчётность стоили команде времени, а покупателям — доверия.",
      ],
      research: [
        "Одну и ту же квартиру могли пообещать двум покупателям в один день.",
        "Менеджеры каждую неделю вручную пересобирали отчёт о доступности.",
        "Покупатели в основном смотрели с телефона, но планировки и цены получали в PDF.",
        "Агенты не видели, что уже забронировал внутренний отдел.",
      ],
      solutionDetail: [
        "Мы спроектировали единую живую базу всех объектов — статус, планировка, площадь и история — как единственный источник правды.",
        "CRM продаж, публичный сайт и доступ агентов работают с ней напрямую. Бронь мгновенно блокирует квартиру, автоматически истекает, а каждое изменение фиксируется.",
      ],
      systemsBuilt: [
        "Живая база объектов и шахматка",
        "Управление бронями и удержаниями",
        "CRM продаж с историей покупателей",
        "Публичный сайт с интерактивными планировками",
        "Портал агентов с ролевым доступом",
      ],
      features: [
        { title: "Живая шахматка", text: "Все квартиры и статусы по всем домам — в реальном времени." },
        { title: "Мгновенные брони", text: "Бронь блокирует объект и истекает автоматически." },
        { title: "Интерактивные планировки", text: "Покупатели изучают планировки на любом устройстве." },
        { title: "Доступ агентов", text: "Внешние агенты видят ровно то, что им нужно." },
      ],
      services: ["Картирование процесса продаж", "Продуктовый дизайн", "Разработка платформы", "Сайт и интеграции"],
      results: [
        "Больше никаких двойных броней",
        "Актуальная доступность для всей команды",
        "Более быстрые ответы покупателям",
        "Отчёты по продажам формируются автоматически",
      ],
    },
  },
};
