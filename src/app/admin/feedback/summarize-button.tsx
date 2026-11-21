"use client";

import { useActionState } from "react";
import { Button, ErrorText } from "@/components/ui";
import { summarizeFeedback, type DigestState } from "./actions";

const initial: DigestState = { status: "idle" };

export function SummarizeButton({
  days,
  hasDigest,
}: {
  days: number;
  hasDigest: boolean;
}) {
  const [state, action, pending] = useActionState(summarizeFeedback, initial);
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="days" value={days} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending
          ? "מסכם... (כחצי דקה)"
          : hasDigest
            ? "לסכם מחדש עם המשוב החדש"
            : "לסכם ולדרג עם AI"}
      </Button>
      {state.status === "error" && <ErrorText>{state.error}</ErrorText>}
    </form>
  );
}
