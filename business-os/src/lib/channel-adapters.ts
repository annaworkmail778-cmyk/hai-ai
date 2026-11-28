/*
 * Integration layer (contracts + honest catalog). NOTHING here talks to an external system.
 *
 * - `ChannelAdapter` is the contract a real OTA / channel-manager connector must implement in production.
 * - `DEMO_ADAPTER` produces fixture bookings so the demo can show import / modify / cancel / conflict flows.
 * - `INTEGRATIONS` is the catalog shown in /admin/integrations. Facts come from official vendor docs
 *   (see docs/HOTEL_OS_INTEGRATION_MATRIX.md for sources and dates). Status is NEVER "connected" in the demo.
 */
import type { OtaBooking, OtaChannel, RoomTypeId } from "./types.ts";

export const COMMISSION_PCT: Record<OtaChannel, number> = { booking: 15, expedia: 18, airbnb: 3 };

/** Production contract for a reservation channel connector (direct OTA API or via a channel manager / PMS). */
export interface ChannelAdapter {
  channel: OtaChannel;
  /** Pull new/modified/cancelled reservations since a cursor (or receive them via verified webhook). */
  fetchReservations(cursor: string | null): Promise<{ bookings: (OtaBooking & { status: "new" | "modified" | "cancelled"; version: number })[]; cursor: string }>;
  /** Confirm receipt so the channel stops re-sending (idempotent). */
  acknowledge(externalId: string, version: number): Promise<void>;
  /** Push availability / rates for mapped room types. Must be dry-run capable in non-production. */
  pushAvailability(updates: { typeId: RoomTypeId; date: string; available: number; rate: number }[], opts: { dryRun: boolean }): Promise<{ accepted: number; rejected: { date: string; reason: string }[] }>;
}

/** Integration catalog entry. `class` follows the brief: 1 official & implementable, 2 needs provider approval,
 *  3 needs an integration partner, 4 not currently feasible, 5 demo-only. */
export type IntegrationClass = 1 | 2 | 3 | 4 | 5;
export type Integration = {
  id: string; name: string; area: "messaging" | "reviews" | "distribution" | "pms" | "payments" | "restaurant";
  cls: IntegrationClass; demo: "simulated" | "none";
  official: string; auth: string; requirements: string; limits: string; alternative: string; source: string;
};

export const CLASS_LABEL: Record<IntegrationClass, string> = {
  1: "Պաշտոնական API, իրագործելի",
  2: "Պահանջում է մատակարարի հաստատում",
  3: "Պահանջում է ինտեգրացիոն գործընկեր",
  4: "Ներկայումս անհնար",
  5: "Միայն ցուցադրական",
};

