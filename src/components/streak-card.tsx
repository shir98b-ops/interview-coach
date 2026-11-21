import { practiceStreak } from "@/lib/interview/streak";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "./ui";

/**
 * The practice streak at the bottom of the desktop sidebar. A new user sees
 * an invitation instead of a zero.
 */
export async function StreakCard() {
  const supabase = await createClient();
  const now = new Date();
  const since = new Date(now.getTime() - 60 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("sessions")
    .select("completed_at")
    .not("completed_at", "is", null)
    .gte("completed_at", since);
  const streak = practiceStreak(
    (data ?? []).map((row) => new Date(row.completed_at as string)),
    now,
  );

  const [title, note] =
    streak.days === 0
      ? ["מתחילים רצף", "תרגול אחד היום פותח רצף חדש"]
      : [
          streak.days === 1 ? "יום אחד ברצף" : `${streak.days} ימים ברצף`,
          streak.practicedToday
            ? "תרגלת היום, כל הכבוד"
            : "תרגול אחד היום שומר על הרצף",
        ];

  return (
    <div className="bg-sun-soft flex items-center gap-3 rounded-[22px] p-3.5">
      <Icon name="fire" size={36} />
      <div className="flex flex-col">
        <b className="text-[15px]">{title}</b>
        <span className="text-muted text-xs">{note}</span>
      </div>
    </div>
  );
}
