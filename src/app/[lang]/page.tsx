import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { isLocale, localeMeta, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getFeaturedProjects } from "@/content/projects";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { ScrollIntro } from "@/components/sections/ScrollIntro";
import { ScrollStatement } from "@/components/sections/ScrollStatement";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ProblemStory } from "@/components/sections/ProblemStory";
import { CapabilitiesList } from "@/components/sections/CapabilitiesList";
import { BusinessDiagnostic } from "@/components/sections/BusinessDiagnostic";
import { ProcessScroll } from "@/components/sections/ProcessScroll";
import { TechnologyGrid } from "@/components/sections/TechnologyGrid";
import { WhyUs } from "@/components/sections/WhyUs";
import { EditorialCTA } from "@/components/sections/EditorialCTA";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/",
    title: `${brand.companyName} — ${dict.meta.home.title}`,
    description: dict.meta.home.description,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const contact = localePath(lang, "/contact");

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${brand.siteUrl}/#organization`,
      name: brand.companyName,
      url: brand.siteUrl,
      logo: `${brand.siteUrl}/icon`,
      description: brand.description[lang],
      email: brand.email,
      telephone: brand.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: brand.address.city.en,
        addressCountry: brand.address.country.en,
      },
      sameAs: brand.socialLinks.map((s) => s.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${brand.siteUrl}/#website`,
      name: brand.companyName,
      url: `${brand.siteUrl}${localePath(lang, "/")}`,
      inLanguage: localeMeta[lang].hreflang,
      publisher: { "@id": `${brand.siteUrl}/#organization` },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      {/* 01–02 */}
      <ScrollIntro
        tagline={brand.tagline[lang]}
        intro={dict.intro}
        hero={dict.hero}
        workHref={localePath(lang, "/work")}
        contactHref={contact}
      />
      {/* 03 */}
      <ScrollStatement
        eyebrow={dict.statement.eyebrow}
        line1={dict.statement.line1}
        line2={dict.statement.line2}
        note={dict.statement.note}
      />
      {/* 04 */}
      <FeaturedWork locale={lang} dict={dict} projects={getFeaturedProjects()} />
      {/* 05 */}
      <ProblemStory t={dict.problems} />
      {/* 06 */}
      <CapabilitiesList locale={lang} dict={dict} />
      {/* 07 */}
      <BusinessDiagnostic t={dict.diagnostic} contactHref={contact} />
      {/* 08 */}
      <ProcessScroll t={dict.process} />
      {/* 09 */}
      <TechnologyGrid t={dict.technology} />
      {/* 10 */}
      <WhyUs t={dict.why} />
      {/* 11 */}
      <EditorialCTA
        eyebrow={dict.cta.eyebrow}
        line1={dict.cta.line1}
        line2={dict.cta.line2}
        primary={dict.cta.primary}
        secondary={dict.cta.secondary}
        primaryHref={contact}
        secondaryHref={`mailto:${brand.email}`}
      />
    </>
  );
}
