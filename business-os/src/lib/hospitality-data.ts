/* Static configuration of the fictional property: extras, loyalty, menu, services, training, SOPs. */
import type { Dept, I18n, LoyaltyConfig, MenuCategory, MenuItem, Position, Reward, ServiceType, Sop, Table, TrainingModule } from "./types.ts";

export const PROPERTY = { id: "pine-ridge", type: "hotel_restaurant" as const, brand: "Pine Ridge Hotel & Spa", modules: ["rooms", "reservations", "restaurant", "services", "loyalty", "staff", "training", "analytics"] };

export type Extra = { id: string; name: I18n; desc: I18n; price: number; unit: "stay" | "night" | "person" };
export const EXTRAS: Extra[] = [
  { id: "transfer", name: { hy: "Տրանսֆեր օդանավակայանից", ru: "Трансфер из аэропорта", en: "Airport transfer" }, desc: { hy: "Մեքենա «Զվարթնոց»-ից, մինչև 3 հյուր", ru: "Машина из «Звартноца», до 3 гостей", en: "Car from Zvartnots, up to 3 guests" }, price: 25000, unit: "stay" },
  { id: "spa", name: { hy: "Սպա ծես երկուսի համար", ru: "Спа-ритуал для двоих", en: "Spa ritual for two" }, desc: { hy: "60 րոպե մերսում և սաունա", ru: "60 минут массажа и сауна", en: "60-minute massage and sauna" }, price: 45000, unit: "stay" },
  { id: "late", name: { hy: "Ուշ ելք մինչև 16:00", ru: "Поздний выезд до 16:00", en: "Late check-out until 16:00" }, desc: { hy: "Ըստ հասանելիության, հաստատում է ընդունարանը", ru: "По наличию, подтверждает ресепшн", en: "Subject to availability, confirmed by reception" }, price: 15000, unit: "stay" },
  { id: "romance", name: { hy: "Ռոմանտիկ ձևավորում", ru: "Романтическое оформление", en: "Romantic set-up" }, desc: { hy: "Ծաղիկներ, մոմեր, փրփրուն գինի", ru: "Цветы, свечи, игристое вино", en: "Flowers, candles, sparkling wine" }, price: 30000, unit: "stay" },
  { id: "ski", name: { hy: "Դահուկային փաթեթ", ru: "Лыжный пакет", en: "Ski pack" }, desc: { hy: "Դահուկների պահեստ և տրանսֆեր ամեն օր", ru: "Хранение лыж и ежедневный трансфер", en: "Ski storage and daily shuttle" }, price: 8000, unit: "person" },
];

export const CANCELLATION: I18n = {
  hy: "Անվճար չեղարկում՝ ժամանումից 3 օր առաջ։ Ավելի ուշ՝ առաջին գիշերվա արժեքը։ Չներկայանալու դեպքում՝ առաջին գիշերվա արժեքը։",
  ru: "Бесплатная отмена за 3 дня до заезда. Позже — стоимость первой ночи. При незаезде — стоимость первой ночи.",
  en: "Free cancellation up to 3 days before arrival. Later: the first night is charged. No-show: the first night is charged.",
};

export const LOYALTY: LoyaltyConfig = {
  programName: "Pine Ridge Circle",
  earnPer1000: 10,
  welcomeBonus: 500,
  eligible: { stays: true, orders: true },
  tiers: [
    { id: "member", name: { hy: "Անդամ", ru: "Участник", en: "Member" }, minPoints: 0, discountPct: 0, color: "#6b6963", benefits: [{ hy: "Անդամի գներ ուղիղ ամրագրման դեպքում", ru: "Цены для участников при прямом бронировании", en: "Member rates on direct bookings" }, { hy: "Միավորներ յուրաքանչյուր կեցության համար", ru: "Баллы за каждое проживание", en: "Points on every stay" }] },
    { id: "silver", name: { hy: "Արծաթ", ru: "Серебро", en: "Silver" }, minPoints: 2000, discountPct: 5, color: "#8a8f98", benefits: [{ hy: "5% զեղչ ուղիղ ամրագրման համար", ru: "Скидка 5% на прямые брони", en: "5% off direct bookings" }, { hy: "Ողջույնի խմիչք", ru: "Приветственный напиток", en: "Welcome drink" }] },
    { id: "gold", name: { hy: "Ոսկի", ru: "Золото", en: "Gold" }, minPoints: 6000, discountPct: 8, color: "#a7814c", benefits: [{ hy: "8% զեղչ ուղիղ ամրագրման համար", ru: "Скидка 8% на прямые брони", en: "8% off direct bookings" }, { hy: "Ուշ ելք մինչև 14:00 (ըստ հասանելիության)", ru: "Поздний выезд до 14:00 (по наличию)", en: "Late check-out until 14:00 (subject to availability)" }] },
    { id: "platinum", name: { hy: "Պլատին", ru: "Платина", en: "Platinum" }, minPoints: 12000, discountPct: 10, color: "#3b4a5a", benefits: [{ hy: "10% զեղչ ուղիղ ամրագրման համար", ru: "Скидка 10% на прямые брони", en: "10% off direct bookings" }, { hy: "Սենյակի բարելավում (ըստ հասանելիության)", ru: "Повышение категории (по наличию)", en: "Room upgrade (subject to availability)" }] },
    { id: "vip", name: { hy: "VIP", ru: "VIP", en: "VIP" }, minPoints: 25000, discountPct: 12, color: "#121212", benefits: [{ hy: "12% զեղչ և անձնական մենեջեր", ru: "Скидка 12% и персональный менеджер", en: "12% off and a personal host" }, { hy: "Սպա ծես յուրաքանչյուր կեցության ընթացքում", ru: "Спа-ритуал в каждое проживание", en: "Spa ritual on every stay" }] },
  ],
};

