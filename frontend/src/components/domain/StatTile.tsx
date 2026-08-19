import type { ReactNode } from "react";
import { motion } from "motion/react";
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
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-white/[0.06] p-4",
        "bg-gradient-to-b from-white/[0.035] to-transparent bg-card shadow-elevate",
        "transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]",
        tone !== "neutral" && TONE_GLOW[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", TONE_ICON_BG[tone])}>
            {icon}
          </span>
        )}
      </div>
      <span className={cn("text-[2.25rem] leading-none font-semibold tracking-tight", TONE_TEXT[tone])}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {/* subtle top-edge sheen, like light catching a bevel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}
