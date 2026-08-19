import { motion } from "motion/react";

export function StatBlock({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="font-sans text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-tighter text-foreground">
        {value}
      </div>
      <div className="mt-3 max-w-[16ch] text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}
