import { useState, useEffect, type ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { DUR, EASE_66 } from "@/lib/motion";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the drawer automatically on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // The top bar gains weight on scroll, same as the marketing nav.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-svh text-foreground lg:flex-row">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <motion.div
          className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md transition-colors duration-300 sm:px-6 lg:px-10"
          style={{
            background: scrolled ? "rgb(8 9 10 / 0.88)" : "transparent",
            boxShadow: scrolled ? "inset 0 -1px 0 0 var(--hairline)" : "none",
          }}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASE_66 }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="label-mono flex items-center gap-2 rounded-lg px-3 py-2 text-label-2 transition-colors hover:text-label-1 lg:hidden"
            style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}
          >
            <Menu className="h-3.5 w-3.5" /> Menu
          </button>

          <Link
            to="/welcome"
            className="group ml-auto flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200"
            style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}
          >
            <span className="label-mono transition-colors duration-200 group-hover:text-label-1">
              The Showroom
            </span>
            <ArrowUpRight className="h-3 w-3 text-label-3 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
          </Link>
        </motion.div>

        <div className="px-4 pt-2 pb-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
