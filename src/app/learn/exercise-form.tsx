"use client";

import { useActionState } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { MAX_ANSWER_LENGTH } from "@/lib/interview/schema";
import { submitExercise, type ExerciseState } from "./actions";
import { ExerciseFeedbackView } from "./feedback-view";

/** The lesson's practice question, with instant feedback on the answer. */
export function ExerciseForm({
  lesson,
  hint,
}: {
  lesson: string;
  hint: string;
}) {
  const [state, action, pending] = useActionState<ExerciseState, FormData>(
    submitExercise,
    { status: "idle" },
  );

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="lesson" value={lesson} />
        <label htmlFor="exercise-answer" className="text-muted font-medium">
          התשובה שלך
        </label>
        <textarea
          dir="auto"
          id="exercise-answer"
          name="answer"
          required
          rows={8}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="אפשר לענות בעברית או באנגלית."
          className={`${inputStyles} min-h-48`}
        />
        <p className="text-muted text-sm">טיפ: {hint}</p>
        {state.status === "error" && <ErrorText>{state.error}</ErrorText>}
        <Button
          type="submit"
          variant="lime"
          disabled={pending}
          className="w-full sm:w-fit"
        >
          {pending
            ? "בודק את התשובה שלך..."
            : state.status === "done"
              ? "לבדוק שוב"
              : "לבדוק את התשובה"}
        </Button>
      </form>
      {state.status === "done" && (
        <div role="status">
          <ExerciseFeedbackView feedback={state.feedback} />
        </div>
      )}
    </div>
  );
}
