"use client";

import { profile } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="relative bg-(--portfolio-surface) px-6 pb-12 pt-20">
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="font-clash m-0 text-center text-[24px] font-bold text-(--portfolio-accent)">
          Get in Touch With Me
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="font-clash mt-4 block text-center text-[clamp(34px,6vw,64px)] font-bold leading-[1.08] text-(--portfolio-text) underline decoration-2 underline-offset-[6px]"
        >
          {profile.email}
        </a>

        <div className="mt-14 grid grid-cols-1 gap-8 border-b border-white/20 pb-8 md:grid-cols-3 md:items-end">
          <div>
            <p className="font-clash m-0 text-[40px] font-bold uppercase tracking-[0.02em] text-white">
              {profile.name}
            </p>
          </div>

          <div>
            <p className="font-satoshi m-0 text-[15px] leading-[1.6] text-white/80">
              {profile.opportunityBlurb}
            </p>
          </div>

          <div className="md:text-right">
            <p className="font-satoshi m-0 text-[14px] text-white/72">
              Typical response time
            </p>
            <p className="font-clash mt-1 text-[24px] font-bold text-white">
              {profile.responseTime}
            </p>
          </div>
        </div>

        <p className="font-satoshi mb-0 mt-8 text-center text-[13px] text-white/70">
          © 2026. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
