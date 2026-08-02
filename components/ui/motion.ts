"use client";

import { useReducedMotion } from "framer-motion";

export const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export function useMotionSafe() {
  return !useReducedMotion();
}
