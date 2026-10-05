import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { capabilityOrder } from "@/config/navigation";
import { getProjectsByCapability } from "@/content/projects";
import { projectContent } from "@/content/localize";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { RevealText } from "@/components/motion/Reveal";
import { DrawRule } from "@/components/motion/DrawRule";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowLink } from "@/components/ui/Button";
import { CapabilityRows, type CapabilityRow } from "./CapabilityRows";

/** 06 — Capabilities: a large typographic, expandable list. */
export function CapabilitiesList({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.capabilities;

  const rows: CapabilityRow[] = capabilityOrder.map((id) => {
    const item = t.items[id];
    const project = getProjectsByCapability(id)[0];
    return {
      id,
      name: item.name,
      summary: item.summary,
      points: item.points,
      relatedLabel: dict.solutions.labels.related,
      related: project
        ? { title: projectContent(project, locale).title, href: localePath(locale, `/work/${project.slug}`) }
        : undefined,
    };
  });

  const previews = capabilityOrder.map((id) => {
    const project = getProjectsByCapability(id)[0];
    return project ? <ProjectVisual key={id} visual={project.coverImage} locale={locale} sizes="24rem" /> : null;
  });

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      data-theme="dark"
      data-nav-theme="dark"
      className="relative bg-bg pb-(--section-y) text-fg"
    >
      <DrawRule className="mb-(--section-y)" />
      <div className="shell">
        <div className="grid-editorial items-end gap-y-8">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="capabilities-title" className="mt-8 text-display-l font-medium">
              {t.title}
            </RevealText>
          </div>
          <p className="col-span-4 max-w-[34ch] text-lead text-fg-mute md:col-span-6 lg:col-span-4 lg:col-start-9">
            {t.intro}
          </p>
        </div>

        <div className="mt-16 lg:mt-24">
          <CapabilityRows rows={rows} previews={previews} />
        </div>

        <div className="mt-12">
          <ArrowLink href={localePath(locale, "/solutions")}>{t.more}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