export const REWARDS: Reward[] = [
  { id: "rw-dinner", name: { hy: "10 000 ֏ զեղչ ռեստորանում", ru: "Скидка 10 000 ֏ в ресторане", en: "10,000 ֏ off at the restaurant" }, cost: 1000, kind: "amount", value: 10000, appliesTo: "order" },
  { id: "rw-stay10", name: { hy: "10% զեղչ հաջորդ կեցության համար", ru: "Скидка 10% на следующее проживание", en: "10% off your next stay" }, cost: 2500, kind: "pct", value: 10, appliesTo: "stay" },
  { id: "rw-night", name: { hy: "25 000 ֏ զեղչ կեցության համար", ru: "Скидка 25 000 ֏ на проживание", en: "25,000 ֏ off a stay" }, cost: 2200, kind: "amount", value: 25000, appliesTo: "stay", minTier: "silver" },
  { id: "rw-vip", name: { hy: "20% զեղչ կեցության համար (Ոսկի+)", ru: "Скидка 20% на проживание (Золото+)", en: "20% off a stay (Gold+)" }, cost: 5000, kind: "pct", value: 20, appliesTo: "stay", minTier: "gold" },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "starters", name: { hy: "Նախուտեստներ", ru: "Закуски", en: "Starters" } },
  { id: "mains", name: { hy: "Հիմնական ուտեստներ", ru: "Основные блюда", en: "Mains" } },
  { id: "grill", name: { hy: "Խորոված", ru: "Гриль", en: "From the grill" } },
  { id: "desserts", name: { hy: "Աղանդեր", ru: "Десерты", en: "Desserts" } },
  { id: "drinks", name: { hy: "Ըմպելիքներ", ru: "Напитки", en: "Drinks" } },
];

const opt = (id: string, hy: string, ru: string, en: string, price: number) => ({ id, name: { hy, ru, en }, price });
const item = (id: string, categoryId: string, name: I18n, desc: I18n, price: number, photo: string, allergens: string[], tags: string[], prepMin: number, options: MenuItem["options"] = []): MenuItem =>
  ({ id, categoryId, name, desc, price, photo: `/img/food/${photo}.jpg`, allergens, tags, options, available: true, prepMin });

