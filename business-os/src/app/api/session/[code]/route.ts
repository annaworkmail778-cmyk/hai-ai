import type { NextRequest } from "next/server";
import { EpochMismatch, sessionStore } from "@/lib/server/session-store";
import type { StampedEvent } from "@/lib/types";

/*
 * GET  /api/session/a?epoch=…&after=…   → { epoch, epochAt, backend, events: [{key, ev}], count }
 * POST /api/session/a { op: "append", epoch, event }   → { key }    (409 on a stale epoch)
 * POST /api/session/a { op: "reset", pin? }            → { epoch, epochAt }
 * Only allow-listed session codes, small payloads and known event types are accepted.
 */

export const dynamic = "force-dynamic";

const CODES = (process.env.DEMO_SESSION_CODES ?? "a,b").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const MAX_BYTES = 8 * 1024;
const MAX_EVENTS = 1500;
const TYPES = new Set([
  "property.update",
  "inquiry.create", "reservation.approve", "reservation.decline", "reservation.create", "reservation.checkin", "reservation.checkout",
  "reservation.cancel", "hk.status", "hk.assign", "room.hk", "maint.create", "maint.status", "maint.assign", "staffTask.create",
  "staffTask.status", "chat.start", "chat.message", "chat.handoff", "chat.resolve", "guest.note", "workflow.toggle", "kb.update",
  "clock.set", "notifications.read",
  "account.register", "account.update", "booking.create", "reservation.pay", "reservation.guestCancel", "loyalty.redeem", "loyalty.config",
  "campaign.create", "campaign.toggle", "order.create", "order.status", "menu.update", "menu.create", "service.create", "service.assign",
  "service.status", "employee.create", "employee.toggle", "training.step", "training.submit", "training.review", "training.module",
  "msg.send", "channel.open",
]);

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function code(params: Promise<{ code: string }>) {
  const c = (await params).code.toLowerCase();
  return CODES.includes(c) ? c : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const c = await code(params);
  if (!c) return json(404, { error: "unknown_session" });
  try {
    const store = sessionStore();
    const meta = await store.meta(c);
    const epoch = req.nextUrl.searchParams.get("epoch");
    const after = req.nextUrl.searchParams.get("after");
    const sameEpoch = epoch === meta.epoch;
    const { events, count } = await store.list(c, meta.epoch, sameEpoch ? after : null);
    return json(200, { ...meta, backend: store.backend, events, count });
  } catch (e) {
    return json(503, { error: "store_unavailable", detail: String(e).slice(0, 200) });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const c = await code(params);
  if (!c) return json(404, { error: "unknown_session" });
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return json(413, { error: "too_large" });
  let body: { op?: string; epoch?: string; event?: StampedEvent; pin?: string };
  try { body = JSON.parse(raw); } catch { return json(400, { error: "invalid_json" }); }
  const store = sessionStore();
  try {
    if (body.op === "reset") {
      const pin = process.env.DEMO_PRESENTER_PIN;
      if (pin && body.pin !== pin) return json(403, { error: "pin_required" });
      return json(200, await store.reset(c));
    }
    if (body.op === "append") {
      const ev = body.event;
      if (!ev || typeof ev !== "object" || !TYPES.has(ev.type) || typeof ev.id !== "string" || typeof ev.at !== "number") return json(400, { error: "invalid_event" });
      if (!body.epoch) return json(400, { error: "missing_epoch" });
      const meta = await store.meta(c);
      if (meta.epoch !== body.epoch) return json(409, { error: "stale_epoch", ...meta });
      const { count } = await store.list(c, meta.epoch, "~"); // count only
      if (count >= MAX_EVENTS) return json(429, { error: "session_full" });
      const key = await store.append(c, body.epoch, ev);
      return json(200, { key });
    }
    return json(400, { error: "unknown_op" });
  } catch (e) {
    if (e instanceof EpochMismatch) return json(409, { error: "stale_epoch" });
    return json(503, { error: "store_unavailable", detail: String(e).slice(0, 200) });
  }
}
