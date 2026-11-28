"use client";
import { useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { stamp } from "@/lib/format";
import type { LostItem } from "@/lib/types";
import { Badge, Button, Card, CardHead, Input, Select } from "../ui";

const ST: Record<LostItem["status"], [string, "info" | "ok" | "neutral"]> = { stored: ["Պահվում է", "info"], returned: ["Վերադարձված", "ok"], disposed: ["Ոչնչացված", "neutral"] };

export function LostFound() {
  const { state, dispatch } = useDemo();
  const [item, setItem] = useState("");
  const [room, setRoom] = useState("");
  return (
    <Card className="mt-4" pad={false}>
      <div className="border-b border-line px-4 py-3"><CardHead title="Կորած և գտնված իրեր" sub="Գրանցում, պահպանում, վերադարձ" /></div>
      <form onSubmit={(e) => { e.preventDefault(); if (!item.trim()) return; dispatch({ type: "lost.create", roomId: room || null, item }); setItem(""); setRoom(""); }} className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
        <Select className="max-w-36" value={room} onChange={(e) => setRoom(e.target.value)}><option value="">Հանրային տարածք</option>{state.rooms.map((r) => <option key={r.id} value={r.id}>{r.id}</option>)}</Select>
        <Input className="min-w-48 flex-1" placeholder="Իր, օր․՝ սև շարֆ" value={item} onChange={(e) => setItem(e.target.value)} />
        <Button disabled={!item.trim()}>Գրանցել</Button>
      </form>
      <ul className="divide-y divide-line">
        {state.lostFound.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13px]">
            <span className="min-w-0 flex-1"><b>{x.item}</b> <span className="text-muted">· {x.roomId ? `սենյակ ${x.roomId}` : "հանրային տարածք"} · {state.staff.find((s) => s.id === x.foundBy)?.name ?? x.foundBy} · {stamp(x.foundAt, state.baseDate)}{x.note ? ` · ${x.note}` : ""}</span></span>
            <Badge tone={ST[x.status][1]}>{ST[x.status][0]}</Badge>
            {x.status === "stored" && <><Button size="sm" onClick={() => dispatch({ type: "lost.status", target: x.id, status: "returned" })}>Վերադարձվեց</Button><Button size="sm" variant="ghost" onClick={() => dispatch({ type: "lost.status", target: x.id, status: "disposed" })}>Ոչնչացնել</Button></>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
