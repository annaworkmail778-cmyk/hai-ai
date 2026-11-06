import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { planOrder, plans } from "@/config/pricing";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClosingCTA } from "@/components/ui/ClosingCTA";
import { PricingPlans, PricingTerms } from "@/components/sections/PricingPlans";

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/pricing",
    title: dict.meta.pricing.title,
    description: dict.meta.pricing.description,
  });
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.pricing;
  const contactHref = localePath(lang, "/contact");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: dict.meta.pricing.title,
    url: `${brand.siteUrl}${localePath(lang, "/pricing")}`,
    itemListElement: planOrder.map((id) => {
      const plan = plans[id];
      return {
        "@type": "Offer",
        name: `${dict.capabilities.items[plan.product].name} · ${t.plans[id].name}`,
        description: t.plans[id].for,
        price: plan.setup || plan.monthly,
        priceCurrency: "AMD",
        seller: { "@type": "Organization", name: brand.companyName, url: brand.siteUrl },
      };
    }),
  };

  return (
    <div data-theme="light" data-nav-theme="light" className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHeader eyebrow={t.eyebrow} title={t.pageTitle} intro={t.pageIntro} />
      <section aria-label={t.eyebrow} className="shell pb-(--section-y)">
        <PricingPlans locale={lang} dict={dict} />
        <PricingTerms t={t} />
      </section>
      <ClosingCTA
        theme="dark"
        eyebrow={dict.cta.eyebrow}
        title={`${dict.cta.line1} ${dict.cta.line2}`}
        primary={{ href: contactHref, label: dict.cta.primary }}
        secondary={{ href: `mailto:${brand.email}`, label: dict.cta.secondary }}
      />
    </div>
  );
}
