"use client";

import { Button, Card } from "@/components/ui";

/** Shown if a signed-in page fails to load, for example when sign-in is down. */
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <Card className="items-start gap-4 p-8">
      <h1 className="text-3xl font-extrabold">משהו השתבש</h1>
      <p className="text-muted text-lg">
        לא הצלחנו לטעון את העמוד. אפשר לנסות שוב בעוד רגע.
      </p>
      <Button type="button" onClick={reset}>
        לנסות שוב
      </Button>
    </Card>
  );
}
