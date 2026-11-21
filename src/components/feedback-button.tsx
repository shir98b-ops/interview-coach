"use client";

import { useActionState } from "react";
import { sendFeedback, type FeedbackState } from "@/app/feedback/actions";
import { MAX_FEEDBACK_LENGTH } from "@/lib/feedback/schema";
import { Button, ErrorText, inputStyles } from "./ui";

const initial: FeedbackState = { status: "idle" };

/**
 * A small "feedback" menu that opens a short form, below the link or, in the
 * desktop sidebar, above it and toward the page.
 */
export function FeedbackButton({
  placement = "below",
}: {
  placement?: "below" | "above";
}) {
  const [state, action, pending] = useActionState(sendFeedback, initial);

  return (
    <details className="relative">
      <summary className="text-muted hover:bg-sky-soft flex min-h-11 cursor-pointer list-none items-center rounded-full px-4 font-medium">
        משוב
      </summary>
      <div
        className={`border-line fixed inset-x-4 top-16 z-20 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-lg sm:absolute sm:inset-x-auto sm:w-80 ${placement === "above" ? "sm:start-0 sm:top-auto sm:bottom-full sm:mb-2" : "sm:end-0 sm:top-auto sm:mt-2"}`}
      >
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
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-bold">
                כמה האפליקציה עוזרת? (לא חובה)
              </legend>
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      className="peer sr-only"
                    />
                    <span className="border-line peer-checked:bg-blue peer-focus-visible:outline-blue peer-checked:border-blue flex size-11 items-center justify-center rounded-full border-2 font-bold peer-checked:text-white peer-focus-visible:outline-2">
                      {star}
                    </span>
                    <span className="sr-only">
                      {star === 1 ? "כוכב אחד" : `${star} כוכבים`}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-muted text-sm">1 = לא עוזרת, 5 = עוזרת מאוד</p>
            </fieldset>
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
