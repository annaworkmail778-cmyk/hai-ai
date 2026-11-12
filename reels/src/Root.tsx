import "./fonts";
import { Composition, Still } from "remotion";
import { Reel01, REEL01_FRAMES } from "./Reel01";
import { Reel02, REEL02_FRAMES } from "./Reel02";
import { Reel03, REEL03_FRAMES } from "./Reel03";
import { Reel04, REEL04_FRAMES } from "./Reel04";
import { Reel05, REEL05_FRAMES } from "./Reel05";
import { HIGHLIGHTS } from "./hl/data";
import { lbFrames, LeadBookingDemo } from "./lb/LeadBooking";
import { StoryFrame, STORY_FRAMES } from "./hl/Story";
import { CarouselSlide, Cover, FbCover, SLIDES, Watermark, YtBanner } from "./hl/Stills";

export function Root() {
  return (
    <>
      <Composition id="reel01-hy" component={Reel01} durationInFrames={REEL01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel01-ru" component={Reel01} durationInFrames={REEL01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
      <Composition id="reel02-hy" component={Reel02} durationInFrames={REEL02_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel02-ru" component={Reel02} durationInFrames={REEL02_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
      <Composition id="reel03-hy" component={Reel03} durationInFrames={REEL03_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel03-ru" component={Reel03} durationInFrames={REEL03_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
      <Composition id="reel04-hy" component={Reel04} durationInFrames={REEL04_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel04-ru" component={Reel04} durationInFrames={REEL04_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
      <Composition id="reel05-hy" component={Reel05} durationInFrames={REEL05_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "hy" as const }} />
      <Composition id="reel05-ru" component={Reel05} durationInFrames={REEL05_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />

      {(["en", "hy"] as const).flatMap((lang) => [
        <Composition key={`lb-${lang}-h`} id={`lb-${lang}-16x9`} component={LeadBookingDemo} durationInFrames={lbFrames(lang)} fps={30} width={1920} height={1080} defaultProps={{ lang }} />,
        <Composition key={`lb-${lang}-v`} id={`lb-${lang}-9x16`} component={LeadBookingDemo} durationInFrames={lbFrames(lang)} fps={30} width={1080} height={1920} defaultProps={{ lang }} />,
      ])}

      {HIGHLIGHTS.flatMap((hl) =>
        hl.stories.map((s, i) => (
          <Composition key={s.id} id={`hl-${s.id}`} component={StoryFrame} durationInFrames={s.frames ?? STORY_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ hl, index: i }} />
        )),
      )}
      {HIGHLIGHTS.map((hl) => (
        <Still key={hl.id} id={`cover-${hl.id}`} component={Cover} width={1080} height={1920} defaultProps={{ icon: hl.icon }} />
      ))}
      <Still id="fb-cover" component={FbCover} width={1640} height={624} />
      <Still id="yt-banner" component={YtBanner} width={2560} height={1440} />
      <Still id="yt-watermark" component={Watermark} width={150} height={150} />
      {SLIDES.map((_, i) => (
        <Still key={i} id={`carousel-${i + 1}`} component={CarouselSlide} width={1080} height={1350} defaultProps={{ index: i }} />
      ))}
    </>
  );
}
