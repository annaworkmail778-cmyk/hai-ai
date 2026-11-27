/* Restaurant OS domain types. Everything is fictional demo data ("Summit Table"). */
import type { Stamped } from "../kernel/replay.ts";

export type Lang = "hy" | "ru" | "en";
export type I18n = Record<Lang, string>;

/* ---------------- brand & settings ---------------- */

export type ThemePreset = "fine_dining" | "family";
export type Brand = {
  id: string;
  name: string;
  tagline: I18n;
  story: I18n;
  city: I18n;
  address: I18n;
  phone: string;
  email: string;
  hours: { days: I18n; open: string; close: string }[];
  theme: ThemePreset;
  /** Labelled on every page: the brand is a fictional demo identity. */
  fictional: true;
};

export type StationId = "hot" | "grill" | "cold" | "pastry" | "bar";
export type Station = { id: StationId; name: string; thresholds: { amber: number; red: number } };

export type Settings = {
  vat: { registered: boolean; pricesIncludeVat: boolean; rate: number };
  /** Orders from these channels are accepted automatically (visible rule). Staff-entered orders by default. */
  autoAccept: Record<Channel, boolean>;
  takeaway: { enabled: boolean; minOrder: number; serviceFee: number; slotMin: number; leadMin: number };
  delivery: { enabled: boolean };
  /** Monthly fixed costs entered by the owner (optional). Net profit is shown only when present. */
  expenses: { rent: number; staff: number; utilities: number; other: number } | null;
  /** Owner-configured assumptions for the savings calculator (hypotheses, editable). */
  savings: SavingsAssumptions;
};

export type SavingsAssumptions = {
  wasteReductionPct: number;
  remakeReductionPct: number;
  priceRecoveryPct: number;
  stockoutRecoveryPct: number;
  minutesSavedPerOrder: number;
  labourCostPerHour: number;
};

/* ---------------- places ---------------- */

export type AreaId = "hall" | "lounge" | "terrace" | "private" | "bar";
export type Area = { id: AreaId; name: I18n; open: boolean; note?: string; w: number; h: number };
export type Table = { id: string; label: string; areaId: AreaId; seats: number; shape: "round" | "rect"; x: number; y: number; w: number; h: number; token: string; waiterId: string };

/* ---------------- menu, ingredients, recipes ---------------- */

export type CategoryId = "starters" | "grill" | "mains" | "bakery" | "desserts" | "drinks";
export type Category = { id: CategoryId; name: I18n };
export type Allergen = "gluten" | "milk" | "egg" | "fish" | "sesame" | "nuts" | "sulfites" | "soy";
export type Modifier = { id: string; name: I18n; price: number; recipe?: RecipeLine[] };
export type ModifierGroup = { id: string; name: I18n; min: number; max: number; options: Modifier[] };
export type MenuItem = {
  id: string; categoryId: CategoryId; name: I18n; desc: I18n; ingredientsText: I18n; photo?: string;
  price: number; station: StationId; prepMin: number;
  allergens: Allergen[]; allergensVerified: boolean; dietary: ("vegetarian" | "vegan" | "spicy")[]; tags: ("signature" | "chef" | "new")[];
  groups: ModifierGroup[]; available: boolean; soldOutAt?: number;
  /** Relative popularity used by the deterministic seed. */
  weight: number;
};

export type Unit = "g" | "ml" | "pcs";
export type Ingredient = {
  id: string; name: string; unit: Unit; purchaseUnit: string; unitsPerPurchase: number;
  /** AMD per purchase unit (e.g. per kg). */
  cost: number; minLevel: number; parLevel: number; storage: "fridge" | "freezer" | "dry" | "bar";
  supplierId: string; shelfDays?: number;
};
/** qty = quantity as served (usage units); yieldPct = usable share after trimming/cooking loss. */
export type RecipeLine = { ingredientId: string; qty: number; yieldPct: number };
export type Recipe = { itemId: string; version: number; lines: RecipeLine[]; note?: string };
export type PricePoint = { ingredientId: string; at: number; cost: number; source: "invoice" | "manual" | "seed" };
export type Supplier = { id: string; name: string; phone: string; leadDays: number; deliveryDays: string };

