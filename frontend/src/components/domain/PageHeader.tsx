import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_66 } from "@/lib/motion";

/**
 * Every dashboard page opens the same way: a mono eyebrow with its section
 * index, a low-weight display title, and a hairline rule that draws itself
 * in underneath. It's the marketing site's section header at dashboard
 * scale, which is what makes the two halves read as one product.
 */
export function PageHeader({
  title,
  eyebrow,
  index,
  description,
  action,
}: {
  title: string;
  eyebrow?: string;
  /** Two-digit section ordinal shown in the gutter, e.g. "01". */
  index?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.panel, ease: EASE_66 }}
      className="relative pb-7"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {eyebrow ? (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: DUR.base }}
              className="mb-4 flex items-center gap-3"
            >
              {index ? <span className="index-numeral">{index}</span> : null}
              <span className="label-mono text-hot-gradient hot-glow-sm font-semibold">
                {eyebrow}
              </span>
            </motion.div>
          ) : null}
          <h1 className="display-2 text-foreground">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-[14px] leading-[1.7] text-label-2">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {/* The rule draws in from the left on the house curve. */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: DUR.panel, delay: 0.12, ease: EASE_66 }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--hairline)]"
      />
    </motion.div>
  );
}
