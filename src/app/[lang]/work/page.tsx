import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pad2 } from "@/i18n/format";
import { capabilityOrder } from "@/config/navigation";
import { getProjects } from "@/content/projects";
import { projectContent } from "@/content/localize";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { WorkExplorer, type WorkItem } from "@/components/portfolio/WorkExplorer";

export async function generateMetadata({ params }: PageProps<"/[lang]/work">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/work", title: dict.meta.work.title, description: dict.meta.work.description });
}

export default async function WorkPage({ params }: PageProps<"/[lang]/work">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.work;
  const projects = getProjects();

  const filters = capabilityOrder
    .filter((id) => projects.some((p) => p.capabilities.includes(id)))
    .map((id) => ({ id, label: dict.capabilities.items[id].name }));

  const items: WorkItem[] = projects.map((project, i) => {
    const c = projectContent(project, lang);
    return {
      slug: project.slug,
      href: localePath(lang, `/work/${project.slug}`),
      capabilities: project.capabilities,
      card: <ProjectCard project={project} index={i} locale={lang} dict={dict} />,
      preview: <ProjectVisual visual={project.coverImage} locale={lang} sizes="25rem" />,
      row: {
        index: pad2(i + 1),
        title: c.title,
        industry: c.industry,
        type: c.projectType,
        year: project.year,
        concept: project.status === "concept" ? dict.common.concept : undefined,
      },
    };
  });

  return (
    <div data-theme="light" data-nav-theme="light" className="min-h-screen bg-bg text-fg">
      <PageHeader eyebrow={t.eyebrow} index={`(${pad2(projects.length)})`} title={t.title} intro={t.intro} />
      <section aria-label={t.title} className="shell pb-(--section-y)">
        <WorkExplorer
          items={items}
          filters={filters}
          labels={{ filterLabel: t.filterLabel, all: t.all, views: t.views, columns: t.columns, empty: t.empty }}
        />
        <p className="mt-24 max-w-[62ch] border-t border-rule pt-6 text-small text-fg-mute">{t.conceptNotice}</p>
      </section>
    </div>
  );
}
