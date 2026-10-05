import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Project } from "@/content/types";
import { projectContent } from "@/content/localize";
import { pad2 } from "@/i18n/format";
import { ProjectVisual } from "./ProjectVisual";
import { MediaReveal } from "@/components/motion/Reveal";
import { ConceptTag } from "@/components/sections/FeaturedWork";
import { Arrow } from "@/components/ui/Arrow";

/**
 * Gallery card for the work index. Container-responsive: portrait and
 * stacked in narrow slots, cinematic 16:9 with a 12-column caption when wide.
 */
export function ProjectCard({
  project,
  index,
  locale,
  dict,
}: {
  project: Project;
  index: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const c = projectContent(project, locale);
  const href = localePath(locale, `/work/${project.slug}`);
  return (
    <article className="group @container">
      <Link
        href={href}
        data-cursor="view"
        data-cursor-label={dict.common.view}
        aria-label={`${dict.common.viewCaseStudy}: ${c.title}`}
        className="block"
      >
        <MediaReveal className="relative aspect-[4/5] overflow-hidden rounded-xs @4xl:aspect-[16/9]">
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]">
            <ProjectVisual visual={project.coverImage} locale={locale} sizes="(min-width: 1024px) 70vw, 100vw" />
          </div>
        </MediaReveal>
      </Link>
      <div className="mt-6 grid gap-4 @4xl:grid-cols-12 @4xl:gap-6">
        <div className="flex items-center gap-4 @4xl:col-span-2 @4xl:items-start">
          <span className="label text-fg">{pad2(index + 1)}</span>
          {project.status === "concept" && <ConceptTag label={dict.common.concept} />}
        </div>
        <div className="@4xl:col-span-6">
          <h2 className="text-heading font-medium">
            <Link href={href} className="inline-flex items-center gap-3">
              <span className="link-underline">{c.title}</span>
              <Arrow className="text-[0.7em] transition-transform group-hover:translate-x-1" />
            </Link>
          </h2>
          <p className="mt-3 max-w-[48ch] text-body text-fg-mute">{c.shortDescription}</p>
        </div>
        <p className="label text-fg-mute @4xl:col-span-4 @4xl:text-right">
          {c.industry} · {project.year}
        </p>
      </div>
    </article>
  );
}
