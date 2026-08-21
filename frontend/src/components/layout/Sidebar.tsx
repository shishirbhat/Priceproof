import { NavLink, Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_SNAP } from "@/lib/motion";
import {
  LayoutGrid,
  Gauge,
  GitCompareArrows,
  Clock,
  Bell,
  Activity,
  Settings2,
  X,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutGrid, end: true },
  { to: "/market-value", label: "Market Value", icon: Gauge },
  { to: "/cross-portal", label: "Cross-Portal Matches", icon: GitCompareArrows },
  { to: "/market-activity", label: "Market Activity", icon: Clock },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/scraper-health", label: "Scraper Health", icon: Activity },
  { to: "/catalog", label: "Catalog Management", icon: Settings2 },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * Dashboard navigation, carrying the same treatment as the front end's
 * floating nav: one shared indicator that slides between items on a spring,
 * a red identity bar on the active row, and the flat near-black surface
 * held by a hairline rather than a border.
 */
export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop — mobile only, closes the drawer on tap. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col bg-[#050506]/95 backdrop-blur-xl",
          "transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          "lg:sticky lg:top-0 lg:w-60 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ boxShadow: "inset -1px 0 0 0 rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-start gap-2.5 px-5 pt-6 pb-7">
          <Link to="/welcome" className="group flex-1 leading-[1.05]">
            <span className="block text-[12px] font-semibold tracking-[0.30em] text-white transition-colors group-hover:text-brand">
              PRICEPROOF
            </span>
            <span className="mt-0.5 block text-[8px] tracking-[0.26em] text-white/40">
              MARKET INTELLIGENCE
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors duration-200",
                  isActive ? "text-white" : "text-white/55 hover:text-white/90",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-white/[0.09]"
                      transition={SPRING_SNAP}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute top-1/2 -left-2.5 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                      style={{ boxShadow: "0 0 10px 1px var(--brand)" }}
                      transition={SPRING_SNAP}
                    />
                  )}
                  <span className="relative flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className="mt-4 px-5 py-4 text-[10px] tracking-wide text-white/30"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.07)" }}
        >
          Into the Scrape-Verse · Bright Data
        </div>
      </aside>
    </>
  );
}
