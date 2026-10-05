import Image from "next/image";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/**
 * Brand mark + name. Driven entirely by src/config/brand.ts:
 *  - logo.type "wordmark": renders the placeholder glyph + company name
 *  - logo.type "svg": renders the final logo file
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  const logo = brand.logo;

  if (logo.type === "svg") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <Image src={logo.src} alt={brand.companyName} width={logo.width} height={logo.height} priority unoptimized />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandGlyph className="size-[1.15em] shrink-0" />
      {!compact && (
        <span className="text-[0.95rem] leading-none font-semibold tracking-[0.02em] whitespace-nowrap uppercase">
          {brand.companyName}
        </span>
      )}
    </span>
  );
}

/**
 * Placeholder brand glyph: a structural frame holding one solid module.
 * Replace with the final mark (see BRAND_REPLACEMENT_GUIDE.md).
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className}>
      <rect x="0.75" y="0.75" width="18.5" height="18.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="4" width="6" height="6" fill="var(--color-signal)" />
      <path d="M4 16h12M4 12.5h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
