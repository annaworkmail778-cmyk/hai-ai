import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pad2 } from "@/i18n/format";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ClosingCTA } from "@/components/ui/ClosingCTA";
import { Reveal, RevealText } from "@/components/motion/Reveal";
import { ScrubClip } from "@/components/motion/ScrubClip";
import { DrawRule } from "@/components/motion/DrawRule";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/about", title: dict.meta.about.title, description: dict.meta.about.description });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: dict.meta.about.title,
    description: dict.meta.about.description,
    url: `${brand.siteUrl}${localePath(lang, "/about")}`,
    inLanguage: lang,
    mainEntity: { "@type": "Organization", name: brand.companyName, url: brand.siteUrl },
  };

  return (
    <div data-theme="light" data-nav-theme="light" className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      {/* Manifesto */}
      <section data-theme="dark" data-nav-theme="dark" aria-label={t.eyebrow} className="bg-bg text-fg">
        <div className="shell py-(--section-y)">
          <ScrubClip>
            <blockquote className="max-w-[22ch] text-display-l font-medium">
              <p>{t.manifesto}</p>
            </blockquote>
          </ScrubClip>
          <p className="label mt-12 flex items-center gap-3 text-fg-mute">
            <span aria-hidden="true" className="size-1.5 bg-signal" />
            {brand.companyName}
          </p>
        </div>
      </section>

      {/* How we think */}
      <section aria-labelledby="approach-title" className="shell py-(--section-y)">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p className="label text-fg-mute">01</p>
            <RevealText as="h2" id="approach-title" className="mt-6 max-w-[12ch] text-display-m font-medium">
              {t.approachTitle}
            </RevealText>
          </div>
          <ol className="col-span-4 border-t border-rule md:col-span-8 lg:col-span-8">
            {t.approach.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-rule py-7 md:grid-cols-[4rem_minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-x-6 lg:py-9"
              >
                <span className="label pt-1.5 text-fg-mute">{pad2(i + 1)}</span>
                <h3 className="text-title font-medium">{item.title}</h3>
                <p className="col-start-2 max-w-[44ch] text-body text-fg-mute md:col-start-3">{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* What we are / are not */}
      <section aria-labelledby="position-title" className="shell pb-(--section-y)">
        <h2 id="position-title" className="sr-only">
          {t.isTitle} / {t.notTitle}
        </h2>
        <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
          <div className="bg-bg p-6 md:p-10 lg:p-14">
            <Eyebrow index="02">{t.isTitle}</Eyebrow>
            <ul className="mt-10 space-y-6">
              {t.is.map((line) => (
                <li key={line} className="flex gap-4 text-heading font-medium">
                  <span aria-hidden="true" className="mt-[0.45em] size-2 shrink-0 bg-signal" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bg p-6 md:p-10 lg:p-14">
            <Eyebrow marker={false}>{t.notTitle}</Eyebrow>
            <ul className="mt-10 space-y-6">
              {t.not.map((line) => (
                <li key={line} className="flex gap-4 text-heading font-medium text-fg-mute">
                  <span aria-hidden="true" className="mt-[0.45em] size-2 shrink-0 border border-current" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How we work together */}
      <section data-theme="ink" data-nav-theme="dark" aria-labelledby="engagement-title" className="bg-bg text-fg">
        <div className="shell py-(--section-y)">
          <p className="label text-fg-mute">03</p>
          <RevealText as="h2" id="engagement-title" className="mt-6 max-w-[16ch] text-display-m font-medium">
            {t.engagementTitle}
          </RevealText>
          <DrawRule className="mt-16 lg:mt-24" tone="signal" />
          <ol className="grid gap-y-12 pt-10 md:grid-cols-3 md:gap-x-8">
            {t.engagement.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08}>
                <span className="block text-display-m font-medium text-fg-mute">{pad2(i + 1)}</span>
                <h3 className="mt-8 text-heading font-medium">{step.title}</h3>
                <p className="mt-4 max-w-[34ch] text-body text-fg-mute">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <ClosingCTA
        eyebrow={dict.cta.eyebrow}
        title={t.ctaTitle}
        primary={{ href: localePath(lang, "/contact"), label: t.cta }}
        secondary={{ href: localePath(lang, "/work"), label: dict.common.allProjects, internal: true }}
      />
    </div>
  );
}
