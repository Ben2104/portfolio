"use client";

import { motion } from "motion/react";

import { profile } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[var(--portfolio-bg)] px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
          >
            <span className="text-[9px] font-extrabold text-white">
              {profile.initials}
            </span>
          </div>
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-slate-50/40">
            {profile.name}
          </span>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="m-0 text-xs text-slate-50/25"
        >
          © 2026 · Designed & built with care
        </motion.p>

        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
          <span className="text-xs text-slate-50/25">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}