/* ---------------- orders & kitchen ---------------- */

export type Channel = "waiter" | "qr" | "website";
export type OrderType = "dine_in" | "takeaway";
export type OrderStatus = "submitted" | "accepted" | "preparing" | "ready" | "served" | "picked_up" | "completed" | "rejected" | "cancelled";
export type OrderLine = {
  id: string; itemId: string; name: string; qty: number; unitPrice: number; modifiers: { id: string; name: string; price: number }[];
  note: string; station: StationId; status: "active" | "voided"; voidReason?: string; remakeOf?: string;
};
export type Order = {
  id: string; code: string; channel: Channel; type: OrderType; tableId?: string; sessionId?: string;
  contact?: { name: string; phone: string }; pickupAt?: number; note: string; lines: OrderLine[];
  subtotal: number; fee: number; total: number; status: OrderStatus; createdAt: number; acceptedAt?: number; readyAt?: number; closedAt?: number;
  history: { at: number; status: OrderStatus; by: string; note?: string }[]; reason?: string; waiterId?: string;
  /** Hash of the guest device key: the status page shows an order only to the device that placed it. */
  deviceKey?: string;
};
export type TicketStatus = "queued" | "in_progress" | "ready" | "bumped" | "voided";
export type Ticket = {
  id: string; orderId: string; station: StationId; lineIds: string[]; status: TicketStatus; rush: boolean;
  firedAt: number; startedAt?: number; readyAt?: number; bumpedAt?: number; remake?: boolean;
};
export type TableSession = { id: string; tableId: string; openedAt: number; partySize: number; waiterId: string; status: "open" | "closed"; closedAt?: number; billRequested?: boolean };
export type TableState = "available" | "reserved" | "seated" | "ordering" | "waiting_food" | "eating" | "bill" | "cleaning";
export type RequestKind = "waiter" | "bill" | "help";
export type ServiceRequest = { id: string; tableId: string; sessionId?: string; kind: RequestKind; at: number; status: "new" | "ack" | "done"; ackAt?: number; doneAt?: number; by?: string };
export type Reservation = { id: string; name: string; partySize: number; at: number; tableId: string; note?: string; vip?: boolean };

/* ---------------- stock & purchasing ---------------- */

export type MoveKind = "receive" | "consume" | "reverse" | "waste" | "adjust";
/** qty = change of stock on hand. For waste of food that was already consumed by an order, qty = 0 and `lost` = quantity written off. */
export type StockMove = { key: string; ingredientId: string; qty: number; kind: MoveKind; unitCost: number; at: number; ref?: string; reason?: string; by?: string; lost?: number };
export type PoStatus = "draft" | "sent" | "partial" | "received" | "cancelled";
export type PurchaseOrder = { id: string; code: string; supplierId: string; status: PoStatus; createdAt: number; lines: { ingredientId: string; qty: number; cost: number; received: number }[] };

/* ---------------- history (read-only, shared between replays) ---------------- */

export type HistLine = { itemId: string; qty: number; net: number; gross: number; cost: number; remade?: boolean; remakeCost?: number };
export type HistOrder = {
  day: string; at: number; hour: number; channel: Channel; type: OrderType; status: "completed" | "cancelled" | "rejected";
  lines: HistLine[]; gross: number; net: number; cost: number; prep: { station: StationId; min: number; late: boolean }[]; covers: number;
};
export type HistWaste = { day: string; ingredientId: string; qty: number; cost: number; reason: string };
export type HistStockout = { day: string; itemId: string; minutes: number };

/* ---------------- staff, activity ---------------- */

export type RoleId = "owner" | "manager" | "waiter" | "chef" | "cook" | "bartender" | "cashier" | "stock";
export type Staff = { id: string; name: string; initials: string; role: RoleId; station?: StationId; areaIds?: AreaId[] };
export type Activity = { id: string; at: number; text: string; by: string; kind: "order" | "kitchen" | "table" | "menu" | "stock" | "auto" | "settings" };
export type Notice = { id: string; at: number; text: string; href: string; read: boolean; kind: "order" | "request" | "stock" | "late" };
export type OutboxItem = { id: string; at: number; channel: "sms" | "whatsapp" | "telegram" | "email"; to: string; text: string; state: "simulated"; ref?: string };
export type AutomationId = "station_routing" | "stock_deduction" | "ready_notify" | "low_stock_alert" | "price_change_alert" | "late_ticket_alert" | "request_escalation";

