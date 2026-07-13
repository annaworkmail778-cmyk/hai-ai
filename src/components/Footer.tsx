"use client";

import { useI18n } from "@/lib/i18n";
import LogoMark from "./LogoMark";
import { InstagramIcon, LinkedInIcon, XIcon } from "./BrandIcons";

const socials = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "X (Twitter)", href: "https://x.com", Icon: XIcon },
];

export default function Footer() {
  const { t } = useI18n();
  const columns = [
    {
      title: t.footer.explore,
      links: [
        { label: t.footer.links.about, href: "#about" },
        { label: t.footer.links.services, href: "#services" },
        { label: t.footer.links.how, href: "#how-it-works" },
        { label: t.footer.links.results, href: "#results" },
        { label: t.footer.links.pricing, href: "#pricing" },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { label: t.footer.links.testimonials, href: "#testimonials" },
        { label: t.footer.links.reels, href: "#reels" },
        { label: t.footer.links.faq, href: "#faq" },
        { label: t.footer.links.contact, href: "#contact" },
      ],
    },
  ];

  return (
    <footer className="px-4 pb-6 sm:px-6">
      <div className="glass-deep mx-auto max-w-6xl rounded-5xl px-8 py-12 sm:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#hero" className="inline-block" aria-label="HAI_AI Systems — back to top">
              <LogoMark withSystems className="h-24 w-auto" />
            </a>
            <p className="mt-4 max-w-xs font-display text-base font-semibold text-gradient-brand">{t.footer.tagline}</p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`HAI_AI Systems — ${label}`}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-cocoa-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cocoa-500 hover:text-blush-200 hover:shadow-glow-gold"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-rosegold-500">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="inline-block py-0.5 text-[15px] font-medium text-cocoa-400 transition-colors duration-200 hover:text-cocoa-700">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-blush-200 pt-6 sm:flex-row">
          <p className="text-sm text-cocoa-300">© {new Date().getFullYear()} HAI_AI Systems. {t.footer.rights}</p>
          <p className="font-display text-sm font-medium text-cocoa-400">{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
