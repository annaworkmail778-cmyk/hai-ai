/*
 * Static configuration of the fictional demo restaurant "Summit Table".
 * Replace this file (or load it from a tenant record in production) to rebrand the demo for a pilot client.
 * Prices in AMD incl. 20% VAT. Ingredient costs in AMD per purchase unit. All data is illustrative.
 */
import type { Area, Brand, Category, Ingredient, MenuItem, ModifierGroup, Recipe, Staff, Station, Supplier, Table } from "./types.ts";

const L = (hy: string, ru: string, en: string) => ({ hy, ru, en });

export const BRAND: Brand = {
  id: "summit-table",
  name: "Summit Table",
  tagline: L("Կրակ, լավաշ և լեռնային խոտաբույսեր", "Огонь, лаваш и горные травы", "Fire, lavash and mountain herbs"),
  story: L(
    "Summit Table-ը ժամանակակից լեռնային խոհանոց է՝ հայկական կրակի ավանդույթներով։ Մենք եփում ենք բաց կրակի վրա, թխում ենք լավաշը թոնրում և ընտրում ենք սեզոնային մթերքներ տեղական ֆերմերներից։",
    "Summit Table — современная горная кухня с армянскими традициями огня. Мы готовим на открытом огне, печём лаваш в тонире и выбираем сезонные продукты у местных фермеров.",
    "Summit Table is a modern mountain kitchen rooted in Armenian fire traditions. We cook over open flame, bake lavash in the tonir and choose seasonal produce from local farmers.",
  ),
  city: L("Ծաղկաձոր", "Цахкадзор", "Tsaghkadzor"),
  address: L("Ցուցադրական հասցե, Ծաղկաձոր", "Демо-адрес, Цахкадзор", "Demo address, Tsaghkadzor"),
  phone: "+374 00 000 700",
  email: "hello@summit-table.example",
  hours: [
    { days: L("Երկ–Հնգ", "Пн–Чт", "Mon–Thu"), open: "12:00", close: "23:00" },
    { days: L("Ուրբ–Կիր", "Пт–Вс", "Fri–Sun"), open: "11:00", close: "00:00" },
  ],
  theme: "fine_dining",
  fictional: true,
};

export const STATIONS: Station[] = [
  { id: "hot", name: "Տաք խոհանոց", thresholds: { amber: 15, red: 22 } },
  { id: "grill", name: "Մանղալ", thresholds: { amber: 22, red: 30 } },
  { id: "cold", name: "Սառը խոհանոց", thresholds: { amber: 10, red: 15 } },
  { id: "pastry", name: "Աղանդեր", thresholds: { amber: 8, red: 12 } },
  { id: "bar", name: "Բար", thresholds: { amber: 6, red: 10 } },
];

export const AREAS: Area[] = [
  { id: "hall", name: L("Գլխավոր սրահ", "Главный зал", "Main hall"), open: true, w: 100, h: 64 },
  { id: "lounge", name: L("Բուխարու սրահ", "Каминный зал", "Fireplace lounge"), open: true, w: 100, h: 40 },
  { id: "private", name: L("Առանձնասենյակ", "Приватный зал", "Private room"), open: true, w: 50, h: 40 },
  { id: "bar", name: L("Բար", "Бар", "Bar"), open: true, w: 50, h: 40 },
  { id: "terrace", name: L("Տեռաս", "Терраса", "Terrace"), open: false, note: "Փակ է ձմեռային սեզոնին", w: 100, h: 36 },
];

/** Opaque QR tokens: they identify the table, never a guest. */
const TOKENS = ["k3f9", "p8d2", "w4m7", "z1q6", "c9t3", "n5r8", "h2v4", "b7x1", "s6j9", "e3u5", "y8g2", "f4k7", "m1w6", "q9d3", "r5c8", "t2z4",
  "u7n1", "a6h9", "j3p5", "g8s2", "d4e7", "x1b6", "v9y3", "l5f8", "o2m4", "i7q1", "k6t9", "w3r5", "z8c2", "p4n7", "h1j6", "b9g3", "s5u8", "e2x4", "c7v1"];

