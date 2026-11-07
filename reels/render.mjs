// Renders every reel composition to out/<id>.mp4 using the locally installed Chromium.
import { execSync } from "node:child_process";
const chrome = process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["reel01-hy", "reel01-ru"];
for (const id of ids) {
  const file = `out/${id.replace("reel01", "reel-01")}.mp4`;
  execSync(`npx remotion render ${id} ${file} --browser-executable=${chrome} --codec=h264 --crf=18 --log=error`, { stdio: "inherit" });
  console.log("rendered", file);
}
