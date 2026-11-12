// Renders the contest video (Armenian) in 9:16 and 4:5, loudness-normalised for social media.
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const OUT = "out/contest";
mkdirSync(OUT, { recursive: true });
const browserExecutable = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
for (const fmt of ["9x16", "4x5"]) {
  const composition = comps.find((c) => c.id === `contest-hy-${fmt}`);
  const raw = `${OUT}/.raw-${fmt}.mp4`;
  const out = `${OUT}/riseup-contest-hy-${fmt}.mp4`;
  await renderMedia({ composition, serveUrl, browserExecutable, codec: "h264", crf: 18, audioBitrate: "192k", outputLocation: raw });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", out]);
  rmSync(raw);
  console.log("rendered", out);
}
