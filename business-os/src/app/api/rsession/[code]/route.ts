import { createSessionRoute } from "@/lib/server/session-route";

/* Restaurant OS demo session API (separate namespace from the hotel; same shared implementation). */

export const dynamic = "force-dynamic";

const TYPES = new Set([
  "automation.toggle", "bill.prepare", "brand.theme", "customer.update", "day.close", "inbox.assign", "inbox.autoreply", "inbox.note",
  "inbox.read", "inbox.receive", "inbox.send", "inbox.status", "inbox.tag", "ingredient.price", "loyalty.config", "menu.availability",
  "menu.price", "notices.read", "order.accept", "order.addLines", "order.cancel", "order.fireCourse", "order.moveLines", "order.pickup",
  "order.reject", "order.remake", "order.serve", "order.submit", "order.voidLine", "payment.record", "payment.request", "payment.result",
  "po.approve", "po.cancel", "po.create", "po.receive", "po.send", "recipe.qty", "request.ack", "request.done",
  "reservation.cancel", "reservation.confirm", "reservation.decline", "reservation.modify", "reservation.noShow", "reservation.remind", "reservation.request", "reservation.seat",
  "review.receive", "review.reply", "settings.update", "shift.handover", "stock.adjust", "stock.count", "stock.waste", "table.assign",
  "table.block", "table.clean", "table.close", "table.layout", "table.merge", "table.notes", "table.open", "table.request",
  "table.transfer", "task.create", "task.done", "team.msg", "ticket.bump", "ticket.itemDone", "ticket.ready", "ticket.recall",
  "ticket.reopen", "ticket.rush", "ticket.start", "waitlist.add", "waitlist.notify", "waitlist.remove", "waitlist.seat",
]);

const route = createSessionRoute({ namespace: "restaurant", types: TYPES, maxEvents: 1500, maxBytes: 8 * 1024 });
export const GET = route.GET;
export const POST = route.POST;