export const MENU_ITEMS: MenuItem[] = [
  item("salad", "starters", { hy: "Այգու աղցան", ru: "Садовый салат", en: "Garden salad" }, { hy: "Թարմ բանջարեղեն, ձիթապտղի յուղ, կիտրոն", ru: "Свежие овощи, оливковое масло, лимон", en: "Fresh vegetables, olive oil, lemon" }, 3800, "salad", [], ["vegan"], 8, [opt("feta", "Ֆետա", "Фета", "Feta", 900)]),
  item("poke", "starters", { hy: "Սաղմոնով բոուլ", ru: "Боул с лососем", en: "Salmon bowl" }, { hy: "Բրինձ, սաղմոն, ավոկադո, քնջութ", ru: "Рис, лосось, авокадо, кунжут", en: "Rice, salmon, avocado, sesame" }, 6200, "poke", ["fish", "sesame", "soy"], [], 12),
  item("meatballs", "starters", { hy: "Տնական քյուֆթա", ru: "Домашние кюфта", en: "House meatballs" }, { hy: "Տավարի միս, համեմունքներ, մածունով սոուս", ru: "Говядина, специи, соус из мацуна", en: "Beef, spices, matsun sauce" }, 4900, "meatballs", ["milk", "gluten"], [], 15),
  item("salmon", "mains", { hy: "Սաղմոն թխած", ru: "Запечённый лосось", en: "Baked salmon" }, { hy: "Կանաչ ծնեբեկ, կարագով կիտրոնային սոուս", ru: "Спаржа, лимонно-сливочный соус", en: "Asparagus, lemon butter sauce" }, 9800, "salmon", ["fish", "milk"], [], 20),
  item("penne", "mains", { hy: "Պեննե արաբյատա", ru: "Пенне арраббьята", en: "Penne arrabbiata" }, { hy: "Լոլիկի կծու սոուս, պարմեզան", ru: "Острый томатный соус, пармезан", en: "Spicy tomato sauce, parmesan" }, 5600, "penne", ["gluten", "milk"], ["vegetarian"], 14, [opt("chicken", "Հավի միս", "Курица", "Chicken", 1500)]),
  item("burger", "mains", { hy: "Pine Ridge բուրգեր", ru: "Бургер Pine Ridge", en: "Pine Ridge burger" }, { hy: "Տավարի միս, չեդդեր, տնական սոուս, կարտոֆիլ", ru: "Говядина, чеддер, домашний соус, картофель", en: "Beef, cheddar, house sauce, fries" }, 6900, "burger", ["gluten", "milk", "egg"], [], 16, [opt("bacon", "Բեկոն", "Бекон", "Bacon", 1200), opt("extra-cheese", "Լրացուցիչ պանիր", "Доп. сыр", "Extra cheese", 800)]),
  item("pasta-salad", "mains", { hy: "Պաստա բանջարեղենով", ru: "Паста с овощами", en: "Vegetable pasta" }, { hy: "Ֆարֆալե, լոլիկ, ռեհան", ru: "Фарфалле, томаты, базилик", en: "Farfalle, tomato, basil" }, 5200, "pasta-salad", ["gluten"], ["vegan"], 12),
  item("skewers", "grill", { hy: "Խորոված խառը", ru: "Хоровац ассорти", en: "Mixed khorovats" }, { hy: "Խոզի և հավի միս, բանջարեղեն, լավաշ", ru: "Свинина и курица, овощи, лаваш", en: "Pork and chicken, vegetables, lavash" }, 8900, "skewers", ["gluten"], ["signature"], 25),
  item("steak", "grill", { hy: "Ռիբայ սթեյք", ru: "Стейк рибай", en: "Ribeye steak" }, { hy: "300 գ, կարտոֆիլ ֆրի, պղպեղի սոուս", ru: "300 г, картофель фри, перечный соус", en: "300 g, fries, pepper sauce" }, 16500, "steak", ["milk"], ["signature"], 25, [opt("medium", "Միջին եփվածություն", "Medium", "Medium", 0), opt("well", "Լավ եփված", "Well done", "Well done", 0)]),
  item("ribs", "grill", { hy: "Խոզի կողեր BBQ", ru: "Свиные рёбра BBQ", en: "BBQ pork ribs" }, { hy: "Մեղրով սոուս, թարմ բանջարեղեն", ru: "Медовый соус, свежие овощи", en: "Honey glaze, fresh vegetables" }, 11800, "ribs", [], [], 25),
  item("cake", "desserts", { hy: "Ազնվամորու տորթ", ru: "Малиновый торт", en: "Raspberry cake" }, { hy: "Վանիլային կրեմ, թարմ ազնվամորի", ru: "Ванильный крем, свежая малина", en: "Vanilla cream, fresh raspberries" }, 3400, "cake", ["gluten", "milk", "egg"], [], 5),
  item("panna", "desserts", { hy: "Պաննա կոտա", ru: "Панна котта", en: "Panna cotta" }, { hy: "Ելակով սոուս", ru: "Клубничный соус", en: "Strawberry coulis" }, 2900, "panna-cotta", ["milk"], ["vegetarian"], 5),
  item("sundae", "desserts", { hy: "Կարամելային պաղպաղակ", ru: "Карамельное мороженое", en: "Caramel sundae" }, { hy: "Վանիլ, աղի կարամել", ru: "Ваниль, солёная карамель", en: "Vanilla, salted caramel" }, 2600, "dessert", ["milk"], [], 4),
  item("cappuccino", "drinks", { hy: "Կապուչինո", ru: "Капучино", en: "Cappuccino" }, { hy: "Արաբիկա, թարմ կաթ", ru: "Арабика, свежее молоко", en: "Arabica, fresh milk" }, 1500, "cappuccino", ["milk"], [], 3, [opt("oat", "Վարսակի կաթ", "Овсяное молоко", "Oat milk", 300)]),
  item("wine", "drinks", { hy: "Արենի կարմիր գինի (բաժակ)", ru: "Красное вино Арени (бокал)", en: "Areni red wine (glass)" }, { hy: "Հայկական Արենի խաղողատեսակ", ru: "Армянский сорт Арени", en: "Armenian Areni grape" }, 3200, "wine", ["sulfites"], [], 2),
  item("cocktail", "drinks", { hy: "Pine Ridge կոկտեյլ", ru: "Коктейль Pine Ridge", en: "Pine Ridge cocktail" }, { hy: "Հայկական կոնյակ, ծիրան, ուրց", ru: "Армянский коньяк, абрикос, чабрец", en: "Armenian brandy, apricot, thyme" }, 4200, "cocktail", [], ["signature"], 4),
];

