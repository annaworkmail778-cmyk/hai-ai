/*
 * Static content of the fictional demo hotel "Pine Ridge Hotel & Spa · Tsaghkadzor".
 * All names, prices, phone numbers and policies are invented for the demo.
 * Location notes are approximate sample information.
 */
import type { I18n, KnowledgeBase, Room, RoomType, RoomTypeId, Staff, AmenityId } from "./types.ts";

export const HOTEL = {
  name: "Pine Ridge",
  fullName: "Pine Ridge Hotel & Spa",
  town: { hy: "Ծաղկաձոր", ru: "Цахкадзор", en: "Tsaghkadzor" } as I18n,
  phone: "+374 00 000 000",
  email: "stay@pineridge.demo",
  stars: 4,
};

export const ROOM_TYPES: RoomType[] = [
  {
    id: "classic",
    slug: "classic-double",
    name: { hy: "Դասական երկտեղանի", ru: "Классический двухместный", en: "Classic Double" },
    short: {
      hy: "Լուսավոր և հարմարավետ սենյակ զույգերի համար՝ անտառի տեսարանով։",
      ru: "Светлый уютный номер для пары с видом на лес.",
      en: "A bright, calm room for two with a view of the pines.",
    },
    description: {
      hy: "Մեր ամենասիրված սենյակը. մեծ անկողին, տաք փայտյա դետալներ, աշխատանքային սեղան և անձրևային ցնցուղով լոգասենյակ։ Իդեալական է հանգստյան օրերի կարճ արձակուրդի համար։",
      ru: "Наш самый популярный номер: большая кровать, тёплые деревянные детали, рабочий стол и ванная с тропическим душем. Идеально для короткого отдыха на выходных.",
      en: "Our most loved room: a large bed, warm timber details, a desk and a bathroom with a rain shower. Ideal for a short mountain weekend.",
    },
    capacity: { adults: 2, children: 1 },
    sizeM2: 24,
    bed: { hy: "1 կրկնակի մահճակալ", ru: "1 двуспальная кровать", en: "1 queen bed" },
    view: { hy: "Անտառ", ru: "Лес", en: "Forest" },
    baseRate: 38000,
    amenities: ["wifi", "breakfast", "rainShower", "smartTv", "coffee", "desk", "safe"],
    photos: ["/img/classic-1.jpg", "/img/classic-2.jpg", "/img/bathroom.jpg"],
  },
  {
    id: "deluxe",
    slug: "deluxe-mountain-view",
    name: { hy: "Դելյուքս՝ լեռան տեսարանով", ru: "Делюкс с видом на горы", en: "Deluxe Mountain View" },
    short: {
      hy: "Պանորամային պատուհաններ և պատշգամբ՝ Թեղենիսի լանջերին նայող։",
      ru: "Панорамные окна и балкон с видом на склоны Тегениса.",
      en: "Panoramic windows and a balcony facing the Teghenis slopes.",
    },
    description: {
      hy: "Արթնացեք ձյունածածկ լեռների տեսարանով։ Ընդարձակ սենյակ՝ պատշգամբով, բազկաթոռներով, մինիբարով և վաննայով լոգասենյակով։",
      ru: "Просыпайтесь с видом на заснеженные вершины. Просторный номер с балконом, креслами для отдыха, мини-баром и ванной комнатой с ванной.",
      en: "Wake up to snow-covered peaks. A spacious room with a balcony, lounge chairs, minibar and a bathroom with a bathtub.",
    },
    capacity: { adults: 2, children: 1 },
    sizeM2: 32,
    bed: { hy: "1 մեծ կրկնակի մահճակալ", ru: "1 кровать king-size", en: "1 king bed" },
    view: { hy: "Լեռներ", ru: "Горы", en: "Mountains" },
    baseRate: 52000,
    amenities: ["wifi", "breakfast", "mountainView", "balcony", "bathtub", "smartTv", "minibar", "coffee", "safe"],
    photos: ["/img/deluxe-1.jpg", "/img/deluxe-2.jpg", "/img/bathroom.jpg"],
  },
  {
    id: "junior",
    slug: "junior-suite",
    name: { hy: "Ջունիոր սյուիտ", ru: "Джуниор сюит", en: "Junior Suite" },
    short: {
      hy: "Ննջասենյակ և հյուրասենյակի անկյուն՝ վառարանով։",
      ru: "Спальня и гостиная зона с камином.",
      en: "A bedroom with a lounge corner and a fireplace.",
    },
    description: {
      hy: "Հանգիստ սյուիտ երկար հանգստի համար. դեկորատիվ վառարան, բազմոց, լեռների տեսարան և լոգասենյակ՝ վաննայով և առանձին ցնցուղով։",
      ru: "Спокойный сюит для долгого отдыха: декоративный камин, диван, вид на горы и ванная с ванной и отдельным душем.",
      en: "A quiet suite for longer stays: a decorative fireplace, sofa, mountain view and a bathroom with a tub and a separate shower.",
    },
    capacity: { adults: 2, children: 2 },
    sizeM2: 42,
    bed: { hy: "1 մեծ կրկնակի մահճակալ + բազմոց", ru: "Кровать king-size + диван", en: "1 king bed + sofa bed" },
    view: { hy: "Լեռներ", ru: "Горы", en: "Mountains" },
    baseRate: 72000,
    amenities: ["wifi", "breakfast", "mountainView", "fireplace", "bathtub", "rainShower", "smartTv", "minibar", "coffee", "safe"],
    photos: ["/img/junior-1.jpg", "/img/junior-2.jpg", "/img/bathroom.jpg"],
  },
  {
    id: "family",
    slug: "family-suite",
    name: { hy: "Ընտանեկան սյուիտ", ru: "Семейный сюит", en: "Family Suite" },
    short: {
      hy: "Երկու սենյակ, մինչև 4 հյուր՝ ընտանիքների համար։",
      ru: "Две комнаты, до 4 гостей — для семей.",
      en: "Two rooms for up to four guests, made for families.",
    },
    description: {
      hy: "Առանձին ննջասենյակ ծնողների համար և հյուրասենյակ՝ երեխաների համար ծալովի բազմոցով։ Մանկական մահճակալ՝ ըստ պահանջի, անվճար։",
      ru: "Отдельная спальня для родителей и гостиная с раскладным диваном для детей. Детская кроватка по запросу бесплатно.",
      en: "A separate bedroom for parents and a living room with a sofa bed for children. A baby cot is free on request.",
    },
    capacity: { adults: 4, children: 0 },
    sizeM2: 48,
    bed: { hy: "1 կրկնակի մահճակալ + ծալովի բազմոց", ru: "Двуспальная кровать + диван", en: "1 queen bed + sofa bed" },
    view: { hy: "Անտառ և լեռներ", ru: "Лес и горы", en: "Forest & mountains" },
    baseRate: 86000,
    amenities: ["wifi", "breakfast", "mountainView", "smartTv", "kitchenette", "coffee", "babyCot", "safe"],
    photos: ["/img/family-1.jpg", "/img/family-2.jpg", "/img/bathroom.jpg"],
  },
  {
    id: "chalet",
    slug: "chalet-cottage",
    name: { hy: "Շալե տնակ", ru: "Шале-коттедж", en: "Chalet Cottage" },
    short: {
      hy: "Առանձին փայտե տնակ անտառում՝ տեռասով և սաունայով։",
      ru: "Отдельный деревянный коттедж в лесу с террасой и сауной.",
      en: "A private timber cottage in the pines with a terrace and sauna.",
    },
    description: {
      hy: "Լիակատար առանձնություն. երկու ննջասենյակ, իսկական վառարան, մասնավոր սաունա և տեռաս անտառի եզրին։ Մինչև 5 հյուր։",
      ru: "Полное уединение: две спальни, настоящий камин, личная сауна и терраса на краю леса. До 5 гостей.",
      en: "Total privacy: two bedrooms, a real fireplace, a private sauna and a terrace at the edge of the forest. Up to five guests.",
    },
    capacity: { adults: 4, children: 1 },
    sizeM2: 75,
    bed: { hy: "2 ննջասենյակ", ru: "2 спальни", en: "2 bedrooms" },
    view: { hy: "Անտառ", ru: "Лес", en: "Forest" },
    baseRate: 125000,
    amenities: ["wifi", "breakfast", "fireplace", "terrace", "sauna", "kitchenette", "smartTv", "coffee"],
    photos: ["/img/chalet-1.jpg", "/img/chalet-2.jpg", "/img/junior-2.jpg"],
  },
];

