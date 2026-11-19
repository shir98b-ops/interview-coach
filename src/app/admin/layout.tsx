import { AppShell } from "@/components/app-shell";
import { AdminTabs } from "./tabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <AdminTabs />
        {children}
      </div>
    </AppShell>
  );
}
