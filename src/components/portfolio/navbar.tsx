"use client";

import { useState } from "react";
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
    setScrolled(latest > 50);
  });

  const handleNav = (href: string) => {
    setMenuOpen(false);
    scrollToTarget(href);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(4, 4, 15, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.04 }}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex cursor-pointer items-center gap-2"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
          >
            <span className="text-[13px] font-extrabold text-white">
              {profile.initials}
            </span>
          </div>
          <span className="text-lg font-bold tracking-[-0.02em] text-slate-50">
            {profile.name}
          </span>
        </motion.button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNav(link.href)}
              className="cursor-pointer text-sm font-medium tracking-[0.01em] text-slate-100/65 transition-colors duration-200 hover:text-cyan-400"
            >
              {link.label}
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => handleNav("#contact")}
            className="rounded-full border px-5 py-2 text-[13px] font-semibold tracking-[0.02em] text-cyan-400"
            style={{
              background: "linear-gradient(135deg, #00d4ff22, #7c3aed22)",
              borderColor: "rgba(0,212,255,0.35)",
            }}
          >
            Get in touch →
          </motion.button>
        </div>

        <button
          type="button"
          className="text-slate-50 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 border-b border-white/6 bg-[rgba(4,4,15,0.95)] px-6 pb-6 pt-2 md:hidden"
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNav(link.href)}
              className="text-left text-[15px] font-medium text-slate-100/75"
            >
              {link.label}
            </button>
          ))}
        </motion.div>
      ) : null}
    </motion.nav>
  );
}

