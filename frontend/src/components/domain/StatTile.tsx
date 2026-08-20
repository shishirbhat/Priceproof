import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "violation" | "genuine" | "drift";
  hint?: string;
  className?: string;
  delay?: number;
}

const TONE_TEXT: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "text-foreground",
  violation: "text-severity-violation",
  genuine: "text-severity-genuine",
  drift: "text-severity-drift",
};

const TONE_GLOW: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "",
  violation: "shadow-[0_0_0_1px_oklch(0.62_0.21_25/0.15),0_8px_24px_-12px_oklch(0.62_0.21_25/0.35)]",
  genuine: "shadow-[0_0_0_1px_oklch(0.7_0.19_150/0.15),0_8px_24px_-12px_oklch(0.7_0.19_150/0.3)]",
  drift: "shadow-[0_0_0_1px_oklch(0.78_0.15_80/0.15),0_8px_24px_-12px_oklch(0.78_0.15_80/0.3)]",
};

const TONE_ICON_BG: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "bg-white/[0.05] text-muted-foreground",
  violation: "bg-severity-violation/10 text-severity-violation",
  genuine: "bg-severity-genuine/10 text-severity-genuine",
  drift: "bg-severity-drift/10 text-severity-drift",
};

export function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
  className,
  delay = 0,
}: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      className={cn(
        "group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-[#0b0b0d] p-4",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]",
        "transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-0.5 hover:bg-[#101013] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
        tone !== "neutral" && TONE_GLOW[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.20em] text-white/45">
          {label}
        </span>
        {icon && (
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", TONE_ICON_BG[tone])}>
            {icon}
          </span>
        )}
      </div>
      <span className={cn("text-[2.1rem] leading-none font-light tracking-tight", TONE_TEXT[tone])}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </span>
      {hint ? <span className="text-[11px] text-white/45">{hint}</span> : null}
      {/* Accent bar wipes the top edge on hover — the same affordance the
          front end's series cards use. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px w-0 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full",
          tone === "neutral" ? "bg-brand" : "bg-current opacity-60",
        )}
      />
    </motion.div>
  );
}
