import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Project } from "@/content/types";
import { projectContent } from "@/content/localize";
import { pad2 } from "@/i18n/format";
import { ProjectVisual } from "./ProjectVisual";
import { DemoPoster } from "@/components/demos/DemoStage";
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
            {project.demo ? (
              <DemoPoster id={project.demo} locale={locale} />
            ) : (
              <ProjectVisual visual={project.coverImage} locale={locale} sizes="(min-width: 1024px) 70vw, 100vw" />
            )}
          </div>
        </MediaReveal>
      </Link>
      <div className="mt-6 grid gap-4 @4xl:grid-cols-12 @4xl:gap-6">
        <div className="flex flex-wrap items-center gap-3 @4xl:col-span-3 @4xl:flex-col @4xl:items-start">
          <span className="label text-fg">{pad2(index + 1)}</span>
          {project.status === "concept" && <ConceptTag label={dict.common.concept} />}
          {project.demo && (
            <span className="label inline-flex items-center gap-2 rounded-full bg-fg px-3 py-1 text-bg">
              <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
                <path d="M8.5 5.8v12.4L18.5 12z" />
              </svg>
              {dict.work.demoTag}
            </span>
          )}
        </div>
        <div className="@4xl:col-span-5">
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