export const ALLERGEN_LABEL: Record<string, I18n> = {
  gluten: { hy: "Գլյուտեն", ru: "Глютен", en: "Gluten" }, milk: { hy: "Կաթ", ru: "Молоко", en: "Milk" }, egg: { hy: "Ձու", ru: "Яйцо", en: "Egg" },
  fish: { hy: "Ձուկ", ru: "Рыба", en: "Fish" }, sesame: { hy: "Քնջութ", ru: "Кунжут", en: "Sesame" }, soy: { hy: "Սոյա", ru: "Соя", en: "Soy" }, sulfites: { hy: "Սուլֆիտներ", ru: "Сульфиты", en: "Sulphites" },
};

export const TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({ id: `T${i + 1}`, label: `${i + 1}`, seats: i < 4 ? 2 : i < 10 ? 4 : 6, zone: i < 8 ? "Սրահ" : "Տեռաս" }));

export const SERVICE_META: Record<ServiceType, { dept: Dept; priority: "low" | "normal" | "high" | "urgent"; icon: string; label: I18n; staffLabel: string }> = {
  towels: { dept: "housekeeping", priority: "normal", icon: "bath", label: { hy: "Թարմ սրբիչներ", ru: "Свежие полотенца", en: "Fresh towels" }, staffLabel: "Թարմ սրբիչներ" },
  cleaning: { dept: "housekeeping", priority: "normal", icon: "broom", label: { hy: "Սենյակի մաքրում", ru: "Уборка номера", en: "Room cleaning" }, staffLabel: "Սենյակի մաքրում" },
  toiletries: { dept: "housekeeping", priority: "low", icon: "drop", label: { hy: "Հիգիենայի պարագաներ", ru: "Туалетные принадлежности", en: "Toiletries" }, staffLabel: "Հիգիենայի պարագաներ" },
  laundry: { dept: "housekeeping", priority: "low", icon: "refresh", label: { hy: "Լվացք", ru: "Прачечная", en: "Laundry" }, staffLabel: "Լվացք" },
  maintenance: { dept: "maintenance", priority: "high", icon: "wrench", label: { hy: "Տեխնիկական խնդիր", ru: "Техническая проблема", en: "Maintenance" }, staffLabel: "Տեխնիկական խնդիր" },
  issue: { dept: "reception", priority: "high", icon: "alert", label: { hy: "Հայտնել խնդիր", ru: "Сообщить о проблеме", en: "Report an issue" }, staffLabel: "Հյուրի բողոք / խնդիր" },
  wakeup: { dept: "reception", priority: "normal", icon: "clock", label: { hy: "Արթնացման զանգ", ru: "Звонок-будильник", en: "Wake-up call" }, staffLabel: "Արթնացման զանգ" },
  luggage: { dept: "reception", priority: "normal", icon: "door", label: { hy: "Ուղեբեռի օգնություն", ru: "Помощь с багажом", en: "Luggage help" }, staffLabel: "Ուղեբեռի օգնություն" },
  reception: { dept: "reception", priority: "normal", icon: "phone", label: { hy: "Կապ ընդունարանի հետ", ru: "Связаться с ресепшн", en: "Contact reception" }, staffLabel: "Հյուրը խնդրում է կապ" },
  checkout: { dept: "reception", priority: "normal", icon: "logOut", label: { hy: "Ելքի օգնություն", ru: "Помощь с выездом", en: "Check-out help" }, staffLabel: "Ելքի օգնություն" },
  spa: { dept: "spa", priority: "normal", icon: "drop", label: { hy: "Սպա ամրագրում", ru: "Запись в спа", en: "Spa booking" }, staffLabel: "Սպա հարցում" },
  other: { dept: "reception", priority: "normal", icon: "message", label: { hy: "Այլ խնդրանք", ru: "Другая просьба", en: "Other request" }, staffLabel: "Այլ խնդրանք" },
};

