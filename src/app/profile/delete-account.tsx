"use client";

import { useActionState, useState } from "react";
import { ErrorText, inputStyles } from "@/components/ui";
import { deleteAccount } from "./actions";

const CONFIRM_WORD = "מחיקה";

/** Deletes the account after the user types a confirmation word. */
export function DeleteAccount() {
  const [state, action, pending] = useActionState(deleteAccount, {
    error: null,
  });
  const [typed, setTyped] = useState("");
  const ready = typed.trim() === CONFIRM_WORD;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="confirm-delete" className="font-bold">
        כדי לאשר, כתבו כאן את המילה &quot;{CONFIRM_WORD}&quot;
      </label>
      <input
        id="confirm-delete"
        name="confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        className={inputStyles}
      />
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <button
        type="submit"
        disabled={!ready || pending}
        className="bg-danger min-h-12 w-full rounded-2xl px-6 py-3 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
      >
        {pending ? "מוחק..." : "למחוק את החשבון לצמיתות"}
      </button>
    </form>
  );
}
