import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";

export function PageHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.panel, ease: EASE_EXPO }}
      className="flex items-start justify-between gap-4"
    >
      <div>
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-brand"
          >
            {eyebrow}
          </motion.div>
        ) : null}
        <h1 className="text-[2.4rem] font-light leading-[1.06] tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[13px] leading-[1.6] text-white/50">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
