"use client";

import { useId, useState, type ChangeEvent } from "react";

/**
 * A file picker with Hebrew text. The browser's own picker shows its labels
 * ("Choose File") in the language of the browser, not of the page.
 */
export function FileField({
  name,
  accept,
  required,
  disabled,
  label,
  onFile,
}: {
  name?: string;
  accept: string;
  required?: boolean;
  disabled?: boolean;
  label: string;
  onFile?: (file: File | undefined) => void;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string | null>(null);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? null);
    onFile?.(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold">{label}</span>
      <div className="border-line has-[:focus-visible]:border-blue flex flex-wrap items-center gap-3 rounded-2xl border-2 bg-white px-3 py-2">
        <input
          id={id}
          type="file"
          name={name}
          accept={accept}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className="bg-sky-soft text-blue-dark inline-flex min-h-11 cursor-pointer items-center rounded-xl px-4 font-bold peer-disabled:opacity-60"
        >
          בחירת קובץ
        </label>
        <span dir="auto" className="text-muted min-w-0 flex-1 truncate">
          {fileName ?? "לא נבחר קובץ"}
        </span>
      </div>
    </div>
  );
}
