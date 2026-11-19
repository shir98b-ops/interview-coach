/**
 * Text that may hold code. Fenced code blocks (```) are shown left to right in
 * a code box; every other line picks its own direction, so a Hebrew sentence
 * and an English example on the next line both read correctly.
 */
export function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/```[^\n]*\n?/);
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <CodeBlock key={i} code={part} />
        ) : (
          part
            .split("\n")
            .map((line) => line.trimEnd())
            .filter(Boolean)
            .map((line, j) => (
              <p key={`${i}-${j}`} dir="auto">
                {line}
              </p>
            ))
        ),
      )}
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      dir="ltr"
      className="bg-ink overflow-x-auto rounded-2xl p-4 text-left font-mono text-sm leading-relaxed text-white"
    >
      <code>{code.replace(/\n+$/, "")}</code>
    </pre>
  );
}
