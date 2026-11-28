"use client";
/*
 * Operational staff apps (waiter, kitchen, host, cashier) in Armenian, Russian and English.
 * The language is chosen per device (staff often share tablets) and stored locally.
 */
import { useCallback, useEffect, useState } from "react";
import type { AreaId, OrderStatus, RequestKind, StationId, TableState, TicketStatus } from "./types.ts";

export type SL = "hy" | "ru" | "en";
const T = {
  myTables: ["Իմ սեղանները", "Мои столы", "My tables"], allTables: ["Բոլորը", "Все", "All"], map: ["Պլան", "План", "Map"], list: ["Ցուցակ", "Список", "List"],
  attention: ["Ուշադրություն", "Требует внимания", "Needs attention"], allGood: ["Ամեն ինչ կարգին է", "Всё в порядке", "All clear"],
  accept: ["Ընդունել", "Принять", "Accept"], serve: ["Մատուցված", "Подано", "Served"], done: ["Կատարված", "Выполнено", "Done"], onMyWay: ["Գնում եմ", "Иду", "On my way"],
  qrOrder: ["QR պատվեր", "QR-заказ", "QR order"], readyToServe: ["Պատրաստ է՝ մատուցել", "Готово — подать", "Ready — serve"], minAgo: ["ր առաջ", "мин назад", "min ago"],
  openTable: ["Նստեցնել", "Посадить", "Seat guests"], guests: ["հյուր", "гостей", "guests"], table: ["Սեղան", "Стол", "Table"],
  order: ["Պատվեր", "Заказ", "Order"], add: ["Ավելացնել", "Добавить", "Add"], bill: ["Հաշիվ", "Счёт", "Bill"], more: ["Այլ", "Ещё", "More"],
  search: ["Որոնել ուտեստ", "Поиск блюда", "Search dish"], favourites: ["Հաճախակի", "Частые", "Favourites"], seat: ["Տեղ", "Место", "Seat"], shared: ["Ընդհանուր", "Общее", "Shared"],
  course: ["Կուրս", "Курс", "Course"], now: ["Հիմա", "Сейчас", "Now"], c1: ["Նախուտեստ", "Закуски", "Starters"], c2: ["Հիմնական", "Основное", "Mains"], c3: ["Աղանդեր", "Десерт", "Dessert"],
  sendKitchen: ["Ուղարկել խոհանոց", "Отправить на кухню", "Send to kitchen"], draft: ["Նոր դիրքեր", "Новые позиции", "New items"], note: ["Նշում", "Комментарий", "Note"],
  allergies: ["Ալերգիաներ / սննդակարգ", "Аллергии / диета", "Allergies / diet"], serviceNotes: ["Սպասարկման նշումներ", "Заметки", "Service notes"], save: ["Պահպանել", "Сохранить", "Save"],
  fireCourse: ["Ուղարկել կուրս", "Подать курс", "Fire course"], held: ["Պահված", "Ожидает", "Held"], notConfirmed: ["Կապ չկա. դեռ չի հասել սերվերին", "Нет связи — ещё не отправлено на сервер", "Offline — not yet received by the server"],
  transfer: ["Տեղափոխել սեղանը", "Пересадить", "Move table"], assign: ["Փոխանցել այլ մատուցողի", "Передать официанту", "Hand over to waiter"], merge: ["Միացնել սեղան", "Объединить столы", "Merge tables"],
  moveItems: ["Տեղափոխել դիրքերը", "Перенести позиции", "Move items"], chooseTable: ["Ընտրեք սեղանը", "Выберите стол", "Choose a table"], cancel: ["Չեղարկել", "Отмена", "Cancel"],
  void: ["Չեղարկել դիրքը", "Отменить позицию", "Void item"], remake: ["Վերապատրաստել", "Переделать", "Remake"], reason: ["Պատճառ", "Причина", "Reason"],
  prepareBill: ["Պատրաստել հաշիվը", "Подготовить счёт", "Prepare bill"], single: ["Մեկ հաշիվ", "Один счёт", "One bill"], bySeat: ["Ըստ տեղերի", "По местам", "By seat"], equal: ["Հավասար", "Поровну", "Split equally"],
  payCard: ["Քարտ (տերմինալ)", "Карта (терминал)", "Card (terminal)"], recordCash: ["Կանխիկ (գրանցել)", "Наличные (записать)", "Cash (record)"], recordPos: ["Վճարված է POS-ում", "Оплачено в POS", "Paid on POS"],
  waitingTerminal: ["Սպասում ենք տերմինալի պատասխանին", "Ждём ответа терминала", "Waiting for the terminal"], demoApprove: ["Ցուցադրական տերմինալ՝ հաստատել", "Демо-терминал: одобрить", "Demo terminal: approve"], demoDecline: ["մերժել", "отклонить", "decline"],
  simAdapter: ["Սիմուլյացված վճարման ադապտեր · իրական գումար չի գանձվում", "Симулированный платёжный адаптер · реальные деньги не списываются", "Simulated payment adapter · no real money is charged"],
  paid: ["Վճարված (հաստատված)", "Оплачено (подтверждено)", "Paid (confirmed)"], recorded: ["Գրանցված աշխատակցի կողմից", "Записано сотрудником", "Recorded by staff"], declined: ["Մերժված", "Отклонено", "Declined"], pending: ["Ընթացքում", "В процессе", "Pending"], open: ["Բաց", "Открыт", "Open"],
  closeTable: ["Փակել սեղանը", "Закрыть стол", "Close table"], cleaned: ["Մաքրված է", "Убрано", "Cleaned"], total: ["Ընդամենը", "Итого", "Total"], fiscal: ["Ֆիսկալ կտրոնը տրվում է Ձեր դրամարկղից", "Фискальный чек выдаёт ваша касса", "The fiscal receipt comes from your cash register"],
  shift: ["Իմ հերթափոխը", "Моя смена", "My shift"], handover: ["Հերթափոխի փոխանցում", "Передача смены", "Shift handover"], sales: ["Վաճառք", "Продажи", "Sales"], orders: ["Պատվերներ", "Заказы", "Orders"],
  free: ["Ազատ", "Свободен", "Free"], reservedAt: ["Ամրագրված", "Бронь", "Reserved"], noPermission: ["Թույլտվություն չկա", "Нет прав", "No permission"], close: ["Փակել", "Закрыть", "Close"],
  start: ["Սկսել", "Начать", "Start"], ready: ["Պատրաստ է", "Готово", "Ready"], bumped: ["Հանձնված ✓", "Выдано ✓", "Bumped ✓"], allDay: ["Ընդհանուր քանակ", "Всего к приготовлению", "All-day count"],
  soldOut: ["Վերջացել է…", "Закончилось…", "Sold out…"], expo: ["Ելք (expo)", "Раздача", "Expo"], recall: ["վերադարձնել", "вернуть", "recall"], reopen: ["Վերաբացել", "Переоткрыть", "Reopen"],
  noTickets: ["Նոր տոմսեր չկան", "Новых заказов нет", "No new tickets"], cancelledRecently: ["Վերջերս չեղարկված", "Недавно отменённые", "Recently cancelled"], allergen: ["ԱԼԵՐԳԵՆ", "АЛЛЕРГЕН", "ALLERGEN"], guestAllergy: ["ՀՅՈՒՐԻ ԱԼԵՐԳԻԱ", "АЛЛЕРГИЯ ГОСТЯ", "GUEST ALLERGY"],
  takeaway: ["ՏԱՆ", "С СОБОЙ", "TAKEAWAY"], rush: ["ՇՏԱՊ", "СРОЧНО", "RUSH"], heldCourses: ["պահված կուրս", "курсов ожидают", "courses held"], handedToTable: ["Տարվեց սեղանին", "Отнесено", "Taken to table"],
  waitingGuest: ["Սպասում է հյուրին", "Ждёт гостя", "Waiting for guest"], received: ["Ստացվել է", "Получен", "Received"],
  host: ["Հյուրընկալող", "Хостес", "Host"], tonight: ["Այս երեկո", "Сегодня вечером", "Tonight"], requests: ["Հարցումներ", "Запросы", "Requests"], waitlist: ["Սպասման ցուցակ", "Лист ожидания", "Waitlist"],
  confirm: ["Հաստատել", "Подтвердить", "Confirm"], decline: ["Մերժել", "Отклонить", "Decline"], seatNow: ["Նստեցնել", "Посадить", "Seat"], noShow: ["Չներկայացավ", "Не пришёл", "No-show"], remind: ["Հիշեցում", "Напоминание", "Remind"],
  walkIn: ["Առանց ամրագրման", "Без брони", "Walk-in"], addWaitlist: ["Ավելացնել սպասման ցուցակ", "В лист ожидания", "Add to waitlist"], notify: ["Ծանուցել", "Уведомить", "Notify"], suggested: ["Առաջարկվող սեղան", "Предложенный стол", "Suggested table"],
  name: ["Անուն", "Имя", "Name"], phone: ["Հեռախոս", "Телефон", "Phone"], party: ["Հյուրեր", "Гостей", "Party"], time: ["Ժամ", "Время", "Time"], status: ["Կարգավիճակ", "Статус", "Status"], noAvailability: ["Ազատ սեղան չկա այդ ժամին", "Нет свободных столов на это время", "No table available at that time"],
  newRes: ["Նոր ամրագրում", "Новая бронь", "New reservation"], today: ["Այսօր", "Сегодня", "Today"], tomorrow: ["Վաղը", "Завтра", "Tomorrow"], modify: ["Փոխել", "Изменить", "Change"],
  remindSim: ["Հիշեցումը գրանցվեց (SMS չի միացված · սիմուլյացիա)", "Напоминание записано (SMS не подключён · симуляция)", "Reminder logged (SMS not connected · simulated)"], quoted: ["Սպասման ժամանակ", "Ожидание", "Quoted wait"],
  seated: ["Նստած", "Посажены", "Seated"], finished: ["Ավարտված", "Завершены", "Finished"], noShowAfter: ["Չներկայացում՝ +15 րոպեից", "Неявка — после +15 мин", "No-show after +15 min"], source: ["Աղբյուր", "Источник", "Source"], create: ["Ստեղծել", "Создать", "Create"],
} as const;
export type TKey = keyof typeof T;
const IDX: Record<SL, 0 | 1 | 2> = { hy: 0, ru: 1, en: 2 };

