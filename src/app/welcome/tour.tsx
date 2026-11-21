"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { hideTourForGood } from "./actions";

/** One step of the welcome tour: where a feature lives and what it does. */
interface Step {
  title: string;
  body: string;
  where?: string;
}

const steps: Step[] = [
  {
    title: "ברוכים הבאים!",
    body: "כאן מתכוננים לראיונות עבודה: מתאמנים על שאלות אמיתיות, מקבלים ציון ומשוב על כל תשובה, ולומדים בדיוק את מה שחסר. ההדרכה לוקחת חצי דקה.",
  },
  {
    title: "קודם כל, פרופיל",
    body: "מעלים קורות חיים ומאשרים את הפרטים, ובוחרים לאיזה תפקיד מתכוננים. מזה נבנות כל השאלות. שם גם מקבלים ציון לקורות החיים והצעות לשכתוב.",
    where: "בתפריט: פרופיל",
  },
  {
    title: "תרגול ראיון",
    body: "חמש שאלות, אחת בכל פעם. בוחרים ראיון כללי, מקצועי או ניתוח מקרה, ועונים בדיבור או בכתב. בסוף מקבלים ציון, מה עבד, מה לשפר ודוגמה לתשובה חזקה יותר.",
    where: "בתפריט: תרגול",
  },
  {
    title: "משרות שהגשת אליהן",
    body: "מדביקים מודעת דרושים, ומקבלים תוכנית הכנה למשרה: מה מחפשים, איפה הפערים ואילו שאלות צפויות. משם אפשר גם להתאמן על ראיון שנבנה מתוך המודעה.",
    where: "בתפריט: משרות",
  },
  {
    title: "למידה",
    body: "שיעורים של חמש דקות, כל אחד עם שאלת תרגול, ומבחני בית כמו באמת. האתר ממליץ על השיעור שהכי יעזור לפי הציונים שלך.",
    where: "בתפריט: למידה",
  },
  {
    title: "ספרו לנו מה חושבים",
    body: "בכל עמוד יש כפתור משוב. כל הערה, גם קטנה, עוזרת לשפר את האתר.",
    where: "בתפריט: משוב",
  },
];

const SEEN_KEY = "welcome-tour-seen";

/**
 * A short tour on the first visit. Closing it hides it until the next
 * visit; ticking "don't show again" turns it off for the account.
 */
export function WelcomeTour() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [hideForGood, setHideForGood] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage can be blocked; then the tour shows on each page load here.
    }
    if (!seen) dialog.current?.showModal();
  }, []);

  function close() {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Nothing to remember; the tour may show again next time.
    }
    if (hideForGood) void hideTourForGood();
    dialog.current?.close();
  }

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <dialog
      ref={dialog}
      onCancel={close}
      aria-labelledby="tour-title"
      className="m-auto w-[min(100%-2rem,32rem)] rounded-[28px] bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted text-sm font-bold">
            {step + 1} מתוך {steps.length}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="לסגור את ההדרכה"
            className="text-muted hover:bg-sky-soft flex size-11 items-center justify-center rounded-full text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3" aria-live="polite">
          <h2 id="tour-title" className="text-2xl font-extrabold">
            {current.title}
          </h2>
          <p className="text-lg">{current.body}</p>
          {current.where && (
            <p className="text-blue font-bold">{current.where}</p>
          )}
        </div>

        <div className="flex justify-center gap-2" aria-hidden="true">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${index === step ? "bg-blue w-6" : "bg-line w-2"}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={hideForGood}
              onChange={(event) => setHideForGood(event.target.checked)}
              className="accent-blue size-5"
            />
            לא להציג את זה שוב
          </label>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="quiet"
                onClick={() => setStep(step - 1)}
              >
                הקודם
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              onClick={() => (last ? close() : setStep(step + 1))}
            >
              {last ? "מתחילים" : "הבא"}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
