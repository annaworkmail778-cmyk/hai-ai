import type { Project } from "../types";

/**
 * DEMO CONTENT — example project for the "Riseup Marketing" product.
 * Not a client engagement; no measured results are claimed.
 */
export const localMarketing: Project = {
  id: "p-local-marketing",
  slug: "local-marketing",
  status: "concept",
  featured: true,
  order: 4,
  year: 2026,
  capabilities: ["marketing"],
  technologies: ["Google Business Profile", "Instagram", "Claude / OpenAI", "Canva", "CapCut", "WhatsApp"],
  theme: "dark",
  demo: "marketing",
  coverImage: {
    kind: "composition",
    id: "lead-pipeline",
    alt: {
      en: "A monthly content plan, Google reviews and a simple report for a café.",
      hy: "Ամսական կոնտենտ պլան, Google կարծիքներ և պարզ հաշվետվություն սրճարանի համար։",
      ru: "Контент-план на месяц, отзывы в Google и простой отчёт для кафе.",
    },
  },
  gallery: [],
  system: {
    nodes: [
      { id: "visits", group: "input", label: { en: "Client visits", hy: "Հաճախորդների այցեր", ru: "Визиты клиентов" } },
      { id: "photos", group: "input", label: { en: "Photos & offers", hy: "Լուսանկարներ և առաջարկներ", ru: "Фото и акции" } },
      { id: "plan", group: "core", label: { en: "Monthly content plan", hy: "Ամսական կոնտենտ պլան", ru: "Контент-план на месяц" } },
      { id: "ask", group: "core", label: { en: "Review requests", hy: "Կարծիքի խնդրանքներ", ru: "Просьбы об отзывах" } },
      { id: "profile", group: "core", label: { en: "Google profile care", hy: "Google պրոֆիլի խնամք", ru: "Ведение профиля Google" } },
      { id: "posts", group: "output", label: { en: "Instagram posts", hy: "Instagram գրառումներ", ru: "Публикации в Instagram" } },
      { id: "rating", group: "output", label: { en: "Rating & reviews", hy: "Գնահատական և կարծիքներ", ru: "Рейтинг и отзывы" } },
      { id: "report", group: "output", label: { en: "Monthly report", hy: "Ամսական հաշվետվություն", ru: "Отчёт за месяц" } },
    ],
    edges: [
      ["photos", "plan"],
      ["visits", "ask"],
      ["plan", "posts"],
      ["ask", "rating"],
      ["profile", "rating"],
      ["profile", "report"],
    ],
  },
  content: {
    en: {
      title: "Instagram and Google marketing for a café",
      subtitle: "Posts every week, more Google reviews and a simple report — without hiring an SMM team.",
      client: "Example — neighbourhood café",
      industry: "Cafés, restaurants & local services",
      projectType: "Content · Google profile · Reviews",
      shortDescription:
        "A monthly service: an Instagram content plan, a cared-for Google profile, automatic review requests and a clear report.",
      challenge: "No time to post on Instagram, few reviews, and people can't find the business on Google Maps.",
      solution: "A monthly plan of posts, a Google profile kept up to date and review requests after every visit.",
      context:
        "People choose a café, a clinic or a salon on Google Maps and Instagram. Businesses with fresh posts and many good reviews get chosen first.",
      challengeDetail: [
        "The owner knows Instagram matters but has no time to post regularly.",
        "The Google profile has old photos and hours, and only a few reviews.",
      ],
      research: [
        "Happy clients leave reviews when they are asked at the right moment.",
        "Reviews without an answer look like nobody cares.",
        "A wrong address or hours on Google lose visitors.",
        "Regular posts with a clear offer bring people back.",
      ],
      solutionDetail: [
        "Every month we prepare 12–16 posts with AI and our own design, and you approve them. We keep the Google profile correct: photos, hours, menu and updates.",
        "After a visit the client gets a short “thank you” with a link to rate you on Google. Each review gets a polite reply, and once a month you get a short report in plain words.",
      ],
      systemsBuilt: [
        "Monthly Instagram content plan",
        "Google Business Profile setup and care",
        "Automatic review requests",
        "Replies to reviews",
        "Monthly report",
      ],
      features: [
        { title: "Posts every week", text: "12–16 posts a month that you approve before they go out." },
        { title: "Visible on Google", text: "Correct address, hours, photos and regular updates." },
        { title: "More reviews", text: "A review link after the visit, sent automatically." },
        { title: "Plain report", text: "Views, calls and route requests — once a month." },
      ],
      services: ["Content plan and posts", "Google profile", "Review requests and replies", "Monthly report"],
      results: [
        "Instagram stays active every week",
        "More reviews from real clients",
        "Correct information on Google Maps",
        "A clear picture of how people find you",
      ],
    },
    hy: {
      title: "Instagram և Google մարքեթինգ սրճարանի համար",
      subtitle: "Գրառումներ ամեն շաբաթ, ավելի շատ կարծիքներ Google-ում և պարզ հաշվետվություն՝ առանց SMM թիմ վարձելու։",
      client: "Օրինակ՝ թաղամասային սրճարան",
      industry: "Սրճարաններ, ռեստորաններ և տեղական ծառայություններ",
      projectType: "Կոնտենտ · Google պրոֆիլ · Կարծիքներ",
      shortDescription:
        "Ամսական ծառայություն՝ Instagram-ի կոնտենտ պլան, խնամված Google պրոֆիլ, ավտոմատ կարծիքի խնդրանքներ և հստակ հաշվետվություն։",
      challenge: "Instagram-ում գրառելու ժամանակ չկա, կարծիքները քիչ են, և մարդիկ չեն գտնում բիզնեսը Google Maps-ում։",
      solution: "Գրառումների ամսական պլան, արդիական Google պրոֆիլ և կարծիքի խնդրանք յուրաքանչյուր այցից հետո։",
      context:
        "Մարդիկ սրճարանը, կլինիկան կամ սրահն ընտրում են Google Maps-ում և Instagram-ում։ Թարմ գրառումներով և շատ լավ կարծիքներով բիզնեսներն ընտրվում են առաջինը։",
      challengeDetail: [
        "Սեփականատերը գիտի, որ Instagram-ը կարևոր է, բայց պարբերաբար գրառելու ժամանակ չունի։",
        "Google պրոֆիլում հին լուսանկարներ և ժամեր են, և ընդամենը մի քանի կարծիք։",
      ],
      research: [
        "Գոհ հաճախորդները կարծիք են թողնում, երբ նրանց խնդրում են ճիշտ պահին։",
        "Անպատասխան կարծիքները թողնում են անտարբերության տպավորություն։",
        "Google-ում սխալ հասցեն կամ ժամերը կորցնում են այցելուներ։",
        "Հստակ առաջարկով պարբերական գրառումները մարդկանց հետ են բերում։",
      ],
      solutionDetail: [
        "Ամեն ամիս AI-ով և մեր դիզայնով պատրաստում ենք 12–16 գրառում, իսկ դուք հաստատում եք։ Google պրոֆիլը պահում ենք ճիշտ՝ լուսանկարներ, ժամեր, մենյու և թարմացումներ։",
        "Այցից հետո հաճախորդը ստանում է կարճ «շնորհակալություն»՝ Google-ում գնահատելու հղումով։ Յուրաքանչյուր կարծիքի տրվում է քաղաքավարի պատասխան, և ամիսը մեկ ստանում եք պարզ հաշվետվություն։",
      ],
      systemsBuilt: [
        "Instagram-ի ամսական կոնտենտ պլան",
        "Google Business Profile-ի կարգավորում և խնամք",
        "Ավտոմատ կարծիքի խնդրանքներ",
        "Պատասխաններ կարծիքներին",
        "Ամսական հաշվետվություն",
      ],
      features: [
        { title: "Գրառումներ ամեն շաբաթ", text: "Ամսական 12–16 գրառում, որոնք հաստատում եք մինչև հրապարակումը։" },
        { title: "Տեսանելի Google-ում", text: "Ճիշտ հասցե, ժամեր, լուսանկարներ և պարբերական թարմացումներ։" },
        { title: "Ավելի շատ կարծիքներ", text: "Կարծիքի հղում այցից հետո՝ ավտոմատ։" },
        { title: "Պարզ հաշվետվություն", text: "Դիտումներ, զանգեր և երթուղու հարցումներ՝ ամիսը մեկ։" },
      ],
      services: ["Կոնտենտ պլան և գրառումներ", "Google պրոֆիլ", "Կարծիքի խնդրանքներ և պատասխաններ", "Ամսական հաշվետվություն"],
      results: [
        "Instagram-ը ակտիվ է ամեն շաբաթ",
        "Ավելի շատ կարծիքներ իրական հաճախորդներից",
        "Ճիշտ տեղեկություն Google Maps-ում",
        "Հստակ պատկեր, թե ինչպես են ձեզ գտնում",
      ],
    },
    ru: {
      title: "Маркетинг в Instagram и Google для кафе",
      subtitle: "Публикации каждую неделю, больше отзывов в Google и простой отчёт — без найма SMM-команды.",
      client: "Пример — кафе у дома",
      industry: "Кафе, рестораны и локальные услуги",
      projectType: "Контент · Профиль Google · Отзывы",
      shortDescription:
        "Ежемесячная услуга: контент-план для Instagram, ухоженный профиль Google, автоматические просьбы об отзывах и понятный отчёт.",
      challenge: "Нет времени вести Instagram, мало отзывов, и людям трудно найти бизнес на Google Картах.",
      solution: "План публикаций на месяц, актуальный профиль Google и просьба об отзыве после каждого визита.",
      context:
        "Кафе, клинику или салон люди выбирают на Google Картах и в Instagram. Бизнес со свежими публикациями и хорошими отзывами выбирают первым.",
      challengeDetail: [
        "Владелец понимает, что Instagram важен, но не успевает публиковать регулярно.",
        "В профиле Google старые фото и часы работы, а отзывов совсем немного.",
      ],
      research: [
        "Довольные клиенты оставляют отзывы, когда их просят в нужный момент.",
        "Отзывы без ответа создают впечатление равнодушия.",
        "Неверный адрес или часы в Google теряют посетителей.",
        "Регулярные посты с понятным предложением возвращают людей.",
      ],
      solutionDetail: [
        "Каждый месяц мы готовим 12–16 публикаций с AI и нашим дизайном, а вы их одобряете. Профиль Google держим в порядке: фото, часы, меню и обновления.",
        "После визита клиент получает короткое «спасибо» со ссылкой на оценку в Google. На каждый отзыв — вежливый ответ, а раз в месяц — понятный отчёт простыми словами.",
      ],
      systemsBuilt: [
        "Контент-план для Instagram на месяц",
        "Настройка и ведение Google Business Profile",
        "Автоматические просьбы об отзывах",
        "Ответы на отзывы",
        "Отчёт за месяц",
      ],
      features: [
        { title: "Посты каждую неделю", text: "12–16 публикаций в месяц, которые вы одобряете заранее." },
        { title: "Видно в Google", text: "Верный адрес, часы, фото и регулярные обновления." },
        { title: "Больше отзывов", text: "Ссылка на отзыв после визита — автоматически." },
        { title: "Простой отчёт", text: "Просмотры, звонки и маршруты — раз в месяц." },
      ],
      services: ["Контент-план и публикации", "Профиль Google", "Просьбы об отзывах и ответы", "Отчёт за месяц"],
      results: [
        "Instagram активен каждую неделю",
        "Больше отзывов от реальных клиентов",
        "Верная информация на Google Картах",
        "Понятно, как вас находят",
      ],
    },
  },
};