export const roomType = (id: RoomTypeId) => ROOM_TYPES.find((t) => t.id === id)!;

export const ROOMS: Room[] = [
  ...["101", "102", "103", "104", "201", "202", "203", "204"].map((n) => ({ id: n, number: n, floor: +n[0], typeId: "classic" as const })),
  ...["105", "106", "107", "205", "206", "207"].map((n) => ({ id: n, number: n, floor: +n[0], typeId: "deluxe" as const })),
  ...["301", "302", "303", "304"].map((n) => ({ id: n, number: n, floor: 3, typeId: "junior" as const })),
  ...["108", "208", "305", "306"].map((n) => ({ id: n, number: n, floor: +n[0], typeId: "family" as const })),
  { id: "C1", number: "C1", floor: 0, typeId: "chalet" as const },
  { id: "C2", number: "C2", floor: 0, typeId: "chalet" as const },
];

export const STAFF: Staff[] = [
  { id: "s-narek", name: "Նարեկ Հովհաննիսյան", role: "manager", initials: "ՆՀ", phone: "+374 00 000 101", shift: "09:00–18:00" },
  { id: "s-gohar", name: "Գոհար Սարգսյան", role: "reception", initials: "ԳՍ", phone: "+374 00 000 102", shift: "08:00–16:00" },
  { id: "s-davit", name: "Դավիթ Պետրոսյան", role: "reception", initials: "ԴՊ", phone: "+374 00 000 103", shift: "14:00–22:00" },
  { id: "s-anahit", name: "Անահիտ Գրիգորյան", role: "housekeeping", initials: "ԱԳ", phone: "+374 00 000 104", shift: "08:00–16:00" },
  { id: "s-lilit", name: "Լիլիթ Ավետիսյան", role: "housekeeping", initials: "ԼԱ", phone: "+374 00 000 105", shift: "08:00–16:00" },
  { id: "s-mariam", name: "Մարիամ Հակոբյան", role: "housekeeping", initials: "ՄՀ", phone: "+374 00 000 106", shift: "10:00–18:00" },
  { id: "s-armen", name: "Արմեն Ղազարյան", role: "maintenance", initials: "ԱՂ", phone: "+374 00 000 107", shift: "09:00–18:00" },
];

