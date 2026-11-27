"use client";
import { useEffect, useState } from "react";

/** Current time as React state, refreshed every `intervalMs` (keeps render pure). */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}
