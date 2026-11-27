import type { Lang } from "./types.ts";

/* Guest-facing strings for the Hospitality OS pages: [hy, ru, en]. */
const D = {
  demoAuth: ["Ցուցադրական մուտք. իրական նույնականացում չկա", "Демо-вход: реальной аутентификации нет", "Demo sign-in: no real authentication"],
  signIn: ["Մուտք", "Войти", "Sign in"], signOut: ["Ելք", "Выйти", "Sign out"], register: ["Գրանցվել", "Регистрация", "Create account"],
  account: ["Իմ էջը", "Мой кабинет", "My account"], email: ["Էլ. փոստ", "Эл. почта", "Email"], continue: ["Շարունակել", "Продолжить", "Continue"], back: ["Հետ", "Назад", "Back"],
  noAccount: ["Այս էլ. փոստով անդամ չի գտնվել", "Участник с этим e-mail не найден", "No member found with this email"],
  demoMembers: ["Ցուցադրական անդամներ", "Демо-участники", "Demo members"],
  joinTitle: ["Միացեք Pine Ridge Circle-ին", "Вступите в Pine Ridge Circle", "Join Pine Ridge Circle"],
  joinText: ["Անդամի գներ, միավորներ յուրաքանչյուր կեցության և ընթրիքի համար, անհատական առաջարկներ։", "Цены для участников, баллы за проживание и ужины, персональные предложения.", "Member rates, points on stays and dinners, personal offers."],
  marketing: ["Ցանկանում եմ ստանալ անհատական առաջարկներ", "Хочу получать персональные предложения", "Send me personal offers"],
  welcome: ["Բարի վերադարձ", "С возвращением", "Welcome back"], points: ["միավոր", "баллов", "points"], level: ["Մակարդակ", "Уровень", "Level"],
  toNext: ["մինչև", "до уровня", "to"], overview: ["Գլխավոր", "Обзор", "Overview"], stays: ["Կեցություններ", "Проживания", "Stays"],
  orders: ["Պատվերներ և խնդրանքներ", "Заказы и просьбы", "Orders & requests"], rewards: ["Նվերներ", "Награды", "Rewards"], profile: ["Պրոֆիլ և գաղտնիություն", "Профиль и приватность", "Profile & privacy"],
  upcoming: ["Առաջիկա", "Предстоящие", "Upcoming"], previous: ["Նախորդ", "Прошлые", "Previous"], none: ["Դեռ չկա", "Пока нет", "Nothing yet"],
  benefits: ["Ձեր առավելությունները", "Ваши привилегии", "Your benefits"], offers: ["Անհատական առաջարկներ", "Персональные предложения", "Personal offers"],
  redeem: ["Փոխանակել", "Обменять", "Redeem"], notEnough: ["Բավարար միավոր չկա", "Недостаточно баллов", "Not enough points"], tierLocked: ["Հասանելի է բարձր մակարդակից", "Доступно с более высокого уровня", "Available from a higher level"],
  vouchers: ["Իմ վաուչերները", "Мои ваучеры", "My vouchers"], history: ["Միավորների պատմություն", "История баллов", "Points history"],
  active: ["Ակտիվ", "Активен", "Active"], reserved: ["Կիրառված է, սպասում է հաստատման", "Применён, ждёт подтверждения", "Applied, awaiting confirmation"], used: ["Օգտագործված", "Использован", "Used"],
  cancel: ["Չեղարկել", "Отменить", "Cancel"], save: ["Պահպանել", "Сохранить", "Save"], saved: ["Պահպանված է", "Сохранено", "Saved"],
  consentAnalytics: ["Թույլատրում եմ ծառայության բարելավման վերլուծություն", "Разрешаю аналитику для улучшения сервиса", "Allow analytics to improve the service"],
  privacyNote: ["Ձեր տվյալները տեսանելի են միայն այս հյուրանոցի անձնակազմին։ Իրական համակարգում կարող եք պահանջել տվյալների արտահանում կամ ջնջում։", "Ваши данные видит только персонал этого отеля. В реальной системе можно запросить выгрузку или удаление данных.", "Your data is visible only to this hotel's staff. In the real system you can request export or deletion."],
  favourites: ["Սիրելի", "Избранное", "Favourites"], preferences: ["Նախընտրություններ", "Предпочтения", "Preferences"], phone: ["Հեռախոս", "Телефон", "Phone"],
  // booking journey
  bk1: ["Ամսաթվեր և հյուրեր", "Даты и гости", "Dates & guests"], bk2: ["Սենյակ", "Номер", "Room"], bk3: ["Լրացուցիչ", "Дополнительно", "Extras"], bk4: ["Տվյալներ", "Данные", "Details"], bk5: ["Ստուգում", "Проверка", "Review"],
  rooms: ["Սենյակների քանակ", "Количество номеров", "Rooms"], perNightFrom: ["գիշերը", "за ночь", "per night"], totalFor: ["Ընդհանուր", "Итого за", "Total for"],
  select: ["Ընտրել", "Выбрать", "Select"], selected: ["Ընտրված", "Выбрано", "Selected"], soldOut: ["Ազատ չէ այս օրերին", "Нет мест на эти даты", "Sold out for these dates"], left: ["ազատ", "свободно", "left"],
  extrasTitle: ["Դարձրեք կեցությունը հատուկ", "Сделайте отдых особенным", "Make it special"], voucher: ["Կիրառել վաուչեր", "Применить ваучер", "Apply a voucher"], noVoucher: ["Առանց վաուչերի", "Без ваучера", "No voucher"],
  memberRate: ["Անդամի գին կիրառված է", "Цена для участника применена", "Member rate applied"], signInForRate: ["Մուտք գործեք անդամի գնի համար", "Войдите, чтобы получить цену участника", "Sign in for the member rate"],
  guestDetails: ["Հյուրի տվյալներ", "Данные гостя", "Guest details"], first: ["Անուն", "Имя", "First name"], last: ["Ազգանուն", "Фамилия", "Last name"], requests: ["Հատուկ խնդրանքներ", "Особые пожелания", "Special requests"],
  createAccount: ["Ստեղծել անդամի հաշիվ այս ամրագրմամբ", "Создать аккаунт участника с этим бронированием", "Create a member account with this booking"],
  breakdown: ["Գնի մանրամասներ", "Детализация цены", "Price breakdown"], policy: ["Չեղարկման պայմաններ", "Условия отмены", "Cancellation policy"],
  payment: ["Վճարում", "Оплата", "Payment"], paymentNote: ["Առցանց վճարում այս ցուցադրությունում չկա։ Վճարումը կատարվում է բանկային փոխանցմամբ կամ ընդունարանում և գրանցվում է անձնակազմի կողմից։", "В этом демо нет онлайн-оплаты. Оплата — банковским переводом или на ресепшн, её отмечает персонал.", "There is no online payment in this demo. Payment is made by bank transfer or at reception and recorded by staff."],
  submit: ["Ուղարկել ամրագրման հարցումը", "Отправить запрос на бронирование", "Send booking request"],
  pendingTitle: ["Հարցումը ստացվել է", "Запрос получен", "Request received"], pendingText: ["Ձեր ամրագրումը սպասում է հյուրանոցի հաստատմանը։ Կարգավիճակը կտեսնեք Ձեր անձնական էջում։", "Ваше бронирование ожидает подтверждения отеля. Статус виден в личном кабинете.", "Your booking is awaiting the hotel's confirmation. You'll see the status in your account."],
  openAccount: ["Բացել իմ էջը", "Открыть кабинет", "Open my account"],
  st_inquiry: ["Սպասում է հաստատման", "Ожидает подтверждения", "Awaiting confirmation"], st_confirmed: ["Հաստատված", "Подтверждено", "Confirmed"], st_checked_in: ["Հյուրանոցում", "Проживаете", "In house"], st_checked_out: ["Ավարտված", "Завершено", "Completed"], st_declined: ["Մերժված", "Отклонено", "Declined"], st_cancelled: ["Չեղարկված", "Отменено", "Cancelled"], st_no_show: ["Չներկայացում", "Незаезд", "No-show"],
  paid: ["Վճարված", "Оплачено", "Paid"], unpaid: ["Չվճարված", "Не оплачено", "Unpaid"],
  // dining
  dining: ["Ռեստորան", "Ресторан", "Dining"], diningTitle: ["Ռեստորան «Կեչի»", "Ресторан «Кечи»", "Kechi Restaurant"], diningText: ["Պատվիրեք սենյակ, սեղան կամ տանելու համար։ Պատվերը անմիջապես հասնում է խոհանոց։", "Закажите в номер, к столику или с собой. Заказ сразу попадает на кухню.", "Order to your room, your table or for pickup. Orders go straight to the kitchen."],
  add: ["Ավելացնել", "Добавить", "Add"], cart: ["Զամբյուղ", "Корзина", "Cart"], checkout: ["Ձևակերպել", "Оформить", "Checkout"], unavailable: ["Վերջացել է", "Закончилось", "Sold out"],
  allergens: ["Ալերգեններ", "Аллергены", "Allergens"], options: ["Լրացուցիչ", "Дополнительно", "Options"], kitchenNote: ["Նշում խոհանոցին", "Комментарий для кухни", "Note for the kitchen"],
  room_service: ["Սենյակ", "В номер", "Room service"], dine_in: ["Սեղանի մոտ", "За столиком", "Dine-in"], takeaway: ["Տանելու", "С собой", "Takeaway"],
  roomVerified: ["Սենյակ", "Номер", "Room"], needStay: ["Սենյակ պատվիրելու համար սկանավորեք սենյակի QR կոդը", "Для заказа в номер отсканируйте QR-код номера", "To order to your room, scan your room's QR code"],
  table: ["Սեղան", "Столик", "Table"], pickup: ["Վերցնելու ժամ", "Время самовывоза", "Pickup time"], placeOrder: ["Ուղարկել պատվերը", "Отправить заказ", "Place order"],
  subtotal: ["Միջանկյալ գումար", "Подытог", "Subtotal"], discount: ["Զեղչ", "Скидка", "Discount"], total: ["Ընդհանուր", "Итого", "Total"],
  orderStatus: ["Պատվերի կարգավիճակ", "Статус заказа", "Order status"], os_submitted: ["Ուղարկված է, սպասում է խոհանոցի հաստատմանը", "Отправлен, ждёт подтверждения кухни", "Sent, waiting for the kitchen to accept"],
  os_accepted: ["Ընդունված է", "Принят", "Accepted"], os_preparing: ["Պատրաստվում է", "Готовится", "In preparation"], os_ready: ["Պատրաստ է", "Готов", "Ready"], os_out_for_delivery: ["Ճանապարհին է", "В пути", "On the way"],
  os_completed: ["Ավարտված", "Завершён", "Completed"], os_rejected: ["Մերժված", "Отклонён", "Declined"], os_cancelled: ["Չեղարկված", "Отменён", "Cancelled"],
  settleNote: ["Գումարը կավելացվի սենյակի հաշվին և կվճարվի ելքի ժամանակ։", "Сумма будет добавлена к счёту номера и оплачена при выезде.", "The amount is added to your room bill and settled at check-out."],
  // stay / QR
  stayTitle: ["Ձեր սենյակը", "Ваш номер", "Your room"], verify: ["Հաստատեք Ձեր կեցությունը", "Подтвердите проживание", "Verify your stay"],
  verifyText: ["Անվտանգության համար մուտքագրեք ամրագրման ազգանունը։ QR կոդը միայն սենյակն է նույնականացնում, ոչ թե հյուրին։", "Для безопасности введите фамилию из бронирования. QR-код определяет только номер, а не гостя.", "For your security, enter the last name on the booking. The QR code identifies the room, not the guest."],
  verifyFail: ["Ազգանունը չի համապատասխանում այս սենյակի կեցությանը", "Фамилия не совпадает с проживанием в этом номере", "The last name doesn't match a stay in this room"],
  demoHint: ["Ցուցադրական հուշում", "Демо-подсказка", "Demo hint"], services: ["Ծառայություններ", "Услуги", "Services"], myRequests: ["Իմ խնդրանքները", "Мои просьбы", "My requests"],
  requestSent: ["Խնդրանքն ուղարկված է", "Просьба отправлена", "Request sent"], note: ["Մեկնաբանություն", "Комментарий", "Note"], send: ["Ուղարկել", "Отправить", "Send"], when: ["Ժամը", "Время", "Time"],
  rs_new: ["Ստացված է", "Получено", "Received"], rs_assigned: ["Աշխատակից է նշանակված", "Назначен сотрудник", "Staff assigned"], rs_in_progress: ["Ընթացքում է", "Выполняется", "In progress"], rs_done: ["Կատարված է", "Выполнено", "Done"], rs_cancelled: ["Չեղարկված", "Отменено", "Cancelled"],
  orderFood: ["Պատվիրել սենյակ", "Заказать в номер", "Order to room"], askAssistant: ["Հարցնել օգնականին", "Спросить ассистента", "Ask the assistant"], leaveStay: ["Դուրս գալ այս սենյակից", "Выйти из номера", "Leave this room"],
  // site sections
  spaTitle: ["Սպա և առողջություն", "Спа и велнес", "Spa & wellness"], spaText: ["Ֆիննական սաունա, փակ լողավազան և մերսումներ՝ դահուկներից հետո վերականգնման համար։", "Финская сауна, крытый бассейн и массаж — для восстановления после лыж.", "Finnish sauna, an indoor pool and massages to recover after the slopes."],
  diningSection: ["Ընթրիք բուխարու մոտ", "Ужин у камина", "Dinner by the fire"], diningSectionText: ["Խորոված, տեղական գինիներ և սեզոնային մենյու։ Պատվիրեք սենյակ կամ ամրագրեք սեղան։", "Хоровац, местные вина и сезонное меню. Закажите в номер или к столику.", "Khorovats, local wines and a seasonal menu. Order to your room or your table."],
  viewMenu: ["Դիտել մենյուն և պատվիրել", "Меню и заказ", "View menu & order"], membershipTitle: ["Pine Ridge Circle", "Pine Ridge Circle", "Pine Ridge Circle"],
  faqTitle: ["Հաճախ տրվող հարցեր", "Частые вопросы", "Frequently asked questions"],
};