export const DEFAULT_KB: KnowledgeBase = {
  checkIn: "14:00",
  checkOut: "12:00",
  breakfast: "07:30–10:30",
  breakfastIncluded: true,
  parking: "free",
  pets: "allowed_small",
  petFee: 10000,
  wifi: true,
  receptionHours: "08:00–22:00",
  airportTransfer: 25000,
  skiShuttle: true,
  spaHours: "10:00–21:00",
  cancellation: "3",
};

export const AMENITY_LABEL: Record<AmenityId, I18n> = {
  wifi: { hy: "Անվճար Wi‑Fi", ru: "Бесплатный Wi‑Fi", en: "Free Wi‑Fi" },
  breakfast: { hy: "Նախաճաշ ներառված", ru: "Завтрак включён", en: "Breakfast included" },
  mountainView: { hy: "Լեռների տեսարան", ru: "Вид на горы", en: "Mountain view" },
  balcony: { hy: "Պատշգամբ", ru: "Балкон", en: "Balcony" },
  fireplace: { hy: "Վառարան", ru: "Камин", en: "Fireplace" },
  bathtub: { hy: "Վաննա", ru: "Ванна", en: "Bathtub" },
  rainShower: { hy: "Անձրևային ցնցուղ", ru: "Тропический душ", en: "Rain shower" },
  smartTv: { hy: "Smart TV", ru: "Smart TV", en: "Smart TV" },
  minibar: { hy: "Մինիբար", ru: "Мини-бар", en: "Minibar" },
  coffee: { hy: "Սուրճ և թեյ", ru: "Кофе и чай", en: "Coffee & tea" },
  desk: { hy: "Աշխատանքային սեղան", ru: "Рабочий стол", en: "Work desk" },
  kitchenette: { hy: "Փոքր խոհանոց", ru: "Мини-кухня", en: "Kitchenette" },
  terrace: { hy: "Տեռաս", ru: "Терраса", en: "Terrace" },
  safe: { hy: "Սեյֆ", ru: "Сейф", en: "Safe" },
  babyCot: { hy: "Մանկական մահճակալ", ru: "Детская кроватка", en: "Baby cot" },
  sauna: { hy: "Մասնավոր սաունա", ru: "Личная сауна", en: "Private sauna" },
};

