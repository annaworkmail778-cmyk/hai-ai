import { useId } from "react";

export type MascotPose = "smile" | "wave" | "point" | "celebrate";

type MascotProps = {
  pose?: MascotPose;
  className?: string;
  label?: string;
  /** Mirror the robot horizontally (chest text stays readable). */
  flip?: boolean;
};

const MIRROR = "scale(-1 1) translate(-260 0)";

/**
 * HAI_AI robot mascot — hand-drawn SVG matching the brand render:
 * blush-pink & white shell, rose-gold trim, warm-brown visor with
 * glowing cyan smile. Poses swap the arm groups; animation classes
 * (wave-arm, cheer-arm-*, point-arm) live in globals.css.
 */
export default function Mascot({ pose = "smile", className, label, flip = false }: MascotProps) {
  const uid = useId().replace(/[:]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      viewBox="0 0 260 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={label ?? "HAI_AI robot mascot"}
    >
      <defs>
        <linearGradient id={id("head")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FBEAEF" />
        </linearGradient>
        <linearGradient id={id("cap")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7D6DD" />
          <stop offset="1" stopColor="#F2BECB" />
        </linearGradient>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FCEFF2" />
        </linearGradient>
        <linearGradient id={id("chest")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7D6DD" />
          <stop offset="1" stopColor="#F0BCC9" />
        </linearGradient>
        <linearGradient id={id("visor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A2B24" />
          <stop offset="1" stopColor="#241512" />
        </linearGradient>
        <linearGradient id={id("arm")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5C7D2" />
          <stop offset="1" stopColor="#E99BB0" />
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E7C1A8" />
          <stop offset="0.5" stopColor="#CE8F72" />
          <stop offset="1" stopColor="#E7C1A8" />
        </linearGradient>
        <radialGradient id={id("tip")}>
          <stop offset="0" stopColor="#FFE3BC" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE3BC" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("headClip")}>
          <rect x="64" y="28" width="132" height="112" rx="50" />
        </clipPath>
        <clipPath id={id("bodyClip")}>
          <rect x="70" y="146" width="120" height="122" rx="56" />
        </clipPath>
      </defs>

      <g transform={flip ? MIRROR : undefined}>
      {/* ground shadow */}
      <ellipse cx="130" cy="289" rx="56" ry="9" fill="#B87357" opacity="0.16" />

      {/* ── left arm ── */}
      {pose === "celebrate" ? (
        <g className="cheer-arm-l">
          <g transform="rotate(-24 74 176)">
            <rect x="59" y="94" width="30" height="84" rx="15" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
            <rect x="59" y="130" width="30" height="7" rx="3.5" fill={url("gold")} />
            <circle cx="74" cy="90" r="12" fill="#EFA9BC" />
            <circle cx="66" cy="83" r="4" fill="#E58FA8" />
            <circle cx="74" cy="80" r="4" fill="#E58FA8" />
            <circle cx="82" cy="83" r="4" fill="#E58FA8" />
          </g>
        </g>
      ) : (
        <g transform="rotate(14 74 172)">
          <rect x="44" y="158" width="30" height="60" rx="15" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
          <rect x="44" y="192" width="30" height="7" rx="3.5" fill={url("gold")} />
          <circle cx="59" cy="221" r="11.5" fill="#EFA9BC" />
          <circle cx="50" cy="216" r="4.5" fill="#E58FA8" />
        </g>
      )}

      {/* ── right arm ── */}
      {pose === "wave" && (
        <g className="wave-arm">
          <g transform="rotate(30 186 172)">
            <rect x="171" y="96" width="30" height="80" rx="15" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
            <rect x="171" y="132" width="30" height="7" rx="3.5" fill={url("gold")} />
            <circle cx="186" cy="92" r="12" fill="#EFA9BC" />
            <circle cx="178" cy="84" r="4" fill="#E58FA8" />
            <circle cx="186" cy="81" r="4" fill="#E58FA8" />
            <circle cx="194" cy="84" r="4" fill="#E58FA8" />
          </g>
        </g>
      )}
      {pose === "point" && (
        <g className="point-arm">
          <rect x="182" y="159" width="64" height="26" rx="13" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
          <rect x="216" y="159" width="7" height="26" rx="3.5" fill={url("gold")} />
          <circle cx="246" cy="172" r="10" fill="#EFA9BC" />
          <rect x="246" y="167.5" width="12" height="9" rx="4.5" fill="#E58FA8" />
        </g>
      )}
      {pose === "celebrate" && (
        <g className="cheer-arm-r">
          <g transform="rotate(24 186 176)">
            <rect x="171" y="94" width="30" height="84" rx="15" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
            <rect x="171" y="130" width="30" height="7" rx="3.5" fill={url("gold")} />
            <circle cx="186" cy="90" r="12" fill="#EFA9BC" />
            <circle cx="178" cy="83" r="4" fill="#E58FA8" />
            <circle cx="186" cy="80" r="4" fill="#E58FA8" />
            <circle cx="194" cy="83" r="4" fill="#E58FA8" />
          </g>
        </g>
      )}
      {pose === "smile" && (
        <g transform="rotate(-14 186 172)">
          <rect x="186" y="158" width="30" height="60" rx="15" fill={url("arm")} stroke="#E2AEB9" strokeWidth="1.2" />
          <rect x="186" y="192" width="30" height="7" rx="3.5" fill={url("gold")} />
          <circle cx="201" cy="221" r="11.5" fill="#EFA9BC" />
          <circle cx="210" cy="216" r="4.5" fill="#E58FA8" />
        </g>
      )}

      {/* ── antennae ── */}
      <path d="M100 42 L84 12" stroke={url("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M160 42 L176 12" stroke={url("gold")} strokeWidth="4" strokeLinecap="round" />
      <circle cx="84" cy="11" r="9" fill={url("tip")} className="animate-pulse-soft" />
      <circle cx="176" cy="11" r="9" fill={url("tip")} className="animate-pulse-soft" />
      <circle cx="84" cy="11" r="4.5" fill="#FFD9A8" />
      <circle cx="176" cy="11" r="4.5" fill="#FFD9A8" />

      {/* ── ear pods ── */}
      <circle cx="62" cy="86" r="15" fill="#F2BECB" stroke={url("gold")} strokeWidth="3.5" />
      <circle cx="198" cy="86" r="15" fill="#F2BECB" stroke={url("gold")} strokeWidth="3.5" />

      {/* ── head ── */}
      <rect x="64" y="28" width="132" height="112" rx="50" fill={url("head")} stroke="#EBC4CD" strokeWidth="1.5" />
      <g clipPath={url("headClip")}>
        <rect x="64" y="28" width="132" height="34" fill={url("cap")} />
      </g>

      {/* visor */}
      <rect x="80" y="50" width="100" height="70" rx="24" fill={url("visor")} stroke="#CE8F72" strokeWidth="2.5" />
      <rect x="90" y="57" width="80" height="14" rx="7" fill="#FFFFFF" opacity="0.08" />

      {/* face */}
      {pose === "wave" ? (
        <circle cx="108" cy="86" r="7.5" stroke="#8FE9F6" strokeWidth="5" fill="none" />
      ) : (
        <>
          <path d="M99 90 Q108 76 117 90" stroke="#8FE9F6" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.25" />
          <path d="M99 90 Q108 76 117 90" stroke="#8FE9F6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </>
      )}
      <path d="M143 90 Q152 76 161 90" stroke="#8FE9F6" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.25" />
      <path d="M143 90 Q152 76 161 90" stroke="#8FE9F6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {pose === "celebrate" ? (
        <path d="M118 97 Q130 114 142 97 Q130 103 118 97 Z" fill="#8FE9F6" />
      ) : (
        <path d="M119 99 Q130 110 141 99" stroke="#8FE9F6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      )}
      <ellipse cx="96" cy="103" rx="7.5" ry="4.5" fill="#F49E73" opacity="0.6" />
      <ellipse cx="164" cy="103" rx="7.5" ry="4.5" fill="#F49E73" opacity="0.6" />

      {/* ── neck ── */}
      <rect x="118" y="138" width="24" height="10" rx="5" fill={url("gold")} />

      {/* ── body ── */}
      <rect x="70" y="146" width="120" height="122" rx="56" fill={url("body")} stroke="#EBC4CD" strokeWidth="1.5" />
      <g clipPath={url("bodyClip")}>
        <rect x="70" y="146" width="120" height="54" fill={url("chest")} />
      </g>
      <text
        x="130"
        y="226"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="16"
        fontWeight="700"
        letterSpacing="1.5"
        fill="#6B3D36"
        transform={flip ? MIRROR : undefined}
      >
        HAI_AI
      </text>
      <rect x="82" y="246" width="96" height="7" rx="3.5" fill={url("gold")} opacity="0.95" />

      {/* ── celebration sparkles ── */}
      {pose === "celebrate" && (
        <g>
          <path d="M38 52 l5 10 10 5 -10 5 -5 10 -5 -10 -10 -5 10 -5 Z" fill="#CE8F72" className="sparkle" />
          <path
            d="M222 40 l4.5 9 9 4.5 -9 4.5 -4.5 9 -4.5 -9 -9 -4.5 9 -4.5 Z"
            fill="#E99BB0"
            className="sparkle"
            style={{ animationDelay: "0.4s" }}
          />
          <path
            d="M232 130 l3.5 7 7 3.5 -7 3.5 -3.5 7 -3.5 -7 -7 -3.5 7 -3.5 Z"
            fill="#FFFFFF"
            className="sparkle"
            style={{ animationDelay: "0.8s" }}
          />
          <path
            d="M24 140 l3.5 7 7 3.5 -7 3.5 -3.5 7 -3.5 -7 -7 -3.5 7 -3.5 Z"
            fill="#DE7694"
            className="sparkle"
            style={{ animationDelay: "1.1s" }}
          />
        </g>
      )}
      </g>
    </svg>
  );
}
