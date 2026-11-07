import { continueRender, delayRender, staticFile } from "remotion";

/** Geist for Latin, Inter for Cyrillic, Noto Sans Armenian for Armenian — all bundled locally. */
export const FONT = '"Geist", "InterCyr", "NotoArm", system-ui, sans-serif';

const weights = ["400", "500", "700", "900"];
const families: Array<[string, string, string]> = [
  ["Geist", "geist", "U+0000-00FF, U+2000-206F, U+20AC, U+2190-21FF"],
  ["InterCyr", "inter-cyr", "U+0400-04FF"],
  ["NotoArm", "noto-arm", "U+0530-058F, U+FB13-FB17"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    families.flatMap(([family, file, range]) =>
      weights.map((w) =>
        new FontFace(family, `url(${staticFile(`fonts/${file}-${w}.woff2`)}) format("woff2")`, { weight: w, unicodeRange: range })
          .load()
          .then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f)),
      ),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}
