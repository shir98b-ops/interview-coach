"use client";

import { useActionState } from "react";
import { sendFeedback, type FeedbackState } from "@/app/feedback/actions";
import { MAX_FEEDBACK_LENGTH } from "@/lib/feedback/schema";
import { Button, ErrorText, inputStyles } from "./ui";

const initial: FeedbackState = { status: "idle" };

/** A small "feedback" menu in the header that opens a short form. */
export function FeedbackButton() {
  const [state, action, pending] = useActionState(sendFeedback, initial);

  return (
    <details className="relative">
      <summary className="text-muted hover:bg-violet-soft flex min-h-11 cursor-pointer list-none items-center rounded-full px-4 font-medium">
        משוב
      </summary>
      <div className="border-line fixed inset-x-4 top-16 z-20 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-lg sm:absolute sm:inset-x-auto sm:end-0 sm:top-auto sm:mt-2 sm:w-80">
        {state.status === "sent" ? (
          <p role="status" className="text-success-ink font-bold">
            תודה! המשוב התקבל.
          </p>
        ) : (
          <form action={action} className="flex flex-col gap-3">
            <label htmlFor="feedback-message" className="font-bold">
              מה כדאי לשפר? מה עבד טוב?
            </label>
            <textarea
              id="feedback-message"
              name="message"
              rows={4}
              required
              maxLength={MAX_FEEDBACK_LENGTH}
              dir="auto"
              className={inputStyles}
            />
            {state.status === "error" && <ErrorText>{state.error}</ErrorText>}
            <Button type="submit" disabled={pending}>
              {pending ? "שולח..." : "לשלוח משוב"}
            </Button>
          </form>
        )}
      </div>
    </details>
  );
}
