/* Guest-facing strings of the Summit Table demo site (hy / ru / en). Staff screens use Armenian (see `staff-i18n.ts`). */
import type { Allergen, Lang, OrderStatus } from "./types.ts";

export const LANGS: Lang[] = ["hy", "ru", "en"];
export const isLang = (x: string): x is Lang => (LANGS as string[]).includes(x);

const T = {
  menu: { hy: "Մենյու", ru: "Меню", en: "Menu" },
  order: { hy: "Պատվիրել", ru: "Заказать", en: "Order" },
  takeaway: { hy: "Տանելու համար", ru: "С собой", en: "Takeaway" },
  bookTable: { hy: "Ամրագրել սեղան", ru: "Забронировать стол", en: "Book a table" },
  story: { hy: "Մեր պատմությունը", ru: "Наша история", en: "Our story" },
  signature: { hy: "Մեր հայտնի ուտեստները", ru: "Наши фирменные блюда", en: "Signature dishes" },
  hours: { hy: "Աշխատանքային ժամեր", ru: "Часы работы", en: "Opening hours" },
  visit: { hy: "Այցելեք մեզ", ru: "Ждём в гости", en: "Visit us" },
  directions: { hy: "Ինչպես հասնել", ru: "Как добраться", en: "Directions" },
  search: { hy: "Որոնել մենյուում", ru: "Поиск по меню", en: "Search the menu" },
  add: { hy: "Ավելացնել", ru: "Добавить", en: "Add" },
  addToOrder: { hy: "Ավելացնել պատվերին", ru: "Добавить в заказ", en: "Add to order" },
  soldOut: { hy: "Վերջացել է", ru: "Закончилось", en: "Sold out" },
  ingredients: { hy: "Բաղադրություն", ru: "Состав", en: "Ingredients" },
  allergens: { hy: "Ալերգեններ", ru: "Аллергены", en: "Allergens" },
  noAllergens: { hy: "Նշված ալերգեններ չկան", ru: "Аллергены не указаны рестораном как присутствующие", en: "No listed allergens" },
  allergensNotProvided: { hy: "Ալերգենների տվյալները տրամադրված չեն. հարցրեք մատուցողին", ru: "Данные об аллергенах не предоставлены — спросите официанта", en: "Allergen information not provided — please ask your server" },
  allergyNote: { hy: "Ալերգենների տեղեկությունը տրամադրում է ռեստորանը։ Լուրջ ալերգիայի դեպքում խնդրում ենք տեղեկացնել մատուցողին։", ru: "Информацию об аллергенах предоставляет ресторан. При серьёзной аллергии, пожалуйста, сообщите официанту.", en: "Allergen information is provided by the restaurant. If you have a severe allergy, please tell your server." },
  note: { hy: "Նշում խոհանոցի համար", ru: "Комментарий для кухни", en: "Note for the kitchen" },
  required: { hy: "Պարտադիր", ru: "Обязательно", en: "Required" },
  optional: { hy: "Ըստ ցանկության", ru: "По желанию", en: "Optional" },
  upTo: { hy: "մինչև", ru: "до", en: "up to" },
  cart: { hy: "Ձեր պատվերը", ru: "Ваш заказ", en: "Your order" },
  emptyCart: { hy: "Պատվերը դատարկ է", ru: "Заказ пуст", en: "Your order is empty" },
  viewOrder: { hy: "Դիտել պատվերը", ru: "Посмотреть заказ", en: "View order" },
  subtotal: { hy: "Ընդամենը", ru: "Сумма", en: "Subtotal" },
  packaging: { hy: "Փաթեթավորում", ru: "Упаковка", en: "Packaging" },
  total: { hy: "Վճարման ենթակա", ru: "Итого", en: "Total" },
  payOnSite: { hy: "Վճարումը՝ ռեստորանում, սովորական եղանակով (ֆիսկալ կտրոնով)", ru: "Оплата в ресторане как обычно (с фискальным чеком)", en: "Payment at the restaurant as usual (with a fiscal receipt)" },
  sendOrder: { hy: "Ուղարկել ռեստորանին", ru: "Отправить в ресторан", en: "Send to the restaurant" },
  table: { hy: "Սեղան", ru: "Стол", en: "Table" },
  yourName: { hy: "Անուն", ru: "Имя", en: "Name" },
  yourPhone: { hy: "Հեռախոս", ru: "Телефон", en: "Phone" },
  pickupTime: { hy: "Վերցնելու ժամը", ru: "Время самовывоза", en: "Pickup time" },
  earliest: { hy: "Ամենաշուտը", ru: "Не раньше", en: "Earliest" },
  estimateRule: { hy: "Գնահատականը հաշվարկվում է պատրաստման ժամանակից և խոհանոցի ներկայիս ծանրաբեռնվածությունից", ru: "Оценка рассчитана по времени приготовления и текущей загрузке кухни", en: "Estimate based on preparation time and the kitchen's current load" },
  minOrder: { hy: "Նվազագույն պատվեր", ru: "Минимальный заказ", en: "Minimum order" },
  callWaiter: { hy: "Կանչել մատուցողին", ru: "Позвать официанта", en: "Call the waiter" },
  requestBill: { hy: "Խնդրել հաշիվը", ru: "Попросить счёт", en: "Request the bill" },
  help: { hy: "Օգնություն", ru: "Помощь", en: "Help" },
  requestSent: { hy: "Ուղարկված է. մատուցողը տեղեկացված է", ru: "Отправлено, официант уведомлён", en: "Sent — your server has been notified" },
  myOrders: { hy: "Իմ պատվերները", ru: "Мои заказы", en: "My orders" },
  orderMore: { hy: "Պատվիրել ևս", ru: "Заказать ещё", en: "Order more" },
  orderNo: { hy: "Պատվեր", ru: "Заказ", en: "Order" },
  pickupCode: { hy: "Վերցնելու կոդ", ru: "Код получения", en: "Pickup code" },
  demoNotice: { hy: "Summit Table-ը ցուցադրական ռեստորան է։ Պատվերները իրական չեն։", ru: "Summit Table — демонстрационный ресторан. Заказы не настоящие.", en: "Summit Table is a fictional demo restaurant. Orders are not real." },
  back: { hy: "Հետ", ru: "Назад", en: "Back" },
  all: { hy: "Բոլորը", ru: "Все", en: "All" },
  poweredBy: { hy: "Աշխատում է RISEUP Restaurant OS-ով", ru: "Работает на RISEUP Restaurant OS", en: "Powered by RISEUP Restaurant OS" },
  vegetarian: { hy: "Բուսակերային", ru: "Вегетарианское", en: "Vegetarian" },
  vegan: { hy: "Վեգան", ru: "Веганское", en: "Vegan" },
  spicy: { hy: "Կծու", ru: "Острое", en: "Spicy" },
  signatureTag: { hy: "Հայտնի", ru: "Фирменное", en: "Signature" },
  chef: { hy: "Շեֆն առաջարկում է", ru: "Шеф рекомендует", en: "Chef recommends" },
  newTag: { hy: "Նոր", ru: "Новинка", en: "New" },
  qrWelcome: { hy: "Բարի գալուստ։ Պատվիրեք անմիջապես սեղանից", ru: "Добро пожаловать! Заказывайте прямо со стола", en: "Welcome! Order right from your table" },
  orderNotFound: { hy: "Պատվերը չի գտնվել այս սարքում", ru: "Заказ не найден на этом устройстве", en: "Order not found on this device" },
  invalidTable: { hy: "QR կոդը չի ճանաչվել", ru: "QR-код не распознан", en: "QR code not recognised" },
  trackHint: { hy: "Կարգավիճակը թարմանում է ավտոմատ", ru: "Статус обновляется автоматически", en: "Status updates automatically" },
  cancelOrder: { hy: "Չեղարկել պատվերը", ru: "Отменить заказ", en: "Cancel order" },
};
export type TKey = keyof typeof T;
export const t = (k: TKey, lang: Lang) => T[k][lang];

