/* Small stroke icon set (24×24, 1.75 stroke), drawn for this demo. */
import type { SVGProps } from "react";

const P: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  calendar: "M4 6.5h16v14H4zM4 10.5h16M8.5 3.5v5M15.5 3.5v5",
  bed: "M3 18V7M3 13h18v5M21 18v-3.5a3 3 0 0 0-3-3h-7v4.5M6.5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  users: "M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  sparkles: "M12 3.5 13.6 8.4 18.5 10 13.6 11.6 12 16.5 10.4 11.6 5.5 10 10.4 8.4zM18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  broom: "M14.5 3.5 10 12M7 12h7l2.5 8.5h-12zM9.5 16.5l-.5 4M12.5 16.5l.3 4",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5L21 12.6l-2.6 2.6a4 4 0 0 1-5-5L4.6 19A1.6 1.6 0 1 1 2.3 16.7l8.8-8.8a4 4 0 0 1 5-5z",
  zap: "M13 2.5 4.5 13.5H12l-1 8L19.5 10.5H12z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  tasks: "M9 11l2.5 2.5L16 9M4.5 4.5h15v15h-15z",
  calc: "M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h.01M12 18h3",
  bell: "M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5 16 16",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chevron: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  phone: "M7 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3A2 2 0 0 1 18.5 19 15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 2-2z",
  mail: "M3.5 6h17v12h-17zM3.5 6.5l8.5 7 8.5-7",
  message: "M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.2A8.5 8.5 0 1 1 20.5 11.5z",
  send: "M21 3 10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4z",
  wifi: "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  wifiOff: "M3 3l18 18M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M5.5 12.5a9.5 9.5 0 0 1 4-2.2M2.5 9a14 14 0 0 1 4.5-2.7M14.5 10.3a9.5 9.5 0 0 1 4 2.2M21.5 9a14 14 0 0 0-8.5-3.9",
  coffee: "M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M12 3.5v2.5",
  car: "M5 16.5h14M5 16.5v2h2.5v-2M16.5 16.5v2H19v-2M5 16.5V12l2-5h10l2 5v4.5M5 12h14",
  paw: "M12 13.5c-3 0-5 2.6-5 4.5 0 1.4 1.2 2 2.5 2 1 0 1.6-.6 2.5-.6s1.5.6 2.5.6c1.3 0 2.5-.6 2.5-2 0-1.9-2-4.5-5-4.5zM6 11a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 11zM18 11a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM9.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM14.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  mountain: "M2.5 20 9 8l4 7 2.5-4L21.5 20zM7.5 11l1.5 1.5L11 10",
  snow: "M12 2.5v19M4 7l16 10M20 7 4 17M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5",
  drop: "M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  pin: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  refresh: "M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4",
  play: "M7 4.5v15l12-7.5z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  sun: "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  laptop: "M4.5 5.5h15v10h-15zM2.5 19h19",
  smartphone: "M7.5 2.5h9v19h-9zM11 18.5h2",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5M19.5 14v2.5M14 17.5v2.5h2.5M17.5 17.5H20V20",
  alert: "M12 3.5 21.5 20h-19zM12 10v4M12 17h.01",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 8h.01",
  logIn: "M14 4h5v16h-5M10 8l4 4-4 4M14 12H3",
  logOut: "M10 4H5v16h5M14 8l4 4-4 4M18 12H8",
  external: "M14 4h6v6M20 4l-9 9M18 13.5V20H4V6h6.5",
  filter: "M3.5 5h17l-6.5 7.5V19l-4 1.5v-8z",
  menu: "M4 6h16M4 12h16M4 18h16",
  door: "M6 21V4h10v17M4 21h16M13 12.5h.01",
  bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V5.5A2 2 0 0 1 9.5 4M7 19l-1 2M17 19l1 2",
  tv: "M3.5 6.5h17v11h-17zM8.5 21h7",
  flame: "M12 21a6 6 0 0 0 6-6c0-3.5-3-5.5-3.5-9-2 1.5-3.5 3.5-3.5 6-1-.5-2-2-2-3.5C7 10.5 6 12.5 6 15a6 6 0 0 0 6 6z",
  sauna: "M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5M9 11c0-1 1-1 1-2M12 11c0-1 1-1 1-2M15 11c0-1 1-1 1-2",
  baby: "M4 9h16v7H4zM4 16v3M20 16v3M4 12.5h16",
  safe: "M4 4.5h16v15H4zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 9.5V8M7 19.5v1.5M17 19.5v1.5",
  kitchen: "M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16.5 3C15 4.5 14.5 7 14.5 9.5S15.5 13 16.5 13V21",
  desk: "M3 9h18M5 9v11M19 9v11M14 9v5h5",
  terrace: "M3 20h18M5 20v-8M19 20v-8M3 12h18L12 5z",
  view: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  balcony: "M4 20h16M5 13h14M7 13v7M11 13v7M15 13v7M8 13V5h8v8",
  minibar: "M6.5 3h11v18h-11zM6.5 9h11M9 6h1.5M9 12.5v2",
  rain: "M8 3.5h8M12 3.5V7M7 7h10M8 11l-1 3M12 11v3M16 11l1 3M9.5 16.5l-.5 2M14.5 16.5l.5 2",
  bolt: "M13 2.5 4.5 13.5H12l-1 8L19.5 10.5H12z",
  copy: "M8 8h12v12H8zM4 16V4h12",
  dot: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 18, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} {...rest}>
      <path d={P[name]} />
    </svg>
  );
}

export const AMENITY_ICON: Record<string, IconName> = {
  wifi: "wifi", breakfast: "coffee", mountainView: "mountain", balcony: "balcony", fireplace: "flame", bathtub: "bath", rainShower: "rain",
  smartTv: "tv", minibar: "minibar", coffee: "coffee", desk: "desk", kitchenette: "kitchen", terrace: "terrace", safe: "safe", babyCot: "baby", sauna: "sauna",
};
