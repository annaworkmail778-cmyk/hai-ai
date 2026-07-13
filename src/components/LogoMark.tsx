import Image from "next/image";

type LogoMarkProps = {
  className?: string;
  /** Full lockup with the "SYSTEMS" line (footer); otherwise the compact mark. */
  withSystems?: boolean;
  priority?: boolean;
};

/**
 * HAI_AI Systems brand logo — the real 3D render (background removed).
 * `logo-mark` is robot + "Hai_Ai"; `logo-full` adds the "SYSTEMS" line.
 */
export default function LogoMark({ className, withSystems = false, priority = false }: LogoMarkProps) {
  const src = withSystems ? "/logo-full.png" : "/logo-mark.png";
  return (
    <Image
      src={src}
      alt="HAI_AI Systems"
      width={962}
      height={withSystems ? 605 : 513}
      priority={priority}
      className={className}
    />
  );
}
