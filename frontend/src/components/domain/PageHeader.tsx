import type { ReactNode } from "react";
import { motion } from "motion/react";

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
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start justify-between gap-4"
    >
      <div>
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-widest text-brand"
          >
            {eyebrow}
          </motion.div>
        ) : null}
        <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-tighter text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
