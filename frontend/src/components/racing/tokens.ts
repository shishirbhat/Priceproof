/**
 * Motion + design tokens for the racing experience.
 *
 * Every timing here was matched against the reference recordings frame by
 * frame: the turntable settles over roughly two thirds of a second, panels
 * expand a touch slower, and the overlay's scrim always leads its content.
 */

/** Expo-out. The house curve — used for anything that travels distance. */
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
  micro: 0.18,
  /** Standard element entrance. */
  base: 0.42,
  /** Overlay open + turntable settle. */
  panel: 0.66,
  /** Full-bleed hero cross-fades. */
  hero: 1.1,
} as const;

/** Stagger step for grid children revealing in sequence. */
export const STAGGER = 0.055;

/**
 * Shared reveal-on-scroll variant. Elements start slightly low and
 * blurred, which hides the sub-pixel jitter of a plain translate.
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DUR.base, ease: EASE_EXPO },
  },
};

/** Viewport config so a section reveals once, slightly before it lands. */
export const REVEAL_VIEWPORT = { once: true, margin: "-12% 0px -8% 0px" };