export type Offer = { id: string; photo: string; title: I18n; text: I18n; priceFrom: number; unit: I18n; valid: I18n };

export const OFFERS: Offer[] = [
  {
    id: "ski-weekend",
    photo: "/img/ski.jpg",
    title: { hy: "Դահուկային հանգստյան օրեր", ru: "Горнолыжные выходные", en: "Ski Weekend" },
    text: {
      hy: "2 գիշեր Դելյուքս սենյակում, նախաճաշ, անվճար տրանսֆեր դեպի ճոպանուղի և ուշ դուրսգրում մինչև 14:00։",
      ru: "2 ночи в номере Делюкс, завтрак, бесплатный трансфер к канатной дороге и поздний выезд до 14:00.",
      en: "Two nights in a Deluxe room, breakfast, a free shuttle to the ropeway and late check-out until 14:00.",
    },
    priceFrom: 119000,
    unit: { hy: "2 գիշերվա համար", ru: "за 2 ночи", en: "for 2 nights" },
    valid: { hy: "Ուրբաթ–կիրակի, մինչև մարտի 15", ru: "Пятница–воскресенье, до 15 марта", en: "Fri–Sun, until 15 March" },
  },
  {
    id: "new-year",
    photo: "/img/winter-forest.jpg",
    title: { hy: "Ամանոր լեռներում", ru: "Новый год в горах", en: "New Year in the Mountains" },
    text: {
      hy: "3 գիշեր (դեկտեմբերի 30 – հունվարի 2), տոնական ընթրիք, մանկական ծրագիր և սպա մուտք։",
      ru: "3 ночи (30 декабря – 2 января), праздничный ужин, детская программа и доступ в спа.",
      en: "Three nights (30 Dec – 2 Jan), a festive dinner, a kids' programme and spa access.",
    },
    priceFrom: 245000,
    unit: { hy: "2 հյուրի համար", ru: "на двоих", en: "for two guests" },
    valid: { hy: "Սահմանափակ թվով սենյակներ", ru: "Ограниченное число номеров", en: "Limited rooms" },
  },
  {
    id: "spa-midweek",
    photo: "/img/spa-1.jpg",
    title: { hy: "Սպա հանգիստ շաբաթվա մեջ", ru: "Спа-отдых в будни", en: "Midweek Spa Escape" },
    text: {
      hy: "Կիրակի–հինգշաբթի 2 գիշեր՝ −15%, սաունա, լողավազան և մեկ մերսում երկուսի համար։",
      ru: "2 ночи с воскресенья по четверг со скидкой 15%, сауна, бассейн и один массаж на двоих.",
      en: "Two nights Sunday–Thursday at 15% off, sauna, pool and one massage for two.",
    },
    priceFrom: 98000,
    unit: { hy: "2 գիշերվա համար", ru: "за 2 ночи", en: "for 2 nights" },
    valid: { hy: "Կիրակի–հինգշաբթի", ru: "Воскресенье–четверг", en: "Sunday–Thursday" },
  },
];