export const ALLERGEN: Record<Allergen, Record<Lang, string>> = {
  gluten: { hy: "Գլյուտեն", ru: "Глютен", en: "Gluten" }, milk: { hy: "Կաթ", ru: "Молоко", en: "Milk" }, egg: { hy: "Ձու", ru: "Яйцо", en: "Egg" },
  fish: { hy: "Ձուկ", ru: "Рыба", en: "Fish" }, sesame: { hy: "Քնջութ", ru: "Кунжут", en: "Sesame" }, nuts: { hy: "Ընկույզ", ru: "Орехи", en: "Nuts" },
  sulfites: { hy: "Սուլֆիտներ", ru: "Сульфиты", en: "Sulphites" }, soy: { hy: "Սոյա", ru: "Соя", en: "Soy" },
};

/** What the guest sees per status. "Accepted" only after the restaurant accepted. */
export const GUEST_STATUS: Record<OrderStatus, { label: Record<Lang, string>; text: Record<Lang, string> }> = {
  submitted: { label: { hy: "Ուղարկված է", ru: "Отправлен", en: "Sent" }, text: { hy: "Սպասում ենք ռեստորանի հաստատմանը", ru: "Ждём подтверждения ресторана", en: "Waiting for the restaurant to accept" } },
  accepted: { label: { hy: "Ընդունված է", ru: "Принят", en: "Accepted" }, text: { hy: "Ռեստորանը ընդունեց պատվերը, խոհանոցը ստացել է այն", ru: "Ресторан принял заказ, кухня его получила", en: "The restaurant accepted your order; the kitchen has it" } },
  preparing: { label: { hy: "Պատրաստվում է", ru: "Готовится", en: "Preparing" }, text: { hy: "Խոհանոցը պատրաստում է Ձեր ուտեստները", ru: "Кухня готовит ваши блюда", en: "The kitchen is preparing your dishes" } },
  ready: { label: { hy: "Պատրաստ է", ru: "Готов", en: "Ready" }, text: { hy: "Պատրաստ է", ru: "Готово", en: "Ready" } },
  served: { label: { hy: "Մատուցված է", ru: "Подано", en: "Served" }, text: { hy: "Բարի ախորժակ", ru: "Приятного аппетита", en: "Enjoy your meal" } },
  picked_up: { label: { hy: "Վերցված է", ru: "Получен", en: "Picked up" }, text: { hy: "Շնորհակալություն", ru: "Спасибо", en: "Thank you" } },
  completed: { label: { hy: "Ավարտված է", ru: "Завершён", en: "Completed" }, text: { hy: "Շնորհակալություն, որ ընտրեցիք մեզ", ru: "Спасибо, что выбрали нас", en: "Thank you for dining with us" } },
  rejected: { label: { hy: "Չի ընդունվել", ru: "Не принят", en: "Not accepted" }, text: { hy: "Ռեստորանը չկարողացավ ընդունել պատվերը", ru: "Ресторан не смог принять заказ", en: "The restaurant could not accept the order" } },
  cancelled: { label: { hy: "Չեղարկված է", ru: "Отменён", en: "Cancelled" }, text: { hy: "Պատվերը չեղարկված է", ru: "Заказ отменён", en: "The order was cancelled" } },
};
