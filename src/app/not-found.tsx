import { Logo } from "@/components/app-shell";
import { ButtonLink, Card } from "@/components/ui";

/** Shown for pages that don't exist, or an interview that isn't yours. */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Logo />
      <Card tone="blue" className="items-start gap-4 p-8">
        <h1 className="text-3xl font-extrabold">העמוד לא נמצא</h1>
        <p className="text-muted text-lg">
          העמוד הזה לא קיים, או שהוא שייך לחשבון אחר.
        </p>
        <ButtonLink href="/dashboard">חזרה לדף הבית</ButtonLink>
      </Card>
    </main>
  );
}
