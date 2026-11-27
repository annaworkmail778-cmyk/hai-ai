import { createSessionRoute } from "@/lib/server/session-route";

/*
 * Hotel OS demo session API (behaviour unchanged; implementation shared with other verticals).
 * GET  /api/session/a?epoch=…&after=…   → { epoch, epochAt, backend, events: [{key, ev}], count }
 * POST /api/session/a { op: "append", epoch, event }   → { key }    (409 on a stale epoch)
 * POST /api/session/a { op: "reset", pin? }            → { epoch, epochAt }
 */

export const dynamic = "force-dynamic";

const TYPES = new Set([
  "inquiry.create", "reservation.approve", "reservation.decline", "reservation.create", "reservation.checkin", "reservation.checkout",
  "reservation.cancel", "hk.status", "hk.assign", "room.hk", "maint.create", "maint.status", "maint.assign", "staffTask.create",
  "staffTask.status", "chat.start", "chat.message", "chat.handoff", "chat.resolve", "guest.note", "workflow.toggle", "kb.update",
  "clock.set", "notifications.read",
  "account.register", "account.update", "booking.create", "reservation.pay", "reservation.guestCancel", "loyalty.redeem", "loyalty.config",
  "campaign.create", "campaign.toggle", "order.create", "order.status", "menu.update", "menu.create", "service.create", "service.assign",
  "service.status", "employee.create", "employee.toggle", "training.step", "training.submit", "training.review", "training.module",
  "msg.send", "channel.open",
]);

const route = createSessionRoute({ namespace: "", types: TYPES, maxEvents: 1500, maxBytes: 8 * 1024 });
export const GET = route.GET;
export const POST = route.POST;
