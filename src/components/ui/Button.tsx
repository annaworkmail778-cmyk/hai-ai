import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Arrow } from "./Arrow";
import { Magnetic } from "@/components/motion/Magnetic";

type Variant = "solid" | "outline" | "signal";
type Size = "md" | "lg";

const VARIANT: Record<Variant, string> = {
  solid: "bg-fg text-bg",
  outline: "border border-rule-strong text-fg hover:border-fg",
  signal: "bg-signal text-black",
};

const SIZE: Record<Size, string> = {
  md: "h-12 px-5 gap-3 text-small",
  lg: "h-14 md:h-16 px-6 md:px-8 gap-4 text-[0.95rem]",
};

function RollingLabel({ children }: { children: ReactNode }) {
  // Two stacked copies; on hover the first rolls up and the second rolls in.
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-(--dur-ui) ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-(--dur-ui) ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  magnetic?: boolean;
  arrow?: "right" | "up-right" | "down" | false;
};

/** Primary call-to-action link. Rectangular, architectural, magnetic on desktop. */
export function ButtonLink({
  children,
  variant = "solid",
  size = "lg",
  className,
  magnetic = true,
  arrow = "right",
  ...props
}: ButtonLinkProps) {
  const link = (
    <Link
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-between rounded-xs font-medium tracking-[-0.005em] whitespace-nowrap transition-colors duration-(--dur-ui) ease-out",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
    >
      <RollingLabel>{children}</RollingLabel>
      {arrow && (
        <Arrow
          direction={arrow}
          className="text-[1.1em] transition-transform duration-(--dur-ui) ease-out group-hover:translate-x-1"
        />
      )}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}

type ArrowLinkProps = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  children: ReactNode;
  className?: string;
  direction?: "right" | "up-right" | "down";
};

/** Inline text link with hairline underline and travelling arrow. */
export function ArrowLink({ children, className, direction = "right", ...props }: ArrowLinkProps) {
  return (
    <Link {...props} className={cn("group inline-flex items-center gap-3 font-medium", className)}>
      <span className="link-underline pb-1">{children}</span>
      <Arrow
        direction={direction}
        className="transition-transform duration-(--dur-ui) ease-out group-hover:translate-x-1.5"
      />
    </Link>
  );
}
