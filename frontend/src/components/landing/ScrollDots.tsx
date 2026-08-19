import { useEffect, useState } from "react";
import { motion } from "motion/react";

const SECTIONS = ["hero", "showcase", "proof", "stats", "features", "how", "cta"];

export function ScrollDots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = SECTIONS.indexOf(entry.target.id);
            if (idx !== -1) setActive(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {SECTIONS.map((id, i) => (
        <a key={id} href={`#${id}`} aria-label={id} className="group flex items-center justify-end py-1">
          <motion.span
            animate={{
              width: active === i ? 22 : 6,
              backgroundColor: active === i ? "var(--brand)" : "rgba(255,255,255,0.25)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-[3px] rounded-full"
          />
        </a>
      ))}
    </div>
  );
}
