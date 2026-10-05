import { RevealText } from "@/components/motion/Reveal";
import { ButtonLink } from "./Button";
import { Eyebrow } from "./Eyebrow";

/** Quiet closing call to action for secondary pages. */
export function ClosingCTA({
  eyebrow,
  title,
  primary,
  secondary,
  theme = "light",
}: {
  eyebrow: string;
  title: string;
  primary: { href: string; label: string };
  /** Secondary action; external links (mailto, other sites) get the up-right arrow. */
  secondary?: { href: string; label: string; internal?: boolean };
  theme?: "light" | "dark";
}) {
  return (
    <section data-theme={theme} data-nav-theme={theme} aria-label={eyebrow} className="bg-bg text-fg">
      <div className="shell py-(--section-y)">
        <Eyebrow>{eyebrow}</Eyebrow>
        <RevealText as="h2" className="mt-8 max-w-[20ch] text-display-l font-medium">
          {title}
        </RevealText>
        <div className="mt-12 flex flex-wrap gap-4 lg:mt-16">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="outline" arrow={secondary.internal ? "right" : "up-right"}>
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
