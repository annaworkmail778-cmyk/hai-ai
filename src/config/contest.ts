/**
 * The current giveaway. The site banner shows from `start` until the end of `results`
 * (Yerevan time); after that the banner hides itself and the page stays as an archive.
 */
export const contest = {
  start: "2026-11-13T00:00:00+04:00",
  end: "2026-11-25T23:59:59+04:00",
  /** Banner disappears after this moment. */
  hideAfter: "2026-11-26T23:59:59+04:00",
  video: "/contest/video.mp4",
  poster: "/contest/poster.jpg",
} as const;