export const DEPT_LABEL: Record<Dept, string> = { management: "Ղեկավարություն", reception: "Ընդունարան", housekeeping: "Մաքրություն", maintenance: "Տեխնիկական", restaurant: "Ռեստորան", kitchen: "Խոհանոց", spa: "Սպա", administration: "Վարչակազմ" };
export const POSITION_LABEL: Record<Position, string> = {
  owner: "Սեփականատեր", general_manager: "Գլխավոր մենեջեր", reception_manager: "Ընդունարանի ղեկավար", receptionist: "Ադմինիստրատոր", housekeeping_manager: "Մաքրության ղեկավար",
  housekeeper: "Հավաքարար", restaurant_manager: "Ռեստորանի մենեջեր", waiter: "Մատուցող", chef: "Խոհարար", technician: "Տեխնիկ", spa_therapist: "Սպա մասնագետ",
};
export const POSITION_DEPT: Record<Position, Dept> = { owner: "management", general_manager: "management", reception_manager: "reception", receptionist: "reception", housekeeping_manager: "housekeeping", housekeeper: "housekeeping", restaurant_manager: "restaurant", waiter: "restaurant", chef: "kitchen", technician: "maintenance", spa_therapist: "spa" };

/** Staff-workspace modules each position can open (role-based access in the demo). */
export type StaffModule = "today" | "requests" | "housekeeping" | "orders" | "reservations" | "messages" | "learn" | "team";
export const PERMISSIONS: Record<Position, StaffModule[]> = {
  owner: ["today", "requests", "housekeeping", "orders", "reservations", "messages", "learn", "team"],
  general_manager: ["today", "requests", "housekeeping", "orders", "reservations", "messages", "learn", "team"],
  reception_manager: ["today", "requests", "reservations", "messages", "learn", "team"],
  receptionist: ["today", "requests", "reservations", "messages", "learn"],
  housekeeping_manager: ["today", "requests", "housekeeping", "messages", "learn", "team"],
  housekeeper: ["today", "housekeeping", "messages", "learn"],
  restaurant_manager: ["today", "requests", "orders", "messages", "learn", "team"],
  waiter: ["today", "orders", "messages", "learn"],
  chef: ["today", "orders", "messages", "learn"],
  technician: ["today", "requests", "messages", "learn"],
  spa_therapist: ["today", "requests", "messages", "learn"],
};
export const isManager = (p: Position) => PERMISSIONS[p].includes("team");

