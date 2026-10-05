import type { Project } from "../types";

/**
 * DEMO CONTENT — concept project used to demonstrate the case-study design.
 * Not a client engagement; no measured results are claimed.
 */
export const corporateWebExperience: Project = {
  id: "p-corporate-web-experience",
  slug: "corporate-web-experience",
  status: "concept",
  featured: true,
  order: 6,
  year: 2025,
  capabilities: ["web-experiences", "custom-software"],
  technologies: ["Next.js", "React", "TypeScript", "Three.js", "GSAP", "Headless CMS", "Vercel"],
  theme: "light",
  coverImage: {
    kind: "composition",
    id: "web-editorial",
    focus: "left",
    alt: {
      en: "Editorial corporate website in a browser and on a phone, with a large headline over an architectural elevation drawing.",
      hy: "Էդիտորիալ կորպորատիվ կայք դիտարկիչում և հեռախոսում՝ մեծ վերնագրով և ճարտարապետական ճակատի գծագրով։",
      ru: "Редакционный корпоративный сайт в браузере и на телефоне: крупный заголовок над архитектурным чертежом фасада.",
    },
  },
  gallery: [
    {
      layout: "full",
      visual: {
        kind: "composition",
        id: "web-system",
        alt: {
          en: "Design system sheet: type scale, twelve-column grid, colour tokens and interface components.",
          hy: "Դիզայն համակարգի թերթ՝ տառատեսակների սանդղակ, տասներկու սյունականի ցանց, գույներ և ինտերֆեյսի բաղադրիչներ։",
          ru: "Лист дизайн-системы: типографическая шкала, 12-колоночная сетка, цветовые токены и компоненты интерфейса.",
        },
      },
      caption: {
        en: "A design system the team can extend without breaking the experience.",
        hy: "Դիզայն համակարգ, որը թիմը կարող է ընդլայնել՝ առանց փորձառությունը խաթարելու։",
        ru: "Дизайн-система, которую команда может развивать, не ломая впечатление.",
      },
    },
    {
      layout: "split-left",
      visual: {
        kind: "composition",
        id: "web-flow",
        alt: {
          en: "Content architecture: structured content in three languages flows through a CMS and templates to edge delivery.",
          hy: "Բովանդակության ճարտարապետություն՝ երեք լեզվով կառուցվածքային բովանդակությունը CMS-ով և ձևանմուշներով հասնում է առաքման։",
          ru: "Архитектура контента: структурированный контент на трёх языках через CMS и шаблоны доходит до доставки.",
        },
      },
      caption: {
        en: "One content model publishes every page in Armenian, Russian and English.",
        hy: "Մեկ բովանդակային մոդելը հրապարակում է յուրաքանչյուր էջ հայերեն, ռուսերեն և անգլերեն։",
        ru: "Одна модель контента публикует каждую страницу на армянском, русском и английском.",
      },
    },
  ],
  system: {
    nodes: [
      { id: "content", group: "input", label: { en: "Structured content", hy: "Կառուցվածքային բովանդակություն", ru: "Структурированный контент" } },
      { id: "languages", group: "input", label: { en: "Three languages", hy: "Երեք լեզու", ru: "Три языка" } },
      { id: "brand", group: "input", label: { en: "Brand system", hy: "Բրենդի համակարգ", ru: "Бренд-система" } },
      { id: "model", group: "core", label: { en: "Content model", hy: "Բովանդակության մոդել", ru: "Модель контента" } },
      { id: "templates", group: "core", label: { en: "Page templates", hy: "Էջերի ձևանմուշներ", ru: "Шаблоны страниц" } },
      { id: "motion", group: "core", label: { en: "3D & motion layer", hy: "3D և շարժման շերտ", ru: "Слой 3D и анимации" } },
      { id: "site", group: "output", label: { en: "Flagship website", hy: "Գլխավոր կայք", ru: "Флагманский сайт" } },
      { id: "seo", group: "output", label: { en: "Search visibility", hy: "Տեսանելիություն որոնման մեջ", ru: "Видимость в поиске" } },
      { id: "analytics", group: "output", label: { en: "Analytics", hy: "Վերլուծություն", ru: "Аналитика" } },
    ],
    edges: [
      ["content", "model"],
      ["languages", "model"],
      ["brand", "motion"],
      ["model", "templates"],
      ["templates", "motion"],
      ["templates", "site"],
      ["model", "seo"],
      ["motion", "analytics"],
    ],
  },
  content: {
    en: {
      title: "Premium Corporate Web Experience",
      subtitle: "An editorial, multilingual flagship site that explains complex expertise with clarity.",
      client: "Concept study — engineering group",
      industry: "Engineering & construction",
      projectType: "Web experience · Design system",
      shortDescription:
        "A multilingual corporate website with editorial storytelling, interactive 3D moments and a design system the team can grow.",
      challenge: "A strong company was represented by a generic, slow website.",
      solution: "An editorial experience on a fast, multilingual content architecture.",
      context:
        "Engineering groups win large contracts on trust. Their website is often the first serious impression for partners, clients and future employees.",
      challengeDetail: [
        "The existing site looked like a template, loaded slowly and was hard to update in three languages.",
        "Complex projects and capabilities were reduced to short paragraphs and stock photos.",
      ],
      research: [
        "Decision makers looked for proof of expertise, not slogans.",
        "Most visits came from mobile devices.",
        "Every content update depended on developers.",
        "The company had strong visual material that the site never used.",
      ],
      solutionDetail: [
        "We designed an editorial structure built around projects and expertise, with large typography, real photography and restrained motion.",
        "Content lives in a structured, multilingual model, so the team can publish in every language without developers.",
      ],
      systemsBuilt: [
        "Editorial design system",
        "Multilingual content architecture",
        "Project and expertise templates",
        "Interactive 3D and scroll moments",
        "Performance and SEO foundation",
      ],
      features: [
        { title: "Editorial layouts", text: "Projects presented like publications, not cards." },
        { title: "Three languages", text: "Every page published in each language from one model." },
        { title: "Restrained motion", text: "Interaction that guides attention and respects reduced motion." },
        { title: "Fast by default", text: "Optimised images, code splitting and edge delivery." },
      ],
      services: ["Brand and content strategy", "Art direction", "Design system", "Web development"],
      results: [
        "A website that reflects the quality of the company",
        "Content published without developer help",
        "Fast loading on mobile",
        "Clear paths to contact for partners and clients",
      ],
    },
    hy: {
      title: "Պրեմիում կորպորատիվ վեբ փորձառություն",
      subtitle: "Էդիտորիալ, բազմալեզու գլխավոր կայք, որը հստակ ներկայացնում է բարդ փորձագիտությունը։",
      client: "Կոնցեպտ ուսումնասիրություն՝ ինժեներական խումբ",
      industry: "Ինժեներիա և շինարարություն",
      projectType: "Վեբ փորձառություն · Դիզայն համակարգ",
      shortDescription:
        "Բազմալեզու կորպորատիվ կայք՝ էդիտորիալ պատմողականությամբ, ինտերակտիվ 3D պահերով և դիզայն համակարգով, որը թիմը կարող է զարգացնել։",
      challenge: "Ուժեղ ընկերությունը ներկայացված էր անդեմ և դանդաղ կայքով։",
      solution: "Էդիտորիալ փորձառություն՝ արագ և բազմալեզու բովանդակային ճարտարապետության վրա։",
      context:
        "Ինժեներական խմբերը խոշոր պայմանագրեր են շահում վստահության շնորհիվ։ Նրանց կայքը հաճախ առաջին լուրջ տպավորությունն է գործընկերների, հաճախորդների և ապագա աշխատակիցների համար։",
      challengeDetail: [
        "Գործող կայքը կաղապարային տեսք ուներ, դանդաղ էր բեռնվում և դժվար էր թարմացվում երեք լեզվով։",
        "Բարդ նախագծերն ու հնարավորությունները ներկայացված էին կարճ պարբերություններով և ստոկային լուսանկարներով։",
      ],
      research: [
        "Որոշում կայացնողները փնտրում էին փորձագիտության ապացույցներ, ոչ թե կարգախոսներ։",
        "Այցելությունների մեծ մասը կատարվում էր հեռախոսներից։",
        "Բովանդակության յուրաքանչյուր թարմացում կախված էր ծրագրավորողներից։",
        "Ընկերությունն ուներ ուժեղ վիզուալ նյութեր, որոնք կայքում չէին օգտագործվում։",
      ],
      solutionDetail: [
        "Նախագծեցինք նախագծերի և փորձագիտության շուրջ կառուցված էդիտորիալ կառուցվածք՝ մեծ տիպոգրաֆիկայով, իրական լուսանկարներով և զուսպ շարժումով։",
        "Բովանդակությունը պահվում է կառուցվածքային, բազմալեզու մոդելում, որպեսզի թիմը կարողանա հրապարակել բոլոր լեզուներով՝ առանց ծրագրավորողների։",
      ],
      systemsBuilt: [
        "Էդիտորիալ դիզայն համակարգ",
        "Բազմալեզու բովանդակային ճարտարապետություն",
        "Նախագծերի և փորձագիտության ձևանմուշներ",
        "Ինտերակտիվ 3D և ոլորման պահեր",
        "Արագագործության և SEO-ի հիմք",
      ],
      features: [
        { title: "Էդիտորիալ դասավորություններ", text: "Նախագծերը ներկայացված են որպես հրապարակումներ, ոչ թե քարտեր։" },
        { title: "Երեք լեզու", text: "Յուրաքանչյուր էջ հրապարակվում է բոլոր լեզուներով՝ մեկ մոդելից։" },
        { title: "Զուսպ շարժում", text: "Ինտերակցիա, որն ուղղորդում է ուշադրությունը և հարգում նվազեցված շարժման կարգավորումը։" },
        { title: "Արագ՝ ըստ լռելյայնի", text: "Օպտիմալացված պատկերներ, կոդի բաժանում և առաքում եզրային սերվերներից։" },
      ],
      services: ["Բրենդի և բովանդակության ռազմավարություն", "Արտ դիրեկշն", "Դիզայն համակարգ", "Վեբ մշակում"],
      results: [
        "Կայք, որն արտացոլում է ընկերության որակը",
        "Բովանդակությունը հրապարակվում է առանց ծրագրավորողների օգնության",
        "Արագ բեռնում հեռախոսներում",
        "Հստակ ճանապարհներ դեպի կապ՝ գործընկերների և հաճախորդների համար",
      ],
    },
    ru: {
      title: "Премиальный корпоративный веб-проект",
      subtitle: "Редакционный мультиязычный флагманский сайт, который ясно объясняет сложную экспертизу.",
      client: "Концепт — инженерная группа",
      industry: "Инжиниринг и строительство",
      projectType: "Веб-проект · Дизайн-система",
      shortDescription:
        "Мультиязычный корпоративный сайт с редакционной подачей, интерактивными 3D-моментами и дизайн-системой, которую команда может развивать.",
      challenge: "Сильную компанию представлял безликий и медленный сайт.",
      solution: "Редакционный опыт на быстрой мультиязычной архитектуре контента.",
      context:
        "Инженерные группы выигрывают крупные контракты благодаря доверию. Их сайт часто становится первым серьёзным впечатлением для партнёров, клиентов и будущих сотрудников.",
      challengeDetail: [
        "Прежний сайт выглядел как шаблон, медленно загружался и с трудом обновлялся на трёх языках.",
        "Сложные проекты и компетенции сводились к коротким абзацам и стоковым фото.",
      ],
      research: [
        "Лица, принимающие решения, искали доказательства экспертизы, а не слоганы.",
        "Большинство визитов приходилось на мобильные устройства.",
        "Каждое обновление контента зависело от разработчиков.",
        "У компании были сильные визуальные материалы, которые сайт не использовал.",
      ],
      solutionDetail: [
        "Мы спроектировали редакционную структуру вокруг проектов и экспертизы: крупная типографика, реальная фотография и сдержанная анимация.",
        "Контент хранится в структурированной мультиязычной модели, поэтому команда публикует на всех языках без разработчиков.",
      ],
      systemsBuilt: [
        "Редакционная дизайн-система",
        "Мультиязычная архитектура контента",
        "Шаблоны проектов и компетенций",
        "Интерактивные 3D- и scroll-моменты",
        "Основа для скорости и SEO",
      ],
      features: [
        { title: "Редакционные макеты", text: "Проекты подаются как публикации, а не карточки." },
        { title: "Три языка", text: "Каждая страница публикуется на всех языках из одной модели." },
        { title: "Сдержанная анимация", text: "Движение направляет внимание и учитывает настройку уменьшения движения." },
        { title: "Быстро по умолчанию", text: "Оптимизированные изображения, разделение кода и доставка с edge-серверов." },
      ],
      services: ["Бренд- и контент-стратегия", "Арт-дирекшн", "Дизайн-система", "Веб-разработка"],
      results: [
        "Сайт, который отражает уровень компании",
        "Контент публикуется без помощи разработчиков",
        "Быстрая загрузка на мобильных",
        "Понятные пути к контакту для партнёров и клиентов",
      ],
    },
  },
};
