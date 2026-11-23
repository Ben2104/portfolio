"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** One switch for reduced motion: motion drops transform animations when the OS asks for it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