const quiz = (id: string, title: string, questions: { q: string; options: string[]; answer: number }[]) => ({ id, kind: "quiz" as const, title, questions });
export const TRAINING: TrainingModule[] = [
  {
    id: "tm-welcome", title: "Բարի գալուստ Pine Ridge", dept: "all", positions: "all", minutes: 15,
    steps: [
      { id: "w1", kind: "lesson", title: "Մեր հյուրանոցը", body: "Pine Ridge-ը 24 սենյակով և 2 շալեով 4 աստղանի հյուրանոց է Ծաղկաձորում։ Մեր խոստումն է՝ հանգիստ, ուշադրություն մանրուքներին և անմիջական պատասխան յուրաքանչյուր հյուրի։" },
      { id: "w2", kind: "lesson", title: "Ծառայության 5 սկզբունք", body: "1. Ողջունեք հյուրին 10 վայրկյանի ընթացքում։ 2. Անվանեք հյուրին անունով։ 3. Երբեք մի ասեք «չգիտեմ»՝ ասեք «կպարզեմ և կպատասխանեմ»։ 4. Յուրաքանչյուր խնդրանք գրանցեք համակարգում։ 5. Փակեք օղակը՝ տեղեկացրեք հյուրին արդյունքի մասին։" },
      { id: "w3", kind: "checklist", title: "Առաջին օրը", items: ["Ստացել եմ համազգեստը և բեյջը", "Ծանոթացել եմ իմ ղեկավարին", "Մուտք եմ գործել աշխատակցի հավելված", "Կարդացել եմ արտակարգ իրավիճակների ընթացակարգը"] },
      quiz("w4", "Ստուգում", [{ q: "Ինչ անել, եթե չգիտեք հյուրի հարցի պատասխանը", options: ["Ասել «չգիտեմ»", "Ասել «կպարզեմ և կպատասխանեմ» և գրանցել հարցը", "Ուղարկել հյուրին կայք"], answer: 1 }, { q: "Որտեղ է գրանցվում հյուրի յուրաքանչյուր խնդրանք", options: ["Թղթի վրա", "Համակարգում", "Ոչ մի տեղ"], answer: 1 }]),
    ],
  },
  {
    id: "tm-reception", title: "Ընդունարանի աշխատանք", dept: "reception", positions: ["receptionist", "reception_manager"], minutes: 40,
    steps: [
      { id: "r1", kind: "lesson", title: "Հարցումից ամրագրում", body: "Հարցումը դեռ ամրագրում չէ։ Ստուգեք ազատ սենյակը օրացույցում, ընտրեք սենյակը և սեղմեք «Հաստատել»։ Համակարգը ինքը կստեղծի մաքրության առաջադրանք և կպատրաստի հաստատման հաղորդագրությունը։" },
      { id: "r2", kind: "lesson", title: "Մուտք (check-in)", body: "Ողջունեք հյուրին, ստուգեք անձնագիրը, համոզվեք, որ սենյակը «Մաքուր» կամ «Ստուգված» է, ներկայացրեք նախաճաշի ժամը և Wi‑Fi-ը, գրանցեք ժամանումը համակարգում։" },
      { id: "r3", kind: "checklist", title: "Հերթափոխի սկիզբ", items: ["Ստուգել նոր հարցումները", "Ստուգել այսօրվա ժամանումները և մեկնումները", "Կարդալ նախորդ հերթափոխի փոխանցման նշումները", "Ստուգել չպատասխանված հարցերը AI օգնականից"] },
      quiz("r4", "Ստուգում", [{ q: "Երբ է ամրագրումը համարվում հաստատված", options: ["Երբ հյուրը ուղարկում է հարցումը", "Երբ աշխատակիցը հաստատում է համակարգում", "Երբ հյուրը ժամանում է"], answer: 1 }, { q: "Ինչ անել մուտքից առաջ", options: ["Ստուգել սենյակի մաքրության կարգավիճակը", "Ոչինչ"], answer: 0 }]),
    ],
  },
  {
    id: "tm-housekeeping", title: "Մաքրության ստանդարտներ", dept: "housekeeping", positions: ["housekeeper", "housekeeping_manager"], minutes: 35,
    steps: [
      { id: "h1", kind: "lesson", title: "Ելքից հետո մաքրում", body: "Օդափոխել սենյակը, փոխել սպիտակեղենը, մաքրել լոգասենյակը վերևից ներքև, լրացնել հիգիենայի պարագաները, ստուգել մինիբարը, նշել առաջադրանքը «Ավարտված»։ Շտապ առաջադրանքները (նույն օրը ժամանում) կատարել առաջինը։" },
      { id: "h2", kind: "lesson", title: "VIP սենյակի պատրաստում", body: "Լրացուցիչ ստուգում ղեկավարի կողմից, ողջույնի նվեր, թարմ ծաղիկներ, անհատական նամակ, սենյակի ջերմաստիճան 21–22°C։" },
      { id: "h3", kind: "checklist", title: "Սենյակի ստուգման ցուցակ", items: ["Անկողինը կատարյալ հարթ է", "Լոգասենյակում մազ կամ բիծ չկա", "Սրբիչները՝ 2 մեծ, 2 փոքր յուրաքանչյուր հյուրի համար", "Հեռակառավարման վահանակները աշխատում են", "Վարագույրները բաց են"] },
      quiz("h4", "Ստուգում", [{ q: "Որ առաջադրանքն է կատարվում առաջինը", options: ["Ամենամոտը", "Շտապ նշվածը (նույն օրը ժամանում)", "Ամենահեշտը"], answer: 1 }]),
    ],
  },
  {
    id: "tm-restaurant", title: "Պատվերների մշակում", dept: "restaurant", positions: ["waiter", "restaurant_manager", "chef"], minutes: 30,
    steps: [
      { id: "o1", kind: "lesson", title: "Պատվերի կարգավիճակներ", body: "Ուղարկված → Ընդունված → Պատրաստվում է → Պատրաստ է → (Ճանապարհին՝ սենյակ) → Ավարտված։ Պատվերը ընդունվում է միայն խոհանոցի կողմից։ Հյուրը տեսնում է յուրաքանչյուր փոփոխություն։" },
      { id: "o2", kind: "lesson", title: "Ալերգիաներ", body: "Եթե հյուրը նշել է ալերգիա, հաստատեք խոհարարի հետ մինչև պատվերն ընդունելը։ Երբեք մի ենթադրեք բաղադրությունը. օգտագործեք մենյուի ալերգենների ցուցակը։" },
      { id: "o3", kind: "checklist", title: "Սենյակային սպասարկում", items: ["Ստուգել սենյակի համարը", "Ծածկել ուտեստները", "Թակել և ներկայանալ", "Նշել «Ավարտված» հանձնելուց հետո"] },
      quiz("o4", "Ստուգում", [{ q: "Ով է ընդունում պատվերը", options: ["Հյուրը", "Խոհանոցը", "Համակարգը ավտոմատ"], answer: 1 }]),
    ],
  },
  {
    id: "tm-maintenance", title: "Տեխնիկական հայտեր", dept: "maintenance", positions: ["technician"], minutes: 20,
    steps: [
      { id: "m1", kind: "lesson", title: "Առաջնահերթություններ", body: "Շտապ՝ անվտանգություն, ջուր, ջեռուցում, էլեկտրականություն զբաղված սենյակում։ Բարձր՝ ազդում է հյուրի հարմարավետության վրա։ Սովորական և ցածր՝ պլանային։ Սենյակը վաճառքից հանեք, եթե հյուրը չի կարող օգտվել։" },
      { id: "m2", kind: "checklist", title: "Հայտի փակում", items: ["Գրանցել կատարված աշխատանքը", "Ստուգել, որ սենյակը մաքուր է թողնված", "Նշել «Լուծված»"] },
      quiz("m3", "Ստուգում", [{ q: "Ջեռուցումը չի աշխատում զբաղված սենյակում. առաջնահերթություն", options: ["Ցածր", "Շտապ"], answer: 1 }]),
    ],
  },
  {
    id: "tm-spa", title: "Սպա ծառայություն", dept: "spa", positions: ["spa_therapist"], minutes: 20,
    steps: [
      { id: "s1", kind: "lesson", title: "Գրանցում և հակացուցումներ", body: "Յուրաքանչյուր գրանցումից առաջ հարցրեք հակացուցումների մասին։ Գրանցումը հաստատեք համակարգում, որպեսզի հյուրը տեսնի կարգավիճակը։" },
      { id: "s2", kind: "checklist", title: "Սենյակի պատրաստում", items: ["Ջերմաստիճան 24°C", "Թարմ սրբիչներ և խալաթ", "Լուռ երաժշտություն"] },
    ],
  },
];

