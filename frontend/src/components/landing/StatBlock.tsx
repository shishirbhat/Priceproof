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
      transition={{ duration: 0.66, delay, ease: [0.66, 0, 0.01, 1] }}
    >
      <div className="font-sans text-[clamp(3.5rem,8svw,6.5rem)] leading-[0.9] font-light tracking-[-0.05em] text-label-1 tabular-nums">
        {value}
      </div>
      <div className="label-mono mt-4 max-w-[22ch] leading-[1.7]">{label}</div>
    </motion.div>
  );
}