const hall: Table[] = Array.from({ length: 16 }, (_, i) => {
  const col = i % 4, row = Math.floor(i / 4);
  return { id: `T${i + 1}`, label: `${i + 1}`, areaId: "hall" as const, seats: i % 5 === 0 ? 6 : i % 3 === 0 ? 2 : 4, shape: i % 5 === 0 ? "rect" as const : "round" as const, x: 6 + col * 24, y: 5 + row * 15, w: i % 5 === 0 ? 18 : 12, h: 10, token: TOKENS[i], waiterId: i < 8 ? "s-ani" : "s-davit" };
});
const lounge: Table[] = Array.from({ length: 6 }, (_, i) => ({ id: `L${i + 1}`, label: `L${i + 1}`, areaId: "lounge" as const, seats: i < 2 ? 2 : 4, shape: "round" as const, x: 6 + i * 15.5, y: i % 2 ? 22 : 8, w: 11, h: 10, token: TOKENS[16 + i], waiterId: "s-mariam" }));
const terrace: Table[] = Array.from({ length: 8 }, (_, i) => ({ id: `E${i + 1}`, label: `E${i + 1}`, areaId: "terrace" as const, seats: 4, shape: "round" as const, x: 5 + (i % 4) * 24, y: i < 4 ? 5 : 20, w: 11, h: 10, token: TOKENS[22 + i], waiterId: "s-mariam" }));
export const TABLES: Table[] = [
  ...hall,
  ...lounge,
  { id: "P1", label: "P1", areaId: "private", seats: 14, shape: "rect", x: 8, y: 10, w: 34, h: 18, token: TOKENS[30], waiterId: "s-mariam" },
  ...["B1", "B2", "B3", "B4"].map((id, i) => ({ id, label: id, areaId: "bar" as const, seats: 2, shape: "round" as const, x: 5 + i * 11.5, y: 14, w: 8, h: 8, token: TOKENS[31 + i], waiterId: "s-davit" })),
  ...terrace,
];

export const STAFF: Staff[] = [
  { id: "s-owner", name: "Արամ Սարգսյան", initials: "ԱՍ", role: "owner" },
  { id: "s-lusine", name: "Լուսինե Հակոբյան", initials: "ԼՀ", role: "manager" },
  { id: "s-ani", name: "Անի Մարտիրոսյան", initials: "ԱՄ", role: "waiter", areaIds: ["hall"] },
  { id: "s-davit", name: "Դավիթ Պետրոսյան", initials: "ԴՊ", role: "waiter", areaIds: ["hall", "bar"] },
  { id: "s-mariam", name: "Մարիամ Ավետիսյան", initials: "ՄԱ", role: "waiter", areaIds: ["lounge", "private", "terrace"] },
  { id: "s-gor", name: "Գոռ Վարդանյան", initials: "ԳՎ", role: "chef" },
  { id: "s-hayk", name: "Հայկ Մանուկյան", initials: "ՀՄ", role: "cook", station: "grill" },
  { id: "s-narine", name: "Նարինե Գրիգորյան", initials: "ՆԳ", role: "cook", station: "hot" },
  { id: "s-sona", name: "Սոնա Խաչատրյան", initials: "ՍԽ", role: "cook", station: "cold" },
  { id: "s-tigran", name: "Տիգրան Ղազարյան", initials: "ՏՂ", role: "bartender", station: "bar" },
  { id: "s-ruzan", name: "Ռուզան Մկրտչյան", initials: "ՌՄ", role: "cashier" },
  { id: "s-vahe", name: "Վահե Սիմոնյան", initials: "ՎՍ", role: "stock" },
];

export const CATEGORIES: Category[] = [
  { id: "starters", name: L("Նախուտեստներ և աղցաններ", "Закуски и салаты", "Starters & salads") },
  { id: "grill", name: L("Կրակի վրա", "С огня", "From the fire") },
  { id: "mains", name: L("Հիմնական ուտեստներ", "Основные блюда", "Mains") },
  { id: "bakery", name: L("Թոնրից", "Из тонира", "From the tonir") },
  { id: "desserts", name: L("Աղանդեր", "Десерты", "Desserts") },
  { id: "drinks", name: L("Ըմպելիքներ", "Напитки", "Drinks") },
];

export const SUPPLIERS: Supplier[] = [
  { id: "sp-meat", name: "Արարատ Միս (ցուցադրական)", phone: "+374 00 000 801", leadDays: 1, deliveryDays: "Երկ, Չրք, Ուրբ" },
  { id: "sp-fish", name: "Սևան Ձուկ (ցուցադրական)", phone: "+374 00 000 802", leadDays: 1, deliveryDays: "Երք, Ուրբ" },
  { id: "sp-veg", name: "Կոտայքի Ֆերմա (ցուցադրական)", phone: "+374 00 000 803", leadDays: 1, deliveryDays: "Ամեն օր" },
  { id: "sp-dairy", name: "Լոռի Կաթ (ցուցադրական)", phone: "+374 00 000 804", leadDays: 2, deliveryDays: "Երկ, Հնգ" },
  { id: "sp-dry", name: "Մեծածախ Պահեստ (ցուցադրական)", phone: "+374 00 000 805", leadDays: 3, deliveryDays: "Երք" },
  { id: "sp-bev", name: "Ըմպելիքների Տուն (ցուցադրական)", phone: "+374 00 000 806", leadDays: 2, deliveryDays: "Չրք" },
];

const ing = (id: string, name: string, unit: Ingredient["unit"], purchaseUnit: string, unitsPerPurchase: number, cost: number, minLevel: number, parLevel: number, storage: Ingredient["storage"], supplierId: string, shelfDays?: number): Ingredient =>
  ({ id, name, unit, purchaseUnit, unitsPerPurchase, cost, minLevel, parLevel, storage, supplierId, shelfDays });

