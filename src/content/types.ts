import type { Locale } from "@/i18n/config";
import type { CapabilityId } from "@/config/navigation";
import type { CompositionId } from "@/components/visuals/registry";

/**
 * PORTFOLIO CONTENT SCHEMA
 * Every project is one file in src/content/projects/ that exports a `Project`.
 * See PROJECT_CONTENT_GUIDE.md for the step-by-step workflow.
 */

/** Text with English required and other languages optional (falls back to English). */
export type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

/** A visual used as cover or in the gallery. */
export type Visual =
  /** A real image in /public (e.g. "/projects/my-project/cover.jpg"). */
  | {
      kind: "image";
      src: string;
      alt: LocalizedText;
      /** CSS object-position, e.g. "50% 30%". */
      position?: string;
    }
  /** A muted, looping video. Never autoplays with sound; poster is required. */
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: LocalizedText;
    }
  /** A coded art-directed composition (used until real assets exist). */
  | {
      kind: "composition";
      id: CompositionId;
      alt: LocalizedText;
      /** Part kept in frame when a portrait slot crops the 16:10 composition. Default "center". */
      focus?: "left" | "center" | "right";
    };

export type GalleryLayout =
  /** Edge-to-edge, full width. */
  | "full"
  /** Large visual left, caption right. */
  | "split-left"
  /** Large visual right, caption left. */
  | "split-right"
  /** Inset with generous margins. */
  | "inset";

export type GalleryItem = {
  visual: Visual;
  layout: GalleryLayout;
  caption?: LocalizedText;
};

/** Nodes and connections for the case-study system diagram. */
export type SystemMap = {
  nodes: Array<{ id: string; group: "input" | "core" | "output"; label: LocalizedText }>;
  edges: Array<[from: string, to: string]>;
};

/** All human-readable text of a project, per language. */
export type ProjectContent = {
  title: string;
  subtitle: string;
  client: string;
  industry: string;
  projectType: string;
  /** One sentence for listings and SEO. */
  shortDescription: string;
  /** One line each — used on the homepage presentation. */
  challenge: string;
  solution: string;
  /** Case-study sections. */
  context: string;
  challengeDetail: string[];
  /** "What we found" — research and observations. */
  research: string[];
  solutionDetail: string[];
  systemsBuilt: string[];
  features: Array<{ title: string; text: string }>;
  services: string[];
  /**
   * Outcomes. Only verified, real results for client projects.
   * For concept projects these are expected, qualitative outcomes.
   */
  results: string[];
  seo?: { title?: string; description?: string };
};

export type Project = {
  /** Stable internal id. */
  id: string;
  /** URL segment: /[lang]/work/<slug>. Lowercase, hyphenated, unique. */
  slug: string;
  /**
   * "concept" = demonstration / placeholder content (shown with a Concept tag
   * and a disclaimer). "client" = real, published client work.
   */
  status: "concept" | "client";
  /** Shown on the homepage when true. */
  featured: boolean;
  /** Sort order (ascending) on the homepage and the work index. */
  order: number;
  year: number;
  capabilities: CapabilityId[];
  technologies: string[];
  /** Colour mood of the case-study hero and next-project panel. */
  theme: "dark" | "light";
  coverImage: Visual;
  gallery: GalleryItem[];
  /** Optional case-study film (muted, user-initiated playback). */
  video?: { src: string; poster: string };
  system: SystemMap;
  content: { en: ProjectContent } & Partial<Record<Locale, ProjectContent>>;
};
