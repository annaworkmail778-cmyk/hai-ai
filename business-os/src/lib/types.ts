/* Core types of the Hotel OS demo. Everything here is fictional demo data. */

export type Lang = "hy" | "ru" | "en";
export type I18n = Record<Lang, string>;

export type RoomTypeId = "classic" | "deluxe" | "junior" | "family" | "chalet";

export type RoomType = {
  id: RoomTypeId;
  slug: string;
  name: I18n;
  short: I18n;
  description: I18n;
  capacity: { adults: number; children: number };
  sizeM2: number;
  bed: I18n;
  view: I18n;
  /** Base nightly rate in AMD, breakfast included (fictional). */
  baseRate: number;
  amenities: AmenityId[];
  photos: string[];
};

export type AmenityId =
  | "wifi" | "breakfast" | "mountainView" | "balcony" | "fireplace" | "bathtub" | "rainShower"
  | "smartTv" | "minibar" | "coffee" | "desk" | "kitchenette" | "terrace" | "safe" | "babyCot" | "sauna";

export type Room = { id: string; number: string; floor: number; typeId: RoomTypeId };

export type HkStatus = "clean" | "dirty" | "cleaning" | "inspected";

export type Source = "website" | "assistant" | "phone" | "booking" | "airbnb" | "instagram" | "walkin";

export type ResStatus =
  | "inquiry" // request received, not confirmed
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "declined"
  | "cancelled"
  | "no_show";

export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  lang: Lang;
  country: string;
  tags: string[];
  preferences: string[];
  notes: { at: number; author: string; text: string }[];
};

