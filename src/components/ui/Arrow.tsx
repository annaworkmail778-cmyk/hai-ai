import { cn } from "@/lib/cn";

type ArrowProps = {
  className?: string;
  /** "right" →, "up-right" ↗, "down" ↓, "up" ↑, "left" ← */
  direction?: "right" | "up-right" | "down" | "up" | "left";
  strokeWidth?: number;
};

const ROTATION: Record<NonNullable<ArrowProps["direction"]>, number> = {
  right: 0,
  "up-right": -45,
  down: 90,
  up: -90,
  left: 180,
};

/** Thin architectural arrow. Inherits colour from text. */
export function Arrow({ className, direction = "right", strokeWidth = 1.25 }: ArrowProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block size-[1em] shrink-0", className)}
      style={{ rotate: `${ROTATION[direction]}deg` }}
    >
      <path d="M3 12h17.5M14 5.5 20.5 12 14 18.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

export function PlusIcon({ className, open = false }: { className?: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={cn("inline-block size-[1em]", className)}>
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M12 2v20"
        stroke="currentColor"
        strokeWidth="1.25"
        style={{
          transformOrigin: "center",
          transform: open ? "scaleY(0)" : "scaleY(1)",
          transition: "transform var(--dur-ui) var(--ease-out)",
        }}
      />
    </svg>
  );
}
