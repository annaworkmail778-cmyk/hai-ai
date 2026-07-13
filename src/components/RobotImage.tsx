import Image from "next/image";

const VARIANTS = {
  "1": { src: "/robot.png", w: 444, h: 521 },
  "2": { src: "/robot2.png", w: 711, h: 879 },
} as const;

type RobotImageProps = {
  /** Animation applied to the robot render. */
  move?: "wobble" | "sway" | "bounce" | "float";
  /** Which robot render: "1" = calm smile, "2" = winking + gesturing. */
  variant?: keyof typeof VARIANTS;
  /** Show celebration sparkles around the robot. */
  sparkles?: boolean;
  /** Soft blush glow behind the robot. */
  glow?: boolean;
  className?: string;
  alt: string;
  priority?: boolean;
};

function Spark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={`sparkle absolute ${className ?? ""}`} style={style} aria-hidden="true">
      <path d="M12 2 l2.4 7.6 L22 12 l-7.6 2.4 L12 22 l-2.4-7.6 L2 12 l7.6-2.4 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The real HAI robot render (background removed) with gentle CSS motion —
 * used everywhere the mascot appears animated.
 */
export default function RobotImage({
  move = "float",
  variant = "1",
  sparkles = false,
  glow = true,
  className,
  alt,
  priority = false,
}: RobotImageProps) {
  const v = VARIANTS[variant];
  return (
    <div className={`relative ${className ?? ""}`}>
      {glow && (
        <div aria-hidden="true" className="absolute inset-x-[10%] top-[14%] bottom-[4%] rounded-full bg-blush-300/55 blur-2xl" />
      )}
      {sparkles && (
        <div aria-hidden="true" className="pointer-events-none absolute -inset-[8%]">
          <Spark className="left-0 top-[16%] h-5 w-5 text-rosegold-400" />
          <Spark className="right-[2%] top-[6%] h-4 w-4 text-blush-400" style={{ animationDelay: "0.4s" }} />
          <Spark className="right-0 top-[52%] h-3.5 w-3.5 text-rosegold-300" style={{ animationDelay: "0.8s" }} />
          <Spark className="left-[4%] top-[58%] h-3 w-3 text-blush-500" style={{ animationDelay: "1.1s" }} />
        </div>
      )}
      <Image
        src={v.src}
        alt={alt}
        width={v.w}
        height={v.h}
        priority={priority}
        className={`relative h-auto w-full ${
          move === "wobble" ? "anim-wobble" : move === "sway" ? "anim-sway" : move === "bounce" ? "anim-bounce" : "anim-float"
        }`}
      />
    </div>
  );
}