export type Facility = { id: string; photo: string; title: I18n; text: I18n };

export const FACILITIES: Facility[] = [
  {
    id: "restaurant",
    photo: "/img/restaurant.jpg",
    title: { hy: "Ռեստորան «Կեչի»", ru: "Ресторан «Кечи»", en: "Kechi Restaurant" },
    text: {
      hy: "Հայկական և եվրոպական խոհանոց, նախաճաշ՝ բուֆետ, երեկոյան՝ բուխարու մոտ։",
      ru: "Армянская и европейская кухня, завтрак-буфет, вечера у камина.",
      en: "Armenian and European cuisine, a breakfast buffet and evenings by the fire.",
    },
  },
  {
    id: "spa",
    photo: "/img/spa-2.jpg",
    title: { hy: "Սպա և սաունա", ru: "Спа и сауна", en: "Spa & sauna" },
    text: {
      hy: "Փակ լողավազան, ֆիննական սաունա, մերսումներ՝ նախնական ամրագրմամբ։",
      ru: "Крытый бассейн, финская сауна, массаж по предварительной записи.",
      en: "Indoor pool, Finnish sauna and massages by appointment.",
    },
  },
  {
    id: "ski",
    photo: "/img/ski.jpg",
    title: { hy: "Դահուկներ և ճոպանուղի", ru: "Лыжи и канатная дорога", en: "Ski & ropeway" },
    text: {
      hy: "Դահուկների պահեստ, տաքացվող կոշիկներ, անվճար տրանսֆեր դեպի ճոպանուղի։",
      ru: "Лыжехранилище, сушилка для ботинок, бесплатный трансфер к канатной дороге.",
      en: "Ski storage, boot dryers and a free shuttle to the ropeway.",
    },
  },
  {
    id: "summer",
    photo: "/img/hiking.jpg",
    title: { hy: "Ամառ և արշավներ", ru: "Лето и походы", en: "Summer & hiking" },
    text: {
      hy: "Արշավային երթուղիներ, հեծանիվներ և էքսկուրսիաներ դեպի Սևան։",
      ru: "Пешие маршруты, велосипеды и экскурсии на Севан.",
      en: "Hiking trails, bikes and day trips to Lake Sevan.",
    },
  },
];

export const ATTRACTIONS: { name: I18n; distance: I18n }[] = [
  { name: { hy: "Ծաղկաձորի ճոպանուղի", ru: "Канатная дорога Цахкадзора", en: "Tsaghkadzor ropeway" }, distance: { hy: "≈ 5 րոպե մեքենայով", ru: "≈ 5 минут на машине", en: "≈ 5 min by car" } },
  { name: { hy: "Կեչառիսի վանք", ru: "Монастырь Кечарис", en: "Kecharis Monastery" }, distance: { hy: "≈ 10 րոպե ոտքով", ru: "≈ 10 минут пешком", en: "≈ 10 min walk" } },
  { name: { hy: "Սևանա լիճ", ru: "Озеро Севан", en: "Lake Sevan" }, distance: { hy: "≈ 40 րոպե մեքենայով", ru: "≈ 40 минут на машине", en: "≈ 40 min by car" } },
  { name: { hy: "Երևան", ru: "Ереван", en: "Yerevan" }, distance: { hy: "≈ 60 կմ, մոտ 1 ժամ", ru: "≈ 60 км, около 1 часа", en: "≈ 60 km, about 1 hour" } },
  { name: { hy: "«Զվարթնոց» օդանավակայան", ru: "Аэропорт «Звартноц»", en: "Zvartnots Airport" }, distance: { hy: "≈ 1 ժամ 15 րոպե", ru: "≈ 1 час 15 минут", en: "≈ 1 h 15 min" } },
];
