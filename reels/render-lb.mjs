// Renders the RiseUp Lead-to-Booking demo: 2 languages × 2 formats, plus SRT subtitles.
// Usage: node --experimental-strip-types render-lb.mjs [en|hy ...] [--srt-only]
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { subtitleCues } from "./src/lb/config.ts";

const args = process.argv.slice(2);
const langs = args.filter((a) => a === "en" || a === "hy");
const LANGS = langs.length ? langs : ["en", "hy"];
const OUT = "out/lead-booking";
mkdirSync(OUT, { recursive: true });

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, "0")}`;
};
for (const lang of LANGS) {
  const srt = subtitleCues(lang).map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
  writeFileSync(`${OUT}/riseup-lead-booking-demo-${lang}.srt`, srt);
}
if (args.includes("--srt-only")) process.exit(0);

const browserExecutable = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable });
for (const lang of LANGS) {
  for (const fmt of ["16x9", "9x16"]) {
    const composition = comps.find((c) => c.id === `lb-${lang}-${fmt}`);
    const outputLocation = `${OUT}/riseup-lead-booking-demo-${lang}-${fmt}.mp4`;
    const raw = outputLocation.replace(/\.mp4$/, ".raw.mp4");
    await renderMedia({ composition, serveUrl, browserExecutable, codec: "h264", crf: 18, audioBitrate: "192k", outputLocation: raw });
    // Loudness for social/ads playback: -16 LUFS integrated, -1.5 dB true peak. Video stream is copied.
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", outputLocation]);
    renameSync(raw, `${OUT}/.last-raw.mp4`);
    console.log("rendered", outputLocation);
  }
}