/** Current costs (today). Earlier costs come from the price history in the seed. */
export const INGREDIENTS: Ingredient[] = [
  ing("pork", "Խոզի վիզ", "g", "կգ", 1000, 3400, 8000, 20000, "fridge", "sp-meat", 4),
  ing("chicken", "Հավի ազդր", "g", "կգ", 1000, 2200, 6000, 15000, "fridge", "sp-meat", 3),
  ing("ribeye", "Տավարի ռիբայ", "g", "կգ", 1000, 9800, 4000, 10000, "fridge", "sp-meat", 6),
  ing("mince", "Տավարի աղացած միս", "g", "կգ", 1000, 4200, 3000, 8000, "fridge", "sp-meat", 2),
  ing("ribs", "Խոզի կողեր", "g", "կգ", 1000, 3000, 4000, 10000, "fridge", "sp-meat", 4),
  ing("bacon", "Բեկոն", "g", "կգ", 1000, 7000, 800, 2000, "fridge", "sp-meat", 10),
  ing("salmon", "Սաղմոնի ֆիլե", "g", "կգ", 1000, 10700, 2500, 6000, "fridge", "sp-fish", 3),
  ing("trout", "Իշխանի ֆիլե", "g", "կգ", 1000, 4800, 1500, 4000, "fridge", "sp-fish", 3),
  ing("potato", "Կարտոֆիլ", "g", "կգ", 1000, 300, 10000, 25000, "dry", "sp-veg", 21),
  ing("tomato", "Լոլիկ", "g", "կգ", 1000, 900, 4000, 10000, "fridge", "sp-veg", 5),
  ing("cucumber", "Վարունգ", "g", "կգ", 1000, 700, 2500, 6000, "fridge", "sp-veg", 5),
  ing("pepper", "Բիբար", "g", "կգ", 1000, 1000, 2000, 5000, "fridge", "sp-veg", 6),
  ing("eggplant", "Սմբուկ", "g", "կգ", 1000, 800, 2000, 5000, "fridge", "sp-veg", 6),
  ing("onion", "Սոխ", "g", "կգ", 1000, 300, 3000, 8000, "dry", "sp-veg", 30),
  ing("greens", "Աղցանի խառը տերևներ", "g", "կգ", 1000, 2600, 1200, 3000, "fridge", "sp-veg", 3),
  ing("herbs", "Թարմ կանաչի", "g", "կգ", 1000, 3000, 800, 2000, "fridge", "sp-veg", 4),
  ing("asparagus", "Ծնեբեկ", "g", "կգ", 1000, 6000, 800, 2500, "fridge", "sp-veg", 4),
  ing("avocado", "Ավոկադո", "pcs", "հատ", 1, 600, 10, 30, "fridge", "sp-veg", 5),
  ing("lemon", "Կիտրոն", "g", "կգ", 1000, 1200, 1000, 3000, "fridge", "sp-veg", 14),
  ing("oil", "Ձիթապտղի յուղ", "ml", "լ", 1000, 6000, 2000, 6000, "dry", "sp-dry", 365),
  ing("butter", "Կարագ", "g", "կգ", 1000, 6200, 1500, 4000, "fridge", "sp-dairy", 30),
  ing("cream", "Սերուցք 33%", "ml", "լ", 1000, 3200, 2000, 5000, "fridge", "sp-dairy", 10),
  ing("milk", "Կաթ", "ml", "լ", 1000, 600, 8000, 20000, "fridge", "sp-dairy", 6),
  ing("oatmilk", "Վարսակի կաթ", "ml", "լ", 1000, 1800, 2000, 5000, "dry", "sp-dry", 120),
  ing("cheddar", "Չեդդեր", "g", "կգ", 1000, 6500, 1000, 3000, "fridge", "sp-dairy", 40),
  ing("parmesan", "Պարմեզան", "g", "կգ", 1000, 14000, 500, 1500, "fridge", "sp-dairy", 60),
  ing("feta", "Ֆետա", "g", "կգ", 1000, 3800, 800, 2000, "fridge", "sp-dairy", 20),
  ing("matsun", "Մածուն", "g", "կգ", 1000, 900, 2000, 5000, "fridge", "sp-dairy", 7),
  ing("egg", "Ձու", "pcs", "հատ", 1, 70, 60, 180, "fridge", "sp-dairy", 20),
  ing("flour", "Ալյուր", "g", "կգ", 1000, 400, 10000, 25000, "dry", "sp-dry", 180),
  ing("penne", "Պեննե", "g", "կգ", 1000, 1400, 3000, 8000, "dry", "sp-dry", 365),
  ing("farfalle", "Ֆարֆալե", "g", "կգ", 1000, 1500, 2000, 5000, "dry", "sp-dry", 365),
  ing("rice", "Բրինձ", "g", "կգ", 1000, 1100, 3000, 8000, "dry", "sp-dry", 365),
  ing("sesame", "Քնջութ", "g", "կգ", 1000, 3000, 300, 1000, "dry", "sp-dry", 180),
  ing("raspberry", "Ազնվամորի (սառեցված)", "g", "կգ", 1000, 5000, 1000, 3000, "freezer", "sp-veg", 180),
  ing("sugar", "Շաքարավազ", "g", "կգ", 1000, 500, 3000, 8000, "dry", "sp-dry", 365),
  ing("gelatin", "Ժելատին", "g", "կգ", 1000, 20000, 100, 300, "dry", "sp-dry", 365),
  ing("icecream", "Վանիլային պաղպաղակ", "g", "կգ", 1000, 4000, 2000, 5000, "freezer", "sp-dairy", 90),
  ing("caramel", "Աղի կարամել", "g", "կգ", 1000, 4500, 500, 1500, "dry", "sp-dry", 90),
  ing("coffee", "Սուրճ (հատիկ)", "g", "կգ", 1000, 12000, 1500, 4000, "dry", "sp-bev", 120),
  ing("wine", "Արենի կարմիր գինի", "ml", "շիշ 0.75լ", 750, 5500, 6000, 15000, "bar", "sp-bev", 365),
  ing("brandy", "Հայկական կոնյակ", "ml", "շիշ 0.7լ", 700, 9000, 2100, 5600, "bar", "sp-bev", 365),
  ing("apricot", "Ծիրանի պյուրե", "g", "կգ", 1000, 3000, 800, 2000, "fridge", "sp-veg", 10),
  ing("bun", "Բուրգերի բուլկի", "pcs", "հատ", 1, 150, 30, 80, "dry", "sp-dry", 4),
  ing("bbq", "BBQ մեղրային սոուս", "g", "կգ", 1000, 3500, 1000, 3000, "fridge", "sp-dry", 60),
  ing("lavash", "Լավաշ", "pcs", "հատ", 1, 120, 40, 120, "dry", "sp-dry", 3),
  ing("water", "Հանքային ջուր 0.5լ", "pcs", "շիշ", 1, 250, 48, 120, "bar", "sp-bev", 365),
  ing("tea", "Լեռնային թեյի խառնուրդ", "g", "կգ", 1000, 15000, 300, 800, "dry", "sp-bev", 365),
];

