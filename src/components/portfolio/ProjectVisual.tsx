import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Visual } from "@/content/types";
import { localize } from "@/content/localize";
import { compositions } from "@/components/visuals/registry";
import { cn } from "@/lib/cn";
import { AmbientVideo } from "./AmbientVideo";

/**
 * Renders any project visual — real image, ambient video or coded
 * composition — filling its (relatively positioned) container.
 */
export function ProjectVisual({
  visual,
  locale,
  className,
  sizes = "100vw",
  priority = false,
}: {
  visual: Visual;
  locale: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const alt = localize(visual.alt, locale);

  if (visual.kind === "image") {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-graphite", className)}>
        <Image
          src={visual.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={visual.position ? { objectPosition: visual.position } : undefined}
        />
      </div>
    );
  }

  if (visual.kind === "video") {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-graphite", className)}>
        <AmbientVideo src={visual.src} poster={visual.poster} label={alt} />
      </div>
    );
  }

  const composition = compositions[visual.id];
  return (
    <div className={cn("relative h-full w-full overflow-hidden", composition.tone === "dark" ? "scene-dark" : "scene-light", className)}>
      {composition.render(alt)}
    </div>
  );
}
