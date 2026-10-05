"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { scrollToTarget } from "@/components/motion/scroll-store";

type Item = { id: string; index: string; name: string };

/** Sticky table of contents for the solutions page; follows the section in view. */
export function SolutionsIndex({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    scrollToTarget(target, { offset: -((nav?.offsetHeight ?? 72) + 24) });
    history.replaceState(history.state, "", `#${id}`);
    // Move focus for keyboard and screen-reader users without a second jump.
    target.focus({ preventScroll: true });
  };

  return (
    <nav aria-label={label} className="sticky top-[calc(var(--nav-h)+2.5rem)]">
      <p className="label text-fg-mute">{label}</p>
      <ol className="mt-6 border-t border-rule">
        {items.map((item) => {
          const current = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                aria-current={current ? "true" : undefined}
                data-active={current}
                className="group flex items-baseline gap-4 border-b border-rule py-3.5 text-small text-fg-mute transition-colors duration-(--dur-micro) hover:text-fg data-[active=true]:text-fg"
              >
                <span className="label w-6 shrink-0">{item.index}</span>
                <span>{item.name}</span>
                <span
                  aria-hidden="true"
                  className="ml-auto size-1.5 shrink-0 self-center bg-signal opacity-0 transition-opacity duration-(--dur-ui) group-data-[active=true]:opacity-100"
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