export const SOPS: Sop[] = [
  { id: "sop-checkin", dept: "reception", title: "Մուտքի (check-in) ընթացակարգ", tags: ["մուտք", "check-in", "ժամանում", "заезд"], body: ["Ողջունեք հյուրին անունով 10 վայրկյանի ընթացքում։", "Ստուգեք ամրագրումը և անձնագիրը։", "Համոզվեք, որ սենյակը «Մաքուր» կամ «Ստուգված» է։ Եթե ոչ՝ առաջարկեք խմիչք լաունջում և ստուգեք մաքրության առաջադրանքը։", "Ներկայացրեք նախաճաշի ժամը, Wi‑Fi-ը, սպայի ժամերը։", "Գրանցեք ժամանումը համակարգում («Ժամանեց»)։"] },
  { id: "sop-checkout", dept: "reception", title: "Ելքի (check-out) ընթացակարգ", tags: ["ելք", "check-out", "մեկնում", "выезд"], body: ["Ստուգեք սենյակային սպասարկման և լրացուցիչ ծառայությունների հաշիվը։", "Հարցրեք հյուրի կարծիքը։", "Գրանցեք մեկնումը. մաքրության առաջադրանքը ստեղծվում է ավտոմատ։", "Առաջարկեք տրանսֆեր և հաջորդ այցի առաջարկ (անդամներին՝ միավորների մասին)։"] },
  { id: "sop-vip", dept: "housekeeping", title: "VIP հյուրի համար սենյակի պատրաստում", tags: ["vip", "պատրաստում", "սենյակ", "նվեր"], body: ["Մաքրությունից հետո ղեկավարը ստուգում է սենյակը։", "Ողջույնի նվեր (միրգ, ջուր, անհատական նամակ)։", "Թարմ ծաղիկներ սեղանին։", "Սենյակի ջերմաստիճանը՝ 21–22°C։", "Նշեք առաջադրանքը «Ավարտված» և տեղեկացրեք ընդունարանին։"] },
  { id: "sop-cleaning", dept: "housekeeping", title: "Ելքից հետո սենյակի մաքրման ստանդարտ", tags: ["մաքրում", "սենյակ", "ստանդարտ", "уборка"], body: ["Օդափոխեք սենյակը։", "Փոխեք ամբողջ սպիտակեղենը։", "Լոգասենյակը մաքրեք վերևից ներքև։", "Լրացրեք հիգիենայի պարագաները և սրբիչները։", "Ստուգեք մինիբարը և գրանցեք օգտագործվածը։", "Նշեք առաջադրանքը «Ավարտված»։"] },
  { id: "sop-roomservice", dept: "restaurant", title: "Սենյակային սպասարկման պատվերի մշակում", tags: ["սենյակային", "room service", "պատվեր", "заказ"], body: ["Խոհանոցը ընդունում է պատվերը էկրանին («Ընդունել»)։", "Ստուգեք ալերգիաների նշումները։", "Պատրաստ լինելուց հետո մատուցողը նշում է «Ճանապարհին»։", "Հանձնելուց հետո նշեք «Ավարտված». հյուրը կտեսնի կարգավիճակը։", "Գումարը գրանցվում է սենյակի հաշվին և վճարվում ելքի ժամանակ։"] },
  { id: "sop-maintenance", dept: "maintenance", title: "Հյուրը հայտնում է տեխնիկական խնդիր", tags: ["խնդիր", "տեխնիկական", "նորոգում", "maintenance", "ремонт"], body: ["Ներողություն խնդրեք և գրանցեք խնդիրը համակարգում (սենյակ, նկարագրություն, առաջնահերթություն)։", "Շտապ խնդիրների դեպքում զանգահարեք տեխնիկին։", "Եթե սենյակը հնարավոր չէ օգտագործել, առաջարկեք այլ սենյակ և հանեք այն վաճառքից։", "Լուծումից հետո տեղեկացրեք հյուրին։"] },
  { id: "sop-complaint", dept: "all", title: "Հյուրի բողոքի մշակում", tags: ["բողոք", "complaint", "жалоба", "դժգոհ"], body: ["Լսեք առանց ընդհատելու։", "Ներողություն խնդրեք անհանգստության համար (առանց մեղադրելու)։", "Առաջարկեք կոնկրետ լուծում և ժամկետ։", "Գրանցեք դեպքը համակարգում և տեղեկացրեք ղեկավարին։", "Հետևեք, որ խնդիրը լուծված է, և վերադարձեք հյուրի մոտ։"] },
  { id: "sop-emergency", dept: "all", title: "Արտակարգ իրավիճակներ", tags: ["հրդեհ", "արտակարգ", "emergency", "пожар", "տարհանում"], body: ["Հրդեհի դեպքում՝ զանգահարեք 911 և սեղմեք ահազանգը։", "Տարհանեք հյուրերին նշված ելքերով, մի օգտագործեք վերելակը։", "Հավաքման վայրը՝ գլխավոր ավտոկայանատեղի։", "Ընդունարանը տպում է հյուրանոցում գտնվող հյուրերի ցուցակը։"] },
  { id: "sop-orders", dept: "kitchen", title: "Խոհանոցի էկրանի օգտագործում", tags: ["խոհանոց", "kds", "էկրան", "պատվեր"], body: ["Նոր պատվերները նարնջագույն են։ Սեղմեք «Ընդունել»՝ պատվերն ընդունելու համար։", "Սկսելիս՝ «Պատրաստել», պատրաստ լինելուն պես՝ «Պատրաստ է»։", "Ժամաչափը կարմիր է դառնում 20 րոպեից հետո։", "Եթե բաղադրիչը վերջացել է, նշեք ուտեստը «Վերջացել է» մենյուում։"] },
  { id: "sop-loyalty", dept: "all", title: "Pine Ridge Circle անդամակցության բացատրություն", tags: ["լոյալություն", "միավոր", "անդամ", "loyalty", "баллы"], body: ["Միավորները հաշվարկվում են միայն ավարտված կեցությունների և ավարտված պատվերների համար՝ 10 միավոր յուրաքանչյուր 1000 ֏-ի համար։", "Մակարդակը որոշվում է հավաքած միավորներով (Արծաթ՝ 2000, Ոսկի՝ 6000, Պլատին՝ 12 000, VIP՝ 25 000)։", "Զեղչերը կիրառվում են միայն ուղիղ ամրագրումների վրա։"] },
];