export type GKey = keyof typeof D;
const IDX: Record<Lang, number> = { hy: 0, ru: 1, en: 2 };
export const g = (lang: Lang, key: GKey) => D[key][IDX[lang]];

export const FAQ: { q: [string, string, string]; a: [string, string, string] }[] = [
  { q: ["Ինչպե՞ս հասնել Երևանից", "Как добраться из Еревана?", "How do I get here from Yerevan?"], a: ["Մեքենայով մոտ 1 ժամ (≈60 կմ)։ Պատվիրեք տրանսֆեր ամրագրման ժամանակ։", "На машине около часа (≈60 км). Трансфер можно добавить при бронировании.", "About an hour by car (≈60 km). Add a transfer when you book."] },
  { q: ["Նախաճաշը ներառվա՞ծ է", "Завтрак включён?", "Is breakfast included?"], a: ["Այո, բոլոր գներում՝ 07:30–10:30։", "Да, во всех тарифах, 07:30–10:30.", "Yes, in every rate, 07:30–10:30."] },
  { q: ["Կարո՞ղ եմ չեղարկել", "Можно ли отменить?", "Can I cancel?"], a: ["Անվճար՝ ժամանումից 3 օր առաջ։ Մանրամասները՝ ամրագրման ժամանակ։", "Бесплатно за 3 дня до заезда. Детали — при бронировании.", "Free up to 3 days before arrival. Details are shown when you book."] },
  { q: ["Ինչպե՞ս են աշխատում միավորները", "Как работают баллы?", "How do points work?"], a: ["10 միավոր յուրաքանչյուր 1000 ֏-ի համար՝ միայն ավարտված կեցությունների և պատվերների համար։", "10 баллов за каждые 1000 ֏ — только за завершённые проживания и заказы.", "10 points per 1,000 ֏, only for completed stays and orders."] },
  { q: ["Կարո՞ղ եմ սենյակ պատվիրել ուտելիք", "Можно заказать еду в номер?", "Can I order food to my room?"], a: ["Այո, սկանավորեք սենյակի QR կոդը և պատվիրեք մենյուից։", "Да, отсканируйте QR-код номера и закажите из меню.", "Yes. Scan your room's QR code and order from the menu."] },
];