const opt = (id: string, name: [string, string, string], price: number, recipe?: Recipe["lines"]) => ({ id, name: L(...name), price, recipe });
const group = (id: string, name: [string, string, string], min: number, max: number, options: ModifierGroup["options"]): ModifierGroup => ({ id, name: L(...name), min, max, options });
const line = (ingredientId: string, qty: number, yieldPct = 1) => ({ ingredientId, qty, yieldPct });

type ItemDef = Omit<MenuItem, "available" | "soldOutAt" | "name" | "desc" | "ingredientsText"> & { n: [string, string, string]; d: [string, string, string]; i: [string, string, string] };
const item = (x: ItemDef): MenuItem => {
  const { n, d, i, ...rest } = x;
  return { ...rest, name: L(...n), desc: L(...d), ingredientsText: L(...i), available: true };
};

export const MENU: MenuItem[] = [
  item({ id: "salad", categoryId: "starters", n: ["Այգու աղցան", "Садовый салат", "Garden salad"], d: ["Թարմ բանջարեղեն, կանաչի, կիտրոնային սոուս", "Свежие овощи, зелень, лимонная заправка", "Fresh vegetables, herbs, lemon dressing"], i: ["Լոլիկ, վարունգ, բիբար, աղցանի տերևներ, կանաչի, ձիթապտղի յուղ, կիտրոն", "Томаты, огурцы, перец, листья салата, зелень, оливковое масло, лимон", "Tomato, cucumber, pepper, salad leaves, herbs, olive oil, lemon"], photo: "/img/food/salad.jpg", price: 3800, station: "cold", prepMin: 7, allergens: [], allergensVerified: true, dietary: ["vegan"], tags: [], weight: 9,
    groups: [group("salad-add", ["Հավելում", "Добавить", "Add"], 0, 2, [opt("feta", ["Ֆետա", "Фета", "Feta"], 900, [line("feta", 50)]), opt("avocado", ["Ավոկադո", "Авокадо", "Avocado"], 1200, [line("avocado", 0.5)])])] }),
  item({ id: "trout-bowl", categoryId: "starters", n: ["Իշխանով բոուլ", "Боул с форелью", "Trout bowl"], d: ["Սևանի իշխան, բրինձ, ավոկադո, քնջութ", "Севанская форель, рис, авокадо, кунжут", "Sevan trout, rice, avocado, sesame"], i: ["Իշխան, բրինձ, ավոկադո, վարունգ, քնջութ", "Форель, рис, авокадо, огурец, кунжут", "Trout, rice, avocado, cucumber, sesame"], photo: "/img/food/poke.jpg", price: 5900, station: "cold", prepMin: 10, allergens: ["fish", "sesame"], allergensVerified: true, dietary: [], tags: ["new"], weight: 3, groups: [] }),
  item({ id: "kufta", categoryId: "starters", n: ["Տնական քյուֆթա", "Домашние кюфта", "House kufta"], d: ["Տավարի միս, համեմունքներ, մածունի սոուս", "Говядина, специи, соус из мацуна", "Beef, spices, matsun sauce"], i: ["Տավարի աղացած միս, սոխ, ձու, ալյուր, մածուն, կանաչի", "Говяжий фарш, лук, яйцо, мука, мацун, зелень", "Beef mince, onion, egg, flour, matsun, herbs"], photo: "/img/food/meatballs.jpg", price: 4900, station: "hot", prepMin: 14, allergens: ["milk", "gluten", "egg"], allergensVerified: true, dietary: [], tags: [], weight: 6, groups: [] }),
  item({ id: "veg-bowl", categoryId: "starters", n: ["Խորոված բանջարեղեն", "Овощи на углях", "Fire-roasted vegetables"], d: ["Սմբուկ, բիբար, լոլիկ, ձիթապտղի յուղ, կանաչի", "Баклажан, перец, томаты, оливковое масло, зелень", "Eggplant, pepper, tomato, olive oil, herbs"], i: ["Սմբուկ, բիբար, լոլիկ, սոխ, ձիթապտղի յուղ, կանաչի", "Баклажан, перец, томаты, лук, оливковое масло, зелень", "Eggplant, pepper, tomato, onion, olive oil, herbs"], photo: "/img/food/veggie-bowl.jpg", price: 4200, station: "grill", prepMin: 12, allergens: [], allergensVerified: true, dietary: ["vegan"], tags: [], weight: 4, groups: [] }),
  item({ id: "khorovats", categoryId: "grill", n: ["Խառը խորոված", "Хоровац ассорти", "Mixed khorovats"], d: ["Խոզի վիզ և հավ բաց կրակի վրա, խորոված բանջարեղեն, լավաշ", "Свиная шея и курица на открытом огне, овощи, лаваш", "Pork neck and chicken over open fire, roasted vegetables, lavash"], i: ["Խոզի վիզ, հավի ազդր, լոլիկ, բիբար, սմբուկ, սոխ, լավաշ, կանաչի", "Свиная шея, куриное бедро, томат, перец, баклажан, лук, лаваш, зелень", "Pork neck, chicken thigh, tomato, pepper, eggplant, onion, lavash, herbs"], photo: "/img/food/skewers.jpg", price: 8900, station: "grill", prepMin: 22, allergens: ["gluten"], allergensVerified: true, dietary: [], tags: ["signature"], weight: 12,
    groups: [group("kh-size", ["Բաժին", "Порция", "Portion"], 0, 1, [opt("large", ["Մեծ բաժին (2 հոգու)", "Большая порция (на двоих)", "Large portion (for two)"], 6900, [line("pork", 180, 0.72), line("chicken", 150, 0.75), line("lavash", 1)])]),
      group("kh-extra", ["Առանց", "Без", "Without"], 0, 2, [opt("no-onion", ["Առանց սոխի", "Без лука", "No onion"], 0), opt("no-pepper", ["Առանց բիբարի", "Без перца", "No pepper"], 0)])] }),
  item({ id: "ribeye", categoryId: "grill", n: ["Ռիբայ սթեյք 300 գ", "Стейк рибай 300 г", "Ribeye steak 300 g"], d: ["Տավարի ռիբայ, թխած կարտոֆիլ, պղպեղի սոուս", "Рибай, запечённый картофель, перечный соус", "Ribeye, roasted potatoes, pepper sauce"], i: ["Տավարի ռիբայ, կարտոֆիլ, կարագ, սերուցք, սև պղպեղ", "Рибай, картофель, сливочное масло, сливки, чёрный перец", "Ribeye, potatoes, butter, cream, black pepper"], photo: "/img/food/steak.jpg", price: 16500, station: "grill", prepMin: 24, allergens: ["milk"], allergensVerified: true, dietary: [], tags: ["signature", "chef"], weight: 5,
    groups: [group("doneness", ["Եփվածություն", "Прожарка", "Doneness"], 1, 1, [opt("rare", ["Թույլ", "С кровью", "Rare"], 0), opt("medium", ["Միջին", "Средняя", "Medium"], 0), opt("well", ["Լավ եփված", "Полная", "Well done"], 0)])] }),
  item({ id: "ribs", categoryId: "grill", n: ["Խոզի կողեր BBQ", "Свиные рёбра BBQ", "BBQ pork ribs"], d: ["Մեղրային BBQ սոուս, թարմ բանջարեղեն", "Медовый соус BBQ, свежие овощи", "Honey BBQ glaze, fresh vegetables"], i: ["Խոզի կողեր, BBQ սոուս, լոլիկ, վարունգ", "Свиные рёбра, соус BBQ, томат, огурец", "Pork ribs, BBQ sauce, tomato, cucumber"], photo: "/img/food/ribs.jpg", price: 11800, station: "grill", prepMin: 25, allergens: ["soy"], allergensVerified: true, dietary: [], tags: ["chef"], weight: 3, groups: [] }),
  item({ id: "salmon", categoryId: "mains", n: ["Սաղմոն ծնեբեկով", "Лосось со спаржей", "Salmon & asparagus"], d: ["Թխած սաղմոն, ծնեբեկ, կարագով կիտրոնային սոուս", "Запечённый лосось, спаржа, лимонно-сливочный соус", "Baked salmon, asparagus, lemon butter"], i: ["Սաղմոն, ծնեբեկ, կարագ, կիտրոն", "Лосось, спаржа, сливочное масло, лимон", "Salmon, asparagus, butter, lemon"], photo: "/img/food/salmon.jpg", price: 9800, station: "hot", prepMin: 18, allergens: ["fish", "milk"], allergensVerified: true, dietary: [], tags: [], weight: 6, groups: [] }),
  item({ id: "penne", categoryId: "mains", n: ["Պեննե արաբյատա", "Пенне арраббьята", "Penne arrabbiata"], d: ["Կծու լոլիկի սոուս, պարմեզան", "Острый томатный соус, пармезан", "Spicy tomato sauce, parmesan"], i: ["Պեննե, լոլիկ, ձիթապտղի յուղ, պարմեզան, կծու պղպեղ", "Пенне, томаты, оливковое масло, пармезан, чили", "Penne, tomato, olive oil, parmesan, chilli"], photo: "/img/food/penne.jpg", price: 5600, station: "hot", prepMin: 14, allergens: ["gluten", "milk"], allergensVerified: true, dietary: ["vegetarian", "spicy"], tags: [], weight: 5,
    groups: [group("penne-add", ["Հավելում", "Добавить", "Add"], 0, 1, [opt("chicken", ["Հավի միս", "Курица", "Chicken"], 1500, [line("chicken", 100, 0.75)])])] }),
  item({ id: "farfalle", categoryId: "mains", n: ["Ֆարֆալե լեռնային խոտաբույսերով", "Фарфалле с горными травами", "Mountain herb farfalle"], d: ["Ֆարֆալե, լոլիկ, ռեհան, ֆետա", "Фарфалле, томаты, базилик, фета", "Farfalle, tomato, basil, feta"], i: ["Ֆարֆալե, լոլիկ, կանաչի, ֆետա, ձիթապտղի յուղ", "Фарфалле, томаты, зелень, фета, оливковое масло", "Farfalle, tomato, herbs, feta, olive oil"], photo: "/img/food/pasta-salad.jpg", price: 5200, station: "hot", prepMin: 13, allergens: ["gluten", "milk"], allergensVerified: true, dietary: ["vegetarian"], tags: [], weight: 2, groups: [] }),
  item({ id: "burger", categoryId: "mains", n: ["Summit բուրգեր", "Бургер Summit", "Summit burger"], d: ["Տավարի միս, չեդդեր, տնական սոուս, կարտոֆիլ ֆրի", "Говядина, чеддер, домашний соус, картофель фри", "Beef, cheddar, house sauce, fries"], i: ["Տավարի աղացած միս, բուլկի, չեդդեր, լոլիկ, կարտոֆիլ, ձու", "Говяжий фарш, булочка, чеддер, томат, картофель, яйцо", "Beef mince, bun, cheddar, tomato, potato, egg"], photo: "/img/food/burger.jpg", price: 6900, station: "grill", prepMin: 16, allergens: ["gluten", "milk", "egg"], allergensVerified: true, dietary: [], tags: [], weight: 6,
    groups: [group("burger-add", ["Հավելում", "Добавить", "Add"], 0, 2, [opt("bacon", ["Բեկոն", "Бекон", "Bacon"], 1200, [line("bacon", 30)]), opt("cheese", ["Լրացուցիչ պանիր", "Доп. сыр", "Extra cheese"], 800, [line("cheddar", 30)])])] }),
  item({ id: "lavash-basket", categoryId: "bakery", n: ["Թոնրի լավաշ և մածուն", "Лаваш из тонира и мацун", "Tonir lavash & matsun"], d: ["Տաք լավաշ, մածուն, կանաչի", "Горячий лаваш, мацун, зелень", "Warm lavash, matsun, herbs"], i: ["Լավաշ, մածուն, կանաչի", "Лаваш, мацун, зелень", "Lavash, matsun, herbs"], price: 1500, station: "cold", prepMin: 4, allergens: [], allergensVerified: false, dietary: ["vegetarian"], tags: [], weight: 7, groups: [] }),
  item({ id: "cake", categoryId: "desserts", n: ["Ազնվամորու տորթ", "Малиновый торт", "Raspberry cake"], d: ["Վանիլային կրեմ, ազնվամորի", "Ванильный крем, малина", "Vanilla cream, raspberries"], i: ["Ալյուր, ձու, կարագ, սերուցք, ազնվամորի, շաքար", "Мука, яйца, масло, сливки, малина, сахар", "Flour, eggs, butter, cream, raspberries, sugar"], photo: "/img/food/cake.jpg", price: 3400, station: "pastry", prepMin: 5, allergens: ["gluten", "milk", "egg"], allergensVerified: true, dietary: ["vegetarian"], tags: [], weight: 4, groups: [] }),
  item({ id: "panna", categoryId: "desserts", n: ["Պաննա կոտա", "Панна котта", "Panna cotta"], d: ["Սերուցք, ազնվամորու սոուս", "Сливки, малиновый соус", "Cream, raspberry coulis"], i: ["Սերուցք, շաքար, ժելատին, ազնվամորի", "Сливки, сахар, желатин, малина", "Cream, sugar, gelatin, raspberries"], photo: "/img/food/panna-cotta.jpg", price: 2900, station: "pastry", prepMin: 4, allergens: ["milk"], allergensVerified: true, dietary: [], tags: [], weight: 3, groups: [] }),
  item({ id: "sundae", categoryId: "desserts", n: ["Աղի կարամելով պաղպաղակ", "Мороженое с солёной карамелью", "Salted caramel sundae"], d: ["Վանիլային պաղպաղակ, աղի կարամել", "Ванильное мороженое, солёная карамель", "Vanilla ice cream, salted caramel"], i: ["Պաղպաղակ, կարամել", "Мороженое, карамель", "Ice cream, caramel"], photo: "/img/food/dessert.jpg", price: 2600, station: "pastry", prepMin: 3, allergens: ["milk"], allergensVerified: true, dietary: ["vegetarian"], tags: [], weight: 3, groups: [] }),
  item({ id: "cappuccino", categoryId: "drinks", n: ["Կապուչինո", "Капучино", "Cappuccino"], d: ["Արաբիկա, թարմ կաթ", "Арабика, свежее молоко", "Arabica, fresh milk"], i: ["Սուրճ, կաթ", "Кофе, молоко", "Coffee, milk"], photo: "/img/food/cappuccino.jpg", price: 1500, station: "bar", prepMin: 3, allergens: ["milk"], allergensVerified: true, dietary: ["vegetarian"], tags: [], weight: 8,
    groups: [group("milk", ["Կաթ", "Молоко", "Milk"], 0, 1, [opt("oat", ["Վարսակի կաթ", "Овсяное молоко", "Oat milk"], 300, [line("oatmilk", 150), line("milk", -150)])])] }),
  item({ id: "areni", categoryId: "drinks", n: ["Արենի կարմիր (բաժակ)", "Арени красное (бокал)", "Areni red (glass)"], d: ["Հայկական Արենի խաղողատեսակ", "Армянский сорт Арени", "Armenian Areni grape"], i: ["Կարմիր գինի", "Красное вино", "Red wine"], photo: "/img/food/wine.jpg", price: 3200, station: "bar", prepMin: 2, allergens: ["sulfites"], allergensVerified: true, dietary: ["vegan"], tags: [], weight: 8, groups: [] }),
  item({ id: "cocktail", categoryId: "drinks", n: ["Summit կոկտեյլ", "Коктейль Summit", "Summit cocktail"], d: ["Հայկական կոնյակ, ծիրան, ուրց", "Армянский коньяк, абрикос, чабрец", "Armenian brandy, apricot, thyme"], i: ["Կոնյակ, ծիրանի պյուրե, կիտրոն, շաքար", "Коньяк, абрикосовое пюре, лимон, сахар", "Brandy, apricot purée, lemon, sugar"], photo: "/img/food/cocktail.jpg", price: 4200, station: "bar", prepMin: 4, allergens: [], allergensVerified: false, dietary: [], tags: ["signature"], weight: 5, groups: [] }),
  item({ id: "tea", categoryId: "drinks", n: ["Լեռնային թեյ", "Горный чай", "Mountain herb tea"], d: ["Ուրց, անանուխ, մասրենի", "Чабрец, мята, шиповник", "Thyme, mint, rosehip"], i: ["Չորացրած խոտաբույսեր", "Сушёные травы", "Dried herbs"], price: 1800, station: "bar", prepMin: 3, allergens: [], allergensVerified: true, dietary: ["vegan"], tags: [], weight: 4, groups: [] }),
  item({ id: "water", categoryId: "drinks", n: ["Հանքային ջուր 0.5 լ", "Минеральная вода 0,5 л", "Mineral water 0.5 l"], d: ["Գազավորված", "Газированная", "Sparkling"], i: ["Հանքային ջուր", "Минеральная вода", "Mineral water"], price: 1200, station: "bar", prepMin: 1, allergens: [], allergensVerified: true, dietary: ["vegan"], tags: [], weight: 6, groups: [] }),
];

