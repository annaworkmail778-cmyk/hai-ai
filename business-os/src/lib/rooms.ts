import { roomType } from "./hotel-data.ts";
import { outOfOrderRooms } from "./pricing.ts";
import type { HkStatus, HotelState, Reservation, Room, RoomType } from "./types.ts";

export type LiveStatus = "occupied" | "departing" | "dirty" | "cleaning" | "arriving" | "available" | "ooo";
export type RoomLive = { room: Room; type: RoomType; status: LiveStatus; hk: HkStatus; current?: Reservation; next?: Reservation; arrival?: Reservation };

export const LIVE_LABEL: Record<LiveStatus, string> = {
  occupied: "Զբաղված", departing: "Մեկնում է այսօր", dirty: "Մաքրման կարիք", cleaning: "Մաքրվում է", arriving: "Ժամանում է այսօր", available: "Ազատ", ooo: "Չի գործում",
};

export function liveRooms(state: HotelState): RoomLive[] {
  const today = state.baseDate;
  const ooo = outOfOrderRooms(state);
  return state.rooms.map((room) => {
    const mine = state.reservations.filter((r) => r.roomId === room.id);
    const current = mine.find((r) => r.status === "checked_in" && r.checkIn <= today && r.checkOut >= today);
    const arrival = mine.find((r) => r.status === "confirmed" && r.checkIn === today);
    const next = mine.filter((r) => r.status === "confirmed" && r.checkIn >= today).sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
    const hk = state.hk[room.id] ?? "inspected";
    let status: LiveStatus;
    if (ooo.has(room.id)) status = "ooo";
    else if (current) status = current.checkOut === today ? "departing" : "occupied";
    else if (hk === "dirty") status = "dirty";
    else if (hk === "cleaning") status = "cleaning";
    else if (arrival) status = "arriving";
    else status = "available";
    return { room, type: roomType(room.typeId), status, hk, current, next, arrival };
  });
}