export type Reservation = {
  id: string;
  code: string;
  guestId: string;
  typeId: RoomTypeId;
  roomId: string | null;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD (exclusive)
  adults: number;
  children: number;
  source: Source;
  status: ResStatus;
  total: number; // AMD, computed from the rate table
  createdAt: number;
  /** Displayed creation time (night scenario shows 23:31). */
  displayAt?: number;
  afterHours?: boolean;
  requests: string;
  conversationId?: string;
  history: { at: number; text: string; by: string }[];
  declineReason?: string;
  /** Booking-journey additions (direct bookings). */
  groupId?: string;
  extras?: { id: string; qty: number; price: number }[];
  discount?: number;
  discountLabel?: string;
  voucherId?: string;
  offerId?: string;
  /** "paid" is only ever set by staff recording a payment; the demo never charges cards. */
  payment?: "unpaid" | "paid";
  review?: { score: number; text: string };
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "normal" | "high" | "urgent";

export type HkTask = {
  id: string;
  roomId: string;
  kind: "checkout" | "arrival_prep" | "stayover" | "inspection";
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  due: string; // YYYY-MM-DD
  dueTime?: string;
  reservationId?: string;
  createdAt: number;
  auto: boolean;
  note?: string;
};

export type MaintRequest = {
  id: string;
  roomId: string | null;
  area: string;
  title: string;
  description: string;
  priority: Priority;
  status: "open" | "in_progress" | "resolved";
  assigneeId: string | null;
  createdAt: number;
  resolvedAt?: number;
  outOfOrder: boolean;
  log: { at: number; text: string; by: string }[];
};

export type StaffRole = "manager" | "reception" | "housekeeping" | "maintenance";
export type Dept = "management" | "reception" | "housekeeping" | "maintenance" | "restaurant" | "kitchen" | "spa" | "administration";
export type Position =
  | "owner" | "general_manager" | "reception_manager" | "receptionist" | "housekeeping_manager" | "housekeeper"
  | "restaurant_manager" | "waiter" | "chef" | "technician" | "spa_therapist";
export type Staff = {
  id: string; name: string; role: StaffRole; initials: string; phone: string; shift: string;
  dept: Dept; position: Position; supervisorId: string | null; active: boolean; email: string; startedAt: string;
};

export type StaffTask = {
  id: string;
  title: string;
  detail?: string;
  assigneeId: string | null;
  priority: Priority;
  due: string;
  status: TaskStatus;
  createdAt: number;
  origin: "manual" | "assistant" | "automation";
  link?: { kind: "conversation" | "reservation"; id: string };
};

export type ChatMsg = {
  id: string;
  from: "guest" | "assistant" | "staff";
  text: string;
  at: number;
  /** Assistant intent that produced the answer, for the admin view. */
  intent?: string;
  cards?: ChatCard[];
};

export type ChatCard =
  | { kind: "rooms"; typeIds: RoomTypeId[]; checkIn?: string; checkOut?: string; adults?: number; children?: number }
  | { kind: "inquiry"; reservationId: string };

export type Conversation = {
  id: string;
  lang: Lang;
  channel: "website";
  guestName?: string;
  startedAt: number;
  displayAt?: number;
  afterHours: boolean;
  messages: ChatMsg[];
  status: "open" | "handoff" | "resolved";
  unanswered: string[];
  reservationId?: string;
};

export type OutboxItem = {
  id: string;
  at: number;
  channel: "email" | "whatsapp" | "telegram" | "sms" | "in_app";
  to: string;
  template: string;
  text: string;
  /** "simulated" = generated by the demo, never sent. "scheduled" = would be sent later. */
  state: "simulated" | "scheduled";
  scheduledFor?: string;
  workflowId: WorkflowId;
  reservationId?: string;
};

export type WorkflowId =
  | "inquiry_alert"
  | "approve_calendar"
  | "approve_prep_task"
  | "pre_arrival"
  | "checkout_task"
  | "review_request"
  | "unanswered_followup";

export type ActivityItem = {
  id: string;
  at: number;
  icon: "inquiry" | "approve" | "decline" | "task" | "checkout" | "checkin" | "message" | "maint" | "auto" | "note" | "room";
  text: string;
  by: string;
  automated?: boolean;
};

export type Notification = { id: string; at: number; text: string; href: string; read: boolean; kind: "inquiry" | "handoff" | "task" | "maint" };

export type KnowledgeBase = {
  checkIn: string;
  checkOut: string;
  breakfast: string; // e.g. 07:30–10:30
  breakfastIncluded: boolean;
  parking: "free" | "paid" | "none";
  pets: "allowed_small" | "not_allowed";
  petFee: number;
  wifi: boolean;
  receptionHours: string;
  airportTransfer: number; // AMD
  skiShuttle: boolean;
  spaHours: string;
  cancellation: string; // days
};

export type DemoClock = { mode: "live" | "night" };

export type HotelState = {
  baseDate: string; // seed "today", YYYY-MM-DD
  clock: DemoClock;
  roomTypes: RoomType[];
  rooms: Room[];
  hk: Record<string, HkStatus>;
  guests: Guest[];
  reservations: Reservation[];
  hkTasks: HkTask[];
  maint: MaintRequest[];
  staff: Staff[];
  staffTasks: StaffTask[];
  conversations: Conversation[];
  outbox: OutboxItem[];
  activity: ActivityItem[];
  notifications: Notification[];
  workflows: Record<WorkflowId, boolean>;
  kb: KnowledgeBase;
  /** Lost inquiries in the history (declined/expired), for conversion analytics. */
  seq: number;
} & HospitalityState;

/* ---------- events (the only way state changes) ---------- */

export type GuestInput = { firstName: string; lastName: string; phone: string; email: string; lang: Lang };

export type DemoEvent =
  | { type: "inquiry.create"; guest: GuestInput; typeId: RoomTypeId; checkIn: string; checkOut: string; adults: number; children: number; requests: string; source: Source; conversationId?: string }
  | { type: "reservation.approve"; reservationId: string; roomId: string }
  | { type: "reservation.decline"; reservationId: string; reason: string }
  | { type: "reservation.create"; guest: GuestInput; typeId: RoomTypeId; roomId: string | null; checkIn: string; checkOut: string; adults: number; children: number; source: Source; requests: string }
  | { type: "reservation.checkin"; reservationId: string }
  | { type: "reservation.checkout"; reservationId: string }
  | { type: "reservation.cancel"; reservationId: string }
  | { type: "hk.status"; taskId: string; status: TaskStatus }
  | { type: "hk.assign"; taskId: string; assigneeId: string | null }
  | { type: "room.hk"; roomId: string; status: HkStatus }
  | { type: "maint.create"; roomId: string | null; area: string; title: string; description: string; priority: Priority; outOfOrder: boolean }
  | { type: "maint.status"; target: string; status: MaintRequest["status"] }
  | { type: "maint.assign"; target: string; assigneeId: string | null }
  | { type: "staffTask.create"; title: string; detail?: string; assigneeId: string | null; priority: Priority; due: string }
  | { type: "staffTask.status"; target: string; status: TaskStatus }
  | { type: "chat.start"; conversationId: string; lang: Lang }
  | { type: "chat.message"; conversationId: string; msg: ChatMsg }
  | { type: "chat.handoff"; conversationId: string; question: string }
  | { type: "chat.resolve"; conversationId: string }
  | { type: "guest.note"; guestId: string; text: string }
  | { type: "workflow.toggle"; target: WorkflowId; on: boolean }
  | { type: "kb.update"; patch: Partial<KnowledgeBase> }
  | { type: "clock.set"; mode: DemoClock["mode"] }
  | { type: "notifications.read" }
  | HospitalityEvent;

export type StampedEvent = DemoEvent & { id: string; at: number; by: string };

/* ---------- Hospitality OS expansion ---------- */

export type Account = { id: string; guestId: string; email: string; createdAt: number; consent: { marketing: boolean; analytics: boolean }; favourites: string[]; birthday?: string };

export type Tier = { id: string; name: I18n; minPoints: number; discountPct: number; color: string; benefits: I18n[] };
export type LoyaltyConfig = { programName: string; earnPer1000: number; welcomeBonus: number; eligible: { stays: boolean; orders: boolean }; tiers: Tier[] };
export type LedgerEntry = { id: string; guestId: string; at: number; points: number; reason: string; ref?: string };
export type Reward = { id: string; name: I18n; cost: number; kind: "pct" | "amount"; value: number; appliesTo: "stay" | "order"; minTier?: string };
export type Voucher = { id: string; guestId: string; rewardId: string; status: "active" | "reserved" | "used"; createdAt: number; ref?: string };
export type Campaign = { id: string; title: I18n; text: I18n; tierIds: string[]; discountPct: number; appliesTo: "stay" | "order"; active: boolean; createdAt: number; uses: number };

export type MenuCategory = { id: string; name: I18n };
export type MenuOption = { id: string; name: I18n; price: number };
export type MenuItem = { id: string; categoryId: string; name: I18n; desc: I18n; price: number; photo: string; allergens: string[]; tags: string[]; options: MenuOption[]; available: boolean; prepMin: number };
export type Table = { id: string; label: string; seats: number; zone: string };
export type OrderType = "room_service" | "dine_in" | "takeaway";
export type OrderStatus = "submitted" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "rejected" | "cancelled";
export type OrderItem = { itemId: string; qty: number; price: number; options: string[]; note?: string };
export type Order = {
  id: string; code: string; type: OrderType; roomId?: string; tableId?: string; guestId?: string; guestName: string; phone?: string;
  items: OrderItem[]; subtotal: number; discount: number; total: number; note: string; status: OrderStatus; createdAt: number;
  pickupTime?: string; voucherId?: string; history: { at: number; status: OrderStatus; by: string }[]; reason?: string;
};

export type ServiceType = "towels" | "cleaning" | "toiletries" | "maintenance" | "laundry" | "wakeup" | "luggage" | "spa" | "reception" | "checkout" | "issue" | "other";
export type ServiceStatus = "new" | "assigned" | "in_progress" | "done" | "cancelled";
export type ServiceRequest = {
  id: string; code: string; type: ServiceType; dept: Dept; roomId?: string; point?: string; guestId?: string; note: string; when?: string;
  priority: Priority; status: ServiceStatus; assigneeId: string | null; createdAt: number; history: { at: number; text: string; by: string }[];
};

export type TrainingStep = { id: string; kind: "lesson" | "checklist" | "quiz"; title: string; body?: string; items?: string[]; questions?: { q: string; options: string[]; answer: number }[] };
export type TrainingModule = { id: string; title: string; dept: Dept | "all"; positions: Position[] | "all"; minutes: number; steps: TrainingStep[]; custom?: boolean };
export type Enrollment = {
  id: string; employeeId: string; moduleId: string; done: string[]; scores: Record<string, number>;
  status: "in_progress" | "submitted" | "approved" | "changes_requested"; reviewNote?: string; assignedAt: number;
};
export type Sop = { id: string; dept: Dept | "all"; title: string; tags: string[]; body: string[] };

export type Channel = { id: string; kind: "direct" | "department" | "notice" | "task"; name: string; members?: string[]; dept?: Dept; ref?: { kind: "service" | "order" | "reservation" | "task"; id: string } };
export type Msg = { id: string; channelId: string; authorId: string; text: string; at: number; urgent?: boolean; handover?: boolean };

export type Property = { id: string; type: "hotel" | "restaurant" | "hotel_restaurant"; brand: string; modules: string[] };

export type HospitalityState = {
  property: Property;
  accounts: Account[];
  loyalty: LoyaltyConfig;
  ledger: LedgerEntry[];
  rewards: Reward[];
  vouchers: Voucher[];
  campaigns: Campaign[];
  menu: { categories: MenuCategory[]; items: MenuItem[] };
  tables: Table[];
  orders: Order[];
  services: ServiceRequest[];
  training: TrainingModule[];
  enrollments: Enrollment[];
  sops: Sop[];
  channels: Channel[];
  messages: Msg[];
};

export type BookingInput = {
  guest: GuestInput; guestId?: string; typeId: RoomTypeId; rooms: number; checkIn: string; checkOut: string; adults: number; children: number;
  extras: { id: string; qty: number }[]; voucherId?: string; offerId?: string; requests: string;
};

export type HospitalityEvent =
  | { type: "account.register"; accountId: string; guest: GuestInput; email: string; marketing: boolean }
  | { type: "account.update"; accountId: string; consent?: Account["consent"]; favourites?: string[]; phone?: string; preferences?: string[] }
  | { type: "booking.create"; input: BookingInput; source: Source }
  | { type: "reservation.pay"; reservationId: string; method: string }
  | { type: "reservation.guestCancel"; reservationId: string }
  | { type: "loyalty.redeem"; guestId: string; rewardId: string }
  | { type: "loyalty.config"; patch: Partial<LoyaltyConfig> }
  | { type: "campaign.create"; title: string; text: string; tierIds: string[]; discountPct: number; appliesTo: "stay" | "order" }
  | { type: "campaign.toggle"; target: string; active: boolean }
  | { type: "order.create"; order: { type: OrderType; roomId?: string; tableId?: string; guestId?: string; guestName: string; phone?: string; items: { itemId: string; qty: number; options: string[]; note?: string }[]; note: string; pickupTime?: string; voucherId?: string } }
  | { type: "order.status"; target: string; status: OrderStatus; reason?: string }
  | { type: "menu.update"; itemId: string; patch: { price?: number; available?: boolean } }
  | { type: "menu.create"; item: { categoryId: string; name: string; desc: string; price: number; allergens: string[] } }
  | { type: "service.create"; serviceType: ServiceType; roomId?: string; point?: string; guestId?: string; note: string; when?: string }
  | { type: "service.assign"; target: string; assigneeId: string | null }
  | { type: "service.status"; target: string; status: ServiceStatus }
  | { type: "employee.create"; name: string; phone: string; email: string; dept: Dept; position: Position; supervisorId: string | null }
  | { type: "employee.toggle"; target: string; active: boolean }
  | { type: "training.step"; enrollmentId: string; stepId: string; score?: number }
  | { type: "training.submit"; enrollmentId: string }
  | { type: "training.review"; enrollmentId: string; approved: boolean; note: string }
  | { type: "training.module"; title: string; dept: Dept | "all"; positions: Position[] | "all"; lesson: string; checklist: string[] }
  | { type: "msg.send"; channelId: string; text: string; urgent?: boolean; handover?: boolean }
  | { type: "channel.open"; channel: Channel }
  | { type: "property.update"; patch: { type?: Property["type"]; brand?: string } };
