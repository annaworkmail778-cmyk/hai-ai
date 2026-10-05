import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/Reveal";

/** 09 — Technology. A restrained specification sheet, not a logo wall. */
export function TechnologyGrid({ t }: { t: Dictionary["technology"] }) {
  return (
    <section
      aria-labelledby="technology-title"
      data-theme="light"
      data-nav-theme="light"
      className="relative bg-bg py-(--section-y) text-fg"
    >
      <div className="shell">
        <div className="grid-editorial items-end gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <RevealText as="h2" id="technology-title" className="mt-8 max-w-[18ch] text-display-l font-medium">
              {t.title}
            </RevealText>
          </div>
          <p className="col-span-4 max-w-[36ch] text-lead text-fg-mute md:col-span-6 lg:col-span-4 lg:col-start-9">
            {t.intro}
          </p>
        </div>

        <div className="mt-16 grid gap-px border border-rule bg-rule md:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {t.groups.map((group, i) => (
            <div key={group.name} className="group bg-bg p-6 md:p-8 lg:p-10">
              <div className="flex items-baseline justify-between">
                <h3 className="label text-fg">{group.name}</h3>
                <span className="label text-fg-mute">{pad2(i + 1)}</span>
              </div>
              <ul className="mt-10 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-title">
                    <span aria-hidden="true" className="block h-px w-3 bg-rule-strong" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
