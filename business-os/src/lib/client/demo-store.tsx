"use client";
/*
 * Client side of the shared demo session.
 *
 *  Live mode  : events are appended to /api/session/{code}; every device polls (~1.2 s while visible)
 *               and replays the same ordered event list → phone and laptop show the same state.
 *  Local mode : no server needed; events live in localStorage and sync between tabs/iframes of the
 *               same browser (BroadcastChannel). Used automatically when the server is unreachable.
 *
 * Nothing is lost on refresh: confirmed events and not-yet-sent events are cached in localStorage
 * and re-sent when the connection returns.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { replay } from "../engine.ts";
import { todayIn } from "../dates.ts";
import type { DemoEvent, HotelState, StampedEvent } from "../types.ts";

export type Conn = "connecting" | "live" | "reconnecting" | "local";
export type Role = "guest" | "staff" | "presenter";

type Cache = { epoch: string; epochAt: number; events: { key: string; ev: StampedEvent }[]; backend?: string };

type Ctx = {
  state: HotelState;
  conn: Conn;
  backend: string;
  session: string;
  /** Current session epoch (changes on reset). */
  epoch: string;
  mode: "live" | "local";
  pending: number;
  dispatch: (e: DemoEvent) => StampedEvent;
  reset: (pin?: string) => Promise<"ok" | "pin" | "error">;
  setMode: (m: "live" | "local") => void;
  setSession: (code: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  /** Staff member currently "logged in" in the dashboard. */
  actor: string;
  setActor: (id: string) => void;
};

const DemoCtx = createContext<Ctx | null>(null);
const LS = {
  session: "bos:session",
  mode: "bos:mode",
  actor: "bos:actor",
  cache: (c: string) => `bos:cache:${c}`,
  pending: (c: string) => `bos:pending:${c}`,
  local: (c: string) => `bos:local:${c}`,
};

const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };

