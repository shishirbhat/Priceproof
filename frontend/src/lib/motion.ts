/**
 * Motion tokens — the single source of motion for the whole product.
 *
 * The marketing site, the racing experience and the intelligence dashboard
 * all import from here, so a curve tweaked in one place changes everywhere.
 *
 * The vocabulary is the references' vocabulary: haoqi's slow-start curve for
 * anything that travels, an expo-out for UI that has to feel instant, and
 * upvent's staged reveals for scroll. Durations are deliberately few — four
 * steps, so nothing lands on an arbitrary number.
 */

/**
 * The house curve. haoqi's `cubic-bezier(.66,0,.01,1)`: almost nothing
 * happens for the first two thirds, then everything does, then it lands flat
 * without a bounce. Use it for anything that covers distance — panels
 * opening, indicators sliding, the turntable settling.
 */
export const EASE_66 = [0.66, 0, 0.01, 1] as const;

/** Expo-out. For UI that must feel like it responds instantly to a click. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** A softer quint-out for opacity-only fades, which read harsh on expo. */
export const EASE_FADE = [0.25, 0.8, 0.35, 1] as const;

/** Panels and cards that scale into place. */
export const SPRING_PANEL = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/** The lighter spring behind hover lifts and pill indicators. */
export const SPRING_SNAP = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.6,
};

export const DUR = {
  /** Hover / press feedback. */
  micro: 0.2,
  /** Standard element entrance. */
  base: 0.42,
  /** Overlay open, panel expand, turntable settle — the .66 signature. */
  panel: 0.66,
  /** Full-bleed hero cross-fades and display-type reveals. */
  hero: 1.2,
} as const;

/** Stagger step for grid children revealing in sequence. */
export const STAGGER = 0.055;

/** Slower stagger for the marketing site's larger, fewer elements. */
export const STAGGER_WIDE = 0.09;

/**
 * Shared reveal-on-scroll variant.
 *
 * Opacity and transform only, deliberately. These earlier animated
 * `filter: blur()` as well, which looks lovely on one element and is a
 * disaster on forty — an animated blur can't be composited, so every frame
 * re-rasterises the element at full size. Dozens of scroll-triggered blurs
 * is what made scrolling feel heavy.
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE_EXPO },
  },
};

/**
 * The marketing-side reveal: a longer throw on the house curve, for display
 * type and full-width bands rather than dashboard rows.
 */
export const revealDisplayVariants = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.panel, ease: EASE_66 },
  },
};

/**
 * A hairline rule drawing itself in from the left. The section-divider
 * motif shared by every one of the references.
 */
export const ruleVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: DUR.panel, ease: EASE_66 },
  },
};

/** Viewport config so a section reveals once, slightly before it lands. */
export const REVEAL_VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" };