export const RECIPES: Recipe[] = [
  { itemId: "salad", version: 1, lines: [line("tomato", 80, 0.95), line("cucumber", 70, 0.95), line("pepper", 40, 0.85), line("greens", 40, 0.9), line("herbs", 8, 0.8), line("oil", 15), line("lemon", 15, 0.6)] },
  { itemId: "trout-bowl", version: 1, lines: [line("trout", 120, 0.85), line("rice", 70), line("avocado", 0.5, 0.8), line("cucumber", 40, 0.95), line("sesame", 5)] },
  { itemId: "kufta", version: 1, lines: [line("mince", 160, 0.85), line("onion", 30, 0.9), line("egg", 0.5), line("flour", 10), line("matsun", 60), line("herbs", 5, 0.8)] },
  { itemId: "veg-bowl", version: 1, lines: [line("eggplant", 120, 0.75), line("pepper", 80, 0.8), line("tomato", 80, 0.85), line("onion", 30, 0.9), line("oil", 15), line("herbs", 8, 0.8)] },
  { itemId: "khorovats", version: 1, note: "Մեկ բաժին՝ 180 գ խոզի և 150 գ հավի պատրաստի միս", lines: [line("pork", 180, 0.72), line("chicken", 150, 0.75), line("tomato", 80, 0.85), line("pepper", 60, 0.8), line("eggplant", 80, 0.75), line("onion", 40, 0.9), line("lavash", 1), line("herbs", 10, 0.8)] },
  { itemId: "ribeye", version: 1, lines: [line("ribeye", 300, 0.85), line("potato", 200, 0.9), line("butter", 20), line("cream", 50)] },
  { itemId: "ribs", version: 1, lines: [line("ribs", 450, 0.65), line("bbq", 60), line("tomato", 50, 0.95), line("cucumber", 50, 0.95)] },
  { itemId: "salmon", version: 1, lines: [line("salmon", 180, 0.9), line("asparagus", 100, 0.75), line("butter", 20), line("lemon", 20, 0.6)] },
  { itemId: "penne", version: 1, lines: [line("penne", 120), line("tomato", 120, 0.9), line("oil", 15), line("parmesan", 15)] },
  { itemId: "farfalle", version: 1, lines: [line("farfalle", 120), line("tomato", 80, 0.9), line("herbs", 10, 0.8), line("feta", 40), line("oil", 15)] },
  { itemId: "burger", version: 1, lines: [line("mince", 180, 0.85), line("bun", 1), line("cheddar", 30), line("tomato", 30, 0.95), line("potato", 180, 0.9), line("egg", 0.2), line("oil", 20)] },
  { itemId: "lavash-basket", version: 1, lines: [line("lavash", 2), line("matsun", 80), line("herbs", 10, 0.8)] },
  { itemId: "cake", version: 1, lines: [line("flour", 40), line("egg", 1), line("butter", 25), line("cream", 40), line("raspberry", 40), line("sugar", 35)] },
  { itemId: "panna", version: 1, lines: [line("cream", 120), line("sugar", 20), line("gelatin", 2), line("raspberry", 30)] },
  { itemId: "sundae", version: 1, lines: [line("icecream", 150), line("caramel", 30)] },
  { itemId: "cappuccino", version: 1, lines: [line("coffee", 18), line("milk", 150)] },
  { itemId: "areni", version: 1, lines: [line("wine", 150)] },
  { itemId: "cocktail", version: 1, lines: [line("brandy", 50), line("apricot", 40), line("lemon", 15, 0.6), line("sugar", 10)] },
  { itemId: "tea", version: 1, lines: [line("tea", 6)] },
  { itemId: "water", version: 1, lines: [line("water", 1)] },
];

/** Price changes over the last 28 days (seeded history): costs before these were lower. */
export const PRICE_CHANGES: { ingredientId: string; daysAgo: number; from: number }[] = [
  { ingredientId: "salmon", daysAgo: 12, from: 9800 },
  { ingredientId: "butter", daysAgo: 18, from: 5500 },
  { ingredientId: "ribeye", daysAgo: 9, from: 9200 },
  { ingredientId: "trout", daysAgo: 20, from: 4400 },
  { ingredientId: "greens", daysAgo: 6, from: 2200 },
];

export const ROLE_LABEL: Record<string, string> = { owner: "Սեփականատեր", manager: "Մենեջեր", waiter: "Մատուցող", chef: "Խոհարար-շեֆ", cook: "Խոհարար", bartender: "Բարմեն", cashier: "Գանձապահ", stock: "Պահեստապետ" };
