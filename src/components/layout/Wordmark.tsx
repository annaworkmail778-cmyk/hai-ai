import { brand } from "@/config/brand";
import { LOGO } from "@/config/logo";
import { cn } from "@/lib/cn";

/**
 * Riseup logo: the R mark (in the current text colour, with the orange arrow)
 * followed by the "Riseup" wordmark. Paths come from src/config/logo.ts, so
 * one component works on dark and light sections.
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span role="img" aria-label={brand.companyName} className={cn("inline-flex items-center gap-2", className)}>
      <BrandGlyph className="h-[1.45em] w-auto shrink-0" />
      {!compact && (
        <svg viewBox={LOGO.wordViewBox} aria-hidden="true" focusable="false" className="h-[0.95em] w-auto shrink-0">
          <path fill="currentColor" fillRule="evenodd" d={LOGO.word} />
        </svg>
      )}
    </span>
  );
}

/** The R mark with the orange arrow. */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO.markViewBox} aria-hidden="true" focusable="false" className={className}>
      <path fill="currentColor" fillRule="evenodd" d={LOGO.mark} />
      <path fill="var(--color-signal)" fillRule="evenodd" d={LOGO.swoosh} />
    </svg>
  );
}
