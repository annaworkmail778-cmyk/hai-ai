import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { locales } from "@/i18n/config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** Home-screen icon: the Riseup glyph on black (see BRAND_REPLACEMENT_GUIDE.md). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <svg width="112" height="112" viewBox="0 0 20 20">
          <rect x="1.5" y="12" width="4" height="6.5" rx="1" fill="#f3f2ee" />
        <rect x="7.75" y="8.5" width="4" height="10" rx="1" fill="#f3f2ee" />
        <path d="M14 18.5V7.5h-1.6L16 2.5l3.6 5H18v11z" fill={brand.accent} />
        </svg>
      </div>
    ),
    size,
  );
}