const ORDER_ST: Record<OrderStatus, [string, string, string]> = { submitted: ["Սպասում է ընդունման", "Ждёт подтверждения", "Awaiting acceptance"], accepted: ["Ընդունված", "Принят", "Accepted"], preparing: ["Պատրաստվում է", "Готовится", "Preparing"], ready: ["Պատրաստ է", "Готов", "Ready"], served: ["Մատուցված", "Подан", "Served"], picked_up: ["Վերցված", "Выдан", "Picked up"], completed: ["Փակված", "Закрыт", "Closed"], rejected: ["Մերժված", "Отклонён", "Rejected"], cancelled: ["Չեղարկված", "Отменён", "Cancelled"] };
const TICKET_ST: Record<TicketStatus, [string, string, string]> = { held: ["Պահված", "Ожидает курса", "Held"], queued: ["Նոր", "Новый", "New"], in_progress: ["Պատրաստվում է", "Готовится", "Cooking"], ready: ["Պատրաստ", "Готов", "Ready"], bumped: ["Հանձնված", "Выдан", "Bumped"], voided: ["Չեղարկված", "Отменён", "Voided"] };
const TABLE_ST: Record<TableState, [string, string, string]> = { available: ["Ազատ", "Свободен", "Available"], reserved: ["Ամրագրված", "Забронирован", "Reserved"], seated: ["Նստած", "Гости сели", "Seated"], ordering: ["Պատվեր է սպասում", "Ждёт подтверждения", "Order waiting"], waiting_food: ["Սպասում է ուտեստին", "Ждут блюда", "Awaiting food"], eating: ["Սպասարկման մեջ", "Обслуживается", "In service"], bill: ["Հաշիվ է խնդրել", "Просит счёт", "Bill requested"], payment_pending: ["Վճարում", "Оплата", "Payment pending"], cleaning: ["Մաքրում", "Уборка", "Cleaning"], blocked: ["Անհասանելի", "Недоступен", "Unavailable"] };
const STATION: Record<StationId, [string, string, string]> = { hot: ["Տաք խոհանոց", "Горячий цех", "Hot kitchen"], grill: ["Մանղալ", "Мангал", "Grill"], cold: ["Սառը խոհանոց", "Холодный цех", "Cold kitchen"], pastry: ["Աղանդեր", "Десерты", "Pastry"], bar: ["Բար", "Бар", "Bar"] };
const REQ: Record<RequestKind, [string, string, string]> = { waiter: ["Կանչում է մատուցողին", "Зовёт официанта", "Calls the waiter"], bill: ["Խնդրում է հաշիվը", "Просит счёт", "Requests the bill"], help: ["Օգնություն", "Нужна помощь", "Needs help"] };
const AREA: Record<AreaId, [string, string, string]> = { hall: ["Գլխավոր սրահ", "Главный зал", "Main hall"], lounge: ["Բուխարու սրահ", "Каминный зал", "Fireplace lounge"], private: ["Առանձնասենյակ", "Приватный зал", "Private room"], bar: ["Բար", "Бар", "Bar"], terrace: ["Տեռաս", "Терраса", "Terrace"] };

export function useStaffLang() {
  const [lang, setLangState] = useState<SL>("hy");
  useEffect(() => { try { const v = localStorage.getItem("rst:slang"); if (v === "ru" || v === "en" || v === "hy") setLangState(v); } catch { /* ignore */ } }, []);
  const setLang = useCallback((l: SL) => { try { localStorage.setItem("rst:slang", l); } catch { /* ignore */ } setLangState(l); }, []);
  const i = IDX[lang];
  return {
    lang, setLang,
    t: (k: TKey) => T[k][i],
    order: (s: OrderStatus) => ORDER_ST[s][i], ticket: (s: TicketStatus) => TICKET_ST[s][i], tableSt: (s: TableState) => TABLE_ST[s][i],
    station: (s: StationId) => STATION[s][i], req: (k: RequestKind) => REQ[k][i], area: (a: AreaId) => AREA[a][i],
    item: (names: { hy: string; ru: string; en: string }) => names[lang],
  };
}
