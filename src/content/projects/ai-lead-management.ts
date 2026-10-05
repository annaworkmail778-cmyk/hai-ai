import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 * Replace or remove when real projects are published (see PROJECT_CONTENT_GUIDE.md).
 */
export const aiLeadManagement: Project = {
  id: "p-ai-lead-management",
  slug: "ai-lead-management",
  status: "concept",
  featured: true,
  order: 1,
  year: 2026,
  capabilities: ["ai-systems", "sales-systems", "automation"],
  technologies: ["Next.js", "Node.js", "PostgreSQL", "OpenAI", "n8n", "WhatsApp Business API", "Telegram Bot API"],
  theme: "dark",
  coverImage: {
    kind: "composition",
    id: "lead-pipeline",
    focus: "right",
    alt: {
      en: "Lead pipeline interface: inquiries from four channels flow into one board, with an AI qualification panel scoring a lead.",
      hy: "Հայտերի խողովակի ինտերֆեյս՝ չորս ալիքից եկող հարցումներ մեկ վահանակում և AI որակավորման պանել, որը գնահատում է հայտը։",
      ru: "Интерфейс воронки заявок: обращения из четырёх каналов попадают на одну доску, панель AI-квалификации оценивает заявку.",
    },
  },
  gallery: [
    {
      layout: "split-right",
      visual: {
        kind: "composition",
        id: "lead-conversation",
        alt: {
          en: "A customer conversation with AI-drafted replies next to the details extracted from it.",
          hy: "Հաճախորդի հետ զրույց՝ AI-ի նախապատրաստած պատասխաններով և դրանից դուրս բերված տվյալներով։",
          ru: "Диалог с клиентом с ответами, подготовленными AI, и извлечёнными из него данными.",
        },
      },
      caption: {
        en: "Every conversation becomes structured data the team can act on.",
        hy: "Յուրաքանչյուր զրույց վերածվում է կառուցվածքային տվյալի, որի հիման վրա թիմը կարող է գործել։",
        ru: "Каждый диалог становится структурированными данными, с которыми команда может работать.",
      },
    },
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "lead-flow",
        alt: {
          en: "System flow from four channels through a unified inbox and AI qualification to sales, nurturing and dashboards.",
          hy: "Համակարգի հոսք՝ չորս ալիքից միասնական մուտքով և AI որակավորմամբ դեպի վաճառք, հետագա հաղորդակցություն և վահանակներ։",
          ru: "Схема системы: от четырёх каналов через единый входящий поток и AI-квалификацию к продажам, касаниям и дашбордам.",
        },
      },
      caption: {
        en: "From five channels to one owner and one next step.",
        hy: "Հինգ ալիքից՝ մեկ պատասխանատու և մեկ հաջորդ քայլ։",
        ru: "От пяти каналов — к одному ответственному и одному следующему шагу.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "web", group: "input", label: { en: "Website", hy: "Կայք", ru: "Сайт" } },
      { id: "social", group: "input", label: { en: "Instagram & WhatsApp", hy: "Instagram և WhatsApp", ru: "Instagram и WhatsApp" } },
      { id: "calls", group: "input", label: { en: "Calls", hy: "Զանգեր", ru: "Звонки" } },
      { id: "inbox", group: "core", label: { en: "Unified inbox", hy: "Միասնական մուտք", ru: "Единый входящий" } },
      { id: "ai", group: "core", label: { en: "AI qualification", hy: "AI որակավորում", ru: "AI-квалификация" } },
      { id: "routing", group: "core", label: { en: "Routing rules", hy: "Բաշխման կանոններ", ru: "Правила распределения" } },
      { id: "owner", group: "output", label: { en: "Assigned salesperson", hy: "Նշանակված մենեջեր", ru: "Назначенный менеджер" } },
      { id: "nurture", group: "output", label: { en: "Follow-up sequence", hy: "Հետագա հաղորդակցություն", ru: "Цепочка касаний" } },
      { id: "dashboard", group: "output", label: { en: "Pipeline dashboard", hy: "Վաճառքի վահանակ", ru: "Дашборд воронки" } },
    ],
    edges: [
      ["web", "inbox"],
      ["social", "inbox"],
      ["calls", "inbox"],
      ["inbox", "ai"],
      ["ai", "routing"],
      ["routing", "owner"],
      ["routing", "nurture"],
      ["routing", "dashboard"],
    ],
  },
  content: {
    en: {
      title: "AI Lead Management System",
      subtitle: "One inbox for every inquiry — qualified by AI, owned by a person, never lost.",
      client: "Concept study — service business",
      industry: "Professional services",
      projectType: "AI system · Sales platform",
      shortDescription:
        "A unified lead inbox that captures inquiries from every channel, qualifies them with AI and makes sure each one reaches the right person.",
      challenge: "Inquiries arrive through five channels and nobody owns them.",
      solution: "A single pipeline with AI qualification, automatic routing and follow-up.",
      context:
        "Growing service companies receive inquiries through the website, Instagram, WhatsApp, Telegram and phone calls. Each channel is handled by whoever happens to see it first.",
      challengeDetail: [
        "Without one place for inquiries, response times depend on luck. Some leads are answered within minutes, others after two days — and some are never answered at all.",
        "Leadership has no reliable view of how many inquiries arrive, where they come from or what happens to them.",
      ],
      research: [
        "Most lost leads were not rejected — they were simply never picked up.",
        "Sales staff spent a large share of the day asking the same qualifying questions.",
        "The best inquiries often arrived in the evening, outside office hours.",
        "Each channel had its own owner, so no one owned the outcome.",
      ],
      solutionDetail: [
        "We designed a single lead inbox that receives every inquiry, whatever the channel, and turns each conversation into a structured record.",
        "An AI assistant asks the first qualifying questions, extracts the key details and scores each lead. Qualified leads reach the right salesperson with full context; the rest enter a nurturing sequence.",
      ],
      systemsBuilt: [
        "Omnichannel lead capture (web, Instagram, WhatsApp, Telegram, calls)",
        "AI qualification and lead scoring",
        "Routing rules and clear ownership",
        "Automated follow-up sequences",
        "Pipeline dashboard for leadership",
      ],
      features: [
        { title: "Unified inbox", text: "Every inquiry in one place, with its full history." },
        { title: "AI qualification", text: "First questions answered instantly, at any hour." },
        { title: "Clear ownership", text: "Every lead has one owner and a next step." },
        { title: "Live pipeline", text: "Leadership sees volume, sources and conversion as it happens." },
      ],
      services: ["Process research", "System design", "AI integration", "Web application development"],
      results: [
        "Every inquiry captured and assigned",
        "Faster first response, including after hours",
        "Less repetitive qualification work for sales",
        "A live, trustworthy view of the pipeline",
      ],
    },
    hy: {
      title: "AI հայտերի կառավարման համակարգ",
      subtitle: "Մեկ մուտք յուրաքանչյուր հարցման համար՝ AI որակավորմամբ, պատասխանատու մարդով և առանց կորուստների։",
      client: "Կոնցեպտ ուսումնասիրություն՝ ծառայությունների ոլորտի ընկերություն",
      industry: "Մասնագիտական ծառայություններ",
      projectType: "AI համակարգ · Վաճառքի հարթակ",
      shortDescription:
        "Հայտերի միասնական մուտք, որը հավաքում է հարցումները բոլոր ալիքներից, որակավորում դրանք AI-ով և հասցնում ճիշտ մարդուն։",
      challenge: "Հարցումները գալիս են հինգ ալիքով, և դրանց համար ոչ ոք պատասխանատու չէ։",
      solution: "Մեկ վաճառքի խողովակ՝ AI որակավորմամբ, ավտոմատ բաշխմամբ և շարունակությամբ։",
      context:
        "Աճող ծառայողական ընկերությունները հարցումներ են ստանում կայքից, Instagram-ից, WhatsApp-ից, Telegram-ից և հեռախոսազանգերով։ Յուրաքանչյուր ալիքով զբաղվում է նա, ով առաջինն է նկատում։",
      challengeDetail: [
        "Առանց հարցումների մեկ վայրի՝ արձագանքման ժամանակը կախված է պատահականությունից։ Որոշ հայտերի պատասխանում են րոպեների ընթացքում, մյուսներին՝ երկու օր անց, իսկ ոմանց՝ երբեք։",
        "Ղեկավարությունը չունի հուսալի պատկեր, թե քանի հարցում է գալիս, որտեղից և ինչ է լինում դրանց հետ։",
      ],
      research: [
        "Կորած հայտերի մեծ մասը մերժված չէր՝ դրանք պարզապես ոչ ոք չէր վերցրել։",
        "Վաճառքի աշխատակիցները օրվա զգալի մասը ծախսում էին նույն որակավորման հարցերը տալու վրա։",
        "Լավագույն հարցումները հաճախ գալիս էին երեկոյան՝ աշխատանքային ժամերից դուրս։",
        "Յուրաքանչյուր ալիք ուներ իր պատասխանատուն, ուստի արդյունքի համար ոչ ոք պատասխանատու չէր։",
      ],
      solutionDetail: [
        "Նախագծեցինք հայտերի միասնական մուտք, որը ստանում է յուրաքանչյուր հարցում՝ անկախ ալիքից, և յուրաքանչյուր զրույց վերածում է կառուցվածքային գրառման։",
        "AI օգնականը տալիս է առաջին որակավորման հարցերը, դուրս է բերում հիմնական տվյալները և գնահատում յուրաքանչյուր հայտ։ Որակավորված հայտերն ամբողջական համատեքստով հասնում են ճիշտ մենեջերին, մյուսները ներառվում են հետագա հաղորդակցության հաջորդականության մեջ։",
      ],
      systemsBuilt: [
        "Հայտերի հավաքագրում բոլոր ալիքներից (կայք, Instagram, WhatsApp, Telegram, զանգեր)",
        "AI որակավորում և հայտերի գնահատում",
        "Բաշխման կանոններ և հստակ պատասխանատվություն",
        "Ավտոմատ հետագա հաղորդակցություն",
        "Վաճառքի վահանակ ղեկավարության համար",
      ],
      features: [
        { title: "Միասնական մուտք", text: "Յուրաքանչյուր հարցում մեկ վայրում՝ ամբողջական պատմությամբ։" },
        { title: "AI որակավորում", text: "Առաջին հարցերին պատասխան՝ ակնթարթորեն, օրվա ցանկացած ժամի։" },
        { title: "Հստակ պատասխանատվություն", text: "Յուրաքանչյուր հայտ ունի մեկ պատասխանատու և հաջորդ քայլ։" },
        { title: "Կենդանի խողովակ", text: "Ղեկավարությունը տեսնում է ծավալը, աղբյուրները և արդյունքներն իրական ժամանակում։" },
      ],
      services: ["Գործընթացների ուսումնասիրություն", "Համակարգի նախագծում", "AI ինտեգրում", "Վեբ հավելվածի մշակում"],
      results: [
        "Յուրաքանչյուր հարցում հավաքագրված և նշանակված է",
        "Ավելի արագ առաջին պատասխան՝ այդ թվում աշխատանքային ժամերից դուրս",
        "Ավելի քիչ կրկնվող որակավորման աշխատանք վաճառքի թիմի համար",
        "Վաճառքի խողովակի կենդանի և վստահելի պատկեր",
      ],
    },
    ru: {
      title: "AI-система управления заявками",
      subtitle: "Один входящий поток для каждого обращения — с AI-квалификацией, ответственным менеджером и без потерь.",
      client: "Концепт — компания сферы услуг",
      industry: "Профессиональные услуги",
      projectType: "AI-система · Платформа продаж",
      shortDescription:
        "Единый поток заявок, который собирает обращения из всех каналов, квалифицирует их с помощью AI и доводит каждое до нужного человека.",
      challenge: "Обращения приходят по пяти каналам, и за них никто не отвечает.",
      solution: "Единая воронка с AI-квалификацией, автоматическим распределением и follow-up.",
      context:
        "Растущие сервисные компании получают обращения через сайт, Instagram, WhatsApp, Telegram и звонки. Каждым каналом занимается тот, кто первым его заметит.",
      challengeDetail: [
        "Без единого места для заявок скорость ответа зависит от случая. На одни заявки отвечают за минуты, на другие — через два дня, а на некоторые не отвечают вовсе.",
        "У руководства нет надёжной картины: сколько обращений приходит, откуда и что с ними происходит.",
      ],
      research: [
        "Большинство потерянных заявок никто не отклонял — их просто никто не взял в работу.",
        "Менеджеры тратили значительную часть дня на одни и те же квалифицирующие вопросы.",
        "Лучшие обращения часто приходили вечером, вне рабочего времени.",
        "У каждого канала был свой ответственный, поэтому за результат не отвечал никто.",
      ],
      solutionDetail: [
        "Мы спроектировали единый поток заявок, который принимает каждое обращение из любого канала и превращает каждый диалог в структурированную запись.",
        "AI-ассистент задаёт первые квалифицирующие вопросы, извлекает ключевые данные и оценивает заявку. Квалифицированные заявки с полным контекстом уходят нужному менеджеру, остальные попадают в цепочку касаний.",
      ],
      systemsBuilt: [
        "Сбор заявок из всех каналов (сайт, Instagram, WhatsApp, Telegram, звонки)",
        "AI-квалификация и скоринг заявок",
        "Правила распределения и ясная ответственность",
        "Автоматические цепочки follow-up",
        "Дашборд воронки для руководства",
      ],
      features: [
        { title: "Единый входящий", text: "Каждое обращение в одном месте, с полной историей." },
        { title: "AI-квалификация", text: "Первые ответы — мгновенно, в любое время суток." },
        { title: "Ясная ответственность", text: "У каждой заявки один владелец и следующий шаг." },
        { title: "Живая воронка", text: "Руководство видит объём, источники и конверсию в реальном времени." },
      ],
      services: ["Исследование процессов", "Проектирование системы", "Интеграция AI", "Разработка веб-приложения"],
      results: [
        "Каждое обращение собрано и назначено",
        "Более быстрый первый ответ, в том числе в нерабочее время",
        "Меньше рутинной квалификации для отдела продаж",
        "Живая и достоверная картина воронки",
      ],
    },
  },
};
