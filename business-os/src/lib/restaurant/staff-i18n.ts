/*
 * Staff / kitchen interface labels. Armenian first (approved); the dictionary is keyed so Russian and English
 * can be added by filling the same keys — components call `st(key)` instead of hard-coding shared labels.
 */
import type { AreaId, Channel, OrderStatus, RequestKind, StationId, TableState, TicketStatus } from "./types.ts";

type StaffLang = "hy";
export const STAFF_LANG: StaffLang = "hy";

const D = {
  hy: {
    nav_overview: "Ընդհանուր պատկեր", nav_orders: "Պատվերներ", nav_floor: "Սրահ և սեղաններ", nav_kds: "Խոհանոցի էկրան", nav_menu: "Մենյու",
    nav_inventory: "Պահեստ", nav_recipes: "Բաղադրատոմսեր և ինքնարժեք", nav_purchasing: "Գնումներ", nav_analytics: "Վերլուծություն", nav_savings: "Արդյունավետություն և խնայողություն",
    nav_automations: "Ավտոմատացումներ", nav_integrations: "Ինտեգրացիաներ", nav_settings: "Կարգավորումներ", nav_host: "Ամրագրումներ (հոստես)", nav_floorplan: "Սրահի պլան", nav_inbox: "Հաղորդագրություններ", nav_reviews: "Կարծիքներ", nav_customers: "Հաճախորդներ և լոյալություն", nav_assistant: "AI բիզնես օգնական", nav_team: "Թիմ և հերթափոխեր", grp_guests: "Հյուրեր", nav_site: "Ռեստորանի կայքը", nav_present: "Ներկայացման ռեժիմ",
    grp_service: "Սպասարկում", grp_margin: "Մենյու և մարժա", grp_insight: "Վերլուծություն", grp_system: "Համակարգ",
    accept: "Ընդունել", reject: "Մերժել", start: "Սկսել", ready: "Պատրաստ է", bump: "Հանձնված", recall: "Վերադարձնել", serve: "Մատուցված", pickup: "Վերցվեց",
    cancel: "Չեղարկել", void: "Չեղարկել դիրքը", remake: "Վերապատրաստել", open_table: "Նստեցնել հյուրերին", close_table: "Հաշիվը փակված է (POS)", clean_done: "Մաքրված է",
    ack: "Գնում եմ", done: "Կատարված", demo_signin: "Մուտք որպես (ցուցադրական, ոչ անվտանգ)", rush: "Շտապ", all: "Բոլորը",
    sim_not_sent: "Սիմուլյացիա · չի ուղարկվել", not_connected: "Միացված չէ", demo_data: "Ցուցադրական տվյալներ · գոյություն չունեցող ռեստորան",
    actual: "Փաստացի (ցուցադրական տվյալներ)", calculated: "Հաշվարկված", hypothetical: "Ենթադրական սցենար",
  },
} as const;
export type StaffKey = keyof (typeof D)["hy"];
export const st = (k: StaffKey) => D[STAFF_LANG][k];

export const ORDER_STATUS_HY: Record<OrderStatus, string> = { submitted: "Սպասում է ընդունման", accepted: "Ընդունված", preparing: "Պատրաստվում է", ready: "Պատրաստ է", served: "Մատուցված", picked_up: "Վերցված", completed: "Փակված", rejected: "Մերժված", cancelled: "Չեղարկված" };
export const TICKET_STATUS_HY: Record<TicketStatus, string> = { held: "Պահված", queued: "Նոր", in_progress: "Պատրաստվում է", ready: "Պատրաստ", bumped: "Հանձնված", voided: "Չեղարկված" };
export const CHANNEL_HY: Record<Channel, string> = { waiter: "Մատուցող", qr: "QR սեղանից", website: "Կայք (տանելու)" };
export const STATION_HY: Record<StationId, string> = { hot: "Տաք խոհանոց", grill: "Մանղալ", cold: "Սառը խոհանոց", pastry: "Աղանդեր", bar: "Բար" };
export const TABLE_STATE_HY: Record<TableState, string> = { available: "Ազատ", reserved: "Ամրագրված", seated: "Նստած", ordering: "Պատվեր է սպասում", waiting_food: "Սպասում է ուտեստին", eating: "Սնվում են", bill: "Հաշիվ է խնդրել", payment_pending: "Վճարում է ընթացքում", cleaning: "Մաքրում", blocked: "Անհասանելի" };
export const REQUEST_HY: Record<RequestKind, string> = { waiter: "Կանչում է մատուցողին", bill: "Խնդրում է հաշիվը", help: "Օգնություն" };
export const AREA_HY: Record<AreaId, string> = { hall: "Գլխավոր սրահ", lounge: "Բուխարու սրահ", private: "Առանձնասենյակ", bar: "Բար", terrace: "Տեռաս" };
