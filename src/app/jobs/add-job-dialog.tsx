"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { AddJobForm, ImportLinkedInForm, PasteJobForm } from "./forms";

type View = "paste" | "manual" | "import";

/**
 * "Add a job" opens a sheet from the bottom of the screen on phones and a
 * window in the middle on a computer: paste the posting, or add it by hand,
 * or import the jobs applied to on LinkedIn.
 */
export function AddJobDialog({
  variant,
}: {
  variant: "round" | "pill" | "card";
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<View>("paste");

  function open() {
    setView("paste");
    dialog.current?.showModal();
  }

  return (
    <>
      {variant === "round" ? (
        <button
          type="button"
          onClick={open}
          aria-label="להוסיף משרה"
          className="bg-ink flex h-12 w-12 items-center justify-center rounded-full text-white transition active:scale-95"
        >
          <Plus />
        </button>
      ) : (
        <button
          type="button"
          onClick={open}
          className="bg-ink inline-flex min-h-[46px] w-fit items-center gap-2 rounded-full px-6 font-extrabold whitespace-nowrap text-white transition hover:shadow-[0_8px_18px_rgba(20,38,58,0.25)] motion-safe:hover:-translate-y-0.5"
        >
          <Plus small />
          {variant === "card" ? "להוסיף משרה ראשונה" : "להוסיף משרה"}
        </button>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="add-job-title"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        className="backdrop:bg-ink/45 m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[30px] bg-white p-0 lg:m-auto lg:max-w-xl lg:rounded-[30px]"
      >
        <div className="flex flex-col gap-5 p-5 pb-8 lg:p-8">
          <span
            aria-hidden
            className="bg-line mx-auto h-1.5 w-11 rounded-full lg:hidden"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icon name="briefcase" size={44} />
              <h2 id="add-job-title" className="text-3xl font-black">
                {view === "import" ? "ייבוא מלינקדאין" : "משרה חדשה"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="סגירה"
              className="border-line text-muted flex h-12 w-12 items-center justify-center rounded-full border-[1.5px]"
            >
              <svg
                aria-hidden
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {view === "paste" && <PasteJobForm />}
          {view === "manual" && <AddJobForm />}
          {view === "import" && <ImportSteps />}

          <div className="flex flex-col">
            {view !== "paste" && (
              <SwitchLink onClick={() => setView("paste")}>
                להדביק מודעה
              </SwitchLink>
            )}
            {view !== "manual" && (
              <SwitchLink onClick={() => setView("manual")}>
                להוסיף ידנית, בלי מודעה
              </SwitchLink>
            )}
            {view !== "import" && (
              <SwitchLink onClick={() => setView("import")}>
                לייבא משרות מלינקדאין
              </SwitchLink>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

function Plus({ small = false }: { small?: boolean }) {
  const size = small ? 16 : 22;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SwitchLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-ink-soft flex min-h-12 items-center justify-between text-start text-lg"
    >
      {children}
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
    </button>
  );
}

function ImportSteps() {
  return (
    <div className="flex flex-col gap-4">
      <p>
        לינקדאין מאפשרת להוריד קובץ עם המשרות שהגשת אליהן. מעלים אותו כאן, וכולן
        נכנסות לרשימה.
      </p>
      <details>
        <summary className="cursor-pointer font-bold">
          איך מורידים את הקובץ
        </summary>
        <ol className="mt-3 flex list-decimal flex-col gap-2 ps-5">
          <li>
            בלינקדאין במחשב, לוחצים לפי הסדר:
            <span
              dir="ltr"
              className="mt-1 flex flex-col items-end font-mono text-sm"
            >
              <span>Me</span>
              <span>Settings &amp; Privacy</span>
              <span>Data privacy</span>
              <span>Get a copy of your data</span>
            </span>
          </li>
          <li>
            בוחרים את האפשרות שמאפשרת לבחור מידע מסוים, ומסמנים את המשרות שהגשת
            אליהן.
          </li>
          <li>
            לינקדאין שולחת מייל כשהקובץ מוכן, בדרך כלל תוך כמה דקות עד יום.
          </li>
          <li>מעלים כאן את הקובץ כמו שהוא, בלי לפתוח אותו.</li>
        </ol>
      </details>
      <ImportLinkedInForm />
      <p className="text-muted text-sm">
        הקובץ נפתח אצלך בדפדפן, ורק רשימת המשרות נשלחת אלינו.
      </p>
    </div>
  );
}
