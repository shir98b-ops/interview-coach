"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui";

/**
 * A save button for a form whose action stays on the same page. It shows
 * "saving" while the form is sent, then "saved" for a few seconds, so the
 * user can see that the click worked.
 */
export function SaveButton({
  label = "לשמור",
  className = "",
  variant = "primary",
}: {
  label?: string;
  className?: string;
  variant?: "primary" | "quiet";
}) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      return;
    }
    if (!wasPending.current) return;
    wasPending.current = false;
    const show = setTimeout(() => setSaved(true), 0);
    const hide = setTimeout(() => setSaved(false), 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [pending]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="submit"
        variant={variant}
        disabled={pending}
        className={className}
      >
        {pending ? "שומר..." : label}
      </Button>
      {saved && !pending && (
        <p role="status" className="text-success-ink font-bold">
          נשמר ✓
        </p>
      )}
    </div>
  );
}
