/*
 * Optional integration contract: RISEUP Hotel OS ⇄ RISEUP Restaurant OS.
 * Hotel OS does NOT depend on Restaurant OS. When a property links both products, room-service orders
 * placed via the room QR are created in Restaurant OS; Hotel OS keeps only the references it needs
 * (stay, room, folio posting) and shows the status. Types only — no runtime coupling.
 * Transport (production): signed service-to-service HTTPS + webhooks with HMAC signatures, idempotency keys,
 * and per-property link approved by the owner. See docs/HOTEL_OS_TECHNICAL_ARCHITECTURE.md §Integration.
 */

/** Hotel OS → Restaurant OS: create an order for a verified stay. Never contains guest contact data. */
export type RoomServiceOrderRequest = {
  idempotencyKey: string;           // e.g. `${stayId}:${clientOrderId}` — retries never duplicate an order
  propertyLinkId: string;           // approved hotel↔restaurant link
  stayRef: { stayId: string; roomNumber: string; guestFirstName: string }; // minimum necessary
  items: { menuItemId: string; qty: number; modifiers: string[]; note?: string }[];
  chargeTo: "room_folio" | "pay_on_delivery";
  requestedAt: string;              // ISO time
};

/** Restaurant OS → Hotel OS webhook: status changes for display on the guest's stay page and staff apps. */
export type RoomServiceOrderEvent = {
  eventId: string;                  // unique; receivers dedupe on it
  orderId: string; stayId: string; roomNumber: string;
  status: "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "rejected" | "cancelled";
  reason?: string;
  at: string;
};

/** Restaurant OS → Hotel OS: post the completed order total to the room folio (amounts in minor units of the property currency). */
export type FolioPostingRequest = { idempotencyKey: string; stayId: string; label: string; amount: number; currency: "AMD"; orderId: string };

/** Interface a Hotel OS deployment implements when the link is enabled. Absent link ⇒ hotel-only room-service menu. */
export interface RestaurantLink {
  enabled: boolean;
  createOrder(req: RoomServiceOrderRequest): Promise<{ orderId: string }>;
  onOrderEvent(ev: RoomServiceOrderEvent, signature: string): Promise<"applied" | "duplicate" | "rejected">;
  postToFolio(req: FolioPostingRequest): Promise<"posted" | "duplicate" | "stay_closed">;
}
