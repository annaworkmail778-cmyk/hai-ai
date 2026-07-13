"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

function ReelSlot({ src, caption, index }: { src: string; caption: string; index: number }) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // The <video> can fire `loadeddata` before React hydrates and attaches its
  // handler, so also check readyState on mount to catch an already-loaded clip.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.readyState >= 2) setLoaded(true);
    if (v.error) setFailed(true);
  }, []);

  const showVideo = loaded && !failed;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: 0.12 * index, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[290px]"
    >
      <div className="glass-card group relative aspect-[9/16] overflow-hidden rounded-4xl p-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          controls={showVideo}
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full rounded-3xl object-cover ${showVideo ? "block" : "hidden"}`}
        />
        {!showVideo && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-b from-blush-100 via-blush-200 to-blush-300/70 text-center">
            <div className="w-24 opacity-90">
              <Image src="/robot.png" alt="" width={444} height={521} className="anim-float h-auto w-full" />
            </div>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cocoa-grad shadow-glow-gold transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 text-blush-200" fill="currentColor" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-cocoa-600">{t.reels.comingSoon}</p>
              <p className="mt-1 font-mono text-[10px] text-cocoa-300">{src.replace("/", "public/")}</p>
            </div>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-center font-display text-sm font-semibold text-cocoa-500">{caption}</figcaption>
    </motion.figure>
  );
}

export default function Reels() {
  const { t } = useI18n();
  const reels = [
    { src: "/reels/reel-1.mp4", caption: t.reels.cap1 },
    { src: "/reels/reel-2.mp4", caption: t.reels.cap2 },
  ];
  return (
    <section id="reels" className="section-pad relative scroll-mt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute bottom-0 right-[-8%] h-[24rem] w-[24rem] rounded-full bg-blush-300/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t.reels.eyebrow}
          title={
            <>
              {t.reels.titleA} <span className="text-gradient-brand">{t.reels.titleAccent}</span>
            </>
          }
          sub={t.reels.sub}
        />

        <div className="mt-14 flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-start">
          {reels.map((reel, i) => (
            <ReelSlot key={reel.src} src={reel.src} caption={reel.caption} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <InstagramIcon className="h-4.5 w-4.5" />
            {t.reels.follow}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
