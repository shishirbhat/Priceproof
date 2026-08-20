import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}
