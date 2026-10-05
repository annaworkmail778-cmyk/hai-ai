"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { media } from "@/config/motion";

type CursorState = "default" | "link" | "view" | "hidden";

/**
 * Minimal desktop cursor: a dot and a trailing ring.
 *  - links / buttons     → ring opens, dot hides
 *  - [data-cursor=view]  → solid disc with a label ("View")
 *  - text fields         → custom cursor hides, native caret shows
 * Fine pointers only; disabled for reduced motion and touch.
 */
export function CustomCursor({ viewLabel }: { viewLabel: string }) {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const query = window.matchMedia(`${media.finePointer} and ${media.motionOk}`);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.querySelector<HTMLElement>(".site");
    root?.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    let state: CursorState = "default";
    let visible = false;

    const setState = (next: CursorState, text?: string) => {
      if (next === state && !text) return;
      state = next;
      ring.dataset.state = next;
      dot.dataset.state = next;
      label.textContent = next === "view" ? text || viewLabel : "";
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      if (!el) return setState("default");
      const field = el.closest("input, textarea, select, [contenteditable='true']");
      if (field) return setState("hidden");
      const marked = el.closest<HTMLElement>("[data-cursor]");
      if (marked) {
        const value = marked.dataset.cursor as CursorState;
        return setState(value, marked.dataset.cursorLabel);
      }
      if (el.closest("a, button, [role='button'], [role='tab'], label, summary")) return setState("link");
      setState("default");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const onOver = (e: PointerEvent) => resolve(e.target);
    const onLeaveWindow = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => ring.classList.add("is-pressed");
    const onUp = () => ring.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      root?.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, viewLabel]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-(--z-cursor)">
      <div ref={ringRef} data-state="default" className="cursor-ring invisible fixed top-0 left-0 opacity-0">
        <span ref={labelRef} className="label cursor-label" />
      </div>
      <div ref={dotRef} data-state="default" className="cursor-dot invisible fixed top-0 left-0 opacity-0" />
    </div>
  );
}
