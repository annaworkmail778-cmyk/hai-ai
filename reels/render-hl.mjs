// Renders highlight stories (MP4), covers and brand images (PNG) with one bundle.
// Usage: node render-hl.mjs [all|stills|stories|preview] [id-filter]
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2] || "all";
const filter = process.argv[3] || "";
const browserExecutable = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => c.id.includes(filter));
mkdirSync("out/highlights", { recursive: true });
mkdirSync("out/brand", { recursive: true });
mkdirSync("out/preview", { recursive: true });

for (const c of comps) {
  const isStory = c.id.startsWith("hl-");
  const isStill = c.durationInFrames === 1;
  if (mode === "preview" && isStory) {
    await renderStill({ composition: c, serveUrl, browserExecutable, frame: 150, output: `out/preview/${c.id}.png`, scale: 0.4 });
    console.log("preview", c.id);
  } else if ((mode === "all" || mode === "stories") && isStory) {
    await renderMedia({ composition: c, serveUrl, browserExecutable, codec: "h264", crf: 18, outputLocation: `out/highlights/${c.id.slice(3)}.mp4` });
    console.log("story", c.id);
  } else if ((mode === "all" || mode === "stills") && isStill) {
    await renderStill({ composition: c, serveUrl, browserExecutable, output: `out/brand/${c.id}.png` });
    console.log("still", c.id);
  }
}
