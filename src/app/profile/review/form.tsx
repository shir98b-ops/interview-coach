"use client";

import { useActionState } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { rateResume, type ReviewState } from "./actions";

/** Pick a role (or none) and rate the saved resume. */
export function RateResumeForm({
  roles,
  rated,
}: {
  roles: { id: string; title: string }[];
  rated: boolean;
}) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    rateResume,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-bold">לאיזה תפקיד לדרג?</span>
        <select
          name="roleId"
          defaultValue={roles[0]?.id ?? ""}
          disabled={pending}
          className={inputStyles}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.title}
            </option>
          ))}
          <option value="">דירוג כללי, בלי תפקיד מסוים</option>
        </select>
      </label>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="lime"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending
          ? "קורא את קורות החיים שלך..."
          : rated
            ? "לדרג שוב"
            : "לדרג את קורות החיים"}
      </Button>
    </form>
  );
}
