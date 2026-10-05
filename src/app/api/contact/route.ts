import type { NextRequest } from "next/server";
import { parseContact } from "@/lib/contact/schema";
import { configuredChannels, deliver } from "@/lib/contact/deliver";
import { rateLimit } from "@/lib/contact/rate-limit";

/**
 * Contact form endpoint.
 *
 *   200 { ok: true, delivered: true }                 sent through at least one channel
 *   200 { ok: true, delivered: false, mode: "development" }
 *                                                     no channel configured, dev server only:
 *                                                     the submission is logged, never sent
 *   400 { ok: false, error: "validation", fields }    field error codes
 *   403 / 413 / 415                                   foreign origin, oversized or non-JSON body
 *   429 { ok: false, error: "rate_limited" }
 *   502 { ok: false, error: "delivery_failed" }       every configured channel failed
 *   503 { ok: false, error: "not_configured" }        production without a channel
 */

const MAX_BODY_BYTES = 16 * 1024;

const json = (status: number, body: unknown, headers?: Record<string, string>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  // Same-origin only: browsers always send Origin on cross-site POSTs.
  if (!sameOrigin(request)) return json(403, { ok: false, error: "forbidden" });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { ok: false, error: "unsupported_media_type" });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "too_large" });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  // Honeypot: a field people never see. Bots that fill it get a quiet 200 and
  // nothing is delivered — a human visitor can never reach this branch.
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === "string" && trap.trim() !== "") {
    return json(200, { ok: true, delivered: true });
  }

  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(429, { ok: false, error: "rate_limited" }, { "Retry-After": String(limit.retryAfter) });
  }

  const parsed = parseContact(body);
  if (!parsed.ok) return json(400, { ok: false, error: "validation", fields: parsed.errors });

  if (configuredChannels().length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] No delivery channel configured. Development submission (not sent):", parsed.data);
      return json(200, { ok: true, delivered: false, mode: "development" });
    }
    console.error(
      "[contact] Submission rejected: no delivery channel configured. Set CONTACT_WEBHOOK_URL, TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, or RESEND_API_KEY + CONTACT_EMAIL_TO + CONTACT_EMAIL_FROM.",
    );
    return json(503, { ok: false, error: "not_configured" });
  }

  const results = await deliver(parsed.data);
  const failed = results.filter((r) => !r.ok);
  if (failed.length) console.error("[contact] Channel failures:", failed);
  if (failed.length === results.length) return json(502, { ok: false, error: "delivery_failed" });
  return json(200, { ok: true, delivered: true });
}
