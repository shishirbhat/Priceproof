import { NavLink } from "react-router-dom";
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
    <aside className="flex h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Boxes className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            PriceProof
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Price Integrity Platform
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-muted-foreground">
        Into the Scrape-Verse · Bright Data
      </div>
    </aside>
  );
}
