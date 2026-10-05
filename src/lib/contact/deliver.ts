import "server-only";
import { brand } from "@/config/brand";
import { getDictionary } from "@/i18n/dictionaries";
import { isEmail, type ContactPayload } from "./schema";

/**
 * Delivery channels for contact-form submissions. Each one is switched on by
 * environment variables (see README → "Contact form"). Several can run at the
 * same time; a submission counts as delivered when at least one succeeds.
 *
 *   Webhook (CRM, Make, n8n, Zapier, custom API)
 *     CONTACT_WEBHOOK_URL       POST target, receives JSON
 *     CONTACT_WEBHOOK_SECRET    optional, sent as "Authorization: Bearer …"
 *
 *   Telegram
 *     TELEGRAM_BOT_TOKEN        bot token from @BotFather
 *     TELEGRAM_CHAT_ID          chat, group or channel id that receives leads
 *
 *   Email via Resend (https://resend.com)
 *     RESEND_API_KEY
 *     CONTACT_EMAIL_TO          inbox that receives leads (comma-separated for several)
 *     CONTACT_EMAIL_FROM        verified sender, e.g. "Website <hello@yourdomain.com>"
 */

type Channel = "webhook" | "telegram" | "email";
export type DeliveryResult = { channel: Channel; ok: boolean; error?: string };

const TIMEOUT_MS = 8000;

function env(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function configuredChannels(): Channel[] {
  const channels: Channel[] = [];
  if (env("CONTACT_WEBHOOK_URL")) channels.push("webhook");
  if (env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID")) channels.push("telegram");
  if (env("RESEND_API_KEY") && env("CONTACT_EMAIL_TO") && env("CONTACT_EMAIL_FROM")) channels.push("email");
  return channels;
}

/** Human-readable lines shared by the Telegram and email messages. */
function describe(payload: ContactPayload, receivedAt: string) {
  const areaNames = getDictionary("en").diagnostic.categories;
  const areas = payload.areas.map((id) => areaNames.find((c) => c.id === id)?.name ?? id);
  return [
    ["Name", payload.name],
    ["Company", payload.company || "—"],
    ["Contact", payload.contact],
    ["Business", payload.business],
    ["Wants to improve", payload.improve],
    ["Slow process", payload.process || "—"],
    ["Areas", areas.length ? areas.join(", ") : "—"],
    ["Language", payload.locale.toUpperCase()],
    ["Received", receivedAt],
  ] as const;
}

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
}

async function sendWebhook(payload: ContactPayload, receivedAt: string) {
  const secret = env("CONTACT_WEBHOOK_SECRET");
  await post(
    env("CONTACT_WEBHOOK_URL")!,
    { type: "contact_form", source: brand.siteUrl, receivedAt, ...payload },
    secret ? { Authorization: `Bearer ${secret}` } : {},
  );
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function sendTelegram(payload: ContactPayload, receivedAt: string) {
  const lines = describe(payload, receivedAt).map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`);
  const text = [`<b>New inquiry — ${escapeHtml(brand.companyName)}</b>`, "", ...lines].join("\n");
  await post(`https://api.telegram.org/bot${env("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
    chat_id: env("TELEGRAM_CHAT_ID"),
    text: text.length > 4000 ? `${text.slice(0, 3990)}…` : text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}

async function sendEmail(payload: ContactPayload, receivedAt: string) {
  const text = describe(payload, receivedAt)
    .map(([k, v]) => `${k}:\n${v}`)
    .join("\n\n");
  await post(
    "https://api.resend.com/emails",
    {
      from: env("CONTACT_EMAIL_FROM"),
      to: env("CONTACT_EMAIL_TO")!
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      subject: `New inquiry: ${payload.name}${payload.company ? ` (${payload.company})` : ""}`,
      text,
      ...(isEmail(payload.contact) ? { reply_to: payload.contact } : {}),
    },
    { Authorization: `Bearer ${env("RESEND_API_KEY")}` },
  );
}

const senders: Record<Channel, (payload: ContactPayload, receivedAt: string) => Promise<void>> = {
  webhook: sendWebhook,
  telegram: sendTelegram,
  email: sendEmail,
};

export async function deliver(payload: ContactPayload): Promise<DeliveryResult[]> {
  const receivedAt = new Date().toISOString();
  const channels = configuredChannels();
  const settled = await Promise.allSettled(channels.map((channel) => senders[channel](payload, receivedAt)));
  return settled.map((result, i) =>
    result.status === "fulfilled"
      ? { channel: channels[i], ok: true }
      : { channel: channels[i], ok: false, error: String((result.reason as Error)?.message ?? result.reason) },
  );
}
