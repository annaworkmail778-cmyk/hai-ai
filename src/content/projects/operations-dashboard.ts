import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 */
export const operationsDashboard: Project = {
  id: "p-operations-dashboard",
  slug: "operations-dashboard",
  status: "concept",
  featured: true,
  order: 4,
  year: 2025,
  capabilities: ["internal-tools", "custom-software", "automation"],
  technologies: ["Next.js", "TypeScript", "PostgreSQL", "Python", "n8n", "REST APIs"],
  theme: "dark",
  coverImage: {
    kind: "composition",
    id: "ops-dashboard",
    alt: {
      en: "Operations dashboard with order counts, a throughput chart, work in progress by stage and a table of orders at risk.",
      hy: "Գործառնական վահանակ՝ պատվերների քանակով, թողունակության գրաֆիկով, ըստ փուլերի աշխատանքներով և ռիսկային պատվերների աղյուսակով։",
      ru: "Операционный дашборд с количеством заказов, графиком пропускной способности, загрузкой этапов и таблицей рисковых заказов.",
    },
  },
  gallery: [
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "ops-timeline",
        alt: {
          en: "Production timeline of orders across the week with a current-time marker and an alert about an order at risk.",
          hy: "Պատվերների արտադրական ժամանակացույց ամբողջ շաբաթվա համար՝ ընթացիկ պահի նշիչով և ռիսկային պատվերի ծանուցմամբ։",
          ru: "Производственная шкала заказов на неделю с отметкой текущего времени и предупреждением о рисковом заказе.",
        },
      },
      caption: {
        en: "Risks surface days before a deadline — not when the client calls.",
        hy: "Ռիսկերը երևում են վերջնաժամկետից օրեր առաջ, ոչ թե այն ժամանակ, երբ հաճախորդը զանգում է։",
        ru: "Риски видны за дни до дедлайна — а не когда звонит клиент.",
      },
    },
    {
      layout: "split-right",
      visual: {
        kind: "composition",
        id: "ops-flow",
        alt: {
          en: "System flow from order, inventory and production data through a shared data layer to dashboards, alerts and reports.",
          hy: "Համակարգի հոսք՝ պատվերների, պահեստի և արտադրության տվյալներից ընդհանուր շերտով դեպի վահանակներ, ծանուցումներ և հաշվետվություններ։",
          ru: "Схема системы: данные заказов, склада и производства через общий слой данных к дашбордам, уведомлениям и отчётам.",
        },
      },
      caption: {
        en: "One shared model replaces five versions of the truth.",
        hy: "Մեկ ընդհանուր մոդելը փոխարինում է ճշմարտության հինգ տարբերակներին։",
        ru: "Одна общая модель вместо пяти версий правды.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "orders", group: "input", label: { en: "Orders", hy: "Պատվերներ", ru: "Заказы" } },
      { id: "inventory", group: "input", label: { en: "Inventory", hy: "Պահեստ", ru: "Склад" } },
      { id: "production", group: "input", label: { en: "Production updates", hy: "Արտադրության թարմացումներ", ru: "Данные производства" } },
      { id: "data", group: "core", label: { en: "Shared data layer", hy: "Տվյալների ընդհանուր շերտ", ru: "Общий слой данных" } },
      { id: "stages", group: "core", label: { en: "Stage tracking", hy: "Փուլերի հետևում", ru: "Отслеживание этапов" } },
      { id: "risk", group: "core", label: { en: "Risk detection", hy: "Ռիսկերի հայտնաբերում", ru: "Выявление рисков" } },
      { id: "dashboard", group: "output", label: { en: "Live dashboard", hy: "Կենդանի վահանակ", ru: "Живой дашборд" } },
      { id: "alerts", group: "output", label: { en: "Team alerts", hy: "Թիմային ծանուցումներ", ru: "Уведомления командам" } },
      { id: "reports", group: "output", label: { en: "Weekly reports", hy: "Շաբաթական հաշվետվություններ", ru: "Еженедельные отчёты" } },
    ],
    edges: [
      ["orders", "data"],
      ["inventory", "data"],
      ["production", "stages"],
      ["data", "stages"],
      ["stages", "risk"],
      ["data", "dashboard"],
      ["risk", "alerts"],
      ["stages", "reports"],
    ],
  },
  content: {
    en: {
      title: "Business Operations Dashboard",
      subtitle: "One live view of orders, production stages and risk — for a team that used to rely on phone calls.",
      client: "Concept study — manufacturing company",
      industry: "Manufacturing",
      projectType: "Internal tool · Data platform",
      shortDescription:
        "A live operations dashboard that connects orders, production stages and inventory, and flags risks before deadlines slip.",
      challenge: "Managers learned about delays when the client called.",
      solution: "Connected data, stage tracking and early risk alerts in one dashboard.",
      context:
        "Made-to-order manufacturers juggle dozens of orders moving through design, production, quality control and delivery at the same time.",
      challengeDetail: [
        "Order status lived in spreadsheets, chats and people's memory. Finding out where an order stood meant calling several people.",
        "Problems became visible only when a deadline had already been missed.",
      ],
      research: [
        "Status meetings took hours every week and were outdated the next day.",
        "One production stage was a recurring bottleneck, but no one could show it with data.",
        "Material shortages were discovered only after work had started.",
        "Each team measured progress in its own way.",
      ],
      solutionDetail: [
        "We connected order, inventory and production data into one shared model and defined clear stages with owners.",
        "The dashboard shows where every order stands, the work in progress at each stage and the orders at risk — and alerts the responsible team.",
      ],
      systemsBuilt: [
        "Shared operational data layer",
        "Stage tracking with ownership",
        "Risk detection and alerts",
        "Management dashboard and reports",
        "Integrations with existing order and inventory tools",
      ],
      features: [
        { title: "Live order status", text: "Every order's stage, owner and due date in one place." },
        { title: "Bottleneck view", text: "Work in progress per stage, visible at a glance." },
        { title: "Early warnings", text: "Orders at risk are flagged before deadlines slip." },
        { title: "Automatic reporting", text: "Weekly reports without spreadsheet work." },
      ],
      services: ["Operations research", "Data modelling", "Dashboard design", "Integration engineering"],
      results: [
        "Fewer status calls and meetings",
        "Bottlenecks visible early",
        "Clear ownership of every order",
        "Reports produced automatically",
      ],
    },
    hy: {
      title: "Գործառնական վահանակ",
      subtitle: "Պատվերների, արտադրական փուլերի և ռիսկերի մեկ կենդանի պատկեր՝ թիմի համար, որը նախկինում հենվում էր զանգերի վրա։",
      client: "Կոնցեպտ ուսումնասիրություն՝ արտադրական ընկերություն",
      industry: "Արտադրություն",
      projectType: "Ներքին գործիք · Տվյալների հարթակ",
      shortDescription:
        "Գործառնությունների կենդանի վահանակ, որը կապում է պատվերները, արտադրական փուլերը և պահեստը, և նախազգուշացնում ռիսկերի մասին՝ նախքան վերջնաժամկետների խախտումը։",
      challenge: "Մենեջերները ուշացումների մասին իմանում էին, երբ զանգում էր հաճախորդը։",
      solution: "Կապակցված տվյալներ, փուլերի հետևում և ռիսկերի վաղ ազդանշաններ՝ մեկ վահանակում։",
      context:
        "Պատվերով աշխատող արտադրողները միաժամանակ վարում են տասնյակ պատվերներ, որոնք անցնում են նախագծման, արտադրության, որակի վերահսկման և առաքման փուլերով։",
      challengeDetail: [
        "Պատվերների կարգավիճակը պահվում էր աղյուսակներում, չաթերում և մարդկանց հիշողության մեջ։ Պատվերի վիճակն իմանալու համար պետք էր զանգել մի քանի մարդու։",
        "Խնդիրները տեսանելի էին դառնում միայն այն ժամանակ, երբ վերջնաժամկետն արդեն խախտված էր։",
      ],
      research: [
        "Կարգավիճակի հանդիպումներն ամեն շաբաթ ժամեր էին խլում և հաջորդ օրը արդեն հնացած էին։",
        "Արտադրական փուլերից մեկը պարբերաբար խցանվում էր, բայց ոչ ոք չէր կարող դա ցույց տալ տվյալներով։",
        "Նյութերի պակասը հայտնաբերվում էր միայն աշխատանքն սկսելուց հետո։",
        "Յուրաքանչյուր թիմ առաջընթացը չափում էր յուրովի։",
      ],
      solutionDetail: [
        "Պատվերների, պահեստի և արտադրության տվյալները միավորեցինք մեկ ընդհանուր մոդելում և սահմանեցինք հստակ փուլեր՝ պատասխանատուներով։",
        "Վահանակը ցույց է տալիս, թե որտեղ է յուրաքանչյուր պատվեր, ինչքան աշխատանք կա յուրաքանչյուր փուլում և որ պատվերներն են ռիսկի տակ, ու ծանուցում է պատասխանատու թիմին։",
      ],
      systemsBuilt: [
        "Գործառնական տվյալների ընդհանուր շերտ",
        "Փուլերի հետևում՝ պատասխանատուներով",
        "Ռիսկերի հայտնաբերում և ծանուցումներ",
        "Կառավարման վահանակ և հաշվետվություններ",
        "Ինտեգրացիաներ առկա պատվերների և պահեստի գործիքների հետ",
      ],
      features: [
        { title: "Պատվերների կենդանի կարգավիճակ", text: "Յուրաքանչյուր պատվերի փուլը, պատասխանատուն և ժամկետը մեկ վայրում։" },
        { title: "Խցանումների պատկեր", text: "Յուրաքանչյուր փուլի ծանրաբեռնվածությունը՝ մեկ հայացքով։" },
        { title: "Վաղ նախազգուշացումներ", text: "Ռիսկային պատվերները նշվում են՝ նախքան ժամկետների խախտումը։" },
        { title: "Ավտոմատ հաշվետվություններ", text: "Շաբաթական հաշվետվություններ՝ առանց աղյուսակների հետ աշխատանքի։" },
      ],
      services: ["Գործառնությունների ուսումնասիրություն", "Տվյալների մոդելավորում", "Վահանակի դիզայն", "Ինտեգրացիաների մշակում"],
      results: [
        "Ավելի քիչ կարգավիճակի զանգեր և հանդիպումներ",
        "Խցանումները տեսանելի են վաղ փուլում",
        "Յուրաքանչյուր պատվեր ունի հստակ պատասխանատու",
        "Հաշվետվությունները ստեղծվում են ավտոմատ",
      ],
    },
    ru: {
      title: "Операционный дашборд бизнеса",
      subtitle: "Единая живая картина заказов, этапов производства и рисков — для команды, которая раньше полагалась на звонки.",
      client: "Концепт — производственная компания",
      industry: "Производство",
      projectType: "Внутренний инструмент · Платформа данных",
      shortDescription:
        "Живой операционный дашборд, который связывает заказы, этапы производства и склад и предупреждает о рисках до срыва сроков.",
      challenge: "Руководители узнавали о задержках, когда звонил клиент.",
      solution: "Связанные данные, отслеживание этапов и ранние предупреждения о рисках в одном дашборде.",
      context:
        "Производители, работающие под заказ, одновременно ведут десятки заказов, которые проходят проектирование, производство, контроль качества и доставку.",
      challengeDetail: [
        "Статус заказов жил в таблицах, чатах и памяти сотрудников. Чтобы узнать, где заказ, приходилось звонить нескольким людям.",
        "Проблемы становились видны только тогда, когда срок уже был сорван.",
      ],
      research: [
        "Статус-совещания занимали часы каждую неделю и устаревали на следующий день.",
        "Один из этапов производства регулярно становился узким местом, но никто не мог показать это на данных.",
        "Нехватка материалов обнаруживалась только после начала работ.",
        "Каждая команда измеряла прогресс по-своему.",
      ],
      solutionDetail: [
        "Мы объединили данные заказов, склада и производства в общую модель и определили понятные этапы с ответственными.",
        "Дашборд показывает, где находится каждый заказ, загрузку каждого этапа и заказы под риском — и уведомляет ответственную команду.",
      ],
      systemsBuilt: [
        "Общий слой операционных данных",
        "Отслеживание этапов с ответственными",
        "Выявление рисков и уведомления",
        "Управленческий дашборд и отчёты",
        "Интеграции с существующими системами заказов и склада",
      ],
      features: [
        { title: "Живой статус заказов", text: "Этап, ответственный и срок каждого заказа в одном месте." },
        { title: "Карта узких мест", text: "Загрузка каждого этапа — с одного взгляда." },
        { title: "Ранние предупреждения", text: "Рисковые заказы видны до срыва сроков." },
        { title: "Автоматические отчёты", text: "Еженедельная отчётность без работы с таблицами." },
      ],
      services: ["Исследование операций", "Моделирование данных", "Дизайн дашборда", "Разработка интеграций"],
      results: [
        "Меньше звонков и совещаний о статусе",
        "Узкие места видны заранее",
        "У каждого заказа есть ответственный",
        "Отчёты формируются автоматически",
      ],
    },
  },
};
