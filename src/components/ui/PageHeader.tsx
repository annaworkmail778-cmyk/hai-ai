import type { ReactNode } from "react";
import { RevealText, Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "./Eyebrow";

/** Editorial opening for secondary pages: label, oversized title, offset intro. */
export function PageHeader({
  eyebrow,
  index,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  index?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="shell pt-[calc(var(--nav-h)+clamp(4rem,12vh,9rem))] pb-16 lg:pb-24">
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <RevealText as="h1" immediate className="mt-8 max-w-[16ch] text-display-l font-medium sm:text-display-xl">
        {title}
      </RevealText>
      {(intro || children) && (
        <div className="grid-editorial mt-12 lg:mt-16">
          {intro && (
            <Reveal className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-7" delay={0.3}>
              <p className="text-lead text-fg-mute">{intro}</p>
            </Reveal>
          )}
          {children}
        </div>
      )}
    </header>
  );
}
