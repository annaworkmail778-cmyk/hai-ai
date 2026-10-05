import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 */
export const aiCustomerSupport: Project = {
  id: "p-ai-customer-support",
  slug: "ai-customer-support",
  status: "concept",
  featured: true,
  order: 5,
  year: 2026,
  capabilities: ["ai-systems", "automation", "business-applications"],
  technologies: ["Anthropic Claude", "OpenAI", "Retrieval (RAG)", "PostgreSQL", "Node.js", "Next.js", "Telegram Bot API"],
  theme: "dark",
  coverImage: {
    kind: "composition",
    id: "support-inbox",
    alt: {
      en: "Support inbox with intent tags, an AI-drafted reply that cites its sources, and a panel of matched knowledge and escalation rules.",
      hy: "Սպասարկման մուտք՝ մտադրության պիտակներով, աղբյուրներ նշող AI պատասխանով և համընկնող գիտելիքների ու փոխանցման կանոնների պանելով։",
      ru: "Входящие поддержки с метками намерений, AI-ответом со ссылками на источники и панелью найденных знаний и правил эскалации.",
    },
  },
  gallery: [
    {
      layout: "inset",
      visual: {
        kind: "composition",
        id: "support-knowledge",
        alt: {
          en: "The documents and live systems the assistant is grounded in, with answer-quality measures reviewed by the team.",
          hy: "Փաստաթղթերը և կենդանի համակարգերը, որոնց վրա հիմնված է օգնականը, և պատասխանների որակի ցուցանիշները, որոնք վերանայում է թիմը։",
          ru: "Документы и живые системы, на которых основан ассистент, и показатели качества ответов, которые проверяет команда.",
        },
      },
      caption: {
        en: "Answers come from company sources — policies and live order data — never from guesswork.",
        hy: "Պատասխանները գալիս են ընկերության աղբյուրներից՝ քաղաքականություններից և պատվերների կենդանի տվյալներից, երբեք ենթադրություններից։",
        ru: "Ответы опираются на источники компании — регламенты и живые данные заказов, а не на догадки.",
      },
    },
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "support-flow",
        alt: {
          en: "Support flow from chat, Telegram and email through intent detection and knowledge retrieval to AI replies or human handoff.",
          hy: "Սպասարկման հոսք՝ չաթից, Telegram-ից և էլ. փոստից մտադրության ճանաչմամբ և գիտելիքների որոնմամբ դեպի AI պատասխան կամ մարդուն փոխանցում։",
          ru: "Схема поддержки: от чата, Telegram и почты через определение намерения и поиск знаний к AI-ответу или передаче человеку.",
        },
      },
      caption: {
        en: "Clear rules decide when a person should take over — with the full context.",
        hy: "Հստակ կանոնները որոշում են, թե երբ պետք է մարդը ստանձնի զրույցը՝ ամբողջական համատեքստով։",
        ru: "Чёткие правила решают, когда разговор должен взять человек, — с полным контекстом.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "chat", group: "input", label: { en: "Website chat", hy: "Կայքի չաթ", ru: "Чат на сайте" } },
      { id: "messengers", group: "input", label: { en: "Telegram & email", hy: "Telegram և էլ. փոստ", ru: "Telegram и почта" } },
      { id: "orders", group: "input", label: { en: "Order system", hy: "Պատվերների համակարգ", ru: "Система заказов" } },
      { id: "intent", group: "core", label: { en: "Intent detection", hy: "Մտադրության ճանաչում", ru: "Определение намерения" } },
      { id: "retrieval", group: "core", label: { en: "Knowledge retrieval", hy: "Գիտելիքների որոնում", ru: "Поиск по знаниям" } },
      { id: "rules", group: "core", label: { en: "Escalation rules", hy: "Փոխանցման կանոններ", ru: "Правила эскалации" } },
      { id: "reply", group: "output", label: { en: "AI reply with sources", hy: "AI պատասխան՝ աղբյուրներով", ru: "AI-ответ с источниками" } },
      { id: "agent", group: "output", label: { en: "Agent handoff", hy: "Փոխանցում աշխատակցին", ru: "Передача сотруднику" } },
      { id: "review", group: "output", label: { en: "Quality review", hy: "Որակի վերանայում", ru: "Контроль качества" } },
    ],
    edges: [
      ["chat", "intent"],
      ["messengers", "intent"],
      ["orders", "retrieval"],
      ["intent", "retrieval"],
      ["retrieval", "rules"],
      ["retrieval", "reply"],
      ["rules", "agent"],
      ["rules", "review"],
    ],
  },
  content: {
    en: {
      title: "AI Customer Support System",
      subtitle: "An assistant grounded in company knowledge that answers routine questions and escalates the rest.",
      client: "Concept study — e-commerce retailer",
      industry: "E-commerce",
      projectType: "AI system · Support platform",
      shortDescription:
        "An AI support layer that answers routine customer questions from verified sources and hands complex cases to people with full context.",
      challenge: "The support team answered the same questions all day, every day.",
      solution: "AI replies grounded in company data, with clear rules for human handoff.",
      context:
        "Online retailers handle a steady stream of questions about delivery, returns and payments across chat, email and messengers.",
      challengeDetail: [
        "Most questions repeated, yet each still needed a person to look up the order and write a reply.",
        "Evenings and weekends created a backlog that slowed responses for everyone.",
      ],
      research: [
        "A handful of topics made up most conversations.",
        "Good answers depended on live order data, not only on FAQ text.",
        "Customers valued fast, accurate answers over long conversations.",
        "Agents needed context before taking over a conversation.",
      ],
      solutionDetail: [
        "We designed an assistant that reads the question, retrieves the relevant policy and live order data, and drafts or sends an answer that cites its sources.",
        "Clear escalation rules hand sensitive or complex cases to an agent, together with a summary of the conversation so far.",
      ],
      systemsBuilt: [
        "Intent detection across channels",
        "Retrieval over policies and live order data",
        "AI replies with cited sources",
        "Human handoff with conversation summaries",
        "Quality review and feedback loop",
      ],
      features: [
        { title: "Grounded answers", text: "Every reply is based on company sources." },
        { title: "Live order lookup", text: "Delivery and payment status in real time." },
        { title: "Safe escalation", text: "Clear rules send sensitive cases to people." },
        { title: "Continuous review", text: "The team reviews and improves answers every week." },
      ],
      services: ["Support process analysis", "AI system design", "Knowledge base structuring", "Integration and deployment"],
      results: [
        "Faster first responses, at any hour",
        "Agents focused on complex cases",
        "Consistent answers across channels",
        "Clear visibility of what customers ask",
      ],
    },
    hy: {
      title: "AI հաճախորդների սպասարկման համակարգ",
      subtitle: "Ընկերության գիտելիքների վրա հիմնված օգնական, որը պատասխանում է սովորական հարցերին և փոխանցում մնացածը։",
      client: "Կոնցեպտ ուսումնասիրություն՝ առցանց մանրածախ առևտրի ընկերություն",
      industry: "Էլեկտրոնային առևտուր",
      projectType: "AI համակարգ · Սպասարկման հարթակ",
      shortDescription:
        "AI սպասարկման շերտ, որը ստուգված աղբյուրներից պատասխանում է հաճախորդների սովորական հարցերին և բարդ դեպքերն ամբողջական համատեքստով փոխանցում մարդկանց։",
      challenge: "Սպասարկման թիմն ամեն օր, ամբողջ օրը պատասխանում էր նույն հարցերին։",
      solution: "Ընկերության տվյալների վրա հիմնված AI պատասխաններ՝ մարդուն փոխանցելու հստակ կանոններով։",
      context:
        "Առցանց խանութները անընդհատ հարցեր են ստանում առաքման, վերադարձի և վճարումների մասին՝ չաթով, էլ. փոստով և մեսենջերներով։",
      challengeDetail: [
        "Հարցերի մեծ մասը կրկնվում էր, բայց յուրաքանչյուրի համար դեռ պետք էր մարդ, որը կգտներ պատվերը և կգրեր պատասխանը։",
        "Երեկոներն ու հանգստյան օրերը կուտակում էին հարցումներ, ինչը դանդաղեցնում էր պատասխանները բոլորի համար։",
      ],
      research: [
        "Մի քանի թեմա կազմում էր զրույցների մեծ մասը։",
        "Լավ պատասխանները կախված էին պատվերների կենդանի տվյալներից, ոչ միայն ՀՏՀ տեքստերից։",
        "Հաճախորդները արագ և ճշգրիտ պատասխանը գերադասում էին երկար զրույցներից։",
        "Աշխատակիցներին համատեքստ էր պետք՝ նախքան զրույցը ստանձնելը։",
      ],
      solutionDetail: [
        "Նախագծեցինք օգնական, որը կարդում է հարցը, գտնում համապատասխան կանոնակարգն ու պատվերի կենդանի տվյալները և պատրաստում կամ ուղարկում պատասխան՝ նշելով աղբյուրները։",
        "Փոխանցման հստակ կանոնները զգայուն կամ բարդ դեպքերը փոխանցում են աշխատակցին՝ զրույցի ամփոփման հետ միասին։",
      ],
      systemsBuilt: [
        "Մտադրության ճանաչում բոլոր ալիքներում",
        "Որոնում կանոնակարգերում և պատվերների կենդանի տվյալներում",
        "AI պատասխաններ՝ աղբյուրների նշումով",
        "Փոխանցում մարդուն՝ զրույցի ամփոփմամբ",
        "Որակի վերանայում և հետադարձ կապ",
      ],
      features: [
        { title: "Հիմնավորված պատասխաններ", text: "Յուրաքանչյուր պատասխան հիմնված է ընկերության աղբյուրների վրա։" },
        { title: "Պատվերի կենդանի տվյալներ", text: "Առաքման և վճարման կարգավիճակ՝ իրական ժամանակում։" },
        { title: "Անվտանգ փոխանցում", text: "Հստակ կանոններով զգայուն դեպքերը հասնում են մարդկանց։" },
        { title: "Շարունակական վերանայում", text: "Թիմն ամեն շաբաթ վերանայում և բարելավում է պատասխանները։" },
      ],
      services: ["Սպասարկման գործընթացի վերլուծություն", "AI համակարգի նախագծում", "Գիտելիքների բազայի կառուցում", "Ինտեգրում և գործարկում"],
      results: [
        "Ավելի արագ առաջին պատասխաններ՝ օրվա ցանկացած ժամի",
        "Աշխատակիցները կենտրոնացած են բարդ դեպքերի վրա",
        "Միասնական պատասխաններ բոլոր ալիքներում",
        "Հստակ պատկեր, թե ինչ են հարցնում հաճախորդները",
      ],
    },
    ru: {
      title: "AI-система поддержки клиентов",
      subtitle: "Ассистент на знаниях компании, который отвечает на типовые вопросы и передаёт остальные людям.",
      client: "Концепт — интернет-магазин",
      industry: "E-commerce",
      projectType: "AI-система · Платформа поддержки",
      shortDescription:
        "AI-слой поддержки, который отвечает на типовые вопросы клиентов по проверенным источникам и передаёт сложные случаи людям с полным контекстом.",
      challenge: "Команда поддержки целыми днями отвечала на одни и те же вопросы.",
      solution: "AI-ответы на данных компании с понятными правилами передачи человеку.",
      context:
        "Интернет-магазины получают постоянный поток вопросов о доставке, возвратах и оплате — в чате, по почте и в мессенджерах.",
      challengeDetail: [
        "Большинство вопросов повторялись, но на каждый всё равно нужен был человек, чтобы найти заказ и написать ответ.",
        "Вечера и выходные создавали очередь, которая замедляла ответы для всех.",
      ],
      research: [
        "Несколько тем составляли большую часть обращений.",
        "Хорошие ответы зависели от живых данных заказов, а не только от текста FAQ.",
        "Клиенты ценили быстрые и точные ответы больше, чем долгие переписки.",
        "Сотрудникам нужен был контекст, прежде чем подключаться к диалогу.",
      ],
      solutionDetail: [
        "Мы спроектировали ассистента, который читает вопрос, находит нужный регламент и живые данные заказа и готовит или отправляет ответ со ссылками на источники.",
        "Чёткие правила эскалации передают чувствительные или сложные случаи сотруднику — вместе с кратким резюме диалога.",
      ],
      systemsBuilt: [
        "Определение намерения во всех каналах",
        "Поиск по регламентам и живым данным заказов",
        "AI-ответы со ссылками на источники",
        "Передача человеку с резюме диалога",
        "Контроль качества и обратная связь",
      ],
      features: [
        { title: "Обоснованные ответы", text: "Каждый ответ опирается на источники компании." },
        { title: "Живые данные заказов", text: "Статус доставки и оплаты в реальном времени." },
        { title: "Безопасная эскалация", text: "Чёткие правила передают чувствительные случаи людям." },
        { title: "Постоянная проверка", text: "Команда еженедельно проверяет и улучшает ответы." },
      ],
      services: ["Анализ процесса поддержки", "Проектирование AI-системы", "Структурирование базы знаний", "Интеграция и запуск"],
      results: [
        "Более быстрые первые ответы — в любое время",
        "Сотрудники сосредоточены на сложных случаях",
        "Единые ответы во всех каналах",
        "Понятно, о чём спрашивают клиенты",
      ],
    },
  },
};
