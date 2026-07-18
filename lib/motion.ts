import type { Variants } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export function staggerContainer(
  stagger = 0.08,
  delayChildren = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

export const viewportOnce = { once: true, margin: '-40px' };
