import type { Project } from "../types";

/**
 * DEMO CONTENT — example project for the "Riseup Orders" product.
 * Not a client engagement; no measured results are claimed.
 */
export const instagramShopOrders: Project = {
  id: "p-instagram-shop-orders",
  slug: "instagram-shop-orders",
  status: "concept",
  featured: true,
  order: 2,
  year: 2026,
  capabilities: ["orders"],
  technologies: ["Claude / OpenAI", "Instagram API", "Telegram Bot API", "Next.js", "Supabase", "Google Sheets"],
  theme: "light",
  demo: "shop",
  coverImage: {
    kind: "composition",
    id: "ops-dashboard",
    alt: {
      en: "An order board with new, paid, on-the-way and delivered orders.",
      hy: "Պատվերների վահանակ՝ նոր, վճարված, ճանապարհին և հանձնված պատվերներով։",
      ru: "Доска заказов: новые, оплаченные, в пути и доставленные.",
    },
  },
  gallery: [],
  system: {
    nodes: [
      { id: "ig", group: "input", label: { en: "Instagram & WhatsApp chats", hy: "Instagram և WhatsApp նամակներ", ru: "Чаты Instagram и WhatsApp" } },
      { id: "catalog", group: "input", label: { en: "Products & stock", hy: "Ապրանքներ և մնացորդ", ru: "Товары и остатки" } },
      { id: "ai", group: "core", label: { en: "AI sales assistant", hy: "AI վաճառքի օգնական", ru: "AI-продавец" } },
      { id: "board", group: "core", label: { en: "Order board", hy: "Պատվերների վահանակ", ru: "Доска заказов" } },
      { id: "courier", group: "output", label: { en: "Courier in Telegram", hy: "Առաքիչ Telegram-ում", ru: "Курьер в Telegram" } },
      { id: "client", group: "output", label: { en: "Messages to customers", hy: "Հաղորդագրություններ գնորդներին", ru: "Сообщения покупателям" } },
      { id: "report", group: "output", label: { en: "Sales report", hy: "Վաճառքի հաշվետվություն", ru: "Отчёт о продажах" } },
    ],
    edges: [
      ["ig", "ai"],
      ["catalog", "ai"],
      ["ai", "board"],
      ["board", "courier"],
      ["board", "client"],
      ["board", "report"],
    ],
  },
  content: {
    en: {
      title: "Order system for an Instagram shop",
      subtitle: "Every order from the chats in one list — from the first question to delivery.",
      client: "Example — clothing shop that sells through Instagram",
      industry: "Online shops",
      projectType: "AI sales assistant · Orders · Delivery",
      shortDescription:
        "An AI assistant answers product questions in Instagram, takes the order, puts it on one board and sends the address to the courier.",
      challenge: "Orders get lost in hundreds of Instagram messages, and nobody knows what is left in stock.",
      solution: "An AI assistant that takes orders in the chat and one board for every order and delivery.",
      context:
        "Many shops in Armenia sell only through Instagram. All day the owner answers “Is it available? How much?” and writes orders in a notebook.",
      challengeDetail: [
        "Orders are mixed with other messages, so some are forgotten or delivered late.",
        "Stock is counted by hand, and the courier gets addresses through calls and screenshots.",
      ],
      research: [
        "Most questions are about price, size, colour and delivery.",
        "Customers who wait long for an answer often don't come back.",
        "The owner can't see how many orders came in today.",
        "Couriers lose time calling for addresses.",
      ],
      solutionDetail: [
        "The AI assistant knows your products, prices, sizes and stock. It answers questions, collects the name, phone and address and confirms the order.",
        "Every order lands on one board with a clear status: new, paid, on the way, delivered. The courier gets the address in Telegram, the customer gets a message, and you see your day in numbers.",
      ],
      systemsBuilt: [
        "AI answers about products, prices and stock",
        "Orders taken in Instagram and WhatsApp",
        "Order board with statuses",
        "Courier messages in Telegram",
        "Stock count and daily sales report",
      ],
      features: [
        { title: "Answers about products", text: "Price, size, colour and delivery — right away, at any hour." },
        { title: "Takes the order", text: "Name, phone and address are collected in the chat." },
        { title: "One board", text: "Every order and its status in one place — nothing lost." },
        { title: "Courier and customer informed", text: "Addresses go to the courier, updates go to the customer." },
      ],
      services: ["AI assistant setup", "Order board", "Telegram for the courier", "Monthly support"],
      results: [
        "No more lost orders",
        "Faster answers to customers",
        "Stock always up to date",
        "A clear view of daily sales",
      ],
    },
    hy: {
      title: "Պատվերների համակարգ Instagram խանութի համար",
      subtitle: "Չատերի բոլոր պատվերները մեկ ցուցակում՝ առաջին հարցից մինչև առաքում։",
      client: "Օրինակ՝ հագուստի խանութ, որը վաճառում է Instagram-ով",
      industry: "Առցանց խանութներ",
      projectType: "AI վաճառքի օգնական · Պատվերներ · Առաքում",
      shortDescription:
        "AI օգնականը Instagram-ում պատասխանում է ապրանքների մասին հարցերին, ընդունում է պատվերը, դնում այն մեկ վահանակում և հասցեն ուղարկում առաքիչին։",
      challenge: "Պատվերները կորչում են Instagram-ի հարյուրավոր նամակներում, և ոչ ոք չգիտի, թե պահեստում ինչ է մնացել։",
      solution: "AI օգնական, որն ընդունում է պատվերները չատում, և մեկ վահանակ բոլոր պատվերների ու առաքումների համար։",
      context:
        "Հայաստանում շատ խանութներ վաճառում են միայն Instagram-ով։ Սեփականատերն ամբողջ օրը պատասխանում է «Կա՞։ Ի՞նչ արժե» հարցերին և պատվերները գրում տետրում։",
      challengeDetail: [
        "Պատվերները խառնվում են այլ նամակների հետ, և որոշները մոռացվում կամ ուշ են առաքվում։",
        "Մնացորդը հաշվվում է ձեռքով, իսկ առաքիչը հասցեները ստանում է զանգերով և սքրինշոթներով։",
      ],
      research: [
        "Հարցերի մեծ մասը գնի, չափսի, գույնի և առաքման մասին է։",
        "Գնորդները, ովքեր երկար են սպասում պատասխանի, հաճախ չեն վերադառնում։",
        "Սեփականատերը չի տեսնում, թե այսօր քանի պատվեր է եկել։",
        "Առաքիչները ժամանակ են կորցնում՝ զանգելով հասցեի համար։",
      ],
      solutionDetail: [
        "AI օգնականը գիտի ձեր ապրանքները, գները, չափսերն ու մնացորդը։ Պատասխանում է հարցերին, հավաքում անունը, հեռախոսն ու հասցեն և հաստատում պատվերը։",
        "Յուրաքանչյուր պատվեր հայտնվում է մեկ վահանակում՝ հստակ կարգավիճակով՝ նոր, վճարված, ճանապարհին, հանձնված։ Առաքիչը Telegram-ով ստանում է հասցեն, գնորդը՝ հաղորդագրություն, իսկ դուք տեսնում եք ձեր օրը թվերով։",
      ],
      systemsBuilt: [
        "AI պատասխաններ ապրանքների, գների և մնացորդի մասին",
        "Պատվերների ընդունում Instagram-ում և WhatsApp-ում",
        "Պատվերների վահանակ՝ կարգավիճակներով",
        "Հաղորդագրություններ առաքիչին Telegram-ով",
        "Մնացորդի հաշվարկ և օրվա վաճառքի հաշվետվություն",
      ],
      features: [
        { title: "Պատասխանում է ապրանքների մասին", text: "Գին, չափս, գույն և առաքում՝ անմիջապես, ցանկացած ժամի։" },
        { title: "Ընդունում է պատվերը", text: "Անունը, հեռախոսն ու հասցեն հավաքվում են չատում։" },
        { title: "Մեկ վահանակ", text: "Բոլոր պատվերներն ու դրանց կարգավիճակը մեկ տեղում՝ ոչինչ չի կորչում։" },
        { title: "Առաքիչն ու գնորդը տեղյակ են", text: "Հասցեները գնում են առաքիչին, թարմացումները՝ գնորդին։" },
      ],
      services: ["AI օգնականի կարգավորում", "Պատվերների վահանակ", "Telegram առաքիչի համար", "Ամսական սպասարկում"],
      results: [
        "Այլևս կորած պատվերներ չկան",
        "Ավելի արագ պատասխաններ գնորդներին",
        "Մնացորդը միշտ արդիական է",
        "Օրվա վաճառքի հստակ պատկեր",
      ],
    },
    ru: {
      title: "Система заказов для Instagram-магазина",
      subtitle: "Все заказы из чатов в одном списке — от первого вопроса до доставки.",
      client: "Пример — магазин одежды, который продаёт через Instagram",
      industry: "Онлайн-магазины",
      projectType: "AI-продавец · Заказы · Доставка",
      shortDescription:
        "AI-ассистент отвечает на вопросы о товарах в Instagram, принимает заказ, ставит его на одну доску и отправляет адрес курьеру.",
      challenge: "Заказы теряются в сотнях сообщений Instagram, и никто не знает, что осталось на складе.",
      solution: "AI-ассистент, который принимает заказы в чате, и одна доска для всех заказов и доставок.",
      context:
        "Многие магазины в Армении продают только через Instagram. Весь день владелец отвечает на «Есть в наличии? Сколько стоит?» и записывает заказы в тетрадь.",
      challengeDetail: [
        "Заказы смешиваются с другими сообщениями — часть забывается или доставляется с опозданием.",
        "Остатки считают вручную, а курьер получает адреса звонками и скриншотами.",
      ],
      research: [
        "Большинство вопросов — о цене, размере, цвете и доставке.",
        "Покупатели, которые долго ждут ответа, часто не возвращаются.",
        "Владелец не видит, сколько заказов пришло сегодня.",
        "Курьеры теряют время, созваниваясь ради адреса.",
      ],
      solutionDetail: [
        "AI-ассистент знает ваши товары, цены, размеры и остатки. Он отвечает на вопросы, собирает имя, телефон и адрес и подтверждает заказ.",
        "Каждый заказ попадает на одну доску с понятным статусом: новый, оплачен, в пути, доставлен. Курьер получает адрес в Telegram, покупатель — сообщение, а вы видите свой день в цифрах.",
      ],
      systemsBuilt: [
        "AI-ответы о товарах, ценах и остатках",
        "Приём заказов в Instagram и WhatsApp",
        "Доска заказов со статусами",
        "Сообщения курьеру в Telegram",
        "Учёт остатков и отчёт о продажах за день",
      ],
      features: [
        { title: "Отвечает о товарах", text: "Цена, размер, цвет и доставка — сразу и в любое время." },
        { title: "Принимает заказ", text: "Имя, телефон и адрес собираются прямо в чате." },
        { title: "Одна доска", text: "Все заказы и их статусы в одном месте — ничего не теряется." },
        { title: "Курьер и покупатель в курсе", text: "Адреса уходят курьеру, обновления — покупателю." },
      ],
      services: ["Настройка AI-ассистента", "Доска заказов", "Telegram для курьера", "Ежемесячная поддержка"],
      results: [
        "Больше никаких потерянных заказов",
        "Быстрее ответы покупателям",
        "Остатки всегда актуальны",
        "Понятная картина продаж за день",
      ],
    },
  },
};
