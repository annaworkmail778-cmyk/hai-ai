import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { contest } from "@/config/contest";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pad2 } from "@/i18n/format";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/contest">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/contest", title: dict.meta.contest.title, description: dict.meta.contest.description });
}

const MEDAL = ["linear-gradient(135deg,#ffe08a,#e2a63b)", "linear-gradient(135deg,#f1f1f1,#a9adb3)", "linear-gradient(135deg,#f0b78a,#b56a35)"];

export default async function ContestPage({ params }: PageProps<"/[lang]/contest">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.contest;
  const instagram = brand.socialLinks.find((s) => s.label === "Instagram")?.href ?? localePath(lang, "/contact");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: dict.meta.contest.title,
    description: dict.meta.contest.description,
    startDate: contest.start,
    endDate: contest.end,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url: `${brand.siteUrl}${localePath(lang, "/contest")}` },
    organizer: { "@type": "Organization", name: brand.companyName, url: brand.siteUrl },
    isAccessibleForFree: true,
  };

  return (
    <div data-theme="light" data-nav-theme="light" className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      {/* Video + prizes */}
      <section aria-labelledby="prizes" className="shell pb-(--section-y)">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-4 md:col-span-4 lg:col-span-4">
            <video
              className="aspect-[9/16] w-full max-w-[22rem] rounded-xl bg-black object-cover shadow-[0_40px_80px_-40px_rgb(0_0_0/0.5)]"
              src={contest.video}
              poster={contest.poster}
              controls
              playsInline
              preload="metadata"
              aria-label={t.videoLabel}
            />
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <h2 id="prizes" className="text-heading font-medium">
              {t.prizesTitle}
            </h2>
            <Reveal stagger={0.08} className="mt-8 grid gap-4">
              {t.prizes.map((p, i) => (
                <article key={p.name} className={`flex gap-5 rounded-md border p-6 ${i === 0 ? "border-signal bg-fg text-bg" : "border-rule"}`}>
                  <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full text-title font-semibold text-black" style={{ background: MEDAL[i] }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className={`label ${i === 0 ? "text-bg/70" : "text-fg-mute"}`}>{p.place}</p>
                    <h3 className="mt-1 text-title font-medium">{p.name}</h3>
                    <p className={`mt-2 text-body ${i === 0 ? "text-bg/80" : "text-fg-mute"}`}>{p.text}</p>
                    <p className="mt-3 text-small font-medium text-signal">{p.value}</p>
                  </div>
                </article>
              ))}
            </Reveal>
            <p className="mt-6 rounded-md bg-signal px-6 py-5 text-body font-medium text-black">{t.discount}</p>
          </div>
        </div>
      </section>

      {/* How to enter */}
      <section aria-labelledby="how" data-theme="dark" data-nav-theme="dark" className="bg-bg py-(--section-y) text-fg">
        <div className="shell">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="how" className="mt-8 text-display-m font-medium">
            {t.howTitle}
          </h2>
          <p className="mt-4 max-w-[48ch] text-lead text-fg-mute">{t.howNote}</p>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {t.platforms.map((pl) => (
              <article key={pl.name} className="flex flex-col rounded-md border border-rule-strong p-6">
                <h3 className="text-title font-medium">{pl.name}</h3>
                <ol className="mt-5 space-y-4">
                  {pl.steps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-body">
                      <span className="label mt-1 shrink-0 text-signal">{pad2(i + 1)}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                {pl.bonus && <p className="mt-5 border-t border-rule pt-4 text-small text-fg-mute">{pl.bonus}</p>}
              </article>
            ))}
          </div>
          <p className="mt-8 text-body text-fg-mute">{t.example}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href={instagram} variant="signal" arrow="up-right">
              {t.join}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Dates + rules */}
      <section aria-labelledby="rules" className="shell py-(--section-y)">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <h2 className="text-heading font-medium">{t.datesTitle}</h2>
            <dl className="mt-8 space-y-5">
              {t.dates.map(([d, what]) => (
                <div key={d} className="border-l-2 border-signal pl-4">
                  <dt className="text-title font-medium">{d}</dt>
                  <dd className="mt-1 text-body text-fg-mute">{what}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <h2 id="rules" className="text-heading font-medium">
              {t.rulesTitle}
            </h2>
            <ol className="mt-8 space-y-4">
              {t.rules.map((r, i) => (
                <li key={r} className="flex gap-4 text-body text-fg-mute">
                  <span className="label mt-1 shrink-0 text-fg">{pad2(i + 1)}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* For those who don't want to wait */}
      <section aria-labelledby="nowait" data-theme="dark" data-nav-theme="dark" className="bg-bg py-(--section-y) text-fg">
        <div className="shell">
          <h2 id="nowait" className="max-w-[20ch] text-display-m font-medium">
            {t.noWaitTitle}
          </h2>
          <p className="mt-6 max-w-[52ch] text-lead text-fg-mute">{t.noWaitText}</p>
          <ButtonLink href={localePath(lang, "/contact")} variant="signal" className="mt-10">
            {t.noWaitCta}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