export const INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business (Cloud API)", area: "messaging", cls: 2, demo: "simulated", official: "Meta WhatsApp Cloud API · webhooks for inbound messages", auth: "Meta Business account, verified phone number, system-user access token", requirements: "Business verification; message templates approved by Meta for messages outside the window; user opt-in", limits: "Free-form replies only inside the 24-hour customer-service window; outside it only approved templates", alternative: "Business Solution Provider (e.g. 360dialog, Twilio) if direct onboarding is impractical", source: "developers.facebook.com/documentation/business-messaging/whatsapp" },
  { id: "instagram", name: "Instagram Direct", area: "messaging", cls: 2, demo: "simulated", official: "Instagram Messaging API (Messenger Platform / Instagram API with Instagram Login)", auth: "OAuth; instagram_business_manage_messages (or instagram_manage_messages via Facebook Login)", requirements: "Professional (business) account; Meta App Review; escalation path to a human is mandatory", limits: "24-hour standard window; Human Agent tag (up to 7 days) requires separate approval", alternative: "Meta Business Suite inbox (manual) until App Review passes", source: "developers.facebook.com/documentation/business-messaging/instagram-messaging" },
  { id: "messenger", name: "Facebook Messenger", area: "messaging", cls: 2, demo: "simulated", official: "Messenger Platform Send API + webhooks", auth: "Page access token via OAuth; pages_messaging", requirements: "Meta App Review; Human Agent permission is not available in standard access", limits: "24-hour standard window; HUMAN_AGENT tag allows replies within 7 days for human support only", alternative: "Meta Business Suite inbox (manual)", source: "developers.facebook.com/docs/messenger-platform" },
  { id: "webchat", name: "Website chat", area: "messaging", cls: 1, demo: "simulated", official: "Own widget on the hotel website (part of Hotel OS)", auth: "Hotel OS backend", requirements: "None external", limits: "Only visitors of the hotel site", alternative: "—", source: "Hotel OS" },
  { id: "email", name: "E-mail (IMAP/SMTP or Gmail / Microsoft Graph)", area: "messaging", cls: 1, demo: "simulated", official: "IMAP/SMTP, Gmail API, Microsoft Graph", auth: "OAuth 2.0 (Gmail/Graph) or app passwords", requirements: "Mailbox owner consent; SPF/DKIM for outbound", limits: "Provider sending quotas", alternative: "Forwarding address into Hotel OS", source: "developers.google.com/gmail/api · learn.microsoft.com/graph" },
  { id: "booking_msg", name: "Booking.com guest messages", area: "messaging", cls: 3, demo: "simulated", official: "Booking.com Messaging API (Connectivity)", auth: "Machine account credentials issued to Connectivity Partners", requirements: "Booking.com Connectivity Partner status, or a certified channel manager/PMS that exposes messages", limits: "Inbound pulled from a queue (max 100 per request); guests can message from booking until 66 days after checkout", alternative: "Use a certified channel manager; otherwise reply in the Booking.com extranet", source: "developers.booking.com/connectivity/docs/messaging-api" },
  { id: "google_reviews", name: "Google Business Profile reviews", area: "reviews", cls: 2, demo: "simulated", official: "Business Profile API: accounts.locations.reviews list / updateReply", auth: "OAuth 2.0, scope business.manage", requirements: "Verified location; Google API access approval for Business Profile APIs", limits: "Reply only for verified locations; replies can be rejected by policy", alternative: "Reply manually in Google Business Profile", source: "developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews" },
  { id: "booking_reviews", name: "Booking.com reviews", area: "reviews", cls: 3, demo: "simulated", official: "Booking.com Reviews API (retrieve + reply by review ID)", auth: "Connectivity machine account", requirements: "Connectivity Partner (Hotels segment); reviews for internal use only, not for public display", limits: "Reply via API only through an approved partner", alternative: "Reply in the Booking.com extranet", source: "developers.booking.com/connectivity/docs/review-api" },
  { id: "tripadvisor", name: "Tripadvisor", area: "reviews", cls: 4, demo: "simulated", official: "Content API is read-oriented and gated; no documented public endpoint for management responses", auth: "API key (approval required)", requirements: "Partner approval", limits: "Management responses are made in the Tripadvisor Management Center", alternative: "Manual reply (Hotel OS drafts it, a person posts it); review-management partners where available", source: "tripadvisor-content-api.readme.io · tripadvisor.com Management Responses" },
  { id: "expedia_reviews", name: "Expedia reviews", area: "reviews", cls: 3, demo: "simulated", official: "Available to Expedia connectivity partners (verify in Partner Central docs)", auth: "Partner credentials", requirements: "Expedia Connectivity Partner Program", limits: "Unverified for this project", alternative: "Reply in Expedia Partner Central", source: "developers.expediagroup.com/supply/lodging" },
  { id: "booking_res", name: "Booking.com reservations & ARI", area: "distribution", cls: 3, demo: "simulated", official: "Connectivity APIs (B_XML / OTA reservations, availability & rates)", auth: "Connectivity machine account", requirements: "Connectivity Partner onboarding, certification, PII (and PCI if card data) compliance; onboarding may be closed periodically", limits: "Must support required API functions; continuous API changes", alternative: "Certified channel manager (SiteMinder, Cloudbeds, Mews partners…)", source: "developers.booking.com/connectivity/docs" },
  { id: "expedia_res", name: "Expedia reservations & ARI", area: "distribution", cls: 3, demo: "simulated", official: "Expedia Lodging connectivity (Booking Notification API, AR/Product APIs)", auth: "Partner credentials (EQC)", requirements: "Connectivity Partner Program + end-to-end certification; Booking Retrieval API is closed to new adoption", limits: "Certification required before production", alternative: "Certified channel manager", source: "developers.expediagroup.com/supply/lodging" },
  { id: "airbnb", name: "Airbnb", area: "distribution", cls: 4, demo: "simulated", official: "API only for invited software partners; not accepting new access requests", auth: "Partner only", requirements: "Invitation by Airbnb", limits: "Docs not public", alternative: "Use a channel manager that is an Airbnb software partner; iCal is availability-only and NOT a full integration", source: "airbnb.com/terms/api · partner page" },
  { id: "siteminder", name: "SiteMinder", area: "pms", cls: 3, demo: "none", official: "pmsXchange (PMS/RMS/CRS) · SiteConnect (booking channels)", auth: "Partner credentials", requirements: "Partnership agreement; Partner Integrations team issues test credentials", limits: "SiteConnect and Channels Plus cannot be combined in one integration", alternative: "Cloudbeds / Mews / other channel managers", source: "developer.siteminder.com" },
  { id: "cloudbeds", name: "Cloudbeds", area: "pms", cls: 2, demo: "none", official: "Cloudbeds API (reservations, rooms, availability, folios, guests) + webhooks", auth: "API keys (preferred) or OAuth 2.0; OAuth flow mandatory for certified partners", requirements: "Partner certification for marketplace apps", limits: "Refresh token expires after 365 days of inactivity", alternative: "—", source: "developers.cloudbeds.com" },
  { id: "mews", name: "Mews", area: "pms", cls: 2, demo: "none", official: "Mews Connector API (OpenAPI) + General Webhooks / WebSockets", auth: "Client token + access token per property", requirements: "Mews integration partner onboarding; webhook endpoint registered via support", limits: "Webhook delivery retried, then discarded; one endpoint per type per client", alternative: "Polling reservations endpoint", source: "docs.mews.com/connector-api" },
  { id: "payments", name: "Online payments / deposits", area: "payments", cls: 3, demo: "none", official: "Local acquirer or international PSP (to be selected)", auth: "PSP keys in a secret store", requirements: "Merchant agreement, PCI-DSS scope via hosted fields", limits: "—", alternative: "Manual payment recording (current demo)", source: "—" },
  { id: "restaurant_os", name: "RISEUP Restaurant OS", area: "restaurant", cls: 1, demo: "simulated", official: "RISEUP integration contract (lib/integrations/restaurant-contract.ts)", auth: "Signed service-to-service tokens per property pair", requirements: "Both products purchased; property link approved by the owner", limits: "Optional — Hotel OS works without it", alternative: "Hotel-only room-service menu", source: "RISEUP" },
];

/** Demo adapter: deterministic fixture bookings for presenter scenarios and tests. Clearly simulated. */
export function demoOtaBooking(channel: OtaChannel, seq: number, checkIn: string, checkOut: string, typeId: RoomTypeId = "deluxe"): OtaBooking {
  const names: [string, string, "en" | "ru"][] = [["Laura", "Becker", "en"], ["Илья", "Смирнов", "ru"], ["Tom", "Walsh", "en"]];
  const [first, last, lang] = names[seq % names.length];
  const nights = Math.max(1, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400e3));
  return {
    channel, externalId: `${channel === "booking" ? "BDC" : channel === "expedia" ? "EXP" : "ABB"}-${9000000 + seq}`, typeId, checkIn, checkOut, adults: 2, children: 0,
    guest: { firstName: first, lastName: last, phone: `+000 555 ${String(3000 + seq).padStart(4, "0")}`, email: `${first.toLowerCase()}.demo${seq}@example.com`.replace(/[^\x20-\x7e]/g, "x"), lang },
    total: 52000 * nights,
  };
}
