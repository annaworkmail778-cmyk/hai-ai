import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { locales } from "@/i18n/config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** Home-screen icon: the placeholder brand glyph on black (see BRAND_REPLACEMENT_GUIDE.md). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <svg width="112" height="112" viewBox="0 0 20 20">
          <rect x="0.75" y="0.75" width="18.5" height="18.5" fill="none" stroke="#f3f2ee" strokeWidth="1.3" />
          <rect x="10" y="4" width="6" height="6" fill={brand.accent} />
          <path d="M4 16h12M4 12.5h4" stroke="#f3f2ee" strokeWidth="1.3" />
        </svg>
      </div>
    ),
    size,
  );
}
