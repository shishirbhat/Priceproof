import { useState, useEffect, type ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { DUR, EASE_EXPO } from "@/lib/motion";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the drawer automatically on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // The top bar gains weight on scroll, same as the front end's nav.
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
          className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-xl transition-colors duration-300 sm:px-6 lg:px-10"
          style={{
            background: scrolled ? "rgba(5,5,6,0.86)" : "transparent",
            boxShadow: scrolled ? "inset 0 -1px 0 0 rgba(255,255,255,0.07)" : "none",
          }}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-white/75 backdrop-blur-xl transition-colors hover:text-white lg:hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
          >
            <Menu className="h-3.5 w-3.5" /> Menu
          </button>

          <Link
            to="/welcome"
            className="group ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] text-white/65 backdrop-blur-xl transition-colors duration-200 hover:text-white"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
          >
            The showroom
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        <div className="px-4 pt-2 pb-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
