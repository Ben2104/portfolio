"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

import { navLinks, profile } from "@/data/portfolio";

function scrollToTarget(href: string) {
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);
  });

  const handleNav = (href: string) => {
    setMenuOpen(false);
    scrollToTarget(href);
  };

  return (
    <motion.nav
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(26,26,26,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.12)" : "none",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-7">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 font-syne text-[18px] font-bold uppercase tracking-[0.06em] text-[var(--portfolio-text)]"
        >
          <Image
            src="/profile/favicon.png"
            alt={`${profile.name} logo`}
            width={28}
            height={28}
            className="h-[clamp(1.125rem,2.2vw,1.75rem)] w-[clamp(1.125rem,2.2vw,1.75rem)] shrink-0 rounded-sm object-cover"
            priority
          />
          {profile.name}
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNav(link.href)}
              className="font-rubik text-[11px] font-semibold uppercase tracking-[0.11em] text-white/52 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNav("#contact")}
            className="rounded-full border border-white/30 bg-black/25 px-5 py-2 font-rubik text-[11px] font-semibold uppercase tracking-[0.11em] text-white"
          >
            Contact
          </button>
        </div>

        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-[var(--portfolio-surface)] px-6 pb-6 pt-4 md:hidden"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNav(link.href)}
                className="w-fit font-rubik text-[12px] font-semibold uppercase tracking-[0.11em] text-white/75"
              >
                {link.label}
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </motion.nav>
  );
}
