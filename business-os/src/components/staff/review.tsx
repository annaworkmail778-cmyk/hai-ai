"use client";
import { useState } from "react";
import { useDemo } from "@/lib/client/demo-store";
import { POSITION_LABEL } from "@/lib/hospitality-data";
import type { Enrollment } from "@/lib/types";
import { Avatar, Button, Textarea } from "../ui";

/** Supervisor review of a submitted onboarding module (approve or request changes). */
export function ReviewCard({ e }: { e: Enrollment }) {
  const { state, dispatch } = useDemo();
  const [note, setNote] = useState("");
  const emp = state.staff.find((s) => s.id === e.employeeId);
  const m = state.training.find((x) => x.id === e.moduleId);
  if (!emp || !m) return null;
  const quizzes = m.steps.filter((s) => s.kind === "quiz");
  return (
    <div className="rounded-2xl border border-warn/40 bg-surface p-4">
      <div className="flex items-center gap-3"><Avatar initials={emp.initials} size={34} /><div className="min-w-0 flex-1"><div className="text-[14.5px] font-semibold">{emp.name}</div><div className="text-[12.5px] text-muted">{POSITION_LABEL[emp.position]} · {m.title}</div></div></div>
      <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
        <span className="rounded-lg bg-paper px-2.5 py-1">Քայլեր՝ {e.done.length}/{m.steps.length}</span>
        {quizzes.map((q) => <span key={q.id} className="rounded-lg bg-paper px-2.5 py-1">{q.title}՝ {e.scores[q.id] ?? "—"}%</span>)}
      </div>
      <Textarea className="mt-3" placeholder="Մեկնաբանություն աշխատակցին (պարտադիր՝ ուղղումներ պահանջելիս)" value={note} onChange={(ev) => setNote(ev.target.value)} />
      <div className="mt-3 flex gap-2">
        <Button variant="primary" icon="check" className="flex-1" onClick={() => dispatch({ type: "training.review", enrollmentId: e.id, approved: true, note: note.trim() || "Հաստատված է։ Լավ աշխատանք։" })}>Հաստատել</Button>
        <Button className="flex-1" disabled={!note.trim()} onClick={() => dispatch({ type: "training.review", enrollmentId: e.id, approved: false, note: note.trim() })}>Պահանջել ուղղումներ</Button>
      </div>
    </div>
  );
}
