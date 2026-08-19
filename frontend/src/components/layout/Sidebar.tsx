import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Gauge,
  GitCompareArrows,
  Clock,
  Car,
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

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* backdrop — mobile only, closes the drawer on tap */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col border-r border-white/[0.06] bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:w-60 lg:translate-x-0 lg:bg-sidebar/80",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2.5 px-4 py-5">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 text-brand-foreground shadow-[0_2px_14px_-2px] shadow-brand/50"
          >
            <Car className="h-4 w-4" />
          </motion.div>
          <div className="flex-1">
            <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              PriceProof
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
              Market Intelligence Platform
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-white/[0.06] lg:hidden"
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
                  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-sidebar-accent-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute inset-0 rounded-lg bg-white/[0.06] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute -left-2.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_8px_1px] shadow-brand/60"
                    />
                  )}
                  <motion.span whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="relative flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </motion.span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-3 text-[11px] text-muted-foreground/70">
          Into the Scrape-Verse · Bright Data
        </div>
      </aside>
    </>
  );
}
