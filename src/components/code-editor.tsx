"use client";

import type { KeyboardEvent } from "react";
import { codeLanguages, type CodeLanguage } from "@/lib/code/languages";

const INDENT = "    ";

/**
 * A plain code box: left to right, monospaced, and the Tab key indents
 * instead of leaving the box. Escape, then Tab, moves on as usual.
 */
export function CodeEditor({
  id,
  name,
  rows = 16,
  maxLength,
  placeholder,
  required,
  defaultValue,
}: {
  id: string;
  name: string;
  rows?: number;
  maxLength: number;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const box = event.currentTarget;
    if (event.key === "Escape") {
      box.dataset.tabOut = "1";
      return;
    }
    if (event.key !== "Tab" || box.dataset.tabOut === "1") {
      delete box.dataset.tabOut;
      return;
    }
    event.preventDefault();
    const { selectionStart: start, selectionEnd: end, value } = box;
    if (event.shiftKey) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const remove = value
        .slice(lineStart, lineStart + INDENT.length)
        .match(/^ */)![0].length;
      box.setRangeText("", lineStart, lineStart + remove, "preserve");
      box.selectionStart = box.selectionEnd = Math.max(
        lineStart,
        start - remove,
      );
    } else {
      box.setRangeText(INDENT, start, end, "end");
    }
  }

  return (
    <textarea
      id={id}
      name={name}
      dir="ltr"
      rows={rows}
      maxLength={maxLength}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      onKeyDown={onKeyDown}
      className="border-line bg-ink focus:border-violet w-full rounded-2xl border-2 px-4 py-3 text-left font-mono text-sm leading-relaxed text-white placeholder:text-white/50 focus:outline-none"
    />
  );
}

/** Choose the programming language of the answer. */
export function CodeLanguageSelect({
  name = "codeLanguage",
  defaultValue,
  disabled,
  label = "שפת תכנות",
}: {
  name?: string;
  defaultValue: CodeLanguage;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <label className="flex flex-col gap-1 font-bold sm:w-60">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="border-line focus:border-violet w-full rounded-2xl border-2 bg-white px-4 py-3 text-base focus:outline-none"
      >
        {(Object.keys(codeLanguages) as CodeLanguage[]).map((key) => (
          <option key={key} value={key}>
            {codeLanguages[key]}
          </option>
        ))}
      </select>
    </label>
  );
}
