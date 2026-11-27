"use client";
/*
 * Guest-device state of the restaurant site. The cart lives only on this device (it is not an order until it is sent),
 * so staff never see carts. The table context comes from the QR entry and expires after a few hours.
 */
import { useCallback, useEffect, useState } from "react";
import type { CartLine } from "@/lib/restaurant/types";

const read = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("rst-local")); } catch { /* blocked storage */ } };

export type TableCtx = { token: string; at: number };
const TABLE_TTL = 6 * 3600 * 1000;

function useLocal<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(fallback);
  useEffect(() => {
    const load = () => setV(read(key, fallback));
    load();
    window.addEventListener("rst-local", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("rst-local", load); window.removeEventListener("storage", load); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((x: T) => { write(key, x); setV(x); }, [key]);
  return [v, set] as const;
}

export function useTableCtx() {
  const [ctx, setCtx] = useLocal<TableCtx | null>("rst:table", null);
  const valid = ctx && Date.now() - ctx.at < TABLE_TTL ? ctx : null;
  return { table: valid, setTable: setCtx, clearTable: () => setCtx(null) };
}

export function useCart(mode: "table" | "takeaway") {
  const [lines, setLines] = useLocal<CartLine[]>(`rst:cart:${mode}`, []);
  const add = (l: CartLine) => {
    const same = lines.findIndex((x) => x.itemId === l.itemId && x.note === l.note && x.modifierIds.slice().sort().join() === l.modifierIds.slice().sort().join());
    if (same >= 0) setLines(lines.map((x, i) => (i === same ? { ...x, qty: Math.min(20, x.qty + l.qty) } : x)));
    else setLines([...lines, l]);
  };
  const setQty = (i: number, qty: number) => setLines(qty <= 0 ? lines.filter((_, j) => j !== i) : lines.map((x, j) => (j === i ? { ...x, qty: Math.min(20, qty) } : x)));
  return { lines, add, setQty, clear: () => setLines([]), count: lines.reduce((a, l) => a + l.qty, 0) };
}

/** Random per-device token: the status page shows an order only on the device that placed it. */
export function deviceKey() {
  let k = read<string>("rst:device", "");
  if (!k) { k = `d-${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`; write("rst:device", k); }
  return k;
}

export function useMyOrders() {
  const [ids, setIds] = useLocal<string[]>("rst:myorders", []);
  return { ids, push: (id: string) => setIds([id, ...ids.filter((x) => x !== id)].slice(0, 20)) };
}
