import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { demos, type DemoId } from "./registry";
import type { DemoSide } from "./types";

/**
 * The two demo screens at one step: the customer's phone and the team's app.
 * Wide containers show both (the focused one bright); narrow containers show
 * only `shownSide`. Used by the interactive player and by static posters.
 * Must sit inside an element with `@container`.
 */
export function DemoStage({
  id,
  locale,
  step,
  shownSide,
  fill = false,
}: {
  id: DemoId;
  locale: Locale;
  step: number;
  /** Side shown on narrow containers; defaults to the step's focus. */
  shownSide?: DemoSide;
  /** Fill the parent's height (posters) instead of the player's fixed height. */
  fill?: boolean;
}) {
  const demo = demos[id];
  const sides = demo.sides[locale];
  const focus = demo.focus[step];
  const shown = shownSide ?? focus;
  const { A, B } = demo;
  const panels: Array<{ side: DemoSide; node: React.ReactNode }> = [
    { side: "a", node: <A step={step} locale={locale} /> },
    { side: "b", node: <B step={step} locale={locale} /> },
  ];

  return (
    <div
      aria-hidden="true"
      data-theme="dark"
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-[#0b0b0c] p-4 @2xl:p-6",
        fill && "h-full",
      )}
    >
      {/* Soft light behind the screens */}
      <span className="pointer-events-none absolute -top-1/3 -left-1/4 -z-10 size-[70%] animate-demo-float rounded-full bg-[radial-gradient(circle,rgb(255_91_20/0.22),transparent_65%)] motion-reduce:animate-none" />
      <span className="pointer-events-none absolute -right-1/4 -bottom-1/3 -z-10 size-[75%] animate-demo-float rounded-full bg-[radial-gradient(circle,rgb(120_110_255/0.14),transparent_65%)] [animation-delay:-4s] motion-reduce:animate-none" />
      <span className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div
        className={cn(
          "grid gap-5 @2xl:grid-cols-[minmax(13rem,0.42fr)_minmax(0,1fr)]",
          fill ? "h-full" : "h-[32rem] @2xl:h-[34rem]",
        )}
      >
        {panels.map(({ side, node }) => {
          const active = focus === side;
          return (
            <div key={side} className={cn("min-h-0 min-w-0 flex-col", shown === side ? "flex" : "hidden @2xl:flex")}>
              <p
                className={cn(
                  "mb-3 flex items-center gap-2 text-small font-medium transition-colors duration-500",
                  active ? "text-paper" : "text-mute",
                )}
              >
                <span className={cn("size-1.5 rounded-full transition-colors duration-500", active ? "bg-signal" : "bg-mute/50")} />
                {sides[side]}
              </p>
              <div
                className={cn(
                  "min-h-0 flex-1 transition-[opacity,filter] duration-500 @2xl:opacity-100",
                  !active && "@2xl:opacity-55 @2xl:saturate-50",
                )}
              >
                {node}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A still frame of a demo, for cards and previews. Fills its (positioned) parent. */
export function DemoPoster({ id, locale, className }: { id: DemoId; locale: Locale; className?: string }) {
  const step = demos[id].posterStep;
  return (
    <div className={cn("@container absolute inset-0 bg-graphite", className)}>
      <DemoStage id={id} locale={locale} step={step} fill />
    </div>
  );
}
