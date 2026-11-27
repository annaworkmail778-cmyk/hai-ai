"use client";
import { use } from "react";
import { BookingBar, RoomCard, SectionTitle } from "@/components/hotel/site";
import { ROOM_TYPES } from "@/lib/hotel-data";
import { t } from "@/lib/site-i18n";
import type { Lang } from "@/lib/types";

export default function Rooms({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const d = t(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
      <SectionTitle title={d.roomsTitle} text={d.roomsText} />
      <div className="mt-8"><BookingBar lang={lang} compact /></div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{ROOM_TYPES.map((r) => <RoomCard key={r.id} room={r} lang={lang} />)}</div>
    </div>
  );
}
