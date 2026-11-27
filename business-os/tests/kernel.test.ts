/* Shared kernel (used by Hotel OS and Restaurant OS). */
import assert from "node:assert/strict";
import test from "node:test";
import { replayEvents } from "../src/lib/kernel/replay.ts";

test("kernel: each event id applies once, in order", () => {
  const out = replayEvents({ log: [] as string[] }, [{ id: "a" }, { id: "b" }, { id: "a" }, { id: "c" }], (s, e) => s.log.push(e.id));
  assert.deepEqual(out.log, ["a", "b", "c"]);
});

test("kernel: hotel replay is unchanged by the extraction (same state as manual application)", async () => {
  const { replay, apply } = await import("../src/lib/engine.ts");
  const { createSeed } = await import("../src/lib/seed.ts");
  const base = "2026-12-01";
  const ev = { type: "staffTask.create", id: "t1", at: Date.parse("2026-12-01T08:00:00Z"), by: "s-gohar", title: "X", assigneeId: null, priority: "normal", due: base } as const;
  const viaKernel = replay(base, [ev, ev]);
  const manual = createSeed(base);
  apply(manual, ev);
  manual.reservations.sort((a, b) => (b.displayAt ?? b.createdAt) - (a.displayAt ?? a.createdAt));
  assert.deepEqual(viaKernel, manual);
});
