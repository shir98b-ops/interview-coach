"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Copies the report so it can be pasted to Claude for a summary. */
export function CopyReport({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="lime"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "הועתק" : "להעתיק את הנתונים לסיכום"}
    </Button>
  );
}
