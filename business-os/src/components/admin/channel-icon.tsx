import type { MsgChannel } from "@/lib/types";

export const CHANNEL_LABEL: Record<MsgChannel, string> = { whatsapp: "WhatsApp", instagram: "Instagram", messenger: "Messenger", webchat: "Կայքի չատ", email: "Էլ․ փոստ", booking: "Booking.com" };
const COLOR: Record<MsgChannel, string> = { whatsapp: "#25a244", instagram: "#c13584", messenger: "#0a7cff", webchat: "#ff5b14", email: "#6b6963", booking: "#003580" };

/** Simple, brand-neutral channel glyphs (colored initials) — not official logos. */
export function ChannelIcon({ c, size = 16 }: { c: MsgChannel; size?: number }) {
  const letter = { whatsapp: "W", instagram: "IG", messenger: "M", webchat: "W", email: "@", booking: "B" }[c];
  return (
    <span aria-label={CHANNEL_LABEL[c]} className="inline-grid shrink-0 place-items-center rounded-[30%] font-bold text-white" style={{ width: size, height: size, background: COLOR[c], fontSize: Math.max(7, size * (letter.length > 1 ? 0.42 : 0.58)) }}>
      {c === "webchat" ? "●" : letter}
    </span>
  );
}
