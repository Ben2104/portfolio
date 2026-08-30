"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  Mail,
  Menu,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

import { navLinks } from "@/data/portfolio";

const navIcons: Record<(typeof navLinks)[number]["label"], LucideIcon> = {
  About: UserRound,
  Projects: FolderKanban,
  Skills: Code2,
  Experience: BriefcaseBusiness,
};

const contactLink = { label: "Contact", href: "#contact", icon: Mail } as const;

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
  const shouldReduceMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);
  });

  const handleNav = (href: string) => {
    setMenuOpen(false);
    scrollToTarget(href);
  };

  const navigationItems = [
    ...navLinks.map((link) => ({ ...link, icon: navIcons[link.label] })),
    contactLink,
  ];

  const entrance = shouldReduceMotion
    ? { opacity: 1 }
    : { y: 0, opacity: 1 };

  return (
    <motion.nav
      aria-label="Primary navigation"
      initial={shouldReduceMotion ? false : { y: -20, opacity: 0 }}
      animate={entrance}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-x-0 top-5 z-50 md:top-6"
    >
      <div
        className={`pointer-events-auto mx-auto hidden w-fit items-start gap-[3px] rounded-[13px] border p-1 shadow-[0_18px_45px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[10px] transition-[background-color,border-color,box-shadow] duration-300 md:flex ${
          scrolled
            ? "border-white/[0.13] bg-[#0b0b0b]/94 shadow-[0_20px_48px_rgba(0,0,0,0.54),inset_0_1px_0_rgba(255,255,255,0.055)]"
            : "border-white/[0.10] bg-[#0b0b0b]/88"
        }`}
      >
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          whileHover={shouldReduceMotion ? undefined : { height: 39 }}
          whileFocus={shouldReduceMotion ? undefined : { height: 39 }}
          transition={{ type: "spring", stiffness: 460, damping: 32, mass: 0.42 }}
          className="flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-white/[0.10] bg-white/[0.065] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-colors hover:border-white/[0.18] hover:bg-white/[0.10] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b] motion-reduce:transition-none"
        >
          <Image
            src="/profile/favicon.png"
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-[5px] object-cover"
            priority
          />
        </motion.button>

        {navigationItems.map((link) => {
          const Icon = link.icon;

          return (
            <motion.button
              key={link.label}
              type="button"
              onClick={() => handleNav(link.href)}
              initial={false}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { height: 39, paddingLeft: 12, paddingRight: 12 }
              }
              whileFocus={
                shouldReduceMotion
                  ? undefined
                  : { height: 39, paddingLeft: 12, paddingRight: 12 }
              }
              transition={{
                type: "spring",
                stiffness: 460,
                damping: 32,
                mass: 0.42,
              }}
              className="group flex h-[34px] shrink-0 items-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.055] px-[9px] font-satoshi text-[9.5px] font-medium uppercase tracking-[0.15em] text-[#aaa49c] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-white/[0.17] hover:bg-white/[0.095] hover:text-[#f2eee8] hover:shadow-[0_8px_18px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.055)] focus-visible:border-white/[0.22] focus-visible:bg-white/[0.10] focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b] motion-reduce:transition-colors"
            >
              <Icon
                aria-hidden="true"
                className="size-[13px] shrink-0 stroke-[1.7]"
              />
              <span>{link.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div
        className={`pointer-events-auto mx-4 flex h-[52px] items-center justify-between rounded-[13px] border p-[3px] shadow-[0_16px_38px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[10px] transition-colors duration-300 md:hidden ${
          scrolled
            ? "border-white/[0.14] bg-[#0b0b0b]/95"
            : "border-white/[0.11] bg-[#0b0b0b]/90"
        }`}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="flex size-11 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.055] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
        >
          <Image
            src="/profile/favicon.png"
            alt=""
            width={26}
            height={26}
            className="size-[26px] rounded-[5px] object-cover"
            priority
          />
        </button>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.055] text-[#d8d3cc] transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {menuOpen ? (
            <X aria-hidden="true" size={20} />
          ) : (
            <Menu aria-hidden="true" size={20} />
          )}
        </button>
      </div>

      {menuOpen ? (
        <motion.div
          id="mobile-navigation-menu"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="pointer-events-auto absolute inset-x-4 top-[60px] overflow-hidden rounded-[13px] border border-white/[0.12] bg-[#0b0b0b]/96 p-1 shadow-[0_22px_50px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[12px] md:hidden"
        >
          <div className="flex flex-col gap-[3px]">
            {navigationItems.map((link) => {
              const Icon = link.icon;

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNav(link.href)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-[9px] border border-transparent bg-white/[0.045] px-4 text-left font-satoshi text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[#c7c1b9] transition-colors active:border-white/[0.16] active:bg-white/[0.10] active:text-white focus-visible:border-white/[0.20] focus-visible:bg-white/[0.09] focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/60"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-[15px] shrink-0 stroke-[1.7]"
                  />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </motion.nav>
  );
}
