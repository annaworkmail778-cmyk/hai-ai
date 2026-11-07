import "./fonts";
import { Composition } from "remotion";
import { Reel01, REEL01_FRAMES } from "./Reel01";
import { Reel02, REEL02_FRAMES } from "./Reel02";

export function Root() {
  return (
    <>
      <Composition id="reel01-hy" component={Reel01} durationInFrames={REEL01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel01-ru" component={Reel01} durationInFrames={REEL01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
      <Composition id="reel02-hy" component={Reel02} durationInFrames={REEL02_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel02-ru" component={Reel02} durationInFrames={REEL02_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
    </>
  );
}
