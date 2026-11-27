import "server-only";
import type { NextRequest } from "next/server";
import { EpochMismatch, sessionStore, type StampedEvent } from "./session-store";

/*
 * Shared demo-session HTTP API, used by every vertical:
 * GET  /…/{code}?epoch=…&after=…   → { epoch, epochAt, backend, events: [{key, ev}], count }
 * POST /…/{code} { op: "append", epoch, event }   → { key }    (409 on a stale epoch)
 * POST /…/{code} { op: "reset", pin? }            → { epoch, epochAt }
 * Only allow-listed session codes, small payloads and known event types are accepted.
 */

export type SessionRouteConfig = {
  /** Storage namespace of the vertical ("" = hotel, keeps the original storage names). */
  namespace: string;
  /** Allow-listed event types. */
  types: ReadonlySet<string>;
  maxEvents: number;
  maxBytes: number;
};

type Ctx = { params: Promise<{ code: string }> };

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export function createSessionRoute(cfg: SessionRouteConfig) {
  const CODES = (process.env.DEMO_SESSION_CODES ?? "a,b").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  async function code(params: Promise<{ code: string }>) {
    const c = (await params).code.toLowerCase();
    return CODES.includes(c) ? c : null;
  }

  async function GET(req: NextRequest, { params }: Ctx) {
    const c = await code(params);
    if (!c) return json(404, { error: "unknown_session" });
    try {
      const store = sessionStore(cfg.namespace);
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

  async function POST(req: NextRequest, { params }: Ctx) {
    const c = await code(params);
    if (!c) return json(404, { error: "unknown_session" });
    const raw = await req.text();
    if (raw.length > cfg.maxBytes) return json(413, { error: "too_large" });
    let body: { op?: string; epoch?: string; event?: StampedEvent; pin?: string };
    try { body = JSON.parse(raw); } catch { return json(400, { error: "invalid_json" }); }
    const store = sessionStore(cfg.namespace);
    try {
      if (body.op === "reset") {
        const pin = process.env.DEMO_PRESENTER_PIN;
        if (pin && body.pin !== pin) return json(403, { error: "pin_required" });
        return json(200, await store.reset(c));
      }
      if (body.op === "append") {
        const ev = body.event;
        if (!ev || typeof ev !== "object" || !cfg.types.has(ev.type) || typeof ev.id !== "string" || typeof ev.at !== "number") return json(400, { error: "invalid_event" });
        if (!body.epoch) return json(400, { error: "missing_epoch" });
        const meta = await store.meta(c);
        if (meta.epoch !== body.epoch) return json(409, { error: "stale_epoch", ...meta });
        const { count } = await store.list(c, meta.epoch, "~"); // count only
        if (count >= cfg.maxEvents) return json(429, { error: "session_full" });
        const key = await store.append(c, body.epoch, ev);
        return json(200, { key });
      }
      return json(400, { error: "unknown_op" });
    } catch (e) {
      if (e instanceof EpochMismatch) return json(409, { error: "stale_epoch" });
      return json(503, { error: "store_unavailable", detail: String(e).slice(0, 200) });
    }
  }

  return { GET, POST };
}
