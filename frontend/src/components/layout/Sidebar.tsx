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

/**
 * The nav is an index, not a menu — each row carries its ordinal in the
 * gutter, the way haoqi numbers its project list and Porsche numbers its
 * data plates. That ordinal is also the only place acid appears in the
 * dashboard chrome.
 */
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
          "fixed inset-y-0 left-0 z-50 flex h-svh w-[17rem] shrink-0 flex-col bg-surface-0/95",
          "transition-transform duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)]",
          "lg:sticky lg:top-0 lg:w-64 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ boxShadow: "inset -1px 0 0 0 var(--hairline)" }}
      >
        {/* Identity plate. The acid rule under the wordmark is the app's
            one unmissable brand moment in the dashboard. */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-start gap-2">
            <Link to="/welcome" className="group flex-1">
              <span className="block text-[15px] font-semibold tracking-[0.14em] text-label-1 transition-colors duration-200 group-hover:text-hot">
                PRICEPROOF
              </span>
              <span className="label-mono-sm mt-1.5 block">
                Market Intelligence
              </span>
              <span className="mt-3 block h-[2px] w-full origin-left scale-x-[0.18] rounded-full bg-hot transition-transform duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:scale-x-100" />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-lg p-1.5 text-label-3 transition-colors hover:bg-surface-2 hover:text-label-1 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {NAV.map(({ to, label, icon: Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-xl py-3 pr-3 pl-3.5 transition-colors duration-200",
                  isActive ? "text-label-1" : "text-label-2 hover:text-label-1",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-[var(--hairline-strong)]"
                      transition={SPRING_SNAP}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-hot"
                      style={{ boxShadow: "0 0 14px 1px var(--hot-glow)" }}
                      transition={SPRING_SNAP}
                    />
                  )}
                  <span
                    className={cn(
                      "relative font-mono text-[9.5px] tracking-[0.18em] tabular-nums transition-colors duration-200",
                      isActive ? "text-brand" : "text-label-4",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative flex min-w-0 items-center gap-2.5">
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    <span className="truncate text-[13.5px] font-medium tracking-[-0.01em]">{label}</span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rule-t px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="soft-blink h-1 w-1 rounded-full bg-severity-genuine" />
            <span className="label-mono-sm">Live · Bright Data</span>
          </div>
          <p className="mt-2 font-mono text-[9px] leading-relaxed tracking-[0.1em] text-label-4">
            INTO THE SCRAPE-VERSE
          </p>
        </div>
      </aside>
    </>
  );
}
