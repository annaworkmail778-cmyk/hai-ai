import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { GalleryItem, Project } from "@/content/types";
import { localize, projectContent } from "@/content/localize";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { ProjectVisual } from "./ProjectVisual";
import { DemoPoster } from "@/components/demos/DemoStage";
import { MediaReveal } from "@/components/motion/Reveal";

/** One gallery entry in its chosen layout. */
export function GalleryBlock({
  item,
  locale,
  index,
  figure,
}: {
  item: GalleryItem;
  locale: Locale;
  index: number;
  /** Localised figure label, e.g. "Fig.". */
  figure: string;
}) {
  const caption = item.caption ? localize(item.caption, locale) : undefined;
  const figcaption = caption && (
    <figcaption className="max-w-[34ch] text-body text-fg-mute">
      <span className="label mb-3 block text-fg">
        {figure} {pad2(index + 1)}
      </span>
      {caption}
    </figcaption>
  );

  if (item.layout === "full") {
    return (
      <figure className="space-y-6">
        <MediaReveal className="relative aspect-[4/5] overflow-hidden md:aspect-[16/9]">
          <div className="absolute inset-0">
            <ProjectVisual visual={item.visual} locale={locale} />
          </div>
        </MediaReveal>
        {figcaption && <div className="shell">{figcaption}</div>}
      </figure>
    );
  }

  if (item.layout === "inset") {
    return (
      <figure className="shell grid-editorial gap-y-6">
        <MediaReveal className="relative col-span-4 aspect-[4/5] overflow-hidden rounded-xs md:col-span-8 md:aspect-[16/10] lg:col-span-10 lg:col-start-2">
          <div className="absolute inset-0">
            <ProjectVisual visual={item.visual} locale={locale} sizes="(min-width: 1024px) 80vw, 100vw" />
          </div>
        </MediaReveal>
        {figcaption && <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-2">{figcaption}</div>}
      </figure>
    );
  }

  const left = item.layout === "split-left";
  return (
    <figure className="shell grid-editorial items-end gap-y-6">
      <MediaReveal
        from={left ? "left" : "right"}
        className={cn(
          "relative col-span-4 aspect-[4/5] overflow-hidden rounded-xs md:col-span-8 md:aspect-[16/11] lg:col-span-8",
          left ? "lg:col-start-1" : "lg:order-2 lg:col-start-5",
        )}
      >
        <div className="absolute inset-0">
          <ProjectVisual visual={item.visual} locale={locale} sizes="(min-width: 1024px) 66vw, 100vw" />
        </div>
      </MediaReveal>
      {figcaption && (
        <div className={cn("col-span-4 md:col-span-6 lg:col-span-3", left ? "lg:col-start-10" : "lg:order-1 lg:col-start-1")}>
          {figcaption}
        </div>
      )}
    </figure>
  );
}

/** Optional case-study film: shows its poster and plays only when the visitor asks. */
export function CaseFilm({ src, poster, label, title }: { src: string; poster: string; label: string; title: string }) {
  return (
    <figure className="shell">
      <figcaption className="label mb-4 flex items-center gap-3 text-fg-mute">
        <span aria-hidden="true" className="size-1.5 bg-signal" />
        {label}
      </figcaption>
      <video
        controls
        playsInline
        preload="none"
        poster={poster}
        aria-label={`${label}: ${title}`}
        className="aspect-video w-full rounded-xs bg-graphite object-cover"
      >
        <source src={src} />
      </video>
    </figure>
  );
}

/** Large closing link into the next case study. */
export function NextProject({ project, locale, dict }: { project: Project; locale: Locale; dict: Dictionary }) {
  const c = projectContent(project, locale);
  const href = localePath(locale, `/work/${project.slug}`);
  return (
    <section data-theme={project.theme} data-nav-theme={project.theme} aria-label={dict.caseStudy.next} className="bg-bg text-fg">
      <Link href={href} data-cursor="view" data-cursor-label={dict.common.view} className="group block pt-(--section-y-sm)">
        <div className="shell flex items-center justify-between">
          <span className="label flex items-center gap-3 text-fg-mute">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            {dict.caseStudy.next}
          </span>
          <span className="label text-fg-mute">{c.industry}</span>
        </div>
        <div className="shell mt-8">
          <h2 className="max-w-[16ch] text-display-l font-medium transition-transform sm:text-display-xl duration-(--dur-reveal) ease-out group-hover:translate-x-4">
            {c.title}
          </h2>
        </div>
        <div className="relative mt-12 h-[60svh] overflow-hidden md:h-[78svh]">
          <div className="absolute inset-0 transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]">
            {project.demo ? <DemoPoster id={project.demo} locale={locale} /> : <ProjectVisual visual={project.coverImage} locale={locale} />}
          </div>
        </div>
      </Link>
    </section>
  );
}
