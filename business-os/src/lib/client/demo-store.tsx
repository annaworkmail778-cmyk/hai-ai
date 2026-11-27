"use client";
/*
 * Hotel OS demo session (client). The sync logic lives in the shared kernel (`lib/kernel/demo-store.tsx`);
 * this file binds it to the hotel: same API path, same localStorage keys ("bos:…") and same default actor
 * as before the extraction, so existing devices keep their state.
 */
import { createDemoStore, type Conn as KConn, type Role as KRole } from "../kernel/demo-store.tsx";
import { replay } from "../engine.ts";
import type { DemoEvent, HotelState, StampedEvent } from "../types.ts";

export type Conn = KConn;
export type Role = KRole;

const hotel = createDemoStore<HotelState, DemoEvent>({
  apiBase: "/api/session",
  prefix: "bos",
  replay: (baseDate, events) => replay(baseDate, events as StampedEvent[]),
  defaultActor: "s-gohar",
});

export const DemoProvider = hotel.Provider;
export const useDemo = hotel.useStore;
