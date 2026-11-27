/*
 * Shared event-sourcing kernel used by every RISEUP vertical (Hotel OS, Restaurant OS, …).
 * A vertical provides a seed and a pure reducer; the kernel guarantees that each event applies
 * exactly once, in server order, so every device computes the same state.
 */

export type Stamped<E> = E & { id: string; at: number; by: string };

/** Applies ordered events to a fresh seed. Duplicate ids (at-least-once delivery) are applied once. */
export function replayEvents<S, E extends { id: string }>(seed: S, events: E[], apply: (state: S, ev: E) => unknown): S {
  const seen = new Set<string>();
  for (const e of events) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    apply(seed, e);
  }
  return seed;
}
