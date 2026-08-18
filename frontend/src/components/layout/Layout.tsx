import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // close the drawer automatically on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-svh text-foreground lg:flex-row">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" /> Menu
        </button>
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