export type RestaurantState = {
  baseDate: string;
  epochAt: number;
  brand: Brand;
  settings: Settings;
  stations: Station[];
  areas: Area[];
  tables: Table[];
  staff: Staff[];
  categories: Category[];
  items: MenuItem[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  prices: PricePoint[];
  suppliers: Supplier[];
  /** Read-only history (days −28 … −1), shared between replays. */
  history: { orders: readonly HistOrder[]; waste: readonly HistWaste[]; stockouts: readonly HistStockout[] };
  /** Stock on hand at the start of the live session (after history). */
  stockStart: Record<string, number>;
  /** Batches close to expiry (seeded; usage units). */
  expiring: { ingredientId: string; qty: number; expiresDay: string }[];
  moves: StockMove[];
  orders: Order[];
  tickets: Ticket[];
  sessions: TableSession[];
  requests: ServiceRequest[];
  reservations: Reservation[];
  cleaning: string[];
  pos: PurchaseOrder[];
  activity: Activity[];
  notices: Notice[];
  outbox: OutboxItem[];
  automations: Record<AutomationId, boolean>;
  seq: { order: number; po: number };
};

/* ---------------- events ---------------- */

export type CartLine = { itemId: string; qty: number; modifierIds: string[]; note: string };

export type RestaurantEvent =
  | { type: "order.submit"; channel: Channel; orderType: OrderType; tableToken?: string; tableId?: string; contact?: { name: string; phone: string }; pickupAt?: number; note: string; lines: CartLine[]; deviceKey?: string }
  | { type: "order.accept"; orderId: string }
  | { type: "order.reject"; orderId: string; reason: string }
  | { type: "order.cancel"; orderId: string; reason: string }
  | { type: "order.addLines"; orderId: string; lines: CartLine[] }
  | { type: "order.voidLine"; orderId: string; lineId: string; reason: string }
  | { type: "order.remake"; orderId: string; lineId: string; reason: string }
  | { type: "order.serve"; orderId: string }
  | { type: "order.pickup"; orderId: string }
  | { type: "ticket.start"; ticketId: string }
  | { type: "ticket.ready"; ticketId: string }
  | { type: "ticket.bump"; ticketId: string }
  | { type: "ticket.recall"; ticketId: string }
  | { type: "ticket.rush"; ticketId: string; rush: boolean }
  | { type: "table.open"; tableId: string; partySize: number; waiterId?: string }
  | { type: "table.close"; tableId: string }
  | { type: "table.clean"; tableId: string }
  | { type: "table.request"; tableToken?: string; tableId?: string; kind: RequestKind }
  | { type: "request.ack"; requestId: string }
  | { type: "request.done"; requestId: string }
  | { type: "menu.availability"; itemId: string; available: boolean }
  | { type: "menu.price"; itemId: string; price: number }
  | { type: "ingredient.price"; ingredientId: string; cost: number; source: "invoice" | "manual" }
  | { type: "recipe.qty"; itemId: string; ingredientId: string; qty: number }
  | { type: "stock.waste"; ingredientId: string; qty: number; reason: string }
  | { type: "stock.adjust"; ingredientId: string; counted: number }
  | { type: "po.create"; supplierId: string; lines: { ingredientId: string; qty: number }[] }
  | { type: "po.send"; poId: string }
  | { type: "po.receive"; poId: string; lines: { ingredientId: string; qty: number; cost: number }[] }
  | { type: "settings.update"; patch: Partial<Omit<Settings, "savings">> & { savings?: Partial<SavingsAssumptions> } }
  | { type: "automation.toggle"; target: AutomationId; on: boolean }
  | { type: "notices.read" };

export type RStamped = Stamped<RestaurantEvent>;
