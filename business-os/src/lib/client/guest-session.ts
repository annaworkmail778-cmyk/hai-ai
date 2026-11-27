"use client";
/*
 * Demo-only device identity for guests: which member account is "signed in" on this device and which
 * room stay was verified via the room QR. Stored in localStorage. NOT authentication (see the data
 * architecture doc for the production design).
 */
import { useCallback, useEffect, useState } from "react";
import { useDemo } from "./demo-store";

const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("bos-guest")); } catch { /* ignore */ } };

export function useGuestSession() {
  const { state, session } = useDemo();
  const kAcc = `bos:guest:${session}`, kStay = `bos:stay:${session}`;
  const [accountId, setAcc] = useState<string | null>(null);
  const [stay, setStay] = useState<{ roomId: string; reservationId: string } | null>(null);
  useEffect(() => {
    const load = () => { setAcc(read(kAcc, null)); setStay(read(kStay, null)); };
    load();
    window.addEventListener("bos-guest", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("bos-guest", load); window.removeEventListener("storage", load); };
  }, [kAcc, kStay]);
  const account = state.accounts.find((a) => a.id === accountId) ?? null;
  const guest = account ? state.guests.find((g) => g.id === account.guestId) ?? null : null;
  const stayRes = stay ? state.reservations.find((r) => r.id === stay.reservationId && r.status === "checked_in") ?? null : null;
  return {
    account, guest, stay: stayRes ? stay : null, stayRes,
    signIn: useCallback((id: string) => write(kAcc, id), [kAcc]),
    signOut: useCallback(() => write(kAcc, null), [kAcc]),
    verifyStay: useCallback((roomId: string, reservationId: string) => write(kStay, { roomId, reservationId }), [kStay]),
    leaveStay: useCallback(() => write(kStay, null), [kStay]),
  };
}
