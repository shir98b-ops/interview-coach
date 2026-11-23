import { seniorityLevels } from "@/lib/format";
import { inputStyles } from "./ui";

/**
 * Choose the level to practice at: the questions, the take-home and the
 * scoring all follow it. Left on the first option, the level is read from
 * the job posting, else from the resume.
 */
export function LevelSelect({
  defaultValue,
  disabled,
  fromJob = false,
  className = "",
}: {
  defaultValue?: string | null;
  disabled?: boolean;
  /** Built from a job posting, so the automatic level is the posting's. */
  fromJob?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 font-bold ${className}`}>
      רמת התפקיד
      <select
        name="seniority"
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        className={inputStyles}
      >
        <option value="">
          {fromJob ? "לפי המודעה" : "לפי קורות החיים שלי"}
        </option>
        {seniorityLevels.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label} ({level.years})
          </option>
        ))}
      </select>
    </label>
  );
}
