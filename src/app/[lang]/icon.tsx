import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { LOGO } from "@/config/logo";
import { locales } from "@/i18n/config";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Browser-tab icon: the Riseup glyph on a black rounded square.
 * Generated (not a static .svg) because a static metadata file inside the
 * dynamic [lang] segment fails to prerender on Vercel.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", borderRadius: 14 }}>
        <svg width="50" height="44" viewBox={LOGO.markViewBox}>
          <path fill="#f3f2ee" fillRule="evenodd" d={LOGO.mark} />
          <path fill={brand.accent} fillRule="evenodd" d={LOGO.swoosh} />
        </svg>
      </div>
    ),
    size,
  );
}
