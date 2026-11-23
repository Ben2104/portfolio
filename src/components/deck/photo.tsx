"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

/** A faded cut-out that drifts a little against the page as it scrolls past. */
export function Photo({
  src,
  alt,
  className,
  sizes,
  drift = 36,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
  drift?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  return (
    <motion.div ref={ref} className={"ph " + className} style={{ y: reduceMotion ? 0 : y }}>
      <Image src={src} alt={alt} fill sizes={sizes} />
    </motion.div>
  );
}
