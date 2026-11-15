// Renders the silent sales demos: Developer Sales OS + Solar Alerts, en/hy, 16:9 + 9:16.
// Usage: node render-sales.mjs [dev|solar] [en|hy] [--stills]
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const demos = args.filter((a) => a === "dev" || a === "solar");
const langs = args.filter((a) => a === "en" || a === "hy");
const DEMOS = demos.length ? demos : ["dev", "solar"];
const LANGS = langs.length ? langs : ["en", "hy"];
const stills = args.includes("--stills");
const OUT = "out/sales-demos";
mkdirSync(OUT, { recursive: true });

const browserExecutable = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
const name = { dev: "riseup-developer-sales-os-demo", solar: "riseup-solar-alerts-demo" };

for (const demo of DEMOS)
  for (const lang of LANGS)
    for (const fmt of ["16x9", "9x16"]) {
      const composition = comps.find((c) => c.id === `${demo}-${lang}-${fmt}`);
      if (stills) {
        for (let i = 0; i < 6; i++)
          await renderStill({ composition, serveUrl, browserExecutable, frame: i * 150 + 120, output: `${OUT}/stills/${demo}-${lang}-${fmt}-${i + 1}.png`, scale: 0.5 });
        continue;
      }
      const out = `${OUT}/${name[demo]}-${lang}-${fmt}.mp4`;
      const raw = out.replace(/\.mp4$/, ".raw.mp4");
      await renderMedia({ composition, serveUrl, browserExecutable, codec: "h264", crf: 18, audioBitrate: "192k", outputLocation: raw });
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", out]);
      rmSync(raw);
      console.log("✓", out);
    }
