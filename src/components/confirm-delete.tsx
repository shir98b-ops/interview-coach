"use client";

import { useState } from "react";

/**
 * A delete button that asks once before deleting: the first tap turns it
 * into a confirmation, and only the second tap sends the form.
 */
export function ConfirmDeleteButton({
  label,
  confirmLabel,
  className = "",
}: {
  label: string;
  confirmLabel: string;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={`text-muted hover:text-danger min-h-11 text-sm font-medium ${className}`}
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="submit"
        className="bg-danger min-h-11 rounded-full px-4 text-sm font-bold text-white"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="text-muted min-h-11 px-2 text-sm font-medium"
      >
        ביטול
      </button>
    </span>
  );
}
