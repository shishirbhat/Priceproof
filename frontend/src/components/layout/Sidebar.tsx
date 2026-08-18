import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ShieldCheck,
  GitCompare,
  PackageSearch,
  Boxes,
  ShieldAlert,
  Bell,
  Activity,
  Settings2,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutGrid, end: true },
  { to: "/price-integrity", label: "Price Integrity", icon: ShieldCheck },
  { to: "/competitive-landscape", label: "Competitive Landscape", icon: GitCompare },
  { to: "/availability", label: "Availability & Stockouts", icon: PackageSearch },
  { to: "/map-violations", label: "MAP Violations", icon: ShieldAlert },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/scraper-health", label: "Scraper Health", icon: Activity },
  { to: "/catalog", label: "Catalog Management", icon: Settings2 },
];

export function Sidebar() {
  return (
    <aside className="relative flex h-svh w-60 shrink-0 flex-col border-r border-white/[0.06] bg-sidebar/80 text-sidebar-foreground backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground shadow-[0_2px_10px_-2px_oklch(0.93_0_0/0.3)]">
          <Boxes className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            PriceProof
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
            Price Integrity Platform
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
                    className="absolute -left-2.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_8px_1px] shadow-foreground/40"
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] px-4 py-3 text-[11px] text-muted-foreground/70">
        Into the Scrape-Verse · Bright Data
      </div>
    </aside>
  );
}
