import type { CapabilityId } from "@/config/navigation";
import type { Project } from "../types";

import { aiLeadManagement } from "./ai-lead-management";
import { realEstateSalesPlatform } from "./real-estate-sales-platform";
import { bookingAutomation } from "./booking-automation";
import { operationsDashboard } from "./operations-dashboard";
import { aiCustomerSupport } from "./ai-customer-support";
import { corporateWebExperience } from "./corporate-web-experience";

/**
 * PROJECT REGISTRY
 * To publish a project: create its file (copy _template.ts), then add it here.
 * Pages, routes, sitemap and metadata are generated from this list.
 */
const registry: Project[] = [
  aiLeadManagement,
  realEstateSalesPlatform,
  bookingAutomation,
  operationsDashboard,
  aiCustomerSupport,
  corporateWebExperience,
];

/* Integrity checks run at build time — a broken project fails loudly. */
const seen = new Set<string>();
for (const p of registry) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) {
    throw new Error(`Project "${p.id}": slug "${p.slug}" must be lowercase words joined by hyphens.`);
  }
  if (seen.has(p.slug)) throw new Error(`Duplicate project slug "${p.slug}".`);
  seen.add(p.slug);
  const ids = new Set(p.system.nodes.map((n) => n.id));
  for (const [a, b] of p.system.edges) {
    if (!ids.has(a) || !ids.has(b)) throw new Error(`Project "${p.slug}": system edge ${a} → ${b} references a missing node.`);
  }
}

const sorted = [...registry].sort((a, b) => a.order - b.order || b.year - a.year);

/** All published projects, in display order. */
export function getProjects(): Project[] {
  return sorted;
}

/** Projects flagged `featured: true`, in display order. */
export function getFeaturedProjects(): Project[] {
  return sorted.filter((p) => p.featured);
}

export function getProject(slug: string): Project | undefined {
  return sorted.find((p) => p.slug === slug);
}

/** The project after this one (wraps around) — for the case-study ending. */
export function getNextProject(slug: string): Project {
  const i = sorted.findIndex((p) => p.slug === slug);
  return sorted[(i + 1) % sorted.length];
}

export function getProjectsByCapability(capability: CapabilityId): Project[] {
  return sorted.filter((p) => p.capabilities.includes(capability));
}