const baseDateOf = (epochAt: number) => todayIn("Asia/Yerevan", epochAt);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function DemoProvider({ children, role: initialRole = "staff" }: { children: ReactNode; role?: Role }) {
  const [session, setSessionState] = useState("a");
  const [mode, setModeState] = useState<"live" | "local">("live");
  const [conn, setConn] = useState<Conn>("connecting");
  const [backend, setBackend] = useState("");
  const [cache, setCache] = useState<Cache>({ epoch: "local", epochAt: Date.now(), events: [] });
  const [pendingEvents, setPending] = useState<StampedEvent[]>([]);
  const [role, setRole] = useState<Role>(initialRole);
  const [actor, setActorState] = useState("s-gohar");
  const ready = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cacheRef = useRef(cache);
  cacheRef.current = cache;
  const pendingRef = useRef(pendingEvents);
  pendingRef.current = pendingEvents;

  /* ---------- boot: restore session, mode and cached events ---------- */
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("s");
    const s = (fromUrl ?? read(LS.session, "a")).toLowerCase().replace(/[^a-z0-9]/g, "") || "a";
    if (fromUrl) write(LS.session, s);
    const m = read<"live" | "local">(LS.mode, "live");
    setSessionState(s);
    setModeState(m);
    setActorState(read(LS.actor, "s-gohar"));
    if (m === "local") {
      setCache(read<Cache>(LS.local(s), { epoch: "local", epochAt: Date.now(), events: [] }));
      setConn("local");
    } else {
      setCache(read<Cache>(LS.cache(s), { epoch: "", epochAt: Date.now(), events: [] }));
      setPending(read<StampedEvent[]>(LS.pending(s), []));
    }
    ready.current = true;
  }, []);

  /* ---------- local mode: cross-tab sync ---------- */
  useEffect(() => {
    if (mode !== "local") return;
    const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`bos-${session}`) : null;
    const reload = () => setCache(read<Cache>(LS.local(session), { epoch: "local", epochAt: Date.now(), events: [] }));
    bc?.addEventListener("message", reload);
    const onStorage = (e: StorageEvent) => { if (e.key === LS.local(session)) reload(); };
    window.addEventListener("storage", onStorage);
    return () => { bc?.close(); window.removeEventListener("storage", onStorage); };
  }, [mode, session]);

  /* ---------- live mode: polling + flushing the pending queue ---------- */
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (mode !== "live") return;
    let stop = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let again = false;
    let idleSince = Date.now();
    const bump = () => (idleSince = Date.now());
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);

    const body = async () => {
      const c = cacheRef.current;
      const last = c.events[c.events.length - 1]?.key ?? "";
      const res = await fetch(`/api/session/${session}?epoch=${encodeURIComponent(c.epoch)}&after=${encodeURIComponent(last)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Cache & { backend: string };
      setBackend(data.backend);
      const reset = data.epoch !== c.epoch;
      const next: Cache = reset
        ? { epoch: data.epoch, epochAt: data.epochAt, events: data.events, backend: data.backend }
        : data.events.length ? { ...c, events: [...c.events, ...data.events] } : c;
      if (next !== c) { cacheRef.current = next; setCache(next); write(LS.cache(session), next); }
      // send events created on this device that the server doesn't have yet (in order, one by one)
      const known = new Set(next.events.map((e) => e.ev.id));
      let pend = pendingRef.current.filter((p) => !known.has(p.id));
      if (reset && c.epoch) pend = []; // the session was reset from another device
      for (const p of [...pend]) {
        const r = await fetch(`/api/session/${session}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op: "append", epoch: next.epoch, event: p }) });
        if (r.status === 409) { pend = []; break; }
        if (!r.ok) throw new Error(String(r.status));
        pend = pend.filter((x) => x.id !== p.id);
        pendingRef.current = pendingRef.current.filter((x) => x.id !== p.id);
      }
      if (reset && c.epoch) pendingRef.current = [];
      setPending(pendingRef.current);
      write(LS.pending(session), pendingRef.current);
    };

    const run = async () => {
      if (stop) return;
      if (running) { again = true; return; }
      running = true;
      clearTimeout(timer);
      const hidden = document.visibilityState === "hidden";
      const idle = Date.now() - idleSince > 20 * 60 * 1000;
      try {
        if (!hidden && !idle) { await body(); failures = 0; setConn("live"); }
      } catch {
        failures++;
        setConn("reconnecting");
      } finally {
        running = false;
        if (again) { again = false; run(); }
        else if (!stop) timer = setTimeout(run, failures ? Math.min(8000, 1000 * 2 ** failures) : hidden ? 4000 : 1200);
      }
    };
    wakeRef.current = run;
    run();
    document.addEventListener("visibilitychange", run);
    window.addEventListener("online", run);
    return () => {
      stop = true; clearTimeout(timer);
      wakeRef.current = () => {};
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("online", run);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [mode, session]);

  const dispatch = useCallback((e: DemoEvent): StampedEvent => {
    const ev = { ...e, id: uid(), at: Date.now(), by: role === "staff" ? actor : role } as StampedEvent;
    if (mode === "local") {
      const c = read<Cache>(LS.local(session), { epoch: "local", epochAt: cacheRef.current.epochAt, events: [] });
      const next = { ...c, events: [...c.events, { key: `${String(Date.now()).padStart(14, "0")}-${ev.id}`, ev }] };
      write(LS.local(session), next);
      cacheRef.current = next;
      setCache(next);
      try { const bc = new BroadcastChannel(`bos-${session}`); bc.postMessage("changed"); bc.close(); } catch { /* old browser */ }
    } else {
      pendingRef.current = [...pendingRef.current, ev];
      setPending(pendingRef.current);
      write(LS.pending(session), pendingRef.current);
      wakeRef.current();
    }
    return ev;
  }, [mode, session, role, actor]);

  const reset = useCallback(async (pin?: string): Promise<"ok" | "pin" | "error"> => {
    if (mode === "local") {
      const fresh: Cache = { epoch: "local", epochAt: Date.now(), events: [] };
      write(LS.local(session), fresh);
      setCache(fresh);
      try { const bc = new BroadcastChannel(`bos-${session}`); bc.postMessage("changed"); bc.close(); } catch { /* ignore */ }
      return "ok";
    }
    try {
      const r = await fetch(`/api/session/${session}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op: "reset", pin }) });
      if (r.status === 403) return "pin";
      if (!r.ok) return "error";
      const meta = (await r.json()) as { epoch: string; epochAt: number };
      const fresh: Cache = { epoch: meta.epoch, epochAt: meta.epochAt, events: [] };
      setCache(fresh); setPending([]);
      write(LS.cache(session), fresh); write(LS.pending(session), []);
      return "ok";
    } catch { return "error"; }
  }, [mode, session]);

  const setMode = useCallback((m: "live" | "local") => { write(LS.mode, m); window.location.reload(); }, []);
  const setSession = useCallback((c: string) => { write(LS.session, c); window.location.reload(); }, []);
  const setActor = useCallback((id: string) => { write(LS.actor, id); setActorState(id); }, []);

  // Events sent but not yet returned by a poll stay visible (kept in sentLocal until the server echoes them).
  const sentLocal = useRef<{ epoch: string; events: StampedEvent[] }>({ epoch: "", events: [] });
  const state = useMemo(() => {
    const known = new Set(cache.events.map((e) => e.ev.id));
    if (sentLocal.current.epoch !== cache.epoch) sentLocal.current = { epoch: cache.epoch, events: [...pendingEvents] };
    const sl = sentLocal.current;
    sl.events = sl.events.filter((e) => !known.has(e.id));
    for (const p of pendingEvents) if (!sl.events.some((x) => x.id === p.id)) sl.events.push(p);
    const extra = sl.events;
    return replay(baseDateOf(cache.epochAt), [...cache.events.map((e) => e.ev), ...extra]);
  }, [cache, pendingEvents]);

  const value: Ctx = { state, conn, backend, session, epoch: cache.epoch || "pending", mode, pending: pendingEvents.length, dispatch, reset, setMode, setSession, role, setRole, actor, setActor };
  // Demo state depends on the current date and local storage, so it is rendered on the client only
  // (avoids server/client mismatches). A neutral splash shows for the first frame.
  if (!mounted) return <div className="grid min-h-dvh place-items-center bg-paper"><span className="size-6 animate-spin rounded-full border-2 border-line-2 border-t-ink" aria-label="Loading" /></div>;
  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo outside DemoProvider");
  return c;
}
