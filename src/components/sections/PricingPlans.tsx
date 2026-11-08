import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { capabilityOrder, type CapabilityId } from "@/config/navigation";
import { formatAmd, plansFor, type Plan } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { Reveal, RevealText } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";

/** One plan card. Prices come from src/config/pricing.ts, words from pricing.plans.<id>. */
export function PlanCard({ plan, locale, dict }: { plan: Plan; locale: Locale; dict: Dictionary }) {
  const t = dict.pricing;
  const copy = t.plans[plan.id];
  const price = (amount: number) => (plan.from ? `${t.from} ${formatAmd(amount)}` : formatAmd(amount));

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-md border p-6 max-sm:w-[84%] max-sm:shrink-0 max-sm:snap-center lg:p-7",
        plan.popular ? "border-signal bg-fg text-bg" : "border-rule bg-bg",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-[0.75rem] font-medium", plan.popular ? "bg-signal text-black" : "bg-fg/8 text-fg")}>
          {plan.popular ? t.popular : t.badge}
        </span>
      </div>
      <h4 className="mt-5 text-title font-medium">{copy.name}</h4>
      <p className={cn("mt-1 text-small", plan.popular ? "text-bg/70" : "text-fg-mute")}>{copy.for}</p>

      <div className="mt-6 border-t border-current/15 pt-5">
        {plan.setup > 0 ? (
          <>
            <p className="text-heading leading-none font-medium tabular-nums">{price(plan.setup)}</p>
            <p className={cn("mt-2 text-small", plan.popular ? "text-bg/70" : "text-fg-mute")}>
              {plan.monthly > 0 ? `${t.setup} · + ${formatAmd(plan.monthly)} ${t.perMonth}` : t.oneTime}
            </p>
          </>
        ) : (
          <>
            <p className="text-heading leading-none font-medium tabular-nums">
              {price(plan.monthly)} <span className="text-body font-normal">{t.perMonth}</span>
            </p>
            <p className={cn("mt-2 text-small", plan.popular ? "text-bg/70" : "text-fg-mute")}>{t.noSetup}</p>
          </>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {copy.features.map((f) => (
          <li key={f} className="flex gap-2.5 text-small">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-[0.2em] size-4 shrink-0 text-signal" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={localePath(locale, "/contact")}
        variant={plan.popular ? "signal" : "outline"}
        size="md"
        magnetic={false}
        className={cn("mt-8 w-full", !plan.popular && "border-rule-strong")}
      >
        {t.cta}
      </ButtonLink>
    </article>
  );
}

/** Plans grouped by product: product name and summary on the left, its plans on the right. */
export function PricingPlans({
  locale,
  dict,
  products = capabilityOrder,
}: {
  locale: Locale;
  dict: Dictionary;
  products?: readonly CapabilityId[];
}) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {products.map((id) => {
        const item = dict.capabilities.items[id];
        const list = plansFor(id);
        return (
          <section key={id} aria-labelledby={`price-${id}`} className="grid-editorial gap-y-8 py-12 lg:py-16">
            <div className="col-span-4 md:col-span-8 lg:col-span-4">
              <h3 id={`price-${id}`} className="text-heading font-medium">
                {item.name}
              </h3>
              <p className="mt-4 max-w-[38ch] text-body text-fg-mute">{item.summary}</p>
              <ArrowLink href={localePath(locale, `/solutions#${id}`)} className="mt-6">
                {dict.pricing.seeDemo}
              </ArrowLink>
            </div>
            <Reveal
              stagger={0.08}
              className={cn(
                "col-span-4 grid gap-4 md:col-span-8 lg:col-span-8",
                // Phones: swipe through a product's plans instead of a long stack.
                "max-sm:-mx-(--page-x) max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:px-(--page-x) max-sm:pb-3 max-sm:[scrollbar-width:none]",
                list.length > 1 ? "sm:grid-cols-2" : "sm:max-w-[26rem]",
              )}
            >
              {list.map((plan) => (
                <PlanCard key={plan.id} plan={plan} locale={locale} dict={dict} />
              ))}
            </Reveal>
          </section>
        );
      })}
    </div>
  );
}

/** Payment terms list. */
export function PricingTerms({ t }: { t: Dictionary["pricing"] }) {
  return (
    <div className="grid-editorial gap-y-6 pt-12 lg:pt-16">
      <h3 className="col-span-4 text-title font-medium md:col-span-8 lg:col-span-4">{t.termsTitle}</h3>
      <ol className="col-span-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 md:col-span-8 lg:col-span-8">
        {t.terms.map((term, i) => (
          <li key={term} className="flex gap-3 text-body text-fg-mute">
            <span className="label shrink-0 text-signal">{String(i + 1).padStart(2, "0")}</span>
            <span>{term}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Homepage section: heading, all plans, terms and a link to the full price page. */
export function PricingSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.pricing;
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      data-theme="light"
      data-nav-theme="light"
      className="relative bg-bg py-(--section-y) text-fg"
    >
      <div className="shell">
        <div className="grid-editorial items-end gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="pricing-title" className="mt-8 text-display-m font-medium">
              {t.title}
            </RevealText>
          </div>
          <p className="col-span-4 max-w-[36ch] text-lead text-fg-mute md:col-span-6 lg:col-span-4 lg:col-start-9">{t.intro}</p>
        </div>
        <div className="mt-16 lg:mt-20">
          <PricingPlans locale={locale} dict={dict} />
          <PricingTerms t={t} />
        </div>
        <ArrowLink href={localePath(locale, "/pricing")} className="mt-12">
          {t.all}
        </ArrowLink>
      </div>
    </section>
  );
}
