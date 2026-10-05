import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { capabilityOrder, type CapabilityId } from "@/config/navigation";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { getProjectsByCapability } from "@/content/projects";
import { projectContent } from "@/content/localize";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClosingCTA } from "@/components/ui/ClosingCTA";
import { ArrowLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal, RevealText } from "@/components/motion/Reveal";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { SolutionsIndex } from "@/components/sections/SolutionsIndex";

export async function generateMetadata({ params }: PageProps<"/[lang]/solutions">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/solutions",
    title: dict.meta.solutions.title,
    description: dict.meta.solutions.description,
  });
}

export default async function SolutionsPage({ params }: PageProps<"/[lang]/solutions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.solutions;
  const contactHref = localePath(lang, "/contact");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.meta.solutions.title,
    itemListElement: capabilityOrder.map((id, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: dict.capabilities.items[id].name,
        description: t.items[id].lead,
        url: `${brand.siteUrl}${localePath(lang, "/solutions")}#${id}`,
        provider: { "@type": "Organization", name: brand.companyName, url: brand.siteUrl },
      },
    })),
  };

  return (
    <div data-theme="dark" data-nav-theme="dark" className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHeader eyebrow={t.eyebrow} index={`(${pad2(capabilityOrder.length)})`} title={t.title} intro={t.intro} />

      <div className="shell pb-(--section-y-sm)">
        <div className="grid-editorial">
          <div className="hidden lg:col-span-3 lg:block">
            <SolutionsIndex
              label={t.eyebrow}
              items={capabilityOrder.map((id, i) => ({ id, index: pad2(i + 1), name: dict.capabilities.items[id].name }))}
            />
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            {capabilityOrder.map((id, i) => (
              <Solution key={id} id={id} index={i} locale={lang} dict={dict} contactHref={contactHref} />
            ))}
          </div>
        </div>
      </div>

      <ClosingCTA
        eyebrow={dict.cta.eyebrow}
        title={`${dict.cta.line1} ${dict.cta.line2}`}
        primary={{ href: contactHref, label: dict.cta.primary }}
        secondary={{ href: `mailto:${brand.email}`, label: dict.cta.secondary }}
      />
    </div>
  );
}

function Solution({
  id,
  index,
  locale,
  dict,
  contactHref,
}: {
  id: CapabilityId;
  index: number;
  locale: Locale;
  dict: Dictionary;
  contactHref: string;
}) {
  const t = dict.solutions;
  const item = t.items[id];
  const name = dict.capabilities.items[id].name;
  const related = getProjectsByCapability(id);
  const columns: Array<[string, string[]]> = [
    [t.labels.problems, item.problems],
    [t.labels.deliverables, item.deliverables],
    [t.labels.examples, item.examples],
  ];

  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-[calc(var(--nav-h)+1.5rem)] border-t border-rule py-16 outline-none first:border-t-0 first:pt-0 lg:py-24 lg:first:border-t lg:first:pt-10"
    >
      <p className="label flex items-center gap-3 text-fg-mute">
        <span className="text-signal">{pad2(index + 1)}</span>
        <span aria-hidden="true" className="h-px w-8 bg-rule-strong" />
        <span>{pad2(capabilityOrder.length)}</span>
      </p>
      <RevealText as="h2" id={`${id}-title`} className="mt-8 text-display-m font-medium">
        {name}
      </RevealText>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-[44ch] text-lead text-fg-mute">{item.lead}</p>
      </Reveal>

      <Reveal stagger={0.08} className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        {columns.map(([label, entries], c) => (
          <div key={label}>
            <p className="label border-b border-rule pb-3 text-fg-mute">{label}</p>
            <ul className="mt-5 space-y-3">
              {entries.map((entry) => (
                <li key={entry} className="flex gap-3 text-body">
                  <span aria-hidden="true" className={c === 0 ? "text-fg-mute" : "text-signal"}>
                    {c === 0 ? "—" : "+"}
                  </span>
                  <span className={c === 0 ? "text-fg-mute" : undefined}>{entry}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>

      {related.length > 0 && (
        <div className="mt-14">
          <p className="label text-fg-mute">{t.labels.related}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map((project) => {
              const c = projectContent(project, locale);
              return (
                <li key={project.slug}>
                  <Link
                    href={localePath(locale, `/work/${project.slug}`)}
                    data-cursor="view"
                    data-cursor-label={dict.common.view}
                    className="group flex items-center gap-4 rounded-xs border border-rule p-2.5 pr-5 transition-colors duration-(--dur-ui) hover:border-rule-strong"
                  >
                    <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xs md:w-28">
                      <ProjectVisual visual={project.coverImage} locale={locale} sizes="7rem" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body font-medium">{c.title}</p>
                      <p className="label mt-1 text-fg-mute">{c.industry}</p>
                    </div>
                    <Arrow className="ml-auto shrink-0 transition-transform duration-(--dur-ui) group-hover:translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ArrowLink href={contactHref} className="mt-14">
        {t.labels.discuss}
      </ArrowLink>
    </section>
  );
}
