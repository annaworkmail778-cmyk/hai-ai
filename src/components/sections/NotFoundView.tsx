"use client";

import { useParams } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { ButtonLink } from "@/components/ui/Button";

export type NotFoundMessages = {
  code: string;
  title: string;
  text: string;
  home: string;
  work: string;
  homeHref: string;
  workHref: string;
};

export function NotFoundView({ messages }: { messages: Record<Locale, NotFoundMessages> }) {
  const params = useParams<{ lang?: string }>();
  const t = messages[isLocale(params?.lang) ? params.lang : defaultLocale];

  return (
    <section
      data-theme="dark"
      data-nav-theme="dark"
      aria-labelledby="not-found-title"
      className="relative flex min-h-svh items-end overflow-hidden bg-bg text-fg"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[0.08em] right-[-0.04em] text-[clamp(10rem,38vw,40rem)] leading-none font-medium tracking-[-0.06em] text-fg/[0.045] select-none"
      >
        {t.code}
      </span>
      <div className="shell relative w-full pt-[calc(var(--nav-h)+4rem)] pb-[clamp(4rem,12vh,8rem)]">
        <p className="label flex items-center gap-3 text-fg-mute">
          <span aria-hidden="true" className="size-1.5 bg-signal" />
          {t.code}
        </p>
        <h1 id="not-found-title" className="mt-8 max-w-[14ch] text-display-l font-medium sm:text-display-xl">
          {t.title}
        </h1>
        <p className="mt-8 max-w-[40ch] text-lead text-fg-mute">{t.text}</p>
        <div className="mt-12 flex flex-wrap gap-4">
          <ButtonLink href={t.homeHref}>{t.home}</ButtonLink>
          <ButtonLink href={t.workHref} variant="outline">
            {t.work}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
