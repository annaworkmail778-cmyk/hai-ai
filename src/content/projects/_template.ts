import type { Project } from "../types";

/**
 * PROJECT TEMPLATE — copy this file to add a project. It is NOT registered,
 * so it never appears on the site.
 *
 *   1. Copy to src/content/projects/<your-slug>.ts and rename the export.
 *   2. Fill in every field (English is required; Armenian and Russian are
 *      strongly recommended — missing languages fall back to English).
 *   3. Put real images in /public/projects/<your-slug>/ and reference them.
 *   4. Register the export in src/content/projects/index.ts.
 *
 * Full walkthrough: PROJECT_CONTENT_GUIDE.md
 *
 * Rules for real client work:
 *   - status: "client" only with the client's permission to publish.
 *   - results: only verified outcomes the client agreed to share.
 *     Never estimate, round up or invent numbers.
 */
export const projectTemplate: Project = {
  id: "p-your-slug",
  slug: "your-slug",
  status: "client",
  featured: false,
  order: 10,
  year: 2026,
  // Ids from src/config/navigation.ts → capabilityOrder
  capabilities: ["custom-software"],
  technologies: ["Next.js", "PostgreSQL"],
  theme: "dark",

  coverImage: {
    kind: "image",
    src: "/projects/your-slug/cover.jpg",
    alt: { en: "Describe what the cover image shows." },
    // position: "50% 30%",  // optional focal point (CSS object-position)
  },

  // Optional film, played only when the visitor presses play.
  // video: { src: "/projects/your-slug/film.mp4", poster: "/projects/your-slug/film-poster.jpg" },

  gallery: [
    {
      layout: "full", // "full" | "inset" | "split-left" | "split-right"
      visual: {
        kind: "image",
        src: "/projects/your-slug/gallery-01.jpg",
        alt: { en: "Describe the screen or photo." },
      },
      caption: { en: "One sentence on why this matters." },
    },
  ],

  // Drawn as the case-study system diagram. Keep 2–4 nodes per group.
  system: {
    nodes: [
      { id: "source", group: "input", label: { en: "Where data comes from" } },
      { id: "core", group: "core", label: { en: "What we built" } },
      { id: "result", group: "output", label: { en: "What the business gets" } },
    ],
    edges: [
      ["source", "core"],
      ["core", "result"],
    ],
  },

  content: {
    en: {
      title: "Project title",
      subtitle: "One line that explains the project to a stranger.",
      client: "Client name (or a neutral description if it cannot be named)",
      industry: "Industry",
      projectType: "Type · Type",
      shortDescription: "One sentence for listings and search results.",
      challenge: "The problem in one line.",
      solution: "The answer in one line.",
      context: "Who the client is and what situation they were in.",
      challengeDetail: ["What was not working, in concrete terms.", "Why it mattered to the business."],
      research: ["Observation 1", "Observation 2", "Observation 3", "Observation 4"],
      solutionDetail: ["What we designed and why.", "How it works day to day."],
      systemsBuilt: ["System or module 1", "System or module 2"],
      features: [
        { title: "Feature", text: "What it does for the people using it." },
        { title: "Feature", text: "What it does for the people using it." },
      ],
      services: ["Service 1", "Service 2"],
      results: ["Only verified, client-approved outcomes."],
      // seo: { title: "Custom search title", description: "Custom search description" },
    },
    // hy: { ...same fields in Armenian },
    // ru: { ...same fields in Russian },
  },
};
