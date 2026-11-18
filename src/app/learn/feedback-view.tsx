import { Chip } from "@/components/ui";
import {
  scoreLabel,
  type ExerciseFeedback,
} from "@/lib/learn/exercise-feedback";

export function ExerciseFeedbackView({
  feedback,
}: {
  feedback: ExerciseFeedback;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-violet text-4xl font-extrabold">
          {feedback.score}
          <span className="text-muted text-xl">/5</span>
        </span>
        <Chip tone="lime">{scoreLabel(feedback.score)}</Chip>
      </div>
      {feedback.strengths && (
        <div className="bg-success-soft rounded-2xl p-4">
          <p className="text-success-ink font-bold">מה עבד</p>
          <p dir="auto">{feedback.strengths}</p>
        </div>
      )}
      {feedback.improvements && (
        <div className="bg-orange-soft rounded-2xl p-4">
          <p className="text-orange-ink font-bold">מה לשפר</p>
          <p dir="auto">{feedback.improvements}</p>
        </div>
      )}
      {feedback.betterAnswer && (
        <details className="bg-violet-soft rounded-2xl p-4">
          <summary className="text-violet-dark cursor-pointer font-bold">
            ככה יכולה להישמע תשובה חזקה יותר
          </summary>
          <p dir="auto" className="mt-2 whitespace-pre-wrap">
            {feedback.betterAnswer}
          </p>
        </details>
      )}
    </div>
  );
}
