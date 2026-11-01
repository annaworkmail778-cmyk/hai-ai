import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Project } from "@/content/types";
import { projectContent } from "@/content/localize";
import { pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { DemoPlayer } from "@/components/demos/DemoPlayer";
import { RevealText } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowLink } from "@/components/ui/Button";

/** Tag shown on demonstration projects so they are never mistaken for client work. */
export function ConceptTag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("label inline-flex items-center gap-2 rounded-full border border-rule-strong px-3 py-1 text-fg-mute", className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
      {label}
    </span>
  );
}

function Example({
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
  const t = dict.featured;
  const c = projectContent(project, locale);
  const href = localePath(locale, `/work/${project.slug}`);

  return (
    <article aria-labelledby={`example-${project.slug}`} className="grid-editorial gap-y-10 border-t border-rule pt-10 lg:pt-14">
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label text-fg">
            {pad2(index + 1)} <span className="text-fg-mute">/ {pad2(total)}</span>
          </span>
          {project.status === "concept" && <ConceptTag label={dict.common.concept} />}
        </div>
        <h3 id={`example-${project.slug}`} className="mt-5 text-heading font-medium">
          <Link href={href} className="transition-colors hover:text-fg-mute">
            {c.title}
          </Link>
        </h3>
        <p className="label mt-3 text-fg-mute">{c.industry}</p>
        <dl className="mt-8 space-y-6">
          {[
            [t.problem, c.challenge],
            [t.built, c.solution],
            [t.result, c.results[0]],
          ].map(([label, text]) => (
            <div key={label} className="border-l-2 border-rule-strong pl-4">
              <dt className="label text-fg-mute">{label}</dt>
              <dd className="mt-1.5 text-body">{text}</dd>
            </div>
          ))}
        </dl>
        <ArrowLink href={href} className="mt-8">
          {t.open}
        </ArrowLink>
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-8">
        {project.demo ? (
          <DemoPlayer id={project.demo} locale={locale} labels={dict.demo} />
        ) : (
          <Link href={href} aria-label={`${dict.common.viewCaseStudy}: ${c.title}`} className="relative block aspect-[16/10] overflow-hidden rounded-md">
            <ProjectVisual visual={project.coverImage} locale={locale} sizes="(min-width: 1024px) 60vw, 100vw" />
          </Link>
        )}
      </div>
    </article>
  );
}

/** 04 — Examples: featured projects, each explained in plain words beside a live demo. */
export function FeaturedWork({ locale, dict, projects }: { locale: Locale; dict: Dictionary; projects: Project[] }) {
  const t = dict.featured;
  return (
    <section
      id="work"
      aria-labelledby="featured-title"
      data-theme="light"
      data-nav-theme="light"
      className="relative scroll-mt-(--nav-h) bg-bg py-(--section-y) text-fg"
    >
      <div className="shell">
        <header className="grid-editorial gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <Eyebrow index={`(${pad2(projects.length)})`}>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="featured-title" className="mt-8 max-w-[18ch] text-display-l font-medium">
              {t.title}
            </RevealText>
          </div>
          <p className="col-span-4 self-end text-lead text-fg-mute md:col-span-6 lg:col-span-4 lg:col-start-9">{t.intro}</p>
        </header>

        <div className="mt-16 space-y-24 lg:mt-24 lg:space-y-32">
          {projects.map((project, i) => (
            <Example key={project.slug} project={project} index={i} total={projects.length} locale={locale} dict={dict} />
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-6 border-t border-rule pt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[30ch] text-heading font-medium">{t.outroTitle}</p>
          <ArrowLink href={localePath(locale, "/work")} className="text-lead">
            {t.outroLink}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
