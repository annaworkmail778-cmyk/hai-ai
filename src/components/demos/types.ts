import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";

/** "a" is the customer-facing side (a phone), "b" the side the business works in (an app). */
export type DemoSide = "a" | "b";

export type DemoStep = {
  /** Short step name, also shown in the step list. */
  title: string;
  /** One or two plain sentences explaining what happens. */
  text: string;
};

export type ScreenProps = { step: number; locale: Locale };

/**
 * One interactive demo: a short story in steps, shown on two screens.
 * Captions and screen text are written per language in the demo's own file.
 */
export type DemoDefinition = {
  /** Which screen the story focuses on at each step (one entry per step). */
  focus: DemoSide[];
  /** Step shown as the still frame on cards and previews. */
  posterStep: number;
  /** Screen names, e.g. "Customer's phone" / "Your CRM". */
  sides: Record<Locale, Record<DemoSide, string>>;
  steps: Record<Locale, DemoStep[]>;
  /** Customer-side screen, drawn as a phone. */
  A: ComponentType<ScreenProps>;
  /** Business-side screen, drawn as an app window. */
  B: ComponentType<ScreenProps>;
};
