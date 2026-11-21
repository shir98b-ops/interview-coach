"use client";

import { Button, Card } from "@/components/ui";

/** Shown when a page fails to load, instead of the default error screen. */
export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
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
