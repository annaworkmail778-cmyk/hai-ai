import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { interpolate } from "@/i18n/format";
import { isContactArea, type ContactArea } from "@/lib/contact/schema";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Arrow } from "@/components/ui/Arrow";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/contact",
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.contact;
  const areas = dict.diagnostic.categories
    .filter((c) => isContactArea(c.id))
    .map((c) => ({ id: c.id as ContactArea, name: c.name }));
  const tel = brand.phone.replace(/[^\d+]/g, "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: dict.meta.contact.title,
    url: `${brand.siteUrl}${localePath(lang, "/contact")}`,
    inLanguage: lang,
    mainEntity: {
      "@type": "Organization",
      name: brand.companyName,
      url: brand.siteUrl,
      email: brand.email,
      telephone: brand.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: brand.address.city.en,
        addressCountry: brand.address.country.en,
      },
    },
  };

  return (
    <div data-theme="light" data-nav-theme="light" className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <section aria-label={t.eyebrow} className="shell pb-(--section-y)">
        <div className="grid-editorial gap-y-16">
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <noscript>
              <p className="mb-8 border border-rule-strong p-5 text-body">
                {interpolate(t.noscript, { email: brand.email })}
              </p>
            </noscript>
            <ContactForm t={t} areas={areas} email={brand.email} locale={lang} />
          </div>

          <aside aria-label={t.direct} className="col-span-4 md:col-span-8 lg:col-span-4 lg:row-start-1">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)]">
              <p className="label text-fg-mute">{t.direct}</p>
              <ul className="mt-6 space-y-2 text-title">
                <li>
                  <a href={`mailto:${brand.email}`} className="link-underline">
                    {brand.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${tel}`} className="link-underline">
                    {brand.phone}
                  </a>
                </li>
              </ul>
              <p className="mt-6 text-body text-fg-mute">
                {brand.address.city[lang]}, {brand.address.country[lang]}
              </p>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-rule pt-6">
                {brand.socialLinks.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-small text-fg-mute transition-colors hover:text-fg"
                    >
                      {s.label}
                      <Arrow direction="up-right" className="text-[0.85em]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
