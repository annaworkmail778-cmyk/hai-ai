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
import { Chapter, GalleryBlock, NextProject, Paragraphs, Statement } from "@/components/portfolio/CaseStudyParts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

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
  });
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

  // [label, value, full width]
  const meta: Array<[string, string, boolean]> = [
    [t.year, String(project.year), false],
    [t.type, c.projectType, false],
    [t.industry, c.industry, true],
    [t.client, c.client, true],
    [t.capabilities, capabilityNames.join(" / "), true],
  ];

  return (
    <article data-theme={project.theme} data-nav-theme={project.theme} className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      {/* Hero */}
      <header className="shell pt-[calc(var(--nav-h)+clamp(3rem,10vh,8rem))]">
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
        <RevealText as="h1" immediate className="mt-10 max-w-[15ch] text-display-l font-medium sm:text-display-xl">
          {c.title}
        </RevealText>
        <div className="grid-editorial mt-12 gap-y-10 lg:mt-16">
          <Reveal delay={0.25} className="col-span-4 md:col-span-8 lg:col-span-6">
            <p className="max-w-[40ch] text-lead text-fg-mute">{c.subtitle}</p>
          </Reveal>
          <Reveal delay={0.35} className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
              {meta.map(([k, v, wide]) => (
                <div key={k} className={cn("border-t border-rule pt-3", wide && "col-span-2")}>
                  <dt className="label text-fg-mute">{k}</dt>
                  <dd className="mt-2 text-body">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </header>

      <ExpandMedia className="mt-16 h-[64svh] md:h-[88svh] lg:mt-24">
        <ProjectVisual visual={project.coverImage} locale={lang} priority />
      </ExpandMedia>

      {concept && (
        <div className="shell mt-10">
          <p className="flex max-w-[80ch] gap-4 border border-rule-strong p-5 text-small text-fg-mute">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-signal" />
            {t.conceptNote}
          </p>
        </div>
      )}

      <Chapter index="01" label={t.context} className="mt-8">
        <RevealText as="p" className="max-w-[36ch] text-heading font-medium">
          {c.context}
        </RevealText>
      </Chapter>

      <Chapter index="02" label={t.challenge}>
        <Statement>{c.challenge}</Statement>
        <Paragraphs items={c.challengeDetail} />
      </Chapter>

      <Chapter index="03" label={t.findings}>
        <ol className="grid gap-px border border-rule bg-rule md:grid-cols-2">
          {c.research.map((finding, i) => (
            <li key={finding} className="bg-bg p-6 lg:p-10">
              <span className="label text-signal">{pad2(i + 1)}</span>
              <p className="mt-6 max-w-[34ch] text-title">{finding}</p>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter index="04" label={t.solution}>
        <Statement>{c.solution}</Statement>
        <Paragraphs items={c.solutionDetail} />
        <div className="mt-14">
          <p className="label text-fg-mute">{t.systemsBuilt}</p>
          <ul className="mt-6 border-b border-rule">
            {c.systemsBuilt.map((s, i) => (
              <li key={s} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-rule py-4 text-title">
                <span className="label pt-1.5 text-fg-mute">{pad2(i + 1)}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      {/* System — inverted band */}
      <section data-theme={inverse} data-nav-theme="dark" aria-label={t.system} className="mt-(--section-y-sm) bg-bg py-(--section-y-sm) text-fg">
        <div className="shell">
          <div className="grid-editorial gap-y-6">
            <p className="label col-span-4 flex gap-4 text-fg-mute md:col-span-2 lg:col-span-3">
              <span className="text-fg">05</span>
              {t.system}
            </p>
            <h2 className="col-span-4 text-heading font-medium md:col-span-6 lg:col-span-9">{t.systemIntro}</h2>
          </div>
          <div className="mt-12 lg:mt-16">
            <SystemDiagram system={project.system} locale={lang} legend={t.legend} label={`${t.system}: ${c.title}`} />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section aria-label={t.experience} className="py-(--section-y-sm)">
        <div className="shell">
          <p className="label flex gap-4 border-t border-rule pt-8 text-fg-mute">
            <span className="text-fg">06</span>
            {t.experience}
          </p>
        </div>
        <div className="mt-12 space-y-24 lg:mt-16 lg:space-y-36">
          {project.gallery.map((item, i) => (
            <GalleryBlock key={i} item={item} locale={lang} index={i} figure={t.figure} />
          ))}
        </div>
        <div className="shell mt-24 lg:mt-36">
          <p className="label text-fg-mute">{t.features}</p>
          <ul className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {c.features.map((f) => (
              <li key={f.title} className="bg-bg p-6 lg:p-8">
                <h3 className="text-title font-medium">{f.title}</h3>
                <p className="mt-3 text-body text-fg-mute">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Chapter index="07" label={concept ? t.outcomeConcept : t.outcome}>
        <ul className="border-b border-rule">
          {c.results.map((r) => (
            <li key={r} className="flex items-baseline gap-5 border-t border-rule py-5 text-heading font-medium">
              <span aria-hidden="true" className={cn("block size-2 shrink-0 translate-y-[-0.15em]", concept ? "border border-signal" : "bg-signal")} />
              {r}
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter index="08" label={t.technology} className="pb-(--section-y)">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="label text-fg-mute">{t.technology}</p>
            <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-title">
              {project.technologies.map((tech, i) => (
                <li key={tech}>
                  {tech}
                  {i < project.technologies.length - 1 && <span className="ml-3 text-fg-mute">/</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-fg-mute">{t.services}</p>
            <ul className="mt-6 space-y-2 text-title">
              {c.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Chapter>

      <NextProject project={next} locale={lang} dict={dict} />
    </article>
  );
}
