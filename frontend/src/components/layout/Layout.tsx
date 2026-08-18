import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-6">{children}</main>
    </div>
  );
}
