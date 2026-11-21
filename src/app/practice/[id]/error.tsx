"use client";

import { Button, Card } from "@/components/ui";

/**
 * Shown if a practice fails to load. The question screen has no app frame,
 * so this one brings its own margins.
 */
export default function PracticeError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-[18px] py-6 sm:px-6 lg:py-10">
      <Card tone="blue" className="items-start gap-4 p-8">
        <h1 className="text-3xl font-extrabold">משהו השתבש</h1>
        <p className="text-muted text-lg">
          לא הצלחנו לטעון את העמוד. אפשר לנסות שוב בעוד רגע.
        </p>
        <Button type="button" onClick={reset}>
          לנסות שוב
        </Button>
      </Card>
    </main>
  );
}
