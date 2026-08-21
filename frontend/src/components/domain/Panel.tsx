import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DUR, EASE_66, EASE_EXPO, REVEAL_VIEWPORT } from "@/lib/motion";

/**
 * The section panel every dashboard surface is built from.
 *
 * One treatment, used everywhere: an indexed mono header, a hairline rule
 * that draws itself in beneath it, and the flat panel plane. Pages compose
 * these rather than hand-rolling card headers, which is what stops the eight
 * dashboard pages from drifting apart again.
 */
export function Panel({
  title,
  index,
  meta,
  href,
  hrefLabel = "View all",
  action,
  children,
  className,
  bodyClassName,
  delay = 0,
}: {
  title: string;
  /** Two-digit ordinal printed in the gutter. */
  index?: string;
  /** Right-aligned mono metadata, e.g. a count. */
  meta?: ReactNode;
  /** Renders a "view all" link in the header. */
  href?: string;
  hrefLabel?: string;
  /** Arbitrary header-right content; takes precedence over `href`. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      className={cn("panel relative rounded-sm", className)}
    >
      <header className="relative flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {index ? <span className="index-numeral">{index}</span> : null}
          <h2 className="label-mono truncate text-label-2">{title}</h2>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {meta ? <span className="label-mono-sm">{meta}</span> : null}
          {action ??
            (href ? (
              <Link to={href} className="group flex items-center gap-1.5">
                <span className="label-mono-sm transition-colors duration-200 group-hover:text-label-1">
                  {hrefLabel}
                </span>
                <ArrowUpRight className="h-3 w-3 text-label-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
              </Link>
            ) : null)}
        </div>

        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: DUR.panel, delay: delay + 0.1, ease: EASE_66 }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--hairline)]"
        />
      </header>

      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
    </motion.section>
  );
}

/**
 * A row inside a Panel. Hairline-separated rather than boxed, with a hover
 * that lifts the plane instead of drawing a border — the same affordance as
 * the marketing site's index rows.
 */
export function PanelRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "rule-t -mx-5 flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-200 first:shadow-none hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </li>
  );
}
