import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Project } from "@/content/types";
import { projectContent } from "@/content/localize";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { HorizontalScroller } from "@/components/portfolio/HorizontalScroller";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { RevealText } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Arrow } from "@/components/ui/Arrow";
import { ArrowLink } from "@/components/ui/Button";

type Variant = "left" | "right" | "stacked";
const VARIANTS: Variant[] = ["left", "right", "stacked"];

/** Concept tag — shown on demonstration projects so they are never mistaken for client work. */
export function ConceptTag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("label inline-flex items-center gap-2 border border-rule-strong px-2.5 py-1.5 text-fg-mute", className)}>
      <span aria-hidden="true" className="size-1 bg-signal" />
      {label}
    </span>
  );
}

function ProjectPanel({
  project,
  index,
  total,
  locale,
  dict,
}: {
  project: Project;
  index: number;
  total: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const c = projectContent(project, locale);
  const href = localePath(locale, `/work/${project.slug}`);
  const variant = VARIANTS[index % VARIANTS.length];
  const caps = project.capabilities.map((id) => dict.capabilities.items[id].name);

  const visual = (
    <Link
      href={href}
      data-cursor="view"
      data-cursor-label={dict.common.view}
      aria-label={`${dict.common.viewCaseStudy}: ${c.title}`}
      className={cn(
        "group relative block overflow-hidden rounded-xs",
        "aspect-[4/5] md:aspect-[16/11]",
        variant === "stacked"
          ? "lg:aspect-auto lg:h-[58vh] lg:motion-safe:h-[56vh]"
          : "lg:aspect-auto lg:h-[min(78vh,880px)] lg:motion-safe:h-full",
      )}
    >
      <div data-parallax className="absolute inset-y-0 -inset-x-[7%]">
        <div className="h-full w-full transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]">
          <ProjectVisual visual={project.coverImage} locale={locale} sizes="(min-width: 1024px) 60vw, 100vw" />
        </div>
      </div>
    </Link>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className="label text-fg">
        {pad2(index + 1)} <span className="text-fg-mute">/ {pad2(total)}</span>
      </span>
      {project.status === "concept" && <ConceptTag label={dict.common.concept} />}
    </div>
  );

  const titleBlock = (
    <div>
      <h3 className="text-display-m font-medium">
        <Link href={href} className="hover:text-fg-mute transition-colors">
          {c.title}
        </Link>
      </h3>
      <p className="label mt-5 text-fg-mute">
        {c.industry} · {c.projectType} · {project.year}
      </p>
    </div>
  );

  const story = (
    <dl className="grid gap-6 text-body">
      <div>
        <dt className="label mb-2 text-fg-mute">{dict.featured.challenge}</dt>
        <dd>{c.challenge}</dd>
      </div>
      <div>
        <dt className="label mb-2 text-fg-mute">{dict.featured.solution}</dt>
        <dd>{c.solution}</dd>
      </div>
      <div>
        <dt className="label mb-2 text-fg-mute">{dict.featured.capabilities}</dt>
        <dd className="text-fg-mute">{caps.join(" / ")}</dd>
      </div>
    </dl>
  );

  const cta = <ArrowLink href={href}>{dict.common.viewCaseStudy}</ArrowLink>;

  if (variant === "stacked") {
    return (
      <article
        data-panel
        className="flex flex-col gap-8 lg:motion-safe:h-[80vh] lg:motion-safe:w-[80vw] lg:motion-safe:shrink-0 lg:motion-safe:justify-center"
      >
        {visual}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end lg:gap-[3vw]">
          <div className="space-y-6">
            {meta}
            {titleBlock}
          </div>
          <div className="max-w-[46ch] lg:max-w-none">{story}</div>
          <div className="lg:pb-1">{cta}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-panel
      className={cn(
        "grid gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-[3vw]",
        "lg:motion-safe:h-[78vh] lg:motion-safe:w-[78vw] lg:motion-safe:shrink-0",
        variant === "right" && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)]",
      )}
    >
      <div className={cn("min-w-0", variant === "right" && "lg:order-2")}>{visual}</div>
      <div className={cn("flex min-w-0 flex-col justify-between gap-8 lg:py-2", variant === "right" && "lg:order-1")}>
        <div className="space-y-6">
          {meta}
          {titleBlock}
        </div>
        <div className="max-w-[46ch]">{story}</div>
        {cta}
      </div>
    </article>
  );
}

/** 04 — Featured work. The portfolio as the centrepiece of the homepage. */
export function FeaturedWork({ locale, dict, projects }: { locale: Locale; dict: Dictionary; projects: Project[] }) {
  const t = dict.featured;
  return (
    <section
      id="work"
      aria-labelledby="featured-title"
      data-theme="light"
      data-nav-theme="light"
      className="relative bg-bg py-(--section-y) text-fg lg:motion-safe:py-0"
    >
      <HorizontalScroller label={t.eyebrow}>
        <div
          data-track
          className="shell flex flex-col gap-24 md:gap-32 lg:motion-safe:h-full lg:motion-safe:w-max lg:motion-safe:max-w-none lg:motion-safe:flex-row lg:motion-safe:items-center lg:motion-safe:gap-[7vw] lg:motion-safe:pr-[10vw]"
        >
          {/* Intro */}
          <header className="max-w-[40rem] lg:motion-safe:w-[34vw] lg:motion-safe:max-w-none lg:motion-safe:shrink-0">
            <Eyebrow index={`(${pad2(projects.length)})`}>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="featured-title" className="mt-8 text-display-l font-medium">
              {t.title}
            </RevealText>
            <p className="mt-8 max-w-[38ch] text-lead text-fg-mute">{t.intro}</p>
            <p aria-hidden="true" className="label mt-12 hidden items-center gap-3 text-fg-mute lg:motion-safe:flex">
              <Arrow className="text-[1.2em]" />
            </p>
          </header>

          {projects.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} index={i} total={projects.length} locale={locale} dict={dict} />
          ))}

          {/* Outro */}
          <div className="flex flex-col gap-10 border-t border-rule pt-12 lg:motion-safe:w-[44vw] lg:motion-safe:shrink-0 lg:motion-safe:border-t-0 lg:motion-safe:border-l lg:motion-safe:pt-0 lg:motion-safe:pl-[4vw]">
            <p className="max-w-[16ch] text-display-m font-medium">{t.outroTitle}</p>
            <ArrowLink href={localePath(locale, "/work")} className="text-lead">
              {t.outroLink}
            </ArrowLink>
          </div>
        </div>
      </HorizontalScroller>
    </section>
  );
}
