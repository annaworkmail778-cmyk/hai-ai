import { createSessionRoute } from "@/lib/server/session-route";

/* Restaurant OS demo session API (separate namespace from the hotel; same shared implementation). */

export const dynamic = "force-dynamic";

const TYPES = new Set([
  "order.submit", "order.accept", "order.reject", "order.cancel", "order.addLines", "order.voidLine", "order.remake", "order.serve", "order.pickup",
  "ticket.start", "ticket.ready", "ticket.bump", "ticket.recall", "ticket.rush",
  "table.open", "table.close", "table.clean", "table.request", "request.ack", "request.done",
  "menu.availability", "menu.price", "ingredient.price", "recipe.qty", "stock.waste", "stock.adjust",
  "po.create", "po.send", "po.receive", "settings.update", "automation.toggle", "notices.read",
]);

const route = createSessionRoute({ namespace: "restaurant", types: TYPES, maxEvents: 1500, maxBytes: 8 * 1024 });
export const GET = route.GET;
export const POST = route.POST;
