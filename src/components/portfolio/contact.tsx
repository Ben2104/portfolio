"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Twitter,
  CheckCircle,
  Send,
} from "lucide-react";
import { motion } from "motion/react";

import { profile, socials } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
} as const;

const initialForm: ContactForm = {
  name: "",
  email: "",
  message: "",
};

export function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [sent, setSent] = useState(false);

  const handleChange =
    (field: keyof ContactForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
    );

    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
    setForm(initialForm);
  };

  return (
    <section
      id="contact"
      className="relative bg-[var(--portfolio-bg)] px-6 py-40"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0,212,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading accent="#7c3aed" label="Contact" />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-[72px] m-0 text-[clamp(32px,5vw,68px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-50"
        >
          Let&apos;s build something
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            extraordinary.
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.028] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[30px] lg:col-span-3"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, transparent 50%, rgba(124,58,237,0.04) 100%)",
              }}
            />

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle size={56} className="text-cyan-400" />
                </motion.div>
                <h3 className="mt-6 text-center text-2xl font-bold tracking-[-0.02em] text-slate-50">
                  Email draft opened
                </h3>
                <p className="mt-2 max-w-md text-center text-[15px] text-slate-50/45">
                  Your message was added to a new draft. If nothing opened, use the
                  direct email link on the right.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-50/70"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-50/45">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange("name")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-cyan-400/40 focus:shadow-[0_0_0_3px_rgba(0,212,255,0.08)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-50/45">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-cyan-400/40 focus:shadow-[0_0_0_3px_rgba(0,212,255,0.08)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-50/45">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell me about your project or just say hello..."
                    value={form.message}
                    onChange={handleChange("message")}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-[1.7] text-slate-50 outline-none transition focus:border-cyan-400/40 focus:shadow-[0_0_0_3px_rgba(0,212,255,0.08)]"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(0,212,255,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold tracking-[0.02em] text-white"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
                >
                  <Send size={15} />
                  Open Email Draft
                </motion.button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-6 lg:col-span-2"
          >
            <div className="rounded-[1.25rem] border border-cyan-400/18 bg-cyan-400/5 p-6 backdrop-blur-[20px]">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-400">
                  Open to opportunities
                </span>
              </div>
              <p className="m-0 text-sm leading-[1.7] text-slate-50/55">
                {profile.opportunityBlurb}
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-[1.25rem] border border-white/7 bg-white/[0.025] p-6 backdrop-blur-[20px]">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-slate-50/35">
                Find me online
              </p>

              {socials.map((social) => {
                const Icon = iconMap[social.icon];

                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ x: 4 }}
                    className="group flex items-center justify-between no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                        <Icon size={15} className="text-slate-50/60" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold tracking-[-0.01em] text-slate-50">
                          {social.label}
                        </div>
                        <div className="mt-px text-xs text-slate-50/35">
                          {social.handle}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="shrink-0 text-slate-50/25" />
                  </motion.a>
                );
              })}
            </div>

            <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.025] p-5 text-center">
              <p className="m-0 text-[13px] text-slate-50/35">
                Typical response time:{" "}
                <span className="font-semibold text-cyan-400">
                  {profile.responseTime}
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
