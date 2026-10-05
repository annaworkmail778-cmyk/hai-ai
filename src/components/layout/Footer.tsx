import Link from "next/link";
import { brand } from "@/config/brand";
import { capabilityOrder, navItems } from "@/config/navigation";
import { localeMeta, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { ButtonLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BackToTop, FitText, LocalTime } from "./FooterParts";

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="label mb-6 text-fg-mute">{children}</h2>;
}

/** Editorial footer: statement, asymmetric link groups, giant wordmark. */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer data-theme="dark" data-nav-theme="dark" className="relative bg-bg text-fg">
      <div className="shell pt-(--section-y-sm)">
        <div className="grid-editorial gap-y-16 border-t border-rule pt-12 lg:pt-16">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <p className="max-w-[22ch] text-heading font-medium">{t.statement}</p>
            <div className="mt-10">
              <ButtonLink href={localePath(locale, "/contact")}>{dict.nav.cta}</ButtonLink>
            </div>
          </div>

          <nav aria-label={t.navigation} className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-7">
            <ColumnTitle>{t.navigation}</ColumnTitle>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={localePath(locale, item.href)} className="link-underline pb-0.5 text-fg/85 hover:text-fg">
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <ColumnTitle>{t.capabilities}</ColumnTitle>
            <ul className="space-y-3">
              {capabilityOrder.map((id) => (
                <li key={id}>
                  <Link
                    href={localePath(locale, `/solutions#${id}`)}
                    className="link-underline pb-0.5 text-fg/85 hover:text-fg"
                  >
                    {dict.capabilities.items[id].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-3 lg:col-span-2">
            <ColumnTitle>{t.contact}</ColumnTitle>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${brand.email}`} className="link-underline pb-0.5">
                  {brand.email}
                </a>
              </li>
              <li>
                <a href={`tel:${brand.phone.replace(/\s+/g, "")}`} className="link-underline pb-0.5 text-fg/85">
                  {brand.phone}
                </a>
              </li>
              <li className="text-fg-mute">
                {brand.address.city[locale]}, {brand.address.country[locale]}
              </li>
            </ul>
            <h2 className="label mt-10 mb-4 text-fg-mute">{t.social}</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {brand.socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-small text-fg/85 hover:text-fg"
                  >
                    {s.label}
                    <Arrow direction="up-right" className="text-[0.85em] opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 lg:mt-36">
          <FitText text={brand.companyName} className="text-fg" />
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-rule py-7 md:flex-row md:items-center md:justify-between">
          <p className="label text-fg-mute">
            © {year} {brand.legalName}. {t.rights}
          </p>
          <p className="label flex items-center gap-3 text-fg-mute">
            <span>
              {t.localTime} · {brand.address.city[locale]}
            </span>
            <span className="text-fg">
              <LocalTime timeZone={brand.address.timeZone} intlLocale={localeMeta[locale].intl} />
            </span>
          </p>
          <div className="flex items-center justify-between gap-8 md:justify-end">
            <LanguageSwitcher locale={locale} label={t.language} />
            <BackToTop label={t.backToTop} />
          </div>
        </div>
      </div>
    </footer>
  );
}
