"use client";

import { useEffect } from "react";

/**
 * A short buzz when a button or link is tapped. Only Android browsers let
 * a website vibrate; elsewhere this does nothing. It is skipped when the
 * device asks for less motion.
 */
export function Haptics() {
  useEffect(() => {
    if (typeof navigator.vibrate !== "function") return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onTap(event: PointerEvent) {
      if (event.pointerType !== "touch" || calm.matches) return;
      const target = event.target as Element | null;
      const control = target?.closest("a, button, [role=button], summary");
      if (!control || control.matches(":disabled")) return;
      navigator.vibrate(10);
    }
    document.addEventListener("pointerdown", onTap, { passive: true });
    return () => document.removeEventListener("pointerdown", onTap);
  }, []);
  return null;
}
