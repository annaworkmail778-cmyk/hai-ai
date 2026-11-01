import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { isLocale, localeMeta, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pad2 } from "@/i18n/format";
import { getNextProject, getProject, getProjects } from "@/content/projects";
import { projectContent } from "@/content/localize";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { RevealText, Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { ConceptTag } from "@/components/sections/FeaturedWork";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { ExpandMedia } from "@/components/portfolio/ExpandMedia";
import { SystemDiagram } from "@/components/portfolio/SystemDiagram";
import { DemoPlayer } from "@/components/demos/DemoPlayer";
import { CaseFilm, GalleryBlock, NextProject } from "@/components/portfolio/CaseStudyParts";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

// Unknown slugs render on demand and call notFound() → localized 404.
// (dynamicParams = false would 404 too, but logs an internal error per request.)

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) return {};
  const c = projectContent(project, lang);
  return pageMetadata({
    locale: lang,
    path: `/work/${project.slug}`,
    title: c.seo?.title ?? c.title,
    description: c.seo?.description ?? c.shortDescription,
    type: "article",
    ownImage: true,
  });
}

/** A plain section with a small numbered label and a heading. */
function Part({
  index,
  title,
  children,
  className,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={title} className={cn("shell py-(--section-y-sm)", className)}>
      <div className="grid-editorial gap-y-8 border-t border-rule pt-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <p className="label text-fg-mute">{index}</p>
          <h2 className="mt-3 text-heading font-medium">{title}</h2>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();

  const dict = getDictionary(lang);
  const t = dict.caseStudy;
  const c = projectContent(project, lang);
  const all = getProjects();
  const position = all.findIndex((p) => p.slug === project.slug);
  const next = getNextProject(project.slug);
  const concept = project.status === "concept";
  const capabilityNames = project.capabilities.map((id) => dict.capabilities.items[id].name);
  const inverse = project.theme === "light" ? "dark" : "ink";
  const url = `${brand.siteUrl}${localePath(lang, `/work/${project.slug}`)}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: c.title,
      headline: c.title,
      description: c.shortDescription,
      url,
      inLanguage: localeMeta[lang].hreflang,
      dateCreated: String(project.year),
      genre: concept ? "Concept study" : "Case study",
      keywords: [...capabilityNames, ...project.technologies].join(", "),
      creator: { "@type": "Organization", name: brand.companyName, url: brand.siteUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${brand.siteUrl}${localePath(lang, "/")}` },
        { "@type": "ListItem", position: 2, name: dict.nav.work, item: `${brand.siteUrl}${localePath(lang, "/work")}` },
        { "@type": "ListItem", position: 3, name: c.title, item: url },
      ],
    },
  ];

  const meta: Array<[string, string]> = [
    [t.industry, c.industry],
    [t.type, c.projectType],
    [t.year, String(project.year)],
  ];

  return (
    <article data-theme={project.theme} data-nav-theme={project.theme} className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      {/* Hero */}
      <header className="shell pt-[calc(var(--nav-h)+clamp(2.5rem,8vh,6rem))]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={localePath(lang, "/work")} className="group label inline-flex items-center gap-2 text-fg-mute hover:text-fg">
            <Arrow direction="left" className="transition-transform group-hover:-translate-x-1" />
            {t.back}
          </Link>
          <span className="label text-fg-mute">
            {pad2(position + 1)} / {pad2(all.length)}
          </span>
          {concept && <ConceptTag label={dict.common.concept} />}
        </div>
        <RevealText as="h1" immediate className="mt-8 max-w-[22ch] text-display-l font-medium">
          {c.title}
        </RevealText>
        <div className="grid-editorial mt-8 gap-y-8 lg:mt-10">
          <Reveal delay={0.2} className="col-span-4 md:col-span-8 lg:col-span-7">
            <p className="max-w-[46ch] text-lead text-fg-mute">{c.subtitle}</p>
          </Reveal>
          <Reveal delay={0.3} className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
            <dl className="grid gap-x-6 gap-y-4">
              {meta.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 border-t border-rule pt-3">
                  <dt className="label shrink-0 text-fg-mute">{k}</dt>
                  <dd className="text-right text-body">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        {concept && (
          <p className="mt-10 flex max-w-[80ch] gap-4 rounded-md border border-rule-strong p-5 text-body text-fg-mute">
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-signal" />
            {t.conceptNote}
          </p>
        )}
      </header>

      {/* How it works */}
      {project.demo ? (
        <section aria-labelledby="demo-title" className="shell mt-16 lg:mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 id="demo-title" className="text-heading font-medium">
              {dict.demo.title}
            </h2>
            <p className="text-body text-fg-mute">{dict.demo.intro}</p>
          </div>
          <DemoPlayer id={project.demo} locale={lang} labels={dict.demo} className="mt-8" />
        </section>
      ) : (
        <ExpandMedia className="mt-16 h-[64svh] md:h-[88svh] lg:mt-24">
          <ProjectVisual visual={project.coverImage} locale={lang} priority />
        </ExpandMedia>
      )}

      {/* The problem */}
      <Part index="01" title={t.problem} className="mt-8">
        <p className="max-w-[40ch] text-title font-medium">{c.challenge}</p>
        <div className="mt-6 space-y-4">
          <p className="max-w-[62ch] text-body text-fg-mute">{c.context}</p>
          {c.challengeDetail.map((p) => (
            <p key={p} className="max-w-[62ch] text-body text-fg-mute">
              {p}
            </p>
          ))}
        </div>
        <h3 className="label mt-10 text-fg-mute">{t.found}</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {c.research.map((finding) => (
            <li key={finding} className="flex gap-3 rounded-md border border-rule p-4 text-body">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-fg-mute" />
              {finding}
            </li>
          ))}
        </ul>
      </Part>

      {/* What changes */}
      <Part index="02" title={concept ? t.changeConcept : t.change}>
        <ul className="grid gap-3 md:grid-cols-2">
          {c.results.map((r) => (
            <li key={r} className="flex items-start gap-4 rounded-md bg-surface p-5 text-title font-medium">
              <svg viewBox="0 0 24 24" className="mt-0.5 size-6 shrink-0 text-signal" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {r}
            </li>
          ))}
        </ul>
      </Part>

      {/* What we build */}
      <Part index="03" title={t.built}>
        <p className="max-w-[40ch] text-title font-medium">{c.solution}</p>
        <div className="mt-6 space-y-4">
          {c.solutionDetail.map((p) => (
            <p key={p} className="max-w-[62ch] text-body text-fg-mute">
              {p}
            </p>
          ))}
        </div>
        <ol className="mt-10 border-b border-rule">
          {c.systemsBuilt.map((s, i) => (
            <li key={s} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-rule py-4 text-body">
              <span className="label pt-0.5 text-fg-mute">{pad2(i + 1)}</span>
              {s}
            </li>
          ))}
        </ol>
        <h3 className="label mt-10 text-fg-mute">{t.features}</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {c.features.map((f) => (
            <li key={f.title} className="rounded-md border border-rule p-5">
              <p className="text-title font-medium">{f.title}</p>
              <p className="mt-2 text-body text-fg-mute">{f.text}</p>
            </li>
          ))}
        </ul>
      </Part>

      {/* How it connects */}
      <section data-theme={inverse} data-nav-theme="dark" aria-labelledby="system-title" className="mt-(--section-y-sm) bg-bg py-(--section-y-sm) text-fg">
        <div className="shell">
          <p className="label text-fg-mute">04</p>
          <h2 id="system-title" className="mt-3 text-heading font-medium">
            {t.system}
          </h2>
          <p className="mt-3 max-w-[56ch] text-body text-fg-mute">{t.systemIntro}</p>
          <div className="mt-10 lg:mt-14">
            <SystemDiagram system={project.system} locale={lang} legend={t.legend} label={`${t.system}: ${c.title}`} />
          </div>
        </div>
      </section>

      {/* Screens and film (real projects) */}
      {(project.video || project.gallery.length > 0) && (
        <section aria-label={t.experience} className="py-(--section-y-sm)">
          <div className="space-y-24 lg:space-y-36">
            {project.video && <CaseFilm src={project.video.src} poster={project.video.poster} label={t.film} title={c.title} />}
            {project.gallery.map((item, i) => (
              <GalleryBlock key={i} item={item} locale={lang} index={i} figure={t.figure} />
            ))}
          </div>
        </section>
      )}

      {/* Under the hood */}
      <Part index="05" title={t.underHood} className="pb-(--section-y)">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="label text-fg-mute">{t.technology}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech} className="rounded-full border border-rule-strong px-3 py-1.5 text-small">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label text-fg-mute">{t.services}</h3>
            <ul className="mt-4 space-y-2 text-body">
              {c.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Part>

      <NextProject project={next} locale={lang} dict={dict} />
    </article>
  );
}
