import { Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * Renders text as words inside clip masks, ready for scroll-scrubbed reveals
 * (animate `[data-word]` elements). Words reflow naturally on resize.
 * Spaces stay real text nodes, so the sentence reads normally to assistive tech.
 */
export function MaskedWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="-my-[0.16em] inline-block overflow-clip py-[0.16em] align-top">
            <span data-word className={cn("inline-block will-change-transform", className)}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}
