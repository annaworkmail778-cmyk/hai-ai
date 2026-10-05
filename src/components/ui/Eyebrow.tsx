import { cn } from "@/lib/cn";

/**
 * Section label: mono, uppercase, with an optional index and a small
 * accent marker — the recurring "drawing annotation" of the site.
 */
export function Eyebrow({
  children,
  index,
  className,
  marker = true,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
  marker?: boolean;
}) {
  return (
    <p className={cn("label flex items-center gap-3 text-fg-mute", className)}>
      {marker && <span aria-hidden="true" className="inline-block size-1.5 bg-signal" />}
      {index && <span className="text-fg">{index}</span>}
      <span>{children}</span>
    </p>
  );
}
