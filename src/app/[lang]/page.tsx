import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ScrollIntro } from "@/components/sections/ScrollIntro";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <ScrollIntro
        tagline={brand.tagline[lang]}
        intro={dict.intro}
        hero={dict.hero}
        workHref={localePath(lang, "/work")}
        contactHref={localePath(lang, "/contact")}
      />
      <section data-theme="light" data-nav-theme="light" className="min-h-screen bg-bg py-40 text-fg">
        <div className="shell">
          <h2 className="text-display-l font-medium">{dict.statement.line2}</h2>
        </div>
      </section>
    </>
  );
}
