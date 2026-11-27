"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function Qr({ value, size = 200, className }: { value: string; size?: number; className?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121212", light: "#ffffff" } }).then(setSvg).catch(() => setSvg(""));
  }, [value]);
  return <div className={className} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} aria-label={`QR: ${value}`} role="img" />;
}

/** Guest URL for the current presenter session. Uses the stable riseup-group.com/go/… path when configured. */
export function guestUrl(session: string, origin: string) {
  const base = process.env.NEXT_PUBLIC_QR_BASE_URL;
  return base ? `${base.replace(/\/$/, "")}/go/h-${session}` : `${origin}/s/${session}/hotel`;
}
