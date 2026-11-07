import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { LOGO } from "@/config/logo";
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
        <svg width="132" height="117" viewBox={LOGO.markViewBox}>
          <path fill="#f3f2ee" fillRule="evenodd" d={LOGO.mark} />
          <path fill={brand.accent} fillRule="evenodd" d={LOGO.swoosh} />
        </svg>
      </div>
    ),
    size,
  );
}
