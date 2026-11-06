import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/**
 * Brand mark + name. Driven entirely by src/config/brand.ts:
 *  - logo.type "wordmark": renders the placeholder glyph + company name
 *  - logo.type "svg": renders the final logo file in the current text colour
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  const logo = brand.logo;

  if (logo.type === "svg") {
    // The SVG's shape is used as a mask filled with the current text colour,
    // so one file works on dark and light sections.
    const mask = `url(${logo.src}) left center / contain no-repeat`;
    return (
      <span
        role="img"
        aria-label={brand.companyName}
        className={cn("inline-block shrink-0 bg-current", className)}
        style={{ width: logo.width, height: logo.height, mask, WebkitMask: mask }}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandGlyph className="size-[1.15em] shrink-0" />
      {!compact && (
        <span className="leading-none font-semibold tracking-[-0.01em] text-[1.05rem] whitespace-nowrap ">
          {brand.companyName}
        </span>
      )}
    </span>
  );
}

/**
 * Riseup glyph: three rising steps, the last one an arrow in the accent colour.
 * Replace with the final mark when the logo is ready (see BRAND_REPLACEMENT_GUIDE.md).
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className}>
      <rect x="1.5" y="12" width="4" height="6.5" rx="1" fill="currentColor" />
      <rect x="7.75" y="8.5" width="4" height="10" rx="1" fill="currentColor" />
      <path d="M14 18.5V7.5h-1.6L16 2.5l3.6 5H18v11z" fill="var(--color-signal)" />
    </svg>
  );
}
